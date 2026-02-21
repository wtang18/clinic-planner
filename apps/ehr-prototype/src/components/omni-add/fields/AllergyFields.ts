/**
 * AllergyFields — Allergy field configuration for V2 omni-input
 *
 * Extracts field definitions from the existing AllergyDetailForm.
 * Provides: allergen type, severity, verification status pill fields.
 * Allergen name is read-only (displayed in the suggestion card header).
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from './types';

// ============================================================================
// Option Sets (mirrored from AllergyDetailForm)
// ============================================================================

const TYPE_OPTIONS: FieldOption[] = [
  { value: 'drug', label: 'Drug' },
  { value: 'food', label: 'Food' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS: FieldOption[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'unknown', label: 'Unknown' },
];

const VERIFICATION_OPTIONS: FieldOption[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'refuted', label: 'Refuted' },
];

// ============================================================================
// Field Config
// ============================================================================

function getFields(_item: QuickPickItem): FieldConfig[] {
  return [
    {
      key: 'allergenType',
      label: 'Type',
      options: TYPE_OPTIONS,
    },
    {
      key: 'severity',
      label: 'Severity',
      options: SEVERITY_OPTIONS,
    },
    {
      key: 'verificationStatus',
      label: 'Verification',
      options: VERIFICATION_OPTIONS,
    },
  ];
}

function getDefaults(item: QuickPickItem): Record<string, string> {
  return {
    allergenType: String(item.data.allergenType || 'drug'),
    severity: String(item.data.severity || 'unknown'),
    verificationStatus: String(item.data.verificationStatus || 'unverified'),
  };
}

function buildData(
  selections: Record<string, string>,
  item: QuickPickItem,
): Record<string, unknown> {
  return {
    ...item.data,
    allergenType: selections.allergenType || String(item.data.allergenType || 'drug'),
    severity: selections.severity || String(item.data.severity || 'unknown'),
    verificationStatus: selections.verificationStatus || String(item.data.verificationStatus || 'unverified'),
  };
}

// ============================================================================
// Export
// ============================================================================

export const AllergyFieldDef: CategoryFieldDef = { getFields, getDefaults, buildData };
