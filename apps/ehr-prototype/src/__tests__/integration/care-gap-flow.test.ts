/**
 * Care Gap Flow Integration Tests
 *
 * Tests for care gap detection and resolution workflows.
 */

import { createStore } from '../../state/store';
import { createInitialState } from '../../state/initialState';
import { initializeServices } from '../../services/initialization';
import { PATIENT_TEMPLATES, ENCOUNTER_TEMPLATES } from '../../mocks';
import type { Store } from '../../state/store/types';
import type { InitializationResult } from '../../services/initialization';
import type { EncounterAction } from '../../state/actions/types';
import type { CareGapInstance } from '../../types';

function createMockCareGap(overrides: Partial<CareGapInstance> = {}): CareGapInstance {
  return {
    id: 'gap-default',
    definitionId: 'dm-a1c-q3',
    patientId: 'pt-002',
    status: 'open',
    openedAt: new Date(),
    dueBy: new Date(),
    closureAttempts: [],
    excluded: false,
    addressedThisEncounter: false,
    encounterActions: [],
    _display: {
      name: 'Diabetes A1C Monitoring',
      category: 'diabetes',
      priority: 'important',
      actionLabel: 'Order A1C',
    },
    ...overrides,
  };
}

describe('Care Gap Flow Integration', () => {
  let store: Store;
  let services: InitializationResult;

  beforeEach(() => {
    store = createStore({ initialState: createInitialState() });
    services = initializeServices({ store });

    const encounterContext = ENCOUNTER_TEMPLATES.pcDiabetes();

    // Open encounter with diabetes patient
    store.dispatch({
      type: 'ENCOUNTER_OPENED',
      payload: {
        encounterId: 'test-diabetes-001',
        patient: PATIENT_TEMPLATES.pcDiabetes,
        encounter: encounterContext.encounter,
        visit: encounterContext.visit,
      },
    });
  });

  afterEach(() => {
    services.cleanup();
  });

  describe('Care Gap Detection', () => {
    it('should add a care gap to state', () => {
      const gapId = 'test-gap-001';

      store.dispatch({
        type: 'CARE_GAP_IDENTIFIED',
        payload: {
          gap: createMockCareGap({ id: gapId }),
          source: 'system-scan',
        },
      });

      const state = store.getState();
      expect(state.entities.careGaps[gapId]).toBeDefined();
      expect(state.entities.careGaps[gapId].status).toBe('open');
    });
  });

  describe('Care Gap Resolution', () => {
    const gapId = 'test-gap-002';

    beforeEach(() => {
      // Add a care gap
      store.dispatch({
        type: 'CARE_GAP_IDENTIFIED',
        payload: {
          gap: createMockCareGap({ id: gapId }),
          source: 'system-scan',
        },
      });
    });

    it('should update care gap status to pending when addressed', () => {
      store.dispatch({
        type: 'CARE_GAP_ADDRESSED',
        payload: {
          gapId,
          itemId: 'lab-item-001',
          result: 'pending',
        },
      });

      const state = store.getState();
      expect(state.entities.careGaps[gapId].status).toBe('pending');
      expect(state.entities.careGaps[gapId].addressedThisEncounter).toBe(true);
    });

    it('should close care gap when resolved', () => {
      store.dispatch({
        type: 'CARE_GAP_CLOSED',
        payload: {
          gapId,
          closedBy: { itemId: 'lab-item-001', method: 'manual' },
        },
      });

      const state = store.getState();
      expect(state.entities.careGaps[gapId].status).toBe('closed');
    });

    it('should exclude care gap with reason', () => {
      store.dispatch({
        type: 'CARE_GAP_EXCLUDED',
        payload: {
          gapId,
          reason: { type: 'patient-declined', documentedAt: new Date() },
        },
      });

      const state = store.getState();
      expect(state.entities.careGaps[gapId].status).toBe('excluded');
      expect(state.entities.careGaps[gapId].excluded).toBe(true);
    });
  });

  describe('Care Gap Integration with Items', () => {
    it('should link lab order to care gap', () => {
      const gapId = 'test-gap-003';
      const labItemId = 'test-lab-001';

      // Add care gap
      store.dispatch({
        type: 'CARE_GAP_IDENTIFIED',
        payload: {
          gap: createMockCareGap({ id: gapId }),
          source: 'system-scan',
        },
      });

      // Add lab order that addresses the gap
      store.dispatch({
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: labItemId,
            category: 'lab',
            status: 'pending-review',
            displayText: 'Hemoglobin A1C',
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
              testName: 'Hemoglobin A1C',
              testCode: '83036',
              priority: 'routine' as const,
              collectionType: 'send-out' as const,
              orderStatus: 'draft' as const,
            },
          },
          source: { type: 'manual' },
        },
      } as EncounterAction);

      // Address the care gap with the lab order
      store.dispatch({
        type: 'CARE_GAP_ADDRESSED',
        payload: {
          gapId,
          itemId: labItemId,
          result: 'pending',
        },
      });

      const state = store.getState();
      expect(state.entities.careGaps[gapId].addressedThisEncounter).toBe(true);
    });
  });
});
