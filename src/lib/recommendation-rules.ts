export interface RecommendationRule {
  id: string;
  trigger: string;
  competencyDomains: string[];
  inserviceTitle: string;
  followUp: string;
  searchTags: string[];
}

export interface RecommendationPreview {
  id: string;
  issue: string;
  unit: string;
  trend: string;
  recommendedCompetencies: string[];
  recommendedInservices: string[];
  followUpPlan: string;
}

export const recommendationRules: RecommendationRule[] = [
  {
    id: 'rule-hh-01',
    trigger: 'Hand hygiene < 90% or critical miss',
    competencyDomains: ['Hand Hygiene', 'PPE Workflow'],
    inserviceTitle: 'Hand Hygiene Moments + Glove Use Myths',
    followUp: 'Re-audit at 1 week and 4 weeks',
    searchTags: ['PPE', 'Don/Doff', 'Hand Hygiene', 'WHO 5 Moments']
  },
  {
    id: 'rule-uti-01',
    trigger: 'UTIs trending up with Foley days and catheter care gaps',
    competencyDomains: ['Foley Maintenance Care', 'Pericare Protocol', 'Specimen Collection'],
    inserviceTitle: 'CAUTI Prevention in LTC: Maintenance Bundle',
    followUp: 'Catheter maintenance audit weekly x 4',
    searchTags: ['Foley Care', 'CAUTI', 'Pericare', 'Specimen']
  },
  {
    id: 'rule-peg-01',
    trigger: 'PEG med pass documentation errors',
    competencyDomains: ['Enteral Administration Workflow', 'Crush/Flush/Separate', 'Documentation'],
    inserviceTitle: 'G-Tube Med Pass: Crush/Flush/Separate + Documentation',
    followUp: 'Med pass observation audit 2x/month',
    searchTags: ['PEG', 'G-Tube', 'Medication via G-tube', 'Documentation']
  },
  {
    id: 'rule-falls-01',
    trigger: 'Falls trending up on nights',
    competencyDomains: ['Toileting Rounds', 'Safe Transfers', 'Post-Fall Huddle'],
    inserviceTitle: 'Night Shift Falls: Toileting + Environmental Scan',
    followUp: 'Night shift rounding compliance audit',
    searchTags: ['Post-Fall Huddle', 'Toileting Plan', 'Safe Transfer']
  },
  {
    id: 'rule-skin-01',
    trigger: 'New or worsening pressure injuries',
    competencyDomains: ['Braden Scoring', 'Turning/Offloading', 'Moisture Management'],
    inserviceTitle: 'Skin Early Warning Signs + Offloading Basics',
    followUp: 'Weekly skin rounds audit',
    searchTags: ['Braden', 'Offloading', 'MASD', 'Pressure Injury']
  }
];

export const recommendationPreviews: RecommendationPreview[] = [
  {
    id: 'rec-01',
    issue: 'Hand hygiene compliance below threshold',
    unit: 'Unit A',
    trend: '87% compliance, 2 critical misses',
    recommendedCompetencies: ['Hand Hygiene', 'PPE Don/Doff'],
    recommendedInservices: ['Hand Hygiene Moments + Glove Use Myths'],
    followUpPlan: 'Re-audit in 7 days and 30 days'
  },
  {
    id: 'rec-02',
    issue: 'Falls increased on night shift',
    unit: 'Unit B',
    trend: '5 falls in 14 days',
    recommendedCompetencies: ['Toileting Rounds', 'Safe Transfers', 'Post-Fall Huddle'],
    recommendedInservices: ['Night Shift Falls: Toileting + Environmental Scan'],
    followUpPlan: 'Night shift rounding audit for 4 weeks'
  },
  {
    id: 'rec-03',
    issue: 'PEG medication documentation gaps',
    unit: 'Unit C',
    trend: '3 MAR/TAR documentation errors',
    recommendedCompetencies: ['Enteral Administration Workflow', 'Documentation Timeliness'],
    recommendedInservices: ['G-Tube Med Pass: Crush/Flush/Separate + Documentation'],
    followUpPlan: 'Med pass observation audit twice monthly'
  }
];
