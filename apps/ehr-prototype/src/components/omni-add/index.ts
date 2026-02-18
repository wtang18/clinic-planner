/**
 * OmniAdd Components
 *
 * Tree-based OmniAdd charting module with dual input modes (touch + keyboard).
 */

// Main orchestrator
export { OmniAddBar, type OmniAddBarProps } from './OmniAddBar';

// Sub-components
export { CategorySelector, type CategorySelectorProps } from './CategorySelector';
export { QuickPickChips, type QuickPickChipsProps } from './QuickPickChips';
export { QuickAddInput, type QuickAddInputProps } from './QuickAddInput';
export { ItemDetailForm, type ItemDetailFormProps } from './ItemDetailForm';
export { NarrativeInput, type NarrativeInputProps } from './NarrativeInput';
export { VitalsInput, type VitalsInputProps, type VitalsData } from './VitalsInput';
export { OmniAddBreadcrumb, type OmniAddBreadcrumbProps } from './OmniAddBreadcrumb';
export { CommandPalette, type CommandPaletteProps } from './CommandPalette';

// State machine
export {
  omniAddReducer,
  INITIAL_STATE,
  CATEGORIES,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  getCategoryMeta,
  getCategoryVariant,
  findCategoryByShortcut,
  findCategoryByPrefix,
  canSubmit,
  getBreadcrumbPath,
  isAtRoot,
  canNavigateBack,
  type OmniAddState,
  type OmniAddAction,
  type OmniAddStep,
  type CategoryVariant,
  type CategoryMeta,
  type BreadcrumbSegment,
  type SelectedItem,
} from './omni-add-machine';
