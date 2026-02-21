/**
 * Omni-Input Machine Tests
 *
 * Tests for the pill-based state machine: pill operations, depth derivation,
 * batch mode, undo stack, and edge cases.
 */

import { describe, it, expect } from 'vitest';
import {
  omniInputReducer,
  OMNI_INPUT_INITIAL,
  getDepth,
  getActiveCategory,
  getActiveItem,
  getActiveVariant,
  makeCategoryPill,
  makeItemPill,
  type OmniInputState,
  type OmniInputAction,
} from '../../components/omni-add/omni-input-machine';

// ============================================================================
// Helpers
// ============================================================================

function reduce(state: OmniInputState, ...actions: OmniInputAction[]): OmniInputState {
  return actions.reduce((s, a) => omniInputReducer(s, a), state);
}

const rxPill = makeCategoryPill('medication');
const labPill = makeCategoryPill('lab');
const itemPill = makeItemPill('Benzonatate', 'medication');
const labItemPill = makeItemPill('CBC', 'lab');

// ============================================================================
// Depth Derivation
// ============================================================================

describe('Depth derivation', () => {
  it('initial state has depth 0', () => {
    expect(getDepth(OMNI_INPUT_INITIAL)).toBe(0);
  });

  it('one pill = depth 1', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: rxPill });
    expect(getDepth(s)).toBe(1);
  });

  it('two pills = depth 2', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
    );
    expect(getDepth(s)).toBe(2);
  });
});

// ============================================================================
// Active Category / Item / Variant
// ============================================================================

describe('Active selectors', () => {
  it('no pills → null category', () => {
    expect(getActiveCategory(OMNI_INPUT_INITIAL)).toBeNull();
  });

  it('category pill → returns category', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: rxPill });
    expect(getActiveCategory(s)).toBe('medication');
  });

  it('category + item → category and item', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
    );
    expect(getActiveCategory(s)).toBe('medication');
    expect(getActiveItem(s)).toBe('Benzonatate');
  });

  it('medication → structured variant', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: rxPill });
    expect(getActiveVariant(s)).toBe('structured');
  });

  it('no category → null variant', () => {
    expect(getActiveVariant(OMNI_INPUT_INITIAL)).toBeNull();
  });

  it('narrative category → narrative variant', () => {
    const ccPill = makeCategoryPill('chief-complaint');
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: ccPill });
    expect(getActiveVariant(s)).toBe('narrative');
  });

  it('vitals → data-entry variant', () => {
    const vitalsPill = makeCategoryPill('vitals');
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: vitalsPill });
    expect(getActiveVariant(s)).toBe('data-entry');
  });
});

// ============================================================================
// INSERT_PILL
// ============================================================================

describe('INSERT_PILL', () => {
  it('inserts category pill at depth 0', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: rxPill });
    expect(s.pills).toHaveLength(1);
    expect(s.pills[0]).toEqual(rxPill);
  });

  it('inserts item pill at depth 1', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
    );
    expect(s.pills).toHaveLength(2);
    expect(s.pills[1]).toEqual(itemPill);
  });

  it('rejects item pill at depth 0 (must have category first)', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'INSERT_PILL', pill: itemPill });
    expect(s.pills).toHaveLength(0);
  });

  it('rejects third pill (max 2)', () => {
    const thirdPill = makeItemPill('Extra', 'medication');
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'INSERT_PILL', pill: thirdPill },
    );
    expect(s.pills).toHaveLength(2);
  });

  it('rejects duplicate category pill', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: labPill },
    );
    // Second category should be rejected since first is already category type
    expect(s.pills).toHaveLength(1);
    expect(s.pills[0].value).toBe('medication');
  });

  it('clears text on insert', () => {
    const withText = reduce(OMNI_INPUT_INITIAL, { type: 'SET_TEXT', text: 'rx' });
    const s = reduce(withText, { type: 'INSERT_PILL', pill: rxPill });
    expect(s.text).toBe('');
  });
});

// ============================================================================
// DELETE_PILL
// ============================================================================

