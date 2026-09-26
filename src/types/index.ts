export type ClientStatus =
  | 'lead'
  | 'contacted'
  | 'negotiating'
  | 'awaiting_response'
  | 'confirmed'
  | 'active_client'
  | 'project_in_progress'
  | 'project_completed'
  | 'lost_client'
  | 'inactive_client';

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  city: string;
  niche: string;
  firstContactDate: string;
  origin: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export type LeadStage =
  | 'prospect'
  | 'leads_found'
  | 'first_contact'
  | 'awaiting_response'
  | 'talking'
  | 'proposal_sent'
  | 'negotiating'
  | 'closed'
  | 'lost';

export interface Lead {
  id: string;
  clientId?: string;
  name: string;
  company: string;
  niche: string;
  whatsapp: string;
  instagram: string;
  currentWebsite?: string;
  city: string;
  contactDate: string;
  lastContactDate: string;
  nextContactDate: string;
  proposalValue: number;
  estimatedValue?: number;
  stage: LeadStage;
  notes: string;
  followUpReminder: string;
  tags?: string[];
  createdAt: string;
}

export type ServiceType = string;

export type ProjectStatus =
  | 'not_started'
  | 'briefing'
  | 'in_progress'
  | 'review'
  | 'revisions'
  | 'awaiting_client'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export interface ProjectChecklistItem {
  id: string;
  label: string;
  done?: boolean;
  checked?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  serviceType: string;
  startDate?: string;
  deliveryDeadline: string;
  completionDate?: string;
  chargedPrice: number;
  projectCost?: number;
  costs?: number; // alias for projectCost
  profit?: number;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100
  status: ProjectStatus;
  notes: string;
  briefingLink?: string;
  figmaLink?: string;
  previewLink?: string;
  liveUrl?: string;
  checklist?: ProjectChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  client?: string; // alias for clientName
  siteName?: string;
  title?: string; // alias for siteName
  publishedUrl?: string;
  liveUrl?: string; // alias for publishedUrl
  githubUrl?: string;
  domainUrl?: string;
  platform?: string;
  deliveryDate?: string;
  receivedAmount?: number;
  coverImage?: string;
  imageUrl?: string; // alias for coverImage
  description?: string;
  niche?: string;
  results?: string;
  testimonial?: string;
  beforeAfterNote?: string;
  tags?: string[];
  technologies?: string[];
  isPublic?: boolean;
  createdAt: string;
}

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'bank_slip'
  | 'bank_transfer'
  | 'cash'
  | 'other';

export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  paymentId: string;
  projectId: string;
  clientId: string;
  installmentNumber: number;
  number?: number; // alias for installmentNumber
  totalInstallments: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paidAt?: string;
  status: InstallmentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type PaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'pending'
  | 'partially_paid'
  | 'cancelled';

export interface Payment {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  totalAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  costs: number;
  profit: number;
  installments?: Installment[];
  installmentsCount?: number;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'tools' | 'hosting' | 'domains' | 'ai' | 'marketing' | 'taxes' | 'other';
  amount: number;
  periodicity: 'monthly' | 'yearly' | 'one_time';
  startDate: string;
  notes?: string;
}

export interface TimeLog {
  id: string;
  clientId: string;
  projectId: string;
  activity: string;
  date: string;
  durationMinutes: number; // in minutes
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  clientId?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: TaskPriority;
  createdAt: string;
}

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface Proposal {
  id: string;
  clientId: string;
  serviceId?: string;
  serviceName?: string;
  title: string;
  description?: string;
  value?: number;
  totalValue?: number; // alias for value
  estimatedDays?: number;
  deadlineDays?: number;
  sentDate?: string;
  deadlineDate?: string;
  paymentTerms?: string;
  scope?: string;
  includedItems?: string[];
  excludedItems?: string[];
  status: ProposalStatus;
  convertedToProjectId?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  estimatedCost: number;
  averageDeliveryDays: number;
  createdAt: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  suggestedPrice: number;
  averageHours: number;
  includes: string[];
}

export type EventType =
  | 'project_deadline'
  | 'deadline'
  | 'delivery'
  | 'payment_due'
  | 'follow_up'
  | 'meeting'
  | 'task';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: EventType;
  relatedId?: string;
  clientId?: string;
  meetingLink?: string;
  description?: string;
}

export interface ClientHistory {
  id: string;
  clientId: string;
  date: string;
  type: 'auto_event' | 'manual_note';
  category:
    | 'created'
    | 'first_contact'
    | 'proposal_sent'
    | 'status_change'
    | 'payment_received'
    | 'project_started'
    | 'project_completed'
    | 'note';
  content: string;
  createdAt: string;
}

export type FileCategory =
  | 'briefing'
  | 'logo'
  | 'images'
  | 'contracts'
  | 'documents'
  | 'references'
  | 'project_files';

export interface AttachedFile {
  id: string;
  clientId?: string;
  projectId?: string;
  name: string;
  category: FileCategory;
  fileSize: string;
  fileUrl: string;
  uploadDate: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category?: 'general' | 'idea' | 'reminder' | 'client' | 'urgent';
  color?: 'slate' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'sky';
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userName: string;
  companyName: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  whatsapp: string;
  contactDetails: string;
  currency: string;
  hourlyRateGoal: number;
  monthlyRevenueGoal?: number;
  pixKey?: string;
  theme: 'light' | 'dark';
}

export type BusinessSettings = UserSettings;

export interface DatabaseSchema {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  portfolio: PortfolioItem[];
  payments: Payment[];
  installments: Installment[];
  expenses: Expense[];
  timeLogs: TimeLog[];
  tasks: Task[];
  proposals: Proposal[];
  services: Service[];
  servicePackages: ServicePackage[];
  events: CalendarEvent[];
  clientHistory: ClientHistory[];
  files: AttachedFile[];
  personalNotes?: PersonalNote[];
  scratchpad?: string;
  settings: UserSettings;
}

export type ActiveTab =
  | 'dashboard'
  | 'clients'
  | 'kanban'
  | 'projects'
  | 'portfolio'
  | 'financial'
  | 'time'
  | 'time_tracking'
  | 'profitability'
  | 'tasks'
  | 'calendar'
  | 'proposals'
  | 'services'
  | 'notes'
  | 'reports'
  | 'settings';
