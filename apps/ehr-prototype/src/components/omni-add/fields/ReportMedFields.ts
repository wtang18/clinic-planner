/**
 * ReportMedFields — Lighter field set for patient-reported medications.
 *
 * What: 5 fields (dosage, route, frequency, reportedBy, verificationStatus).
 * Why: Reported meds don't need prescriptionType, duration, refills, or quantity.
 * When: Selected via intent-aware field resolution (`getFieldDef('medication', 'report')`).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';
import type { MedicationItem } from '../../../types/chart-items';
import { ROUTE_OPTIONS, FREQUENCY_OPTIONS } from './shared-options';

// ============================================================================
// Report-Specific Option Sets
// ============================================================================

const REPORTED_BY_OPTIONS: FieldOption[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'external-record', label: 'External Record' },
];

const VERIFICATION_STATUS_OPTIONS: FieldOption[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'verified', label: 'Verified' },
  { value: 'discrepancy', label: 'Discrepancy' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(item: QuickPickItem): FieldConfig[] {
  const dosage = String(item.data.dosage || '');
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
      key: 'reportedBy',
      label: 'Reported By',
      options: REPORTED_BY_OPTIONS,
    },
    {
      key: 'verificationStatus',
      label: 'Verification',
      options: VERIFICATION_STATUS_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    dosage: String(item.data.dosage || ''),
    route: String(item.data.route || 'PO'),
    frequency: String(item.data.frequency || 'daily'),
    reportedBy: String(item.data.reportedBy || 'patient'),
    verificationStatus: String(item.data.verificationStatus || 'unverified'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): MedicationItem['data'] {
  const dosage = selections.dosage || String(item.data.dosage || '');
  const route = selections.route || String(item.data.route || 'PO');
  const frequency = selections.frequency || String(item.data.frequency || 'daily');
  const reportedBy = (selections.reportedBy || String(item.data.reportedBy || 'patient')) as 'patient' | 'caregiver' | 'external-record';
  const verificationStatus = (selections.verificationStatus || String(item.data.verificationStatus || 'unverified')) as 'unverified' | 'verified' | 'discrepancy';

  return {
    ...(item.data as MedicationItem['data']),
    prescriptionType: 'new' as const,
    dosage,
    route,
    frequency,
    isControlled: false,
    reportedBy,
    verificationStatus,
  };
}

// ============================================================================
// Export
// ============================================================================

export const ReportMedFieldDef: CategoryFieldDef<MedicationItem['data']> = { getFields, getDefaults, buildData };
