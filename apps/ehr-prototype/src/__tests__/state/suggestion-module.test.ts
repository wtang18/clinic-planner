/**
 * SuggestionModule Tests
 *
 * Tests for the suggestion consolidation layer:
 * 1. Derived selectors: selectActiveSuggestions, selectSuggestionsBySource, selectHighConfidenceSuggestions
 * 2. suggestionsReducer: state transitions for all SUGGESTION_* actions
 * 3. Utils: SUGGESTION_ACTION_TYPES, getSuggestionCategoryLabel
 *
 * Complements existing helper tests in suggestion-helpers.test.ts which cover
 * display utilities (buildItemSummary, getCategoryBadge, etc.).
 */

import { describe, it, expect } from 'vitest';
import type { Suggestion, SuggestionStatus, SuggestionSource } from '../../types/suggestions';
import type { EncounterState } from '../../state/types';
import { createInitialState } from '../../state/initialState';
import { suggestionsReducer } from '../../state/reducers/entities';
import {
  selectSuggestion,
  selectAllSuggestions,
  selectSuggestionIds,
} from '../../state/selectors/entities';
import {
  selectActiveSuggestions,
  selectSuggestionsBySource,
  selectHighConfidenceSuggestions,
  selectCounts,
} from '../../state/selectors/derived';
import {
  SUGGESTION_ACTION_TYPES,
  getSuggestionCategoryLabel,
} from '../../utils/suggestions';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// Test Helpers
// ============================================================================

function makeSuggestion(overrides?: Partial<Suggestion>): Suggestion {
  return {
    id: 'sug-1',
    type: 'chart-item',
    status: 'active',
    content: {
      type: 'new-item',
      itemTemplate: {
        category: 'medication',
        data: { drugName: 'Amoxicillin', dosage: '500mg', route: 'PO', frequency: 'TID' },
      } as any,
      category: 'medication',
    },
    source: 'ai-analysis',
    confidence: 0.9,
    createdAt: new Date('2024-01-15T10:00:00'),
    displayText: 'Add Amoxicillin 500mg PO TID',
    actionLabel: 'Amoxicillin',
    ...overrides,
  };
}

function stateWith(suggestions: Record<string, Suggestion>): EncounterState {
  const base = createInitialState();
  return {
    ...base,
    entities: {
      ...base.entities,
      suggestions,
    },
  };
}

// ============================================================================
// 1. Primitive Entity Selectors
// ============================================================================

describe('primitive suggestion selectors', () => {
  it('selectSuggestion returns a single suggestion by ID', () => {
    const s = makeSuggestion();
    const state = stateWith({ [s.id]: s });
    expect(selectSuggestion(state, 'sug-1')).toBe(s);
  });

  it('selectSuggestion returns undefined for unknown ID', () => {
    const state = stateWith({});
    expect(selectSuggestion(state, 'nonexistent')).toBeUndefined();
  });

  it('selectAllSuggestions returns all suggestions as array', () => {
    const s1 = makeSuggestion({ id: 'sug-1' });
    const s2 = makeSuggestion({ id: 'sug-2', confidence: 0.7 });
    const state = stateWith({ [s1.id]: s1, [s2.id]: s2 });
    expect(selectAllSuggestions(state)).toHaveLength(2);
  });

  it('selectAllSuggestions returns empty array for empty state', () => {
    const state = stateWith({});
    expect(selectAllSuggestions(state)).toEqual([]);
  });

  it('selectSuggestionIds returns all IDs', () => {
    const s1 = makeSuggestion({ id: 'sug-a' });
    const s2 = makeSuggestion({ id: 'sug-b' });
    const state = stateWith({ [s1.id]: s1, [s2.id]: s2 });
    const ids = selectSuggestionIds(state);
    expect(ids).toContain('sug-a');
    expect(ids).toContain('sug-b');
  });
});

// ============================================================================
// 2. Derived Suggestion Selectors
// ============================================================================

