/**
 * useLeftPane Hook
 *
 * Provides access to left pane state and actions for managing
 * the multi-view left pane system.
 *
 * Includes:
 * - useLeftPane: Full state and dispatch access
 * - useLeftPaneActions: Action dispatchers only
 * - useBottomBarVisibility: Derived bottom bar visibility state
 *
 * @see LEFT_PANE_SYSTEM.md for behavioral specification
 * @see DRAWER_COORDINATION.md for coordination with bottom bar
 */

import React, {
  useReducer,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react';
import type { ReactNode } from 'react';
import {
  leftPaneReducer,
  initialLeftPaneState,
  deriveBottomBarVisibility,
  selectTranscriptViewAvailable,
} from '../state/leftPane';
import type {
  LeftPaneState,
  LeftPaneAction,
  PaneView,
  BottomBarVisibility,
} from '../state/leftPane';
import type { TierState } from '../state/bottomBar';

// ============================================================================
// Context
// ============================================================================

interface LeftPaneContextValue {
  state: LeftPaneState;
  dispatch: React.Dispatch<LeftPaneAction>;
}

const LeftPaneContext = createContext<LeftPaneContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface LeftPaneProviderProps {
  children: ReactNode;
  /** Initial state override (for testing/Storybook) */
  initialState?: Partial<LeftPaneState>;
}

export function LeftPaneProvider({
  children,
  initialState,
}: LeftPaneProviderProps) {
  const [state, dispatch] = useReducer(leftPaneReducer, {
    ...initialLeftPaneState,
    ...initialState,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <LeftPaneContext.Provider value={value}>
      {children}
    </LeftPaneContext.Provider>
  );
}

// ============================================================================
// useLeftPane Hook
// ============================================================================

export interface LeftPaneActions {
  /** Switch to a different view */
  switchView: (view: PaneView) => void;
  /** Collapse the pane */
  collapse: () => void;
  /** Expand the pane (always opens to menu) */
  expand: () => void;
  /** Toggle pane expanded/collapsed */
  toggle: () => void;
}

export interface UseLeftPaneReturn {
  /** Current pane state */
  state: LeftPaneState;
  /** Pane actions */
  actions: LeftPaneActions;
  /** Raw dispatch (for advanced use) */
  dispatch: React.Dispatch<LeftPaneAction>;
}

export function useLeftPane(): UseLeftPaneReturn {
  const context = useContext(LeftPaneContext);

  if (!context) {
    throw new Error('useLeftPane must be used within a LeftPaneProvider');
  }

  const { state, dispatch } = context;

  const switchView = useCallback(
    (view: PaneView) => {
      dispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: view } });
    },
    [dispatch]
  );

  const collapse = useCallback(() => {
    dispatch({ type: 'PANE_COLLAPSED' });
  }, [dispatch]);

  const expand = useCallback(() => {
    dispatch({ type: 'PANE_EXPANDED' });
  }, [dispatch]);

  const toggle = useCallback(() => {
    if (state.isExpanded) {
      dispatch({ type: 'PANE_COLLAPSED' });
    } else {
      dispatch({ type: 'PANE_EXPANDED' });
    }
  }, [state.isExpanded, dispatch]);

  const actions = useMemo(
    () => ({
      switchView,
      collapse,
      expand,
      toggle,
    }),
    [switchView, collapse, expand, toggle]
  );

  return { state, actions, dispatch };
}

// ============================================================================
// useLeftPaneState Hook (read-only)
// ============================================================================

export function useLeftPaneState(): LeftPaneState {
  const context = useContext(LeftPaneContext);

  if (!context) {
    throw new Error('useLeftPaneState must be used within a LeftPaneProvider');
  }

  return context.state;
}

// ============================================================================
// useBottomBarVisibility Hook
// ============================================================================

export interface UseBottomBarVisibilityParams {
  /** Current AI module tier */
  aiTier: TierState;
  /** Current transcription module tier (or null if no session) */
  transcriptionTier: TierState | null;
  /** Whether a transcription session exists for current patient */
  hasTranscriptionSession: boolean;
  /** Whether user is in an encounter context */
  inEncounter: boolean;
}

/**
 * Derives what should be visible in the bottom bar based on pane state
 * and module tiers.
 */
export function useBottomBarVisibility(
  params: UseBottomBarVisibilityParams
): BottomBarVisibility {
  const paneState = useLeftPaneState();
  const { aiTier, transcriptionTier, hasTranscriptionSession, inEncounter } = params;

  return useMemo(
    () =>
      deriveBottomBarVisibility(
        paneState,
        aiTier,
        transcriptionTier,
        hasTranscriptionSession,
        inEncounter
      ),
    [paneState, aiTier, transcriptionTier, hasTranscriptionSession, inEncounter]
  );
}

// ============================================================================
// useTranscriptViewAvailable Hook
// ============================================================================

/**
 * Returns whether the transcript view should be available in the pane header.
 */
export function useTranscriptViewAvailable(
  hasSessionForCurrentPatient: boolean
): boolean {
  return useMemo(
    () => selectTranscriptViewAvailable(hasSessionForCurrentPatient),
    [hasSessionForCurrentPatient]
  );
}
