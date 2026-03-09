/**
 * Cross-surface side effect: auto-marks matching protocol orderable items
 * when chart items are added from any source (OmniAdd, scenario, suggestion accept).
 *
 * Listens for ITEM_ADDED and SUGGESTION_ACCEPTED, then iterates active protocol
 * orderables looking for category + matchFields matches. On match, dispatches
 * PROTOCOL_ITEM_ADDRESSED with addressedBy: { type: 'chart-item', referenceId }.
 *
 * Uses the createFilteredHandler pattern from sideEffects.ts.
 */

import type { SideEffectHandler } from './sideEffects';
import { createFilteredHandler } from './sideEffects';
import type { EncounterState } from '../types';
import type { ChartItem } from '../../types';
import type { ActiveProtocolState, OrderableItemDef } from '../../types/protocol';
import type { Dispatch } from '../store/types';
import { protocolItemAddressed } from '../actions/protocol-actions';

/**
 * Check if a chart item matches a protocol orderable's category + matchFields.
 */
function doesItemMatchOrderable(
  item: ChartItem,
  orderable: OrderableItemDef
): boolean {
  if (item.category !== orderable.chartCategory) return false;

  // Every matchField must match between the orderable's defaultData and the item's data
  for (const field of orderable.matchFields) {
    const expectedValue = (orderable.defaultData as Record<string, unknown>)[field];
    const actualValue = (item.data as Record<string, unknown>)[field];
    if (expectedValue === undefined) continue; // Skip fields not in template
    if (actualValue !== expectedValue) return false;
  }

  return true;
}

/**
 * Find the chart item referenced by a SUGGESTION_ACCEPTED action.
 * Suggestions are converted to items in the entities reducer, so the
 * accepted suggestion's data lives at state.entities.items[id] after reduction.
 */
function getItemFromSuggestionAccepted(
  state: EncounterState,
  suggestionId: string
): ChartItem | undefined {
  // After SUGGESTION_ACCEPTED, the suggestion's status changes but
  // the corresponding chart item may already be in entities.items
  // (suggestions carry their chart item data inline).
  return state.entities.items[suggestionId];
}

/**
 * Iterate all active protocols, find pending orderables that match, and dispatch addressed.
 */
function resolveMatchingOrderables(
  item: ChartItem,
  state: EncounterState,
  dispatch: Dispatch
): void {
  const protocols = Object.values(state.entities.protocols);

  for (const protocol of protocols) {
    if (protocol.status !== 'active') continue;
    resolveProtocolOrderables(item, protocol, dispatch);
  }
}

function resolveProtocolOrderables(
  item: ChartItem,
  protocol: ActiveProtocolState,
  dispatch: Dispatch
): void {
  for (const card of protocol.templateSnapshot.cards) {
    for (const protocolItem of card.items) {
      if (protocolItem.itemType.type !== 'orderable') continue;

      // Only match pending items (don't re-address already addressed ones)
      const itemState = protocol.itemStates[protocolItem.id];
      if (!itemState || itemState.status !== 'pending') continue;

      if (doesItemMatchOrderable(item, protocolItem.itemType)) {
        dispatch(
          protocolItemAddressed(protocol.id, protocolItem.id, {
            type: 'chart-item',
            referenceId: item.id,
          })
        );
        // Only match first pending orderable per protocol per chart item
        return;
      }
    }
  }
}

/**
 * Side effect handler for cross-surface protocol resolution.
 *
 * Register with createSideEffectsMiddleware:
 * ```ts
 * handlers: [protocolCrossSurfaceHandler, ...otherHandlers]
 * ```
 */
export const protocolCrossSurfaceHandler: SideEffectHandler =
  createFilteredHandler(
    ['ITEM_ADDED', 'SUGGESTION_ACCEPTED'],
    (action, state, dispatch) => {
      // No active protocols → nothing to resolve
      const hasProtocols = Object.keys(state.entities.protocols).length > 0;
      if (!hasProtocols) return;

      let chartItem: ChartItem | undefined;

      if (action.type === 'ITEM_ADDED') {
        chartItem = action.payload.item;
      } else if (action.type === 'SUGGESTION_ACCEPTED') {
        chartItem = getItemFromSuggestionAccepted(state, action.payload.id);
      }

      if (!chartItem) return;

      resolveMatchingOrderables(chartItem, state, dispatch);
    }
  );
