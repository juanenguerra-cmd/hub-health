import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AutoSaveOptions {
  debounceMs?: number;
}

interface DraftEnvelope<T> {
  updatedAt: string;
  payload: T;
}

/**
 * Auto-save hook for wizard/form flows backed by localStorage.
 */
export function useAutoSave<T>(draftKey: string, formData: T, options: AutoSaveOptions = {}) {
  const debounceMs = options.debounceMs ?? 30_000;
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [restoredDraft, setRestoredDraft] = useState<T | null>(null);
  const timerRef = useRef<number | null>(null);

  const readDraft = useCallback(() => {
    const rawValue = localStorage.getItem(draftKey);
    if (!rawValue) return null;

    try {
      return JSON.parse(rawValue) as DraftEnvelope<T>;
    } catch {
      return null;
    }
  }, [draftKey]);

  const saveDraft = useCallback((payload: T = formData) => {
    const envelope: DraftEnvelope<T> = {
      updatedAt: new Date().toISOString(),
      payload,
    };

    localStorage.setItem(draftKey, JSON.stringify(envelope));
    setLastSaved(envelope.updatedAt);
    toast.success('Draft saved');
  }, [draftKey, formData]);

  const restoreDraft = useCallback(() => {
    const draft = readDraft();
    if (!draft) return null;

    setRestoredDraft(draft.payload);
    setLastSaved(draft.updatedAt);
    return draft.payload;
  }, [readDraft]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setRestoredDraft(null);
    setLastSaved(null);
  }, [draftKey]);

  const hasNewerDraft = useMemo(() => {
    const existingDraft = readDraft();
    if (!existingDraft || !lastSaved) return false;
    return new Date(existingDraft.updatedAt).getTime() > new Date(lastSaved).getTime();
  }, [lastSaved, readDraft]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      saveDraft(formData);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [debounceMs, formData, saveDraft]);

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    lastSaved,
    restoredDraft,
    hasNewerDraft,
  };
}
