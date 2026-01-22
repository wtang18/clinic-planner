/**
 * Relationships reducer
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';

type RelationshipsState = EncounterState['relationships'];

/**
 * Reducer for entity relationships
 */
export function relationshipsReducer(
  state: RelationshipsState,
  action: EncounterAction
): RelationshipsState {
  switch (action.type) {
    case 'ITEM_ADDED': {
      const { item } = action.payload;
      return {
        ...state,
        itemOrder: [...state.itemOrder, item.id],
      };
    }
    
    case 'ITEM_CANCELLED': {
      const { id } = action.payload;
      // Remove from itemOrder
      return {
        ...state,
        itemOrder: state.itemOrder.filter(itemId => itemId !== id),
      };
    }
    
    case 'TASK_CREATED': {
      const { task, relatedItemId } = action.payload;
      if (!relatedItemId) return state;
      
      return {
        ...state,
        taskToItem: {
          ...state.taskToItem,
          [task.id]: relatedItemId,
        },
      };
    }
    
    case 'SUGGESTION_RECEIVED': {
      const { suggestion } = action.payload;
      return {
        ...state,
        suggestionToItem: {
          ...state.suggestionToItem,
          [suggestion.id]: suggestion.relatedItemId ?? null,
        },
      };
    }
    
    case 'CARE_GAP_ADDRESSED': {
      const { gapId, itemId } = action.payload;
      const existing = state.careGapToItems[gapId] || [];
      
      if (existing.includes(itemId)) return state;
      
      return {
        ...state,
        careGapToItems: {
          ...state.careGapToItems,
          [gapId]: [...existing, itemId],
        },
      };
    }
    
    case 'CARE_GAPS_REFRESHED': {
      // Reset careGapToItems when gaps are refreshed
      return {
        ...state,
        careGapToItems: {},
      };
    }
    
    case 'ENCOUNTER_CLOSED': {
      if (!action.payload.save) {
        // Clear all relationships when encounter closes without save
        return {
          itemOrder: [],
          taskToItem: {},
          suggestionToItem: {},
          careGapToItems: {},
        };
      }
      return state;
    }
    
    default:
      return state;
  }
}
