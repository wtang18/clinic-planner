/**
 * Patient Data Registry
 *
 * Central repository of patient data for all To-Do items and scenarios.
 * Ensures consistent patient records that To-Do items and scenarios can share.
 */

import type { PatientContext } from '../types';

// ============================================================================
// Patient Templates
// ============================================================================

/**
 * UC Cough patient - 42yo F with HTN, DM, presenting with cough
 * Used in: UC Cough scenario, To-Do chart sign-off
 */
export const PATIENT_LAUREN_SVENDSEN: PatientContext = {
  id: 'pt-uc-001',
  mrn: '12345678',
  demographics: {
    firstName: 'Lauren',
    lastName: 'Svendsen',
    dateOfBirth: new Date('1983-06-15'),
    age: 42,
    gender: 'female',
    pronouns: 'she/her',
  },
  insurance: {
    primary: {
      payerId: 'SELF',
      payerName: 'Self Pay',
      memberId: 'N/A',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Hypothyroidism', icdCode: 'E03.9', status: 'active' },
      { description: 'Prediabetes', icdCode: 'R73.03', status: 'active' },
      { description: 'High cholesterol', icdCode: 'E78.00', status: 'active' },
      { description: 'Family history of breast cancer', icdCode: 'Z80.3', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Tylenol Extra Strength', dosage: '500mg', frequency: 'PRN', status: 'active' },
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'Rash', severity: 'mild' },
      { allergen: 'Sulfa', reaction: 'Anaphylaxis', severity: 'severe' },
    ],
    recentEncounters: [
      {
        date: new Date('2024-02-27'),
        type: 'Urgent Care',
        chiefComplaint: 'Pinky finger injury',
        provider: 'Dr. Smith',
      },
    ],
  },
};

/**
 * PC Diabetes patient - 58yo M with DM, HTN, hyperlipidemia
 * Used in: PC Diabetes scenario, To-Do care adherence
 */
export const PATIENT_ROBERT_MARTINEZ: PatientContext = {
  id: 'pt-pc-001',
  mrn: '87654321',
  demographics: {
    firstName: 'Robert',
    lastName: 'Martinez',
    dateOfBirth: new Date('1967-03-22'),
    age: 58,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'BCBS',
      payerName: 'Blue Cross Blue Shield',
      memberId: 'XYZ123456',
      groupNumber: 'GRP001',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active', onsetDate: new Date('2018-05-01') },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active', onsetDate: new Date('2015-01-15') },
      { description: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
      { description: 'Obesity', icdCode: 'E66.9', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '20mg', frequency: 'daily', status: 'active' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-07-15'),
        type: 'Follow-up',
        chiefComplaint: 'Diabetes follow-up',
        provider: 'Dr. Johnson',
      },
    ],
  },
};

/**
 * Dante P. - 31yo M with back pain history
 * Used in: To-Do tasks, inbox faxes
 */
export const PATIENT_DANTE_P: PatientContext = {
  id: 'pt-003',
  mrn: '11111111',
  demographics: {
    firstName: 'Dante',
    lastName: 'Patterson',
    dateOfBirth: new Date('1993-04-12'),
    age: 31,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'AETNA',
      payerName: 'Aetna',
      memberId: 'AET789456',
      planType: 'HMO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Low back pain', icdCode: 'M54.5', status: 'active' },
      { description: 'Anxiety disorder', icdCode: 'F41.9', status: 'active' },
    ],
    medications: [
      { name: 'Ibuprofen', dosage: '800mg', frequency: 'TID PRN', status: 'active' },
      { name: 'Sertraline', dosage: '50mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-09-15'),
        type: 'Office Visit',
        chiefComplaint: 'Back pain follow-up',
        provider: 'Dr. Anderson',
      },
    ],
  },
};

/**
 * Barbara K. - 58yo F with hypertension, needs lab follow-up
 * Used in: To-Do tasks, messages, care adherence
 */
