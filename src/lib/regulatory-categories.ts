/**
 * CMS F-Tag and NYSDOH regulatory category system.
 *
 * Major CMS categories are derived from 42 CFR 483 subparts used during LTC surveys,
 * plus NYSDOH-oriented operational categories commonly required for annual competency
 * and onboarding workflows.
 */
export const CMS_CATEGORIES = {
  RESIDENT_RIGHTS: 'Resident Rights & Dignity',
  ABUSE_PREVENTION: 'Abuse, Neglect & Exploitation Prevention',
  ADMISSION_DISCHARGE: 'Admission, Transfer & Discharge',
  ASSESSMENT_CARE_PLAN: 'Assessment & Care Planning',
  QUALITY_OF_LIFE: 'Quality of Life',
  QUALITY_OF_CARE: 'Quality of Care',
  NURSING_SERVICES: 'Nursing Services',
  DIETARY_NUTRITION: 'Dietary & Nutrition Services',
  PHYSICIAN_SERVICES: 'Physician Services',
  REHABILITATION_SERVICES: 'Rehabilitation Services',
  DENTAL_SERVICES: 'Dental Services',
  PHARMACY_SERVICES: 'Pharmacy & Medication Management',
  INFECTION_CONTROL: 'Infection Prevention & Control',
  PHYSICAL_ENVIRONMENT: 'Physical Environment & Safety',
  ADMINISTRATION_QAPI: 'Administration & QAPI',
  ORIENTATION_ONBOARDING: 'Orientation & Onboarding',
  CLINICAL_COMPETENCIES: 'Clinical Competencies & Skills'
} as const;

export type CMSCategory = typeof CMS_CATEGORIES[keyof typeof CMS_CATEGORIES];

// F-Tag to category mapping used for deterministic classification and F-tag filtering.
export const FTAG_TO_CATEGORY: Record<string, CMSCategory> = {
  // Resident Rights (F550-F586)
  ...Object.fromEntries(Array.from({ length: 37 }, (_, i) => [`F${550 + i}`, CMS_CATEGORIES.RESIDENT_RIGHTS])),

  // Abuse Prevention (F600-F610)
  ...Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`F${600 + i}`, CMS_CATEGORIES.ABUSE_PREVENTION])),

  // Admission/Transfer/Discharge (F620-F632)
  ...Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`F${620 + i}`, CMS_CATEGORIES.ADMISSION_DISCHARGE])),

  // Assessment & Care Planning (known survey tags)
  F636: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F637: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F638: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F639: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F640: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F641: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F642: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F655: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
  F656: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,

  // Quality of Life
  F675: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F676: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F677: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F678: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F679: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F680: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F681: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F688: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F689: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F690: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F691: CMS_CATEGORIES.QUALITY_OF_LIFE,
  F692: CMS_CATEGORIES.QUALITY_OF_LIFE,

  // Quality of Care
  F684: CMS_CATEGORIES.QUALITY_OF_CARE,
  F685: CMS_CATEGORIES.QUALITY_OF_CARE,
  F686: CMS_CATEGORIES.QUALITY_OF_CARE,
  F687: CMS_CATEGORIES.QUALITY_OF_CARE,
  F694: CMS_CATEGORIES.QUALITY_OF_CARE,
  F695: CMS_CATEGORIES.QUALITY_OF_CARE,
  F696: CMS_CATEGORIES.QUALITY_OF_CARE,
  F697: CMS_CATEGORIES.QUALITY_OF_CARE,
  F698: CMS_CATEGORIES.QUALITY_OF_CARE,
  F699: CMS_CATEGORIES.QUALITY_OF_CARE,
  F700: CMS_CATEGORIES.QUALITY_OF_CARE,

  // Physician Services
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`F${710 + i}`, CMS_CATEGORIES.PHYSICIAN_SERVICES])),

  // Nursing Services
  ...Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`F${720 + i}`, CMS_CATEGORIES.NURSING_SERVICES])),

  // Pharmacy Services
  ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`F${755 + i}`, CMS_CATEGORIES.PHARMACY_SERVICES])),

  // Dental Services
  F795: CMS_CATEGORIES.DENTAL_SERVICES,
  F796: CMS_CATEGORIES.DENTAL_SERVICES,

  // Dietary & Nutrition
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`F${800 + i}`, CMS_CATEGORIES.DIETARY_NUTRITION])),

  // Rehabilitation Services
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`F${820 + i}`, CMS_CATEGORIES.REHABILITATION_SERVICES])),

  // Administration & QAPI
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`F${835 + i}`, CMS_CATEGORIES.ADMINISTRATION_QAPI])),

  // Infection Control
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`F${880 + i}`, CMS_CATEGORIES.INFECTION_CONTROL])),

  // Physical Environment
  ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`F${920 + i}`, CMS_CATEGORIES.PHYSICAL_ENVIRONMENT]))
};

