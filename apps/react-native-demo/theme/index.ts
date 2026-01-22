/**
 * Theme System Entry Point
 *
 * This module provides automatic light/dark mode support for React Native.
 * Based on the web design system pattern where semantic token names stay constant
 * but their mappings to primitive colors change based on the theme mode.
 *
 * Quick Start:
 * ```tsx
 * import { ThemeProvider, useTheme } from './theme';
 *
 * // 1. Wrap your app
 * export default function App() {
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
 *         This automatically adapts to light/dark mode!
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */

export { ThemeProvider, useTheme, useThemeMode } from './ThemeProvider';
export { lightTokens, darkTokens } from './tokens';
export type { ThemeTokens } from './tokens';
