/**
 * OmniAdd State Machine
 *
 * Tree-based state machine for the OmniAdd charting module.
 * Supports three interaction variants (structured search, narrative, data entry)
 * across 15 chart item categories.
 *
 * State flow:
 *   ROOT → CATEGORY → variant-specific states → ADD → ROOT (or CATEGORY in batch mode)
 *
 * Breadcrumb navigation: tapping a breadcrumb level returns to that level's
 * SELECTION state (to choose a different option), not into its details.
 */

import type { ItemCategory, ItemIntent } from '../../types/chart-items';

// ============================================================================
// Category Variants
// ============================================================================

export type CategoryVariant = 'structured' | 'narrative' | 'data-entry';

const CATEGORY_VARIANTS: Record<ItemCategory, CategoryVariant> = {
  'medication': 'structured',
  'lab': 'structured',
  'diagnosis': 'structured',
  'imaging': 'structured',
  'procedure': 'structured',
  'allergy': 'structured',
  'referral': 'structured',
  'chief-complaint': 'narrative',
  'hpi': 'narrative',
  'physical-exam': 'narrative',
  'plan': 'narrative',
  'instruction': 'narrative',
  'note': 'narrative',
  'vitals': 'data-entry',
  'assessment': 'structured',
};

export function getCategoryVariant(category: ItemCategory): CategoryVariant {
  return CATEGORY_VARIANTS[category];
}

// ============================================================================
// Primary / Secondary Categories
// ============================================================================

export interface CategoryMeta {
  category: ItemCategory;
  label: string;
  shortcut?: string;  // Single-key shortcut when OmniAdd input is empty
  prefix?: string;    // Keyboard prefix (e.g., "rx:")
  primary: boolean;
  intent?: ItemIntent; // Override intent (e.g., 'report' for med: prefix)
}

export const CATEGORIES: CategoryMeta[] = [
  { category: 'medication',      label: 'Rx',        shortcut: 'M', prefix: 'rx:',    primary: true },
  { category: 'lab',             label: 'Lab',       shortcut: 'L', prefix: 'lab:',   primary: true },
  { category: 'diagnosis',       label: 'Dx',        shortcut: 'D', prefix: 'dx:',    primary: true },
  { category: 'imaging',         label: 'Imaging',   shortcut: 'I', prefix: 'img:',   primary: true },
  { category: 'procedure',       label: 'Proc',      shortcut: 'P', prefix: 'proc:',  primary: true },
  { category: 'chief-complaint', label: 'CC',        prefix: 'cc:',                   primary: false },
  { category: 'hpi',             label: 'HPI',       prefix: 'hpi:',                  primary: false },
  { category: 'physical-exam',   label: 'PE',        prefix: 'pe:',                   primary: false },
  { category: 'vitals',          label: 'Vitals',    prefix: 'vitals:',               primary: false },
  { category: 'allergy',         label: 'Allergy',   prefix: 'allergy:',              primary: false },
  { category: 'plan',            label: 'Plan',      prefix: 'plan:',                 primary: false },
  { category: 'instruction',     label: 'Instruction', prefix: 'instr:',              primary: false },
  { category: 'note',            label: 'Note',      prefix: 'note:',                 primary: false },
  { category: 'referral',        label: 'Referral',  prefix: 'ref:',                  primary: false },
  { category: 'assessment',      label: 'Assessment', prefix: 'assess:',              primary: false },
  { category: 'medication',      label: 'Med',       prefix: 'med:',                  primary: false, intent: 'report' },
  { category: 'diagnosis',       label: 'R/O',       prefix: 'ro:',                   primary: false, intent: 'rule-out' },
];

export const PRIMARY_CATEGORIES = CATEGORIES.filter(c => c.primary);
export const SECONDARY_CATEGORIES = CATEGORIES.filter(c => !c.primary);

export function getCategoryMeta(category: ItemCategory): CategoryMeta {
  return CATEGORIES.find(c => c.category === category)!;
}

export function findCategoryByShortcut(key: string): ItemCategory | null {
  const upper = key.toUpperCase();
  const match = CATEGORIES.find(c => c.shortcut === upper);
  return match?.category ?? null;
}

export function findCategoryByPrefix(input: string): { category: ItemCategory; query: string; intent?: ItemIntent } | null {
  const lower = input.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.prefix && lower.startsWith(cat.prefix)) {
      return {
        category: cat.category,
        query: lower.slice(cat.prefix.length).trim(),
        ...(cat.intent ? { intent: cat.intent } : {}),
      };
    }
  }
  return null;
}

