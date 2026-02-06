/**
 * Memoization Utilities
 *
 * Selector memoization and equality functions for optimizing
 * state-derived computations.
 */

import type { EncounterState } from '../state/types';

// ============================================================================
// Selector Memoization
// ============================================================================

type Selector<T> = (state: EncounterState) => T;

/**
 * Creates a memoized selector that only recomputes when the state changes
 * or when the result would be different.
 */
export function createMemoizedSelector<T>(
  selector: Selector<T>,
  equalityFn: (a: T, b: T) => boolean = Object.is
): Selector<T> {
  let lastState: EncounterState | null = null;
  let lastResult: T | null = null;

  return (state: EncounterState): T => {
    // If same state reference, return cached result
    if (lastState === state) {
      return lastResult as T;
    }

    const newResult = selector(state);

    // If result is equal to last result, keep the cached value
    if (lastResult !== null && equalityFn(lastResult, newResult)) {
      lastState = state;
      return lastResult;
    }

    lastState = state;
    lastResult = newResult;
    return newResult;
  };
}

/**
 * Creates a memoized selector that depends on other selectors.
 */
export function createDerivedSelector<TDeps extends unknown[], TResult>(
  ...args: [...{ [K in keyof TDeps]: Selector<TDeps[K]> }, (...deps: TDeps) => TResult]
): Selector<TResult> {
  const selectors = args.slice(0, -1) as { [K in keyof TDeps]: Selector<TDeps[K]> };
  const combiner = args[args.length - 1] as (...deps: TDeps) => TResult;

  let lastDeps: TDeps | null = null;
  let lastResult: TResult | null = null;

  return (state: EncounterState): TResult => {
    const newDeps = selectors.map((s) => s(state)) as TDeps;

    // Check if deps changed
    if (lastDeps !== null && shallowArrayEqual(lastDeps, newDeps)) {
      return lastResult as TResult;
    }

    lastDeps = newDeps;
    lastResult = combiner(...newDeps);
    return lastResult;
  };
}

// ============================================================================
// Equality Functions
// ============================================================================

/**
 * Shallow equality for arrays.
 * Returns true if both arrays have the same length and all items are ===.
 */
export function shallowArrayEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

/**
 * Shallow equality for objects.
 * Returns true if both objects have the same keys and all values are ===.
 */
export function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) => (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key]
  );
}

/**
 * Deep equality for nested objects/arrays.
 * Use sparingly as it's more expensive.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    const arrB = b as unknown[];
    if (a.length !== arrB.length) return false;
    return a.every((item, i) => deepEqual(item, arrB[i]));
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(objA[key], objB[key]));
}
