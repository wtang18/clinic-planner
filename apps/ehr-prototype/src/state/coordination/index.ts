/**
 * Coordination State Machine
 *
 * Single source of truth for bottom bar + left pane coordination.
 * Replaces the three-provider architecture (BottomBarProvider + LeftPaneProvider + LayoutStateProvider).
 *
 * @see COORDINATION_STATE_MACHINE.md
 */

// Types
export type {
  TierState,
  PaneView,
  ModuleId,
  CoordinationState,
  CoordinationAction,
  BottomBarVisibility,
  ModuleVisibility,
  InvariantResult,
} from './types';

// Invariants
export { validateInvariants, assertInvariants } from './invariants';

// Reducer
export { coordinationReducer, initialCoordinationState } from './reducer';

// Selectors
export {
  GRID_TOKENS,
  selectBottomBarVisibility,
  selectGridTemplate,
  selectIsBottomBarHidden,
  selectPaneContent,
  selectIsModuleInDrawer,
  selectHasPaletteOpen,
} from './selectors';