export const getCategoryFTags = (category: CMSCategory): string[] => {
  return Object.entries(FTAG_TO_CATEGORY)
    .filter(([, cat]) => cat === category)
    .map(([ftag]) => ftag)
    .sort();
};

/**
 * Parse F-tags from free text.
 * Handles formats: F880, F-880, F 880, mixed delimiters/case.
 */
export const parseFTags = (text: string): string[] => {
  if (!text) return [];

  const matches = text.match(/F-?\s?\d{3,4}/gi) || [];
  return matches
    .map(tag => tag.replace(/[^F0-9]/gi, '').toUpperCase())
    .filter(tag => /^F\d{3,4}$/.test(tag))
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
};

/**
 * Auto-categorization algorithm:
 * 1) Deterministic via mapped F-tags
 * 2) Keyword-based fallback across topic/purpose/reg references
 */
export const categorizeByKeywords = (
  topic: string,
  ftags: string,
  nysdohRegs: string,
  purpose: string
): CMSCategory => {
  const ftagList = parseFTags(ftags);
  for (const ftag of ftagList) {
    if (FTAG_TO_CATEGORY[ftag]) {
      return FTAG_TO_CATEGORY[ftag];
    }
  }

  const text = `${topic} ${ftags} ${nysdohRegs} ${purpose}`.toLowerCase();

  if (/orientation|onboarding|new hire|new employee/.test(text)) return CMS_CATEGORIES.ORIENTATION_ONBOARDING;
  if (/abuse|neglect|exploitation|mandated reporter/.test(text)) return CMS_CATEGORIES.ABUSE_PREVENTION;
  if (/infection|ipcp|hand hygiene|ppe|isolation|outbreak|covid|f880/.test(text)) return CMS_CATEGORIES.INFECTION_CONTROL;
  if (/medication|med pass|pharmacy|drug|psychotropic|f755|f756/.test(text)) return CMS_CATEGORIES.PHARMACY_SERVICES;
  if (/dignity|rights|privacy|choice|self-determination|f550/.test(text)) return CMS_CATEGORIES.RESIDENT_RIGHTS;
  if (/fall|pressure ulcer|wound|restraint|pain|decline|f686|f689/.test(text)) return CMS_CATEGORIES.QUALITY_OF_CARE;
  if (/assessment|care plan|mds|quarterly|f636|f656/.test(text)) return CMS_CATEGORIES.ASSESSMENT_CARE_PLAN;
  if (/nutrition|diet|food|feeding|hydration|f800/.test(text)) return CMS_CATEGORIES.DIETARY_NUTRITION;
  if (/activity|social|quality of life|f675/.test(text)) return CMS_CATEGORIES.QUALITY_OF_LIFE;
  if (/qapi|quality assurance|performance improvement|f835/.test(text)) return CMS_CATEGORIES.ADMINISTRATION_QAPI;
  if (/fire|safety|environment|disaster|emergency|f920/.test(text)) return CMS_CATEGORIES.PHYSICAL_ENVIRONMENT;
  if (/therapy|rehab|pt|ot|speech|f820/.test(text)) return CMS_CATEGORIES.REHABILITATION_SERVICES;
  if (/admission|discharge|transfer|f620/.test(text)) return CMS_CATEGORIES.ADMISSION_DISCHARGE;
  if (/physician|medical director|doctor|f710/.test(text)) return CMS_CATEGORIES.PHYSICIAN_SERVICES;
  if (/dental|dentist|oral|f795/.test(text)) return CMS_CATEGORIES.DENTAL_SERVICES;
  if (/nursing|competency|skill|clinical/.test(text)) return CMS_CATEGORIES.CLINICAL_COMPETENCIES;

  return CMS_CATEGORIES.NURSING_SERVICES;
};

