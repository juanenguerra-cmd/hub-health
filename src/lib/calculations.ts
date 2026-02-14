// Nurse Educator Suite - Core Calculations
// Preserves all original logic for reports and trending

import type {
  AuditSession,
  AuditTemplate,
  QaAction,
  EducationSession,
  TrendDataPoint,
  ClosedLoopStats,
  SessionSummary,
  ToolSummary,
  UnitSummary,
  CritItem,
  ActionSummaryItem,
  SampleResult
} from '@/types/nurse-educator';
import type { TemplateQuestion } from '@/types/nurse-educator';
import { addDays as safeAddDays, daysBetween as safeDaysBetween, isDateBefore, isOverdue } from '@/lib/date-utils';

// Date utilities
export const todayYMD = (): string => new Date().toISOString().split('T')[0];
export const nowISO = (): string => new Date().toISOString();

export const dateAddDays = safeAddDays;

export const daysBetween = safeDaysBetween;

export const isCriticalFailTriggered = (question: TemplateQuestion, answer: string): boolean => {
  if (!answer) return false;
  const triggerValue = question.criticalFailIf || (question.criticalFail ? 'no' : '');
  if (!triggerValue) return false;
  return answer === triggerValue;
};

// Compute sample result from template and answers
export function computeSampleResult(tpl: AuditTemplate, answers: Record<string, string>): SampleResult {
  const scoring = tpl.scoring || { mode: 'sum', maxScore: 0, naPolicy: 'excludeFromDenominator' as const };
  let max = 0;
  let got = 0;
  const criticalFails: string[] = [];
  const actionNeeded: { key: string; label: string; reason: string }[] = [];

  for (const q of tpl.sampleQuestions || []) {
    const v = answers[q.key] ?? '';
    const points = q.points ?? q.score ?? 0;
    const affectsScore = q.affectsScore ?? points > 0;
    const isNA = v === 'na' && (q.type === 'ynna' || q.type === 'yn');

    if (q.required && (!v || String(v).trim() === '')) {
      actionNeeded.push({ key: q.key, label: q.label, reason: 'Required item missing' });
    }

    if (affectsScore && points > 0) {
      if (q.type === 'yn' || q.type === 'ynna') {
        if (isNA) {
          if (scoring.naPolicy === 'fullCredit') {
            max += points;
            got += points;
          } else if (scoring.naPolicy === 'zero') {
            max += points;
          }
        } else {
          max += points;
          if (v === 'yes') got += points;
        }
      }
    }

    const failsByQuestionRule = isCriticalFailTriggered(q, v);
    if (failsByQuestionRule && !criticalFails.includes(q.key)) {
      criticalFails.push(q.key);
    }
  }

  for (const k of tpl.criticalFailKeys || []) {
    if (answers[k] === 'no' && !criticalFails.includes(k)) criticalFails.push(k);
  }

  for (const gate of tpl.gatingRules || []) {
    if ((answers[gate.key] ?? '') === gate.failIf && !criticalFails.includes(gate.key)) {
      criticalFails.push(gate.key);
      const q = tpl.sampleQuestions?.find((item) => item.key === gate.key);
      actionNeeded.push({ key: gate.key, label: q?.label || gate.key, reason: gate.reason || 'Gating rule failed' });
    }
  }

  for (const k of criticalFails) {
    const q = tpl.sampleQuestions?.find((x) => x.key === k);
    if (q && !actionNeeded.find((a) => a.key === k)) {
      actionNeeded.push({ key: k, label: q.label, reason: 'Critical fail' });
    }
  }

  const deterministicMax = scoring.maxScore || max;
  const pct = max === 0 ? 100 : Math.round((got / max) * 100);
  const pass = pct >= (tpl.passingThreshold || 0) && criticalFails.length === 0;

  return { pct, pass, criticalFails, actionNeeded, max: deterministicMax, got };
}

