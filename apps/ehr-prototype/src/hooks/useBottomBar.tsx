/**
 * useBottomBar Hook
 *
 * Provides access to bottom bar state and actions for managing
 * the transcription and AI modules.
 *
 * Tier state is sourced from CoordinationProvider (single source of truth).
 * Session state is sourced from BottomBarProvider.
 *
 * Includes three focused hooks:
 * - useBottomBar: Full state and dispatch access
 * - useTranscription: Recording-specific state and actions
 * - useTierControls: Tier switching controls
 */

import React, { useReducer, useCallback, useMemo, useRef, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import {
  bottomBarReducer,
  initialBottomBarState,
  createTranscriptionSession,
  selectActiveSession,
  selectRecordingSession,
  selectGridTemplate as selectLegacyGridTemplate,
  selectIsRecording,
  selectActiveStatus,
  selectActiveDuration,
  selectActiveSegments,
  selectActivePartialSegment,
  selectSessionSummaries,
  selectCanExpandTranscription,
  selectCanExpandAI,
  getRevealedSegments,
  getPartialSegmentText,
  COUGH_5_DAYS_TRANSCRIPT,
  COUGH_5_DAYS_TIMING,
} from '../state/bottomBar';
import type {
  BottomBarState,
  BottomBarAction,
  TierState,
  TranscriptionSession,
  SessionSummary,
  GridTemplateConfig,
} from '../state/bottomBar';
import { useCoordination } from './useCoordination';
import type { TierState as CoordTierState, ModuleId } from '../state/coordination';

/**
 * Derive expandedModule from coordination state.
 */
function deriveExpandedModule(
  aiTier: CoordTierState,
  txTier: CoordTierState,
  txEligible: boolean
): 'transcription' | 'ai' | null {
  if (aiTier === 'palette' || aiTier === 'drawer') return 'ai';
  if (txEligible && (txTier === 'palette' || txTier === 'drawer')) return 'transcription';
  return null;
}

// ============================================================================
// Context (Session state only)
// ============================================================================

interface BottomBarContextValue {
  state: BottomBarState;
  dispatch: React.Dispatch<BottomBarAction>;
}

const BottomBarContext = createContext<BottomBarContextValue | null>(null);

// ============================================================================
// Provider (Session state — tiers come from CoordinationProvider)
// ============================================================================

export interface BottomBarProviderProps {
  children: ReactNode;
  /** Initial state override (for testing/Storybook) */
  initialState?: Partial<BottomBarState>;
  /** Demo mode - uses simulated transcription */
  demoMode?: boolean;
}

export function BottomBarProvider({
  children,
  initialState,
  demoMode = true,
}: BottomBarProviderProps) {
  const [state, dispatch] = useReducer(bottomBarReducer, {
    ...initialBottomBarState,
    ...initialState,
    isInitializing: false,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <BottomBarContext.Provider value={value}>
      {children}
    </BottomBarContext.Provider>
  );
}

// ============================================================================
// useBottomBar Hook
// ============================================================================

export interface BottomBarActions {
  // Tier controls (dispatch to CoordinationProvider)
  setTranscriptionTier: (tier: TierState) => void;
  setAITier: (tier: TierState) => void;
  expandModule: (module: 'transcription' | 'ai') => void;
  collapseModule: (module: 'transcription' | 'ai') => void;
  collapseAll: () => void;

  // Session management (dispatch to BottomBarProvider)
  createSession: (
    encounterId: string,
    patient: { id: string; name: string; initials?: string }
  ) => void;
  activateSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  switchEncounter: (encounterId: string) => void;

  // Recording controls (dispatch to BottomBarProvider)
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  discardRecording: () => void;
}

export interface UseBottomBarReturn {
  state: BottomBarState;
  actions: BottomBarActions;
  // Derived values
  activeSession: TranscriptionSession | null;
  recordingSession: TranscriptionSession | null;
  gridTemplate: GridTemplateConfig;
  sessionSummaries: SessionSummary[];
  isRecording: boolean;
  canExpandTranscription: boolean;
  canExpandAI: boolean;
}

export function useBottomBar(): UseBottomBarReturn {
  const bbContext = useContext(BottomBarContext);

  if (!bbContext) {
    throw new Error('useBottomBar must be used within a BottomBarProvider');
  }

  const { state: bbState, dispatch: bbDispatch } = bbContext;
  const { state: coordState, dispatch: coordDispatch } = useCoordination();

  // Merge state: session data from BottomBarProvider, tiers from CoordinationProvider
  const state: BottomBarState = useMemo(
    () => ({
      ...bbState,
      transcriptionTier: coordState.txTier,
      aiTier: coordState.aiTier,
      expandedModule: deriveExpandedModule(coordState.aiTier, coordState.txTier, coordState.txEligible),
    }),
    [bbState, coordState.aiTier, coordState.txTier, coordState.txEligible]
  );

  // ---------------------------------------------------------------------------
  // Tier controls — dispatch to CoordinationProvider
  // Maps legacy imperative tier sets to semantic coordination actions.
  // ---------------------------------------------------------------------------

  const setTranscriptionTier = useCallback(
    (tier: TierState) => {
      const coordTier = tier;
      const currentTier = coordState.txTier;

      if (coordTier === currentTier) return;

      if (coordTier === 'palette') {
        if (currentTier === 'bar') {
          coordDispatch({ type: 'BAR_TAPPED', payload: { module: 'tm' } });
        } else if (currentTier === 'anchor') {
          coordDispatch({ type: 'ANCHOR_TAPPED', payload: { module: 'tm' } });
        }
      } else if (coordTier === 'bar') {
        if (currentTier === 'palette') {
          coordDispatch({ type: 'PALETTE_COLLAPSED', payload: { module: 'tm' } });
        }
      } else if (coordTier === 'drawer') {
        if (currentTier === 'palette') {
          coordDispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'tm' } });
        }
      }
    },
    [coordState.txTier, coordDispatch]
  );

  const setAITier = useCallback(
    (tier: TierState) => {
      const coordTier = tier;
      const currentTier = coordState.aiTier;

      if (coordTier === currentTier) return;

      if (coordTier === 'palette') {
        if (currentTier === 'bar') {
          coordDispatch({ type: 'BAR_TAPPED', payload: { module: 'ai' } });
        } else if (currentTier === 'anchor') {
          coordDispatch({ type: 'ANCHOR_TAPPED', payload: { module: 'ai' } });
        }
      } else if (coordTier === 'bar') {
        if (currentTier === 'palette') {
          coordDispatch({ type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } });
        }
      } else if (coordTier === 'drawer') {
        if (currentTier === 'palette') {
          coordDispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'ai' } });
        }
      }
    },
    [coordState.aiTier, coordDispatch]
  );

  const expandModule = useCallback(
    (module: 'transcription' | 'ai') => {
      const coordModule: ModuleId = module === 'transcription' ? 'tm' : 'ai';
      const currentTier = coordModule === 'ai' ? coordState.aiTier : coordState.txTier;

      if (currentTier === 'bar') {
        coordDispatch({ type: 'BAR_TAPPED', payload: { module: coordModule } });
      } else if (currentTier === 'anchor') {
        coordDispatch({ type: 'ANCHOR_TAPPED', payload: { module: coordModule } });
      }
    },
    [coordState.aiTier, coordState.txTier, coordDispatch]
  );

  const collapseModule = useCallback(
    (module: 'transcription' | 'ai') => {
      const coordModule: ModuleId = module === 'transcription' ? 'tm' : 'ai';
      const currentTier = coordModule === 'ai' ? coordState.aiTier : coordState.txTier;

      if (currentTier === 'palette') {
        coordDispatch({ type: 'PALETTE_COLLAPSED', payload: { module: coordModule } });
      }
    },
    [coordState.aiTier, coordState.txTier, coordDispatch]
  );

  const collapseAll = useCallback(() => {
    coordDispatch({ type: 'ESCAPE_PRESSED' });
  }, [coordDispatch]);

  // ---------------------------------------------------------------------------
  // Session management — dispatch to BottomBarProvider
  // ---------------------------------------------------------------------------

  const createSession = useCallback(
    (
      encounterId: string,
      patient: { id: string; name: string; initials?: string }
    ) => {
      const session = createTranscriptionSession(encounterId, patient, { isDemo: true });
      bbDispatch({ type: 'SESSION_CREATED', payload: { session } });
    },
    [bbDispatch]
  );

  const activateSession = useCallback(
    (sessionId: string) => {
      bbDispatch({ type: 'SESSION_ACTIVATED', payload: { sessionId } });
    },
    [bbDispatch]
  );

  const removeSession = useCallback(
    (sessionId: string) => {
      bbDispatch({ type: 'SESSION_REMOVED', payload: { sessionId } });
    },
    [bbDispatch]
  );

  const switchEncounter = useCallback(
    (encounterId: string) => {
      bbDispatch({ type: 'ENCOUNTER_SWITCHED', payload: { encounterId } });
    },
    [bbDispatch]
  );

  // Recording controls
  const startRecording = useCallback(() => {
    const activeSession = selectActiveSession(bbState);
    if (activeSession) {
      bbDispatch({ type: 'RECORDING_STARTED', payload: { sessionId: activeSession.id } });
    }
  }, [bbDispatch, bbState]);

  const pauseRecording = useCallback(() => {
    const recordingSession = selectRecordingSession(bbState);
    if (recordingSession) {
      bbDispatch({ type: 'RECORDING_PAUSED', payload: { sessionId: recordingSession.id } });
    }
  }, [bbDispatch, bbState]);

  const resumeRecording = useCallback(() => {
    const activeSession = selectActiveSession(bbState);
    if (activeSession && activeSession.status === 'paused') {
      bbDispatch({ type: 'RECORDING_RESUMED', payload: { sessionId: activeSession.id } });
    }
  }, [bbDispatch, bbState]);

  const stopRecording = useCallback(() => {
    const recordingSession = selectRecordingSession(bbState);
    if (recordingSession) {
      bbDispatch({
        type: 'RECORDING_STOPPED',
        payload: {
          sessionId: recordingSession.id,
          finalDuration: recordingSession.duration,
        },
      });
    }
  }, [bbDispatch, bbState]);

  const discardRecording = useCallback(() => {
    const activeSession = selectActiveSession(bbState);
    if (activeSession) {
      bbDispatch({ type: 'RECORDING_DISCARDED', payload: { sessionId: activeSession.id } });
    }
  }, [bbDispatch, bbState]);

  const actions: BottomBarActions = useMemo(
    () => ({
      setTranscriptionTier,
      setAITier,
      expandModule,
      collapseModule,
      collapseAll,
      createSession,
      activateSession,
      removeSession,
      switchEncounter,
      startRecording,
      pauseRecording,
      resumeRecording,
      stopRecording,
      discardRecording,
    }),
    [
      setTranscriptionTier, setAITier, expandModule, collapseModule, collapseAll,
      createSession, activateSession, removeSession, switchEncounter,
      startRecording, pauseRecording, resumeRecording, stopRecording, discardRecording,
    ]
  );

  // Derived values (using merged state for backward compat with old selectors)
  const activeSession = useMemo(() => selectActiveSession(state), [state]);
  const recordingSession = useMemo(() => selectRecordingSession(state), [state]);
  const gridTemplate = useMemo(() => selectLegacyGridTemplate(state), [state]);
  const sessionSummaries = useMemo(() => selectSessionSummaries(state), [state]);
  const isRecording = useMemo(() => selectIsRecording(state), [state]);
  const canExpandTranscription = useMemo(() => selectCanExpandTranscription(state), [state]);
  const canExpandAI = useMemo(() => selectCanExpandAI(state), [state]);

  return {
    state,
    actions,
    activeSession,
    recordingSession,
    gridTemplate,
    sessionSummaries,
    isRecording,
    canExpandTranscription,
    canExpandAI,
  };
}

