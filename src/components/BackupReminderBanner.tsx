import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Download, Upload, Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';
import { 
  loadBackupSettings, 
  dismissReminder, 
  updateLastBackupTime,
  markFirstVisitComplete 
} from '@/lib/backup-settings-storage';
import { shouldShowReminder, formatLastBackup } from '@/types/backup-settings';
import { BackupSettingsModal } from './BackupSettingsModal';
import { FirstVisitImportModal } from './FirstVisitImportModal';

export function BackupReminderBanner() {
  const { exportBackup } = useApp();
  const [settings, setSettings] = useState(() => loadBackupSettings());
  const [showBanner, setShowBanner] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);

  // Check if we should show reminders
  useEffect(() => {
    const currentSettings = loadBackupSettings();
    setSettings(currentSettings);
    
    // First visit - show import prompt
    if (currentSettings.isFirstVisit) {
      setShowFirstVisitModal(true);
      return;
    }
    
    // Check reminder conditions
    if (shouldShowReminder(currentSettings)) {
      setShowBanner(true);
    }
  }, []);

  const handleExportBackup = () => {
    const backupContent = exportBackup();
    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub-health-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update last backup time
    updateLastBackupTime();
    setSettings(loadBackupSettings());
    setShowBanner(false);
  };

  const handleDismiss = () => {
    dismissReminder();
    setSettings(loadBackupSettings());
    setShowBanner(false);
  };

  const handleFirstVisitComplete = () => {
    markFirstVisitComplete();
    setSettings(loadBackupSettings());
    setShowFirstVisitModal(false);
  };

  const handleSettingsUpdate = () => {
    const updatedSettings = loadBackupSettings();
    setSettings(updatedSettings);
    // Re-check if banner should show
    if (shouldShowReminder(updatedSettings)) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  };

  if (!showBanner && !showFirstVisitModal) return null;

  return (
    <>
      {showBanner && (
        <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock className="h-4 w-4" />
              <span>
                <strong>Backup Reminder:</strong> Last backup: {formatLastBackup(settings.lastBackupAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportBackup}
                className="gap-1 border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-300"
              >
                <Download className="h-3 w-3" />
                Backup Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettingsModal(true)}
                className="gap-1 text-amber-700 hover:bg-amber-100 dark:text-amber-300"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDismiss}
                className="h-6 w-6 text-amber-700 hover:bg-amber-100 dark:text-amber-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <BackupSettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal}
        onSettingsUpdate={handleSettingsUpdate}
      />

      <FirstVisitImportModal
        open={showFirstVisitModal}
        onComplete={handleFirstVisitComplete}
      />
    </>
  );
}
