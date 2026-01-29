import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { EducationSession } from '@/types/nurse-educator';
import { FileText, Printer, X } from 'lucide-react';
import facilityLogo from '@/assets/facility-logo.jpg';

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
  const [showLogo, setShowLogo] = useState(true);
  const [facilityPolicyNotes, setFacilityPolicyNotes] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  if (!session) return null;

  const sessionDate = session.status === 'completed' ? session.completedDate : session.scheduledDate;
  
  // Generate 24 rows to match template
  const rows = Array.from({ length: 24 }, (_, i) => i + 1);

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
              font-size: 10px;
              line-height: 1.3;
              padding: 20px 30px;
              color: #333;
            }
            .header-logo {
              text-align: center;
              margin-bottom: 8px;
            }
            .header-logo img {
              height: 35px;
              width: auto;
              max-width: 200px;
            }
            .sheet-title { 
              text-align: center;
              font-size: 14px; 
              font-weight: bold; 
              margin: 12px 0;
              color: #1a4480;
            }
            .topic-box { 
              border: 1px solid #ddd; 
              padding: 10px 12px; 
              margin-bottom: 12px;
              background: #fafafa;
              font-size: 10px;
            }
            .topic-row {
              margin-bottom: 3px;
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
              font-size: 9px;
              color: #1a4480;
              margin-bottom: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th { 
              border-bottom: 2px solid #8B7355; 
              padding: 6px 8px; 
              text-align: left;
              font-size: 10px;
              font-weight: 600;
              color: #8B7355;
            }
            td { 
              border-bottom: 1px solid #ddd; 
              padding: 4px 8px; 
              height: 22px;
              font-size: 9px;
            }
            td:first-child { width: 25px; color: #666; }
            td:nth-child(2) { width: 40%; }
            td:nth-child(3) { width: 25%; }
            td:nth-child(4) { width: 30%; }
            @media print {
              body { padding: 15px 20px; }
              @page { margin: 0.5in; size: letter; }
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" />
            Generate Sign-Off Sheet
          </DialogTitle>
        </DialogHeader>

        {/* Options */}
        <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Switch
              id="showLogo"
              checked={showLogo}
              onCheckedChange={setShowLogo}
              className="scale-75"
            />
            <Label htmlFor="showLogo" className="text-xs">Include Logo</Label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Input
              id="policyNotes"
              value={facilityPolicyNotes}
              onChange={(e) => setFacilityPolicyNotes(e.target.value)}
              placeholder="Facility policy notes (optional)"
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[450px]" ref={printRef}>
          {/* Centered Logo */}
          {showLogo && (
            <div className="header-logo text-center mb-3">
              <img 
                src={facilityLogo} 
                alt="Long Beach Nursing and Rehabilitation Center" 
                style={{ height: '50px', width: 'auto', display: 'inline-block' }}
              />
            </div>
          )}

          {/* Centered Title */}
          <h1 className="text-center text-sm font-bold my-3 text-primary">Inservice Sign-In Sheet</h1>

          {/* Topic Box */}
          <div className="border rounded p-2.5 mb-3 bg-gray-50 text-[10px]">
            <div className="topic-row mb-1">
              <span className="font-semibold text-primary">Topic:</span> {session.topic || 'Untitled Session'}
            </div>
            {session.summary && (
              <div className="topic-row mb-1">
                <span className="font-semibold text-primary">Description:</span> {session.summary}
              </div>
            )}
            {facilityPolicyNotes && (
              <div className="topic-row mb-1">
                <span className="font-semibold text-primary">Policy Notes:</span> {facilityPolicyNotes}
              </div>
            )}
            <div className="instructor-row flex gap-6">
              <span><span className="font-semibold text-primary">Instructor:</span> {session.instructor || '—'}</span>
              <span><span className="font-semibold text-primary">Audience:</span> {session.audience || '—'}</span>
            </div>
          </div>

          {/* Page indicator */}
          <p className="page-indicator text-[9px] text-primary mb-1">Sign-in page 1 of 1</p>

          {/* Sign-in Table */}
          <table className="w-full border-collapse text-[10px]">
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
                  <td className="border-b border-gray-200 p-1.5 text-gray-500">{num}</td>
                  <td className="border-b border-gray-200 p-1.5 h-5"></td>
                  <td className="border-b border-gray-200 p-1.5 h-5"></td>
                  <td className="border-b border-gray-200 p-1.5 h-5"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-3 h-3 mr-1" />
            Close
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="w-3 h-3 mr-1" />
            Print / Save as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
