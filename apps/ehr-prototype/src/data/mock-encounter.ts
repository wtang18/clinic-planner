/**
 * Mock Encounter Data — MA Handoff
 *
 * Static fixture simulating a Medical Assistant's pre-visit work:
 * vitals, chief complaint, HPI, allergy confirmations, and medication
 * reconciliation. All items have `source: { type: 'maHandoff' }` and
 * `_meta.reviewed: false` so the provider can review them.
 */

import type { ChartItem, ItemSource } from '../types/chart-items';
import type { PatientContext, AllergySummary } from '../types/patient';
import type { EncounterMeta, VisitMeta } from '../types/encounter';
import type { EncounterAction } from '../state/actions/types';
import type { User } from '../state/types';

// ============================================================================
// Users
// ============================================================================

export const MA_USER: User = {
  id: 'user-ma-sarah',
  name: 'Sarah K.',
  role: 'ma',
  credentials: ['MA'],
};

export const PROVIDER_USER: User = {
  id: 'user-dr-chen',
  name: 'Dr. Chen',
  role: 'provider',
  credentials: ['MD'],
  npi: '1234567890',
};

// ============================================================================
// Patient
// ============================================================================

export const MOCK_PATIENT: PatientContext = {
  id: 'patient-001',
  mrn: 'MRN-2024-001',
  demographics: {
    firstName: 'James',
    lastName: 'Wilson',
    dateOfBirth: new Date('1968-03-15'),
    age: 57,
    gender: 'male',
  },
  contact: {
    phone: '(555) 234-5678',
    email: 'j.wilson@email.com',
  },
  insurance: {
    primary: {
      payerId: 'BCBS-001',
      payerName: 'Blue Cross Blue Shield',
      memberId: 'BCBS-98765',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', status: 'active', onsetDate: new Date('2019-06-01') },
      { description: 'Essential Hypertension', icdCode: 'I10', status: 'active', onsetDate: new Date('2018-01-15') },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Tylenol Extra Strength', dosage: '500mg', frequency: 'PRN', status: 'active' },
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'rash', severity: 'mild' },
      { allergen: 'Sulfa', reaction: 'anaphylaxis', severity: 'severe' },
      { allergen: 'Aspirin', reaction: 'GI upset', severity: 'moderate' },
    ],
    recentEncounters: [
      { date: new Date('2025-11-20'), type: 'Follow-up', chiefComplaint: 'Diabetes management', provider: 'Dr. Chen' },
    ],
  },
};

// ============================================================================
// Encounter + Visit
// ============================================================================

export const MOCK_ENCOUNTER: EncounterMeta = {
  id: 'enc-2026-0218-001',
  status: 'in-progress',
  type: 'urgent-care',
  scheduledAt: new Date(),
  startedAt: new Date(),
  facility: { id: 'fac-main', name: 'Carbon Health — Downtown', address: { line1: '123 Market St', city: 'San Francisco', state: 'CA', zip: '94105' } },
  room: 'Exam 3',
};

export const MOCK_VISIT: VisitMeta = {
  chiefComplaint: 'Cough x 5 days',
  visitReason: 'New complaint',
  scheduledDuration: 20,
  serviceType: 'Insurance',
};

// ============================================================================
// MA Handoff Items
// ============================================================================

export const MA_SOURCE: ItemSource = { type: 'maHandoff' };
const MA_ACTOR = 'Sarah K. (MA)';
const NOW = new Date();

export function maItem(overrides: Partial<ChartItem> & { id: string; category: ChartItem['category']; displayText: string }): ChartItem {
  const base = {
    createdAt: NOW,
    createdBy: { id: MA_USER.id, name: MA_USER.name, role: 'ma' as const },
    modifiedAt: NOW,
    modifiedBy: { id: MA_USER.id, name: MA_USER.name, role: 'ma' as const },
    source: MA_SOURCE,
    status: 'confirmed' as const,
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{
      timestamp: NOW,
      action: 'created',
      actor: MA_ACTOR,
      details: `Documented during MA intake`,
    }],
    _meta: {
      syncStatus: 'synced' as const,
      aiGenerated: false,
      requiresReview: false,
      reviewed: false, // Provider hasn't reviewed yet
    },
  };

  return { ...base, ...overrides } as unknown as ChartItem;
}

