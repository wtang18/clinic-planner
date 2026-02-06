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
// Re-exports from Central Patient Registry
// ============================================================================

// Import from the central patient data registry
export {
  PATIENT_LAUREN_SVENDSEN as PATIENT_UC_COUGH,
  PATIENT_ROBERT_MARTINEZ as PATIENT_PC_DIABETES,
  PATIENT_REGISTRY,
  getPatientByMrn,
  getPatientById,
  getAllPatients,
} from '../../scenarios/patientData';

// For backwards compatibility with existing code
import {
  PATIENT_LAUREN_SVENDSEN,
  PATIENT_ROBERT_MARTINEZ,
  PATIENT_DANTE_P,
} from '../../scenarios/patientData';

/**
 * Healthy adult - 30yo with no significant history
 * Note: Dante P. is now the "healthy-ish" adult template
 */
export const PATIENT_HEALTHY_ADULT: PatientContext = PATIENT_DANTE_P;

/**
 * Geriatric patient - keeping original definition as it's not in To-Do
 */
export const PATIENT_GERIATRIC: PatientContext = {
  id: 'pt-geriatric-001',
  mrn: '10101010',
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
  ucCough: PATIENT_LAUREN_SVENDSEN,
  pcDiabetes: PATIENT_ROBERT_MARTINEZ,
  healthyAdult: PATIENT_HEALTHY_ADULT,
  geriatric: PATIENT_GERIATRIC,
} as const;
