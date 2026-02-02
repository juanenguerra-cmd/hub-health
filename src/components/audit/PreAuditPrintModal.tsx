import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState, useRef } from 'react';
import type { AuditTemplate } from '@/types/nurse-educator';

interface PreAuditPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AuditTemplate;
}

export function PreAuditPrintModal({ open, onOpenChange, template }: PreAuditPrintModalProps) {
  const { facilityName } = useApp();
  const [showLogo, setShowLogo] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const sampleNumbers = [1, 2, 3, 4, 5];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Pre-Audit Form: {template.title}
          </DialogTitle>
          <DialogDescription>Preview and print the blank audit form for paper-based compliance checks.</DialogDescription>
        </DialogHeader>

        {/* Print Controls */}
        <div className="flex items-center gap-4 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-logo-pre"
              checked={showLogo}
              onCheckedChange={(checked) => setShowLogo(checked === true)}
            />
            <Label htmlFor="show-logo-pre">Show facility logo</Label>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Form
          </Button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-content bg-white text-black">
          <style>
            {`
              @media print {
                @page {
                  size: landscape;
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
                  font-size: 10pt;
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
                  padding: 4px 6px;
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
              <h2 className="text-lg font-semibold">{template.title}</h2>
              <p className="text-sm">Pre-Audit Form (Paper Compliance) • v{template.version}</p>
            </div>
            {showLogo && (
              <div className="w-20 h-20 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                [Logo]
              </div>
            )}
          </div>

          {/* Session Header Fields */}
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Date: </span>
              <span className="inline-block w-24 border-b border-dotted border-gray-500"></span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Unit: </span>
              <span className="inline-block w-24 border-b border-dotted border-gray-500"></span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Auditor: </span>
              <span className="inline-block w-32 border-b border-dotted border-gray-500"></span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Session ID: </span>
              <span className="inline-block w-24 border-b border-dotted border-gray-500"></span>
            </div>
          </div>

          {/* Regulatory References */}
          <div className="mb-4 text-xs">
            <span className="font-semibold">Regulatory: </span>
            {template.ftagTags.map(tag => `CMS ${tag}`).join(', ')}
            {template.nydohTags.length > 0 && ` | NYDOH: ${template.nydohTags.join(', ')}`}
            <span className="ml-4 font-semibold">Passing Threshold: </span>{template.passingThreshold}%
          </div>

          {/* Audit Grid Table */}
          <table className="w-full border-collapse border border-black text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-1 text-left w-8">#</th>
                <th className="border border-black p-1 text-left">Criteria</th>
                <th className="border border-black p-1 text-center w-10">Pts</th>
                {sampleNumbers.map(n => (
                  <th key={n} className="border border-black p-1 text-center w-16">
                    Sample {n}
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
                {sampleNumbers.map(n => (
                  <td key={n} className="border border-black p-1 h-8"></td>
                ))}
              </tr>
              
              {template.sampleQuestions.map((q, idx) => {
                const isCritical = template.criticalFailKeys?.includes(q.key);
                return (
                  <tr key={q.key} className={isCritical ? 'bg-red-50' : ''}>
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1">
                      {q.label}
                      {q.required && <span className="text-red-600 ml-1">*</span>}
                      {isCritical && <span className="text-red-600 ml-1 font-bold">(CRITICAL)</span>}
                      {q.type === 'select' && q.options && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          Options: {q.options.join(' / ')}
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-1 text-center">{q.score}</td>
                    {sampleNumbers.map(n => (
                      <td key={n} className="border border-black p-1 h-8">
                        {q.type === 'yn' && (
                          <div className="flex justify-around text-xs">
                            <span>Y</span>
                            <span>N</span>
                            <span>NA</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              
              {/* Totals Row */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="border border-black p-1 text-right">
                  TOTAL SCORE:
                </td>
                <td className="border border-black p-1 text-center">
                  {template.sampleQuestions.reduce((sum, q) => sum + q.score, 0)}
                </td>
                {sampleNumbers.map(n => (
                  <td key={n} className="border border-black p-1 h-8"></td>
                ))}
              </tr>
              
              {/* Pass/Fail Row */}
              <tr className="font-bold">
                <td colSpan={3} className="border border-black p-1 text-right">
                  PASS / FAIL:
                </td>
                {sampleNumbers.map(n => (
                  <td key={n} className="border border-black p-1 h-8 text-center">
                    <span className="text-xs">P / F</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Notes Section */}
          <div className="mt-4 border border-black p-2">
            <p className="font-semibold text-sm mb-1">Notes / Observations:</p>
            <div className="h-20 border-t border-dotted border-gray-400"></div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-xs text-gray-600 flex justify-between">
            <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            <span>Nurse Educator Suite • Pre-Audit Form</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
