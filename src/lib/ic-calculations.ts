import type { AuditSession, QaAction, EducationSession, AuditTemplate } from '@/types/nurse-educator';
import { todayYMD, dateAddDays } from './calculations';

export interface ICReport {
  period: { start: string; end: string; label: string };
  summary: {
    totalAudits: number;
    totalSamples: number;
    passingSamples: number;
    complianceRate: number;
    criticalFails: number;
    priorMonthComparison: {
      complianceChange: number;
      criticalFailsChange: number;
    };
  };
  byTemplate: Array<{
    templateTitle: string;
    templateId: string;
    samples: number;
    passing: number;
    rate: number;
    criticals: number;
    ftags: string[];
    trend: 'improving' | 'declining' | 'stable';
  }>;
  byFTag: Array<{
    ftag: string;
    description: string;
    audits: number;
    compliance: number;
    status: 'compliant' | 'at-risk' | 'non-compliant';
  }>;
  education: {
    sessionsCompleted: number;
    topicsCount: number;
    attendanceTotal: number;
    linkedToQA: number;
    effectiveness: number;
  };
  qaActions: {
    total: number;
    open: number;
    overdue: number;
    closed: number;
    avgDaysToClose: number;
    recurringIssues: Array<{
      issue: string;
      count: number;
      templates: string[];
    }>;
  };
  trendData: Array<{
    month: string;
    compliance: number;
    criticals: number;
    actions: number;
  }>;
  recommendations: string[];
}

const IC_FTAG_DEFINITIONS: Record<string, string> = {
  F880: 'Infection Prevention and Control Program',
  F881: 'Antibiotic Stewardship Program',
  F882: 'Infection Preventionist',
  F883: 'System for Preventing, Identifying, Reporting, Investigating',
  F884: 'Linens',
  F885: 'Dialysis',
  F886: 'Influenza and Pneumococcal Immunizations',
  F887: 'Influenza Vaccination Offered to Staff',
  F888: 'Reporting COVID-19'
};

const IC_KEYWORDS = [
  'infection',
  'control',
  'hand hygiene',
  'ppe',
  'isolation',
  'precaution',
  'transmiss',
  'covid',
  'influenza',
  'pneumonia',
  'mrsa',
  'uti',
  'catheter',
  'wound',
  'antibiotic',
  'sterilization',
  'sanitiz',
  'disinfect',
  'bloodborne'
];

export function isICRelated(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return IC_KEYWORDS.some(kw => lower.includes(kw));
}

