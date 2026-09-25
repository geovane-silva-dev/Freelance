import React, { useState, useMemo } from 'react';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Calendar,
  Building2,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatDuration, formatCurrency, formatDate } from '../utils/formatters.ts';

export const TimeTrackingView: React.FC = () => {
  const {
    data,
    timerState,
    startTimer,
    pauseTimer,
    stopAndSaveTimer,
    addManualTimeLog,
    deleteTimeLog,
  } = useApp();

  // Manual log form
  const [selectedClientId, setSelectedClientId] = useState(data.clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || '');
  const [manualDurationMinutes, setManualDurationMinutes] = useState(60);
  const [manualActivity, setManualActivity] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  // Active timer selector state
  const [activeTimerClient, setActiveTimerClient] = useState(data.clients[0]?.id || '');
  const [activeTimerProject, setActiveTimerProject] = useState(data.projects[0]?.id || '');
  const [activeTimerActivity, setActiveTimerActivity] = useState('');

  // Format timer into HH:MM:SS
  const formatTimerDigits = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Hours metrics for day, week, month
  const metrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Day
    const dayMinutes = data.timeLogs
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    // Month
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthMinutes = data.timeLogs
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    // Total
    const totalMinutes = data.timeLogs.reduce((sum, t) => sum + t.durationMinutes, 0);

    return {
      dayHours: (dayMinutes / 60).toFixed(1),
      monthHours: (monthMinutes / 60).toFixed(1),
      totalHours: (totalMinutes / 60).toFixed(1),
    };
  }, [data.timeLogs]);

  const handleStartTimer = () => {
    startTimer(activeTimerClient, activeTimerProject, activeTimerActivity || 'Desenvolvimento Web');
  };

  const handleAddManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDurationMinutes <= 0) return;

    await addManualTimeLog({
      clientId: selectedClientId,
      projectId: selectedProjectId,
      durationMinutes: manualDurationMinutes,
      activity: manualActivity.trim() || 'Trabalho manual no projeto',
      date: manualDate,
    });

    setManualActivity('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Controle de Tempo (Time Tracking)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitore com precisão cada hora gasta no desenvolvimento para calcular seu ganho real.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Horas Hoje</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.dayHours}h</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Produtividade diária</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Horas Este Mês</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{metrics.monthHours}h</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Acumulado do mês atual</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Registrado</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.totalHours}h</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Em todos os projetos</span>
        </div>
      </div>

      {/* Main Stopwatch Widget */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5" />
            {timerState.isRunning ? 'Cronômetro em Execução' : 'Cronômetro Parado / Pausado'}
          </div>

          {/* Big Digits Display */}
          <div className="text-5xl sm:text-7xl font-mono font-black tracking-wider text-white select-none">
            {formatTimerDigits(timerState.elapsedSeconds)}
          </div>

          {/* Controls */}
          {!timerState.isRunning && timerState.elapsedSeconds === 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cliente
                  </label>
                  <select
                    value={activeTimerClient}
                    onChange={(e) => setActiveTimerClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    {data.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Projeto
                  </label>
                  <select
                    value={activeTimerProject}
                    onChange={(e) => setActiveTimerProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Atividade
                  </label>
                  <input
                    type="text"
                    value={activeTimerActivity}
                    onChange={(e) => setActiveTimerActivity(e.target.value)}
                    placeholder="Ex: Layout no Figma..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleStartTimer}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                Iniciar Contagem
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-indigo-200">
                Atividade: <strong>{timerState.activity}</strong>
              </p>

              <div className="flex items-center justify-center gap-3">
                {timerState.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      startTimer(timerState.clientId, timerState.projectId, timerState.activity)
                    }
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Continuar
                  </button>
                )}

                <button
                  onClick={stopAndSaveTimer}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Finalizar & Salvar Horas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Log & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Log Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Lançamento Manual de Horas
          </h3>

          <form onSubmit={handleAddManualLog} className="space-y-3 mt-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Projeto</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={manualDurationMinutes}
                  onChange={(e) => setManualDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atividade Realizada</label>
              <input
                type="text"
                value={manualActivity}
                onChange={(e) => setManualActivity(e.target.value)}
                placeholder="Ex: Ajuste de layout responsivo..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs mt-2 shadow-xs"
            >
              Registrar Horas
            </button>
          </form>
        </div>

        {/* History of Time Logs */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Histórico Recente de Horas Trabalhadas
              </h3>
              <span className="text-xs text-slate-400">
                {data.timeLogs.length} registro(s) no total
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {data.timeLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  Nenhum registro de horas no histórico.
                </p>
              ) : (
                data.timeLogs.map((log) => {
                  const client = data.clients.find((c) => c.id === log.clientId);
                  const project = data.projects.find((p) => p.id === log.projectId);

                  return (
                    <div
                      key={log.id}
                      className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors px-2 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{log.activity}</p>
                        <p className="text-[11px] text-slate-500">
                          {project?.name || 'Projeto'} • Cliente: {client?.companyName} • {formatDate(log.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg">
                          {formatDuration(log.durationMinutes)}
                        </span>
                        <button
                          onClick={() => deleteTimeLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
