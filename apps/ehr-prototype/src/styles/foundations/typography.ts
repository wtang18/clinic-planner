/**
 * Typography Foundations
 *
 * Font family and weight constants from @carbon-health/design-tokens.
 */

import {
  fontGlobalSans,
  fontGlobalSansAlt,
  fontGlobalMono,
  fontGlobalSansExpressive,
} from '@carbon-health/design-tokens/react-native';

export const typography = {
  fontFamily: {
    // Web-safe fallback stack for Inter
    sans: `'Inter', ${fontGlobalSans}, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    sansAlt: fontGlobalSansAlt,          // 'TT Norms Pro'
    mono: fontGlobalMono,                // 'Atlas Typewriter'
    expressive: fontGlobalSansExpressive, // 'Campton'
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type Typography = typeof typography;
