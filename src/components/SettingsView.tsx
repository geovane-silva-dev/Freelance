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
  Sun,
  Moon,
  Palette,
  Check,
  HardDrive,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BusinessSettings } from '../types/index.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

export const SettingsView: React.FC = () => {
  const {
    data,
    updateSettings,
    setTheme,
    lastSavedTimestamp,
    forceSaveToDevice,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    resetToDemoData,
    clearAllData,
  } = useApp();

  const [formData, setFormData] = useState<BusinessSettings>({
    ...data.settings,
    theme: data.settings?.theme || 'light',
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    setFormData((prev) => ({ ...prev, theme }));
    await setTheme(theme);
  };

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

  const formattedLastSaved = lastSavedTimestamp
    ? new Date(lastSavedTimestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Agora';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Configurações do Freelancer & Sistema
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Personalize dados da sua empresa, tema visual (Claro/Escuro), chave PIX para recibos, metas financeiras e armazenamento de dados.
        </p>
      </div>

      {isSavedToast && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Configurações salvas e atualizadas com sucesso no seu dispositivo!
        </div>
      )}

      {/* Device Storage Status Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Armazenamento Seguro no seu Dispositivo
          </h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ativo & Salvo no Navegador</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Todas as suas informações são salvas de forma imediata e permanente no armazenamento local deste dispositivo (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code>).
          Ao <strong>atualizar a página (F5)</strong> ou <strong>fechar o navegador</strong>, absolutamente nenhum dado é perdido.
        </p>

        {/* Current Stored Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Clientes Salvos</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{data.clients.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Projetos Salvos</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{data.projects.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Observações</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{(data.personalNotes || []).length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Tarefas</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{data.tasks.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Última gravação local confirmada: <strong className="text-slate-700 dark:text-slate-300">{formattedLastSaved}</strong>
          </span>
          <button
            type="button"
            onClick={forceSaveToDevice}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs w-fit"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Salvar Agora no Dispositivo
          </button>
        </div>
      </div>

      {/* Theme Selection Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Aparência e Tema da Aplicação
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Escolha entre o tema Claro ou Escuro. O tema escuro utiliza a paleta Slate do Tailwind para máximo conforto visual e legibilidade.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              formData.theme === 'light'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${
              formData.theme === 'light'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Modo Claro (Light)
                </span>
                {formData.theme === 'light' && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Visual nítido, ideal para ambientes bem iluminados com fundo branco e contraste suave.
              </p>
            </div>
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              formData.theme === 'dark'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${
              formData.theme === 'dark'
                ? 'bg-indigo-950 text-indigo-400 ring-1 ring-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Modo Escuro (Dark)
                </span>
                {formData.theme === 'dark' && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tons profundos de ardósia (Slate 900/950), ideal para trabalhar à noite e descansar a visão.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile & Business info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Dados da Empresa e Cobrança
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Freelancer / Profissional *
              </label>
              <input
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Agência / Marca
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ex: CS Web Studio"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@csstudio.com.br"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Telefone para Contato
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-8888"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chave PIX Oficial (usada para gerar recibos e propostas)
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="Ex: CNPJ, Chave Aleatória ou E-mail PIX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Targets */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Metas Financeiras e Produtividade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Exibida no termômetro do Dashboard principal
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Backup, Exportação e Restauração de Dados
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Você também pode baixar uma cópia de segurança em formato JSON para seu computador ou restaurar dados de um backup anterior.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportDataJSON}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Backup Completo (JSON)
          </button>

          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors">
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
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ml-auto border border-rose-200 dark:border-rose-800"
          >
            <RefreshCw className="w-4 h-4" />
            Zerar Todos os Dados
          </button>

          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-800"
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
        message="Esta ação apagará todos os clientes, leads, projetos, pagamentos, tarefas, histórico, anotações e despesas, deixando o sistema 100% limpo para você cadastrar seus dados reais. Deseja continuar?"
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
        message="Deseja carregar a base de demonstração com clientes, projetos, finanças e anotações fictícias para teste?"
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
