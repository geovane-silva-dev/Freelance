import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { ActiveTab } from './types/index.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { ToastContainer } from './components/Toast.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';

// Views
import { DashboardView } from './components/DashboardView.tsx';
import { ClientsView } from './components/ClientsView.tsx';
import { KanbanView } from './components/KanbanView.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { PortfolioView } from './components/PortfolioView.tsx';
import { FinancialView } from './components/FinancialView.tsx';
import { TimeTrackingView } from './components/TimeTrackingView.tsx';
import { ProfitabilityView } from './components/ProfitabilityView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { ProposalsView } from './components/ProposalsView.tsx';
import { ServicesView } from './components/ServicesView.tsx';
import { NotesView } from './components/NotesView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab, isGlobalSearchOpen, setIsGlobalSearchOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsView />;
      case 'kanban':
        return <KanbanView />;
      case 'projects':
        return <ProjectsView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'financial':
        return <FinancialView />;
      case 'time_tracking':
        return <TimeTrackingView />;
      case 'profitability':
        return <ProfitabilityView />;
      case 'tasks':
        return <TasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'proposals':
        return <ProposalsView />;
      case 'services':
        return <ServicesView />;
      case 'notes':
        return <NotesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white antialiased transition-colors">
      {/* Sidebar navigation */}
      <Sidebar
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        {/* Global Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & System Feedback */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={(tab: ActiveTab) => {
          setCurrentTab(tab);
          setIsGlobalSearchOpen(false);
        }}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
