/**
 * Diagnosis Association AI Service
 *
 * AI service that suggests ICD-10 diagnosis linkages for
 * orders and medications.
 */

import { nanoid } from 'nanoid';
import type { EncounterState } from '../../../state/types';
import type { EncounterAction } from '../../../state/actions/types';
import type { AIService, AIServiceResult, TriggerContext } from '../types';
import type { ChartItem, DiagnosisItem, ItemCategory } from '../../../types/chart-items';
import type { BackgroundTask, TaskType, TaskStatus } from '../../../types/suggestions';
import { suggestDxAssociation } from './dx-mapper';
import { DEFAULT_DX_ASSOCIATION_CONFIG } from './types';

// ============================================================================
// Categories that need Dx linkage
// ============================================================================

const DX_LINKABLE_CATEGORIES: ItemCategory[] = [
  'medication',
  'lab',
  'imaging',
  'procedure',
  'referral',
];

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Diagnosis association AI service
 */
export const dxAssociationService: AIService = {
  id: 'dx-association',
  name: 'Diagnosis Association',

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

    let item: ChartItem | undefined;

    if (type === 'ITEM_ADDED') {
      item = (payload as { item: ChartItem }).item;
    } else if (type === 'ITEM_UPDATED') {
      const itemId = (payload as { id: string }).id;
      item = state.entities.items[itemId];
    }

    if (!item) {
      return false;
    }

    // Check if item category needs Dx linkage
    if (!DX_LINKABLE_CATEGORIES.includes(item.category)) {
      return false;
    }

    // Check if item already has linked diagnoses
    if (item.linkedDiagnoses.length > 0) {
      return false;
    }

    return true;
  },

  run: async (
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult> => {
    const actions: EncounterAction[] = [];

    if (!trigger.action) {
      return { actions };
    }

    // Get the item
    let item: ChartItem | undefined;
    const { type, payload } = trigger.action;

    if (type === 'ITEM_ADDED') {
      item = (payload as { item: ChartItem }).item;
    } else if (type === 'ITEM_UPDATED') {
      const itemId = (payload as { id: string }).id;
      item = state.entities.items[itemId];
    }

    if (!item) {
      return { actions };
    }

    // Get existing diagnoses
    const existingDiagnoses = Object.values(state.entities.items).filter(
      (i): i is DiagnosisItem => i.category === 'diagnosis'
    );

    // Run association logic
    const result = await suggestDxAssociation(
      item,
      existingDiagnoses,
      state.context.patient,
      DEFAULT_DX_ASSOCIATION_CONFIG
    );

    // If auto-linked, dispatch link action
    if (result.autoLinked && result.autoLinked.diagnosisId) {
      actions.push({
        type: 'ITEM_DX_LINKED',
        payload: {
          itemId: item.id,
          dxId: result.autoLinked.diagnosisId,
        },
      });
    }

    // Create task for review if there are suggestions
    if (result.suggestions.length > 0 && !result.autoLinked) {
      const task: BackgroundTask = {
        id: `task-${nanoid(8)}`,
        type: 'dx-association' as TaskType,
        status: 'pending-review' as TaskStatus,
        priority: 'normal',
        trigger: {
          action: trigger.action.type,
          itemId: item.id,
        },
        result: {
          suggestions: result.suggestions,
        },
        createdAt: new Date(),
        displayTitle: `Link diagnosis for ${item.displayText}`,
        displayStatus: `${result.suggestions.length} suggestion(s) available`,
      };

      actions.push({
        type: 'TASK_CREATED',
        payload: {
          task,
          relatedItemId: item.id,
        },
      });
    }

    return { actions };
  },

  config: {
    local: true, // Uses patient context
    timeout: 5000,
    retryable: true,
    requiresNetwork: false,
  },
};
