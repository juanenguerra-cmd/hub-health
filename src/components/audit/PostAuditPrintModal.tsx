import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Printer, X, CheckCircle2, XCircle, AlertTriangle, GraduationCap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useRef } from 'react';
import type { AuditSession, AuditTemplate } from '@/types/nurse-educator';
import { findMatchingCompetencies } from '@/lib/competency-library';

interface PostAuditPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AuditSession;
  template: AuditTemplate;
}

export function PostAuditPrintModal({ open, onOpenChange, session, template }: PostAuditPrintModalProps) {
  const { facilityName } = useApp();
  const [showLogo, setShowLogo] = useState(true);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Audit Results: {session.templateTitle}
          </DialogTitle>
          <DialogDescription>Preview and print the completed audit results with scores and action items.</DialogDescription>
        </DialogHeader>

        {/* Print Controls */}
        <div className="flex items-center gap-4 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-logo-post"
              checked={showLogo}
              onCheckedChange={(checked) => setShowLogo(checked === true)}
            />
            <Label htmlFor="show-logo-post">Show facility logo</Label>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Results
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
                  font-size: 10pt;
                }
                .print-content table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .print-content th, .print-content td {
                  border: 1px solid #000 !important;
                  padding: 4px 6px;
                }
                .print-content thead {
                  display: table-header-group;
                }
                .print-content tr {
                  page-break-inside: avoid;
                }
                .sample-section {
                  page-break-inside: avoid;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 border-b-2 border-black pb-2">
            <div>
              <h1 className="text-xl font-bold">{facilityName}</h1>
              <h2 className="text-lg font-semibold">{session.templateTitle}</h2>
              <p className="text-sm">Post-Audit Results • v{template.version}</p>
            </div>
            {showLogo && (
              <div className="w-20 h-20 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                [Logo]
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm border border-black p-2 bg-gray-50">
            <div>
              <span className="font-semibold">Session ID: </span>
              {session.header.sessionId}
            </div>
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

          {/* Regulatory References */}
          <div className="mb-4 text-xs border border-black p-2">
            <span className="font-semibold">Regulatory References: </span>
            {template.ftagTags.map(tag => `CMS ${tag}`).join(', ')}
            {template.nydohTags.length > 0 && ` | NYDOH: ${template.nydohTags.join(', ')}`}
            <span className="ml-4 font-semibold">Threshold: </span>{template.passingThreshold}%
          </div>

          {/* Sample Results Table */}
          <table className="w-full border-collapse border border-black text-xs mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-1 text-left w-8">#</th>
                <th className="border border-black p-1 text-left">Criteria</th>
                <th className="border border-black p-1 text-center w-10">Pts</th>
                {session.samples.map((_, idx) => (
                  <th key={idx} className="border border-black p-1 text-center w-20">
                    Sample {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Patient Code Row */}
              <tr className="bg-gray-50">
                <td className="border border-black p-1 text-center font-bold">-</td>
                <td className="border border-black p-1 font-semibold">Patient/Resident Code</td>
                <td className="border border-black p-1 text-center">-</td>
                {session.samples.map((sample, idx) => (
                  <td key={idx} className="border border-black p-1 text-center text-xs">
                    {sample.answers.patient_code || '-'}
                  </td>
                ))}
              </tr>

              {/* Staff Audited Row */}
              <tr className="bg-blue-50">
                <td className="border border-black p-1 text-center font-bold">-</td>
                <td className="border border-black p-1 font-semibold">Staff Audited</td>
                <td className="border border-black p-1 text-center">-</td>
                {session.samples.map((sample, idx) => (
                  <td key={idx} className="border border-black p-1 text-center text-xs">
                    {sample.staffAudited || '-'}
                  </td>
                ))}
              </tr>

              {template.sampleQuestions.map((q, idx) => {
                const isCritical = template.criticalFailKeys?.includes(q.key);
                return (
                  <tr key={q.key} className={isCritical ? 'bg-red-50' : ''}>
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1">
                      {q.label}
                      {isCritical && <span className="text-red-600 ml-1 font-bold">(C)</span>}
                    </td>
                    <td className="border border-black p-1 text-center">{q.score}</td>
                    {session.samples.map((sample, sIdx) => {
                      const answer = sample.answers[q.key] || '-';
                      const isFail = q.type === 'yn' && answer === 'no';
                      const isCritFail = isCritical && isFail;
                      return (
                        <td 
                          key={sIdx} 
                          className={`border border-black p-1 text-center text-xs ${
                            isCritFail ? 'bg-red-200 font-bold' : isFail ? 'bg-red-100' : ''
                          }`}
                        >
                          {answer === 'yes' ? 'Y' : answer === 'no' ? 'N' : answer === 'na' ? 'N/A' : answer}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Score Row */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="border border-black p-1 text-right">
                  SCORE:
                </td>
                <td className="border border-black p-1 text-center">
                  {template.sampleQuestions.reduce((sum, q) => sum + q.score, 0)}
                </td>
                {session.samples.map((sample, idx) => (
                  <td key={idx} className="border border-black p-1 text-center">
                    {sample.result ? `${sample.result.got}/${sample.result.max}` : '-'}
                  </td>
                ))}
              </tr>

              {/* Percentage Row */}
              <tr className="font-bold">
                <td colSpan={3} className="border border-black p-1 text-right">
                  PERCENTAGE:
                </td>
                {session.samples.map((sample, idx) => (
                  <td 
                    key={idx} 
                    className={`border border-black p-1 text-center ${
                      sample.result?.pass ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {sample.result ? `${sample.result.pct}%` : '-'}
                  </td>
                ))}
              </tr>

              {/* Pass/Fail Row */}
              <tr className="font-bold">
                <td colSpan={3} className="border border-black p-1 text-right">
                  RESULT:
                </td>
                {session.samples.map((sample, idx) => (
                  <td 
                    key={idx} 
                    className={`border border-black p-1 text-center ${
                      sample.result?.pass ? 'bg-green-200' : 'bg-red-200'
                    }`}
                  >
                    {sample.result?.pass ? 'PASS' : 'FAIL'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Action Items Section with Competency Recommendations */}
          {session.samples.some(s => s.result?.actionNeeded && s.result.actionNeeded.length > 0) && (
            <div className="border border-black p-2 mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Action Items with Competency Recommendations
              </h3>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-left w-[10%]">Sample</th>
                    <th className="border border-black p-1 text-left w-[15%]">Staff</th>
                    <th className="border border-black p-1 text-left w-[25%]">Issue</th>
                    <th className="border border-black p-1 text-left w-[50%]">Recommended Competencies (MASTERED.IT)</th>
                  </tr>
                </thead>
                <tbody>
                  {session.samples.flatMap((sample, sIdx) => 
                    (sample.result?.actionNeeded || []).map((action, aIdx) => {
                      const competencies = findMatchingCompetencies(action.label, '');
                      return (
                        <tr key={`${sIdx}-${aIdx}`}>
                          <td className="border border-black p-1">
                            #{sIdx + 1}
                          </td>
                          <td className="border border-black p-1">
                            {sample.staffAudited || '-'}
                          </td>
                          <td className="border border-black p-1">
                            <strong>{action.label}</strong>
                            <br />
                            <span className="text-gray-600">{action.reason}</span>
                          </td>
                          <td className="border border-black p-1">
                            {competencies.length > 0 ? (
                              <div className="space-y-0.5">
                                {competencies.slice(0, 3).map((comp, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-1">
                                    <GraduationCap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>[{comp.code}] {comp.title}</span>
                                  </div>
                                ))}
                                {competencies.length > 3 && (
                                  <span className="text-gray-500">+{competencies.length - 3} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No matching competencies</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Critical Fails Section */}
          {criticalFailCount > 0 && (
            <div className="border-2 border-red-500 p-2 mb-4 bg-red-50">
              <h3 className="font-bold text-sm mb-2 text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Critical Failures Identified
              </h3>
              <ul className="text-xs list-disc list-inside">
                {session.samples.flatMap((sample, sIdx) => 
                  (sample.result?.criticalFails || []).map((cf, cfIdx) => {
                    const question = template.sampleQuestions.find(q => q.key === cf);
                    return (
                      <li key={`${sIdx}-${cfIdx}`} className="text-red-700">
                        Sample #{sIdx + 1}: {question?.label || cf}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}

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
            <span>Nurse Educator Suite • Post-Audit Results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