// ============================================================================
// useTranscription Hook (unchanged — reads from adapted useBottomBar)
// ============================================================================

export interface UseTranscriptionReturn {
  // Session info
  session: TranscriptionSession | null;
  status: TranscriptionSession['status'] | null;
  duration: number;
  segments: TranscriptionSession['segments'];
  partialSegment: TranscriptionSession['currentSegment'];

  // Flags
  isRecording: boolean;
  isPaused: boolean;
  isIdle: boolean;
  isComplete: boolean;
  hasError: boolean;
  isDemo: boolean;

  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  discard: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const { state, actions, activeSession, isRecording } = useBottomBar();

  const status = useMemo(() => selectActiveStatus(state), [state]);
  const duration = useMemo(() => selectActiveDuration(state), [state]);
  const segments = useMemo(() => selectActiveSegments(state), [state]);
  const partialSegment = useMemo(() => selectActivePartialSegment(state), [state]);

  const isPaused = status === 'paused';
  const isIdle = status === 'idle' || status === null;
  const isComplete = status === 'complete';
  const hasError = status === 'error';
  const isDemo = activeSession?.isDemo ?? false;

  return {
    session: activeSession,
    status,
    duration,
    segments,
    partialSegment,
    isRecording,
    isPaused,
    isIdle,
    isComplete,
    hasError,
    isDemo,
    start: actions.startRecording,
    pause: actions.pauseRecording,
    resume: actions.resumeRecording,
    stop: actions.stopRecording,
    discard: actions.discardRecording,
  };
}

