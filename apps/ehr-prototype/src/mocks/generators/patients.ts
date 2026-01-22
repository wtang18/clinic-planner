/**
 * Patient data generators
 */

import type {
  PatientContext,
  Demographics,
  ProblemListItem,
  MedicationSummary,
  AllergySummary,
} from '../../types';
import { generatePatientId, generateMRN } from './ids';

/**
 * Generate demographics
 */
export function generateDemographics(
  overrides?: Partial<Demographics>
): Demographics {
  return {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1980-01-15'),
    age: 44,
    gender: 'male',
    ...overrides,
  };
}

/**
 * Generate a problem list
 */
export function generateProblemList(count: number = 2): ProblemListItem[] {
  const problems: ProblemListItem[] = [
    { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
    { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
    { description: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
    { description: 'Obesity', icdCode: 'E66.9', status: 'active' },
    { description: 'Hypothyroidism', icdCode: 'E03.9', status: 'active' },
  ];
  return problems.slice(0, count);
}

/**
 * Generate a medication list
 */
export function generateMedicationList(count: number = 2): MedicationSummary[] {
  const meds: MedicationSummary[] = [
    { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'daily', status: 'active' },
    { name: 'Levothyroxine', dosage: '50mcg', frequency: 'daily', status: 'active' },
  ];
  return meds.slice(0, count);
}

/**
 * Generate an allergy list
 */
export function generateAllergyList(count: number = 1): AllergySummary[] {
  const allergies: AllergySummary[] = [
    { allergen: 'Penicillin', reaction: 'Rash', severity: 'mild' },
    { allergen: 'Sulfa', reaction: 'Anaphylaxis', severity: 'severe' },
    { allergen: 'Aspirin', reaction: 'GI upset', severity: 'moderate' },
  ];
  return allergies.slice(0, count);
}

/**
 * Generate a patient context
 */
export function generatePatient(
  overrides?: Partial<PatientContext>
): PatientContext {
  return {
    id: generatePatientId(),
    mrn: generateMRN(),
    demographics: generateDemographics(),
    clinicalSummary: {
      problemList: generateProblemList(2),
      medications: generateMedicationList(2),
      allergies: generateAllergyList(1),
      recentEncounters: [],
    },
    ...overrides,
  };
}

// ============================================================================
// Pre-built Patient Templates (matching visit scenarios)
// ============================================================================

/**
 * UC Cough patient - 42yo F with HTN, DM, presenting with cough
 */
export const PATIENT_UC_COUGH: PatientContext = {
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
 */
export const PATIENT_PC_DIABETES: PatientContext = {
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
 * Healthy adult - 30yo with no significant history
 */
export const PATIENT_HEALTHY_ADULT: PatientContext = {
  id: 'pt-healthy-001',
  mrn: '11111111',
  demographics: {
    firstName: 'Emily',
    lastName: 'Chen',
    dateOfBirth: new Date('1994-08-20'),
    age: 30,
    gender: 'female',
  },
  clinicalSummary: {
    problemList: [],
    medications: [],
    allergies: [],
    recentEncounters: [],
  },
};

/**
 * Geriatric patient - 75yo with multiple comorbidities
 */
export const PATIENT_GERIATRIC: PatientContext = {
  id: 'pt-geriatric-001',
  mrn: '99999999',
  demographics: {
    firstName: 'Margaret',
    lastName: 'Wilson',
    dateOfBirth: new Date('1949-12-05'),
    age: 75,
    gender: 'female',
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Chronic kidney disease, stage 3', icdCode: 'N18.3', status: 'active' },
      { description: 'Atrial fibrillation', icdCode: 'I48.91', status: 'active' },
      { description: 'Osteoarthritis', icdCode: 'M19.90', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '5mg', frequency: 'daily', status: 'active' },
      { name: 'Warfarin', dosage: '5mg', frequency: 'daily', status: 'active' },
      { name: 'Acetaminophen', dosage: '650mg', frequency: 'TID PRN', status: 'active' },
    ],
    allergies: [
      { allergen: 'NSAIDs', reaction: 'GI bleeding', severity: 'severe' },
    ],
    recentEncounters: [],
  },
};

/**
 * Patient templates export
 */
export const PATIENT_TEMPLATES = {
  ucCough: PATIENT_UC_COUGH,
  pcDiabetes: PATIENT_PC_DIABETES,
  healthyAdult: PATIENT_HEALTHY_ADULT,
  geriatric: PATIENT_GERIATRIC,
} as const;
