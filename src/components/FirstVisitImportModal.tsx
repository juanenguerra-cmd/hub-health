import React, { useRef } from 'react';
import { Upload, Sparkles, ArrowRight, FileJson } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface FirstVisitImportModalProps {
  open: boolean;
  onComplete: () => void;
}

export function FirstVisitImportModal({ open, onComplete }: FirstVisitImportModalProps) {
  const { restoreFromBackup, loadDemoData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = restoreFromBackup(content);
      
      if (result.success) {
        toast.success('Data imported successfully!', {
          description: `Imported ${result.counts.templates} templates, ${result.counts.sessions} sessions, ${result.counts.eduSessions} education sessions`
        });
        onComplete();
      } else {
        toast.error('Import failed', {
          description: result.message
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success('Demo data loaded!', {
      description: 'Sample audit sessions, QA actions, and education data have been added.'
    });
    onComplete();
  };

  const handleStartFresh = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to Hub Health
          </DialogTitle>
          <DialogDescription className="text-base">
            Get started by importing existing data, loading demo data, or starting fresh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Import Existing Backup */}
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Import Existing Backup</h3>
                <p className="text-sm text-muted-foreground">
                  Have a backup file from a previous Hub Health or legacy Nurse Educator tool? Import it here.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <FileJson className="h-4 w-4" />
                  Select Backup File
                </Button>
              </div>
            </div>
          </div>

          {/* Load Demo Data */}
          <div className="rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Load Demo Data</h3>
                <p className="text-sm text-muted-foreground">
                  Explore the app with sample audit sessions, QA actions, and education records.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLoadDemo}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Load Demo Data
                </Button>
              </div>
            </div>
          </div>

          {/* Start Fresh */}
          <div className="pt-2">
            <Button 
              variant="default" 
              className="w-full gap-2"
              onClick={handleStartFresh}
            >
              Start Fresh
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              You can import data anytime from Settings → Backup & Restore
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
