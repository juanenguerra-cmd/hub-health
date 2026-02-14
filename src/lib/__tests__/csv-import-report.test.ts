import { describe, expect, it } from 'vitest';
import { buildChecklistCompletionReport, buildCourseCompletionReport } from '@/lib/csv-import-report';

describe('buildCourseCompletionReport', () => {
  it('summarizes staff and department completion metrics', () => {
    const csv = [
      'Staff Name,Department,Status,Score,Review Notes',
      'Alice,ICU,Completed,95,Strong hand hygiene compliance',
      'Alice,ICU,Completed,90,Improved charting',
      'Bob,ICU,In Progress,80,Needs follow-up',
    ].join('\n');

    const report = buildCourseCompletionReport(csv);

    expect(report.departmentSummary.staffCount).toBe(2);
    expect(report.departmentSummary.totalModules).toBe(3);
    expect(report.departmentSummary.completedModules).toBe(2);
    expect(report.departmentSummary.completionRate).toBe(67);

    expect(report.staffRows[0]).toMatchObject({
      staffName: 'Alice',
      completedModules: 2,
      totalModules: 2,
      completionRate: 100,
      averageScore: 93,
    });
  });
});

describe('buildChecklistCompletionReport', () => {
  it('filters checklist completion by checklist name', () => {
    const csv = [
      'Checklist,Status',
      'EVS Daily,Completed',
      'EVS Daily,In Progress',
      'Medication Pass,Completed',
    ].join('\n');

    const allChecklists = buildChecklistCompletionReport(csv, 'All');
    expect(allChecklists.checklists).toHaveLength(2);

    const filtered = buildChecklistCompletionReport(csv, 'EVS Daily');
    expect(filtered.checklists).toEqual([
      {
        checklistName: 'EVS Daily',
        totalItems: 2,
        completedItems: 1,
        completionRate: 50,
      },
    ]);
  });
});
