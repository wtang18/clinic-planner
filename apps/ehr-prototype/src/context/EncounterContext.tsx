/**
 * EncounterContext
 *
 * React context for encounter state management.
 * Provides access to the store, state, and dispatch throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { EncounterState } from '../state/types';
import type { EncounterAction } from '../state/actions/types';
import type { Store, Middleware } from '../state/store/types';
import { createStore, createDevStore } from '../state/store/createStore';

// ============================================================================
// Types
// ============================================================================

interface EncounterContextValue {
  state: EncounterState;
  dispatch: (action: EncounterAction) => void;
  store: Store;
}

export interface EncounterProviderProps {
  children: React.ReactNode;
  initialState?: Partial<EncounterState>;
  middleware?: Middleware[];
  devMode?: boolean;
}

// ============================================================================
// Context
// ============================================================================

const EncounterContext = createContext<EncounterContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export const EncounterProvider: React.FC<EncounterProviderProps> = ({
  children,
  initialState,
  middleware = [],
  devMode = __DEV__,
}) => {
  // Create store once using ref to avoid recreation
  const storeRef = useRef<Store | null>(null);

  if (storeRef.current === null) {
    storeRef.current = devMode
      ? createDevStore({ initialState, middleware })
      : createStore({ initialState, middleware });
  }

  const store = storeRef.current;

  // Track state for React re-renders
  const [state, setState] = useState<EncounterState>(store.getState);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    // Sync initial state
    setState(store.getState());

    return unsubscribe;
  }, [store]);

  const value: EncounterContextValue = {
    state,
    dispatch: store.dispatch,
    store,
  };

  return (
    <EncounterContext.Provider value={value}>
      {children}
    </EncounterContext.Provider>
  );
};

EncounterProvider.displayName = 'EncounterProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the full encounter context
 */
export const useEncounterContext = (): EncounterContextValue => {
  const context = useContext(EncounterContext);
  if (!context) {
    throw new Error('useEncounterContext must be used within EncounterProvider');
  }
  return context;
};

/**
 * Access just the encounter state
 */
export const useEncounterStateFromContext = (): EncounterState => {
  return useEncounterContext().state;
};

/**
 * Access just the dispatch function
 */
export const useEncounterDispatch = (): ((action: EncounterAction) => void) => {
  return useEncounterContext().dispatch;
};

/**
 * Access the store directly (for advanced use cases)
 */
export const useEncounterStore = (): Store => {
  return useEncounterContext().store;
};

/**
 * Selector hook with memoization
 */
export function useEncounterSelector<T>(
  selector: (state: EncounterState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const { state } = useEncounterContext();
  const selectedStateRef = useRef<T>(selector(state));

  const newSelectedState = selector(state);

  // Use custom equality function or Object.is
  const isEqual = equalityFn
    ? equalityFn(selectedStateRef.current, newSelectedState)
    : Object.is(selectedStateRef.current, newSelectedState);

  if (!isEqual) {
    selectedStateRef.current = newSelectedState;
  }

  return selectedStateRef.current;
}
