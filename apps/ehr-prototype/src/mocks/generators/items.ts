/**
 * Chart item generators
 */

import type {
  ChartItem,
  MedicationItem,
  LabItem,
  DiagnosisItem,
  VitalsItem,
  PhysicalExamItem,
  ItemCategory,
  ItemSource,
  ExamSystem,
  VitalMeasurement,
  UserReference,
} from '../../types';
import { generateItemId } from './ids';

const DEFAULT_USER: UserReference = {
  id: 'user-default',
  name: 'Dr. Provider',
  role: 'provider',
};

const DEFAULT_SOURCE: ItemSource = { type: 'manual' };

/**
 * Create base item fields
 */
function createBaseItem(
  category: ItemCategory,
  displayText: string,
  overrides?: Partial<ChartItem>
): Omit<ChartItem, 'data' | 'actions'> {
  const now = new Date();
  return {
    id: generateItemId(),
    category,
    createdAt: now,
    createdBy: DEFAULT_USER,
    modifiedAt: now,
    modifiedBy: DEFAULT_USER,
    source: DEFAULT_SOURCE,
    status: 'confirmed',
    displayText,
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{
      timestamp: now,
      action: 'created',
      actor: DEFAULT_USER.name,
    }],
    _meta: {
      syncStatus: 'synced',
      aiGenerated: false,
      requiresReview: false,
      reviewed: true,
    },
    ...overrides,
  } as Omit<ChartItem, 'data' | 'actions'>;
}

/**
 * Generate a medication item
 */
export function generateMedicationItem(
  overrides?: Partial<MedicationItem>
): MedicationItem {
  const base = createBaseItem('medication', 'Metformin 500mg PO BID');
  return {
    ...base,
    category: 'medication',
    data: {
      drugName: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500mg',
      route: 'PO',
      frequency: 'BID',
      quantity: 60,
      refills: 3,
      isControlled: false,
      prescriptionType: 'new',
    },
    actions: ['e-prescribe', 'print'],
    ...overrides,
  } as MedicationItem;
}

/**
 * Generate a lab item
 */
