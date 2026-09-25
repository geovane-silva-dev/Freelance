import React, { useState, useEffect } from 'react';
import { X, DollarSign, Building2, Calendar, CreditCard, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Payment, PaymentMethod, PaymentStatus } from '../types/index.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
    customInstallments?: { number: number; amount: number; dueDate: string }[]
  ) => Promise<void>;
  paymentToEdit?: Payment | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  paymentToEdit,
}) => {
  const { data } = useApp();

  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    title: '',
    totalAmount: 2500,
    receivedAmount: 1250,
    costs: 150,
    status: 'partial' as PaymentStatus,
    paymentMethod: 'pix' as PaymentMethod,
    installmentsCount: 2,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentToEdit) {
      setFormData({
        clientId: paymentToEdit.clientId || (data.clients[0]?.id || ''),
        projectId: paymentToEdit.projectId || '',
        title: paymentToEdit.title || '',
        totalAmount: paymentToEdit.totalAmount || 0,
        receivedAmount: paymentToEdit.receivedAmount || 0,
        costs: paymentToEdit.costs || 0,
        status: paymentToEdit.status || 'pending',
        paymentMethod: paymentToEdit.paymentMethod || 'pix',
        installmentsCount: paymentToEdit.installmentsCount || 1,
        dueDate: paymentToEdit.dueDate || '',
      });
    } else {
      setFormData({
        clientId: data.clients[0]?.id || '',
        projectId: data.projects[0]?.id || '',
        title: 'Criação de Landing Page',
        totalAmount: 2500,
        receivedAmount: 1250,
        costs: 150,
        status: 'partial',
        paymentMethod: 'pix',
        installmentsCount: 2,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
    }
  }, [paymentToEdit, isOpen, data.clients, data.projects]);

  if (!isOpen) return null;

  const pendingAmount = Math.max(0, formData.totalAmount - formData.receivedAmount);
  const profit = formData.totalAmount - formData.costs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId) return;

    setIsSubmitting(true);
    try {
      // Generate installment schedule if new
      let customInstallments;
      if (!paymentToEdit && formData.installmentsCount > 1) {
        const perInstallment = Number((formData.totalAmount / formData.installmentsCount).toFixed(2));
        customInstallments = Array.from({ length: formData.installmentsCount }).map((_, i) => {
          const due = new Date();
          due.setDate(due.getDate() + i * 30);
          return {
            number: i + 1,
            amount: perInstallment,
            dueDate: due.toISOString().split('T')[0],
          };
        });
      }

      await onSave(
        {
          ...formData,
          pendingAmount,
          profit,
        },
        customInstallments
      );
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
              {paymentToEdit ? 'Editar Cobrança' : 'Nova Cobrança / Pagamento'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre pagamentos com cálculo automático de parcelas, lucro e pendências.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Título da Cobrança *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Landing Page - Entrada 50%"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Projeto Relacionado (opcional)</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                <option value="">Sem projeto específico</option>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Já Recebido (R$)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.receivedAmount}
                onChange={(e) => setFormData({ ...formData, receivedAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Custos Diretos (R$)</label>
              <input
                type="number"
                min="0"
                step="10"
                value={formData.costs}
                onChange={(e) => setFormData({ ...formData, costs: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="bank_slip">Boleto Bancário</option>
                <option value="transfer">Transferência Bancária (TED/DOC)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status da Cobrança</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                <option value="pending">Pendente (Aguardando)</option>
                <option value="partial">Parcial (Entrada paga)</option>
                <option value="paid">Totalmente Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Número de Parcelas</label>
              <select
                value={formData.installmentsCount}
                onChange={(e) => setFormData({ ...formData, installmentsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:border-indigo-500"
              >
                <option value={1}>À Vista (1x)</option>
                <option value={2}>2x (Ex: 50% entrada + 50% entrega)</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
                <option value={6}>6x</option>
                <option value={12}>12x</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Data de Vencimento Geral</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Automatic calculation summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Pendente a Receber:</span>
              <span className="font-bold text-amber-700">
                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Lucro Líquido Previsto:</span>
              <span className="font-bold text-emerald-700">
                R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
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
              {isSubmitting ? 'Salvando...' : paymentToEdit ? 'Atualizar Cobrança' : 'Salvar Cobrança'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
