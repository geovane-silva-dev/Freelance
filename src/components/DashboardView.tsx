import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Plus,
  Play,
  FileText,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

type PeriodFilter = 'today' | 'this_week' | 'this_month' | 'last_3_months' | 'this_year' | 'custom';

export const DashboardView: React.FC = () => {
  const { data, setActiveTab, startTimer } = useApp();
  const [period, setPeriod] = useState<PeriodFilter>('this_year');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeChartMetric, setActiveChartMetric] = useState<
    'revenue' | 'profit' | 'clients' | 'projects' | 'hours'
  >('revenue');

  // Filter dates logic
  const now = new Date();
  const currentYear = now.getFullYear();

  // Calculate KPIs based on chosen period or overall
  const kpis = useMemo(() => {
    // Total numbers
    const totalClients = data.clients.length;
    const activeClients = data.clients.filter(
      (c) => c.status === 'active_client' || c.status === 'project_in_progress'
    ).length;
    const awaitingConfirmation = data.clients.filter(
      (c) => c.status === 'awaiting_response' || c.status === 'negotiating'
    ).length;
    const lostClients = data.clients.filter((c) => c.status === 'lost_client').length;

    const inProgressProjects = data.projects.filter((p) => p.status === 'in_progress').length;
    const completedProjects = data.projects.filter((p) => p.status === 'completed').length;

    // Total billing = sum of total amounts in payments or charged price of projects
    const totalBilling = data.payments.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalReceived = data.payments.reduce((acc, p) => acc + p.receivedAmount, 0);
    const totalPending = data.payments.reduce((acc, p) => acc + p.pendingAmount, 0);
    const totalCosts = data.payments.reduce((acc, p) => acc + p.costs, 0);
    const totalProfit = totalReceived - totalCosts;

    // Hours
    const totalMinutes = data.timeLogs.reduce((acc, t) => acc + t.durationMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    // Ticket médio por cliente (com faturamento)
    const clientsWithBilling = new Set(data.payments.map((p) => p.clientId)).size;
    const averageTicket = clientsWithBilling > 0 ? totalBilling / clientsWithBilling : 0;

    // Average hourly rate
    const averageHourlyRate = totalHours > 0 ? totalProfit / totalHours : 0;

    return {
      totalBilling,
      totalReceived,
      totalPending,
      totalCosts,
      totalProfit,
      totalClients,
      activeClients,
      awaitingConfirmation,
      lostClients,
      inProgressProjects,
      completedProjects,
      totalHours,
      averageTicket,
      averageHourlyRate,
    };
  }, [data]);

  // Smart Highlights (Section 23)
  const smartInsights = useMemo(() => {
    const list: string[] = [];

    if (kpis.totalPending > 0) {
      list.push(`Você tem ${formatCurrency(kpis.totalPending)} a receber de pagamentos pendentes.`);
    }

    const awaitingCount = data.leads.filter(
      (l) => l.stage === 'awaiting_response' || l.stage === 'talking'
    ).length;
    if (awaitingCount > 0) {
      list.push(`${awaitingCount} cliente(s) em prospecção estão aguardando resposta.`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueNext7Days = data.installments.filter((inst) => {
      if (inst.status !== 'pending') return false;
      const due = new Date(inst.dueDate + 'T00:00:00');
      const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    });
    if (dueNext7Days.length > 0) {
      list.push(`${dueNext7Days.length} parcela(s) vencem nos próximos 7 dias.`);
    }

    if (kpis.inProgressProjects > 0) {
      list.push(`Você possui ${kpis.inProgressProjects} projeto(s) ativo(s) em andamento no momento.`);
    }

    if (kpis.averageHourlyRate > 0) {
      list.push(`Seu valor médio por hora trabalhada atual é de ${formatCurrency(kpis.averageHourlyRate)}/h.`);
    }

    return list;
  }, [kpis, data]);

  // Monthly breakdown for charts (Jan to Dec of current year)
  const monthlyData = useMemo(() => {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const result = months.map((monthName, idx) => ({
      month: monthName,
      monthIndex: idx,
      revenue: 0,
      profit: 0,
      clients: 0,
      projects: 0,
      hours: 0,
    }));

    // Payments
    data.payments.forEach((pay) => {
      const d = new Date(pay.createdAt);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (result[m]) {
          result[m].revenue += pay.receivedAmount;
          result[m].profit += pay.profit;
        }
      }
    });

    // Clients acquired
    data.clients.forEach((cli) => {
      const d = new Date(cli.createdAt);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (result[m]) result[m].clients += 1;
      }
    });

    // Projects completed
    data.projects.forEach((proj) => {
      if (proj.status === 'completed' && proj.completionDate) {
        const d = new Date(proj.completionDate);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (result[m]) result[m].projects += 1;
        }
      }
    });

    // Hours worked
    data.timeLogs.forEach((log) => {
      const d = new Date(log.date);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (result[m]) {
          result[m].hours += Number((log.durationMinutes / 60).toFixed(1));
        }
      }
    });

    return result;
  }, [data, currentYear]);

  // Follow-ups pending
  const pendingFollowUps = useMemo(() => {
    return data.leads
      .filter((l) => l.nextContactDate && l.stage !== 'closed' && l.stage !== 'lost')
      .sort((a, b) => (a.nextContactDate > b.nextContactDate ? 1 : -1))
      .slice(0, 5);
  }, [data.leads]);

  // Max value for active chart scale
  const maxChartValue = useMemo(() => {
    const values = monthlyData.map((d) => d[activeChartMetric]);
    const max = Math.max(...values, 1);
    return max;
  }, [monthlyData, activeChartMetric]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Bar: Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard do Meu Negócio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visão completa do faturamento, clientes, projetos e métricas de desempenho.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('this_week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === 'this_week' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === 'this_month' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Este mês
          </button>
          <button
            onClick={() => setPeriod('last_3_months')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === 'last_3_months' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => setPeriod('this_year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === 'this_year' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Este ano
          </button>
        </div>
      </div>

      {/* Intelligent Smart Highlights (Section 23) */}
      {smartInsights.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-lg border border-indigo-950">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Insights e Alertas Automáticos
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {smartInsights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-200 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span className="leading-snug">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Financial & Project Metric Cards (Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Faturamento Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Faturamento Total</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(kpis.totalBilling)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <span>Recebido: {formatCurrency(kpis.totalReceived)}</span>
          </div>
        </div>

        {/* Lucro Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Lucro Total</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(kpis.totalProfit)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Custos: {formatCurrency(kpis.totalCosts)}</span>
          </div>
        </div>

        {/* Valor a Receber */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Valor a Receber</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">
            {formatCurrency(kpis.totalPending)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Parcelas futuras e pendentes</span>
          </div>
        </div>

        {/* Ticket Médio por Cliente */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ticket Médio</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(kpis.averageTicket)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Média por cliente fechado</span>
          </div>
        </div>

        {/* Total de Clientes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total de Clientes</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{kpis.totalClients}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Cadastrados no CRM</span>
          </div>
        </div>

        {/* Clientes Ativos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Clientes Ativos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{kpis.activeClients}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Com projetos ou contrato</span>
          </div>
        </div>

        {/* Projetos em Andamento */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Projetos em Andamento</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-600">
            {kpis.inProgressProjects}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Em desenvolvimento</span>
          </div>
        </div>

        {/* Projetos Concluídos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Projetos Concluídos</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {kpis.completedProjects}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Sites e LPs entregues</span>
          </div>
        </div>

        {/* Clientes Aguardando Confirmação */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Aguardando Resposta</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">
            {kpis.awaitingConfirmation}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Em fase de negociação</span>
          </div>
        </div>

        {/* Clientes Perdidos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Clientes Não Fechados</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600">{kpis.lostClients}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Leads não convertidos</span>
          </div>
        </div>

        {/* Total de Horas Trabalhadas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Horas Trabalhadas</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{kpis.totalHours}h</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Total registrado no app</span>
          </div>
        </div>

        {/* Valor Médio por Hora */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ganho / Hora Real</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">
            {formatCurrency(kpis.averageHourlyRate)}/h
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Meta: {formatCurrency(data.settings.hourlyRateGoal)}/h</span>
          </div>
        </div>
      </div>

      {/* Gráficos Interativos (Section 1: Faturamento, Lucro, Clientes, Projetos, Horas) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Evolução Mensal ({currentYear})</h3>
            <p className="text-xs text-slate-500">
              Visualize faturamento, lucro, novos clientes, entregas e horas mês a mês.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeChartMetric === 'revenue'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faturamento
            </button>
            <button
              onClick={() => setActiveChartMetric('profit')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeChartMetric === 'profit'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lucro
            </button>
            <button
              onClick={() => setActiveChartMetric('clients')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeChartMetric === 'clients'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes Conquistados
            </button>
            <button
              onClick={() => setActiveChartMetric('projects')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeChartMetric === 'projects'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Projetos Concluídos
            </button>
            <button
              onClick={() => setActiveChartMetric('hours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeChartMetric === 'hours'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horas Trabalhadas
            </button>
          </div>
        </div>

        {/* Custom Responsive SVG Chart */}
        <div className="pt-6">
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {monthlyData.map((item, idx) => {
              const val = item[activeChartMetric];
              const heightPercent = maxChartValue > 0 ? Math.round((val / maxChartValue) * 85) : 0;
              const isCurrentMonth = idx === now.getMonth();

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[11px] font-medium py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                    {item.month}:{' '}
                    {activeChartMetric === 'revenue' || activeChartMetric === 'profit'
                      ? formatCurrency(val)
                      : activeChartMetric === 'hours'
                      ? `${val}h`
                      : `${val} item(s)`}
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[42px] h-48 flex items-end justify-center bg-slate-50 rounded-xl overflow-hidden p-1">
                    <div
                      style={{ height: val > 0 ? `${Math.max(heightPercent, 6)}%` : '4px' }}
                      className={`w-full rounded-lg transition-all duration-300 ${
                        val === 0
                          ? 'bg-slate-200'
                          : activeChartMetric === 'revenue'
                          ? 'bg-emerald-500 group-hover:bg-emerald-600'
                          : activeChartMetric === 'profit'
                          ? 'bg-blue-500 group-hover:bg-blue-600'
                          : activeChartMetric === 'hours'
                          ? 'bg-purple-500 group-hover:bg-purple-600'
                          : 'bg-indigo-500 group-hover:bg-indigo-600'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[11px] mt-2 font-semibold ${
                      isCurrentMonth ? 'text-indigo-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Section: Follow-ups / Prospecção & Projetos em Andamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lembretes de Follow-up de Clientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Lembretes de Follow-up de Leads</h3>
            </div>
            <button
              onClick={() => setActiveTab('kanban')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver Funil Kanban &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {pendingFollowUps.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhum follow-up pendente agendado no momento.
              </p>
            ) : (
              pendingFollowUps.map((lead) => (
                <div key={lead.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{lead.company}</p>
                    <p className="text-[11px] text-slate-500">
                      Contato: {lead.name} • {lead.niche}
                    </p>
                    {lead.followUpReminder && (
                      <p className="text-xs text-slate-600 mt-1 bg-amber-50 text-amber-900 p-1.5 rounded-lg border border-amber-200/60 font-medium">
                        &ldquo;{lead.followUpReminder}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700">
                      {formatDate(lead.nextContactDate)}
                    </span>
                    {lead.whatsapp && (
                      <a
                        href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-1 text-[11px] text-emerald-600 hover:underline font-semibold"
                      >
                        Abrir WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projetos em Andamento com Barra de Progresso */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Projetos em Andamento</h3>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Todos os Projetos &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-3.5">
            {data.projects.filter((p) => p.status === 'in_progress').length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhum projeto em andamento no momento.
              </p>
            ) : (
              data.projects
                .filter((p) => p.status === 'in_progress')
                .map((proj) => {
                  const client = data.clients.find((c) => c.id === proj.clientId);
                  return (
                    <div key={proj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{proj.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            Cliente: {client?.companyName} • Prazo: {formatDate(proj.deliveryDeadline)}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{proj.progress}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span>Horas gastas: {proj.actualHours}h / {proj.estimatedHours}h est.</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(proj.chargedPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
