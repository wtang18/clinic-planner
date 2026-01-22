/**
 * Card Component
 *
 * Container card for grouping content.
 */

import React from 'react';
import { colors, radii, spacing, shadows, transitions } from '../../styles/tokens';

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
}

// ============================================================================
// Styles
// ============================================================================

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '0',
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

const variantStyles: Record<'default' | 'outlined' | 'elevated', React.CSSProperties> = {
  default: {
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[200]}`,
    boxShadow: 'none',
  },
  outlined: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.neutral[300]}`,
    boxShadow: 'none',
  },
  elevated: {
    backgroundColor: colors.neutral[0],
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
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const isClickable = interactive || !!onClick;

  const computedStyle: React.CSSProperties = {
    position: 'relative',
    padding: paddingStyles[padding],
    borderRadius: radii.lg,
    transition: `all ${transitions.fast}`,
    ...variantStyles[variant],
    ...(selected ? {
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 2px ${colors.primary[200]}`,
    } : {}),
    ...(isClickable ? {
      cursor: 'pointer',
    } : {}),
    ...(isClickable && isHovered ? {
      backgroundColor: colors.neutral[50],
      borderColor: colors.neutral[300],
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
    >
      {children}
    </div>
  );
};
