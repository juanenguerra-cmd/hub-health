import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import type { EducationSession } from '@/types/nurse-educator';
import { detectEducationCategory, todayYMD } from '@/lib/calculations';
import { 
  GraduationCap, 
  Calendar, 
  User, 
  Users, 
  CheckCircle2, 
  Clock,
  Pencil,
  FileText,
  Trash2
} from 'lucide-react';

interface SessionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: EducationSession | null;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateSignOff: () => void;
}

export function SessionDetailModal({
  open,
  onOpenChange,
  session,
  onEdit,
  onDelete,
  onGenerateSignOff
}: SessionDetailModalProps) {
  if (!session) return null;

  const today = todayYMD();
  const isOverdue = session.status === 'planned' && session.scheduledDate && session.scheduledDate < today;
  const category = session.category || detectEducationCategory(session.topic || '', session.summary || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Session Details
          </DialogTitle>
          <DialogDescription>View and manage this education session.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Badge */}
          <div>
            {session.status === 'completed' ? (
              <StatusBadge status="success">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </StatusBadge>
            ) : isOverdue ? (
              <StatusBadge status="error">
                <Clock className="w-3 h-3" /> Overdue
              </StatusBadge>
            ) : (
              <StatusBadge status="warning">
                <Clock className="w-3 h-3" /> Planned
              </StatusBadge>
            )}
          </div>

          {/* Topic */}
          <div>
            <h3 className="text-lg font-semibold">{session.topic || 'Untitled Session'}</h3>
            {session.summary && (
              <p className="text-sm text-muted-foreground mt-1">{session.summary}</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <Badge variant="outline" className="mt-1">
                {category}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                {session.status === 'completed' 
                  ? session.completedDate 
                  : session.scheduledDate || 'TBD'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Instructor</p>
              <p className="flex items-center gap-1 mt-1">
                <User className="w-4 h-4" />
                {session.instructor || '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Audience</p>
              <p className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4" />
                {session.audience || '—'}
              </p>
            </div>
            {session.unit && (
              <div>
                <p className="text-muted-foreground">Unit</p>
                <p className="mt-1">Unit {session.unit}</p>
              </div>
            )}
            {session.templateTitle && (
              <div>
                <p className="text-muted-foreground">Related Audit</p>
                <p className="mt-1 text-xs">{session.templateTitle}</p>
              </div>
            )}
          </div>

          {/* Attendees */}
          {session.attendees && session.attendees.length > 0 && (
            <div>
              <p className="text-muted-foreground text-sm mb-2">Attendees ({session.attendees.length})</p>
              <div className="flex flex-wrap gap-1">
                {session.attendees.map((name, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div>
              <p className="text-muted-foreground text-sm">Notes</p>
              <p className="text-sm mt-1 bg-muted/50 p-2 rounded">{session.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Education Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{session.topic}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={onGenerateSignOff}>
                <FileText className="w-4 h-4 mr-1" />
                Sign-Off Sheet
              </Button>
              <Button onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
