import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { EducationSession } from '@/types/nurse-educator';
import { FileText, Printer, X } from 'lucide-react';

interface SignOffSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: EducationSession | null;
  facilityName: string;
}

export function SignOffSheetModal({
  open,
  onOpenChange,
  session,
  facilityName
}: SignOffSheetModalProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [facilityPolicyNotes, setFacilityPolicyNotes] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  if (!session) return null;

  const sessionDate = session.status === 'completed' ? session.completedDate : session.scheduledDate;
  
  // Generate 25 sequential numbered rows (1, 2, 3... 25)
  const rows = Array.from({ length: 25 }, (_, i) => i + 1);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inservice Sign-In Sheet - ${session.topic}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 11px;
              line-height: 1.4;
              padding: 20px;
              color: #333;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .header-left h1 { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 2px;
            }
            .header-left p { 
              font-size: 12px; 
              color: #666;
            }
            .header-right { 
              text-align: right; 
              font-size: 11px;
            }
            .header-right img {
              max-height: 50px;
              max-width: 120px;
              margin-bottom: 4px;
            }
            .topic-box { 
              border: 1px solid #ddd; 
              padding: 12px; 
              margin-bottom: 16px;
              background: #fafafa;
            }
            .topic-title { 
              font-weight: bold; 
              font-size: 12px;
              margin-bottom: 8px;
            }
            .topic-description { 
              margin-bottom: 8px; 
            }
            .topic-description strong { font-weight: 600; }
            .topic-policy { 
              margin-bottom: 8px; 
            }
            .topic-policy strong { font-weight: 600; }
            .topic-meta { 
              font-size: 10px;
              color: #555;
            }
            .page-indicator {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            thead {
              display: table-header-group;
            }
            th { 
              background: #f5f5f5; 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              text-align: left;
              font-size: 10px;
              font-weight: 600;
            }
            td { 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              height: 24px;
            }
            td:first-child {
              width: 30px; 
              text-align: center;
              color: #666;
            }
            td:nth-child(2) { width: 35%; }
            td:nth-child(3) { width: 25%; }
            td:nth-child(4) { width: 35%; }
            .footer { 
              margin-top: 16px;
              font-size: 9px;
              color: #888;
              font-style: italic;
            }
            tr {
              page-break-inside: avoid;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 0.5in; }
              thead {
                display: table-header-group;
              }
              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Sign-Off Sheet
          </DialogTitle>
        </DialogHeader>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <Switch
              id="showLogo"
              checked={showLogo}
              onCheckedChange={setShowLogo}
            />
            <Label htmlFor="showLogo">Include Facility Logo</Label>
          </div>
          
          {showLogo && (
            <div className="space-y-1">
              <Label htmlFor="logoUrl" className="text-xs">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="h-8 text-sm"
              />
            </div>
          )}

          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="policyNotes" className="text-xs">Facility Policy Notes (optional)</Label>
            <Input
              id="policyNotes"
              value={facilityPolicyNotes}
              onChange={(e) => setFacilityPolicyNotes(e.target.value)}
              placeholder="Facility policy references, procedures, etc."
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[500px]" ref={printRef}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-lg font-bold">{facilityName}</h1>
              <p className="text-sm text-muted-foreground">Inservice Sign-In Sheet</p>
            </div>
            <div className="text-right text-sm">
              {showLogo && logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="max-h-12 max-w-[100px] mb-1 ml-auto"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div><strong>Date:</strong> {sessionDate || 'TBD'}</div>
              <div><strong>Unit:</strong> {session.unit || 'All Units'}</div>
            </div>
          </div>

          {/* Topic Box */}
          <div className="border rounded p-3 mb-4 bg-muted/30">
            <p className="font-semibold text-sm mb-2">
              Topic: {session.topic || 'Untitled Session'}
            </p>
            {session.summary && (
              <p className="text-sm mb-2">
                <strong>Description:</strong> {session.summary}
              </p>
            )}
            {facilityPolicyNotes && (
              <p className="text-sm mb-2">
                <strong>Facility Policy Notes:</strong> {facilityPolicyNotes}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              <strong>Instructor:</strong> {session.instructor || '—'} &nbsp;&nbsp;
              <strong>Audience:</strong> {session.audience || '—'}
            </p>
          </div>

          {/* Page indicator */}
          <p className="text-xs text-muted-foreground mb-2">Sign-in page 1 of 1</p>

          {/* Sign-in Table */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-left w-8">#</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Position</th>
                <th className="border p-2 text-left">Signature</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(num => (
                <tr key={num}>
                  <td className="border p-2 text-center text-muted-foreground">{num}</td>
                  <td className="border p-2 h-7"></td>
                  <td className="border p-2 h-7"></td>
                  <td className="border p-2 h-7"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <p className="mt-4 text-xs text-muted-foreground italic">
            This document is for internal QAPI evidence. Use de-identified resident references only.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Print / Save as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
