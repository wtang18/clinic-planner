/**
 * Collaboration reducer
 */

import type { CollaborationState } from '../../types';
import type { EncounterAction } from '../actions/types';
import { createInitialCollaborationState } from '../initialState';

/**
 * Reducer for collaboration state
 */
export function collaborationReducer(
  state: CollaborationState,
  action: EncounterAction
): CollaborationState {
  switch (action.type) {
    case 'HANDOFF_ACCEPTED': {
      const { by } = action.payload;
      const previousOwner = state.currentOwner;
      
      return {
        currentOwner: { id: by.id, name: by.name, role: by.role },
        handoffHistory: previousOwner
          ? [
              ...state.handoffHistory,
              {
                from: previousOwner,
                to: { id: by.id, name: by.name, role: by.role },
                at: new Date(),
              },
            ]
          : state.handoffHistory,
      };
    }
    
    case 'ENCOUNTER_OPENED': {
      // Set initial owner from session (handled in root reducer)
      return state;
    }
    
    case 'ENCOUNTER_CLOSED': {
      return createInitialCollaborationState();
    }
    
    default:
      return state;
  }
}
