import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { StepWizard, type WizardStep } from '@/components/wizard/StepWizard';
import { BulkSampleOperations } from '@/components/audit/BulkSampleOperations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuditSession, AuditTemplate } from '@/types/nurse-educator';
import { useSmartDefaults } from '@/hooks/use-smart-defaults';

interface AuditSessionWizardProps {
  template: AuditTemplate;
  onComplete: (session: AuditSession) => void;
}

function SessionSetupStep({ data, onChange }: { data: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Audit Date</Label>
        <Input type="date" value={String(data.auditDate ?? "")} onChange={(event) => onChange({ ...data, auditDate: event.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Unit</Label>
        <Input value={String(data.unit ?? "")} onChange={(event) => onChange({ ...data, unit: event.target.value })} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Auditor</Label>
        <Input value={String(data.auditor ?? "")} onChange={(event) => onChange({ ...data, auditor: event.target.value })} />
      </div>
    </div>
  );
}

function SampleCollectionStep({ data, onChange }: { data: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  const samples = Array.isArray(data.samples) ? data.samples : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{samples.length} samples collected</p>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...data, samples: [...samples, { id: crypto.randomUUID(), answers: {}, result: { pct: 0, pass: true, criticalFails: [], actionNeeded: [], max: 0, got: 0 } }] })}>
          <Plus className="w-4 h-4 mr-1" /> Add sample
        </Button>
      </div>
      <BulkSampleOperations
        onQuickAdd={(count) => onChange({ ...data, samples: [...samples, ...Array.from({ length: count }, () => ({ id: crypto.randomUUID(), answers: {}, result: { pct: 0, pass: true, criticalFails: [], actionNeeded: [], max: 0, got: 0 } }))] })}
        onCsvImport={(csvText) => onChange({ ...data, importedCsv: csvText })}
      />
    </div>
  );
}

function PlaceholderStep({ data }: { data: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  return <p className="text-sm text-muted-foreground">Step data captured. Continue to review and complete.</p>;
}

export function AuditSessionWizard({ template, onComplete }: AuditSessionWizardProps) {
  const { getDefaultAuditor, getDefaultUnit, suggestAuditDate, saveDefaults } = useSmartDefaults();

  const initialData = useMemo(() => ({
    auditDate: suggestAuditDate(template.id),
    unit: getDefaultUnit(),
    auditor: getDefaultAuditor(),
    samples: [],
  }), [getDefaultAuditor, getDefaultUnit, suggestAuditDate, template.id]);

  const steps: WizardStep[] = [
    {
      id: 'setup',
      title: 'Session Setup',
      description: 'Select the audit date, unit, and auditor.',
      component: SessionSetupStep,
      validate: (data) => ({ valid: !!data.auditDate && !!data.unit && !!data.auditor, errors: data.auditDate && data.unit && data.auditor ? [] : ['Audit date, unit, and auditor are required.'] }),
    },
    {
      id: 'samples',
      title: 'Sample Collection',
      description: 'Collect samples and use bulk actions for speed.',
      component: SampleCollectionStep,
      canSkip: true,
    },
    { id: 'scoring', title: 'Sample Details & Scoring', description: 'Capture sample details.', component: PlaceholderStep, optional: true, canSkip: true },
    { id: 'actions', title: 'Corrective Actions', description: 'Review generated action items.', component: PlaceholderStep, optional: true, canSkip: true },
    { id: 'review', title: 'Review & Complete', description: 'Review all data before completion.', component: PlaceholderStep },
  ];

  return (
    <StepWizard
      steps={steps}
      initialData={initialData}
      draftKey={`audit-session-wizard-${template.id}`}
      onComplete={(data) => {
        saveDefaults(data.unit, data.auditor);
        const completedSession: AuditSession = {
          id: crypto.randomUUID(),
          templateId: template.id,
          templateTitle: template.title,
          createdAt: new Date().toISOString(),
          header: {
            status: 'complete',
            sessionId: `S-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            auditDate: String(data.auditDate ?? ""),
            auditor: String(data.auditor ?? ""),
            unit: String(data.unit ?? ""),
          },
          samples: Array.isArray(data.samples) ? (data.samples as AuditSession["samples"]) : [],
        };
        onComplete(completedSession);
      }}
    />
  );
}
