/**
 * React Native Icon Component
 *
 * Cross-platform icon component matching the web design system API.
 * Uses react-native-svg for native platforms and reuses web SVG maps for React Native Web.
 */

import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import type { IconName } from '@design-system/icons/icon-names';
import { smallIconMap, mediumIconMap } from '@design-system/icons/icon-map';
import { SvgXml } from 'react-native-svg';

export type IconSize = 'small' | 'medium';

export interface IconProps {
  /** Icon name (without size suffix) */
  name: IconName;
  /** Icon size: small (20px) or medium (24px) */
  size?: IconSize;
  /** Icon color (uses currentColor if not specified) */
  color?: string;
  /** Additional style */
  style?: ViewStyle;
  /** Accessible label (if icon is not decorative) */
  accessibilityLabel?: string;
  /** Whether icon is hidden from accessibility tree (default: true) */
  accessibilityHidden?: boolean;
}

/**
 * Get SVG string for an icon from web icon maps
 */
function getIconSvg(name: IconName, size: IconSize): string | null {
  const fileName = size === 'small' ? `${name}-small.svg` : `${name}.svg`;
  const key = `./${fileName}`;

  // Try to get from appropriate size
  const icons = size === 'small' ? smallIconMap : mediumIconMap;
  let svgContent = icons[key];

  if (!svgContent) {
    // Try fallback to other size
    const fallbackSize = size === 'small' ? 'medium' : 'small';
    const fallbackFileName = fallbackSize === 'small' ? `${name}-small.svg` : `${name}.svg`;
    const fallbackKey = `./${fallbackFileName}`;
    const fallbackIcons = fallbackSize === 'small' ? smallIconMap : mediumIconMap;

    svgContent = fallbackIcons[fallbackKey];

    if (svgContent && __DEV__) {
      console.warn(
        `Icon "${name}" not found in ${size} size, using ${fallbackSize} size as fallback`
      );
    }
  }

  return svgContent || null;
}

/**
 * Extract SVG content string from various module formats
 */
function normalizeSvgContent(svgContent: any): string | null {
  if (typeof svgContent === 'string') {
    return svgContent;
  }

  if (svgContent && typeof svgContent === 'object') {
    // Handle Next.js/webpack data URLs
    if (svgContent.src && typeof svgContent.src === 'string') {
      const srcValue = svgContent.src;
      if (srcValue.startsWith('data:image/svg+xml,')) {
        const encodedSvg = srcValue.replace('data:image/svg+xml,', '');
        return decodeURIComponent(encodedSvg);
      }
    }

    // Try common module export patterns
    const possibleExports = [svgContent.default, svgContent.href];
    for (const exportValue of possibleExports) {
      if (typeof exportValue === 'string' && exportValue.trim().startsWith('<svg')) {
        return exportValue;
      }
    }
  }

  return null;
}

/**
 * Replace currentColor in SVG with actual color value
 */
function replaceCurrentColor(svgString: string, color: string): string {
  return svgString.replace(/currentColor/g, color);
}

/**
 * Fallback icon (question mark circle) when icon not found
 */
const FallbackIcon = ({ size, color = '#666' }: { size: IconSize; color?: string }) => {
  const sizeValue = size === 'small' ? 20 : 24;
  const svgString = `
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="${color}" stroke-width="1.5"/>
      <path d="M10 14V14.5M10 11C10 10.5 10 10 10.5 9.5C11 9 12 8.5 12 7.5C12 6.5 11.5 6 10 6C8.5 6 8 6.5 8 7.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  return <SvgXml xml={svgString} width={sizeValue} height={sizeValue} />;
};

/**
 * Icon component for React Native
 *
 * Automatically inherits text color via parent context on native platforms.
 * Use the `color` prop to override.
 *
 * Icon sizing:
 * - small: 20x20px - for xSmall, small, medium buttons
 * - medium: 24x24px - for large, largeFloating buttons
 *
 * @example
 * <Icon name="star" size="small" />
 * <Icon name="chevron-down" size="medium" color="#3B82F6" />
 * <Icon name="checkmark" accessibilityLabel="Completed" accessibilityHidden={false} />
 */
export const Icon = React.forwardRef<View, IconProps>(
  (
    {
      name,
      size = 'small',
      color,
      style,
      accessibilityLabel,
      accessibilityHidden = true,
    },
    ref
  ) => {
    // Compute dimensions
    const sizeValue = size === 'small' ? 20 : 24;

    // Get SVG content
    let rawSvgContent = getIconSvg(name, size);
    let svgString = normalizeSvgContent(rawSvgContent);

    // Show fallback if not found
    if (!svgString) {
      if (__DEV__) {
        console.error(`Icon "${name}" not found in any size`);
      }
      return (
        <View
          ref={ref}
          style={[{ width: sizeValue, height: sizeValue }, style]}
          accessible={!accessibilityHidden}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
        >
          <FallbackIcon size={size} color={color} />
        </View>
      );
    }

    // Replace currentColor with actual color if provided
    // If no color provided, default to black for visibility (RN doesn't have "currentColor" concept)
    const finalColor = color || '#181818';
    const colorizedSvg = replaceCurrentColor(svgString, finalColor);

    return (
      <View
        ref={ref}
        style={[
          {
            width: sizeValue,
            height: sizeValue,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        accessible={!accessibilityHidden}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
      >
        <SvgXml xml={colorizedSvg} width={sizeValue} height={sizeValue} />
      </View>
    );
  }
);

Icon.displayName = 'Icon';
