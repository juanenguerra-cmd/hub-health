import { useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, User, AlertTriangle, CheckCircle2, GraduationCap, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { QaAction, AuditSession } from '@/types/nurse-educator';
import { todayYMD } from '@/lib/calculations';

interface StaffPerformanceReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange?: { from: string; to: string };
}

interface StaffPerformanceData {
  staffName: string;
  totalSamples: number;
  passingSamples: number;
  failingSamples: number;
  complianceRate: number;
  criticalFails: number;
  openActions: number;
  completedActions: number;
  competenciesNeeded: string[];
  issuesSummary: { issue: string; count: number }[];
}

// Helper to extract competency titles from notes
const extractCompetenciesFromNotes = (notes: string): string[] => {
  if (!notes) return [];
  const competencies: string[] = [];
  const lines = notes.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\[([A-Z0-9-]+)\]\s+(.+)$/);
    if (match) {
      competencies.push(`[${match[1]}] ${match[2]}`);
    }
  }
  
  return competencies;
};

export function StaffPerformanceReport({ 
  open, 
  onOpenChange,
  dateRange
}: StaffPerformanceReportProps) {
  const { facilityName, sessions, qaActions } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const today = todayYMD();

  const handlePrint = () => {
    window.print();
  };

  // Aggregate staff performance data
  const staffPerformanceData = useMemo(() => {
    const staffMap = new Map<string, StaffPerformanceData>();

    // Process audit sessions
    for (const session of sessions) {
      if (session.header.status !== 'complete') continue;
      
      // Filter by date range if provided
      if (dateRange) {
        if (session.header.auditDate < dateRange.from || session.header.auditDate > dateRange.to) continue;
      }

      for (const sample of session.samples) {
        const staffName = sample.staffAudited?.trim();
        if (!staffName) continue;

        if (!staffMap.has(staffName)) {
          staffMap.set(staffName, {
            staffName,
            totalSamples: 0,
            passingSamples: 0,
            failingSamples: 0,
            complianceRate: 0,
            criticalFails: 0,
            openActions: 0,
            completedActions: 0,
            competenciesNeeded: [],
            issuesSummary: []
          });
        }

        const data = staffMap.get(staffName)!;
        data.totalSamples++;
        
        if (sample.result?.pass) {
          data.passingSamples++;
        } else {
          data.failingSamples++;
        }

        if (sample.result?.criticalFails) {
          data.criticalFails += sample.result.criticalFails.length;
        }
      }
    }

    // Process QA actions
    for (const action of qaActions) {
      const staffName = action.staffAudited?.trim();
      if (!staffName) continue;

      // Filter by date range if provided
      if (dateRange) {
        if (action.auditDate < dateRange.from || action.auditDate > dateRange.to) continue;
      }

      if (!staffMap.has(staffName)) {
        staffMap.set(staffName, {
          staffName,
          totalSamples: 0,
          passingSamples: 0,
          failingSamples: 0,
          complianceRate: 0,
          criticalFails: 0,
          openActions: 0,
          completedActions: 0,
          competenciesNeeded: [],
          issuesSummary: []
        });
      }

      const data = staffMap.get(staffName)!;

      if (action.status === 'complete') {
        data.completedActions++;
      } else {
        data.openActions++;
      }

      // Extract competencies
      const competencies = extractCompetenciesFromNotes(action.notes);
      for (const comp of competencies) {
        if (!data.competenciesNeeded.includes(comp)) {
          data.competenciesNeeded.push(comp);
        }
      }

      // Track issues
      const existingIssue = data.issuesSummary.find(i => i.issue === action.issue);
      if (existingIssue) {
        existingIssue.count++;
      } else {
        data.issuesSummary.push({ issue: action.issue, count: 1 });
      }
    }

    // Calculate compliance rates
    for (const data of staffMap.values()) {
      if (data.totalSamples > 0) {
        data.complianceRate = Math.round((data.passingSamples / data.totalSamples) * 100);
      }
      // Sort issues by count
      data.issuesSummary.sort((a, b) => b.count - a.count);
    }

    // Sort by total samples descending
    return Array.from(staffMap.values()).sort((a, b) => b.totalSamples - a.totalSamples);
  }, [sessions, qaActions, dateRange]);

  // Staff needing attention (compliance < 90% or open actions > 0)
  const staffNeedingAttention = staffPerformanceData.filter(
    s => s.complianceRate < 90 || s.openActions > 0 || s.criticalFails > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Staff Performance Review Report
          </DialogTitle>
          <DialogDescription>
            Aggregated audit performance by staff member with competency needs.
          </DialogDescription>
        </DialogHeader>

        {/* Print Controls */}
        <div className="flex items-center gap-4 mb-4 print:hidden">
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-content bg-white text-black">
          <style>
            {`
              @media print {
                @page {
                  size: landscape;
                  margin: 0.4in;
                }
                body * {
                  visibility: hidden;
                }
                .print-content, .print-content * {
                  visibility: visible;
                }
                .print-content {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white !important;
                  color: black !important;
                  font-size: 8pt;
                }
                .print-content table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .print-content th, .print-content td {
                  border: 1px solid #000 !important;
                  padding: 2px 4px;
                }
                .print-content thead {
                  display: table-header-group;
                }
                .print-content tr {
                  page-break-inside: avoid;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-start justify-between mb-3 border-b-2 border-black pb-2">
            <div>
              <h1 className="text-xl font-bold">{facilityName}</h1>
              <h2 className="text-lg font-semibold">Staff Performance Review</h2>
              <p className="text-sm">
                {dateRange 
                  ? `${dateRange.from} to ${dateRange.to}` 
                  : 'All Time Data'
                }
              </p>
            </div>
            <div className="text-right text-xs">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Staff Reviewed: {staffPerformanceData.length}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            <div className="border border-black p-2 bg-blue-50">
              <p className="font-bold text-lg">{staffPerformanceData.length}</p>
              <p className="text-xs">Staff Audited</p>
            </div>
            <div className="border border-black p-2 bg-gray-50">
              <p className="font-bold text-lg">
                {staffPerformanceData.reduce((sum, s) => sum + s.totalSamples, 0)}
              </p>
              <p className="text-xs">Total Samples</p>
            </div>
            <div className={`border border-black p-2 ${staffNeedingAttention.length > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <p className="font-bold text-lg">{staffNeedingAttention.length}</p>
              <p className="text-xs">Need Attention</p>
            </div>
            <div className="border border-black p-2 bg-red-50">
              <p className="font-bold text-lg">
                {staffPerformanceData.reduce((sum, s) => sum + s.criticalFails, 0)}
              </p>
              <p className="text-xs">Critical Fails</p>
            </div>
          </div>

          {/* Staff Needing Attention */}
          {staffNeedingAttention.length > 0 && (
            <>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 bg-yellow-100 p-1">
                <AlertTriangle className="w-4 h-4" />
                Staff Needing Attention ({staffNeedingAttention.length})
              </h3>
              <table className="w-full border-collapse text-xs mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-1 text-left">Staff Name</th>
                    <th className="border border-black p-1 text-center">Samples</th>
                    <th className="border border-black p-1 text-center">Pass/Fail</th>
                    <th className="border border-black p-1 text-center">Compliance</th>
                    <th className="border border-black p-1 text-center">Critical</th>
                    <th className="border border-black p-1 text-center">Open Actions</th>
                    <th className="border border-black p-1 text-left">Top Issues</th>
                    <th className="border border-black p-1 text-left">Competencies Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {staffNeedingAttention.map((staff) => (
                    <tr key={staff.staffName} className={staff.complianceRate < 70 ? 'bg-red-50' : ''}>
                      <td className="border border-black p-1 font-medium">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {staff.staffName}
                        </div>
                      </td>
                      <td className="border border-black p-1 text-center">{staff.totalSamples}</td>
                      <td className="border border-black p-1 text-center">
                        <span className="text-green-600">{staff.passingSamples}</span>
                        {' / '}
                        <span className="text-red-600">{staff.failingSamples}</span>
                      </td>
                      <td className={`border border-black p-1 text-center font-bold ${
                        staff.complianceRate >= 90 ? 'text-green-600' : 
                        staff.complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {staff.complianceRate}%
                      </td>
                      <td className={`border border-black p-1 text-center ${staff.criticalFails > 0 ? 'text-red-600 font-bold' : ''}`}>
                        {staff.criticalFails}
                      </td>
                      <td className={`border border-black p-1 text-center ${staff.openActions > 0 ? 'text-yellow-600 font-bold' : ''}`}>
                        {staff.openActions}
                      </td>
                      <td className="border border-black p-1">
                        {staff.issuesSummary.slice(0, 2).map((i, idx) => (
                          <div key={idx} className="text-xs truncate">• {i.issue} ({i.count}x)</div>
                        ))}
                      </td>
                      <td className="border border-black p-1">
                        {staff.competenciesNeeded.length > 0 ? (
                          <div className="space-y-0.5">
                            {staff.competenciesNeeded.slice(0, 2).map((c, i) => (
                              <div key={i} className="text-xs truncate flex items-center gap-1">
                                <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{c}</span>
                              </div>
                            ))}
                            {staff.competenciesNeeded.length > 2 && (
                              <span className="text-xs text-gray-500">+{staff.competenciesNeeded.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* All Staff Performance */}
          {staffPerformanceData.length > 0 && (
            <>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 bg-blue-100 p-1">
                <TrendingUp className="w-4 h-4" />
                All Staff Performance Summary ({staffPerformanceData.length})
              </h3>
              <table className="w-full border-collapse text-xs mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-1 text-left">Staff Name</th>
                    <th className="border border-black p-1 text-center">Samples</th>
                    <th className="border border-black p-1 text-center">Passing</th>
                    <th className="border border-black p-1 text-center">Failing</th>
                    <th className="border border-black p-1 text-center">Compliance</th>
                    <th className="border border-black p-1 text-center">Critical Fails</th>
                    <th className="border border-black p-1 text-center">Open Actions</th>
                    <th className="border border-black p-1 text-center">Completed</th>
                    <th className="border border-black p-1 text-center">Competencies</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformanceData.slice(0, 30).map((staff) => (
                    <tr key={staff.staffName}>
                      <td className="border border-black p-1">{staff.staffName}</td>
                      <td className="border border-black p-1 text-center">{staff.totalSamples}</td>
                      <td className="border border-black p-1 text-center text-green-600">{staff.passingSamples}</td>
                      <td className="border border-black p-1 text-center text-red-600">{staff.failingSamples}</td>
                      <td className={`border border-black p-1 text-center font-bold ${
                        staff.complianceRate >= 90 ? 'bg-green-100' : 
                        staff.complianceRate >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {staff.complianceRate}%
                      </td>
                      <td className="border border-black p-1 text-center">{staff.criticalFails}</td>
                      <td className="border border-black p-1 text-center">{staff.openActions}</td>
                      <td className="border border-black p-1 text-center">{staff.completedActions}</td>
                      <td className="border border-black p-1 text-center">{staff.competenciesNeeded.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {staffPerformanceData.length > 30 && (
                <p className="text-xs text-gray-500 mb-4">Showing first 30 of {staffPerformanceData.length} staff members</p>
              )}
            </>
          )}

          {staffPerformanceData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No staff performance data available.</p>
              <p className="text-sm">Enter staff names in the "Staff Being Audited" field during audits to track performance.</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 text-xs text-gray-600 flex justify-between border-t border-black pt-2">
            <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            <span>Nurse Educator Suite • Staff Performance Report</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