export const MA_HANDOFF_ITEMS: ChartItem[] = [
  // 1. Vitals
  maItem({
    id: 'ma-vitals-001',
    category: 'vitals',
    displayText: 'BP 128/82 \u00B7 HR 78 \u00B7 Temp 99.1\u00B0F \u00B7 SpO2 98%',
    data: {
      measurements: [
        { type: 'bp-systolic', value: 128, unit: 'mmHg', flag: 'normal' },
        { type: 'bp-diastolic', value: 82, unit: 'mmHg', flag: 'normal' },
        { type: 'pulse', value: 78, unit: 'bpm', flag: 'normal' },
        { type: 'temp', value: 99.1, unit: '\u00B0F', flag: 'high' },
        { type: 'spo2', value: 98, unit: '%', flag: 'normal' },
      ],
      capturedAt: NOW,
      position: 'sitting',
    },
  } as Partial<ChartItem> & { id: string; category: 'vitals'; displayText: string }),

  // 2. Chief Complaint
  maItem({
    id: 'ma-cc-001',
    category: 'chief-complaint',
    displayText: 'Cough x 5 days, productive, worse at night',
    data: { text: 'Cough x 5 days, productive, worse at night', format: 'plain' },
  } as Partial<ChartItem> & { id: string; category: 'chief-complaint'; displayText: string }),

  // 3. HPI
  maItem({
    id: 'ma-hpi-001',
    category: 'hpi',
    displayText: 'Onset 5 days ago, productive yellow sputum, tried OTC Robitussin without relief. Worse at night, no hemoptysis. Low-grade fever at home. No SOB at rest.',
    data: {
      text: 'Onset 5 days ago, productive yellow sputum, tried OTC Robitussin without relief. Worse at night, no hemoptysis. Low-grade fever at home. No SOB at rest.',
      format: 'plain',
    },
  } as Partial<ChartItem> & { id: string; category: 'hpi'; displayText: string }),

  // 4. Allergy confirmation: Penicillin
  maItem({
    id: 'ma-allergy-pcn',
    category: 'allergy',
    displayText: 'Penicillin — rash (mild)',
    displaySubtext: 'Confirmed active',
    data: {
      allergen: 'Penicillin',
      allergenType: 'drug',
      reaction: 'rash',
      severity: 'mild',
      reportedBy: 'patient',
      verificationStatus: 'confirmed',
    },
  } as Partial<ChartItem> & { id: string; category: 'allergy'; displayText: string }),

  // 5. Allergy confirmation: Sulfa
  maItem({
    id: 'ma-allergy-sulfa',
    category: 'allergy',
    displayText: 'Sulfa — anaphylaxis (severe)',
    displaySubtext: 'Confirmed active',
    data: {
      allergen: 'Sulfa',
      allergenType: 'drug',
      reaction: 'anaphylaxis',
      severity: 'severe',
      reportedBy: 'patient',
      verificationStatus: 'confirmed',
    },
  } as Partial<ChartItem> & { id: string; category: 'allergy'; displayText: string }),

  // 6. Med reconciliation: Metformin
  maItem({
    id: 'ma-med-metformin',
    category: 'medication',
    displayText: 'Metformin 500mg BID',
    displaySubtext: 'Confirmed active',
    data: {
      drugName: 'Metformin',
      dosage: '500 mg',
      route: 'PO',
      frequency: 'BID',
      duration: 'ongoing',
      isControlled: false,
      prescriptionType: 'refill',
      reportedBy: 'patient',
      verificationStatus: 'verified',
    },
  } as Partial<ChartItem> & { id: string; category: 'medication'; displayText: string }),

  // 7. Med reconciliation: Lisinopril
  maItem({
    id: 'ma-med-lisinopril',
    category: 'medication',
    displayText: 'Lisinopril 10mg daily',
    displaySubtext: 'Confirmed active',
    data: {
      drugName: 'Lisinopril',
      dosage: '10 mg',
      route: 'PO',
      frequency: 'daily',
      duration: 'ongoing',
      isControlled: false,
      prescriptionType: 'refill',
      reportedBy: 'patient',
      verificationStatus: 'verified',
    },
  } as Partial<ChartItem> & { id: string; category: 'medication'; displayText: string }),

  // 8. Med reconciliation: Tylenol
  maItem({
    id: 'ma-med-tylenol',
    category: 'medication',
    displayText: 'Tylenol Extra Strength 500mg PRN',
    displaySubtext: 'Confirmed active',
    data: {
      drugName: 'Acetaminophen',
      genericName: 'Acetaminophen',
      dosage: '500 mg',
      route: 'PO',
      frequency: 'PRN',
      duration: 'ongoing',
      isControlled: false,
      prescriptionType: 'refill',
      reportedBy: 'patient',
      verificationStatus: 'verified',
    },
  } as Partial<ChartItem> & { id: string; category: 'medication'; displayText: string }),
];

// ============================================================================
// Scenario-Aware Item Builder
// ============================================================================

interface VitalsInput {
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  temp: number;
  tempFlag?: 'normal' | 'high' | 'low';
  spo2: number;
}

/**
 * Build MA handoff items from patient data and visit context.
 * Generates vitals, CC, HPI, allergy confirmations, and med reconciliation
 * based on the actual patient clinical summary.
 */
