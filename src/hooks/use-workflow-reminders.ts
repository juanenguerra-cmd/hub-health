import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays } from 'date-fns';
import { useApp } from '@/contexts/AppContext';

const DISMISSED_KEY = 'hub-health.dismissed-reminders';

export interface Reminder {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionLabel: string;
  action: () => void;
  dueDate?: string;
  itemId: string;
}

export function useWorkflowReminders() {
  const { qaActions, eduSessions } = useApp();
  const navigate = useNavigate();

  const dismissed = useMemo(() => {
    const rawValue = localStorage.getItem(DISMISSED_KEY);
    if (!rawValue) return [] as string[];

    try {
      return JSON.parse(rawValue) as string[];
    } catch {
      return [];
    }
  }, []);

  const reminders = useMemo(() => {
    const today = new Date();
    const candidates: Reminder[] = [];

    qaActions.forEach((action) => {
      if (action.status === 'complete') return;
      if (!action.dueDate) return;

      const days = differenceInCalendarDays(new Date(action.dueDate), today);
      if (days < 0) {
        candidates.push({
          id: `qa-overdue-${action.id}`,
          type: 'qa-overdue',
          priority: 'high',
          title: 'Overdue QA action',
          message: `${action.issue || 'Action'} is overdue.`,
          actionLabel: 'Open QA action',
          action: () => navigate('/qa-actions'),
          dueDate: action.dueDate,
          itemId: action.id,
        });
      } else if (days <= 3) {
        candidates.push({
          id: `qa-soon-${action.id}`,
          type: 'qa-due-soon',
          priority: 'medium',
          title: 'QA action due soon',
          message: `${action.issue || 'Action'} is due in ${days} day(s).`,
          actionLabel: 'Review action',
          action: () => navigate('/qa-actions'),
          dueDate: action.dueDate,
          itemId: action.id,
        });
      }
    });

    eduSessions.forEach((session) => {
      if (session.status === 'planned' && session.scheduledDate === today.toISOString().slice(0, 10)) {
        candidates.push({
          id: `edu-today-${session.id}`,
          type: 'education-today',
          priority: 'low',
          title: 'Education scheduled today',
          message: `${session.topic || 'Education session'} is scheduled for today.`,
          actionLabel: 'Open education',
          action: () => navigate('/education'),
          dueDate: session.scheduledDate,
          itemId: session.id,
        });
      }
    });

    return candidates.filter((item) => !dismissed.includes(item.id));
  }, [dismissed, eduSessions, navigate, qaActions]);

  const dismissReminder = (id: string) => {
    const next = [...dismissed, id];
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  return { reminders, dismissReminder };
}
