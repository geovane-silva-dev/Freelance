import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Users,
  FolderKanban,
  DollarSign,
  FileText,
  CheckSquare,
  MessageSquare,
  StickyNote,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { data, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (tab: any) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingClients = q
    ? data.clients.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.niche.toLowerCase().includes(q)
      )
    : [];

  const matchingProjects = q
    ? data.projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.serviceType.toLowerCase().includes(q) ||
          data.clients.find((c) => c.id === p.clientId)?.companyName.toLowerCase().includes(q)
      )
    : [];

  const matchingPayments = q
    ? data.payments.filter(
        (pay) =>
          pay.title.toLowerCase().includes(q) ||
          data.clients.find((c) => c.id === pay.clientId)?.companyName.toLowerCase().includes(q)
      )
    : [];

  const matchingProposals = q
    ? data.proposals.filter(
        (prop) =>
          prop.title.toLowerCase().includes(q) ||
          (prop.serviceName || prop.scope || '').toLowerCase().includes(q) ||
          data.clients.find((c) => c.id === prop.clientId)?.companyName.toLowerCase().includes(q)
      )
    : [];

  const matchingTasks = q
    ? data.tasks.filter((t) => t.title.toLowerCase().includes(q))
    : [];

  const matchingPersonalNotes = q
    ? (data.personalNotes || []).filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      )
    : [];

  const matchingHistoryNotes = q
    ? data.clientHistory.filter((h) => h.content.toLowerCase().includes(q))
    : [];

  const totalResults =
    matchingClients.length +
    matchingProjects.length +
    matchingPayments.length +
    matchingProposals.length +
    matchingTasks.length +
    matchingPersonalNotes.length +
    matchingHistoryNotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por clientes, projetos, observações, tarefas, propostas..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          {!q ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Busca Global Unificada
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Digite um nome, termo ou observação para buscar rapidamente em todo o sistema.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Nenhum resultado encontrado para &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tente pesquisar por outro termo ou nome de cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Observações Pessoais */}
              {matchingPersonalNotes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <StickyNote className="w-3.5 h-3.5" />
                    Minhas Observações ({matchingPersonalNotes.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingPersonalNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => navigateTo('notes')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {note.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {note.content}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver Notas <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes */}
              {matchingClients.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    Clientes ({matchingClients.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => navigateTo('clients')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {client.companyName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {client.contactName} • {client.city} • {client.niche}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Acessar <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projetos */}
              {matchingProjects.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                    <FolderKanban className="w-3.5 h-3.5" />
                    Projetos ({matchingProjects.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingProjects.map((proj) => {
                      const client = data.clients.find((c) => c.id === proj.clientId);
                      return (
                        <div
                          key={proj.id}
                          onClick={() => navigateTo('projects')}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {proj.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Cliente: {client?.companyName} • {proj.serviceType} • {formatCurrency(proj.chargedPrice)}
                            </p>
                          </div>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Projeto <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pagamentos */}
              {matchingPayments.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5" />
                    Pagamentos & Cobranças ({matchingPayments.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingPayments.map((pay) => (
                      <div
                        key={pay.id}
                        onClick={() => navigateTo('financial')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {pay.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Total: {formatCurrency(pay.totalAmount)} | Recebido: {formatCurrency(pay.receivedAmount)}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Financeiro <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Propostas */}
              {matchingProposals.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    Propostas ({matchingProposals.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingProposals.map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => navigateTo('proposals')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {prop.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Valor: {formatCurrency(prop.value)} • Status: {prop.status}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Propostas <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarefas */}
              {matchingTasks.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-500 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tarefas ({matchingTasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => navigateTo('tasks')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {task.completed ? 'Concluída' : 'Pendente'} {task.dueDate ? `• Prazo: ${formatDate(task.dueDate)}` : ''}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver Tarefa <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
