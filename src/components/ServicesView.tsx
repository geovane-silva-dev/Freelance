import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Clock,
  DollarSign,
  CheckCircle2,
  Layers,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ServicePackage } from '../types/index.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatCurrency } from '../utils/formatters.ts';

export const ServicesView: React.FC = () => {
  const { data, addServicePackage, updateServicePackage, deleteServicePackage } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePackage | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServicePackage | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    suggestedPrice: 2000,
    averageHours: 15,
    includes: 'Design exclusivo no Figma, Responsivo para celular, Otimização de velocidade',
  });

  const handleOpenModal = (service?: ServicePackage) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        suggestedPrice: service.suggestedPrice,
        averageHours: service.averageHours,
        includes: service.includes.join(', '),
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        suggestedPrice: 2000,
        averageHours: 15,
        includes: 'Design exclusivo no Figma, Responsivo para celular, Otimização de velocidade',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const includesArr = formData.includes
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    if (editingService) {
      await updateServicePackage(editingService.id, {
        name: formData.name,
        description: formData.description,
        suggestedPrice: formData.suggestedPrice,
        averageHours: formData.averageHours,
        includes: includesArr,
      });
    } else {
      await addServicePackage({
        name: formData.name,
        description: formData.description,
        suggestedPrice: formData.suggestedPrice,
        averageHours: formData.averageHours,
        includes: includesArr,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Catálogo de Serviços & Pacotes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Padronize seus serviços, tempo médio de execução e valores de referência para orçamentos rápidos.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Pacote de Serviço
        </button>
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.servicePackages.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {formatCurrency(srv.suggestedPrice)}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-3">{srv.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{srv.description}</p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Tempo médio estimado: <strong>{srv.averageHours} horas</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  O que está incluso:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {srv.includes.map((inc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-1">
              <button
                onClick={() => handleOpenModal(srv)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setServiceToDelete(srv)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingService ? 'Editar Pacote' : 'Novo Pacote de Serviço'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Pacote *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Landing Page de Alta Conversão"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Serviço</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique o objetivo e formato de entrega..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço Sugerido (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.suggestedPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestedPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempo Médio (horas)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.averageHours}
                    onChange={(e) =>
                      setFormData({ ...formData, averageHours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  O que está incluso (separado por vírgula)
                </label>
                <textarea
                  rows={3}
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  placeholder="Design exclusivo, Responsividade total, Pixel do Facebook, Copywriting..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Salvar Pacote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!serviceToDelete}
        title="Excluir Pacote"
        message={`Deseja realmente excluir o pacote "${serviceToDelete?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (serviceToDelete) {
            await deleteServicePackage(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
};
