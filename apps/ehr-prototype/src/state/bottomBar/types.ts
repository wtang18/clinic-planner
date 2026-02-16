/**
 * Bottom Bar State Types
 *
 * Defines the state shape for the CSS Grid-based bottom bar orchestrator.
 * The bottom bar coordinates two modules (Transcription and AI) with mutual
 * exclusion at the palette/drawer tier.
 *
 * Tier Hierarchy:
 * - anchor (48px): Collapsed icon anchor
 * - bar (~160px): Default interactive state
 * - palette: Expanded overlay (~400px height)
 * - drawer: Full-height side panel
 */

import type { TranscriptSegment } from '../../types/transcription';

// ============================================================================
// Tier Types
// ============================================================================

/** Display tiers for bottom bar modules */
export type TierState = 'anchor' | 'bar' | 'palette' | 'drawer';

/** Which module is currently expanded (palette or drawer tier) */
export type ExpandedModule = 'transcription' | 'ai' | null;

// ============================================================================
// Transcription Session Types
// ============================================================================

/** Recording status within a transcription session */
export type RecordingStatus =
  | 'idle'           // Not started
  | 'recording'      // Actively recording
  | 'paused'         // Recording paused (can resume)
  | 'processing'     // Processing audio (post-recording)
  | 'complete'       // Recording finished, transcript ready
  | 'error';         // Error occurred

/** A single transcription session for an encounter */
export interface TranscriptionSession {
  /** Unique session identifier */
  id: string;

  /** Associated encounter ID */
  encounterId: string;

  /** Patient info for display */
  patient: {
    id: string;
    name: string;
    initials: string;
  };

  /** Current recording status */
  status: RecordingStatus;

  /** When recording started (ISO string for serialization) */
  startedAt: string | null;

  /** When recording was paused (ISO string) */
  pausedAt: string | null;

  /** Total recording duration in seconds (excludes paused time) */
  duration: number;

  /** Accumulated pause duration in seconds */
  pausedDuration: number;

  /** Live transcript segments */
  segments: TranscriptSegment[];

  /** Current segment being processed (partial) */
  currentSegment: Partial<TranscriptSegment> | null;

  /** Error message if status is 'error' */
  error: string | null;

  /** Whether this session uses simulated audio (demo mode) */
  isDemo: boolean;
}

// ============================================================================
// Bottom Bar State
// ============================================================================

/** Complete bottom bar state */
export interface BottomBarState {
  /** Current tier for transcription module */
  transcriptionTier: TierState;

  /** Current tier for AI module */
  aiTier: TierState;

  /** Currently expanded module (enforces mutual exclusion) */
  expandedModule: ExpandedModule;

  /** All transcription sessions (max 3 paused + 1 active) */
  sessions: Record<string, TranscriptionSession>;

  /** Currently active session ID (the one being recorded/viewed) */
  activeSessionId: string | null;

  /** Currently recording session ID (only one at a time system-wide) */
  recordingSessionId: string | null;

  /** Session IDs by encounter (for quick lookup) */
  sessionsByEncounter: Record<string, string>;

  /** Whether the system is initializing */
  isInitializing: boolean;
}

// ============================================================================
// Action Types
// ============================================================================

export type BottomBarAction =
  // Tier control actions
  | { type: 'TIER_CHANGED'; payload: { module: 'transcription' | 'ai'; tier: TierState } }
  | { type: 'MODULE_EXPANDED'; payload: { module: 'transcription' | 'ai' } }
  | { type: 'MODULE_COLLAPSED'; payload: { module: 'transcription' | 'ai' } }
  | { type: 'BOTH_COLLAPSED'; payload: Record<string, never> }

  // Session lifecycle actions
  | { type: 'SESSION_CREATED'; payload: { session: TranscriptionSession } }
  | { type: 'SESSION_ACTIVATED'; payload: { sessionId: string } }
  | { type: 'SESSION_REMOVED'; payload: { sessionId: string } }

  // Recording lifecycle actions
  | { type: 'RECORDING_STARTED'; payload: { sessionId: string } }
  | { type: 'RECORDING_PAUSED'; payload: { sessionId: string } }
  | { type: 'RECORDING_RESUMED'; payload: { sessionId: string } }
  | { type: 'RECORDING_STOPPED'; payload: { sessionId: string; finalDuration: number } }
  | { type: 'RECORDING_DISCARDED'; payload: { sessionId: string } }
  | { type: 'RECORDING_ERROR'; payload: { sessionId: string; error: string } }

  // Transcript actions
  | { type: 'SEGMENT_RECEIVED'; payload: { sessionId: string; segment: TranscriptSegment } }
  | { type: 'PARTIAL_SEGMENT_UPDATED'; payload: { sessionId: string; partial: Partial<TranscriptSegment> } }
  | { type: 'DURATION_UPDATED'; payload: { sessionId: string; duration: number } }

  // Navigation actions
  | { type: 'ENCOUNTER_SWITCHED'; payload: { encounterId: string } }
  | { type: 'WORKSPACE_NAVIGATED_AWAY'; payload: Record<string, never> }

  // Initialization
  | { type: 'INITIALIZED'; payload: Record<string, never> };

// ============================================================================
// Action Type Constants
// ============================================================================

export const BOTTOM_BAR_ACTION_TYPES = [
  'TIER_CHANGED',
  'MODULE_EXPANDED',
  'MODULE_COLLAPSED',
  'BOTH_COLLAPSED',
  'SESSION_CREATED',
  'SESSION_ACTIVATED',
  'SESSION_REMOVED',
  'RECORDING_STARTED',
  'RECORDING_PAUSED',
  'RECORDING_RESUMED',
  'RECORDING_STOPPED',
  'RECORDING_DISCARDED',
  'RECORDING_ERROR',
  'SEGMENT_RECEIVED',
  'PARTIAL_SEGMENT_UPDATED',
  'DURATION_UPDATED',
  'ENCOUNTER_SWITCHED',
  'WORKSPACE_NAVIGATED_AWAY',
  'INITIALIZED',
] as const;

// ============================================================================
// Helper Types
// ============================================================================

/** Session summary for UI display */
export interface SessionSummary {
  id: string;
  encounterId: string;
  patientName: string;
  patientInitials: string;
  status: RecordingStatus;
  duration: number;
  isActive: boolean;
  isRecording: boolean;
}

/** Grid template configuration based on tier states */
export interface GridTemplateConfig {
  columns: string;
  transcriptionWidth: string;
  aiWidth: string;
  gap: string;
}
