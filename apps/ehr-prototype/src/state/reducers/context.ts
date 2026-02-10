/**
 * Context reducer
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';

type ContextState = EncounterState['context'];

/**
 * Reducer for encounter context
 */
export function contextReducer(
  state: ContextState,
  action: EncounterAction
): ContextState {
  switch (action.type) {
    case 'ENCOUNTER_OPENED': {
      const { patient, encounter, visit } = action.payload;
      return {
        encounter,
        patient,
        visit: visit ?? null,
      };
    }
    
    case 'ENCOUNTER_CLOSED': {
      // Always clear context when encounter closes
      return {
        encounter: null,
        patient: null,
        visit: null,
      };
    }
    
    default:
      return state;
  }
}
