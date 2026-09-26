import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DatabaseSchema,
  Client,
  Lead,
  Project,
  PortfolioItem,
  Payment,
  Installment,
  Expense,
  TimeLog,
  Task,
  Proposal,
  Service,
  ServicePackage,
  CalendarEvent,
  ClientHistory,
  AttachedFile,
  UserSettings,
  ActiveTab,
  LeadStage,
  ClientStatus,
  ProjectStatus,
  PersonalNote,
} from '../types/index.ts';
import { initialDatabase, demoDatabase } from '../services/initialData.ts';
import { getLocalDateString } from '../utils/formatters.ts';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'urgent';
  date: string;
  linkTab: ActiveTab;
  relatedId?: string;
}

interface AppContextType {
  data: DatabaseSchema;
  isLoading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Active Timer state
  timerState: {
    isRunning: boolean;
    startTime: number | null;
    elapsedSeconds: number;
    clientId: string;
    projectId: string;
    activity: string;
  };
  startTimer: (clientId: string, projectId: string, activity: string) => void;
  pauseTimer: () => void;
  stopAndSaveTimer: () => Promise<void>;
  resetTimer: () => void;

  // Toast system
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // CRUD Actions
  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Leads / Kanban
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  moveLeadStage: (id: string, newStage: LeadStage) => Promise<void>;
  convertLeadToClient: (leadId: string, createProject?: boolean) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'actualHours'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  completeProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Portfolio
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<PortfolioItem>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;

  // Financial & Payments
  addPaymentWithInstallments: (
    payment: Omit<Payment, 'id' | 'createdAt' | 'receivedAmount' | 'pendingAmount' | 'profit' | 'status' | 'installments'>,
    installments: Omit<Installment, 'id' | 'paymentId' | 'status'>[]
  ) => Promise<Payment>;
  addPayment: (payment: any, customInstallments?: any) => Promise<any>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  markInstallmentPaid: (installmentId: string, paymentMethod?: string) => Promise<void>;
  addCustomInstallment: (paymentId: string, installment: Omit<Installment, 'id' | 'paymentId'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Time tracking
  addTimeLog: (log: Omit<TimeLog, 'id' | 'createdAt'>) => Promise<TimeLog>;
  addManualTimeLog: (log: { clientId: string; projectId: string; durationMinutes: number; activity: string; date: string }) => Promise<TimeLog>;
  deleteTimeLog: (id: string) => Promise<void>;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Proposals
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => Promise<Proposal>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
  convertProposalToProject: (proposalId: string) => Promise<Project | null>;
  deleteProposal: (id: string) => Promise<void>;

  // Services
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addServicePackage: (pkg: Omit<ServicePackage, 'id'>) => Promise<ServicePackage>;
  updateServicePackage: (id: string, updates: Partial<ServicePackage>) => Promise<void>;
  deleteServicePackage: (id: string) => Promise<void>;

  // Calendar Events
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // Client History & Notes
  addClientHistoryNote: (clientId: string, content: string) => Promise<void>;
  deleteClientHistoryItem: (id: string) => Promise<void>;

  // Files
  addFileAttachment: (file: Omit<AttachedFile, 'id' | 'uploadDate'>) => Promise<AttachedFile>;
  deleteFileAttachment: (id: string) => Promise<void>;

  // Personal Notes & Observações
  addPersonalNote: (note: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PersonalNote>;
  updatePersonalNote: (id: string, updates: Partial<PersonalNote>) => Promise<void>;
  deletePersonalNote: (id: string) => Promise<void>;
  togglePinPersonalNote: (id: string) => Promise<void>;
  updateScratchpad: (content: string) => Promise<void>;

  // Settings, Theme & System Data
  lastSavedTimestamp: number | null;
  forceSaveToDevice: () => void;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportDataJson: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const DEVICE_STORAGE_KEY = 'freelancehub_device_storage_v1';
const BACKUP_STORAGE_KEY = 'freelancehub_backup';
const TIMESTAMP_STORAGE_KEY = 'freelancehub_device_timestamp';

function getInitialDeviceData(): DatabaseSchema {
  if (typeof window === 'undefined') return initialDatabase;
  try {
    const raw = localStorage.getItem(DEVICE_STORAGE_KEY) || localStorage.getItem(BACKUP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...initialDatabase,
          ...parsed,
          settings: {
            ...initialDatabase.settings,
            ...(parsed.settings || {}),
          },
          personalNotes: parsed.personalNotes || initialDatabase.personalNotes || [],
          scratchpad: parsed.scratchpad !== undefined ? parsed.scratchpad : (initialDatabase.scratchpad || ''),
        };
      }
    }
  } catch (err) {
    console.warn('Erro ao ler armazenamento local do dispositivo:', err);
  }
  return initialDatabase;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization directly from user's device storage so no data is ever lost on F5/refresh
  const [data, setData] = useState<DatabaseSchema>(getInitialDeviceData);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(() => {
    if (typeof window === 'undefined') return Date.now();
    const saved = localStorage.getItem(TIMESTAMP_STORAGE_KEY);
    return saved ? Number(saved) : Date.now();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Timer state
  const [timerState, setTimerState] = useState({
    isRunning: false,
    startTime: null as number | null,
    elapsedSeconds: 0,
    clientId: '',
    projectId: '',
    activity: '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Synchronize theme with document element
  useEffect(() => {
    const currentTheme = data.settings?.theme || 'light';
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings?.theme]);

  // Save to user device immediately with high reliability and sync to server backend
  const persistData = useCallback(async (newData: DatabaseSchema) => {
    const timestamp = Date.now();
    const dataWithMeta: DatabaseSchema = {
      ...newData,
      lastModified: new Date(timestamp).toISOString(),
    };

    // 1. Immediately update React state
    setData(dataWithMeta);
    setLastSavedTimestamp(timestamp);

    // 2. Synchronously write to device local storage
    try {
      const serialized = JSON.stringify(dataWithMeta);
      localStorage.setItem(DEVICE_STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
      localStorage.setItem(TIMESTAMP_STORAGE_KEY, timestamp.toString());
    } catch (err) {
      console.error('Falha ao gravar no armazenamento local do dispositivo:', err);
    }

    // 3. Asynchronously sync with server API (if available)
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithMeta),
      });
    } catch (err) {
      console.warn('Sincronização com o backend adiada, dados salvos com segurança no dispositivo:', err);
    }
  }, []);

  const forceSaveToDevice = useCallback(() => {
    const timestamp = Date.now();
    try {
      const serialized = JSON.stringify({
        ...data,
        lastModified: new Date(timestamp).toISOString(),
      });
      localStorage.setItem(DEVICE_STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
      localStorage.setItem(TIMESTAMP_STORAGE_KEY, timestamp.toString());
      setLastSavedTimestamp(timestamp);
      showToast('Dados salvos no seu dispositivo!', 'success');
    } catch {
      showToast('Erro ao gravar no dispositivo.', 'error');
    }
  }, [data, showToast]);

  // Synchronize initial data safely: NEVER overwrite populated device data with an empty server database
  useEffect(() => {
    async function syncDataWithServer() {
      let localData: DatabaseSchema | null = null;
      let localTimestamp = 0;
      try {
        const raw = localStorage.getItem(DEVICE_STORAGE_KEY) || localStorage.getItem(BACKUP_STORAGE_KEY);
        const rawTime = localStorage.getItem(TIMESTAMP_STORAGE_KEY);
        if (rawTime) localTimestamp = Number(rawTime);
        if (raw) localData = JSON.parse(raw);
      } catch {}

      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const json = await res.json();
          const serverData: DatabaseSchema = json.data || json;
          const serverTime = serverData?.lastModified ? new Date(serverData.lastModified).getTime() : 0;

          // Check if local device has active user records
          const localHasRecords = localData && (
            (localData.clients && localData.clients.length > 0) ||
            (localData.projects && localData.projects.length > 0) ||
            (localData.leads && localData.leads.length > 0) ||
            (localData.payments && localData.payments.length > 0) ||
            (localData.personalNotes && localData.personalNotes.length > 0) ||
            (localData.tasks && localData.tasks.length > 0) ||
            (localData.proposals && localData.proposals.length > 0) ||
            (localData.services && localData.services.length > 0) ||
            localTimestamp > 0
          );

          if (localData && localHasRecords && (!serverTime || localTimestamp >= serverTime)) {
            // Local device data is authoritative and newer!
            // Ensure server receives the local device data
            try {
              await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localData),
              });
            } catch {}
            setData(localData);
            setIsLoading(false);
            return;
          }

          if (serverData && serverData.clients) {
            const mergedData: DatabaseSchema = {
              ...initialDatabase,
              ...serverData,
              personalNotes: serverData.personalNotes || initialDatabase.personalNotes || [],
              scratchpad: serverData.scratchpad !== undefined ? serverData.scratchpad : (initialDatabase.scratchpad || ''),
              settings: {
                ...initialDatabase.settings,
                ...serverData.settings,
              },
            };
            setData(mergedData);
            try {
              const ser = JSON.stringify(mergedData);
              localStorage.setItem(DEVICE_STORAGE_KEY, ser);
              localStorage.setItem(BACKUP_STORAGE_KEY, ser);
              localStorage.setItem(TIMESTAMP_STORAGE_KEY, Date.now().toString());
            } catch {}
          }
        }
      } catch {
        // Offline: local device data is already active in memory!
        console.log('Operando com armazenamento local do dispositivo.');
      } finally {
        setIsLoading(false);
      }
    }

