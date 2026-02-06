/**
 * Left Pane State Module
 *
 * State management for the multi-view left pane system.
 * Coordinates with the bottom bar state for drawer ↔ bottom bar transitions.
 */

// Types
export type {
  PaneView,
  LeftPaneState,
  LeftPaneAction,
  BottomBarVisibility,
} from './types';

export { LEFT_PANE_ACTION_TYPES } from './types';

// Reducer
export {
  leftPaneReducer,
  initialLeftPaneState,
  leftPaneActions,
} from './reducer';

// Selectors
export {
  selectIsViewActive,
  selectIsExpanded,
  selectActiveView,
  deriveBottomBarVisibility,
  selectTranscriptViewAvailable,
} from './selectors';
