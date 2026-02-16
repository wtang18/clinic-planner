/**
 * Bottom Bar Selectors
 *
 * Memoized selectors for deriving computed values from bottom bar state.
 * Follows the pattern of the existing useEncounterState selectors.
 */

import type {
  BottomBarState,
  TranscriptionSession,
  TierState,
  GridTemplateConfig,
  SessionSummary,
} from './types';

// ============================================================================
// Session Selectors
// ============================================================================

/**
 * Get the currently active session
 */
export function selectActiveSession(state: BottomBarState): TranscriptionSession | null {
  if (!state.activeSessionId) return null;
  return state.sessions[state.activeSessionId] || null;
}

/**
 * Get the currently recording session
 */
export function selectRecordingSession(state: BottomBarState): TranscriptionSession | null {
  if (!state.recordingSessionId) return null;
  return state.sessions[state.recordingSessionId] || null;
}

/**
 * Get session for a specific encounter
 */
export function selectSessionByEncounter(
  state: BottomBarState,
  encounterId: string
): TranscriptionSession | null {
  const sessionId = state.sessionsByEncounter[encounterId];
  if (!sessionId) return null;
  return state.sessions[sessionId] || null;
}

/**
 * Get all sessions as an array, sorted by most recent activity
 */
export function selectAllSessions(state: BottomBarState): TranscriptionSession[] {
  return Object.values(state.sessions).sort((a, b) => {
    // Recording first
    if (a.status === 'recording') return -1;
    if (b.status === 'recording') return 1;

    // Then by pause time (most recent first)
    const aTime = a.pausedAt ? new Date(a.pausedAt).getTime() : 0;
    const bTime = b.pausedAt ? new Date(b.pausedAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Get session summaries for sidebar display
 */
export function selectSessionSummaries(state: BottomBarState): SessionSummary[] {
  return selectAllSessions(state).map((session) => ({
    id: session.id,
    encounterId: session.encounterId,
    patientName: session.patient.name,
    patientInitials: session.patient.initials,
    status: session.status,
    duration: session.duration,
    isActive: session.id === state.activeSessionId,
    isRecording: session.status === 'recording',
  }));
}

/**
 * Get count of paused sessions
 */
export function selectPausedSessionCount(state: BottomBarState): number {
  return Object.values(state.sessions).filter((s) => s.status === 'paused').length;
}

/**
 * Check if a new session can be created
 */
export function selectCanCreateSession(state: BottomBarState): boolean {
  // Can always create if under 3 paused sessions
  // If at 3, oldest will be evicted
  return true;
}

// ============================================================================
// Tier Selectors
// ============================================================================

/**
 * Check if transcription can expand (no other module expanded)
 */
export function selectCanExpandTranscription(state: BottomBarState): boolean {
  return state.expandedModule !== 'ai';
}

/**
 * Check if AI can expand (no other module expanded)
 */
export function selectCanExpandAI(state: BottomBarState): boolean {
  return state.expandedModule !== 'transcription';
}

/**
 * Check if either module is expanded
 */
export function selectHasExpandedModule(state: BottomBarState): boolean {
  return state.expandedModule !== null;
}

/**
 * Check if a specific tier is active
 */
export function selectIsTierActive(
  state: BottomBarState,
  module: 'transcription' | 'ai',
  tier: TierState
): boolean {
  const currentTier = module === 'transcription' ? state.transcriptionTier : state.aiTier;
  return currentTier === tier;
}

// ============================================================================
// Grid Template Selectors
// ============================================================================

/**
 * Width values for different tiers
 */
const TIER_WIDTHS: Record<TierState, string> = {
  anchor: '48px',
  bar: '1fr',
  palette: '2fr',
  drawer: 'minmax(400px, 500px)',
};

/**
 * Width constants for synchronized animations
 * Total width: 160 + 8 + 320 = 488px
 */
export const SYNC_WIDTH_CONSTANTS = {
  transcription: {
    bar: 160,
    compact: 48,
  },
  ai: {
    bar: 320,
    expanded: 432, // 488 - 8 - 48
  },
  gap: 8,
  total: 488,
} as const;

/**
 * Get CSS grid template based on current tier states
 */
export function selectGridTemplate(state: BottomBarState): GridTemplateConfig {
  const { transcriptionTier, aiTier } = state;

  // Both at bar (default)
  if (transcriptionTier === 'bar' && aiTier === 'bar') {
    return {
      columns: '1fr 1fr',
      transcriptionWidth: '1fr',
      aiWidth: '1fr',
      gap: '8px', // Synchronized animation requires 8px gap
    };
  }

  // Transcription expanded, AI collapsed
  if (transcriptionTier === 'palette' || transcriptionTier === 'drawer') {
    return {
      columns: `${TIER_WIDTHS[transcriptionTier]} ${TIER_WIDTHS.anchor}`,
      transcriptionWidth: TIER_WIDTHS[transcriptionTier],
      aiWidth: TIER_WIDTHS.anchor,
      gap: '8px',
    };
  }

  // AI expanded, transcription collapsed
  if (aiTier === 'palette' || aiTier === 'drawer') {
    return {
      columns: `${TIER_WIDTHS.anchor} ${TIER_WIDTHS[aiTier]}`,
      transcriptionWidth: TIER_WIDTHS.anchor,
      aiWidth: TIER_WIDTHS[aiTier],
      gap: '8px',
    };
  }

  // One at mini, one at bar
  if (transcriptionTier === 'anchor') {
    return {
      columns: `${TIER_WIDTHS.anchor} ${TIER_WIDTHS[aiTier]}`,
      transcriptionWidth: TIER_WIDTHS.anchor,
      aiWidth: TIER_WIDTHS[aiTier],
      gap: '8px',
    };
  }

  if (aiTier === 'anchor') {
    return {
      columns: `${TIER_WIDTHS[transcriptionTier]} ${TIER_WIDTHS.anchor}`,
      transcriptionWidth: TIER_WIDTHS[transcriptionTier],
      aiWidth: TIER_WIDTHS.anchor,
      gap: '8px',
    };
  }

  // Fallback
  return {
    columns: `${TIER_WIDTHS[transcriptionTier]} ${TIER_WIDTHS[aiTier]}`,
    transcriptionWidth: TIER_WIDTHS[transcriptionTier],
    aiWidth: TIER_WIDTHS[aiTier],
    gap: '8px',
  };
}

/**
 * Get container height based on expanded state
 */
export function selectContainerHeight(state: BottomBarState): string {
  const { transcriptionTier, aiTier } = state;

  // Drawer takes full height
  if (transcriptionTier === 'drawer' || aiTier === 'drawer') {
    return '100%';
  }

  // Palette is ~400px
  if (transcriptionTier === 'palette' || aiTier === 'palette') {
    return '400px';
  }

  // Bar height
  return '48px';
}

// ============================================================================
// Recording State Selectors
// ============================================================================

/**
 * Check if any session is currently recording
 */
export function selectIsRecording(state: BottomBarState): boolean {
  return state.recordingSessionId !== null;
}

/**
 * Get recording duration for active session
 */
export function selectActiveDuration(state: BottomBarState): number {
  const session = selectActiveSession(state);
  return session?.duration ?? 0;
}

/**
 * Check if active session is in a specific status
 */
export function selectActiveStatus(
  state: BottomBarState
): TranscriptionSession['status'] | null {
  const session = selectActiveSession(state);
  return session?.status ?? null;
}

// ============================================================================
// Transcript Selectors
// ============================================================================

/**
 * Get segments for active session
 */
export function selectActiveSegments(state: BottomBarState): TranscriptionSession['segments'] {
  const session = selectActiveSession(state);
  return session?.segments ?? [];
}

/**
 * Get current partial segment for active session
 */
export function selectActivePartialSegment(
  state: BottomBarState
): TranscriptionSession['currentSegment'] {
  const session = selectActiveSession(state);
  return session?.currentSegment ?? null;
}

/**
 * Get total word count for active session
 */
export function selectActiveWordCount(state: BottomBarState): number {
  const segments = selectActiveSegments(state);
  return segments.reduce((count, seg) => {
    return count + seg.text.split(/\s+/).filter(Boolean).length;
  }, 0);
}

// ============================================================================
// Demo Mode Selectors
// ============================================================================

/**
 * Check if active session is in demo mode
 */
export function selectIsDemo(state: BottomBarState): boolean {
  const session = selectActiveSession(state);
  return session?.isDemo ?? false;
}
