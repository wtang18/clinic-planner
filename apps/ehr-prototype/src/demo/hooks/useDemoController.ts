/**
 * useDemoController Hook
 *
 * React hook for managing the demo controller lifecycle and state.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { DemoController, DemoState, DemoEvent } from '../DemoController';
import { useEncounterState, useDispatch } from '../../hooks/useEncounterState';

// ============================================================================
// Types
// ============================================================================

interface UseDemoControllerOptions {
  autoInitialize?: boolean;
  onEvent?: (event: DemoEvent) => void;
}

interface UseDemoControllerResult {
  controller: DemoController | null;
  state: DemoState | null;
  loadScenario: (scenarioId: string) => void;
  controls: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    stepForward: () => void;
    stepBackward: () => void;
    setSpeed: (speed: number) => void;
    goToEvent: (index: number) => void;
  };
  scenarios: ReturnType<DemoController['getAvailableScenarios']>;
}

// ============================================================================
// Hook
// ============================================================================

export function useDemoController(
  options: UseDemoControllerOptions = {}
): UseDemoControllerResult {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const controllerRef = useRef<DemoController | null>(null);
  const [demoState, setDemoState] = useState<DemoState | null>(null);

  // Initialize controller
  useEffect(() => {
    if (options.autoInitialize && !controllerRef.current) {
      const ctrl = new DemoController({
        dispatch: dispatch as (action: unknown) => void,
        getState: () => state,
        onEvent: options.onEvent,
      });
      controllerRef.current = ctrl;

      // Subscribe to state changes
      const unsubscribe = ctrl.subscribe(setDemoState);
      return () => {
        unsubscribe();
        ctrl.destroy();
        controllerRef.current = null;
      };
    }
  }, [options.autoInitialize, dispatch, state, options.onEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  const loadScenario = useCallback((scenarioId: string) => {
    controllerRef.current?.loadScenario(scenarioId);
  }, []);

  const controls = {
    start: useCallback(() => controllerRef.current?.start(), []),
    pause: useCallback(() => controllerRef.current?.pause(), []),
    resume: useCallback(() => controllerRef.current?.resume(), []),
    stop: useCallback(() => controllerRef.current?.stop(), []),
    stepForward: useCallback(() => controllerRef.current?.stepForward(), []),
    stepBackward: useCallback(() => controllerRef.current?.stepBackward(), []),
    setSpeed: useCallback(
      (speed: number) => controllerRef.current?.setSpeed(speed),
      []
    ),
    goToEvent: useCallback(
      (index: number) => controllerRef.current?.goToEvent(index),
      []
    ),
  };

  return {
    controller: controllerRef.current,
    state: demoState,
    loadScenario,
    controls,
    scenarios: controllerRef.current?.getAvailableScenarios() || [],
  };
}

/**
 * Create a standalone demo controller (for use outside of React)
 */
export function createStandaloneDemoController(
  dispatch: (action: unknown) => void,
  getState: () => ReturnType<typeof useEncounterState>,
  onEvent?: (event: DemoEvent) => void
): DemoController {
  return new DemoController({
    dispatch,
    getState,
    onEvent,
  });
}