    syncDataWithServer();

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if ((e.key === DEVICE_STORAGE_KEY || e.key === BACKUP_STORAGE_KEY) && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setData(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Stopwatch ticking interval
  useEffect(() => {
    let interval: any = null;
    if (timerState.isRunning) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    } else if (!timerState.isRunning && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  const startTimer = (clientId: string, projectId: string, activity: string) => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      startTime: Date.now(),
      clientId: clientId || prev.clientId,
      projectId: projectId || prev.projectId,
      activity: activity || prev.activity || 'Desenvolvimento',
    }));
    showToast('Cronômetro iniciado!', 'info');
  };

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
    showToast('Cronômetro pausado', 'info');
  };

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      clientId: '',
      projectId: '',
      activity: '',
    });
  };

  // Automated notification calculation
  const notifications = useMemo<NotificationItem[]>(() => {
    const list: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Pending or overdue installments
    data.installments.forEach((inst) => {
      if (inst.status === 'pending') {
        const due = new Date(inst.dueDate + 'T00:00:00');
        const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const client = data.clients.find((c) => c.id === inst.clientId);
        const clientName = client ? client.companyName : 'Cliente';

        if (diffDays < 0) {
          list.push({
            id: `notif-overdue-${inst.id}`,
            title: `Parcela Atrasada (${clientName})`,
            description: `A parcela de R$ ${inst.amount} venceu há ${Math.abs(diffDays)} dia(s).`,
            type: 'urgent',
            date: inst.dueDate,
            linkTab: 'financial',
            relatedId: inst.paymentId,
          });
        } else if (diffDays <= 7) {
          list.push({
            id: `notif-due-soon-${inst.id}`,
            title: `Parcela a Vencer (${clientName})`,
            description: `Valor de R$ ${inst.amount} vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dia(s)`}.`,
            type: 'warning',
            date: inst.dueDate,
            linkTab: 'financial',
            relatedId: inst.paymentId,
          });
        }
      }
    });

    // 2. Projects approaching deadline
    data.projects.forEach((proj) => {
      if (proj.status !== 'completed' && proj.status !== 'cancelled') {
        const deadline = new Date(proj.deliveryDeadline + 'T00:00:00');
        const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          list.push({
            id: `notif-proj-late-${proj.id}`,
            title: `Prazo Excedido: ${proj.name}`,
            description: `Entrega atrasada em ${Math.abs(diffDays)} dia(s)!`,
            type: 'urgent',
            date: proj.deliveryDeadline,
            linkTab: 'projects',
            relatedId: proj.id,
          });
        } else if (diffDays <= 5) {
          list.push({
            id: `notif-proj-near-${proj.id}`,
            title: `Prazo Próximo: ${proj.name}`,
            description: `Entrega prevista em ${diffDays === 0 ? 'hoje' : `${diffDays} dia(s)`}.`,
            type: 'warning',
            date: proj.deliveryDeadline,
            linkTab: 'projects',
            relatedId: proj.id,
          });
        }
      }
    });

    // 3. Pending Follow-ups for leads
    data.leads.forEach((lead) => {
      if (lead.nextContactDate && lead.stage !== 'closed' && lead.stage !== 'lost') {
        const followDate = new Date(lead.nextContactDate + 'T00:00:00');
        const diffDays = Math.round((followDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          list.push({
            id: `notif-lead-fu-${lead.id}`,
            title: `Follow-up Pendente: ${lead.company}`,
            description: lead.followUpReminder || `Entrar em contato com ${lead.name}`,
            type: diffDays < 0 ? 'urgent' : 'info',
            date: lead.nextContactDate,
            linkTab: 'kanban',
            relatedId: lead.id,
          });
        }
      }
    });

    // 4. Incomplete tasks past due date
    data.tasks.forEach((tsk) => {
      if (!tsk.completed && tsk.dueDate) {
        const due = new Date(tsk.dueDate + 'T00:00:00');
        const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          list.push({
            id: `notif-tsk-late-${tsk.id}`,
            title: `Tarefa Atrasada: ${tsk.title}`,
            description: `Prevista para ${tsk.dueDate}`,
            type: 'warning',
            date: tsk.dueDate,
            linkTab: 'tasks',
            relatedId: tsk.id,
          });
        }
      }
    });

    return list;
  }, [data]);

  const unreadNotificationsCount = notifications.length;

  // ----------------------------------------------------------------
  // CLIENT ACTIONS
  // ----------------------------------------------------------------
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const id = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      firstContactDate: clientData.firstContactDate || getLocalDateString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: id,
      date: getLocalDateString(),
      type: 'auto_event',
      category: 'created',
      content: `Cliente "${newClient.companyName}" cadastrado no sistema. Origem: ${newClient.origin || 'Não informada'}.`,
      createdAt: new Date().toISOString(),
    };

    const nextData: DatabaseSchema = {
      ...data,
      clients: [newClient, ...data.clients],
      clientHistory: [newHistory, ...data.clientHistory],
    };

    await persistData(nextData);
    showToast(`Cliente "${newClient.companyName}" cadastrado com sucesso!`);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    let oldClient: Client | undefined;
    const updatedClients = data.clients.map((c) => {
      if (c.id === id) {
        oldClient = c;
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });

    let newHistory = [...data.clientHistory];
    if (updates.status && oldClient && updates.status !== oldClient.status) {
      newHistory.unshift({
        id: `ch-${Date.now()}`,
        clientId: id,
        date: getLocalDateString(),
        type: 'auto_event',
        category: 'status_change',
        content: `Status do cliente alterado para "${updates.status}".`,
        createdAt: new Date().toISOString(),
      });
    }

    const nextData: DatabaseSchema = {
      ...data,
      clients: updatedClients,
      clientHistory: newHistory,
    };
    await persistData(nextData);
    showToast('Dados do cliente atualizados!');
  };

  const deleteClient = async (id: string) => {
    const client = data.clients.find((c) => c.id === id);
    const nextData: DatabaseSchema = {
      ...data,
      clients: data.clients.filter((c) => c.id !== id),
      leads: data.leads.filter((l) => l.clientId !== id),
      projects: data.projects.filter((p) => p.clientId !== id),
      payments: data.payments.filter((p) => p.clientId !== id),
      installments: data.installments.filter((i) => i.clientId !== id),
      timeLogs: data.timeLogs.filter((t) => t.clientId !== id),
      tasks: data.tasks.filter((t) => t.clientId !== id),
      proposals: data.proposals.filter((p) => p.clientId !== id),
      clientHistory: data.clientHistory.filter((h) => h.clientId !== id),
      files: data.files.filter((f) => f.clientId !== id),
    };
    await persistData(nextData);
    showToast(`Cliente "${client?.companyName || ''}" excluído com sucesso!`, 'info');
  };

  // ----------------------------------------------------------------
  // LEADS / KANBAN ACTIONS
  // ----------------------------------------------------------------
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    const id = `lead-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id,
      createdAt: new Date().toISOString(),
    };

    let updatedEvents = [...data.events];
    if (newLead.nextContactDate) {
      updatedEvents.push({
        id: `ev-fu-${id}`,
        title: `Follow-up: ${newLead.company}`,
        date: newLead.nextContactDate,
        time: '14:00',
        type: 'follow_up',
        relatedId: id,
        description: newLead.followUpReminder || `Entrar em contato com ${newLead.name}`,
      });
    }

    const nextData: DatabaseSchema = {
      ...data,
      leads: [newLead, ...data.leads],
      events: updatedEvents,
    };
    await persistData(nextData);
    showToast(`Lead "${newLead.company}" adicionado ao funil!`);
    return newLead;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const updatedLeads = data.leads.map((l) => (l.id === id ? { ...l, ...updates } : l));
    const nextData: DatabaseSchema = { ...data, leads: updatedLeads };
    await persistData(nextData);
    showToast('Lead atualizado com sucesso!');
  };

  const moveLeadStage = async (id: string, newStage: LeadStage) => {
    const lead = data.leads.find((l) => l.id === id);
    if (!lead) return;

    let updatedClients = [...data.clients];
    let updatedHistory = [...data.clientHistory];

    // Automation: if moved to 'closed', update client status if linked
    if (newStage === 'closed' && lead.clientId) {
      updatedClients = updatedClients.map((c) =>
        c.id === lead.clientId ? { ...c, status: 'confirmed', updatedAt: new Date().toISOString() } : c
      );
      updatedHistory.unshift({
        id: `ch-${Date.now()}`,
        clientId: lead.clientId,
        date: new Date().toISOString().split('T')[0],
        type: 'auto_event',
        category: 'status_change',
        content: `Lead fechado no funil de vendas! Proposta de ${lead.proposalValue ? `R$ ${lead.proposalValue}` : 'valor negociado'}.`,
        createdAt: new Date().toISOString(),
      });
    }

    // Automation: if moved to 'lost', update client status if linked
    if (newStage === 'lost' && lead.clientId) {
      updatedClients = updatedClients.map((c) =>
        c.id === lead.clientId ? { ...c, status: 'lost_client' as ClientStatus, updatedAt: new Date().toISOString() } : c
      );
    }

    const updatedLeads = data.leads.map((l) =>
      l.id === id ? { ...l, stage: newStage, lastContactDate: new Date().toISOString().split('T')[0] } : l
    );

    const nextData: DatabaseSchema = {
      ...data,
      leads: updatedLeads,
      clients: updatedClients,
      clientHistory: updatedHistory,
    };
    await persistData(nextData);
    showToast(`Lead movido para "${newStage}"`);
  };

  const convertLeadToClient = async (leadId: string, createProject: boolean = true) => {
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) return;

    let newClients = [...data.clients];
    const existingClient = data.clients.find((c) => c.id === lead.clientId);
    const client: Client = existingClient || {
      id: `client-${Date.now()}`,
      companyName: lead.company,
      contactName: lead.name,
      email: '',
      phone: lead.whatsapp || '',
      whatsapp: lead.whatsapp || '',
      instagram: lead.instagram || '',
      city: lead.city || '',
      niche: lead.niche,
      firstContactDate: lead.contactDate || getLocalDateString(),
      origin: 'Prospecção / Funil',
      status: 'confirmed',
      notes: lead.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!existingClient) {
      newClients.unshift(client);
    }

    let newProjects = [...data.projects];
    let newPayments = [...data.payments];
    let newInstallments = [...data.installments];

    if (createProject) {
      const newProjId = `prj-${Date.now()}`;
      const projectValue = lead.proposalValue || lead.estimatedValue || 1500;
      const newProject: Project = {
        id: newProjId,
        name: `Projeto - ${lead.company}`,
        clientId: client.id,
        serviceType: 'landing_page',
        startDate: new Date().toISOString().split('T')[0],
        deliveryDeadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        chargedPrice: projectValue,
        projectCost: 0,
        costs: 0,
        profit: projectValue,
        estimatedHours: 20,
        actualHours: 0,
        progress: 10,
        status: 'in_progress',
        notes: `Criado automaticamente ao fechar Lead "${lead.company}".`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newProjects.unshift(newProject);

      const paymentId = `pay-${Date.now()}`;
      const installmentId = `inst-${Date.now()}-1`;
      const inst: Installment = {
        id: installmentId,
        paymentId,
        projectId: newProjId,
        clientId: client.id,
        installmentNumber: 1,
        number: 1,
        totalInstallments: 1,
        amount: projectValue,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        paymentMethod: 'pix',
      };
      const newPayment: Payment = {
        id: paymentId,
        projectId: newProjId,
        clientId: client.id,
        title: `Contrato: Projeto - ${lead.company}`,
        totalAmount: projectValue,
        receivedAmount: 0,
        pendingAmount: projectValue,
        costs: 0,
        profit: projectValue,
        installments: [inst],
        status: 'unpaid',
        createdAt: new Date().toISOString(),
      };
      newPayments.unshift(newPayment);
      newInstallments.unshift(inst);
    }

    const updatedLeads = data.leads.map((l) =>
      l.id === leadId ? { ...l, stage: 'closed' as LeadStage, clientId: client.id } : l
    );

    const nextData: DatabaseSchema = {
      ...data,
      clients: newClients,
      leads: updatedLeads,
      projects: newProjects,
      payments: newPayments,
      installments: newInstallments,
    };
    await persistData(nextData);
    showToast(`Lead "${lead.company}" convertido em Cliente com sucesso!`);
  };

  const deleteLead = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      leads: data.leads.filter((l) => l.id !== id),
      events: data.events.filter((e) => e.relatedId !== id),
    };
    await persistData(nextData);
    showToast('Lead excluído!', 'info');
  };

  // ----------------------------------------------------------------
  // PROJECT ACTIONS
  // ----------------------------------------------------------------
  const addProject = async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'actualHours'>
  ): Promise<Project> => {
    const id = `prj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id,
      progress: 0,
      actualHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Client history automation
    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: newProject.clientId,
      date: newProject.startDate || new Date().toISOString().split('T')[0],
      type: 'auto_event',
      category: 'project_started',
      content: `Novo projeto iniciado: "${newProject.name}". Valor cobrado: R$ ${newProject.chargedPrice}.`,
      createdAt: new Date().toISOString(),
    };

    // Update client status to project_in_progress
    const updatedClients = data.clients.map((c) =>
      c.id === newProject.clientId ? { ...c, status: 'project_in_progress' as ClientStatus, updatedAt: new Date().toISOString() } : c
    );

    // Add calendar delivery deadline event
    const newEvents = [...data.events];
    if (newProject.deliveryDeadline) {
      newEvents.push({
        id: `ev-dl-${id}`,
        title: `Prazo Final: ${newProject.name}`,
        date: newProject.deliveryDeadline,
        time: '18:00',
        type: 'delivery',
        relatedId: id,
        description: `Entrega do projeto para o cliente.`,
      });
    }

    // Automatically create default starter tasks
    const defaultTasks: Task[] = [
      {
        id: `tsk-${Date.now()}-1`,
        projectId: id,
        clientId: newProject.clientId,
        title: 'Alinhar briefing e referências visuais',
        completed: false,
        dueDate: newProject.startDate,
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: `tsk-${Date.now()}-2`,
        projectId: id,
        clientId: newProject.clientId,
        title: 'Criar wireframe / estrutura da página',
        completed: false,
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: `tsk-${Date.now()}-3`,
        projectId: id,
        clientId: newProject.clientId,
        title: 'Desenvolvimento e responsividade mobile',
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
      {
        id: `tsk-${Date.now()}-4`,
        projectId: id,
        clientId: newProject.clientId,
        title: 'Publicar e apontar domínio com SSL',
        completed: false,
        dueDate: newProject.deliveryDeadline,
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
    ];

    const nextData: DatabaseSchema = {
      ...data,
      projects: [newProject, ...data.projects],
      clients: updatedClients,
      clientHistory: [newHistory, ...data.clientHistory],
      events: newEvents,
      tasks: [...defaultTasks, ...data.tasks],
    };

    await persistData(nextData);
    showToast(`Projeto "${newProject.name}" criado com sucesso!`);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updatedProjects = data.projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    const nextData: DatabaseSchema = { ...data, projects: updatedProjects };
    await persistData(nextData);
    showToast('Projeto atualizado!');
  };

  const completeProject = async (id: string) => {
    const proj = data.projects.find((p) => p.id === id);
    if (!proj) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const client = data.clients.find((c) => c.id === proj.clientId);

    const updatedProjects = data.projects.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'completed' as ProjectStatus,
            progress: 100,
            completionDate: todayStr,
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    // Automation: update client status to 'active_client' or 'project_completed'
    const updatedClients = data.clients.map((c) =>
      c.id === proj.clientId
        ? { ...c, status: 'project_completed' as ClientStatus, updatedAt: new Date().toISOString() }
        : c
    );

    // Automation: Add project completion event to client history
    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: proj.clientId,
      date: todayStr,
      type: 'auto_event',
      category: 'project_completed',
      content: `Projeto "${proj.name}" concluído com sucesso e entregue ao cliente.`,
      createdAt: new Date().toISOString(),
    };

    // Automation: automatically add to portfolio draft if not already in portfolio
    let updatedPortfolio = [...data.portfolio];
    const existsInPortfolio = updatedPortfolio.some((item) => item.projectId === id);
    if (!existsInPortfolio) {
      updatedPortfolio.unshift({
        id: `port-${Date.now()}`,
        projectId: id,
        clientId: proj.clientId,
        clientName: client?.companyName || 'Cliente',
        siteName: proj.name,
        publishedUrl: 'https://exemplo.com.br',
        platform: 'React + Tailwind / Next.js',
        deliveryDate: todayStr,
        receivedAmount: proj.chargedPrice,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        description: `Projeto desenvolvido sob medida para ${client?.companyName || 'o cliente'}.`,
        technologies: ['React', 'Tailwind CSS', 'TypeScript', 'SEO'],
        isPublic: true,
        createdAt: new Date().toISOString(),
      });
    }

    const nextData: DatabaseSchema = {
      ...data,
      projects: updatedProjects,
      clients: updatedClients,
      clientHistory: [newHistory, ...data.clientHistory],
      portfolio: updatedPortfolio,
    };

    await persistData(nextData);
    showToast(`🎉 Parabéns! Projeto "${proj.name}" marcado como concluído e adicionado ao Portfólio!`);
  };

  const deleteProject = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
      payments: data.payments.filter((p) => p.projectId !== id),
      installments: data.installments.filter((i) => i.projectId !== id),
      timeLogs: data.timeLogs.filter((t) => t.projectId !== id),
      tasks: data.tasks.filter((t) => t.projectId !== id),
      portfolio: data.portfolio.filter((p) => p.projectId !== id),
      events: data.events.filter((e) => e.relatedId !== id),
      files: data.files.filter((f) => f.projectId !== id),
    };
    await persistData(nextData);
    showToast('Projeto excluído com sucesso!', 'info');
  };

  // ----------------------------------------------------------------
  // PORTFOLIO ACTIONS
  // ----------------------------------------------------------------
  const addPortfolioItem = async (
    itemData: Omit<PortfolioItem, 'id' | 'createdAt'>
  ): Promise<PortfolioItem> => {
    const newItem: PortfolioItem = {
      ...itemData,
      id: `port-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextData: DatabaseSchema = {
      ...data,
      portfolio: [newItem, ...data.portfolio],
    };
    await persistData(nextData);
    showToast(`Projeto adicionado ao Portfólio!`);
    return newItem;
  };

  const updatePortfolioItem = async (id: string, updates: Partial<PortfolioItem>) => {
    const updated = data.portfolio.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const nextData: DatabaseSchema = { ...data, portfolio: updated };
    await persistData(nextData);
    showToast('Item do portfólio atualizado!');
  };

  const deletePortfolioItem = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      portfolio: data.portfolio.filter((p) => p.id !== id),
    };
    await persistData(nextData);
    showToast('Item removido do portfólio', 'info');
  };

  // ----------------------------------------------------------------
  // FINANCIAL & PAYMENTS ACTIONS
  // ----------------------------------------------------------------
  const addPaymentWithInstallments = async (
    paymentData: Omit<Payment, 'id' | 'createdAt' | 'receivedAmount' | 'pendingAmount' | 'profit' | 'status' | 'installments'>,
    installmentsData: Omit<Installment, 'id' | 'paymentId' | 'status'>[]
  ): Promise<Payment> => {
    const paymentId = `pay-${Date.now()}`;

    const newInstallments: Installment[] = installmentsData.map((inst, index) => ({
      ...inst,
      id: `inst-${Date.now()}-${index + 1}`,
      paymentId,
      status: inst.paidDate ? 'paid' : 'pending',
    }));

    const receivedAmount = newInstallments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = paymentData.totalAmount - receivedAmount;
    const profit = receivedAmount - paymentData.costs;

    let status: 'unpaid' | 'partial' | 'paid' | 'overdue' = 'unpaid';
    if (pendingAmount <= 0) {
      status = 'paid';
    } else if (receivedAmount > 0) {
      status = 'partial';
    }

    const newPayment: Payment = {
      ...paymentData,
      id: paymentId,
      receivedAmount,
      pendingAmount: Math.max(0, pendingAmount),
      profit,
      status,
      installments: [],
      createdAt: new Date().toISOString(),
    };

    // Calendar events for installment due dates
    const newEvents: CalendarEvent[] = newInstallments
      .filter((i) => i.status === 'pending')
      .map((i) => ({
        id: `ev-pay-${i.id}`,
        title: `Vencimento Parcela: R$ ${i.amount}`,
        date: i.dueDate,
        time: '12:00',
        type: 'payment_due',
        relatedId: i.id,
        description: `Parcela ${i.installmentNumber} de ${i.totalInstallments} referente a ${paymentData.title}`,
      }));

    const nextData: DatabaseSchema = {
      ...data,
      payments: [newPayment, ...data.payments],
      installments: [...newInstallments, ...data.installments],
      events: [...newEvents, ...data.events],
    };

    await persistData(nextData);
    showToast(`Cobrança de "${newPayment.title}" cadastrada!`);
    return newPayment;
  };

  const markInstallmentPaid = async (installmentId: string, paymentMethod?: string) => {
    const targetInst = data.installments.find((i) => i.id === installmentId);
    if (!targetInst) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const updatedInstallments = data.installments.map((inst) => {
      if (inst.id === installmentId) {
        return {
          ...inst,
          status: 'paid' as const,
          paidDate: todayStr,
          paymentMethod: (paymentMethod || inst.paymentMethod || 'pix') as any,
        };
      }
      return inst;
    });

    // Recalculate payment totals
    const paymentId = targetInst.paymentId;
    const projectInstallments = updatedInstallments.filter((i) => i.paymentId === paymentId);
    const receivedAmount = projectInstallments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const targetPayment = data.payments.find((p) => p.id === paymentId);
    const totalAmount = targetPayment?.totalAmount || 0;
    const costs = targetPayment?.costs || 0;
    const pendingAmount = Math.max(0, totalAmount - receivedAmount);
    const profit = receivedAmount - costs;

    let payStatus: 'unpaid' | 'partial' | 'paid' | 'overdue' = 'unpaid';
    if (pendingAmount === 0) payStatus = 'paid';
    else if (receivedAmount > 0) payStatus = 'partial';

    const updatedPayments = data.payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            receivedAmount,
            pendingAmount,
            profit,
            status: payStatus,
          }
        : p
    );

    // Automation: Log event in client history
    const client = data.clients.find((c) => c.id === targetInst.clientId);
    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: targetInst.clientId,
      date: todayStr,
      type: 'auto_event',
      category: 'payment_received',
      content: `Pagamento recebido: R$ ${targetInst.amount} (${targetInst.paymentMethod.toUpperCase()}) referente à parcela ${targetInst.installmentNumber}/${targetInst.totalInstallments}.`,
      createdAt: new Date().toISOString(),
    };

    const nextData: DatabaseSchema = {
      ...data,
      installments: updatedInstallments,
      payments: updatedPayments,
      clientHistory: [newHistory, ...data.clientHistory],
    };

    await persistData(nextData);
    showToast(`✅ Pagamento de R$ ${targetInst.amount} confirmado!`);
  };

  const addCustomInstallment = async (
    paymentId: string,
    installmentData: Omit<Installment, 'id' | 'paymentId'>
  ) => {
    const newInst: Installment = {
      ...installmentData,
      id: `inst-${Date.now()}`,
      paymentId,
    };

    const updatedInstallments = [newInst, ...data.installments];
    const projectInstallments = updatedInstallments.filter((i) => i.paymentId === paymentId);
    const receivedAmount = projectInstallments
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const targetPayment = data.payments.find((p) => p.id === paymentId);
    const totalAmount = targetPayment?.totalAmount || 0;
    const costs = targetPayment?.costs || 0;
    const pendingAmount = Math.max(0, totalAmount - receivedAmount);
    const profit = receivedAmount - costs;

    let payStatus: 'unpaid' | 'partial' | 'paid' | 'overdue' = 'unpaid';
    if (pendingAmount === 0) payStatus = 'paid';
    else if (receivedAmount > 0) payStatus = 'partial';

    const updatedPayments = data.payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            receivedAmount,
            pendingAmount,
            profit,
            status: payStatus,
          }
        : p
    );

    const nextData: DatabaseSchema = {
      ...data,
      installments: updatedInstallments,
      payments: updatedPayments,
    };
    await persistData(nextData);
    showToast('Nova parcela adicionada com sucesso!');
  };

  const deletePayment = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      payments: data.payments.filter((p) => p.id !== id),
      installments: data.installments.filter((i) => i.paymentId !== id),
    };
    await persistData(nextData);
    showToast('Cobrança excluída!', 'info');
  };

  const addPayment = async (
    paymentData: any,
    customInstallments?: { number: number; amount: number; dueDate: string }[]
  ): Promise<Payment> => {
    const installmentsToCreate: Omit<Installment, 'id' | 'paymentId' | 'status'>[] =
      customInstallments && customInstallments.length > 0
        ? customInstallments.map((ci) => ({
            projectId: paymentData.projectId,
            clientId: paymentData.clientId,
            installmentNumber: ci.number,
            number: ci.number,
            totalInstallments: customInstallments.length,
            amount: ci.amount,
            dueDate: ci.dueDate,
            paymentMethod: paymentData.paymentMethod || 'pix',
          }))
        : [
            {
              projectId: paymentData.projectId,
              clientId: paymentData.clientId,
              installmentNumber: 1,
              number: 1,
              totalInstallments: 1,
              amount: paymentData.totalAmount,
              dueDate: paymentData.dueDate || new Date().toISOString().split('T')[0],
              paymentMethod: paymentData.paymentMethod || 'pix',
            },
          ];

    return await addPaymentWithInstallments(paymentData, installmentsToCreate);
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    const updatedPayments = data.payments.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const nextData: DatabaseSchema = { ...data, payments: updatedPayments };
    await persistData(nextData);
    showToast('Cobrança atualizada!');
  };

  // ----------------------------------------------------------------
  // TIME TRACKING ACTIONS
  // ----------------------------------------------------------------
  const addTimeLog = async (logData: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> => {
    const newLog: TimeLog = {
      ...logData,
      id: `tl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTimeLogs = [newLog, ...data.timeLogs];

    // Automation: update actualHours of the related project
    let updatedProjects = [...data.projects];
    if (newLog.projectId) {
      const projectLogs = updatedTimeLogs.filter((tl) => tl.projectId === newLog.projectId);
      const totalMinutes = projectLogs.reduce((sum, tl) => sum + tl.durationMinutes, 0);
      const actualHours = Number((totalMinutes / 60).toFixed(1));

      updatedProjects = updatedProjects.map((p) =>
        p.id === newLog.projectId ? { ...p, actualHours, updatedAt: new Date().toISOString() } : p
      );
    }

    const nextData: DatabaseSchema = {
      ...data,
      timeLogs: updatedTimeLogs,
      projects: updatedProjects,
    };

    await persistData(nextData);
    showToast(`Horas registradas (${(newLog.durationMinutes / 60).toFixed(1)}h)!`);
    return newLog;
  };

  const stopAndSaveTimer = async () => {
    if (timerState.elapsedSeconds < 10) {
      showToast('Tempo muito curto para salvar (< 10 segundos).', 'info');
      resetTimer();
      return;
    }

    const durationMinutes = Math.round(timerState.elapsedSeconds / 60) || 1;
    await addTimeLog({
      clientId: timerState.clientId,
      projectId: timerState.projectId,
      activity: timerState.activity || 'Trabalho focado',
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
    });

    resetTimer();
  };

  const deleteTimeLog = async (id: string) => {
    const log = data.timeLogs.find((t) => t.id === id);
    const updatedLogs = data.timeLogs.filter((t) => t.id !== id);

    let updatedProjects = [...data.projects];
    if (log?.projectId) {
      const projectLogs = updatedLogs.filter((tl) => tl.projectId === log.projectId);
      const totalMinutes = projectLogs.reduce((sum, tl) => sum + tl.durationMinutes, 0);
      const actualHours = Number((totalMinutes / 60).toFixed(1));

      updatedProjects = updatedProjects.map((p) =>
        p.id === log.projectId ? { ...p, actualHours } : p
      );
    }

    const nextData: DatabaseSchema = {
      ...data,
      timeLogs: updatedLogs,
      projects: updatedProjects,
    };
    await persistData(nextData);
    showToast('Registro de tempo removido.', 'info');
  };

  // ----------------------------------------------------------------
  // TASKS ACTIONS
  // ----------------------------------------------------------------
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...data.tasks];

    // Automation: recalculate project progress %
    let updatedProjects = [...data.projects];
    if (newTask.projectId) {
      const pTasks = updatedTasks.filter((t) => t.projectId === newTask.projectId);
      const completedCount = pTasks.filter((t) => t.completed).length;
      const progress = pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : 0;

      updatedProjects = updatedProjects.map((p) =>
        p.id === newTask.projectId ? { ...p, progress, updatedAt: new Date().toISOString() } : p
      );
    }

    const nextData: DatabaseSchema = {
      ...data,
      tasks: updatedTasks,
      projects: updatedProjects,
    };
    await persistData(nextData);
    showToast(`Tarefa "${newTask.title}" criada!`);
    return newTask;
  };

  const toggleTask = async (id: string) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTasks = data.tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    // Automation: recalculate project progress %
    let updatedProjects = [...data.projects];
    if (task.projectId) {
      const pTasks = updatedTasks.filter((t) => t.projectId === task.projectId);
      const completedCount = pTasks.filter((t) => t.completed).length;
      const progress = pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : 0;

      updatedProjects = updatedProjects.map((p) =>
        p.id === task.projectId ? { ...p, progress, updatedAt: new Date().toISOString() } : p
      );
    }

    const nextData: DatabaseSchema = {
      ...data,
      tasks: updatedTasks,
      projects: updatedProjects,
    };
    await persistData(nextData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    const nextData: DatabaseSchema = { ...data, tasks: updatedTasks };
    await persistData(nextData);
    showToast('Tarefa atualizada!');
  };

  const deleteTask = async (id: string) => {
    const task = data.tasks.find((t) => t.id === id);
    const updatedTasks = data.tasks.filter((t) => t.id !== id);

    let updatedProjects = [...data.projects];
    if (task?.projectId) {
      const pTasks = updatedTasks.filter((t) => t.projectId === task.projectId);
      const completedCount = pTasks.filter((t) => t.completed).length;
      const progress = pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : 0;

      updatedProjects = updatedProjects.map((p) =>
        p.id === task.projectId ? { ...p, progress } : p
      );
    }

    const nextData: DatabaseSchema = {
      ...data,
      tasks: updatedTasks,
      projects: updatedProjects,
    };
    await persistData(nextData);
    showToast('Tarefa excluída!', 'info');
  };

  // ----------------------------------------------------------------
  // PROPOSALS ACTIONS & CONVERSION TO PROJECT
  // ----------------------------------------------------------------
  const addProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>): Promise<Proposal> => {
    const newProposal: Proposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Client history automation
    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: newProposal.clientId,
      date: newProposal.sentDate || new Date().toISOString().split('T')[0],
      type: 'auto_event',
      category: 'proposal_sent',
      content: `Proposta comercial enviada: "${newProposal.title}" no valor de R$ ${newProposal.value}.`,
      createdAt: new Date().toISOString(),
    };

    const nextData: DatabaseSchema = {
      ...data,
      proposals: [newProposal, ...data.proposals],
      clientHistory: [newHistory, ...data.clientHistory],
    };
    await persistData(nextData);
    showToast(`Proposta comercial criada com sucesso!`);
    return newProposal;
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    const updatedProposals = data.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const nextData: DatabaseSchema = { ...data, proposals: updatedProposals };
    await persistData(nextData);
    showToast('Proposta atualizada!');
  };

  const convertProposalToProject = async (proposalId: string): Promise<Project | null> => {
    const proposal = data.proposals.find((p) => p.id === proposalId);
    if (!proposal) return null;

    const client = data.clients.find((c) => c.id === proposal.clientId);
    const service = data.services.find((s) => s.id === proposal.serviceId);

    const todayStr = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (proposal.estimatedDays || 15));
    const deliveryDateStr = deliveryDate.toISOString().split('T')[0];

    const proposalValue = proposal.value ?? (proposal as any).totalValue ?? 1500;
    const proposalNotes = proposal.description ?? (proposal as any).notes ?? '';

    const projectId = `prj-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: proposal.title,
      clientId: proposal.clientId,
      serviceType: proposal.serviceName || service?.name || 'Serviço Digital',
      startDate: todayStr,
      deliveryDeadline: deliveryDateStr,
      chargedPrice: proposalValue,
      projectCost: service?.estimatedCost || 150,
      estimatedHours: 15,
      actualHours: 0,
      progress: 0,
      status: 'in_progress',
      notes: proposalNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update proposal status to 'accepted' and set converted link
    const updatedProposals = data.proposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'accepted' as const, convertedToProjectId: projectId } : p
    );

    // Update client status
    const updatedClients = data.clients.map((c) =>
      c.id === proposal.clientId
        ? { ...c, status: 'project_in_progress' as ClientStatus, updatedAt: new Date().toISOString() }
        : c
    );

    // Auto-create initial payment record with 2 installments (50% entry, 50% on completion)
    const paymentId = `pay-${Date.now()}`;
    const halfValue = Math.round(proposalValue / 2);
    const initialInstallments: Installment[] = [
      {
        id: `inst-${Date.now()}-1`,
        paymentId,
        projectId,
        clientId: proposal.clientId,
        installmentNumber: 1,
        totalInstallments: 2,
        amount: halfValue,
        dueDate: todayStr,
        status: 'pending',
        paymentMethod: 'pix',
        notes: 'Entrada de 50%',
      },
      {
        id: `inst-${Date.now()}-2`,
        paymentId,
        projectId,
        clientId: proposal.clientId,
        installmentNumber: 2,
        totalInstallments: 2,
        amount: proposalValue - halfValue,
        dueDate: deliveryDateStr,
        status: 'pending',
        paymentMethod: 'pix',
        notes: 'Saldo na entrega do projeto',
      },
    ];

    const newPayment: Payment = {
      id: paymentId,
      projectId,
      clientId: proposal.clientId,
      title: proposal.title,
      totalAmount: proposalValue,
      receivedAmount: 0,
      pendingAmount: proposalValue,
      costs: service?.estimatedCost || 150,
      profit: 0 - (service?.estimatedCost || 150),
      status: 'unpaid',
      installments: [],
      createdAt: new Date().toISOString(),
    };

    // Client history automation
    const newHistory: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId: proposal.clientId,
      date: todayStr,
      type: 'auto_event',
      category: 'project_started',
      content: `Proposta aceita! Projeto "${newProject.name}" gerado automaticamente com orçamento de R$ ${proposal.value}.`,
      createdAt: new Date().toISOString(),
    };

    const nextData: DatabaseSchema = {
      ...data,
      projects: [newProject, ...data.projects],
      proposals: updatedProposals,
      clients: updatedClients,
      payments: [newPayment, ...data.payments],
      installments: [...initialInstallments, ...data.installments],
      clientHistory: [newHistory, ...data.clientHistory],
    };

    await persistData(nextData);
    showToast(`🚀 Proposta aceita! Projeto e plano de pagamento criados automaticamente!`);
    return newProject;
  };

  const deleteProposal = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      proposals: data.proposals.filter((p) => p.id !== id),
    };
    await persistData(nextData);
    showToast('Proposta excluída!', 'info');
  };

  // ----------------------------------------------------------------
  // SERVICES ACTIONS
  // ----------------------------------------------------------------
  const addService = async (serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextData: DatabaseSchema = {
      ...data,
      services: [...data.services, newService],
    };
    await persistData(nextData);
    showToast(`Serviço "${newService.name}" cadastrado!`);
    return newService;
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    const updated = data.services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    const nextData: DatabaseSchema = { ...data, services: updated };
    await persistData(nextData);
    showToast('Serviço atualizado!');
  };

  const deleteService = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      services: data.services.filter((s) => s.id !== id),
    };
    await persistData(nextData);
    showToast('Serviço excluído!', 'info');
  };

  // ----------------------------------------------------------------
  // CALENDAR EVENTS ACTIONS
  // ----------------------------------------------------------------
  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    const nextData: DatabaseSchema = {
      ...data,
      events: [...data.events, newEvent],
    };
    await persistData(nextData);
    showToast('Evento adicionado ao calendário!');
    return newEvent;
  };

  const deleteEvent = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      events: data.events.filter((e) => e.id !== id),
    };
    await persistData(nextData);
    showToast('Evento removido.', 'info');
  };

  // ----------------------------------------------------------------
  // CLIENT HISTORY & MANUAL NOTES
  // ----------------------------------------------------------------
  const addClientHistoryNote = async (clientId: string, content: string) => {
    const newNote: ClientHistory = {
      id: `ch-${Date.now()}`,
      clientId,
      date: new Date().toISOString().split('T')[0],
      type: 'manual_note',
      category: 'note',
      content,
      createdAt: new Date().toISOString(),
    };
    const nextData: DatabaseSchema = {
      ...data,
      clientHistory: [newNote, ...data.clientHistory],
    };
    await persistData(nextData);
    showToast('Anotação adicionada ao histórico do cliente!');
  };

  const deleteClientHistoryItem = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      clientHistory: data.clientHistory.filter((h) => h.id !== id),
    };
    await persistData(nextData);
    showToast('Item de histórico removido.', 'info');
  };

  // ----------------------------------------------------------------
  // FILE ATTACHMENTS
  // ----------------------------------------------------------------
  const addFileAttachment = async (
    fileData: Omit<AttachedFile, 'id' | 'uploadDate'>
  ): Promise<AttachedFile> => {
    const newFile: AttachedFile = {
      ...fileData,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const nextData: DatabaseSchema = {
      ...data,
      files: [newFile, ...data.files],
    };
    await persistData(nextData);
    showToast(`Arquivo "${newFile.name}" anexado com sucesso!`);
    return newFile;
  };

  const deleteFileAttachment = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      files: data.files.filter((f) => f.id !== id),
    };
    await persistData(nextData);
    showToast('Arquivo excluído.', 'info');
  };

  // ----------------------------------------------------------------
  // PERSONAL NOTES & OBSERVAÇÕES
  // ----------------------------------------------------------------
  const addPersonalNote = async (
    noteData: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PersonalNote> => {
    const now = new Date().toISOString();
    const newNote: PersonalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const nextData: DatabaseSchema = {
      ...data,
      personalNotes: [newNote, ...(data.personalNotes || [])],
    };
    await persistData(nextData);
    showToast('Observação guardada com sucesso!');
    return newNote;
  };

  const updatePersonalNote = async (id: string, updates: Partial<PersonalNote>) => {
    const updated = (data.personalNotes || []).map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    const nextData: DatabaseSchema = {
      ...data,
      personalNotes: updated,
    };
    await persistData(nextData);
    showToast('Observação atualizada!');
  };

  const deletePersonalNote = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      personalNotes: (data.personalNotes || []).filter((n) => n.id !== id),
    };
    await persistData(nextData);
    showToast('Observação excluída.', 'info');
  };

  const togglePinPersonalNote = async (id: string) => {
    const targetNote = (data.personalNotes || []).find((n) => n.id === id);
    if (!targetNote) return;
    const isPinned = !targetNote.pinned;
    const updated = (data.personalNotes || []).map((n) =>
      n.id === id ? { ...n, pinned: isPinned, updatedAt: new Date().toISOString() } : n
    );
    const nextData: DatabaseSchema = {
      ...data,
      personalNotes: updated,
    };
    await persistData(nextData);
    showToast(isPinned ? 'Observação fixada no topo!' : 'Observação desfixada.', 'info');
  };

  const updateScratchpad = async (content: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      scratchpad: content,
    };
    await persistData(nextData);
  };

  // ----------------------------------------------------------------
  // SETTINGS, THEME & SYSTEM BACKUP
  // ----------------------------------------------------------------
  const toggleTheme = async () => {
    const newTheme = data.settings.theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
    showToast(newTheme === 'dark' ? 'Modo Escuro ativado!' : 'Modo Claro ativado!', 'info');
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    await updateSettings({ theme: newTheme });
    showToast(newTheme === 'dark' ? 'Modo Escuro ativado!' : 'Modo Claro ativado!', 'info');
  };

  const updateSettings = async (settingsUpdates: Partial<UserSettings>) => {
    const nextSettings: UserSettings = {
      ...data.settings,
      ...settingsUpdates,
    };
    const nextData: DatabaseSchema = {
      ...data,
      settings: nextSettings,
    };
    await persistData(nextData);
    showToast('Configurações salvas!');
  };

  const resetToDemoData = async () => {
    await persistData(demoDatabase);
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
    showToast('Dados de demonstração restaurados com sucesso!');
  };

  const clearAllData = async () => {
    const emptyDb: DatabaseSchema = {
      settings: { ...data.settings },
      clients: [],
      leads: [],
      projects: [],
      portfolio: [],
      payments: [],
      installments: [],
      expenses: [],
      timeLogs: [],
      tasks: [],
      proposals: [],
      services: [],
      servicePackages: [],
      events: [],
      clientHistory: [],
      files: [],
      personalNotes: [],
      scratchpad: '',
    };
    await persistData(emptyDb);
    try {
      await fetch('/api/clear-all', { method: 'POST' });
    } catch {}
    showToast('Todos os dados foram zerados com sucesso!', 'info');
  };

  const exportDataJson = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `freelancehub_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Backup completo em JSON exportado com sucesso!');
  };

  const exportDataJSON = () => {
    exportDataJson();
  };

  const importDataJSON = async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        await persistData({
          ...initialDatabase,
          ...parsed,
        });
        showToast('Dados restaurados com sucesso!');
      } else {
        showToast('Arquivo JSON inválido.', 'error');
      }
    } catch {
      showToast('Erro ao ler arquivo JSON.', 'error');
    }
  };

  const resetToDefaults = async () => {
    await resetToDemoData();
  };

  const toggleTaskCompleted = async (id: string) => {
    await toggleTask(id);
  };

  const addManualTimeLog = async (logData: {
    clientId: string;
    projectId: string;
    durationMinutes: number;
    activity: string;
    date: string;
  }) => {
    return await addTimeLog(logData);
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    const nextData: DatabaseSchema = {
      ...data,
      expenses: [newExpense, ...(data.expenses || [])],
    };
    await persistData(nextData);
    showToast(`Despesa "${newExpense.title}" registrada!`);
    return newExpense;
  };

  const deleteExpense = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      expenses: (data.expenses || []).filter((e) => e.id !== id),
    };
    await persistData(nextData);
    showToast('Despesa removida.', 'info');
  };

  const addServicePackage = async (pkgData: Omit<ServicePackage, 'id'>): Promise<ServicePackage> => {
    const newPkg: ServicePackage = {
      ...pkgData,
      id: `pkg-${Date.now()}`,
    };
    const nextData: DatabaseSchema = {
      ...data,
      servicePackages: [newPkg, ...(data.servicePackages || [])],
    };
    await persistData(nextData);
    showToast(`Pacote "${newPkg.name}" adicionado com sucesso!`);
    return newPkg;
  };

  const updateServicePackage = async (id: string, updates: Partial<ServicePackage>) => {
    const updated = (data.servicePackages || []).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    const nextData: DatabaseSchema = { ...data, servicePackages: updated };
    await persistData(nextData);
    showToast('Pacote atualizado!');
  };

  const deleteServicePackage = async (id: string) => {
    const nextData: DatabaseSchema = {
      ...data,
      servicePackages: (data.servicePackages || []).filter((p) => p.id !== id),
    };
    await persistData(nextData);
    showToast('Pacote excluído.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        activeTab,
        setActiveTab,
        currentTab: activeTab,
        setCurrentTab: setActiveTab,
        searchTerm,
        setSearchTerm,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        notifications,
        unreadNotificationsCount,

        timerState,
        startTimer,
        pauseTimer,
        stopAndSaveTimer,
        resetTimer,

        toast,
        showToast,

        addClient,
        updateClient,
        deleteClient,

        addLead,
        updateLead,
        moveLeadStage,
        convertLeadToClient,
        deleteLead,

        addProject,
        updateProject,
        completeProject,
        deleteProject,

        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,

        addPaymentWithInstallments,
        addPayment,
        updatePayment,
        markInstallmentPaid,
        addCustomInstallment,
        deletePayment,
        addExpense,
        deleteExpense,

        addTimeLog,
        addManualTimeLog,
        deleteTimeLog,

        addTask,
        toggleTask,
        toggleTaskCompleted,
        updateTask,
        deleteTask,

        addProposal,
        updateProposal,
        convertProposalToProject,
        deleteProposal,

        addService,
        updateService,
        deleteService,
        addServicePackage,
        updateServicePackage,
        deleteServicePackage,

        addEvent,
        addCalendarEvent: addEvent,
        deleteEvent,
        deleteCalendarEvent: deleteEvent,

        addClientHistoryNote,
        deleteClientHistoryItem,

        addFileAttachment,
        deleteFileAttachment,

        addPersonalNote,
        updatePersonalNote,
        deletePersonalNote,
        togglePinPersonalNote,
        updateScratchpad,

        lastSavedTimestamp,
        forceSaveToDevice,

        toggleTheme,
        setTheme,
        updateSettings,
        resetToDemoData,
        resetToDefaults,
        clearAllData,
        exportDataJson,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
