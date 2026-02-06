/**
 * TourTargetRegistry
 *
 * Provides a ref-based registry for tour target elements.
 * Components register themselves with a testID, and the tour system
 * can measure their layout without DOM queries.
 */

import React, { createContext, useContext, useRef, useCallback } from 'react';
import type { LayoutRectangle, View } from 'react-native';

// ============================================================================
// Types
// ============================================================================

interface TourTargetRegistryValue {
  registerTarget: (testId: string, ref: React.RefObject<View | null>) => void;
  unregisterTarget: (testId: string) => void;
  measureTarget: (testId: string) => Promise<LayoutRectangle | null>;
}

// ============================================================================
// Context
// ============================================================================

const TourTargetContext = createContext<TourTargetRegistryValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export const TourTargetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const targetsRef = useRef<Map<string, React.RefObject<View | null>>>(new Map());

  const registerTarget = useCallback(
    (testId: string, ref: React.RefObject<View | null>) => {
      targetsRef.current.set(testId, ref);
    },
    []
  );

  const unregisterTarget = useCallback((testId: string) => {
    targetsRef.current.delete(testId);
  }, []);

  const measureTarget = useCallback(
    (testId: string): Promise<LayoutRectangle | null> => {
      return new Promise((resolve) => {
        const ref = targetsRef.current.get(testId);
        if (!ref?.current) {
          resolve(null);
          return;
        }

        // measureInWindow works cross-platform (React Native + Web)
        ref.current.measureInWindow((x, y, width, height) => {
          if (width === 0 && height === 0) {
            resolve(null);
          } else {
            resolve({ x, y, width, height });
          }
        });
      });
    },
    []
  );

  return (
    <TourTargetContext.Provider
      value={{ registerTarget, unregisterTarget, measureTarget }}
    >
      {children}
    </TourTargetContext.Provider>
  );
};

TourTargetProvider.displayName = 'TourTargetProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the tour target registry
 */
export function useTourTargets(): TourTargetRegistryValue {
  const context = useContext(TourTargetContext);
  if (!context) {
    throw new Error('useTourTargets must be used within TourTargetProvider');
  }
  return context;
}

/**
 * Hook for components to register as tour targets.
 * Usage: const ref = useTourTarget('my-testid');
 * Then: <View ref={ref} testID="my-testid">...</View>
 */
export function useTourTarget(testId: string): React.RefObject<View | null> {
  const ref = useRef<View | null>(null);
  const { registerTarget, unregisterTarget } = useTourTargets();

  React.useEffect(() => {
    registerTarget(testId, ref);
    return () => unregisterTarget(testId);
  }, [testId, registerTarget, unregisterTarget]);

  return ref;
}

/**
 * Hook for optional tour target registration.
 * Returns null if not within TourTargetProvider.
 */
export function useTourTargetOptional(
  testId: string
): React.RefObject<View | null> | null {
  const context = useContext(TourTargetContext);
  const ref = useRef<View | null>(null);

  React.useEffect(() => {
    if (context) {
      context.registerTarget(testId, ref);
      return () => context.unregisterTarget(testId);
    }
  }, [testId, context]);

  return context ? ref : null;
}
