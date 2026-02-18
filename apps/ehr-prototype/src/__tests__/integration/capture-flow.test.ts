/**
 * Capture Flow Integration Tests
 *
 * Tests for the capture mode workflow.
 */

import { createStore } from '../../state/store';
import { createInitialState } from '../../state/initialState';
import { initializeServices } from '../../services/initialization';
import { PATIENT_TEMPLATES, ENCOUNTER_TEMPLATES } from '../../mocks';
import type { Store } from '../../state/store/types';
import type { InitializationResult } from '../../services/initialization';
import type { EncounterAction } from '../../state/actions/types';

describe('Capture Flow Integration', () => {
  let store: Store;
  let services: InitializationResult;

  beforeEach(() => {
    // Create store with initial state
    store = createStore({ initialState: createInitialState() });

    // Initialize services
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

  describe('Item Management', () => {
    it('should add an item to the chart', () => {
      const itemId = 'test-item-001';

      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'chief-complaint',
            status: 'pending-review',
            displayText: 'Productive cough x 5 days',
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
              text: 'Productive cough x 5 days',
              format: 'plain' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      const state = store.getState();
      expect(state.entities.items[itemId]).toBeDefined();
      expect(state.entities.items[itemId].category).toBe('chief-complaint');
    });

    it('should confirm an item', () => {
      const itemId = 'test-item-002';

      // Add item
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'diagnosis',
            status: 'pending-review',
            displayText: 'Acute bronchitis',
            createdAt: new Date(),
            createdBy: { id: 'user-1', name: 'Dr. Smith' },
            modifiedAt: new Date(),
            modifiedBy: { id: 'user-1', name: 'Dr. Smith' },
            source: { type: 'aiDraft' },
            tags: [],
            linkedDiagnoses: [],
            linkedEncounters: [],
            activityLog: [],
            _meta: { syncStatus: 'local', aiGenerated: true, requiresReview: true, reviewed: false },
            data: {
              description: 'Acute bronchitis',
              icdCode: 'J20.9',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          },
          source: { type: 'aiDraft' },
        },
      } as EncounterAction);

      // Confirm item
      store.dispatch({
        type: 'ITEM_CONFIRMED',
        payload: { id: itemId },
      });

      const state = store.getState();
      expect(state.entities.items[itemId].status).toBe('confirmed');
    });

    it('should delete an item', () => {
      const itemId = 'test-item-003';

      // Add item
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId,
            category: 'medication',
            status: 'pending-review',
            displayText: 'Benzonatate 100mg',
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

      // Delete item
      store.dispatch({
        type: 'ITEM_DELETED',
        payload: { id: itemId },
      });

      const state = store.getState();
      expect(state.entities.items[itemId]).toBeUndefined();
    });
  });

  describe('Suggestion Handling', () => {
    it('should receive and store a suggestion', () => {
      const suggestionId = 'test-sug-001';

      store.dispatch({
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: suggestionId,
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'diagnosis',
              itemTemplate: {
                displayText: 'Acute bronchitis',
                data: {
                  description: 'Acute bronchitis',
                  icdCode: 'J20.9',
                  type: 'encounter',
                  clinicalStatus: 'active',
                },
              },
            },
            source: 'ai-analysis',
            confidence: 0.85,
            createdAt: new Date(),
            displayText: 'Acute bronchitis J20.9',
          },
          source: 'ai-analysis',
        },
      } as EncounterAction);

      const state = store.getState();
      expect(state.entities.suggestions[suggestionId]).toBeDefined();
      expect(state.entities.suggestions[suggestionId].status).toBe('active');
    });

    it('should accept a suggestion and create an item', () => {
      const suggestionId = 'test-sug-002';

      // Create suggestion
      store.dispatch({
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: suggestionId,
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'diagnosis',
              itemTemplate: {
                displayText: 'Acute bronchitis',
                data: {
                  description: 'Acute bronchitis',
                  icdCode: 'J20.9',
                  type: 'encounter',
                  clinicalStatus: 'active',
                },
              },
            },
            source: 'transcription',
            confidence: 0.85,
            createdAt: new Date(),
            displayText: 'Acute bronchitis J20.9',
          },
          source: 'transcription',
        },
      } as EncounterAction);

      // Accept suggestion
      store.dispatch({
        type: 'SUGGESTION_ACCEPTED',
        payload: { id: suggestionId },
      });

      const state = store.getState();
      expect(state.entities.suggestions[suggestionId].status).toBe('accepted');

      // Check that an item was created
      const items = Object.values(state.entities.items);
      expect(items.some((i) => i.displayText === 'Acute bronchitis')).toBe(true);
    });

    it('should dismiss a suggestion', () => {
      const suggestionId = 'test-sug-003';

      // Create suggestion
      store.dispatch({
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: suggestionId,
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'medication',
              itemTemplate: {
                displayText: 'Test medication',
              },
            },
            source: 'ai-analysis',
            confidence: 0.75,
            createdAt: new Date(),
            displayText: 'Test medication',
          },
          source: 'ai-analysis',
        },
      } as EncounterAction);

      // Dismiss suggestion
      store.dispatch({
        type: 'SUGGESTION_DISMISSED',
        payload: {
          id: suggestionId,
          reason: 'not-applicable',
        },
      });

      const state = store.getState();
      expect(state.entities.suggestions[suggestionId].status).toBe('dismissed');
    });
  });

  describe('Transcription Flow', () => {
    it('should receive transcription segments', () => {
      store.dispatch({
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      });

      const segmentId = 'test-seg-001';
      store.dispatch({
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segmentId,
            text: 'Patient reports cough for 5 days',
            startTime: 0,
            endTime: 3,
            confidence: 0.92,
            speaker: 'patient',
          },
        },
      });

      const state = store.getState();
      expect(state.session.transcription.status).toBe('recording');
      expect(state.session.transcription.segmentCount).toBeGreaterThanOrEqual(1);
    });

    it('should stop transcription', () => {
      store.dispatch({
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      });

      store.dispatch({
        type: 'TRANSCRIPTION_STOPPED',
        payload: {},
      });

      const state = store.getState();
      expect(state.session.transcription.status).toBe('idle');
    });
  });
});