export const PATIENT_BARBARA_K: PatientContext = {
  id: 'pt-004',
  mrn: '22222222',
  demographics: {
    firstName: 'Barbara',
    lastName: 'Kowalski',
    dateOfBirth: new Date('1966-08-30'),
    age: 58,
    gender: 'female',
  },
  insurance: {
    primary: {
      payerId: 'MEDICARE',
      payerName: 'Medicare',
      memberId: '1EG4-TE5-MK72',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
      { description: 'Osteoporosis', icdCode: 'M81.0', status: 'active' },
    ],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'daily', status: 'active' },
      { name: 'Rosuvastatin', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Calcium + Vitamin D', dosage: '600mg/400IU', frequency: 'BID', status: 'active' },
    ],
    allergies: [
      { allergen: 'Aspirin', reaction: 'GI upset', severity: 'moderate' },
    ],
    recentEncounters: [
      {
        date: new Date('2024-09-10'),
        type: 'Lab Visit',
        chiefComplaint: 'Annual labs',
        provider: 'Lab Tech',
      },
    ],
  },
};

/**
 * Carlos E. - 42yo M with diabetes, needs Rx adjustment
 * Used in: To-Do rx-requests, messages
 */
export const PATIENT_CARLOS_E: PatientContext = {
  id: 'pt-005',
  mrn: '33333333',
  demographics: {
    firstName: 'Carlos',
    lastName: 'Espinoza',
    dateOfBirth: new Date('1982-11-05'),
    age: 42,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'UNITED',
      payerName: 'UnitedHealthcare',
      memberId: 'U123456789',
      groupNumber: 'CORP100',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Obesity', icdCode: 'E66.9', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Glipizide', dosage: '5mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-08-20'),
        type: 'Follow-up',
        chiefComplaint: 'Diabetes management',
        provider: 'Dr. Patel',
      },
    ],
  },
};

/**
 * Diana L. - 67yo F with multiple conditions, chart sign-off pending
 * Used in: To-Do chart sign-off, inbox faxes, care adherence
 */
export const PATIENT_DIANA_L: PatientContext = {
  id: 'pt-006',
  mrn: '44444444',
  demographics: {
    firstName: 'Diana',
    lastName: 'Liu',
    dateOfBirth: new Date('1957-02-14'),
    age: 67,
    gender: 'female',
  },
  insurance: {
    primary: {
      payerId: 'MEDICARE',
      payerName: 'Medicare',
      memberId: '1EG4-TE5-MK73',
    },
    secondary: {
      payerId: 'BCBS',
      payerName: 'Blue Cross Blue Shield',
      memberId: 'SUPPL456',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Osteoarthritis, knee', icdCode: 'M17.9', status: 'active' },
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'GERD', icdCode: 'K21.0', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'daily', status: 'active' },
      { name: 'Acetaminophen', dosage: '650mg', frequency: 'TID PRN', status: 'active' },
    ],
    allergies: [
      { allergen: 'NSAIDs', reaction: 'GI bleeding', severity: 'severe' },
    ],
    recentEncounters: [
      {
        date: new Date('2024-09-18'),
        type: 'Office Visit',
        chiefComplaint: 'Knee pain',
        provider: 'Paige Anderson, PA-C',
      },
    ],
  },
};

/**
 * Edward M. - 55yo M with annual physical, chart sign-off pending
 * Used in: To-Do chart sign-off, inbox faxes, messages
 */
export const PATIENT_EDWARD_M: PatientContext = {
  id: 'pt-007',
  mrn: '55555555',
  demographics: {
    firstName: 'Edward',
    lastName: 'Mitchell',
    dateOfBirth: new Date('1969-07-22'),
    age: 55,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'CIGNA',
      payerName: 'Cigna',
      memberId: 'CIG567890',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
      { description: 'Prediabetes', icdCode: 'R73.03', status: 'active' },
    ],
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-09-19'),
        type: 'Annual Physical',
        chiefComplaint: 'Annual wellness exam',
        provider: 'Paige Anderson, PA-C',
      },
    ],
  },
};

/**
 * Adam R. - 28yo M with URI symptoms, needs follow-up
 * Used in: To-Do messages, care adherence
 */
