/**
 * Select Component - React Native (NativeWind)
 * Dropdown select with native picker
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Icon } from '../icons';
import { Button } from './Button';
import { useTheme, ThemeTokens } from '../theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /** Visual type of the select */
  type?: 'outlined' | 'filled';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Label text displayed above select */
  label?: string;
  /** Helper text displayed below select */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Whether the select is required */
  required?: boolean;
  /** Current selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Additional style for wrapper */
  style?: StyleProp<ViewStyle>;
  /** Additional style for select container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Whether the select is disabled */
  editable?: boolean;
}

// Size classes
const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-14',
};

/**
 * Select component for React Native
 *
 * SPECIFICATIONS:
 * - Border Radius: 8px
 * - Icon Size: 20px (small/medium), 24px (large)
 * - Gap: 8px between elements
 *
 * @example
 * <Select
 *   label="Country"
 *   value={country}
 *   onChange={setCountry}
 *   options={[
 *     { label: 'United States', value: 'us' },
 *     { label: 'Canada', value: 'ca' },
 *   ]}
 * />
 */
export const Select = React.forwardRef<View, SelectProps>(
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
      options,
      placeholder = 'Select an option',
      style,
      containerStyle,
      className = '',
      accessibilityLabel,
      accessibilityHint,
      editable = true,
    },
    ref
  ) => {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const isDisabled = !editable;

    const currentState = isDisabled
      ? 'disabled'
      : error
      ? 'error'
      : isFocused
      ? 'focused'
      : 'default';

    const handlePress = () => {
      if (!isDisabled) {
        if (showPicker) {
          setShowPicker(false);
          setIsFocused(false);
        } else {
          setTempValue(value);
          setShowPicker(true);
          setIsFocused(true);
        }
      }
    };

    const handleValueChange = (itemValue: string) => {
      setTempValue(itemValue);
      onChange?.(itemValue);
      setShowPicker(false);
      setIsFocused(false);
    };

    const handleDone = () => {
      if (tempValue !== undefined) {
        onChange?.(tempValue);
      }
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

    const getDisplayLabel = (): string => {
      if (!value) return placeholder;
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption?.label || placeholder;
    };

    const displayHelperText = error && errorMessage ? errorMessage : helperText;

    return (
      <View className={`gap-coupled ${className}`} style={style} ref={ref}>
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

        {/* Select Container */}
        <TouchableOpacity
          className={`flex-row items-center rounded-sm gap-related-sm self-stretch ${sizeClasses[size]} ${paddingClass}`}
          style={[containerColors, containerStyle]}
          onPress={handlePress}
          disabled={isDisabled}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || 'Tap to select an option'}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
        >
          {/* Selected Value Display */}
          <Text
            className="flex-1 text-body-sm font-normal"
            style={{ color: value ? getTextColor() : theme.colorFgTransparentStrong, lineHeight: 20, transform: [{ translateY: -1 }] }}
          >
            {getDisplayLabel()}
          </Text>

          {/* Chevron Icon */}
          <Icon name="chevron-compact-down" size="small" color={getIconColor()} />
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
              <Picker
                selectedValue={tempValue}
                onValueChange={handleValueChange}
                style={{ width: '100%' }}
              >
                {options.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <View className="mt-around-default">
              <Button
                type="primary"
                size="medium"
                onPress={handleDone}
                style={{ width: '100%' }}
              >
                Done
              </Button>
            </View>
          </View>
        )}

        {/* Android: Native Picker Dialog */}
        {Platform.OS === 'android' && showPicker && (
          <Picker
            selectedValue={value}
            onValueChange={handleValueChange}
            style={{ position: 'absolute', opacity: 0 }}
          >
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        )}
      </View>
    );
  }
);

Select.displayName = 'Select';
