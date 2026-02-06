/**
 * Demo Mode
 *
 * Controller, overlay, presets, context, and hooks for demo mode presentations.
 */

// Controller
export { DemoController, createDemoController } from './DemoController';
export type {
  DemoState,
  DemoEvent,
  DemoAnnotation,
  DemoControllerConfig,
  Scenario,
} from './DemoController';

// Overlay
export { DemoOverlay } from './DemoOverlay';

// Controller hook
export { useDemoController, createStandaloneDemoController } from './hooks/useDemoController';

// Presets
export {
  DEMO_PRESETS,
  getPresetById,
  getPresetsByCategory,
  getPresetCategories,
  DEFAULT_FEATURES,
} from './presets';
export type { DemoPreset, DemoFeatures } from './presets';

// Context
export {
  DemoProvider,
  useDemoMode,
  useFeatureEnabled,
  useIsDemoMode,
} from './DemoContext';

// Banner
export { DemoModeBanner } from './DemoModeBanner';
