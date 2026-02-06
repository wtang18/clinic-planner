/**
 * Theme
 *
 * Theme context and provider for the EHR UI.
 * Uses canonical foundations from @carbon-health/design-tokens.
 */

import React, { createContext, useContext } from 'react';
import { colors, type Colors } from './foundations/colors';
import { textStyles, type TextStyles } from './foundations/textStyles';
import { spacing, borderRadius, type Spacing, type BorderRadius } from './foundations/spacing';
import { elevation } from './foundations/elevation';
import { typography, type Typography } from './foundations/typography';

// ============================================================================
// Theme Interface
// ============================================================================

export interface Theme {
  colors: Colors;
  textStyles: TextStyles;
  spacing: Spacing;
  borderRadius: BorderRadius;
  elevation: typeof elevation;
  typography: Typography;
}

// ============================================================================
// Theme Definitions
// ============================================================================

export const lightTheme: Theme = {
  colors,
  textStyles,
  spacing,
  borderRadius,
  elevation,
  typography,
};

// Dark theme (future — same structure, different color mappings)
export const darkTheme: Theme = {
  ...lightTheme,
};

// ============================================================================
// Theme Context
// ============================================================================

export const ThemeContext = createContext<Theme>(lightTheme);

export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

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

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
