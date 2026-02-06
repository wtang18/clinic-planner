/**
 * Bottom Bar Reducer
 *
 * Handles state transitions for the bottom bar system.
 * Key invariants:
 * - Only one module can be at palette/drawer tier at a time (mutual exclusion)
 * - Only one session can be recording system-wide
 * - Maximum 3 concurrent paused sessions
 */

import type { BottomBarState, BottomBarAction, TierState, TranscriptionSession } from './types';
import { initialBottomBarState } from './initialState';

// ============================================================================
// Constants
// ============================================================================

const MAX_PAUSED_SESSIONS = 3;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a tier is expanded (palette or drawer)
 */
function isExpandedTier(tier: TierState): boolean {
  return tier === 'palette' || tier === 'drawer';
}

/**
 * Get the default tier for a module when the other expands
 */
function getCollapsedTier(currentTier: TierState): TierState {
  // If currently expanded, collapse to bar
  if (isExpandedTier(currentTier)) {
    return 'bar';
  }
  // If at bar, stay at bar
  if (currentTier === 'bar') {
    return 'bar';
  }
  // If at mini, stay at mini
  return 'mini';
}

/**
 * Count paused sessions
 */
function countPausedSessions(sessions: Record<string, TranscriptionSession>): number {
  return Object.values(sessions).filter((s) => s.status === 'paused').length;
}

/**
 * Find oldest paused session (for eviction)
 */
function findOldestPausedSession(
  sessions: Record<string, TranscriptionSession>
): TranscriptionSession | null {
  const pausedSessions = Object.values(sessions)
    .filter((s) => s.status === 'paused' && s.pausedAt)
    .sort((a, b) => {
      const aTime = a.pausedAt ? new Date(a.pausedAt).getTime() : 0;
      const bTime = b.pausedAt ? new Date(b.pausedAt).getTime() : 0;
      return aTime - bTime;
    });

  return pausedSessions[0] || null;
}

/**
 * Remove a session and clean up related state
 */
function removeSession(
  state: BottomBarState,
  sessionId: string
): BottomBarState {
  const session = state.sessions[sessionId];
  if (!session) return state;

  const { [sessionId]: _, ...remainingSessions } = state.sessions;
  const { [session.encounterId]: __, ...remainingByEncounter } = state.sessionsByEncounter;

  return {
    ...state,
    sessions: remainingSessions,
    sessionsByEncounter: remainingByEncounter,
    activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    recordingSessionId: state.recordingSessionId === sessionId ? null : state.recordingSessionId,
  };
}

/**
 * Update a session immutably
 */
function updateSession(
  state: BottomBarState,
  sessionId: string,
  updates: Partial<TranscriptionSession>
): BottomBarState {
  const session = state.sessions[sessionId];
  if (!session) return state;

  return {
    ...state,
    sessions: {
      ...state.sessions,
      [sessionId]: { ...session, ...updates },
    },
  };
}

// ============================================================================
// Reducer
// ============================================================================

