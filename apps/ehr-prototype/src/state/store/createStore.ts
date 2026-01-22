/**
 * Store factory
 *
 * Creates the state store with middleware support.
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';
import type { Store, StoreListener, Middleware, Dispatch, Unsubscribe } from './types';
import { createInitialState, createInitialStateWith } from '../initialState';
import { rootReducer } from '../reducers/root';

/**
 * Store configuration options
 */
export interface StoreConfig {
  /** Initial state overrides */
  initialState?: Partial<EncounterState>;
  /** Middleware to apply (in order) */
  middleware?: Middleware[];
}

/**
 * Create a new store instance
 */
export function createStore(config: StoreConfig = {}): Store {
  const { initialState, middleware = [] } = config;

  // Initialize state
  let state: EncounterState = initialState
    ? createInitialStateWith(initialState)
    : createInitialState();

  // Listeners for state changes
  const listeners: Set<StoreListener> = new Set();

  // Base dispatch (applies reducer)
  const baseDispatch: Dispatch = (action: EncounterAction) => {
    const previousState = state;
    state = rootReducer(state, action);

    // Notify listeners after state update
    for (const listener of listeners) {
      try {
        listener(state, action);
      } catch (error) {
        console.error('[STORE] Listener error:', error);
      }
    }
  };

  // Build middleware chain
  const middlewareAPI = {
    getState: () => state,
    dispatch: (action: EncounterAction) => dispatch(action),
  };

  // Compose middleware
  let dispatch: Dispatch = baseDispatch;

  if (middleware.length > 0) {
    // Apply middleware in reverse order so first middleware runs first
    const chain = middleware.map(m => m(middlewareAPI));
    dispatch = chain.reduceRight(
      (next, mw) => mw(next),
      baseDispatch
    );
  }

  // Store implementation
  const store: Store = {
    getState: () => state,

    dispatch: (action: EncounterAction) => {
      dispatch(action);
    },

    subscribe: (listener: StoreListener): Unsubscribe => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return store;
}

/**
 * Create a store with default middleware for development
 */
export function createDevStore(config: StoreConfig = {}): Store {
  // Import middleware dynamically to avoid circular deps
  const { createAuditMiddleware, consoleAuditLogger } = require('../middleware/audit');
  const { validationMiddleware } = require('../middleware/validation');

  return createStore({
    ...config,
    middleware: [
      createAuditMiddleware(consoleAuditLogger),
      validationMiddleware,
      ...(config.middleware || []),
    ],
  });
}
