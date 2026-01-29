import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileJson, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Database,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BackupSettingsModal } from '@/components/BackupSettingsModal';
import { loadBackupSettings, updateLastBackupTime } from '@/lib/backup-settings-storage';
import { formatLastBackup } from '@/types/backup-settings';

export function SettingsPage() {
  const { 
    facilityName, 
    setFacilityName,
    templates,
    sessions,
    eduSessions,
    qaActions,
    eduLibrary,
    restoreFromBackup,
    exportBackup,
    loadDemoData
  } = useApp();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showBackupSettings, setShowBackupSettings] = useState(false);
  const [backupSettings, setBackupSettings] = useState(() => loadBackupSettings());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsRestoring(true);
    setRestoreResult(null);
    
    try {
      const content = await file.text();
      const result = restoreFromBackup(content);
      
      setRestoreResult({
        success: result.success,
        message: result.message,
        counts: result.counts
      });
      
      if (result.success) {
        toast({
          title: 'Restore Complete',
          description: `Imported ${result.counts.templates} templates, ${result.counts.sessions} sessions, ${result.counts.eduSessions} education sessions.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Restore Failed',
          description: result.message,
        });
      }
    } catch (err) {
      setRestoreResult({
        success: false,
        message: 'Error reading file. Please try again.'
      });
    } finally {
      setIsRestoring(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    const content = exportBackup();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub-health-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update backup time
    updateLastBackupTime();
    setBackupSettings(loadBackupSettings());
    
    toast({
      title: 'Backup Created',
      description: 'Your data has been exported successfully.',
    });
  };

  const handleBackupSettingsUpdate = () => {
    setBackupSettings(loadBackupSettings());
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast({
      title: 'Demo Data Loaded',
      description: 'Sample data has been generated for testing.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure facility info, backup & restore data
        </p>
      </div>

      {/* Facility Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Facility Information
          </CardTitle>
          <CardDescription>
            Configure your facility details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facilityName">Facility Name</Label>
            <Input
              id="facilityName"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="Enter facility name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Data Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Data
          </CardTitle>
          <CardDescription>
            Overview of data stored in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-sm text-muted-foreground">Templates</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Audit Sessions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{qaActions.length}</div>
              <div className="text-sm text-muted-foreground">QA Actions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{eduSessions.length}</div>
              <div className="text-sm text-muted-foreground">Education Sessions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{eduLibrary.length}</div>
              <div className="text-sm text-muted-foreground">Education Topics</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Import data from your old InService Hub backup or export current data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Reminder Settings */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Backup Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Last backup: {formatLastBackup(backupSettings.lastBackupAt)} • 
                    Frequency: {backupSettings.reminderFrequency === '3days' ? 'Every 3 days' : 
                               backupSettings.reminderFrequency.charAt(0).toUpperCase() + backupSettings.reminderFrequency.slice(1)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowBackupSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Restore from Backup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your backup JSON file from the original InService Hub to import all your templates, 
                sessions, education records, and QA actions.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isRestoring ? 'Restoring...' : 'Select Backup File'}
              </Button>
            </div>

            {restoreResult && (
              <Alert variant={restoreResult.success ? 'default' : 'destructive'}>
                {restoreResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {restoreResult.success ? 'Restore Successful' : 'Restore Failed'}
                </AlertTitle>
                <AlertDescription>
                  {restoreResult.message}
                  {restoreResult.success && restoreResult.counts && (
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Templates: {restoreResult.counts.templates}</li>
                      <li>• Audit Sessions: {restoreResult.counts.sessions}</li>
                      <li>• Education Sessions: {restoreResult.counts.eduSessions}</li>
                      <li>• Education Topics: {restoreResult.counts.eduLibrary}</li>
                      <li>• QA Actions: {restoreResult.counts.qaActions}</li>
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="border-t pt-6">
            {/* Export Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Export Backup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a backup of all your current data.
                </p>
              </div>
              
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Backup
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Demo Data Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Demo Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate sample data for testing and demonstration purposes.
                </p>
              </div>
              
              <Button variant="secondary" onClick={handleLoadDemo}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Demo Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BackupSettingsModal 
        open={showBackupSettings} 
        onOpenChange={setShowBackupSettings}
        onSettingsUpdate={handleBackupSettingsUpdate}
      />
    </div>
  );
}
