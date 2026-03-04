/**
 * PopHealthContext
 *
 * React context + reducer for population health workspace state.
 * Manages cohort/pathway/node selection, view mode, filters, and drawer stack.
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type {
  PopHealthState,
  PopHealthFilter,
  ActiveView,
  DrawerView,
  NodeLifecycleState,
  CohortCategory,
} from '../types/population-health';

// ============================================================================
// Actions
// ============================================================================

export type PopHealthAction =
  | { type: 'COHORT_SELECTED'; cohortId: string }
  | { type: 'PATHWAY_SELECTED'; pathwayId: string; multi?: boolean }
  | { type: 'PATHWAY_DESELECTED'; pathwayId: string }
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
  | { type: 'COLUMN_UNFOCUSED' }
  | { type: 'LIFECYCLE_FILTER_CHANGED'; states: NodeLifecycleState[] }
  | { type: 'CATEGORY_OVERVIEW_SELECTED'; category: CohortCategory };

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: PopHealthState = {
  selectedCohortId: null,
  selectedPathwayIds: [],
  selectedNodeId: null,
  selectedPatientId: null,
  activeView: 'flow',
  filters: [],
  drawerStack: [],
  focusedColumnIndex: null,
  lifecycleFilter: [],
};

// ============================================================================
// Reducer
// ============================================================================

/** Map category to overview cohort ID */
const CATEGORY_OVERVIEW_MAP: Record<string, string> = {
  'chronic-disease': 'coh-chronic-overview',
  'preventive-care': 'coh-preventive-overview',
  'risk-tiers': 'coh-risk-overview',
  'care-transitions': 'coh-transitions-overview',
};

function popHealthReducer(state: PopHealthState, action: PopHealthAction): PopHealthState {
  switch (action.type) {
    case 'COHORT_SELECTED':
      return {
        ...state,
        selectedCohortId: action.cohortId,
        selectedPathwayIds: [],
        selectedNodeId: null,
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
      };

    case 'PATHWAY_SELECTED': {
      if (action.multi) {
        // Shift-click: toggle in multi-select
        const exists = state.selectedPathwayIds.includes(action.pathwayId);
        return {
          ...state,
          selectedPathwayIds: exists
            ? state.selectedPathwayIds.filter((id) => id !== action.pathwayId)
            : [...state.selectedPathwayIds, action.pathwayId],
          selectedNodeId: null,
        };
      }
      // Single select
      return {
        ...state,
        selectedPathwayIds: [action.pathwayId],
        selectedNodeId: null,
      };
    }

    case 'PATHWAY_DESELECTED':
      return {
        ...state,
        selectedPathwayIds: state.selectedPathwayIds.filter((id) => id !== action.pathwayId),
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

    case 'LIFECYCLE_FILTER_CHANGED':
      return { ...state, lifecycleFilter: action.states };

    case 'CATEGORY_OVERVIEW_SELECTED': {
      const overviewCohortId = CATEGORY_OVERVIEW_MAP[action.category];
      if (!overviewCohortId) return state;
      return {
        ...state,
        selectedCohortId: overviewCohortId,
        selectedPathwayIds: [],
        selectedNodeId: null,
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
      };
    }

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