describe('selectActiveSuggestions', () => {
  it('returns only active suggestions', () => {
    const active = makeSuggestion({ id: 'sug-active', status: 'active' });
    const accepted = makeSuggestion({ id: 'sug-accepted', status: 'accepted' });
    const dismissed = makeSuggestion({ id: 'sug-dismissed', status: 'dismissed' });
    const expired = makeSuggestion({ id: 'sug-expired', status: 'expired' });
    const state = stateWith({
      [active.id]: active,
      [accepted.id]: accepted,
      [dismissed.id]: dismissed,
      [expired.id]: expired,
    });

    const result = selectActiveSuggestions(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('sug-active');
  });

  it('returns empty array when no active suggestions exist', () => {
    const dismissed = makeSuggestion({ id: 'sug-1', status: 'dismissed' });
    const state = stateWith({ [dismissed.id]: dismissed });
    expect(selectActiveSuggestions(state)).toEqual([]);
  });

  it('returns empty array for empty state', () => {
    const state = stateWith({});
    expect(selectActiveSuggestions(state)).toEqual([]);
  });
});

describe('selectSuggestionsBySource', () => {
  it('filters suggestions by source', () => {
    const ai = makeSuggestion({ id: 'sug-ai', source: 'ai-analysis' });
    const tx = makeSuggestion({ id: 'sug-tx', source: 'transcription' });
    const cg = makeSuggestion({ id: 'sug-cg', source: 'care-gap' });
    const state = stateWith({
      [ai.id]: ai,
      [tx.id]: tx,
      [cg.id]: cg,
    });

    expect(selectSuggestionsBySource(state, 'ai-analysis')).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'ai-analysis')[0].id).toBe('sug-ai');
    expect(selectSuggestionsBySource(state, 'transcription')).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'care-gap')).toHaveLength(1);
  });

  it('returns empty array when no suggestions match source', () => {
    const ai = makeSuggestion({ id: 'sug-1', source: 'ai-analysis' });
    const state = stateWith({ [ai.id]: ai });
    expect(selectSuggestionsBySource(state, 'cds')).toEqual([]);
  });

  it('includes all statuses (not just active)', () => {
    const accepted = makeSuggestion({ id: 'sug-1', source: 'ai-analysis', status: 'accepted' });
    const state = stateWith({ [accepted.id]: accepted });
    expect(selectSuggestionsBySource(state, 'ai-analysis')).toHaveLength(1);
  });
});

