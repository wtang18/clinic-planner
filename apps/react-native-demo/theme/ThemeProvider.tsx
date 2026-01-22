/**
 * ThemeProvider Component
 *
 * Provides automatic light/dark mode support for React Native apps.
 * Mimics web design system behavior where components use the same token names
 * but values change based on the current theme mode.
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider, useTheme } from './theme/ThemeProvider';
 *
 * // 1. Wrap your app with ThemeProvider
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 *
 * // 2. Use theme tokens in components
 * function MyComponent() {
 *   const theme = useTheme();
 *   return (
 *     <View style={{ backgroundColor: theme.colorBgNeutralBase }}>
 *       <Text style={{ color: theme.colorFgNeutralPrimary }}>
 *         Hello World
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTokens, darkTokens, ThemeTokens } from './tokens';

/**
 * Theme Context
 * Provides theme tokens to all descendant components
 */
const ThemeContext = createContext<ThemeTokens>(lightTokens);

/**
 * ThemeProvider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Override the automatic theme detection
   * Useful for testing or manual theme control
   */
  forcedTheme?: 'light' | 'dark';
}

/**
 * ThemeProvider Component
 *
 * Automatically detects system theme using useColorScheme() and provides
 * the appropriate token mappings to all child components.
 *
 * Key features:
 * - Automatic theme switching based on system preferences
 * - Same token names work in both light and dark modes
 * - Components never need to check the theme mode manually
 * - Optional forced theme for testing or manual control
 */
export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  // Detect system color scheme
  const systemColorScheme = useColorScheme();

  // Determine the active theme mode
  const themeMode = forcedTheme || systemColorScheme || 'light';

  // Select the appropriate token set based on theme mode
  const [tokens, setTokens] = useState<ThemeTokens>(() =>
    themeMode === 'dark' ? darkTokens : lightTokens
  );

  // Update tokens when theme mode changes
  useEffect(() => {
    setTokens(themeMode === 'dark' ? darkTokens : lightTokens);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={tokens}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Access theme tokens in any component.
 * Returns the current theme tokens object with all color values.
 *
 * @returns ThemeTokens object with all semantic color tokens
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme();
 *   return (
 *     <View style={{ backgroundColor: theme.colorBgNeutralBase }}>
 *       <Text style={{ color: theme.colorFgNeutralPrimary }}>
 *         This text automatically adapts to light/dark mode
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeTokens {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * useThemeMode Hook
 *
 * Get the current theme mode ('light' or 'dark').
 * Useful when you need to conditionally render different components
 * or apply logic based on the theme mode.
 *
 * @returns 'light' or 'dark'
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mode = useThemeMode();
 *   return (
 *     <View>
 *       <Text>Current theme: {mode}</Text>
 *       {mode === 'dark' ? <MoonIcon /> : <SunIcon />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useThemeMode(): 'light' | 'dark' {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}
