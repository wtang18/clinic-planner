/**
 * Input Component
 *
 * Text input field with support for icons and error states.
 */

import React, { forwardRef } from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';

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
  /** Icon on the right (mutually exclusive with suffix) */
  rightIcon?: React.ReactNode;
  /** Text suffix displayed inside the input (e.g., "mmHg", "°F", "lbs") */
  suffix?: string;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<'sm' | 'md' | 'lg', { height: string; fontSize: number; padding: number }> = {
  sm: {
    height: '32px',
    fontSize: 14,
    padding: spaceAround.tight,
  },
  md: {
    height: '40px',
    fontSize: 16,
    padding: spaceAround.compact,
  },
  lg: {
    height: '48px',
    fontSize: 18,
    padding: spaceAround.default,
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
      suffix,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const sizeStyle = sizeStyles[size];

    const hasError = !!error;
    const hasRightAdornment = !!(rightIcon || suffix);
    // Dynamic right padding: for suffix, scale with text length; for icon, fixed offset
    const rightPadding = suffix
      ? suffix.length * 8 + 16
      : hasRightAdornment
      ? sizeStyle.padding + 24
      : sizeStyle.padding;

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      width: '100%',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: sizeStyle.height,
      padding: sizeStyle.padding,
      paddingLeft: leftIcon ? sizeStyle.padding + 24 : sizeStyle.padding,
      paddingRight: rightPadding,
      fontSize: sizeStyle.fontSize,
      fontFamily: typography.fontFamily.sans,
      color: disabled ? colors.fg.neutral.disabled : colors.fg.neutral.primary,
      backgroundColor: disabled ? colors.bg.neutral.subtle : colors.bg.neutral.base,
      border: `1px solid ${hasError ? colors.fg.alert.secondary : isFocused ? colors.fg.accent.primary : colors.border.neutral.medium}`,
      borderRadius: borderRadius.sm,
      outline: 'none',
      transition: `all ${transitions.fast}`,
      boxShadow: isFocused ? (hasError ? shadows.focusError : shadows.focus) : 'none',
      boxSizing: 'border-box',
      ...style,
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.fg.neutral.disabled,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    };

    const suffixStyle: React.CSSProperties = {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 12,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.spotReadable,
      pointerEvents: 'none',
      userSelect: 'none',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }}>
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
          {suffix && (
            <span style={suffixStyle}>{suffix}</span>
          )}
          {rightIcon && !suffix && (
            <span style={{ ...iconStyle, right: sizeStyle.padding }}>{rightIcon}</span>
          )}
        </div>
        {error && (
          <span
            id={`${props.id}-error`}
            style={{
              color: colors.fg.alert.secondary,
              fontSize: 14,
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
