/**
 * Store types
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';

/**
 * Store interface
 */
export interface Store {
  /** Get the current state */
  getState(): EncounterState;
  
  /** Dispatch an action to update state */
  dispatch(action: EncounterAction): void;
  
  /** Subscribe to state changes */
  subscribe(listener: StoreListener): Unsubscribe;
}

/**
 * Store listener callback
 */
export type StoreListener = (
  state: EncounterState,
  action: EncounterAction
) => void;

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void;

/**
 * Middleware function signature
 */
export type Middleware = (
  store: MiddlewareAPI
) => (next: Dispatch) => (action: EncounterAction) => void;

/**
 * Middleware API (subset of store exposed to middleware)
 */
export interface MiddlewareAPI {
  getState(): EncounterState;
  dispatch(action: EncounterAction): void;
}

/**
 * Dispatch function
 */
export type Dispatch = (action: EncounterAction) => void;
