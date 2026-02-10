/**
 * useDrawerCoordination Hook
 *
 * Thin wrapper around CoordinationProvider that preserves the original return
 * interface for backward compatibility. Each coordinated action dispatches a
 * single semantic action to the coordination reducer — no more multi-dispatch.
 *
 * @see COORDINATION_STATE_MACHINE.md
 */

import { useCallback, useMemo } from 'react';
import { useCoordination } from './useCoordination';
import { useLeftPane } from './useLeftPane';
import type { LeftPaneActions, UseLeftPaneReturn } from './useLeftPane';
import { useBottomBar } from './useBottomBar';
import type { BottomBarActions, UseBottomBarReturn } from './useBottomBar';
import type { PaneView } from '../state/leftPane';

// ============================================================================
// Types
// ============================================================================

export interface CoordinatedActions {
  /** Switch to a view with bottom bar coordination */
  switchView: (view: PaneView) => void;
  /** Collapse the pane with bottom bar coordination */
  collapse: () => void;
  /** Expand the pane (always opens to menu) */
  expand: () => void;
  /** Toggle pane expanded/collapsed */
  toggle: () => void;
  /** Escalate AI from palette to drawer */
  escalateAIToDrawer: () => void;
  /** Escalate transcription from palette to drawer */
  escalateTranscriptionToDrawer: () => void;
}

export interface UseDrawerCoordinationReturn {
  /** Left pane state */
  paneState: UseLeftPaneReturn['state'];
  /** Bottom bar state */
  barState: UseBottomBarReturn['state'];
  /** Coordinated actions that update both systems */
  actions: CoordinatedActions;
  /** Original left pane actions (for advanced use) */
  paneActions: LeftPaneActions;
  /** Original bottom bar actions (for advanced use) */
  barActions: BottomBarActions;
  /** Derived values from bottom bar */
  activeSession: UseBottomBarReturn['activeSession'];
  gridTemplate: UseBottomBarReturn['gridTemplate'];
  isRecording: UseBottomBarReturn['isRecording'];
}

// ============================================================================
// Hook
// ============================================================================

export function useDrawerCoordination(): UseDrawerCoordinationReturn {
  const { state: coordState, dispatch: coordDispatch } = useCoordination();
  const {
    state: paneState,
    actions: paneActions,
  } = useLeftPane();
  const {
    state: barState,
    actions: barActions,
    activeSession,
    gridTemplate,
    isRecording,
  } = useBottomBar();

  // ── Coordinated Actions — single dispatch to CoordinationProvider ──

  const switchView = useCallback(
    (view: PaneView) => {
      coordDispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: view } });
    },
    [coordDispatch]
  );

  const collapse = useCallback(() => {
    coordDispatch({ type: 'PANE_COLLAPSED' });
  }, [coordDispatch]);

  const expand = useCallback(() => {
    coordDispatch({ type: 'PANE_EXPANDED' });
  }, [coordDispatch]);

  const toggle = useCallback(() => {
    if (coordState.paneExpanded) {
      coordDispatch({ type: 'PANE_COLLAPSED' });
    } else {
      coordDispatch({ type: 'PANE_EXPANDED' });
    }
  }, [coordState.paneExpanded, coordDispatch]);

  const escalateAIToDrawer = useCallback(() => {
    coordDispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'ai' } });
  }, [coordDispatch]);

  const escalateTranscriptionToDrawer = useCallback(() => {
    coordDispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'tm' } });
  }, [coordDispatch]);

  const actions = useMemo(
    () => ({
      switchView,
      collapse,
      expand,
      toggle,
      escalateAIToDrawer,
      escalateTranscriptionToDrawer,
    }),
    [switchView, collapse, expand, toggle, escalateAIToDrawer, escalateTranscriptionToDrawer]
  );

  return {
    paneState,
    barState,
    actions,
    paneActions,
    barActions,
    activeSession,
    gridTemplate,
    isRecording,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Check if the AI module is currently at drawer tier
 */
export function useIsAIInDrawer(): boolean {
  const { state } = useCoordination();
  return state.aiTier === 'drawer';
}

/**
 * Check if the transcription module is currently at drawer tier
 */
export function useIsTranscriptionInDrawer(): boolean {
  const { state } = useCoordination();
  return state.txTier === 'drawer';
}
