/**
 * Tests for protocol cross-surface side effect handler.
 *
 * Verifies that ITEM_ADDED from any source auto-marks matching protocol orderables.
 *
 * @see DESIGN-SPEC.md §1, PHASED-PLAN.md Phase 1
 */

import { describe, it, expect, vi } from 'vitest';
import { protocolCrossSurfaceHandler } from '../../state/middleware/protocolCrossSurface';
import { createInitialStateWith } from '../../state/initialState';
import type { ActiveProtocolState, ProtocolTemplate, ProtocolItemDef } from '../../types/protocol';
import type { EncounterState } from '../../state/types';
import type { EncounterAction } from '../../state/actions/types';
import type { ChartItem } from '../../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeOrderable(
  id: string,
  category: string,
  defaultData: Record<string, unknown>,
  matchFields: string[]
): ProtocolItemDef {
  return {
    id,
    label: `Item ${id}`,
    sortOrder: 0,
    conditionBehavior: 'hide',
    itemType: {
      type: 'orderable',
      chartCategory: category as any,
      defaultData: defaultData as any,
      matchFields,
    },
  };
}

function makeDocumentable(id: string): ProtocolItemDef {
  return {
    id,
    label: `Doc ${id}`,
    sortOrder: 0,
    conditionBehavior: 'hide',
    itemType: { type: 'documentable', narrativeSection: 'hpi', detectionHints: [] },
  };
}

function makeTemplate(items: ProtocolItemDef[]): ProtocolTemplate {
  return {
    id: 'tmpl-v1',
    name: 'Test',
    version: '1.0.0',
    description: 'desc',
    triggerConditions: [],
    autoExpandFirstCard: false,
    cards: [{
      id: 'card-1',
      label: 'Card 1',
      stage: 'treatment',
      cardType: 'unordered',
      sortOrder: 0,
      items,
    }],
  };
}

function makeProtocol(items: ProtocolItemDef[], overrides?: Partial<ActiveProtocolState>): ActiveProtocolState {
  const itemStates: Record<string, any> = {};
  for (const item of items) {
    itemStates[item.id] = { status: 'pending' };
  }

  return {
    id: 'proto-1',
    templateId: 'tmpl-v1',
    templateSnapshot: makeTemplate(items),
    status: 'active',
    activationSource: 'manual',
    activatedAt: new Date(),
    isPrimary: true,
    severity: null,
    cardStates: {},
    itemStates,
    ...overrides,
  };
}

function makeChartItem(category: string, data: Record<string, unknown>): ChartItem {
  return {
    id: `chart-${Date.now()}`,
    category,
    label: 'Test Item',
    data,
    status: 'draft',
    source: { type: 'manual' },
    intent: 'order',
    syncStatus: 'local',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: 'user-1', name: 'Test', role: 'physician' },
  } as unknown as ChartItem;
}

function makeState(protocol: ActiveProtocolState, extra?: Partial<EncounterState>): EncounterState {
  return createInitialStateWith({
    entities: {
      protocols: { [protocol.id]: protocol },
    } as unknown as EncounterState['entities'],
    ...extra,
  });
}

/** Helper to create ITEM_ADDED action with test chart item. */
function itemAddedAction(item: ChartItem): EncounterAction {
  return { type: 'ITEM_ADDED', payload: { item } } as unknown as EncounterAction;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('protocolCrossSurfaceHandler', () => {
  it('dispatches PROTOCOL_ITEM_ADDRESSED when ITEM_ADDED matches orderable', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd]);
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: expect.objectContaining({
          protocolId: 'proto-1',
          itemId: 'ord-ibu',
          addressedBy: { type: 'chart-item', referenceId: chartItem.id },
        }),
      })
    );
  });

  it('does not dispatch when category does not match', () => {
    const labOrd = makeOrderable('ord-lab', 'lab', { testName: 'CBC' }, ['testName']);
    const protocol = makeProtocol([labOrd]);
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when matchFields do not match', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd]);
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Acetaminophen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('skips already addressed items', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd]);
    protocol.itemStates['ord-ibu'] = {
      status: 'addressed',
      addressedBy: { type: 'manual' },
      addressedAt: new Date(),
    };
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('skips non-orderable items (documentable, guidance)', () => {
    const doc = makeDocumentable('doc-1');
    const protocol = makeProtocol([doc]);
    const state = makeState(protocol);

    // Even if category somehow matches, documentables use a different detection mechanism
    const chartItem = makeChartItem('hpi', {});
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('skips non-active protocols', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd], { status: 'available' });
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('no-ops when there are no protocols', () => {
    const state = createInitialStateWith({});
    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('ignores unrelated action types', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd]);
    const state = makeState(protocol);
    const dispatch = vi.fn();

    // Random unrelated action
    const action = { type: 'ITEM_UPDATED', payload: {} } as unknown as EncounterAction;
    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('handles SUGGESTION_ACCEPTED by looking up the item in entities', () => {
    const ibuOrd = makeOrderable('ord-ibu', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ibuOrd]);

    // After SUGGESTION_ACCEPTED, the accepted suggestion may appear in entities.items
    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    (chartItem as any).id = 'sugg-123'; // Suggestion ID matches

    const state = createInitialStateWith({
      entities: {
        protocols: { 'proto-1': protocol },
        items: { 'sugg-123': chartItem },
      } as unknown as EncounterState['entities'],
    });

    const action: EncounterAction = { type: 'SUGGESTION_ACCEPTED', payload: { id: 'sugg-123' } };
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: expect.objectContaining({ itemId: 'ord-ibu' }),
      })
    );
  });

  it('matches assessment items by assessmentType', () => {
    const painOrd = makeOrderable('ord-pain', 'assessment', { assessmentType: 'pain-scale' }, ['assessmentType']);
    const protocol = makeProtocol([painOrd]);
    const state = makeState(protocol);

    const chartItem = makeChartItem('assessment', { assessmentType: 'pain-scale', value: 7 });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('only matches first pending orderable per protocol', () => {
    // Two orderables that both match the same chart item
    const ord1 = makeOrderable('ord-ibu-1', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const ord2 = makeOrderable('ord-ibu-2', 'medication', { drugName: 'Ibuprofen' }, ['drugName']);
    const protocol = makeProtocol([ord1, ord2]);
    const state = makeState(protocol);

    const chartItem = makeChartItem('medication', { drugName: 'Ibuprofen' });
    const action = itemAddedAction(chartItem);
    const dispatch = vi.fn();

    protocolCrossSurfaceHandler(action, state, dispatch);
    // Only one dispatch — first match wins
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ itemId: 'ord-ibu-1' }),
      })
    );
  });
});
