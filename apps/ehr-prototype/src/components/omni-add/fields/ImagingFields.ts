/**
 * ImagingFields — Imaging order field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing ImagingDetailForm.
 * Provides: priority pill field. Study type and body part are read-only
 * (displayed in the suggestion card header).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';

// ============================================================================
// Option Sets (mirrored from ImagingDetailForm)
// ============================================================================

const PRIORITY_OPTIONS: FieldOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(_item: QuickPickItem): FieldConfig[] {
  return [
    {
      key: 'priority',
      label: 'Priority',
      options: PRIORITY_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    priority: String(item.data.priority || 'routine'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): Record<string, unknown> {
  return {
    ...item.data,
    priority: selections.priority || String(item.data.priority || 'routine'),
    orderStatus: 'draft',
  };
}

// ============================================================================
// Export
// ============================================================================

export const ImagingFieldDef: CategoryFieldDef = { getFields, getDefaults, buildData };
