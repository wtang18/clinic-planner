/**
 * Tour System
 *
 * Guided tours for onboarding and feature discovery.
 */

export { TourSystem, tourSystem } from './TourSystem';
export type { Tour, TourStep, TourState } from './TourSystem';
export { TourOverlay } from './TourOverlay';
export {
  TourTargetProvider,
  useTourTargets,
  useTourTarget,
  useTourTargetOptional,
} from './TourTargetRegistry';
export {
  ALL_TOURS,
  CAPTURE_BASICS_TOUR,
  AI_FEATURES_TOUR,
  TASK_WORKFLOW_TOUR,
  REVIEW_MODE_TOUR,
} from './tours/onboarding';
