/**
 * Encounter Lifecycle Tests — Phase 7
 *
 * Tests for:
 * 1. Mock encounter loading (MA handoff items)
 * 2. Unreviewed count
 * 3. Provider start → transcription
 * 4. Safety alert on allergy conflict
 * 5. Section completeness
 * 6. ENCOUNTER_SIGNED → status + transcription
 * 7. Full lifecycle walkthrough
 * 8. Scoped add / reviewed flag
 */

import { describe, it, expect } from 'vitest';
import type { EncounterState } from '../../state/types';
import { createInitialState } from '../../state/initialState';
import { contextReducer } from '../../state/reducers/context';
import { sessionReducer } from '../../state/reducers/session';
import { selectAllItems } from '../../state/selectors/entities';
import { selectSafetyAlerts } from '../../state/selectors/safety';
import { selectCompletenessChecklist } from '../../state/selectors/process-view';
import { MA_HANDOFF_ITEMS, MOCK_PATIENT, MOCK_ENCOUNTER, MOCK_VISIT } from '../../data/mock-encounter';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Apply a sequence of actions to a state, running through all reducers.
 * Simplified version for testing — only runs context + session + items reducers.
 */
function applyActions(initialState: EncounterState, actions: EncounterAction[]): EncounterState {
  let state = initialState;
  for (const action of actions) {
    state = {
      ...state,
      context: contextReducer(state.context, action),
      session: sessionReducer(state.session, action),
    };

    // Handle ITEM_ADDED manually (items reducer)
    if (action.type === 'ITEM_ADDED') {
      const item = action.payload.item;
      state = {
        ...state,
        entities: {
          ...state.entities,
          items: { ...state.entities.items, [item.id]: item },
        },
        relationships: {
          ...state.relationships,
          itemOrder: [...state.relationships.itemOrder, item.id],
        },
      };
    }

    // Handle ITEM_UPDATED manually
    if (action.type === 'ITEM_UPDATED') {
      const existing = state.entities.items[action.payload.id];
      if (existing) {
        state = {
          ...state,
          entities: {
            ...state.entities,
            items: {
              ...state.entities.items,
              [action.payload.id]: { ...existing, ...action.payload.changes } as typeof existing,
            },
          },
        };
      }
    }
  }
  return state;
}

function loadEncounterActions(): EncounterAction[] {
  const actions: EncounterAction[] = [
    {
      type: 'ENCOUNTER_OPENED',
      payload: {
        encounterId: MOCK_ENCOUNTER.id,
        patient: MOCK_PATIENT,
        encounter: MOCK_ENCOUNTER,
        visit: MOCK_VISIT,
      },
    },
  ];

  for (const item of MA_HANDOFF_ITEMS) {
    actions.push({
      type: 'ITEM_ADDED',
      payload: { item, source: { type: 'maHandoff' } },
    });
  }

  return actions;
}

// ============================================================================
// 1. Mock Encounter Loading
// ============================================================================

describe('Mock Encounter Loading', () => {
  it('loads encounter with patient context', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    expect(state.context.patient).not.toBeNull();
    expect(state.context.patient!.id).toBe('patient-001');
    expect(state.context.encounter).not.toBeNull();
    expect(state.context.encounter!.type).toBe('urgent-care');
  });

  it('populates all MA handoff items', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const items = selectAllItems(state);
    expect(items.length).toBe(MA_HANDOFF_ITEMS.length);
  });

  it('all items have maHandoff source', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const items = selectAllItems(state);
    for (const item of items) {
      expect(item.source.type).toBe('maHandoff');
    }
  });
});

// ============================================================================
// 2. Unreviewed Count
// ============================================================================

describe('Unreviewed Items', () => {
  it('all MA items start as unreviewed', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const items = selectAllItems(state);
    const unreviewed = items.filter(i => !i._meta.reviewed);
    expect(unreviewed.length).toBe(MA_HANDOFF_ITEMS.length);
  });
});

// ============================================================================
// 3. Provider Start → Transcription
// ============================================================================

describe('Provider Start', () => {
  it('TRANSCRIPTION_STARTED sets status to recording', () => {
    const actions: EncounterAction[] = [
      ...loadEncounterActions(),
      { type: 'TRANSCRIPTION_STARTED', payload: {} },
    ];
    const state = applyActions(createInitialState(), actions);
    expect(state.session.transcription.status).toBe('recording');
  });
});

// ============================================================================
// 4. Safety Alert on Allergy Conflict
// ============================================================================

describe('Safety Alert — Allergy', () => {
  it('adding Amoxicillin triggers allergy alert (Penicillin allergy)', () => {
    const amoxItem = {
      ...MA_HANDOFF_ITEMS[0], // base template
      id: 'new-amox',
      category: 'medication' as const,
      displayText: 'Amoxicillin 500mg TID',
      data: {
        drugName: 'Amoxicillin',
        dosage: '500 mg',
        route: 'PO',
        frequency: 'TID',
        isControlled: false,
        prescriptionType: 'new' as const,
      },
      actions: ['e-prescribe' as const],
      _meta: { syncStatus: 'synced' as const, aiGenerated: false, requiresReview: false, reviewed: true },
    };

    const actions: EncounterAction[] = [
      ...loadEncounterActions(),
      { type: 'ITEM_ADDED', payload: { item: amoxItem as any, source: { type: 'manual' } } },
    ];
    const state = applyActions(createInitialState(), actions);
    const alerts = selectSafetyAlerts(state);
    const allergyAlerts = alerts.filter(a => a.type === 'allergy' && a.relatedItemId === 'new-amox');
    expect(allergyAlerts.length).toBeGreaterThan(0);
    expect(allergyAlerts[0].message).toContain('Penicillin');
  });
});

