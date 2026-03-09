/**
 * Shared style constants for care protocol components.
 *
 * Uses existing design tokens from styles/foundations. All colors, spacing,
 * and typography reference the canonical token set.
 */

import { colors, spaceAround, spaceBetween, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Card Styles
// ============================================================================

export const cardStyles = {
  container: {
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.base,
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    transition: `background-color ${transitions.fast}`,
  },
  body: {
    padding: `0 ${spaceAround.default}px ${spaceAround.default}px`,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: spaceBetween.coupled,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
};

// ============================================================================
// Item Styles
// ============================================================================

export const itemStyles = {
  row: {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
    gap: spaceBetween.repeating,
    padding: `${spaceAround.nudge6}px 0`,
    minHeight: 28,
  },
  label: {
    fontSize: 13,
    color: colors.fg.neutral.primary,
    flex: 1,
    lineHeight: 1.4,
  },
  labelAddressed: {
    color: colors.fg.neutral.spotReadable,
    textDecoration: 'line-through' as const,
  },
  labelSkipped: {
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic' as const,
  },
  description: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    lineHeight: 1.3,
    marginTop: 2,
  },
  addButton: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 22,
    height: 22,
    borderRadius: borderRadius.xs,
    border: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: 'transparent',
    cursor: 'pointer' as const,
    color: colors.fg.neutral.primary,
    fontSize: 14,
    fontFamily: 'inherit',
    flexShrink: 0,
    padding: 0,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.xs,
    border: `1.5px solid ${colors.border.neutral.medium}`,
    backgroundColor: 'transparent',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
    marginTop: 2,
    padding: 0,
    fontFamily: 'inherit',
  },
  checkboxChecked: {
    backgroundColor: colors.bg.accent.medium,
    borderColor: colors.bg.accent.medium,
    color: colors.fg.neutral.inversePrimary,
  },
};

// ============================================================================
// Advisory Severity Colors
// ============================================================================

export const advisorySeverityStyles: Record<string, React.CSSProperties> = {
  info: {
    backgroundColor: colors.bg.neutral.low,
  },
  warning: {
    backgroundColor: colors.bg.attention.low,
  },
  critical: {
    backgroundColor: colors.bg.alert.low,
  },
};

// ============================================================================
// Status Badge Colors
// ============================================================================

export const statusColors = {
  addressed: colors.fg.positive.primary,
  skipped: colors.fg.neutral.spotReadable,
  pending: colors.fg.neutral.primary,
  'not-applicable': colors.fg.neutral.spotReadable,
};

// ============================================================================
// Completion Badge (inline with title)
// ============================================================================

export const completionBadgeStyle: React.CSSProperties = {
  fontSize: 12,
  color: colors.fg.neutral.spotReadable,
};
