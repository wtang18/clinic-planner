/**
 * LabFields — Lab order field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing LabDetailForm option sets.
 * Provides: priority, collection type pill fields.
 * Reference lab is conditional (send-out only) — handled in buildData.
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';

// ============================================================================
// Option Sets (mirrored from LabDetailForm)
// ============================================================================

const PRIORITY_OPTIONS: FieldOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
];

const COLLECTION_OPTIONS: FieldOption[] = [
  { value: 'in-house', label: 'In-House' },
  { value: 'send-out', label: 'Send Out' },
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
      key: 'collectionType',
      label: 'Collection',
      options: COLLECTION_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    priority: String(item.data.priority || 'routine'),
    collectionType: String(item.data.collectionType || 'in-house'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): Record<string, unknown> {
  const priority = selections.priority || String(item.data.priority || 'routine');
  const collectionType = selections.collectionType || String(item.data.collectionType || 'in-house');

  return {
    ...item.data,
    priority,
    collectionType,
    orderStatus: 'draft',
  };
}

// ============================================================================
// Export
// ============================================================================

export const LabFieldDef: CategoryFieldDef = { getFields, getDefaults, buildData };
