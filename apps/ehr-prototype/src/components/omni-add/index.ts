/**
 * OmniAdd Components
 *
 * Unified omni-input charting module with inline pills, suggestion cards,
 * and adaptive detail area. Touch and keyboard are first-class on the same surface.
 */

// Main orchestrator (V2 — unified omni-input)
export { OmniAddBarV2, type OmniAddBarV2Props } from './OmniAddBarV2';

// V2 sub-components
export { OmniInput, type OmniInputProps } from './OmniInput';
export { DetailArea, type DetailAreaProps } from './DetailArea';
export { CategoryPills } from './CategoryPills';
export { ItemPills } from './ItemPills';
export { SuggestionCard, type SuggestionCardProps } from './SuggestionCard';
export { FieldRow, type FieldRowProps } from './FieldRow';
export { FieldOptionPills, type FieldOptionPillsProps, type FieldOption } from './FieldOptionPills';

// Shared sub-components (used by V2)
export { NarrativeInput, type NarrativeInputProps } from './NarrativeInput';
export { VitalsInput, type VitalsInputProps, type VitalsData } from './VitalsInput';

// State machines
export {
  omniInputReducer,
  OMNI_INPUT_INITIAL,
  getDepth,
  getActiveCategory,
  getActiveVariant,
  makeCategoryPill,
  makeItemPill,
  type OmniInputState,
  type OmniInputAction,
  type Pill,
} from './omni-input-machine';

export {
  CATEGORIES,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  getCategoryMeta,
  getCategoryVariant,
  findCategoryByShortcut,
  findCategoryByPrefix,
  type CategoryVariant,
  type CategoryMeta,
} from './omni-add-machine';

// Field definitions
export { getFieldDef } from './fields';
export type { FieldConfig, CategoryFieldDef } from './fields';
