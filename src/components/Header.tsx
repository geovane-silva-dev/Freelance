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
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Format timer seconds into HH:MM:SS
  const formatTimerDigits = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeProject = data.projects.find((p) => p.id === timerState.projectId);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Toggle & Global Search Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => (onOpenGlobalSearch ? onOpenGlobalSearch() : setIsSearchOpen(true))}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-500 text-xs font-medium transition-all w-44 sm:w-72 border border-slate-200/60"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">Pesquisar no sistema...</span>
            <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Active Timer Pill + Notification Bell + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Timer Pill if running or has elapsed time */}
          {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-xs animate-pulse-subtle">
              <Clock className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider leading-none">
                  {timerState.isRunning ? 'Cronômetro Ativo' : 'Pausado'}
                </p>
                <p className="text-xs font-bold text-indigo-950 font-mono leading-tight">
                  {formatTimerDigits(timerState.elapsedSeconds)}
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-950 font-mono md:hidden">
                {formatTimerDigits(timerState.elapsedSeconds)}
              </div>

              <div className="flex items-center gap-1 ml-1">
                {timerState.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    title="Pausar"
                    className="p-1 rounded-lg hover:bg-indigo-200 text-indigo-700 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5 fill-indigo-700" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      startTimer(timerState.clientId, timerState.projectId, timerState.activity)
                    }
                    title="Continuar"
                    className="p-1 rounded-lg hover:bg-indigo-200 text-indigo-700 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                  </button>
                )}
                <button
                  onClick={stopAndSaveTimer}
                  title="Finalizar e Salvar Registro de Horas"
                  className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-700 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-emerald-700" />
                </button>
              </div>
            </div>
          )}

          {/* Quick link to Timer tab if not running */}
          {!timerState.isRunning && timerState.elapsedSeconds === 0 && (
            <button
              onClick={() => setActiveTab('time')}
              title="Abrir Cronômetro"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors text-xs font-semibold"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Cronômetro</span>
            </button>
          )}

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notificações e Alertas"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
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
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            title="Configurações e Perfil"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {data.settings.userName.charAt(0) || 'G'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {data.settings.userName || 'Meu Negócio'}
              </p>
              <p className="text-[10px] text-slate-500 leading-none">
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