describe('selectHighConfidenceSuggestions', () => {
  it('returns active suggestions with confidence > 0.85', () => {
    const high = makeSuggestion({ id: 'sug-high', confidence: 0.92, status: 'active' });
    const low = makeSuggestion({ id: 'sug-low', confidence: 0.6, status: 'active' });
    const borderline = makeSuggestion({ id: 'sug-border', confidence: 0.85, status: 'active' });
    const state = stateWith({
      [high.id]: high,
      [low.id]: low,
      [borderline.id]: borderline,
    });

    const result = selectHighConfidenceSuggestions(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('sug-high');
  });

  it('excludes non-active suggestions even with high confidence', () => {
    const dismissed = makeSuggestion({ id: 'sug-1', confidence: 0.95, status: 'dismissed' });
    const state = stateWith({ [dismissed.id]: dismissed });
    expect(selectHighConfidenceSuggestions(state)).toEqual([]);
  });

  it('returns empty array when no high-confidence active suggestions exist', () => {
    const low = makeSuggestion({ id: 'sug-1', confidence: 0.5, status: 'active' });
    const state = stateWith({ [low.id]: low });
    expect(selectHighConfidenceSuggestions(state)).toEqual([]);
  });
});

describe('selectCounts', () => {
  it('counts active suggestions correctly', () => {
    const active = makeSuggestion({ id: 'sug-1', status: 'active' });
    const dismissed = makeSuggestion({ id: 'sug-2', status: 'dismissed' });
    const state = stateWith({
      [active.id]: active,
      [dismissed.id]: dismissed,
    });

    const counts = selectCounts(state);
    expect(counts.activeSuggestions).toBe(1);
  });
});

// ============================================================================
// 3. suggestionsReducer
// ============================================================================

describe('suggestionsReducer', () => {
  const emptyState: Record<string, Suggestion> = {};

  describe('SUGGESTION_RECEIVED', () => {
    it('adds a new suggestion to the collection', () => {
      const suggestion = makeSuggestion();
      const action: EncounterAction = {
        type: 'SUGGESTION_RECEIVED',
        payload: { suggestion, source: 'ai-analysis' },
      };

      const result = suggestionsReducer(emptyState, action);
      expect(result['sug-1']).toBe(suggestion);
    });

    it('overwrites existing suggestion with same ID', () => {
      const original = makeSuggestion({ confidence: 0.8 });
      const updated = makeSuggestion({ confidence: 0.95 });
      const state = { [original.id]: original };
      const action: EncounterAction = {
        type: 'SUGGESTION_RECEIVED',
        payload: { suggestion: updated, source: 'ai-analysis' },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].confidence).toBe(0.95);
    });

    it('preserves other suggestions when adding new one', () => {
      const existing = makeSuggestion({ id: 'sug-existing' });
      const state = { [existing.id]: existing };
      const newSuggestion = makeSuggestion({ id: 'sug-new' });
      const action: EncounterAction = {
        type: 'SUGGESTION_RECEIVED',
        payload: { suggestion: newSuggestion, source: 'ai-analysis' },
      };

      const result = suggestionsReducer(state, action);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['sug-existing']).toBe(existing);
      expect(result['sug-new']).toBe(newSuggestion);
    });
  });

  describe('SUGGESTION_ACCEPTED', () => {
    it('transitions status to accepted and sets actedAt', () => {
      const suggestion = makeSuggestion({ status: 'active' });
      const state = { [suggestion.id]: suggestion };
      const action: EncounterAction = {
        type: 'SUGGESTION_ACCEPTED',
        payload: { id: 'sug-1' },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].status).toBe('accepted');
      expect(result['sug-1'].actedAt).toBeInstanceOf(Date);
    });

    it('is a no-op for nonexistent suggestion', () => {
      const action: EncounterAction = {
        type: 'SUGGESTION_ACCEPTED',
        payload: { id: 'nonexistent' },
      };

      const result = suggestionsReducer(emptyState, action);
      expect(result).toBe(emptyState);
    });

    it('preserves all other fields', () => {
      const suggestion = makeSuggestion({
        status: 'active',
        confidence: 0.92,
        reasoning: 'patient mentioned cough',
      });
      const state = { [suggestion.id]: suggestion };
      const action: EncounterAction = {
        type: 'SUGGESTION_ACCEPTED',
        payload: { id: 'sug-1' },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].confidence).toBe(0.92);
      expect(result['sug-1'].reasoning).toBe('patient mentioned cough');
      expect(result['sug-1'].displayText).toBe('Add Amoxicillin 500mg PO TID');
    });
  });

  describe('SUGGESTION_ACCEPTED_WITH_CHANGES', () => {
    it('transitions status to accepted-modified', () => {
      const suggestion = makeSuggestion({ status: 'active' });
      const state = { [suggestion.id]: suggestion };
      const action: EncounterAction = {
        type: 'SUGGESTION_ACCEPTED_WITH_CHANGES',
        payload: { id: 'sug-1', changes: {} },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].status).toBe('accepted-modified');
      expect(result['sug-1'].actedAt).toBeInstanceOf(Date);
    });

    it('is a no-op for nonexistent suggestion', () => {
      const action: EncounterAction = {
        type: 'SUGGESTION_ACCEPTED_WITH_CHANGES',
        payload: { id: 'nonexistent', changes: {} },
      };

      const result = suggestionsReducer(emptyState, action);
      expect(result).toBe(emptyState);
    });
  });

  describe('SUGGESTION_DISMISSED', () => {
    it('transitions status to dismissed', () => {
      const suggestion = makeSuggestion({ status: 'active' });
      const state = { [suggestion.id]: suggestion };
      const action: EncounterAction = {
        type: 'SUGGESTION_DISMISSED',
        payload: { id: 'sug-1' },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].status).toBe('dismissed');
      expect(result['sug-1'].actedAt).toBeInstanceOf(Date);
    });

    it('is a no-op for nonexistent suggestion', () => {
      const action: EncounterAction = {
        type: 'SUGGESTION_DISMISSED',
        payload: { id: 'nonexistent' },
      };

      const result = suggestionsReducer(emptyState, action);
      expect(result).toBe(emptyState);
    });
  });

  describe('SUGGESTION_EXPIRED', () => {
    it('transitions status to expired without setting actedAt', () => {
      const suggestion = makeSuggestion({ status: 'active' });
      const state = { [suggestion.id]: suggestion };
      const action: EncounterAction = {
        type: 'SUGGESTION_EXPIRED',
        payload: { id: 'sug-1' },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-1'].status).toBe('expired');
      // Expired does NOT set actedAt (it's a passive transition, not user action)
      expect(result['sug-1'].actedAt).toBeUndefined();
    });

    it('is a no-op for nonexistent suggestion', () => {
      const action: EncounterAction = {
        type: 'SUGGESTION_EXPIRED',
        payload: { id: 'nonexistent' },
      };

      const result = suggestionsReducer(emptyState, action);
      expect(result).toBe(emptyState);
    });
  });

  describe('SUGGESTIONS_CLEARED', () => {
    it('removes suggestions older than the cutoff', () => {
      const old = makeSuggestion({
        id: 'sug-old',
        createdAt: new Date('2024-01-01T00:00:00'),
      });
      const recent = makeSuggestion({
        id: 'sug-recent',
        createdAt: new Date('2024-01-15T12:00:00'),
      });
      const state = { [old.id]: old, [recent.id]: recent };

      const action: EncounterAction = {
        type: 'SUGGESTIONS_CLEARED',
        payload: { olderThan: new Date('2024-01-10T00:00:00') },
      };

      const result = suggestionsReducer(state, action);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['sug-recent']).toBe(recent);
      expect(result['sug-old']).toBeUndefined();
    });

    it('keeps suggestions created exactly at the cutoff', () => {
      const exact = makeSuggestion({
        id: 'sug-exact',
        createdAt: new Date('2024-01-10T00:00:00'),
      });
      const state = { [exact.id]: exact };

      const action: EncounterAction = {
        type: 'SUGGESTIONS_CLEARED',
        payload: { olderThan: new Date('2024-01-10T00:00:00') },
      };

      const result = suggestionsReducer(state, action);
      expect(result['sug-exact']).toBe(exact);
    });

    it('removes all when all are older than cutoff', () => {
      const s1 = makeSuggestion({ id: 'sug-1', createdAt: new Date('2024-01-01') });
      const s2 = makeSuggestion({ id: 'sug-2', createdAt: new Date('2024-01-02') });
      const state = { [s1.id]: s1, [s2.id]: s2 };

      const action: EncounterAction = {
        type: 'SUGGESTIONS_CLEARED',
        payload: { olderThan: new Date('2024-12-31') },
      };

      const result = suggestionsReducer(state, action);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('ENCOUNTER_CLOSED', () => {
    it('clears all suggestions', () => {
      const s1 = makeSuggestion({ id: 'sug-1' });
      const s2 = makeSuggestion({ id: 'sug-2' });
      const state = { [s1.id]: s1, [s2.id]: s2 };

      const action: EncounterAction = {
        type: 'ENCOUNTER_CLOSED',
        payload: { save: false },
      };

      const result = suggestionsReducer(state, action);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('clears suggestions even when save is true', () => {
      const s1 = makeSuggestion({ id: 'sug-1' });
      const state = { [s1.id]: s1 };

      const action: EncounterAction = {
        type: 'ENCOUNTER_CLOSED',
        payload: { save: true },
      };

      const result = suggestionsReducer(state, action);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('unrelated actions', () => {
    it('returns state unchanged for unknown actions', () => {
      const s1 = makeSuggestion();
      const state = { [s1.id]: s1 };

      const action = { type: 'ITEM_ADDED', payload: { item: {} } } as unknown as EncounterAction;
      const result = suggestionsReducer(state, action);
      expect(result).toBe(state);
    });
  });
});

// ============================================================================
// 4. SUGGESTION_ACTION_TYPES constant
// ============================================================================

describe('SUGGESTION_ACTION_TYPES', () => {
  it('includes chart-item and care-gap-action', () => {
    expect(SUGGESTION_ACTION_TYPES).toContain('chart-item');
    expect(SUGGESTION_ACTION_TYPES).toContain('care-gap-action');
  });

  it('has exactly 2 entries', () => {
    expect(SUGGESTION_ACTION_TYPES).toHaveLength(2);
  });

  it('excludes dx-association, correction, and follow-up types', () => {
    expect(SUGGESTION_ACTION_TYPES).not.toContain('dx-association');
    expect(SUGGESTION_ACTION_TYPES).not.toContain('correction');
    expect(SUGGESTION_ACTION_TYPES).not.toContain('follow-up');
  });
});

// ============================================================================
// 5. getSuggestionCategoryLabel
// ============================================================================

describe('getSuggestionCategoryLabel', () => {
  // Helper to build a new-item suggestion for a given category and optional intent
  function makeNewItemSuggestion(
    category: string,
    intent?: string,
  ): Suggestion {
    return makeSuggestion({
      content: {
        type: 'new-item',
        itemTemplate: {
          category,
          ...(intent ? { intent } : {}),
        } as any,
        category: category as any,
      },
    });
  }

  describe('new-item suggestions — standard category labels', () => {
    const cases: [string, string][] = [
      ['medication', 'Add Rx'],
      ['diagnosis', 'Add Dx'],
      ['lab', 'Add Lab'],
      ['imaging', 'Add Imaging'],
      ['procedure', 'Add Procedure'],
      ['referral', 'Add Referral'],
      ['vitals', 'Add Vitals'],
      ['chief-complaint', 'Add CC'],
      ['hpi', 'Add HPI'],
      ['physical-exam', 'Add PE'],
      ['allergy', 'Add Allergy'],
      ['plan', 'Add Plan'],
      ['instruction', 'Add Instruction'],
      ['note', 'Add Note'],
    ];

    for (const [category, expected] of cases) {
      it(`maps ${category} to "${expected}"`, () => {
        const suggestion = makeNewItemSuggestion(category);
        expect(getSuggestionCategoryLabel(suggestion)).toBe(expected);
      });
    }
  });

  describe('new-item suggestions — intent overrides', () => {
    it('medication + report intent → "Report Med"', () => {
      const suggestion = makeNewItemSuggestion('medication', 'report');
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Report Med');
    });

    it('diagnosis + rule-out intent → "R/O Dx"', () => {
      const suggestion = makeNewItemSuggestion('diagnosis', 'rule-out');
      expect(getSuggestionCategoryLabel(suggestion)).toBe('R/O Dx');
    });

    it('medication + prescribe intent → standard "Add Rx" (no override)', () => {
      const suggestion = makeNewItemSuggestion('medication', 'prescribe');
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Add Rx');
    });

    it('diagnosis + assess intent → standard "Add Dx" (no override)', () => {
      const suggestion = makeNewItemSuggestion('diagnosis', 'assess');
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Add Dx');
    });
  });

  describe('new-item suggestions — unknown category fallback', () => {
    it('returns "Add" for unrecognized category', () => {
      const suggestion = makeNewItemSuggestion('unknown-category');
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Add');
    });
  });

  describe('non-new-item suggestion types', () => {
    it('dx-link → "Link Dx"', () => {
      const suggestion = makeSuggestion({
        type: 'dx-association',
        content: {
          type: 'dx-link',
          targetItemId: 'item-1',
          suggestedDx: [],
        },
      });
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Link Dx');
    });

    it('correction → "Fix"', () => {
      const suggestion = makeSuggestion({
        type: 'correction',
        content: {
          type: 'correction',
          targetItemId: 'item-1',
          field: 'dosage',
          currentValue: '100mg',
          suggestedValue: '200mg',
        },
      });
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Fix');
    });

    it('care-gap-action → "Care Gap"', () => {
      const suggestion = makeSuggestion({
        type: 'care-gap-action',
        content: {
          type: 'care-gap-action',
          careGapId: 'cg-1',
          actionTemplate: { category: 'lab' } as any,
        },
      });
      expect(getSuggestionCategoryLabel(suggestion)).toBe('Care Gap');
    });
  });
});

// ============================================================================
// 6. Reducer + Selector Integration
// ============================================================================

describe('reducer → selector integration', () => {
  it('suggestion added via reducer is visible through selectors', () => {
    const suggestion = makeSuggestion({ id: 'sug-int-1', status: 'active', confidence: 0.92 });
    const suggestions = suggestionsReducer({}, {
      type: 'SUGGESTION_RECEIVED',
      payload: { suggestion, source: 'ai-analysis' },
    } as EncounterAction);

    const state = stateWith(suggestions);

    expect(selectActiveSuggestions(state)).toHaveLength(1);
    expect(selectHighConfidenceSuggestions(state)).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'ai-analysis')).toHaveLength(1);
  });

  it('dismissed suggestion is excluded from active selectors', () => {
    const suggestion = makeSuggestion({ id: 'sug-int-2', status: 'active' });
    let suggestions = suggestionsReducer({}, {
      type: 'SUGGESTION_RECEIVED',
      payload: { suggestion, source: 'ai-analysis' },
    } as EncounterAction);

    suggestions = suggestionsReducer(suggestions, {
      type: 'SUGGESTION_DISMISSED',
      payload: { id: 'sug-int-2' },
    } as EncounterAction);

    const state = stateWith(suggestions);

    expect(selectActiveSuggestions(state)).toHaveLength(0);
    // Still present in the full collection
    expect(selectAllSuggestions(state)).toHaveLength(1);
    expect(selectAllSuggestions(state)[0].status).toBe('dismissed');
  });

  it('full lifecycle: received → accepted → cleared', () => {
    const suggestion = makeSuggestion({
      id: 'sug-lifecycle',
      status: 'active',
      createdAt: new Date('2024-01-15T10:00:00'),
    });

    // Step 1: Receive
    let suggestions = suggestionsReducer({}, {
      type: 'SUGGESTION_RECEIVED',
      payload: { suggestion, source: 'ai-analysis' },
    } as EncounterAction);

    let state = stateWith(suggestions);
    expect(selectActiveSuggestions(state)).toHaveLength(1);

    // Step 2: Accept
    suggestions = suggestionsReducer(suggestions, {
      type: 'SUGGESTION_ACCEPTED',
      payload: { id: 'sug-lifecycle' },
    } as EncounterAction);

    state = stateWith(suggestions);
    expect(selectActiveSuggestions(state)).toHaveLength(0);
    expect(selectAllSuggestions(state)[0].status).toBe('accepted');

    // Step 3: Clear old suggestions (cutoff after creation)
    suggestions = suggestionsReducer(suggestions, {
      type: 'SUGGESTIONS_CLEARED',
      payload: { olderThan: new Date('2024-12-31') },
    } as EncounterAction);

    state = stateWith(suggestions);
    expect(selectAllSuggestions(state)).toHaveLength(0);
  });

  it('multiple sources are independently filterable', () => {
    const aiSug = makeSuggestion({ id: 'sug-ai', source: 'ai-analysis', status: 'active' });
    const txSug = makeSuggestion({ id: 'sug-tx', source: 'transcription', status: 'active' });
    const cgSug = makeSuggestion({ id: 'sug-cg', source: 'care-gap', status: 'active' });

    let suggestions: Record<string, Suggestion> = {};
    for (const s of [aiSug, txSug, cgSug]) {
      suggestions = suggestionsReducer(suggestions, {
        type: 'SUGGESTION_RECEIVED',
        payload: { suggestion: s, source: s.source },
      } as EncounterAction);
    }

    const state = stateWith(suggestions);

    expect(selectActiveSuggestions(state)).toHaveLength(3);
    expect(selectSuggestionsBySource(state, 'ai-analysis')).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'transcription')).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'care-gap')).toHaveLength(1);
    expect(selectSuggestionsBySource(state, 'cds')).toHaveLength(0);
  });
});