export function generateICReport(
  sessions: AuditSession[],
  qaActions: QaAction[],
  eduSessions: EducationSession[],
  templates: AuditTemplate[],
  monthsBack: number = 0
): ICReport {
  const today = todayYMD();
  const targetDate = monthsBack === 0 ? today : dateAddDays(today, -30 * monthsBack);
  const monthStart = targetDate.slice(0, 8) + '01';
  const monthEnd = getLastDayOfMonth(targetDate);
  const priorMonthStart = dateAddDays(monthStart, -30);
  const priorMonthEnd = dateAddDays(monthStart, -1);

  const icSessions = sessions.filter(s => {
    const auditDate = s.header?.auditDate || s.createdAt.slice(0, 10);
    if (auditDate < monthStart || auditDate > monthEnd) return false;
    const template = templates.find(t => t.id === s.templateId);
    return Boolean(template && isICRelated(template.title));
  });

  const icActions = qaActions.filter(a => {
    const actionDate = a.createdAt.slice(0, 10);
    if (actionDate < monthStart || actionDate > monthEnd) return false;
    return isICRelated(a.templateTitle) || isICRelated(a.issue);
  });

  const icEdu = eduSessions.filter(e => {
    const eduDate = (e.completedDate || e.scheduledDate || '').slice(0, 10);
    if (eduDate < monthStart || eduDate > monthEnd) return false;
    return isICRelated(e.topic);
  });

  const priorSessions = sessions.filter(s => {
    const auditDate = s.header?.auditDate || s.createdAt.slice(0, 10);
    if (auditDate < priorMonthStart || auditDate > priorMonthEnd) return false;
    const template = templates.find(t => t.id === s.templateId);
    return Boolean(template && isICRelated(template.title));
  });

  let totalSamples = 0;
  let passingSamples = 0;
  let criticalFails = 0;

  for (const session of icSessions) {
    for (const sample of session.samples || []) {
      totalSamples++;
      if (sample.result?.pass) passingSamples++;
      criticalFails += sample.result?.criticalFails?.length || 0;
    }
  }

  let priorTotalSamples = 0;
  let priorPassingSamples = 0;
  let priorCriticalFails = 0;

  for (const session of priorSessions) {
    for (const sample of session.samples || []) {
      priorTotalSamples++;
      if (sample.result?.pass) priorPassingSamples++;
      priorCriticalFails += sample.result?.criticalFails?.length || 0;
    }
  }

  const complianceRate = totalSamples > 0 ? Math.round((passingSamples / totalSamples) * 100) : 0;
  const priorComplianceRate = priorTotalSamples > 0 ? Math.round((priorPassingSamples / priorTotalSamples) * 100) : 0;

  const templateMap = new Map<string, {
    templateTitle: string;
    templateId: string;
    samples: number;
    passing: number;
    criticals: number;
    ftags: string[];
  }>();

  for (const session of icSessions) {
    const template = templates.find(t => t.id === session.templateId);
    if (!template) continue;

    if (!templateMap.has(session.templateId)) {
      templateMap.set(session.templateId, {
        templateTitle: template.title,
        templateId: session.templateId,
        samples: 0,
        passing: 0,
        criticals: 0,
        ftags: template.ftagTags || []
      });
    }

    const entry = templateMap.get(session.templateId);
    if (!entry) continue;

    for (const sample of session.samples || []) {
      entry.samples++;
      if (sample.result?.pass) entry.passing++;
      entry.criticals += sample.result?.criticalFails?.length || 0;
    }
  }

  const byTemplate = Array.from(templateMap.values()).map(t => ({
    ...t,
    rate: t.samples > 0 ? Math.round((t.passing / t.samples) * 100) : 0,
    trend: calculateTemplateTrend(t.templateId, sessions, monthStart, monthEnd)
  }));

  const byFTag = calculateFTagCompliance(icSessions, templates);

  const eduLinkedToQA = icActions.filter(a => (a.linkedEducationSessions || []).length > 0).length;
  const eduResolvedActions = icActions.filter(a => a.status === 'complete' && (a.linkedEducationSessions || []).length > 0).length;
  const eduEffectiveness = eduLinkedToQA > 0 ? Math.round((eduResolvedActions / eduLinkedToQA) * 100) : 0;

  const eduTopics = new Set(icEdu.map(e => e.topic)).size;
  const eduAttendance = icEdu.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);

  const openActions = icActions.filter(a => a.status === 'open' || a.status === 'in_progress').length;
  const overdueActions = icActions.filter(a => a.status !== 'complete' && a.dueDate && a.dueDate < today).length;
  const closedActions = icActions.filter(a => a.status === 'complete').length;

  const closedWithDays = icActions.filter(a => a.status === 'complete' && a.completedAt && a.createdAt);
  const avgDaysToClose = closedWithDays.length > 0
    ? Math.round(closedWithDays.reduce((sum, a) => {
      const days = Math.abs((new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / closedWithDays.length)
    : 0;

  const recurringIssues = findRecurringICIssues(icActions);
  const trendData = generateTrendData(sessions, qaActions, templates, 6);
  const recommendations = generateRecommendations(complianceRate, criticalFails, overdueActions, byTemplate, recurringIssues);

  return {
    period: {
      start: monthStart,
      end: monthEnd,
      label: formatMonthLabel(targetDate)
    },
    summary: {
      totalAudits: icSessions.length,
      totalSamples,
      passingSamples,
      complianceRate,
      criticalFails,
      priorMonthComparison: {
        complianceChange: complianceRate - priorComplianceRate,
        criticalFailsChange: criticalFails - priorCriticalFails
      }
    },
    byTemplate,
    byFTag,
    education: {
      sessionsCompleted: icEdu.filter(e => e.status === 'completed').length,
      topicsCount: eduTopics,
      attendanceTotal: eduAttendance,
      linkedToQA: eduLinkedToQA,
      effectiveness: eduEffectiveness
    },
    qaActions: {
      total: icActions.length,
      open: openActions,
      overdue: overdueActions,
      closed: closedActions,
      avgDaysToClose,
      recurringIssues
    },
    trendData,
    recommendations
  };
}

function getLastDayOfMonth(dateStr: string): string {
  const [year, month] = dateStr.slice(0, 7).split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function formatMonthLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function calculateTemplateTrend(
  templateId: string,
  sessions: AuditSession[],
  monthStart: string,
  monthEnd: string
): 'improving' | 'declining' | 'stable' {
  const priorMonthStart = dateAddDays(monthStart, -30);
  const priorMonthEnd = dateAddDays(monthStart, -1);

  const currentSessions = sessions.filter(s => {
    const date = s.header?.auditDate || s.createdAt.slice(0, 10);
    return s.templateId === templateId && date >= monthStart && date <= monthEnd;
  });

  const priorSessions = sessions.filter(s => {
    const date = s.header?.auditDate || s.createdAt.slice(0, 10);
    return s.templateId === templateId && date >= priorMonthStart && date <= priorMonthEnd;
  });

  const currentRate = calculateSessionsComplianceRate(currentSessions);
  const priorRate = calculateSessionsComplianceRate(priorSessions);
  const delta = currentRate - priorRate;

  if (delta > 5) return 'improving';
  if (delta < -5) return 'declining';
  return 'stable';
}

function calculateSessionsComplianceRate(sessions: AuditSession[]): number {
  let total = 0;
  let passing = 0;

  for (const session of sessions) {
    for (const sample of session.samples || []) {
      total++;
      if (sample.result?.pass) passing++;
    }
  }

  return total > 0 ? (passing / total) * 100 : 0;
}

function calculateFTagCompliance(
  sessions: AuditSession[],
  templates: AuditTemplate[]
): Array<{
  ftag: string;
  description: string;
  audits: number;
  compliance: number;
  status: 'compliant' | 'at-risk' | 'non-compliant';
}> {
  const ftagMap = new Map<string, { samples: number; passing: number; audits: Set<string> }>();

  for (const session of sessions) {
    const template = templates.find(t => t.id === session.templateId);
    if (!template || !template.ftagTags) continue;

    for (const ftag of template.ftagTags) {
      if (!ftag.startsWith('F88')) continue;

      if (!ftagMap.has(ftag)) {
        ftagMap.set(ftag, { samples: 0, passing: 0, audits: new Set() });
      }

      const entry = ftagMap.get(ftag);
      if (!entry) continue;

      entry.audits.add(session.id);

      for (const sample of session.samples || []) {
        entry.samples++;
        if (sample.result?.pass) entry.passing++;
      }
    }
  }

  return Array.from(ftagMap.entries())
    .map(([ftag, data]) => {
      const compliance = data.samples > 0 ? Math.round((data.passing / data.samples) * 100) : 0;

      return {
        ftag,
        description: IC_FTAG_DEFINITIONS[ftag] || ftag,
        audits: data.audits.size,
        compliance,
        status: compliance >= 90 ? 'compliant' : compliance >= 75 ? 'at-risk' : 'non-compliant'
      };
    })
    .sort((a, b) => a.ftag.localeCompare(b.ftag));
}

function findRecurringICIssues(actions: QaAction[]): Array<{ issue: string; count: number; templates: string[] }> {
  const issueMap = new Map<string, { count: number; templates: Set<string>; displayIssue: string }>();

  for (const action of actions) {
    const displayIssue = (action.issue || '').trim();
    const issueKey = displayIssue.toLowerCase();
    if (!issueKey) continue;

    if (!issueMap.has(issueKey)) {
      issueMap.set(issueKey, { count: 0, templates: new Set(), displayIssue });
    }

    const entry = issueMap.get(issueKey);
    if (!entry) continue;

    entry.count++;
    entry.templates.add(action.templateTitle);
  }

  return Array.from(issueMap.entries())
    .filter(([, data]) => data.count >= 3)
    .map(([, data]) => ({
      issue: data.displayIssue,
      count: data.count,
      templates: Array.from(data.templates)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function generateTrendData(
  sessions: AuditSession[],
  actions: QaAction[],
  templates: AuditTemplate[],
  months: number
): Array<{ month: string; compliance: number; criticals: number; actions: number }> {
  const result: Array<{ month: string; compliance: number; criticals: number; actions: number }> = [];
  const today = todayYMD();

  for (let i = months - 1; i >= 0; i--) {
    const targetDate = dateAddDays(today, -30 * i);
    const monthStart = targetDate.slice(0, 8) + '01';
    const monthEnd = getLastDayOfMonth(targetDate);

    const monthSessions = sessions.filter(s => {
      const date = s.header?.auditDate || s.createdAt.slice(0, 10);
      if (date < monthStart || date > monthEnd) return false;
      const template = templates.find(t => t.id === s.templateId);
      return Boolean(template && isICRelated(template.title));
    });

    const monthActions = actions.filter(a => {
      const date = a.createdAt.slice(0, 10);
      if (date < monthStart || date > monthEnd) return false;
      return isICRelated(a.templateTitle) || isICRelated(a.issue);
    });

    let samples = 0;
    let passing = 0;
    let criticals = 0;

    for (const session of monthSessions) {
      for (const sample of session.samples || []) {
        samples++;
        if (sample.result?.pass) passing++;
        criticals += sample.result?.criticalFails?.length || 0;
      }
    }

    result.push({
      month: formatMonthLabel(targetDate).slice(0, 3),
      compliance: samples > 0 ? Math.round((passing / samples) * 100) : 0,
      criticals,
      actions: monthActions.length
    });
  }

  return result;
}

function generateRecommendations(
  compliance: number,
  criticals: number,
  overdue: number,
  templates: Array<{ templateTitle: string; rate: number }>,
  recurring: Array<{ issue: string; count: number }>
): string[] {
  const recs: string[] = [];

  if (compliance < 85) {
    recs.push('IC compliance below threshold (85%) - Schedule focused re-education and competency validation');
  } else if (compliance >= 90 && compliance < 95) {
    recs.push('IC compliance within acceptable range - Continue monitoring and targeted interventions');
  } else if (compliance >= 95) {
    recs.push('Excellent IC compliance - Recognize staff performance and maintain current practices');
  }

  if (criticals > 0) {
    recs.push(`Address ${criticals} critical IC finding(s) immediately - Document corrective actions and re-audit within 72 hours`);
  }

  if (overdue > 0) {
    recs.push(`Clear ${overdue} overdue IC action(s) - Assign owners and establish realistic completion dates`);
  }

  const lowTemplates = templates.filter(t => t.rate < 85);
  if (lowTemplates.length > 0) {
    recs.push(`Focus improvement efforts on: ${lowTemplates.map(t => t.templateTitle).join(', ')}`);
  }

  if (recurring.length > 0) {
    recs.push(`Investigate systemic causes for recurring issues: ${recurring[0].issue} (${recurring[0].count}x occurrences)`);
  }

  if (recs.length === 0) {
    recs.push('All IC metrics within target ranges - Continue current practices and scheduled monitoring');
  }

  recs.push('Ensure IP quarterly reports submitted to QAPI committee per F880 requirements');
  recs.push('Verify antibiotic stewardship program documentation current (F881 compliance)');

  return recs;
}
