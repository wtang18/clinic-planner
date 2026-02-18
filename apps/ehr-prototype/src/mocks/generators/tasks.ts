/**
 * Background Task Generators
 * Creates mock background tasks and alerts for testing
 */

import {
  BackgroundTask,
  TaskType,
  TaskStatus,
  TaskPriority,
  Alert,
  AlertAction,
  UserReference,
} from '../../types';
import { generateId } from './ids';

// ============================================================================
// Task Generators
// ============================================================================

export function generateTask(
  overrides: Partial<BackgroundTask> = {}
): BackgroundTask {
  const now = new Date();

  return {
    id: generateId('task'),
    type: 'dx-association',
    status: 'queued',
    priority: 'normal',
    trigger: {
      action: 'ITEM_ADDED',
    },
    createdAt: now,
    displayTitle: 'Processing task',
    displayStatus: 'Queued',
    ...overrides,
  };
}

export function generateDxAssociationTask(
  itemId: string,
  itemName: string
): BackgroundTask {
  return generateTask({
    type: 'dx-association',
    trigger: {
      action: 'ITEM_ADDED',
      itemId,
    },
    displayTitle: `Link diagnosis to ${itemName}`,
    displayStatus: 'Finding matching diagnoses...',
  });
}

export function generateDrugInteractionTask(
  itemId: string,
  drugName: string
): BackgroundTask {
  return generateTask({
    type: 'drug-interaction',
    priority: 'high',
    trigger: {
      action: 'ITEM_ADDED',
      itemId,
    },
    displayTitle: `Check interactions for ${drugName}`,
    displayStatus: 'Checking drug database...',
  });
}

export function generateFormularyCheckTask(
  itemId: string,
  drugName: string
): BackgroundTask {
  return generateTask({
    type: 'formulary-check',
    trigger: {
      action: 'ITEM_ADDED',
      itemId,
    },
    displayTitle: `Check formulary for ${drugName}`,
    displayStatus: 'Checking insurance coverage...',
  });
}

export function generatePriorAuthTask(
  itemId: string,
  itemName: string
): BackgroundTask {
  return generateTask({
    type: 'prior-auth-check',
    trigger: {
      action: 'ITEM_ADDED',
      itemId,
    },
    displayTitle: `Check prior auth for ${itemName}`,
    displayStatus: 'Checking authorization requirements...',
  });
}

export function generateNoteGenerationTask(
  encounterId: string
): BackgroundTask {
  return generateTask({
    type: 'note-generation',
    priority: 'low',
    trigger: {
      action: 'SESSION_MODE_CHANGED',
      itemId: encounterId,
    },
    displayTitle: 'Generate visit note',
    displayStatus: 'Compiling documentation...',
  });
}

export function generateValidationTask(
  itemId: string,
  itemType: string
): BackgroundTask {
  return generateTask({
    type: 'validation',
    trigger: {
      action: 'ITEM_MODIFIED',
      itemId,
    },
    displayTitle: `Validate ${itemType}`,
    displayStatus: 'Checking required fields...',
  });
}

// ============================================================================
// Alert Generators
// ============================================================================

export function generateAlert(
  overrides: Partial<Alert> = {}
): Alert {
  return {
    id: generateId('alert'),
    taskId: generateId('task'),
    severity: 'warning',
    title: 'Alert',
    message: 'Test alert message',
    actions: [],
    requiresAcknowledgment: false,
    createdAt: new Date(),
    ...overrides,
  };
}

export function generateDrugInteractionAlert(
  taskId: string,
  drug1: string,
  drug2: string,
  severity: 'mild' | 'moderate' | 'severe'
): Alert {
  const alertSeverity = severity === 'severe' ? 'critical' : 'warning';

  return generateAlert({
    taskId,
    severity: alertSeverity,
    title: 'Drug Interaction Detected',
    message: `${drug1} + ${drug2}: ${getInteractionMessage(severity)}`,
    actions: [
      {
        label: 'Acknowledge',
        action: 'ALERT_ACKNOWLEDGED',
        style: 'primary',
      },
      {
        label: 'Cancel Medication',
        action: 'ITEM_REMOVED',
        style: 'danger',
      },
      {
        label: 'View Details',
        action: 'SHOW_INTERACTION_DETAILS',
        style: 'secondary',
      },
    ],
    requiresAcknowledgment: severity === 'severe',
  });
}

export function generatePriorAuthRequiredAlert(
  taskId: string,
  itemName: string
): Alert {
  return generateAlert({
    taskId,
    severity: 'info',
    title: 'Prior Authorization Required',
    message: `${itemName} requires prior authorization from the insurance company.`,
    actions: [
      {
        label: 'Start PA Request',
        action: 'START_PRIOR_AUTH',
        style: 'primary',
      },
      {
        label: 'Use Alternative',
        action: 'SHOW_ALTERNATIVES',
        style: 'secondary',
      },
      {
        label: 'Dismiss',
        action: 'ALERT_DISMISSED',
        style: 'secondary',
      },
    ],
    requiresAcknowledgment: false,
  });
}