export const PATIENT_ADAM_R: PatientContext = {
  id: 'pt-008',
  mrn: '66666666',
  demographics: {
    firstName: 'Adam',
    lastName: 'Rodriguez',
    dateOfBirth: new Date('1996-03-18'),
    age: 28,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'UNITED',
      payerName: 'UnitedHealthcare',
      memberId: 'U987654321',
      planType: 'HMO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Acute upper respiratory infection', icdCode: 'J06.9', status: 'active' },
    ],
    medications: [],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-09-19'),
        type: 'Urgent Care',
        chiefComplaint: 'Cold symptoms',
        provider: 'Dr. Chen',
      },
    ],
  },
};

/**
 * Helen W. - 72yo F with cardiology referral, needs follow-up
 * Used in: To-Do tasks, messages, care adherence
 */
export const PATIENT_HELEN_W: PatientContext = {
  id: 'pt-009',
  mrn: '77777777',
  demographics: {
    firstName: 'Helen',
    lastName: 'Wong',
    dateOfBirth: new Date('1952-12-08'),
    age: 72,
    gender: 'female',
  },
  insurance: {
    primary: {
      payerId: 'MEDICARE',
      payerName: 'Medicare',
      memberId: '1EG4-TE5-MK74',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Atrial fibrillation', icdCode: 'I48.91', status: 'active' },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Heart failure, unspecified', icdCode: 'I50.9', status: 'active' },
    ],
    medications: [
      { name: 'Warfarin', dosage: '5mg', frequency: 'daily', status: 'active' },
      { name: 'Metoprolol', dosage: '50mg', frequency: 'BID', status: 'active' },
      { name: 'Furosemide', dosage: '40mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'Hives', severity: 'moderate' },
    ],
    recentEncounters: [
      {
        date: new Date('2024-09-15'),
        type: 'Follow-up',
        chiefComplaint: 'CHF management',
        provider: 'Dr. Kim',
      },
    ],
  },
};

/**
 * Ivan T. - 45yo M with prior auth pending
 * Used in: To-Do tasks, inbox faxes, messages
 */
export const PATIENT_IVAN_T: PatientContext = {
  id: 'pt-010',
  mrn: '88888888',
  demographics: {
    firstName: 'Ivan',
    lastName: 'Torres',
    dateOfBirth: new Date('1979-09-25'),
    age: 45,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'AETNA',
      payerName: 'Aetna',
      memberId: 'AET321654',
      planType: 'EPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Lumbar disc herniation', icdCode: 'M51.16', status: 'active' },
      { description: 'Chronic pain syndrome', icdCode: 'G89.29', status: 'active' },
    ],
    medications: [
      { name: 'Gabapentin', dosage: '300mg', frequency: 'TID', status: 'active' },
      { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'TID PRN', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-09-18'),
        type: 'Office Visit',
        chiefComplaint: 'Back pain, MRI review',
        provider: 'Paige Anderson, PA-C',
      },
    ],
  },
};

/**
 * Julia S. - 34yo F, new patient intake
 * Used in: To-Do chart review, messages
 */
export const PATIENT_JULIA_S: PatientContext = {
  id: 'pt-011',
  mrn: '99999999',
  demographics: {
    firstName: 'Julia',
    lastName: 'Sanchez',
    dateOfBirth: new Date('1990-06-03'),
    age: 34,
    gender: 'female',
  },
  insurance: {
    primary: {
      payerId: 'KAISER',
      payerName: 'Kaiser Permanente',
      memberId: 'KP123789',
      planType: 'HMO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Anxiety disorder', icdCode: 'F41.9', status: 'active' },
      { description: 'Migraine without aura', icdCode: 'G43.909', status: 'active' },
    ],
    medications: [
      { name: 'Escitalopram', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'PRN migraine', status: 'active' },
    ],
    allergies: [
      { allergen: 'Codeine', reaction: 'Nausea', severity: 'mild' },
    ],
    recentEncounters: [],
  },
};

