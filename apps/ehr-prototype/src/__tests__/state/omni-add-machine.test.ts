/**
 * OmniAdd State Machine Tests
 *
 * Tests the tree-based state machine: transitions for each category variant
 * (structured/narrative/data-entry), breadcrumb navigation, batch mode, undo.
 */

import { describe, it, expect } from 'vitest';
import {
  omniAddReducer,
  INITIAL_STATE,
  getCategoryVariant,
  getCategoryMeta,
  findCategoryByShortcut,
  findCategoryByPrefix,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  type OmniAddState,
  type OmniAddAction,
  type SelectedItem,
} from '../../components/omni-add/omni-add-machine';

// ============================================================================
// Helpers
// ============================================================================

function dispatch(state: OmniAddState, action: OmniAddAction): OmniAddState {
  return omniAddReducer(state, action);
}

function dispatchMany(state: OmniAddState, actions: OmniAddAction[]): OmniAddState {
  return actions.reduce((s, a) => omniAddReducer(s, a), state);
}

const MOCK_ITEM: SelectedItem = {
  id: 'rx-benzonatate',
  label: 'Benzonatate 100mg',
  data: { drugName: 'Benzonatate', dosage: '100mg' },
};

// ============================================================================
// Category Metadata
// ============================================================================

describe('Category metadata', () => {
  it('maps structured categories correctly', () => {
    expect(getCategoryVariant('medication')).toBe('structured');
    expect(getCategoryVariant('lab')).toBe('structured');
    expect(getCategoryVariant('diagnosis')).toBe('structured');
    expect(getCategoryVariant('imaging')).toBe('structured');
    expect(getCategoryVariant('procedure')).toBe('structured');
    expect(getCategoryVariant('allergy')).toBe('structured');
    expect(getCategoryVariant('referral')).toBe('structured');
  });

  it('maps narrative categories correctly', () => {
    expect(getCategoryVariant('chief-complaint')).toBe('narrative');
    expect(getCategoryVariant('hpi')).toBe('narrative');
    expect(getCategoryVariant('ros')).toBe('narrative');
    expect(getCategoryVariant('physical-exam')).toBe('narrative');
    expect(getCategoryVariant('plan')).toBe('narrative');
    expect(getCategoryVariant('instruction')).toBe('narrative');
    expect(getCategoryVariant('note')).toBe('narrative');
  });

  it('maps data-entry category correctly', () => {
    expect(getCategoryVariant('vitals')).toBe('data-entry');
  });

  it('has 5 primary categories', () => {
    expect(PRIMARY_CATEGORIES).toHaveLength(5);
    const names = PRIMARY_CATEGORIES.map(c => c.category);
    expect(names).toEqual(['medication', 'lab', 'diagnosis', 'imaging', 'procedure']);
  });

  it('has 10 secondary categories', () => {
    expect(SECONDARY_CATEGORIES).toHaveLength(10);
  });

  it('finds categories by keyboard shortcut', () => {
    expect(findCategoryByShortcut('M')).toBe('medication');
    expect(findCategoryByShortcut('m')).toBe('medication');
    expect(findCategoryByShortcut('L')).toBe('lab');
    expect(findCategoryByShortcut('D')).toBe('diagnosis');
    expect(findCategoryByShortcut('I')).toBe('imaging');
    expect(findCategoryByShortcut('P')).toBe('procedure');
    expect(findCategoryByShortcut('X')).toBeNull();
  });

  it('finds categories by prefix', () => {
    expect(findCategoryByPrefix('rx:amox')).toEqual({ category: 'medication', query: 'amox' });
    expect(findCategoryByPrefix('lab:cbc')).toEqual({ category: 'lab', query: 'cbc' });
    expect(findCategoryByPrefix('dx:bronch')).toEqual({ category: 'diagnosis', query: 'bronch' });
    expect(findCategoryByPrefix('vitals:')).toEqual({ category: 'vitals', query: '' });
    expect(findCategoryByPrefix('amoxicillin')).toBeNull();
  });

  it('returns correct meta for each category', () => {
    const meta = getCategoryMeta('medication');
    expect(meta.label).toBe('Rx');
    expect(meta.shortcut).toBe('M');
    expect(meta.prefix).toBe('rx:');
    expect(meta.primary).toBe(true);
  });
});

// ============================================================================
// Initial State
// ============================================================================

describe('Initial state', () => {
  it('starts at root', () => {
    expect(INITIAL_STATE.step).toBe('root');
    expect(INITIAL_STATE.category).toBeNull();
    expect(INITIAL_STATE.variant).toBeNull();
    expect(INITIAL_STATE.selectedItem).toBeNull();
    expect(INITIAL_STATE.batchMode).toBe(false);
    expect(INITIAL_STATE.undoStack).toEqual([]);
  });

  it('has root breadcrumb', () => {
    expect(INITIAL_STATE.breadcrumbs).toEqual([
      { label: '+', step: 'root', category: null },
    ]);
  });
});

