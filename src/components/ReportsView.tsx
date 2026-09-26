import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Clock,
  Award,
  PieChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency } from '../utils/formatters.ts';

export const ReportsView: React.FC = () => {
  const { data } = useApp();

  const metrics = useMemo(() => {
    // Total Revenue & Profit
    const totalReceived = data.payments.reduce((acc, p) => acc + p.receivedAmount, 0);
    const totalCosts =
      data.payments.reduce((acc, p) => acc + (p.costs || 0), 0) +
      (data.expenses || []).reduce((acc: number, e) => acc + e.amount, 0);
    const netProfit = totalReceived - totalCosts;

    // Proposals conversion rate
    const totalProposals = data.proposals.length;
    const approvedProposals = data.proposals.filter(
      (p) => p.status === 'approved' || p.status === 'accepted'
    ).length;
    const conversionRate =
      totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0;

    // Average hours per completed project
    const completedProjects = data.projects.filter((p) => p.status === 'completed');
    const totalCompletedHours = completedProjects.reduce(
      (acc, p) => acc + (p.actualHours || p.estimatedHours),
      0
    );
    const averageHoursPerProject =
      completedProjects.length > 0
        ? (totalCompletedHours / completedProjects.length).toFixed(1)
        : '0';

    // Best clients by revenue
    const clientRevenueMap: Record<string, { companyName: string; totalPaid: number }> = {};
    data.payments.forEach((p) => {
      const client = data.clients.find((c) => c.id === p.clientId);
      if (client) {
        if (!clientRevenueMap[client.id]) {
          clientRevenueMap[client.id] = {
            companyName: client.companyName,
            totalPaid: 0,
          };
        }
        clientRevenueMap[client.id].totalPaid += p.receivedAmount;
      }
    });

    const topClients = Object.values(clientRevenueMap)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // Revenue by service type
    const serviceTypeMap: Record<string, { count: number; totalRevenue: number }> = {};
    data.projects.forEach((proj) => {
      const type = proj.serviceType || 'Outro';
      if (!serviceTypeMap[type]) {
        serviceTypeMap[type] = { count: 0, totalRevenue: 0 };
      }
      serviceTypeMap[type].count += 1;
      serviceTypeMap[type].totalRevenue += proj.chargedPrice;
    });

    const serviceBreakdown = Object.entries(serviceTypeMap).map(([type, stats]) => ({
      type,
      ...stats,
    }));

    // Monthly distribution
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyStats = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      // Estimate revenue for month
      const monthRevenue = data.payments.reduce((acc, p) => {
        const pDate = new Date(p.createdAt);
        if (pDate.getMonth() === monthIdx && pDate.getFullYear() === year) {
          return acc + p.receivedAmount;
        }
        return acc;
      }, 0);

      return {
        month: `${monthNames[monthIdx]}/${String(year).slice(2)}`,
        revenue: monthRevenue,
      };
    });

    const maxMonthly = Math.max(...monthlyStats.map((m) => m.revenue), 1000);

    return {
      totalReceived,
      totalCosts,
      netProfit,
      conversionRate,
      totalProposals,
      approvedProposals,
      averageHoursPerProject,
      topClients,
      serviceBreakdown,
      monthlyStats,
      maxMonthly,
    };
  }, [data.payments, data.expenses, data.proposals, data.projects, data.clients]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Relatórios & Métricas do Negócio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Inteligência analítica sobre seu faturamento, taxa de conversão de orçamentos e serviços mais lucrativos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Faturado</span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(metrics.totalReceived)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Receitas brutas recebidas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Lucro Líquido Real</span>
          <p className="text-xl font-black text-indigo-600 mt-1">
            {formatCurrency(metrics.netProfit)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Descontados todos os custos
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Conversão de Orçamentos</span>
          <p className="text-xl font-black text-slate-900 mt-1">{metrics.conversionRate}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.approvedProposals} de {metrics.totalProposals} propostas aprovadas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Tempo Médio / Projeto</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {metrics.averageHoursPerProject}h
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Nos projetos finalizados</span>
        </div>
      </div>

      {/* Monthly Bar Chart & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Evolution Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Evolução Mensal de Faturamento
              </h3>
              <span className="text-xs text-slate-400">Últimos 6 meses</span>
            </div>

            <div className="mt-6 flex items-end justify-between h-48 gap-3 pt-6 px-2">
              {metrics.monthlyStats.map((item, i) => {
                const heightPercent =
                  metrics.maxMonthly > 0 && item.revenue > 0
                    ? Math.round((item.revenue / metrics.maxMonthly) * 100)
                    : 0;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      {formatCurrency(item.revenue)}
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                        item.revenue > 0
                          ? 'bg-indigo-600 group-hover:bg-indigo-700'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: item.revenue > 0 ? `${Math.max(heightPercent, 8)}%` : '4px' }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Média mensal de faturamento:</span>
            <strong className="text-slate-800">
              {formatCurrency(
                metrics.monthlyStats.reduce((acc, m) => acc + m.revenue, 0) /
                  metrics.monthlyStats.length
              )}
              /mês
            </strong>
          </div>
        </div>

        {/* Top Clients by LTV */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Clientes Mais Lucrativos (LTV)
              </h3>
              <span className="text-xs text-slate-400">Ranking</span>
            </div>

            <div className="mt-4 space-y-3">
              {metrics.topClients.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum cliente faturado ainda.</p>
              ) : (
                metrics.topClients.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{c.companyName}</p>
                        <span className="text-[10px] text-slate-400">Receita acumulada</span>
                      </div>
                    </div>
                    <span className="font-black text-emerald-700 text-sm">
                      {formatCurrency(c.totalPaid)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Performance Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            Performance por Tipo de Serviço
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {metrics.serviceBreakdown.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[11px] font-bold text-indigo-600 block uppercase tracking-wider">
                {s.type}
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(s.totalRevenue)}
              </p>
              <span className="text-slate-500 text-[11px] mt-1 block">
                {s.count} projeto(s) contratado(s)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
