/**
 * DxFields — Diagnosis field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing DxDetailForm option sets.
 * Provides: designation (ranking), type, clinical status pill fields.
 * ICD-10 code is read-only — displayed in the suggestion card, not editable.
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { DiagnosisItem } from '../../../types/chart-items';

// ============================================================================
// Option Sets (mirrored from DxDetailForm)
// ============================================================================

const DESIGNATION_OPTIONS: FieldOption[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
];

const TYPE_OPTIONS: FieldOption[] = [
  { value: 'encounter', label: 'Encounter' },
  { value: 'chronic', label: 'Chronic' },
  { value: 'historical', label: 'Historical' },
];

const CLINICAL_STATUS_OPTIONS: FieldOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'inactive', label: 'Inactive' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(_item: QuickPickItem): FieldConfig[] {
  return [
    {
      key: 'ranking',
      label: 'Designation',
      options: DESIGNATION_OPTIONS,
    },
    {
      key: 'type',
      label: 'Type',
      options: TYPE_OPTIONS,
    },
    {
      key: 'clinicalStatus',
      label: 'Status',
      options: CLINICAL_STATUS_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    ranking: String(item.data.ranking || 'primary'),
    type: String(item.data.type || 'encounter'),
    clinicalStatus: String(item.data.clinicalStatus || 'active'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): DiagnosisItem['data'] {
  const ranking = selections.ranking || String(item.data.ranking || 'primary');
  const type = selections.type || String(item.data.type || 'encounter');
  const clinicalStatus = selections.clinicalStatus || String(item.data.clinicalStatus || 'active');

  return {
    ...(item.data as DiagnosisItem['data']),
    ranking: ranking as DiagnosisItem['data']['ranking'],
    type: type as DiagnosisItem['data']['type'],
    clinicalStatus: clinicalStatus as DiagnosisItem['data']['clinicalStatus'],
    onsetDate: new Date(),
  };
}

// ============================================================================
// Export
// ============================================================================

export const DxFieldDef: CategoryFieldDef<DiagnosisItem['data']> = { getFields, getDefaults, buildData };