// ============================================================================
// Structured Category Flow (Medication, Lab, Dx, etc.)
// ============================================================================

describe('Structured category flow', () => {
  it('selects category → quick-pick step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: 'medication' });
    expect(state.step).toBe('quick-pick');
    expect(state.category).toBe('medication');
    expect(state.variant).toBe('structured');
  });

  it('builds breadcrumbs on category select', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: 'medication' });
    expect(state.breadcrumbs).toEqual([
      { label: '+', step: 'root', category: null },
      { label: 'Rx', step: 'category', category: 'medication' },
    ]);
  });

  it('selects quick pick → detail step', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
    ]);
    expect(state.step).toBe('detail');
    expect(state.selectedItem).toBe(MOCK_ITEM);
  });

  it('builds breadcrumbs on quick pick select', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
    ]);
    expect(state.breadcrumbs).toHaveLength(3);
    expect(state.breadcrumbs[2].label).toBe('Benzonatate 100mg');
  });

  it('completes full flow: category → pick → detail → add → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
    ]);
    expect(state.step).toBe('root');
    expect(state.category).toBeNull();
    expect(state.selectedItem).toBeNull();
    expect(state.undoStack).toEqual(['item-1']);
  });

  it('opens search from quick-pick', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'OPEN_SEARCH' },
    ]);
    expect(state.step).toBe('search');
  });

  it('selects search result → detail step', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'OPEN_SEARCH' },
      { type: 'SELECT_SEARCH_RESULT', item: MOCK_ITEM },
    ]);
    expect(state.step).toBe('detail');
    expect(state.selectedItem).toBe(MOCK_ITEM);
  });

  it('works for all structured categories', () => {
    const structured = ['medication', 'lab', 'diagnosis', 'imaging', 'procedure', 'allergy', 'referral'] as const;
    for (const cat of structured) {
      const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: cat });
      expect(state.step).toBe('quick-pick');
      expect(state.variant).toBe('structured');
    }
  });
});

// ============================================================================
// Narrative Category Flow (CC, HPI, ROS, PE, Plan, Instruction, Note)
// ============================================================================

describe('Narrative category flow', () => {
  it('selects narrative category → text-input step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: 'hpi' });
    expect(state.step).toBe('text-input');
    expect(state.category).toBe('hpi');
    expect(state.variant).toBe('narrative');
  });

  it('completes full flow: category → text → add → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'hpi' },
      { type: 'SUBMIT_TEXT', text: 'Patient reports cough x 5 days' },
      { type: 'ITEM_ADDED', itemId: 'item-hpi-1' },
    ]);
    expect(state.step).toBe('root');
    expect(state.undoStack).toEqual(['item-hpi-1']);
  });

  it('works for all narrative categories', () => {
    const narrative = ['chief-complaint', 'hpi', 'ros', 'physical-exam', 'plan', 'instruction', 'note'] as const;
    for (const cat of narrative) {
      const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: cat });
      expect(state.step).toBe('text-input');
      expect(state.variant).toBe('narrative');
    }
  });
});

// ============================================================================
// Data Entry Flow (Vitals)
// ============================================================================

describe('Data entry flow', () => {
  it('selects vitals → data-entry step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: 'vitals' });
    expect(state.step).toBe('data-entry');
    expect(state.category).toBe('vitals');
    expect(state.variant).toBe('data-entry');
  });

  it('completes full flow: category → data entry → add → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'vitals' },
      { type: 'SUBMIT_DATA_ENTRY' },
      { type: 'ITEM_ADDED', itemId: 'item-vitals-1' },
    ]);
    expect(state.step).toBe('root');
    expect(state.undoStack).toEqual(['item-vitals-1']);
  });
});

// ============================================================================
// Back Navigation
// ============================================================================

describe('Back navigation', () => {
  it('does nothing at root', () => {
    const state = dispatch(INITIAL_STATE, { type: 'NAVIGATE_BACK' });
    expect(state.step).toBe('root');
  });

  it('quick-pick → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'NAVIGATE_BACK' },
    ]);
    expect(state.step).toBe('root');
    expect(state.category).toBeNull();
  });

  it('search → quick-pick', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'OPEN_SEARCH' },
      { type: 'NAVIGATE_BACK' },
    ]);
    expect(state.step).toBe('quick-pick');
  });

  it('detail → quick-pick (drops selection)', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'NAVIGATE_BACK' },
    ]);
    expect(state.step).toBe('quick-pick');
    expect(state.selectedItem).toBeNull();
    expect(state.breadcrumbs).toHaveLength(2); // root + category
  });

  it('text-input → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'hpi' },
      { type: 'NAVIGATE_BACK' },
    ]);
    expect(state.step).toBe('root');
  });

  it('data-entry → root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'vitals' },
      { type: 'NAVIGATE_BACK' },
    ]);
    expect(state.step).toBe('root');
  });
});

