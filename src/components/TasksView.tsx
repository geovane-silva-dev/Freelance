import React, { useState, useMemo, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
  Circle,
  Filter,
  Clock,
  Play,
  XCircle,
  ChevronDown,
  Check,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task, TaskPriority, TaskStatus } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';

const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: 'Alta', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300' },
  medium: { label: 'Média', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' },
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
    dot: string;
  }
> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'Em Andamento',
    icon: Play,
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/60',
    dot: 'bg-blue-500 animate-pulse',
  },
  in_review: {
    label: 'Em Revisão',
    icon: Eye,
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/60',
    dot: 'bg-purple-500',
  },
  completed: {
    label: 'Concluída',
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/60',
    dot: 'bg-rose-500',
  },
};

export const TasksView: React.FC = () => {
  const { data, addTask, toggleTaskCompleted, updateTask, deleteTask } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'in_review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('pending');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Hover and click dropdown states
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (taskId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredTaskId(taskId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTaskId(null);
    }, 180);
  };

  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.status) return task.status;
    return task.completed ? 'completed' : 'pending';
  };

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      const currentSt = getTaskStatus(t);
      const matchFilter =
        filter === 'all'
          ? true
          : filter === 'completed'
          ? currentSt === 'completed'
          : filter === 'in_progress'
          ? currentSt === 'in_progress'
          : filter === 'in_review'
          ? currentSt === 'in_review'
          : currentSt === 'pending';

      const matchPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter;
      return matchFilter && matchPriority;
    });
  }, [data.tasks, filter, priorityFilter]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addTask({
      title: newTitle.trim(),
      projectId: newProjectId || (data.projects[0]?.id ?? 'geral'),
      priority: newPriority,
      status: newStatus,
      dueDate: newDueDate,
    });

    setNewTitle('');
    setNewStatus('pending');
  };

  const pendingCount = data.tasks.filter((t) => getTaskStatus(t) === 'pending').length;
  const inProgressCount = data.tasks.filter((t) => getTaskStatus(t) === 'in_progress').length;
  const inReviewCount = data.tasks.filter((t) => getTaskStatus(t) === 'in_review').length;
  const completedCount = data.tasks.filter((t) => getTaskStatus(t) === 'completed').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Tarefas & Checklists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize suas entregas diárias, atividades técnicas e prioridades de cada projeto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-900">
            {pendingCount + inProgressCount + inReviewCount} em aberto
          </span>
          {inProgressCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900">
              {inProgressCount} em andamento
            </span>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddTask}
        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
      >
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Nova Tarefa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="O que precisa ser feito? (Ex: Configurar Pixel do Facebook no site)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-medium"
            >
              <option value="">Tarefa Geral (Sem projeto)</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-medium"
            >
              <option value="pending">Pendente (A Fazer)</option>
              <option value="in_progress">Em Andamento</option>
              <option value="in_review">Em Revisão</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-medium"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none text-[11px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar Tarefa
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({data.tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-slate-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Em Andamento ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'in_review'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Em Revisão ({inReviewCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Concluídas ({completedCount})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {filteredTasks.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12 text-center">Nenhuma tarefa encontrada neste filtro.</p>
        ) : (
          filteredTasks.map((task) => {
            const project = data.projects.find((p) => p.id === task.projectId);
            const priorityCfg = PRIORITY_LABELS[task.priority];
            const currentStatus = getTaskStatus(task);
            const statusCfg = TASK_STATUS_CONFIG[currentStatus];
            const StatusIcon = statusCfg.icon;
            const isMenuOpen = hoveredTaskId === task.id || openTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`font-semibold text-xs sm:text-sm ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {project && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Projeto: {project.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span>Prazo: {formatDate(task.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Selector (with hover/click menu) + Priority + Delete */}
                <div className="flex items-center gap-2.5 flex-shrink-0 pl-8 sm:pl-0">
                  {/* Status Dropdown / Popover (Triggered on hover or click) */}
                  <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(task.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenTaskId(openTaskId === task.id ? null : task.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} ${statusCfg.hoverBg}`}
                      title="Passe o mouse ou clique para alterar o status da tarefa"
                    >
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusCfg.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-150" />
                    </button>

                    {/* Floating Dropdown Selector */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                        onMouseEnter={() => handleMouseEnter(task.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                          Selecione o Status
                        </div>
                        {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((st) => {
                          const cfg = TASK_STATUS_CONFIG[st];
                          const Icon = cfg.icon;
                          const isCurrent = currentStatus === st;

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                updateTask(task.id, { status: st });
                                setOpenTaskId(null);
                                setHoveredTaskId(null);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                                isCurrent
                                  ? `${cfg.bg} ${cfg.text} font-bold ring-1 ${cfg.border}`
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <Icon className="w-3.5 h-3.5" />
                                <span>{cfg.label}</span>
                              </div>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Priority Badge */}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${priorityCfg.color}`}>
                    {priorityCfg.label}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
