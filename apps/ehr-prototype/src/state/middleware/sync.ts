/**
 * Sync middleware
 * 
 * Handles syncing actions to the server and managing offline queue.
 */

import type { EncounterAction } from '../actions/types';
import type { EncounterState, QueuedAction } from '../types';
import type { Middleware } from '../store/types';

/**
 * Sync configuration
 */
export interface SyncConfig {
  /** Determine if an action should trigger a sync */
  shouldSync: (action: EncounterAction) => boolean;
  /** Perform the sync operation */
  syncAction: (action: EncounterAction, state: EncounterState) => Promise<void>;
  /** Actions that should NOT be synced */
  excludeActions?: string[];
}

// Actions that modify state and should typically be synced
const SYNCABLE_ACTIONS = new Set([
  'ITEM_ADDED',
  'ITEM_UPDATED',
  'ITEM_CONFIRMED',
  'ITEM_CANCELLED',
  'ITEM_DX_LINKED',
  'ITEM_DX_UNLINKED',
  'ITEM_SENT',
  'ITEMS_BATCH_SENT',
  'SUGGESTION_ACCEPTED',
  'SUGGESTION_ACCEPTED_WITH_CHANGES',
  'TASK_APPROVED',
  'TASK_REJECTED',
  'TASKS_BATCH_APPROVED',
  'CARE_GAP_ADDRESSED',
  'CARE_GAP_CLOSED',
  'CARE_GAP_EXCLUDED',
  'HANDOFF_ACCEPTED',
]);

// Actions that should never be synced (local-only or sync-related)
const NON_SYNCABLE_ACTIONS = new Set([
  'SYNC_STARTED',
  'SYNC_COMPLETED',
  'SYNC_FAILED',
  'SYNC_CONFLICT_DETECTED',
  'SYNC_CONFLICT_RESOLVED',
  'MODE_CHANGED',
  'TRANSCRIPTION_STARTED',
  'TRANSCRIPTION_PAUSED',
  'TRANSCRIPTION_STOPPED',
  'TRANSCRIPTION_SEGMENT_RECEIVED',
  'SUGGESTION_RECEIVED',
  'SUGGESTION_EXPIRED',
  'SUGGESTIONS_CLEARED',
  'TASK_CREATED',
  'TASK_PROGRESS',
  'TASK_COMPLETED',
  'TASK_FAILED',
  'CARE_GAP_IDENTIFIED',
  'CARE_GAPS_REFRESHED',
]);

/**
 * Default sync configuration
 */
export const defaultSyncConfig: SyncConfig = {
  shouldSync: (action) => SYNCABLE_ACTIONS.has(action.type),
  syncAction: async (action, state) => {
    // Default implementation just logs
    console.log('[SYNC]', action.type, 'would sync to server');
    // In real implementation, this would call an API
    await new Promise(resolve => setTimeout(resolve, 100));
  },
};

let queueIdCounter = 0;

/**
 * Create sync middleware
 */
export const createSyncMiddleware = (config: SyncConfig): Middleware => {
  const pendingQueue: QueuedAction[] = [];
  let isSyncing = false;
  
  return (store) => (next) => (action) => {
    // Pass action through first
    next(action);
    
    // Check if this action should trigger sync
    if (!config.shouldSync(action)) {
      return;
    }
    
    // Skip if already syncing or offline
    const state = store.getState();
    if (state.sync.status === 'error') {
      // Add to queue for later
      pendingQueue.push({
        id: `queue-${++queueIdCounter}`,
        action,
        queuedAt: new Date(),
        retryCount: 0,
      });
      return;
    }
    
    // Perform sync
    if (!isSyncing) {
      isSyncing = true;
      store.dispatch({ type: 'SYNC_STARTED', payload: {} });
      
      config.syncAction(action, state)
        .then(() => {
          store.dispatch({ type: 'SYNC_COMPLETED', payload: { serverVersion: Date.now() } });
          isSyncing = false;
          
          // Process queued actions
          while (pendingQueue.length > 0) {
            const queued = pendingQueue.shift()!;
            config.syncAction(queued.action as EncounterAction, store.getState())
              .catch((error) => {
                console.error('[SYNC] Queued action failed:', error);
              });
          }
        })
        .catch((error) => {
          store.dispatch({
            type: 'SYNC_FAILED',
            payload: { error: error.message, retryable: true },
          });
          isSyncing = false;
        });
    }
  };
};
