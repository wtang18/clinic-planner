/**
 * Card Component
 *
 * Container card for grouping content.
 */

import React from 'react';
import { colors, spaceAround, borderRadius, shadows, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CardProps {
  /** Visual variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Interactive (hover/click states) */
  interactive?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Children */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Additional class name */
  className?: string;
  /** Test ID for E2E testing */
  'data-testid'?: string;
}

// ============================================================================
// Styles
// ============================================================================

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', number> = {
  none: 0,
  sm: spaceAround.compact,
  md: spaceAround.default,
  lg: spaceAround.spacious,
};

const variantStyles: Record<'default' | 'outlined' | 'elevated', React.CSSProperties> = {
  default: {
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  outlined: {
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: 'none',
  },
  elevated: {
    backgroundColor: colors.bg.neutral.base,
    border: 'none',
    boxShadow: shadows.md,
  },
};

// ============================================================================
// Component
// ============================================================================

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  selected = false,
  children,
  onClick,
  style,
  className,
  'data-testid': testId,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const isClickable = interactive || !!onClick;

  const computedStyle: React.CSSProperties = {
    position: 'relative',
    padding: paddingStyles[padding],
    borderRadius: borderRadius.sm,
    transition: `all ${transitions.fast}`,
    ...variantStyles[variant],
    ...(selected ? {
      borderColor: colors.fg.accent.primary,
      boxShadow: `0 0 0 1.5px ${colors.border.accent.low}`,
    } : {}),
    ...(isClickable ? {
      cursor: 'pointer',
    } : {}),
    ...(isClickable && isHovered ? {
      backgroundColor: colors.bg.neutral.min,
    } : {}),
    ...style,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={computedStyle}
      className={className}
      aria-pressed={isClickable ? selected : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
};
