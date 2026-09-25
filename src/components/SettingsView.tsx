import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  User,
  Building2,
  Mail,
  Phone,
  Key,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BusinessSettings } from '../types/index.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

export const SettingsView: React.FC = () => {
  const { data, updateSettings, exportDataJSON, importDataJSON, resetToDefaults, resetToDemoData, clearAllData } = useApp();

  const [formData, setFormData] = useState<BusinessSettings>({
    ...data.settings,
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importDataJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Configurações do Freelancer & Sistema
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Personalize dados da sua empresa, chave PIX para recibos, metas financeiras e backup de dados.
        </p>
      </div>

      {isSavedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Configurações salvas e atualizadas com sucesso!
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile & Business info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Dados da Empresa e Cobrança
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nome do Freelancer / Profissional *
              </label>
              <input
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nome da Agência / Marca
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ex: CS Web Studio"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@csstudio.com.br"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp / Telefone para Contato
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-8888"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Chave PIX Oficial (usada para gerar recibos e propostas)
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="Ex: CNPJ, Chave Aleatória ou E-mail PIX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Targets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Metas Financeiras e Produtividade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meta de Faturamento Mensal (R$)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.monthlyRevenueGoal}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyRevenueGoal: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Exibida no termômetro do Dashboard principal
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meta de Valor por Hora Trabalhada (R$/h)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={formData.hourlyRateGoal}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRateGoal: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Utilizada como referência na Calculadora de Rentabilidade
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </form>

      {/* Backup & Persistence Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Backup, Exportação e Restauração de Dados
        </h3>
        <p className="text-xs text-slate-500">
          Seus dados já ficam salvos de forma persistente no servidor (`db.json`). Você também pode baixar uma cópia de segurança em formato JSON para seu computador ou restaurar dados antigos.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportDataJSON}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Backup Completo (JSON)
          </button>

          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Restaurar Backup de Arquivo
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ml-auto border border-rose-200"
          >
            <RefreshCw className="w-4 h-4" />
            Zerar Todos os Dados
          </button>

          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-indigo-200"
          >
            <RefreshCw className="w-4 h-4" />
            Carregar Dados Demonstrativos
          </button>
        </div>
      </div>

      {/* Confirm Clear All Data Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Zerar Todos os Dados?"
        message="Esta ação apagará todos os clientes, leads, projetos, pagamentos, tarefas, histórico e despesas, deixando o sistema 100% limpo para você cadastrar seus dados reais. Deseja continuar?"
        confirmLabel="Sim, Zerar Todos os Dados"
        onConfirm={async () => {
          await clearAllData();
          setIsClearModalOpen(false);
          setFormData({ ...data.settings });
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Confirm Load Demo Data Modal */}
      <ConfirmModal
        isOpen={isDemoModalOpen}
        title="Carregar Dados de Exemplo?"
        message="Deseja carregar a base de demonstração com clientes, projetos e finanças fictícias para teste?"
        confirmLabel="Sim, Carregar Exemplos"
        onConfirm={async () => {
          await resetToDemoData();
          setIsDemoModalOpen(false);
          setFormData({ ...data.settings });
        }}
        onCancel={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
