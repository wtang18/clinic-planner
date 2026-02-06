/**
 * Global Styles
 *
 * Common StyleSheet patterns and layout helpers.
 * Token values come from ./foundations (canonical @carbon-health/design-tokens).
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from './foundations/colors';
import { spaceAround, borderRadius } from './foundations/spacing';
import { elevation } from './foundations/elevation';

// ============================================================================
// Global CSS (Web Only)
// ============================================================================

/**
 * Global CSS reset for web platform.
 * Ensures Inter font is applied to all elements.
 */
export const globalStyles = `
  /* Force Inter font on all elements */
  *, *::before, *::after {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    box-sizing: border-box;
  }

  html, body, #root, #__next {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    margin: 0;
    padding: 0;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Ensure inputs and buttons use Inter */
  input, button, textarea, select {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  /* Override any inline styles from React Native Web */
  [data-testid], [class*="css-"] {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }
`;

// ============================================================================
// Common Styles
// ============================================================================

export const commonStyles = StyleSheet.create({
  // Layout
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerHorizontal: { alignItems: 'center' },
  centerVertical: { justifyContent: 'center' },
  spaceBetween: { justifyContent: 'space-between' },

  // Card
  card: {
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    padding: spaceAround.default,
    ...elevation.sm,
  },

  // Text
  textPrimary: { color: colors.fg.neutral.primary },
  textSecondary: { color: colors.fg.neutral.secondary },
  textMuted: { color: colors.fg.neutral.spotReadable },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border.neutral.low,
  },

  // Screen
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg.neutral.min,
  },

  // ScrollView content
  scrollContent: {
    padding: spaceAround.default,
    paddingBottom: spaceAround.spacious + spaceAround.tight, // 32
  },
});

// ============================================================================
// Layout Constants
// ============================================================================

export const layout = {
  minibarHeight: 48,
  headerHeight: 64,
  sidebarWidth: 280,
  maxContentWidth: 1200,
  cardMaxWidth: 480,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create padding style
 */
export function padding(
  value: number | { top?: number; right?: number; bottom?: number; left?: number }
): ViewStyle {
  if (typeof value === 'number') {
    return { padding: value };
  }
  return {
    paddingTop: value.top,
    paddingRight: value.right,
    paddingBottom: value.bottom,
    paddingLeft: value.left,
  };
}

/**
 * Create margin style
 */
export function margin(
  value: number | { top?: number; right?: number; bottom?: number; left?: number }
): ViewStyle {
  if (typeof value === 'number') {
    return { margin: value };
  }
  return {
    marginTop: value.top,
    marginRight: value.right,
    marginBottom: value.bottom,
    marginLeft: value.left,
  };
}

/**
 * Get color with opacity (hex color + alpha)
 */
export function withOpacity(color: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${alpha}`;
}