// ============================================================================
// 5. Section Completeness
// ============================================================================

describe('Section Completeness', () => {
  it('populated sections show as documented', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const checklist = selectCompletenessChecklist(state);

    // CC should be documented
    const ccSection = checklist.find(c => c.id === 'cc');
    expect(ccSection?.status).toBe('documented');

    // Plan should not be documented (only reconciled meds, no new orders)
    // Actually we do have meds → it IS documented
    const ordersSection = checklist.find(c => c.id === 'orders');
    expect(ordersSection?.status).toBe('documented');
  });

  it('empty sections show as not-documented', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const checklist = selectCompletenessChecklist(state);

    // ROS not documented
    const rosSection = checklist.find(c => c.id === 'ros');
    expect(rosSection?.status).toBe('not-documented');

    // PE not documented
    const peSection = checklist.find(c => c.id === 'pe');
    // Physical exam isn't in MA handoff
    // Let's find it
    const found = checklist.find(c => c.categories.includes('physical-exam'));
    expect(found?.status).toBe('not-documented');
  });

  it('instructions section shows as not-documented for MA handoff', () => {
    const state = applyActions(createInitialState(), loadEncounterActions());
    const checklist = selectCompletenessChecklist(state);
    const instrSection = checklist.find(c => c.id === 'instructions');
    expect(instrSection?.status).toBe('not-documented');
  });
});

// ============================================================================
// 6. ENCOUNTER_SIGNED
// ============================================================================

describe('Encounter Signed', () => {
  it('sets encounter status to signed', () => {
    const actions: EncounterAction[] = [
      ...loadEncounterActions(),
      { type: 'ENCOUNTER_SIGNED', payload: { signedAt: new Date() } },
    ];
    const state = applyActions(createInitialState(), actions);
    expect(state.context.encounter!.status).toBe('signed');
    expect(state.context.encounter!.signedAt).toBeInstanceOf(Date);
  });

  it('stops transcription when signing', () => {
    const actions: EncounterAction[] = [
      ...loadEncounterActions(),
      { type: 'TRANSCRIPTION_STARTED', payload: {} },
      { type: 'ENCOUNTER_SIGNED', payload: { signedAt: new Date() } },
    ];
    const state = applyActions(createInitialState(), actions);
    expect(state.session.transcription.status).toBe('idle');
  });
});

// ============================================================================
// 7. Full Lifecycle Walkthrough
// ============================================================================

describe('Full Lifecycle', () => {
  it('pre-handoff → ma-handoff → provider-active → review → signed', () => {
    let state = createInitialState();

    // Phase 1: pre-handoff — no encounter
    expect(state.context.encounter).toBeNull();

    // Phase 2: MA handoff — encounter opened, items loaded
    state = applyActions(state, loadEncounterActions());
    expect(state.context.encounter!.status).toBe('in-progress');
    const items = selectAllItems(state);
    expect(items.length).toBe(8);

    // Phase 3: Provider starts (transcription)
    state = applyActions(state, [{ type: 'TRANSCRIPTION_STARTED', payload: {} }]);
    expect(state.session.transcription.status).toBe('recording');

    // Phase 4: Switch to review mode
    state = applyActions(state, [{
      type: 'MODE_CHANGED',
      payload: { to: 'review', trigger: 'user' },
    }]);
    expect(state.session.mode).toBe('review');

    // Phase 5: Sign encounter
    state = applyActions(state, [{
      type: 'ENCOUNTER_SIGNED',
      payload: { signedAt: new Date() },
    }]);
    expect(state.context.encounter!.status).toBe('signed');
    expect(state.session.transcription.status).toBe('idle');
  });

  it('items persist through entire lifecycle', () => {
    let state = createInitialState();
    state = applyActions(state, loadEncounterActions());
    state = applyActions(state, [{ type: 'TRANSCRIPTION_STARTED', payload: {} }]);
    state = applyActions(state, [{ type: 'MODE_CHANGED', payload: { to: 'review', trigger: 'user' } }]);
    state = applyActions(state, [{ type: 'ENCOUNTER_SIGNED', payload: { signedAt: new Date() } }]);

    const items = selectAllItems(state);
    expect(items.length).toBe(8);
  });
});

// ============================================================================
// 8. Reviewed Flag
// ============================================================================

describe('Reviewed Flag', () => {
  it('ITEM_UPDATED with reviewed: true clears unreviewed status', () => {
    let state = applyActions(createInitialState(), loadEncounterActions());
    const items = selectAllItems(state);
    const firstItem = items[0];
    expect(firstItem._meta.reviewed).toBe(false);

    // Simulate provider opening the item (marks as reviewed)
    state = applyActions(state, [{
      type: 'ITEM_UPDATED',
      payload: {
        id: firstItem.id,
        changes: { _meta: { ...firstItem._meta, reviewed: true } },
        reason: 'user-edit',
        actor: 'Provider',
      },
    }]);

    const updated = state.entities.items[firstItem.id];
    expect(updated._meta.reviewed).toBe(true);
  });
});