export interface CategoryMetadata {
  name: CMSCategory;
  description: string;
  ftagRange: string;
  cfr: string;
  priority: 'critical' | 'high' | 'medium';
  commonTopics: string[];
}

export const getCategoryMetadata = (category: CMSCategory): CategoryMetadata => {
  const metadata: Record<CMSCategory, CategoryMetadata> = {
    [CMS_CATEGORIES.RESIDENT_RIGHTS]: {
      name: CMS_CATEGORIES.RESIDENT_RIGHTS,
      description: 'Resident dignity, choice, privacy, self-determination',
      ftagRange: 'F550-F586',
      cfr: '42 CFR 483.10',
      priority: 'critical',
      commonTopics: ['Resident Rights', 'Privacy', 'Informed Consent', 'Grievances']
    },
    [CMS_CATEGORIES.ABUSE_PREVENTION]: {
      name: CMS_CATEGORIES.ABUSE_PREVENTION,
      description: 'Prevent and report abuse, neglect, exploitation',
      ftagRange: 'F600-F610',
      cfr: '42 CFR 483.12',
      priority: 'critical',
      commonTopics: ['Abuse Prevention', 'Mandated Reporting', 'Zero Tolerance']
    },
    [CMS_CATEGORIES.INFECTION_CONTROL]: {
      name: CMS_CATEGORIES.INFECTION_CONTROL,
      description: 'Infection prevention program & antibiotic stewardship',
      ftagRange: 'F880-F888',
      cfr: '42 CFR 483.80',
      priority: 'critical',
      commonTopics: ['Hand Hygiene', 'PPE', 'Outbreak Management', 'Antibiotic Stewardship']
    },
    [CMS_CATEGORIES.QUALITY_OF_CARE]: {
      name: CMS_CATEGORIES.QUALITY_OF_CARE,
      description: 'Highest practicable physical, mental, psychosocial well-being',
      ftagRange: 'F684-F700',
      cfr: '42 CFR 483.25',
      priority: 'critical',
      commonTopics: ['Falls', 'Pressure Ulcers', 'Pain Management', 'Decline Prevention']
    },
    [CMS_CATEGORIES.PHARMACY_SERVICES]: {
      name: CMS_CATEGORIES.PHARMACY_SERVICES,
      description: 'Medication management & unnecessary drug reduction',
      ftagRange: 'F755-F761',
      cfr: '42 CFR 483.45',
      priority: 'high',
      commonTopics: ['Medication Admin', 'Psychotropic Reduction', 'Drug Regimen Review']
    },
    [CMS_CATEGORIES.ASSESSMENT_CARE_PLAN]: {
      name: CMS_CATEGORIES.ASSESSMENT_CARE_PLAN,
      description: 'Comprehensive assessment & individualized care planning',
      ftagRange: 'F636-F656',
      cfr: '42 CFR 483.20-21',
      priority: 'high',
      commonTopics: ['MDS', 'Care Plans', 'Quarterly Reviews', 'RAI Process']
    },
    [CMS_CATEGORIES.NURSING_SERVICES]: {
      name: CMS_CATEGORIES.NURSING_SERVICES,
      description: 'Sufficient nursing staff & competency-based training',
      ftagRange: 'F720-F732',
      cfr: '42 CFR 483.35',
      priority: 'high',
      commonTopics: ['Staffing', 'Competencies', 'Clinical Skills', 'RN Services']
    },
    [CMS_CATEGORIES.DIETARY_NUTRITION]: {
      name: CMS_CATEGORIES.DIETARY_NUTRITION,
      description: 'Nutritional needs & dietary services',
      ftagRange: 'F800-F813',
      cfr: '42 CFR 483.60',
      priority: 'high',
      commonTopics: ['Nutrition', 'Therapeutic Diets', 'Food Safety', 'Hydration']
    },
    [CMS_CATEGORIES.QUALITY_OF_LIFE]: {
      name: CMS_CATEGORIES.QUALITY_OF_LIFE,
      description: 'Activities, social services, resident-friendly environment',
      ftagRange: 'F675-F692',
      cfr: '42 CFR 483.24',
      priority: 'medium',
      commonTopics: ['Activities', 'Social Services', 'Accommodation of Needs']
    },
    [CMS_CATEGORIES.ADMINISTRATION_QAPI]: {
      name: CMS_CATEGORIES.ADMINISTRATION_QAPI,
      description: 'Quality assurance, performance improvement, compliance',
      ftagRange: 'F835-F850',
      cfr: '42 CFR 483.75',
      priority: 'high',
      commonTopics: ['QAPI', 'Compliance', 'Medical Director', 'Governance']
    },
    [CMS_CATEGORIES.PHYSICAL_ENVIRONMENT]: {
      name: CMS_CATEGORIES.PHYSICAL_ENVIRONMENT,
      description: 'Life safety, emergency preparedness, safe environment',
      ftagRange: 'F920-F925',
      cfr: '42 CFR 483.90',
      priority: 'high',
      commonTopics: ['Fire Safety', 'Emergency Prep', 'Disaster Planning']
    },
    [CMS_CATEGORIES.ORIENTATION_ONBOARDING]: {
      name: CMS_CATEGORIES.ORIENTATION_ONBOARDING,
      description: 'New employee orientation (NYSDOH 10 NYCRR 415.26)',
      ftagRange: 'NYSDOH',
      cfr: '10 NYCRR 415.26',
      priority: 'critical',
      commonTopics: ['New Hire Orientation', 'Policies', 'Job-Specific Training']
    },
    [CMS_CATEGORIES.CLINICAL_COMPETENCIES]: {
      name: CMS_CATEGORIES.CLINICAL_COMPETENCIES,
      description: 'Clinical skills validation & competency assessment',
      ftagRange: 'Various',
      cfr: '42 CFR 483.35(d)',
      priority: 'high',
      commonTopics: ['Skills Validation', 'CNA Competencies', 'Annual Assessment']
    },
    [CMS_CATEGORIES.ADMISSION_DISCHARGE]: {
      name: CMS_CATEGORIES.ADMISSION_DISCHARGE,
      description: 'Admission, transfer, discharge procedures',
      ftagRange: 'F620-F632',
      cfr: '42 CFR 483.15',
      priority: 'medium',
      commonTopics: ['Admission', 'Transfer Notices', 'Discharge Planning']
    },
    [CMS_CATEGORIES.PHYSICIAN_SERVICES]: {
      name: CMS_CATEGORIES.PHYSICIAN_SERVICES,
      description: 'Physician oversight & medical care',
      ftagRange: 'F710-F718',
      cfr: '42 CFR 483.30',
      priority: 'medium',
      commonTopics: ['Physician Visits', 'Medical Orders', 'Medical Director']
    },
    [CMS_CATEGORIES.REHABILITATION_SERVICES]: {
      name: CMS_CATEGORIES.REHABILITATION_SERVICES,
      description: 'PT, OT, speech therapy services',
      ftagRange: 'F820-F827',
      cfr: '42 CFR 483.65',
      priority: 'medium',
      commonTopics: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy']
    },
    [CMS_CATEGORIES.DENTAL_SERVICES]: {
      name: CMS_CATEGORIES.DENTAL_SERVICES,
      description: 'Routine & emergency dental care',
      ftagRange: 'F795-F796',
      cfr: '42 CFR 483.55',
      priority: 'medium',
      commonTopics: ['Oral Care', 'Dental Visits', 'Denture Care']
    }
  };

  return metadata[category];
};

export const getAllCategoriesByPriority = (): CategoryMetadata[] => {
  const priorities = { critical: 0, high: 1, medium: 2 };
  return Object.values(CMS_CATEGORIES)
    .map(getCategoryMetadata)
    .sort((a, b) => priorities[a.priority] - priorities[b.priority] || a.name.localeCompare(b.name));
};
