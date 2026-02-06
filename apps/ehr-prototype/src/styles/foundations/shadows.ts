/**
 * CSS Shadow Foundations
 *
 * Box-shadow strings for web components.
 * Values derived from the same scale as elevation (RN-specific).
 */

import { colors } from './colors';

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.08)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.12)',
  md: '0 4px 8px rgba(0, 0, 0, 0.14)',
  lg: '0 8px 12px rgba(0, 0, 0, 0.16)',
  xl: '0 12px 16px rgba(0, 0, 0, 0.18)',
  '2xl': '0 16px 24px rgba(0, 0, 0, 0.2)',
  focus: `0 0 0 3px ${colors.bg.accent.low}`,
  focusError: `0 0 0 3px ${colors.bg.alert.low}`,
} as const;

export type ShadowLevel = keyof typeof shadows;
