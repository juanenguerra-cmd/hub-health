import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EducationSession } from '@/types/nurse-educator';
import { GraduationCap } from 'lucide-react';

interface EducationSessionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: EducationSession | null;
  onSave: (session: EducationSession) => void;
}

const CATEGORIES = [
  'Infection Control',
  'Safety',
  'Clinical Skills',
  'Documentation',
  'Regulatory',
  'Patient Rights',
  'Quality Improvement',
  'Other'
];

const AUDIENCES = [
  'All Staff',
  'Nursing',
  'CNAs',
  'Dietary',
  'Housekeeping',
  'Maintenance',
  'Administration',
  'Other'
];

export function EducationSessionFormModal({
  open,
  onOpenChange,
  session,
  onSave
}: EducationSessionFormModalProps) {
  const isEdit = !!session;
  
  const [formData, setFormData] = useState({
    topic: '',
    summary: '',
    category: '',
    audience: '',
    instructor: '',
    unit: '',
    scheduledDate: '',
    completedDate: '',
    notes: '',
    status: 'planned' as 'planned' | 'completed',
    attendees: ''
  });

  useEffect(() => {
    if (session) {
      setFormData({
        topic: session.topic || '',
        summary: session.summary || '',
        category: session.category || '',
        audience: session.audience || '',
        instructor: session.instructor || '',
        unit: session.unit || '',
        scheduledDate: session.scheduledDate || '',
        completedDate: session.completedDate || '',
        notes: session.notes || '',
        status: session.status || 'planned',
        attendees: session.attendees?.join(', ') || ''
      });
    } else {
      setFormData({
        topic: '',
        summary: '',
        category: '',
        audience: '',
        instructor: '',
        unit: '',
        scheduledDate: '',
        completedDate: '',
        notes: '',
        status: 'planned',
        attendees: ''
      });
    }
  }, [session, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const attendeesArray = formData.attendees
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const newSession: EducationSession = {
      id: session?.id || `edu-${Date.now()}`,
      createdAt: session?.createdAt || new Date().toISOString(),
      status: formData.status,
      topic: formData.topic,
      summary: formData.summary,
      category: formData.category,
      audience: formData.audience,
      instructor: formData.instructor,
      unit: formData.unit,
      scheduledDate: formData.scheduledDate,
      completedDate: formData.completedDate,
      notes: formData.notes,
      attendees: attendeesArray,
      templateTitle: session?.templateTitle || '',
      templateId: session?.templateId || '',
      issue: session?.issue || '',
      linkedQaActionId: session?.linkedQaActionId || ''
    };

    onSave(newSession);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            {isEdit ? 'Edit Education Session' : 'Plan New Inservice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Hand Hygiene Refresher"
              required
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Description</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief description of the inservice content..."
              rows={2}
            />
          </div>

          {/* Category & Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as 'planned' | 'completed' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audience & Unit row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={formData.audience}
                onValueChange={(v) => setFormData({ ...formData, audience: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map(aud => (
                    <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., All Units, 2N"
              />
            </div>
          </div>

          {/* Instructor */}
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Instructor name"
            />
          </div>

          {/* Date fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>

            {formData.status === 'completed' && (
              <div className="space-y-2">
                <Label htmlFor="completedDate">Completed Date</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (comma-separated)</Label>
            <Textarea
              id="attendees"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              placeholder="John Doe, Jane Smith, ..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