// ============================================================================
// State Machine Types
// ============================================================================

export type OmniAddStep =
  | 'root'
  | 'category'
  | 'quick-pick'       // Structured: showing quick-pick chips + search
  | 'search'           // Structured: active search
  | 'detail'           // Structured: detail fields before add
  | 'text-input'       // Narrative: text entry
  | 'data-entry'       // Vitals: field grid
  | 'adding';          // Brief transient state during add

/** Breadcrumb segment */
export interface BreadcrumbSegment {
  label: string;
  step: OmniAddStep;
  /** The category at this breadcrumb level (null for root) */
  category: ItemCategory | null;
}

/** The selected item (from quick-pick or search) */
export interface SelectedItem {
  id: string;
  label: string;
  data: Record<string, unknown>;
}

export interface OmniAddState {
  step: OmniAddStep;
  category: ItemCategory | null;
  variant: CategoryVariant | null;
  selectedItem: SelectedItem | null;
  searchQuery: string;
  batchMode: boolean;
  breadcrumbs: BreadcrumbSegment[];
  /** Stack of recently added item IDs for undo */
  undoStack: string[];
  /** Whether the "More" categories are expanded */
  moreExpanded: boolean;
  /** Input mode: touch-driven or keyboard-driven */
  inputMode: 'touch' | 'keyboard';
}

// ============================================================================
// Actions
// ============================================================================

export type OmniAddAction =
  | { type: 'SELECT_CATEGORY'; category: ItemCategory }
  | { type: 'SELECT_QUICK_PICK'; item: SelectedItem }
  | { type: 'SEARCH'; query: string }
  | { type: 'SELECT_SEARCH_RESULT'; item: SelectedItem }
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_TO_BREADCRUMB'; index: number }
  | { type: 'SUBMIT_TEXT'; text: string }
  | { type: 'SUBMIT_DETAIL' }
  | { type: 'SUBMIT_DATA_ENTRY' }
  | { type: 'ITEM_ADDED'; itemId: string }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_MORE' }
  | { type: 'TOGGLE_BATCH_MODE' }
  | { type: 'EXIT_BATCH' }
  | { type: 'SET_INPUT_MODE'; mode: 'touch' | 'keyboard' }
  | { type: 'OPEN_SEARCH' }
  | { type: 'RESET' };

// ============================================================================
// Initial State
// ============================================================================

export const INITIAL_STATE: OmniAddState = {
  step: 'root',
  category: null,
  variant: null,
  selectedItem: null,
  searchQuery: '',
  batchMode: false,
  breadcrumbs: [{ label: '+', step: 'root', category: null }],
  undoStack: [],
  moreExpanded: false,
  inputMode: 'touch',
};

// ============================================================================
// Reducer
// ============================================================================

