/**
 * Initial state factories for the EHR state management
 */

import type { TranscriptionState, CollaborationState } from '../types';
import type { EncounterState } from './types';

/**
 * Creates the initial transcription state
 */
export function createInitialTranscriptionState(): TranscriptionState {
  return {
    status: 'idle',
    startedAt: undefined,
    pausedAt: undefined,
    currentSegment: undefined,
    totalDuration: 0,
    segmentCount: 0,
  };
}

/**
 * Creates the initial collaboration state
 */
export function createInitialCollaborationState(): CollaborationState {
  return {
    currentOwner: null,
    handoffHistory: [],
  };
}

/**
 * Creates the initial encounter state with sensible defaults
 */
export function createInitialState(): EncounterState {
  return {
    // Empty entity collections
    entities: {
      items: {},
      suggestions: {},
      tasks: {},
      careGaps: {},
      drafts: {},
      protocols: {},
    },

    // Empty relationships
    relationships: {
      itemOrder: [],
      taskToItem: {},
      suggestionToItem: {},
      careGapToItems: {},
      protocolToItems: {},
    },
    
    // No context loaded
    context: {
      encounter: null,
      patient: null,
      visit: null,
    },
    
    // Default session state
    session: {
      mode: 'capture',
      currentUser: null,
      transcription: createInitialTranscriptionState(),
    },
    
    // Online by default
    sync: {
      status: 'synced',
      queue: [],
      lastSyncedAt: null,
    },
    
    // No collaboration
    collaboration: createInitialCollaborationState(),
  };
}

/**
 * Creates initial state with partial overrides (useful for testing)
 */
export function createInitialStateWith(
  overrides: Partial<EncounterState>
): EncounterState {
  const base = createInitialState();
  return {
    ...base,
    ...overrides,
    entities: {
      ...base.entities,
      ...overrides.entities,
    },
    relationships: {
      ...base.relationships,
      ...overrides.relationships,
    },
    context: {
      ...base.context,
      ...overrides.context,
    },
    session: {
      ...base.session,
      ...overrides.session,
    },
    sync: {
      ...base.sync,
      ...overrides.sync,
    },
    collaboration: {
      ...base.collaboration,
      ...overrides.collaboration,
    },
  };
}
