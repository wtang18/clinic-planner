/**
 * SearchInput Component - React Native (NativeWind)
 * Search input with magnifying glass icon and clear button
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Icon } from '../icons';
import { useTheme } from '../theme';

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  /** Current value of the search input */
  value: string;
  /** Change handler - receives the new value directly */
  onChangeText: (value: string) => void;
  /** Placeholder text @default "Search" */
  placeholder?: string;
  /** Size variant: "small" (32px), "medium" (40px), "large" (56px) */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  editable?: boolean;
  /** Optional clear handler */
  onClear?: () => void;
  /** Additional style for the container */
  style?: StyleProp<ViewStyle>;
  /** Additional style for the input field */
  inputStyle?: StyleProp<TextStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Whether to show placeholder text (default: true) */
  showPlaceholder?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Size classes
const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-8 px-around-compact py-around-nudge6',
  medium: 'h-10 px-around-tight-plus py-around-tight-plus',
  large: 'h-14 px-around-default py-around-default',
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
 * SearchInput component
 *
 * SPECIFICATIONS:
 * - Background: rgba(0,0,0,0.12) with backdrop-blur
 * - Hover/Focused: rgba(0,0,0,0.20)
 * - Border Radius: 999px (pill-shaped)
 * - Icon Size: 20px (small/medium), 24px (large)
 * - Gap: 8px between elements
 *
 * @example
 * <SearchInput value={query} onChangeText={setQuery} />
 */
export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  (
    {
      value,
      onChangeText,
      placeholder = 'Search',
      size = 'medium',
      editable = true,
      onClear,
      style,
      inputStyle,
      className = '',
      showPlaceholder = true,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = !editable;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleClear = () => {
      onChangeText('');
      onClear?.();
    };

    const iconSize = size === 'large' ? 'medium' : 'small';

    // Get background color based on state (uses theme for dark mode)
    const getBackgroundColor = (): string => {
      if (isDisabled) return theme.colorBgTransparentLow;
      if (isFocused) return theme.colorBgTransparentMedium;
      return theme.colorBgTransparentLow;
    };

    return (
      <View
        className={`flex-row items-center rounded-full gap-repeating-sm ${sizeClasses[size]} ${className}`}
        style={[{ backgroundColor: getBackgroundColor() }, style]}
      >
        {/* Search Icon */}
        <Icon
          name="magnifying-glass"
          size={iconSize}
          color={theme.colorFgNeutralSecondary}
        />

        {/* Input Field */}
        <View className="flex-1 justify-center">
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={showPlaceholder ? placeholder : undefined}
            placeholderTextColor={theme.colorFgTransparentStrong}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`${textSizeClasses[size]} font-normal p-0 m-0`}
            style={[
              {
                color: isDisabled ? theme.colorFgNeutralSecondary : theme.colorFgNeutralPrimary,
                lineHeight: lineHeights[size],
                transform: [{ translateY: -1 }],
                outlineStyle: 'none',
              } as any,
              inputStyle,
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="search"
            accessibilityState={{ disabled: isDisabled }}
            {...props}
          />
        </View>

        {/* Clear Button */}
        {value && !isDisabled && (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.7}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name="x"
              size={iconSize}
              color={theme.colorFgNeutralPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

SearchInput.displayName = 'SearchInput';
