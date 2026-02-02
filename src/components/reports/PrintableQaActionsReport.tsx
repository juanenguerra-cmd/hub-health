import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, GraduationCap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { QaAction } from '@/types/nurse-educator';
import { todayYMD } from '@/lib/calculations';

interface PrintableQaActionsReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: QaAction[];
  title?: string;
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

export function PrintableQaActionsReport({ 
  open, 
  onOpenChange, 
  actions,
  title = 'QA Actions Report'
}: PrintableQaActionsReportProps) {
  const { facilityName } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const today = todayYMD();

  const handlePrint = () => {
    window.print();
  };

  // Calculate stats
  const openCount = actions.filter(a => a.status === 'open').length;
  const inProgressCount = actions.filter(a => a.status === 'in_progress').length;
  const completeCount = actions.filter(a => a.status === 'complete').length;
  const overdueCount = actions.filter(a => a.status !== 'complete' && a.dueDate && a.dueDate < today).length;

  // Group by status
  const openActions = actions.filter(a => a.status === 'open' || a.status === 'in_progress');
  const completedActions = actions.filter(a => a.status === 'complete');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print QA Actions Report
          </DialogTitle>
          <DialogDescription>Printable QA actions with competency recommendations.</DialogDescription>
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
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body > *:not(.print-content):not(:has(.print-content)) {
                  display: none !important;
                }
                .print-content {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                  background: white !important;
                  color: black !important;
                  font-size: 8pt;
                  margin: 0;
                  padding: 0;
                }
                .print-content * {
                  visibility: visible !important;
                }
                .print-content table {
                  width: 100%;
                  border-collapse: collapse;
                  page-break-inside: auto;
                }
                .print-content th, .print-content td {
                  border: 1px solid #000 !important;
                  padding: 2px 4px;
                }
                .print-content thead {
                  display: table-header-group;
                }
                .print-content tbody {
                  display: table-row-group;
                }
                .print-content tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                .no-print, [role="dialog"]:not(:has(.print-content)) {
                  display: none !important;
                }
                [role="dialog"]:has(.print-content) {
                  position: static !important;
                  width: 100% !important;
                  max-width: none !important;
                  max-height: none !important;
                  overflow: visible !important;
                  transform: none !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                }
                [role="dialog"]:has(.print-content) > div {
                  max-height: none !important;
                  overflow: visible !important;
                }
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-start justify-between mb-3 border-b-2 border-black pb-2">
            <div>
              <h1 className="text-xl font-bold">{facilityName}</h1>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm">With Competency Recommendations</p>
            </div>
            <div className="text-right text-xs">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Total Actions: {actions.length}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            <div className="border border-black p-2 bg-yellow-50">
              <p className="font-bold text-lg">{openCount}</p>
              <p className="text-xs">Open</p>
            </div>
            <div className="border border-black p-2 bg-blue-50">
              <p className="font-bold text-lg">{inProgressCount}</p>
              <p className="text-xs">In Progress</p>
            </div>
            <div className="border border-black p-2 bg-green-50">
              <p className="font-bold text-lg">{completeCount}</p>
              <p className="text-xs">Complete</p>
            </div>
            <div className={`border border-black p-2 ${overdueCount > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
              <p className={`font-bold text-lg ${overdueCount > 0 ? 'text-red-600' : ''}`}>{overdueCount}</p>
              <p className="text-xs">Overdue</p>
            </div>
          </div>

          {/* Open/In Progress Actions */}
          {openActions.length > 0 && (
            <>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 bg-yellow-100 p-1">
                <AlertTriangle className="w-4 h-4" />
                Open & In Progress Actions ({openActions.length})
              </h3>
              <table className="w-full border-collapse text-xs mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-1 text-left w-[15%]">Issue</th>
                    <th className="border border-black p-1 text-left w-[10%]">Tool</th>
                    <th className="border border-black p-1 text-center w-[6%]">Unit</th>
                    <th className="border border-black p-1 text-center w-[8%]">Staff</th>
                    <th className="border border-black p-1 text-center w-[8%]">Owner</th>
                    <th className="border border-black p-1 text-center w-[7%]">Due</th>
                    <th className="border border-black p-1 text-center w-[6%]">Status</th>
                    <th className="border border-black p-1 text-left w-[20%]">Competency Recommendations</th>
                    <th className="border border-black p-1 text-center w-[5%]">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {openActions.map((action) => {
                    const competencies = extractCompetenciesFromNotes(action.notes);
                    const isOverdue = action.dueDate && action.dueDate < today;
                    const evidenceCount = [
                      action.ev_policyReviewed,
                      action.ev_educationProvided,
                      action.ev_competencyValidated,
                      action.ev_correctiveAction,
                      action.ev_monitoringInPlace
                    ].filter(Boolean).length;

                    return (
                      <tr key={action.id} className={isOverdue ? 'bg-red-50' : ''}>
                        <td className="border border-black p-1">{action.issue}</td>
                        <td className="border border-black p-1 text-xs">{action.templateTitle}</td>
                        <td className="border border-black p-1 text-center">{action.unit || '-'}</td>
                        <td className="border border-black p-1 text-center">{action.staffAudited || '-'}</td>
                        <td className="border border-black p-1 text-center">{action.owner || '-'}</td>
                        <td className={`border border-black p-1 text-center ${isOverdue ? 'font-bold text-red-600' : ''}`}>
                          {action.dueDate || '-'}
                        </td>
                        <td className="border border-black p-1 text-center">
                          {action.status === 'in_progress' ? 'WIP' : 'Open'}
                        </td>
                        <td className="border border-black p-1">
                          {competencies.length > 0 ? (
                            <div className="space-y-0.5">
                              {competencies.slice(0, 2).map((c, i) => (
                                <div key={i} className="text-xs truncate flex items-center gap-1">
                                  <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="truncate">{c}</span>
                                </div>
                              ))}
                              {competencies.length > 2 && (
                                <span className="text-xs text-gray-500">+{competencies.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="border border-black p-1 text-center">
                          {evidenceCount}/5
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* Completed Actions */}
          {completedActions.length > 0 && (
            <>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 bg-green-100 p-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed Actions ({completedActions.length})
              </h3>
              <table className="w-full border-collapse text-xs mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-1 text-left">Issue</th>
                    <th className="border border-black p-1 text-left">Tool</th>
                    <th className="border border-black p-1 text-center">Unit</th>
                    <th className="border border-black p-1 text-center">Staff</th>
                    <th className="border border-black p-1 text-center">Owner</th>
                    <th className="border border-black p-1 text-center">Completed</th>
                    <th className="border border-black p-1 text-left">Competency Recommendations</th>
                    <th className="border border-black p-1 text-center">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {completedActions.slice(0, 20).map((action) => {
                    const competencies = extractCompetenciesFromNotes(action.notes);
                    const evidenceCount = [
                      action.ev_policyReviewed,
                      action.ev_educationProvided,
                      action.ev_competencyValidated,
                      action.ev_correctiveAction,
                      action.ev_monitoringInPlace
                    ].filter(Boolean).length;

                    return (
                      <tr key={action.id}>
                        <td className="border border-black p-1">{action.issue}</td>
                        <td className="border border-black p-1 text-xs">{action.templateTitle}</td>
                        <td className="border border-black p-1 text-center">{action.unit || '-'}</td>
                        <td className="border border-black p-1 text-center">{action.staffAudited || '-'}</td>
                        <td className="border border-black p-1 text-center">{action.owner || '-'}</td>
                        <td className="border border-black p-1 text-center">{action.completedAt || '-'}</td>
                        <td className="border border-black p-1">
                          {competencies.length > 0 ? (
                            <div className="space-y-0.5">
                              {competencies.slice(0, 2).map((c, i) => (
                                <div key={i} className="text-xs truncate flex items-center gap-1">
                                  <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="truncate">{c}</span>
                                </div>
                              ))}
                              {competencies.length > 2 && (
                                <span className="text-xs text-gray-500">+{competencies.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="border border-black p-1 text-center">
                          {evidenceCount}/5
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {completedActions.length > 20 && (
                <p className="text-xs text-gray-500 mb-4">Showing first 20 of {completedActions.length} completed actions</p>
              )}
            </>
          )}

          {/* Evidence Legend */}
          <div className="border border-black p-2 mb-4 text-xs">
            <p className="font-semibold mb-1">Evidence Checklist Legend:</p>
            <div className="grid grid-cols-5 gap-2">
              <span>✓ Policy Reviewed</span>
              <span>✓ Education Provided</span>
              <span>✓ Competency Validated</span>
              <span>✓ Corrective Action</span>
              <span>✓ Monitoring In Place</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-xs text-gray-600 flex justify-between border-t border-black pt-2">
            <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            <span>Nurse Educator Suite • QA Actions Report</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
