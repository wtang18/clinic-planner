/**
 * RxFields — Medication field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing RxDetailForm option sets.
 * Provides: prescriptionType, dosage, route, frequency, duration pill fields.
 * Quantity and refills are derived (auto-calc from frequency + duration).
 *
 * Note: For reported meds (patient says they take something), the extractor
 * sets `reportedBy: 'patient'` on the suggestion data. The edit panel still
 * shows the same Rx fields — intent-adaptive field shapes (hiding duration/
 * refills for reported meds) are deferred to FUTURE_CONSIDERATIONS.md.
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { MedicationItem } from '../../../types/chart-items';
import { calculateQuantity, generateSig } from '../form/rx-helpers';
import { ROUTE_OPTIONS, FREQUENCY_OPTIONS } from './shared-options';

// ============================================================================
// Option Sets (mirrored from RxDetailForm)
// ============================================================================

const PRESCRIPTION_TYPE_OPTIONS: FieldOption[] = [
  { value: 'new', label: 'New' },
  { value: 'refill', label: 'Refill' },
  { value: 'change', label: 'Change' },
  { value: 'discontinue', label: 'D/C' },
];

const DURATION_OPTIONS: FieldOption[] = [
  { value: '5 days', label: '5d' },
  { value: '7 days', label: '7d' },
  { value: '10 days', label: '10d' },
  { value: '14 days', label: '14d' },
  { value: '30 days', label: '30d' },
  { value: '90 days', label: '90d' },
];

const REFILL_OPTIONS: FieldOption[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(item: QuickPickItem): FieldConfig[] {
  const dosage = String(item.data.dosage || '');

  // Build dosage options from item default (always first) + nearby strengths
  const dosageOptions: FieldOption[] = dosage
    ? [{ value: dosage, label: dosage }]
    : [];

  return [
    {
      key: 'prescriptionType',
      label: 'Type',
      options: PRESCRIPTION_TYPE_OPTIONS,
    },
    {
      key: 'dosage',
      label: 'Dosage',
      options: dosageOptions,
      allowOther: true,
    },
    {
      key: 'route',
      label: 'Route',
      options: ROUTE_OPTIONS,
    },
    {
      key: 'frequency',
      label: 'Frequency',
      options: FREQUENCY_OPTIONS,
      allowOther: true,
    },
    {
      key: 'duration',
      label: 'Duration',
      options: DURATION_OPTIONS,
      allowOther: true,
    },
    {
      key: 'refills',
      label: 'Refills',
      options: REFILL_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    prescriptionType: String(item.data.prescriptionType || 'new'),
    dosage: String(item.data.dosage || ''),
    route: String(item.data.route || 'PO'),
    frequency: String(item.data.frequency || 'daily'),
    duration: String(item.data.duration || '7 days'),
    refills: String(item.data.refills ?? '0'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): MedicationItem['data'] {
  const dosage = selections.dosage || String(item.data.dosage || '');
  const route = selections.route || String(item.data.route || 'PO');
  const frequency = selections.frequency || String(item.data.frequency || 'daily');
  const duration = selections.duration || String(item.data.duration || '7 days');

  const sig = generateSig(dosage, route, frequency);
  const quantity = calculateQuantity(frequency, duration) ?? Number(item.data.quantity) ?? 0;
  const refills = Number(selections.refills ?? item.data.refills) || 0;

  const prescriptionType = (selections.prescriptionType || String(item.data.prescriptionType || 'new')) as MedicationItem['data']['prescriptionType'];

  return {
    ...(item.data as MedicationItem['data']),
    prescriptionType,
    dosage,
    route,
    frequency,
    duration,
    sig,
    quantity,
    refills,
    daw: false,
  };
}

// ============================================================================
// Export
// ============================================================================

export const RxFieldDef: CategoryFieldDef<MedicationItem['data']> = { getFields, getDefaults, buildData };
