import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Play,
  Pause,
  Square,
  Clock,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import { GlobalSearchModal } from './GlobalSearchModal.tsx';
import { formatDuration } from '../utils/formatters.ts';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenGlobalSearch }) => {
  const {
    data,
    unreadNotificationsCount,
    timerState,
    pauseTimer,
    startTimer,
    stopAndSaveTimer,
    setActiveTab,
    toggleTheme,
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isDarkMode = data.settings?.theme === 'dark';
  const notesCount = (data.personalNotes || []).length;

  // Format timer seconds into HH:MM:SS
  const formatTimerDigits = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors">
        {/* Left: Mobile Toggle & Global Search Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => (onOpenGlobalSearch ? onOpenGlobalSearch() : setIsSearchOpen(true))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-300 text-xs font-medium transition-all w-44 sm:w-72 border border-slate-200/60 dark:border-slate-700"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="truncate">Pesquisar no sistema...</span>
            <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Active Timer Pill + Quick Observações + Theme Toggle + Notification Bell + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Active Timer Pill if running or has elapsed time */}
          {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-xs animate-pulse-subtle">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider leading-none">
                  {timerState.isRunning ? 'Cronômetro Ativo' : 'Pausado'}
                </p>
                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-100 font-mono leading-tight">
                  {formatTimerDigits(timerState.elapsedSeconds)}
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-100 font-mono md:hidden">
                {formatTimerDigits(timerState.elapsedSeconds)}
              </div>

              <div className="flex items-center gap-1 ml-1">
                {timerState.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    title="Pausar"
                    className="p-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5 fill-indigo-700 dark:fill-indigo-300" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      startTimer(timerState.clientId, timerState.projectId, timerState.activity)
                    }
                    title="Continuar"
                    className="p-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700 dark:fill-indigo-300" />
                  </button>
                )}
                <button
                  onClick={stopAndSaveTimer}
                  title="Finalizar e Salvar Registro de Horas"
                  className="p-1 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-emerald-700 dark:fill-emerald-300" />
                </button>
              </div>
            </div>
          )}

          {/* Quick link to Timer tab if not running */}
          {!timerState.isRunning && timerState.elapsedSeconds === 0 && (
            <button
              onClick={() => setActiveTab('time')}
              title="Abrir Cronômetro"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            >
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Cronômetro</span>
            </button>
          )}

          {/* Observações Quick Button */}
          <button
            onClick={() => setActiveTab('notes')}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Minhas Observações & Mensagens Pessoais"
          >
            <StickyNote className="w-5 h-5" />
            {notesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {notesCount > 9 ? '9+' : notesCount}
              </span>
            )}
          </button>

          {/* Device Saved Status Pill */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/60 dark:border-emerald-800/60 select-none"
            title="Todas as informações estão salvas no seu dispositivo (armazenamento local) e permanecem após recarregar (F5) ou fechar a página."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Salvo no dispositivo</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema de cores"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Notificações e Alertas"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          {/* User Profile Pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            title="Configurações e Perfil"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {data.settings.userName.charAt(0) || 'G'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {data.settings.userName || 'Meu Negócio'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                {data.settings.companyName || 'Freelancer'}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
