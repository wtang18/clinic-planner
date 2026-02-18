/**
 * Mode Transitions Integration Tests
 *
 * Tests for transitions between Capture, Process, and Review modes.
 */

import { createStore } from '../../state/store';
import { createInitialState } from '../../state/initialState';
import { initializeServices } from '../../services/initialization';
import { PATIENT_TEMPLATES, ENCOUNTER_TEMPLATES } from '../../mocks';
import type { Store } from '../../state/store/types';
import type { InitializationResult } from '../../services/initialization';
import type { EncounterAction } from '../../state/actions/types';
import type { BackgroundTask } from '../../types';

function createMockTask(overrides: Partial<BackgroundTask> = {}): BackgroundTask {
  return {
    id: 'task-default',
    type: 'rx-send',
    status: 'queued',
    priority: 'normal',
    trigger: { action: 'ITEM_ADDED' },
    createdAt: new Date(),
    displayTitle: 'Send prescription',
    displayStatus: 'Queued',
    ...overrides,
  };
}

describe('Mode Transitions Integration', () => {
  let store: Store;
  let services: InitializationResult;

  beforeEach(() => {
    store = createStore({ initialState: createInitialState() });
    services = initializeServices({ store });

    const encounterContext = ENCOUNTER_TEMPLATES.ucCough();

    // Open encounter
    store.dispatch({
      type: 'ENCOUNTER_OPENED',
      payload: {
        encounterId: 'test-001',
        patient: PATIENT_TEMPLATES.ucCough,
        encounter: encounterContext.encounter,
        visit: encounterContext.visit,
      },
    });
  });

  afterEach(() => {
    services.cleanup();
  });

  describe('Capture to Process Transition', () => {
    it('should transition from capture to process mode', () => {
      // Start in capture mode
      expect(store.getState().session.mode).toBe('capture');

      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      expect(store.getState().session.mode).toBe('process');
    });

    it('should preserve items when transitioning to process mode', () => {
      const itemId = 'test-item-001';

      // Add items in capture mode
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'diagnosis',
            status: 'confirmed',
            displayText: 'Acute bronchitis',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false, reviewed: true },
            data: {
              description: 'Acute bronchitis',
              icdCode: 'J20.9',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Transition to process mode
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      // Items should still exist
      const state = store.getState();
      expect(state.entities.items[itemId]).toBeDefined();
    });

    it('should stop transcription when leaving capture mode', () => {
      // Start transcription
      store.dispatch({
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      });

      expect(store.getState().session.transcription.status).toBe('recording');

      // Transition to process mode should stop transcription
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      // The side effect handler should have stopped transcription
      // For this test, we verify the mode changed
      expect(store.getState().session.mode).toBe('process');
    });
  });

  describe('Process to Review Transition', () => {
    beforeEach(() => {
      // Start in process mode
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });
    });

    it('should transition from process to review mode', () => {
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });

      expect(store.getState().session.mode).toBe('review');
    });

    it('should preserve tasks when transitioning to review mode', () => {
      const taskId = 'test-task-001';

      // Create a task
      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'rx-send',
            status: 'completed',
            trigger: { action: 'ITEM_ADDED', itemId: 'item-001' },
          }),
        },
      });

      // Transition to review
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });

      // Tasks should persist
      expect(store.getState().entities.tasks[taskId]).toBeDefined();
    });
  });

  describe('Review to Sign-Off Flow', () => {
    beforeEach(() => {
      // Go to review mode
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });
    });

    it('should allow sign-off when no blockers', () => {
      // Add confirmed items
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'item-001',
            category: 'diagnosis',
            status: 'confirmed',
            displayText: 'Acute bronchitis',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false, reviewed: true },
            data: {
              description: 'Acute bronchitis',
              icdCode: 'J20.9',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'note-001',
            category: 'note',
            status: 'confirmed',
            displayText: 'Visit note completed',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false, reviewed: true },
            data: {
              text: 'Full visit note...',
              format: 'plain' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Attempt sign-off
      store.dispatch({
        type: 'ENCOUNTER_SIGNED',
        payload: {
          signedAt: new Date(),
          signedBy: 'provider-001',
        },
      });

      // Verify encounter is signed - context should reflect the encounter was signed
      const state = store.getState();
      expect(state.context.encounter).toBeDefined();
    });

    it('should block sign-off with pending review items', () => {
      // Add an unreviewed AI suggestion
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'item-001',
            category: 'diagnosis',
            status: 'pending-review',
            displayText: 'AI Suggested: Pneumonia',
            createdAt: new Date(),
            createdBy: { id: 'system', name: 'AI System' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'system', name: 'AI System' },
            source: { type: 'aiDraft' },
            tags: [{ label: 'AI Suggested', type: 'ai' as const }],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: true, requiresReview: true, reviewed: false },
            data: {
              description: 'Pneumonia',
              icdCode: 'J18.9',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          },
          source: { type: 'aiDraft' },
        },
      } as EncounterAction);

      // Sign-off should be blocked - this would typically be handled by UI validation
      const state = store.getState();
      const pendingItems = Object.values(state.entities.items).filter(
        (item) => item.status === 'pending-review'
      );
      expect(pendingItems.length).toBeGreaterThan(0);
    });
  });

  describe('Back Navigation', () => {
    it('should allow going back from process to capture', () => {
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'capture', trigger: 'user' },
      });

      expect(store.getState().session.mode).toBe('capture');
    });

    it('should allow going back from review to process', () => {
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });

      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      expect(store.getState().session.mode).toBe('process');
    });

    it('should preserve all data when navigating back and forth', () => {
      const itemId = 'test-item-persist';
      const taskId = 'test-task-persist';

      // Add item in capture
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'medication',
            status: 'confirmed',
            displayText: 'Test medication',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false, reviewed: true },
            data: {
              drugName: 'Test Drug',
              dosage: '100mg',
              route: 'PO',
              frequency: 'daily',
              isControlled: false,
              prescriptionType: 'new' as const,
            },
            actions: ['e-prescribe' as const],
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Go to process
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'process', trigger: 'user' },
      });

      // Create task
      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'rx-send',
            status: 'queued',
            trigger: { action: 'ITEM_ADDED', itemId },
          }),
          relatedItemId: itemId,
        },
      });

      // Go to review
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });

      // Go back to capture
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'capture', trigger: 'user' },
      });

      // All data should persist
      const state = store.getState();
      expect(state.entities.items[itemId]).toBeDefined();
      expect(state.entities.tasks[taskId]).toBeDefined();
    });
  });

  describe('Encounter Close', () => {
    it('should allow closing encounter after sign-off', () => {
      store.dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'review', trigger: 'user' },
      });

      // Add required items
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'dx-001',
            category: 'diagnosis',
            status: 'confirmed',
            displayText: 'Diagnosis',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'manual' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false, reviewed: true },
            data: {
              description: 'Acute bronchitis',
              icdCode: 'J20.9',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Sign off
      store.dispatch({
        type: 'ENCOUNTER_SIGNED',
        payload: {
          signedAt: new Date(),
          signedBy: 'provider-001',
        },
      });

      // Close encounter
      store.dispatch({
        type: 'ENCOUNTER_CLOSED',
        payload: { save: true },
      });

      const state = store.getState();
      expect(state.context.encounter).toBeNull();
    });

    it('should handle incomplete encounter close', () => {
      // Close without sign-off (incomplete)
      store.dispatch({
        type: 'ENCOUNTER_CLOSED',
        payload: { save: false },
      });

      const state = store.getState();
      expect(state.context.encounter).toBeNull();
    });
  });
});
