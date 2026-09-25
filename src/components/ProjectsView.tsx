import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Project, ProjectStatus } from '../types/index.ts';
import { ProjectModal } from './ProjectModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  not_started: { label: 'Não Iniciado', color: 'bg-slate-100 text-slate-800' },
  briefing: { label: 'Briefing', color: 'bg-slate-100 text-slate-800' },
  in_progress: { label: 'Em Desenvolvimento', color: 'bg-indigo-100 text-indigo-800' },
  review: { label: 'Aguardando Aprovação', color: 'bg-amber-100 text-amber-800' },
  awaiting_client: { label: 'Aguardando Cliente', color: 'bg-amber-100 text-amber-800' },
  in_review: { label: 'Em Revisão', color: 'bg-purple-100 text-purple-800' },
  revisions: { label: 'Ajustes', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-100 text-rose-800' },
};

export const ProjectsView: React.FC = () => {
  const { data, addProject, updateProject, deleteProject, startTimer } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return data.projects.filter((proj) => {
      const client = data.clients.find((c) => c.id === proj.clientId);
      const matchesSearch =
        proj.name.toLowerCase().includes(search.toLowerCase()) ||
        proj.serviceType.toLowerCase().includes(search.toLowerCase()) ||
        (client && client.companyName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.projects, data.clients, search, statusFilter]);

  const handleSaveProject = async (
    formData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (projectToEdit) {
      await updateProject(projectToEdit.id, formData);
      setProjectToEdit(null);
    } else {
      await addProject(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gerenciador de Projetos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe prazos, checklist técnico de entrega, horas gastas e rentabilidade de cada site.
          </p>
        </div>

        <button
          onClick={() => {
            setProjectToEdit(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por projeto, cliente ou tipo de serviço..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todos os Status ({data.projects.length})</option>
            {Object.entries(STATUS_CONFIG).map(([key, item]) => {
              const count = data.projects.filter((p) => p.status === key).length;
              return (
                <option key={key} value={key}>
                  {item.label} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Projects List / Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum projeto encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">
            Clique no botão &quot;Novo Projeto&quot; para iniciar o planejamento do site ou landing page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((proj) => {
            const client = data.clients.find((c) => c.id === proj.clientId);
            const statusCfg = STATUS_CONFIG[proj.status] || {
              label: proj.status,
              color: 'bg-slate-100 text-slate-700',
            };

            const checkedChecklist = proj.checklist?.filter((c: any) => c.done || c.checked).length || 0;
            const totalChecklist = proj.checklist?.length || 0;

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {proj.serviceType}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cliente:{' '}
                        <strong className="text-slate-700">
                          {client?.companyName || 'Não especificado'}
                        </strong>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>Progresso do Projeto</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Valor Cobrado</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(proj.chargedPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Lucro Líquido</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(proj.profit || proj.chargedPrice - (proj.costs ?? proj.projectCost ?? 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Horas Gastas</span>
                      <span className="font-bold text-indigo-700">
                        {proj.actualHours}h / {proj.estimatedHours}h
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Checklist info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Prazo:{' '}
                      <strong className="text-slate-700">{formatDate(proj.deliveryDeadline)}</strong>
                    </span>
                    <span>
                      Checklist:{' '}
                      <strong className="text-slate-700">
                        {checkedChecklist}/{totalChecklist} concluídos
                      </strong>
                    </span>
                  </div>

                  {/* Quick links */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                    {proj.briefingLink && (
                      <a
                        href={proj.briefingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1"
                      >
                        <Link className="w-3 h-3 text-slate-400" />
                        Briefing
                      </a>
                    )}
                    {proj.figmaLink && (
                      <a
                        href={proj.figmaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded text-[11px] font-medium text-purple-700 flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3 text-purple-500" />
                        Figma
                      </a>
                    )}
                    {proj.previewLink && (
                      <a
                        href={proj.previewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-[11px] font-medium text-indigo-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-500" />
                        Prévia
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded text-[11px] font-medium text-emerald-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-500" />
                        Site Publicado
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => startTimer(proj.clientId, proj.id, `Trabalho em ${proj.name}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                    Iniciar Cronômetro
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProjectToEdit(proj);
                        setIsCreateOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar projeto e checklist"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Excluir Projeto"
        message={`Deseja realmente excluir o projeto "${projectToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir Projeto"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
