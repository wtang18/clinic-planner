/**
 * RuleOutDxFields — Rule-out diagnosis field configuration for V2 omni-input
 *
 * What: 3 fields (ranking, type, certainty) with defaults appropriate for rule-out.
 * Why: Rule-out diagnoses need a certainty level (suspected/probable/possible)
 *   instead of clinical status — the diagnosis hasn't been confirmed yet.
 * When: Selected via intent-aware field resolution (`getFieldDef('diagnosis', 'rule-out')`).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { DiagnosisItem } from '../../../types/chart-items';

// ============================================================================
// Option Sets
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

const CERTAINTY_OPTIONS: FieldOption[] = [
  { value: 'suspected', label: 'Suspected' },
  { value: 'probable', label: 'Probable' },
  { value: 'possible', label: 'Possible' },
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
      key: 'certainty',
      label: 'Certainty',
      options: CERTAINTY_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    ranking: String(item.data.ranking || 'primary'),
    type: String(item.data.type || 'encounter'),
    certainty: String(item.data.certainty || 'suspected'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): DiagnosisItem['data'] {
  const ranking = selections.ranking || String(item.data.ranking || 'primary');
  const type = selections.type || String(item.data.type || 'encounter');
  const certainty = selections.certainty || 'suspected';

  return {
    ...(item.data as DiagnosisItem['data']),
    ranking: ranking as DiagnosisItem['data']['ranking'],
    type: type as DiagnosisItem['data']['type'],
    clinicalStatus: 'active',
    certainty: certainty as 'suspected' | 'probable' | 'possible',
    onsetDate: new Date(),
  };
}

// ============================================================================
// Export
// ============================================================================

export const RuleOutDxFieldDef: CategoryFieldDef<DiagnosisItem['data']> = { getFields, getDefaults, buildData };