export function buildMAItemsForPatient(
  patient: PatientContext,
  visit: VisitMeta,
  vitals: VitalsInput,
  hpiText?: string,
): ChartItem[] {
  const items: ChartItem[] = [];
  let idCounter = 1;
  const nextId = (prefix: string) => `ma-${prefix}-${String(idCounter++).padStart(3, '0')}`;

  // 1. Vitals
  const bpFlag = vitals.bpSystolic >= 140 || vitals.bpDiastolic >= 90 ? 'high' : 'normal';
  items.push(maItem({
    id: nextId('vitals'),
    category: 'vitals',
    displayText: `BP ${vitals.bpSystolic}/${vitals.bpDiastolic} \u00B7 HR ${vitals.pulse} \u00B7 Temp ${vitals.temp}\u00B0F \u00B7 SpO2 ${vitals.spo2}%`,
    data: {
      measurements: [
        { type: 'bp-systolic', value: vitals.bpSystolic, unit: 'mmHg', flag: bpFlag },
        { type: 'bp-diastolic', value: vitals.bpDiastolic, unit: 'mmHg', flag: bpFlag },
        { type: 'pulse', value: vitals.pulse, unit: 'bpm', flag: 'normal' },
        { type: 'temp', value: vitals.temp, unit: '\u00B0F', flag: vitals.tempFlag ?? 'normal' },
        { type: 'spo2', value: vitals.spo2, unit: '%', flag: 'normal' },
      ],
      capturedAt: NOW,
      position: 'sitting',
    },
  } as Partial<ChartItem> & { id: string; category: 'vitals'; displayText: string }));

  // 2. Chief Complaint
  const ccText = visit.chiefComplaint ?? 'General visit';
  items.push(maItem({
    id: nextId('cc'),
    category: 'chief-complaint',
    displayText: ccText,
    data: { text: ccText, format: 'plain' },
  } as Partial<ChartItem> & { id: string; category: 'chief-complaint'; displayText: string }));

  // 3. HPI (if provided)
  if (hpiText) {
    items.push(maItem({
      id: nextId('hpi'),
      category: 'hpi',
      displayText: hpiText,
      data: { text: hpiText, format: 'plain' },
    } as Partial<ChartItem> & { id: string; category: 'hpi'; displayText: string }));
  }

  // 4. Allergy confirmations (from patient clinical summary)
  const allergies = patient.clinicalSummary?.allergies ?? [];
  for (const allergy of allergies) {
    items.push(maItem({
      id: nextId('allergy'),
      category: 'allergy',
      displayText: `${allergy.allergen} \u2014 ${allergy.reaction ?? 'unknown'} (${allergy.severity})`,
      displaySubtext: 'Confirmed active',
      data: {
        allergen: allergy.allergen,
        allergenType: 'drug',
        reaction: (allergy.reaction ?? 'unknown').toLowerCase(),
        severity: allergy.severity,
        reportedBy: 'patient',
        verificationStatus: 'confirmed',
      },
    } as Partial<ChartItem> & { id: string; category: 'allergy'; displayText: string }));
  }

  // 5. Medication reconciliation (from patient clinical summary)
  const medications = patient.clinicalSummary?.medications ?? [];
  for (const med of medications) {
    items.push(maItem({
      id: nextId('med'),
      category: 'medication',
      displayText: `${med.name} ${med.dosage} ${med.frequency}`,
      displaySubtext: 'Confirmed active',
      data: {
        drugName: med.name,
        dosage: med.dosage,
        route: 'PO',
        frequency: med.frequency,
        duration: 'ongoing',
        isControlled: false,
        prescriptionType: 'refill',
        reportedBy: 'patient',
        verificationStatus: 'verified',
      },
    } as Partial<ChartItem> & { id: string; category: 'medication'; displayText: string }));
  }

  return items;
}

// ============================================================================
// Loader
// ============================================================================

/**
 * Load the mock MA handoff into the encounter store.
 * Dispatches ENCOUNTER_OPENED + ITEM_ADDED for each MA item.
 */
export function loadMockEncounter(
  dispatch: (action: EncounterAction) => void,
): void {
  // Open the encounter
  dispatch({
    type: 'ENCOUNTER_OPENED',
    payload: {
      encounterId: MOCK_ENCOUNTER.id,
      patient: MOCK_PATIENT,
      encounter: MOCK_ENCOUNTER,
      visit: MOCK_VISIT,
    },
  });

  // Add each MA item
  for (const item of MA_HANDOFF_ITEMS) {
    dispatch({
      type: 'ITEM_ADDED',
      payload: {
        item,
        source: MA_SOURCE,
      },
    });
  }
}
