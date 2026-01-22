/**
 * Patient context types
 */

import type { Address, ClinicalStatus } from './common';

/** Full patient record with demographics, contact, insurance, clinical summary */
export interface PatientContext {
  id: string;
  mrn: string; // Medical Record Number
  
  demographics: Demographics;
  contact?: ContactInfo;
  insurance?: InsuranceContext;
  clinicalSummary?: ClinicalSummary;
}

/** Patient demographics */
export interface Demographics {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredName?: string;
  pronouns?: string;
}

/** Patient contact information */
export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: Address;
}

/** Insurance information context */
export interface InsuranceContext {
  primary?: InsuranceInfo;
  secondary?: InsuranceInfo;
}

/** Insurance plan details */
export interface InsuranceInfo {
  payerId: string;
  payerName: string;
  memberId: string;
  groupNumber?: string;
  planType?: string;
}

/** Clinical summary for patient context */
export interface ClinicalSummary {
  problemList: ProblemListItem[];
  medications: MedicationSummary[];
  allergies: AllergySummary[];
  recentEncounters: EncounterSummary[];
}

/** Problem list item (diagnosis) */
export interface ProblemListItem {
  description: string;
  icdCode: string;
  status: ClinicalStatus;
  onsetDate?: Date;
}

/** Medication summary for patient context */
export interface MedicationSummary {
  name: string;
  dosage: string;
  frequency: string;
  status: 'active' | 'discontinued';
}

/** Allergy summary for patient context */
export interface AllergySummary {
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
}

/** Encounter summary for recent history */
export interface EncounterSummary {
  date: Date;
  type: string;
  chiefComplaint?: string;
  provider: string;
}
