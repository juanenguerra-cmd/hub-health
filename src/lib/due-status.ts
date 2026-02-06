import { daysBetween } from '@/lib/calculations';

export type DueStatus = {
  status: 'overdue' | 'due-soon' | 'upcoming';
  daysUntil: number;
  isOverdue: boolean;
};

export const getDueStatus = (today: string, dueDate: string, dueSoonDays = 7): DueStatus => {
  const isOverdue = dueDate < today;
  const daysUntil = isOverdue ? -daysBetween(dueDate, today) : daysBetween(today, dueDate);
  const status = isOverdue ? 'overdue' : daysUntil <= dueSoonDays ? 'due-soon' : 'upcoming';

  return { status, daysUntil, isOverdue };
};
