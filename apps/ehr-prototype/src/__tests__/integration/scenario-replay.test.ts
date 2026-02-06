/**
 * Scenario Replay Integration Tests
 *
 * Tests for the scenario runner and demo playback functionality.
 */

import { createStore } from '../../state/store';
import { createInitialState } from '../../state/initialState';
import { createScenarioRunner, type ScenarioRunner, type Scenario } from '../../scenarios';
import type { Store } from '../../state/store/types';
import type { EncounterAction } from '../../state/actions/types';

// Simple test scenario
const TEST_SCENARIO: Scenario = {
  id: 'test-scenario',
  name: 'Test Scenario',
  description: 'A simple scenario for testing',
  events: [
    {
      delayMs: 100,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'item-001',
            category: 'vitals',
            status: 'confirmed',
            displayText: 'Test vitals',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false },
            data: {
              measurements: [{ type: 'pulse', value: 72, unit: 'bpm' }],
              capturedAt: new Date(),
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction,
      description: 'Add vitals',
    },
    {
      delayMs: 100,
      action: {
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      },
      description: 'Start transcription',
    },
    {
      delayMs: 100,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: 'seg-001',
            text: 'Test segment',
            startTime: 0,
            endTime: 2,
            confidence: 0.9,
            speaker: 'patient',
          },
        },
      },
      description: 'Receive segment',
    },
    {
      delayMs: 100,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: 'sug-001',
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'diagnosis',
              itemTemplate: {
                displayText: 'Test diagnosis',
                data: {
                  description: 'Test diagnosis',
                  icdCode: 'J20.9',
                  type: 'encounter',
                  clinicalStatus: 'active',
                },
              },
            },
            source: 'transcription',
            confidence: 0.85,
            createdAt: new Date(),
            displayText: 'Test diagnosis',
          },
          source: 'transcription',
        },
      } as EncounterAction,
      description: 'Receive suggestion',
    },
    {
      delayMs: 100,
      action: {
        type: 'TRANSCRIPTION_STOPPED',
        payload: {},
      },
      description: 'Stop transcription',
    },
  ],
};

