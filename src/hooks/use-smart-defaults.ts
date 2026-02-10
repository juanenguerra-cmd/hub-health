import { useCallback } from 'react';
import { addDays } from 'date-fns';
import { useApp } from '@/contexts/AppContext';

const DEFAULTS_KEY = 'hub-health.audit-defaults';

type SavedDefaults = {
  unit?: string;
  auditor?: string;
};

function loadDefaults(): SavedDefaults {
  const rawValue = localStorage.getItem(DEFAULTS_KEY);
  if (!rawValue) return {};

  try {
    return JSON.parse(rawValue) as SavedDefaults;
  } catch {
    return {};
  }
}

export const useSmartDefaults = () => {
  const { templates, qaActions } = useApp();

  const getDefaultUnit = useCallback(() => loadDefaults().unit ?? '', []);
  const getDefaultAuditor = useCallback(() => loadDefaults().auditor ?? '', []);

  const suggestAuditDate = useCallback((templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return new Date().toISOString().slice(0, 10);

    const dayOffset = template.category.toLowerCase().includes('weekly') ? 7 : 30;
    return addDays(new Date(), dayOffset).toISOString().slice(0, 10);
  }, [templates]);

  const suggestStaffForReAudit = useCallback((qaActionId?: string) => {
    if (!qaActionId) return '';
    return qaActions.find((item) => item.id === qaActionId)?.staffAudited ?? '';
  }, [qaActions]);

  const saveDefaults = useCallback((unit: string, auditor: string) => {
    const payload: SavedDefaults = { unit, auditor };
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(payload));
  }, []);

  return {
    getDefaultUnit,
    getDefaultAuditor,
    suggestAuditDate,
    suggestStaffForReAudit,
    saveDefaults,
  };
};
