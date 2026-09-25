import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, Instagram, MapPin, Tag, Calendar, FileText, Globe } from 'lucide-react';
import { Client, ClientStatus } from '../types/index.ts';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  clientToEdit?: Client | null;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: 'Lead',
  contacted: 'Contatado',
  negotiating: 'Em negociação',
  awaiting_response: 'Aguardando resposta',
  confirmed: 'Confirmado',
  active_client: 'Cliente ativo',
  project_in_progress: 'Projeto em andamento',
  project_completed: 'Projeto concluído',
  lost_client: 'Cliente perdido',
  inactive_client: 'Cliente inativo',
};

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    email: '',
    city: '',
    niche: '',
    firstContactDate: new Date().toISOString().split('T')[0],
    origin: 'Instagram',
    notes: '',
    status: 'lead' as ClientStatus,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        companyName: clientToEdit.companyName || '',
        contactName: clientToEdit.contactName || '',
        phone: clientToEdit.phone || '',
        whatsapp: clientToEdit.whatsapp || '',
        instagram: clientToEdit.instagram || '',
        email: clientToEdit.email || '',
        city: clientToEdit.city || '',
        niche: clientToEdit.niche || '',
        firstContactDate: clientToEdit.firstContactDate || new Date().toISOString().split('T')[0],
        origin: clientToEdit.origin || 'Instagram',
        notes: clientToEdit.notes || '',
        status: clientToEdit.status || 'lead',
      });
    } else {
      setFormData({
        companyName: '',
        contactName: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        email: '',
        city: '',
        niche: '',
        firstContactDate: new Date().toISOString().split('T')[0],
        origin: 'Instagram',
        notes: '',
        status: 'lead',
      });
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;

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
              {clientToEdit ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Insira as informações do cliente para o CRM pessoal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome da Empresa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome da Empresa *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ex: Barbearia Vintage Club"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Nome do Responsável */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Responsável
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp (apenas números ou formatado)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Ex: 11987654321"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Telefone Adicional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Fixo / Outro</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: (11) 3344-5566"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram</label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@perfil.cliente"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Estado</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: São Paulo - SP"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Segmento / Nicho */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Segmento / Nicho</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="Ex: Odontologia, Barbearia, Jurídico..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Data do Primeiro Contato */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data do Primeiro Contato
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={formData.firstContactDate}
                  onChange={(e) => setFormData({ ...formData, firstContactDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            {/* Origem / Como encontrei o cliente */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Como encontrei o cliente (Origem)
              </label>
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                <option value="Instagram">Instagram</option>
                <option value="Prospecção Ativa">Prospecção Ativa (Google Maps / Cold Message)</option>
                <option value="Indicação">Indicação de Cliente / Amigo</option>
                <option value="Google Meu Negócio">Google Meu Negócio</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Plataforma Freelancer">Plataforma Freelancer (99Freelas, Workana)</option>
                <option value="Anúncios / Tráfego Pago">Anúncios / Tráfego Pago</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Status do Cliente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status do Cliente</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white font-medium"
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes sobre o cliente, expectativas, dores principais ou informações relevantes..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : clientToEdit ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
