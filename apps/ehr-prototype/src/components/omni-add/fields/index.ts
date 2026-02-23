/**
 * Field configuration registry — maps categories to their field definitions.
 */

import type { ItemCategory, ItemIntent } from '../../../types/chart-items';
import type { CategoryFieldDef } from './types';
import { RxFieldDef } from './RxFields';
import { LabFieldDef } from './LabFields';
import { DxFieldDef } from './DxFields';
import { ImagingFieldDef } from './ImagingFields';
import { ProcedureFieldDef } from './ProcedureFields';
import { AllergyFieldDef } from './AllergyFields';
import { ReferralFieldDef } from './ReferralFields';
import { ReportMedFieldDef } from './ReportMedFields';

export type { FieldConfig, CategoryFieldDef } from './types';
export { RxFieldDef } from './RxFields';
export { LabFieldDef } from './LabFields';
export { DxFieldDef } from './DxFields';
export { ImagingFieldDef } from './ImagingFields';
export { ProcedureFieldDef } from './ProcedureFields';
export { AllergyFieldDef } from './AllergyFields';
export { ReferralFieldDef } from './ReferralFields';
export { ReportMedFieldDef } from './ReportMedFields';

/**
 * Registry mapping structured categories to their field definitions.
 * Returns undefined for narrative/data-entry categories (no field rows).
 */
const FIELD_DEFS: Partial<Record<ItemCategory, CategoryFieldDef>> = {
  medication: RxFieldDef,
  lab: LabFieldDef,
  diagnosis: DxFieldDef,
  imaging: ImagingFieldDef,
  procedure: ProcedureFieldDef,
  allergy: AllergyFieldDef,
  referral: ReferralFieldDef,
};

/**
 * Intent-specific field definition overrides.
 * Key format: "category:intent" → CategoryFieldDef.
 */
const INTENT_FIELD_DEFS: Record<string, CategoryFieldDef> = {
  'medication:report': ReportMedFieldDef,
};

/**
 * Get the field definition for a category, with optional intent override.
 * Returns undefined for narrative/data-entry categories (no field rows).
 */
export function getFieldDef(category: ItemCategory, intent?: ItemIntent): CategoryFieldDef | undefined {
  if (intent) {
    const override = INTENT_FIELD_DEFS[`${category}:${intent}`];
    if (override) return override;
  }
  return FIELD_DEFS[category];
}
