/**
 * DemoController
 *
 * Controller for demo mode with playback, step-through, speed control,
 * and annotation support for presentations.
 */

import type { EncounterState } from '../state/types';

// ============================================================================
// Types
// ============================================================================

export interface DemoEvent {
  type: 'scenario-loaded' | 'event-executed' | 'scenario-complete' | 'paused' | 'resumed' | 'step';
  payload?: unknown;
}

export interface DemoAnnotation {
  id: string;
  text: string;
  targetTestId?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  duration?: number;
  showAt: number;
}

export interface DemoState {
  isActive: boolean;
  currentScenarioId: string | null;
  eventIndex: number;
  totalEvents: number;
  isPaused: boolean;
  speed: number;
  annotations: DemoAnnotation[];
}

export interface DemoControllerConfig {
  dispatch: (action: unknown) => void;
  getState: () => EncounterState;
  onEvent?: (event: DemoEvent) => void;
  defaultSpeed?: number;
}

interface ScenarioEvent {
  description: string;
  action: unknown;
  delay?: number;
}

export interface Scenario {
  id: string;
  name: string;
  events: ScenarioEvent[];
}

// ============================================================================
// Controller
// ============================================================================

export class DemoController {
  private config: DemoControllerConfig;
  private state: DemoState;
  private listeners: Set<(state: DemoState) => void> = new Set();
  private playbackTimer: ReturnType<typeof setTimeout> | null = null;
  private scenarios: Map<string, Scenario> = new Map();

  constructor(config: DemoControllerConfig) {
    this.config = config;
    this.state = {
      isActive: false,
      currentScenarioId: null,
      eventIndex: 0,
      totalEvents: 0,
      isPaused: false,
      speed: config.defaultSpeed || 1,
      annotations: [],
    };
  }

  // Scenario management
  registerScenario(scenario: Scenario) {
    this.scenarios.set(scenario.id, scenario);
  }

  getAvailableScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  loadScenario(scenarioId: string) {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

    this.updateState({
      currentScenarioId: scenarioId,
      totalEvents: scenario.events.length,
      eventIndex: 0,
      annotations: this.generateAnnotations(scenario),
    });

    this.config.onEvent?.({ type: 'scenario-loaded', payload: scenario });
  }

  // Playback control
  start() {
    this.updateState({ isActive: true, isPaused: false });
    this.executeNextEvent();
  }

  pause() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updateState({ isPaused: true });
    this.config.onEvent?.({ type: 'paused' });
  }

  resume() {
    this.updateState({ isPaused: false });
    this.executeNextEvent();
    this.config.onEvent?.({ type: 'resumed' });
  }

  stop() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updateState({ isActive: false, isPaused: false, eventIndex: 0 });
  }

  // Step-through mode
  stepForward() {
    const scenario = this.getCurrentScenario();
    if (!scenario || this.state.eventIndex >= scenario.events.length) return;

    this.executeEvent(this.state.eventIndex);
    this.config.onEvent?.({ type: 'step', payload: 'forward' });
  }

  stepBackward() {
    if (this.state.eventIndex <= 0) return;
    this.updateState({ eventIndex: this.state.eventIndex - 1 });
    this.config.onEvent?.({ type: 'step', payload: 'backward' });
  }

  goToEvent(index: number) {
    const scenario = this.getCurrentScenario();
    if (!scenario || index < 0 || index >= scenario.events.length) return;
    this.updateState({ eventIndex: index });
  }

  // Speed control
  setSpeed(multiplier: number) {
    this.updateState({ speed: multiplier });
  }

  // State subscription
  subscribe(listener: (state: DemoState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): DemoState {
    return { ...this.state };
  }

  destroy() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
    }
    this.listeners.clear();
  }

  // Private methods
  private getCurrentScenario(): Scenario | null {
    if (!this.state.currentScenarioId) return null;
    return this.scenarios.get(this.state.currentScenarioId) || null;
  }

  private executeEvent(index: number) {
    const scenario = this.getCurrentScenario();
    if (!scenario || index >= scenario.events.length) return;

    const event = scenario.events[index];
    this.config.dispatch(event.action);
    this.updateState({ eventIndex: index + 1 });
    this.config.onEvent?.({ type: 'event-executed', payload: { event, index } });
  }

  private executeNextEvent() {
    if (this.state.isPaused || !this.state.isActive) return;

    const scenario = this.getCurrentScenario();
    if (!scenario) return;

    if (this.state.eventIndex >= scenario.events.length) {
      this.updateState({ isActive: false });
      this.config.onEvent?.({ type: 'scenario-complete' });
      return;
    }

    const event = scenario.events[this.state.eventIndex];
    const delay = (event.delay || 1500) / this.state.speed;

    this.playbackTimer = setTimeout(() => {
      this.executeEvent(this.state.eventIndex);
      this.executeNextEvent();
    }, delay);
  }

  private updateState(partial: Partial<DemoState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  private generateAnnotations(scenario: Scenario): DemoAnnotation[] {
    return scenario.events.map((event, index) => ({
      id: `ann-${index}`,
      text: event.description,
      position: 'bottom' as const,
      showAt: index,
      duration: 3000,
    }));
  }
}

export function createDemoController(config: DemoControllerConfig): DemoController {
  return new DemoController(config);
}
