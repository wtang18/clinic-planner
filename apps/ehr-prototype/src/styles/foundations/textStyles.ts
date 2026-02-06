/**
 * Semantic Text Styles
 *
 * Resolved text style definitions from @carbon-health/design-tokens.
 * All values sourced from the canonical tailwind-theme.js and CSS text-styles-core.css.
 *
 * Categories: display, heading, title, body, label, eyebrow
 * Each style includes: fontFamily, fontSize, lineHeight, fontWeight, letterSpacing
 */

import { TextStyle } from 'react-native';

export interface TextStyleDefinition extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing: number;
}

// Font family constant
const FONT_SANS = 'Inter';

// Letter spacing values (from primitives)
const LS_TIGHTER = -1;   // display
const LS_TIGHT = -0.5;   // heading
const LS_NORMAL = 0;     // body, title
const LS_WIDE = 0.5;     // eyebrow, label caps

// Helper to create a text style definition
function ts(
  fontSize: number,
  lineHeight: number,
  fontWeight: TextStyle['fontWeight'],
  letterSpacing: number = LS_NORMAL
): TextStyleDefinition {
  return { fontFamily: FONT_SANS, fontSize, lineHeight, fontWeight, letterSpacing };
}

// ============================================================================
// Display — Large hero/page-level text
// ============================================================================

export const display = {
  sm: {
    regular: ts(24, 32, '400', LS_TIGHTER),
    medium: ts(24, 32, '500', LS_TIGHTER),
    bold: ts(24, 32, '700', LS_TIGHTER),
  },
  md: {
    regular: ts(28, 40, '400', LS_TIGHTER),
    medium: ts(28, 40, '500', LS_TIGHTER),
    bold: ts(28, 40, '700', LS_TIGHTER),
  },
  lg: {
    regular: ts(32, 40, '400', LS_TIGHTER),
    medium: ts(32, 40, '500', LS_TIGHTER),
    bold: ts(32, 40, '700', LS_TIGHTER),
  },
  xl: {
    regular: ts(40, 48, '400', LS_TIGHTER),
    medium: ts(40, 48, '500', LS_TIGHTER),
    bold: ts(40, 48, '700', LS_TIGHTER),
  },
} as const;

// ============================================================================
// Heading — Section headings
// ============================================================================

export const heading = {
  xs: {
    medium: ts(12, 20, '500', LS_TIGHT),
    bold: ts(12, 20, '700', LS_TIGHT),
  },
  sm: {
    medium: ts(14, 20, '500', LS_TIGHT),
    bold: ts(14, 20, '700', LS_TIGHT),
  },
  md: {
    medium: ts(16, 24, '500', LS_TIGHT),
    bold: ts(16, 24, '700', LS_TIGHT),
  },
  lg: {
    medium: ts(18, 24, '500', LS_TIGHT),
    bold: ts(18, 24, '700', LS_TIGHT),
  },
  xl: {
    medium: ts(20, 28, '500', LS_TIGHT),
    bold: ts(20, 28, '700', LS_TIGHT),
  },
  '2xl': {
    medium: ts(24, 32, '500', LS_TIGHT),
    bold: ts(24, 32, '700', LS_TIGHT),
  },
  '3xl': {
    medium: ts(32, 40, '500', LS_TIGHT),
    bold: ts(32, 40, '700', LS_TIGHT),
  },
  '4xl': {
    medium: ts(40, 48, '500', LS_TIGHT),
    bold: ts(40, 48, '700', LS_TIGHT),
  },
  '5xl': {
    medium: ts(48, 48, '500', LS_TIGHT),
    bold: ts(48, 48, '700', LS_TIGHT),
  },
} as const;

// ============================================================================
// Title — Compact section labels (smaller range than heading)
// ============================================================================

export const title = {
  sm: {
    medium: ts(14, 20, '500', LS_NORMAL),
    bold: ts(14, 20, '700', LS_NORMAL),
  },
  lg: {
    medium: ts(18, 24, '500', LS_NORMAL),
    bold: ts(18, 24, '700', LS_NORMAL),
  },
  xl: {
    medium: ts(20, 32, '500', LS_NORMAL),
    bold: ts(20, 32, '700', LS_NORMAL),
  },
} as const;

// ============================================================================
// Body — Running text
// ============================================================================

export const body = {
  xs: {
    regular: ts(12, 20, '400', LS_NORMAL),
    medium: ts(12, 20, '500', LS_NORMAL),
    bold: ts(12, 20, '700', LS_NORMAL),
  },
  sm: {
    regular: ts(14, 20, '400', LS_NORMAL),
    medium: ts(14, 20, '500', LS_NORMAL),
    bold: ts(14, 20, '700', LS_NORMAL),
  },
  md: {
    regular: ts(16, 24, '400', LS_NORMAL),
    medium: ts(16, 24, '500', LS_NORMAL),
    bold: ts(16, 24, '700', LS_NORMAL),
  },
  lg: {
    regular: ts(18, 24, '400', LS_NORMAL),
    medium: ts(18, 24, '500', LS_NORMAL),
    bold: ts(18, 24, '700', LS_NORMAL),
  },
} as const;

// ============================================================================
// Label — Form labels, captions, small interactive text
// ============================================================================

export const label = {
  '2xs': {
    regular: ts(10, 16, '400', LS_NORMAL),
    medium: ts(10, 16, '500', LS_NORMAL),
    semibold: ts(10, 16, '600', LS_NORMAL),
    bold: ts(10, 16, '700', LS_NORMAL),
  },
  xs: {
    regular: ts(12, 20, '400', LS_NORMAL),
    medium: ts(12, 20, '500', LS_NORMAL),
    semibold: ts(12, 20, '600', LS_NORMAL),
    bold: ts(12, 20, '700', LS_NORMAL),
  },
  sm: {
    regular: ts(14, 20, '400', LS_NORMAL),
    medium: ts(14, 20, '500', LS_NORMAL),
    semibold: ts(14, 20, '600', LS_NORMAL),
    bold: ts(14, 20, '700', LS_NORMAL),
  },
  md: {
    regular: ts(16, 24, '400', LS_NORMAL),
    medium: ts(16, 24, '500', LS_NORMAL),
    semibold: ts(16, 24, '600', LS_NORMAL),
    bold: ts(16, 24, '700', LS_NORMAL),
  },
  lg: {
    regular: ts(18, 24, '400', LS_NORMAL),
    medium: ts(18, 24, '500', LS_NORMAL),
    semibold: ts(18, 24, '600', LS_NORMAL),
    bold: ts(18, 24, '700', LS_NORMAL),
  },
} as const;

// ============================================================================
// Eyebrow — Overline/category labels, typically uppercase
// ============================================================================

export const eyebrow = {
  sm: {
    medium: ts(12, 20, '500', LS_WIDE),
    semibold: ts(12, 20, '600', LS_WIDE),
  },
  md: {
    medium: ts(14, 20, '500', LS_WIDE),
    semibold: ts(14, 20, '600', LS_WIDE),
  },
} as const;

// ============================================================================
// Combined export
// ============================================================================

export const textStyles = {
  display,
  heading,
  title,
  body,
  label,
  eyebrow,
} as const;

export type TextStyles = typeof textStyles;
