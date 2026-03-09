/**
 * Tests for protocol reducer — covers all 10 action transitions.
 *
 * @see DESIGN-SPEC.md §1 (Data Model), PHASED-PLAN.md Phase 1
 */

import { describe, it, expect } from 'vitest';
import { protocolsReducer } from '../../state/reducers/protocol';
import type { ActiveProtocolState, ProtocolTemplate, ProtocolCardDef, ProtocolItemDef } from '../../types/protocol';
import type { EncounterAction } from '../../state/actions/types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function makeItem(id: string, type: ProtocolItemDef['itemType']['type'] = 'orderable'): ProtocolItemDef {
  const base = {
    id,
    label: `Item ${id}`,
    sortOrder: 0,
    conditionBehavior: 'hide' as const,
  };

  switch (type) {
    case 'orderable':
      return { ...base, itemType: { type: 'orderable', chartCategory: 'medication', defaultData: { drugName: 'Ibuprofen' }, matchFields: ['drugName'] } };
    case 'documentable':
      return { ...base, itemType: { type: 'documentable', narrativeSection: 'hpi', detectionHints: ['back pain'] } };
    case 'guidance':
      return { ...base, itemType: { type: 'guidance', prompt: 'Ask about red flags', detectionHints: [] } };
    case 'advisory':
      return { ...base, itemType: { type: 'advisory', severity: 'warning', persistent: true } };
  }
}

function makeCard(id: string, items: ProtocolItemDef[]): ProtocolCardDef {
  return {
    id,
    label: `Card ${id}`,
    stage: 'treatment',
    cardType: 'unordered',
    sortOrder: 0,
    items,
  };
}

function makeTemplate(overrides?: Partial<ProtocolTemplate>): ProtocolTemplate {
  return {
    id: 'test-template-v1',
    name: 'Test Protocol',
    version: '1.0.0',
    description: 'A test protocol',
    triggerConditions: [],
    autoExpandFirstCard: true,
    cards: [
      makeCard('card-1', [
        makeItem('item-ord-1', 'orderable'),
        makeItem('item-doc-1', 'documentable'),
        makeItem('item-guide-1', 'guidance'),
        makeItem('item-adv-1', 'advisory'),
      ]),
      makeCard('card-2', [
        makeItem('item-ord-2', 'orderable'),
      ]),
    ],
    ...overrides,
  };
}

function makeProtocol(overrides?: Partial<ActiveProtocolState>): ActiveProtocolState {
  return {
    id: 'proto-1',
    templateId: 'test-template-v1',
    templateSnapshot: makeTemplate(),
    status: 'available',
    activationSource: 'manual',
    activatedAt: null,
    isPrimary: true,
    severity: null,
    cardStates: {},
    itemStates: {},
    ...overrides,
  };
}

function act(state: Record<string, ActiveProtocolState>, action: EncounterAction) {
  return protocolsReducer(state, action);
}

// ---------------------------------------------------------------------------
// PROTOCOL_LOADED
// ---------------------------------------------------------------------------

