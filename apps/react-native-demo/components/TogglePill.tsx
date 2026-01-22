/**
 * TogglePill Component - React Native (NativeWind)
 * Interactive pill that toggles between selected/unselected states
 * Supports automatic light/dark mode via useTheme() hook
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Icon, BicolorIcon, type IconName, type BicolorIconName } from '../icons';
import { useTheme } from '../theme';

export interface TogglePillProps {
  /** Size variant */
  size?: 'x-small' | 'small' | 'medium' | 'large';
  /** Main label text */
  label: string;
  /** Left icon name */
  iconL?: IconName;
  /** Bicolor icon for left position (takes precedence over iconL) */
  bicolorIconL?: BicolorIconName;
  /** Custom left icon (React element) */
  leftIcon?: React.ReactNode;
  /** Right icon name */
  iconR?: IconName;
  /** Bicolor icon for right position (takes precedence over iconR) */
  bicolorIconR?: BicolorIconName;
  /** Custom right icon (React element) */
  rightIcon?: React.ReactNode;
  /** Left subtext content */
  leftSubtext?: string;
  /** Right subtext content */
  rightSubtext?: string;
  /** Whether the pill is selected */
  selected: boolean;
  /** Callback when selection state changes */
  onChange?: (selected: boolean) => void;
  /** Whether the pill is disabled */
  disabled?: boolean;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Accessible label (required for screen readers) */
  accessibilityLabel?: string;
  /** ID of element describing the pill */
  accessibilityHint?: string;
}

// NativeWind size classes
const sizeClasses: Record<'x-small' | 'small' | 'medium' | 'large', string> = {
  'x-small': 'h-5 px-around-nudge6 rounded-xs',
  'small': 'h-6 px-around-nudge6 py-around-nudge2 rounded-sm',
  'medium': 'h-8 px-around-tight py-around-nudge6 rounded-sm',
  'large': 'h-10 px-around-compact py-around-tight-plus rounded-sm',
};

// Text size classes (lineHeight applied via inline style)
const textSizeClasses: Record<'x-small' | 'small' | 'medium' | 'large', string> = {
  'x-small': 'text-body-xs font-medium',
  'small': 'text-body-xs font-medium',
  'medium': 'text-body-sm font-medium',
  'large': 'text-body-sm font-medium',
};

// Line heights for each size
const lineHeights: Record<'x-small' | 'small' | 'medium' | 'large', number> = {
  'x-small': 20,
  'small': 20,
  'medium': 20,
  'large': 20,
};

/**
 * TogglePill component for React Native
 *
 * SPECIFICATIONS:
 * - Sizes: x-small (20px), small (24px), medium (32px), large (40px)
 * - Unselected: Inset shadow (border simulation), secondary text
 * - Selected: Blue background (#c9e6f0), primary text, no border
 * - Disabled: Subtle colors
 * - Gap: 4px between elements
 * - Icons: Always 20px (small size), hidden on x-small
 *
 * @example
 * const [selected, setSelected] = useState(false);
 * <TogglePill label="Filter" selected={selected} onChange={setSelected} />
 */
export const TogglePill = React.forwardRef<View, TogglePillProps>(
  (
    {
      size = 'medium',
      label,
      iconL,
      bicolorIconL,
      leftIcon,
      iconR,
      bicolorIconR,
      rightIcon,
      leftSubtext,
      rightSubtext,
      selected,
      onChange,
      disabled = false,
      style,
      className = '',
      accessibilityLabel,
      accessibilityHint,
    },
    ref
  ) => {
    const theme = useTheme();
    // Icon size is always small (20px) for pills
    const iconSize = 'small';

    // Render icons with correct size (bicolor icons take precedence)
    const renderedLeftIcon = bicolorIconL ? (
      <BicolorIcon name={bicolorIconL} size={iconSize} />
    ) : iconL ? (
      <Icon name={iconL} size={iconSize} />
    ) : (
      leftIcon
    );

    const renderedRightIcon = bicolorIconR ? (
      <BicolorIcon name={bicolorIconR} size={iconSize} />
    ) : iconR ? (
      <Icon name={iconR} size={iconSize} />
    ) : (
      rightIcon
    );

    // Icon visibility logic - hide on x-small
    const hasLeftIcon = !!(bicolorIconL || iconL || leftIcon);
    const hasRightIcon = !!(bicolorIconR || iconR || rightIcon);
    const shouldShowLeftIcon = hasLeftIcon && size !== 'x-small';
    const shouldShowRightIcon = hasRightIcon && size !== 'x-small';

    const handlePress = () => {
      if (!disabled && onChange) {
        onChange(!selected);
      }
    };

    // Get text color based on selected and disabled states (uses theme for dark mode)
    const getTextColor = (): string => {
      if (disabled) return theme.colorFgNeutralDisabled;
      return selected ? theme.colorFgNeutralPrimary : theme.colorFgNeutralSecondary;
    };

    // Get container styles (uses theme for dark mode)
    const getContainerStyle = (): ViewStyle => {
      let backgroundColor: string;
      let borderColor: string;

      if (disabled) {
        backgroundColor = selected ? theme.colorBgNeutralSubtle : 'transparent';
        borderColor = selected ? 'transparent' : theme.colorBgTransparentLow;
      } else {
        backgroundColor = selected ? theme.colorBgInputLow : 'transparent';
        borderColor = selected ? 'transparent' : theme.colorBgTransparentLow;
      }

      return {
        backgroundColor,
        borderWidth: 1,
        borderColor,
      };
    };

    const textColor = getTextColor();

    return (
      <TouchableOpacity
        ref={ref as any}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        accessibilityRole="switch"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        className={`flex-row items-center justify-center self-start gap-coupled ${sizeClasses[size]} ${className}`}
        style={[getContainerStyle(), style]}
      >
        {/* Left icon */}
        {shouldShowLeftIcon && renderedLeftIcon}

        {/* Left subtext */}
        {leftSubtext && (
          <Text
            className={`${textSizeClasses[size]} font-normal`}
            style={{ color: textColor, lineHeight: lineHeights[size] }}
          >
            {leftSubtext}
          </Text>
        )}

        {/* Main label */}
        <Text className={textSizeClasses[size]} style={{ color: textColor, lineHeight: lineHeights[size] }}>
          {label}
        </Text>

        {/* Right subtext */}
        {rightSubtext && (
          <Text
            className={`${textSizeClasses[size]} font-normal`}
            style={{ color: textColor, lineHeight: lineHeights[size] }}
          >
            {rightSubtext}
          </Text>
        )}

        {/* Right icon */}
        {shouldShowRightIcon && renderedRightIcon}
      </TouchableOpacity>
    );
  }
);

TogglePill.displayName = 'TogglePill';
