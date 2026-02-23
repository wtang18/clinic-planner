/**
 * Shared suggestion utilities — category labels and type filters.
 */

import type { Suggestion } from '../types/suggestions';
import type { ItemIntent } from '../types/chart-items';

/** Action types shown in palette and pane suggestion sections */
export const SUGGESTION_ACTION_TYPES = ['chart-item', 'care-gap-action'] as const;

/** Plain text category label: "Add Rx", "Add Dx", "Add Lab", etc. */
export function getSuggestionCategoryLabel(suggestion: Suggestion): string {
  if (suggestion.content.type === 'new-item') {
    const intent = (suggestion.content.itemTemplate?.intent as ItemIntent | undefined);
    const cat = suggestion.content.category;

    // Intent-specific overrides
    if (cat === 'medication' && intent === 'report') return 'Report Med';
    if (cat === 'diagnosis' && intent === 'rule-out') return 'R/O Dx';

    const map: Record<string, string> = {
      medication: 'Add Rx',
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
    return map[cat] || 'Add';
  }
  if (suggestion.content.type === 'dx-link') return 'Link Dx';
  if (suggestion.content.type === 'correction') return 'Fix';
  if (suggestion.content.type === 'care-gap-action') return 'Care Gap';
  return 'Action';
}
