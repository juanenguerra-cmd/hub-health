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
  Settings,
  Plus,
  X,
  MapPin,
  Cloud,
  Link2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BackupSettingsModal } from '@/components/BackupSettingsModal';
import { loadBackupSettings, updateLastBackupTime } from '@/lib/backup-settings-storage';
import { formatLastBackup } from '@/types/backup-settings';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { FacilityUnit } from '@/types/facility-units';

export function SettingsPage() {
  const { 
    facilityName, 
    setFacilityName,
    facilityUnits,
    setFacilityUnits,
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
  const [oneDriveLocation, setOneDriveLocation] = useState('');
  const [oneDriveConnected, setOneDriveConnected] = useState(false);
  
  // Unit management state
  const [newParentUnit, setNewParentUnit] = useState('');
  const [newWingInputs, setNewWingInputs] = useState<Record<string, string>>({});
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

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

  const handleConnectOneDrive = () => {
    const trimmed = oneDriveLocation.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Location Required',
        description: 'Enter your OneDrive folder path or shared location to connect.',
      });
      return;
    }
    setOneDriveConnected(true);
    toast({
      title: 'OneDrive Connected',
      description: `Backups will use ${trimmed} for import/export.`,
    });
  };

  const handleDisconnectOneDrive = () => {
    setOneDriveConnected(false);
    toast({
      title: 'OneDrive Disconnected',
      description: 'Backup import/export will use manual file selection.',
    });
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast({
      title: 'Demo Data Loaded',
      description: 'Sample data has been generated for testing.',
    });
  };

  // Unit management handlers
  const handleAddParentUnit = () => {
    const trimmed = newParentUnit.trim();
    if (!trimmed) return;
    if (facilityUnits.some(u => u.name === trimmed)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Unit',
        description: 'This parent unit already exists.',
      });
      return;
    }
    
    const newUnit: FacilityUnit = {
      id: `unit_${Date.now()}`,
      name: trimmed,
      wings: []
    };
    
    setFacilityUnits([...facilityUnits, newUnit]);
    setNewParentUnit('');
    setExpandedUnits(prev => new Set([...prev, newUnit.id]));
    toast({
      title: 'Unit Added',
      description: `"${trimmed}" has been added.`,
    });
  };

  const handleRemoveParentUnit = (unitId: string) => {
    const unit = facilityUnits.find(u => u.id === unitId);
    setFacilityUnits(facilityUnits.filter(u => u.id !== unitId));
    toast({
      title: 'Unit Removed',
      description: `"${unit?.name}" and its wings have been removed.`,
    });
  };

  const handleAddWing = (unitId: string) => {
    const wingName = newWingInputs[unitId]?.trim();
    if (!wingName) return;
    
    const unit = facilityUnits.find(u => u.id === unitId);
    if (!unit) return;
    
    if (unit.wings.includes(wingName)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Wing',
        description: 'This wing already exists for this unit.',
      });
      return;
    }
    
    setFacilityUnits(facilityUnits.map(u => 
      u.id === unitId 
        ? { ...u, wings: [...u.wings, wingName] }
        : u
    ));
    setNewWingInputs(prev => ({ ...prev, [unitId]: '' }));
    toast({
      title: 'Wing Added',
      description: `"${wingName}" added to ${unit.name}.`,
    });
  };

  const handleRemoveWing = (unitId: string, wing: string) => {
    setFacilityUnits(facilityUnits.map(u => 
      u.id === unitId 
        ? { ...u, wings: u.wings.filter(w => w !== wing) }
        : u
    ));
    toast({
      title: 'Wing Removed',
      description: `"${wing}" has been removed.`,
    });
  };

  const toggleUnitExpanded = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
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

      {/* Unit Configuration - Tree Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Unit Configuration
          </CardTitle>
          <CardDescription>
            Define facility units with optional East/West wings for drill-down compliance reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new parent unit */}
          <div className="flex gap-2">
            <Input
              value={newParentUnit}
              onChange={(e) => setNewParentUnit(e.target.value)}
              placeholder="Enter new unit name (e.g., Unit 2, Rehab, Memory Care)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParentUnit()}
            />
            <Button onClick={handleAddParentUnit} disabled={!newParentUnit.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>
          
          {/* Unit tree */}
          <div className="space-y-2">
            {facilityUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No units configured. Add units above to use them in audits and reports.
              </p>
            ) : (
              facilityUnits.map(unit => {
                const isExpanded = expandedUnits.has(unit.id);
                
                return (
                  <Collapsible key={unit.id} open={isExpanded} onOpenChange={() => toggleUnitExpanded(unit.id)}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{unit.name}</span>
                            {unit.wings.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {unit.wings.length} wing{unit.wings.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveParentUnit(unit.id);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t p-3 bg-muted/20 space-y-3">
                          {/* Existing wings */}
                          {unit.wings.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {unit.wings.map(wing => (
                                <Badge 
                                  key={wing} 
                                  variant="outline" 
                                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                                >
                                  {wing}
                                  <button
                                    onClick={() => handleRemoveWing(unit.id, wing)}
                                    className="hover:text-destructive transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Add wing input */}
                          <div className="flex gap-2">
                            <Input
                              value={newWingInputs[unit.id] || ''}
                              onChange={(e) => setNewWingInputs(prev => ({ ...prev, [unit.id]: e.target.value }))}
                              placeholder={`Add wing (e.g., East ${unit.name}, West ${unit.name})`}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddWing(unit.id)}
                              className="flex-1"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddWing(unit.id)}
                              disabled={!newWingInputs[unit.id]?.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Data Stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Current Data
              </CardTitle>
              <CardDescription>
                Overview of data stored in your application
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" />
              Local storage only • Not synced
            </div>
          </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-2">OneDrive Backup Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect a OneDrive-synced folder to standardize where backup files are saved and loaded.
                  </p>
                </div>
                {oneDriveConnected && (
                  <Badge variant="secondary" className="text-xs">
                    Connected
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="onedrive-location">OneDrive folder or shared path</Label>
                  <Input
                    id="onedrive-location"
                    value={oneDriveLocation}
                    onChange={(e) => setOneDriveLocation(e.target.value)}
                    placeholder="e.g., C:\\Users\\Name\\OneDrive\\Hub Health Backups"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a folder that is synced by OneDrive on this device. You can paste a shared path, too.
                  </p>
                </div>
                <div className="flex gap-2">
                  {oneDriveConnected ? (
                    <Button variant="outline" onClick={handleDisconnectOneDrive}>
                      <Cloud className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnectOneDrive}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect OneDrive
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
