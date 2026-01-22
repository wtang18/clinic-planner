/**
 * Design Tokens
 *
 * All design tokens for the EHR UI system.
 */

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Brand - Primary (Indigo)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Semantic - Status
  status: {
    success: '#10B981',
    successLight: '#D1FAE5',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorDark: '#DC2626',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoDark: '#2563EB',
  },

  // Semantic - Clinical item categories
  clinical: {
    medication: '#8B5CF6',      // Purple
    medicationLight: '#EDE9FE',
    medicationDark: '#7C3AED',
    lab: '#06B6D4',             // Cyan
    labLight: '#CFFAFE',
    labDark: '#0891B2',
    diagnosis: '#F97316',       // Orange
    diagnosisLight: '#FFEDD5',
    diagnosisDark: '#EA580C',
    vital: '#EC4899',           // Pink
    vitalLight: '#FCE7F3',
    vitalDark: '#DB2777',
    imaging: '#14B8A6',         // Teal
    imagingLight: '#CCFBF1',
    imagingDark: '#0D9488',
    procedure: '#64748B',       // Slate
    procedureLight: '#F1F5F9',
    procedureDark: '#475569',
    allergy: '#EF4444',         // Red
    allergyLight: '#FEE2E2',
    allergyDark: '#DC2626',
    referral: '#8B5CF6',        // Purple (same as medication)
    referralLight: '#EDE9FE',
    referralDark: '#7C3AED',
  },

  // Neutral palette
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // AI indicators
  ai: {
    suggestion: '#A855F7',
    suggestionLight: '#F3E8FF',
    suggestionDark: '#9333EA',
    generated: '#8B5CF6',
    generatedLight: '#EDE9FE',
    confidence: {
      high: '#10B981',
      medium: '#F59E0B',
      low: '#EF4444',
    },
  },

  // Care gap priority
  careGap: {
    critical: '#EF4444',
    criticalLight: '#FEE2E2',
    important: '#F59E0B',
    importantLight: '#FEF3C7',
    routine: '#10B981',
    routineLight: '#D1FAE5',
  },
} as const;

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }] as const,        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }] as const,    // 14px
    base: ['1rem', { lineHeight: '1.5rem' }] as const,       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }] as const,    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }] as const,     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }] as const,      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as const, // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as const,   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 3px rgba(99, 102, 241, 0.4)',
  focusError: '0 0 0 3px rgba(239, 68, 68, 0.4)',
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const radii = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// ============================================================================
// Transitions
// ============================================================================

export const transitions = {
  none: 'none',
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
} as const;

// ============================================================================
// Z-Index
// ============================================================================

export const zIndex = {
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 200,
  banner: 250,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  max: 9999,
} as const;

// ============================================================================
// Type exports
// ============================================================================

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
export type Radii = typeof radii;
export type Transitions = typeof transitions;
export type ZIndex = typeof zIndex;
