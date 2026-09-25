import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Video,
  DollarSign,
  FolderKanban,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { CalendarEvent, EventType } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';

const EVENT_CONFIG: Record<EventType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  meeting: { label: 'Reunião com Cliente', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Video },
  deadline: { label: 'Prazo de Entrega', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: FolderKanban },
  project_deadline: { label: 'Prazo de Entrega', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: FolderKanban },
  delivery: { label: 'Entrega de Projeto', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: FolderKanban },
  payment_due: { label: 'Vencimento de Parcela', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: DollarSign },
  follow_up: { label: 'Follow-up / Contato', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Video },
  task: { label: 'Tarefa Agendada', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckSquare },
};

export const CalendarView: React.FC = () => {
  const { data, addCalendarEvent, deleteCalendarEvent } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EventType>('meeting');
  const [newDate, setNewDate] = useState(selectedDateStr);
  const [newTime, setNewTime] = useState('14:00');
  const [newClientId, setNewClientId] = useState('');
  const [newMeetingLink, setNewMeetingLink] = useState('');

  // Auto-aggregate events from:
  // 1. data.events
  // 2. data.projects (delivery deadlines)
  // 3. data.installments (payment due dates)
  // 4. data.tasks (task due dates)
  const allEvents = useMemo(() => {
    const list: {
      id: string;
      title: string;
      type: EventType;
      date: string;
      time?: string;
      source: 'event' | 'project' | 'installment' | 'task';
    }[] = [];

    // Explicit events
    data.events.forEach((ev) => {
      list.push({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        date: ev.date,
        time: ev.time,
        source: 'event',
      });
    });

    // Project delivery deadlines
    data.projects.forEach((p) => {
      if (p.deliveryDeadline && p.status !== 'completed' && p.status !== 'cancelled') {
        const client = data.clients.find((c) => c.id === p.clientId);
        list.push({
          id: `proj-${p.id}`,
          title: `Entrega: ${p.name} (${client?.companyName || ''})`,
          type: 'deadline',
          date: p.deliveryDeadline,
          source: 'project',
        });
      }
    });

    // Installments
    data.installments.forEach((inst) => {
      if (inst.status !== 'paid') {
        const pay = data.payments.find((p) => p.id === inst.paymentId);
        list.push({
          id: `inst-${inst.id}`,
          title: `Vencimento Parcela ${inst.number}: ${pay?.title || 'Cobrança'} (R$ ${inst.amount})`,
          type: 'payment_due',
          date: inst.dueDate,
          source: 'installment',
        });
      }
    });

    // Tasks
    data.tasks.forEach((t) => {
      if (t.dueDate && !t.completed) {
        list.push({
          id: `task-${t.id}`,
          title: `Tarefa: ${t.title}`,
          type: 'task',
          date: t.dueDate,
          source: 'task',
        });
      }
    });

    return list;
  }, [data.events, data.projects, data.installments, data.tasks, data.clients, data.payments]);

  // Calendar month days calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Selected date events
  const selectedDayEvents = allEvents.filter((ev) => ev.date === selectedDateStr);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addCalendarEvent({
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      clientId: newClientId || undefined,
      meetingLink: newMeetingLink.trim() || undefined,
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewMeetingLink('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Calendário & Agenda do Freelancer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize reuniões, prazos finais de sites, tarefas e vencimento de parcelas.
          </p>
        </div>

        <button
          onClick={() => {
            setNewDate(selectedDateStr);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Agendar Reunião / Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Grid */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {monthNames[month]} de {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 rounded-xl bg-slate-50/50" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const dayEvents = allEvents.filter((e) => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/20'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span
                    className={`text-xs font-bold self-start w-6 h-6 flex items-center justify-center rounded-full ${
                      isSelected ? 'bg-indigo-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Day Events Pills */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = EVENT_CONFIG[ev.type];
                      return (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-bold truncate px-1 py-0.5 rounded border ${cfg.color}`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block text-right">
                        +{dayEvents.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Events */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                Agenda do Dia
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {formatDate(selectedDateStr)}
              </h3>
            </div>

            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <p className="text-xs font-semibold text-slate-600">Nenhum compromisso agendado</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clique em &quot;Agendar Reunião / Evento&quot; para registrar uma entrega ou reunião.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  const cfg = EVENT_CONFIG[ev.type];
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                        {ev.source === 'event' && (
                          <button
                            onClick={() => deleteCalendarEvent(ev.id)}
                            className="text-slate-300 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="font-bold text-slate-900 text-xs">{ev.title}</p>

                      {ev.time && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Horário: {ev.time}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal to add event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Agendar Reunião ou Evento</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Reunião de Alinhamento de Briefing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
                  >
                    <option value="meeting">Reunião com Cliente</option>
                    <option value="deadline">Prazo de Entrega</option>
                    <option value="payment_due">Vencimento de Parcela</option>
                    <option value="task">Tarefa Agendada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cliente Vinculado</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
                >
                  <option value="">Nenhum cliente</option>
                  {data.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link da Reunião (Google Meet / Zoom)</label>
                <input
                  type="text"
                  value={newMeetingLink}
                  onChange={(e) => setNewMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
