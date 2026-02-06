/**
 * Task Flow Integration Tests
 *
 * Tests for task creation, processing, and completion workflows.
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

describe('Task Flow Integration', () => {
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

  describe('Task Creation', () => {
    it('should create a task from an item', () => {
      const itemId = 'test-item-001';
      const taskId = 'test-task-001';

      // Add medication item
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'medication',
            status: 'confirmed',
            displayText: 'Benzonatate 100mg TID PRN',
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
              drugName: 'Benzonatate',
              dosage: '100mg',
              route: 'PO',
              frequency: 'TID PRN',
              isControlled: false,
              prescriptionType: 'new' as const,
            },
            actions: ['e-prescribe' as const],
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Create task for the medication
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

      const state = store.getState();
      expect(state.entities.tasks[taskId]).toBeDefined();
      expect(state.entities.tasks[taskId].trigger.itemId).toBe(itemId);
      expect(state.entities.tasks[taskId].status).toBe('queued');
    });

    it('should create a lab order task', () => {
      const itemId = 'test-lab-001';
      const taskId = 'test-task-002';

      // Add lab item
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'lab',
            status: 'confirmed',
            displayText: 'CBC with Differential',
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
              testName: 'CBC with Differential',
              testCode: '85025',
              priority: 'routine' as const,
              collectionType: 'in-house' as const,
              orderStatus: 'draft' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Create lab order task
      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'lab-send',
            status: 'queued',
            trigger: { action: 'ITEM_ADDED', itemId },
            displayTitle: 'Send lab order',
          }),
          relatedItemId: itemId,
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId]).toBeDefined();
      expect(state.entities.tasks[taskId].type).toBe('lab-send');
    });
  });

  describe('Task Processing', () => {
    const taskId = 'test-task-003';
    const itemId = 'test-item-002';

    beforeEach(() => {
      // Add item and task
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'medication',
            status: 'confirmed',
            displayText: 'Amoxicillin 500mg',
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
              drugName: 'Amoxicillin',
              dosage: '500mg',
              route: 'PO',
              frequency: 'TID',
              isControlled: false,
              prescriptionType: 'new' as const,
            },
            actions: ['e-prescribe' as const],
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

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
    });

    it('should update task status to processing', () => {
      store.dispatch({
        type: 'TASK_PROGRESS',
        payload: { id: taskId, progress: 0, status: 'processing' },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('processing');
    });

    it('should complete task successfully', () => {
      store.dispatch({
        type: 'TASK_PROGRESS',
        payload: { id: taskId, progress: 50, status: 'processing' },
      });

      store.dispatch({
        type: 'TASK_COMPLETED',
        payload: {
          id: taskId,
          result: {
            success: true,
            message: 'Prescription sent to pharmacy',
            confirmationId: 'RX-12345',
          },
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('completed');
    });

    it('should handle task failure', () => {
      store.dispatch({
        type: 'TASK_PROGRESS',
        payload: { id: taskId, progress: 0, status: 'processing' },
      });

      store.dispatch({
        type: 'TASK_FAILED',
        payload: {
          id: taskId,
          error: 'Unable to connect to pharmacy system',
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('failed');
      expect(state.entities.tasks[taskId].error).toBe('Unable to connect to pharmacy system');
    });

    it('should allow approving a task', () => {
      store.dispatch({
        type: 'TASK_APPROVED',
        payload: { id: taskId },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('ready');
    });
  });

  describe('Task Cancellation', () => {
    it('should handle task rejection', () => {
      const taskId = 'test-task-004';
      const itemId = 'test-item-003';

      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'referral',
            status: 'confirmed',
            displayText: 'Referral to Pulmonology',
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
              specialty: 'Pulmonology',
              reason: 'Chronic cough evaluation',
              urgency: 'routine' as const,
              referralStatus: 'draft' as const,
              requiresAuth: false,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'validation',
            status: 'queued',
            trigger: { action: 'ITEM_ADDED', itemId },
            displayTitle: 'Validate referral',
          }),
          relatedItemId: itemId,
        },
      });

      store.dispatch({
        type: 'TASK_REJECTED',
        payload: {
          id: taskId,
          reason: 'Patient declined referral',
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('cancelled');
    });
  });

  describe('Task Approval Flow', () => {
    it('should create task in pending-review status for AI-generated items', () => {
      const taskId = 'test-task-005';
      const itemId = 'test-item-004';

      // Add AI-suggested medication
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'medication',
            status: 'pending-review',
            displayText: 'Suggested: Ibuprofen 400mg',
            createdAt: new Date(),
            createdBy: { id: 'system', name: 'AI System' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'system', name: 'AI System' },
            source: { type: 'ai-generated' },
            tags: [{ label: 'AI Suggested', type: 'ai' as const }],
            linkedDiagnoses: [],
            linkedEncounters: [],
            _meta: { syncStatus: 'local', aiGenerated: true, aiConfidence: 0.8, requiresReview: true },
            data: {
              drugName: 'Ibuprofen',
              dosage: '400mg',
              route: 'PO',
              frequency: 'TID PRN',
              isControlled: false,
              prescriptionType: 'new' as const,
            },
            actions: ['e-prescribe' as const],
          },
          source: { type: 'ai-generated' },
        },
      } as EncounterAction);

      // Create task that needs review
      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'rx-send',
            status: 'pending-review',
            trigger: { action: 'ITEM_ADDED', itemId },
            displayTitle: 'Review prescription',
            displayStatus: 'Needs review',
          }),
          relatedItemId: itemId,
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('pending-review');
    });

    it('should approve task and move to ready', () => {
      const taskId = 'test-task-006';

      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'rx-send',
            status: 'pending-review',
            trigger: { action: 'ITEM_ADDED', itemId: 'item-001' },
          }),
        },
      });

      store.dispatch({
        type: 'TASK_APPROVED',
        payload: { id: taskId },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('ready');
    });

    it('should reject task', () => {
      const taskId = 'test-task-007';

      store.dispatch({
        type: 'TASK_CREATED',
        payload: {
          task: createMockTask({
            id: taskId,
            type: 'rx-send',
            status: 'pending-review',
            trigger: { action: 'ITEM_ADDED', itemId: 'item-001' },
          }),
        },
      });

      store.dispatch({
        type: 'TASK_REJECTED',
        payload: {
          id: taskId,
          reason: 'Wrong medication selected',
        },
      });

      const state = store.getState();
      expect(state.entities.tasks[taskId].status).toBe('cancelled');
    });
  });
});
