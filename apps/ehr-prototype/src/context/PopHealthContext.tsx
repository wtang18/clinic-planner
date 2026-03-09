/**
 * PopHealthContext
 *
 * React context + reducer for population health workspace state.
 * Manages cohort/pathway/node selection, view mode, filters, and drawer stack.
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  PopHealthState,
  PopHealthFilter,
  ActiveView,
  DrawerView,
  NodeLifecycleState,
  CohortCategory,
  DimensionSelection,
  AxisVisibility,
  AllPatientsView,
} from '../types/population-health';

// ============================================================================
// Actions
// ============================================================================

export type PopHealthAction =
  | { type: 'COHORT_SELECTED'; cohortId: string }
  | { type: 'PATHWAY_SELECTED'; pathwayId: string; multi?: boolean }
  | { type: 'PATHWAY_DESELECTED'; pathwayId: string }
  | { type: 'NODE_SELECTED'; nodeId: string; multi?: boolean }
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
  | { type: 'CATEGORY_OVERVIEW_SELECTED'; category: CohortCategory }
  | { type: 'SEARCH_CHANGED'; query: string }
  // All-patients actions
  | { type: 'DIMENSION_TOGGLED'; axis: keyof DimensionSelection; id: string }
  | { type: 'DIMENSIONS_CLEARED' }
  | { type: 'AXIS_VISIBILITY_CHANGED'; axis: keyof AxisVisibility; visible: boolean }
  | { type: 'ALL_PATIENTS_VIEW_CHANGED'; view: AllPatientsView }
  | { type: 'BAND_HOVERED'; bandId: string | null }
  // Sankey navigator actions
  | { type: 'SANKEY_NAVIGATOR_TOGGLED'; bandId: string | null }
  // Scope restoration
  | { type: 'ALL_PATIENTS_SCOPE_RESTORED' }
  // Layer tree "Show Mine" actions
  | { type: 'SHOW_MINE_APPLIED'; nodeIds: string[] }
  | { type: 'SHOW_MINE_CLEARED' };

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_DIMENSION_SELECTION: DimensionSelection = {
  conditions: [],
  preventive: [],
  riskTiers: [],
  actionStatuses: [],
};

const INITIAL_AXIS_VISIBILITY: AxisVisibility = {
  conditions: true,
  preventive: true,
  riskLevel: true,
  actionStatus: true,
};

export const INITIAL_DIMENSION_SELECTION_VALUE = INITIAL_DIMENSION_SELECTION;
export const INITIAL_AXIS_VISIBILITY_VALUE = INITIAL_AXIS_VISIBILITY;

export const INITIAL_STATE: PopHealthState = {
  selectedCohortId: null,
  selectedPathwayIds: [],
  selectedNodeIds: [],
  selectedPatientId: null,
  activeView: 'priorities',
  filters: [],
  drawerStack: [],
  focusedColumnIndex: null,
  lifecycleFilter: [],
  searchQuery: '',
  dimensionSelection: INITIAL_DIMENSION_SELECTION,
  axisVisibility: INITIAL_AXIS_VISIBILITY,
  allPatientsView: 'map',
  hoveredBandId: null,
  sankeyNavigatorBandId: null,
  showMineActive: true,
  allPatientsSnapshot: null,
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

export function popHealthReducer(state: PopHealthState, action: PopHealthAction): PopHealthState {
  switch (action.type) {
    case 'COHORT_SELECTED':
      return {
        ...state,
        // Save All-Patients state on first transition (AP → cohort)
        // Don't overwrite on cohort → cohort transitions
        allPatientsSnapshot: state.allPatientsSnapshot ?? {
          dimensionSelection: state.dimensionSelection,
          axisVisibility: state.axisVisibility,
        },
        selectedCohortId: action.cohortId,
        selectedPathwayIds: [],
        selectedNodeIds: [],
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
        searchQuery: '',
        dimensionSelection: INITIAL_DIMENSION_SELECTION,
        axisVisibility: INITIAL_AXIS_VISIBILITY,
        hoveredBandId: null,
        sankeyNavigatorBandId: null,
        showMineActive: true,
        // allPatientsView persists across scope switches (intentional)
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
          selectedNodeIds: [],
        };
      }
      // Single select
      return {
        ...state,
        selectedPathwayIds: [action.pathwayId],
        selectedNodeIds: [],
      };
    }

    case 'PATHWAY_DESELECTED':
      return {
        ...state,
        selectedPathwayIds: state.selectedPathwayIds.filter((id) => id !== action.pathwayId),
        selectedNodeIds: [],
      };

    case 'NODE_SELECTED': {
      if (action.multi) {
        // Shift-click: toggle node in/out of multi-select (showMine stays active)
        const exists = state.selectedNodeIds.includes(action.nodeId);
        return {
          ...state,
          selectedNodeIds: exists
            ? state.selectedNodeIds.filter((id) => id !== action.nodeId)
            : [...state.selectedNodeIds, action.nodeId],
        };
      }
      // Single click: replace selection, deactivate "Show Mine"
      return { ...state, selectedNodeIds: [action.nodeId], showMineActive: false };
    }

    case 'NODE_DESELECTED':
      return { ...state, selectedNodeIds: [], showMineActive: false };

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
        allPatientsSnapshot: state.allPatientsSnapshot ?? {
          dimensionSelection: state.dimensionSelection,
          axisVisibility: state.axisVisibility,
        },
        selectedCohortId: overviewCohortId,
        selectedPathwayIds: [],
        selectedNodeIds: [],
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
        searchQuery: '',
        dimensionSelection: INITIAL_DIMENSION_SELECTION,
        axisVisibility: INITIAL_AXIS_VISIBILITY,
        hoveredBandId: null,
        sankeyNavigatorBandId: null,
        showMineActive: true,
      };
    }

    case 'ALL_PATIENTS_SCOPE_RESTORED':
      return {
        ...state,
        selectedCohortId: null,
        dimensionSelection: state.allPatientsSnapshot?.dimensionSelection
          ?? INITIAL_DIMENSION_SELECTION,
        axisVisibility: state.allPatientsSnapshot?.axisVisibility
          ?? INITIAL_AXIS_VISIBILITY,
        allPatientsSnapshot: null,
        // Reset cohort-specific state
        selectedPathwayIds: [],
        selectedNodeIds: [],
        selectedPatientId: null,
        filters: [],
        drawerStack: [],
        focusedColumnIndex: null,
        searchQuery: '',
        hoveredBandId: null,
        sankeyNavigatorBandId: null,
        showMineActive: true,
      };

    case 'SEARCH_CHANGED':
      return { ...state, searchQuery: action.query };

    // All-patients actions
    case 'DIMENSION_TOGGLED': {
      const arr = state.dimensionSelection[action.axis] as string[];
      const exists = arr.includes(action.id);
      // Reconstruct bandId for navigator (conditions/preventive use id as-is,
      // riskTiers/actionStatuses need prefix)
      const bandId = action.axis === 'riskTiers' ? `risk-${action.id}`
        : action.axis === 'actionStatuses' ? `action-${action.id}`
        : action.id;

      const newSelection = {
        ...state.dimensionSelection,
        [action.axis]: exists
          ? arr.filter((v) => v !== action.id)
          : [...arr, action.id],
      };

      let newNavigatorBandId: string | null;
      if (!exists) {
        // Selecting → open navigator for this band
        newNavigatorBandId = bandId;
      } else if (bandId !== state.sankeyNavigatorBandId) {
        // Deselecting a non-navigator band → keep current navigator
        newNavigatorBandId = state.sankeyNavigatorBandId;
      } else {
        // Deselecting the current navigator band → pick next remaining, or close
        const remaining = [
          ...newSelection.conditions,
          ...newSelection.preventive,
          ...newSelection.riskTiers.map((t: string) => `risk-${t}`),
          ...newSelection.actionStatuses.map((s: string) => `action-${s}`),
        ];
        newNavigatorBandId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      }

      return {
        ...state,
        dimensionSelection: newSelection,
        sankeyNavigatorBandId: newNavigatorBandId,
      };
    }

    case 'DIMENSIONS_CLEARED':
      return { ...state, dimensionSelection: INITIAL_DIMENSION_SELECTION, sankeyNavigatorBandId: null };

    case 'AXIS_VISIBILITY_CHANGED':
      return {
        ...state,
        axisVisibility: { ...state.axisVisibility, [action.axis]: action.visible },
      };

    case 'ALL_PATIENTS_VIEW_CHANGED':
      return { ...state, allPatientsView: action.view };

    case 'BAND_HOVERED':
      return { ...state, hoveredBandId: action.bandId };

    // Sankey navigator: toggle band drill-down
    case 'SANKEY_NAVIGATOR_TOGGLED':
      return {
        ...state,
        sankeyNavigatorBandId:
          action.bandId === state.sankeyNavigatorBandId ? null : action.bandId,
      };

    // Layer tree "Show Mine" actions
    case 'SHOW_MINE_APPLIED':
      return {
        ...state,
        showMineActive: true,
        selectedNodeIds: action.nodeIds,
      };

    case 'SHOW_MINE_CLEARED':
      return {
        ...state,
        showMineActive: false,
        selectedNodeIds: [],
      };

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
  /** Whether we can go back (reserved for future navigation) */
  canGoBack: boolean;
  /** Go back (no-op — reserved for navRef interface stability) */
  goBack: () => void;
}

