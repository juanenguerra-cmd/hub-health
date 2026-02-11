import { z } from 'zod';
import type { AuditTemplate, TemplateQuestion, TemplateReference } from '@/types/nurse-educator';

const REFERENCE_FRAMEWORKS = ['CMS', 'NYCRR', 'CDC', 'SSA', 'Other'] as const;

export const templateReferenceSchema = z.object({
  framework: z.enum(REFERENCE_FRAMEWORKS).optional(),
  type: z.string().optional(),
  id: z.string().optional(),
  title: z.string().optional(),
  system: z.string().default('Other'),
  code: z.string().default(''),
  whyItMatters: z.string().optional()
});

export const templateQuestionSchema = z.object({
  scope: z.enum(['session', 'sample']).optional(),
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'select', 'yn', 'ynna', 'patientCode', 'number', 'date', 'datetime']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  affectsScore: z.boolean().optional(),
  criticalFail: z.boolean().optional(),
  score: z.number().optional(),
  points: z.number().optional(),
  weight: z.number().optional(),
  criticalFailIf: z.string().optional(),
  subjectCode: z.string().optional(),
  room: z.string().optional(),
  unit: z.string().optional(),
  evidenceHint: z.string().optional(),
  riskIfNoncompliant: z.string().optional(),
  references: z.array(templateReferenceSchema).optional()
});

export const templateSchema = z.object({
  id: z.string().min(1),
  templateId: z.string().optional(),
  title: z.string().min(1),
  version: z.string().default('1.0.0'),
  category: z.string().default('Uncategorized'),
  placementTags: z.array(z.string()).default([]),
  ftagTags: z.array(z.string()).default([]),
  nydohTags: z.array(z.string()).default([]),
  purpose: z.object({
    summary: z.string().default(''),
    risk: z.string().default(''),
    evidenceToShow: z.string().default('')
  }).default({ summary: '', risk: '', evidenceToShow: '' }),
  references: z.array(templateReferenceSchema).default([]),
  scoring: z.object({
    mode: z.enum(['sum', 'weighted', 'singleGate']).default('sum'),
    maxScore: z.number().default(100),
    naPolicy: z.enum(['excludeFromDenominator', 'fullCredit', 'zero']).default('excludeFromDenominator')
  }).optional(),
  sessionHeader: z.object({
    facility: z.string().optional(),
    unit: z.string().optional(),
    date: z.string().optional(),
    shift: z.string().optional(),
    auditorName: z.string().optional(),
    auditorRole: z.string().optional(),
    batchLabel: z.string().optional(),
    notes: z.string().optional()
  }).optional(),
  gatingRules: z.array(z.object({
    key: z.string(),
    failIf: z.string(),
    reason: z.string().optional()
  })).optional(),
  passingThreshold: z.number().default(100),
  criticalFailKeys: z.array(z.string()).default([]),
  sessionQuestions: z.array(templateQuestionSchema).default([]),
  sampleQuestions: z.array(templateQuestionSchema).default([]),
  archived: z.boolean().optional(),
  archivedAt: z.string().optional(),
  archivedBy: z.string().optional(),
  replacedByTemplateId: z.string().optional()
});

function normalizeReference(reference: TemplateReference): TemplateReference {
  const framework = reference.framework
    ?? (reference.system === 'CMS' ? 'CMS' : reference.system?.includes('NY') ? 'NYCRR' : 'Other');
  const id = reference.id ?? reference.code;
  const title = reference.title ?? '';
  return {
    ...reference,
    framework,
    type: reference.type,
    id,
    title,
    system: reference.system || framework,
    code: reference.code || id || ''
  };
}

function toStructuredReferences(template: Partial<AuditTemplate>): TemplateReference[] {
  const base = Array.isArray(template.references) ? template.references : [];
  const derived: TemplateReference[] = [];

  for (const tag of template.ftagTags || []) {
    derived.push({ framework: 'CMS', system: 'CMS', code: tag, id: tag, title: 'F-Tag' });
  }
  for (const tag of template.nydohTags || []) {
    derived.push({ framework: 'NYCRR', system: 'NYCRR', code: tag, id: tag, title: 'NYCRR' });
  }

  const byKey = new Map<string, TemplateReference>();
  [...base, ...derived].map(normalizeReference).forEach((ref) => {
    const key = `${ref.framework}|${ref.id}`;
    if (!byKey.has(key)) byKey.set(key, ref);
  });

  return [...byKey.values()];
}

