/**
 * Bottom Bar Initial State
 *
 * Provides the default state and factory functions for creating
 * transcription sessions.
 */

import type {
  BottomBarState,
  TranscriptionSession,
  RecordingStatus,
} from './types';

// ============================================================================
// Initial State
// ============================================================================

/** Default bottom bar state */
export const initialBottomBarState: BottomBarState = {
  transcriptionTier: 'bar',
  aiTier: 'bar',
  expandedModule: null,
  sessions: {},
  activeSessionId: null,
  recordingSessionId: null,
  sessionsByEncounter: {},
  isInitializing: true,
};

// ============================================================================
// Session Factory
// ============================================================================

let sessionIdCounter = 0;

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  sessionIdCounter += 1;
  return `session-${Date.now()}-${sessionIdCounter}`;
}

/**
 * Create a new transcription session
 */
export function createTranscriptionSession(
  encounterId: string,
  patient: { id: string; name: string; initials?: string },
  options: { isDemo?: boolean } = {}
): TranscriptionSession {
  const initials =
    patient.initials ||
    patient.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return {
    id: generateSessionId(),
    encounterId,
    patient: {
      id: patient.id,
      name: patient.name,
      initials,
    },
    status: 'idle',
    startedAt: null,
    pausedAt: null,
    duration: 0,
    pausedDuration: 0,
    segments: [],
    currentSegment: null,
    error: null,
    isDemo: options.isDemo ?? false,
  };
}

// ============================================================================
// Demo State Factory
// ============================================================================

/**
 * Create initial state with a demo session
 */
export function createDemoBottomBarState(
  encounterId: string,
  patient: { id: string; name: string; initials?: string }
): BottomBarState {
  const session = createTranscriptionSession(encounterId, patient, { isDemo: true });

  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    sessionsByEncounter: { [encounterId]: session.id },
    isInitializing: false,
  };
}

/**
 * Create a session in a specific recording state (for Storybook)
 */
export function createSessionInState(
  encounterId: string,
  patient: { id: string; name: string; initials?: string },
  status: RecordingStatus,
  options: {
    duration?: number;
    isDemo?: boolean;
    segments?: TranscriptionSession['segments'];
  } = {}
): TranscriptionSession {
  const session = createTranscriptionSession(encounterId, patient, {
    isDemo: options.isDemo ?? true,
  });

  const now = new Date().toISOString();
  const startTime = new Date(Date.now() - (options.duration ?? 0) * 1000).toISOString();

  return {
    ...session,
    status,
    startedAt: status !== 'idle' ? startTime : null,
    pausedAt: status === 'paused' ? now : null,
    duration: options.duration ?? 0,
    segments: options.segments ?? [],
  };
}

/**
 * Create state with multiple paused sessions (for testing max sessions)
 */
export function createMultiSessionState(
  sessions: Array<{
    encounterId: string;
    patient: { id: string; name: string; initials?: string };
    status: RecordingStatus;
    duration?: number;
  }>
): BottomBarState {
  const state: BottomBarState = {
    ...initialBottomBarState,
    isInitializing: false,
  };

  let activeId: string | null = null;
  let recordingId: string | null = null;

  for (const config of sessions) {
    const session = createSessionInState(
      config.encounterId,
      config.patient,
      config.status,
      { duration: config.duration, isDemo: true }
    );

    state.sessions[session.id] = session;
    state.sessionsByEncounter[config.encounterId] = session.id;

    // First session becomes active
    if (!activeId) {
      activeId = session.id;
    }

    // Track recording session
    if (config.status === 'recording') {
      recordingId = session.id;
      activeId = session.id; // Recording session should be active
    }
  }

  state.activeSessionId = activeId;
  state.recordingSessionId = recordingId;

  return state;
}
