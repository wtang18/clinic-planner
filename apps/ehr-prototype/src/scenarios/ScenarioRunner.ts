/**
 * ScenarioRunner
 *
 * Scenario execution engine for demos and testing.
 * Replays timed events to simulate real encounter workflows.
 */

import type { EncounterState } from '../state/types';
import type { EncounterAction } from '../state/actions/types';
import type { Store } from '../state/store/types';

// ============================================================================
// Types
// ============================================================================

export interface ScenarioEvent {
  /** Delay from previous event in milliseconds */
  delayMs: number;
  /** Action to dispatch */
  action: EncounterAction;
  /** Description for narration/logging */
  description: string;
}

export interface Scenario {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of the scenario */
  description: string;
  /** Initial state overrides */
  initialState?: Partial<EncounterState>;
  /** Sequence of events to replay */
  events: ScenarioEvent[];
}

export interface ScenarioStatus {
  isLoaded: boolean;
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalEvents: number;
  elapsedMs: number;
  scenarioId: string | null;
}

export type EventHandler = (event: ScenarioEvent, index: number) => void;
export type CompleteHandler = () => void;

export interface ScenarioRunner {
  /** Load a scenario for playback */
  load(scenario: Scenario): void;
  /** Start playback from the beginning */
  start(): void;
  /** Pause playback */
  pause(): void;
  /** Resume playback from paused state */
  resume(): void;
  /** Stop playback and reset */
  stop(): void;
  /** Step forward one event */
  stepForward(): void;
  /** Go to a specific event index */
  goToEvent(index: number): void;
  /** Set playback speed multiplier */
  setSpeed(multiplier: number): void;
  /** Get current status */
  getStatus(): ScenarioStatus;
  /** Get current event index */
  getCurrentEventIndex(): number;
  /** Subscribe to event execution */
  onEventExecuted(handler: EventHandler): () => void;
  /** Subscribe to scenario completion */
  onComplete(handler: CompleteHandler): () => void;
}

// ============================================================================
// Implementation
// ============================================================================

export function createScenarioRunner(store: Store): ScenarioRunner {
  // State
  let scenario: Scenario | null = null;
  let currentIndex = 0;
  let isRunning = false;
  let isPaused = false;
  let speed = 1;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let elapsedMs = 0;
  let lastEventTime = 0;

  // Listeners
  const eventListeners = new Set<EventHandler>();
  const completeListeners = new Set<CompleteHandler>();

  // Execute an event
  function executeEvent(index: number): void {
    if (!scenario || index >= scenario.events.length) {
      return;
    }

    const event = scenario.events[index];

    // Dispatch the action
    store.dispatch(event.action);

    // Notify listeners
    for (const listener of eventListeners) {
      try {
        listener(event, index);
      } catch (error) {
        console.error('[ScenarioRunner] Event listener error:', error);
      }
    }

    currentIndex = index;
    lastEventTime = Date.now();
  }

  // Schedule the next event
  function scheduleNextEvent(): void {
    if (!scenario || !isRunning || isPaused) {
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= scenario.events.length) {
      // Scenario complete
      isRunning = false;
      for (const listener of completeListeners) {
        try {
          listener();
        } catch (error) {
          console.error('[ScenarioRunner] Complete listener error:', error);
        }
      }
      return;
    }

    const nextEvent = scenario.events[nextIndex];
    const delay = nextEvent.delayMs / speed;

    timeoutId = setTimeout(() => {
      if (isRunning && !isPaused) {
        elapsedMs += nextEvent.delayMs;
        executeEvent(nextIndex);
        scheduleNextEvent();
      }
    }, delay);
  }

  // Public API
  function load(newScenario: Scenario): void {
    stop();
    scenario = newScenario;
    currentIndex = -1;
    elapsedMs = 0;
  }

  function start(): void {
    if (!scenario) {
      console.warn('[ScenarioRunner] No scenario loaded');
      return;
    }

    stop();
    isRunning = true;
    isPaused = false;
    currentIndex = -1;
    elapsedMs = 0;

    // Execute first event immediately
    if (scenario.events.length > 0) {
      executeEvent(0);
      scheduleNextEvent();
    }
  }

  function pause(): void {
    if (!isRunning) return;

    isPaused = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function resume(): void {
    if (!isRunning || !isPaused) return;

    isPaused = false;
    scheduleNextEvent();
  }

  function stop(): void {
    isRunning = false;
    isPaused = false;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function stepForward(): void {
    if (!scenario) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < scenario.events.length) {
      elapsedMs += scenario.events[nextIndex].delayMs;
      executeEvent(nextIndex);
    }
  }

  function goToEvent(index: number): void {
    if (!scenario) return;
    if (index < 0 || index >= scenario.events.length) return;

    // Reset and replay events up to the target index
    stop();
    currentIndex = -1;
    elapsedMs = 0;

    for (let i = 0; i <= index; i++) {
      elapsedMs += scenario.events[i].delayMs;
      executeEvent(i);
    }
  }

  function setSpeed(multiplier: number): void {
    if (multiplier <= 0) return;
    speed = multiplier;
  }

  function getStatus(): ScenarioStatus {
    return {
      isLoaded: scenario !== null,
      isRunning,
      isPaused,
      currentIndex,
      totalEvents: scenario?.events.length ?? 0,
      elapsedMs,
      scenarioId: scenario?.id ?? null,
    };
  }

  function getCurrentEventIndex(): number {
    return currentIndex;
  }

  function onEventExecuted(handler: EventHandler): () => void {
    eventListeners.add(handler);
    return () => {
      eventListeners.delete(handler);
    };
  }

  function onComplete(handler: CompleteHandler): () => void {
    completeListeners.add(handler);
    return () => {
      completeListeners.delete(handler);
    };
  }

  return {
    load,
    start,
    pause,
    resume,
    stop,
    stepForward,
    goToEvent,
    setSpeed,
    getStatus,
    getCurrentEventIndex,
    onEventExecuted,
    onComplete,
  };
}
