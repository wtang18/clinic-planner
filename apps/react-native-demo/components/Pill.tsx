/**
 * Pill Component - React Native (NativeWind)
 * Tag/badge component with multiple variants
 * Supports automatic light/dark mode via useTheme() hook
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { IconName } from '../icons';
import { Icon, BicolorIcon, type BicolorIconName } from '../icons';

export type PillType =
  | 'transparent'
  | 'outlined'
  | 'subtle-outlined'
  | 'positive'
  | 'attention'
  | 'alert'
  | 'alert-emphasis'
  | 'info'
  | 'info-emphasis'
  | 'accent'
  | 'accent-emphasis'
  | 'no-fill'
  | 'carby';

export type PillSize = 'x-small' | 'small' | 'medium';

export interface PillProps {
  // Core variant props
  type?: PillType;
  size?: PillSize;
  iconOnly?: boolean;
  truncate?: boolean;
  interactive?: boolean;
  state?: 'default' | 'hover' | 'disabled';
  disabled?: boolean;

  // Content
  label?: string;

  // Icons
  iconL?: IconName;
  iconR?: IconName;

  // Bicolor icons (takes precedence over regular icons if both provided)
  bicolorIconL?: BicolorIconName;
  bicolorIconR?: BicolorIconName;

  // Subtexts
  subtextL?: string;
  showSubtextL?: boolean;
  subtextR?: string;
  showSubtextR?: boolean;

  // Events
  onPress?: () => void;

  // Style
  style?: StyleProp<ViewStyle>;
  className?: string;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  children?: React.ReactNode;
}

// NativeWind size classes
const sizeClasses: Record<PillSize, string> = {
  'x-small': 'h-5 px-around-nudge6 rounded-xs',
  'small': 'h-6 px-around-nudge6 py-around-nudge2 rounded-sm',
  'medium': 'h-8 px-around-tight py-around-nudge6 rounded-sm',
};

// Text size classes (lineHeight applied via inline style)
const textSizeClasses: Record<PillSize, string> = {
  'x-small': 'text-body-xs font-medium',
  'small': 'text-body-xs font-medium',
  'medium': 'text-body-sm font-medium',
};

// Line heights for each size
const lineHeights: Record<PillSize, number> = {
  'x-small': 16,
  'small': 16,
  'medium': 20,
};

export const Pill = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, PillProps>(
  (
    {
      type = 'transparent',
      size = 'medium',
      iconOnly = false,
      truncate = false,
      interactive = false,
      state = 'default',
      disabled,
      label,
      iconL,
      iconR,
      bicolorIconL,
      bicolorIconR,
      subtextL,
      showSubtextL,
      subtextR,
      showSubtextR,
      onPress,
      style,
      className = '',
      accessibilityLabel,
      accessibilityHint,
      children,
    },
    ref
  ) => {
    const theme = useTheme();
    const isDisabled = disabled || state === 'disabled';

    // Validation warnings
    if (iconOnly && !accessibilityLabel && !label) {
      console.warn('Pill: iconOnly pills require an accessibilityLabel or label prop for accessibility');
    }
    if (size === 'x-small' && iconOnly) {
      console.warn('Pill: iconOnly is not supported for x-small size');
    }

    // Icon visibility logic
    const hasLeftIcon = !!bicolorIconL || !!iconL;
    const hasRightIcon = !!bicolorIconR || !!iconR;
    const shouldShowLeftIcon = hasLeftIcon && size !== 'x-small';
    const shouldShowRightIcon = hasRightIcon && size !== 'x-small' && !iconOnly;

    // Subtext visibility logic
    const hasSubtextL = !!subtextL;
    const hasSubtextR = !!subtextR;
    const shouldShowSubtextL = hasSubtextL && !iconOnly && (showSubtextL !== false);
    const shouldShowSubtextR = hasSubtextR && !iconOnly && (showSubtextR !== false);

    // Get background color based on type and state (uses theme for dark mode)
    const getBackgroundColor = () => {
      if (isDisabled) {
        return theme.colorBgNeutralLow;
      }

      // Hover state (only for interactive pills)
      if (interactive && state === 'hover') {
        const hoverColors: Record<PillType, string> = {
          transparent: theme.colorBgTransparentLowAccented,
          outlined: theme.colorBgNeutralMedium,
          'subtle-outlined': theme.colorBgNeutralSubtle,
          positive: theme.colorBgPositiveLowAccented,
          attention: theme.colorBgAttentionLowAccented,
          alert: theme.colorBgAlertLowAccented,
          'alert-emphasis': theme.colorBgAlertHighAccented,
          info: theme.colorBgInformationLowAccented,
          'info-emphasis': theme.colorBgInformationHighAccented,
          accent: theme.colorBgAccentLowAccented,
          'accent-emphasis': theme.colorBgAccentHighAccented,
          'no-fill': theme.colorBgNeutralSubtle,
          carby: theme.colorBgCarbyDefault,
        };
        return hoverColors[type];
      }

      // Default background colors
      const bgColors: Record<PillType, string> = {
        transparent: theme.colorBgTransparentLow,
        outlined: 'transparent',
        'subtle-outlined': 'transparent',
        positive: theme.colorBgPositiveLow,
        attention: theme.colorBgAttentionLow,
        alert: theme.colorBgAlertLow,
        'alert-emphasis': theme.colorBgAlertHigh,
        info: theme.colorBgInformationLow,
        'info-emphasis': theme.colorBgInformationHigh,
        accent: theme.colorBgAccentLow,
        'accent-emphasis': theme.colorBgAccentHigh,
        'no-fill': 'transparent',
        carby: theme.colorBgCarbyDefault,
      };

      return bgColors[type];
    };

    // Get border color for outlined types (uses theme for dark mode)
    const getBorderStyle = () => {
      if (isDisabled) return { borderWidth: 0, borderColor: 'transparent' };
      if (type === 'outlined') return { borderWidth: 1, borderColor: theme.colorBgNeutralMedium };
      if (type === 'subtle-outlined') return { borderWidth: 1, borderColor: theme.colorBgNeutralSubtle };
      return { borderWidth: 0, borderColor: 'transparent' };
    };

    // Get text color based on type (uses theme for dark mode)
    const getTextColor = () => {
      if (isDisabled) return theme.colorFgNeutralDisabled;

      const textColors: Record<PillType, string> = {
        transparent: theme.colorFgNeutralPrimary,
        outlined: theme.colorFgNeutralPrimary,
        'subtle-outlined': theme.colorFgNeutralSecondary,
        positive: theme.colorFgPositivePrimary,
        attention: theme.colorFgAttentionPrimary,
        alert: theme.colorFgAlertPrimary,
        'alert-emphasis': theme.colorFgNeutralInversePrimary,
        info: theme.colorFgInformationPrimary,
        'info-emphasis': theme.colorFgNeutralInversePrimary,
        accent: theme.colorFgAccentPrimary,
        'accent-emphasis': theme.colorFgNeutralInversePrimary,
        'no-fill': theme.colorFgNeutralPrimary,
        carby: theme.colorFgCarbyPrimary,
      };

      return textColors[type];
    };

    // Get subtext color based on type (uses theme for dark mode)
    const getSubtextColor = () => {
      if (isDisabled) return theme.colorFgNeutralDisabled;

      const subtextColors: Record<PillType, string> = {
        transparent: theme.colorFgNeutralSecondary,
        outlined: theme.colorFgNeutralSecondary,
        'subtle-outlined': theme.colorFgNeutralSecondary,
        positive: theme.colorFgPositiveSecondary,
        attention: theme.colorFgAttentionSecondary,
        alert: theme.colorFgAlertSecondary,
        'alert-emphasis': theme.colorFgNeutralInversePrimary,
        info: theme.colorFgInformationSecondary,
        'info-emphasis': theme.colorFgNeutralInversePrimary,
        accent: theme.colorFgAccentSecondary,
        'accent-emphasis': theme.colorFgNeutralInversePrimary,
        'no-fill': theme.colorFgNeutralSecondary,
        carby: theme.colorFgPositiveSecondary,
      };

      return subtextColors[type];
    };

    const handlePress = () => {
      if (isDisabled) return;
      if (interactive && onPress) onPress();
    };

    const textColor = getTextColor();
    const subtextColor = getSubtextColor();

    // Render icons
    const renderedLeftIcon = bicolorIconL ? (
      <BicolorIcon name={bicolorIconL} size="small" />
    ) : iconL ? (
      <Icon name={iconL} size="small" color={textColor} />
    ) : null;

    const renderedRightIcon = bicolorIconR ? (
      <BicolorIcon name={bicolorIconR} size="small" />
    ) : iconR ? (
      <Icon name={iconR} size="small" color={textColor} />
    ) : null;

    // Computed dynamic styles
    const computedStyle = {
      backgroundColor: getBackgroundColor(),
      ...getBorderStyle(),
      opacity: isDisabled ? 0.5 : 1,
      ...(iconOnly ? { aspectRatio: 1, paddingHorizontal: 0, justifyContent: 'center' as const } : {}),
    };

    const accessibleLabel = accessibilityLabel || (iconOnly ? label : undefined);

    return (
      <TouchableOpacity
        ref={ref}
        className={`flex-row items-center self-start gap-coupled ${sizeClasses[size]} ${className}`}
        style={[computedStyle, style]}
        onPress={handlePress}
        disabled={!interactive || isDisabled}
        accessibilityRole={interactive ? 'button' : undefined}
        accessibilityLabel={accessibleLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled }}
        activeOpacity={interactive ? 0.7 : 1}
      >
        {/* Left icon */}
        {shouldShowLeftIcon && renderedLeftIcon}

        {/* Text content - hidden when iconOnly */}
        {!iconOnly && (
          <>
            {/* Left subtext */}
            {shouldShowSubtextL && (
              <Text
                className={`${textSizeClasses[size]} font-normal`}
                style={{ color: subtextColor, lineHeight: lineHeights[size] }}
                numberOfLines={1}
              >
                {subtextL}
              </Text>
            )}

            {/* Main label */}
            {label && (
              <Text
                className={textSizeClasses[size]}
                style={{ color: textColor, lineHeight: lineHeights[size] }}
                numberOfLines={truncate ? 1 : undefined}
                ellipsizeMode={truncate ? 'tail' : undefined}
              >
                {label}
              </Text>
            )}

            {/* Right subtext */}
            {shouldShowSubtextR && (
              <Text
                className={`${textSizeClasses[size]} font-normal`}
                style={{ color: subtextColor, lineHeight: lineHeights[size] }}
                numberOfLines={1}
              >
                {subtextR}
              </Text>
            )}

            {children}
          </>
        )}

        {/* Right icon */}
        {shouldShowRightIcon && renderedRightIcon}
      </TouchableOpacity>
    );
  }
);

Pill.displayName = 'Pill';
