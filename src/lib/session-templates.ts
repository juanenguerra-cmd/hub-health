export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  templateId: string;
  defaultSampleCount: number;
  defaultAnswers: Record<string, string>;
  suggestedUnits: string[];
}

export const sessionTemplates: SessionTemplate[] = [
  {
    id: 'quick-hand-hygiene-5',
    name: 'Quick Hand Hygiene - 5 Samples',
    description: 'Fast hand hygiene review with a 5-sample baseline set.',
    templateId: 'hand-hygiene-template-id',
    defaultSampleCount: 5,
    defaultAnswers: {},
    suggestedUnits: ['All Units'],
  },
  {
    id: 'med-pass-10',
    name: 'Medication Pass Deep Dive - 10 Samples',
    description: 'Extended medication pass compliance review.',
    templateId: 'med-pass-template-id',
    defaultSampleCount: 10,
    defaultAnswers: {},
    suggestedUnits: ['Skilled Nursing', 'Rehab'],
  },
];
