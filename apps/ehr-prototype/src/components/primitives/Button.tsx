/**
 * Button Component
 *
 * Primary button component for actions.
 */

import React, { forwardRef } from 'react';
import { colors, radii, spacing, transitions, typography } from '../../styles/tokens';
import { Spinner } from './Spinner';

// ============================================================================
// Types
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
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
  gap: spacing[2],
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.medium,
  borderRadius: radii.md,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${transitions.fast}`,
  outline: 'none',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: {
    height: '32px',
    padding: `0 ${spacing[3]}`,
    fontSize: typography.fontSize.sm[0],
  },
  md: {
    height: '40px',
    padding: `0 ${spacing[4]}`,
    fontSize: typography.fontSize.base[0],
  },
  lg: {
    height: '48px',
    padding: `0 ${spacing[6]}`,
    fontSize: typography.fontSize.lg[0],
  },
};

const variantStyles: Record<
  'primary' | 'secondary' | 'ghost' | 'danger',
  { base: React.CSSProperties; hover: React.CSSProperties; disabled: React.CSSProperties }
> = {
  primary: {
    base: {
      backgroundColor: colors.primary[600],
      color: colors.neutral[0],
    },
    hover: {
      backgroundColor: colors.primary[700],
    },
    disabled: {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[400],
      cursor: 'not-allowed',
    },
  },
  secondary: {
    base: {
      backgroundColor: colors.neutral[0],
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[300]}`,
    },
    hover: {
      backgroundColor: colors.neutral[50],
      borderColor: colors.neutral[400],
    },
    disabled: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[400],
      cursor: 'not-allowed',
    },
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
    },
    hover: {
      backgroundColor: colors.neutral[100],
    },
    disabled: {
      color: colors.neutral[400],
      cursor: 'not-allowed',
    },
  },
  danger: {
    base: {
      backgroundColor: colors.status.error,
      color: colors.neutral[0],
    },
    hover: {
      backgroundColor: colors.status.errorDark,
    },
    disabled: {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[400],
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
            {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
            {children}
            {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
