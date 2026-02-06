/**
 * useBottomBar Hook
 *
 * Provides access to bottom bar state and actions for managing
 * the transcription and AI modules.
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
  selectGridTemplate,
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

// ============================================================================
// Context
// ============================================================================

interface BottomBarContextValue {
  state: BottomBarState;
  dispatch: React.Dispatch<BottomBarAction>;
}

const BottomBarContext = createContext<BottomBarContextValue | null>(null);

// ============================================================================
// Provider
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
  // Tier controls
  setTranscriptionTier: (tier: TierState) => void;
  setAITier: (tier: TierState) => void;
  expandModule: (module: 'transcription' | 'ai') => void;
  collapseModule: (module: 'transcription' | 'ai') => void;
  collapseAll: () => void;

  // Session management
  createSession: (
    encounterId: string,
    patient: { id: string; name: string; initials?: string }
  ) => void;
  activateSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  switchEncounter: (encounterId: string) => void;

  // Recording controls
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
  const context = useContext(BottomBarContext);

  if (!context) {
    throw new Error('useBottomBar must be used within a BottomBarProvider');
  }

  const { state, dispatch } = context;

  // Tier controls
  const setTranscriptionTier = useCallback(
    (tier: TierState) => {
      dispatch({ type: 'TIER_CHANGED', payload: { module: 'transcription', tier } });
    },
    [dispatch]
  );

  const setAITier = useCallback(
    (tier: TierState) => {
      dispatch({ type: 'TIER_CHANGED', payload: { module: 'ai', tier } });
    },
    [dispatch]
  );

  const expandModule = useCallback(
    (module: 'transcription' | 'ai') => {
      dispatch({ type: 'MODULE_EXPANDED', payload: { module } });
    },
    [dispatch]
  );

  const collapseModule = useCallback(
    (module: 'transcription' | 'ai') => {
      dispatch({ type: 'MODULE_COLLAPSED', payload: { module } });
    },
    [dispatch]
  );

  const collapseAll = useCallback(() => {
    dispatch({ type: 'BOTH_COLLAPSED', payload: {} });
  }, [dispatch]);

  // Session management
  const createSession = useCallback(
    (
      encounterId: string,
      patient: { id: string; name: string; initials?: string }
    ) => {
      const session = createTranscriptionSession(encounterId, patient, { isDemo: true });
      dispatch({ type: 'SESSION_CREATED', payload: { session } });
    },
    [dispatch]
  );

  const activateSession = useCallback(
    (sessionId: string) => {
      dispatch({ type: 'SESSION_ACTIVATED', payload: { sessionId } });
    },
    [dispatch]
  );

  const removeSession = useCallback(
    (sessionId: string) => {
      dispatch({ type: 'SESSION_REMOVED', payload: { sessionId } });
    },
    [dispatch]
  );

  const switchEncounter = useCallback(
    (encounterId: string) => {
      dispatch({ type: 'ENCOUNTER_SWITCHED', payload: { encounterId } });
    },
    [dispatch]
  );

  // Recording controls
  const startRecording = useCallback(() => {
    const activeSession = selectActiveSession(state);
    if (activeSession) {
      dispatch({ type: 'RECORDING_STARTED', payload: { sessionId: activeSession.id } });
    }
  }, [dispatch, state]);

  const pauseRecording = useCallback(() => {
    const recordingSession = selectRecordingSession(state);
    if (recordingSession) {
      dispatch({ type: 'RECORDING_PAUSED', payload: { sessionId: recordingSession.id } });
    }
  }, [dispatch, state]);

  const resumeRecording = useCallback(() => {
    const activeSession = selectActiveSession(state);
    if (activeSession && activeSession.status === 'paused') {
      dispatch({ type: 'RECORDING_RESUMED', payload: { sessionId: activeSession.id } });
    }
  }, [dispatch, state]);

  const stopRecording = useCallback(() => {
    const recordingSession = selectRecordingSession(state);
    if (recordingSession) {
      dispatch({
        type: 'RECORDING_STOPPED',
        payload: {
          sessionId: recordingSession.id,
          finalDuration: recordingSession.duration,
        },
      });
    }
  }, [dispatch, state]);

  const discardRecording = useCallback(() => {
    const activeSession = selectActiveSession(state);
    if (activeSession) {
      dispatch({ type: 'RECORDING_DISCARDED', payload: { sessionId: activeSession.id } });
    }
  }, [dispatch, state]);

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
    ]
  );

  // Derived values
  const activeSession = useMemo(() => selectActiveSession(state), [state]);
  const recordingSession = useMemo(() => selectRecordingSession(state), [state]);
  const gridTemplate = useMemo(() => selectGridTemplate(state), [state]);
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
// useTranscription Hook
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
// useTierControls Hook
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
// useDemoTranscription Hook
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
