/**
 * Tests for protocol selectors — entity queries, completion, severity, linked items.
 *
 * @see DESIGN-SPEC.md §1 (Data Model)
 */

import { describe, it, expect } from 'vitest';
import {
  selectAllProtocols,
  selectProtocol,
  selectActiveProtocol,
  selectAddendaProtocols,
  selectProtocolCompletion,
  selectProtocolItemState,
  selectSeverityScore,
  selectProtocolLinkedItems,
  selectProtocolItemSuggestionMatch,
} from '../../state/selectors/protocol';
import { createInitialStateWith } from '../../state/initialState';
import type { ActiveProtocolState, ProtocolTemplate, ProtocolCardDef, ProtocolItemDef } from '../../types/protocol';
import type { EncounterState } from '../../state/types';
import type { ChartItem } from '../../types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function makeItem(id: string, type: ProtocolItemDef['itemType']['type'] = 'orderable'): ProtocolItemDef {
  const base = { id, label: `Item ${id}`, sortOrder: 0, conditionBehavior: 'hide' as const };
  switch (type) {
    case 'orderable':
      return { ...base, itemType: { type: 'orderable', chartCategory: 'medication', defaultData: {}, matchFields: [] } };
    case 'documentable':
      return { ...base, itemType: { type: 'documentable', narrativeSection: 'hpi', detectionHints: [] } };
    case 'guidance':
      return { ...base, itemType: { type: 'guidance', prompt: 'prompt', detectionHints: [] } };
    case 'advisory':
      return { ...base, itemType: { type: 'advisory', severity: 'info', persistent: true } };
  }
}

function makeTemplate(overrides?: Partial<ProtocolTemplate>): ProtocolTemplate {
  return {
    id: 'tmpl-v1',
    name: 'Test',
    version: '1.0.0',
    description: 'desc',
    triggerConditions: [],
    autoExpandFirstCard: false,
    cards: [
      {
        id: 'card-1',
        label: 'Card 1',
        stage: 'treatment',
        cardType: 'unordered',
        sortOrder: 0,
        items: [makeItem('ord-1'), makeItem('doc-1', 'documentable'), makeItem('adv-1', 'advisory')],
      },
    ],
    ...overrides,
  };
}

function makeProtocol(overrides?: Partial<ActiveProtocolState>): ActiveProtocolState {
  return {
    id: 'proto-1',
    templateId: 'tmpl-v1',
    templateSnapshot: makeTemplate(),
    status: 'active',
    activationSource: 'manual',
    activatedAt: new Date(),
    isPrimary: true,
    severity: null,
    cardStates: {},
    itemStates: {
      'ord-1': { status: 'pending' },
      'doc-1': { status: 'pending' },
      'adv-1': { status: 'not-applicable' },
    },
    ...overrides,
  };
}

