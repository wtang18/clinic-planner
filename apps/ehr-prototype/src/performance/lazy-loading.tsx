/**
 * Lazy Loading Utilities
 *
 * Lazy-loaded screen components and preloading utilities.
 */

import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/foundations';

// ============================================================================
// Lazy Screen Components
// ============================================================================

/**
 * Lazy-loaded CaptureView screen.
 */
export const LazyCaptureView = lazy(() =>
  import('../screens/CaptureView').then((m) => ({
    default: m.CaptureView,
  }))
);

/**
 * Lazy-loaded ProcessView screen.
 */
export const LazyProcessView = lazy(() =>
  import('../screens/ProcessView').then((m) => ({
    default: m.ProcessView,
  }))
);

/**
 * Lazy-loaded ReviewView screen.
 */
export const LazyReviewView = lazy(() =>
  import('../screens/ReviewView').then((m) => ({
    default: m.ReviewView,
  }))
);

/**
 * Lazy-loaded PatientOverview screen.
 */
export const LazyPatientOverview = lazy(() =>
  import('../screens/PatientOverview').then((m) => ({
    default: m.PatientOverview,
  }))
);

// ============================================================================
// Loading Fallback
// ============================================================================

/**
 * Loading fallback component for screen transitions.
 */
export const ScreenLoadingFallback: React.FC = () => (
  <View style={loadingStyles.container} testID="screen-loading">
    <ActivityIndicator size="large" color={colors.fg.accent.primary} />
  </View>
);

ScreenLoadingFallback.displayName = 'ScreenLoadingFallback';

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.neutral.min,
  },
});

// ============================================================================
// Screen Wrapper with Suspense
// ============================================================================

interface LazyScreenProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that provides Suspense boundary for lazy screens.
 */
export const LazyScreen: React.FC<LazyScreenProps> = ({
  children,
  fallback = <ScreenLoadingFallback />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

LazyScreen.displayName = 'LazyScreen';

// ============================================================================
// Preload Utilities
// ============================================================================

type ScreenName = 'capture' | 'process' | 'review' | 'patientOverview';

/**
 * Preload a screen to warm the cache before navigation.
 * Call this when you anticipate the user will navigate soon.
 */
export function preloadScreen(screen: ScreenName): void {
  switch (screen) {
    case 'capture':
      import('../screens/CaptureView');
      break;
    case 'process':
      import('../screens/ProcessView');
      break;
    case 'review':
      import('../screens/ReviewView');
      break;
    case 'patientOverview':
      import('../screens/PatientOverview');
      break;
  }
}

/**
 * Preload multiple screens at once.
 */
export function preloadScreens(screens: ScreenName[]): void {
  screens.forEach(preloadScreen);
}

/**
 * Preload all encounter-related screens.
 */
export function preloadEncounterScreens(): void {
  preloadScreens(['capture', 'process', 'review']);
}