// ============================================================================
// Breadcrumb Navigation
// ============================================================================

describe('Breadcrumb navigation', () => {
  it('tapping root breadcrumb returns to root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'NAVIGATE_TO_BREADCRUMB', index: 0 },
    ]);
    expect(state.step).toBe('root');
    expect(state.category).toBeNull();
    expect(state.breadcrumbs).toHaveLength(1);
  });

  it('tapping category breadcrumb returns to category selection state', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'NAVIGATE_TO_BREADCRUMB', index: 1 }, // "Rx" level
    ]);
    // Should return to Rx quick-picks — to choose a DIFFERENT item
    expect(state.step).toBe('quick-pick');
    expect(state.category).toBe('medication');
    expect(state.selectedItem).toBeNull();
    expect(state.breadcrumbs).toHaveLength(2); // root + Rx
  });

  it('tapping category breadcrumb for narrative returns to text-input', () => {
    // This is less likely since narrative doesn't have sub-steps,
    // but the machine should still handle it
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'hpi' },
      { type: 'NAVIGATE_TO_BREADCRUMB', index: 1 },
    ]);
    expect(state.step).toBe('text-input');
    expect(state.category).toBe('hpi');
  });

  it('ignores invalid breadcrumb index', () => {
    const state = dispatch(INITIAL_STATE, { type: 'NAVIGATE_TO_BREADCRUMB', index: 99 });
    expect(state).toBe(INITIAL_STATE);
  });
});

// ============================================================================
// Batch Mode
// ============================================================================

describe('Batch mode', () => {
  it('toggles batch mode', () => {
    const state = dispatch(INITIAL_STATE, { type: 'TOGGLE_BATCH_MODE' });
    expect(state.batchMode).toBe(true);
    const state2 = dispatch(state, { type: 'TOGGLE_BATCH_MODE' });
    expect(state2.batchMode).toBe(false);
  });

  it('returns to category level after add (not root) in batch mode', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'TOGGLE_BATCH_MODE' },
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
    ]);
    expect(state.step).toBe('quick-pick'); // stays at Rx, not root
    expect(state.category).toBe('medication');
    expect(state.selectedItem).toBeNull(); // cleared for next pick
    expect(state.batchMode).toBe(true);
  });

  it('EXIT_BATCH returns to root', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'TOGGLE_BATCH_MODE' },
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'EXIT_BATCH' },
    ]);
    expect(state.step).toBe('root');
    expect(state.batchMode).toBe(false);
  });

  it('batch mode works for narrative categories', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'TOGGLE_BATCH_MODE' },
      { type: 'SELECT_CATEGORY', category: 'note' },
      { type: 'SUBMIT_TEXT', text: 'Some note' },
      { type: 'ITEM_ADDED', itemId: 'item-note-1' },
    ]);
    expect(state.step).toBe('text-input'); // stays at note
    expect(state.category).toBe('note');
  });

  it('batch mode works for vitals', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'TOGGLE_BATCH_MODE' },
      { type: 'SELECT_CATEGORY', category: 'vitals' },
      { type: 'SUBMIT_DATA_ENTRY' },
      { type: 'ITEM_ADDED', itemId: 'item-vitals-1' },
    ]);
    expect(state.step).toBe('data-entry'); // stays at vitals
    expect(state.category).toBe('vitals');
  });
});

// ============================================================================
// Undo
// ============================================================================

describe('Undo', () => {
  it('does nothing with empty undo stack', () => {
    const state = dispatch(INITIAL_STATE, { type: 'UNDO' });
    expect(state.undoStack).toEqual([]);
  });

  it('removes last item from undo stack', () => {
    const withItems = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
      { type: 'SELECT_CATEGORY', category: 'lab' },
      { type: 'SELECT_QUICK_PICK', item: { ...MOCK_ITEM, id: 'lab-1', label: 'CBC' } },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'item-2' },
    ]);
    expect(withItems.undoStack).toEqual(['item-1', 'item-2']);

    const afterUndo = dispatch(withItems, { type: 'UNDO' });
    expect(afterUndo.undoStack).toEqual(['item-1']);

    const afterDoubleUndo = dispatch(afterUndo, { type: 'UNDO' });
    expect(afterDoubleUndo.undoStack).toEqual([]);
  });

  it('preserves undo stack across category switches', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'item-1' },
    ]);
    expect(state.undoStack).toEqual(['item-1']);
    // Navigate to a new category — undo stack should persist
    const state2 = dispatch(state, { type: 'SELECT_CATEGORY', category: 'lab' });
    expect(state2.undoStack).toEqual(['item-1']);
  });
});

// ============================================================================
// More Toggle
// ============================================================================

