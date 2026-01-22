/**
 * Textarea Component - React Native (NativeWind)
 * Multi-line text input with label, helper text, and error states
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { useTheme, ThemeTokens } from '../theme';

export interface TextareaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  /**
   * Visual type of the textarea
   * - "outlined": Border with transparent background (default)
   * - "filled": Filled background with no border
   */
  type?: 'outlined' | 'filled';

  /** Label text displayed above textarea */
  label?: string;
  /** Helper text displayed below textarea */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message (overrides helperText when error=true) */
  errorMessage?: string;
  /** Whether the textarea is required */
  required?: boolean;

  /**
   * Number of visible text rows (controls initial height)
   * @default 3
   */
  rows?: number;

  /** Additional style for wrapper container */
  style?: StyleProp<ViewStyle>;
  /** Additional style for textarea container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Additional style for textarea field */
  textareaStyle?: StyleProp<TextStyle>;
  /** Custom className for NativeWind styling */
  className?: string;

  /** Whether to show placeholder text (default: true) */
  showPlaceholder?: boolean;

  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Textarea component for React Native
 *
 * SPECIFICATIONS:
 * - Border Radius: 8px
 * - Typography: Body/Sm Regular (14px / 20px line height)
 * - Padding: 10px 12px
 * - Focus border: 2px solid (outlined), background change (filled)
 *
 * @example
 * <Textarea label="Description" placeholder="Enter description" />
 */
export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      type = 'outlined',
      label,
      helperText,
      error = false,
      errorMessage,
      required = false,
      rows = 3,
      style,
      containerStyle,
      textareaStyle,
      className = '',
      showPlaceholder = true,
      editable = true,
      placeholder,
      value,
      onChangeText,
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

    // Determine current state
    const currentState = isDisabled
      ? 'disabled'
      : error
      ? 'error'
      : isFocused
      ? 'focused'
      : 'default';

    // Event handlers
    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Get container background and border styles based on type and state (uses theme for dark mode)
    const getContainerColors = () => {
      if (type === 'filled') {
        if (currentState === 'disabled') {
          return { backgroundColor: theme.colorBgTransparentLow, borderColor: 'transparent', borderWidth: 0 };
        }
        if (currentState === 'error') {
          return { backgroundColor: theme.colorBgAlertLow, borderColor: 'transparent', borderWidth: 0 };
        }
        if (currentState === 'focused') {
          return { backgroundColor: theme.colorBgInputLow, borderColor: 'transparent', borderWidth: 0 };
        }
        return { backgroundColor: theme.colorBgTransparentSubtle, borderColor: 'transparent', borderWidth: 0 };
      } else {
        if (currentState === 'disabled') {
          return { backgroundColor: 'transparent', borderColor: theme.colorBgTransparentLow, borderWidth: 1 };
        }
        if (currentState === 'error') {
          return { backgroundColor: 'transparent', borderColor: theme.colorBgAlertHigh, borderWidth: 1 };
        }
        if (currentState === 'focused') {
          return { backgroundColor: 'transparent', borderColor: theme.colorBgInputHigh, borderWidth: 2 };
        }
        return { backgroundColor: 'transparent', borderColor: theme.colorBgNeutralLow, borderWidth: 1 };
      }
    };

    // Label/helper text colors (uses theme for dark mode)
    const getLabelColor = () => {
      if (currentState === 'disabled') return theme.colorFgNeutralDisabled;
      if (currentState === 'error') return theme.colorFgAlertPrimary;
      return theme.colorFgNeutralSecondary;
    };

    const getHelperTextColor = () => {
      if (currentState === 'disabled') return theme.colorFgNeutralDisabled;
      if (currentState === 'error') return theme.colorFgAlertPrimary;
      return theme.colorFgNeutralSecondary;
    };

    const getTextColor = () => {
      if (currentState === 'disabled') return theme.colorFgNeutralSecondary;
      return theme.colorFgNeutralPrimary;
    };

    const containerColors = getContainerColors();

    // Calculate minimum height based on rows
    const lineHeight = 20;
    const verticalPadding = 20;
    const minHeight = (rows * lineHeight) + verticalPadding;

    // Adjust padding for 2px border on focus
    const adjustedPaddingH = type === 'outlined' && currentState === 'focused' ? 11 : 12;
    const adjustedPaddingV = type === 'outlined' && currentState === 'focused' ? 9 : 10;

    const displayHelperText = error && errorMessage ? errorMessage : helperText;

    return (
      <View className={`gap-coupled ${className}`} style={style}>
        {/* Label */}
        {label && (
          <Text
            className="text-body-sm font-medium self-start"
            style={{ color: getLabelColor(), lineHeight: 20 }}
          >
            {label}
            {required && <Text style={{ color: theme.colorFgAlertPrimary }}> *</Text>}
          </Text>
        )}

        {/* Textarea Container */}
        <View
          className="flex-row items-start rounded-sm self-stretch"
          style={[
            {
              minHeight,
              paddingHorizontal: adjustedPaddingH,
              paddingVertical: adjustedPaddingV,
              ...containerColors,
            },
            containerStyle,
          ]}
        >
          <TextInput
            ref={ref}
            className="flex-1 text-body-sm font-normal p-0 m-0"
            style={[
              {
                color: getTextColor(),
                lineHeight: 20,
                minHeight: rows * lineHeight,
                textAlignVertical: 'top',
                outlineStyle: 'none',
              } as any,
              textareaStyle,
            ]}
            placeholderTextColor={theme.colorFgTransparentStrong}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={showPlaceholder ? placeholder : undefined}
            value={value}
            onChangeText={onChangeText}
            multiline={true}
            numberOfLines={rows}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="text"
            accessibilityState={{ disabled: isDisabled }}
            {...props}
          />
        </View>

        {/* Helper Text or Error Message */}
        {displayHelperText && (
          <Text
            className="text-body-sm font-normal self-start"
            style={{ color: getHelperTextColor(), lineHeight: 20 }}
          >
            {displayHelperText}
          </Text>
        )}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';