// Compute trend series from sessions
export function computeTrendSeries(sessions: AuditSession[]): TrendDataPoint[] {
  const map: Record<string, { date: string; samples: number; passing: number; critical: number }> = {};
  
  for (const sess of sessions) {
    const d = sess.header?.auditDate || String(sess.createdAt || '').slice(0, 10);
    if (!d) continue;
    if (!map[d]) map[d] = { date: d, samples: 0, passing: 0, critical: 0 };
    
    for (const smp of sess.samples || []) {
      map[d].samples++;
      if (smp.result?.pass) map[d].passing++;
      map[d].critical += (smp.result?.criticalFails?.length || 0);
    }
  }
  
  const arr = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  return arr.map(x => ({
    date: x.date,
    samples: x.samples,
    critical: x.critical,
    compliance: x.samples ? Math.round((x.passing / x.samples) * 100) : 0
  }));
}

// Summarize sessions for dashboard/reports
export function summarizeSessions(sessions: AuditSession[]): SessionSummary {
  let samples = 0, passing = 0, criticalFails = 0;
  const byTool: Record<string, { total: number; passing: number; criticals: number }> = {};
  const byUnit: Record<string, { total: number; pass: number }> = {};
  const critItems: Record<string, { key: string; label: string; count: number }> = {};
  const actionItems: Record<string, { issue: string; template: string; count: number }> = {};

  for (const sess of sessions) {
    if (sess.header?.status !== 'complete') continue;
    
    const toolKey = sess.templateTitle || 'Unknown';
    const unitKey = sess.header?.unit || 'Unknown';
    
    if (!byTool[toolKey]) byTool[toolKey] = { total: 0, passing: 0, criticals: 0 };
    if (!byUnit[unitKey]) byUnit[unitKey] = { total: 0, pass: 0 };

    for (const smp of sess.samples || []) {
      samples++;
      byTool[toolKey].total++;
      byUnit[unitKey].total++;
      
      if (smp.result?.pass) {
        passing++;
        byTool[toolKey].passing++;
        byUnit[unitKey].pass++;
      }
      
      for (const cf of smp.result?.criticalFails || []) {
        criticalFails++;
        byTool[toolKey].criticals++;
        const q = { key: cf, label: cf };
        const k = cf;
        if (!critItems[k]) critItems[k] = { key: cf, label: cf, count: 0 };
        critItems[k].count++;
      }
      
      for (const a of smp.result?.actionNeeded || []) {
        const k = `${toolKey}|${a.label}`;
        if (!actionItems[k]) actionItems[k] = { issue: a.label, template: toolKey, count: 0 };
        actionItems[k].count++;
      }
    }
  }

  const compliance = samples ? Math.round((passing / samples) * 100) : 0;
  const criticalRate = samples ? Math.round((criticalFails / samples) * 100) : 0;

  const toolArr: ToolSummary[] = Object.entries(byTool)
    .map(([title, d]) => ({
      title,
      total: d.total,
      passing: d.passing,
      rate: d.total ? Math.round((d.passing / d.total) * 100) : 0,
      criticals: d.criticals
    }))
    .sort((a, b) => a.rate - b.rate);

  const unitArr: UnitSummary[] = Object.entries(byUnit)
    .map(([unit, d]) => ({
      unit,
      total: d.total,
      pass: d.pass,
      rate: d.total ? Math.round((d.pass / d.total) * 100) : 0
    }))
    .sort((a, b) => a.rate - b.rate);

  const critArr: CritItem[] = Object.values(critItems).sort((a, b) => b.count - a.count);
  const actionArr: ActionSummaryItem[] = Object.values(actionItems).sort((a, b) => b.count - a.count);

  return {
    sessions: sessions.filter(s => s.header?.status === 'complete').length,
    samples,
    passing,
    compliance,
    criticalFails,
    criticalRate,
    byTool: toolArr,
    byUnit: unitArr,
    critItems: critArr,
    actionItems: actionArr
  };
}

