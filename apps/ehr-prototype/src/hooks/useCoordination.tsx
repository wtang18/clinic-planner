/**
 * useCoordination Hook
 *
 * Provider and hook for the coordination state machine.
 * Single source of truth for bottom bar tier state and left pane view/expanded state.
 *
 * Replaces the three-provider architecture:
 * - BottomBarProvider tier state (sessions stay separate)
 * - LeftPaneProvider (fully replaced)
 * - LayoutStateProvider (fully replaced)
 *
 * @see COORDINATION_STATE_MACHINE.md
 */

import React, { useReducer, useMemo, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import {
  coordinationReducer,
  initialCoordinationState,
  selectBottomBarVisibility,
  selectGridTemplate,
  selectIsBottomBarHidden,
  selectPaneContent,
  selectHasPaletteOpen,
} from '../state/coordination';
import type {
  CoordinationState,
  CoordinationAction,
  BottomBarVisibility,
  PaneView,
} from '../state/coordination';

// ============================================================================
// Context
// ============================================================================

interface CoordinationContextValue {
  state: CoordinationState;
  dispatch: React.Dispatch<CoordinationAction>;
}

const CoordinationContext = createContext<CoordinationContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface CoordinationProviderProps {
  children: ReactNode;
  /** Initial state override (for testing/Storybook) */
  initialState?: Partial<CoordinationState>;
}

export function CoordinationProvider({
  children,
  initialState,
}: CoordinationProviderProps) {
  const [state, dispatch] = useReducer(coordinationReducer, {
    ...initialCoordinationState,
    ...initialState,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CoordinationContext.Provider value={value}>
      {children}
    </CoordinationContext.Provider>
  );
}

// ============================================================================
// useCoordination Hook
// ============================================================================

export interface UseCoordinationReturn {
  /** Current coordination state */
  state: CoordinationState;
  /** Dispatch coordination actions */
  dispatch: React.Dispatch<CoordinationAction>;
  /** Bottom bar visibility (which modules are visible and at what tier) */
  bottomBarVisibility: BottomBarVisibility;
  /** CSS grid-template-columns string for bottom bar layout */
  gridTemplate: string;
  /** Whether the bottom bar is completely hidden */
  isBottomBarHidden: boolean;
  /** Current pane view */
  paneContent: PaneView;
  /** Whether any module has a palette open */
  hasPaletteOpen: boolean;
}

export function useCoordination(): UseCoordinationReturn {
  const context = useContext(CoordinationContext);

  if (!context) {
    throw new Error('useCoordination must be used within a CoordinationProvider');
  }

  const { state, dispatch } = context;

  const bottomBarVisibility = useMemo(() => selectBottomBarVisibility(state), [state]);
  const gridTemplate = useMemo(() => selectGridTemplate(state), [state]);
  const isBottomBarHidden = useMemo(() => selectIsBottomBarHidden(state), [state]);
  const paneContent = useMemo(() => selectPaneContent(state), [state]);
  const hasPaletteOpen = useMemo(() => selectHasPaletteOpen(state), [state]);

  return {
    state,
    dispatch,
    bottomBarVisibility,
    gridTemplate,
    isBottomBarHidden,
    paneContent,
    hasPaletteOpen,
  };
}

// ============================================================================
// Export Context for Advanced Use Cases
// ============================================================================

export { CoordinationContext };
