/**
 * useLeftPane Hook
 *
 * Adapter: reads pane state from CoordinationProvider.
 * Preserves the same return types for backward compatibility.
 *
 * @see COORDINATION_STATE_MACHINE.md
 * @see LEFT_PANE_SYSTEM.md for behavioral specification
 */

import {
  useCallback,
  useMemo,
} from 'react';
import { useCoordination } from './useCoordination';
import { selectBottomBarVisibility } from '../state/coordination';
import type {
  LeftPaneState,
  LeftPaneAction,
  PaneView,
  BottomBarVisibility,
} from '../state/leftPane';
import type { TierState } from '../state/bottomBar';
import { selectTranscriptViewAvailable } from '../state/leftPane';

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
  dispatch: (action: LeftPaneAction) => void;
}

export function useLeftPane(): UseLeftPaneReturn {
  const { state: coordState, dispatch: coordDispatch } = useCoordination();

  // Map coordination state to legacy LeftPaneState shape
  const state: LeftPaneState = useMemo(
    () => ({
      isExpanded: coordState.paneExpanded,
      activeView: coordState.paneView,
    }),
    [coordState.paneExpanded, coordState.paneView]
  );

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

  const actions = useMemo(
    () => ({
      switchView,
      collapse,
      expand,
      toggle,
    }),
    [switchView, collapse, expand, toggle]
  );

  // Wrap coordDispatch to accept LeftPaneAction types
  const legacyDispatch = useCallback(
    (action: LeftPaneAction) => {
      switch (action.type) {
        case 'PANE_VIEW_CHANGED':
          coordDispatch({ type: 'PANE_VIEW_CHANGED', payload: action.payload });
          break;
        case 'PANE_COLLAPSED':
          coordDispatch({ type: 'PANE_COLLAPSED' });
          break;
        case 'PANE_EXPANDED':
          coordDispatch({ type: 'PANE_EXPANDED' });
          break;
      }
    },
    [coordDispatch]
  );

  return { state, actions, dispatch: legacyDispatch };
}

// ============================================================================
// useLeftPaneState Hook (read-only)
// ============================================================================

export function useLeftPaneState(): LeftPaneState {
  const { state } = useLeftPane();
  return state;
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
 * Derives what should be visible in the bottom bar.
 * Reads from CoordinationProvider's selectBottomBarVisibility.
 *
 * Note: params are accepted for backward compat but visibility is derived
 * from coordination state (single source of truth).
 */
export function useBottomBarVisibility(
  params: UseBottomBarVisibilityParams
): BottomBarVisibility {
  const { state: coordState } = useCoordination();

  return useMemo(() => {
    const vis = selectBottomBarVisibility(coordState);
    // Map coordination tier names to legacy tier names
    return {
      ai: {
        visible: vis.ai.visible,
        tier: vis.ai.tier as Exclude<TierState, 'drawer'> | null,
      },
      transcription: {
        visible: vis.transcription.visible,
        tier: vis.transcription.tier as Exclude<TierState, 'drawer'> | null,
      },
      layout: vis.layout,
    };
  }, [coordState]);
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
