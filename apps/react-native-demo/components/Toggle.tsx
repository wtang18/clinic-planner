/**
 * Toggle/Switch Component - React Native (NativeWind)
 * Switch control for binary on/off states
 * Supports automatic light/dark mode via useTheme() hook
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, Animated } from 'react-native';
import { useTheme } from '../theme';
import { dimensionSpaceAroundNudge2 } from '../../../src/design-system/tokens/build/react-native/tokens';

export interface ToggleProps {
  /** Whether the toggle is checked/on */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Optional label text */
  label?: string;
  /** Label position relative to toggle */
  labelPosition?: 'left' | 'right';
  /** Additional style */
  style?: StyleProp<ViewStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Accessible label (required if no label prop provided) */
  accessibilityLabel?: string;
  /** ID of element describing the toggle */
  accessibilityHint?: string;
}

// Track size configurations
const trackSizes = {
  small: { width: 32, height: 18, thumbSize: 14 },
  medium: { width: 48, height: 28, thumbSize: 24 },
};

/**
 * Toggle/Switch component for React Native
 *
 * SPECIFICATIONS:
 * - Medium: 48x28px track, 24x24px thumb, 2px padding
 * - Small: 32x18px track, 14x14px thumb, 2px padding
 * - Off state: rgba(0,0,0,0.12) track, white thumb
 * - On state: #376c89 track (bg-input-high), white thumb
 * - Disabled: 50% opacity
 * - Smooth animated transition
 *
 * @example
 * const [checked, setChecked] = useState(false);
 * <Toggle checked={checked} onChange={setChecked} label="Enable notifications" />
 */
export const Toggle = React.forwardRef<View, ToggleProps>(
  (
    {
      checked,
      onChange,
      size = 'medium',
      disabled = false,
      label,
      labelPosition = 'right',
      style,
      className = '',
      accessibilityLabel,
      accessibilityHint,
    },
    ref
  ) => {
    const theme = useTheme();

    // Validation: Toggle requires either label or accessibilityLabel
    if (!label && !accessibilityLabel) {
      console.warn('Toggle: Either "label" or "accessibilityLabel" prop is required for accessibility');
    }

    // Animation for thumb position
    const thumbPosition = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

    React.useEffect(() => {
      Animated.spring(thumbPosition, {
        toValue: checked ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 120,
      }).start();
    }, [checked, thumbPosition]);

    const { width: trackWidth, height: trackHeight, thumbSize } = trackSizes[size];
    const padding = dimensionSpaceAroundNudge2.number;
    const translateDistance = trackWidth - thumbSize - (padding * 2);

    // Track styles (animated background needs inline style)
    const trackStyle: ViewStyle = {
      width: trackWidth,
      height: trackHeight,
      minWidth: trackWidth,
      backgroundColor: checked ? theme.colorBgInputHigh : theme.colorBgTransparentLow,
      opacity: disabled ? 0.5 : 1,
    };

    // Thumb styles with animation (must be inline for Animated)
    const thumbStyle = {
      width: thumbSize,
      height: thumbSize,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      transform: [
        {
          translateX: thumbPosition.interpolate({
            inputRange: [0, 1],
            outputRange: [0, translateDistance],
          }),
        },
      ],
    };

    const handlePress = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    const toggleElement = (
      <TouchableOpacity
        ref={ref as any}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="switch"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        className={`rounded-full p-around-nudge2 flex-row items-center justify-start ${!label ? className : ''}`}
        style={[trackStyle, !label && style]}
      >
        <Animated.View style={thumbStyle} />
      </TouchableOpacity>
    );

    // If no label, return just the toggle
    if (!label) {
      return toggleElement;
    }

    // With label, wrap in container
    return (
      <View
        className={`flex-row items-center gap-repeating-sm ${className}`}
        style={style}
      >
        {labelPosition === 'left' && (
          <Text
            className="text-body-sm font-medium"
            style={{ color: theme.colorFgNeutralPrimary, opacity: disabled ? 0.5 : 1, lineHeight: 20 }}
          >
            {label}
          </Text>
        )}
        {toggleElement}
        {labelPosition === 'right' && (
          <Text
            className="text-body-sm font-medium"
            style={{ color: theme.colorFgNeutralPrimary, opacity: disabled ? 0.5 : 1, lineHeight: 20 }}
          >
            {label}
          </Text>
        )}
      </View>
    );
  }
);

Toggle.displayName = 'Toggle';
