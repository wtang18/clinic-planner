/**
 * Input Recognizer Service
 *
 * Handles three kinds of input recognition for the unified omni-input:
 *
 * 1. **Prefix detection** — "rx:", "lab:", "dx:" etc. route to a specific category
 * 2. **Auto-categorization** — Unambiguous terms (e.g., "benzonatate" → Rx) are
 *    auto-categorized to skip the category selection step
 * 3. **Ambiguity grouping** — Ambiguous terms (e.g., "strep") return grouped
 *    cross-category results so the provider can pick the intended category
 */

import type { ItemCategory } from '../types/chart-items';
import {
  CATEGORIES,
  findCategoryByPrefix,
} from '../components/omni-add/omni-add-machine';
import {
  searchAllCategories,
  searchCategory,
  type QuickPickItem,
} from '../data/mock-quick-picks';

// ============================================================================
// Types
// ============================================================================

export interface RecognizedPrefix {
  kind: 'prefix';
  category: ItemCategory;
  query: string;
}

export interface RecognizedCategory {
  kind: 'auto-category';
  category: ItemCategory;
  items: QuickPickItem[];
  /** The single best match if there's a strong 1:1 correspondence */
  bestMatch?: QuickPickItem;
}

export interface RecognizedAmbiguous {
  kind: 'ambiguous';
  groups: CategoryGroup[];
}

export interface CategoryGroup {
  category: ItemCategory;
  label: string;
  items: QuickPickItem[];
}

export interface RecognizedNone {
  kind: 'none';
}

export type RecognitionResult =
  | RecognizedPrefix
  | RecognizedCategory
  | RecognizedAmbiguous
  | RecognizedNone;

// ============================================================================
// Prefix Detection
// ============================================================================

/**
 * Check if input starts with a known category prefix (e.g., "rx:", "lab:").
 * Returns the category and remaining query text.
 */
export function detectPrefix(input: string): RecognizedPrefix | null {
  const result = findCategoryByPrefix(input);
  if (!result) return null;
  return {
    kind: 'prefix',
    category: result.category,
    query: result.query,
  };
}

// ============================================================================
// Auto-Categorization
// ============================================================================

/**
 * Attempt to auto-categorize an input string. If all search results fall into
 * a single category, we can skip category selection and jump straight to that
 * category's item list.
 *
 * Returns null if the input is ambiguous (results span multiple categories)
 * or has no matches.
 */
export function autoCategorize(input: string): RecognizedCategory | null {
  if (input.length < 2) return null;

  const results = searchAllCategories(input);
  if (results.length === 0) return null;

  // Check if all results are in the same category
  const categories = new Set(results.map(r => r.category));
  if (categories.size !== 1) return null;

  const category = results[0].category;

  // Find best match: exact name match or starts-with
  const lower = input.toLowerCase();
  const bestMatch = results.find(r =>
    r.chipLabel.toLowerCase() === lower ||
    r.label.toLowerCase().startsWith(lower)
  );

  return {
    kind: 'auto-category',
    category,
    items: results,
    bestMatch,
  };
}

// ============================================================================
// Ambiguity Grouping
// ============================================================================

/**
 * When input matches items across multiple categories, group them for display.
 * Each group has the category label and matching items.
 */
export function groupAmbiguous(input: string): RecognizedAmbiguous | null {
  if (input.length < 2) return null;

  const results = searchAllCategories(input);
  if (results.length === 0) return null;

  const categories = new Set(results.map(r => r.category));
  if (categories.size <= 1) return null;

  const groups: CategoryGroup[] = [];
  for (const cat of categories) {
    const catMeta = CATEGORIES.find(c => c.category === cat);
    groups.push({
      category: cat,
      label: catMeta?.label ?? cat,
      items: results.filter(r => r.category === cat),
    });
  }

  return {
    kind: 'ambiguous',
    groups,
  };
}

// ============================================================================
// Scoped Search (within a category)
// ============================================================================

/**
 * Search within a specific category. Used at depth 1 (category pill committed)
 * when the user types to filter items.
 */
export function searchInCategory(
  category: ItemCategory,
  query: string,
): QuickPickItem[] {
  if (query.length < 1) return [];
  return searchCategory(category, query);
}

// ============================================================================
// Main Recognizer
// ============================================================================

/**
 * Run full recognition pipeline on raw input text.
 * Priority: prefix detection → auto-categorization → ambiguity grouping → none
 */
export function recognize(input: string): RecognitionResult {
  const trimmed = input.trim();
  if (!trimmed) return { kind: 'none' };

  // 1. Check for prefix (e.g., "rx:benzonatate")
  const prefix = detectPrefix(trimmed);
  if (prefix) return prefix;

  // 2. Try auto-categorization (all results in one category)
  const autoResult = autoCategorize(trimmed);
  if (autoResult) return autoResult;

  // 3. Try ambiguity grouping (results span multiple categories)
  const ambiguous = groupAmbiguous(trimmed);
  if (ambiguous) return ambiguous;

  return { kind: 'none' };
}
