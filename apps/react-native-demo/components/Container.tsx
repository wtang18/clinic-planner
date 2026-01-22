/**
 * Container Component - React Native (NativeWind)
 * Wrapper component with consistent spacing and layout
 *
 * FIGMA SPECIFICATIONS:
 * - Background: rgba(0,0,0,0.06) - bg/transparent/subtle
 * - Hover Background: rgba(0,0,0,0.12) - bg/transparent/subtle-accented (Press on mobile)
 * - Border Radius: 16px
 * - Padding: 16px (all sides)
 * - Default Gap: 16px between children
 * - Disabled: 50% opacity
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme';

export interface ContainerProps {
  /**
   * Container content (typically Card components)
   */
  children: React.ReactNode;

  /**
   * Spacing between child elements
   * - "sm": 8px gap
   * - "md": 16px gap (default)
   * - "lg": 24px gap
   */
  gap?: 'sm' | 'md' | 'lg';

  /**
   * Whether container is interactive (clickable/pressable)
   * - "interactive": Pressable container with background color change on press
   * - "non-interactive": Static container (default)
   */
  variant?: 'interactive' | 'non-interactive';

  /**
   * Press handler (only applies to interactive variant)
   */
  onPress?: (e: GestureResponderEvent) => void;

  /**
   * Whether the container is disabled (interactive variant only)
   * Disabled containers have 50% opacity and cannot be interacted with
   */
  disabled?: boolean;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom className for NativeWind styling
   */
  className?: string;

  /**
   * Accessible label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint
   */
  accessibilityHint?: string;
}

// NativeWind gap classes
const gapClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'gap-repeating-sm',
  md: 'gap-related',
  lg: 'gap-separated-sm',
};

/**
 * Container component with design system integration
 *
 * @example
 * // Non-interactive container (default)
 * <Container>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 * </Container>
 *
 * @example
 * // Interactive container (pressable)
 * <Container variant="interactive" onPress={() => console.log('pressed')}>
 *   <Card>Card 1</Card>
 * </Container>
 */
export const Container = React.forwardRef<React.ElementRef<typeof View> | React.ElementRef<typeof TouchableOpacity>, ContainerProps>(
  (
    {
      children,
      gap = 'md',
      variant = 'non-interactive',
      onPress,
      disabled = false,
      style,
      className = '',
      accessibilityLabel,
      accessibilityHint,
    },
    ref
  ) => {
    const theme = useTheme();
    const isInteractive = variant === 'interactive';
    const isDisabled = isInteractive && disabled;
    const [isPressed, setIsPressed] = useState(false);

    // Get background color based on state (uses theme for dark mode)
    const getBackgroundColor = (): string => {
      if (!isInteractive || isDisabled) {
        return theme.colorBgTransparentSubtle;
      }
      return isPressed ? theme.colorBgTransparentSubtleAccented : theme.colorBgTransparentSubtle;
    };

    // Computed dynamic styles
    const computedStyle: ViewStyle = {
      backgroundColor: getBackgroundColor(),
      opacity: isDisabled ? 0.5 : 1,
    };

    // Base classes
    const baseClasses = `flex-col items-stretch p-around-default rounded-md ${gapClasses[gap]} ${className}`;

    // Handle press events
    const handlePress = (e: GestureResponderEvent) => {
      if (isDisabled) return;
      if (isInteractive && onPress) onPress(e);
    };

    // If interactive, use TouchableOpacity
    if (isInteractive) {
      return (
        <TouchableOpacity
          ref={ref as React.Ref<React.ElementRef<typeof TouchableOpacity>>}
          className={baseClasses}
          style={[computedStyle, style]}
          onPress={handlePress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          disabled={isDisabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          activeOpacity={0.9}
        >
          {children}
        </TouchableOpacity>
      );
    }

    // Otherwise, use static View
    return (
      <View
        ref={ref as React.Ref<View>}
        className={baseClasses}
        style={[computedStyle, style]}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    );
  }
);

Container.displayName = 'Container';
