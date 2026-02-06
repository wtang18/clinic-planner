/**
 * Left Pane State Types
 *
 * Defines the state shape for the multi-view left pane system.
 * The left pane hosts three switchable views: Menu, AI Drawer, and Transcript Drawer.
 *
 * Coordinates with Bottom Bar state — when a module is at drawer tier in the
 * left pane, its bottom bar presence is suppressed.
 *
 * @see LEFT_PANE_SYSTEM.md for behavioral specification
 * @see DRAWER_COORDINATION.md for bottom bar coordination rules
 */

// ============================================================================
// View Types
// ============================================================================

/** Available views in the left pane */
export type PaneView = 'menu' | 'ai' | 'transcript';

// ============================================================================
// State Types
// ============================================================================

/** Left pane state */
export interface LeftPaneState {
  /** Whether the pane is expanded (visible) or collapsed */
  isExpanded: boolean;

  /** Currently active view */
  activeView: PaneView;
}

// ============================================================================
// Action Types
// ============================================================================

export type LeftPaneAction =
  | { type: 'PANE_VIEW_CHANGED'; payload: { to: PaneView } }
  | { type: 'PANE_COLLAPSED' }
  | { type: 'PANE_EXPANDED' };

// ============================================================================
// Derived State Types
// ============================================================================

import type { TierState } from '../bottomBar/types';

/** Bottom bar visibility derived from pane state and module tiers */
export interface BottomBarVisibility {
  ai: {
    visible: boolean;
    tier: Exclude<TierState, 'drawer'> | null;
  };
  transcription: {
    visible: boolean;
    tier: Exclude<TierState, 'drawer'> | null;
  };
  layout: 'two-column' | 'single-column' | 'hidden';
}

// ============================================================================
// Action Type Constants
// ============================================================================

export const LEFT_PANE_ACTION_TYPES = [
  'PANE_VIEW_CHANGED',
  'PANE_COLLAPSED',
  'PANE_EXPANDED',
] as const;
