/**
 * Theme
 *
 * Theme context and provider for the EHR UI.
 */

import React, { createContext, useContext } from 'react';
import {
  colors,
  spacing,
  typography,
  shadows,
  radii,
  transitions,
  zIndex,
  type Colors,
  type Spacing,
  type Typography,
  type Shadows,
  type Radii,
  type Transitions,
  type ZIndex,
} from './tokens';

// ============================================================================
// Theme Interface
// ============================================================================

/**
 * Complete theme object
 */
export interface Theme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  shadows: Shadows;
  radii: Radii;
  transitions: Transitions;
  zIndex: ZIndex;
}

// ============================================================================
// Theme Definitions
// ============================================================================

/**
 * Light theme (default)
 */
export const lightTheme: Theme = {
  colors,
  spacing,
  typography,
  shadows,
  radii,
  transitions,
  zIndex,
};

/**
 * Dark theme (future implementation)
 * For now, same as light theme
 */
export const darkTheme: Theme = {
  ...lightTheme,
  // Override colors for dark mode in the future
};

// ============================================================================
// Theme Context
// ============================================================================

/**
 * Theme context
 */
export const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  /** Theme to use */
  theme?: Theme;
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = lightTheme,
  children,
}) => {
  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    children
  );
};

/**
 * Hook to access the current theme
 */
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Get a spacing value
 */
export function getSpacing(theme: Theme, key: keyof Spacing): string {
  return theme.spacing[key];
}

/**
 * Get a color value
 */
export function getColor(
  theme: Theme,
  category: keyof Colors,
  shade: string | number
): string {
  const colorCategory = theme.colors[category] as Record<string, string>;
  return colorCategory[shade] || '';
}

/**
 * Get a shadow value
 */
export function getShadow(theme: Theme, key: keyof Shadows): string {
  return theme.shadows[key];
}

/**
 * Get a radius value
 */
export function getRadius(theme: Theme, key: keyof Radii): string {
  return theme.radii[key];
}

/**
 * Get a transition value
 */
export function getTransition(theme: Theme, key: keyof Transitions): string {
  return theme.transitions[key];
}

/**
 * Get a z-index value
 */
export function getZIndex(theme: Theme, key: keyof ZIndex): number {
  return theme.zIndex[key];
}
