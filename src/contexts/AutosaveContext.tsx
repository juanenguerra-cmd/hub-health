import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { useAutosave } from '@/hooks/use-autosave';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AutosaveContextType {
  saveNow: () => void;
  getLastSaveTime: () => Date;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const AutosaveContext = createContext<AutosaveContextType | undefined>(undefined);

const AUTOSAVE_KEY = 'hub-health-autosave';
const AUTOSAVE_ENABLED_KEY = 'hub-health-autosave-enabled';

export function AutosaveProvider({ children }: { children: ReactNode }) {
  const { sessions, setSessions, qaActions, setQaActions, eduSessions, setEduSessions } = useApp();
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(AUTOSAVE_ENABLED_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);

  // Check for autosaved data on mount
  useEffect(() => {
    const autosaved = localStorage.getItem(AUTOSAVE_KEY);
    if (!autosaved) return;

    try {
      const parsed = JSON.parse(autosaved);
      const { sessions: savedSessions, qaActions: savedActions, eduSessions: savedEdu, timestamp } = parsed;
      
      if (!timestamp) return;
      
      const autosavedDate = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - autosavedDate.getTime()) / (1000 * 60 * 60);
      
      // Only offer recovery if within 24 hours and there's data
      if (hoursDiff < 24 && (savedSessions?.length || savedActions?.length || savedEdu?.length)) {
        setRecoveryData({
          sessions: savedSessions || [],
          qaActions: savedActions || [],
          eduSessions: savedEdu || [],
          timestamp: autosavedDate
        });
        setShowRecoveryDialog(true);
      } else {
        // Clear old autosave data
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    } catch (error) {
      console.error('Failed to parse autosave data:', error);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  }, []);

  const handleRestore = () => {
    if (!recoveryData) return;
    
    setSessions(recoveryData.sessions);
    setQaActions(recoveryData.qaActions);
    setEduSessions(recoveryData.eduSessions);
    
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  };

  const handleDiscard = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  };

  const { saveNow, getLastSaveTime } = useAutosave({
    data: { sessions, qaActions, eduSessions },
    onSave: async (data) => {
      // Save to localStorage
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      // TODO: Optionally sync to Cloudflare D1 when backend API is ready
      // await fetch('/api/autosave', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
    },
    interval: 30000, // 30 seconds
    enabled: isEnabled,
    silent: false
  });

  // Persist autosave enabled state
  useEffect(() => {
    localStorage.setItem(AUTOSAVE_ENABLED_KEY, String(isEnabled));
  }, [isEnabled]);

  return (
    <AutosaveContext.Provider value={{ 
      saveNow, 
      getLastSaveTime,
      isEnabled,
      setEnabled: setIsEnabled
    }}>
      {children}
      
      {/* Recovery Dialog */}
      <AlertDialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Autosaved Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Found autosaved data from {recoveryData?.timestamp.toLocaleString()}.
              
              {recoveryData && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Audit Sessions:</div>
                    <div>{recoveryData.sessions?.length || 0}</div>
                    
                    <div className="font-medium">QA Actions:</div>
                    <div>{recoveryData.qaActions?.length || 0}</div>
                    
                    <div className="font-medium">Education Sessions:</div>
                    <div>{recoveryData.eduSessions?.length || 0}</div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscard}>Discard</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore Data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AutosaveContext.Provider>
  );
}

export function useAutosaveContext() {
  const context = useContext(AutosaveContext);
  if (!context) {
    throw new Error('useAutosaveContext must be used within AutosaveProvider');
  }
  return context;
}
