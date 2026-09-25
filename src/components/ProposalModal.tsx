import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Proposal, ProposalStatus } from '../types/index.ts';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  proposalToEdit?: Proposal | null;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  proposalToEdit,
}) => {
  const { data } = useApp();

  const [formData, setFormData] = useState({
    clientId: data.clients[0]?.id || '',
    title: '',
    scope: '',
    includedItems: [
      'Design personalizado no Figma',
      'Desenvolvimento responsivo (Mobile & Desktop)',
      'Otimização de velocidade e SEO básico',
      'Integração com WhatsApp e formulário de contato',
    ],
    excludedItems: [
      'Criação de logotipo ou identidade visual',
      'Compra e custos recorrentes de domínio e hospedagem',
      'Redação dos textos do zero (sem briefing)',
      'Gestão contínua de anúncios/tráfego',
    ],
    deadlineDays: 10,
    paymentTerms: '50% de entrada + 50% na aprovação final',
    totalValue: 2500,
    status: 'draft' as ProposalStatus,
  });

  const [includedInput, setIncludedInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (proposalToEdit) {
      setFormData({
        clientId: proposalToEdit.clientId || (data.clients[0]?.id || ''),
        title: proposalToEdit.title || '',
        scope: proposalToEdit.scope || '',
        includedItems: proposalToEdit.includedItems || [],
        excludedItems: proposalToEdit.excludedItems || [],
        deadlineDays: proposalToEdit.deadlineDays || 10,
        paymentTerms: proposalToEdit.paymentTerms || '',
        totalValue: proposalToEdit.totalValue || 0,
        status: proposalToEdit.status || 'draft',
      });
    } else {
      setFormData({
        clientId: data.clients[0]?.id || '',
        title: 'Criação de Landing Page de Alta Conversão',
        scope: 'Desenvolvimento completo de landing page focada em conversão para captação de leads qualificados.',
        includedItems: [
          'Design personalizado no Figma',
          'Desenvolvimento responsivo (Mobile & Desktop)',
          'Otimização de velocidade e SEO básico',
          'Integração com WhatsApp e formulário de contato',
        ],
        excludedItems: [
          'Criação de logotipo ou identidade visual',
          'Compra e custos recorrentes de domínio e hospedagem',
          'Redação dos textos do zero (sem briefing)',
          'Gestão contínua de anúncios/tráfego',
        ],
        deadlineDays: 10,
        paymentTerms: '50% de entrada + 50% na aprovação final',
        totalValue: 2500,
        status: 'draft',
      });
    }
  }, [proposalToEdit, isOpen, data.clients]);

  if (!isOpen) return null;

  const handleAddIncluded = () => {
    if (includedInput.trim()) {
      setFormData({
        ...formData,
        includedItems: [...formData.includedItems, includedInput.trim()],
      });
      setIncludedInput('');
    }
  };

  const handleRemoveIncluded = (idx: number) => {
    setFormData({
      ...formData,
      includedItems: formData.includedItems.filter((_, i) => i !== idx),
    });
  };

  const handleAddExcluded = () => {
    if (excludedInput.trim()) {
      setFormData({
        ...formData,
        excludedItems: [...formData.excludedItems, excludedInput.trim()],
      });
      setExcludedInput('');
    }
  };

  const handleRemoveExcluded = (idx: number) => {
    setFormData({
      ...formData,
      excludedItems: formData.excludedItems.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {proposalToEdit ? 'Editar Proposta Comercial' : 'Criar Nova Proposta Comercial'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina escopo, inclusões, exclusões e termos claros para evitar retrabalho.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Título da Proposta *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.totalValue}
                onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prazo de Entrega (dias úteis)</label>
              <input
                type="number"
                min="1"
                value={formData.deadlineDays}
                onChange={(e) => setFormData({ ...formData, deadlineDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Condições de Pagamento</label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="Ex: 50% de entrada + 50% na aprovação final"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProposalStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviada ao Cliente</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Recusada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Escopo Geral do Projeto</label>
            <textarea
              rows={2}
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
            />
          </div>

          {/* Included Items */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">O que está incluído:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={includedInput}
                onChange={(e) => setIncludedInput(e.target.value)}
                placeholder="Ex: Responsividade Mobile & Tablet..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIncluded();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddIncluded}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Adicionar
              </button>
            </div>
            <ul className="space-y-1 mt-2">
              {formData.includedItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-slate-700 py-0.5">
                  <span>✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIncluded(i)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded Items */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">O que NÃO está incluído:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={excludedInput}
                onChange={(e) => setExcludedInput(e.target.value)}
                placeholder="Ex: Custos de hospedagem e domínio..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExcluded();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddExcluded}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Adicionar
              </button>
            </div>
            <ul className="space-y-1 mt-2">
              {formData.excludedItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-slate-700 py-0.5">
                  <span>✕ {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExcluded(i)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Salvando...' : proposalToEdit ? 'Atualizar Proposta' : 'Salvar Proposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
