/**
 * RxFields — Medication field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing RxDetailForm option sets.
 * Provides: dosage, route, frequency, duration pill fields.
 * Quantity and refills are derived (auto-calc from frequency + duration).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import { calculateQuantity, generateSig } from '../form/rx-helpers';

// ============================================================================
// Option Sets (mirrored from RxDetailForm)
// ============================================================================

const ROUTE_OPTIONS: FieldOption[] = [
  { value: 'PO', label: 'PO' },
  { value: 'IM', label: 'IM' },
  { value: 'IV', label: 'IV' },
  { value: 'SC', label: 'SC' },
  { value: 'topical', label: 'Topical' },
  { value: 'Inhalation', label: 'Inhaled' },
  { value: 'intranasal', label: 'Nasal' },
  { value: 'rectal', label: 'Rectal' },
];

const FREQUENCY_OPTIONS: FieldOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'BID', label: 'BID' },
  { value: 'TID', label: 'TID' },
  { value: 'QID', label: 'QID' },
  { value: 'Q4-6H PRN', label: 'Q4-6H PRN' },
  { value: 'TID PRN', label: 'TID PRN' },
  { value: 'QHS', label: 'QHS' },
  { value: 'PRN', label: 'PRN' },
];

const DURATION_OPTIONS: FieldOption[] = [
  { value: '5 days', label: '5d' },
  { value: '7 days', label: '7d' },
  { value: '10 days', label: '10d' },
  { value: '14 days', label: '14d' },
  { value: '30 days', label: '30d' },
  { value: '90 days', label: '90d' },
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
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    dosage: String(item.data.dosage || ''),
    route: String(item.data.route || 'PO'),
    frequency: String(item.data.frequency || 'daily'),
    duration: String(item.data.duration || '7 days'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): Record<string, unknown> {
  const dosage = selections.dosage || String(item.data.dosage || '');
  const route = selections.route || String(item.data.route || 'PO');
  const frequency = selections.frequency || String(item.data.frequency || 'daily');
  const duration = selections.duration || String(item.data.duration || '7 days');

  const sig = generateSig(dosage, route, frequency);
  const quantity = calculateQuantity(frequency, duration) ?? Number(item.data.quantity) ?? 0;
  const refills = Number(item.data.refills) || 0;

  return {
    ...item.data,
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

export const RxFieldDef: CategoryFieldDef = { getFields, getDefaults, buildData };
