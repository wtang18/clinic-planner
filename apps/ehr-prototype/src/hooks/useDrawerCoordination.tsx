/**
 * useDrawerCoordination Hook
 *
 * Coordinates the left pane and bottom bar systems.
 * When a module moves to drawer tier (left pane), it's hidden from the bottom bar.
 * When a module leaves drawer tier, it de-escalates to its resting tier in the bottom bar.
 *
 * Tier behavior:
 * - `bar`: Default/resting state for both modules in bottom bar
 * - `palette`: Expanded state (one at a time) - other module auto-compresses to `mini`
 * - `mini`: Compressed state - ONLY used when other module is at `palette`
 * - `drawer`: Module is in left pane, completely hidden from bottom bar
 *
 * Key behaviors:
 * - Menu view (or collapsed) → Both modules at `bar`, either can expand to `palette`
 * - Switching to AI view → AI tier becomes `drawer` (hidden), TM stays at `bar`
 * - Switching to transcript view → TM tier becomes `drawer` (hidden), AI stays at `bar`
 * - Leaving drawer view → Module de-escalates to `bar`
 * - Collapsing pane → Active drawer module de-escalates to `bar`
 * - Escalating from palette → Module moves to `drawer` in left pane
 *
 * @see DRAWER_COORDINATION.md for full specification
 */

import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useLeftPane } from './useLeftPane';
import type { LeftPaneActions, UseLeftPaneReturn } from './useLeftPane';
import { useBottomBar } from './useBottomBar';
import type { BottomBarActions, UseBottomBarReturn } from './useBottomBar';
import type { PaneView } from '../state/leftPane';
import type { TierState } from '../state/bottomBar';

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
// Constants
// ============================================================================

/**
 * Resting tier for both modules (de-escalation target).
 *
 * Tier behavior:
 * - `bar`: Default state for both modules in bottom bar
 * - `palette`: Expanded state (one at a time) - other module auto-compresses to `mini`
 * - `mini`: Compressed state - ONLY used when other module is at `palette`
 * - `drawer`: Module is in left pane, hidden from bottom bar
 */
const RESTING_TIER: TierState = 'bar';

// ============================================================================
// Hook
// ============================================================================

export function useDrawerCoordination(): UseDrawerCoordinationReturn {
  const {
    state: paneState,
    actions: paneActions,
    dispatch: paneDispatch,
  } = useLeftPane();

  const {
    state: barState,
    actions: barActions,
    activeSession,
    gridTemplate,
    isRecording,
  } = useBottomBar();

  // Track previous view for de-escalation
  const prevViewRef = useRef<PaneView>(paneState.activeView);
  const prevExpandedRef = useRef<boolean>(paneState.isExpanded);

  /**
   * Switch to a view with coordination:
   * - Entering drawer view → set module to drawer tier
   * - Leaving drawer view → de-escalate module to resting tier
   */
  const switchView = useCallback(
    (view: PaneView) => {
      const currentView = paneState.activeView;

      // Handle de-escalation from current view
      if (currentView === 'ai' && view !== 'ai') {
        // Leaving AI drawer → de-escalate to bar (resting tier)
        barActions.setAITier(RESTING_TIER);
      } else if (currentView === 'transcript' && view !== 'transcript') {
        // Leaving transcript drawer → de-escalate to bar (resting tier)
        barActions.setTranscriptionTier(RESTING_TIER);
      }

      // Handle escalation to new view
      if (view === 'ai') {
        // Entering AI drawer → set to drawer tier
        barActions.setAITier('drawer');
      } else if (view === 'transcript') {
        // Entering transcript drawer → set to drawer tier
        barActions.setTranscriptionTier('drawer');
      }

      // Update pane view
      paneActions.switchView(view);
    },
    [paneState.activeView, paneActions, barActions]
  );

  /**
   * Collapse the pane with coordination:
   * - De-escalate active drawer module to resting tier (bar)
   */
  const collapse = useCallback(() => {
    const currentView = paneState.activeView;

    // De-escalate any drawer module to bar
    if (currentView === 'ai') {
      barActions.setAITier(RESTING_TIER);
    } else if (currentView === 'transcript') {
      barActions.setTranscriptionTier(RESTING_TIER);
    }

    paneActions.collapse();
  }, [paneState.activeView, paneActions, barActions]);

  /**
   * Expand the pane (always opens to menu)
   * No tier coordination needed - modules stay at their current tiers
   */
  const expand = useCallback(() => {
    paneActions.expand();
  }, [paneActions]);

  /**
   * Toggle pane expanded/collapsed
   */
  const toggle = useCallback(() => {
    if (paneState.isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [paneState.isExpanded, collapse, expand]);

  /**
   * Escalate AI from palette to drawer
   * Called when user taps "Continue in drawer" or drawer icon in palette
   */
  const escalateAIToDrawer = useCallback(() => {
    // Set AI to drawer tier
    barActions.setAITier('drawer');
    // Ensure pane is expanded
    if (!paneState.isExpanded) {
      paneDispatch({ type: 'PANE_EXPANDED' });
    }
    // Switch to AI view (bypass coordinated switchView to avoid double tier update)
    paneDispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } });
  }, [barActions, paneState.isExpanded, paneDispatch]);

  /**
   * Escalate transcription from palette to drawer
   * Called when user taps escalation button in transcription palette
   */
  const escalateTranscriptionToDrawer = useCallback(() => {
    // Set transcription to drawer tier
    barActions.setTranscriptionTier('drawer');
    // Ensure pane is expanded
    if (!paneState.isExpanded) {
      paneDispatch({ type: 'PANE_EXPANDED' });
    }
    // Switch to transcript view
    paneDispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } });
  }, [barActions, paneState.isExpanded, paneDispatch]);

  // Update refs for next render
  useEffect(() => {
    prevViewRef.current = paneState.activeView;
    prevExpandedRef.current = paneState.isExpanded;
  }, [paneState.activeView, paneState.isExpanded]);

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
  const { barState, paneState } = useDrawerCoordination();
  return paneState.isExpanded && paneState.activeView === 'ai';
}

/**
 * Check if the transcription module is currently at drawer tier
 */
export function useIsTranscriptionInDrawer(): boolean {
  const { barState, paneState } = useDrawerCoordination();
  return paneState.isExpanded && paneState.activeView === 'transcript';
}
