import { describe, expect, it } from 'vitest';
import { normalizeTemplate } from '@/lib/template-schema';
import { computeSampleResult } from '@/lib/calculations';
import { SEED_TEMPLATES } from '@/lib/seed-templates';
import { parseBackupFile, processBackupData } from '@/lib/backup-restore';

describe('template schema normalization', () => {
  it('keeps representative seed templates parseable (golden snapshot)', () => {
    const targets = [SEED_TEMPLATES[0], SEED_TEMPLATES[1], SEED_TEMPLATES[2]];
    const normalized = targets.map((template, index) => normalizeTemplate(template, index));

    expect(normalized).toMatchSnapshot();
  });

  it('derives structured references from legacy tags', () => {
    const normalized = normalizeTemplate({
      id: 'legacy_ref',
      title: 'Legacy Ref',
      version: '1.0.0',
      category: 'Legacy',
      placementTags: [],
      ftagTags: ['F880'],
      nydohTags: ['10 NYCRR 415.19'],
      purpose: { summary: '', risk: '', evidenceToShow: '' },
      references: [],
      passingThreshold: 90,
      criticalFailKeys: [],
      sessionQuestions: [],
      sampleQuestions: []
    });

    expect(normalized.references.some((ref) => ref.framework === 'CMS' && ref.id === 'F880')).toBe(true);
    expect(normalized.references.some((ref) => ref.framework === 'NYCRR' && ref.id === '10 NYCRR 415.19')).toBe(true);
  });
});

describe('scoring consistency and fail semantics', () => {
  const template = normalizeTemplate({
    id: 'test_hand_hygiene',
    title: 'Hand Hygiene',
    version: '1.0.0',
    category: 'Infection Control',
    placementTags: [],
    ftagTags: [],
    nydohTags: [],
    purpose: { summary: '', risk: '', evidenceToShow: '' },
    references: [],
    scoring: { mode: 'sum', maxScore: 20, naPolicy: 'excludeFromDenominator' },
    passingThreshold: 85,
    criticalFailKeys: ['performed_hygiene'],
    gatingRules: [{ key: 'orders_present', failIf: 'no', reason: 'Orders must be present.' }],
    sessionQuestions: [],
    sampleQuestions: [
      { key: 'subject_code', label: 'Subject', type: 'patientCode', required: true, score: 0 },
      { key: 'performed_hygiene', label: 'Performed hand hygiene', type: 'ynna', required: true, score: 10, criticalFail: true },
      { key: 'gloves_removed', label: 'Removed gloves correctly', type: 'ynna', required: true, score: 10 },
      { key: 'orders_present', label: 'Orders present', type: 'yn', required: true, score: 0, affectsScore: false }
    ]
  });

  it('computes hand hygiene style percentage with N/A excluded from denominator', () => {
    const result = computeSampleResult(template, {
      subject_code: 'A1',
      performed_hygiene: 'yes',
      gloves_removed: 'na',
      orders_present: 'yes'
    });

    expect(result.got).toBe(10);
    expect(result.pct).toBe(100);
    expect(result.pass).toBe(true);
  });

  it('fails on critical fail regardless of high score', () => {
    const result = computeSampleResult(template, {
      subject_code: 'A1',
      performed_hygiene: 'no',
      gloves_removed: 'yes',
      orders_present: 'yes'
    });

    expect(result.pct).toBe(50);
    expect(result.criticalFails).toContain('performed_hygiene');
    expect(result.pass).toBe(false);
  });

  it('treats missing required as validation action but not auto critical fail', () => {
    const nonCriticalTemplate = normalizeTemplate({
      ...template,
      id: 'required_only',
      criticalFailKeys: [],
      sampleQuestions: [
        { key: 'required_only', label: 'Required only', type: 'yn', required: true, score: 10 }
      ]
    });

    const result = computeSampleResult(nonCriticalTemplate, { required_only: '' });

    expect(result.actionNeeded.some((item) => item.reason === 'Required item missing')).toBe(true);
    expect(result.criticalFails).toEqual([]);
  });

  it('applies gating rule even when question is unscored', () => {
    const result = computeSampleResult(template, {
      subject_code: 'A1',
      performed_hygiene: 'yes',
      gloves_removed: 'yes',
      orders_present: 'no'
    });

    expect(result.criticalFails).toContain('orders_present');
    expect(result.pass).toBe(false);
  });
});

describe('backup compatibility', () => {
  it('imports old backup JSON and normalizes template content keys', () => {
    const backupJson = JSON.stringify({
      kind: 'NURSE_EDUCATOR_SUITE_BACKUP',
      templates: [{
        id: 'legacy_1',
        title: 'Legacy',
        version: '1.0.0',
        category: 'Legacy',
        placementTags: [],
        ftagTags: ['F695'],
        nydohTags: [],
        purpose: { summary: '', risk: '', evidenceToShow: '' },
        references: [],
        passingThreshold: 80,
        criticalFailKeys: [],
        sessionQuestions: [{ key: 'month', label: 'Month', type: 'text', required: false, score: 0 }],
        sampleQuestions: [{ key: 'patient_code', label: 'Resident', type: 'patientCode', required: true, score: 0 }]
      }],
      sessions: []
    });

    const parsed = parseBackupFile(backupJson);
    expect(parsed).not.toBeNull();
    const processed = processBackupData(parsed!);

    expect(processed.templates).toHaveLength(1);
    expect(processed.templates[0].templateId).toBe('legacy_1');
    expect(processed.templates[0].sessionHeader?.date).toBe('auditDate');
    expect(processed.templates[0].sampleQuestions[0].subjectCode).toBe('patient_code');
  });
});
