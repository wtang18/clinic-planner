/**
 * useEncounterState Hook
 *
 * Main state hook providing access to the encounter store.
 * Creates a React context for the store and provides hooks for
 * accessing state and dispatching actions.
 */

import React from 'react';
import type { EncounterState } from '../state/types';
import type { EncounterAction } from '../state/actions/types';
import type { Store } from '../state/store/types';
import { createStore, createDevStore } from '../state/store/createStore';

// ============================================================================
// Store Context
// ============================================================================

const StoreContext = React.createContext<Store | null>(null);

// ============================================================================
// Store Provider
// ============================================================================

export interface EncounterStoreProviderProps {
  children: React.ReactNode;
  /** Initial state overrides */
  initialState?: Partial<EncounterState>;
  /** Use development store with logging */
  devMode?: boolean;
}

/**
 * Provider component that creates and provides the encounter store
 */
export const EncounterStoreProvider: React.FC<EncounterStoreProviderProps> = ({
  children,
  initialState,
  devMode = false,
}) => {
  // Create store once on mount
  const storeRef = React.useRef<Store | null>(null);

  if (storeRef.current === null) {
    storeRef.current = devMode
      ? createDevStore({ initialState })
      : createStore({ initialState });
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

EncounterStoreProvider.displayName = 'EncounterStoreProvider';

// ============================================================================
// Core Hooks
// ============================================================================

/**
 * Get the store instance from context
 * @throws Error if used outside of EncounterStoreProvider
 */
export function useStore(): Store {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within an EncounterStoreProvider');
  }
  return store;
}

/**
 * Main hook for accessing encounter state and dispatch
 */
export function useEncounterState(): {
  state: EncounterState;
  dispatch: (action: EncounterAction) => void;
} {
  const store = useStore();
  const [state, setState] = React.useState(store.getState);

  React.useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    // Sync state in case it changed between render and effect
    setState(store.getState());

    return unsubscribe;
  }, [store]);

  return {
    state,
    dispatch: store.dispatch,
  };
}

/**
 * Hook for selecting a specific piece of state with memoization
 * Re-renders only when the selected value changes
 */
export function useSelector<T>(selector: (state: EncounterState) => T): T {
  const store = useStore();
  const [selectedState, setSelectedState] = React.useState(() =>
    selector(store.getState())
  );

  // Keep track of selector for comparison
  const selectorRef = React.useRef(selector);
  selectorRef.current = selector;

  React.useEffect(() => {
    // Initial sync
    const currentValue = selectorRef.current(store.getState());
    setSelectedState(currentValue);

    // Subscribe to changes
    const unsubscribe = store.subscribe((newState) => {
      const newValue = selectorRef.current(newState);
      setSelectedState((prevValue) => {
        // Only update if value actually changed
        return Object.is(prevValue, newValue) ? prevValue : newValue;
      });
    });

    return unsubscribe;
  }, [store]);

  return selectedState;
}

/**
 * Hook for getting just the dispatch function
 */
export function useDispatch(): (action: EncounterAction) => void {
  const store = useStore();
  return store.dispatch;
}

// ============================================================================
// Context Selectors
// ============================================================================

/**
 * Hook for accessing encounter context
 */
export function useEncounterContext() {
  return useSelector((state) => state.context);
}

/**
 * Hook for accessing current patient
 */
export function usePatient() {
  return useSelector((state) => state.context.patient);
}

/**
 * Hook for accessing current encounter metadata
 */
export function useEncounterMeta() {
  return useSelector((state) => state.context.encounter);
}

// ============================================================================
// Session Selectors
// ============================================================================

/**
 * Hook for accessing current mode
 */
export function useMode() {
  return useSelector((state) => state.session.mode);
}

/**
 * Hook for accessing current user
 */
export function useCurrentUser() {
  return useSelector((state) => state.session.currentUser);
}

/**
 * Hook for accessing transcription state
 */
export function useTranscriptionState() {
  return useSelector((state) => state.session.transcription);
}

// ============================================================================
// Sync Selectors
// ============================================================================

/**
 * Hook for accessing sync status
 */
export function useSyncStatus() {
  return useSelector((state) => state.sync.status);
}

/**
 * Hook for checking if there are pending sync items
 */
export function useHasPendingSync() {
  return useSelector((state) => state.sync.queue.length > 0);
}

// ============================================================================
// Counts
// ============================================================================

/**
 * Hook for getting entity counts
 */
export function useCounts() {
  return useSelector((state) => ({
    items: Object.keys(state.entities.items).length,
    suggestions: Object.keys(state.entities.suggestions).length,
    tasks: Object.keys(state.entities.tasks).length,
    careGaps: Object.keys(state.entities.careGaps).length,
  }));
}