function normalizeQuestion(question: TemplateQuestion, scope: 'session' | 'sample', criticalFailKeys: string[]): TemplateQuestion {
  const points = question.points ?? question.score ?? 0;
  const type = question.type === 'yn' && question.options?.includes('N/A') ? 'ynna' : question.type;
  const criticalFail = question.criticalFail ?? (criticalFailKeys.includes(question.key) || question.criticalFailIf === 'no');

  const normalized: TemplateQuestion = {
    ...question,
    scope: question.scope ?? scope,
    type,
    score: points,
    points,
    affectsScore: question.affectsScore ?? points > 0,
    criticalFail,
    criticalFailIf: criticalFail ? (question.criticalFailIf ?? 'no') : question.criticalFailIf
  };

  if (question.type === 'patientCode' && !normalized.subjectCode) {
    normalized.subjectCode = question.key;
  }

  return normalized;
}

export function normalizeTemplate(template: Partial<AuditTemplate>, index = 0): AuditTemplate {
  const id = template.templateId || template.id || `legacy_template_${index + 1}`;
  const references = toStructuredReferences(template);
  const ftagTags = references.filter((r) => r.framework === 'CMS').map((r) => r.id || r.code).filter(Boolean) as string[];
  const nydohTags = references.filter((r) => r.framework === 'NYCRR').map((r) => r.id || r.code).filter(Boolean) as string[];

  const criticalFailKeys = Array.isArray(template.criticalFailKeys) ? template.criticalFailKeys : [];
  const sessionQuestions = (template.sessionQuestions || []).map((q) => normalizeQuestion(q, 'session', criticalFailKeys));
  const sampleQuestions = (template.sampleQuestions || []).map((q) => normalizeQuestion(q, 'sample', criticalFailKeys));

  const computedMaxScore = sampleQuestions
    .filter((q) => q.affectsScore)
    .reduce((sum, q) => sum + (q.points ?? q.score ?? 0), 0);

  const normalizedCandidate: AuditTemplate = {
    id,
    templateId: id,
    title: template.title || 'Untitled Audit Template',
    version: template.version || '1.0.0',
    category: template.category || 'Uncategorized',
    placementTags: Array.isArray(template.placementTags) ? template.placementTags : [],
    ftagTags,
    nydohTags,
    purpose: {
      summary: template.purpose?.summary || '',
      risk: template.purpose?.risk || '',
      evidenceToShow: template.purpose?.evidenceToShow || ''
    },
    references,
    scoring: {
      mode: template.scoring?.mode || 'sum',
      maxScore: template.scoring?.maxScore ?? computedMaxScore,
      naPolicy: template.scoring?.naPolicy || 'excludeFromDenominator'
    },
    sessionHeader: {
      facility: template.sessionHeader?.facility,
      unit: template.sessionHeader?.unit,
      date: template.sessionHeader?.date || 'auditDate',
      shift: template.sessionHeader?.shift,
      auditorName: template.sessionHeader?.auditorName || 'auditor',
      auditorRole: template.sessionHeader?.auditorRole,
      batchLabel: template.sessionHeader?.batchLabel,
      notes: template.sessionHeader?.notes
    },
    gatingRules: template.gatingRules || [],
    passingThreshold: template.passingThreshold ?? 100,
    criticalFailKeys: Array.from(new Set([
      ...criticalFailKeys,
      ...sampleQuestions.filter((q) => q.criticalFail).map((q) => q.key)
    ])),
    sessionQuestions,
    sampleQuestions,
    archived: template.archived,
    archivedAt: template.archivedAt,
    archivedBy: template.archivedBy,
    replacedByTemplateId: template.replacedByTemplateId
  };

  return templateSchema.parse(normalizedCandidate);
}

export function normalizeTemplates(templates: Partial<AuditTemplate>[]): AuditTemplate[] {
  return templates.map((template, index) => normalizeTemplate(template, index));
}
