import React from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  FolderKanban,
  Globe,
  DollarSign,
  Clock,
  TrendingUp,
  CheckSquare,
  Calendar,
  FileText,
  Briefcase,
  StickyNote,
  BarChart3,
  Settings,
  X,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ActiveTab } from '../types/index.ts';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, data, toggleTheme } = useApp();

  const isDarkMode = data.settings?.theme === 'dark';

  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users, badge: data.clients.length },
    {
      id: 'kanban',
      label: 'Prospecção (Funil)',
      icon: Kanban,
      badge: data.leads.filter((l) => l.stage !== 'closed' && l.stage !== 'lost').length,
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: FolderKanban,
      badge: data.projects.filter((p) => p.status === 'in_progress').length,
    },
    { id: 'portfolio', label: 'Portfólio', icon: Globe, badge: data.portfolio.length },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'time', label: 'Controle de Tempo', icon: Clock },
    { id: 'profitability', label: 'Rentabilidade', icon: TrendingUp },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: data.tasks.filter((t) => !t.completed).length },
    { id: 'calendar', label: 'Calendário', icon: Calendar, badge: data.events.length },
    {
      id: 'proposals',
      label: 'Propostas',
      icon: FileText,
      badge: data.proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length,
    },
    { id: 'services', label: 'Serviços', icon: Briefcase, badge: data.services.length },
    {
      id: 'notes',
      label: 'Observações',
      icon: StickyNote,
      badge: (data.personalNotes || []).length > 0 ? (data.personalNotes || []).length : undefined,
    },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 dark:border-slate-900 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 dark:border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelect('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                {data.settings.companyName || 'FreelanceHub'}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">CRM & Projetos Web</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Principal
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Freelancer Footer Info & Theme Toggle */}
        <div className="p-3 border-t border-slate-800 dark:border-slate-900 bg-slate-950/40 space-y-2">
          {/* Quick theme toggle */}
          <div className="flex items-center justify-between px-2 py-1 text-xs">
            <span className="text-[11px] font-medium text-slate-400">
              Tema {isDarkMode ? 'Escuro' : 'Claro'}
            </span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
              title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Escuro</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {data.settings.userName.charAt(0) || 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{data.settings.userName}</p>
              <p className="text-[10px] text-slate-400 truncate">Freelancer Profissional</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
