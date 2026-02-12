import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutosaveOptions {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  interval?: number; // milliseconds
  enabled?: boolean;
  silent?: boolean; // Don't show toast notifications
}

export function useAutosave({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
  silent = false
}: AutosaveOptions) {
  const { toast } = useToast();
  const lastSavedData = useRef<string>(JSON.stringify(data));
  const isSaving = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveTime = useRef<Date>(new Date());

  const save = useCallback(async () => {
    if (isSaving.current || !enabled) return;
    
    const currentData = JSON.stringify(data);
    if (currentData === lastSavedData.current) return;

    isSaving.current = true;
    
    try {
      await onSave(data);
      lastSavedData.current = currentData;
      lastSaveTime.current = new Date();
      
      if (!silent) {
        toast({
          title: "Autosaved",
          description: `Changes saved at ${lastSaveTime.current.toLocaleTimeString()}`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      
      if (!silent) {
        toast({
          title: "Autosave failed",
          description: "Failed to save changes. Please save manually.",
          variant: "destructive",
        });
      }
    } finally {
      isSaving.current = false;
    }
  }, [data, onSave, enabled, silent, toast]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule next save
    saveTimeoutRef.current = setTimeout(save, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, save, interval, enabled]);

  // Manual save function
  const saveNow = useCallback(async () => {
    await save();
  }, [save]);

  // Get last save time
  const getLastSaveTime = useCallback(() => {
    return lastSaveTime.current;
  }, []);

  return { 
    saveNow, 
    getLastSaveTime,
    isSaving: isSaving.current 
  };
}