/**
 * Kevin R. - 62yo M, pending result review
 * Used in: To-Do review results, care adherence
 */
export const PATIENT_KEVIN_R: PatientContext = {
  id: 'pt-012',
  mrn: '00000001',
  demographics: {
    firstName: 'Kevin',
    lastName: 'Reynolds',
    dateOfBirth: new Date('1962-01-17'),
    age: 62,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'BCBS',
      payerName: 'Blue Cross Blue Shield',
      memberId: 'BCBS999888',
      groupNumber: 'RETIRE01',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Chronic kidney disease, stage 2', icdCode: 'N18.2', status: 'active' },
      { description: 'Benign prostatic hyperplasia', icdCode: 'N40.0', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '5mg', frequency: 'daily', status: 'active' },
      { name: 'Tamsulosin', dosage: '0.4mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      {
        date: new Date('2024-09-20'),
        type: 'Lab Visit',
        chiefComplaint: 'CBC and metabolic panel',
        provider: 'Lab Tech',
      },
    ],
  },
};

// ============================================================================
// Patient Registry
// ============================================================================

/**
 * Central registry of all patients, keyed by MRN.
 * Use getPatientByMrn() to look up patient data.
 */
export const PATIENT_REGISTRY: Record<string, PatientContext> = {
  '12345678': PATIENT_LAUREN_SVENDSEN,
  '87654321': PATIENT_ROBERT_MARTINEZ,
  '11111111': PATIENT_DANTE_P,
  '22222222': PATIENT_BARBARA_K,
  '33333333': PATIENT_CARLOS_E,
  '44444444': PATIENT_DIANA_L,
  '55555555': PATIENT_EDWARD_M,
  '66666666': PATIENT_ADAM_R,
  '77777777': PATIENT_HELEN_W,
  '88888888': PATIENT_IVAN_T,
  '99999999': PATIENT_JULIA_S,
  '00000001': PATIENT_KEVIN_R,
};

/**
 * Get patient data by MRN
 */
export function getPatientByMrn(mrn: string): PatientContext | undefined {
  return PATIENT_REGISTRY[mrn];
}

/**
 * Get patient data by ID
 */
export function getPatientById(id: string): PatientContext | undefined {
  return Object.values(PATIENT_REGISTRY).find((p) => p.id === id);
}

/**
 * Get all patients as an array
 */
export function getAllPatients(): PatientContext[] {
  return Object.values(PATIENT_REGISTRY);
}

/**
 * Simple patient reference for To-Do items
 */
export interface ToDoPatientRef {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
}

/**
 * Create a To-Do patient reference from a PatientContext
 */
export function createToDoPatientRef(patient: PatientContext): ToDoPatientRef {
  const { firstName, lastName } = patient.demographics;
  return {
    id: patient.id,
    name: `${firstName} ${lastName.charAt(0)}.`,
    age: patient.demographics.age,
    gender: patient.demographics.gender === 'male' ? 'M' : 'F',
    mrn: patient.mrn,
  };
}

// Pre-built To-Do patient references for convenience
export const TODO_PATIENTS = {
  laurenS: createToDoPatientRef(PATIENT_LAUREN_SVENDSEN),
  robertM: createToDoPatientRef(PATIENT_ROBERT_MARTINEZ),
  danteP: createToDoPatientRef(PATIENT_DANTE_P),
  barbaraK: createToDoPatientRef(PATIENT_BARBARA_K),
  carlosE: createToDoPatientRef(PATIENT_CARLOS_E),
  dianaL: createToDoPatientRef(PATIENT_DIANA_L),
  edwardM: createToDoPatientRef(PATIENT_EDWARD_M),
  adamR: createToDoPatientRef(PATIENT_ADAM_R),
  helenW: createToDoPatientRef(PATIENT_HELEN_W),
  ivanT: createToDoPatientRef(PATIENT_IVAN_T),
  juliaS: createToDoPatientRef(PATIENT_JULIA_S),
  kevinR: createToDoPatientRef(PATIENT_KEVIN_R),
} as const;
