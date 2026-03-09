/**
 * AssessmentFields — Assessment field configuration for V2 omni-input
 *
 * Provides: value (score), method, and bodyRegion (Pain Scale only).
 * Assessment type and scale are read-only (determined by the quick-pick item
 * or protocol orderable). The value field is the critical entry — it captures
 * the numeric score within the item's scaleRange.
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

function getFields(item: QuickPickItem): FieldConfig[] {
  const scaleRange = String(item.data.scaleRange || '0-10');
  const fields: FieldConfig[] = [
    {
      key: 'value',
      label: `Score (${scaleRange})`,
      options: [],
      allowOther: true,
    },
    {
      key: 'method',
      label: 'Method',
      options: METHOD_OPTIONS,
    },
  ];

  // Pain Scale (NRS) gets a bodyRegion field
  if (item.data.assessmentCode === 'NRS') {
    fields.push({
      key: 'bodyRegion',
      label: 'Body Region',
      options: [],
      allowOther: true,
    });
  }

  return fields;
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  const defaults: Record<string, string> = {
    value: item.data.value != null ? String(item.data.value) : '',
    method: String(item.data.method || 'patient-reported'),
  };
  if (item.data.assessmentCode === 'NRS') {
    defaults.bodyRegion = String(item.data.bodyRegion || '');
  }
  return defaults;
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): AssessmentItem['data'] {
  const rawValue = selections.value?.trim();
  const numericValue = rawValue ? Number(rawValue) : null;

  return {
    ...(item.data as AssessmentItem['data']),
    value: Number.isFinite(numericValue) ? numericValue : null,
    method: (selections.method || 'patient-reported') as AssessmentItem['data']['method'],
    ...(selections.bodyRegion !== undefined ? { bodyRegion: selections.bodyRegion || undefined } : {}),
  };
}

// ============================================================================
// Export
// ============================================================================

export const AssessmentFieldDef: CategoryFieldDef<AssessmentItem['data']> = { getFields, getDefaults, buildData };
