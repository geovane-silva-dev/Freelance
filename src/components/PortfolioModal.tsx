import React, { useState, useEffect } from 'react';
import { X, Globe, Image, User, Tag, Star, Award } from 'lucide-react';
import { PortfolioItem } from '../types/index.ts';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<void>;
  itemToEdit?: PortfolioItem | null;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    niche: '',
    imageUrl: '',
    liveUrl: '',
    results: '',
    testimonial: '',
    beforeAfterNote: '',
    tags: 'Landing Page, Alta Conversão',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title: itemToEdit.title || '',
        client: itemToEdit.client || '',
        niche: itemToEdit.niche || '',
        imageUrl: itemToEdit.imageUrl || '',
        liveUrl: itemToEdit.liveUrl || '',
        results: itemToEdit.results || '',
        testimonial: itemToEdit.testimonial || '',
        beforeAfterNote: itemToEdit.beforeAfterNote || '',
        tags: itemToEdit.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        title: '',
        client: '',
        niche: '',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        liveUrl: '',
        results: '',
        testimonial: '',
        beforeAfterNote: '',
        tags: 'Landing Page, Alta Conversão',
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        clientId: '',
        clientName: formData.client,
        siteName: formData.title,
        publishedUrl: formData.liveUrl,
        platform: 'WordPress / Web',
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedAmount: 0,
        coverImage: formData.imageUrl,
        description: formData.results || formData.title,
        technologies: tagsArray,
        isPublic: true,
        tags: tagsArray,
      });
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
              {itemToEdit ? 'Editar Caso do Portfólio' : 'Adicionar ao Portfólio'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exiba seus melhores trabalhos, métricas alcançadas e depoimentos.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Título do Projeto *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Landing Page de Alta Conversão"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Ex: Dr. Marcelo Silva"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nicho / Segmento</label>
              <input
                type="text"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                placeholder="Ex: Saúde / Cirurgia Plástica"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Link do Site no Ar</label>
              <input
                type="text"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://www.siteexemplo.com.br"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL da Imagem de Capa (Screenshot / Thumbnail)</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Principais Resultados Alcançados</label>
            <input
              type="text"
              value={formData.results}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              placeholder="Ex: Taxa de conversão subiu de 1.2% para 4.8% no Google Ads"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Depoimento do Cliente</label>
            <textarea
              rows={2}
              value={formData.testimonial}
              onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
              placeholder="&quot;A página ficou muito rápida e dobrou o número de agendamentos pelo WhatsApp.&quot;"
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Antes e Depois (Observação)</label>
            <input
              type="text"
              value={formData.beforeAfterNote}
              onChange={(e) => setFormData({ ...formData, beforeAfterNote: e.target.value })}
              placeholder="Ex: Antes: site antigo demorava 6s para carregar. Depois: 1.1s no PageSpeed."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Landing Page, Médica, Alta Conversão, Tráfego Pago"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
            />
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
              {isSubmitting ? 'Salvando...' : itemToEdit ? 'Atualizar Item' : 'Salvar Portfólio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
