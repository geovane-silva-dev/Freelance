import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Instagram,
  MapPin,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Client, ClientStatus } from '../types/index.ts';
import { ClientModal } from './ClientModal.tsx';
import { ClientDetailModal } from './ClientDetailModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatDate } from '../utils/formatters.ts';

const STATUS_LABELS: Record<ClientStatus, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  contacted: { label: 'Contatado', color: 'bg-blue-100 text-blue-700' },
  negotiating: { label: 'Em negociação', color: 'bg-indigo-100 text-indigo-700' },
  awaiting_response: { label: 'Aguardando resposta', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', color: 'bg-teal-100 text-teal-700' },
  active_client: { label: 'Cliente ativo', color: 'bg-emerald-100 text-emerald-700' },
  project_in_progress: { label: 'Projeto em andamento', color: 'bg-purple-100 text-purple-700' },
  project_completed: { label: 'Projeto concluído', color: 'bg-emerald-100 text-emerald-800' },
  lost_client: { label: 'Cliente perdido', color: 'bg-rose-100 text-rose-700' },
  inactive_client: { label: 'Cliente inativo', color: 'bg-slate-200 text-slate-600' },
};

export const ClientsView: React.FC = () => {
  const { data, addClient, updateClient, deleteClient } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientDetailId, setClientDetailId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  // Filtered list
  const filteredClients = useMemo(() => {
    return data.clients.filter((client) => {
      const matchesSearch =
        client.companyName.toLowerCase().includes(search.toLowerCase()) ||
        client.contactName.toLowerCase().includes(search.toLowerCase()) ||
        client.city.toLowerCase().includes(search.toLowerCase()) ||
        client.niche.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data.clients, search, statusFilter]);

  const handleSaveClient = async (formData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (clientToEdit) {
      await updateClient(clientToEdit.id, formData);
      setClientToEdit(null);
    } else {
      await addClient(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gerenciamento de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre, pesquise, gerencie status e visualize o histórico completo de cada cliente.
          </p>
        </div>

        <button
          onClick={() => {
            setClientToEdit(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por empresa, responsável, nicho, cidade ou e-mail..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todos os Status ({data.clients.length})</option>
            {Object.entries(STATUS_LABELS).map(([key, item]) => {
              const count = data.clients.filter((c) => c.status === key).length;
              return (
                <option key={key} value={key}>
                  {item.label} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Clients Cards / Table */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum cliente encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search || statusFilter !== 'all'
              ? 'Tente remover os filtros ou pesquisar por outro termo.'
              : 'Clique em "Novo Cliente" para começar a cadastrar seus contatos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const statusCfg = STATUS_LABELS[client.status] || {
              label: client.status,
              color: 'bg-slate-100 text-slate-700',
            };
            const projectCount = data.projects.filter((p) => p.clientId === client.id).length;

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {client.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{client.contactName}</p>
                    </div>
                    <span className="relative inline-block">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStatusDropdownId(openStatusDropdownId === client.id ? null : client.id);
                        }}
                        title="Clique para selecionar a condição deste cliente"
                        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap cursor-pointer transition-all select-none hover:shadow-xs hover:ring-2 hover:ring-indigo-300 active:scale-95 ${statusCfg.color}`}
                      >
                        <span>{statusCfg.label}</span>
                        <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-transform" />
                      </button>

                      {openStatusDropdownId === client.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdownId(null);
                            }}
                          />
                          <div
                            className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                              <span>Selecionar Condição</span>
                              <span className="text-[9px] font-normal text-slate-400 lowercase">status</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-0.5">
                              {Object.entries(STATUS_LABELS).map(([statusKey, cfg]) => {
                                const isSelected = client.status === statusKey;
                                return (
                                  <button
                                    key={statusKey}
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await updateClient(client.id, { status: statusKey as ClientStatus });
                                      setOpenStatusDropdownId(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-50 font-bold text-indigo-900'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.color.split(' ')[0]}`} />
                                      <span className="truncate">{cfg.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.niche || 'Segmento não informado'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.city || 'Cidade não informada'}</span>
                    </div>

                    {client.whatsapp && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <a
                          href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-emerald-700 font-semibold truncate"
                        >
                          {client.whatsapp}
                        </a>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {projectCount} projeto(s)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setClientDetailId(client.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detalhes
                    </button>
                    <button
                      onClick={() => {
                        setClientToEdit(client);
                        setIsCreateOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setClientToDelete(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create/Edit Client */}
      <ClientModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* Modal for 360 Client Details (History, Notes, Files, Projects) */}
      <ClientDetailModal
        isOpen={!!clientDetailId}
        onClose={() => setClientDetailId(null)}
        clientId={clientDetailId}
        onEdit={(client) => {
          setClientDetailId(null);
          setClientToEdit(client);
          setIsCreateOpen(true);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.companyName}"? Todos os projetos, cobranças e anotações vinculadas também serão removidos.`}
        confirmLabel="Excluir Cliente"
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
};
