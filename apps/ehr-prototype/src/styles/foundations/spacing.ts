/**
 * Spacing & Border Radius Foundations
 *
 * Semantic spacing tokens from @carbon-health/design-tokens.
 * Values in pixels (unitless numbers for React Native).
 */

// ============================================================================
// Semantic Spacing
// ============================================================================

/**
 * Space Between — gaps between elements
 *
 * - coupled: Very tight, e.g. icon + label (4px)
 * - repeating: Repeated items in a list (8px)
 * - related: Related content blocks (16px)
 * - separated: Distinct sections (32px)
 */
export const spaceBetween = {
  none: 0,
  coupled: 4,
  repeatingSm: 6,
  repeating: 8,
  relatedSm: 8,
  relatedCompact: 12,
  related: 16,
  relatedPlus: 20,
  separatedSm: 24,
  separated: 32,
} as const;

/**
 * Space Around — padding/margin around content
 *
 * - nudge: Micro adjustments (2–6px)
 * - tight: Compact padding (8px)
 * - compact: Snug but readable (12px)
 * - default: Standard padding (16px)
 * - spacious: Generous breathing room (24px)
 */
export const spaceAround = {
  none: 0,
  nudge2: 2,
  nudge4: 4,
  nudge6: 6,
  tight: 8,
  tightPlus: 10,
  compact: 12,
  default: 16,
  defaultPlus: 20,
  spacious: 24,
  generous: 32,
} as const;

/**
 * Combined spacing object
 */
export const spacing = {
  between: spaceBetween,
  around: spaceAround,
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
