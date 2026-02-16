/**
 * Demo Scenarios for Bottom Bar System
 *
 * Pre-configured states for demonstrating the bottom bar system
 * in Storybook and interactive demos.
 */

import type { BottomBarState, TranscriptionSession, TierState } from './types';
import {
  initialBottomBarState,
  createSessionInState,
  createMultiSessionState,
} from './initialState';
import { COUGH_5_DAYS_TRANSCRIPT } from './mockTranscripts';

// ============================================================================
// Demo Patients
// ============================================================================

export const DEMO_PATIENTS = {
  laurenSvendsen: {
    id: 'pt-uc-001',
    name: 'Lauren Svendsen',
    initials: 'LS',
  },
  robertMartinez: {
    id: 'pt-pc-001',
    name: 'Robert Martinez',
    initials: 'RM',
  },
  sarahChen: {
    id: 'pt-001',
    name: 'Sarah Chen',
    initials: 'SC',
  },
  michaelJohnson: {
    id: 'pt-002',
    name: 'Michael Johnson',
    initials: 'MJ',
  },
} as const;

// ============================================================================
// Single Session Scenarios
// ============================================================================

export const SCENARIO_IDLE: BottomBarState = {
  ...initialBottomBarState,
  sessions: {},
  activeSessionId: null,
  isInitializing: false,
};

export const SCENARIO_READY_TO_RECORD: BottomBarState = (() => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'idle'
  );
  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    sessionsByEncounter: { 'enc-001': session.id },
    isInitializing: false,
  };
})();

export const SCENARIO_RECORDING: BottomBarState = (() => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'recording',
    { duration: 45 }
  );
  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    recordingSessionId: session.id,
    sessionsByEncounter: { 'enc-001': session.id },
    isInitializing: false,
  };
})();

export const SCENARIO_PAUSED: BottomBarState = (() => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'paused',
    { duration: 120 }
  );
  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    sessionsByEncounter: { 'enc-001': session.id },
    isInitializing: false,
  };
})();

export const SCENARIO_WITH_SEGMENTS: BottomBarState = (() => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'recording',
    {
      duration: 45,
      segments: COUGH_5_DAYS_TRANSCRIPT.slice(0, 5),
    }
  );
  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    recordingSessionId: session.id,
    sessionsByEncounter: { 'enc-001': session.id },
    isInitializing: false,
  };
})();

export const SCENARIO_COMPLETE: BottomBarState = (() => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'complete',
    {
      duration: 180,
      segments: COUGH_5_DAYS_TRANSCRIPT,
    }
  );
  return {
    ...initialBottomBarState,
    sessions: { [session.id]: session },
    activeSessionId: session.id,
    sessionsByEncounter: { 'enc-001': session.id },
    isInitializing: false,
  };
})();

// ============================================================================
// Multi-Session Scenarios
// ============================================================================

export const SCENARIO_MULTIPLE_PAUSED: BottomBarState = createMultiSessionState([
  {
    encounterId: 'enc-001',
    patient: DEMO_PATIENTS.laurenSvendsen,
    status: 'paused',
    duration: 120,
  },
  {
    encounterId: 'enc-002',
    patient: DEMO_PATIENTS.robertMartinez,
    status: 'paused',
    duration: 90,
  },
  {
    encounterId: 'enc-003',
    patient: DEMO_PATIENTS.sarahChen,
    status: 'paused',
    duration: 60,
  },
]);

export const SCENARIO_ONE_ACTIVE_TWO_PAUSED: BottomBarState = createMultiSessionState([
  {
    encounterId: 'enc-001',
    patient: DEMO_PATIENTS.laurenSvendsen,
    status: 'recording',
    duration: 45,
  },
  {
    encounterId: 'enc-002',
    patient: DEMO_PATIENTS.robertMartinez,
    status: 'paused',
    duration: 120,
  },
  {
    encounterId: 'enc-003',
    patient: DEMO_PATIENTS.sarahChen,
    status: 'paused',
    duration: 90,
  },
]);

// ============================================================================
// Tier Configuration Scenarios
// ============================================================================

export function withTiers(
  state: BottomBarState,
  transcriptionTier: TierState,
  aiTier: TierState
): BottomBarState {
  const expandedModule = (() => {
    if (transcriptionTier === 'palette' || transcriptionTier === 'drawer') {
      return 'transcription' as const;
    }
    if (aiTier === 'palette' || aiTier === 'drawer') {
      return 'ai' as const;
    }
    return null;
  })();

  return {
    ...state,
    transcriptionTier,
    aiTier,
    expandedModule,
  };
}

// Pre-configured tier scenarios
export const SCENARIO_TRANSCRIPTION_PALETTE = withTiers(SCENARIO_RECORDING, 'palette', 'anchor');
export const SCENARIO_AI_PALETTE = withTiers(SCENARIO_RECORDING, 'anchor', 'palette');
export const SCENARIO_TRANSCRIPTION_DRAWER = withTiers(SCENARIO_WITH_SEGMENTS, 'drawer', 'anchor');
export const SCENARIO_BOTH_BARS = withTiers(SCENARIO_RECORDING, 'bar', 'bar');
export const SCENARIO_TRANSCRIPTION_MINI = withTiers(SCENARIO_RECORDING, 'anchor', 'bar');
export const SCENARIO_AI_MINI = withTiers(SCENARIO_RECORDING, 'bar', 'anchor');

// ============================================================================
// All Scenarios Map
// ============================================================================

export const DEMO_SCENARIOS = {
  idle: {
    name: 'Idle (No Session)',
    description: 'Initial state with no transcription session',
    state: SCENARIO_IDLE,
  },
  readyToRecord: {
    name: 'Ready to Record',
    description: 'Session created, waiting to start recording',
    state: SCENARIO_READY_TO_RECORD,
  },
  recording: {
    name: 'Recording',
    description: 'Active recording in progress',
    state: SCENARIO_RECORDING,
  },
  paused: {
    name: 'Paused',
    description: 'Recording paused',
    state: SCENARIO_PAUSED,
  },
  withSegments: {
    name: 'Recording with Segments',
    description: 'Recording with live transcript segments',
    state: SCENARIO_WITH_SEGMENTS,
  },
  complete: {
    name: 'Complete',
    description: 'Recording finished with full transcript',
    state: SCENARIO_COMPLETE,
  },
  multiplePaused: {
    name: 'Multiple Paused',
    description: 'Three paused sessions from different encounters',
    state: SCENARIO_MULTIPLE_PAUSED,
  },
  oneActiveTwoPaused: {
    name: 'One Active + Two Paused',
    description: 'One recording session with two paused',
    state: SCENARIO_ONE_ACTIVE_TWO_PAUSED,
  },
  transcriptionPalette: {
    name: 'Transcription Palette Open',
    description: 'Transcription expanded to palette view',
    state: SCENARIO_TRANSCRIPTION_PALETTE,
  },
  aiPalette: {
    name: 'AI Palette Open',
    description: 'AI assistant expanded to palette view',
    state: SCENARIO_AI_PALETTE,
  },
  transcriptionDrawer: {
    name: 'Transcription Drawer Open',
    description: 'Transcription expanded to full drawer',
    state: SCENARIO_TRANSCRIPTION_DRAWER,
  },
  bothBars: {
    name: 'Both at Bar',
    description: 'Both modules at bar tier (default)',
    state: SCENARIO_BOTH_BARS,
  },
} as const;

export type DemoScenarioKey = keyof typeof DEMO_SCENARIOS;