describe('More categories toggle', () => {
  it('toggles moreExpanded', () => {
    const state = dispatch(INITIAL_STATE, { type: 'TOGGLE_MORE' });
    expect(state.moreExpanded).toBe(true);
    const state2 = dispatch(state, { type: 'TOGGLE_MORE' });
    expect(state2.moreExpanded).toBe(false);
  });
});

// ============================================================================
// Reset
// ============================================================================

describe('Reset', () => {
  it('returns to initial state but preserves input mode', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SET_INPUT_MODE', mode: 'keyboard' },
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'RESET' },
    ]);
    expect(state.step).toBe('root');
    expect(state.category).toBeNull();
    expect(state.inputMode).toBe('keyboard');
  });
});

// ============================================================================
// Multi-Step Flows (integration-level state machine tests)
// ============================================================================

describe('Multi-step flows', () => {
  it('add two items sequentially', () => {
    const state = dispatchMany(INITIAL_STATE, [
      // First item
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'rx-1' },
      // Second item
      { type: 'SELECT_CATEGORY', category: 'diagnosis' },
      { type: 'SELECT_QUICK_PICK', item: { id: 'dx-1', label: 'Acute bronchitis', data: {} } },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'dx-1' },
    ]);
    expect(state.step).toBe('root');
    expect(state.undoStack).toEqual(['rx-1', 'dx-1']);
  });

  it('batch add multiple meds then exit', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'TOGGLE_BATCH_MODE' },
      { type: 'SELECT_CATEGORY', category: 'medication' },
      // First med
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'rx-1' },
      // Second med (still in Rx)
      { type: 'SELECT_QUICK_PICK', item: { ...MOCK_ITEM, id: 'rx-2', label: 'Amoxicillin' } },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'rx-2' },
      // Done
      { type: 'EXIT_BATCH' },
    ]);
    expect(state.step).toBe('root');
    expect(state.undoStack).toEqual(['rx-1', 'rx-2']);
    expect(state.batchMode).toBe(false);
  });

  it('add item, undo, add different item', () => {
    const state = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'rx-1' },
      { type: 'UNDO' },
      { type: 'SELECT_CATEGORY', category: 'lab' },
      { type: 'SELECT_QUICK_PICK', item: { id: 'lab-1', label: 'CBC', data: {} } },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'lab-1' },
    ]);
    expect(state.undoStack).toEqual(['lab-1']);
  });

  it('navigate deep then use breadcrumb to jump back', () => {
    const atDetail = dispatchMany(INITIAL_STATE, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
    ]);
    expect(atDetail.step).toBe('detail');
    expect(atDetail.breadcrumbs).toHaveLength(3);

    // Jump to root via breadcrumb
    const atRoot = dispatch(atDetail, { type: 'NAVIGATE_TO_BREADCRUMB', index: 0 });
    expect(atRoot.step).toBe('root');

    // Jump to category via breadcrumb (from detail)
    const atCategory = dispatch(atDetail, { type: 'NAVIGATE_TO_BREADCRUMB', index: 1 });
    expect(atCategory.step).toBe('quick-pick');
    expect(atCategory.selectedItem).toBeNull();
  });
});

// ============================================================================
// Edge Cases & Guards
// ============================================================================

describe('Edge cases', () => {
  it('SELECT_QUICK_PICK ignored at wrong step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM });
    expect(state).toBe(INITIAL_STATE);
  });

  it('SELECT_SEARCH_RESULT ignored at wrong step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'SELECT_SEARCH_RESULT', item: MOCK_ITEM });
    expect(state).toBe(INITIAL_STATE);
  });

  it('OPEN_SEARCH ignored at wrong step', () => {
    const state = dispatch(INITIAL_STATE, { type: 'OPEN_SEARCH' });
    expect(state).toBe(INITIAL_STATE);
  });

  it('search query updates without changing step', () => {
    const atQuickPick = dispatch(INITIAL_STATE, { type: 'SELECT_CATEGORY', category: 'medication' });
    const withQuery = dispatch(atQuickPick, { type: 'SEARCH', query: 'benzo' });
    expect(withQuery.searchQuery).toBe('benzo');
    expect(withQuery.step).toBe('quick-pick'); // step doesn't change
  });

  it('input mode persists through reset and item_added', () => {
    const keyboard = dispatch(INITIAL_STATE, { type: 'SET_INPUT_MODE', mode: 'keyboard' });
    const afterAdd = dispatchMany(keyboard, [
      { type: 'SELECT_CATEGORY', category: 'medication' },
      { type: 'SELECT_QUICK_PICK', item: MOCK_ITEM },
      { type: 'SUBMIT_DETAIL' },
      { type: 'ITEM_ADDED', itemId: 'rx-1' },
    ]);
    expect(afterAdd.inputMode).toBe('keyboard');
  });
});
