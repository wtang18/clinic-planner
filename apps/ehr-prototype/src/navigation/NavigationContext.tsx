/**
 * NavigationContext
 *
 * Simple navigation context for the prototype.
 * In production, this would be replaced with a proper router (React Navigation, etc.)
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Mode } from '../state/types';
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
  | 'settings';

export interface NavigationState {
  screen: Screen;
  encounterId: string | null;
  patientId: string | null;
  mode: Mode | null;
  params: Record<string, string>;
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
}

// ============================================================================
// Context
// ============================================================================

const NavigationContext = createContext<NavigationContextValue | null>(null);

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

  const canGoBack = navigationStack.length > 1;

  const value = useMemo<NavigationContextValue>(
    () => ({
      state: currentState,
      navigate,
      navigateToEncounter,
      navigateToPatient,
      goBack,
      setMode,
      canGoBack,
    }),
    [currentState, navigate, navigateToEncounter, navigateToPatient, goBack, setMode, canGoBack]
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
