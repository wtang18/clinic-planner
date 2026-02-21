/**
 * Omni-Input State Machine
 *
 * Pill-based state machine for the unified omni-input. Depth is derived
 * from the pill array (0 = root, 1 = category, 2 = item). Supports batch
 * mode, undo stack, and clear-all.
 *
 * This replaces the step-enum based omni-add-machine.ts with a more
 * flexible model where the pill array IS the navigation state.
 */

import type { ItemCategory } from '../../types/chart-items';
import {
  CATEGORIES,
  getCategoryVariant,
  type CategoryVariant,
  type CategoryMeta,
} from './omni-add-machine';

// ============================================================================
// Types
// ============================================================================

export type PillType = 'category' | 'item';

export interface Pill {
  type: PillType;
  value: string;
  category: ItemCategory;
  label: string;
}

export interface OmniInputState {
  pills: Pill[];
  text: string;
  batchMode: boolean;
  undoStack: string[];
}

export type OmniInputAction =
  | { type: 'INSERT_PILL'; pill: Pill }
  | { type: 'DELETE_PILL' }
  | { type: 'TRUNCATE_TO_PILL'; index: number }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'ITEM_ADDED'; itemId: string }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_BATCH' };

// ============================================================================
// Initial State
// ============================================================================

export const OMNI_INPUT_INITIAL: OmniInputState = {
  pills: [],
  text: '',
  batchMode: false,
  undoStack: [],
};

// ============================================================================
// Depth Selector
// ============================================================================

/** Depth is derived from the pill count: 0 = root, 1 = category, 2 = item */
export function getDepth(state: OmniInputState): number {
  return state.pills.length;
}

/** Get the active category from the pill array (first pill if it's a category pill) */
export function getActiveCategory(state: OmniInputState): ItemCategory | null {
  const catPill = state.pills.find(p => p.type === 'category');
  return catPill?.category ?? null;
}

/** Get the active item label (second pill if it's an item pill) */
export function getActiveItem(state: OmniInputState): string | null {
  const itemPill = state.pills.find(p => p.type === 'item');
  return itemPill?.label ?? null;
}

/** Get the category variant for the current category */
export function getActiveVariant(state: OmniInputState): CategoryVariant | null {
  const cat = getActiveCategory(state);
  return cat ? getCategoryVariant(cat) : null;
}

// ============================================================================
// Helpers
// ============================================================================

/** Create a category pill from an ItemCategory */
export function makeCategoryPill(category: ItemCategory): Pill {
  const meta = CATEGORIES.find(c => c.category === category);
  return {
    type: 'category',
    value: category,
    category,
    label: meta?.label ?? category,
  };
}

/** Create an item pill */
export function makeItemPill(label: string, category: ItemCategory): Pill {
  return {
    type: 'item',
    value: label,
    category,
    label,
  };
}

// ============================================================================
// Reducer
// ============================================================================

export function omniInputReducer(
  state: OmniInputState,
  action: OmniInputAction,
): OmniInputState {
  switch (action.type) {
    case 'INSERT_PILL': {
      // Limit to 2 pills (category + item)
      if (state.pills.length >= 2) return state;
      // Category pill must be first
      if (action.pill.type === 'item' && state.pills.length === 0) return state;
      // Don't allow two of the same type
      if (state.pills.some(p => p.type === action.pill.type)) return state;
      return {
        ...state,
        pills: [...state.pills, action.pill],
        text: '',
      };
    }

    case 'DELETE_PILL': {
      if (state.pills.length === 0) return state;
      return {
        ...state,
        pills: state.pills.slice(0, -1),
        text: '',
      };
    }

    case 'TRUNCATE_TO_PILL': {
      if (action.index < 0 || action.index >= state.pills.length) return state;
      return {
        ...state,
        pills: state.pills.slice(0, action.index + 1),
        text: '',
      };
    }

    case 'SET_TEXT': {
      return {
        ...state,
        text: action.text,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        pills: [],
        text: '',
      };
    }

    case 'ITEM_ADDED': {
      const newUndoStack = [...state.undoStack, action.itemId];

      // Batch mode: return to category level (keep first pill)
      if (state.batchMode && state.pills.length > 0) {
        return {
          ...state,
          pills: state.pills.slice(0, 1),
          text: '',
          undoStack: newUndoStack,
        };
      }

      // Normal mode: return to root
      return {
        ...OMNI_INPUT_INITIAL,
        undoStack: newUndoStack,
        batchMode: state.batchMode,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    case 'TOGGLE_BATCH': {
      return {
        ...state,
        batchMode: !state.batchMode,
      };
    }

    default:
      return state;
  }
}
