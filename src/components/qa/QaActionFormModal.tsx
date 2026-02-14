import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { GraduationCap, ClipboardList } from 'lucide-react';
import type { QaAction, AuditTemplate } from '@/types/nurse-educator';
import { todayYMD } from '@/lib/calculations';
import { sanitizeMultiline, sanitizeText } from '@/lib/sanitize';
import { validateAndNormalizeDate } from '@/lib/date-utils';
import { StaffSelect } from '@/components/ui/staff-select';
import { findMatchingCompetencies, formatCompetenciesForNotes } from '@/lib/competency-library';
import { findDuplicateQaAction } from '@/lib/duplicate-detection';

interface QaActionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: QaAction | null;
  templates: AuditTemplate[];
  onSave: (action: QaAction) => void;
  dictionaries?: { units: string[]; owners: string[]; staffRoles: string[]; topics: string[] };
}

export function QaActionFormModal({
  open,
  onOpenChange,
  action,
  templates,
  onSave,
  dictionaries
}: QaActionFormModalProps) {
  const isEditing = !!action;
  const today = todayYMD();
  const { staffDirectory, qaActions } = useApp();

  const [formData, setFormData] = useState<Partial<QaAction>>({
    status: 'open',
    issue: '',
    topic: '',
    summary: '',
    owner: '',
    unit: '',
    dueDate: '',
    notes: '',
    templateId: '',
    templateTitle: '',
    reAuditDueDate: '',
    reAuditTemplateId: '',
    ev_policyReviewed: false,
    ev_educationProvided: false,
    ev_competencyValidated: false,
    ev_correctiveAction: false,
    ev_monitoringInPlace: false,
    staffAudited: '',
    linkedEducationSessions: []
  });

  // Find matching competencies based on issue and topic
  const matchingCompetencies = useMemo(() => {
    return findMatchingCompetencies(formData.issue || '', formData.topic || '');
  }, [formData.issue, formData.topic]);


  const [dateErrors, setDateErrors] = useState<{ dueDate?: string; reAuditDueDate?: string }>({});

  const validateStaff = (name: string): boolean => {
    if (!name.trim()) return false;
    return staffDirectory.rows.some((s) => s.name === name && s.status === 'Active');
  };

  const validateDateField = (field: 'dueDate' | 'reAuditDueDate', value: string): string => {
    if (!value) {
      setDateErrors((prev) => ({ ...prev, [field]: undefined }));
      return '';
    }

    const normalized = validateAndNormalizeDate(value);
    if (!normalized) {
      const message = 'Enter a valid date in YYYY-MM-DD format';
      setDateErrors((prev) => ({ ...prev, [field]: message }));
      return '';
    }

    setDateErrors((prev) => ({ ...prev, [field]: undefined }));
    if (normalized !== value) {
      setFormData((prev) => ({ ...prev, [field]: normalized }));
    }
    return normalized;
  };

  useEffect(() => {
    if (action) {
      setFormData({ ...action });
    } else {
      // Default due date 14 days from today
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setFormData({
        status: 'open',
        issue: '',
        topic: '',
        summary: '',
        owner: '',
        unit: '',
        dueDate: defaultDue.toISOString().slice(0, 10),
        notes: '',
        templateId: '',
        templateTitle: '',
        reAuditDueDate: '',
        reAuditTemplateId: '',
        ev_policyReviewed: false,
        ev_educationProvided: false,
        ev_competencyValidated: false,
        ev_correctiveAction: false,
        ev_monitoringInPlace: false,
        linkedEducationSessions: []
      });
    }
  }, [action, open]);

  const handleSave = () => {
    const dueDate = validateDateField('dueDate', formData.dueDate || '');
    const reAuditDueDate = validateDateField('reAuditDueDate', formData.reAuditDueDate || '');
    if (!formData.issue?.trim()) {
      toast({ title: 'Error', description: 'Issue is required', variant: 'destructive' });
      return;
    }

    if (!formData.staffAudited?.trim()) {
      toast({ title: 'Error', description: 'Staff member required for audit sample', variant: 'destructive' });
      return;
    }

    const staffIsValid = validateStaff(formData.staffAudited || '');
    const isLegacyStaff = isEditing && action?.staffAudited === formData.staffAudited;
    if (!staffIsValid && !isLegacyStaff) {
      toast({ title: 'Error', description: 'Staff member must be selected from active staff directory', variant: 'destructive' });
      return;
    }

    if ((formData.dueDate || '') && !dueDate) {
      toast({ title: 'Error', description: 'Due date is invalid', variant: 'destructive' });
      return;
    }

    if ((formData.reAuditDueDate || '') && !reAuditDueDate) {
      toast({ title: 'Error', description: 'Re-audit due date is invalid', variant: 'destructive' });
      return;
    }

    const now = new Date().toISOString();
    const duplicate = findDuplicateQaAction({
      ...(action || {
        createdAt: now,
        status: 'open',
        templateId: '',
        templateTitle: '',
        unit: '',
        auditDate: today,
        sessionId: '',
        sample: '',
        issue: '',
        reason: '',
        topic: '',
        summary: '',
        owner: '',
        dueDate: '',
        completedAt: '',
        notes: '',
        ftagTags: [],
        nydohTags: [],
        reAuditDueDate: '',
        reAuditCompletedAt: '',
        reAuditSessionRef: '',
        reAuditTemplateId: '',
        ev_policyReviewed: false,
        ev_educationProvided: false,
        ev_competencyValidated: false,
        ev_correctiveAction: false,
        ev_monitoringInPlace: false,
        linkedEduSessionId: '',
        linkedEducationSessions: [],
        staffAudited: ''
      }),
      id: action?.id || crypto.randomUUID(),
      issue: sanitizeText(formData.issue || ''),
      unit: formData.unit || '',
      staffAudited: sanitizeText(formData.staffAudited || ''),
      status: (formData.status as 'open' | 'in_progress' | 'complete') || 'open',
      dueDate: dueDate || '',
      reAuditDueDate: reAuditDueDate || ''
    }, qaActions.filter((item) => item.id !== action?.id));

    if (duplicate) {
      toast({ title: 'Possible duplicate', description: `Existing action found: ${duplicate.issue}`, variant: 'destructive' });
      return;
    }

    const savedAction: QaAction = {
      id: action?.id || `qa_${Date.now().toString(16)}`,
      createdAt: action?.createdAt || now,
      status: formData.status as 'open' | 'in_progress' | 'complete',
      templateId: formData.templateId || '',
      templateTitle: formData.templateTitle || '',
      unit: formData.unit || '',
      auditDate: action?.auditDate || today,
      sessionId: action?.sessionId || '',
      sample: action?.sample || '',
      issue: sanitizeText(formData.issue || ''),
      reason: sanitizeText(action?.reason || ''),
      topic: sanitizeText(formData.topic || ''),
      summary: sanitizeMultiline(formData.summary || ''),
      owner: formData.owner || '',
      dueDate: dueDate || '',
      completedAt: formData.status === 'complete' && !action?.completedAt ? today : (action?.completedAt || ''),
      notes: sanitizeMultiline(formData.notes || ''),
      ftagTags: action?.ftagTags || [],
      nydohTags: action?.nydohTags || [],
      reAuditDueDate: reAuditDueDate || '',
      reAuditCompletedAt: action?.reAuditCompletedAt || '',
      reAuditSessionRef: action?.reAuditSessionRef || '',
      reAuditTemplateId: formData.reAuditTemplateId || '',
      ev_policyReviewed: !!formData.ev_policyReviewed,
      ev_educationProvided: !!formData.ev_educationProvided,
      ev_competencyValidated: !!formData.ev_competencyValidated,
      ev_correctiveAction: !!formData.ev_correctiveAction,
      ev_monitoringInPlace: !!formData.ev_monitoringInPlace,
      linkedEduSessionId: action?.linkedEduSessionId || '',
      linkedEducationSessions: action?.linkedEducationSessions || [],
      staffAudited: sanitizeText(formData.staffAudited || ''),
      staffRole: formData.staffRole || action?.staffRole || ''
    };

    onSave(savedAction);
    toast({ title: isEditing ? 'Action Updated' : 'Action Created', description: `"${savedAction.issue}" has been saved.` });
    onOpenChange(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    const effectiveId = templateId === 'none' ? '' : templateId;
    const template = templates.find(t => t.id === effectiveId);
    setFormData({
      ...formData,
      templateId: effectiveId,
      templateTitle: template?.title || '',
      reAuditTemplateId: effectiveId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit QA Action' : 'Create QA Action'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the QA action details and evidence.' : 'Create a new QA action to track corrective measures.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Issue */}
          <div>
            <Label>Issue / Finding *</Label>
            <Input
              value={formData.issue || ''}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Describe the issue found..."
            />
          </div>

          {/* Status & Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status || 'open'}
                onValueChange={(v: 'open' | 'in_progress' | 'complete') => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Owner</Label>
              <Input list="owner-options"
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Assigned owner..."
              />
              <datalist id="owner-options">{(dictionaries?.owners || []).map((option) => <option key={option} value={option} />)}</datalist>
            </div>
          </div>

          {/* Related Audit Tool */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Related Audit Tool</Label>
              <Select
                value={formData.templateId || 'none'}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audit tool..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {templates.filter(t => !t.archived).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Input list="unit-options"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., 1A, 2B..."
              />
              <datalist id="unit-options">{(dictionaries?.units || []).map((option) => <option key={option} value={option} />)}</datalist>
            </div>
          </div>

          {/* Staff Audited */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff Being Audited *</Label>
              <StaffSelect
                value={formData.staffAudited || ''}
                onValueChange={(value) => setFormData({ ...formData, staffAudited: value })}
                placeholder="Select staff member..."
              />
              {formData.staffAudited && !validateStaff(formData.staffAudited) && (
                <Badge variant="secondary" className="mt-2">Not in active staff directory</Badge>
              )}
            </div>
            <div>
              <Label>Staff Role</Label>
              <Input list="staff-role-options"
                value={formData.staffRole || ''}
                onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                placeholder="RN, LPN, CNA..."
              />
              <datalist id="staff-role-options">{(dictionaries?.staffRoles || []).map((option) => <option key={option} value={option} />)}</datalist>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                onBlur={(e) => validateDateField('dueDate', e.target.value)}
              />
              {dateErrors.dueDate && <p className="text-xs text-destructive mt-1">{dateErrors.dueDate}</p>}
            </div>
            <div>
              <Label>Re-Audit Due Date</Label>
              <Input
                type="date"
                value={formData.reAuditDueDate || ''}
                onChange={(e) => setFormData({ ...formData, reAuditDueDate: e.target.value })}
                onBlur={(e) => validateDateField('reAuditDueDate', e.target.value)}
              />
              {dateErrors.reAuditDueDate && <p className="text-xs text-destructive mt-1">{dateErrors.reAuditDueDate}</p>}
            </div>
          </div>

          {/* Topic & Summary */}
          <div>
            <Label>Topic</Label>
            <Input list="topic-options"
              value={formData.topic || ''}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Education topic or category..."
            />
            <datalist id="topic-options">{(dictionaries?.topics || []).map((option) => <option key={option} value={option} />)}</datalist>
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary of the action needed..."
              rows={2}
            />
          </div>

          {/* Evidence Checklist */}
          <div>
            <Label className="mb-2 block">Evidence Checklist</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ev_policy"
                  checked={!!formData.ev_policyReviewed}
                  onCheckedChange={(v) => setFormData({ ...formData, ev_policyReviewed: !!v })}
                />
                <label htmlFor="ev_policy" className="text-sm">Policy Reviewed</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ev_education"
                  checked={!!formData.ev_educationProvided}
                  onCheckedChange={(v) => setFormData({ ...formData, ev_educationProvided: !!v })}
                />
                <label htmlFor="ev_education" className="text-sm">Education Provided</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ev_competency"
                  checked={!!formData.ev_competencyValidated}
                  onCheckedChange={(v) => setFormData({ ...formData, ev_competencyValidated: !!v })}
                />
                <label htmlFor="ev_competency" className="text-sm">Competency Validated</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ev_corrective"
                  checked={!!formData.ev_correctiveAction}
                  onCheckedChange={(v) => setFormData({ ...formData, ev_correctiveAction: !!v })}
                />
                <label htmlFor="ev_corrective" className="text-sm">Corrective Action Taken</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ev_monitoring"
                  checked={!!formData.ev_monitoringInPlace}
                  onCheckedChange={(v) => setFormData({ ...formData, ev_monitoringInPlace: !!v })}
                />
                <label htmlFor="ev_monitoring" className="text-sm">Monitoring In Place</label>
              </div>
            </div>
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
                      notes: existingNotes + separator + competencyNotes,
                      ev_competencyValidated: false // Mark as needing validation
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
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
