/**
 * Suggestion Validators — gate malformed suggestions at creation time.
 *
 * What: Validates entity-extracted data before it becomes a Suggestion.
 * Why: The regex-based entity extractor captures noise words ("started",
 *   "taking") and unstructured categories (HPI, vitals) that produce
 *   meaningless suggestion rows like "Rx started / PO daily".
 * When to reuse: Any pipeline that creates Suggestions from extracted entities.
 */

import type { ItemCategory } from '../../../types/chart-items';

// ============================================================================
// Constants
// ============================================================================

/**
 * Categories that have CategoryFieldDef definitions and can be edited
 * via FieldRows in the suggestion edit panel.
 */
export const STRUCTURED_SUGGESTION_CATEGORIES = new Set<ItemCategory>([
  'medication',
  'diagnosis',
  'lab',
  'imaging',
  'procedure',
  'allergy',
  'referral',
]);

/**
 * Narrative categories that can be edited via textarea in the
 * suggestion edit panel. These have freeform text content.
 */
export const NARRATIVE_SUGGESTION_CATEGORIES = new Set<ItemCategory>([
  'hpi',
  'plan',
  'instruction',
]);

/**
 * Combined set of all categories that support edit-before-accept in
 * the suggestion edit panel — structured (FieldRows) + narrative (textarea).
 */
export const EDITABLE_SUGGESTION_CATEGORIES = new Set<ItemCategory>([
  ...STRUCTURED_SUGGESTION_CATEGORIES,
  ...NARRATIVE_SUGGESTION_CATEGORIES,
]);

/**
 * Common noise words that regex entity extractors accidentally capture
 * as drug names, test names, etc. Case-insensitive matching.
 */
const NOISE_WORDS = new Set([
  'started', 'taking', 'given', 'took', 'using', 'getting',
  'had', 'been', 'have', 'with', 'from', 'about', 'some',
  'the', 'was', 'are', 'her', 'his', 'not', 'for', 'but',
  'and', 'that', 'this', 'has', 'does', 'did', 'will',
  'can', 'may', 'she', 'per', 'also', 'then', 'said',
]);

function isNoiseWord(text: string): boolean {
  return NOISE_WORDS.has(text.toLowerCase().trim());
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that a suggestion's data has meaningful content for its category.
 * Returns false for noise words, empty identifiers, or data too short
 * to be clinically useful.
 */
export function validateSuggestionData(
  category: ItemCategory,
  data: Record<string, unknown>,
): boolean {
  switch (category) {
    case 'medication': {
      const drugName = String(data.drugName ?? '').trim();
      return drugName.length > 2 && !isNoiseWord(drugName);
    }
    case 'diagnosis': {
      const description = String(data.description ?? '').trim();
      return description.length > 2 && !isNoiseWord(description);
    }
    case 'lab': {
      const testName = String(data.testName ?? '').trim();
      return testName.length > 1 && !isNoiseWord(testName);
    }
    case 'imaging': {
      const studyType = String(data.studyType ?? '').trim();
      const bodyPart = String(data.bodyPart ?? '').trim();
      return studyType.length > 0 && bodyPart.length > 0;
    }
    case 'procedure': {
      const procedureName = String(data.procedureName ?? '').trim();
      return procedureName.length > 2 && !isNoiseWord(procedureName);
    }
    case 'allergy': {
      const allergen = String(data.allergen ?? '').trim();
      return allergen.length > 1 && !isNoiseWord(allergen);
    }
    case 'referral': {
      const specialty = String(data.specialty ?? '').trim();
      return specialty.length > 2 && !isNoiseWord(specialty);
    }
    default:
      return false;
  }
}

/**
 * Extract the primary human-readable identifier from suggestion data.
 * Used to set `actionLabel` on the Suggestion for display in action rows.
 */
export function getPrimaryIdentifier(
  category: ItemCategory,
  data: Record<string, unknown>,
): string | null {
  switch (category) {
    case 'medication':
      return nonEmpty(data.drugName);
    case 'diagnosis':
      return nonEmpty(data.description);
    case 'lab':
      return nonEmpty(data.testName);
    case 'imaging': {
      const studyType = nonEmpty(data.studyType);
      const bodyPart = nonEmpty(data.bodyPart);
      if (studyType && bodyPart) return `${studyType} ${bodyPart}`;
      return studyType || bodyPart;
    }
    case 'procedure':
      return nonEmpty(data.procedureName);
    case 'allergy':
      return nonEmpty(data.allergen);
    case 'referral':
      return nonEmpty(data.specialty);
    default:
      return null;
  }
}

/** Check whether a category uses narrative (textarea) editing */
export function isNarrativeCategory(category: ItemCategory): boolean {
  return NARRATIVE_SUGGESTION_CATEGORIES.has(category);
}

function nonEmpty(value: unknown): string | null {
  const s = String(value ?? '').trim();
  return s.length > 0 ? s : null;
}
