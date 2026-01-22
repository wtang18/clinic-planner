/**
 * Toast Component - React Native (NativeWind)
 * Notification component for displaying alerts, confirmations, and messages
 * Supports automatic light/dark mode via useTheme() hook
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Icon, IconName } from '../icons';
import { BicolorIcon, BicolorIconName } from '../icons';
import { Button } from './Button';
import { useTheme } from '../theme';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

export type ToastType = 'positive' | 'alert' | 'attention' | 'info' | 'icon' | 'no-icon';

export interface ToastProps {
  /** Toast variant type */
  type: ToastType;
  /** Main notification title */
  title: string;
  /** Whether to show subtext */
  showSubtext?: boolean;
  /** Subtext content (only shown if showSubtext=true) */
  subtext?: string;
  /** Whether to show CTA button */
  showCta?: boolean;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button click handler */
  onCtaPress?: () => void;
  /** Whether to show close button */
  showClose?: boolean;
  /** Auto-dismiss after timeout (default: true) */
  autoDismiss?: boolean;
  /** Close handler */
  onClose: () => void;
  /** Custom icon name (required when type="icon") */
  customIcon?: IconName;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
  /** Custom className for NativeWind styling */
  className?: string;
  /** Accessible label for the toast */
  accessibilityLabel?: string;
  /** ARIA live region politeness level (default: 'polite') */
  accessibilityLive?: 'polite' | 'assertive' | 'none';
}

/**
 * Map toast types to BicolorIcon names
 */
const typeToIconMap: Record<Exclude<ToastType, 'icon' | 'no-icon'>, BicolorIconName> = {
  positive: 'positive-bold',
  alert: 'alert-bold',
  attention: 'attention',
  info: 'info-bold',
};

/**
 * Toast component for displaying notifications
 *
 * SPECIFICATIONS:
 * - Container: bg-white, px-16px, py-12px, rounded-16px, gap-16px
 * - Min height: 72px
 * - Shadow: elevation-lg
 * - Icon: 32x32px BicolorIcon or 24x24px regular Icon
 * - Title: font-medium 16px/24px
 * - Subtext: font-normal 14px/20px
 *
 * @example
 * <Toast
 *   type="positive"
 *   title="Success!"
 *   showSubtext
 *   subtext="Your changes have been saved."
 *   showClose
 *   onClose={() => {}}
 * />
 */
export const Toast = React.forwardRef<View, ToastProps>(
  (
    {
      type,
      title,
      showSubtext = false,
      subtext,
      showCta = false,
      ctaLabel = 'Label',
      onCtaPress,
      showClose = true,
      autoDismiss = true,
      onClose,
      customIcon,
      style,
      className = '',
      accessibilityLabel,
      accessibilityLive = 'polite',
    },
    ref
  ) => {
    const theme = useTheme();

    // Validation warnings
    useEffect(() => {
      if (!autoDismiss && !showClose) {
        console.warn('Toast: autoDismiss=false requires showClose=true to allow user to dismiss');
      }
    }, [autoDismiss, showClose]);

    useEffect(() => {
      if (type === 'icon' && !customIcon) {
        console.warn('Toast: type="icon" requires customIcon prop');
      }
    }, [type, customIcon]);

    useEffect(() => {
      if (showSubtext && !subtext) {
        console.warn('Toast: showSubtext=true but no subtext provided');
      }
    }, [showSubtext, subtext]);

    // Render icon based on type
    const renderIcon = () => {
      if (type === 'no-icon') return null;

      if (type === 'icon') {
        if (customIcon) {
          return (
            <View className="w-8 h-8 items-center justify-center">
              <Icon name={customIcon} size="medium" color={theme.colorFgNeutralPrimary} />
            </View>
          );
        }
        return null;
      }

      const iconName = typeToIconMap[type];
      return (
        <View className="w-8 h-8">
          <BicolorIcon name={iconName} size="medium" />
        </View>
      );
    };

    return (
      <View
        ref={ref}
        className={`flex-row items-center px-around-default py-around-compact rounded-md gap-related min-h-[72px] w-[480px] max-w-full ${className}`}
        style={[{ backgroundColor: theme.colorBgNeutralBase }, elevation.lg, style]}
        accessibilityRole="alert"
        accessibilityLiveRegion={accessibilityLive === 'none' ? 'none' : accessibilityLive}
        accessibilityLabel={accessibilityLabel}
      >
        {/* Left section: Icon + Text */}
        <View className="flex-row items-center flex-1 gap-related min-w-0">
          {renderIcon()}

          {/* Text section */}
          <View className="flex-col items-start flex-1 min-w-0">
            {/* Title */}
            <Text
              className="text-body-md font-medium shrink"
              style={{ color: theme.colorFgNeutralPrimary, lineHeight: 24 }}
              numberOfLines={2}
            >
              {title}
            </Text>

            {/* Subtext */}
            {showSubtext && subtext && (
              <Text
                className="text-body-sm font-normal shrink"
                style={{ color: theme.colorFgNeutralSecondary, lineHeight: 20 }}
                numberOfLines={2}
              >
                {subtext}
              </Text>
            )}
          </View>
        </View>

        {/* Right section: CTA + Close */}
        <View className="flex-row items-center justify-end gap-around-compact">
          {/* CTA button */}
          {showCta && (
            <Button
              type="transparent"
              size="medium"
              label={ctaLabel}
              onPress={onCtaPress}
              style={{ minWidth: 40 }}
            />
          )}

          {/* Close button */}
          {showClose && (
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close notification"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="x" size="medium" color={theme.colorFgNeutralPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

Toast.displayName = 'Toast';