export function generateFormularyAlert(
  taskId: string,
  drugName: string,
  tier: number,
  copay: number
): Alert {
  return generateAlert({
    taskId,
    severity: 'info',
    title: 'Formulary Information',
    message: `${drugName}: Tier ${tier}, Est. copay $${copay}`,
    actions: [
      {
        label: 'Continue',
        action: 'ALERT_ACKNOWLEDGED',
        style: 'primary',
      },
      {
        label: 'View Alternatives',
        action: 'SHOW_FORMULARY_ALTERNATIVES',
        style: 'secondary',
      },
    ],
    requiresAcknowledgment: false,
  });
}

function getInteractionMessage(severity: 'mild' | 'moderate' | 'severe'): string {
  switch (severity) {
    case 'severe':
      return 'Serious interaction - may cause significant harm. Consider alternatives.';
    case 'moderate':
      return 'Moderate interaction - monitor closely and adjust dosing if needed.';
    case 'mild':
      return 'Minor interaction - generally safe but monitor for side effects.';
  }
}

// ============================================================================
// Task Templates for Scenarios
// ============================================================================

export const TASK_TEMPLATES = {
  // Standard tasks after adding a medication
  medicationAdded: (itemId: string, drugName: string): BackgroundTask[] => [
    generateDxAssociationTask(itemId, drugName),
    generateDrugInteractionTask(itemId, drugName),
    generateFormularyCheckTask(itemId, drugName),
  ],

  // Standard tasks after adding a lab order
  labAdded: (itemId: string, testName: string): BackgroundTask[] => [
    generateDxAssociationTask(itemId, testName),
    {
      ...generateTask({
        type: 'care-gap-evaluation',
        trigger: { action: 'ITEM_ADDED', itemId },
        displayTitle: `Check care gaps for ${testName}`,
        displayStatus: 'Evaluating care gap closure...',
      }),
    },
  ],

  // Standard tasks after adding imaging order
  imagingAdded: (itemId: string, studyName: string): BackgroundTask[] => [
    generateDxAssociationTask(itemId, studyName),
    generatePriorAuthTask(itemId, studyName),
  ],

  // Standard tasks after adding a referral
  referralAdded: (itemId: string, specialty: string): BackgroundTask[] => [
    generateDxAssociationTask(itemId, `${specialty} referral`),
    generatePriorAuthTask(itemId, `${specialty} referral`),
  ],

  // Standard tasks after adding a procedure
  procedureAdded: (itemId: string, procedureName: string): BackgroundTask[] => [
    generateDxAssociationTask(itemId, procedureName),
  ],

  // Tasks for completing an encounter
  encounterCompletion: (encounterId: string): BackgroundTask[] => [
    generateNoteGenerationTask(encounterId),
    generateTask({
      type: 'validation',
      trigger: { action: 'SESSION_MODE_CHANGED', itemId: encounterId },
      displayTitle: 'Validate encounter completeness',
      displayStatus: 'Checking required documentation...',
    }),
  ],
};

// ============================================================================
// Task State Helpers
// ============================================================================

export function startTask(task: BackgroundTask): BackgroundTask {
  return {
    ...task,
    status: 'processing',
    startedAt: new Date(),
    displayStatus: 'Processing...',
  };
}

export function completeTask(
  task: BackgroundTask,
  result: unknown
): BackgroundTask {
  return {
    ...task,
    status: 'completed',
    completedAt: new Date(),
    result,
    displayStatus: 'Complete',
  };
}

export function failTask(
  task: BackgroundTask,
  error: string
): BackgroundTask {
  return {
    ...task,
    status: 'failed',
    completedAt: new Date(),
    error,
    displayStatus: 'Failed',
  };
}

export function updateTaskProgress(
  task: BackgroundTask,
  progress: number,
  message: string
): BackgroundTask {
  return {
    ...task,
    progress,
    progressMessage: message,
    displayStatus: message,
  };
}

// ============================================================================
// Sample Task Results
// ============================================================================

export const SAMPLE_TASK_RESULTS = {
  dxAssociation: {
    suggestions: [
      {
        dxId: 'dx-j209',
        description: 'Acute bronchitis',
        icdCode: 'J20.9',
        confidence: 0.9,
        reasoning: 'Common indication for cough suppressants',
      },
    ],
  },

  drugInteraction: {
    interactions: [],
  },

  drugInteractionWithAlert: {
    interactions: [
      {
        drug1: 'Warfarin',
        drug2: 'Aspirin',
        severity: 'moderate' as const,
        description: 'Increased risk of bleeding',
        recommendation: 'Monitor INR closely, consider GI protection',
      },
    ],
  },

  formularyCheck: {
    covered: true,
    tier: 2,
    copay: 25,
    priorAuthRequired: false,
  },

  formularyCheckNotCovered: {
    covered: false,
    alternatives: [
      { drugName: 'Dextromethorphan', tier: 1, copay: 10 },
      { drugName: 'Guaifenesin', tier: 1, copay: 5 },
    ],
    priorAuthRequired: false,
  },

  noteGeneration: {
    text: 'Patient presents with productive cough x 5 days...',
    format: 'structured' as const,
    confidence: 0.88,
    sections: [
      { name: 'Chief Complaint', content: 'Cough x 5 days' },
      { name: 'HPI', content: 'Patient presents with productive cough...' },
      { name: 'Assessment', content: 'Acute bronchitis' },
      { name: 'Plan', content: '1. Benzonatate 100mg TID...' },
    ],
  },
};
