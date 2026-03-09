/**
 * AssessmentFields — Assessment field configuration for V2 omni-input
 *
 * Provides: method pill field. Assessment type and scale are read-only
 * (determined by the quick-pick item or protocol orderable).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { AssessmentItem } from '../../../types/chart-items';

// ============================================================================
// Option Sets
// ============================================================================

const METHOD_OPTIONS: FieldOption[] = [
  { value: 'patient-reported', label: 'Patient Reported' },
  { value: 'provider-assessed', label: 'Provider Assessed' },
  { value: 'calculated', label: 'Calculated' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(_item: QuickPickItem): FieldConfig[] {
  return [
    {
      key: 'method',
      label: 'Method',
      options: METHOD_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    method: String(item.data.method || 'patient-reported'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): AssessmentItem['data'] {
  return {
    ...(item.data as AssessmentItem['data']),
    method: (selections.method || 'patient-reported') as AssessmentItem['data']['method'],
  };
}

// ============================================================================
// Export
// ============================================================================

export const AssessmentFieldDef: CategoryFieldDef<AssessmentItem['data']> = { getFields, getDefaults, buildData };
