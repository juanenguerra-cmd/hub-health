import type { AuditTemplate, EduTopic } from '@/types/nurse-educator';

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
  },
  // F880 - PPE & Wound Dressing Infection Control
  {
    id: "audit_ppe_wound_v1",
    title: "PPE & Wound Dressing Infection Control Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Wound Care", "Survey-Ready"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Verify appropriate masking, PPE use, hand hygiene, and infection control practices during wound dressing changes.",
      risk: "Improper PPE use and infection control practices during wound care increases risk of wound infections and cross-contamination.",
      evidenceToShow: "Observation compliance rates, staff competency validation, targeted education records."
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "PPE and aseptic technique are critical to preventing healthcare-associated infections." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State mandate for infection prevention practices." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["hand_hygiene_before", "ppe_appropriate", "aseptic_technique"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 },
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7"], required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Observation Code", type: "patientCode", required: true, score: 0 },
      { key: "staff_role", label: "Staff role observed", type: "select", options: ["RN", "LPN", "CNA"], required: true, score: 0 },
      { key: "hand_hygiene_before", label: "Hand hygiene performed before procedure?", type: "yn", required: true, score: 20, criticalFailIf: "no" },
      { key: "ppe_appropriate", label: "Appropriate PPE donned (gloves, mask if indicated)?", type: "yn", required: true, score: 20, criticalFailIf: "no" },
      { key: "aseptic_technique", label: "Aseptic/clean technique maintained throughout?", type: "yn", required: true, score: 20, criticalFailIf: "no" },
      { key: "supplies_clean", label: "Clean supplies used, no contamination observed?", type: "yn", required: true, score: 15 },
      { key: "hand_hygiene_after", label: "Hand hygiene performed after procedure?", type: "yn", required: true, score: 15 },
      { key: "waste_disposal", label: "Proper waste disposal (sharps, soiled dressings)?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F689 - Accident Hazards: 2-Person Assist, Elopement, Wheelchair Safety
  {
    id: "audit_safety_supervision_v1",
    title: "Safety & Supervision Compliance Audit",
    version: "1.0.0",
    category: "Safety",
    placementTags: ["Safety", "High Risk", "Survey-Ready"],
    ftagTags: ["F689"],
    nydohTags: ["10 NYCRR 415.26"],
    purpose: {
      summary: "Verify compliance with 2-person assist protocols, elopement prevention, and wheelchair safety including leg rest security.",
      risk: "Failure to follow safety protocols leads to falls, injuries, and elopement incidents with potential for serious harm.",
      evidenceToShow: "Compliance audits, incident trending, corrective action documentation, staff competency records."
    },
    references: [
      { system: "CMS", code: "F689", title: "Free of Accident Hazards/Supervision/Devices", whyItMatters: "Facilities must provide adequate supervision and implement safety measures." },
      { system: "NYDOH", code: "10 NYCRR 415.26", title: "Resident rights - safe environment", whyItMatters: "State requirement for maintaining safe environment." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["two_person_assist", "elopement_precautions"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "assist_level", label: "Care plan assist level", type: "select", options: ["1-Person", "2-Person", "Max Assist", "Total Dependence"], required: true, score: 0 },
      { key: "two_person_assist", label: "2-person assist used when required by care plan?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "elopement_risk", label: "Resident identified as elopement risk?", type: "yn", required: true, score: 0 },
      { key: "elopement_precautions", label: "Elopement precautions in place per protocol (if at risk)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "wc_leg_rests", label: "Wheelchair leg rests secured appropriately?", type: "yn", required: true, score: 20 },
      { key: "wc_brakes", label: "Wheelchair brakes functional and used?", type: "yn", required: true, score: 15 },
      { key: "environment_safe", label: "Environment free of hazards (cords, spills, clutter)?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F609 - Reporting of Alleged Violations
  {
    id: "audit_incident_reporting_v1",
    title: "Incident Reporting Compliance Audit",
    version: "1.0.0",
    category: "Regulatory",
    placementTags: ["Regulatory", "Survey-Ready", "High Priority"],
    ftagTags: ["F609"],
    nydohTags: ["10 NYCRR 415.4"],
    purpose: {
      summary: "Verify timely reporting of alleged abuse, serious bodily injury, injuries of unknown origin within 2 hours, and other incidents per policy.",
      risk: "Failure to report within required timeframes results in regulatory citations and jeopardizes resident safety.",
      evidenceToShow: "Incident log review, reporting timeline documentation, staff education on reporting requirements."
    },
    references: [
      { system: "CMS", code: "F609", title: "Reporting of Alleged Violations", whyItMatters: "Federal requirement for timely reporting of abuse, neglect, and injuries." },
      { system: "NYDOH", code: "10 NYCRR 415.4", title: "Notification requirements", whyItMatters: "State mandate for incident reporting timelines." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["reported_within_2hrs", "reported_to_admin"],
    sessionQuestions: [
      { key: "review_period", label: "Review period (dates)", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "incident_code", label: "Incident Reference Code", type: "text", required: true, score: 0 },
      { key: "incident_type", label: "Type of incident", type: "select", options: ["Alleged Abuse", "Serious Bodily Injury", "Injury Unknown Origin", "Fall with Injury", "Other Reportable"], required: true, score: 0 },
      { key: "incident_time", label: "Time incident discovered", type: "text", required: true, score: 0 },
      { key: "reported_within_2hrs", label: "Reported to Administrator within 2 hours (if abuse/SBI/IUO)?", type: "yn", required: true, score: 50, criticalFailIf: "no" },
      { key: "reported_to_admin", label: "Administrator notification documented?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "state_reported", label: "State agency notified within required timeframe?", type: "yn", required: true, score: 25 },
      { key: "investigation_initiated", label: "Investigation initiated immediately?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F684 - Quality of Care / Staff Training
  {
    id: "audit_staff_training_v1",
    title: "Staff Education & Training Compliance Audit",
    version: "1.0.0",
    category: "Education",
    placementTags: ["Education", "Competency", "Survey-Ready"],
    ftagTags: ["F684"],
    nydohTags: ["10 NYCRR 415.26"],
    purpose: {
      summary: "Verify staff receive education and training applicable to performing their job duties and competencies are validated.",
      risk: "Untrained staff may provide inadequate care leading to adverse outcomes and survey deficiencies.",
      evidenceToShow: "Training records, competency checklists, orientation documentation, annual education compliance."
    },
    references: [
      { system: "CMS", code: "F684", title: "Quality of Care", whyItMatters: "Facilities must ensure staff are trained to provide quality care." },
      { system: "NYDOH", code: "10 NYCRR 415.26", title: "Nursing services", whyItMatters: "State requirement for competent nursing staff." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["orientation_complete", "annual_training"],
    sessionQuestions: [
      { key: "department", label: "Department reviewed", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "staff_code", label: "Staff ID/Code", type: "text", required: true, score: 0 },
      { key: "position", label: "Position", type: "select", options: ["RN", "LPN", "CNA", "Dietary", "Housekeeping", "Maintenance", "Activities"], required: true, score: 0 },
      { key: "orientation_complete", label: "Orientation completed and documented?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "annual_training", label: "Annual mandatory training current?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "job_competencies", label: "Job-specific competencies validated?", type: "yn", required: true, score: 20 },
      { key: "infection_control", label: "Infection control training completed?", type: "yn", required: true, score: 15 },
      { key: "abuse_training", label: "Abuse/neglect prevention training completed?", type: "yn", required: true, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F812 - Food Safety
  {
    id: "audit_food_safety_v1",
    title: "Food Safety & Sanitation Audit",
    version: "1.0.0",
    category: "Dietary",
    placementTags: ["Dietary", "Food Safety", "Survey-Ready"],
    ftagTags: ["F812"],
    nydohTags: ["10 NYCRR 415.18"],
    purpose: {
      summary: "Verify food is properly labeled, dated, stored at correct temperatures, and kitchen maintains sanitary conditions.",
      risk: "Food safety violations lead to foodborne illness outbreaks and are commonly cited during surveys.",
      evidenceToShow: "Temperature logs, food storage audits, sanitation checklists, corrective action records."
    },
    references: [
      { system: "CMS", code: "F812", title: "Food Procurement, Store/Prepare/Serve-Sanitary", whyItMatters: "Facilities must maintain safe food handling and storage practices." },
      { system: "NYDOH", code: "10 NYCRR 415.18", title: "Dietary services", whyItMatters: "State requirements for food service sanitation." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["food_labeled", "proper_temp"],
    sessionQuestions: [
      { key: "area", label: "Area inspected", type: "select", options: ["Main Kitchen", "Unit Pantry", "Walk-in Cooler", "Walk-in Freezer", "Dry Storage"], required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "item_code", label: "Item/Area Code", type: "text", required: true, score: 0 },
      { key: "food_labeled", label: "Food items properly labeled with name and date?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "not_expired", label: "No expired items found?", type: "yn", required: true, score: 20 },
      { key: "proper_temp", label: "Foods stored at proper temperature (check logs)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "proper_storage", label: "Foods stored properly (covered, off floor, FIFO)?", type: "yn", required: true, score: 15 },
      { key: "area_clean", label: "Area clean and sanitary?", type: "yn", required: true, score: 15 },
      { key: "pest_free", label: "No evidence of pests?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F550 - Resident Rights
  {
    id: "audit_resident_rights_v1",
    title: "Resident Rights & Preferences Audit",
    version: "1.0.0",
    category: "Resident Rights",
    placementTags: ["Resident Rights", "Person-Centered Care", "Survey-Ready"],
    ftagTags: ["F550"],
    nydohTags: ["10 NYCRR 415.3"],
    purpose: {
      summary: "Verify residents receive timely meals at proper temperature, input on advance directives, and grooming per their preferences.",
      risk: "Failure to honor resident rights affects quality of life and results in survey deficiencies.",
      evidenceToShow: "Meal temperature logs, resident interviews, advance directive documentation, grooming preference records."
    },
    references: [
      { system: "CMS", code: "F550", title: "Resident Rights/Exercise of Rights", whyItMatters: "Residents have the right to make choices about their care and daily life." },
      { system: "NYDOH", code: "10 NYCRR 415.3", title: "Resident rights", whyItMatters: "State mandate for resident rights protection." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["meal_timely", "grooming_preferences"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "meal_timely", label: "Meals served timely and at proper temperature?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "advance_directive", label: "Advance directive preferences documented and honored?", type: "yn", required: true, score: 20 },
      { key: "grooming_preferences", label: "Grooming provided per resident preference (shaving, hair, nails)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "dignity_maintained", label: "Dignity maintained during care (privacy, draping)?", type: "yn", required: true, score: 15 },
      { key: "choices_offered", label: "Choices offered for daily routines?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F584 - Safe/Clean/Comfortable Environment
  {
    id: "audit_environment_v1",
    title: "Safe, Clean & Homelike Environment Audit",
    version: "1.0.0",
    category: "Environment",
    placementTags: ["Environment", "Safety", "Survey-Ready"],
    ftagTags: ["F584"],
    nydohTags: ["10 NYCRR 415.26"],
    purpose: {
      summary: "Verify the facility maintains a safe, clean, comfortable, and homelike environment for residents.",
      risk: "Environmental deficiencies affect resident safety, comfort, and quality of life.",
      evidenceToShow: "Environmental rounds documentation, housekeeping logs, maintenance records, temperature logs."
    },
    references: [
      { system: "CMS", code: "F584", title: "Safe/Clean/Comfortable/Homelike Environment", whyItMatters: "Facilities must maintain appropriate physical environment." },
      { system: "NYDOH", code: "10 NYCRR 415.26", title: "Physical environment", whyItMatters: "State requirements for facility environment." }
    ],
    passingThreshold: 85,
    criticalFailKeys: ["safety_hazards"],
    sessionQuestions: [
      { key: "area", label: "Area inspected", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "area_code", label: "Area/Room Code", type: "text", required: true, score: 0 },
      { key: "clean", label: "Area clean and free of odors?", type: "yn", required: true, score: 25 },
      { key: "safety_hazards", label: "Free of safety hazards (cords, spills, equipment)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "comfortable_temp", label: "Temperature comfortable (68-78°F)?", type: "yn", required: true, score: 15 },
      { key: "lighting_adequate", label: "Lighting adequate for activities?", type: "yn", required: true, score: 15 },
      { key: "homelike", label: "Homelike atmosphere maintained?", type: "yn", required: false, score: 10 },
      { key: "maintenance_good", label: "No visible maintenance issues?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F600 - Free from Abuse and Neglect
  {
    id: "audit_abuse_prevention_v1",
    title: "Abuse & Neglect Prevention Audit",
    version: "1.0.0",
    category: "Resident Safety",
    placementTags: ["Resident Rights", "Safety", "Survey-Ready", "High Priority"],
    ftagTags: ["F600"],
    nydohTags: ["10 NYCRR 415.4"],
    purpose: {
      summary: "Verify facility has systems in place to prevent, identify, and respond to abuse and neglect.",
      risk: "Abuse and neglect are immediate jeopardy issues with severe consequences for residents and facility.",
      evidenceToShow: "Staff training records, background check documentation, incident reports, investigation records."
    },
    references: [
      { system: "CMS", code: "F600", title: "Free from Abuse and Neglect", whyItMatters: "Residents have the right to be free from abuse, neglect, and exploitation." },
      { system: "NYDOH", code: "10 NYCRR 415.4", title: "Protection from abuse", whyItMatters: "State requirement for abuse prevention and response." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["staff_trained", "background_checks"],
    sessionQuestions: [
      { key: "review_type", label: "Review type", type: "select", options: ["Record Review", "Staff Interview", "Environment Check"], required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "staff_code", label: "Staff/Area Code", type: "text", required: true, score: 0 },
      { key: "staff_trained", label: "Staff trained on abuse prevention and reporting?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "background_checks", label: "Background checks completed and documented?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "knows_reporting", label: "Staff can verbalize reporting requirements?", type: "yn", required: true, score: 20 },
      { key: "supervision_adequate", label: "Adequate supervision observed?", type: "yn", required: true, score: 15 },
      { key: "no_signs_abuse", label: "No signs of abuse/neglect observed?", type: "yn", required: true, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F656 - Comprehensive Care Plan
  {
    id: "audit_care_plan_v1",
    title: "Comprehensive Care Plan Audit",
    version: "1.0.0",
    category: "Care Planning",
    placementTags: ["Care Planning", "Clinical", "Survey-Ready"],
    ftagTags: ["F656"],
    nydohTags: ["10 NYCRR 415.11"],
    purpose: {
      summary: "Verify care plans are developed timely, implemented as written, and updated as resident needs change.",
      risk: "Inadequate care planning leads to inconsistent care delivery and poor resident outcomes.",
      evidenceToShow: "Care plan reviews, implementation documentation, IDT meeting notes, care plan update records."
    },
    references: [
      { system: "CMS", code: "F656", title: "Develop/Implement Comprehensive Care Plan", whyItMatters: "Care plans must be developed and implemented to meet resident needs." },
      { system: "NYDOH", code: "10 NYCRR 415.11", title: "Resident assessment", whyItMatters: "State requirements for comprehensive care planning." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["care_plan_current", "interventions_implemented"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "care_plan_current", label: "Care plan current and comprehensive?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "interventions_implemented", label: "Interventions being implemented as written?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "goals_measurable", label: "Goals are measurable and realistic?", type: "yn", required: true, score: 15 },
      { key: "updated_timely", label: "Updated when condition changes?", type: "yn", required: true, score: 20 },
      { key: "resident_input", label: "Resident/family input documented?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F677 - ADL Care
  {
    id: "audit_adl_care_v1",
    title: "ADL Care & Repositioning Audit",
    version: "1.0.0",
    category: "Clinical",
    placementTags: ["Clinical", "Skin Integrity", "Survey-Ready"],
    ftagTags: ["F677"],
    nydohTags: ["10 NYCRR 415.12"],
    purpose: {
      summary: "Verify dependent residents receive ADL care including turning/repositioning and are taken out of bed per care plan.",
      risk: "Failure to provide ADL care leads to skin breakdown, contractures, and decreased quality of life.",
      evidenceToShow: "Repositioning logs, ADL documentation, care plan compliance records."
    },
    references: [
      { system: "CMS", code: "F677", title: "ADL Care Provided for Dependent Residents", whyItMatters: "Facilities must provide necessary care for dependent residents." },
      { system: "NYDOH", code: "10 NYCRR 415.12", title: "Quality of care", whyItMatters: "State requirement for ADL care provision." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["repositioning", "oob_per_plan"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 },
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7"], required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "mobility_level", label: "Mobility level", type: "select", options: ["Independent", "Supervision", "Limited Assist", "Extensive Assist", "Total Dependence"], required: true, score: 0 },
      { key: "repositioning", label: "Turning/repositioning done per care plan schedule?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "oob_per_plan", label: "Out of bed per care plan (if applicable)?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "skin_assessed", label: "Skin assessed during repositioning?", type: "yn", required: true, score: 20 },
      { key: "positioning_devices", label: "Positioning devices in place correctly?", type: "yn", required: true, score: 15 },
      { key: "documentation", label: "ADL care documented accurately?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // F761 - Medication/IV Labeling
  {
    id: "audit_iv_labeling_v1",
    title: "IV & Medication Labeling Audit",
    version: "1.0.0",
    category: "Medication Safety",
    placementTags: ["Medication Safety", "Infection Prevention", "Survey-Ready"],
    ftagTags: ["F761"],
    nydohTags: ["10 NYCRR 415.14"],
    purpose: {
      summary: "Verify IV dressings, tubing, and medications are properly labeled and dated per policy.",
      risk: "Unlabeled/expired IV supplies increase infection risk and medication errors.",
      evidenceToShow: "Labeling compliance audits, corrective action records, staff education documentation."
    },
    references: [
      { system: "CMS", code: "F761", title: "Label/Store Drugs and Biologics", whyItMatters: "Medications and IV supplies must be properly labeled and stored." },
      { system: "NYDOH", code: "10 NYCRR 415.14", title: "Pharmacy services", whyItMatters: "State requirements for medication labeling and storage." }
    ],
    passingThreshold: 95,
    criticalFailKeys: ["iv_dressing_labeled", "iv_tubing_dated"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "iv_type", label: "IV access type", type: "select", options: ["Peripheral", "PICC", "Central", "Port"], required: true, score: 0 },
      { key: "iv_dressing_labeled", label: "IV dressing labeled with date?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "iv_tubing_dated", label: "IV tubing dated (change per policy)?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "iv_solution_labeled", label: "IV solution/medication properly labeled?", type: "yn", required: true, score: 20 },
      { key: "not_expired", label: "No expired IV supplies in use?", type: "yn", required: true, score: 20 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  }
];

// Seed Education Topics with trigger audit links and evidence artifacts
export const SEED_EDU_TOPICS: EduTopic[] = [
  {
    id: "edu_f880_ipc",
    topic: "Infection Prevention and Control: PPE & Hand Hygiene",
    description: "Appropriate masking, PPE use, hand hygiene, and infection control practices during wound dressing changes and patient care.",
    purpose: "Ensure staff understand and comply with infection prevention practices to reduce healthcare-associated infections.",
    disciplines: "All Clinical Staff (RN, LPN, CNA)",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "Infection Control Policy, Hand Hygiene Policy, PPE Policy",
    triggerAuditId: "audit_ppe_wound_v1",
    evidenceArtifacts: [
      "Hand hygiene audit results",
      "PPE competency validation records",
      "Infection control training sign-in sheets",
      "Wound care observation checklists",
      "Staff education attendance records"
    ]
  },
  {
    id: "edu_f689_safety",
    topic: "Accident Prevention: 2-Person Assist, Elopement & Wheelchair Safety",
    description: "Using 2-person assist when required, following elopement protocols, and securing wheelchair leg rests appropriately.",
    purpose: "Prevent accidents and injuries through proper supervision and safety device use.",
    disciplines: "All Nursing Staff (RN, LPN, CNA)",
    ftags: "F689",
    nysdohRegs: "10 NYCRR 415.26",
    facilityPolicy: "Fall Prevention Policy, Elopement Prevention Policy, Safe Patient Handling Policy",
    triggerAuditId: "audit_safety_supervision_v1",
    evidenceArtifacts: [
      "Safety supervision audit results",
      "Fall incident trending reports",
      "Elopement drill documentation",
      "2-person assist competency records",
      "Wheelchair safety training attendance"
    ]
  },
  {
    id: "edu_f609_reporting",
    topic: "Mandatory Incident Reporting Requirements",
    description: "Reporting actual or alleged abuse, serious bodily injury, and injuries of unknown origin within 2 hours; reporting other accidents/incidents per policy.",
    purpose: "Ensure timely reporting of incidents to protect residents and meet regulatory requirements.",
    disciplines: "All Staff",
    ftags: "F609",
    nysdohRegs: "10 NYCRR 415.4",
    facilityPolicy: "Incident Reporting Policy, Abuse Prevention and Reporting Policy",
    triggerAuditId: "audit_incident_reporting_v1",
    evidenceArtifacts: [
      "Incident reporting audit results",
      "Staff training records on reporting requirements",
      "Incident log review documentation",
      "Reporting timeline analysis",
      "Mock scenario drill records"
    ]
  },
  {
    id: "edu_f684_training",
    topic: "Staff Education and Competency Validation",
    description: "Ensuring staff receive education and training applicable to performing their job duties with validated competencies.",
    purpose: "Maintain qualified staff capable of providing quality care appropriate to their role.",
    disciplines: "All Staff (Department-Specific)",
    ftags: "F684",
    nysdohRegs: "10 NYCRR 415.26",
    facilityPolicy: "Staff Development Policy, Competency Assessment Policy, Orientation Policy",
    triggerAuditId: "audit_staff_training_v1",
    evidenceArtifacts: [
      "Training compliance audit results",
      "Orientation completion records",
      "Annual mandatory training logs",
      "Competency checklists by position",
      "Skills validation documentation"
    ]
  },
  {
    id: "edu_f812_food_safety",
    topic: "Food Safety and Sanitation",
    description: "Proper food labeling, dating, temperature control, storage practices, and kitchen sanitation to prevent foodborne illness.",
    purpose: "Prevent foodborne illness outbreaks through proper food handling and storage.",
    disciplines: "Dietary Staff, Nursing (for nourishments)",
    ftags: "F812",
    nysdohRegs: "10 NYCRR 415.18",
    facilityPolicy: "Food Safety Policy, Dietary Sanitation Policy, Temperature Monitoring Policy",
    triggerAuditId: "audit_food_safety_v1",
    evidenceArtifacts: [
      "Food safety audit results",
      "Temperature monitoring logs",
      "Food labeling spot checks",
      "Kitchen sanitation checklists",
      "Food handler certification records"
    ]
  },
  {
    id: "edu_f550_rights",
    topic: "Resident Rights and Person-Centered Care",
    description: "Timely meal service, advance directive input, grooming per resident preferences, and honoring resident choices.",
    purpose: "Ensure resident rights are protected and person-centered care is provided.",
    disciplines: "All Staff",
    ftags: "F550",
    nysdohRegs: "10 NYCRR 415.3",
    facilityPolicy: "Resident Rights Policy, Advance Directives Policy, Person-Centered Care Policy",
    triggerAuditId: "audit_resident_rights_v1",
    evidenceArtifacts: [
      "Resident rights audit results",
      "Meal temperature/timing logs",
      "Advance directive documentation",
      "Grooming preference records",
      "Resident satisfaction surveys"
    ]
  },
  {
    id: "edu_f584_environment",
    topic: "Safe, Clean, Comfortable & Homelike Environment",
    description: "Maintaining facility environment that is safe, clean, comfortable, and homelike for all residents.",
    purpose: "Provide an environment that promotes resident safety, comfort, and quality of life.",
    disciplines: "Housekeeping, Maintenance, Nursing",
    ftags: "F584",
    nysdohRegs: "10 NYCRR 415.26",
    facilityPolicy: "Environmental Safety Policy, Housekeeping Policy, Temperature Control Policy",
    triggerAuditId: "audit_environment_v1",
    evidenceArtifacts: [
      "Environmental audit results",
      "Housekeeping logs",
      "Maintenance work orders",
      "Temperature monitoring records",
      "Safety rounds documentation"
    ]
  },
  {
    id: "edu_f600_abuse",
    topic: "Abuse and Neglect Prevention",
    description: "Prevention, identification, and response to abuse, neglect, and exploitation of residents.",
    purpose: "Protect residents from abuse and neglect through staff education and vigilance.",
    disciplines: "All Staff",
    ftags: "F600",
    nysdohRegs: "10 NYCRR 415.4",
    facilityPolicy: "Abuse Prevention Policy, Background Check Policy, Investigation Policy",
    triggerAuditId: "audit_abuse_prevention_v1",
    evidenceArtifacts: [
      "Abuse prevention audit results",
      "Staff training records",
      "Background check documentation",
      "Investigation records (de-identified)",
      "Supervision monitoring logs"
    ]
  },
  {
    id: "edu_f656_care_plan",
    topic: "Comprehensive Care Planning",
    description: "Development, implementation, and updating of comprehensive care plans that address resident needs.",
    purpose: "Ensure consistent, individualized care through effective care planning and implementation.",
    disciplines: "RN, LPN, CNA, IDT Members",
    ftags: "F656",
    nysdohRegs: "10 NYCRR 415.11",
    facilityPolicy: "Care Planning Policy, Interdisciplinary Team Policy, Care Plan Conference Policy",
    triggerAuditId: "audit_care_plan_v1",
    evidenceArtifacts: [
      "Care plan audit results",
      "IDT meeting minutes",
      "Care plan update documentation",
      "Implementation verification records",
      "Resident/family participation records"
    ]
  },
  {
    id: "edu_f677_adl",
    topic: "ADL Care for Dependent Residents",
    description: "Providing ADL care including turning, repositioning, and out-of-bed activities for dependent residents.",
    purpose: "Prevent complications from immobility and maintain resident function and dignity.",
    disciplines: "CNA, LPN, RN",
    ftags: "F677",
    nysdohRegs: "10 NYCRR 415.12",
    facilityPolicy: "ADL Care Policy, Repositioning Policy, Skin Integrity Policy",
    triggerAuditId: "audit_adl_care_v1",
    evidenceArtifacts: [
      "ADL care audit results",
      "Repositioning logs",
      "Skin assessment documentation",
      "ADL flow sheet reviews",
      "Staff competency validation records"
    ]
  },
  {
    id: "edu_f761_iv_labeling",
    topic: "IV and Medication Labeling",
    description: "Proper labeling and dating of IV dressings, tubing, and medications per policy.",
    purpose: "Prevent medication errors and infections through proper labeling and dating of IV supplies.",
    disciplines: "RN, LPN",
    ftags: "F761",
    nysdohRegs: "10 NYCRR 415.14",
    facilityPolicy: "IV Therapy Policy, Medication Labeling Policy, Infection Control Policy",
    triggerAuditId: "audit_iv_labeling_v1",
    evidenceArtifacts: [
      "IV labeling audit results",
      "IV care competency records",
      "Medication storage audits",
      "Corrective action documentation",
      "Staff education attendance records"
    ]
  }
];
