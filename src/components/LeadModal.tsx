import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Tag, Calendar, DollarSign, Bell } from 'lucide-react';
import { Lead, LeadStage } from '../types/index.ts';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  leadToEdit?: Lead | null;
  initialStage?: LeadStage;
}

export const STAGE_LABELS: Record<string, { label: string; color: string; border: string }> = {
  prospect: { label: '1. Prospecção', color: 'bg-slate-100 text-slate-800', border: 'border-slate-300' },
  leads_found: { label: '1. Prospecção', color: 'bg-slate-100 text-slate-800', border: 'border-slate-300' },
  first_contact: { label: '2. Primeiro Contato', color: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
  talking: { label: '3. Conversando', color: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-300' },
  awaiting_response: { label: '4. Aguardando Resposta', color: 'bg-amber-100 text-amber-800', border: 'border-amber-300' },
  proposal_sent: { label: '5. Proposta Enviada', color: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  negotiating: { label: '6. Em Negociação', color: 'bg-cyan-100 text-cyan-800', border: 'border-cyan-300' },
  closed: { label: '7. Fechado (Ganha)', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
  lost: { label: '8. Não Fechado (Perdido)', color: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
};

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  initialStage = 'prospect',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    niche: '',
    whatsapp: '',
    estimatedValue: 2500,
    stage: initialStage as LeadStage,
    lastContactDate: new Date().toISOString().split('T')[0],
    nextContactDate: '',
    followUpReminder: '',
    notes: '',
    tags: 'Landing Page',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name || '',
        company: leadToEdit.company || '',
        niche: leadToEdit.niche || '',
        whatsapp: leadToEdit.whatsapp || '',
        estimatedValue: leadToEdit.estimatedValue || 0,
        stage: leadToEdit.stage || initialStage,
        lastContactDate: leadToEdit.lastContactDate || new Date().toISOString().split('T')[0],
        nextContactDate: leadToEdit.nextContactDate || '',
        followUpReminder: leadToEdit.followUpReminder || '',
        notes: leadToEdit.notes || '',
        tags: leadToEdit.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        name: '',
        company: '',
        niche: '',
        whatsapp: '',
        estimatedValue: 2500,
        stage: initialStage,
        lastContactDate: new Date().toISOString().split('T')[0],
        nextContactDate: '',
        followUpReminder: '',
        notes: '',
        tags: 'Landing Page',
      });
    }
  }, [leadToEdit, initialStage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        proposalValue: formData.estimatedValue,
        instagram: '',
        city: '',
        contactDate: formData.lastContactDate,
        tags: tagsArray,
      } as any);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {leadToEdit ? 'Editar Lead do Funil' : 'Novo Lead / Oportunidade'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre oportunidades no pipeline de vendas para acompanhar o contato.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Empresa / Negócio *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Ex: Clínica Sorrir"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome do Contato</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Dra. Mariana"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nicho / Segmento</label>
              <input
                type="text"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                placeholder="Ex: Odontologia"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Ex: 11999998888"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Potencial Estimado (R$)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Etapa do Funil</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as LeadStage })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                {Object.entries(STAGE_LABELS).map(([val, item]) => (
                  <option key={val} value={val}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data do Último Contato</label>
              <input
                type="date"
                value={formData.lastContactDate}
                onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data para Próximo Contato (Follow-up)</label>
              <input
                type="date"
                value={formData.nextContactDate}
                onChange={(e) => setFormData({ ...formData, nextContactDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lembrete do Follow-up</label>
            <div className="relative">
              <Bell className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.followUpReminder}
                onChange={(e) => setFormData({ ...formData, followUpReminder: e.target.value })}
                placeholder="Ex: Mandar mensagem perguntando se já analisou a proposta de R$ 2.500"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Landing Page, Alta Prioridade, Tráfego Pago"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Anotações da Negociação</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre o lead..."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Salvando...' : leadToEdit ? 'Atualizar Lead' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
