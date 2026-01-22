/**
 * Care Gap Generators
 * Creates mock care gap definitions and instances for testing
 */

import {
  CareGapDefinition,
  CareGapInstance,
  CareGapCategory,
  CareGapStatus,
} from '../../types';
import { generateId } from './ids';

// ============================================================================
// Care Gap Definition Generators
// ============================================================================

export function generateCareGapDefinition(
  overrides: Partial<CareGapDefinition> = {}
): CareGapDefinition {
  return {
    id: generateId('gap-def'),
    name: 'Test Care Gap',
    category: 'preventive',
    description: 'A test care gap definition',
    eligibility: {
      ageRange: { min: 18, max: 75 },
    },
    frequency: {
      interval: 'annual',
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'lab-result',
      testCodes: ['12345-6'],
      withinDays: 365,
    },
    priority: 'routine',
    actionLabel: 'Order test',
    ...overrides,
  };
}

// ============================================================================
// Care Gap Instance Generators
// ============================================================================

export function generateCareGapInstance(
  overrides: Partial<CareGapInstance> = {}
): CareGapInstance {
  const now = new Date();
  const definitionId = overrides.definitionId || generateId('gap-def');

  return {
    id: generateId('gap'),
    definitionId,
    patientId: generateId('patient'),
    status: 'open',
    openedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    closureAttempts: [],
    excluded: false,
    addressedThisEncounter: false,
    encounterActions: [],
    _display: {
      name: 'Test Care Gap',
      category: 'preventive',
      priority: 'routine',
      actionLabel: 'Order test',
    },
    ...overrides,
  };
}

// ============================================================================
// Standard Care Gap Definitions
// ============================================================================

export const CARE_GAP_DEFINITIONS: Record<string, CareGapDefinition> = {
  dmA1c: {
    id: 'gap-def-dm-a1c',
    name: 'Diabetes: A1C Monitoring',
    category: 'diabetes',
    description: 'A1C test within measurement year for diabetic patients',
    eligibility: {
      diagnoses: ['E11.%', 'E10.%'],
      ageRange: { min: 18, max: 75 },
    },
    frequency: {
      interval: 'biannual',
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'lab-result',
      testCodes: ['4548-4'],
      withinDays: 180,
    },
    qualityMeasure: {
      measureSet: 'HEDIS',
      measureId: 'CDC',
      measureYear: 2024,
    },
    priority: 'important',
    actionLabel: 'Order A1C',
  },

  breastCancerScreening: {
    id: 'gap-def-bcs',
    name: 'Breast Cancer Screening',
    category: 'cancer-screening',
    description: 'Mammogram within 2 years for eligible women',
    eligibility: {
      gender: ['female'],
      ageRange: { min: 50, max: 74 },
      excludeDiagnoses: ['Z90.1%'],
    },
    frequency: {
      interval: 'custom',
      customDays: 730,
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'imaging',
      studyTypes: ['mammogram', 'breast-mri'],
      withinDays: 730,
      requiresResult: true,
    },
    qualityMeasure: {
      measureSet: 'HEDIS',
      measureId: 'BCS',
      measureYear: 2024,
    },
    priority: 'important',
    patientFacingName: 'Mammogram',
    actionLabel: 'Schedule mammogram',
  },

  colorectalScreening: {
    id: 'gap-def-col',
    name: 'Colorectal Cancer Screening',
    category: 'cancer-screening',
    description: 'Colonoscopy, FIT, or other approved screening',
    eligibility: {
      ageRange: { min: 45, max: 75 },
      excludeDiagnoses: ['Z90.49'],
    },
    frequency: {
      interval: 'custom',
      customDays: 365,
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'composite',
      operator: 'or',
      criteria: [
        {
          type: 'procedure',
          cptCodes: ['45378', '45380', '45381', '45384', '45385'],
          withinDays: 3650,
        },
        {
          type: 'lab-result',
          testCodes: ['57905-2'],
          resultCriteria: { operator: 'exists' },
          withinDays: 365,
        },
      ],
    },
    qualityMeasure: {
      measureSet: 'HEDIS',
      measureId: 'COL',
      measureYear: 2024,
    },
    priority: 'important',
    actionLabel: 'Order screening',
  },

  depressionScreening: {
    id: 'gap-def-phq9',
    name: 'Depression Screening & Follow-up',
    category: 'mental-health',
    description: 'PHQ-9 screening with follow-up plan if positive',
    eligibility: {
      ageRange: { min: 12 },
    },
    frequency: {
      interval: 'annual',
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'composite',
      operator: 'or',
      criteria: [
        {
          type: 'assessment',
          assessmentType: 'PHQ-9',
          scoreCriteria: { operator: 'lt', value: 5 },
          withinDays: 365,
        },
        {
          type: 'composite',
          operator: 'and',
          criteria: [
            {
              type: 'assessment',
              assessmentType: 'PHQ-9',
              scoreCriteria: { operator: 'gte', value: 5 },
              withinDays: 365,
            },
            {
              type: 'encounter',
              encounterTypes: ['mental-health-followup', 'psychiatry'],
              withinDays: 365,
            },
          ],
        },
      ],
    },
    priority: 'routine',
    actionLabel: 'Administer PHQ-9',
  },

  fluVaccine: {
    id: 'gap-def-flu',
    name: 'Annual Flu Vaccine',
    category: 'immunization',
    description: 'Seasonal influenza vaccination',
    eligibility: {
      ageRange: { min: 6 },
    },
    frequency: {
      interval: 'annual',
      anchorDate: 'birth',
    },
    closureCriteria: {
      type: 'immunization',
      cvxCodes: ['141', '150', '155', '161'],
      withinDays: 365,
    },
    priority: 'routine',
    patientFacingName: 'Flu Shot',
    actionLabel: 'Administer flu vaccine',
  },

  bpControl: {
    id: 'gap-def-bp',
    name: 'Blood Pressure Control',
    category: 'hypertension',
    description: 'BP reading for hypertensive patients',
    eligibility: {
      diagnoses: ['I10', 'I11.%', 'I12.%', 'I13.%'],
      ageRange: { min: 18, max: 85 },
    },
    frequency: {
      interval: 'quarterly',
      anchorDate: 'last-closure',
    },
    closureCriteria: {
      type: 'encounter',
      encounterTypes: ['office-visit', 'telehealth', 'follow-up'],
      withinDays: 90,
    },
    qualityMeasure: {
      measureSet: 'HEDIS',
      measureId: 'CBP',
      measureYear: 2024,
    },
    priority: 'important',
    actionLabel: 'Check BP',
  },
};

