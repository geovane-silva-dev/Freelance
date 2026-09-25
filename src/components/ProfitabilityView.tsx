import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency } from '../utils/formatters.ts';

export const ProfitabilityView: React.FC = () => {
  const { data } = useApp();

  // Price Calculator inputs
  const [estimatedHours, setEstimatedHours] = useState<number>(20);
  const [desiredHourlyRate, setDesiredHourlyRate] = useState<number>(
    data.settings.hourlyRateGoal || 100
  );
  const [projectCosts, setProjectCosts] = useState<number>(150);
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(30);
  const [taxPercent, setTaxPercent] = useState<number>(6);

  // Automatic calculation of price suggestion:
  // Base labor cost = estimatedHours * desiredHourlyRate
  // Base with direct costs = laborCost + projectCosts
  // Margin markup = baseWithCosts * (1 + profitMargin / 100)
  // With taxes = marginMarkup / (1 - taxPercent / 100)
  const calculation = useMemo(() => {
    const laborCost = estimatedHours * desiredHourlyRate;
    const subtotal = laborCost + projectCosts;
    const withProfit = subtotal * (1 + profitMarginPercent / 100);
    const finalPrice = taxPercent < 100 ? withProfit / (1 - taxPercent / 100) : withProfit;

    const estimatedNetProfit = finalPrice - projectCosts - (finalPrice * taxPercent) / 100;
    const realHourlyGain = estimatedHours > 0 ? estimatedNetProfit / estimatedHours : 0;

    return {
      laborCost,
      subtotal,
      finalPrice: Math.round(finalPrice),
      estimatedNetProfit: Math.round(estimatedNetProfit),
      realHourlyGain: Math.round(realHourlyGain),
    };
  }, [estimatedHours, desiredHourlyRate, projectCosts, profitMarginPercent, taxPercent]);

  // Real projects analysis table
  const realProjectsAnalysis = useMemo(() => {
    return data.projects.map((proj) => {
      const client = data.clients.find((c) => c.id === proj.clientId);
      const hours = proj.actualHours > 0 ? proj.actualHours : proj.estimatedHours;
      const projectCost = proj.costs ?? proj.projectCost ?? 0;
      const profit = proj.profit || proj.chargedPrice - projectCost;
      const realHourlyRate = hours > 0 ? profit / hours : 0;

      let health: 'high' | 'medium' | 'low' = 'medium';
      if (realHourlyRate >= desiredHourlyRate) {
        health = 'high';
      } else if (realHourlyRate < desiredHourlyRate * 0.6) {
        health = 'low';
      }

      return {
        ...proj,
        clientName: client?.companyName || 'Cliente',
        hours,
        profit,
        realHourlyRate,
        health,
      };
    });
  }, [data.projects, data.clients, desiredHourlyRate]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Calculadora de Preço & Rentabilidade Real
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Descubra exatamente quanto cobrar por cada projeto e analise a rentabilidade real dos seus serviços.
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Parâmetros do Orçamento</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Horas Estimadas de Trabalho
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Tempo total no projeto</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meta de Valor por Hora (R$/h)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={desiredHourlyRate}
                  onChange={(e) => setDesiredHourlyRate(Math.max(10, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Sua hora ideal de trabalho</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Custos Diretos do Projeto (R$)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={projectCosts}
                  onChange={(e) => setProjectCosts(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Domínio, hospedagem, plugins, assets
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Margem de Lucro Adicional (%)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={profitMarginPercent}
                onChange={(e) => setProfitMarginPercent(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Margem de segurança/reserva</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Impostos / Taxas de Emissão / NF (%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                step="1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ex: MEI / Simples Nacional (geralmente 6%)
              </span>
            </div>
          </div>
        </div>

        {/* Suggestion & Breakdown Result Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-6 rounded-2xl border border-indigo-900 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Sugestão de Preço Final
            </div>

            <div className="mt-4">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                {formatCurrency(calculation.finalPrice)}
              </p>
              <p className="text-xs text-indigo-200 mt-1">
                Preço ideal recomendado para este escopo
              </p>
            </div>

            <div className="mt-6 space-y-2.5 text-xs border-t border-white/10 pt-4 text-slate-300">
              <div className="flex justify-between">
                <span>Custo de Mão de Obra ({estimatedHours}h):</span>
                <span className="font-semibold text-white">
                  {formatCurrency(calculation.laborCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Custos Diretos do Projeto:</span>
                <span className="font-semibold text-white">{formatCurrency(projectCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro Líquido Real Estimado:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(calculation.estimatedNetProfit)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span>Ganho Real por Hora Trabalhada:</span>
                <span className="font-black text-white">
                  {formatCurrency(calculation.realHourlyGain)}/h
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white/10 text-[11px] text-indigo-200 leading-snug">
            Cobrando este valor, você garante sua meta de {formatCurrency(desiredHourlyRate)}/h com folga para imprevistos e custos.
          </div>
        </div>
      </div>

      {/* Real Projects Historical Profitability Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rentabilidade Real dos Projetos Cadastrados
            </h3>
            <p className="text-xs text-slate-500">
              Comparativo entre preço cobrado, custos, horas reais gastas e o valor por hora efetivo.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Projeto / Cliente</th>
                <th className="p-3.5">Preço Cobrado</th>
                <th className="p-3.5">Custos</th>
                <th className="p-3.5">Lucro Líquido</th>
                <th className="p-3.5">Horas Gastas</th>
                <th className="p-3.5">Valor Real da Hora</th>
                <th className="p-3.5">Saúde Financeira</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {realProjectsAnalysis.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.clientName}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">
                    {formatCurrency(p.chargedPrice)}
                  </td>
                  <td className="p-3.5 text-slate-600">{formatCurrency(p.costs)}</td>
                  <td className="p-3.5 font-bold text-emerald-700">
                    {formatCurrency(p.profit)}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{p.hours}h</td>
                  <td className="p-3.5 font-black text-indigo-700 text-sm">
                    {formatCurrency(p.realHourlyRate)}/h
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.health === 'high'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.health === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.health === 'high'
                        ? 'Excelente Rentabilidade'
                        : p.health === 'medium'
                        ? 'Rentabilidade Média'
                        : 'Abaixo da Meta'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
