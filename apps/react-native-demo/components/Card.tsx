/**
 * Card Component - React Native
 * NativeWind implementation with design system tokens
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';

// Import elevation tokens (shadows require native handling in RN)
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';
import { useTheme } from '../theme';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Size of the card
   * - "small": 8px radius, 12px padding
   * - "medium": 16px radius, 16px padding (default)
   */
  size?: 'small' | 'medium';

  /**
   * Whether card is interactive (clickable/hoverable)
   * - "interactive": Clickable/hoverable card with shadow effects
   * - "non-interactive": Static container without shadow
   */
  variant?: 'interactive' | 'non-interactive';

  /**
   * Press handler (only applies to interactive variant)
   */
  onPress?: (e: GestureResponderEvent) => void;

  /**
   * Whether the card is disabled (interactive variant only)
   * Disabled cards have 50% opacity and cannot be interacted with
   */
  disabled?: boolean;

  /**
   * Custom style (merged with NativeWind classes)
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Additional className for NativeWind styling
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

/**
 * Card component with NativeWind + design system tokens
 *
 * @example
 * // Small non-interactive card (static container)
 * <Card size="small" variant="non-interactive">
 *   <Text>Card content goes here</Text>
 * </Card>
 *
 * @example
 * // Medium interactive card (clickable) - default size
 * <Card variant="interactive" onPress={() => console.log('pressed')}>
 *   <Text>Clickable Card</Text>
 * </Card>
 *
 * @example
 * // With custom NativeWind classes
 * <Card className="border border-border-neutral-low">
 *   <Text>Custom styled card</Text>
 * </Card>
 */
export const Card = React.forwardRef<View, CardProps>(
  (
    {
      children,
      size = 'medium',
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

    // Base classes (always applied) - no bg color, applied via style for theme support
    const baseClasses = 'flex-col items-start justify-center';

    // Size-based classes
    const sizeClasses = {
      small: 'rounded-sm p-around-sm gap-related-sm',
      medium: 'rounded-md p-around-md gap-related',
    };

    // Opacity class for disabled state
    const opacityClass = isDisabled ? 'opacity-50' : '';

    // Combine all classes
    const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${opacityClass} ${className}`.trim();

    // Get elevation style (shadows need native StyleSheet in RN)
    const getElevationStyle = (): ViewStyle => {
      if (!isInteractive || isDisabled) {
        return {};
      }
      return isPressed ? elevation.md : elevation.sm;
    };

    // Handle press events
    const handlePress = (e: GestureResponderEvent) => {
      if (isDisabled) return;
      if (isInteractive && onPress) {
        onPress(e);
      }
    };

    // If interactive, use TouchableOpacity
    if (isInteractive) {
      return (
        <TouchableOpacity
          ref={ref as any}
          className={combinedClasses}
          style={[{ backgroundColor: theme.colorBgNeutralBase }, getElevationStyle(), style]}
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
        ref={ref}
        className={combinedClasses}
        style={[{ backgroundColor: theme.colorBgNeutralBase }, style]}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
