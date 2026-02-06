/**
 * IconButton Component
 *
 * Button that displays only an icon.
 */

import React, { forwardRef } from 'react';
import { colors, borderRadius, transitions } from '../../styles/foundations';

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
      backgroundColor: 'rgba(128, 128, 128, 0.06)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: colors.fg.neutral.secondary,
    },
    hover: {
      backgroundColor: 'rgba(128, 128, 128, 0.12)',
    },
    disabled: {
      backgroundColor: colors.bg.neutral.subtle,
      color: colors.fg.neutral.disabled,
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
      color: colors.fg.neutral.primary,
    },
    disabled: {
      backgroundColor: 'transparent',
      color: colors.fg.neutral.disabled,
    },
  },
  danger: {
    base: {
      backgroundColor: colors.bg.alert.subtle,
      color: colors.fg.alert.secondary,
    },
    hover: {
      backgroundColor: colors.fg.alert.secondary,
      color: colors.bg.neutral.base,
    },
    disabled: {
      backgroundColor: colors.bg.neutral.subtle,
      color: colors.fg.neutral.disabled,
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
      borderRadius: borderRadius.full,
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
