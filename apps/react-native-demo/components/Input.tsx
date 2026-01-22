/**
 * Input Component - React Native (NativeWind)
 * Simplified implementation with proper flexbox alignment
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Icon, IconName } from '../icons';
import { useTheme, ThemeTokens } from '../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Visual type: "outlined" (border) or "filled" (background) */
  type?: 'outlined' | 'filled';
  /** Size: "small" (32px), "medium" (40px), "large" (56px) */
  size?: 'small' | 'medium' | 'large';
  /** Label text displayed above input */
  label?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message (overrides helperText when error=true) */
  errorMessage?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Left icon name */
  leftIcon?: IconName;
  /** Right icon name */
  rightIcon?: IconName;
  /** Left subtext (e.g. "$") */
  leftSubtext?: string;
  /** Right subtext (e.g. "%") */
  rightSubtext?: string;
  /** Additional style for wrapper */
  style?: StyleProp<ViewStyle>;
  /** Additional className for wrapper */
  className?: string;
  /** Additional style for input container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Additional className for input container */
  containerClassName?: string;
  /** Additional style for input field */
  inputStyle?: StyleProp<TextStyle>;
  /** Whether to show placeholder text */
  showPlaceholder?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

type InputState = 'disabled' | 'error' | 'focused' | 'default';

// NativeWind size classes
const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-14',
};

const textSizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'text-body-sm',
  medium: 'text-body-sm',
  large: 'text-body-md',
};

// Get container colors based on type and state (uses theme for dark mode support)
const getContainerColors = (theme: ThemeTokens, type: 'outlined' | 'filled', state: InputState) => {
  if (type === 'filled') {
    switch (state) {
      case 'disabled': return { bg: theme.colorBgTransparentLow, border: 'transparent', borderWidth: 0 };
      case 'error': return { bg: theme.colorBgAlertLow, border: 'transparent', borderWidth: 0 };
      case 'focused': return { bg: theme.colorBgInputLow, border: 'transparent', borderWidth: 0 };
      default: return { bg: theme.colorBgTransparentSubtle, border: 'transparent', borderWidth: 0 };
    }
  } else {
    switch (state) {
      case 'disabled': return { bg: 'transparent', border: theme.colorBgTransparentLow, borderWidth: 1 };
      case 'error': return { bg: 'transparent', border: theme.colorBgAlertHigh, borderWidth: 1 };
      case 'focused': return { bg: 'transparent', border: theme.colorBgInputHigh, borderWidth: 2 };
      default: return { bg: 'transparent', border: theme.colorBgNeutralLow, borderWidth: 1 };
    }
  }
};

// Get text colors based on state (uses theme for dark mode support)
const getTextColors = (theme: ThemeTokens, state: InputState) => {
  switch (state) {
    case 'disabled': return { label: theme.colorFgNeutralDisabled, text: theme.colorFgNeutralSecondary, helper: theme.colorFgNeutralDisabled, subtext: theme.colorFgNeutralDisabled };
    case 'error': return { label: theme.colorFgAlertPrimary, text: theme.colorFgNeutralPrimary, helper: theme.colorFgAlertPrimary, subtext: theme.colorFgNeutralSecondary };
    default: return { label: theme.colorFgNeutralSecondary, text: theme.colorFgNeutralPrimary, helper: theme.colorFgNeutralSecondary, subtext: theme.colorFgNeutralSecondary };
  }
};

/**
 * Input component with NativeWind + design system tokens
 *
 * @example
 * <Input label="Email" placeholder="you@example.com" showPlaceholder />
 * <Input label="Search" leftIcon="magnifying-glass" placeholder="Search..." showPlaceholder />
 * <Input label="Password" error errorMessage="Password is required" />
 */
export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      type = 'outlined',
      size = 'medium',
      label,
      helperText,
      error = false,
      errorMessage,
      required = false,
      leftIcon,
      rightIcon,
      leftSubtext,
      rightSubtext,
      style,
      className = '',
      containerStyle,
      containerClassName = '',
      inputStyle,
      showPlaceholder = true,
      editable = true,
      placeholder,
      onFocus,
      onBlur,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = !editable;

    const currentState: InputState = isDisabled ? 'disabled' : error ? 'error' : isFocused ? 'focused' : 'default';
    const containerColors = getContainerColors(theme, type, currentState);
    const textColors = getTextColors(theme, currentState);
    const iconSize = size === 'large' ? 'medium' : 'small';

    // Adjust padding for 2px border on focus (outlined only)
    const paddingClass = type === 'outlined' && currentState === 'focused'
      ? 'px-[11px]'
      : 'px-3';

    const displayHelperText = error && errorMessage ? errorMessage : helperText;

    return (
      <View style={style} className={`gap-coupled ${className}`}>
        {/* Label */}
        {label && (
          <Text
            className="text-body-sm font-medium self-start"
            style={{ color: textColors.label, lineHeight: 20 }}
          >
            {label}
            {required && <Text style={{ color: theme.colorFgAlertPrimary }}> *</Text>}
          </Text>
        )}

        {/* Input Container - flexbox items-center handles vertical alignment */}
        <View
          className={`flex-row items-center rounded-sm gap-related-sm self-stretch ${sizeClasses[size]} ${paddingClass} ${containerClassName}`}
          style={[
            {
              backgroundColor: containerColors.bg,
              borderWidth: containerColors.borderWidth,
              borderColor: containerColors.border,
            },
            containerStyle,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && <Icon name={leftIcon} size={iconSize} color={textColors.subtext} />}

          {/* Left Subtext */}
          {leftSubtext && (
            <Text className={textSizeClasses[size]} style={{ color: textColors.subtext }}>
              {leftSubtext}
            </Text>
          )}

          {/* TextInput - flex-1 fills remaining space */}
          <TextInput
            ref={ref}
            className={`flex-1 ${textSizeClasses[size]} p-0 m-0`}
            style={[{
              color: textColors.text,
              outlineStyle: 'none',
              transform: [{ translateY: -1 }],
            } as any, inputStyle]}
            placeholderTextColor={theme.colorFgTransparentStrong}
            editable={editable}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholder={showPlaceholder ? placeholder : undefined}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: isDisabled }}
            {...props}
          />

          {/* Right Subtext */}
          {rightSubtext && (
            <Text className={textSizeClasses[size]} style={{ color: textColors.subtext }}>
              {rightSubtext}
            </Text>
          )}

          {/* Right Icon */}
          {rightIcon && <Icon name={rightIcon} size={iconSize} color={textColors.subtext} />}
        </View>

        {/* Helper Text or Error Message */}
        {displayHelperText && (
          <Text
            className="text-body-sm self-start"
            style={{ color: textColors.helper, lineHeight: 20 }}
          >
            {displayHelperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
