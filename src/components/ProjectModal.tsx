import React, { useState, useEffect } from 'react';
import {
  X,
  FolderKanban,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Link2,
  CheckSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Project, ProjectStatus, ServiceType } from '../types/index.ts';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  projectToEdit?: Project | null;
}

const STATUS_OPTIONS: { val: ProjectStatus; label: string }[] = [
  { val: 'briefing', label: 'Briefing' },
  { val: 'in_progress', label: 'Em Desenvolvimento' },
  { val: 'review', label: 'Aguardando Aprovação' },
  { val: 'revisions', label: 'Ajustes' },
  { val: 'completed', label: 'Concluído' },
  { val: 'cancelled', label: 'Cancelado' },
];

const SERVICE_OPTIONS: ServiceType[] = [
  'Landing Page',
  'Site Institucional',
  'Loja Virtual (E-commerce)',
  'Otimização / Manutenção',
  'Identidade Visual / Redesign',
  'Tráfego Pago & Setup',
  'Outro Serviço Digital',
];

const DEFAULT_CHECKLIST = [
  'Domínio configurado e apontado',
  'Certificado de Segurança (SSL HTTPS) ativo',
  'Design Responsivo verificado em celular e desktop',
  'Formulários de contato testados e disparando e-mail',
  'Botão flutuante de WhatsApp testado',
  'Tags de rastreamento configuradas (Pixel Meta, GA4)',
  'Velocidade e compactação de imagens otimizadas',
  'Favicon personalizado adicionado',
  'SEO básico (Meta Title, Description, Open Graph)',
  'Políticas de Privacidade e Termos de Uso inseridos',
  'Backup completo do projeto realizado',
  'Acessos e dados entregues ao cliente',
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
}) => {
  const { data } = useApp();

  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    serviceType: 'Landing Page' as ServiceType,
    chargedPrice: 2500,
    costs: 150,
    deliveryDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'in_progress' as ProjectStatus,
    estimatedHours: 20,
    actualHours: 0,
    progress: 10,
    briefingLink: '',
    figmaLink: '',
    previewLink: '',
    liveUrl: '',
    checklist: DEFAULT_CHECKLIST.map((item, index) => ({
      id: `chk-${index}`,
      label: item,
      checked: false,
    })),
    notes: '',
  });

  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        clientId: projectToEdit.clientId || (data.clients[0]?.id || ''),
        name: projectToEdit.name || '',
        serviceType: projectToEdit.serviceType || 'Landing Page',
        chargedPrice: projectToEdit.chargedPrice || 0,
        costs: projectToEdit.costs || 0,
        deliveryDeadline: projectToEdit.deliveryDeadline || '',
        status: projectToEdit.status || 'in_progress',
        estimatedHours: projectToEdit.estimatedHours || 0,
        actualHours: projectToEdit.actualHours || 0,
        progress: projectToEdit.progress || 0,
        briefingLink: projectToEdit.briefingLink || '',
        figmaLink: projectToEdit.figmaLink || '',
        previewLink: projectToEdit.previewLink || '',
        liveUrl: projectToEdit.liveUrl || '',
        checklist: (projectToEdit.checklist || []).map((item) => ({
          id: item.id,
          label: item.label,
          checked: Boolean(item.checked ?? (item as any).done),
        })),
        notes: projectToEdit.notes || '',
      });
    } else {
      setFormData({
        clientId: data.clients[0]?.id || '',
        name: '',
        serviceType: 'Landing Page',
        chargedPrice: 2500,
        costs: 150,
        deliveryDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'in_progress',
        estimatedHours: 20,
        actualHours: 0,
        progress: 10,
        briefingLink: '',
        figmaLink: '',
        previewLink: '',
        liveUrl: '',
        checklist: DEFAULT_CHECKLIST.map((item, index) => ({
          id: `chk-${index}`,
          label: item,
          checked: false,
        })),
        notes: '',
      });
    }
  }, [projectToEdit, isOpen, data.clients]);

  if (!isOpen) return null;

  // Calculate profit
  const calculatedProfit = (formData.chargedPrice || 0) - (formData.costs || 0);

  // Toggle checklist item and update progress
  const toggleChecklist = (id: string) => {
    const updated = formData.checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    const checkedCount = updated.filter((i) => i.checked).length;
    const progressPercent = updated.length > 0 ? Math.round((checkedCount / updated.length) * 100) : 0;
    setFormData({ ...formData, checklist: updated, progress: progressPercent });
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      label: newChecklistText.trim(),
      checked: false,
    };
    const updated = [...formData.checklist, newItem];
    setFormData({ ...formData, checklist: updated });
    setNewChecklistText('');
  };

  const removeChecklistItem = (id: string) => {
    const updated = formData.checklist.filter((i) => i.id !== id);
    setFormData({ ...formData, checklist: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.clientId) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        profit: calculatedProfit,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {projectToEdit ? 'Editar Projeto' : 'Criar Novo Projeto'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina escopo, prazos, finanças e o checklist técnico de entrega.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Projeto */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome do Projeto *</label>
              <div className="relative">
                <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Landing Page Alta Conversão"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Cliente Associado */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente Associado *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
                >
                  {data.clients.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
                  {data.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Serviço</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                {SERVICE_OPTIONS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            {/* Status do Projeto */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço Cobrado */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Preço Cobrado (R$)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.chargedPrice}
                  onChange={(e) => setFormData({ ...formData, chargedPrice: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Custos do Projeto */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Custos (Hospedagem, Domínio, Plugins)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.costs}
                  onChange={(e) => setFormData({ ...formData, costs: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Prazo de Entrega */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prazo de Entrega</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={formData.deliveryDeadline}
                  onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Horas Estimadas */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Horas Estimadas</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Lucro Calculado Automático */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="font-bold text-emerald-900">Lucro Líquido Calculado Automaticamente:</span>
            <span className="font-black text-sm text-emerald-700">
              R$ {calculatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Links do Projeto */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800">Links e Acessos do Projeto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link do Briefing</label>
                <input
                  type="text"
                  value={formData.briefingLink}
                  onChange={(e) => setFormData({ ...formData, briefingLink: e.target.value })}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link do Design (Figma)</label>
                <input
                  type="text"
                  value={formData.figmaLink}
                  onChange={(e) => setFormData({ ...formData, figmaLink: e.target.value })}
                  placeholder="https://figma.com/file/..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link de Teste / Prévia</label>
                <input
                  type="text"
                  value={formData.previewLink}
                  onChange={(e) => setFormData({ ...formData, previewLink: e.target.value })}
                  placeholder="https://previa.meusite.com/cliente"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link Final Publicado</label>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://www.cliente.com.br"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Checklist de Entrega (Section 10) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Checklist Técnico de Entrega</h4>
                <p className="text-[11px] text-slate-500">
                  Itens essenciais para garantir qualidade máxima antes da entrega.
                </p>
              </div>
              <span className="font-bold text-indigo-600">{formData.progress}% Concluído</span>
            </div>

            {/* Checklist items list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
              {formData.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklist(item.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`truncate text-xs ${
                        item.checked ? 'line-through text-slate-400 font-medium' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new checklist item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Adicionar outro item de verificação..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>
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
              {isSubmitting ? 'Salvando...' : projectToEdit ? 'Atualizar Projeto' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
