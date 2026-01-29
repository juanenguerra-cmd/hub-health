// Competency Skills Library from MASTERED.IT
import type { CompetencySkill } from '@/types/nurse-educator';

export const COMPETENCY_LIBRARY: CompetencySkill[] = [
  // CNA Competencies
  { id: '50-292-25', code: '50-292-25', title: 'CC-Orientation Checklist: Certified Nursing Assistant', disciplines: ['CNA'], platform: 'C', keywords: ['orientation', 'cna', 'checklist'] },
  { id: '50-060-25', code: '50-060-25', title: 'Ostomy Care', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['ostomy', 'colostomy', 'ileostomy', 'stoma'] },
  { id: '50-062-25', code: '50-062-25', title: 'Measuring and Recording Height', disciplines: ['CNA'], platform: 'Mastered', keywords: ['height', 'measurement', 'vital'] },
  { id: '50-065-25', code: '50-065-25', title: 'Prosthesis Application and Removal', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['prosthesis', 'prosthetic', 'limb'] },
  { id: '50-066-25', code: '50-066-25', title: 'Applying and Removing Restraints', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['restraint', 'safety', 'fall'] },
  { id: '50-070-25', code: '50-070-25', title: 'Passive Range of Motion Exercises Upper Extremities', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['range of motion', 'rom', 'prom', 'exercise', 'upper'] },
  { id: '50-071-25', code: '50-071-25', title: 'Assisting with a Walker', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['walker', 'ambulation', 'mobility', 'gait'] },
  { id: '50-120-25', code: '50-120-25', title: 'Post-Mortem Care', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['post-mortem', 'death', 'deceased'] },
  { id: '50-076-25', code: '50-076-25', title: 'Dementia Care – Personal Hygiene', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dementia', 'hygiene', 'alzheimer', 'cognitive'] },
  { id: '50-072-25', code: '50-072-25', title: 'Transfer Using a Mechanical Stand-Up Lift', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['transfer', 'stand-up lift', 'mechanical', 'sit-to-stand'] },
  { id: '50-073-25', code: '50-073-25', title: 'Mechanical Lift Hoyer', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['hoyer', 'mechanical lift', 'transfer', 'lift'] },
  { id: '50-236-25', code: '50-236-25', title: 'Measuring and Recording Fluid Intake', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['fluid', 'intake', 'hydration', 'i&o'] },
  { id: '50-238-25', code: '50-238-25', title: 'Measuring and Recording Respirations', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['respiration', 'breathing', 'vital signs'] },
  { id: '50-239-25', code: '50-239-25', title: 'Measuring and Recording Apical Pulse', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['apical', 'pulse', 'heart rate', 'vital'] },
  { id: '50-246-25', code: '50-246-25', title: 'Gait Belt Application', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['gait belt', 'transfer', 'ambulation', 'safety'] },
  { id: '50-247-25', code: '50-247-25', title: 'Transfer To and From Commode', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['commode', 'transfer', 'toileting'] },
  { id: '50-237-25', code: '50-237-25', title: 'Measuring & Recording Blood Pressure (Manual)', disciplines: ['CNA', 'Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['blood pressure', 'bp', 'manual', 'vital signs'] },
  { id: '50-240-25', code: '50-240-25', title: 'Compression Socks Application', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['compression', 'ted', 'stockings', 'dvt'] },
  { id: '50-032-25', code: '50-032-25', title: 'One Person Transfer', disciplines: ['CNA'], platform: 'Mastered', keywords: ['transfer', 'one person', 'mobility'] },
  { id: '50-031-25', code: '50-031-25', title: 'Therapeutic Diets', disciplines: ['CNA', 'Dietary', 'Nurse'], platform: 'Mastered', keywords: ['diet', 'nutrition', 'therapeutic', 'feeding'] },
  { id: '50-027-25', code: '50-027-25', title: 'Active Range of Motion (AROM) – Upper and Lower Extremities', disciplines: ['CNA'], platform: 'Mastered', keywords: ['range of motion', 'arom', 'exercise', 'active'] },
  { id: '50-010-25', code: '50-010-25', title: 'Anticoagulant Medication Monitoring', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['anticoagulant', 'blood thinner', 'coumadin', 'warfarin'] },
  { id: '50-007-25', code: '50-007-25', title: 'Glucometer: Obtaining a Blood Glucose Reading', disciplines: ['CNA', 'Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['glucometer', 'blood sugar', 'glucose', 'diabetes', 'fingerstick'] },
  { id: '50-288-25', code: '50-288-25', title: 'Perineal Care with Urinary Catheter', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['perineal', 'catheter', 'foley', 'urinary'] },
  { id: '50-279-25', code: '50-279-25', title: 'Fluid Restriction - CNA', disciplines: ['CNA'], platform: 'Mastered', keywords: ['fluid restriction', 'intake', 'limit'] },
  { id: '50-262-25', code: '50-262-25', title: 'Ambulation', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['ambulation', 'walking', 'mobility', 'gait'] },
  { id: '50-077-25', code: '50-077-25', title: 'Dementia Care Assisting with Dressing & Undressing', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dementia', 'dressing', 'alzheimer'] },
  { id: '50-260-25', code: '50-260-25', title: 'Obtaining a Temperature', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['temperature', 'vital signs', 'fever'] },
  { id: '50-259-25', code: '50-259-25', title: 'Feeding and Hydration Skills Checklist (Paid Feeding Assistant)', disciplines: ['CNA', 'Dietary', 'Therapy'], platform: 'Mastered', keywords: ['feeding', 'hydration', 'nutrition', 'eating'] },
  { id: '50-252-25', code: '50-252-25', title: 'Contracture Management and Splinting Skills Checklist (CNA)', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['contracture', 'splint', 'positioning'] },
  { id: '50-250-25', code: '50-250-25', title: 'Assisting with meals', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['meals', 'eating', 'feeding', 'nutrition'] },
  { id: '50-249-25', code: '50-249-25', title: 'Assisting with Using a Urinal', disciplines: ['CNA'], platform: 'Mastered', keywords: ['urinal', 'toileting', 'elimination'] },
  { id: '50-245-25', code: '50-245-25', title: 'Food Storage', disciplines: ['CNA', 'All Staff'], platform: 'Mastered', keywords: ['food', 'storage', 'refrigerator', 'safety'] },
  { id: '50-244-25', code: '50-244-25', title: 'Turning and Repositioning for Lateral & Supine', disciplines: ['CNA', 'Nurse', 'PCA'], platform: 'Mastered', keywords: ['turning', 'repositioning', 'pressure', 'skin', 'lateral', 'supine'] },
  { id: '50-243-25', code: '50-243-25', title: 'Transfer To and From Shower/Tub', disciplines: ['CNA'], platform: 'Mastered', keywords: ['shower', 'tub', 'bath', 'transfer'] },
  { id: '50-242-25', code: '50-242-25', title: 'Foley Catheter Care Skills Checklist (CNA)', disciplines: ['CNA'], platform: 'Mastered', keywords: ['foley', 'catheter', 'urinary', 'cauti'] },
  { id: '50-233-25', code: '50-233-25', title: 'Measuring & Recording Radial Pulse', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['radial', 'pulse', 'vital signs'] },
  { id: '50-231-25', code: '50-231-25', title: 'Transfer from bed to chair wheelchair use of gait belt', disciplines: ['CNA'], platform: 'Mastered', keywords: ['transfer', 'wheelchair', 'gait belt', 'bed'] },
  { id: '50-229-25', code: '50-229-25', title: 'Colostomy Care and Maintenance', disciplines: ['CNA', 'Nurse', 'OT'], platform: 'Mastered', keywords: ['colostomy', 'ostomy', 'stoma'] },
  { id: '50-228-25', code: '50-228-25', title: 'Measuring & Recording Blood Pressure (Automatic Device)', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['blood pressure', 'bp', 'automatic', 'vital signs'] },
  { id: '50-226-25', code: '50-226-25', title: 'Passive Range of Motion (Lower Extremity)', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['range of motion', 'prom', 'lower', 'leg'] },
  { id: '50-225-25', code: '50-225-25', title: 'Dementia Care – Assisting with Eating', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['dementia', 'eating', 'feeding', 'alzheimer'] },
  { id: '50-223-25', code: '50-223-25', title: 'Dementia Care – Incontinence Care', disciplines: ['CNA', 'Nurse', 'PCA'], platform: 'Mastered', keywords: ['dementia', 'incontinence', 'toileting'] },
  { id: '50-215-25', code: '50-215-25', title: 'Transfers Using a Sliding Board', disciplines: ['CNA', 'Nurse', 'PCA'], platform: 'Mastered', keywords: ['sliding board', 'transfer', 'mobility'] },
  { id: '50-209-25', code: '50-209-25', title: 'Orthostatic Blood Pressure Measurement', disciplines: ['CNA', 'Nurse', 'Therapy'], platform: 'Mastered', keywords: ['orthostatic', 'blood pressure', 'bp', 'hypotension'] },
  { id: '50-202-25', code: '50-202-25', title: 'Pulse Oximetry', disciplines: ['CNA', 'Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['pulse ox', 'oximetry', 'oxygen', 'saturation', 'spo2'] },
  { id: '50-194-25', code: '50-194-25', title: 'Bathroom Assistance', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bathroom', 'toileting', 'assistance'] },
  { id: '50-192-25', code: '50-192-25', title: 'Changing a Urinary Drainage Bag', disciplines: ['CNA', 'Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['urinary', 'drainage bag', 'catheter', 'foley'] },
  { id: '50-181-25', code: '50-181-25', title: 'Shampooing Hair', disciplines: ['CNA'], platform: 'Mastered', keywords: ['shampoo', 'hair', 'hygiene'] },
  { id: '50-185-25', code: '50-185-25', title: 'Changing an Adult Brief', disciplines: ['CNA'], platform: 'Mastered', keywords: ['brief', 'incontinence', 'diaper'] },
  { id: '50-182-25', code: '50-182-25', title: 'Modified Bed Bath', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bed bath', 'bathing', 'hygiene'] },
  { id: '50-178-25', code: '50-178-25', title: 'Ventilator Observation and Support - CNA', disciplines: ['CNA'], platform: 'Mastered', keywords: ['ventilator', 'vent', 'respiratory'] },
  { id: '50-166-25', code: '50-166-25', title: 'Eyeglass Care', disciplines: ['CNA'], platform: 'Mastered', keywords: ['eyeglass', 'glasses', 'vision'] },
  { id: '50-165-25', code: '50-165-25', title: 'Fall Prevention', disciplines: ['CNA', 'All Staff'], platform: 'Mastered', keywords: ['fall', 'prevention', 'safety', 'risk'] },
  { id: '50-164-25', code: '50-164-25', title: 'Hand and Nail Care Skills Checklist (CNA)', disciplines: ['CNA'], platform: 'Mastered', keywords: ['hand', 'nail', 'hygiene'] },
  { id: '50-144-25', code: '50-144-25', title: 'Making an Occupied Bed', disciplines: ['CNA'], platform: 'Mastered', keywords: ['occupied bed', 'linen', 'bed making'] },
  { id: '50-143-25', code: '50-143-25', title: 'Making an Unoccupied Bed/Handling of Bed Linens', disciplines: ['CNA'], platform: 'Mastered', keywords: ['unoccupied bed', 'linen', 'bed making'] },
  { id: '50-106-25', code: '50-106-25', title: 'CC-Mouth Care', disciplines: ['CNA'], platform: 'C', keywords: ['mouth', 'oral', 'dental'] },
  { id: '50-107-25', code: '50-107-25', title: 'CC-Incontinent Care', disciplines: ['CNA'], platform: 'C', keywords: ['incontinent', 'incontinence', 'toileting'] },
  { id: '50-108-25', code: '50-108-25', title: 'CC-Handwashing', disciplines: ['CNA'], platform: 'C', keywords: ['handwashing', 'hand hygiene', 'infection control'] },
  { id: '50-104-25', code: '50-104-25', title: 'CC-Point of Care (POC)', disciplines: ['CNA'], platform: 'C', keywords: ['point of care', 'poc', 'documentation'] },
  { id: '50-102-25', code: '50-102-25', title: 'CC-Turning & Repositioning', disciplines: ['CNA'], platform: 'C', keywords: ['turning', 'repositioning', 'pressure'] },
  { id: '50-103-25', code: '50-103-25', title: 'CC-Bath/Shower', disciplines: ['CNA'], platform: 'C', keywords: ['bath', 'shower', 'bathing', 'hygiene'] },
  { id: '50-110-25', code: '50-110-25', title: 'CC-Grooming', disciplines: ['CNA'], platform: 'C', keywords: ['grooming', 'hygiene', 'appearance'] },
  { id: '50-109-25', code: '50-109-25', title: 'CC-Transferring A Resident With The Use Of The Mechanical Lift-CNA', disciplines: ['CNA'], platform: 'C', keywords: ['mechanical lift', 'transfer', 'hoyer'] },
  { id: '50-111-25', code: '50-111-25', title: 'CC-Standing Lift Competency', disciplines: ['CNA'], platform: 'C', keywords: ['standing lift', 'sit-to-stand', 'transfer'] },
  { id: '50-117-25', code: '50-117-25', title: 'Lowering a Resident with a Fall', disciplines: ['CNA'], platform: 'Mastered', keywords: ['fall', 'lowering', 'controlled descent'] },
  { id: '50-116-25', code: '50-116-25', title: 'Applying and Removing a Urinary Leg Bag', disciplines: ['CNA'], platform: 'Mastered', keywords: ['leg bag', 'urinary', 'catheter'] },
  { id: '50-115-25', code: '50-115-25', title: 'Assisting with Eating', disciplines: ['CNA'], platform: 'Mastered', keywords: ['eating', 'feeding', 'meals'] },
  { id: '50-114-25', code: '50-114-25', title: 'Assisting a Resident with Bladder Incontinence', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bladder', 'incontinence', 'urinary'] },
  { id: '50-113-25', code: '50-113-25', title: 'Assisting with Bowel Incontinence', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bowel', 'incontinence', 'fecal'] },
  { id: '50-112-25', code: '50-112-25', title: 'Dressing a Resident with Hemiplegia/Hemiparesis', disciplines: ['CNA'], platform: 'Mastered', keywords: ['hemiplegia', 'hemiparesis', 'dressing', 'stroke'] },
  { id: '50-085-25', code: '50-085-25', title: 'Perineal Care- Male Resident', disciplines: ['CNA'], platform: 'Mastered', keywords: ['perineal', 'male', 'hygiene'] },
  { id: '50-086-25', code: '50-086-25', title: 'Perineal Care – Female Residents', disciplines: ['CNA'], platform: 'Mastered', keywords: ['perineal', 'female', 'hygiene'] },
  { id: '50-087-25', code: '50-087-25', title: 'Assisting with Toileting Using a Bedpan', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bedpan', 'toileting', 'elimination'] },
  { id: '50-084-25', code: '50-084-25', title: 'Full Bed Bath', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bed bath', 'full bath', 'hygiene'] },
  { id: '50-083-25', code: '50-083-25', title: 'Assisting with Tub Bath', disciplines: ['CNA'], platform: 'Mastered', keywords: ['tub', 'bath', 'bathing'] },
  { id: '50-082-25', code: '50-082-25', title: 'Assisting with a Shower', disciplines: ['CNA'], platform: 'Mastered', keywords: ['shower', 'bathing', 'hygiene'] },
  { id: '50-081-25', code: '50-081-25', title: 'Assisting with Toileting', disciplines: ['CNA'], platform: 'Mastered', keywords: ['toileting', 'bathroom', 'elimination'] },
  { id: '50-080-25', code: '50-080-25', title: 'Shaving a Resident with a Razor/Electric Razor', disciplines: ['CNA'], platform: 'Mastered', keywords: ['shaving', 'razor', 'grooming'] },
  { id: '50-079-25', code: '50-079-25', title: 'Foot Care (CNA)', disciplines: ['CNA'], platform: 'Mastered', keywords: ['foot', 'care', 'hygiene'] },
  { id: '50-078-25', code: '50-078-25', title: 'Dementia Care – Assisting with Toileting', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dementia', 'toileting', 'alzheimer'] },
  { id: '50-075-25', code: '50-075-25', title: 'Dementia Care – Bathing', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dementia', 'bathing', 'alzheimer'] },
  { id: '50-064-25', code: '50-064-25', title: 'Measuring and Recording Pulse and Respiration', disciplines: ['CNA'], platform: 'Mastered', keywords: ['pulse', 'respiration', 'vital signs'] },
  { id: '50-063-25', code: '50-063-25', title: 'Measuring and Recording Weight', disciplines: ['CNA'], platform: 'Mastered', keywords: ['weight', 'measurement', 'scale'] },
  { id: '50-061-25', code: '50-061-25', title: 'Empty Contents of Urinary Drainage Bag', disciplines: ['CNA'], platform: 'Mastered', keywords: ['urinary', 'drainage', 'catheter', 'empty'] },
  { id: '50-057-25', code: '50-057-25', title: 'Heel/Elbow Protectors – Application & Removal', disciplines: ['CNA'], platform: 'Mastered', keywords: ['heel', 'elbow', 'protector', 'pressure'] },
  { id: '50-056-25', code: '50-056-25', title: 'Oral Care Conscious', disciplines: ['CNA'], platform: 'Mastered', keywords: ['oral', 'mouth', 'dental'] },
  { id: '50-054-25', code: '50-054-25', title: 'Assisting with Dressing and Undressing', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dressing', 'undressing', 'clothing'] },
  { id: '50-053-25', code: '50-053-25', title: 'Dressing a Dependent Resident', disciplines: ['CNA'], platform: 'Mastered', keywords: ['dressing', 'dependent', 'clothing'] },
  { id: '50-052-25', code: '50-052-25', title: 'Measuring and Recording Pain', disciplines: ['CNA'], platform: 'Mastered', keywords: ['pain', 'assessment', 'scale'] },
  { id: '50-051-25', code: '50-051-25', title: 'Denture Care', disciplines: ['CNA'], platform: 'Mastered', keywords: ['denture', 'oral', 'teeth'] },
  { id: '50-050-25', code: '50-050-25', title: 'Assisting with Brushing and Flossing of Teeth', disciplines: ['CNA'], platform: 'Mastered', keywords: ['brushing', 'flossing', 'oral', 'dental'] },
  { id: '50-048-25', code: '50-048-25', title: 'Repositioning in Wheelchair', disciplines: ['CNA'], platform: 'Mastered', keywords: ['wheelchair', 'repositioning', 'positioning'] },
  { id: '50-047-25', code: '50-047-25', title: 'Hearing Aid Care: Insertion, Removal, Cleaning, and Battery Replacement', disciplines: ['CNA'], platform: 'Mastered', keywords: ['hearing aid', 'hearing', 'battery'] },
  { id: '50-044-25', code: '50-044-25', title: 'Record and Report Condition Changes', disciplines: ['CNA'], platform: 'Mastered', keywords: ['record', 'report', 'condition', 'documentation'] },
  { id: '50-043-25', code: '50-043-25', title: 'Transfer In and Out of Wheelchair', disciplines: ['CNA'], platform: 'Mastered', keywords: ['wheelchair', 'transfer'] },
  { id: '50-042-25', code: '50-042-25', title: 'Record and Report Care Provided', disciplines: ['CNA'], platform: 'Mastered', keywords: ['record', 'report', 'documentation'] },
  { id: '50-041-25', code: '50-041-25', title: 'Turning and Repositioning in Bed', disciplines: ['CNA'], platform: 'Mastered', keywords: ['turning', 'repositioning', 'bed', 'pressure'] },
  { id: '50-040-25', code: '50-040-25', title: 'Bed Mobility', disciplines: ['CNA'], platform: 'Mastered', keywords: ['bed', 'mobility', 'movement'] },
  { id: '50-039-25', code: '50-039-25', title: 'Transfer To and From a Car', disciplines: ['CNA'], platform: 'Mastered', keywords: ['car', 'transfer', 'vehicle'] },
  { id: '50-038-25', code: '50-038-25', title: 'Vital Signs – Complete Set', disciplines: ['CNA'], platform: 'Mastered', keywords: ['vital signs', 'temperature', 'pulse', 'respiration', 'blood pressure'] },
  { id: '50-037-25', code: '50-037-25', title: 'Urinary Toileting Program Evaluation', disciplines: ['CNA'], platform: 'Mastered', keywords: ['urinary', 'toileting', 'program', 'incontinence'] },
  { id: '50-002-25', code: '50-002-25', title: 'Skin Care & Pressure Injury Prevention (CNA)', disciplines: ['CNA', 'Med Tech', 'PCA'], platform: 'Mastered', keywords: ['skin', 'pressure', 'injury', 'prevention', 'wound'] },
  { id: '50-001-25', code: '50-001-25', title: 'Oxygen (CNA)', disciplines: ['CNA', 'Med Tech', 'PCA'], platform: 'Mastered', keywords: ['oxygen', 'o2', 'respiratory'] },
  
  // Nurse Competencies
  { id: '50-171-25', code: '50-171-25', title: 'Back Rub', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['back rub', 'massage', 'comfort'] },
  { id: '50-169-25', code: '50-169-25', title: 'Feeding a Resident with Dysphagia', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['dysphagia', 'swallowing', 'feeding'] },
  { id: '50-168-25', code: '50-168-25', title: 'Feeding a Dependent Resident', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['feeding', 'dependent', 'eating'] },
  { id: '50-163-25', code: '50-163-25', title: 'Medication Administration – Intravenous (IV)', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['iv', 'intravenous', 'medication', 'injection'] },
  { id: '50-162-25', code: '50-162-25', title: 'Medication Administration – Intramuscular Injection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['intramuscular', 'im', 'injection', 'medication'] },
  { id: '50-161-25', code: '50-161-25', title: 'Medication Administration – Ear Drops', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['ear', 'drops', 'otic', 'medication'] },
  { id: '50-160-25', code: '50-160-25', title: 'Medication Administration – Nasal Sprays', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['nasal', 'spray', 'medication'] },
  { id: '50-159-25', code: '50-159-25', title: 'Medication Administration – Eye Ointments', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['eye', 'ointment', 'ophthalmic', 'medication'] },
  { id: '50-158-25', code: '50-158-25', title: 'Medication Administration – Transdermal Patch Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['transdermal', 'patch', 'medication'] },
  { id: '50-157-25', code: '50-157-25', title: 'Medication Administration – Inhalants', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['inhaler', 'inhalant', 'respiratory', 'medication'] },
  { id: '50-156-25', code: '50-156-25', title: 'Medication Administration – Intradermal Injection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['intradermal', 'injection', 'medication'] },
  { id: '50-155-25', code: '50-155-25', title: 'Medication Administration – Nose Drops', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['nose', 'drops', 'nasal', 'medication'] },
  { id: '50-154-25', code: '50-154-25', title: 'Medication Administration – Subcutaneous Injection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['subcutaneous', 'subq', 'injection', 'medication'] },
  { id: '50-153-25', code: '50-153-25', title: 'Medication Administration – Rectal Suppositories', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['rectal', 'suppository', 'medication'] },
  { id: '50-152-25', code: '50-152-25', title: 'Medication Administration – Eye Drops', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['eye', 'drops', 'ophthalmic', 'medication'] },
  { id: '50-151-25', code: '50-151-25', title: 'Medication Administration – Transdermal Cream', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['transdermal', 'cream', 'topical', 'medication'] },
  { id: '50-150-25', code: '50-150-25', title: 'Medication Administration – Oral Medications', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['oral', 'medication', 'pills', 'tablet'] },
  { id: '50-149-25', code: '50-149-25', title: 'Medication Administration – Two Parenteral Medications in One Injection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['parenteral', 'injection', 'medication', 'mixing'] },
  { id: '50-148-25', code: '50-148-25', title: 'Medication Administration – Z-Track Method', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['z-track', 'injection', 'im', 'medication'] },
  { id: '50-147-25', code: '50-147-25', title: 'Intake and Output (I&O) Measurement', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['intake', 'output', 'i&o', 'fluid'] },
  { id: '50-146-25', code: '50-146-25', title: 'Medication Pass', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['medication', 'med pass', 'administration'] },
  { id: '50-145-25', code: '50-145-25', title: 'Medication Self-Administration Assistance', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['self-administration', 'medication', 'independence'] },
  { id: '50-141-25', code: '50-141-25', title: 'Administering an ECG/EKG', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['ecg', 'ekg', 'cardiac', 'heart'] },
  { id: '50-140-25', code: '50-140-25', title: 'Indwelling Urinary Catheter Insertion', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['catheter', 'insertion', 'foley', 'urinary'] },
  { id: '50-139-25', code: '50-139-25', title: 'Obtaining a Sputum Specimen', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['sputum', 'specimen', 'respiratory'] },
  { id: '50-138-25', code: '50-138-25', title: 'Obtaining a Wound Culture', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['wound', 'culture', 'specimen'] },
  { id: '50-137-25', code: '50-137-25', title: 'Oxygen Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['oxygen', 'o2', 'respiratory', 'administration'] },
  { id: '50-136-25', code: '50-136-25', title: 'Wound Dressing', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['wound', 'dressing', 'bandage'] },
  { id: '50-135-25', code: '50-135-25', title: 'Wound Dressing with Packing Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['wound', 'packing', 'dressing'] },
  { id: '50-134-25', code: '50-134-25', title: 'Wound Care Assessment Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['wound', 'assessment', 'care'] },
  { id: '50-133-25', code: '50-133-25', title: 'Negative Pressure Wound Therapy (NPWT) – Application and Removal Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['npwt', 'negative pressure', 'wound', 'vac'] },
  { id: '50-132-25', code: '50-132-25', title: 'Implanted Port (Port-a-Cath) Care, Accessing, and Flushing Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['port', 'port-a-cath', 'access', 'flushing'] },
  { id: '50-131-25', code: '50-131-25', title: 'Bowel Sound Assessment Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['bowel', 'sounds', 'assessment', 'gi'] },
  { id: '50-130-25', code: '50-130-25', title: 'Enema Administration Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['enema', 'bowel', 'administration'] },
  { id: '50-129-25', code: '50-129-25', title: 'Midstream Urine Collection Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['urine', 'midstream', 'specimen', 'collection'] },
  { id: '50-128-25', code: '50-128-25', title: 'Peripheral IV (PIV) – IV Fluid Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['iv', 'piv', 'fluid', 'administration'] },
  { id: '50-127-25', code: '50-127-25', title: 'Peripheral IV (PIV) Care – Dressing & Flushing Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['iv', 'piv', 'dressing', 'flushing'] },
  { id: '50-126-25', code: '50-126-25', title: 'Peripheral IV Catheter – Insertion and Removal Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['iv', 'piv', 'insertion', 'catheter'] },
  { id: '50-124-25', code: '50-124-25', title: 'Midline Catheter – Dressing Change', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['midline', 'catheter', 'dressing'] },
  { id: '50-123-25', code: '50-123-25', title: 'Peripherally Inserted Central Catheter (PICC) Line Removal', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['picc', 'removal', 'catheter'] },
  { id: '50-122-25', code: '50-122-25', title: 'Medication Administration via Feeding Tube – Nurse Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['feeding tube', 'medication', 'gtube', 'peg'] },
  { id: '50-121-25', code: '50-121-25', title: 'Nasogastric Tube Feeding Administration – Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['nasogastric', 'ng tube', 'feeding'] },
  { id: '50-119-25', code: '50-119-25', title: 'Central Venous Catheter Care', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['central line', 'cvc', 'catheter'] },
  { id: '50-118-25', code: '50-118-25', title: 'Central Venous Catheter Dressing Change – Application and Removal', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['central line', 'cvc', 'dressing'] },
  { id: '50-074-25', code: '50-074-25', title: 'Responding to Hypoglycemia – Skills Checklist', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['hypoglycemia', 'low blood sugar', 'diabetes', 'glucose'] },
  { id: '50-059-25', code: '50-059-25', title: 'Sharps Handling, Disposal, and Waste Management', disciplines: ['EVS/Housekeeping', 'Nurse'], platform: 'Mastered', keywords: ['sharps', 'disposal', 'waste', 'needle'] },
  { id: '50-055-25', code: '50-055-25', title: 'Focused Neurological Checks', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['neuro', 'neurological', 'assessment'] },
  { id: '50-049-25', code: '50-049-25', title: 'Ventilator Management and Care', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['ventilator', 'vent', 'respiratory'] },
  { id: '50-017-25', code: '50-017-25', title: 'Musculoskeletal Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['musculoskeletal', 'msk', 'assessment'] },
  { id: '50-015-25', code: '50-015-25', title: 'Hypertension Monitoring & Antihypertensive Medication Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['hypertension', 'blood pressure', 'antihypertensive'] },
  { id: '50-014-25', code: '50-014-25', title: 'Insulin Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['insulin', 'diabetes', 'injection'] },
  { id: '50-012-25', code: '50-012-25', title: 'Hypertension Assessment', disciplines: ['Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['hypertension', 'blood pressure', 'assessment'] },
  { id: '50-011-25', code: '50-011-25', title: 'High Alert Medication Administration', disciplines: ['Med Tech', 'Nurse'], platform: 'Mastered', keywords: ['high alert', 'medication', 'safety'] },
  { id: '50-003-25', code: '50-003-25', title: 'Psychosocial Needs Assessment', disciplines: ['Nurse', 'Social Services'], platform: 'Mastered', keywords: ['psychosocial', 'mental health', 'assessment'] },
  { id: '50-026-25', code: '50-026-25', title: 'Tracheostomy Care and Suctioning', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['tracheostomy', 'trach', 'suctioning', 'airway'] },
  { id: '50-036-25', code: '50-036-25', title: 'CAUTI Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['cauti', 'catheter', 'urinary', 'infection'] },
  { id: '50-035-25', code: '50-035-25', title: 'Urinary and Bowel Evaluation', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['urinary', 'bowel', 'evaluation', 'incontinence'] },
  { id: '50-033-25', code: '50-033-25', title: 'Trauma-Informed Care Risk Assessment', disciplines: ['Nurse', 'Social Services'], platform: 'Mastered', keywords: ['trauma', 'informed care', 'risk'] },
  { id: '50-030-25', code: '50-030-25', title: 'Smoking Risk Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['smoking', 'tobacco', 'risk'] },
  { id: '50-029-25', code: '50-029-25', title: 'Skin Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['skin', 'assessment', 'pressure', 'wound'] },
  { id: '50-028-25', code: '50-028-25', title: 'Sepsis Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['sepsis', 'infection', 'assessment'] },
  { id: '50-069-25', code: '50-069-25', title: 'Active Range of Motion (AROM) – Upper and Lower Extremities', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['range of motion', 'arom', 'exercise'] },
  { id: '50-025-25', code: '50-025-25', title: 'Nebulizer Therapy', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['nebulizer', 'respiratory', 'therapy'] },
  { id: '50-024-25', code: '50-024-25', title: 'CPAP', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['cpap', 'sleep apnea', 'respiratory'] },
  { id: '50-023-25', code: '50-023-25', title: 'Respiratory Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['respiratory', 'assessment', 'lung'] },
  { id: '50-022-25', code: '50-022-25', title: 'Administering Immunizations', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['immunization', 'vaccine', 'injection'] },
  { id: '50-020-25', code: '50-020-25', title: 'Pain Management', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['pain', 'management', 'assessment'] },
  { id: '50-018-25', code: '50-018-25', title: 'Neurological Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['neuro', 'neurological', 'assessment'] },
  { id: '50-016-25', code: '50-016-25', title: 'Medication Management', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['medication', 'management', 'administration'] },
  { id: '50-013-25', code: '50-013-25', title: 'Injection Practices', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['injection', 'safety', 'sharps'] },
  { id: '50-009-25', code: '50-009-25', title: 'Genitourinary Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['gu', 'genitourinary', 'urinary', 'assessment'] },
  { id: '50-008-25', code: '50-008-25', title: 'Glucometer Testing, Control, and Cleaning/Disinfection', disciplines: ['Nurse', 'QMA'], platform: 'Mastered', keywords: ['glucometer', 'glucose', 'testing', 'control'] },
  { id: '50-005-25', code: '50-005-25', title: 'Gastrointestinal (GI) Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['gi', 'gastrointestinal', 'assessment', 'bowel'] },
  { id: '50-287-25', code: '50-287-25', title: 'Sepsis Recognition and Management', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['sepsis', 'recognition', 'management'] },
  { id: '50-280-25', code: '50-280-25', title: 'Fluid Restriction - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['fluid restriction', 'intake', 'limit'] },
  { id: '50-278-25', code: '50-278-25', title: 'Dialysis Monitoring – Pre- and Post-Treatment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['dialysis', 'monitoring', 'renal'] },
  { id: '50-277-25', code: '50-277-25', title: 'Dialysis', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['dialysis', 'renal', 'kidney'] },
  { id: '50-276-25', code: '50-276-25', title: 'Fall Risk Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['fall', 'risk', 'assessment', 'safety'] },
  { id: '50-274-25', code: '50-274-25', title: 'Enteral Feeding', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['enteral', 'feeding', 'tube', 'nutrition'] },
  { id: '50-273-25', code: '50-273-25', title: 'Fluid Volume Status Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['fluid', 'volume', 'dehydration', 'overload'] },
  { id: '50-272-25', code: '50-272-25', title: 'Risk Management Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['risk', 'management', 'assessment'] },
  { id: '50-270-25', code: '50-270-25', title: 'Suicide Risk Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['suicide', 'risk', 'mental health'] },
  { id: '50-269-25', code: '50-269-25', title: 'SBAR Communication', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['sbar', 'communication', 'handoff'] },
  { id: '50-268-25', code: '50-268-25', title: 'Oral Cavity Assessment - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['oral', 'mouth', 'assessment'] },
  { id: '50-267-25', code: '50-267-25', title: 'Cardiac Assessment - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['cardiac', 'heart', 'assessment'] },
  { id: '50-265-25', code: '50-265-25', title: 'COPD - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['copd', 'respiratory', 'lung'] },
  { id: '50-264-25', code: '50-264-25', title: 'Ears, Eyes, Nose, Throat (EENT) Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['eent', 'ears', 'eyes', 'nose', 'throat'] },
  { id: '50-263-25', code: '50-263-25', title: 'Congestive Heart Failure (CHF) - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['chf', 'heart failure', 'cardiac'] },
  { id: '50-261-25', code: '50-261-25', title: 'Naloxone Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['naloxone', 'narcan', 'overdose', 'opioid'] },
  { id: '50-241-25', code: '50-241-25', title: 'Wrapping an Extremity with ACE Bandage', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['ace', 'bandage', 'wrap', 'extremity'] },
  { id: '50-234-25', code: '50-234-25', title: 'Measuring and Recording Food Intake', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['food', 'intake', 'nutrition', 'eating'] },
  { id: '50-227-25', code: '50-227-25', title: 'Clean Dressing Change', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['dressing', 'wound', 'clean'] },
  { id: '50-217-25', code: '50-217-25', title: 'Total Parenteral Nutrition (TPN) Administration (with Additives)', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['tpn', 'parenteral', 'nutrition', 'iv'] },
  { id: '50-213-25', code: '50-213-25', title: 'Oral and Nasopharyngeal Suctioning', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['suctioning', 'oral', 'nasopharyngeal', 'airway'] },
  { id: '50-208-25', code: '50-208-25', title: 'Insulin Pen Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['insulin', 'pen', 'diabetes'] },
  { id: '50-207-25', code: '50-207-25', title: 'Stroke Alert', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['stroke', 'cva', 'neuro', 'alert'] },
  { id: '50-203-25', code: '50-203-25', title: 'BiPAP', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['bipap', 'respiratory', 'breathing'] },
  { id: '50-201-25', code: '50-201-25', title: 'Indwelling Urinary Catheter Removal', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['catheter', 'foley', 'removal', 'urinary'] },
  { id: '50-200-25', code: '50-200-25', title: 'Indwelling Urinary Catheter Maintenance, Flushing, and Specimen Collection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['catheter', 'foley', 'maintenance', 'flushing'] },
  { id: '50-199-25', code: '50-199-25', title: 'Texas Catheter / Condom Catheter Application, Maintenance, and Removal', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['texas catheter', 'condom catheter', 'external'] },
  { id: '50-198-25', code: '50-198-25', title: 'Total Parenteral Nutrition (TPN) Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['tpn', 'parenteral', 'nutrition'] },
  { id: '50-193-25', code: '50-193-25', title: 'Suprapubic Catheter Maintenance and Specimen Collection', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['suprapubic', 'catheter', 'specimen'] },
  { id: '50-191-25', code: '50-191-25', title: 'Bowel Toileting Program Evaluation', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['bowel', 'toileting', 'program'] },
  { id: '50-190-25', code: '50-190-25', title: 'Record and Report Care Provided – Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['record', 'report', 'documentation'] },
  { id: '50-189-25', code: '50-189-25', title: 'Record and Report Condition Changes - Nurse', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['record', 'report', 'condition', 'documentation'] },
  { id: '50-188-25', code: '50-188-25', title: 'Administering Tube Feeding - Bolus/Gravity or Pump', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['tube feeding', 'bolus', 'pump', 'enteral'] },
  { id: '50-187-25', code: '50-187-25', title: 'Nasogastric Tube Placement and Removal', disciplines: ['RN'], platform: 'Mastered', keywords: ['ng tube', 'nasogastric', 'placement'] },
  { id: '50-186-25', code: '50-186-25', title: 'Nasogastric Tube Medication Administration', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['ng tube', 'nasogastric', 'medication'] },
  { id: '50-184-25', code: '50-184-25', title: 'Jackson Pratt (JP) Drain Care', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['jp drain', 'jackson pratt', 'drain'] },
  { id: '50-179-25', code: '50-179-25', title: 'PleurX Drain Care', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['pleurx', 'drain', 'pleural'] },
  { id: '50-176-25', code: '50-176-25', title: 'Accessing and Flushing a Central Venous Catheter', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['central line', 'cvc', 'flushing'] },
  { id: '50-175-25', code: '50-175-25', title: 'PICC Line Dressing Change', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['picc', 'dressing', 'change'] },
  { id: '50-174-25', code: '50-174-25', title: 'Accessing and Flushing PICC Line', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['picc', 'flushing', 'access'] },
  { id: '50-173-25', code: '50-173-25', title: 'Administering Medications through a PICC Line', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['picc', 'medication', 'iv'] },
  { id: '50-172-25', code: '50-172-25', title: 'Blood Collection through a PICC Line', disciplines: ['RN'], platform: 'Mastered', keywords: ['picc', 'blood', 'collection'] },
  { id: '50-046-25', code: '50-046-25', title: 'Assessment of Feeding Tube', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['feeding tube', 'assessment', 'gtube', 'peg'] },
  { id: '50-019-25', code: '50-019-25', title: 'Oral Health Assessment', disciplines: ['Nurse'], platform: 'Mastered', keywords: ['oral', 'mouth', 'dental', 'assessment'] },
  { id: '50-058-25', code: '50-058-25', title: 'Response to Choking', disciplines: ['Nurse', 'All Staff'], platform: 'Mastered', keywords: ['choking', 'heimlich', 'airway', 'obstruction'] },
  
  // CC (Clinical Competency) Platform entries for Nurses
  { id: '50-097-25', code: '50-097-25', title: 'CC-Point Click Care-MDS', disciplines: ['Nurse'], platform: 'C', keywords: ['pcc', 'mds', 'documentation'] },
  { id: '50-091-25', code: '50-091-25', title: 'CC- Gastrostomy Feeding Tube', disciplines: ['Nurse'], platform: 'C', keywords: ['gtube', 'gastrostomy', 'feeding'] },
  { id: '50-099-25', code: '50-099-25', title: 'CC-Point Click Care-Order Writing', disciplines: ['Nurse'], platform: 'C', keywords: ['pcc', 'orders', 'documentation'] },
  { id: '50-093-25', code: '50-093-25', title: 'CC-Transferring A Resident With The Use Of The Mechanical Lift', disciplines: ['Nurse'], platform: 'C', keywords: ['mechanical lift', 'transfer'] },
  { id: '50-094-25', code: '50-094-25', title: 'CC-Nasopharyngeal and Oral Phararyngeal Suctioning', disciplines: ['Nurse'], platform: 'C', keywords: ['suctioning', 'nasopharyngeal', 'oral'] },
  { id: '50-096-25', code: '50-096-25', title: 'CC-Point Click Care-Progress Notes', disciplines: ['Nurse'], platform: 'C', keywords: ['pcc', 'progress notes', 'documentation'] },
  { id: '50-095-25', code: '50-095-25', title: 'CC-Point Click Care-UDAs', disciplines: ['Nurse'], platform: 'C', keywords: ['pcc', 'uda', 'documentation'] },
  { id: '50-098-25', code: '50-098-25', title: 'CC-Point Click Care-ADT/Dashboard', disciplines: ['Nurse'], platform: 'C', keywords: ['pcc', 'adt', 'dashboard'] },
  { id: '50-101-25', code: '50-101-25', title: 'CC-Blood Glucose Monitoring', disciplines: ['Nurse'], platform: 'C', keywords: ['glucose', 'blood sugar', 'diabetes'] },
  { id: '50-092-25', code: '50-092-25', title: 'CC-Clean Dressing', disciplines: ['Nurse'], platform: 'C', keywords: ['dressing', 'wound', 'clean'] },
  { id: '50-100-25', code: '50-100-25', title: 'CC-Colostomy – Ileostomy Care', disciplines: ['Nurse'], platform: 'C', keywords: ['colostomy', 'ileostomy', 'ostomy'] },
  { id: '50-090-25', code: '50-090-25', title: 'CC-Handwashing Competency', disciplines: ['Nurse'], platform: 'C', keywords: ['handwashing', 'hand hygiene', 'infection control'] },
  { id: '50-088-25', code: '50-088-25', title: 'CC-Tracheostomy Care', disciplines: ['Nurse'], platform: 'C', keywords: ['tracheostomy', 'trach', 'airway'] },
  { id: '50-089-25', code: '50-089-25', title: 'CC-MedPass', disciplines: ['Nurse'], platform: 'C', keywords: ['medication', 'med pass', 'administration'] },
  
  // RN/LPN Orientation
  { id: '50-291-25', code: '50-291-25', title: 'CC-Orientation Checklist: RN Supervisor', disciplines: ['RN'], platform: 'C', keywords: ['orientation', 'rn', 'supervisor'] },
  { id: '50-290-25', code: '50-290-25', title: 'CC-Orientation Checklist- Licensed Nurse', disciplines: ['LPN'], platform: 'C', keywords: ['orientation', 'lpn', 'licensed'] },
  
  // Infection Control / PPE
  { id: 'ppe-donning-01', code: 'PPE-DON-01', title: 'PPE Donning (Gown, Gloves, Mask, Eye Protection)', disciplines: ['CNA', 'Nurse', 'All Staff'], platform: 'Mastered', keywords: ['ppe', 'donning', 'gown', 'gloves', 'mask', 'eye protection', 'infection control'] },
  { id: 'ppe-doffing-01', code: 'PPE-DOFF-01', title: 'PPE Doffing (Safe Removal Sequence)', disciplines: ['CNA', 'Nurse', 'All Staff'], platform: 'Mastered', keywords: ['ppe', 'doffing', 'removal', 'sequence', 'infection control', 'contamination'] },
  { id: 'hh-who-moments', code: 'HH-WHO-01', title: 'Hand Hygiene - WHO 5 Moments', disciplines: ['CNA', 'Nurse', 'All Staff'], platform: 'Mastered', keywords: ['hand hygiene', 'handwashing', 'who', '5 moments', 'infection control'] },
  { id: 'isolation-precautions', code: 'ISO-01', title: 'Transmission-Based Precautions (Contact, Droplet, Airborne)', disciplines: ['CNA', 'Nurse', 'All Staff'], platform: 'Mastered', keywords: ['isolation', 'precautions', 'contact', 'droplet', 'airborne', 'transmission', 'infection control'] },
  { id: 'ebp-triggers', code: 'EBP-01', title: 'Enhanced Barrier Precautions (EBP) Application', disciplines: ['CNA', 'Nurse'], platform: 'Mastered', keywords: ['ebp', 'enhanced barrier', 'mdro', 'precautions', 'high contact'] },
];

/**
 * Find competencies that match a given issue/topic text
 */
export function findMatchingCompetencies(issueText: string, topicText: string = ''): CompetencySkill[] {
  const searchText = `${issueText} ${topicText}`.toLowerCase();
  const words = searchText.split(/\s+/).filter(w => w.length > 2);
  
  const scored = COMPETENCY_LIBRARY.map(comp => {
    let score = 0;
    
    // Check title match
    const titleLower = comp.title.toLowerCase();
    words.forEach(word => {
      if (titleLower.includes(word)) score += 2;
    });
    
    // Check keyword matches
    comp.keywords.forEach(kw => {
      words.forEach(word => {
        if (kw.includes(word) || word.includes(kw)) score += 3;
      });
      // Exact keyword match
      if (searchText.includes(kw)) score += 5;
    });
    
    return { comp, score };
  });
  
  // Return top matches with score > 0, sorted by score
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.comp);
}

/**
 * Format competencies for notes field
 */
export function formatCompetenciesForNotes(competencies: CompetencySkill[]): string {
  if (competencies.length === 0) return '';
  
  const lines = [
    '📋 RECOMMENDED COMPETENCY VALIDATION (MASTERED.IT):',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ''
  ];
  
  competencies.forEach((comp, idx) => {
    const platform = comp.platform === 'C' ? 'Clinical Comp' : 'Mastered';
    lines.push(`${idx + 1}. [${comp.code}] ${comp.title}`);
    lines.push(`   Disciplines: ${comp.disciplines.join(', ')} | Platform: ${platform}`);
    lines.push('');
  });
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('Assign above competencies in MASTERED.IT for validation.');
  
  return lines.join('\n');
}