const PopHealthContext = createContext<PopHealthContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

/** Ref interface for external navigation delegation (e.g. AppShell back button) */
export interface PopHealthNavRef {
  canGoBack: boolean;
  goBack: () => void;
}

export interface PopHealthProviderProps {
  children: React.ReactNode;
  initialCohortId?: string;
  /** Ref for external navigation delegation (AppShell back button) */
  navRef?: React.MutableRefObject<PopHealthNavRef>;
}

export const PopHealthProvider: React.FC<PopHealthProviderProps> = ({
  children,
  initialCohortId,
  navRef,
}) => {
  const [state, dispatch] = useReducer(popHealthReducer, {
    ...INITIAL_STATE,
    selectedCohortId: initialCohortId ?? null,
  });

  // When initialCohortId changes after mount, dispatch COHORT_SELECTED to reset
  // pop health state without remounting the entire tree (preserves menu state).
  // When returning to All Patients (initialCohortId becomes undefined),
  // restore the snapshot of dimension/axis state.
  const initialCohortRef = useRef(initialCohortId);
  useEffect(() => {
    if (initialCohortId !== initialCohortRef.current) {
      initialCohortRef.current = initialCohortId;
      if (initialCohortId) {
        dispatch({ type: 'COHORT_SELECTED', cohortId: initialCohortId });
      } else {
        // Returning to All Patients — restore snapshot
        dispatch({ type: 'ALL_PATIENTS_SCOPE_RESTORED' });
      }
    }
  }, [initialCohortId]);

  const canGoBack = false;
  const goBack = useCallback(() => {
    // No-op — reserved for navRef interface stability
  }, []);

  // Sync navRef so AppShell can read canGoBack/goBack without re-rendering
  if (navRef) {
    navRef.current = { canGoBack, goBack };
  }

  const value = useMemo<PopHealthContextValue>(() => ({
    state,
    dispatch,
    isDrawerOpen: state.drawerStack.length > 0,
    currentDrawerView: state.drawerStack.length > 0 ? state.drawerStack[state.drawerStack.length - 1] : null,
    canDrawerGoBack: state.drawerStack.length > 1,
    canGoBack,
    goBack,
  }), [state, dispatch, canGoBack, goBack]);

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