describe('DELETE_PILL', () => {
  it('removes rightmost pill', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'DELETE_PILL' },
    );
    expect(s.pills).toHaveLength(1);
    expect(s.pills[0]).toEqual(rxPill);
  });

  it('removes last pill to get to depth 0', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'DELETE_PILL' },
    );
    expect(s.pills).toHaveLength(0);
    expect(getDepth(s)).toBe(0);
  });

  it('no-ops when no pills', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'DELETE_PILL' });
    expect(s).toEqual(OMNI_INPUT_INITIAL);
  });

  it('clears text on delete', () => {
    const withText = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'SET_TEXT', text: 'benz' },
    );
    const s = reduce(withText, { type: 'DELETE_PILL' });
    expect(s.text).toBe('');
  });
});

// ============================================================================
// TRUNCATE_TO_PILL
// ============================================================================

describe('TRUNCATE_TO_PILL', () => {
  it('truncates to first pill', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'TRUNCATE_TO_PILL', index: 0 },
    );
    expect(s.pills).toHaveLength(1);
    expect(s.pills[0]).toEqual(rxPill);
  });

  it('no-ops with invalid index', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'TRUNCATE_TO_PILL', index: -1 },
    );
    expect(s.pills).toHaveLength(1);
  });

  it('keeps same pills when truncating to last', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'TRUNCATE_TO_PILL', index: 1 },
    );
    expect(s.pills).toHaveLength(2);
  });
});

// ============================================================================
// SET_TEXT / CLEAR_ALL
// ============================================================================

describe('SET_TEXT', () => {
  it('updates text', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'SET_TEXT', text: 'hello' });
    expect(s.text).toBe('hello');
  });
});

describe('CLEAR_ALL', () => {
  it('clears pills and text', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'SET_TEXT', text: 'test' },
      { type: 'CLEAR_ALL' },
    );
    expect(s.pills).toHaveLength(0);
    expect(s.text).toBe('');
  });

  it('preserves undo stack', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'ITEM_ADDED', itemId: 'test-1' },
      { type: 'CLEAR_ALL' },
    );
    expect(s.undoStack).toEqual(['test-1']);
  });
});

// ============================================================================
// ITEM_ADDED
// ============================================================================

describe('ITEM_ADDED', () => {
  it('returns to root in normal mode', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
    );
    expect(s.pills).toHaveLength(0);
    expect(s.undoStack).toEqual(['item-1']);
  });

  it('returns to category in batch mode', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'TOGGLE_BATCH' },
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
    );
    expect(s.pills).toHaveLength(1);
    expect(s.pills[0]).toEqual(rxPill);
    expect(s.undoStack).toEqual(['item-1']);
  });

  it('accumulates undo stack across multiple adds', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'TOGGLE_BATCH' },
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
      { type: 'INSERT_PILL', pill: makeItemPill('Ibuprofen', 'medication') },
      { type: 'ITEM_ADDED', itemId: 'item-2' },
    );
    expect(s.undoStack).toEqual(['item-1', 'item-2']);
  });
});

// ============================================================================
// UNDO
// ============================================================================

describe('UNDO', () => {
  it('removes last item from undo stack', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'INSERT_PILL', pill: rxPill },
      { type: 'INSERT_PILL', pill: itemPill },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
      { type: 'UNDO' },
    );
    expect(s.undoStack).toHaveLength(0);
  });

  it('no-ops when stack is empty', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'UNDO' });
    expect(s.undoStack).toHaveLength(0);
  });
});

// ============================================================================
// TOGGLE_BATCH
// ============================================================================

describe('TOGGLE_BATCH', () => {
  it('toggles batch mode on', () => {
    const s = reduce(OMNI_INPUT_INITIAL, { type: 'TOGGLE_BATCH' });
    expect(s.batchMode).toBe(true);
  });

  it('toggles batch mode off', () => {
    const s = reduce(
      OMNI_INPUT_INITIAL,
      { type: 'TOGGLE_BATCH' },
      { type: 'TOGGLE_BATCH' },
    );
    expect(s.batchMode).toBe(false);
  });
});

// ============================================================================
// makeCategoryPill / makeItemPill
// ============================================================================

describe('Pill factories', () => {
  it('makeCategoryPill creates correct shape', () => {
    const pill = makeCategoryPill('lab');
    expect(pill.type).toBe('category');
    expect(pill.value).toBe('lab');
    expect(pill.category).toBe('lab');
    expect(pill.label).toBe('Lab');
  });

  it('makeItemPill creates correct shape', () => {
    const pill = makeItemPill('CBC', 'lab');
    expect(pill.type).toBe('item');
    expect(pill.value).toBe('CBC');
    expect(pill.category).toBe('lab');
    expect(pill.label).toBe('CBC');
  });
});
