/**
 * Elevation Foundations
 *
 * Platform-specific shadow styles from @carbon-health/design-tokens.
 * Uses iOS shadow properties on iOS, elevation on Android.
 *
 * Scale: xs, sm, md, lg, xl, 2xl, none
 */

import { Platform, ViewStyle } from 'react-native';

// Elevation style definitions (platform-specific)
const elevationStyles = {
  xs: {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
    android: { elevation: 1 },
  },
  sm: {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
    android: { elevation: 3 },
  },
  md: {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8 },
    android: { elevation: 6 },
  },
  lg: {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 12 },
    android: { elevation: 10 },
  },
  xl: {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 16 },
    android: { elevation: 16 },
  },
  '2xl': {
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 24 },
    android: { elevation: 24 },
  },
  none: {
    ios: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
    android: { elevation: 0 },
  },
} as const;

/**
 * Platform-resolved elevation styles.
 * Use directly: `<View style={[styles.card, elevation.md]} />`
 */
export const elevation: Record<keyof typeof elevationStyles, ViewStyle> = Object.fromEntries(
  Object.entries(elevationStyles).map(([key, value]) => [
    key,
    Platform.select(value as Record<string, ViewStyle>) as ViewStyle,
  ])
) as Record<keyof typeof elevationStyles, ViewStyle>;

export { elevationStyles };
export type ElevationLevel = keyof typeof elevationStyles;
