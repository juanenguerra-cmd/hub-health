export interface CourseCompletionStaffRow {
  staffName: string;
  department: string;
  totalModules: number;
  completedModules: number;
  completionRate: number;
  status: 'Complete' | 'Incomplete/Pending';
}

export interface CourseCompletionDepartmentRow {
  department: string;
  staffCount: number;
  totalModules: number;
  completedModules: number;
  completionRate: number;
  completedStaffCount: number;
  pendingStaffCount: number;
}

export interface CourseCompletionSummary {
  staffCount: number;
  totalModules: number;
  completedModules: number;
  completionRate: number;
  completedStaffCount: number;
  pendingStaffCount: number;
}

export interface CourseCompletionReport {
  staffRows: CourseCompletionStaffRow[];
  departmentRows: CourseCompletionDepartmentRow[];
  departmentSummary: CourseCompletionSummary;
}

export interface ChecklistCompletionRow {
  checklistName: string;
  totalItems: number;
  completedItems: number;
  completionRate: number;
}

export interface ChecklistFollowThroughRow {
  checklistName: string;
  staffName: string;
  department: string;
  status: string;
}

export interface ParsedChecklistReport {
  checklists: ChecklistCompletionRow[];
  checklistNames: string[];
  followThroughRows: ChecklistFollowThroughRow[];
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
const normalizeEntityKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

const findHeader = (headers: string[], candidates: string[]): string | null => {
  for (const candidate of candidates) {
    if (headers.includes(candidate)) {
      return candidate;
    }
  }
  return null;
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
      departmentRows: [],
      departmentSummary: {
        staffCount: 0,
        totalModules: 0,
        completedModules: 0,
        completionRate: 0,
        completedStaffCount: 0,
        pendingStaffCount: 0,
      },
    };
  }

  const headers = Object.keys(records[0]);
  const staffHeader = findHeader(headers, [
    'staff',
    'staffname',
    'stafffullname',
    'nameofstaff',
    'user',
    'username',
    'fullname',
    'employee',
    'employeename',
    'name',
  ]);
  const departmentHeader = findHeader(headers, [
    'department',
    'departmentassigned',
    'assigneddepartment',
    'departmenttheybelong',
    'staffdepartment',
    'unit',
    'team',
  ]);
  const statusHeader = findHeader(headers, [
    'status',
    'completionstatus',
    'completed',
    'coursestatus',
    'modulestatus',
    'trainingstatus',
  ]);

  const byStaff = new Map<string, {
    staffName: string;
    department: string;
    totalModules: number;
    completedModules: number;
  }>();

  for (const record of records) {
    const staffName = (staffHeader ? record[staffHeader] : '').trim() || 'Unknown Staff';
    const department = (departmentHeader ? record[departmentHeader] : '').trim() || 'Unassigned';
    const mapKey = `${normalizeEntityKey(staffName)}::${normalizeEntityKey(department)}`;

    if (!byStaff.has(mapKey)) {
      byStaff.set(mapKey, {
        staffName,
        department,
        totalModules: 0,
        completedModules: 0,
      });
    }

    const row = byStaff.get(mapKey);
    if (!row) continue;

    row.totalModules += 1;
    if (isCompleted(statusHeader ? record[statusHeader] : '')) {
      row.completedModules += 1;
    }
  }

  const staffRows = Array.from(byStaff.values())
    .map((row) => {
      const completionRate = row.totalModules ? Math.round((row.completedModules / row.totalModules) * 100) : 0;
      return {
        ...row,
        completionRate,
        status: completionRate === 100 ? 'Complete' : 'Incomplete/Pending',
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate || a.staffName.localeCompare(b.staffName));

  const departmentMap = new Map<string, CourseCompletionDepartmentRow>();
  for (const row of staffRows) {
    if (!departmentMap.has(row.department)) {
      departmentMap.set(row.department, {
        department: row.department,
        staffCount: 0,
        totalModules: 0,
        completedModules: 0,
        completionRate: 0,
        completedStaffCount: 0,
        pendingStaffCount: 0,
      });
    }

    const departmentRow = departmentMap.get(row.department);
    if (!departmentRow) continue;

    departmentRow.staffCount += 1;
    departmentRow.totalModules += row.totalModules;
    departmentRow.completedModules += row.completedModules;
    if (row.status === 'Complete') {
      departmentRow.completedStaffCount += 1;
    } else {
      departmentRow.pendingStaffCount += 1;
    }
  }

  const departmentRows = Array.from(departmentMap.values())
    .map((row) => ({
      ...row,
      completionRate: row.totalModules ? Math.round((row.completedModules / row.totalModules) * 100) : 0,
    }))
    .sort((a, b) => b.completionRate - a.completionRate || a.department.localeCompare(b.department));

  const totalModules = staffRows.reduce((sum, row) => sum + row.totalModules, 0);
  const completedModules = staffRows.reduce((sum, row) => sum + row.completedModules, 0);
  const completedStaffCount = staffRows.filter((row) => row.status === 'Complete').length;

  return {
    staffRows,
    departmentRows,
    departmentSummary: {
      staffCount: staffRows.length,
      totalModules,
      completedModules,
      completionRate: totalModules ? Math.round((completedModules / totalModules) * 100) : 0,
      completedStaffCount,
      pendingStaffCount: staffRows.length - completedStaffCount,
    },
  };
};

export const buildChecklistCompletionReport = (content: string, selectedChecklists: string[] = []): ParsedChecklistReport => {
  const records = parseCsvRecords(content);
  if (!records.length) {
    return { checklists: [], checklistNames: [], followThroughRows: [] };
  }

  const headers = Object.keys(records[0]);
  const checklistHeader = findHeader(headers, ['checklist', 'checklistname', 'name', 'form']);
  const statusHeader = findHeader(headers, ['status', 'completionstatus', 'completed']);
  const staffHeader = findHeader(headers, [
    'staff',
    'staffname',
    'stafffullname',
    'nameofstaff',
    'user',
    'username',
    'fullname',
    'employee',
    'employeename',
    'name',
  ]);
  const departmentHeader = findHeader(headers, [
    'department',
    'departmentassigned',
    'assigneddepartment',
    'departmenttheybelong',
    'staffdepartment',
    'unit',
    'team',
  ]);

  const checklistMap = new Map<string, { totalItems: number; completedItems: number }>();
  const filterSet = new Set(selectedChecklists);
  const showAll = selectedChecklists.length === 0;

  const followThroughRows: ChecklistFollowThroughRow[] = [];

  for (const record of records) {
    const checklistName = (checklistHeader ? record[checklistHeader] : '').trim() || 'General Checklist';
    const status = statusHeader ? record[statusHeader] : '';

    if (!checklistMap.has(checklistName)) {
      checklistMap.set(checklistName, { totalItems: 0, completedItems: 0 });
    }

    const checklist = checklistMap.get(checklistName);
    if (!checklist) continue;

    checklist.totalItems += 1;
    if (isCompleted(status)) {
      checklist.completedItems += 1;
    }

    const includeInReport = showAll || filterSet.has(checklistName);
    if (includeInReport && !isCompleted(status)) {
      followThroughRows.push({
        checklistName,
        staffName: (staffHeader ? record[staffHeader] : '').trim() || 'Unknown Staff',
        department: (departmentHeader ? record[departmentHeader] : '').trim() || 'Unassigned',
        status: status || 'Incomplete/Pending',
      });
    }
  }

  const checklistNames = Array.from(checklistMap.keys()).sort((a, b) => a.localeCompare(b));

  const checklists = checklistNames
    .filter((name) => showAll || filterSet.has(name))
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

  return {
    checklists,
    checklistNames,
    followThroughRows: followThroughRows.sort(
      (a, b) => a.department.localeCompare(b.department) || a.staffName.localeCompare(b.staffName)
    ),
  };
};