// ============================================================================
// Care Gap Instance Templates for Scenarios
// ============================================================================

export const CARE_GAP_TEMPLATES = {
  // For UC Cough scenario - healthy adult with no chronic conditions
  ucCoughPatient: [
    generateCareGapInstance({
      id: 'gap-flu-001',
      definitionId: CARE_GAP_DEFINITIONS.fluVaccine.id,
      status: 'open',
      _display: {
        name: 'Annual Flu Vaccine',
        category: 'immunization',
        priority: 'routine',
        actionLabel: 'Administer flu vaccine',
        dueLabel: 'Due Oct 2024',
      },
    }),
  ],

  // For PC Diabetes scenario - diabetic patient with multiple gaps
  pcDiabetesPatient: [
    generateCareGapInstance({
      id: 'gap-a1c-001',
      definitionId: CARE_GAP_DEFINITIONS.dmA1c.id,
      status: 'open',
      dueBy: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // Overdue
      _display: {
        name: 'Diabetes: A1C Monitoring',
        category: 'diabetes',
        priority: 'important',
        actionLabel: 'Order A1C',
        dueLabel: 'Overdue by 45 days',
      },
    }),
    generateCareGapInstance({
      id: 'gap-eye-001',
      definitionId: 'gap-def-eye-exam',
      status: 'open',
      dueBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
      _display: {
        name: 'Diabetic Eye Exam',
        category: 'diabetes',
        priority: 'important',
        actionLabel: 'Refer ophthalmology',
        dueLabel: 'Due in 30 days',
      },
    }),
    generateCareGapInstance({
      id: 'gap-col-001',
      definitionId: CARE_GAP_DEFINITIONS.colorectalScreening.id,
      status: 'open',
      _display: {
        name: 'Colorectal Cancer Screening',
        category: 'cancer-screening',
        priority: 'important',
        actionLabel: 'Order screening',
        dueLabel: 'Due this year',
      },
    }),
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function generateCareGapsForPatient(
  patientId: string,
  template: keyof typeof CARE_GAP_TEMPLATES
): CareGapInstance[] {
  return CARE_GAP_TEMPLATES[template].map((gap) => ({
    ...gap,
    id: generateId('gap'),
    patientId,
  }));
}

export function createClosureAttempt(
  itemId: string,
  itemType: string,
  result: 'success' | 'pending' | 'failed' = 'pending'
) {
  return {
    attemptedAt: new Date(),
    itemId,
    itemType,
    result,
  };
}
