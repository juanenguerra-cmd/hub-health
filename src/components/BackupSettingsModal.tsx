import React, { useState, useEffect } from 'react';
import { Settings, Clock, Shield, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { 
  loadBackupSettings, 
  saveBackupSettings,
  updateLastBackupTime 
} from '@/lib/backup-settings-storage';
import { formatLastBackup, type ReminderFrequency } from '@/types/backup-settings';

interface BackupSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate?: () => void;
}

export function BackupSettingsModal({ open, onOpenChange, onSettingsUpdate }: BackupSettingsModalProps) {
  const { exportBackup } = useApp();
  const [settings, setSettings] = useState(() => loadBackupSettings());

  useEffect(() => {
    if (open) {
      setSettings(loadBackupSettings());
    }
  }, [open]);

  const handleFrequencyChange = (value: ReminderFrequency) => {
    const updated = { ...settings, reminderFrequency: value };
    setSettings(updated);
    saveBackupSettings(updated);
    onSettingsUpdate?.();
  };

  const handleBrowserWarningChange = (checked: boolean) => {
    const updated = { ...settings, browserCloseWarning: checked };
    setSettings(updated);
    saveBackupSettings(updated);
    onSettingsUpdate?.();
  };

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
    
    updateLastBackupTime();
    setSettings(loadBackupSettings());
    onSettingsUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backup Settings
          </DialogTitle>
          <DialogDescription>
            Configure automatic backup reminders and browser warnings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Last Backup Info */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last backup:</span>
              <span className="font-medium">{formatLastBackup(settings.lastBackupAt)}</span>
            </div>
          </div>

          <Separator />

          {/* Reminder Frequency */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reminder Frequency</Label>
            <RadioGroup 
              value={settings.reminderFrequency} 
              onValueChange={(v) => handleFrequencyChange(v as ReminderFrequency)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal cursor-pointer">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3days" id="3days" />
                <Label htmlFor="3days" className="font-normal cursor-pointer">Every 3 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-normal cursor-pointer">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="font-normal cursor-pointer">Never</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Browser Close Warning */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Browser Close Warning
              </Label>
              <p className="text-xs text-muted-foreground">
                Warn before closing if data hasn't been backed up
              </p>
            </div>
            <Switch
              checked={settings.browserCloseWarning}
              onCheckedChange={handleBrowserWarningChange}
            />
          </div>

          <Separator />

          {/* Backup Now Button */}
          <Button onClick={handleExportBackup} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Backup Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
