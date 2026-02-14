import { describe, expect, it } from 'vitest';
import { buildChecklistCompletionReport, buildCourseCompletionReport } from '@/lib/csv-import-report';

describe('buildCourseCompletionReport', () => {
  it('builds department and staff drill-down completion metrics', () => {
    const csv = [
      'Staff Name,Department,Status,Score,Review Notes',
      'Alice,ICU,Completed,95,Strong hand hygiene compliance',
      'Alice,ICU,Completed,90,Improved charting',
      'Bob,ICU,In Progress,80,Needs follow-up',
      'Chris,ER,Completed,88,On track',
    ].join('\n');

    const report = buildCourseCompletionReport(csv);

    expect(report.departmentSummary).toMatchObject({
      staffCount: 3,
      totalModules: 4,
      completedModules: 3,
      completionRate: 75,
      completedStaffCount: 2,
      pendingStaffCount: 1,
    });

    expect(report.departmentRows).toEqual([
      {
        department: 'ER',
        staffCount: 1,
        totalModules: 1,
        completedModules: 1,
        completionRate: 100,
        completedStaffCount: 1,
        pendingStaffCount: 0,
      },
      {
        department: 'ICU',
        staffCount: 2,
        totalModules: 3,
        completedModules: 2,
        completionRate: 67,
        completedStaffCount: 1,
        pendingStaffCount: 1,
      },
    ]);
  });
});

describe('buildChecklistCompletionReport', () => {
  it('supports multiple checklist filters and follow-through rows', () => {
    const csv = [
      'Checklist,Staff Name,Department,Status',
      'EVS Daily,Ana,Housekeeping,Completed',
      'EVS Daily,Ben,Housekeeping,In Progress',
      'Medication Pass,Cara,Nursing,Completed',
      'Medication Pass,Dan,Nursing,Pending',
    ].join('\n');

    const filtered = buildChecklistCompletionReport(csv, ['EVS Daily']);
    expect(filtered.checklists).toEqual([
      {
        checklistName: 'EVS Daily',
        totalItems: 2,
        completedItems: 1,
        completionRate: 50,
      },
    ]);

    expect(filtered.followThroughRows).toEqual([
      {
        checklistName: 'EVS Daily',
        staffName: 'Ben',
        department: 'Housekeeping',
        status: 'In Progress',
      },
    ]);
  });
});
