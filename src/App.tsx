import { AppProvider, useApp } from '@/contexts/AppContext';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { DashboardPage } from '@/pages/DashboardPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { QaActionsPage } from '@/pages/QaActionsPage';
import { EducationPage } from '@/pages/EducationPage';
import { EduTopicLibraryPage } from '@/pages/EduTopicLibraryPage';
import { OrientationPage } from '@/pages/OrientationPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { FollowUpPage } from '@/pages/FollowUpPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

function AppContent() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'sessions':
        return <SessionsPage />;
      case 'qa-actions':
        return <QaActionsPage />;
      case 'education':
        return <EducationPage />;
      case 'edu-library':
        return <EduTopicLibraryPage />;
      case 'orientation':
        return <OrientationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'follow-up':
        return <FollowUpPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderPage()}
        </main>
        <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
          Developed by Juan Enguerra © 2026. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
      <Sonner />
    </AppProvider>
  );
}

export default App;
