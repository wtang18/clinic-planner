/**
 * SegmentedControl Component - React Native (NativeWind)
 * Multi-choice control with mutually exclusive segments
 * Supports automatic light/dark mode via useTheme() hook
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

export interface SegmentOption {
  value: string;
  label: string;
  subtext?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Array of segment options */
  options: SegmentOption[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Disable all segments */
  disabled?: boolean;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// NativeWind size classes for segments
const segmentSizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'py-around-nudge2 px-around-compact',
  medium: 'py-around-tight px-around-compact',
  large: 'py-around-compact px-around-compact',
};

// Text size classes (lineHeight applied via inline style)
const textSizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'text-body-sm',
  medium: 'text-body-md',
  large: 'text-body-lg',
};

// Line heights for each size
const lineHeights: Record<'small' | 'medium' | 'large', number> = {
  small: 20,
  medium: 24,
  large: 24,
};

/**
 * SegmentedControl component for React Native
 *
 * SPECIFICATIONS:
 * - Container: 4px padding, rounded-full, bg-transparent-subtle
 * - Segments: 12px h-padding, variable v-padding, rounded-full
 * - Selected: white bg with elevation-sm shadow
 * - Typography: Bold (selected), Medium (unselected)
 *
 * @example
 * <SegmentedControl
 *   options={[
 *     { value: 'day', label: 'Day' },
 *     { value: 'week', label: 'Week' },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 */
export const SegmentedControl = React.forwardRef<View, SegmentedControlProps>(
  (
    {
      options,
      value,
      onChange,
      size = 'medium',
      disabled = false,
      style,
      className = '',
      accessibilityLabel,
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        className={`flex-row rounded-full p-around-nudge4 overflow-hidden ${className}`}
        style={[{ backgroundColor: 'transparent' }, style]}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Blur background */}
        <BlurView
          intensity={20}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
        />
        {/* Semi-transparent overlay */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.colorBgTransparentSubtle,
            borderRadius: 999,
          }}
        />

        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          // Computed segment styles (dynamic based on selection)
          const segmentStyle: ViewStyle = {
            backgroundColor: isSelected ? theme.colorBgNeutralBase : 'transparent',
            opacity: isDisabled ? 0.5 : 1,
            ...(isSelected ? elevation.sm : {}),
          };

          // Text color based on state
          const textColor = isDisabled
            ? theme.colorFgNeutralDisabled
            : isSelected
            ? theme.colorFgNeutralPrimary
            : theme.colorFgNeutralSecondary;

          return (
            <TouchableOpacity
              key={option.value}
              className={`flex-1 rounded-full flex-row items-center justify-center min-w-0 ${segmentSizeClasses[size]}`}
              style={segmentStyle}
              onPress={() => {
                if (!isDisabled) onChange(option.value);
              }}
              disabled={isDisabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
              accessibilityLabel={option.label}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-coupled">
                <Text
                  className={`text-center ${textSizeClasses[size]} ${isSelected ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: textColor, lineHeight: lineHeights[size] }}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
                {option.subtext && (
                  <Text
                    className={`text-center font-normal opacity-60 ${textSizeClasses[size]}`}
                    style={{ color: textColor, lineHeight: lineHeights[size] }}
                    numberOfLines={1}
                  >
                    {option.subtext}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';
