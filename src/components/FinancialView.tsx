import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Building2,
  ExternalLink,
  Receipt,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Payment, Installment, Expense, PaymentStatus } from '../types/index.ts';
import { PaymentModal } from './PaymentModal.tsx';
import { ReceiptModal } from './ReceiptModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

const STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
  unpaid: { label: 'Em Aberto', color: 'bg-amber-100 text-amber-800' },
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
  partial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800' },
  partially_paid: { label: 'Parcialmente Pago', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Totalmente Pago', color: 'bg-emerald-100 text-emerald-800' },
  overdue: { label: 'Atrasado', color: 'bg-rose-100 text-rose-800' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-700' },
};

export const FinancialView: React.FC = () => {
  const {
    data,
    addPayment,
    updatePayment,
    deletePayment,
    markInstallmentPaid,
    addExpense,
    deleteExpense,
  } = useApp();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'installments' | 'expenses'>('payments');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Receipt Modal state
  const [receiptData, setReceiptData] = useState<{
    payment: Payment;
    installment?: Installment;
  } | null>(null);

  // New Expense form state
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>('tools');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(100);
  const [newExpensePeriodicity, setNewExpensePeriodicity] = useState<Expense['periodicity']>('monthly');

  // Financial totals
  const financials = useMemo(() => {
    const totalBilled = data.payments.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalReceived = data.payments.reduce((acc, p) => acc + p.receivedAmount, 0);
    const totalPending = data.payments.reduce((acc, p) => acc + p.pendingAmount, 0);

    // Business expenses monthly sum
    const totalRecurringExpenses = data.expenses.reduce((acc, e) => {
      if (e.periodicity === 'monthly') return acc + e.amount;
      if (e.periodicity === 'yearly') return acc + e.amount / 12;
      return acc + e.amount;
    }, 0);

    // Direct project costs sum
    const totalProjectCosts = data.payments.reduce((acc, p) => acc + (p.costs || 0), 0);
    const totalCosts = totalProjectCosts + totalRecurringExpenses;

    const netProfit = totalReceived - totalCosts;

    // Overdue installments
    const today = new Date().toISOString().split('T')[0];
    const overdueInstallments = data.installments.filter(
      (inst) => inst.status !== 'paid' && inst.dueDate < today
    );
    const overdueAmount = overdueInstallments.reduce((acc, inst) => acc + inst.amount, 0);

    return {
      totalBilled,
      totalReceived,
      totalPending,
      totalCosts,
      totalRecurringExpenses,
      netProfit,
      overdueCount: overdueInstallments.length,
      overdueAmount,
    };
  }, [data.payments, data.expenses, data.installments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return data.payments.filter((p) => {
      const client = data.clients.find((c) => c.id === p.clientId);
      return (
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (client && client.companyName.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [data.payments, data.clients, search]);

  const handleSavePayment = async (
    paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
    customInstallments?: { number: number; amount: number; dueDate: string }[]
  ) => {
    if (paymentToEdit) {
      await updatePayment(paymentToEdit.id, paymentData);
      setPaymentToEdit(null);
    } else {
      await addPayment(paymentData, customInstallments);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || newExpenseAmount <= 0) return;
    await addExpense({
      title: newExpenseTitle.trim(),
      category: newExpenseCategory,
      amount: newExpenseAmount,
      periodicity: newExpensePeriodicity,
      startDate: new Date().toISOString().split('T')[0],
    });
    setNewExpenseTitle('');
    setNewExpenseAmount(100);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestão Financeira & Cobranças
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Controle faturamento, parcelas de clientes, custos operacionais e recibos profissionais.
          </p>
        </div>

        <button
          onClick={() => {
            setPaymentToEdit(null);
            setIsPaymentModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Cobrança
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-semibold">Total Já Recebido</span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(financials.totalReceived)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Entradas confirmadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-semibold">Total a Receber</span>
          <p className="text-xl font-black text-amber-600 mt-1">
            {formatCurrency(financials.totalPending)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Parcelas futuras</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-semibold">Pagamentos Atrasados</span>
          <p
            className={`text-xl font-black mt-1 ${
              financials.overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
            }`}
          >
            {formatCurrency(financials.overdueAmount)}
          </p>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
            {financials.overdueCount} parcela(s) vencida(s)
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-semibold">Custos e Ferramentas</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(financials.totalCosts)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Hospedagem, plugins, etc.</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-semibold">Lucro Líquido Real</span>
          <p className="text-xl font-black text-indigo-600 mt-1">
            {formatCurrency(financials.netProfit)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Margem real de ganho
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cobranças e Contratos ({data.payments.length})
        </button>
        <button
          onClick={() => setActiveTab('installments')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'installments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Calendário de Parcelas ({data.installments.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'expenses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Custos do Negócio ({data.expenses.length})
        </button>
      </div>

      {/* TAB 1: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar cobranças ou clientes..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Título / Cliente</th>
                    <th className="p-3.5">Valor Total</th>
                    <th className="p-3.5">Recebido</th>
                    <th className="p-3.5">Pendente</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const client = data.clients.find((c) => c.id === p.clientId);
                    const statusCfg = STATUS_LABELS[p.status] || {
                      label: p.status,
                      color: 'bg-slate-100 text-slate-700',
                    };

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{p.title}</p>
                          <p className="text-[11px] text-slate-500">{client?.companyName}</p>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {formatCurrency(p.totalAmount)}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-600">
                          {formatCurrency(p.receivedAmount)}
                        </td>
                        <td className="p-3.5 font-bold text-amber-600">
                          {formatCurrency(p.pendingAmount)}
                        </td>
                        <td className="p-3.5 uppercase font-semibold text-slate-600">
                          {p.paymentMethod}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => setReceiptData({ payment: p })}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1"
                            title="Gerar Recibo"
                          >
                            <Receipt className="w-3 h-3" />
                            Recibo
                          </button>
                          <button
                            onClick={() => {
                              setPaymentToEdit(p);
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPaymentToDelete(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSTALLMENTS CALENDAR & ACTIONS */}
      {activeTab === 'installments' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
            <span>
              Ao marcar uma parcela como <strong>Paga</strong>, o sistema atualiza
              automaticamente o saldo recebido do cliente e registra a data do pagamento.
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Parcela</th>
                    <th className="p-3.5">Cliente / Cobrança</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Vencimento</th>
                    <th className="p-3.5">Data do Pagamento</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.installments.map((inst) => {
                    const payment = data.payments.find((p) => p.id === inst.paymentId);
                    const client = payment ? data.clients.find((c) => c.id === payment.clientId) : null;
                    const today = new Date().toISOString().split('T')[0];
                    const isOverdue = inst.status !== 'paid' && inst.dueDate < today;

                    return (
                      <tr
                        key={inst.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isOverdue ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="p-3.5 font-bold text-slate-800">Parcela {inst.number}</td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{payment?.title || 'Cobrança'}</p>
                          <p className="text-[11px] text-slate-500">{client?.companyName}</p>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{formatCurrency(inst.amount)}</td>
                        <td className="p-3.5">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {formatDate(inst.dueDate)}
                            {isOverdue && ' (Atrasada!)'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {inst.paidDate || inst.paidAt ? formatDate(inst.paidDate || inst.paidAt || '') : '—'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              inst.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inst.status === 'paid' ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          {inst.status !== 'paid' ? (
                            <button
                              onClick={() => markInstallmentPaid(inst.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                            >
                              Marcar como Paga
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (payment) {
                                  setReceiptData({ payment, installment: inst });
                                }
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3" />
                              Ver Recibo
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS EXPENSES (Section 11) */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Add expense form */}
          <form
            onSubmit={handleAddExpense}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800">
              Cadastrar Ferramenta ou Custo Fixo do Negócio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nome da Ferramenta / Custo
                </label>
                <input
                  type="text"
                  required
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  placeholder="Ex: Assinatura Figma Pro, Hospedagem Hostinger..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Periodicidade
                </label>
                <select
                  value={newExpensePeriodicity}
                  onChange={(e) =>
                    setNewExpensePeriodicity(e.target.value as Expense['periodicity'])
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium"
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                  <option value="one_time">Única Vez</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Custo
              </button>
            </div>
          </form>

          {/* Expenses list */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Custos Fixos e Ferramentas Cadastradas
              </span>
              <span className="text-xs font-bold text-slate-600">
                Custo Mensal Estimado: {formatCurrency(financials.totalRecurringExpenses)}/mês
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900">{expense.title}</p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {expense.category} • Recorrência:{' '}
                      {expense.periodicity === 'monthly'
                        ? 'Mensal'
                        : expense.periodicity === 'yearly'
                        ? 'Anual'
                        : 'Única vez'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800">
                      {formatCurrency(expense.amount)}
                      {expense.periodicity === 'monthly' && '/mês'}
                      {expense.periodicity === 'yearly' && '/ano'}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentToEdit(null);
        }}
        onSave={handleSavePayment}
        paymentToEdit={paymentToEdit}
      />

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setReceiptData(null)}
          payment={receiptData.payment}
          installment={receiptData.installment}
          client={data.clients.find((c) => c.id === receiptData.payment.clientId)}
          settings={data.settings}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Excluir Cobrança"
        message={`Deseja realmente excluir a cobrança "${paymentToDelete?.title}"?`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (paymentToDelete) {
            await deletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
