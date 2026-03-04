/**
 * NavigationContext
 *
 * Simple navigation context for the prototype.
 * In production, this would be replaced with a proper router (React Navigation, etc.)
 *
 * Includes scope stack for drill-through navigation (cohort → patient → back).
 * The scope system is a layer on top of existing navigation that manages a scope stack
 * and translates scopes to screen navigation.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Mode } from '../state/types';
import type { Scope, ScopeStackEntry, CohortViewState, EncounterViewState } from '../types/scope';
import {
  ROUTES,
  buildEncounterRoute,
  parseEncounterId,
  parseModeFromPath,
  DEMO_ENCOUNTERS,
} from './routes';

// ============================================================================
// Types
// ============================================================================

export type Screen =
  | 'home'
  | 'demo'
  | 'encounter'
  | 'patient'
  | 'population-health'
  | 'settings';

export interface NavigationState {
  screen: Screen;
  encounterId: string | null;
  patientId: string | null;
  mode: Mode | null;
  params: Record<string, string>;
}

/** Target for scroll-to-section navigation */
export interface ScrollTarget {
  sectionId: string;
  timestamp: number;
}

/** Options for navigateToScope */
export interface NavigateToScopeOptions {
  mode?: 'replace' | 'push';
  originLabel?: string;
  /** Caller's current view state — captured into ScopeStackEntry on push */
  preserveState?: CohortViewState | EncounterViewState;
}

export interface NavigationContextValue {
  /** Current navigation state */
  state: NavigationState;
  /** Navigate to a screen */
  navigate: (screen: Screen, params?: Record<string, string>) => void;
  /** Navigate to an encounter */
  navigateToEncounter: (encounterId: string, mode?: Mode) => void;
  /** Navigate to a patient */
  navigateToPatient: (patientId: string) => void;
  /** Go back (if applicable) */
  goBack: () => void;
  /** Change encounter mode */
  setMode: (mode: Mode) => void;
  /** Check if can go back */
  canGoBack: boolean;
  /** Navigate to a specific section within a mode (switches mode + scrolls) */
  navigateToSection: (mode: Mode, sectionId: string) => void;
  /** Current scroll target (consumed by useScrollToSection) */
  scrollTarget: ScrollTarget | null;
  /** Clear scroll target after scrolling */
  clearScrollTarget: () => void;

  // ---- Scope stack methods ----

  /** Navigate to a scope (replace current or push onto stack) */
  navigateToScope: (scope: Scope, options?: NavigateToScopeOptions) => void;
  /** Pop scope stack and navigate to previous scope */
  popScope: () => void;
  /** Current scope (derived from top of scope stack, or from current navigation state) */
  currentScope: Scope | null;
  /** Whether the scope stack has depth > 1 (controls return affordance visibility) */
  canPopScope: boolean;
  /** Label of the origin scope (for return affordance display) */
  scopeOriginLabel: string | null;
  /** State preserved from the most recent popScope(). Cleared after explicit call. */
  restoredState: CohortViewState | EncounterViewState | null;
  /** Clear restored state after workspace hydration. */
  clearRestoredState: () => void;
}

// ============================================================================
// Context
// ============================================================================

const NavigationContext = createContext<NavigationContextValue | null>(null);

// ============================================================================
// Helpers
// ============================================================================

/** Derive a Scope from current NavigationState (fallback when no explicit scope is set) */
function deriveScope(navState: NavigationState): Scope | null {
  switch (navState.screen) {
    case 'encounter':
      return {
        type: 'patient',
        patientId: navState.patientId || '',
        encounterId: navState.encounterId || undefined,
      };
    case 'demo':
    case 'home':
      return { type: 'hub', hubId: 'home' };
    default:
      return null;
  }
}

/** Translate a Scope to screen navigation parameters */
function scopeToNavigation(scope: Scope): { screen: Screen; params: Record<string, string>; encounterId?: string; mode?: Mode } {
  switch (scope.type) {
    case 'hub':
      return { screen: 'demo', params: {} };
    case 'cohort':
      return {
        screen: 'encounter',
        params: { cohortId: scope.cohortId, ...(scope.pathwayId ? { pathwayId: scope.pathwayId } : {}) },
      };
    case 'patient':
      if (scope.encounterId) {
        return {
          screen: 'encounter',
          params: { encounterId: scope.encounterId, mode: 'capture' },
          encounterId: scope.encounterId,
          mode: 'capture',
        };
      }
      return {
        screen: 'patient',
        params: { patientId: scope.patientId },
      };
    case 'todo':
      return {
        screen: 'encounter',
        params: { categoryId: scope.categoryId, filterId: scope.filterId },
      };
  }
}

// ============================================================================
// Provider
// ============================================================================

