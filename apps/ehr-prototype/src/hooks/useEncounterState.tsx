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

  // Expose test hooks on window in development mode
  React.useEffect(() => {
    if (devMode && typeof window !== 'undefined' && storeRef.current) {
      const store = storeRef.current;
      const win = window as unknown as Record<string, unknown>;

      // Get current encounter state
      win.__TEST_GET_ENCOUNTER_STATE__ = () => store.getState();

      // Inject a task - creates a new task in the store
      win.__TEST_INJECT_TASK__ = (taskInput: {
        id: string;
        type: string;
        status: string;
        displayTitle?: string;
        displayStatus?: string;
        priority?: string;
        trigger?: { action?: string; itemId?: string };
        result?: unknown;
        error?: string;
        progress?: number;
      }) => {
        // Create a full BackgroundTask object
        const task: import('../types').BackgroundTask = {
          id: taskInput.id,
          type: taskInput.type as import('../types').TaskType,
          status: taskInput.status as import('../types').TaskStatus,
          displayTitle: taskInput.displayTitle || taskInput.type,
          displayStatus: taskInput.displayStatus || taskInput.status,
          priority: (taskInput.priority as import('../types').Priority) || 'normal',
          trigger: {
            action: taskInput.trigger?.action || 'test-inject',
            itemId: taskInput.trigger?.itemId,
          },
          result: taskInput.result,
          error: taskInput.error,
          progress: taskInput.progress,
          createdAt: new Date(),
        };
        store.dispatch({
          type: 'TASK_CREATED',
          payload: { task },
        });
      };

      // Inject a chart item - creates a new item in the store
      win.__TEST_INJECT_ITEM__ = (itemInput: {
        id: string;
        category: string;
        displayText: string;
        status?: string;
        _meta?: { aiGenerated?: boolean; requiresReview?: boolean };
      }) => {
        // Build a minimal item - use unknown casting to bypass strict type checks
        // This is for testing only and won't be used in production
        const item = {
          id: itemInput.id,
          category: itemInput.category,
          displayText: itemInput.displayText,
          status: itemInput.status || 'confirmed',
          source: { type: 'manual' },
          createdAt: new Date(),
          tags: [],
          linkedDiagnoses: [],
          linkedEncounters: [],
          _meta: {
            aiGenerated: itemInput._meta?.aiGenerated ?? false,
            requiresReview: itemInput._meta?.requiresReview ?? false,
            confidence: 1,
            syncStatus: 'local' as const,
          },
        } as unknown as import('../types').ChartItem;
        const source: import('../types').ItemSource = { type: 'manual' };
        store.dispatch({
          type: 'ITEM_ADDED',
          payload: { item, source },
        });
      };

      // Clear all items
      win.__TEST_CLEAR_ITEMS__ = () => {
        const state = store.getState();
        Object.keys(state.entities.items).forEach((id) => {
          store.dispatch({ type: 'ITEM_DELETED', payload: { id } });
        });
      };

      // Set encounter ready for sign-off
      win.__TEST_SET_ENCOUNTER_READY__ = () => {
        // Complete all pending tasks and confirm all items
        const state = store.getState();
        Object.values(state.entities.tasks).forEach((task) => {
          if (task.status === 'pending-review' || task.status === 'processing') {
            store.dispatch({
              type: 'TASK_COMPLETED',
              payload: { id: task.id, result: { status: 'auto-completed' } },
            });
          }
        });
        Object.values(state.entities.items).forEach((item) => {
          if (item.status === 'pending-review') {
            store.dispatch({
              type: 'ITEM_CONFIRMED',
              payload: { id: item.id },
            });
          }
        });
      };

      // Cleanup
      return () => {
        delete win.__TEST_GET_ENCOUNTER_STATE__;
        delete win.__TEST_INJECT_TASK__;
        delete win.__TEST_INJECT_ITEM__;
        delete win.__TEST_CLEAR_ITEMS__;
        delete win.__TEST_SET_ENCOUNTER_READY__;
      };
    }
  }, [devMode]);

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
 * Main hook for accessing encounter state
 * Returns just the state; use useDispatch() for dispatch.
 */
export function useEncounterState(): EncounterState {
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

  return state;
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
