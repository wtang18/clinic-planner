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
import type { ImagingItem } from '../../../types/chart-items';

// ============================================================================
// Option Sets (mirrored from ImagingDetailForm)
// ============================================================================

const PRIORITY_OPTIONS: FieldOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
];

const LATERALITY_OPTIONS: FieldOption[] = [
  { value: 'N/A', label: 'N/A' },
  { value: 'Left', label: 'Left' },
  { value: 'Right', label: 'Right' },
  { value: 'Bilateral', label: 'Bilateral' },
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
    {
      key: 'laterality',
      label: 'Laterality',
      options: LATERALITY_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    priority: String(item.data.priority || 'routine'),
    laterality: String(item.data.laterality || 'N/A'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): ImagingItem['data'] {
  return {
    ...(item.data as ImagingItem['data']),
    priority: (selections.priority || String(item.data.priority || 'routine')) as ImagingItem['data']['priority'],
    laterality: (selections.laterality || String(item.data.laterality || 'N/A')) as ImagingItem['data']['laterality'],
    orderStatus: 'draft',
  };
}

// ============================================================================
// Export
// ============================================================================

export const ImagingFieldDef: CategoryFieldDef<ImagingItem['data']> = { getFields, getDefaults, buildData };