// Compute closed-loop QA stats
export function computeClosedLoopStats(actions: QaAction[]): ClosedLoopStats {
  const today = todayYMD();
  let total = 0, open = 0, prog = 0, done = 0;
  let closed7 = 0, closed14 = 0, closed30 = 0;
  let closeDaysSum = 0, closeDaysN = 0;
  const byOwner: Record<string, { open: number; in_progress: number; complete: number; overdue: number }> = {};
  const byUnit: Record<string, { open: number; in_progress: number; complete: number; overdue: number }> = {};

  for (const a of actions || []) {
    total++;
    const st = a.status || 'open';
    if (st === 'open') open++;
    else if (st === 'in_progress') prog++;
    else if (st === 'complete') done++;

    const owner = (a.owner || '').trim() || 'Unassigned';
    const unit = (a.unit || '').trim() || 'Unknown';
    
    if (!byOwner[owner]) byOwner[owner] = { open: 0, in_progress: 0, complete: 0, overdue: 0 };
    if (!byUnit[unit]) byUnit[unit] = { open: 0, in_progress: 0, complete: 0, overdue: 0 };
    
    byOwner[owner][st as keyof typeof byOwner[typeof owner]] = (byOwner[owner][st as keyof typeof byOwner[typeof owner]] || 0) + 1;
    byUnit[unit][st as keyof typeof byUnit[typeof unit]] = (byUnit[unit][st as keyof typeof byUnit[typeof unit]] || 0) + 1;

    if (st !== 'complete' && isDateBefore(a.dueDate || '', today)) {
      byOwner[owner].overdue++;
      byUnit[unit].overdue++;
    }

    if (st === 'complete' && a.completedAt) {
      const created = (a.createdAt || '').slice(0, 10);
      const comp = (a.completedAt || '').slice(0, 10);
      if (created && comp) {
        const d = daysBetween(created, comp);
        closeDaysSum += d;
        closeDaysN++;
        if (d <= 7) closed7++;
        if (d <= 14) closed14++;
        if (d <= 30) closed30++;
      }
    }
  }

  const closureRate = total ? Math.round((done / total) * 100) : 0;
  const avgCloseDays = closeDaysN ? Math.round((closeDaysSum / closeDaysN) * 10) / 10 : 0;
  const overdueCount = actions.filter((a) => isOverdue(a.dueDate || '', a.status)).length;

  return {
    total,
    open,
    prog,
    done,
    closureRate,
    closed7,
    closed14,
    closed30,
    overdueCount,
    avgCloseDays,
    byOwner,
    byUnit
  };
}

// Education topic category detection
const EDU_CATEGORY_RULES = [
  { id: 'Abuse/Neglect/Mistreatment', kws: ['abuse', 'neglect', 'mistreatment', 'exploitation', 'iuo'] },
  { id: 'Infection Prevention', kws: ['infection', 'hand hygiene', 'ppe', 'isolation', 'precaution', 'glove', 'mask', 'disinfection', 'c. difficile', 'mrsa', 'covid'] },
  { id: 'Medication Safety', kws: ['medication', 'meds', 'med pass', 'narcotic', 'controlled substance', 'pharmacy', 'antibiotic'] },
  { id: 'Falls & Resident Safety', kws: ['fall', 'falls', 'fall prevention', 'safety', 'alarm', 'siderail', 'restraint', 'rounding'] },
  { id: 'Skin/Wound & Pressure Injury', kws: ['wound', 'skin', 'pressure', 'pressure injury', 'ulcer', 'turning', 'braden', 'dressing'] },
  { id: 'Transfers, Lifts & Equipment', kws: ['hoyer', 'mechanical lift', 'transfer', 'gait belt', 'wheelchair', 'equipment safety'] },
  { id: 'Emergency Preparedness', kws: ['emergency', 'disaster', 'fire', 'evacuation', 'elopement', 'missing resident'] },
  { id: 'Documentation & Compliance', kws: ['documentation', 'charting', 'care plan', 'progress note', 'incident report', 'qapi', 'compliance'] },
  { id: 'Change in Condition', kws: ['change in condition', 'assessment', 'vital signs', 'oxygen', 'respiratory', 'sepsis', 'pain assessment'] },
  { id: 'Resident Rights', kws: ['resident rights', 'dignity', 'privacy', 'grievance', 'customer service'] },
];

