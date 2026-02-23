/**
 * Shared suggestion utilities — category labels and type filters.
 */

import type { Suggestion } from '../types/suggestions';

/** Action types shown in palette and pane suggestion sections */
export const SUGGESTION_ACTION_TYPES = ['chart-item', 'care-gap-action'] as const;

/** Plain text category label: "Add Rx", "Add Dx", "Add Lab", etc. */
export function getSuggestionCategoryLabel(suggestion: Suggestion): string {
  if (suggestion.content.type === 'new-item') {
    const map: Record<string, string> = {
      medication: 'Add Med',
      diagnosis: 'Add Dx',
      lab: 'Add Lab',
      imaging: 'Add Imaging',
      procedure: 'Add Procedure',
      referral: 'Add Referral',
      vitals: 'Add Vitals',
      'chief-complaint': 'Add CC',
      hpi: 'Add HPI',
      ros: 'Add ROS',
      'physical-exam': 'Add PE',
      allergy: 'Add Allergy',
      plan: 'Add Plan',
      instruction: 'Add Instruction',
      note: 'Add Note',
    };
    return map[suggestion.content.category] || 'Add';
  }
  if (suggestion.content.type === 'dx-link') return 'Link Dx';
  if (suggestion.content.type === 'correction') return 'Fix';
  if (suggestion.content.type === 'care-gap-action') return 'Care Gap';
  return 'Action';
}
