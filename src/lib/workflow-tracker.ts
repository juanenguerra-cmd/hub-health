import { differenceInCalendarDays } from 'date-fns';
import type { AuditSession, EducationSession, QaAction } from '@/types/nurse-educator';

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  completedAt?: string;
  assignee?: string;
  linkedItemId?: string;
  linkedItemType?: 'session' | 'qa-action' | 'education';
  daysInStage?: number;
}

const daysSince = (date?: string) => {
  if (!date) return undefined;
  return Math.max(0, differenceInCalendarDays(new Date(), new Date(date)));
};

export const buildWorkflowStages = (
  qaAction: QaAction,
  sessions: AuditSession[],
  eduSessions: EducationSession[],
): WorkflowStage[] => {
  const linkedSession = sessions.find((item) => item.id === qaAction.sessionId || item.header.sessionId === qaAction.sessionId);
  const linkedEducation = eduSessions.find((item) => item.id === qaAction.linkedEduSessionId || item.linkedQaActionId === qaAction.id);

  return [
    {
      id: 'audit-finding',
      title: 'Audit Finding',
      description: qaAction.issue || 'Finding created from audit session.',
      status: linkedSession ? 'complete' : 'pending',
      completedAt: linkedSession?.createdAt,
      linkedItemId: linkedSession?.id,
      linkedItemType: linkedSession ? 'session' : undefined,
      daysInStage: daysSince(linkedSession?.createdAt),
    },
    {
      id: 'qa-created',
      title: 'QA Action Created',
      description: qaAction.summary || 'Action opened for follow-up.',
      status: qaAction.id ? 'complete' : 'pending',
      completedAt: qaAction.createdAt,
      assignee: qaAction.owner,
      linkedItemId: qaAction.id,
      linkedItemType: 'qa-action',
      daysInStage: daysSince(qaAction.createdAt),
    },
    {
      id: 'education-scheduled',
      title: 'Education Scheduled',
      description: 'Education session planned and linked.',
      status: linkedEducation ? 'complete' : qaAction.ev_educationProvided ? 'in-progress' : 'pending',
      completedAt: linkedEducation?.scheduledDate,
      linkedItemId: linkedEducation?.id,
      linkedItemType: linkedEducation ? 'education' : undefined,
      daysInStage: daysSince(linkedEducation?.scheduledDate),
    },
    {
      id: 'education-completed',
      title: 'Education Completed',
      description: 'Education intervention delivered.',
      status: linkedEducation?.status === 'completed' || qaAction.ev_educationProvided ? 'complete' : 'pending',
      completedAt: linkedEducation?.completedDate,
      linkedItemId: linkedEducation?.id,
      linkedItemType: linkedEducation ? 'education' : undefined,
      daysInStage: daysSince(linkedEducation?.completedDate),
    },
    {
      id: 'competency-validated',
      title: 'Competency Validated',
      description: 'Competency validation documented.',
      status: qaAction.ev_competencyValidated ? 'complete' : 'pending',
      completedAt: qaAction.ev_competencyValidated ? qaAction.completedAt || undefined : undefined,
      assignee: qaAction.owner,
    },
    {
      id: 'reaudit-scheduled',
      title: 'Re-Audit Scheduled',
      description: 'Re-audit date has been set.',
      status: qaAction.reAuditDueDate ? 'complete' : 'pending',
      completedAt: qaAction.reAuditDueDate || undefined,
      daysInStage: daysSince(qaAction.reAuditDueDate || undefined),
    },
    {
      id: 'reaudit-passed',
      title: 'Re-Audit Passed',
      description: 'Follow-up audit has passed.',
      status: qaAction.reAuditCompletedAt ? 'complete' : 'pending',
      completedAt: qaAction.reAuditCompletedAt || undefined,
      linkedItemId: qaAction.reAuditSessionRef || undefined,
      linkedItemType: qaAction.reAuditSessionRef ? 'session' : undefined,
      daysInStage: daysSince(qaAction.reAuditCompletedAt || undefined),
    },
    {
      id: 'closed',
      title: 'Closed',
      description: 'QA action is fully closed.',
      status: qaAction.status === 'complete' ? 'complete' : qaAction.status === 'in_progress' ? 'in-progress' : 'pending',
      completedAt: qaAction.completedAt || undefined,
      assignee: qaAction.owner,
      daysInStage: daysSince(qaAction.completedAt || undefined),
    },
  ];
};

export const calculateWorkflowMetrics = (stages: WorkflowStage[]) => {
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.status === 'complete').length;
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const blockedStage = stages.find((stage) => stage.status === 'blocked');
  const completedDates = stages.map((stage) => stage.completedAt).filter(Boolean) as string[];
  const totalDays = completedDates.length > 0
    ? Math.max(0, differenceInCalendarDays(new Date(Math.max(...completedDates.map((item) => new Date(item).getTime()))), new Date(Math.min(...completedDates.map((item) => new Date(item).getTime())))))
    : 0;

  return {
    totalDays,
    completedStages,
    totalStages,
    progressPercent,
    isBlocked: !!blockedStage,
    blockedReason: blockedStage?.description,
  };
};

export const getNextWorkflowAction = (stages: WorkflowStage[]) => {
  const pendingStage = stages.find((stage) => stage.status === 'pending' || stage.status === 'blocked');
  if (!pendingStage) {
    return {
      action: 'Monitor',
      description: 'Workflow is complete. Continue routine monitoring.',
      linkTo: '/qa-actions',
    };
  }

  const linkMap: Record<string, string> = {
    'education-scheduled': '/education',
    'education-completed': '/education',
    'reaudit-scheduled': '/sessions',
    'reaudit-passed': '/sessions',
    closed: '/qa-actions',
  };

  return {
    action: pendingStage.title,
    description: `Next best step: ${pendingStage.description}`,
    linkTo: linkMap[pendingStage.id] ?? '/qa-actions',
  };
};
