import { useEffect } from 'react';
import { loadBackupSettings } from '@/lib/backup-settings-storage';

/**
 * Hook to warn users before closing browser if backup warning is enabled
 * and data hasn't been backed up recently
 */
export function useBrowserCloseWarning(hasUnsavedData: boolean = true) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const settings = loadBackupSettings();
      
      // Only show warning if enabled and there's data that might not be backed up
      if (!settings.browserCloseWarning || !hasUnsavedData) {
        return;
      }
      
      // Check if we've ever backed up or if it's been too long
      const shouldWarn = !settings.lastBackupAt || 
        (Date.now() - new Date(settings.lastBackupAt).getTime() > 24 * 60 * 60 * 1000);
      
      if (shouldWarn) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedData]);
}
