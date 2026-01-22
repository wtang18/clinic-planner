/**
 * Input Component
 *
 * Text input field with support for icons and error states.
 */

import React, { forwardRef } from 'react';
import { colors, radii, spacing, typography, transitions, shadows } from '../../styles/tokens';

// ============================================================================
// Types
// ============================================================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input type */
  type?: 'text' | 'number' | 'search' | 'password' | 'email';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Error message */
  error?: string;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<'sm' | 'md' | 'lg', { height: string; fontSize: string; padding: string }> = {
  sm: {
    height: '32px',
    fontSize: typography.fontSize.sm[0],
    padding: spacing[2],
  },
  md: {
    height: '40px',
    fontSize: typography.fontSize.base[0],
    padding: spacing[3],
  },
  lg: {
    height: '48px',
    fontSize: typography.fontSize.lg[0],
    padding: spacing[4],
  },
};

// ============================================================================
// Component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      error,
      disabled = false,
      leftIcon,
      rightIcon,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const sizeStyle = sizeStyles[size];

    const hasError = !!error;

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      width: '100%',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: sizeStyle.height,
      padding: sizeStyle.padding,
      paddingLeft: leftIcon ? `calc(${sizeStyle.padding} + 24px)` : sizeStyle.padding,
      paddingRight: rightIcon ? `calc(${sizeStyle.padding} + 24px)` : sizeStyle.padding,
      fontSize: sizeStyle.fontSize,
      fontFamily: typography.fontFamily.sans,
      color: disabled ? colors.neutral[400] : colors.neutral[900],
      backgroundColor: disabled ? colors.neutral[100] : colors.neutral[0],
      border: `1px solid ${hasError ? colors.status.error : isFocused ? colors.primary[500] : colors.neutral[300]}`,
      borderRadius: radii.md,
      outline: 'none',
      transition: `all ${transitions.fast}`,
      boxShadow: isFocused ? (hasError ? shadows.focusError : shadows.focus) : 'none',
      ...style,
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.neutral[400],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        <div style={wrapperStyle}>
          {leftIcon && (
            <span style={{ ...iconStyle, left: sizeStyle.padding }}>{leftIcon}</span>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span style={{ ...iconStyle, right: sizeStyle.padding }}>{rightIcon}</span>
          )}
        </div>
        {error && (
          <span
            id={`${props.id}-error`}
            style={{
              color: colors.status.error,
              fontSize: typography.fontSize.sm[0],
              fontFamily: typography.fontFamily.sans,
            }}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
