/**
 * PopHealthContext
 *
 * React context + reducer for population health workspace state.
 * Manages cohort/protocol/node selection, view mode, filters, and drawer stack.
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type {
  PopHealthState,
  PopHealthFilter,
  ActiveView,
  DrawerView,
} from '../types/population-health';

// ============================================================================
// Actions
// ============================================================================

export type PopHealthAction =
  | { type: 'COHORT_SELECTED'; cohortId: string }
  | { type: 'PROTOCOL_SELECTED'; protocolId: string; multi?: boolean }
  | { type: 'PROTOCOL_DESELECTED'; protocolId: string }
  | { type: 'NODE_SELECTED'; nodeId: string }
  | { type: 'NODE_DESELECTED' }
  | { type: 'PATIENT_SELECTED'; patientId: string }
  | { type: 'PATIENT_DESELECTED' }
  | { type: 'VIEW_CHANGED'; view: ActiveView }
  | { type: 'FILTER_ADDED'; filter: PopHealthFilter }
  | { type: 'FILTER_REMOVED'; filterId: string }
  | { type: 'FILTERS_CLEARED' }
  | { type: 'DRAWER_OPENED'; view: DrawerView }
  | { type: 'DRAWER_BACK' }
  | { type: 'DRAWER_CLOSED' }
  | { type: 'COLUMN_FOCUSED'; columnIndex: number }
  | { type: 'COLUMN_UNFOCUSED' };

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: PopHealthState = {
  selectedCohortId: null,
  selectedProtocolIds: [],
  selectedNodeId: null,
  selectedPatientId: null,
  activeView: 'flow',
  filters: [],
  drawerStack: [],
  focusedColumnIndex: null,
};

// ============================================================================
// Reducer
// ============================================================================

function popHealthReducer(state: PopHealthState, action: PopHealthAction): PopHealthState {
  switch (action.type) {
    case 'COHORT_SELECTED':
      return {
        ...state,
        selectedCohortId: action.cohortId,
        selectedProtocolIds: [],
        selectedNodeId: null,
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
      };

    case 'PROTOCOL_SELECTED': {
      if (action.multi) {
        // Shift-click: toggle in multi-select
        const exists = state.selectedProtocolIds.includes(action.protocolId);
        return {
          ...state,
          selectedProtocolIds: exists
            ? state.selectedProtocolIds.filter((id) => id !== action.protocolId)
            : [...state.selectedProtocolIds, action.protocolId],
          selectedNodeId: null,
        };
      }
      // Single select
      return {
        ...state,
        selectedProtocolIds: [action.protocolId],
        selectedNodeId: null,
      };
    }

    case 'PROTOCOL_DESELECTED':
      return {
        ...state,
        selectedProtocolIds: state.selectedProtocolIds.filter((id) => id !== action.protocolId),
        selectedNodeId: null,
      };

    case 'NODE_SELECTED':
      return { ...state, selectedNodeId: action.nodeId };

    case 'NODE_DESELECTED':
      return { ...state, selectedNodeId: null };

    case 'PATIENT_SELECTED':
      return { ...state, selectedPatientId: action.patientId };

    case 'PATIENT_DESELECTED':
      return { ...state, selectedPatientId: null };

    case 'VIEW_CHANGED':
      return { ...state, activeView: action.view };

    case 'FILTER_ADDED':
      return { ...state, filters: [...state.filters, action.filter] };

    case 'FILTER_REMOVED':
      return { ...state, filters: state.filters.filter((f) => f.id !== action.filterId) };

    case 'FILTERS_CLEARED':
      return { ...state, filters: [] };

    case 'DRAWER_OPENED':
      return { ...state, drawerStack: [...state.drawerStack, action.view] };

    case 'DRAWER_BACK':
      return { ...state, drawerStack: state.drawerStack.slice(0, -1) };

    case 'DRAWER_CLOSED':
      return { ...state, drawerStack: [] };

    case 'COLUMN_FOCUSED':
      return { ...state, focusedColumnIndex: action.columnIndex };

    case 'COLUMN_UNFOCUSED':
      return { ...state, focusedColumnIndex: null };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface PopHealthContextValue {
  state: PopHealthState;
  dispatch: React.Dispatch<PopHealthAction>;
  /** Whether the drawer is open */
  isDrawerOpen: boolean;
  /** Current drawer view (top of stack) */
  currentDrawerView: DrawerView | null;
  /** Whether the drawer has a back stack */
  canDrawerGoBack: boolean;
}

const PopHealthContext = createContext<PopHealthContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface PopHealthProviderProps {
  children: React.ReactNode;
  initialCohortId?: string;
}

export const PopHealthProvider: React.FC<PopHealthProviderProps> = ({
  children,
  initialCohortId,
}) => {
  const [state, dispatch] = useReducer(popHealthReducer, {
    ...INITIAL_STATE,
    selectedCohortId: initialCohortId ?? null,
  });

  const value = useMemo<PopHealthContextValue>(() => ({
    state,
    dispatch,
    isDrawerOpen: state.drawerStack.length > 0,
    currentDrawerView: state.drawerStack.length > 0 ? state.drawerStack[state.drawerStack.length - 1] : null,
    canDrawerGoBack: state.drawerStack.length > 1,
  }), [state, dispatch]);

  return (
    <PopHealthContext.Provider value={value}>
      {children}
    </PopHealthContext.Provider>
  );
};

PopHealthProvider.displayName = 'PopHealthProvider';

// ============================================================================
// Hook
// ============================================================================

export const usePopHealth = (): PopHealthContextValue => {
  const context = useContext(PopHealthContext);
  if (!context) {
    throw new Error('usePopHealth must be used within PopHealthProvider');
  }
  return context;
};
