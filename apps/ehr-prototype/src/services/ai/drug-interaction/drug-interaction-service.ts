/**
 * Drug Interaction AI Service
 *
 * AI service that checks for drug-drug interactions when
 * medications are added or updated.
 */

import { nanoid } from 'nanoid';
import type { EncounterState } from '../../../state/types';
import type { EncounterAction } from '../../../state/actions/types';
import type { AIService, AIServiceResult, TriggerContext, Notification } from '../types';
import type { MedicationItem } from '../../../types/chart-items';
import type { BackgroundTask, TaskType, TaskStatus, Alert, AlertAction } from '../../../types/suggestions';
import { checkDrugInteractions } from './interaction-checker';
import { DEFAULT_DRUG_INTERACTION_CONFIG } from './types';

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Drug interaction checking AI service
 */
export const drugInteractionService: AIService = {
  id: 'drug-interaction',
  name: 'Drug Interaction Checker',

  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_UPDATED'],
  },

  shouldRun: (state: EncounterState, trigger: TriggerContext): boolean => {
    if (trigger.type !== 'action' || !trigger.action) {
      return false;
    }

    const { type, payload } = trigger.action;

    // Only run for ITEM_ADDED or ITEM_UPDATED
    if (type !== 'ITEM_ADDED' && type !== 'ITEM_UPDATED') {
      return false;
    }

    let item: MedicationItem | undefined;

    if (type === 'ITEM_ADDED') {
      const addedItem = (payload as { item: MedicationItem }).item;
      if (addedItem.category !== 'medication') return false;
      item = addedItem;
    } else if (type === 'ITEM_UPDATED') {
      const itemId = (payload as { id: string }).id;
      const updatedItem = state.entities.items[itemId];
      if (!updatedItem || updatedItem.category !== 'medication') return false;
      item = updatedItem as MedicationItem;
    }

    if (!item) {
      return false;
    }

    // Don't check for discontinuations
    if (item.data.prescriptionType === 'discontinue') {
      return false;
    }

    return true;
  },

  run: async (
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult> => {
    const actions: EncounterAction[] = [];
    const notifications: Notification[] = [];

    if (!trigger.action) {
      return { actions, notifications };
    }

    // Get the medication
    let medication: MedicationItem | undefined;
    const { type, payload } = trigger.action;

    if (type === 'ITEM_ADDED') {
      medication = (payload as { item: MedicationItem }).item as MedicationItem;
    } else if (type === 'ITEM_UPDATED') {
      const itemId = (payload as { id: string }).id;
      medication = state.entities.items[itemId] as MedicationItem;
    }

    if (!medication || medication.category !== 'medication') {
      return { actions, notifications };
    }

    // Get all medications in the chart
    const currentMedications = Object.values(state.entities.items).filter(
      (item): item is MedicationItem => item.category === 'medication'
    );

    // Also include medications from patient's medication list if available
    const patientMedications = state.context.patient?.medications || [];
    const allMedications = [
      ...currentMedications,
      ...patientMedicationsToItems(patientMedications),
    ];

    // Check interactions
    const result = await checkDrugInteractions(
      medication,
      allMedications,
      DEFAULT_DRUG_INTERACTION_CONFIG
    );

    if (result.interactions.length === 0) {
      return { actions, notifications };
    }

    // Categorize by severity
    const contraindicated = result.interactions.filter((i) => i.severity === 'contraindicated');
    const severe = result.interactions.filter((i) => i.severity === 'severe');
    const moderate = result.interactions.filter((i) => i.severity === 'moderate');
    const mild = result.interactions.filter((i) => i.severity === 'mild');

    // Create task with all interactions
    const task: BackgroundTask = {
      id: `task-${nanoid(8)}`,
      type: 'drug-interaction' as TaskType,
      status: contraindicated.length > 0 || severe.length > 0
        ? 'pending-review' as TaskStatus
        : 'completed' as TaskStatus,
      priority: contraindicated.length > 0 ? 'urgent' : severe.length > 0 ? 'high' : 'medium',
      trigger: {
        action: trigger.action.type,
        itemId: medication.id,
      },
      result: {
        interactions: result.interactions,
        checkedAgainst: result.checkedAgainst,
      },
      createdAt: new Date(),
      displayTitle: `Drug interactions for ${medication.data.drugName}`,
      displayStatus: formatInteractionSummary(result.interactions),
    };

    actions.push({
      type: 'TASK_CREATED',
      payload: {
        task,
        relatedItemId: medication.id,
      },
    });

    // Create notifications for severe/contraindicated
    if (contraindicated.length > 0) {
      notifications.push({
        type: 'error',
        message: `⚠️ Contraindicated interaction: ${medication.data.drugName} with ${contraindicated[0].drug2.name}`,
        persistent: true,
        actionLabel: 'Review',
        actionTarget: medication.id,
      });
    } else if (severe.length > 0) {
      notifications.push({
        type: 'warning',
        message: `Drug interaction alert: ${medication.data.drugName} - ${severe.length} severe interaction(s)`,
        persistent: false,
        actionLabel: 'Review',
        actionTarget: medication.id,
      });
    }

    return { actions, notifications };
  },

  config: {
    local: false, // Drug database is external (in production)
    timeout: 3000,
    retryable: true,
    requiresNetwork: true,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert patient medication list to MedicationItem format for checking
 */
function patientMedicationsToItems(
  medications: Array<{ name: string; dosage?: string; frequency?: string }>
): MedicationItem[] {
  return medications.map((med, index) => ({
    id: `patient-med-${index}`,
    category: 'medication' as const,
    createdAt: new Date(),
    createdBy: { id: 'system', name: 'System' },
    modifiedAt: new Date(),
    modifiedBy: { id: 'system', name: 'System' },
    source: { type: 'manual' as const },
    status: 'confirmed' as const,
    displayText: med.name,
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{
      timestamp: new Date(),
      action: 'created',
      actor: 'System',
      details: 'Imported from patient medication history',
    }],
    _meta: {
      syncStatus: 'synced' as const,
      aiGenerated: false,
      requiresReview: false,
      reviewed: true,
    },
    data: {
      drugName: med.name,
      dosage: med.dosage || '',
      route: 'PO',
      frequency: med.frequency || 'daily',
      isControlled: false,
      prescriptionType: 'refill' as const,
    },
    actions: [],
  }));
}

/**
 * Format interaction summary for display
 */
function formatInteractionSummary(
  interactions: Array<{ severity: string }>
): string {
  const contraindicated = interactions.filter((i) => i.severity === 'contraindicated').length;
  const severe = interactions.filter((i) => i.severity === 'severe').length;
  const moderate = interactions.filter((i) => i.severity === 'moderate').length;
  const mild = interactions.filter((i) => i.severity === 'mild').length;

  const parts: string[] = [];
  if (contraindicated > 0) parts.push(`${contraindicated} contraindicated`);
  if (severe > 0) parts.push(`${severe} severe`);
  if (moderate > 0) parts.push(`${moderate} moderate`);
  if (mild > 0) parts.push(`${mild} mild`);

  return parts.join(', ') || 'No interactions found';
}
