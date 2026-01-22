/**
 * DateInput Component - React Native (NativeWind)
 * Date input with native date picker modal
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleProp, ViewStyle, TextStyle, TextInputProps, Platform, Dimensions } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Icon } from '../icons';
import { Button } from './Button';
import { useTheme, ThemeTokens } from '../theme';

// Detect if device is tablet (iPad)
const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  return Math.min(width, height) >= 600 && aspectRatio < 1.6;
};

export interface DateInputProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'onChange'> {
  /** Visual type of the input */
  type?: 'outlined' | 'filled';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Label text displayed above input */
  label?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Current date value */
  value?: Date;
  /** Change handler */
  onChange?: (date: Date | undefined) => void;
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Maximum selectable date */
  maximumDate?: Date;
  /** Additional style for wrapper */
  style?: StyleProp<ViewStyle>;
  /** Additional style for input container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Additional style for input field */
  inputStyle?: StyleProp<TextStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Whether to show placeholder text */
  showPlaceholder?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Whether the input is disabled */
  editable?: boolean;
}

// Size classes
const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-14',
};

// Text size classes (lineHeight applied via inline style)
const textSizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'text-body-sm',
  medium: 'text-body-sm',
  large: 'text-body-md',
};

// Line heights for each size
const lineHeights: Record<'small' | 'medium' | 'large', number> = {
  small: 20,
  medium: 20,
  large: 24,
};

/**
 * DateInput component for React Native
 *
 * SPECIFICATIONS:
 * - Border Radius: 8px
 * - Icon Size: 20px (small/medium), 24px (large)
 * - Gap: 8px between elements
 *
 * @example
 * <DateInput
 *   label="Event Date"
 *   value={date}
 *   onChange={setDate}
 * />
 */
export const DateInput = React.forwardRef<TextInput, DateInputProps>(
  (
    {
      type = 'outlined',
      size = 'medium',
      label,
      helperText,
      error = false,
      errorMessage,
      required = false,
      value,
      onChange,
      minimumDate,
      maximumDate,
      style,
      containerStyle,
      inputStyle,
      className = '',
      showPlaceholder = false,
      editable = true,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = !editable;

    const currentState = isDisabled
      ? 'disabled'
      : error
      ? 'error'
      : isFocused
      ? 'focused'
      : 'default';

    // Format date for display (YYYY-MM-DD)
    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const handlePress = () => {
      if (!isDisabled) {
        if (showPicker) {
          setShowPicker(false);
          setIsFocused(false);
        } else {
          setShowPicker(true);
          setIsFocused(true);
        }
      }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
        setIsFocused(false);
      }

      if (event.type === 'set' && selectedDate) {
        onChange?.(selectedDate);
      } else if (event.type === 'dismissed') {
        setShowPicker(false);
        setIsFocused(false);
      }
    };

    const handleClosePicker = () => {
      setShowPicker(false);
      setIsFocused(false);
    };

    // Get container colors based on state (uses theme for dark mode)
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

    const getIconColor = () => {
      if (currentState === 'disabled') return theme.colorFgNeutralDisabled;
      return theme.colorFgNeutralSecondary;
    };

    const containerColors = getContainerColors();

    // Adjust padding for 2px border on focus
    const paddingClass = type === 'outlined' && currentState === 'focused'
      ? 'px-[11px] py-[9px]'
      : 'px-around-compact py-around-tight-plus';

    const iconSize = size === 'large' ? 'medium' : 'small';
    const displayValue = formatDate(value);
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

        {/* Input Container */}
        <TouchableOpacity
          className={`flex-row items-center rounded-sm gap-related-sm self-stretch ${sizeClasses[size]} ${paddingClass}`}
          style={[containerColors, containerStyle]}
          onPress={handlePress}
          disabled={isDisabled}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || 'Tap to select a date'}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
        >
          {/* Date Display Text */}
          <View className="flex-1 justify-center">
            <Text
              className={`${textSizeClasses[size]} font-normal`}
              style={{ color: displayValue ? getTextColor() : theme.colorFgTransparentStrong, lineHeight: lineHeights[size], transform: [{ translateY: -1 }] }}
            >
              {displayValue || (showPlaceholder ? 'Select date' : '')}
            </Text>
          </View>

          {/* Calendar Icon */}
          <Icon name="calendar" size={iconSize} color={getIconColor()} />
        </TouchableOpacity>

        {/* Helper Text or Error Message */}
        {displayHelperText && (
          <Text
            className="text-body-sm font-normal self-start"
            style={{ color: getHelperTextColor(), lineHeight: 20 }}
          >
            {displayHelperText}
          </Text>
        )}

        {/* iOS: Inline Expanded Picker */}
        {Platform.OS === 'ios' && showPicker && (
          <View
            className="mt-repeating-sm rounded-md p-around-default overflow-hidden"
            style={{ backgroundColor: theme.colorBgNeutralSubtle }}
          >
            <View className="items-center w-full">
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display={isTablet() ? 'inline' : 'spinner'}
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={theme.colorFgNeutralPrimary}
                style={{ width: '100%' }}
              />
            </View>

            <View className="mt-around-default">
              <Button
                type="primary"
                size="medium"
                onPress={handleClosePicker}
                style={{ width: '100%' }}
              >
                Done
              </Button>
            </View>
          </View>
        )}

        {/* Android: Native Date Picker */}
        {Platform.OS === 'android' && showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )}
      </View>
    );
  }
);

DateInput.displayName = 'DateInput';
