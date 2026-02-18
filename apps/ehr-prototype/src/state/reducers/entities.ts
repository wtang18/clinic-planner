/**
 * Entity reducers for items, suggestions, tasks, and care gaps
 */

import type { ChartItem, Suggestion, BackgroundTask, CareGapInstance } from '../../types';
import type { EncounterAction } from '../actions/types';
import { createLogEntry, describeFieldChanges } from '../../utils/activity-log';

// ============================================================================
// Items Reducer
// ============================================================================

/** Helper to append a log entry to an item's activity log */
function withLog(item: ChartItem, action: string, actor: string, details?: string): ChartItem {
  return {
    ...item,
    activityLog: [...item.activityLog, createLogEntry(action, actor, details)],
  };
}

/**
 * Reducer for chart items collection.
 * Auto-appends activity log entries for each mutation.
 */
export function itemsReducer(
  state: Record<string, ChartItem>,
  action: EncounterAction
): Record<string, ChartItem> {
  switch (action.type) {
    case 'ITEM_ADDED': {
      const { item } = action.payload;
      return {
        ...state,
        [item.id]: item,
      };
    }

    case 'ITEM_UPDATED': {
      const { id, changes, reason, actor } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      const actorName = actor || 'System';
      const now = new Date();

      let logAction: string;
      let logDetails: string | undefined;

      switch (reason) {
        case 'user-edit': {
          logAction = 'edited';
          logDetails = describeFieldChanges(
            existing as unknown as Record<string, unknown>,
            changes as Record<string, unknown>
          );
          if (!logDetails) logDetails = undefined; // Empty string → no details
          break;
        }
        case 'ai-enrichment':
          logAction = 'ai_enriched';
          logDetails = 'AI enriched from ambient recording';
          break;
        case 'result-received':
          logAction = 'result_received';
          logDetails = 'Results received';
          break;
        default:
          logAction = 'updated';
          break;
      }

      const merged = {
        ...existing,
        ...changes,
        modifiedAt: now,
      } as ChartItem;

      return {
        ...state,
        [id]: withLog(merged, logAction, actorName, logDetails),
      };
    }

    case 'ITEM_DELETED': {
      const { id } = action.payload;
      const { [id]: _, ...remaining } = state;
      return remaining;
    }

    case 'ITEM_CONFIRMED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      const updated = {
        ...existing,
        status: 'confirmed' as const,
        _meta: {
          ...existing._meta,
          requiresReview: false,
        },
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [id]: withLog(updated, 'confirmed', 'Current User'),
      };
    }

    case 'ITEM_CANCELLED': {
      const { id, reason } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      const updated = {
        ...existing,
        status: 'cancelled' as const,
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [id]: withLog(updated, 'cancelled', 'Current User', reason),
      };
    }

    case 'ITEM_DX_LINKED': {
      const { itemId, dxId } = action.payload;
      const existing = state[itemId];
      if (!existing) return state;
      if (existing.linkedDiagnoses.includes(dxId)) return state;

      const updated = {
        ...existing,
        linkedDiagnoses: [...existing.linkedDiagnoses, dxId],
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [itemId]: withLog(updated, 'dx_associated', 'Current User', `Dx associated: ${dxId}`),
      };
    }

    case 'ITEM_DX_UNLINKED': {
      const { itemId, dxId } = action.payload;
      const existing = state[itemId];
      if (!existing) return state;

      const updated = {
        ...existing,
        linkedDiagnoses: existing.linkedDiagnoses.filter(id => id !== dxId),
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [itemId]: withLog(updated, 'dx_removed', 'Current User', `Dx removed: ${dxId}`),
      };
    }

    case 'ITEM_SENT': {
      const { id, destination, method } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      const updated = {
        ...existing,
        status: 'ordered' as const,
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [id]: withLog(updated, 'sent', 'Current User', `Sent to ${destination} via ${method}`),
      };
    }

    case 'ITEMS_BATCH_SENT': {
      const { ids, destination } = action.payload;
      const updates: Record<string, ChartItem> = {};
      const now = new Date();

      for (const id of ids) {
        const existing = state[id];
        if (existing) {
          const updated = {
            ...existing,
            status: 'ordered' as const,
            modifiedAt: now,
          } as ChartItem;
          updates[id] = withLog(updated, 'sent', 'Current User', `Batch sent to ${destination}`);
        }
      }

      return { ...state, ...updates };
    }

    case 'ITEM_RESULT_RECEIVED': {
      const { id, result } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      // Handle lab items specifically
      if (existing.category === 'lab') {
        const updated = {
          ...existing,
          status: 'completed' as const,
          data: {
            ...existing.data,
            orderStatus: 'resulted' as const,
            resultedAt: new Date(),
            results: result as typeof existing.data.results,
          },
          modifiedAt: new Date(),
        };
        return {
          ...state,
          [id]: withLog(updated as ChartItem, 'result_received', 'System', 'Results received'),
        };
      }

      const updated = {
        ...existing,
        status: 'completed' as const,
        modifiedAt: new Date(),
      } as ChartItem;

      return {
        ...state,
        [id]: withLog(updated, 'result_received', 'System', 'Results received'),
      };
    }

    case 'ENCOUNTER_CLOSED': {
      // Clear all items when encounter closes without save
      if (!action.payload.save) {
        return {};
      }
      return state;
    }

    default:
      return state;
  }
}

// ============================================================================
// Suggestions Reducer
// ============================================================================

/**
 * Reducer for suggestions collection
 */