export function bottomBarReducer(
  state: BottomBarState = initialBottomBarState,
  action: BottomBarAction
): BottomBarState {
  switch (action.type) {
    // ========================================================================
    // Tier Control Actions
    // ========================================================================

    case 'TIER_CHANGED': {
      const { module, tier } = action.payload;
      const isExpanding = isExpandedTier(tier);

      if (module === 'transcription') {
        // If expanding transcription, collapse AI
        if (isExpanding) {
          return {
            ...state,
            transcriptionTier: tier,
            aiTier: getCollapsedTier(state.aiTier),
            expandedModule: 'transcription',
          };
        }
        // Not expanding - just update tier
        return {
          ...state,
          transcriptionTier: tier,
          expandedModule: state.expandedModule === 'transcription' ? null : state.expandedModule,
        };
      }

      // AI module
      if (isExpanding) {
        return {
          ...state,
          aiTier: tier,
          transcriptionTier: getCollapsedTier(state.transcriptionTier),
          expandedModule: 'ai',
        };
      }
      return {
        ...state,
        aiTier: tier,
        expandedModule: state.expandedModule === 'ai' ? null : state.expandedModule,
      };
    }

    case 'MODULE_EXPANDED': {
      const { module } = action.payload;

      if (module === 'transcription') {
        return {
          ...state,
          transcriptionTier: 'palette',
          aiTier: getCollapsedTier(state.aiTier),
          expandedModule: 'transcription',
        };
      }

      return {
        ...state,
        aiTier: 'palette',
        transcriptionTier: getCollapsedTier(state.transcriptionTier),
        expandedModule: 'ai',
      };
    }

    case 'MODULE_COLLAPSED': {
      const { module } = action.payload;

      if (module === 'transcription') {
        return {
          ...state,
          transcriptionTier: 'bar',
          expandedModule: state.expandedModule === 'transcription' ? null : state.expandedModule,
        };
      }

      return {
        ...state,
        aiTier: 'bar',
        expandedModule: state.expandedModule === 'ai' ? null : state.expandedModule,
      };
    }

    case 'BOTH_COLLAPSED': {
      return {
        ...state,
        transcriptionTier: 'bar',
        aiTier: 'bar',
        expandedModule: null,
      };
    }

    // ========================================================================
    // Session Lifecycle Actions
    // ========================================================================

    case 'SESSION_CREATED': {
      const { session } = action.payload;

      // Check if we need to evict an old paused session
      let newState = state;
      if (countPausedSessions(state.sessions) >= MAX_PAUSED_SESSIONS) {
        const oldest = findOldestPausedSession(state.sessions);
        if (oldest) {
          newState = removeSession(state, oldest.id);
        }
      }

      return {
        ...newState,
        sessions: {
          ...newState.sessions,
          [session.id]: session,
        },
        sessionsByEncounter: {
          ...newState.sessionsByEncounter,
          [session.encounterId]: session.id,
        },
        activeSessionId: session.id,
      };
    }

    case 'SESSION_ACTIVATED': {
      const { sessionId } = action.payload;
      if (!state.sessions[sessionId]) return state;

      return {
        ...state,
        activeSessionId: sessionId,
      };
    }

    case 'SESSION_REMOVED': {
      return removeSession(state, action.payload.sessionId);
    }

    // ========================================================================
    // Recording Lifecycle Actions
    // ========================================================================

    case 'RECORDING_STARTED': {
      const { sessionId } = action.payload;
      const session = state.sessions[sessionId];
      if (!session) return state;

      // If another session is recording, pause it first
      let newState = state;
      if (state.recordingSessionId && state.recordingSessionId !== sessionId) {
        const recordingSession = state.sessions[state.recordingSessionId];
        if (recordingSession) {
          newState = updateSession(state, state.recordingSessionId, {
            status: 'paused',
            pausedAt: new Date().toISOString(),
          });
        }
      }

      return {
        ...updateSession(newState, sessionId, {
          status: 'recording',
          startedAt: session.startedAt || new Date().toISOString(),
          pausedAt: null,
        }),
        recordingSessionId: sessionId,
        activeSessionId: sessionId,
      };
    }

    case 'RECORDING_PAUSED': {
      const { sessionId } = action.payload;
      const session = state.sessions[sessionId];
      if (!session || session.status !== 'recording') return state;

      return {
        ...updateSession(state, sessionId, {
          status: 'paused',
          pausedAt: new Date().toISOString(),
        }),
        recordingSessionId: null,
      };
    }

    case 'RECORDING_RESUMED': {
      const { sessionId } = action.payload;
      const session = state.sessions[sessionId];
      if (!session || session.status !== 'paused') return state;

      // Calculate additional paused duration
      let additionalPausedDuration = 0;
      if (session.pausedAt) {
        additionalPausedDuration = Math.floor(
          (Date.now() - new Date(session.pausedAt).getTime()) / 1000
        );
      }

      // If another session is recording, pause it first
      let newState = state;
      if (state.recordingSessionId && state.recordingSessionId !== sessionId) {
        const recordingSession = state.sessions[state.recordingSessionId];
        if (recordingSession) {
          newState = updateSession(state, state.recordingSessionId, {
            status: 'paused',
            pausedAt: new Date().toISOString(),
          });
        }
      }

      return {
        ...updateSession(newState, sessionId, {
          status: 'recording',
          pausedAt: null,
          pausedDuration: session.pausedDuration + additionalPausedDuration,
        }),
        recordingSessionId: sessionId,
        activeSessionId: sessionId,
      };
    }

    case 'RECORDING_STOPPED': {
      const { sessionId, finalDuration } = action.payload;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...updateSession(state, sessionId, {
          status: 'complete',
          duration: finalDuration,
          pausedAt: null,
        }),
        recordingSessionId: state.recordingSessionId === sessionId ? null : state.recordingSessionId,
      };
    }

    case 'RECORDING_DISCARDED': {
      return removeSession(state, action.payload.sessionId);
    }

    case 'RECORDING_ERROR': {
      const { sessionId, error } = action.payload;

      return {
        ...updateSession(state, sessionId, {
          status: 'error',
          error,
        }),
        recordingSessionId: state.recordingSessionId === sessionId ? null : state.recordingSessionId,
      };
    }

    // ========================================================================
    // Transcript Actions
    // ========================================================================

    case 'SEGMENT_RECEIVED': {
      const { sessionId, segment } = action.payload;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return updateSession(state, sessionId, {
        segments: [...session.segments, segment],
        currentSegment: null,
      });
    }

    case 'PARTIAL_SEGMENT_UPDATED': {
      const { sessionId, partial } = action.payload;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return updateSession(state, sessionId, {
        currentSegment: partial,
      });
    }

    case 'DURATION_UPDATED': {
      const { sessionId, duration } = action.payload;
      return updateSession(state, sessionId, { duration });
    }

    // ========================================================================
    // Navigation Actions
    // ========================================================================

    case 'ENCOUNTER_SWITCHED': {
      const { encounterId } = action.payload;
      const sessionId = state.sessionsByEncounter[encounterId];

      if (sessionId) {
        // Activate existing session for this encounter
        return {
          ...state,
          activeSessionId: sessionId,
        };
      }

      // No session for this encounter - clear active
      return {
        ...state,
        activeSessionId: null,
      };
    }

    case 'WORKSPACE_NAVIGATED_AWAY': {
      // Auto-pause any recording session
      if (state.recordingSessionId) {
        const session = state.sessions[state.recordingSessionId];
        if (session && session.status === 'recording') {
          return {
            ...updateSession(state, state.recordingSessionId, {
              status: 'paused',
              pausedAt: new Date().toISOString(),
            }),
            recordingSessionId: null,
          };
        }
      }
      return state;
    }

    // ========================================================================
    // Initialization
    // ========================================================================

    case 'INITIALIZED': {
      return {
        ...state,
        isInitializing: false,
      };
    }

    default:
      return state;
  }
}

export default bottomBarReducer;
