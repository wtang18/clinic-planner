/**
 * Side effects middleware
 * 
 * Triggers AI services and other side effects after state updates.
 */

import type { EncounterAction } from '../actions/types';
import type { EncounterState } from '../types';
import type { Middleware, Dispatch } from '../store/types';

/**
 * Side effect handler function
 */
export type SideEffectHandler = (
  action: EncounterAction,
  state: EncounterState,
  dispatch: Dispatch
) => void | Promise<void>;

/**
 * Side effects middleware options
 */
export interface SideEffectsMiddlewareOptions {
  /** Handlers to run after each action */
  handlers: SideEffectHandler[];
  /** Whether to await async handlers (default: false) */
  awaitAsync?: boolean;
  /** Error handler for failed side effects */
  onError?: (error: Error, action: EncounterAction) => void;
}

/**
 * Create side effects middleware
 */
export const createSideEffectsMiddleware = (
  options: SideEffectsMiddlewareOptions
): Middleware => {
  const { handlers, awaitAsync = false, onError } = options;
  
  return (store) => (next) => (action) => {
    // First, let the action go through to update state
    next(action);
    
    // Then run side effect handlers with updated state
    const state = store.getState();
    
    for (const handler of handlers) {
      try {
        const result = handler(action, state, store.dispatch);
        
        if (result instanceof Promise) {
          if (awaitAsync) {
            // Note: This blocks synchronously which is usually not desired
            result.catch((error) => {
              if (onError) {
                onError(error, action);
              } else {
                console.error('[SIDE_EFFECT]', action.type, error);
              }
            });
          } else {
            // Fire and forget, but still handle errors
            result.catch((error) => {
              if (onError) {
                onError(error, action);
              } else {
                console.error('[SIDE_EFFECT]', action.type, error);
              }
            });
          }
        }
      } catch (error) {
        if (onError) {
          onError(error as Error, action);
        } else {
          console.error('[SIDE_EFFECT]', action.type, error);
        }
      }
    }
  };
};

/**
 * Helper to create a side effect handler that only runs for specific action types
 */
export function createFilteredHandler(
  actionTypes: string[],
  handler: SideEffectHandler
): SideEffectHandler {
  const typeSet = new Set(actionTypes);
  return (action, state, dispatch) => {
    if (typeSet.has(action.type)) {
      return handler(action, state, dispatch);
    }
  };
}
