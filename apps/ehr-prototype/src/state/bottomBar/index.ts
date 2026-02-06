/**
 * Bottom Bar State Module
 *
 * Exports all bottom bar state management utilities.
 */

// Types
export type {
  TierState,
  ExpandedModule,
  RecordingStatus,
  TranscriptionSession,
  BottomBarState,
  BottomBarAction,
  SessionSummary,
  GridTemplateConfig,
} from './types';

export { BOTTOM_BAR_ACTION_TYPES } from './types';

// Initial State & Factories
export {
  initialBottomBarState,
  generateSessionId,
  createTranscriptionSession,
  createDemoBottomBarState,
  createSessionInState,
  createMultiSessionState,
} from './initialState';

// Reducer
export { bottomBarReducer, default as reducer } from './reducer';

// Selectors
export {
  // Session selectors
  selectActiveSession,
  selectRecordingSession,
  selectSessionByEncounter,
  selectAllSessions,
  selectSessionSummaries,
  selectPausedSessionCount,
  selectCanCreateSession,

  // Tier selectors
  selectCanExpandTranscription,
  selectCanExpandAI,
  selectHasExpandedModule,
  selectIsTierActive,

  // Grid template selectors
  selectGridTemplate,
  selectContainerHeight,

  // Recording selectors
  selectIsRecording,
  selectActiveDuration,
  selectActiveStatus,

  // Transcript selectors
  selectActiveSegments,
  selectActivePartialSegment,
  selectActiveWordCount,

  // Demo mode
  selectIsDemo,
} from './selectors';

// Mock Transcripts
export {
  COUGH_5_DAYS_TRANSCRIPT,
  COUGH_5_DAYS_TIMING,
  DEMO_SCENARIOS as TRANSCRIPT_SCENARIOS,
  getRevealedSegments,
  getNextSegment,
  getPartialSegmentText,
} from './mockTranscripts';

export type { DemoScenarioKey as TranscriptScenarioKey } from './mockTranscripts';

// Demo Scenarios (Pre-configured states for Storybook)
export {
  DEMO_PATIENTS,
  DEMO_SCENARIOS,
  SCENARIO_IDLE,
  SCENARIO_READY_TO_RECORD,
  SCENARIO_RECORDING,
  SCENARIO_PAUSED,
  SCENARIO_WITH_SEGMENTS,
  SCENARIO_COMPLETE,
  SCENARIO_MULTIPLE_PAUSED,
  SCENARIO_ONE_ACTIVE_TWO_PAUSED,
  SCENARIO_TRANSCRIPTION_PALETTE,
  SCENARIO_AI_PALETTE,
  SCENARIO_TRANSCRIPTION_DRAWER,
  SCENARIO_BOTH_BARS,
  SCENARIO_TRANSCRIPTION_MINI,
  SCENARIO_AI_MINI,
  withTiers,
} from './demoScenarios';

export type { DemoScenarioKey } from './demoScenarios';