export function suggestionsReducer(
  state: Record<string, Suggestion>,
  action: EncounterAction
): Record<string, Suggestion> {
  switch (action.type) {
    case 'SUGGESTION_RECEIVED': {
      const { suggestion } = action.payload;
      return {
        ...state,
        [suggestion.id]: suggestion,
      };
    }
    
    case 'SUGGESTION_ACCEPTED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'accepted',
          actedAt: new Date(),
        },
      };
    }
    
    case 'SUGGESTION_ACCEPTED_WITH_CHANGES': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'accepted-modified',
          actedAt: new Date(),
        },
      };
    }
    
    case 'SUGGESTION_DISMISSED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'dismissed',
          actedAt: new Date(),
        },
      };
    }
    
    case 'SUGGESTION_EXPIRED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'expired',
        },
      };
    }
    
    case 'SUGGESTIONS_CLEARED': {
      const { olderThan } = action.payload;
      const result: Record<string, Suggestion> = {};
      
      for (const [id, suggestion] of Object.entries(state)) {
        if (suggestion.createdAt >= olderThan) {
          result[id] = suggestion;
        }
      }
      
      return result;
    }
    
    case 'ENCOUNTER_CLOSED': {
      return {};
    }
    
    default:
      return state;
  }
}

// ============================================================================
// Tasks Reducer
// ============================================================================

/**
 * Reducer for background tasks collection
 */
export function tasksReducer(
  state: Record<string, BackgroundTask>,
  action: EncounterAction
): Record<string, BackgroundTask> {
  switch (action.type) {
    case 'TASK_CREATED': {
      const { task } = action.payload;
      return {
        ...state,
        [task.id]: task,
      };
    }
    
    case 'TASK_PROGRESS': {
      const { id, progress, status } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          progress,
          progressMessage: status,
          status: 'processing',
        },
      };
    }
    
    case 'TASK_COMPLETED': {
      const { id, result } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'completed',
          result,
          completedAt: new Date(),
          progress: 100,
        },
      };
    }
    
    case 'TASK_FAILED': {
      const { id, error } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'failed',
          error,
          completedAt: new Date(),
        },
      };
    }
    
    case 'TASK_APPROVED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'ready',
        },
      };
    }
    
    case 'TASK_REJECTED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;
      
      return {
        ...state,
        [id]: {
          ...existing,
          status: 'cancelled',
        },
      };
    }
    
    case 'TASKS_BATCH_APPROVED': {
      const { ids } = action.payload;
      const updates: Record<string, BackgroundTask> = {};
      
      for (const id of ids) {
        const existing = state[id];
        if (existing) {
          updates[id] = {
            ...existing,
            status: 'ready',
          };
        }
      }
      
      return { ...state, ...updates };
    }
    
    case 'ENCOUNTER_CLOSED': {
      return {};
    }
    
    default:
      return state;
  }
}

// ============================================================================
// Care Gaps Reducer
// ============================================================================

/**
 * Reducer for care gaps collection
 */
export function careGapsReducer(
  state: Record<string, CareGapInstance>,
  action: EncounterAction
): Record<string, CareGapInstance> {
  switch (action.type) {
    case 'CARE_GAP_IDENTIFIED': {
      const { gap } = action.payload;
      return {
        ...state,
        [gap.id]: gap,
      };
    }
    
    case 'CARE_GAP_ADDRESSED': {
      const { gapId, itemId, result } = action.payload;
      const existing = state[gapId];
      if (!existing) return state;
      
      return {
        ...state,
        [gapId]: {
          ...existing,
          status: result === 'closed' ? 'closed' : 'pending',
          addressedThisEncounter: true,
          encounterActions: [...existing.encounterActions, itemId],
          closureAttempts: [
            ...existing.closureAttempts,
            {
              attemptedAt: new Date(),
              itemId,
              itemType: 'unknown', // Will be enriched by caller
              result: result === 'closed' ? 'success' : 'pending',
            },
          ],
        },
      };
    }
    
    case 'CARE_GAP_CLOSED': {
      const { gapId, closedBy } = action.payload;
      const existing = state[gapId];
      if (!existing) return state;
      
      return {
        ...state,
        [gapId]: {
          ...existing,
          status: 'closed',
          closedAt: new Date(),
          closedBy: {
            itemId: closedBy.itemId,
            itemType: 'unknown', // Will be enriched
            method: closedBy.method,
          },
        },
      };
    }
    
    case 'CARE_GAP_EXCLUDED': {
      const { gapId, reason } = action.payload;
      const existing = state[gapId];
      if (!existing) return state;
      
      return {
        ...state,
        [gapId]: {
          ...existing,
          status: 'excluded',
          excluded: true,
          exclusionReason: reason,
          excludedAt: new Date(),
        },
      };
    }
    
    case 'CARE_GAP_REOPENED': {
      const { gapId } = action.payload;
      const existing = state[gapId];
      if (!existing) return state;
      
      return {
        ...state,
        [gapId]: {
          ...existing,
          status: 'open',
          closedAt: undefined,
          closedBy: undefined,
        },
      };
    }
    
    case 'CARE_GAPS_REFRESHED': {
      const { gaps } = action.payload;
      const result: Record<string, CareGapInstance> = {};
      
      for (const gap of gaps) {
        result[gap.id] = gap;
      }
      
      return result;
    }
    
    case 'ENCOUNTER_CLOSED': {
      // Keep care gaps - they persist across encounters
      return state;
    }
    
    default:
      return state;
  }
}
