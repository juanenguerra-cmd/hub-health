import type { AuditTemplate } from '@/types/nurse-educator';

export const SEED_TEMPLATES: AuditTemplate[] = [
  {
    id: "audit_oxygen_v2",
    title: "Oxygen & Respiratory Equipment Audit",
    version: "2.0.0",
    category: "Respiratory",
    placementTags: ["Respiratory", "Infection Prevention", "Survey-Ready"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Verify oxygen orders are current, rates/devices match orders, and tubing is labeled/changed per policy.",
      risk: "Non-compliance can lead to hypoxia events, infection risk from outdated tubing, and survey deficiencies.",
      evidenceToShow: "Completed samples with compliance %, critical fails logged, and education/action plan documentation."
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Respiratory equipment handling/maintenance intersects with infection prevention." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "Supports infection control practices related to respiratory equipment." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["md_order", "rate_matches", "tubing_labeled"],
    sessionQuestions: [
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7", "7A-7P", "7P-7A"], required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Patient Code (de-identified)", type: "patientCode", required: true, score: 0 },
      { key: "md_order", label: "Oxygen: MD order present (type + parameters)?", type: "yn", required: true, score: 20, criticalFailIf: "no" },
      { key: "prn_vs_cont", label: "Clearly PRN vs continuous as ordered?", type: "yn", required: true, score: 10 },
      { key: "rate_matches", label: "Rate/device matches order (LPM/%/delivery method)?", type: "yn", required: true, score: 20, criticalFailIf: "no" },
      { key: "tubing_labeled", label: "Tubing label has DATE (weekly change per policy)?", type: "yn", required: true, score: 15, criticalFailIf: "no" },
      { key: "skin_check", label: "Skin integrity checked + ear protector if needed?", type: "yn", required: false, score: 10 },
      { key: "humidifier", label: "Humidifier bottle maintained per policy (if used)?", type: "yn", required: false, score: 10 },
      { key: "pulseox_plan", label: "Pulse ox monitoring frequency documented per order/care plan?", type: "yn", required: false, score: 10 },
      { key: "careplan", label: "Care plan reflects oxygen needs/titration/monitoring?", type: "yn", required: false, score: 5 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  {
    id: "audit_neb_v2",
    title: "Nebulizer / Respiratory Treatment Setup Audit",
    version: "2.0.0",
    category: "Respiratory",
    placementTags: ["Respiratory", "Infection Prevention", "Survey-Ready"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Verify ordered nebulizer treatments are set up correctly with clean storage and maintenance to reduce infection risk.",
      risk: "Prevents missed/incorrect treatments and reduces contamination risk from improperly maintained neb equipment.",
      evidenceToShow: "Sample compliance, critical fails, and targeted corrective actions or staff education."
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Neb equipment cleaning/storage is a standard IPC risk area." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "Supports infection prevention practices for reusable respiratory equipment." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["order_present", "kit_dated"],
    sessionQuestions: [],
    sampleQuestions: [
      { key: "patient_code", label: "Patient Code (de-identified)", type: "patientCode", required: true, score: 0 },
      { key: "order_present", label: "Treatment order present (med + frequency + route)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "kit_dated", label: "Neb setup kit is dated (date changed documented)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "clean_storage", label: "Equipment stored clean/dry (protected from contamination)?", type: "yn", required: true, score: 20 },
      { key: "resp_assess", label: "Resp assessment documented with response to treatment?", type: "yn", required: false, score: 15 },
      { key: "patient_education", label: "Patient education/safety documented (as applicable)?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  {
    id: "audit_hand_hygiene_v1",
    title: "Hand Hygiene Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "High Risk", "Survey-Ready"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Monitor compliance with hand hygiene protocols to prevent healthcare-associated infections.",
      risk: "Non-compliance increases risk of cross-contamination and HAI transmission between patients.",
      evidenceToShow: "Compliance rates by unit, staff category, and moment of hygiene."
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Hand hygiene is foundational to infection prevention." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for infection control practices." }
    ],
    passingThreshold: 85,
    criticalFailKeys: ["performed_hygiene"],
    sessionQuestions: [
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7"], required: false, score: 0 },
      { key: "observer", label: "Observer initials", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Observation Code", type: "patientCode", required: true, score: 0 },
      { key: "staff_role", label: "Staff role observed", type: "select", options: ["RN", "LPN", "CNA", "MD", "PT/OT", "Other"], required: true, score: 0 },
      { key: "moment", label: "Moment of hygiene", type: "select", options: ["Before patient contact", "After patient contact", "After body fluid exposure", "Before aseptic procedure", "After touching patient surroundings"], required: true, score: 0 },
      { key: "performed_hygiene", label: "Hand hygiene performed?", type: "yn", required: true, score: 100, criticalFailIf: "no" },
      { key: "proper_technique", label: "Proper technique used (20+ seconds)?", type: "yn", required: false, score: 20 },
      { key: "notes", label: "Notes", type: "text", required: false, score: 0 }
    ]
  },
  {
    id: "audit_falls_v1",
    title: "Fall Prevention Audit",
    version: "1.0.0",
    category: "Safety",
    placementTags: ["Safety", "High Risk", "Survey-Ready"],
    ftagTags: ["F689"],
    nydohTags: ["10 NYCRR 415.26"],
    purpose: {
      summary: "Verify fall prevention interventions are in place for high-risk residents.",
      risk: "Falls are leading cause of injury in long-term care. Prevention measures reduce serious injury risk.",
      evidenceToShow: "Intervention compliance rates, fall rates trending, action plans."
    },
    references: [
      { system: "CMS", code: "F689", title: "Free of Accident Hazards/Supervision/Devices", whyItMatters: "Facilities must ensure environment and supervision prevent accidents." },
      { system: "NYDOH", code: "10 NYCRR 415.26", title: "Resident rights - safe environment", whyItMatters: "State requirement for resident safety." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["fall_risk_assessed", "interventions_in_place"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "fall_risk_assessed", label: "Fall risk assessment completed and current?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "risk_level", label: "Current fall risk level", type: "select", options: ["Low", "Moderate", "High"], required: true, score: 0 },
      { key: "interventions_in_place", label: "Interventions in place match care plan?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "call_light_reach", label: "Call light within reach?", type: "yn", required: true, score: 15 },
      { key: "bed_position", label: "Bed in low position with brakes locked?", type: "yn", required: true, score: 15 },
      { key: "environment_clear", label: "Clear path to bathroom, no clutter?", type: "yn", required: false, score: 10 },
      { key: "footwear_appropriate", label: "Appropriate non-slip footwear?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes", type: "text", required: false, score: 0 }
    ]
  }
];
