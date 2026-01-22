/**
 * Button Component - React Native (NativeWind)
 * Maintains API compatibility with web Button component
 * Supports automatic light/dark mode via useTheme() hook
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import type { IconName, BicolorIconName } from '../icons';
import { Icon, BicolorIcon } from '../icons';
import { useTheme, ThemeTokens } from '../theme';
import { dimensionRadiusFull } from '../../../src/design-system/tokens/build/react-native/tokens';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

export type ButtonType =
  | 'primary'
  | 'outlined'
  | 'solid'
  | 'transparent'
  | 'generative'
  | 'high-impact'
  | 'no-fill'
  | 'subtle'
  | 'carby';

export type ButtonSize = 'x-small' | 'small' | 'medium' | 'large' | 'large-floating';

export interface ButtonProps {
  // Core variant props
  type?: ButtonType;
  size?: ButtonSize;
  iconOnly?: boolean;

  // Text content
  label?: string;
  subtext?: string;
  showSubtext?: boolean;

  // Icon props (matching web API)
  /** Icon name from icon library (left position) */
  iconL?: IconName;
  /** Bicolor icon for left position (takes precedence over iconL) */
  bicolorIconL?: BicolorIconName;
  /** Icon name from icon library (right position) */
  iconR?: IconName;
  /** Bicolor icon for right position (takes precedence over iconR) */
  bicolorIconR?: BicolorIconName;

  // State
  disabled?: boolean;
  state?: 'default' | 'hover' | 'disabled';

  // Callbacks
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;

  // Style
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Children
  children?: React.ReactNode;
}

// NativeWind class mappings for sizes
const sizeClasses: Record<ButtonSize, string> = {
  'x-small': 'h-6 px-around-compact py-around-nudge2',
  'small': 'h-8 px-around-compact py-around-nudge6',
  'medium': 'h-10 px-around-default py-around-tight-plus',
  'large': 'h-14 px-around-spacious py-around-default',
  'large-floating': 'h-14 px-around-spacious py-around-default',
};

// Text size classes (lineHeight applied via inline style)
const textSizeClasses: Record<ButtonSize, string> = {
  'x-small': 'text-body-xs',
  'small': 'text-body-sm',
  'medium': 'text-body-md',
  'large': 'text-body-lg',
  'large-floating': 'text-body-lg',
};

// Line heights for each size
const lineHeights: Record<ButtonSize, number> = {
  'x-small': 20,
  'small': 20,
  'medium': 24,
  'large': 24,
  'large-floating': 24,
};

// Gap classes
const gapClasses: Record<ButtonSize, string> = {
  'x-small': 'gap-coupled',
  'small': 'gap-coupled',
  'medium': 'gap-repeating-sm',
  'large': 'gap-repeating-sm',
  'large-floating': 'gap-repeating-sm',
};

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  (
    {
      type = 'primary',
      size = 'small',
      iconOnly = false,
      label = 'Label',
      subtext = 'Subtext',
      showSubtext = false,
      iconL,
      bicolorIconL,
      iconR,
      bicolorIconR,
      disabled = false,
      state = 'default',
      onPress,
      onPressIn,
      onPressOut,
      style,
      textStyle,
      className = '',
      accessibilityLabel,
      accessibilityHint,
      children,
    },
    ref
  ) => {
    const theme = useTheme();
    const isDisabled = disabled || state === 'disabled';

    // Compute icon size based on button size
    const iconSize = size === 'large' || size === 'large-floating' ? 'medium' : 'small';

    // Get text color based on type (uses theme for dark mode support)
    const getTextColor = (): string => {
      const colorMap: Record<ButtonType, string> = {
        primary: theme.colorFgNeutralInversePrimary,
        outlined: theme.colorFgNeutralPrimary,
        solid: theme.colorFgNeutralPrimary,
        transparent: theme.colorFgNeutralPrimary,
        generative: theme.colorFgPositiveInversePrimary,
        'high-impact': theme.colorFgAlertInversePrimary,
        'no-fill': theme.colorFgNeutralPrimary,
        subtle: theme.colorFgNeutralPrimary,
        carby: theme.colorFgCarbyPrimary,
      };
      return colorMap[type];
    };

    // Get background color (uses theme for dark mode support)
    const getBackgroundColor = (): string => {
      const bgMap: Record<ButtonType, string> = {
        primary: theme.colorBgNeutralInverseBase,
        outlined: 'transparent',
        solid: theme.colorBgNeutralMedium,
        transparent: theme.colorBgTransparentLow,
        generative: theme.colorBgPositiveHigh,
        'high-impact': theme.colorBgAlertHigh,
        'no-fill': 'transparent',
        subtle: theme.colorBgNeutralSubtle,
        carby: theme.colorBgCarbyDefault,
      };
      return bgMap[type];
    };

    // Get border color (uses theme for dark mode support)
    const getBorderColor = (): string => {
      if (type === 'outlined') return theme.colorBgNeutralMedium;
      return 'transparent';
    };

    // Render icons
    const renderedLeftIcon = bicolorIconL ? (
      <BicolorIcon name={bicolorIconL} size={iconSize} />
    ) : iconL ? (
      <Icon name={iconL} size={iconSize} color={getTextColor()} />
    ) : null;

    const renderedRightIcon = bicolorIconR ? (
      <BicolorIcon name={bicolorIconR} size={iconSize} />
    ) : iconR ? (
      <Icon name={iconR} size={iconSize} color={getTextColor()} />
    ) : null;

    const isTransparent = type === 'transparent' || type === 'no-fill';

    // Computed styles that can't be className (dynamic values)
    const computedContainerStyle: ViewStyle = {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      opacity: isDisabled ? 0.5 : 1,
      ...(iconOnly ? { aspectRatio: 1, paddingHorizontal: 0 } : {}),
      ...(size === 'large-floating' ? elevation.md : {}),
    };

    const buttonContent = (
      <View className={`flex-row items-center ${gapClasses[size]}`}>
        {/* Left Icon */}
        {(bicolorIconL || iconL) && <View>{renderedLeftIcon}</View>}

        {/* Text Content */}
        {!iconOnly && (
          <View>
            <Text
              className={`font-medium ${textSizeClasses[size]}`}
              style={[{ color: getTextColor(), lineHeight: lineHeights[size] }, textStyle]}
            >
              {children || label}
              {showSubtext && subtext && (
                <Text className="font-normal opacity-60"> {subtext}</Text>
              )}
            </Text>
          </View>
        )}

        {/* Right Icon */}
        {(bicolorIconR || iconR) && <View>{renderedRightIcon}</View>}
      </View>
    );

    return (
      <TouchableOpacity
        ref={ref}
        className={`flex-row items-center justify-center rounded-full border self-start ${sizeClasses[size]} ${className}`}
        style={[
          computedContainerStyle,
          isTransparent && { backgroundColor: 'transparent', overflow: 'hidden' },
          style,
        ]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel || (iconOnly ? label : undefined)}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        activeOpacity={0.7}
      >
        {isTransparent ? (
          <>
            <BlurView
              intensity={20}
              tint="light"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: dimensionRadiusFull.number },
              ]}
            />
            {/* Semi-transparent overlay to preserve dark tint */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: type === 'transparent' ? theme.colorBgTransparentLow : 'rgba(0,0,0,0.05)',
                borderRadius: dimensionRadiusFull.number,
              }}
            />
            {buttonContent}
          </>
        ) : (
          buttonContent
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
