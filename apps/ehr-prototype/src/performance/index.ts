/**
 * Performance Utilities
 *
 * Memoization, virtualization, lazy loading, and debounce utilities.
 */

export {
  createMemoizedSelector,
  createDerivedSelector,
  shallowArrayEqual,
  shallowObjectEqual,
  deepEqual,
} from './memoization';

export {
  VirtualizedItemList,
  VirtualizedSectionList,
  useOptimizedList,
} from './virtualization';

export {
  LazyCaptureView,
  LazyProcessView,
  LazyReviewView,
  LazyPatientOverview,
  ScreenLoadingFallback,
  LazyScreen,
  preloadScreen,
  preloadScreens,
  preloadEncounterScreens,
} from './lazy-loading';

export {
  debounce,
  debounceLeading,
  debounceCancelable,
  throttle,
  throttleWithTrailing,
  rafThrottle,
  useDebouncedCallback,
  useDebouncedValue,
  useThrottledCallback,
  useRafThrottledCallback,
} from './debounce';
