/**
 * Shared suggestion utilities — display helpers and type bridges.
 *
 * Extracted from omni-add/SuggestionCard.tsx so that AI suggestion surfaces
 * (SuggestionActionRow, SuggestionEditPanel) can reuse the same logic.
 */

import type { ItemCategory, ItemIntent } from '../types/chart-items';
import type { QuickPickItem } from '../data/mock-quick-picks';
import type { Suggestion } from '../types/suggestions';

// ============================================================================
// Display helpers
// ============================================================================

/** Generate a display summary from quick-pick data by category */
export function buildItemSummary(item: QuickPickItem): string {
  const d = item.data;
  switch (item.category) {
    case 'medication':
      return [
        d.dosage,
        d.route,
        d.frequency,
        d.quantity ? `#${d.quantity}` : null,
        d.refills !== undefined ? `${d.refills}RF` : null,
      ].filter(Boolean).join(' ');

    case 'lab':
      return [
        d.priority !== 'routine' ? String(d.priority).toUpperCase() : null,
        d.collectionType,
        d.fastingRequired ? 'Fasting' : null,
      ].filter(Boolean).join(' \u00B7 ');

    case 'diagnosis':
      return [
        d.icdCode,
        d.type,
        d.clinicalStatus,
      ].filter(Boolean).join(' \u00B7 ');

    case 'imaging':
      return [
        d.studyType,
        d.bodyPart,
        d.priority !== 'routine' ? String(d.priority).toUpperCase() : null,
      ].filter(Boolean).join(' \u00B7 ');

    case 'procedure':
      return [
        d.cptCode ? `CPT ${d.cptCode}` : null,
        d.procedureStatus,
      ].filter(Boolean).join(' \u00B7 ');

    case 'allergy':
      return [
        d.allergenType,
        d.severity,
        d.reaction || null,
      ].filter(Boolean).join(' \u00B7 ');

    case 'referral':
      return [
        d.specialty,
        d.urgency !== 'routine' ? String(d.urgency) : null,
      ].filter(Boolean).join(' \u00B7 ');

    default:
      return item.label;
  }
}

/** Get short category badge label, with optional intent override (e.g., report→'Med', rule-out→'R/O') */
export function getCategoryBadge(category: ItemCategory, intent?: ItemIntent): string {
  if (category === 'medication') return intent === 'report' ? 'Med' : 'Rx';
  if (category === 'diagnosis') return intent === 'rule-out' ? 'R/O' : 'Dx';
  const badges: Partial<Record<ItemCategory, string>> = {
    lab: 'Lab',
    imaging: 'Img',
    procedure: 'Proc',
    allergy: 'Allergy',
    referral: 'Ref',
    assessment: 'Assess',
    hpi: 'HPI',
    plan: 'Plan',
    instruction: 'Instr',
  };
  return badges[category] ?? category;
}

// ============================================================================
// Suggestion → editable item bridge
// ============================================================================

/**
 * Convert a 'new-item' or 'care-gap-action' Suggestion into a QuickPickItem-shaped
 * object suitable for useFieldEditor.
 *
 * Returns null for suggestion types that don't have an actionable template
 * (dx-link, correction).
 */
export function suggestionToEditableItem(
  suggestion: Suggestion,
): QuickPickItem | null {
  const { content } = suggestion;

  if (content.type === 'new-item') {
    const template = content.itemTemplate;
    const label = suggestion.actionLabel || suggestion.displayText;
    return {
      id: `suggestion-${suggestion.id}`,
      label,
      chipLabel: label,
      category: content.category,
      data: (template.data ?? {}) as Record<string, unknown>,
    };
  }

  if (content.type === 'care-gap-action') {
    const template = content.actionTemplate;
    const category = (template.category ?? 'note') as ItemCategory;
    const label = suggestion.actionLabel || suggestion.displayText;
    return {
      id: `suggestion-${suggestion.id}`,
      label,
      chipLabel: label,
      category,
      data: (template.data ?? {}) as Record<string, unknown>,
    };
  }

  return null;
}

/**
 * Build a summary string for a suggestion, using the item template data
 * when available, falling back to displaySubtext.
 */
export function buildSuggestionSummary(suggestion: Suggestion): string {
  const editableItem = suggestionToEditableItem(suggestion);
  if (editableItem) {
    // Narrative categories: show truncated text preview
    const text = editableItem.data?.text;
    if (typeof text === 'string' && text.length > 0) {
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }
    const summary = buildItemSummary(editableItem);
    if (summary && summary !== editableItem.label) return summary;
  }
  return suggestion.displaySubtext ?? '';
}
