/**
 * LayoutStateContext
 *
 * Manages pane collapse/expand state for the adaptive layout.
 * Provides per-session state (no persistence) for prototype simplicity.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type PaneId = 'menu' | 'overview' | 'ai-drawer';

export interface LayoutState {
  /** Which panes are collapsed */
  collapsed: Record<PaneId, boolean>;
  /** Whether AI drawer is open (different from collapsed - it's overlay mode) */
  aiDrawerOpen: boolean;
}

export interface LayoutActions {
  /** Toggle a specific pane's collapsed state */
  togglePane: (paneId: PaneId) => void;
  /** Set a specific pane's collapsed state */
  setCollapsed: (paneId: PaneId, collapsed: boolean) => void;
  /** Open the AI drawer */
  openAIDrawer: () => void;
  /** Close the AI drawer */
  closeAIDrawer: () => void;
  /** Toggle the AI drawer */
  toggleAIDrawer: () => void;
  /** Reset all panes to default state */
  resetLayout: () => void;
}

export type LayoutContextValue = LayoutState & LayoutActions;

// ============================================================================
// Constants
// ============================================================================

const INITIAL_STATE: LayoutState = {
  collapsed: {
    menu: false,
    overview: false,
    'ai-drawer': true, // Drawer starts closed
  },
  aiDrawerOpen: false,
};

// ============================================================================
// Actions
// ============================================================================

type LayoutAction =
  | { type: 'TOGGLE_PANE'; paneId: PaneId }
  | { type: 'SET_COLLAPSED'; paneId: PaneId; collapsed: boolean }
  | { type: 'OPEN_AI_DRAWER' }
  | { type: 'CLOSE_AI_DRAWER' }
  | { type: 'TOGGLE_AI_DRAWER' }
  | { type: 'RESET_LAYOUT' };

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'TOGGLE_PANE':
      return {
        ...state,
        collapsed: {
          ...state.collapsed,
          [action.paneId]: !state.collapsed[action.paneId],
        },
      };

    case 'SET_COLLAPSED':
      return {
        ...state,
        collapsed: {
          ...state.collapsed,
          [action.paneId]: action.collapsed,
        },
      };

    case 'OPEN_AI_DRAWER':
      return {
        ...state,
        aiDrawerOpen: true,
      };

    case 'CLOSE_AI_DRAWER':
      return {
        ...state,
        aiDrawerOpen: false,
      };

    case 'TOGGLE_AI_DRAWER':
      return {
        ...state,
        aiDrawerOpen: !state.aiDrawerOpen,
      };

    case 'RESET_LAYOUT':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

const LayoutStateContext = createContext<LayoutContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface LayoutStateProviderProps {
  children: ReactNode;
  /** Override initial state for testing */
  initialState?: Partial<LayoutState>;
}

export const LayoutStateProvider: React.FC<LayoutStateProviderProps> = ({
  children,
  initialState,
}) => {
  const [state, dispatch] = useReducer(layoutReducer, {
    ...INITIAL_STATE,
    ...initialState,
    collapsed: {
      ...INITIAL_STATE.collapsed,
      ...initialState?.collapsed,
    },
  });

  const togglePane = useCallback((paneId: PaneId) => {
    dispatch({ type: 'TOGGLE_PANE', paneId });
  }, []);

  const setCollapsed = useCallback((paneId: PaneId, collapsed: boolean) => {
    dispatch({ type: 'SET_COLLAPSED', paneId, collapsed });
  }, []);

  const openAIDrawer = useCallback(() => {
    dispatch({ type: 'OPEN_AI_DRAWER' });
  }, []);

  const closeAIDrawer = useCallback(() => {
    dispatch({ type: 'CLOSE_AI_DRAWER' });
  }, []);

  const toggleAIDrawer = useCallback(() => {
    dispatch({ type: 'TOGGLE_AI_DRAWER' });
  }, []);

  const resetLayout = useCallback(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  const value: LayoutContextValue = {
    ...state,
    togglePane,
    setCollapsed,
    openAIDrawer,
    closeAIDrawer,
    toggleAIDrawer,
    resetLayout,
  };

  return (
    <LayoutStateContext.Provider value={value}>
      {children}
    </LayoutStateContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useLayoutState(): LayoutContextValue {
  const context = useContext(LayoutStateContext);
  if (!context) {
    throw new Error('useLayoutState must be used within a LayoutStateProvider');
  }
  return context;
}

/**
 * Hook to get collapse state for a specific pane
 */
export function usePaneCollapsed(paneId: PaneId): [boolean, () => void] {
  const { collapsed, togglePane } = useLayoutState();
  const isCollapsed = collapsed[paneId];
  const toggle = useCallback(() => togglePane(paneId), [togglePane, paneId]);
  return [isCollapsed, toggle];
}

LayoutStateProvider.displayName = 'LayoutStateProvider';
