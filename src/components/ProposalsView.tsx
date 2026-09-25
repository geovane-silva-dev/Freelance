import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Share2,
  DollarSign,
  Clock,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Proposal, ProposalStatus } from '../types/index.ts';
import { ProposalModal } from './ProposalModal.tsx';
import { ProposalPreviewModal } from './ProposalPreviewModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Enviada', color: 'bg-indigo-100 text-indigo-800' },
  viewed: { label: 'Visualizada', color: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Aceita', color: 'bg-emerald-100 text-emerald-800' },
  approved: { label: 'Aprovada', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Recusada', color: 'bg-rose-100 text-rose-800' },
  expired: { label: 'Expirada', color: 'bg-slate-100 text-slate-500' },
};

export const ProposalsView: React.FC = () => {
  const { data, addProposal, updateProposal, deleteProposal } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalToEdit, setProposalToEdit] = useState<Proposal | null>(null);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [proposalToPreview, setProposalToPreview] = useState<Proposal | null>(null);

  const filteredProposals = useMemo(() => {
    return data.proposals.filter((p) => {
      const client = data.clients.find((c) => c.id === p.clientId);
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (client && client.companyName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.proposals, data.clients, search, statusFilter]);

  const handleSaveProposal = async (
    formData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (proposalToEdit) {
      await updateProposal(proposalToEdit.id, formData);
      setProposalToEdit(null);
    } else {
      await addProposal(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (proposalToDelete) {
      await deleteProposal(proposalToDelete.id);
      setProposalToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Propostas Comerciais & Contratos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Crie propostas claras com escopo, o que está e não está incluído, e envie direto pelo WhatsApp.
          </p>
        </div>

        <button
          onClick={() => {
            setProposalToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por proposta ou cliente..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium text-slate-700"
        >
          <option value="all">Todos os Status ({data.proposals.length})</option>
          <option value="draft">Rascunho</option>
          <option value="sent">Enviada</option>
          <option value="approved">Aprovada</option>
          <option value="rejected">Recusada</option>
        </select>
      </div>

      {/* Grid of proposals */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhuma proposta encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">
            Clique no botão acima para criar sua primeira proposta comercial profissional.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProposals.map((p) => {
            const client = data.clients.find((c) => c.id === p.clientId);
            const statusCfg = STATUS_CONFIG[p.status] || {
              label: p.status,
              color: 'bg-slate-100 text-slate-700',
            };

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatCurrency(p.totalValue ?? p.value ?? 0)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mt-3">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cliente:{' '}
                    <strong className="text-slate-700">{client?.companyName || 'Não definido'}</strong>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {p.scope || p.description}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Prazo de entrega:</span>
                      <strong className="text-slate-800">
                        {p.deadlineDays || p.estimatedDays || 7} dias úteis
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Condições:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {p.paymentTerms || '50% entrada + 50% entrega'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setProposalToPreview(p)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visualizar & Enviar
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProposalToEdit(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProposalToDelete(p)}
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

      {/* Proposal Create/Edit Modal */}
      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProposalToEdit(null);
        }}
        onSave={handleSaveProposal}
        proposalToEdit={proposalToEdit}
      />

      {/* Proposal Preview Modal */}
      {proposalToPreview && (
        <ProposalPreviewModal
          isOpen={true}
          onClose={() => setProposalToPreview(null)}
          proposal={proposalToPreview}
          client={data.clients.find((c) => c.id === proposalToPreview.clientId)}
          settings={data.settings}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!proposalToDelete}
        title="Excluir Proposta"
        message={`Deseja realmente excluir a proposta "${proposalToDelete?.title}"?`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProposalToDelete(null)}
      />
    </div>
  );
};