export function generateLabItem(overrides?: Partial<LabItem>): LabItem {
  const base = createBaseItem('lab', 'CBC');
  return {
    ...base,
    category: 'lab',
    data: {
      testName: 'Complete Blood Count',
      testCode: '58410-2',
      panelName: 'CBC',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
    ...overrides,
  } as LabItem;
}

/**
 * Generate a diagnosis item
 */
export function generateDiagnosisItem(
  overrides?: Partial<DiagnosisItem>
): DiagnosisItem {
  const base = createBaseItem('diagnosis', 'Type 2 diabetes mellitus');
  return {
    ...base,
    category: 'diagnosis',
    data: {
      description: 'Type 2 diabetes mellitus',
      icdCode: 'E11.9',
      type: 'chronic',
      clinicalStatus: 'active',
    },
    ...overrides,
  } as DiagnosisItem;
}

/**
 * Generate a vitals item
 */
export function generateVitalsItem(overrides?: Partial<VitalsItem>): VitalsItem {
  const base = createBaseItem('vitals', 'Vitals: BP 120/80, HR 72');
  const measurements: VitalMeasurement[] = [
    { type: 'bp-systolic', value: 120, unit: 'mmHg' },
    { type: 'bp-diastolic', value: 80, unit: 'mmHg' },
    { type: 'pulse', value: 72, unit: 'bpm' },
    { type: 'temp', value: 98.6, unit: '°F' },
    { type: 'resp', value: 16, unit: '/min' },
    { type: 'spo2', value: 98, unit: '%' },
  ];
  return {
    ...base,
    category: 'vitals',
    data: {
      measurements,
      capturedAt: new Date(),
      position: 'sitting',
    },
    ...overrides,
  } as VitalsItem;
}

/**
 * Generate a physical exam item
 */
export function generatePhysicalExamItem(
  system: ExamSystem,
  overrides?: Partial<PhysicalExamItem>
): PhysicalExamItem {
  const findings: Record<ExamSystem, { finding: string; isNormal: boolean }> = {
    general: { finding: 'Well-appearing, no acute distress', isNormal: true },
    heent: { finding: 'NCAT, PERRLA, TMs clear, oropharynx normal', isNormal: true },
    neck: { finding: 'Supple, no lymphadenopathy', isNormal: true },
    cardiovascular: { finding: 'RRR, no murmurs', isNormal: true },
    respiratory: { finding: 'Clear to auscultation bilaterally', isNormal: true },
    gi: { finding: 'Soft, non-tender, non-distended', isNormal: true },
    gu: { finding: 'Deferred', isNormal: true },
    musculoskeletal: { finding: 'Normal ROM, no edema', isNormal: true },
    skin: { finding: 'No rashes or lesions', isNormal: true },
    neurological: { finding: 'Alert, oriented x3, CN II-XII intact', isNormal: true },
    psychiatric: { finding: 'Normal mood and affect', isNormal: true },
  };

  const { finding, isNormal } = findings[system];
  const base = createBaseItem('physical-exam', `${system}: ${finding}`);

  return {
    ...base,
    category: 'physical-exam',
    data: {
      system,
      finding,
      isNormal,
    },
    ...overrides,
  } as PhysicalExamItem;
}

// ============================================================================
// Common Item Templates
// ============================================================================

export const ITEM_TEMPLATES = {
  // Medications
  benzonatate: generateMedicationItem({
    displayText: 'Benzonatate 100mg PO TID PRN cough',
    data: {
      drugName: 'Benzonatate',
      genericName: 'Benzonatate',
      dosage: '100mg',
      route: 'PO',
      frequency: 'TID PRN',
      duration: '7 days',
      quantity: 21,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  }),

  metformin: generateMedicationItem({
    displayText: 'Metformin 500mg PO BID',
    data: {
      drugName: 'Metformin',
      genericName: 'Metformin HCl',
      rxNorm: '860975',
      dosage: '500mg',
      route: 'PO',
      frequency: 'BID',
      quantity: 60,
      refills: 3,
      isControlled: false,
      prescriptionType: 'refill',
    },
  }),

  lisinopril: generateMedicationItem({
    displayText: 'Lisinopril 10mg PO daily',
    data: {
      drugName: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      route: 'PO',
      frequency: 'daily',
      quantity: 30,
      refills: 3,
      isControlled: false,
      prescriptionType: 'refill',
    },
  }),

  // Labs
  cbc: generateLabItem({
    displayText: 'CBC',
    data: {
      testName: 'Complete Blood Count',
      testCode: '58410-2',
      panelName: 'CBC',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  }),

  cmp: generateLabItem({
    displayText: 'CMP',
    data: {
      testName: 'Comprehensive Metabolic Panel',
      testCode: '24323-8',
      panelName: 'CMP',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  }),

  a1c: generateLabItem({
    displayText: 'Hemoglobin A1C',
    data: {
      testName: 'Hemoglobin A1c',
      testCode: '4548-4',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  }),

  rapidFlu: generateLabItem({
    displayText: 'Rapid Influenza A/B',
    data: {
      testName: 'Rapid Influenza A/B',
      testCode: '80382-5',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  }),

  rapidCovid: generateLabItem({
    displayText: 'Rapid COVID-19 Antigen',
    data: {
      testName: 'SARS-CoV-2 Antigen',
      testCode: '94558-4',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  }),

  // Diagnoses
  acuteBronchitis: generateDiagnosisItem({
    displayText: 'Acute bronchitis',
    data: {
      description: 'Acute bronchitis',
      icdCode: 'J20.9',
      type: 'encounter',
      ranking: 'primary',
      clinicalStatus: 'active',
    },
  }),

  typetwoDiabetes: generateDiagnosisItem({
    displayText: 'Type 2 diabetes mellitus',
    data: {
      description: 'Type 2 diabetes mellitus',
      icdCode: 'E11.9',
      type: 'chronic',
      clinicalStatus: 'active',
    },
  }),

  essentialHypertension: generateDiagnosisItem({
    displayText: 'Essential hypertension',
    data: {
      description: 'Essential hypertension',
      icdCode: 'I10',
      type: 'chronic',
      clinicalStatus: 'active',
    },
  }),
} as const;