// ============================================================================
// useTierControls Hook (reads tiers from coordination via adapted useBottomBar)
// ============================================================================

export interface UseTierControlsReturn {
  // Current tiers
  transcriptionTier: TierState;
  aiTier: TierState;
  expandedModule: 'transcription' | 'ai' | null;

  // Grid template
  gridTemplate: GridTemplateConfig;

  // Flags
  canExpandTranscription: boolean;
  canExpandAI: boolean;
  hasExpanded: boolean;

  // Actions
  setTranscriptionTier: (tier: TierState) => void;
  setAITier: (tier: TierState) => void;
  expandTranscription: () => void;
  expandAI: () => void;
  collapseTranscription: () => void;
  collapseAI: () => void;
  collapseAll: () => void;

  // Toggle helpers
  toggleTranscriptionExpanded: () => void;
  toggleAIExpanded: () => void;
}

export function useTierControls(): UseTierControlsReturn {
  const { state, actions, gridTemplate, canExpandTranscription, canExpandAI } = useBottomBar();

  const toggleTranscriptionExpanded = useCallback(() => {
    if (state.transcriptionTier === 'palette' || state.transcriptionTier === 'drawer') {
      actions.collapseModule('transcription');
    } else {
      actions.expandModule('transcription');
    }
  }, [state.transcriptionTier, actions]);

  const toggleAIExpanded = useCallback(() => {
    if (state.aiTier === 'palette' || state.aiTier === 'drawer') {
      actions.collapseModule('ai');
    } else {
      actions.expandModule('ai');
    }
  }, [state.aiTier, actions]);

  return {
    transcriptionTier: state.transcriptionTier,
    aiTier: state.aiTier,
    expandedModule: state.expandedModule,
    gridTemplate,
    canExpandTranscription,
    canExpandAI,
    hasExpanded: state.expandedModule !== null,
    setTranscriptionTier: actions.setTranscriptionTier,
    setAITier: actions.setAITier,
    expandTranscription: () => actions.expandModule('transcription'),
    expandAI: () => actions.expandModule('ai'),
    collapseTranscription: () => actions.collapseModule('transcription'),
    collapseAI: () => actions.collapseModule('ai'),
    collapseAll: actions.collapseAll,
    toggleTranscriptionExpanded,
    toggleAIExpanded,
  };
}

