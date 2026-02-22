/**
 * Shared types for V2 field configurations.
 *
 * Each category's field config (RxFields, LabFields, DxFields) exports a
 * FieldConfig[] describing its editable fields, plus functions to extract
 * defaults and build chart data from selections.
 */

import type { FieldOption } from '../FieldOptionPills';
import type { QuickPickItem } from '../../../data/mock-quick-picks';

// ============================================================================
// Types
// ============================================================================

export interface FieldConfig {
  /** Unique key matching the data property name */
  key: string;
  /** Display label */
  label: string;
  /** Available pill options */
  options: FieldOption[];
  /** Allow custom "Other" entry */
  allowOther?: boolean;
}

/**
 * Category field definition bundle.
 * Each category exports one of these from its fields file.
 */
export interface CategoryFieldDef<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** Get field configs, optionally customized per item (e.g., dosage options) */
  getFields: (item: QuickPickItem) => FieldConfig[];
  /** Extract default selections from quick-pick data */
  getDefaults: (item: QuickPickItem) => Record<string, string>;
  /** Build chart item data from field selections + item baseline */
  buildData: (selections: Record<string, string>, item: QuickPickItem) => TData;
}
