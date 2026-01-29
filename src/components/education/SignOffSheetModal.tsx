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
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 8px;
            }
            .header-logo {
              flex-shrink: 0;
            }
            .header-logo img {
              max-height: 60px;
              max-width: 150px;
            }
            .header-logo .facility-name {
              font-size: 14px;
              font-weight: 600;
              color: #8B7355;
              margin-top: 4px;
            }
            .header-logo .facility-subtitle {
              font-size: 10px;
              color: #8B7355;
            }
            .sheet-title { 
              text-align: center;
              font-size: 14px; 
              font-weight: bold; 
              margin: 16px 0 12px 0;
            }
            .topic-box { 
              border: 1px solid #ddd; 
              padding: 10px 12px; 
              margin-bottom: 12px;
              background: #fafafa;
              font-size: 11px;
            }
            .topic-row {
              margin-bottom: 4px;
            }
            .topic-row:last-child {
              margin-bottom: 0;
            }
            .topic-label { 
              font-weight: 600;
              color: #1a4480;
            }
            .instructor-row {
              display: flex;
              gap: 24px;
            }
            .page-indicator {
              font-size: 10px;
              color: #1a4480;
              margin-bottom: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            thead {
              display: table-header-group;
            }
            th { 
              background: #fff; 
              border-bottom: 1px solid #8B7355; 
              padding: 6px 8px; 
              text-align: left;
              font-size: 10px;
              font-weight: 600;
              color: #8B7355;
            }
            td { 
              border-bottom: 1px solid #ddd; 
              padding: 4px 8px; 
              height: 20px;
            }
            td:first-child {
              width: 25px; 
              color: #666;
            }
            td:nth-child(2) { width: 40%; }
            td:nth-child(3) { width: 25%; }
            td:nth-child(4) { width: 30%; }
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
          {/* Header with Logo */}
          <div className="flex items-start gap-4 mb-2">
            {showLogo && logoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="max-h-[60px] max-w-[150px]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>{facilityName}</p>
              {showLogo && (
                <p className="text-xs" style={{ color: '#8B7355' }}>nursing and rehabilitation center</p>
              )}
            </div>
          </div>

          {/* Centered Title */}
          <h1 className="text-center text-sm font-bold my-3">Inservice Sign-In Sheet</h1>

          {/* Topic Box */}
          <div className="border rounded p-2.5 mb-3 bg-muted/30 text-xs">
            <div className="mb-1">
              <span className="font-semibold text-primary">Topic:</span> {session.topic || 'Untitled Session'}
            </div>
            {session.summary && (
              <div className="mb-1">
                <span className="font-semibold text-primary">Description:</span> {session.summary}
              </div>
            )}
            {facilityPolicyNotes && (
              <div className="mb-1">
                <span className="font-semibold text-primary">Facility Policy Notes:</span> {facilityPolicyNotes}
              </div>
            )}
            <div className="flex gap-6">
              <span><span className="font-semibold text-primary">Instructor:</span> {session.instructor || '—'}</span>
              <span><span className="font-semibold text-primary">Audience:</span> {session.audience || '—'}</span>
            </div>
          </div>

          {/* Page indicator */}
          <p className="text-[10px] text-primary mb-1">Sign-in page 1 of 1</p>

          {/* Sign-in Table */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b-2 p-1.5 text-left w-6 font-semibold" style={{ borderColor: '#8B7355', color: '#8B7355' }}>#</th>
                <th className="border-b-2 p-1.5 text-left font-semibold" style={{ borderColor: '#8B7355', color: '#8B7355', width: '40%' }}>Name</th>
                <th className="border-b-2 p-1.5 text-left font-semibold" style={{ borderColor: '#8B7355', color: '#8B7355', width: '25%' }}>Position</th>
                <th className="border-b-2 p-1.5 text-left font-semibold" style={{ borderColor: '#8B7355', color: '#8B7355', width: '30%' }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(num => (
                <tr key={num}>
                  <td className="border-b border-gray-300 p-1.5 text-muted-foreground">{num}</td>
                  <td className="border-b border-gray-300 p-1.5 h-5"></td>
                  <td className="border-b border-gray-300 p-1.5 h-5"></td>
                  <td className="border-b border-gray-300 p-1.5 h-5"></td>
                </tr>
              ))}
            </tbody>
          </table>
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
