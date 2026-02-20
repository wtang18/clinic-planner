/**
 * Button Component
 *
 * Primary button component for actions.
 */

import React, { forwardRef } from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';
import { Spinner } from './Spinner';

// ============================================================================
// Types
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** Children */
  children: React.ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spaceBetween.repeating,
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.medium,
  borderRadius: borderRadius.full,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${transitions.fast}`,
  outline: 'none',
};

const sizeStyles: Record<'xs' | 'sm' | 'md' | 'lg', React.CSSProperties> = {
  xs: {
    height: '24px',
    padding: `0 ${spaceAround.tight}px`,
    fontSize: 12,
  },
  sm: {
    height: '32px',
    padding: `0 ${spaceAround.compact}px`,
    fontSize: 14,
  },
  md: {
    height: '40px',
    padding: `0 ${spaceAround.default}px`,
    fontSize: 16,
  },
  lg: {
    height: '48px',
    padding: `0 ${spaceAround.spacious}px`,
    fontSize: 18,
  },
};

const variantStyles: Record<
  'primary' | 'secondary' | 'ghost' | 'danger',
  { base: React.CSSProperties; hover: React.CSSProperties; disabled: React.CSSProperties }
> = {
  primary: {
    base: {
      backgroundColor: colors.fg.accent.primary,
      color: colors.bg.neutral.base,
    },
    hover: {
      backgroundColor: colors.fg.accent.secondary,
    },
    disabled: {
      backgroundColor: colors.border.neutral.low,
      color: colors.fg.neutral.disabled,
      cursor: 'not-allowed',
    },
  },
  secondary: {
    base: {
      backgroundColor: 'rgba(128, 128, 128, 0.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: colors.fg.neutral.secondary,
      border: '1px solid rgba(0, 0, 0, 0.06)',
    },
    hover: {
      backgroundColor: 'rgba(128, 128, 128, 0.14)',
      borderColor: 'rgba(0, 0, 0, 0.09)',
    },
    disabled: {
      backgroundColor: colors.bg.neutral.subtle,
      color: colors.fg.neutral.disabled,
      cursor: 'not-allowed',
    },
  },
  ghost: {
    base: {
      backgroundColor: 'rgba(128, 128, 128, 0.04)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: colors.fg.neutral.secondary,
    },
    hover: {
      backgroundColor: 'rgba(128, 128, 128, 0.10)',
    },
    disabled: {
      color: colors.fg.neutral.disabled,
      cursor: 'not-allowed',
    },
  },
  danger: {
    base: {
      backgroundColor: colors.fg.alert.secondary,
      color: colors.bg.neutral.base,
    },
    hover: {
      backgroundColor: colors.fg.alert.primary,
    },
    disabled: {
      backgroundColor: colors.border.neutral.low,
      color: colors.fg.neutral.disabled,
      cursor: 'not-allowed',
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const isDisabled = disabled || loading;

    const computedStyle: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant].base,
      ...(isHovered && !isDisabled ? variantStyles[variant].hover : {}),
      ...(isDisabled ? variantStyles[variant].disabled : {}),
      ...(fullWidth ? { width: '100%' } : {}),
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        style={computedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" color="currentColor" />
        ) : (
          <>
            {leftIcon && (
              <span style={{ display: 'flex', alignItems: 'center', width: { xs: 12, sm: 14, md: 16, lg: 18 }[size], height: { xs: 12, sm: 14, md: 16, lg: 18 }[size], flexShrink: 0 }}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span style={{ display: 'flex', alignItems: 'center', width: { xs: 12, sm: 14, md: 16, lg: 18 }[size], height: { xs: 12, sm: 14, md: 16, lg: 18 }[size], flexShrink: 0 }}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