export function detectEducationCategory(topic: string, extra: string = ''): string {
  const hay = `${topic} ${extra}`.toLowerCase();
  if (!hay.trim()) return 'Other/Unclassified';

  let best = { category: 'Other/Unclassified', score: 0 };
  
  for (const rule of EDU_CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.kws) {
      if (hay.includes(kw.toLowerCase())) score += 3;
    }
    if (score > best.score) best = { category: rule.id, score };
  }

  return best.score > 0 ? best.category : 'Other/Unclassified';
}

// Summarize education sessions
export function summarizeEducation(
  sessions: EducationSession[],
  fromYmd: string,
  toYmd: string,
  unit: string = ''
): { count: number; byCategory: Record<string, number>; topTopics: { topic: string; count: number }[] } {
  const filtered = sessions.filter(s => {
    if (s.status !== 'completed') return false;
    const dt = (s.completedDate || s.scheduledDate || s.createdAt || '').slice(0, 10);
    if (fromYmd && dt < fromYmd) return false;
    if (toYmd && dt > toYmd) return false;
    if (unit && s.unit !== unit) return false;
    return true;
  });

  const byCategory: Record<string, number> = {};
  const byTopic: Record<string, number> = {};

  for (const s of filtered) {
    const cat = s.category || detectEducationCategory(s.topic || '', s.summary || '');
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    
    const topic = s.topic || 'Unknown';
    byTopic[topic] = (byTopic[topic] || 0) + 1;
  }

  const topTopics = Object.entries(byTopic)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { count: filtered.length, byCategory, topTopics };
}

// Heatmap computation for analytics
export function computeHeatmap(sessions: AuditSession[]): {
  tools: string[];
  units: string[];
  data: Record<string, Record<string, { total: number; passing: number; rate: number; critical: number }>>;
} {
  const tools = new Set<string>();
  const units = new Set<string>();
  const data: Record<string, Record<string, { total: number; passing: number; rate: number; critical: number }>> = {};

  for (const sess of sessions) {
    if (sess.header?.status !== 'complete') continue;
    
    const tool = sess.templateTitle || 'Unknown';
    const unit = sess.header?.unit || 'Unknown';
    
    tools.add(tool);
    units.add(unit);
    
    if (!data[tool]) data[tool] = {};
    if (!data[tool][unit]) data[tool][unit] = { total: 0, passing: 0, rate: 0, critical: 0 };

    for (const smp of sess.samples || []) {
      data[tool][unit].total++;
      if (smp.result?.pass) data[tool][unit].passing++;
      data[tool][unit].critical += (smp.result?.criticalFails?.length || 0);
    }
  }

  // Calculate rates
  for (const tool of Object.keys(data)) {
    for (const unit of Object.keys(data[tool])) {
      const d = data[tool][unit];
      d.rate = d.total ? Math.round((d.passing / d.total) * 100) : 0;
    }
  }

  return {
    tools: Array.from(tools).sort(),
    units: Array.from(units).sort(),
    data
  };
}

// Filter sessions by date range
export function filterSessionsByRange(sessions: AuditSession[], daysAgo: number): AuditSession[] {
  if (daysAgo >= 9999) return sessions;
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  
  return sessions.filter(s => new Date(s.createdAt) >= cutoff);
}

// Filter QA actions by date range
export function filterActionsByRange(actions: QaAction[], daysAgo: number): QaAction[] {
  if (daysAgo >= 9999) return actions;
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  
  return actions.filter(a => new Date(a.createdAt) >= cutoff);
}

// Get compliance status class
export function getComplianceStatus(rate: number): 'success' | 'warning' | 'error' {
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'error';
}

// Format percentage with delta indicator
export function formatDelta(current: number, previous: number): { text: string; direction: 'up' | 'down' | 'neutral' } {
  const delta = current - previous;
  if (delta === 0) return { text: '0%', direction: 'neutral' };
  const sign = delta > 0 ? '+' : '';
  return { text: `${sign}${delta}%`, direction: delta > 0 ? 'up' : 'down' };
}