export function omniAddReducer(state: OmniAddState, action: OmniAddAction): OmniAddState {
  switch (action.type) {
    case 'SELECT_CATEGORY': {
      const variant = getCategoryVariant(action.category);
      const meta = getCategoryMeta(action.category);
      const baseBreadcrumbs = [
        { label: '+', step: 'root' as const, category: null },
        { label: meta.label, step: 'category' as const, category: action.category },
      ];

      // Route to the right initial step based on variant
      if (variant === 'structured') {
        return {
          ...state,
          step: 'quick-pick',
          category: action.category,
          variant,
          selectedItem: null,
          searchQuery: '',
          breadcrumbs: baseBreadcrumbs,
        };
      } else if (variant === 'narrative') {
        return {
          ...state,
          step: 'text-input',
          category: action.category,
          variant,
          selectedItem: null,
          searchQuery: '',
          breadcrumbs: baseBreadcrumbs,
        };
      } else {
        // data-entry (vitals)
        return {
          ...state,
          step: 'data-entry',
          category: action.category,
          variant,
          selectedItem: null,
          searchQuery: '',
          breadcrumbs: baseBreadcrumbs,
        };
      }
    }

    case 'SELECT_QUICK_PICK': {
      if (state.step !== 'quick-pick' && state.step !== 'search') return state;
      return {
        ...state,
        step: 'detail',
        selectedItem: action.item,
        breadcrumbs: [
          ...state.breadcrumbs,
          { label: action.item.label, step: 'detail', category: state.category },
        ],
      };
    }

    case 'SEARCH': {
      return {
        ...state,
        searchQuery: action.query,
      };
    }

    case 'OPEN_SEARCH': {
      if (state.step !== 'quick-pick') return state;
      return {
        ...state,
        step: 'search',
      };
    }

    case 'SELECT_SEARCH_RESULT': {
      if (state.step !== 'search' && state.step !== 'quick-pick') return state;
      return {
        ...state,
        step: 'detail',
        selectedItem: action.item,
        searchQuery: '',
        breadcrumbs: [
          ...state.breadcrumbs,
          { label: action.item.label, step: 'detail', category: state.category },
        ],
      };
    }

    case 'NAVIGATE_BACK': {
      if (state.step === 'root') return state;

      // Search → quick-pick
      if (state.step === 'search') {
        return {
          ...state,
          step: 'quick-pick',
          searchQuery: '',
        };
      }

      // Detail → quick-pick (drop item selection)
      if (state.step === 'detail') {
        return {
          ...state,
          step: state.variant === 'structured' ? 'quick-pick' : 'root',
          selectedItem: null,
          breadcrumbs: state.breadcrumbs.slice(0, -1),
        };
      }

      // Category-level views (quick-pick, text-input, data-entry) → root
      return {
        ...state,
        step: 'root',
        category: null,
        variant: null,
        selectedItem: null,
        searchQuery: '',
        breadcrumbs: [{ label: '+', step: 'root', category: null }],
      };
    }

    case 'NAVIGATE_TO_BREADCRUMB': {
      const target = state.breadcrumbs[action.index];
      if (!target) return state;

      if (target.step === 'root') {
        return {
          ...INITIAL_STATE,
          undoStack: state.undoStack,
          batchMode: state.batchMode,
          inputMode: state.inputMode,
        };
      }

      // Navigate to category level → re-enter at category's initial step
      if (target.step === 'category') {
        const category = target.category!;
        const variant = getCategoryVariant(category);
        const step = variant === 'structured' ? 'quick-pick'
          : variant === 'narrative' ? 'text-input'
          : 'data-entry';
        return {
          ...state,
          step,
          category,
          variant,
          selectedItem: null,
          searchQuery: '',
          breadcrumbs: state.breadcrumbs.slice(0, action.index + 1),
        };
      }

      // Navigate to a specific step
      return {
        ...state,
        step: target.step,
        selectedItem: null,
        searchQuery: '',
        breadcrumbs: state.breadcrumbs.slice(0, action.index + 1),
      };
    }

    case 'SUBMIT_TEXT':
    case 'SUBMIT_DETAIL':
    case 'SUBMIT_DATA_ENTRY': {
      // Transition to adding state (brief)
      return {
        ...state,
        step: 'adding',
      };
    }

    case 'ITEM_ADDED': {
      const newUndoStack = [...state.undoStack, action.itemId];

      // Batch mode: return to category level
      if (state.batchMode && state.category) {
        const variant = getCategoryVariant(state.category);
        const step = variant === 'structured' ? 'quick-pick'
          : variant === 'narrative' ? 'text-input'
          : 'data-entry';
        const meta = getCategoryMeta(state.category);
        return {
          ...state,
          step,
          selectedItem: null,
          searchQuery: '',
          undoStack: newUndoStack,
          breadcrumbs: [
            { label: '+', step: 'root', category: null },
            { label: meta.label, step: 'category', category: state.category },
          ],
        };
      }

      // Normal mode: return to root
      return {
        ...INITIAL_STATE,
        undoStack: newUndoStack,
        inputMode: state.inputMode,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    case 'TOGGLE_MORE': {
      return {
        ...state,
        moreExpanded: !state.moreExpanded,
      };
    }

    case 'TOGGLE_BATCH_MODE': {
      return {
        ...state,
        batchMode: !state.batchMode,
      };
    }

    case 'EXIT_BATCH': {
      return {
        ...INITIAL_STATE,
        undoStack: state.undoStack,
        inputMode: state.inputMode,
      };
    }

    case 'SET_INPUT_MODE': {
      return {
        ...state,
        inputMode: action.mode,
      };
    }

    case 'RESET': {
      return {
        ...INITIAL_STATE,
        inputMode: state.inputMode,
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Selectors
// ============================================================================

/** Whether the current step supports adding an item */
export function canSubmit(state: OmniAddState): boolean {
  return state.step === 'detail' || state.step === 'text-input' || state.step === 'data-entry';
}

/** Get the breadcrumb path as a display string */
export function getBreadcrumbPath(state: OmniAddState): string {
  return state.breadcrumbs.map(b => b.label).join(' > ');
}

/** Whether we're at a step that shows category selection */
export function isAtRoot(state: OmniAddState): boolean {
  return state.step === 'root';
}

/** Whether we're in a category and can navigate back */
export function canNavigateBack(state: OmniAddState): boolean {
  return state.step !== 'root';
}
