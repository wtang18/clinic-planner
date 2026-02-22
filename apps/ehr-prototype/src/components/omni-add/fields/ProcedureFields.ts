/**
 * ProcedureFields — Procedure field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing ProcedureDetailForm.
 * Provides: status pill field. Procedure name and CPT code are read-only
 * (displayed in the suggestion card header).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { ProcedureItem } from '../../../types/chart-items';

// ============================================================================
// Option Sets (mirrored from ProcedureDetailForm)
// ============================================================================

const STATUS_OPTIONS: FieldOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
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
      key: 'procedureStatus',
      label: 'Status',
      options: STATUS_OPTIONS,
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
    procedureStatus: String(item.data.procedureStatus || 'planned'),
    laterality: String(item.data.laterality || 'N/A'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): ProcedureItem['data'] {
  return {
    ...(item.data as ProcedureItem['data']),
    procedureStatus: (selections.procedureStatus || String(item.data.procedureStatus || 'planned')) as ProcedureItem['data']['procedureStatus'],
    laterality: (selections.laterality || String(item.data.laterality || 'N/A')) as ProcedureItem['data']['laterality'],
  };
}

// ============================================================================
// Export
// ============================================================================

export const ProcedureFieldDef: CategoryFieldDef<ProcedureItem['data']> = { getFields, getDefaults, buildData };
