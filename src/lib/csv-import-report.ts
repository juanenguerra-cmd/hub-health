export interface CourseCompletionStaffRow {
  staffName: string;
  department: string;
  totalModules: number;
  completedModules: number;
  completionRate: number;
  averageScore: number;
  reviewNotes: string[];
}

export interface CourseCompletionSummary {
  staffCount: number;
  totalModules: number;
  completedModules: number;
  completionRate: number;
  averageScore: number;
}

export interface CourseCompletionReport {
  staffRows: CourseCompletionStaffRow[];
  departmentSummary: CourseCompletionSummary;
}

export interface ChecklistCompletionRow {
  checklistName: string;
  totalItems: number;
  completedItems: number;
  completionRate: number;
}

export interface ParsedChecklistReport {
  checklists: ChecklistCompletionRow[];
  checklistNames: string[];
}

const COMPLETED_VALUES = new Set(['complete', 'completed', 'yes', 'y', 'done', 'pass', 'passed', '1', 'true']);

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const normalizeHeader = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const findHeader = (headers: string[], candidates: string[]): string | null => {
  for (const candidate of candidates) {
    if (headers.includes(candidate)) {
      return candidate;
    }
  }
  return null;
};

const toNumber = (value: string | undefined): number => {
  if (!value) return 0;
  const cleanValue = value.replace('%', '').trim();
  const parsed = Number(cleanValue);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isCompleted = (value: string | undefined): boolean => {
  if (!value) return false;
  return COMPLETED_VALUES.has(value.trim().toLowerCase());
};

export const parseCsvRecords = (content: string): Array<Record<string, string>> => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headerValues = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const rowValues = parseCsvLine(line);
    return headerValues.reduce<Record<string, string>>((record, header, index) => {
      record[header] = rowValues[index] || '';
      return record;
    }, {});
  });
};

export const buildCourseCompletionReport = (content: string): CourseCompletionReport => {
  const records = parseCsvRecords(content);
  if (!records.length) {
    return {
      staffRows: [],
      departmentSummary: {
        staffCount: 0,
        totalModules: 0,
        completedModules: 0,
        completionRate: 0,
        averageScore: 0,
      },
    };
  }

  const headers = Object.keys(records[0]);
  const staffHeader = findHeader(headers, ['staff', 'staffname', 'employee', 'employeename', 'name']);
  const departmentHeader = findHeader(headers, ['department', 'unit', 'team']);
  const statusHeader = findHeader(headers, ['status', 'completionstatus', 'completed']);
  const scoreHeader = findHeader(headers, ['score', 'percent', 'percentage', 'result']);
  const reviewHeader = findHeader(headers, ['review', 'reviewnotes', 'notes', 'comments']);

  const byStaff = new Map<string, {
    staffName: string;
    department: string;
    totalModules: number;
    completedModules: number;
    scoreTotal: number;
    scoreCount: number;
    reviewNotes: string[];
  }>();

  for (const record of records) {
    const staffName = (staffHeader ? record[staffHeader] : '') || 'Unknown Staff';
    const department = (departmentHeader ? record[departmentHeader] : '') || 'Unassigned';
    const mapKey = `${staffName}::${department}`;

    if (!byStaff.has(mapKey)) {
      byStaff.set(mapKey, {
        staffName,
        department,
        totalModules: 0,
        completedModules: 0,
        scoreTotal: 0,
        scoreCount: 0,
        reviewNotes: [],
      });
    }

    const row = byStaff.get(mapKey);
    if (!row) continue;

    row.totalModules += 1;
    if (isCompleted(statusHeader ? record[statusHeader] : '')) {
      row.completedModules += 1;
    }

    const score = toNumber(scoreHeader ? record[scoreHeader] : '');
    if (score > 0) {
      row.scoreTotal += score;
      row.scoreCount += 1;
    }

    const review = (reviewHeader ? record[reviewHeader] : '').trim();
    if (review) {
      row.reviewNotes.push(review);
    }
  }

  const staffRows = Array.from(byStaff.values())
    .map((row) => ({
      staffName: row.staffName,
      department: row.department,
      totalModules: row.totalModules,
      completedModules: row.completedModules,
      completionRate: row.totalModules ? Math.round((row.completedModules / row.totalModules) * 100) : 0,
      averageScore: row.scoreCount ? Math.round(row.scoreTotal / row.scoreCount) : 0,
      reviewNotes: row.reviewNotes,
    }))
    .sort((a, b) => b.completionRate - a.completionRate || a.staffName.localeCompare(b.staffName));

  const totalModules = staffRows.reduce((sum, row) => sum + row.totalModules, 0);
  const completedModules = staffRows.reduce((sum, row) => sum + row.completedModules, 0);
  const averageScoreRows = staffRows.filter((row) => row.averageScore > 0);
  const averageScore = averageScoreRows.length
    ? Math.round(averageScoreRows.reduce((sum, row) => sum + row.averageScore, 0) / averageScoreRows.length)
    : 0;

  return {
    staffRows,
    departmentSummary: {
      staffCount: staffRows.length,
      totalModules,
      completedModules,
      completionRate: totalModules ? Math.round((completedModules / totalModules) * 100) : 0,
      averageScore,
    },
  };
};

export const buildChecklistCompletionReport = (content: string, selectedChecklist = 'All'): ParsedChecklistReport => {
  const records = parseCsvRecords(content);
  if (!records.length) {
    return { checklists: [], checklistNames: [] };
  }

  const headers = Object.keys(records[0]);
  const checklistHeader = findHeader(headers, ['checklist', 'checklistname', 'name', 'form']);
  const statusHeader = findHeader(headers, ['status', 'completionstatus', 'completed']);

  const checklistMap = new Map<string, { totalItems: number; completedItems: number }>();

  for (const record of records) {
    const checklistName = (checklistHeader ? record[checklistHeader] : '') || 'General Checklist';

    if (!checklistMap.has(checklistName)) {
      checklistMap.set(checklistName, { totalItems: 0, completedItems: 0 });
    }

    const checklist = checklistMap.get(checklistName);
    if (!checklist) continue;

    checklist.totalItems += 1;
    if (isCompleted(statusHeader ? record[statusHeader] : '')) {
      checklist.completedItems += 1;
    }
  }

  const checklistNames = Array.from(checklistMap.keys()).sort((a, b) => a.localeCompare(b));

  const checklists = checklistNames
    .filter((name) => selectedChecklist === 'All' || name === selectedChecklist)
    .map((name) => {
      const row = checklistMap.get(name);
      const totalItems = row?.totalItems ?? 0;
      const completedItems = row?.completedItems ?? 0;

      return {
        checklistName: name,
        totalItems,
        completedItems,
        completionRate: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
      };
    });

  return { checklists, checklistNames };
};
