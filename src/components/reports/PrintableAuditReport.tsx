import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, CheckCircle2, XCircle, AlertTriangle, GraduationCap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { AuditSession, AuditTemplate } from '@/types/nurse-educator';
import { findMatchingCompetencies } from '@/lib/competency-library';

interface PrintableAuditReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AuditSession;
  template: AuditTemplate;
}

export function PrintableAuditReport({ open, onOpenChange, session, template }: PrintableAuditReportProps) {
  const { facilityName } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Calculate session summary
  const totalSamples = session.samples.length;
  const passingCount = session.samples.filter(s => s.result?.pass).length;
  const failingCount = totalSamples - passingCount;
  const overallCompliance = totalSamples > 0 
    ? Math.round((passingCount / totalSamples) * 100) 
    : 0;
  const criticalFailCount = session.samples.reduce(
    (sum, s) => sum + (s.result?.criticalFails?.length || 0), 
    0
  );

  // Collect all action items with their competency recommendations
  const actionItemsWithCompetencies = session.samples.flatMap((sample, sIdx) => 
    (sample.result?.actionNeeded || []).map(action => {
      const competencies = findMatchingCompetencies(action.label, '');
      return {
        sampleNum: sIdx + 1,
        patientCode: sample.answers.patient_code || 'N/A',
        staffAudited: sample.staffAudited || '',
        issue: action.label,
        reason: action.reason,
        competencies: competencies.slice(0, 3)
      };
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Audit Report with Competencies
          </DialogTitle>
          <DialogDescription>Comprehensive audit report with recommended competency validations.</DialogDescription>
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
                  size: portrait;
                  margin: 0.5in;
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
                  font-size: 9pt;
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
                  padding: 3px 5px;
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
          <div className="flex items-start justify-between mb-4 border-b-2 border-black pb-2">
            <div>
              <h1 className="text-xl font-bold">{facilityName}</h1>
              <h2 className="text-lg font-semibold">{session.templateTitle}</h2>
              <p className="text-sm">Audit Results Report with Competency Recommendations • v{template.version}</p>
            </div>
            <div className="text-right text-xs">
              <p>Session: {session.header.sessionId}</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm border border-black p-2 bg-gray-50">
            <div>
              <span className="font-semibold">Date: </span>
              {session.header.auditDate}
            </div>
            <div>
              <span className="font-semibold">Unit: </span>
              {session.header.unit || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Auditor: </span>
              {session.header.auditor}
            </div>
            <div>
              <span className="font-semibold">Status: </span>
              {session.header.status}
            </div>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-5 gap-2 mb-4 text-center">
            <div className="border border-black p-2 bg-gray-100">
              <p className="font-bold text-lg">{totalSamples}</p>
              <p className="text-xs">Total Samples</p>
            </div>
            <div className="border border-black p-2 bg-green-100">
              <p className="font-bold text-lg text-green-700">{passingCount}</p>
              <p className="text-xs">Passing</p>
            </div>
            <div className="border border-black p-2 bg-red-100">
              <p className="font-bold text-lg text-red-700">{failingCount}</p>
              <p className="text-xs">Failing</p>
            </div>
            <div className={`border border-black p-2 ${overallCompliance >= template.passingThreshold ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-bold text-lg">{overallCompliance}%</p>
              <p className="text-xs">Compliance</p>
            </div>
            <div className={`border border-black p-2 ${criticalFailCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <p className="font-bold text-lg text-red-700">{criticalFailCount}</p>
              <p className="text-xs">Critical Fails</p>
            </div>
          </div>

          {/* Sample Results with Staff */}
          <table className="w-full border-collapse border border-black text-xs mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-1 text-left w-10">#</th>
                <th className="border border-black p-1 text-left">Patient Code</th>
                <th className="border border-black p-1 text-left">Staff Audited</th>
                <th className="border border-black p-1 text-center w-16">Score</th>
                <th className="border border-black p-1 text-center w-16">%</th>
                <th className="border border-black p-1 text-center w-16">Result</th>
                <th className="border border-black p-1 text-center w-16">Critical</th>
              </tr>
            </thead>
            <tbody>
              {session.samples.map((sample, idx) => (
                <tr key={sample.id}>
                  <td className="border border-black p-1 text-center">{idx + 1}</td>
                  <td className="border border-black p-1">{sample.answers.patient_code || '-'}</td>
                  <td className="border border-black p-1">{sample.staffAudited || '-'}</td>
                  <td className="border border-black p-1 text-center">
                    {sample.result ? `${sample.result.got}/${sample.result.max}` : '-'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {sample.result?.pct || '-'}%
                  </td>
                  <td className={`border border-black p-1 text-center font-bold ${sample.result?.pass ? 'bg-green-100' : 'bg-red-100'}`}>
                    {sample.result?.pass ? 'PASS' : 'FAIL'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {(sample.result?.criticalFails?.length || 0) > 0 ? (
                      <span className="text-red-600 font-bold">{sample.result?.criticalFails?.length}</span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Action Items with Competency Recommendations */}
          {actionItemsWithCompetencies.length > 0 && (
            <div className="border border-black p-2 mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Action Items with Competency Recommendations
              </h3>
              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-1 text-left w-12">Sample</th>
                    <th className="border border-black p-1 text-left w-20">Staff</th>
                    <th className="border border-black p-1 text-left">Issue</th>
                    <th className="border border-black p-1 text-left">Recommended Competencies (MASTERED.IT)</th>
                  </tr>
                </thead>
                <tbody>
                  {actionItemsWithCompetencies.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">#{item.sampleNum}</td>
                      <td className="border border-black p-1">{item.staffAudited || '-'}</td>
                      <td className="border border-black p-1">
                        <strong>{item.issue}</strong>
                        <br />
                        <span className="text-gray-600">{item.reason}</span>
                      </td>
                      <td className="border border-black p-1">
                        {item.competencies.length > 0 ? (
                          <ul className="list-none space-y-0.5">
                            {item.competencies.map((comp, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1">
                                <GraduationCap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>[{comp.code}] {comp.title}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No matching competencies</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Corrective Actions Summary */}
          <div className="border border-black p-2 mb-4">
            <h3 className="font-bold text-sm mb-2">Corrective Actions (Session Summary)</h3>
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left">Immediate Action</th>
                  <th className="border border-black p-1 text-left w-28">Action Date</th>
                  <th className="border border-black p-1 text-left">Follow-Up Action</th>
                  <th className="border border-black p-1 text-left w-28">Follow-Up Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">
                    {session.header.immediateAction || '-'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {session.header.immediateActionDate || '-'}
                  </td>
                  <td className="border border-black p-1">
                    {session.header.followUpAction || '-'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {session.header.followUpActionDate || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <p className="font-semibold text-sm mb-1">Auditor Signature:</p>
              <div className="border-b border-black h-8"></div>
              <p className="text-xs text-gray-600 mt-1">{session.header.auditor}</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Supervisor Review:</p>
              <div className="border-b border-black h-8"></div>
              <p className="text-xs text-gray-600 mt-1">Date: _______________</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-600 flex justify-between border-t border-black pt-2">
            <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            <span>Nurse Educator Suite • Audit Report with Competencies</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
