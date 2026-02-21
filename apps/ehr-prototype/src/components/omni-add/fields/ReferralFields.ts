/**
 * ReferralFields — Referral field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing ReferralDetailForm.
 * Provides: urgency pill field. Specialty is read-only (displayed in
 * the suggestion card header).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';

// ============================================================================
// Option Sets (mirrored from ReferralDetailForm)
// ============================================================================

const URGENCY_OPTIONS: FieldOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergent', label: 'Emergent' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(_item: QuickPickItem): FieldConfig[] {
  return [
    {
      key: 'urgency',
      label: 'Urgency',
      options: URGENCY_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    urgency: String(item.data.urgency || 'routine'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): Record<string, unknown> {
  return {
    ...item.data,
    urgency: selections.urgency || String(item.data.urgency || 'routine'),
    referralStatus: 'draft',
  };
}

// ============================================================================
// Export
// ============================================================================

export const ReferralFieldDef: CategoryFieldDef = { getFields, getDefaults, buildData };