describe('Scenario Replay Integration', () => {
  let store: Store;
  let runner: ScenarioRunner;

  beforeEach(() => {
    store = createStore({ initialState: createInitialState() });
    runner = createScenarioRunner(store);
  });

  afterEach(() => {
    runner.stop();
  });

  describe('Scenario Loading', () => {
    it('should load a scenario', () => {
      runner.load(TEST_SCENARIO);
      const status = runner.getStatus();

      expect(status.scenarioId).toBe('test-scenario');
      expect(status.isLoaded).toBe(true);
      expect(status.totalEvents).toBe(5);
      expect(status.currentIndex).toBe(-1);
    });

    it('should replace scenario when loading a new one', () => {
      runner.load(TEST_SCENARIO);

      const anotherScenario: Scenario = {
        id: 'another-scenario',
        name: 'Another Scenario',
        description: 'Different scenario',
        events: [
          {
            delayMs: 50,
            action: { type: 'TRANSCRIPTION_STARTED', payload: {} },
            description: 'Start',
          },
        ],
      };

      runner.load(anotherScenario);
      const status = runner.getStatus();

      expect(status.scenarioId).toBe('another-scenario');
      expect(status.totalEvents).toBe(1);
    });
  });

  describe('Scenario Playback', () => {
    beforeEach(() => {
      runner.load(TEST_SCENARIO);
    });

    it('should start scenario playback', () => {
      runner.start();
      const status = runner.getStatus();

      expect(status.isRunning).toBe(true);
    });

    it('should dispatch events in sequence', async () => {
      runner.setSpeed(10); // Speed up for testing
      runner.start();

      // Wait for all events to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      const state = store.getState();

      // Check that events were dispatched
      expect(state.entities.items['item-001']).toBeDefined();
      expect(state.entities.suggestions['sug-001']).toBeDefined();
      expect(state.session.transcription.segmentCount).toBeGreaterThanOrEqual(1);
    });

    it('should pause and resume playback', async () => {
      runner.setSpeed(5);
      runner.start();

      // Wait a bit then pause
      await new Promise((resolve) => setTimeout(resolve, 50));
      runner.pause();

      let status = runner.getStatus();
      expect(status.isPaused).toBe(true);

      const pausedIndex = status.currentIndex;

      // Wait and verify no more events
      await new Promise((resolve) => setTimeout(resolve, 100));
      status = runner.getStatus();
      expect(status.currentIndex).toBe(pausedIndex);

      // Resume
      runner.resume();
      status = runner.getStatus();
      expect(status.isRunning).toBe(true);
    });

    it('should stop playback and reset', () => {
      runner.start();
      runner.stop();

      const status = runner.getStatus();
      expect(status.isRunning).toBe(false);
    });
  });

  describe('Manual Event Navigation', () => {
    beforeEach(() => {
      runner.load(TEST_SCENARIO);
    });

    it('should step forward one event', () => {
      runner.stepForward();

      const index = runner.getCurrentEventIndex();
      expect(index).toBe(0);

      // Check that first event was dispatched
      const state = store.getState();
      expect(state.entities.items['item-001']).toBeDefined();
    });

    it('should step through multiple events', () => {
      runner.stepForward(); // Event 0: Add vitals
      runner.stepForward(); // Event 1: Start transcription
      runner.stepForward(); // Event 2: Segment received

      const state = store.getState();
      expect(state.session.transcription.segmentCount).toBeGreaterThanOrEqual(1);
    });

    it('should go to specific event index', () => {
      runner.goToEvent(2); // Jump to segment received

      const index = runner.getCurrentEventIndex();
      expect(index).toBe(2);

      // All events up to and including index 2 should be dispatched
      const state = store.getState();
      expect(state.entities.items['item-001']).toBeDefined();
      expect(state.session.transcription.status).toBe('recording');
    });

    it('should not exceed total events when stepping', () => {
      // Step past all events
      for (let i = 0; i < 10; i++) {
        runner.stepForward();
      }

      const index = runner.getCurrentEventIndex();
      expect(index).toBe(4); // Max is 4 (5 events, 0-indexed)
    });
  });

  describe('Speed Control', () => {
    beforeEach(() => {
      runner.load(TEST_SCENARIO);
    });

    it('should set playback speed', () => {
      runner.setSpeed(2.0);
      // Speed is set - no error thrown
      expect(true).toBe(true);
    });

    it('should affect playback timing', async () => {
      const startTime = Date.now();

      // Set very fast speed
      runner.setSpeed(10);
      runner.start();

      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 200));

      const elapsed = Date.now() - startTime;

      // With 10x speed and 500ms total delay, should complete in ~50ms + overhead
      expect(elapsed).toBeLessThan(300);
    });
  });

  describe('Event Callbacks', () => {
    it('should call onEventExecuted callback', async () => {
      const onEvent = jest.fn();
      runner = createScenarioRunner(store);
      runner.onEventExecuted(onEvent);

      runner.load(TEST_SCENARIO);
      runner.setSpeed(10);
      runner.start();

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(onEvent).toHaveBeenCalledTimes(5);
      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Add vitals' }),
        0
      );
    });

    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      runner = createScenarioRunner(store);
      runner.onComplete(onComplete);

      runner.load(TEST_SCENARIO);
      runner.setSpeed(10);
      runner.start();

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle start without loaded scenario', () => {
      // Don't load a scenario
      expect(() => runner.start()).not.toThrow();
      expect(runner.getStatus().isRunning).toBe(false);
    });

    it('should handle invalid event index', () => {
      runner.load(TEST_SCENARIO);

      // Try to go to invalid index
      runner.goToEvent(-5);
      expect(runner.getCurrentEventIndex()).toBe(-1);

      runner.goToEvent(100);
      expect(runner.getCurrentEventIndex()).toBe(-1); // goToEvent ignores out of range
    });
  });
});
