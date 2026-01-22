/**
 * Session reducer
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';
import { createInitialTranscriptionState } from '../initialState';

type SessionState = EncounterState['session'];

/**
 * Reducer for session state
 */
export function sessionReducer(
  state: SessionState,
  action: EncounterAction
): SessionState {
  switch (action.type) {
    case 'MODE_CHANGED': {
      return {
        ...state,
        mode: action.payload.to,
      };
    }
    
    case 'TRANSCRIPTION_STARTED': {
      return {
        ...state,
        transcription: {
          ...state.transcription,
          status: 'recording',
          startedAt: new Date(),
          pausedAt: undefined,
        },
      };
    }
    
    case 'TRANSCRIPTION_PAUSED': {
      return {
        ...state,
        transcription: {
          ...state.transcription,
          status: 'paused',
          pausedAt: new Date(),
        },
      };
    }
    
    case 'TRANSCRIPTION_STOPPED': {
      return {
        ...state,
        transcription: {
          ...state.transcription,
          status: 'idle',
          currentSegment: undefined,
        },
      };
    }
    
    case 'TRANSCRIPTION_SEGMENT_RECEIVED': {
      const { segment } = action.payload;
      const duration = segment.endTime - segment.startTime;
      
      return {
        ...state,
        transcription: {
          ...state.transcription,
          currentSegment: segment,
          totalDuration: state.transcription.totalDuration + duration,
          segmentCount: state.transcription.segmentCount + 1,
        },
      };
    }
    
    case 'HANDOFF_ACCEPTED': {
      const { by } = action.payload;
      return {
        ...state,
        currentUser: by,
      };
    }
    
    case 'ENCOUNTER_OPENED': {
      // Reset transcription on new encounter
      return {
        ...state,
        transcription: createInitialTranscriptionState(),
      };
    }
    
    case 'ENCOUNTER_CLOSED': {
      return {
        ...state,
        mode: 'capture',
        transcription: createInitialTranscriptionState(),
      };
    }
    
    default:
      return state;
  }
}
