import React from 'react';
import { Bell, AlertCircle, AlertTriangle, Clock, Calendar, CheckSquare, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatDate } from '../utils/formatters.ts';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, setActiveTab } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: 'warning' | 'info' | 'urgent', title: string) => {
    if (title.includes('Parcela')) return <AlertCircle className="w-4 h-4 text-rose-500" />;
    if (title.includes('Prazo')) return <Clock className="w-4 h-4 text-amber-500" />;
    if (title.includes('Follow-up')) return <Calendar className="w-4 h-4 text-blue-500" />;
    return <CheckSquare className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notificações e Alertas</h3>
          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full">
            {notifications.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tudo em dia!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nenhum pagamento atrasado ou prazo urgente pendente.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                setActiveTab(notif.linkTab);
                onClose();
              }}
              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 text-left"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5 flex-shrink-0">
                {getIcon(notif.type, notif.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(notif.date)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{notif.description}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                      notif.type === 'urgent'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : notif.type === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {notif.type === 'urgent' ? 'Urgente' : notif.type === 'warning' ? 'Atenção' : 'Lembrete'}
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Ver na aba {notif.linkTab} &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Alertas são gerados automaticamente com base nos prazos e vencimentos.
          </p>
        </div>
      )}
    </div>
  );
};
