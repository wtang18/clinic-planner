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

import type { ItemCategory, ItemIntent } from '../types/chart-items';
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
  intent?: ItemIntent;
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
    ...(result.intent ? { intent: result.intent } : {}),
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
// NL Parameter Parsing
// ============================================================================

/**
 * Parsed medication parameters from natural-language input.
 * E.g., "benzonatate 100mg po tid prn" → { drugName, dosage, route, frequency }
 */
export interface ParsedRxParams {
  drugName: string;
  dosage?: string;
  route?: string;
  frequency?: string;
}

// Route abbreviations (case-insensitive)
const ROUTE_ABBREVS: Record<string, string> = {
  po: 'PO',
  im: 'IM',
  iv: 'IV',
  sc: 'SC',
  sl: 'SL',
  pr: 'rectal',
  top: 'topical',
  topical: 'topical',
  inh: 'Inhalation',
  inhaled: 'Inhalation',
  nasal: 'intranasal',
};

// Frequency abbreviations (case-insensitive)
const FREQUENCY_ABBREVS: Record<string, string> = {
  daily: 'daily',
  qd: 'daily',
  bid: 'BID',
  tid: 'TID',
  qid: 'QID',
  qhs: 'QHS',
  prn: 'PRN',
  'tid prn': 'TID PRN',
  'bid prn': 'BID PRN',
  'qid prn': 'QID PRN',
  'q4h': 'Q4H',
  'q6h': 'Q6H',
  'q8h': 'Q8H',
  'q4h prn': 'Q4H PRN',
  'q6h prn': 'Q6H PRN',
  'q8h prn': 'Q8H PRN',
  'q4-6h prn': 'Q4-6H PRN',
  'q6-8h prn': 'Q6-8H PRN',
};

/**
 * Parse a free-text Rx string into structured parameters.
 * Handles formats like:
 *   "benzonatate 100mg po tid prn"
 *   "ibuprofen 400 mg bid"
 *   "amoxicillin 500mg"
 *
 * Returns null if no drug name can be extracted.
 */
export function parseRxNL(input: string): ParsedRxParams | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return null;

  // First token(s) = drug name (everything before a dosage, route, or frequency)
  let drugNameParts: string[] = [];
  let remaining: string[] = [];
  let foundParam = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const lower = token.toLowerCase();

    // Check if this token looks like a dosage (e.g., "100mg", "500 mg", "10-100mg/5ml")
    if (!foundParam && /^\d+[-\/]?\d*\s*(mg|mcg|ml|g|units?|iu|meq)s?(\/\d*\s*(ml|actuation|puff))?$/i.test(token)) {
      foundParam = true;
    }

    // Check if next token is a unit (e.g., "100" followed by "mg")
    if (!foundParam && /^\d+$/.test(token) && i + 1 < tokens.length && /^(mg|mcg|ml|g|units?|iu|meq)$/i.test(tokens[i + 1])) {
      foundParam = true;
    }

    // Check if this is a known route or frequency
    if (!foundParam && (ROUTE_ABBREVS[lower] || FREQUENCY_ABBREVS[lower])) {
      foundParam = true;
    }

    if (foundParam) {
      remaining = tokens.slice(i);
      break;
    } else {
      drugNameParts.push(token);
    }
  }

  // If no parameters found, everything is the drug name
  if (!foundParam) {
    return { drugName: tokens.join(' ') };
  }

  const drugName = drugNameParts.join(' ');
  if (!drugName) return null;

  // Parse remaining tokens for dosage, route, frequency
  const remainingStr = remaining.join(' ');
  let dosage: string | undefined;
  let route: string | undefined;
  let frequency: string | undefined;

  // Extract dosage: number + unit pattern
  const dosageMatch = remainingStr.match(/(\d+[-\/]?\d*\s*(?:mg|mcg|ml|g|units?|iu|meq)s?(?:\/\d*\s*(?:ml|actuation|puff))?)/i);
  if (dosageMatch) {
    dosage = dosageMatch[1].replace(/\s+/g, '');
  }

  // Extract route (after removing dosage match, check remaining tokens)
  const afterDosage = dosageMatch
    ? remainingStr.replace(dosageMatch[0], '').trim()
    : remainingStr;

  const afterTokens = afterDosage.split(/\s+/).filter(Boolean);

  // Try multi-word frequency first (e.g., "tid prn")
  for (let len = Math.min(3, afterTokens.length); len >= 1; len--) {
    for (let start = 0; start <= afterTokens.length - len; start++) {
      const phrase = afterTokens.slice(start, start + len).join(' ').toLowerCase();
      if (FREQUENCY_ABBREVS[phrase]) {
        frequency = FREQUENCY_ABBREVS[phrase];
        // Remove matched tokens and check remaining for route
        const before = afterTokens.slice(0, start);
        const after = afterTokens.slice(start + len);
        const routeTokens = [...before, ...after];
        for (const rt of routeTokens) {
          if (ROUTE_ABBREVS[rt.toLowerCase()]) {
            route = ROUTE_ABBREVS[rt.toLowerCase()];
            break;
          }
        }
        break;
      }
    }
    if (frequency) break;
  }

  // If no frequency found, check for route only
  if (!frequency) {
    for (const token of afterTokens) {
      const lower = token.toLowerCase();
      if (ROUTE_ABBREVS[lower] && !route) {
        route = ROUTE_ABBREVS[lower];
      } else if (FREQUENCY_ABBREVS[lower] && !frequency) {
        frequency = FREQUENCY_ABBREVS[lower];
      }
    }
  }

  return { drugName, dosage, route, frequency };
}

