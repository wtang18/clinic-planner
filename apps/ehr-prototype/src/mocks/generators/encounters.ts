/**
 * Encounter Generators
 * Creates mock encounter contexts for testing scenarios
 */

import {
  EncounterMeta,
  VisitMeta,
  PatientContext,
  UserReference,
  FacilityReference,
} from '../../types';
import { generateId } from './ids';
import { generatePatient, PATIENT_TEMPLATES } from './patients';

// ============================================================================
// Encounter Meta Generators
// ============================================================================

export function generateEncounterMeta(
  overrides: Partial<EncounterMeta> = {}
): EncounterMeta {
  const now = new Date();

  return {
    id: generateId('enc'),
    status: 'in-progress',
    type: 'office-visit',
    scheduledAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
    startedAt: now,
    ...overrides,
  };
}

export function generateVisitMeta(
  overrides: Partial<VisitMeta> = {}
): VisitMeta {
  return {
    chiefComplaint: 'General visit',
    scheduledDuration: 15,
    serviceType: 'Insurance',
    ...overrides,
  };
}

// ============================================================================
// Provider and Facility Generators
// ============================================================================

export function generateProvider(
  overrides: Partial<UserReference> = {}
): UserReference {
  return {
    id: generateId('user'),
    name: 'Dr. Sarah Chen',
    role: 'provider',
    ...overrides,
  };
}

export function generateFacility(
  overrides: Partial<FacilityReference> = {}
): FacilityReference {
  return {
    id: generateId('facility'),
    name: 'Carbon Health - Downtown',
    type: 'clinic',
    address: {
      line1: '123 Health Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
    },
    phone: '(415) 555-0100',
    fax: '(415) 555-0101',
    ...overrides,
  };
}

// ============================================================================
// Complete Encounter Context
// ============================================================================

export interface EncounterContext {
  encounter: EncounterMeta;
  visit: VisitMeta;
  patient: PatientContext;
  provider: UserReference;
  facility: FacilityReference;
}

export function generateEncounterContext(
  overrides: Partial<EncounterContext> = {}
): EncounterContext {
  return {
    encounter: generateEncounterMeta(),
    visit: generateVisitMeta(),
    patient: generatePatient(),
    provider: generateProvider(),
    facility: generateFacility(),
    ...overrides,
  };
}

// ============================================================================
// Encounter Templates for Visit Scenarios
// ============================================================================

export const ENCOUNTER_TEMPLATES = {
  /**
   * UC Cough Scenario
   * 35-year-old with productive cough x 5 days
   * Urgent care visit, self-pay
   */
  ucCough: (): EncounterContext => {
    const now = new Date();

    return {
      encounter: generateEncounterMeta({
        id: 'enc-uc-cough-001',
        type: 'urgent-care',
        specialty: 'urgent-care',
        status: 'in-progress',
        scheduledAt: new Date(now.getTime() - 10 * 60 * 1000),
        startedAt: now,
      }),
      visit: generateVisitMeta({
        chiefComplaint: 'Cough x 5 days',
        visitReason: 'Productive cough, worse at night, mild congestion',
        scheduledDuration: 15,
        serviceType: 'Self Pay',
      }),
      patient: PATIENT_TEMPLATES.ucCough,
      provider: generateProvider({
        id: 'provider-chen',
        name: 'Dr. Sarah Chen',
        role: 'provider',
      }),
      facility: generateFacility({
        id: 'facility-uc-sf',
        name: 'Carbon Health - Urgent Care SF',
        type: 'clinic',
      }),
    };
  },

  /**
   * PC Diabetes Scenario
   * 58-year-old with Type 2 DM, HTN - quarterly follow-up
   * Primary care visit, insurance
   */
  pcDiabetes: (): EncounterContext => {
    const now = new Date();

    return {
      encounter: generateEncounterMeta({
        id: 'enc-pc-dm-001',
        type: 'follow-up',
        specialty: 'primary-care',
        status: 'in-progress',
        scheduledAt: new Date(now.getTime() - 5 * 60 * 1000),
        startedAt: now,
      }),
      visit: generateVisitMeta({
        chiefComplaint: 'Diabetes follow-up',
        visitReason: 'Quarterly DM/HTN management, med refills',
        scheduledDuration: 30,
        serviceType: 'Insurance',
      }),
      patient: PATIENT_TEMPLATES.pcDiabetes,
      provider: generateProvider({
        id: 'provider-patel',
        name: 'Dr. Arun Patel',
        role: 'provider',
      }),
      facility: generateFacility({
        id: 'facility-pc-oak',
        name: 'Carbon Health - Primary Care Oakland',
        type: 'clinic',
      }),
    };
  },

  /**
   * Annual Wellness Visit
   * 45-year-old healthy adult, routine checkup
   */
  annualWellness: (): EncounterContext => {
    const now = new Date();

    return {
      encounter: generateEncounterMeta({
        id: 'enc-awv-001',
        type: 'annual-wellness',
        specialty: 'primary-care',
        status: 'in-progress',
        scheduledAt: new Date(now.getTime() - 10 * 60 * 1000),
        startedAt: now,
      }),
      visit: generateVisitMeta({
        chiefComplaint: 'Annual wellness visit',
        visitReason: 'Routine health maintenance',
        scheduledDuration: 45,
        serviceType: 'Insurance',
      }),
      patient: PATIENT_TEMPLATES.healthyAdult,
      provider: generateProvider({
        id: 'provider-kim',
        name: 'Dr. Jennifer Kim',
        role: 'provider',
      }),
      facility: generateFacility({
        id: 'facility-pc-sf',
        name: 'Carbon Health - Primary Care SF',
        type: 'clinic',
      }),
    };
  },

  /**
   * Telehealth Follow-up
   * Remote visit for chronic condition management
   */
  telehealth: (): EncounterContext => {
    const now = new Date();

    return {
      encounter: generateEncounterMeta({
        id: 'enc-tele-001',
        type: 'telehealth',
        specialty: 'primary-care',
        status: 'in-progress',
        scheduledAt: now,
        startedAt: now,
      }),
      visit: generateVisitMeta({
        chiefComplaint: 'Medication refill',
        visitReason: 'Chronic disease management - video visit',
        scheduledDuration: 15,
        serviceType: 'Insurance',
      }),
      patient: PATIENT_TEMPLATES.pcDiabetes,
      provider: generateProvider({
        id: 'provider-jones',
        name: 'Dr. Michael Jones',
        role: 'provider',
      }),
      facility: generateFacility({
        id: 'facility-virtual',
        name: 'Carbon Health - Virtual Care',
        type: 'clinic',
      }),
    };
  },

  /**
   * Geriatric Visit
   * 72-year-old with multiple chronic conditions
   */
  geriatric: (): EncounterContext => {
    const now = new Date();

    return {
      encounter: generateEncounterMeta({
        id: 'enc-geriatric-001',
        type: 'follow-up',
        specialty: 'primary-care',
        status: 'in-progress',
        scheduledAt: new Date(now.getTime() - 15 * 60 * 1000),
        startedAt: now,
      }),
      visit: generateVisitMeta({
        chiefComplaint: 'Multiple chronic condition management',
        visitReason: 'CHF, COPD, Type 2 DM follow-up',
        scheduledDuration: 45,
        serviceType: 'Medicare',
      }),
      patient: PATIENT_TEMPLATES.geriatric,
      provider: generateProvider({
        id: 'provider-martinez',
        name: 'Dr. Carmen Martinez',
        role: 'provider',
      }),
      facility: generateFacility({
        id: 'facility-pc-sj',
        name: 'Carbon Health - Primary Care San Jose',
        type: 'clinic',
      }),
    };
  },
};

