import { Suspense, lazy, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
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
import { CaseWorkspacePage } from '@/pages/CaseWorkspacePage';
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
        <main className="flex-1 min-h-0 overflow-auto p-4 lg:p-6" role="main">
          <BackupReminderBanner />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" role="status" aria-label="Loading"></div>
                <p className="text-sm text-muted-foreground">Loading page...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <FeatureErrorBoundary featureName="Dashboard">
                  <DashboardPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/templates" element={
                <FeatureErrorBoundary featureName="Templates">
                  <TemplatesPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/sessions" element={
                <FeatureErrorBoundary featureName="Audit Sessions">
                  <SessionsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/sessions/:id" element={
                <FeatureErrorBoundary featureName="Audit Session Details">
                  <SessionsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/qa-actions" element={
                <FeatureErrorBoundary featureName="QA Actions">
                  <QaActionsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/workflow-dashboard" element={
                <FeatureErrorBoundary featureName="Workflow Dashboard">
                  <WorkflowDashboardPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/education" element={
                <FeatureErrorBoundary featureName="Education">
                  <EducationPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/edu-library" element={
                <FeatureErrorBoundary featureName="Education Library">
                  <EduTopicLibraryPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/orientation" element={
                <FeatureErrorBoundary featureName="Orientation">
                  <OrientationPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/follow-up" element={
                <FeatureErrorBoundary featureName="Follow-up">
                  <FollowUpPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/cases/:caseId" element={
                <FeatureErrorBoundary featureName="Case Workspace">
                  <CaseWorkspacePage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/analytics" element={
                <FeatureErrorBoundary featureName="Analytics">
                  <AnalyticsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/calendar" element={
                <FeatureErrorBoundary featureName="Calendar">
                  <CalendarPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/reports" element={
                <FeatureErrorBoundary featureName="Reports">
                  <ReportsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/regulatory-references" element={
                <FeatureErrorBoundary featureName="Regulatory References">
                  <RegulatoryReferencesPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/recommendations" element={
                <FeatureErrorBoundary featureName="Recommendations">
                  <RecommendationCenterPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/settings" element={
                <FeatureErrorBoundary featureName="Settings">
                  <SettingsPage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="/user-guide" element={
                <FeatureErrorBoundary featureName="User Guide">
                  <UserGuidePage />
                </FeatureErrorBoundary>
              } />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border" role="contentinfo">
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