export function computeStaffPerformance(
  sessions: AuditSession[],
  actions: QaAction[],
  education: EducationSession[],
  dateRange: { start: string; end: string }
): import('@/types/nurse-educator').StaffPerformanceRecord[] {
  const staffMap = new Map<string, import('@/types/nurse-educator').StaffPerformanceRecord>();

  const inRange = (date: string) => {
    if (!date) return false;
    if (dateRange.start && date < dateRange.start) return false;
    if (dateRange.end && date > dateRange.end) return false;
    return true;
  };

  for (const session of sessions) {
    const auditDate = session.header?.auditDate || session.createdAt.slice(0, 10);
    if (!inRange(auditDate)) continue;

    for (const sample of session.samples) {
      const staffName = (sample.staffAudited || '').trim();
      if (!staffName) continue;

      const current = staffMap.get(staffName) ?? {
        staffId: staffName,
        staffName,
        role: sample.staffRole || 'Unspecified',
        period: { start: dateRange.start, end: dateRange.end },
        metrics: {
          totalAudits: 0,
          passedAudits: 0,
          passRate: 0,
          openQaActions: 0,
          completedQaActions: 0,
          educationHours: 0,
          requiredEducationComplete: false,
          trendDirection: 'stable' as const
        },
        recentIssues: []
      };

      current.metrics.totalAudits += 1;
      if (sample.result?.pass) current.metrics.passedAudits += 1;
      staffMap.set(staffName, current);
    }
  }

  for (const action of actions) {
    if (!inRange(action.auditDate || action.createdAt.slice(0, 10))) continue;
    const staffName = (action.staffAudited || '').trim();
    if (!staffName) continue;

    const current = staffMap.get(staffName) ?? {
      staffId: staffName,
      staffName,
      role: action.staffRole || 'Unspecified',
      period: { start: dateRange.start, end: dateRange.end },
      metrics: {
        totalAudits: 0,
        passedAudits: 0,
        passRate: 0,
        openQaActions: 0,
        completedQaActions: 0,
        educationHours: 0,
        requiredEducationComplete: false,
        trendDirection: 'stable' as const
      },
      recentIssues: []
    };

    if (action.status === 'complete') current.metrics.completedQaActions += 1;
    else current.metrics.openQaActions += 1;

    current.recentIssues.push({
      date: action.auditDate,
      issue: action.issue,
      template: action.templateTitle,
      status: action.status
    });

    staffMap.set(staffName, current);
  }

  for (const edu of education) {
    const sessionDate = edu.completedDate || edu.scheduledDate;
    if (!inRange(sessionDate)) continue;
    for (const attendee of edu.attendees || []) {
      const staffName = attendee.trim();
      if (!staffName) continue;
      const current = staffMap.get(staffName);
      if (!current) continue;
      current.metrics.educationHours += 1;
      staffMap.set(staffName, current);
    }
  }

  return Array.from(staffMap.values()).map((record) => {
    const passRate = record.metrics.totalAudits
      ? Math.round((record.metrics.passedAudits / record.metrics.totalAudits) * 10000) / 100
      : 0;
    return {
      ...record,
      metrics: {
        ...record.metrics,
        passRate,
        requiredEducationComplete: record.metrics.educationHours > 0,
        trendDirection: passRate >= 90 ? 'improving' : passRate < 70 ? 'declining' : 'stable'
      },
      recentIssues: record.recentIssues.slice(0, 5)
    };
  });
}

export function findRecurringIssues(actions: QaAction[], windowDays: number): QaAction[] {
  const cutoff = dateAddDays(todayYMD(), -windowDays);
  const counts = new Map<string, number>();
  for (const action of actions) {
    const date = action.auditDate || action.createdAt.slice(0, 10);
    if (date < cutoff) continue;
    const key = `${action.issue}::${action.unit}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return actions.filter((a) => (counts.get(`${a.issue}::${a.unit}`) || 0) >= 3);
}

export function countStaffWithMultipleActions(actions: QaAction[]): string[] {
  const open = actions.filter((a) => a.status !== 'complete' && a.staffAudited);
  const counts = new Map<string, number>();
  for (const action of open) {
    counts.set(action.staffAudited, (counts.get(action.staffAudited) || 0) + 1);
  }
  return Array.from(counts.entries()).filter(([, count]) => count >= 3).map(([name]) => name);
}
