/**
 * IconButton Component
 *
 * Button that displays only an icon.
 */

import React, { forwardRef } from 'react';
import { colors, radii, transitions } from '../../styles/tokens';

// ============================================================================
// Types
// ============================================================================

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Accessible label */
  label: string;
  /** Visual variant */
  variant?: 'default' | 'ghost' | 'danger';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<'sm' | 'md' | 'lg', { size: string; iconSize: string }> = {
  sm: { size: '28px', iconSize: '16px' },
  md: { size: '36px', iconSize: '20px' },
  lg: { size: '44px', iconSize: '24px' },
};

const variantStyles: Record<
  'default' | 'ghost' | 'danger',
  { base: React.CSSProperties; hover: React.CSSProperties; disabled: React.CSSProperties }
> = {
  default: {
    base: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
    },
    hover: {
      backgroundColor: colors.neutral[200],
    },
    disabled: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[400],
    },
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: colors.neutral[600],
    },
    hover: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[800],
    },
    disabled: {
      backgroundColor: 'transparent',
      color: colors.neutral[400],
    },
  },
  danger: {
    base: {
      backgroundColor: colors.status.errorLight,
      color: colors.status.error,
    },
    hover: {
      backgroundColor: colors.status.error,
      color: colors.neutral[0],
    },
    disabled: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[400],
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = 'default',
      size = 'md',
      disabled = false,
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const sizeStyle = sizeStyles[size];
    const variantStyle = variantStyles[variant];

    const computedStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeStyle.size,
      height: sizeStyle.size,
      padding: 0,
      border: 'none',
      borderRadius: radii.md,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${transitions.fast}`,
      outline: 'none',
      ...variantStyle.base,
      ...(isHovered && !disabled ? variantStyle.hover : {}),
      ...(disabled ? variantStyle.disabled : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={label}
        style={computedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <span
          style={{
            display: 'flex',
            width: sizeStyle.iconSize,
            height: sizeStyle.iconSize,
          }}
        >
          {icon}
        </span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