describe('PROTOCOL_LOADED', () => {
  it('adds protocol with initialized card/item states', () => {
    const protocol = makeProtocol();
    const next = act({}, { type: 'PROTOCOL_LOADED', payload: { protocol } });

    expect(next['proto-1']).toBeDefined();
    // First card auto-expanded (autoExpandFirstCard=true)
    expect(next['proto-1'].cardStates['card-1']).toEqual({ expanded: true, manuallyToggled: false });
    // Second card collapsed
    expect(next['proto-1'].cardStates['card-2']).toEqual({ expanded: false, manuallyToggled: false });
  });

  it('initializes orderable/documentable/guidance as pending, advisory as not-applicable', () => {
    const protocol = makeProtocol();
    const next = act({}, { type: 'PROTOCOL_LOADED', payload: { protocol } });

    expect(next['proto-1'].itemStates['item-ord-1'].status).toBe('pending');
    expect(next['proto-1'].itemStates['item-doc-1'].status).toBe('pending');
    expect(next['proto-1'].itemStates['item-guide-1'].status).toBe('pending');
    expect(next['proto-1'].itemStates['item-adv-1'].status).toBe('not-applicable');
  });

  it('does not auto-expand first card when autoExpandFirstCard=false', () => {
    const template = makeTemplate({ autoExpandFirstCard: false });
    const protocol = makeProtocol({ templateSnapshot: template });
    const next = act({}, { type: 'PROTOCOL_LOADED', payload: { protocol } });

    expect(next['proto-1'].cardStates['card-1'].expanded).toBe(false);
  });

  it('preserves existing protocols when loading a new one', () => {
    const existing = makeProtocol({ id: 'proto-existing' });
    const state: Record<string, ActiveProtocolState> = { 'proto-existing': existing };
    const newProto = makeProtocol({ id: 'proto-2', isPrimary: false });
    const next = act(state, { type: 'PROTOCOL_LOADED', payload: { protocol: newProto } });

    expect(next['proto-existing']).toBe(existing);
    expect(next['proto-2']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_ACTIVATED
// ---------------------------------------------------------------------------

describe('PROTOCOL_ACTIVATED', () => {
  it('sets status=active, activationSource, and activatedAt', () => {
    const protocol = makeProtocol();
    const state = { 'proto-1': protocol };
    const next = act(state, { type: 'PROTOCOL_ACTIVATED', payload: { protocolId: 'proto-1', source: 'cc-match' } });

    expect(next['proto-1'].status).toBe('active');
    expect(next['proto-1'].activationSource).toBe('cc-match');
    expect(next['proto-1'].activatedAt).toBeInstanceOf(Date);
  });

  it('no-ops for unknown protocolId', () => {
    const state = { 'proto-1': makeProtocol() };
    const next = act(state, { type: 'PROTOCOL_ACTIVATED', payload: { protocolId: 'nonexistent', source: 'manual' } });
    expect(next).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_ITEM_ADDRESSED
// ---------------------------------------------------------------------------

describe('PROTOCOL_ITEM_ADDRESSED', () => {
  it('marks item as addressed with addressedBy', () => {
    const protocol = makeProtocol({
      itemStates: { 'item-ord-1': { status: 'pending' } },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_ITEM_ADDRESSED',
      payload: {
        protocolId: 'proto-1',
        itemId: 'item-ord-1',
        addressedBy: { type: 'chart-item', referenceId: 'chart-123' },
      },
    });

    expect(next['proto-1'].itemStates['item-ord-1'].status).toBe('addressed');
    expect(next['proto-1'].itemStates['item-ord-1'].addressedBy).toEqual({
      type: 'chart-item',
      referenceId: 'chart-123',
    });
    expect(next['proto-1'].itemStates['item-ord-1'].addressedAt).toBeInstanceOf(Date);
  });

  it('no-ops for unknown protocol', () => {
    const state = { 'proto-1': makeProtocol() };
    const next = act(state, {
      type: 'PROTOCOL_ITEM_ADDRESSED',
      payload: { protocolId: 'bad', itemId: 'item-ord-1', addressedBy: { type: 'manual' } },
    });
    expect(next).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_ITEM_SKIPPED
// ---------------------------------------------------------------------------

describe('PROTOCOL_ITEM_SKIPPED', () => {
  it('marks item as skipped with optional reason', () => {
    const protocol = makeProtocol({
      itemStates: { 'item-doc-1': { status: 'pending' } },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_ITEM_SKIPPED',
      payload: { protocolId: 'proto-1', itemId: 'item-doc-1', reason: 'Patient declined' },
    });

    expect(next['proto-1'].itemStates['item-doc-1'].status).toBe('skipped');
    expect(next['proto-1'].itemStates['item-doc-1'].skipReason).toBe('Patient declined');
  });

  it('works without a reason', () => {
    const protocol = makeProtocol({
      itemStates: { 'item-doc-1': { status: 'pending' } },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_ITEM_SKIPPED',
      payload: { protocolId: 'proto-1', itemId: 'item-doc-1' },
    });

    expect(next['proto-1'].itemStates['item-doc-1'].status).toBe('skipped');
    expect(next['proto-1'].itemStates['item-doc-1'].skipReason).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_CARD_TOGGLED
// ---------------------------------------------------------------------------

describe('PROTOCOL_CARD_TOGGLED', () => {
  it('sets expanded and manuallyToggled=true', () => {
    const protocol = makeProtocol({
      cardStates: { 'card-1': { expanded: true, manuallyToggled: false } },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_CARD_TOGGLED',
      payload: { protocolId: 'proto-1', cardId: 'card-1', expanded: false },
    });

    expect(next['proto-1'].cardStates['card-1']).toEqual({
      expanded: false,
      manuallyToggled: true,
    });
  });

  it('can expand a collapsed card', () => {
    const protocol = makeProtocol({
      cardStates: { 'card-2': { expanded: false, manuallyToggled: false } },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_CARD_TOGGLED',
      payload: { protocolId: 'proto-1', cardId: 'card-2', expanded: true },
    });

    expect(next['proto-1'].cardStates['card-2'].expanded).toBe(true);
    expect(next['proto-1'].cardStates['card-2'].manuallyToggled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_SEVERITY_UPDATED
// ---------------------------------------------------------------------------

describe('PROTOCOL_SEVERITY_UPDATED', () => {
  it('sets score and pathId, preserves isManualOverride', () => {
    const protocol = makeProtocol({ severity: null });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_SEVERITY_UPDATED',
      payload: { protocolId: 'proto-1', score: 42, pathId: 'moderate' },
    });

    expect(next['proto-1'].severity).toEqual({
      score: 42,
      selectedPathId: 'moderate',
      isManualOverride: false,
    });
  });

  it('preserves isManualOverride when already true', () => {
    const protocol = makeProtocol({
      severity: { score: 10, selectedPathId: 'mild', isManualOverride: true },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_SEVERITY_UPDATED',
      payload: { protocolId: 'proto-1', score: 50, pathId: 'severe' },
    });

    expect(next['proto-1'].severity!.isManualOverride).toBe(true);
    expect(next['proto-1'].severity!.score).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_PATH_OVERRIDDEN
// ---------------------------------------------------------------------------

describe('PROTOCOL_PATH_OVERRIDDEN', () => {
  it('sets pathId and isManualOverride=true', () => {
    const protocol = makeProtocol({
      severity: { score: 30, selectedPathId: 'mild', isManualOverride: false },
    });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_PATH_OVERRIDDEN',
      payload: { protocolId: 'proto-1', pathId: 'severe' },
    });

    expect(next['proto-1'].severity).toEqual({
      score: 30,
      selectedPathId: 'severe',
      isManualOverride: true,
    });
  });

  it('initializes severity when previously null', () => {
    const protocol = makeProtocol({ severity: null });
    const state = { 'proto-1': protocol };
    const next = act(state, {
      type: 'PROTOCOL_PATH_OVERRIDDEN',
      payload: { protocolId: 'proto-1', pathId: 'moderate' },
    });

    expect(next['proto-1'].severity).toEqual({
      score: 0,
      selectedPathId: 'moderate',
      isManualOverride: true,
    });
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_DISMISSED
// ---------------------------------------------------------------------------

describe('PROTOCOL_DISMISSED', () => {
  it('sets status to dismissed', () => {
    const protocol = makeProtocol({ status: 'active' });
    const state = { 'proto-1': protocol };
    const next = act(state, { type: 'PROTOCOL_DISMISSED', payload: { protocolId: 'proto-1' } });

    expect(next['proto-1'].status).toBe('dismissed');
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_COMPLETED
// ---------------------------------------------------------------------------

describe('PROTOCOL_COMPLETED', () => {
  it('sets status to completed', () => {
    const protocol = makeProtocol({ status: 'active' });
    const state = { 'proto-1': protocol };
    const next = act(state, { type: 'PROTOCOL_COMPLETED', payload: { protocolId: 'proto-1' } });

    expect(next['proto-1'].status).toBe('completed');
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_CLEARED
// ---------------------------------------------------------------------------

describe('PROTOCOL_CLEARED', () => {
  it('removes the protocol from state', () => {
    const protocol = makeProtocol();
    const state = { 'proto-1': protocol };
    const next = act(state, { type: 'PROTOCOL_CLEARED', payload: { protocolId: 'proto-1' } });

    expect(next['proto-1']).toBeUndefined();
  });

  it('preserves other protocols', () => {
    const p1 = makeProtocol({ id: 'proto-1' });
    const p2 = makeProtocol({ id: 'proto-2', isPrimary: false });
    const state = { 'proto-1': p1, 'proto-2': p2 };
    const next = act(state, { type: 'PROTOCOL_CLEARED', payload: { protocolId: 'proto-1' } });

    expect(next['proto-1']).toBeUndefined();
    expect(next['proto-2']).toBe(p2);
  });
});

// ---------------------------------------------------------------------------
// ENCOUNTER_CLOSED
// ---------------------------------------------------------------------------

describe('ENCOUNTER_CLOSED', () => {
  it('resets to empty state', () => {
    const p1 = makeProtocol({ id: 'proto-1' });
    const p2 = makeProtocol({ id: 'proto-2' });
    const state = { 'proto-1': p1, 'proto-2': p2 };
    const next = act(state, { type: 'ENCOUNTER_CLOSED', payload: {} } as EncounterAction);

    expect(next).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Unknown actions
// ---------------------------------------------------------------------------

describe('Unknown actions', () => {
  it('returns state unchanged', () => {
    const state = { 'proto-1': makeProtocol() };
    const next = act(state, { type: 'ITEM_ADDED', payload: { item: {} } } as unknown as EncounterAction);
    expect(next).toBe(state);
  });
});
