/**
 * Sync reducer
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';

type SyncState = EncounterState['sync'];

/**
 * Reducer for sync state
 */
export function syncReducer(
  state: SyncState,
  action: EncounterAction
): SyncState {
  switch (action.type) {
    case 'SYNC_STARTED': {
      return {
        ...state,
        status: 'syncing',
      };
    }
    
    case 'SYNC_COMPLETED': {
      return {
        ...state,
        status: 'synced',
        lastSyncedAt: new Date(),
        queue: [], // Clear the queue on successful sync
      };
    }
    
    case 'SYNC_FAILED': {
      return {
        ...state,
        status: 'error',
      };
    }
    
    case 'ENCOUNTER_CLOSED': {
      return {
        status: 'synced',
        queue: [],
        lastSyncedAt: null,
      };
    }
    
    default:
      return state;
  }
}
