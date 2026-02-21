/**
 * Field configuration registry — maps categories to their field definitions.
 */

import type { ItemCategory } from '../../../types/chart-items';
import type { CategoryFieldDef } from './types';
import { RxFieldDef } from './RxFields';
import { LabFieldDef } from './LabFields';
import { DxFieldDef } from './DxFields';

export type { FieldConfig, CategoryFieldDef } from './types';
export { RxFieldDef } from './RxFields';
export { LabFieldDef } from './LabFields';
export { DxFieldDef } from './DxFields';

/**
 * Registry mapping structured categories to their field definitions.
 * Returns undefined for narrative/data-entry categories (no field rows).
 */
const FIELD_DEFS: Partial<Record<ItemCategory, CategoryFieldDef>> = {
  medication: RxFieldDef,
  lab: LabFieldDef,
  diagnosis: DxFieldDef,
  // Phase 3 will add: imaging, procedure, allergy, referral, instruction
};

export function getFieldDef(category: ItemCategory): CategoryFieldDef | undefined {
  return FIELD_DEFS[category];
}
