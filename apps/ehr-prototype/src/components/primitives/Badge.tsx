/**
 * Badge Component
 *
 * Small badge for status indicators, counts, etc.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface BadgeProps {
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ai';
  /** Size */
  size?: 'sm' | 'md';
  /** Show a dot indicator */
  dot?: boolean;
  /** Show a count */
  count?: number;
  /** Children content */
  children?: React.ReactNode;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID for E2E testing */
  'data-testid'?: string;
}

// ============================================================================
// Styles
// ============================================================================

const variantColors: Record<
  'default' | 'success' | 'warning' | 'error' | 'info' | 'ai',
  { bg: string; text: string; dot: string }
> = {
  default: {
    bg: colors.bg.neutral.subtle,
    text: colors.fg.neutral.secondary,
    dot: colors.fg.neutral.spotReadable,
  },
  success: {
    bg: colors.bg.positive.subtle,
    text: colors.fg.positive.primary,
    dot: colors.fg.positive.secondary,
  },
  warning: {
    bg: colors.bg.attention.subtle,
    text: colors.fg.attention.primary,
    dot: colors.fg.attention.secondary,
  },
  error: {
    bg: colors.bg.alert.subtle,
    text: colors.fg.alert.primary,
    dot: colors.fg.alert.secondary,
  },
  info: {
    bg: colors.bg.information.subtle,
    text: colors.fg.information.primary,
    dot: colors.fg.information.secondary,
  },
  ai: {
    bg: colors.bg.neutral.subtle,
    text: colors.fg.neutral.secondary,
    dot: colors.fg.neutral.spotReadable,
  },
};

const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
  sm: {
    padding: `1px 5px`,
    fontSize: 11,
    lineHeight: '16px',
  },
  md: {
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    fontSize: 14,
    lineHeight: '20px',
  },
};

// ============================================================================
// Component
// ============================================================================

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  count,
  children,
  style,
  'data-testid': testId,
}) => {
  const colorSet = variantColors[variant];

  // Count badge
  if (count !== undefined) {
    const displayCount = count > 99 ? '99+' : count;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: size === 'sm' ? '18px' : '22px',
          height: size === 'sm' ? '18px' : '22px',
          padding: `0 ${spaceAround.nudge4}px`,
          backgroundColor: colorSet.bg,
          color: colorSet.text,
          fontSize: 12,
          fontWeight: typography.fontWeight.medium,
          fontFamily: typography.fontFamily.sans,
          borderRadius: borderRadius.full,
        }}
      >
        {displayCount}
      </span>
    );
  }

  // Dot badge
  if (dot) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          backgroundColor: colorSet.dot,
          borderRadius: borderRadius.full,
        }}
        role="status"
        aria-label={`${variant} status`}
      />
    );
  }

  // Text badge
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        backgroundColor: colorSet.bg,
        color: colorSet.text,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        borderRadius: borderRadius.sm,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...style,
      }}
      data-testid={testId}
    >
      {children}
    </span>
  );
};
