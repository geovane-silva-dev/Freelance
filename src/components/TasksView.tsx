import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task, TaskPriority } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';

const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: 'Alta', color: 'bg-rose-100 text-rose-800' },
  medium: { label: 'Média', color: 'bg-amber-100 text-amber-800' },
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
};

export const TasksView: React.FC = () => {
  const { data, addTask, toggleTaskCompleted, deleteTask } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      const matchFilter =
        filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed;
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
      dueDate: newDueDate,
    });

    setNewTitle('');
  };

  const pendingCount = data.tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tarefas & Checklists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize suas entregas diárias, atividades técnicas e prioridades de cada projeto.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
            {pendingCount} tarefa(s) pendente(s)
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddTask}
        className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
      >
        <h3 className="text-xs font-bold text-slate-800">Nova Tarefa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="O que precisa ser feito? (Ex: Configurar Pixel do Facebook no site)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="">Tarefa Geral (Sem projeto)</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 outline-none"
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
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({data.tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Concluídas ({data.tasks.length - pendingCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
        {filteredTasks.length === 0 ? (
          <p className="text-slate-400 py-12 text-center">Nenhuma tarefa encontrada.</p>
        ) : (
          filteredTasks.map((task) => {
            const project = data.projects.find((p) => p.id === task.projectId);
            const priorityCfg = PRIORITY_LABELS[task.priority];

            return (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {project && (
                        <span className="text-indigo-600 font-medium">Projeto: {project.name}</span>
                      )}
                      {task.dueDate && (
                        <span>Prazo: {formatDate(task.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${priorityCfg.color}`}>
                    {priorityCfg.label}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
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
