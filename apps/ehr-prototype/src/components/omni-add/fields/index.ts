/**
 * Field configuration registry — maps categories to their field definitions.
 */

import type { ItemCategory } from '../../../types/chart-items';
import type { CategoryFieldDef } from './types';
import { RxFieldDef } from './RxFields';
import { LabFieldDef } from './LabFields';
import { DxFieldDef } from './DxFields';
import { ImagingFieldDef } from './ImagingFields';
import { ProcedureFieldDef } from './ProcedureFields';
import { AllergyFieldDef } from './AllergyFields';
import { ReferralFieldDef } from './ReferralFields';

export type { FieldConfig, CategoryFieldDef } from './types';
export { RxFieldDef } from './RxFields';
export { LabFieldDef } from './LabFields';
export { DxFieldDef } from './DxFields';
export { ImagingFieldDef } from './ImagingFields';
export { ProcedureFieldDef } from './ProcedureFields';
export { AllergyFieldDef } from './AllergyFields';
export { ReferralFieldDef } from './ReferralFields';

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

export function getFieldDef(category: ItemCategory): CategoryFieldDef | undefined {
  return FIELD_DEFS[category];
}