// ============================================================================
// useDemoTranscription Hook (unchanged — session-only)
// ============================================================================

/**
 * Hook for demo mode transcription that progressively reveals segments.
 * Used in demo/Storybook scenarios.
 */
export function useDemoTranscription(
  isActive: boolean = false,
  scenarioKey: 'cough-5-days' = 'cough-5-days'
) {
  const { state, activeSession } = useBottomBar();
  const dispatch = useContext(BottomBarContext)?.dispatch;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRevealedIndexRef = useRef(0);

  // Start/stop demo timer based on recording status
  useEffect(() => {
    const session = activeSession;
    const isRecording = session?.status === 'recording' && session.isDemo;

    if (isRecording && isActive && dispatch) {
      // Start timer
      timerRef.current = setInterval(() => {
        const currentDuration = session.duration + 1;

        // Update duration
        dispatch({
          type: 'DURATION_UPDATED',
          payload: { sessionId: session.id, duration: currentDuration },
        });

        // Check for new segments to reveal
        const newSegments = getRevealedSegments(currentDuration, COUGH_5_DAYS_TRANSCRIPT, COUGH_5_DAYS_TIMING);

        // Reveal any new segments
        if (newSegments.length > lastRevealedIndexRef.current) {
          const newlyRevealed = newSegments.slice(lastRevealedIndexRef.current);
          for (const segment of newlyRevealed) {
            dispatch({
              type: 'SEGMENT_RECEIVED',
              payload: { sessionId: session.id, segment },
            });
          }
          lastRevealedIndexRef.current = newSegments.length;
        }

        // Update partial segment
        const partial = getPartialSegmentText(currentDuration, COUGH_5_DAYS_TRANSCRIPT, COUGH_5_DAYS_TIMING);
        if (partial) {
          dispatch({
            type: 'PARTIAL_SEGMENT_UPDATED',
            payload: { sessionId: session.id, partial },
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeSession?.status, activeSession?.isDemo, isActive, dispatch, activeSession]);

  // Reset revealed index when session changes
  useEffect(() => {
    lastRevealedIndexRef.current = 0;
  }, [activeSession?.id]);
}

// ============================================================================
// Export Context for Advanced Use Cases
// ============================================================================

export { BottomBarContext };