// ============================================================================
// Polymorphic NL Parameter Parsing
// ============================================================================

/**
 * Per-category keyword → field mapping tables.
 * Each entry maps a lowercase keyword to { field, value } where `value`
 * matches a FieldOption.value in the corresponding CategoryFieldDef.
 *
 * Supported: Lab, Allergy, Imaging, Referral.
 * Excluded: Dx, Procedure (no reliable keyword patterns).
 */

interface KeywordMapping {
  field: string;
  value: string;
}

type KeywordTable = Record<string, KeywordMapping>;

const LAB_KEYWORDS: KeywordTable = {
  stat: { field: 'priority', value: 'stat' },
  urgent: { field: 'priority', value: 'urgent' },
};

const ALLERGY_KEYWORDS: KeywordTable = {
  anaphylaxis: { field: 'severity', value: 'severe' },
  severe: { field: 'severity', value: 'severe' },
  rash: { field: 'severity', value: 'mild' },
  hives: { field: 'severity', value: 'mild' },
  mild: { field: 'severity', value: 'mild' },
  moderate: { field: 'severity', value: 'moderate' },
};

const IMAGING_KEYWORDS: KeywordTable = {
  stat: { field: 'priority', value: 'stat' },
  urgent: { field: 'priority', value: 'urgent' },
  left: { field: 'laterality', value: 'Left' },
  right: { field: 'laterality', value: 'Right' },
  bilateral: { field: 'laterality', value: 'Bilateral' },
};

const REFERRAL_KEYWORDS: KeywordTable = {
  urgent: { field: 'urgency', value: 'urgent' },
  emergent: { field: 'urgency', value: 'emergent' },
};

const CATEGORY_KEYWORD_TABLES: Partial<Record<ItemCategory, KeywordTable>> = {
  lab: LAB_KEYWORDS,
  allergy: ALLERGY_KEYWORDS,
  imaging: IMAGING_KEYWORDS,
  referral: REFERRAL_KEYWORDS,
};

/**
 * Scan input tokens against a keyword table, collecting first match per field.
 */
function parseKeywordParams(
  input: string,
  table: KeywordTable,
): Record<string, string> | null {
  const tokens = input.toLowerCase().split(/\s+/);
  const result: Record<string, string> = {};

  for (const token of tokens) {
    const mapping = table[token];
    if (mapping && !result[mapping.field]) {
      result[mapping.field] = mapping.value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Parse NL parameters from free-text input for any supported category.
 *
 * - **Rx**: delegates to parseRxNL, strips drugName, returns { dosage?, route?, frequency? }
 * - **Lab/Allergy/Imaging/Referral**: keyword scan against per-category lookup tables
 * - **Dx/Procedure**: returns null (no reliable keyword patterns)
 *
 * Returns null if no parameters could be extracted.
 */
export function parseNLParams(
  category: ItemCategory,
  input: string,
): Record<string, string> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Rx: delegate to the regex-based parser
  if (category === 'medication') {
    const rx = parseRxNL(trimmed);
    if (!rx) return null;
    const params: Record<string, string> = {};
    if (rx.dosage) params.dosage = rx.dosage;
    if (rx.route) params.route = rx.route;
    if (rx.frequency) params.frequency = rx.frequency;
    return Object.keys(params).length > 0 ? params : null;
  }

  // Keyword-based categories
  const table = CATEGORY_KEYWORD_TABLES[category];
  if (!table) return null;

  return parseKeywordParams(trimmed, table);
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
