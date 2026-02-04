import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import type { EducationSession, EduTopic } from '@/types/nurse-educator';
import { GraduationCap, BookOpen, ClipboardList } from 'lucide-react';
import { findMatchingCompetencies, formatCompetenciesForNotes } from '@/lib/competency-library';

interface EducationSessionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: EducationSession | null;
  prefill?: Partial<EducationSession> | null;
  onSave: (session: EducationSession) => void;
  eduLibrary?: EduTopic[];
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
  prefill,
  onSave,
  eduLibrary = []
}: EducationSessionFormModalProps) {
  const isEdit = !!session;
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
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

  // Filter out archived topics
  const availableTopics = eduLibrary.filter(t => !t.archived);

  // Find matching competencies based on topic and summary
  const matchingCompetencies = useMemo(() => {
    return findMatchingCompetencies(formData.topic || '', formData.summary || '');
  }, [formData.topic, formData.summary]);

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
      setSelectedTopicId('');
      return;
    }

    const initial = {
      topic: prefill?.topic || '',
      summary: prefill?.summary || '',
      category: prefill?.category || '',
      audience: prefill?.audience || '',
      instructor: prefill?.instructor || '',
      unit: prefill?.unit || '',
      scheduledDate: prefill?.scheduledDate || '',
      completedDate: prefill?.completedDate || '',
      notes: prefill?.notes || '',
      status: (prefill?.status as 'planned' | 'completed') || 'planned',
      attendees: Array.isArray(prefill?.attendees) ? prefill?.attendees.join(', ') : ''
    };

    setFormData(initial);
    setSelectedTopicId('');
  }, [session, prefill, open]);

  // Handle topic library selection
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    
    if (topicId === 'custom') {
      // User wants to enter custom topic - don't change form
      return;
    }
    
    const selectedTopic = availableTopics.find(t => t.id === topicId);
    if (selectedTopic) {
      // Auto-populate fields from the library topic
      setFormData(prev => ({
        ...prev,
        topic: selectedTopic.topic || '',
        summary: selectedTopic.description || selectedTopic.purpose || '',
        audience: selectedTopic.disciplines || prev.audience,
        // Build notes from regulatory references
        notes: buildNotesFromTopic(selectedTopic)
      }));
    }
  };

  const buildNotesFromTopic = (topic: EduTopic): string => {
    const parts: string[] = [];
    
    if (topic.ftags) {
      parts.push(`F-Tags: ${topic.ftags}`);
    }
    if (topic.nysdohRegs) {
      parts.push(`NYSDOH: ${topic.nysdohRegs}`);
    }
    if (topic.facilityPolicy) {
      parts.push(`Policy: ${topic.facilityPolicy}`);
    }
    
    return parts.join('\n');
  };

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
          <DialogDescription>
            {isEdit ? 'Update the education session details.' : 'Create a new inservice training session.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Library Selector - only show for new sessions */}
          {!isEdit && availableTopics.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Select from Topic Library
                </Label>
                <Select value={selectedTopicId} onValueChange={handleTopicSelect}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a topic or enter custom..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-[300px]">
                    <SelectItem value="custom">
                      <span className="text-muted-foreground">— Enter custom topic —</span>
                    </SelectItem>
                    {availableTopics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{topic.topic}</span>
                          {topic.ftags && (
                            <span className="text-xs text-muted-foreground">{topic.ftags}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecting a topic will auto-fill the form below
                </p>
              </div>
              <Separator />
            </>
          )}

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
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
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
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
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
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
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

          {/* Competency Recommendations */}
          {matchingCompetencies.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <Label className="font-medium">Recommended Competencies (MASTERED.IT)</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const competencyNotes = formatCompetenciesForNotes(matchingCompetencies);
                    const existingNotes = formData.notes || '';
                    const separator = existingNotes.trim() ? '\n\n' : '';
                    setFormData({
                      ...formData,
                      notes: existingNotes + separator + competencyNotes
                    });
                    toast({ title: 'Competencies Added', description: `${matchingCompetencies.length} competencies added to notes.` });
                  }}
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Add to Notes
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {matchingCompetencies.slice(0, 5).map((comp) => (
                  <div key={comp.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="font-medium">[{comp.code}] {comp.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {comp.disciplines.join(', ')} • {comp.platform === 'C' ? 'Clinical Comp' : 'Mastered'}
                    </div>
                  </div>
                ))}
                {matchingCompetencies.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{matchingCompetencies.length - 5} more matching competencies
                  </div>
                )}
              </div>
            </div>
          )}

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