// ============================================================================
// Encounter Lifecycle Helpers
// ============================================================================

export function checkInEncounter(encounter: EncounterMeta): EncounterMeta {
  return {
    ...encounter,
    status: 'checked-in',
  };
}

export function startEncounter(encounter: EncounterMeta): EncounterMeta {
  return {
    ...encounter,
    status: 'in-progress',
    startedAt: new Date(),
  };
}

export function completeEncounter(encounter: EncounterMeta): EncounterMeta {
  return {
    ...encounter,
    status: 'complete',
    endedAt: new Date(),
  };
}

export function signEncounter(
  encounter: EncounterMeta,
  signedBy: UserReference
): EncounterMeta {
  return {
    ...encounter,
    status: 'signed',
    signedAt: new Date(),
    signedBy,
  };
}

export function cancelEncounter(encounter: EncounterMeta): EncounterMeta {
  return {
    ...encounter,
    status: 'cancelled',
  };
}

// ============================================================================
// Staff Templates
// ============================================================================

export const STAFF_TEMPLATES = {
  providers: [
    generateProvider({ id: 'prov-chen', name: 'Dr. Sarah Chen' }),
    generateProvider({ id: 'prov-patel', name: 'Dr. Arun Patel' }),
    generateProvider({ id: 'prov-kim', name: 'Dr. Jennifer Kim' }),
    generateProvider({ id: 'prov-jones', name: 'Dr. Michael Jones' }),
    generateProvider({ id: 'prov-martinez', name: 'Dr. Carmen Martinez' }),
  ],

  nurses: [
    { id: 'nurse-johnson', name: 'Maria Johnson, RN', role: 'nurse' as const },
    { id: 'nurse-williams', name: 'James Williams, RN', role: 'nurse' as const },
  ],

  medicalAssistants: [
    { id: 'ma-garcia', name: 'Ana Garcia, MA', role: 'ma' as const },
    { id: 'ma-lee', name: 'David Lee, MA', role: 'ma' as const },
  ],
};

export const FACILITY_TEMPLATES = {
  urgentCareSF: generateFacility({
    id: 'fac-uc-sf',
    name: 'Carbon Health - Urgent Care SF',
    type: 'clinic',
    address: { line1: '100 Market St', city: 'San Francisco', state: 'CA', zip: '94102' },
  }),

  primaryCareSF: generateFacility({
    id: 'fac-pc-sf',
    name: 'Carbon Health - Primary Care SF',
    type: 'clinic',
    address: { line1: '200 Van Ness Ave', city: 'San Francisco', state: 'CA', zip: '94109' },
  }),

  primaryCareOakland: generateFacility({
    id: 'fac-pc-oak',
    name: 'Carbon Health - Primary Care Oakland',
    type: 'clinic',
    address: { line1: '300 Broadway', city: 'Oakland', state: 'CA', zip: '94607' },
  }),

  virtualCare: generateFacility({
    id: 'fac-virtual',
    name: 'Carbon Health - Virtual Care',
    type: 'clinic',
  }),
};