export interface NavigationProviderProps {
  children: React.ReactNode;
  initialScreen?: Screen;
  initialEncounterId?: string;
  initialMode?: Mode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialScreen = 'demo',
  initialEncounterId = DEMO_ENCOUNTERS.UC_COUGH,
  initialMode = 'capture',
}) => {
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([
    {
      screen: initialScreen,
      encounterId: initialEncounterId,
      patientId: null,
      mode: initialMode,
      params: {},
    },
  ]);

  // Current state is the top of the stack
  const currentState = navigationStack[navigationStack.length - 1];

  // ---- Scope stack state ----
  const [scopeStack, setScopeStack] = useState<ScopeStackEntry[]>([]);
  const [restoredState, setRestoredState] = useState<CohortViewState | EncounterViewState | null>(null);

  // Navigate to a screen
  const navigate = useCallback(
    (screen: Screen, params: Record<string, string> = {}) => {
      setNavigationStack((prev) => [
        ...prev,
        {
          screen,
          encounterId: params.encounterId || null,
          patientId: params.patientId || null,
          mode: (params.mode as Mode) || null,
          params,
        },
      ]);
    },
    []
  );

  // Navigate to an encounter
  const navigateToEncounter = useCallback(
    (encounterId: string, mode: Mode = 'capture') => {
      setNavigationStack((prev) => [
        ...prev,
        {
          screen: 'encounter',
          encounterId,
          patientId: null,
          mode,
          params: { encounterId, mode },
        },
      ]);
    },
    []
  );

  // Navigate to a patient
  const navigateToPatient = useCallback((patientId: string) => {
    setNavigationStack((prev) => [
      ...prev,
      {
        screen: 'patient',
        encounterId: null,
        patientId,
        mode: null,
        params: { patientId },
      },
    ]);
  }, []);

  // Go back
  const goBack = useCallback(() => {
    setNavigationStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  // Change mode (within an encounter)
  const setMode = useCallback((mode: Mode) => {
    setNavigationStack((prev) => {
      const current = prev[prev.length - 1];
      if (current.screen !== 'encounter') return prev;

      return [
        ...prev.slice(0, -1),
        {
          ...current,
          mode,
          params: { ...current.params, mode },
        },
      ];
    });
  }, []);

  // Scroll target state for deep-linking from rail rows to sections
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);

  const clearScrollTarget = useCallback(() => {
    setScrollTarget(null);
  }, []);

  // Navigate to a specific section within a mode
  const navigateToSection = useCallback((mode: Mode, sectionId: string) => {
    setMode(mode);
    setScrollTarget({ sectionId, timestamp: Date.now() });
  }, [setMode]);

  const canGoBack = navigationStack.length > 1;

  // ---- Scope stack methods ----

  const navigateToScope = useCallback((scope: Scope, options?: NavigateToScopeOptions) => {
    const mode = options?.mode ?? 'replace';

    if (mode === 'push') {
      // Capture current scope + preserveState into a ScopeStackEntry, push onto stack
      setScopeStack((prev) => {
        const currentScope = prev.length > 0
          ? prev[prev.length - 1].scope
          : deriveScope(currentState);

        const entry: ScopeStackEntry = {
          scope: currentScope || { type: 'hub', hubId: 'home' },
          originLabel: options?.originLabel,
          preservedState: options?.preserveState,
        };
        return [...prev, entry];
      });
    } else {
      // Replace: clear the scope stack
      setScopeStack([]);
    }

    // Translate scope to screen navigation
    const nav = scopeToNavigation(scope);
    if (nav.encounterId) {
      navigateToEncounter(nav.encounterId, nav.mode);
    } else {
      navigate(nav.screen, nav.params);
    }
  }, [currentState, navigate, navigateToEncounter]);

  const popScope = useCallback(() => {
    setScopeStack((prev) => {
      if (prev.length === 0) return prev;

      const popped = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      // Navigate to the popped scope
      const nav = scopeToNavigation(popped.scope);
      if (nav.encounterId) {
        navigateToEncounter(nav.encounterId, nav.mode);
      } else {
        navigate(nav.screen, nav.params);
      }

      // Set restored state from the popped entry
      if (popped.preservedState) {
        setRestoredState(popped.preservedState);
      }

      return newStack;
    });
  }, [navigate, navigateToEncounter]);

  const currentScope = useMemo<Scope | null>(() => {
    return deriveScope(currentState);
  }, [currentState]);

  const canPopScope = scopeStack.length > 0;

  const scopeOriginLabel = useMemo<string | null>(() => {
    if (scopeStack.length === 0) return null;
    return scopeStack[scopeStack.length - 1].originLabel || null;
  }, [scopeStack]);

  const clearRestoredState = useCallback(() => {
    setRestoredState(null);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      state: currentState,
      navigate,
      navigateToEncounter,
      navigateToPatient,
      goBack,
      setMode,
      canGoBack,
      navigateToSection,
      scrollTarget,
      clearScrollTarget,
      // Scope stack
      navigateToScope,
      popScope,
      currentScope,
      canPopScope,
      scopeOriginLabel,
      restoredState,
      clearRestoredState,
    }),
    [currentState, navigate, navigateToEncounter, navigateToPatient, goBack, setMode, canGoBack, navigateToSection, scrollTarget, clearScrollTarget, navigateToScope, popScope, currentScope, canPopScope, scopeOriginLabel, restoredState, clearRestoredState]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

NavigationProvider.displayName = 'NavigationProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the navigation context
 */
export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

/**
 * Get the current screen
 */
export const useCurrentScreen = (): Screen => {
  return useNavigation().state.screen;
};

/**
 * Get current encounter ID
 */
export const useEncounterId = (): string | null => {
  return useNavigation().state.encounterId;
};

/**
 * Get current encounter mode
 */
export const useCurrentMode = (): Mode | null => {
  return useNavigation().state.mode;
};
