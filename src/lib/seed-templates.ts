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
  },
  {
    id: "audit_med_pass_observation_v1",
    title: "Medication Pass Observation",
    version: "1.0.0",
    category: "Medication Safety",
    placementTags: ["Medication Safety", "Survey-Ready"],
    ftagTags: ["F760"],
    nydohTags: ["10 NYCRR 415.14"],
    purpose: {
      summary: "Observe medication pass technique and documentation for safety, accuracy, and resident privacy.",
      risk: "Medication errors, unsafe administration practices, and survey deficiencies increase resident harm risk.",
      evidenceToShow: "Medication pass observations, MAR documentation, competency validation, and corrective actions."
    },
    references: [
      { system: "CMS", code: "F760", title: "Residents are Free of Significant Medication Errors", whyItMatters: "Ensures medications are administered safely and accurately." },
      { system: "NYDOH", code: "10 NYCRR 415.14", title: "Pharmacy services", whyItMatters: "State requirements for medication administration and documentation." }
    ],
    passingThreshold: 95,
    criticalFailKeys: ["identifies_resident", "med_label_verification", "meds_admin_per_order"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 },
      { key: "med_pass_time", label: "Time of med pass", type: "text", required: false, score: 0 },
      { key: "nurse_observed", label: "Name of nurse observed", type: "text", required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "supplies_ready", label: "Supplies on/in cart before starting pass (applesauce, juice, water, med cup, etc.)?", type: "yn", required: true, score: 5 },
      { key: "identifies_resident", label: "Identifies resident by facility policy (name band, verbal ID, etc.)?", type: "yn", required: true, score: 5, criticalFailIf: "no" },
      { key: "med_label_verification", label: "Medication verifies: reads labels, reads MAR, reads labels again?", type: "yn", required: true, score: 5, criticalFailIf: "no" },
      { key: "appropriate_fluid", label: "Medication given with appropriate amount of fluid (bulk laxatives, NSAIDs, potassium, etc.)?", type: "yn", required: true, score: 5 },
      { key: "crushes_meds_properly", label: "Crushes medications properly when indicated?", type: "yn", required: true, score: 5 },
      { key: "meds_can_be_crushed", label: "Verified medications can be crushed?", type: "yn", required: false, score: 3 },
      { key: "mar_crush_instructions", label: "MAR includes instructions to crush meds?", type: "yn", required: false, score: 3 },
      { key: "meds_crushed_separately", label: "Medications crushed separately?", type: "yn", required: false, score: 3 },
      { key: "sandwich_technique", label: "Medications mixed with applesauce using sandwich technique?", type: "yn", required: false, score: 3 },
      { key: "crushed_admin_separately", label: "Crushed medications administered separately?", type: "yn", required: false, score: 3 },
      { key: "enteric_not_crushed", label: "Enteric coated/time release medications not crushed?", type: "yn", required: true, score: 5 },
      { key: "meds_admin_per_order", label: "Meds administered according to MD order?", type: "yn", required: true, score: 5, criticalFailIf: "no" },
      { key: "pours_before_admin", label: "Pours meds prior to administering (does not pre-pour)?", type: "yn", required: true, score: 5 },
      { key: "initials_mar_after_admin", label: "Initials MAR immediately after administering medications?", type: "yn", required: true, score: 5 },
      { key: "hand_hygiene", label: "Hands are washed when necessary and properly for at least 20 seconds?", type: "yn", required: true, score: 5 },
      { key: "vitals_before_applicable", label: "Takes and records appropriate vital signs before pouring applicable drugs?", type: "yn", required: true, score: 5 },
      { key: "liquid_shakes_suspensions", label: "Liquid meds: shakes suspensions before pouring?", type: "yn", required: false, score: 3 },
      { key: "liquid_label_to_palm", label: "Liquid meds: label faces palm of hand?", type: "yn", required: false, score: 3 },
      { key: "liquid_eye_level", label: "Liquid meds: measures at eye level?", type: "yn", required: false, score: 3 },
      { key: "liquid_odd_volume_syringe", label: "Liquid meds: uses oral syringe for odd volumes (e.g., 4 ml)?", type: "yn", required: false, score: 3 },
      { key: "liquid_dilutes_applicable", label: "Liquid meds: dilutes applicable liquids (concentrates, FeSO4, KCL, etc.)?", type: "yn", required: false, score: 3 },
      { key: "swallowed_before_leaving", label: "Leaves resident after determining all medications have been swallowed?", type: "yn", required: true, score: 5 },
      { key: "meds_given_timely", label: "Meds are given timely?", type: "yn", required: true, score: 5 },
      { key: "privacy_for_applicable_meds", label: "Administers applicable meds in privacy (nitropaste, GT meds)?", type: "yn", required: true, score: 5 },
      { key: "fingerstick_privacy", label: "Fingerstick blood sugar taken in privacy?", type: "yn", required: true, score: 5 },
      { key: "mix_insulin_no_bubbles", label: "Mixes insulin suspensions without creating air bubbles?", type: "yn", required: false, score: 3 },
      { key: "insulin_refrigerated", label: "Unopened insulin refrigerated?", type: "yn", required: false, score: 3 },
      { key: "primes_insulin_pen", label: "Primes insulin pen with air shot and verifies full dose (keep needle in 6-10 seconds)?", type: "yn", required: false, score: 3 },
      { key: "rotate_im_sq_sites", label: "IM/SQ injection sites are rotated?", type: "yn", required: false, score: 3 },
      { key: "rotate_patch_sites", label: "Transdermal patch sites rotated?", type: "yn", required: false, score: 3 },
      { key: "proper_injection_technique", label: "Proper technique used for ID/IV/IM/SQ injection?", type: "yn", required: false, score: 3 },
      { key: "nsaids_with_food", label: "NSAIDs given with food or antacid?", type: "yn", required: false, score: 3 },
      { key: "glucometer_disinfected", label: "Glucometer cleaned/disinfected between residents (air dry contact time)?", type: "yn", required: true, score: 5 },
      { key: "emr_cleared_after_admin", label: "Nurse clicks/clears EMR after ensuring med was given at appropriate time?", type: "yn", required: true, score: 5 },
      { key: "no_meds_bedside", label: "No medication left at bedside?", type: "yn", required: true, score: 5 },
      { key: "hand_hygiene_rub_ok", label: "Hand hygiene performed via handwashing or 60%+ alcohol-based hand rub?", type: "yn", required: false, score: 3 },
      { key: "pain_meds_prior_activity", label: "Pain meds administered prior to meals, wound care, or procedures as indicated?", type: "yn", required: false, score: 3 },
      { key: "pain_scale_used", label: "Pain scale used before and after pain medication administration?", type: "yn", required: false, score: 3 },
      { key: "gt_meds_separate_cups", label: "Gastrostomy/NG tubes: prepares meds in separate cups?", type: "yn", required: false, score: 3 },
      { key: "gt_positioned", label: "Gastrostomy/NG tubes: resident properly positioned?", type: "yn", required: false, score: 3 },
      { key: "gt_hands_gloves", label: "Gastrostomy/NG tubes: washes hands and dons gloves?", type: "yn", required: false, score: 3 },
      { key: "gt_checks_patency", label: "Gastrostomy/NG tubes: checks tube for placement/patency?", type: "yn", required: false, score: 3 },
      { key: "gt_admin_separately", label: "Gastrostomy/NG tubes: administers meds separately?", type: "yn", required: false, score: 3 },
      { key: "gt_crimps_between", label: "Gastrostomy/NG tubes: crimps tube between additions?", type: "yn", required: false, score: 3 },
      { key: "gt_flushes_water", label: "Gastrostomy/NG tubes: flushes with proper amount of water before first/after last med (min 30 ml)?", type: "yn", required: false, score: 3 },
      { key: "gt_rinses_set", label: "Gastrostomy/NG tubes: rinses and dries irrigation set?", type: "yn", required: false, score: 3 },
      { key: "gt_separates_dilantin", label: "Gastrostomy/NG tubes: separates Dilantin from tube feeding?", type: "yn", required: false, score: 3 },
      { key: "eye_hands_gloves", label: "Eye meds: washes hands before/after and dons gloves?", type: "yn", required: false, score: 3 },
      { key: "eye_positioning", label: "Eye meds: resident seated/lying with head back and eyes open?", type: "yn", required: false, score: 3 },
      { key: "eye_instills_lower_lid", label: "Eye meds: instills in pocket of lower lid with drop contact?", type: "yn", required: false, score: 3 },
      { key: "eye_waits_between_drops", label: "Eye meds: waits at least 3-5 minutes between drops in same eye?", type: "yn", required: false, score: 3 },
      { key: "eye_separate_tissue", label: "Eye meds: uses separate tissue/gauze for each eye?", type: "yn", required: false, score: 3 },
      { key: "eye_xalatan_storage", label: "Eye meds: unopened Xalatan refrigerated; opened may be room temp?", type: "yn", required: false, score: 3 },
      { key: "syringe_no_recap", label: "Syringes: does not recap?", type: "yn", required: false, score: 3 },
      { key: "syringe_sharps", label: "Syringes: disposes in sharps container immediately?", type: "yn", required: false, score: 3 },
      { key: "med_cart_secure", label: "Meds cart secure (in view or locked; no meds on top)?", type: "yn", required: true, score: 5 },
      { key: "controlled_locked_drawer", label: "Controlled substances: places only those needed in locked drawer at start of pass?", type: "yn", required: false, score: 3 },
      { key: "controlled_record_on_cart", label: "Controlled substances: controlled drug book/records on cart?", type: "yn", required: false, score: 3 },
      { key: "controlled_signed_after_pour", label: "Controlled substances: signs controlled drug record after pouring dose?", type: "yn", required: false, score: 3 },
      { key: "controlled_returned_to_cabinet", label: "Controlled substances: removes drugs from med cart and returns to controlled cabinet?", type: "yn", required: false, score: 3 },
      { key: "fentanyl_patch_policy", label: "Fentanyl/Duragesic patch: follows policy for placement site, checks, removal/destruction with 2 nurse signatures?", type: "yn", required: false, score: 3 },
      { key: "inhaler_shakes_canister", label: "Inhalers: shakes canister before use?", type: "yn", required: false, score: 3 },
      { key: "inhaler_admin_inhaling", label: "Inhalers: administers while resident is inhaling?", type: "yn", required: false, score: 3 },
      { key: "inhaler_hold_breath", label: "Inhalers: instructs resident to hold for 5-10 seconds?", type: "yn", required: false, score: 3 },
      { key: "inhaler_wait_60_sec", label: "Inhalers: waits at least 60 seconds before puff #2 of same inhaler?", type: "yn", required: false, score: 3 },
      { key: "inhaler_wait_10_min", label: "Inhalers: waits at least 10 minutes before different inhalation drug?", type: "yn", required: false, score: 3 },
      { key: "inhaler_rinse_mouth", label: "Inhalers: offers water to rinse mouth after steroid inhaler?", type: "yn", required: false, score: 3 },
      { key: "inhaler_cleans_mouthpiece", label: "Inhalers: cleans mouthpiece with alcohol wipe before placing back in cart?", type: "yn", required: false, score: 3 },
      { key: "states_actions_meds_unavailable", label: "Able to state actions to take when medications are not available?", type: "yn", required: false, score: 3 },
      { key: "states_actions_meds_unavailable_repeat", label: "Able to state actions to take when medications are not available? (second check)", type: "yn", required: false, score: 3 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // ==================== IPCP AUDIT TOOLS ====================
  // Hand Hygiene Direct Observation
  {
    id: "audit_hh_observation_v1",
    title: "Hand Hygiene Direct Observation",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "High Priority", "Daily Audit"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "HH on entry/exit and before/after resident contact.",
      risk: "Inadequate hand hygiene is the leading cause of HAI transmission.",
      evidenceToShow: "HH log + coaching/remediation + re-check"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Hand hygiene is foundational to infection prevention." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State mandate for infection prevention." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["hh_performed"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 },
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7", "7A-7P", "7P-7A"], required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "observation_code", label: "Observation Code", type: "patientCode", required: true, score: 0 },
      { key: "staff_role", label: "Staff role observed", type: "select", options: ["RN", "LPN", "CNA", "MD", "PT/OT", "Dietary", "EVS", "Other"], required: true, score: 0 },
      { key: "moment", label: "HH Moment", type: "select", options: ["Room entry", "Room exit", "Before contact", "After contact", "After body fluid exposure"], required: true, score: 0 },
      { key: "hh_performed", label: "Hand hygiene performed?", type: "yn", required: true, score: 50, criticalFailIf: "no" },
      { key: "proper_technique", label: "Proper technique (20+ seconds)?", type: "yn", required: true, score: 30 },
      { key: "glove_change", label: "Gloves changed between tasks (if applicable)?", type: "yn", required: false, score: 20 },
      { key: "notes", label: "Notes / coaching provided", type: "text", required: false, score: 0 }
    ]
  },
  // PPE Task-Based Compliance
  {
    id: "audit_ppe_compliance_v1",
    title: "PPE Task-Based Compliance Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "High Priority", "Daily Audit"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Correct PPE selection and use during actual care tasks.",
      risk: "PPE mismatch during observation leads to transmission and survey deficiencies.",
      evidenceToShow: "PPE audit + correction loop entries"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Correct PPE prevents healthcare-associated infections." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for PPE compliance." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["correct_ppe_worn"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 },
      { key: "shift", label: "Shift", type: "select", options: ["7-3", "3-11", "11-7"], required: false, score: 0 }
    ],
    sampleQuestions: [
      { key: "observation_code", label: "Observation Code", type: "patientCode", required: true, score: 0 },
      { key: "staff_role", label: "Staff role observed", type: "select", options: ["RN", "LPN", "CNA", "PT/OT", "Therapy", "EVS"], required: true, score: 0 },
      { key: "precaution_type", label: "Precaution type", type: "select", options: ["Standard", "Contact", "Droplet", "Airborne", "EBP"], required: true, score: 0 },
      { key: "correct_ppe_worn", label: "Correct PPE worn for task/precaution?", type: "yn", required: true, score: 50, criticalFailIf: "no" },
      { key: "ppe_donned_correctly", label: "PPE donned correctly?", type: "yn", required: true, score: 25 },
      { key: "ppe_doffed_correctly", label: "PPE doffed correctly without self-contamination?", type: "yn", required: true, score: 25 },
      { key: "notes", label: "Notes / stop-correct-reobserve", type: "text", required: false, score: 0 }
    ]
  },
  // EBP Appropriateness & Application
  {
    id: "audit_ebp_v1",
    title: "Enhanced Barrier Precautions (EBP) Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Weekly Audit", "MDRO Prevention"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Right residents flagged + gown/glove during high-contact care.",
      risk: "Failure to apply EBP correctly spreads MDROs throughout the facility.",
      evidenceToShow: "EBP roster + audits + corrections"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "EBP prevents MDRO transmission during high-contact care." },
      { system: "CDC", code: "EBP Guidance", title: "Enhanced Barrier Precautions", whyItMatters: "CDC/CMS EBP guidance for nursing homes." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["ebp_status_correct", "ebp_followed"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "ebp_status_correct", label: "EBP status correctly identified in system?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "ebp_signage", label: "EBP signage posted if applicable?", type: "yn", required: true, score: 20 },
      { key: "ebp_followed", label: "Gown/glove used during high-contact care?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "staff_verbalize", label: "Staff can verbalize EBP triggers?", type: "yn", required: false, score: 20 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Isolation/EBP Room Readiness
  {
    id: "audit_room_readiness_v1",
    title: "Isolation/EBP Room Readiness Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Daily Audit", "Survey-Ready"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Signage correct + PPE stocked + HH available at point of care.",
      risk: "Missing supplies and signage lead to immediate survey deficiencies.",
      evidenceToShow: "Room check log + photo/attestation if used"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Room readiness is observable during survey." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for supplies at point of care." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["signage_correct", "supplies_present"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "room_number", label: "Room Number", type: "text", required: true, score: 0 },
      { key: "precaution_type", label: "Precaution type", type: "select", options: ["Contact", "Droplet", "Airborne", "EBP", "Multiple"], required: true, score: 0 },
      { key: "signage_correct", label: "Signage correct and visible?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "supplies_present", label: "PPE supplies stocked at door/bedside?", type: "yn", required: true, score: 25, criticalFailIf: "no" },
      { key: "hh_available", label: "Hand hygiene available at point of care?", type: "yn", required: true, score: 25 },
      { key: "trash_not_overflow", label: "Trash/linen not overflowing?", type: "yn", required: true, score: 15 },
      { key: "fixed_same_shift", label: "Issues fixed same shift?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Shared Equipment Cleaning Between Residents
  {
    id: "audit_equipment_cleaning_v1",
    title: "Shared Equipment Cleaning Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Daily Audit", "High Risk"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Equipment wiped with correct product/contact time between residents.",
      risk: "Shared equipment is a major infection-control citation trigger.",
      evidenceToShow: "Equipment cleaning audit + competency checks"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Equipment cleaning prevents cross-contamination." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for equipment decontamination." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["cleaned_between_use"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "observation_code", label: "Observation Code", type: "patientCode", required: true, score: 0 },
      { key: "equipment_type", label: "Equipment type", type: "select", options: ["Vital signs cart", "Glucometer", "Wheelchair", "Hoyer lift", "Gait belt", "Thermometer", "Other"], required: true, score: 0 },
      { key: "cleaned_between_use", label: "Cleaned between residents when observed?", type: "yn", required: true, score: 50, criticalFailIf: "no" },
      { key: "correct_product", label: "Correct disinfectant product used?", type: "yn", required: true, score: 25 },
      { key: "contact_time", label: "Appropriate contact time observed?", type: "yn", required: true, score: 25 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // High-Touch Environmental Cleaning Verification
  {
    id: "audit_env_cleaning_v1",
    title: "High-Touch Environmental Cleaning Verification",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Weekly Audit", "EVS"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "High-touch surfaces completed + IP verification spot checks.",
      risk: "Environmental contamination contributes to HAI transmission.",
      evidenceToShow: "EVS logs + IP verification + re-clean proof"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Environmental cleaning is critical for infection prevention." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for sanitary environment." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["high_touch_cleaned"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "room_area", label: "Room/Area", type: "text", required: true, score: 0 },
      { key: "high_touch_cleaned", label: "High-touch surfaces cleaned per checklist?", type: "yn", required: true, score: 40, criticalFailIf: "no" },
      { key: "evs_checklist_complete", label: "EVS checklist completed and signed?", type: "yn", required: true, score: 20 },
      { key: "ip_verification", label: "IP verification spot check passed?", type: "yn", required: true, score: 25 },
      { key: "reclean_48hrs", label: "Failures re-cleaned within 48 hrs?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Clean vs Dirty Workflow Rounds
  {
    id: "audit_clean_dirty_v1",
    title: "Clean vs Dirty Workflow Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Weekly Audit"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Carts/sinks/storage separation with clear signage and clean-to-dirty flow.",
      risk: "Mixed clean/dirty items visible during survey is immediate deficiency.",
      evidenceToShow: "Rounds log + correction loop + signage validation"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Clean/dirty separation prevents contamination." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for proper workflow." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["no_mixed_items"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "area", label: "Area checked", type: "select", options: ["Med cart", "Treatment cart", "Clean utility", "Soiled utility", "Nurse station", "Storage room"], required: true, score: 0 },
      { key: "no_mixed_items", label: "No mixed clean/dirty items?", type: "yn", required: true, score: 35, criticalFailIf: "no" },
      { key: "workflow_signage", label: "Clear clean/dirty signage or labels in place?", type: "yn", required: true, score: 15 },
      { key: "proper_storage", label: "Items stored properly (covered, off floor)?", type: "yn", required: true, score: 20 },
      { key: "hh_between_tasks", label: "Hand hygiene/glove change between clean/dirty tasks?", type: "yn", required: true, score: 20 },
      { key: "corrected_same_shift", label: "Failures corrected same shift?", type: "yn", required: true, score: 10 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Linen/Waste/Soiled Utility Audit
  {
    id: "audit_linen_waste_v1",
    title: "Linen/Waste/Soiled Utility Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Weekly Audit"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Overflow, covered bins, transport workflow correct.",
      risk: "Overflowing waste and improper linen handling spreads pathogens.",
      evidenceToShow: "Soiled utility audit + corrective actions"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Proper waste handling prevents infection spread." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for waste management." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["no_overflow"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Floor", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "area", label: "Area checked", type: "text", required: true, score: 0 },
      { key: "no_overflow", label: "No overflow in bins/hampers?", type: "yn", required: true, score: 35, criticalFailIf: "no" },
      { key: "containers_covered", label: "Containers covered appropriately?", type: "yn", required: true, score: 25 },
      { key: "correct_separation", label: "Correct separation (biohazard/regular/linen)?", type: "yn", required: true, score: 25 },
      { key: "transport_correct", label: "Transport workflow correct?", type: "yn", required: false, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Don/Doff Competency Return Demo
  {
    id: "audit_dondoff_competency_v1",
    title: "Don/Doff Competency Return Demo",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Competency", "Weekly Audit", "Training"],
    ftagTags: ["F945"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Staff demonstrates correct don/doff sequence.",
      risk: "Improper don/doff leads to self-contamination and infection spread.",
      evidenceToShow: "Competency checklist + remediation log"
    },
    references: [
      { system: "CMS", code: "F945", title: "Training Requirements", whyItMatters: "Staff must be trained and competent in PPE use." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for competency validation." }
    ],
    passingThreshold: 90,
    criticalFailKeys: ["sequence_correct"],
    sessionQuestions: [
      { key: "unit", label: "Unit/Department", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "staff_code", label: "Staff ID/Initials", type: "text", required: true, score: 0 },
      { key: "staff_role", label: "Staff role", type: "select", options: ["RN", "LPN", "CNA", "PT/OT", "EVS", "Dietary"], required: true, score: 0 },
      { key: "sequence_correct", label: "Correct don sequence demonstrated?", type: "yn", required: true, score: 35, criticalFailIf: "no" },
      { key: "doff_correct", label: "Correct doff sequence without self-contamination?", type: "yn", required: true, score: 35 },
      { key: "hh_after_doff", label: "Hand hygiene after doff?", type: "yn", required: true, score: 20 },
      { key: "remediation_if_fail", label: "Remediation provided if failed?", type: "yn", required: false, score: 10 },
      { key: "notes", label: "Notes / revalidation date", type: "text", required: false, score: 0 }
    ]
  },
  // Infection Surveillance Timeliness Audit
  {
    id: "audit_surveillance_v1",
    title: "Infection Surveillance Timeliness Audit",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Infection Prevention", "Weekly Audit", "Documentation"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "New infections captured; provider notified; line list updated.",
      risk: "Missed surveillance leads to delayed treatment and outbreak spread.",
      evidenceToShow: "Line list + notification log"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Surveillance is core to infection prevention program." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for infection surveillance." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["provider_notified", "line_list_updated"],
    sessionQuestions: [
      { key: "review_week", label: "Week reviewed", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "infection_code", label: "Infection/Case Code", type: "text", required: true, score: 0 },
      { key: "infection_type", label: "Infection type", type: "select", options: ["UTI", "SSTI", "Respiratory", "GI", "MDRO", "COVID", "Other"], required: true, score: 0 },
      { key: "onset_captured", label: "Onset date captured in record?", type: "yn", required: true, score: 20 },
      { key: "provider_notified", label: "Provider notified timely?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "line_list_updated", label: "Line list updated same day?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "labs_documented", label: "Labs/symptoms documented?", type: "yn", required: true, score: 20 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Antibiotic Stewardship Review
  {
    id: "audit_abx_stewardship_v1",
    title: "Antibiotic Stewardship Review",
    version: "1.0.0",
    category: "Infection Control",
    placementTags: ["Stewardship", "Weekly Audit", "Pharmacy"],
    ftagTags: ["F881"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Indication, dose, duration/stop date, culture follow-through.",
      risk: "Inappropriate antibiotic use promotes resistance and adverse effects.",
      evidenceToShow: "ABX review note + pharmacy/MD follow-up"
    },
    references: [
      { system: "CMS", code: "F881", title: "Antibiotic Stewardship Program", whyItMatters: "Facilities must have antibiotic stewardship program." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for stewardship." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["indication_documented", "stop_date_present"],
    sessionQuestions: [
      { key: "review_period", label: "Review period", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "antibiotic", label: "Antibiotic name", type: "text", required: true, score: 0 },
      { key: "indication_documented", label: "Indication documented?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "culture_before", label: "Culture obtained before treatment (if indicated)?", type: "yn", required: true, score: 20 },
      { key: "stop_date_present", label: "Stop date or timeout plan documented?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "culture_followup", label: "Culture results reviewed and acted upon?", type: "yn", required: true, score: 20 },
      { key: "notes", label: "Notes / escalation needed", type: "text", required: false, score: 0 }
    ]
  },
  // Vaccine Offer/Documentation Audit (Flu/Pneumo)
  {
    id: "audit_vaccine_flupneumo_v1",
    title: "Vaccine Offer/Documentation Audit (Flu/Pneumo)",
    version: "1.0.0",
    category: "Immunization",
    placementTags: ["Immunization", "Monthly Audit", "Survey-Ready"],
    ftagTags: ["F883"],
    nydohTags: ["10 NYCRR 415.19", "NY LTC Immunization Act"],
    purpose: {
      summary: "Education + offer + accept/decline/contra documented.",
      risk: "Missing vaccine documentation is a common survey deficiency.",
      evidenceToShow: "Vax audit + declination/contra forms"
    },
    references: [
      { system: "CMS", code: "F883", title: "Influenza and Pneumococcal Immunizations", whyItMatters: "Facilities must offer and document vaccinations." },
      { system: "NYDOH", code: "NY LTC Immunization Act", title: "NYS Immunization Requirements", whyItMatters: "State mandate for vaccine documentation." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["documentation_complete"],
    sessionQuestions: [
      { key: "review_month", label: "Month reviewed", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "vaccine_type", label: "Vaccine reviewed", type: "select", options: ["Influenza", "Pneumococcal", "Both"], required: true, score: 0 },
      { key: "education_provided", label: "Education provided and documented?", type: "yn", required: true, score: 25 },
      { key: "offer_documented", label: "Vaccine offered and documented?", type: "yn", required: true, score: 25 },
      { key: "documentation_complete", label: "Accept/decline/contraindication documented?", type: "yn", required: true, score: 30, criticalFailIf: "no" },
      { key: "consent_form", label: "Consent/declination form signed?", type: "yn", required: true, score: 20 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // COVID Immunization Documentation Audit
  {
    id: "audit_covid_vax_v1",
    title: "COVID Immunization Documentation Audit",
    version: "1.0.0",
    category: "Immunization",
    placementTags: ["Immunization", "Monthly Audit", "COVID"],
    ftagTags: ["F887"],
    nydohTags: ["10 NYCRR 415.19", "NY DOH COVID vaccine regs"],
    purpose: {
      summary: "COVID offer/admin/decline documented + roster accurate.",
      risk: "Incomplete COVID vaccine documentation leads to survey deficiencies.",
      evidenceToShow: "COVID vax log + consent/decline evidence"
    },
    references: [
      { system: "CMS", code: "F887", title: "COVID-19 Immunization", whyItMatters: "Facilities must offer and document COVID vaccinations." },
      { system: "NYDOH", code: "NY DOH COVID vaccine regs", title: "NYS COVID Vaccine Requirements", whyItMatters: "State COVID vaccine documentation requirements." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["documentation_complete"],
    sessionQuestions: [
      { key: "review_month", label: "Month reviewed", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "vaccination_status", label: "Vaccination status", type: "select", options: ["Up to date", "Partially vaccinated", "Declined", "Contraindicated", "Unknown"], required: true, score: 0 },
      { key: "offer_documented", label: "COVID vaccine offered and documented?", type: "yn", required: true, score: 30 },
      { key: "documentation_complete", label: "Complete documentation (admin/decline/contra)?", type: "yn", required: true, score: 35, criticalFailIf: "no" },
      { key: "roster_accurate", label: "Roster status matches medical record?", type: "yn", required: true, score: 20 },
      { key: "consent_signed", label: "Consent/declination signed?", type: "yn", required: true, score: 15 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Psychotropic / GDR Audit Tool
  {
    id: "audit_psychotropic_gdr_v1",
    title: "Psychotropic / GDR Audit Tool we designed — the separate tool used for manual chart review",
    version: "1.0.0",
    category: "Behavioral Health",
    placementTags: ["Psychotropic", "GDR", "Survey-Ready", "Monthly Audit"],
    ftagTags: ["F740", "F758"],
    nydohTags: ["10 NYCRR 415.12"],
    purpose: {
      summary: "Mirror CMS F740/F758 and NYS DOH 415.12 surveyor checklist for psychotropic documentation readiness with a normalized 24-point scoring scale.",
      risk: "Missing indication, care planning, GDR documentation, or oversight increases risk of psychotropic citations.",
      evidenceToShow: "Audit score and risk level (22–24 very low, 18–21 low, 12–17 moderate, <12 high) plus documented gaps for QA/DON review."
    },
    references: [
      { system: "CMS", code: "F740", title: "Unnecessary Drugs", whyItMatters: "Requires clear indication, monitoring, and risk/benefit documentation for continued psychotropic use." },
      { system: "CMS", code: "F758", title: "Psychotropic Drugs", whyItMatters: "Requires appropriate use, GDR attempts, and monitoring for psychotropic medications." },
      { system: "NYDOH", code: "10 NYCRR 415.12", title: "Behavioral Health Requirements", whyItMatters: "State behavioral health documentation and oversight requirements." }
    ],
    passingThreshold: 90,
    criticalFailKeys: [
      "indication_documented",
      "diagnosis_alignment",
      "risk_benefit_documented",
      "care_plan_med_use",
      "care_plan_behaviors",
      "gdr_attempted_or_contra",
      "gdr_response_documented"
    ],
    sessionQuestions: [
      { key: "review_month", label: "Review month", type: "text", required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "patient_code", label: "Resident Code", type: "patientCode", required: true, score: 0 },
      { key: "indication_documented", label: "Section 1 — Indication & Clinical Need: Clear documented indication/target symptoms for the psych med.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "diagnosis_alignment", label: "Section 1 — Indication & Clinical Need: Diagnosis aligns with psychotropic class.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "risk_benefit_documented", label: "Section 1 — Indication & Clinical Need: Risk vs benefit documented for continued use.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "care_plan_med_use", label: "Section 2 — Care Planning: Care plan includes psychotropic medication use.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "care_plan_behaviors", label: "Section 2 — Care Planning: Care plan includes behavioral interventions.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "gdr_attempted_or_contra", label: "Section 3 — GDR & Monitoring: GDR attempted OR contraindicated with rationale.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "gdr_response_documented", label: "Section 3 — GDR & Monitoring: Resident response to GDR documented.", type: "yn", required: true, score: 2, criticalFailIf: "no" },
      { key: "psych_consult_recent", label: "Section 4 — Psychiatric Oversight: Psychiatric consult within last 90 days.", type: "yn", required: true, score: 1.6 },
      { key: "psych_consult_order", label: "Section 4 — Psychiatric Oversight: If no consult, MD order for psych consult present.", type: "yn", required: true, score: 1.6 },
      { key: "behavior_notes_8_weeks", label: "Section 5 — Behavior Monitoring: At least 8 weeks of behavior notes.", type: "yn", required: true, score: 1.6 },
      { key: "behavior_notes_targets", label: "Section 5 — Behavior Monitoring: Behavior notes relate to target symptoms.", type: "yn", required: true, score: 1.6 },
      { key: "non_pharm_documented", label: "Section 6 — Non-Pharmacologic Interventions: Non-pharm approaches documented (redirection, environment, activities, etc.).", type: "yn", required: true, score: 1.6 },
      { key: "psychotropic_consent", label: "Section 7 — Legal / Consent: Psychotropic medication consent on file.", type: "yn", required: true, score: 1 },
      { key: "monthly_review_documented", label: "Section 8 — Ongoing Review: Monthly psychotropic medication review documented.", type: "yn", required: true, score: 1 },
      { key: "notes", label: "Notes / findings", type: "text", required: false, score: 0 }
    ]
  },
  // Outbreak Packet Readiness Check
  {
    id: "audit_outbreak_readiness_v1",
    title: "Outbreak Packet Readiness Check",
    version: "1.0.0",
    category: "Emergency Preparedness",
    placementTags: ["Infection Prevention", "Quarterly Audit", "Emergency Prep"],
    ftagTags: ["F880"],
    nydohTags: ["10 NYCRR 415.19"],
    purpose: {
      summary: "Packet templates complete and ready; drill documented.",
      risk: "Unpreparedness during outbreak leads to spread and regulatory scrutiny.",
      evidenceToShow: "Outbreak packet + drill minutes"
    },
    references: [
      { system: "CMS", code: "F880", title: "Infection Prevention and Control", whyItMatters: "Outbreak preparedness is part of IPC program." },
      { system: "NYDOH", code: "10 NYCRR 415.19", title: "Infection control requirements", whyItMatters: "State requirement for emergency preparedness." }
    ],
    passingThreshold: 100,
    criticalFailKeys: ["packet_complete"],
    sessionQuestions: [
      { key: "quarter", label: "Quarter reviewed", type: "select", options: ["Q1", "Q2", "Q3", "Q4"], required: true, score: 0 }
    ],
    sampleQuestions: [
      { key: "check_area", label: "Check area", type: "select", options: ["Outbreak packet", "Communication templates", "Supply inventory", "Cohorting plan", "Testing protocol"], required: true, score: 0 },
      { key: "packet_complete", label: "Outbreak packet complete and accessible?", type: "yn", required: true, score: 40, criticalFailIf: "no" },
      { key: "templates_current", label: "Templates current (dated within 12 months)?", type: "yn", required: true, score: 20 },
      { key: "drill_completed", label: "Tabletop drill completed this quarter?", type: "yn", required: true, score: 25 },
      { key: "action_items_closed", label: "Drill action items closed?", type: "yn", required: true, score: 15 },
      { key: "notes", label: "Notes / gaps identified", type: "text", required: false, score: 0 }
    ]
  }
];

// ==================== SEED EDUCATION TOPICS ====================
// Comprehensive IPCP Education Topic Library with trigger audits and evidence artifacts
export const SEED_EDU_TOPICS: EduTopic[] = [
  // IPCP Program Overview
  {
    id: "edu_ipcp_overview",
    topic: "IPCP Overview (Program + Roles)",
    description: "How the facility prevents/identifies/reports/investigates/controls infections; who does what.",
    purpose: "Standardize expectations + survey-ready staff answers",
    disciplines: "All staff + leadership",
    ftags: "F880;F882",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_hh_observation_v1",
    evidenceArtifacts: ["IPCP program documentation", "Staff role assignments", "Training sign-in sheets"]
  },
  // Hand Hygiene
  {
    id: "edu_hand_hygiene_moments",
    topic: "Hand Hygiene Moments + Technique",
    description: "When to perform HH (entry/exit, before/after care) + technique.",
    purpose: "Reduce transmission; fix top observable failures",
    disciplines: "All staff entering resident rooms",
    ftags: "F880;F945",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_hh_observation_v1",
    evidenceArtifacts: ["HH audit results", "Competency validation records", "Coaching documentation"]
  },
  // PPE Selection
  {
    id: "edu_ppe_selection",
    topic: "PPE Selection by Task",
    description: "Correct PPE choice based on care task + signage/orders.",
    purpose: "Prevent PPE mismatch on observation",
    disciplines: "Nursing/CNAs/Therapy/EVS",
    ftags: "F880;F945",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_ppe_compliance_v1",
    evidenceArtifacts: ["PPE audit results", "Task-based PPE guide", "Competency records"]
  },
  // Don/Doff
  {
    id: "edu_dondoff",
    topic: "Donning/Doffing Return-Demo",
    description: "Step sequence and avoiding self-contamination.",
    purpose: "Competency validation; defensible remediation",
    disciplines: "Nursing/CNAs/Therapy/EVS",
    ftags: "F880;F945",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_dondoff_competency_v1",
    evidenceArtifacts: ["Competency checklist", "Return demo records", "Remediation log"]
  },
  // EBP
  {
    id: "edu_ebp_triggers",
    topic: "Enhanced Barrier Precautions (EBP) Triggers",
    description: "Who qualifies + high-contact care triggers (gown/glove).",
    purpose: "Prevent MDRO spread; ensure staff can verbalize triggers",
    disciplines: "Nursing/CNAs/Therapy",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_ebp_v1",
    evidenceArtifacts: ["EBP roster", "Staff verbalization records", "Audit results"]
  },
  // TBP Basics
  {
    id: "edu_tbp_basics",
    topic: "Transmission-Based Precautions (TBP) Basics",
    description: "Contact/Droplet/Airborne basics; room entry actions.",
    purpose: "Correct isolation practice; reduce spread",
    disciplines: "All staff entering rooms",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_room_readiness_v1",
    evidenceArtifacts: ["TBP training records", "Isolation audit results", "Signage verification"]
  },
  // Signage & Supplies
  {
    id: "edu_signage_supplies",
    topic: "Signage + Point-of-Care Supply Standard",
    description: "What must be posted and staged at the door/bedside.",
    purpose: "Make practice match policy; avoid 'supply hunt'",
    disciplines: "Charge RN/Unit Mgr/Nursing",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_room_readiness_v1",
    evidenceArtifacts: ["Room readiness audits", "Supply par level documentation", "Signage standards"]
  },
  // Clean vs Dirty Workflow
  {
    id: "edu_clean_dirty",
    topic: "Clean vs Dirty Workflow (Carts/Sinks/Storage)",
    description: "Prevent cross-contamination with signage, storage rules, and clean-to-dirty flow.",
    purpose: "Eliminate visible survey failures and reinforce clean/dirty transitions",
    disciplines: "Nursing/CNAs/EVS",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_clean_dirty_v1",
    evidenceArtifacts: ["Workflow audit results", "Cart organization photos", "Signage/labeling checks", "Corrective actions"]
  },
  // Shared Equipment Cleaning
  {
    id: "edu_equipment_cleaning",
    topic: "Shared/Re-usable Equipment Cleaning",
    description: "How/when to clean equipment between residents; contact time.",
    purpose: "Eliminate a major infection-control citation trigger",
    disciplines: "Nursing/CNAs/Therapy",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_equipment_cleaning_v1",
    evidenceArtifacts: ["Equipment cleaning audit", "Contact time validation", "Competency records"]
  },
  // High-Touch Environmental Cleaning
  {
    id: "edu_hightouch_cleaning",
    topic: "High-Touch Environmental Cleaning (EVS + Nursing Split)",
    description: "High-touch surfaces, frequency, ownership, verification.",
    purpose: "Make logs match reality; reduce spread",
    disciplines: "EVS + Nursing leaders",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_env_cleaning_v1",
    evidenceArtifacts: ["EVS logs", "IP verification records", "Re-clean documentation"]
  },
  // Disinfectant Contact Time
  {
    id: "edu_disinfectant_contact",
    topic: "Disinfectant Contact Time + Product Use",
    description: "Which products are used and required wet contact times.",
    purpose: "Prevent 'wipe-and-run' failures",
    disciplines: "EVS + Nursing",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_equipment_cleaning_v1",
    evidenceArtifacts: ["Product training records", "Contact time audits", "Product reference sheets"]
  },
  // Linen/Waste Handling
  {
    id: "edu_linen_waste",
    topic: "Linen/Waste/Soiled Utility Handling",
    description: "Bagging/transport; covered containers; no overflow.",
    purpose: "Maintain sanitary environment; reduce contamination",
    disciplines: "Nursing/CNAs/EVS/Laundry",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_linen_waste_v1",
    evidenceArtifacts: ["Soiled utility audits", "Transport workflow documentation", "Corrective actions"]
  },
  // Sharps Safety
  {
    id: "edu_sharps_safety",
    topic: "Sharps Safety + Injection Safety",
    description: "Sharps placement/fill line; safe injection practices.",
    purpose: "Reduce bloodborne exposure risk",
    disciplines: "Nursing",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["Sharps audit results", "Injection safety competency", "Exposure reports"]
  },
  // Respiratory Hygiene
  {
    id: "edu_respiratory_hygiene",
    topic: "Respiratory Hygiene + Source Control",
    description: "Masking when symptomatic; cough etiquette; unit workflow.",
    purpose: "Reduce respiratory spread + outbreak risk",
    disciplines: "All staff",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["Respiratory hygiene signage", "Mask availability audits", "Outbreak data"]
  },
  // Specimen Collection
  {
    id: "edu_specimen_collection",
    topic: "Specimen Collection/Transport",
    description: "Proper collection/labeling/timely transport to avoid contamination.",
    purpose: "Improve diagnostic accuracy; timely treatment",
    disciplines: "Nursing",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["Specimen collection competency", "Lab rejection rates", "Transport audits"]
  },
  // Infection Surveillance
  {
    id: "edu_surveillance_workflow",
    topic: "Infection Surveillance & Line List Workflow",
    description: "Identify onset, document symptoms/labs, notify provider, update line list.",
    purpose: "Prove surveillance system is active",
    disciplines: "IP/Charge RN/Nursing leaders",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_surveillance_v1",
    evidenceArtifacts: ["Line list documentation", "Provider notification log", "Surveillance reports"]
  },
  // Outbreak Response
  {
    id: "edu_outbreak_response",
    topic: "Outbreak Recognition + Response Tabletop",
    description: "Outbreak definition, testing logs, cohorting, notifications, clearance.",
    purpose: "Demonstrate readiness + organized response",
    disciplines: "IP/DON/Unit leaders/EVS",
    ftags: "F880",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_outbreak_readiness_v1",
    evidenceArtifacts: ["Outbreak drill records", "Response checklist", "Communication templates"]
  },
  // NHSN Reporting
  {
    id: "edu_nhsn_reporting",
    topic: "NHSN Reporting Basics (if applicable)",
    description: "What gets reported and how you track/report required metrics.",
    purpose: "Support reporting compliance & readiness",
    disciplines: "IP/QAPI/Leadership",
    ftags: "F884",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["NHSN submission records", "Data validation logs", "Reporting calendar"]
  },
  // Antibiotic Stewardship
  {
    id: "edu_abx_stewardship",
    topic: "Antibiotic Stewardship for Nurses",
    description: "Indication, culture review, stop date, time-outs, documentation standards.",
    purpose: "Reduce inappropriate use + resistance",
    disciplines: "Nursing/IP/Leadership",
    ftags: "F881",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_abx_stewardship_v1",
    evidenceArtifacts: ["ABX review records", "Culture follow-up documentation", "Stewardship reports"]
  },
  // Culture Follow-Through
  {
    id: "edu_culture_followthrough",
    topic: "Culture Follow-Through + Lab Notification",
    description: "Ensure abnormal labs trigger provider notification + documentation.",
    purpose: "Prevent missed follow-up and delays",
    disciplines: "Nursing/IP",
    ftags: "F880;F881",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_surveillance_v1",
    evidenceArtifacts: ["Lab notification log", "Follow-up documentation", "Delay analysis"]
  },
  // Flu/Pneumo Vaccines
  {
    id: "edu_flu_pneumo_vaccine",
    topic: "Influenza & Pneumococcal Vaccine Education/Offer",
    description: "Resident education, offer, document acceptance/refusal/contraindication.",
    purpose: "Meet immunization offering/documentation requirements",
    disciplines: "Nursing/Medical Records/IP",
    ftags: "F883",
    nysdohRegs: "10 NYCRR 415.19;NY LTC Immunization Act",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_vaccine_flupneumo_v1",
    evidenceArtifacts: ["Vaccine audit results", "Consent/declination forms", "Education records"]
  },
  // COVID Vaccines
  {
    id: "edu_covid_vaccine",
    topic: "COVID-19 Immunization Offer & Documentation",
    description: "Offer/document COVID vaccines; maintain records per survey expectations.",
    purpose: "Meet COVID immunization survey requirements",
    disciplines: "Nursing/Medical Records/IP",
    ftags: "F887",
    nysdohRegs: "10 NYCRR 415.19;NY DOH COVID vaccine regs",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_covid_vax_v1",
    evidenceArtifacts: ["COVID vax log", "Consent documentation", "Roster reconciliation"]
  },
  // COVID Testing
  {
    id: "edu_covid_testing",
    topic: "COVID Testing/Response Basics (if used)",
    description: "Testing workflow during outbreaks/positivity; documentation/communication.",
    purpose: "Reduce spread; meet testing expectations",
    disciplines: "IP/Nursing leaders",
    ftags: "F886",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["Testing logs", "Communication records", "Outbreak response documentation"]
  },
  // IC Training System
  {
    id: "edu_ic_training_system",
    topic: "Infection Control Training Program (System)",
    description: "How training is assigned, tracked, validated; remediation + re-check.",
    purpose: "Prove training system effectiveness",
    disciplines: "Educator/IP/Leadership",
    ftags: "F945",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    triggerAuditId: "audit_dondoff_competency_v1",
    evidenceArtifacts: ["Training assignment records", "Completion tracking", "Remediation documentation"]
  },
  // CNA Annual In-Service
  {
    id: "edu_cna_annual",
    topic: "Nurse Aide Annual In-Service Minimum (12 hrs) + Content",
    description: "Annual minimum hours + required content categories; documentation.",
    purpose: "Meet required in-service expectations",
    disciplines: "Educator/DON/CNAs",
    ftags: "F947",
    nysdohRegs: "10 NYCRR 415.19",
    facilityPolicy: "",
    archived: false,
    evidenceArtifacts: ["Annual hour tracking", "Content coverage documentation", "Sign-in sheets"]
  },
  // ==================== EXISTING F-TAG TOPICS ====================
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
