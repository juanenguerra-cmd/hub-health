import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { QaAction } from '@/types/nurse-educator';
import { History } from 'lucide-react';

interface ChangeHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: QaAction | null;
}

export function ChangeHistoryModal({ open, onOpenChange, action }: ChangeHistoryModalProps) {
  if (!action) return null;

  const history = action.changeHistory || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </DialogTitle>
          <DialogDescription>
            Audit trail for: {action.issue || 'Untitled Action'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No change history recorded</p>
          ) : (
            <div className="space-y-4">
              {history.map((change, idx) => (
                <div key={idx} className="border-l-2 border-primary/20 pl-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium">{change.user}</p>
                      <p className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant={
                      change.action === 'created' ? 'default' :
                      change.action === 'status_changed' ? 'secondary' :
                      change.action === 'deleted' ? 'destructive' : 'outline'
                    }>
                      {change.action.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-sm mt-2">{change.description || `${change.action} ${change.field || ''}`}</p>

                  {change.field && (change.oldValue || change.newValue) && (
                    <div className="mt-2 bg-muted rounded p-2 text-xs space-y-1">
                      <div><span className="text-muted-foreground">Before:</span> <span className="line-through">{change.oldValue}</span></div>
                      <div><span className="text-muted-foreground">After:</span> <span className="font-medium">{change.newValue}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
