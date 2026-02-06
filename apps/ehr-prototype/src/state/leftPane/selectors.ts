/**
 * Left Pane Selectors
 *
 * Derived state computations for the left pane system.
 * Includes the critical bottom bar visibility derivation that
 * determines what renders in the bottom bar based on pane state.
 *
 * @see DRAWER_COORDINATION.md §10 for visibility derivation logic
 */

import type { LeftPaneState, PaneView, BottomBarVisibility } from './types';
import type { TierState } from '../bottomBar/types';

// ============================================================================
// Basic Selectors
// ============================================================================

/** Check if a specific view is active */
export function selectIsViewActive(state: LeftPaneState, view: PaneView): boolean {
  return state.isExpanded && state.activeView === view;
}

/** Check if the pane is expanded */
export function selectIsExpanded(state: LeftPaneState): boolean {
  return state.isExpanded;
}

/** Get the active view */
export function selectActiveView(state: LeftPaneState): PaneView {
  return state.activeView;
}

// ============================================================================
// Bottom Bar Visibility Derivation
// ============================================================================

/**
 * Derive what should be visible in the bottom bar given the current state.
 *
 * Core rules:
 * - Each module renders at exactly one density at any time
 * - When a module is at drawer tier (left pane), it's hidden from bottom bar
 * - When pane is collapsed, both modules show in bottom bar at their tiers
 *
 * @param paneState - Left pane state
 * @param aiTier - Current AI module tier
 * @param transcriptionTier - Current transcription module tier (null if no session)
 * @param hasTranscriptionSession - Whether a transcription session exists for current patient
 * @param inEncounter - Whether user is currently in an encounter context
 */
export function deriveBottomBarVisibility(
  paneState: LeftPaneState,
  aiTier: TierState,
  transcriptionTier: TierState | null,
  hasTranscriptionSession: boolean,
  inEncounter: boolean
): BottomBarVisibility {
  // When pane is collapsed, everything shows in bottom bar
  // (modules de-escalate to resting tiers on collapse)
  if (!paneState.isExpanded) {
    const txVisible = transcriptionTier !== null && hasTranscriptionSession && inEncounter;
    return {
      ai: {
        visible: true,
        tier: aiTier === 'drawer' ? 'minibar' as Exclude<TierState, 'drawer'> : aiTier as Exclude<TierState, 'drawer'>,
      },
      transcription: {
        visible: txVisible,
        tier: txVisible ? (transcriptionTier === 'drawer' ? 'bar' : transcriptionTier) as Exclude<TierState, 'drawer'> : null,
      },
      layout: txVisible ? 'two-column' : 'single-column',
    };
  }

  // Pane is expanded - check which view is active
  const aiInDrawer = paneState.activeView === 'ai';
  const txInDrawer = paneState.activeView === 'transcript';

  const aiVisible = !aiInDrawer;
  const txVisible = transcriptionTier !== null && !txInDrawer && hasTranscriptionSession && inEncounter;

  // Compute the tier for bottom bar (null if in drawer)
  const aiBottomTier = aiVisible ? (aiTier as Exclude<TierState, 'drawer'>) : null;
  const txBottomTier = txVisible ? (transcriptionTier as Exclude<TierState, 'drawer'>) : null;

  // Determine layout
  let layout: 'two-column' | 'single-column' | 'hidden';
  if (aiVisible && txVisible) {
    layout = 'two-column';
  } else if (aiVisible || txVisible) {
    layout = 'single-column';
  } else {
    layout = 'hidden';
  }

  return {
    ai: { visible: aiVisible, tier: aiBottomTier },
    transcription: { visible: txVisible, tier: txBottomTier },
    layout,
  };
}

// ============================================================================
// Transcript View Availability
// ============================================================================

/**
 * Check if the transcript view should be available in the pane header.
 *
 * The transcript view is available when:
 * - A transcription session exists for the current patient
 * - The session is not yet cleared (finalized + navigated away)
 *
 * @param hasSessionForCurrentPatient - Whether a session exists for current patient
 */
export function selectTranscriptViewAvailable(
  hasSessionForCurrentPatient: boolean
): boolean {
  return hasSessionForCurrentPatient;
}
