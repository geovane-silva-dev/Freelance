import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, FolderKanban, DollarSign, FileText, CheckSquare, MessageSquare, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle or open
      }
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

  const matchingNotes = q
    ? data.clientHistory.filter((h) => h.content.toLowerCase().includes(q))
    : [];

  const totalResults =
    matchingClients.length +
    matchingProjects.length +
    matchingPayments.length +
    matchingProposals.length +
    matchingTasks.length +
    matchingNotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por empresa, cliente, projeto, pagamento, proposta, tarefa..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {!q ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-sm font-medium text-slate-600">Busca Global Unificada</p>
              <p className="text-xs text-slate-400 mt-1">
                Digite o nome de uma empresa ou projeto para ver clientes, propostas, pagamentos e tarefas relacionadas.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">Nenhum resultado encontrado para &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Tente pesquisar por outro termo ou nome de cliente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clientes */}
              {matchingClients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    Clientes ({matchingClients.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          setActiveTab('clients');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{client.companyName}</p>
                          <p className="text-xs text-slate-500">
                            {client.contactName} • {client.city} • {client.niche}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                    Projetos ({matchingProjects.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingProjects.map((proj) => {
                      const client = data.clients.find((c) => c.id === proj.clientId);
                      return (
                        <div
                          key={proj.id}
                          onClick={() => {
                            setActiveTab('projects');
                            onClose();
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800">{proj.name}</p>
                            <p className="text-xs text-slate-500">
                              Cliente: {client?.companyName} • {proj.serviceType} • {formatCurrency(proj.chargedPrice)}
                            </p>
                          </div>
                          <span className="text-xs text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Pagamentos & Cobranças ({matchingPayments.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingPayments.map((pay) => (
                      <div
                        key={pay.id}
                        onClick={() => {
                          setActiveTab('financial');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{pay.title}</p>
                          <p className="text-xs text-slate-500">
                            Total: {formatCurrency(pay.totalAmount)} | Recebido: {formatCurrency(pay.receivedAmount)} | Pendente: {formatCurrency(pay.pendingAmount)}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Propostas ({matchingProposals.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingProposals.map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => {
                          setActiveTab('proposals');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{prop.title}</p>
                          <p className="text-xs text-slate-500">
                            Valor: {formatCurrency(prop.value)} • Status: {prop.status}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-500" />
                    Tarefas ({matchingTasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setActiveTab('tasks');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                          <p className="text-xs text-slate-500">
                            {task.completed ? 'Concluída' : 'Pendente'} {task.dueDate ? `• Prazo: ${formatDate(task.dueDate)}` : ''}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver Tarefa <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anotações e Histórico */}
              {matchingNotes.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
                    Histórico & Anotações ({matchingNotes.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchingNotes.map((note) => {
                      const client = data.clients.find((c) => c.id === note.clientId);
                      return (
                        <div
                          key={note.id}
                          onClick={() => {
                            setActiveTab('clients');
                            onClose();
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-700">{client?.companyName || 'Cliente'}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{note.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(note.date)}</span>
                        </div>
                      );
                    })}
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
