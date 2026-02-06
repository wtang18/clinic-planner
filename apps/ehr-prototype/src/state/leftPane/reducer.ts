/**
 * Left Pane Reducer
 *
 * Manages state transitions for the left pane system.
 *
 * Key behaviors:
 * - View switching: validates transcript view availability
 * - Collapse: sets isExpanded to false (coordination layer handles de-escalation)
 * - Expand: always re-expands to menu view for predictability
 *
 * @see LEFT_PANE_SYSTEM.md §4-5 for collapse/expand and view switching rules
 */

import type { LeftPaneState, LeftPaneAction, PaneView } from './types';

// ============================================================================
// Initial State
// ============================================================================

export const initialLeftPaneState: LeftPaneState = {
  isExpanded: true,
  activeView: 'menu',
};

// ============================================================================
// Reducer
// ============================================================================

export function leftPaneReducer(
  state: LeftPaneState,
  action: LeftPaneAction
): LeftPaneState {
  switch (action.type) {
    case 'PANE_VIEW_CHANGED': {
      const { to } = action.payload;

      // Transcript view validation is handled at the UI layer
      // (the icon is conditionally shown based on session state)
      // Here we just update the view
      return {
        ...state,
        activeView: to,
      };
    }

    case 'PANE_COLLAPSED': {
      // Note: The coordination layer (useLeftPane hook) handles
      // de-escalating the active drawer module to the bottom bar
      return {
        ...state,
        isExpanded: false,
      };
    }

    case 'PANE_EXPANDED': {
      // Always re-expand to menu view for predictability
      // Module state is preserved in the bottom bar state
      return {
        ...state,
        isExpanded: true,
        activeView: 'menu',
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Action Creators
// ============================================================================

export const leftPaneActions = {
  viewChanged: (to: PaneView): LeftPaneAction => ({
    type: 'PANE_VIEW_CHANGED',
    payload: { to },
  }),

  collapsed: (): LeftPaneAction => ({
    type: 'PANE_COLLAPSED',
  }),

  expanded: (): LeftPaneAction => ({
    type: 'PANE_EXPANDED',
  }),
};