function makeState(protocols: ActiveProtocolState[], extra?: Partial<EncounterState>): EncounterState {
  const protocolMap: Record<string, ActiveProtocolState> = {};
  for (const p of protocols) protocolMap[p.id] = p;
  return createInitialStateWith({
    entities: { protocols: protocolMap } as unknown as EncounterState['entities'],
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// Entity Selectors
// ---------------------------------------------------------------------------

describe('selectAllProtocols', () => {
  it('returns all protocol instances', () => {
    const p1 = makeProtocol();
    const p2 = makeProtocol({ id: 'proto-2', isPrimary: false, status: 'available' });
    const state = makeState([p1, p2]);
    expect(selectAllProtocols(state)).toHaveLength(2);
  });

  it('returns empty array when no protocols', () => {
    const state = makeState([]);
    expect(selectAllProtocols(state)).toEqual([]);
  });
});

describe('selectProtocol', () => {
  it('returns protocol by ID', () => {
    const p = makeProtocol();
    const state = makeState([p]);
    expect(selectProtocol(state, 'proto-1')).toBe(p);
  });

  it('returns undefined for unknown ID', () => {
    const state = makeState([]);
    expect(selectProtocol(state, 'nope')).toBeUndefined();
  });
});

describe('selectActiveProtocol', () => {
  it('returns the primary active protocol', () => {
    const p = makeProtocol({ status: 'active', isPrimary: true });
    const state = makeState([p]);
    expect(selectActiveProtocol(state)).toBe(p);
  });

  it('returns null when no active primary', () => {
    const p = makeProtocol({ status: 'dismissed', isPrimary: true });
    const state = makeState([p]);
    expect(selectActiveProtocol(state)).toBeNull();
  });

  it('skips non-primary active protocols', () => {
    const p = makeProtocol({ status: 'active', isPrimary: false });
    const state = makeState([p]);
    expect(selectActiveProtocol(state)).toBeNull();
  });
});

describe('selectAddendaProtocols', () => {
  it('returns non-primary active/available protocols', () => {
    const primary = makeProtocol({ status: 'active', isPrimary: true });
    const addendum1 = makeProtocol({ id: 'add-1', status: 'active', isPrimary: false });
    const addendum2 = makeProtocol({ id: 'add-2', status: 'available', isPrimary: false });
    const dismissed = makeProtocol({ id: 'add-3', status: 'dismissed', isPrimary: false });
    const state = makeState([primary, addendum1, addendum2, dismissed]);

    const result = selectAddendaProtocols(state);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.id).sort()).toEqual(['add-1', 'add-2']);
  });
});

// ---------------------------------------------------------------------------
// Completion Selectors
// ---------------------------------------------------------------------------

describe('selectProtocolCompletion', () => {
  it('counts addressed+skipped as addressed', () => {
    const p = makeProtocol({
      itemStates: {
        'ord-1': { status: 'addressed', addressedBy: { type: 'manual' }, addressedAt: new Date() },
        'doc-1': { status: 'skipped', skipReason: 'N/A' },
        'adv-1': { status: 'not-applicable' },
      },
    });
    const state = makeState([p]);
    const result = selectProtocolCompletion(state, 'proto-1');

    expect(result.addressed).toBe(2); // addressed + skipped
    expect(result.total).toBe(3);     // all items including not-applicable
    expect(result.ratio).toBeCloseTo(2 / 3);
  });

  it('returns zeros for unknown protocol', () => {
    const state = makeState([]);
    expect(selectProtocolCompletion(state, 'nope')).toEqual({
      addressed: 0, total: 0, ratio: 0,
    });
  });

  it('handles zero items gracefully', () => {
    const p = makeProtocol({ itemStates: {} });
    const state = makeState([p]);
    const result = selectProtocolCompletion(state, 'proto-1');
    expect(result.ratio).toBe(0);
  });

  it('reports 100% when all are addressed or skipped', () => {
    const p = makeProtocol({
      itemStates: {
        'ord-1': { status: 'addressed', addressedBy: { type: 'manual' }, addressedAt: new Date() },
        'doc-1': { status: 'addressed', addressedBy: { type: 'chart-item' }, addressedAt: new Date() },
      },
    });
    const state = makeState([p]);
    expect(selectProtocolCompletion(state, 'proto-1').ratio).toBe(1);
  });
});

describe('selectProtocolItemState', () => {
  it('returns the item state', () => {
    const p = makeProtocol();
    const state = makeState([p]);
    expect(selectProtocolItemState(state, 'proto-1', 'ord-1')?.status).toBe('pending');
  });

  it('returns undefined for unknown item', () => {
    const p = makeProtocol();
    const state = makeState([p]);
    expect(selectProtocolItemState(state, 'proto-1', 'no-item')).toBeUndefined();
  });

  it('returns undefined for unknown protocol', () => {
    const state = makeState([]);
    expect(selectProtocolItemState(state, 'nope', 'ord-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Severity & Scoring
// ---------------------------------------------------------------------------

describe('selectSeverityScore', () => {
  it('returns severity data when scoring model present', () => {
    const templateWithScoring = makeTemplate({
      severityScoringModel: {
        name: 'Test Scoring',
        inputs: [
          { id: 'pain', label: 'Pain', source: 'assessment', assessmentType: 'pain-scale', weight: 1.0 },
        ],
        scoringLogic: { type: 'weighted-sum' },
        paths: [
          { id: 'mild', label: 'Mild', scoreRange: { min: 0, max: 3 }, cardOverrides: [] },
          { id: 'moderate', label: 'Moderate', scoreRange: { min: 4, max: 7 }, cardOverrides: [] },
          { id: 'severe', label: 'Severe', scoreRange: { min: 8, max: 10 }, cardOverrides: [] },
        ],
      },
    });
    const p = makeProtocol({
      templateSnapshot: templateWithScoring,
      severity: { score: 7, selectedPathId: 'moderate', isManualOverride: false },
    });
    const state = makeState([p]);
    const result = selectSeverityScore(state, 'proto-1');

    expect(result).not.toBeNull();
    // Score is computed from assessment items (none present in state), so 0
    expect(result!.score).toBe(0);
    expect(result!.inputs).toHaveLength(1);
    expect(result!.inputs[0].id).toBe('pain');
    expect(result!.inputs[0].value).toBeNull();
  });

  it('returns null when no severity model', () => {
    const p = makeProtocol({ severity: null });
    const state = makeState([p]);
    expect(selectSeverityScore(state, 'proto-1')).toBeNull();
  });

  it('returns null for unknown protocol', () => {
    const state = makeState([]);
    expect(selectSeverityScore(state, 'nope')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cross-Surface Selectors
// ---------------------------------------------------------------------------

describe('selectProtocolLinkedItems', () => {
  it('returns chart items linked to a protocol', () => {
    const p = makeProtocol();
    const mockItem = {
      id: 'chart-1',
      category: 'medication',
      label: 'Ibuprofen',
      data: { drugName: 'Ibuprofen' },
    } as unknown as ChartItem;

    const state = createInitialStateWith({
      entities: {
        protocols: { 'proto-1': p },
        items: { 'chart-1': mockItem },
      } as unknown as EncounterState['entities'],
      relationships: {
        protocolToItems: { 'proto-1': ['chart-1'] },
      } as unknown as EncounterState['relationships'],
    });

    const result = selectProtocolLinkedItems(state, 'proto-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('chart-1');
  });

  it('filters out missing items', () => {
    const p = makeProtocol();
    const state = createInitialStateWith({
      entities: { protocols: { 'proto-1': p } } as unknown as EncounterState['entities'],
      relationships: { protocolToItems: { 'proto-1': ['deleted-item'] } } as unknown as EncounterState['relationships'],
    });

    expect(selectProtocolLinkedItems(state, 'proto-1')).toEqual([]);
  });

  it('returns empty for no relationships', () => {
    const p = makeProtocol();
    const state = makeState([p]);
    expect(selectProtocolLinkedItems(state, 'proto-1')).toEqual([]);
  });
});

describe('selectProtocolItemSuggestionMatch (stub)', () => {
  it('returns null (stub for CP5)', () => {
    const state = makeState([makeProtocol()]);
    expect(selectProtocolItemSuggestionMatch(state, 'proto-1', 'ord-1')).toBeNull();
  });
});
