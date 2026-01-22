/**
 * Badge Component
 *
 * Small badge for status indicators, counts, etc.
 */

import React from 'react';
import { colors, radii, spacing, typography } from '../../styles/tokens';

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
}

// ============================================================================
// Styles
// ============================================================================

const variantColors: Record<
  'default' | 'success' | 'warning' | 'error' | 'info' | 'ai',
  { bg: string; text: string; dot: string }
> = {
  default: {
    bg: colors.neutral[100],
    text: colors.neutral[700],
    dot: colors.neutral[500],
  },
  success: {
    bg: colors.status.successLight,
    text: colors.status.successDark,
    dot: colors.status.success,
  },
  warning: {
    bg: colors.status.warningLight,
    text: colors.status.warningDark,
    dot: colors.status.warning,
  },
  error: {
    bg: colors.status.errorLight,
    text: colors.status.errorDark,
    dot: colors.status.error,
  },
  info: {
    bg: colors.status.infoLight,
    text: colors.status.infoDark,
    dot: colors.status.info,
  },
  ai: {
    bg: colors.ai.suggestionLight,
    text: colors.ai.suggestionDark,
    dot: colors.ai.suggestion,
  },
};

const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
  sm: {
    padding: `${spacing[0.5]} ${spacing[1.5]}`,
    fontSize: typography.fontSize.xs[0],
    lineHeight: typography.fontSize.xs[1].lineHeight,
  },
  md: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: typography.fontSize.sm[0],
    lineHeight: typography.fontSize.sm[1].lineHeight,
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
          padding: `0 ${spacing[1]}`,
          backgroundColor: colorSet.bg,
          color: colorSet.text,
          fontSize: typography.fontSize.xs[0],
          fontWeight: typography.fontWeight.medium,
          fontFamily: typography.fontFamily.sans,
          borderRadius: radii.full,
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
          borderRadius: radii.full,
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
        gap: spacing[1],
        backgroundColor: colorSet.bg,
        color: colorSet.text,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        borderRadius: radii.full,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
};
