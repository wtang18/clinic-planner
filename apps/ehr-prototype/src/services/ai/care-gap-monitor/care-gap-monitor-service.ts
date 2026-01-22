/**
 * Care Gap Monitor AI Service
 *
 * AI service that monitors for care gap closure opportunities
 * when items are added or encounter is opened.
 */

import type { EncounterState } from '../../../state/types';
import type { EncounterAction } from '../../../state/actions/types';
import type { AIService, AIServiceResult, TriggerContext } from '../types';
import type { ChartItem } from '../../../types/chart-items';
import type { CareGapInstance } from '../../../types/care-gaps';
import { evaluateGapClosure, evaluatePatientGaps, getClosureActions } from './gap-evaluator';
import { DEFAULT_CARE_GAP_MONITOR_CONFIG } from './types';

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Care gap monitoring AI service
 */
export const careGapMonitorService: AIService = {
  id: 'care-gap-monitor',
  name: 'Care Gap Monitor',

  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_RESULT_RECEIVED', 'ENCOUNTER_OPENED'],
  },

  shouldRun: (state: EncounterState, trigger: TriggerContext): boolean => {
    if (trigger.type !== 'action' || !trigger.action) {
      return false;
    }

    const { type, payload } = trigger.action;
    const config = DEFAULT_CARE_GAP_MONITOR_CONFIG;

    // For ENCOUNTER_OPENED: always run if configured
    if (type === 'ENCOUNTER_OPENED') {
      return config.evaluateOnEncounterOpen;
    }

    // For ITEM_*: check if item category is relevant to gaps
    if (type === 'ITEM_ADDED' || type === 'ITEM_RESULT_RECEIVED') {
      if (!config.evaluateOnItemAdd) {
        return false;
      }

      let item: ChartItem | undefined;

      if (type === 'ITEM_ADDED') {
        item = (payload as { item: ChartItem }).item;
      } else if (type === 'ITEM_RESULT_RECEIVED') {
        const itemId = (payload as { id: string }).id;
        item = state.entities.items[itemId];
      }

      if (!item) {
        return false;
      }

      return config.relevantItemCategories.includes(item.category);
    }

    return false;
  },

  run: async (
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult> => {
    const actions: EncounterAction[] = [];

    if (!trigger.action) {
      return { actions };
    }

    const { type, payload } = trigger.action;

    // Handle encounter opened - evaluate all gaps
    if (type === 'ENCOUNTER_OPENED') {
      return handleEncounterOpened(state, trigger);
    }

    // Handle item added/result received - check if it addresses any gaps
    if (type === 'ITEM_ADDED' || type === 'ITEM_RESULT_RECEIVED') {
      return handleItemChange(state, trigger);
    }

    return { actions };
  },

  config: {
    local: false, // Gap definitions come from server
    timeout: 10000,
    retryable: true,
    requiresNetwork: true,
  },
};

// ============================================================================
// Action Handlers
// ============================================================================

/**
 * Handle encounter opened - evaluate all gaps for patient
 */
async function handleEncounterOpened(
  state: EncounterState,
  trigger: TriggerContext
): Promise<AIServiceResult> {
  const actions: EncounterAction[] = [];

  if (!trigger.action || trigger.action.type !== 'ENCOUNTER_OPENED') {
    return { actions };
  }

  const { patient } = trigger.action.payload;

  // Evaluate all gaps for patient
  const evaluation = await evaluatePatientGaps(patient);

  // Dispatch care gap identified actions for each gap
  for (const gap of evaluation.gaps) {
    actions.push({
      type: 'CARE_GAP_IDENTIFIED',
      payload: {
        gap,
        source: 'system-scan',
      },
    });
  }

  return { actions };
}

/**
 * Handle item change - check if item addresses any open gaps
 */
async function handleItemChange(
  state: EncounterState,
  trigger: TriggerContext
): Promise<AIServiceResult> {
  const actions: EncounterAction[] = [];

  if (!trigger.action) {
    return { actions };
  }

  const { type, payload } = trigger.action;

  // Get the item
  let item: ChartItem | undefined;

  if (type === 'ITEM_ADDED') {
    item = (payload as { item: ChartItem }).item;
  } else if (type === 'ITEM_RESULT_RECEIVED') {
    const itemId = (payload as { id: string }).id;
    item = state.entities.items[itemId];
  }

  if (!item) {
    return { actions };
  }

  // Get open care gaps
  const openGaps = Object.values(state.entities.careGaps).filter(
    (gap): gap is CareGapInstance =>
      gap.status === 'open' || gap.status === 'pending'
  );

  if (openGaps.length === 0) {
    return { actions };
  }

  // Evaluate each gap against the item
  for (const gap of openGaps) {
    const result = await evaluateGapClosure(gap, item);

    if (result.status === 'closed') {
      actions.push({
        type: 'CARE_GAP_CLOSED',
        payload: {
          gapId: gap.id,
          closedBy: {
            itemId: item.id,
            method: 'automatic',
          },
        },
      });
    } else if (result.status === 'addressed' || result.status === 'pending') {
      actions.push({
        type: 'CARE_GAP_ADDRESSED',
        payload: {
          gapId: gap.id,
          itemId: item.id,
          result: result.status === 'pending' ? 'pending' : 'closed',
        },
      });
    }
  }

  return { actions };
}
