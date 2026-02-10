import { Suspense, lazy, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { DashboardPage } from '@/pages/DashboardPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { QaActionsPage } from '@/pages/QaActionsPage';
import { EducationPage } from '@/pages/EducationPage';
import { EduTopicLibraryPage } from '@/pages/EduTopicLibraryPage';
import { OrientationPage } from '@/pages/OrientationPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { FollowUpPage } from '@/pages/FollowUpPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { RegulatoryReferencesPage } from '@/pages/RegulatoryReferencesPage';
import { RecommendationCenterPage } from '@/pages/RecommendationCenterPage';
import { WorkflowDashboardPage } from '@/pages/WorkflowDashboardPage';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { BackupReminderBanner } from '@/components/BackupReminderBanner';
import { CommandPalette } from '@/components/CommandPalette';
import { useBrowserCloseWarning } from '@/hooks/use-browser-close-warning';

const SessionsPage = lazy(() => import('@/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const UserGuidePage = lazy(() => import('@/pages/UserGuidePage').then((m) => ({ default: m.UserGuidePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  const { sessions, qaActions, eduSessions } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const hasData = sessions.length > 0 || qaActions.length > 0 || eduSessions.length > 0;
  useBrowserCloseWarning(hasData);

  return (
    <div className="flex h-dvh w-full bg-background">
      <AppSidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex-1 flex min-h-0 flex-col min-w-0 overflow-hidden">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 min-h-0 overflow-auto p-4 lg:p-6">
          <BackupReminderBanner />
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:id" element={<SessionsPage />} />
              <Route path="/qa-actions" element={<QaActionsPage />} />
              <Route path="/workflow-dashboard" element={<WorkflowDashboardPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/edu-library" element={<EduTopicLibraryPage />} />
              <Route path="/orientation" element={<OrientationPage />} />
              <Route path="/follow-up" element={<FollowUpPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/regulatory-references" element={<RegulatoryReferencesPage />} />
              <Route path="/recommendations" element={<RecommendationCenterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/user-guide" element={<UserGuidePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
          Developed by Juan Enguerra © 2026. All rights reserved.
        </footer>
      </div>
      <CommandPalette />
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
