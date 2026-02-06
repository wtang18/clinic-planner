/**
 * BicolorIcon Component
 *
 * Semantic bicolor status icons with configurable container and signifier colors.
 * Uses inlined SVG strings from the shared bicolor icon maps.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { smallBicolorIconMap, mediumBicolorIconMap } from '@design-system/icons/bicolor-icon-map.rn';
import { colors } from '../styles/foundations';

export type BicolorIconSize = 'small' | 'medium';

/**
 * Semantic bicolor icon names with default color schemes
 */
export type BicolorIconName =
  | 'positive'
  | 'positive-bold'
  | 'alert'
  | 'alert-bold'
  | 'attention'
  | 'info'
  | 'info-bold'
  | 'question'
  | 'plus'
  | 'minus'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right';

export interface BicolorIconProps {
  /** Semantic icon name with default colors */
  name: BicolorIconName;
  /** Icon size: small (20px) or medium (24px) */
  size?: BicolorIconSize;
  /** Override signifier (inner element) color */
  signifierColor?: string;
  /** Override container (outer element) color */
  containerColor?: string;
  /** Additional style */
  style?: ViewStyle;
  /** Accessible label (if icon is not decorative) */
  accessibilityLabel?: string;
  /** Whether icon is hidden from accessibility tree (default: true) */
  accessibilityHidden?: boolean;
}

/**
 * Default color schemes for semantic bicolor icons.
 * Uses semantic color tokens from the design system.
 */
const defaultColors: Record<BicolorIconName, { signifier: string; container: string }> = {
  'positive': { signifier: colors.fg.neutral.primary, container: colors.bg.positive.subtle },
  'positive-bold': { signifier: colors.fg.positive.inversePrimary, container: colors.bg.positive.high },
  'alert': { signifier: colors.fg.alert.secondary, container: colors.bg.alert.subtle },
  'alert-bold': { signifier: colors.fg.alert.inversePrimary, container: colors.bg.alert.high },
  'attention': { signifier: colors.fg.neutral.primary, container: colors.bg.attention.subtle },
  'info': { signifier: colors.fg.neutral.primary, container: colors.bg.information.subtle },
  'info-bold': { signifier: colors.fg.information.inversePrimary, container: colors.bg.information.high },
  'question': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'plus': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'minus': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'arrow-up': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'arrow-down': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'arrow-left': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'arrow-right': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'chevron-up': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'chevron-down': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'chevron-left': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
  'chevron-right': { signifier: colors.fg.neutral.primary, container: colors.bg.neutral.subtle },
};

/**
 * Map semantic names to file names
 */
const nameToFileMap: Record<BicolorIconName, { small: string; medium: string }> = {
  'positive': {
    small: 'checkmark-circle-small-bicolor-light.svg',
    medium: 'checkmark-circle-bicolor-light.svg',
  },
  'positive-bold': {
    small: 'checkmark-circle-small-bicolor-bold.svg',
    medium: 'checkmark-circle-bicolor-bold.svg',
  },
  'alert': {
    small: 'exclamation-circle-small-bicolor-light.svg',
    medium: 'exclamation-circle-bicolor-light.svg',
  },
  'alert-bold': {
    small: 'exclamation-circle-small-bicolor-bold.svg',
    medium: 'exclamation-circle-bicolor-bold.svg',
  },
  'attention': {
    small: 'exclamation-triangle-small-bicolor.svg',
    medium: 'exclamation-triangle-bicolor.svg',
  },
  'info': {
    small: 'info-circle-small-bicolor-light.svg',
    medium: 'info-circle-bicolor-light.svg',
  },
  'info-bold': {
    small: 'info-circle-small-bicolor-bold.svg',
    medium: 'info-circle-bicolor-bold.svg',
  },
  'question': {
    small: 'question-circle-small-bicolor.svg',
    medium: 'question-circle-bicolor.svg',
  },
  'plus': {
    small: 'plus-circle-small-bicolor.svg',
    medium: 'plus-circle-bicolor.svg',
  },
  'minus': {
    small: 'minus-circle-small-bicolor.svg',
    medium: 'minus-circle-bicolor.svg',
  },
  'arrow-up': {
    small: 'arrow-up-circle-small-bicolor.svg',
    medium: 'arrow-up-circle-bicolor.svg',
  },
  'arrow-down': {
    small: 'arrow-down-circle-small-bicolor.svg',
    medium: 'arrow-down-circle-bicolor.svg',
  },
  'arrow-left': {
    small: 'arrow-left-circle-small-bicolor.svg',
    medium: 'arrow-left-circle-bicolor.svg',
  },
  'arrow-right': {
    small: 'arrow-right-circle-small-bicolor.svg',
    medium: 'arrow-right-circle-bicolor.svg',
  },
  'chevron-up': {
    small: 'chevron-up-circle-small-bicolor.svg',
    medium: 'chevron-up-circle-bicolor.svg',
  },
  'chevron-down': {
    small: 'chevron-down-circle-small-bicolor.svg',
    medium: 'chevron-down-circle-bicolor.svg',
  },
  'chevron-left': {
    small: 'chevron-left-circle-small-bicolor.svg',
    medium: 'chevron-left-circle-bicolor.svg',
  },
  'chevron-right': {
    small: 'chevron-right-circle-small-bicolor.svg',
    medium: 'chevron-right-circle-bicolor.svg',
  },
};

/**
 * Get SVG string for a bicolor icon
 */
function getBicolorIconSvg(name: BicolorIconName, size: BicolorIconSize): string | null {
  const fileMapping = nameToFileMap[name];
  if (!fileMapping) {
    if (__DEV__) {
      console.error(`No file mapping found for bicolor icon: ${name}`);
    }
    return null;
  }

  const fileName = size === 'small' ? fileMapping.small : fileMapping.medium;
  const key = `./${fileName}`;

  const icons = size === 'small' ? smallBicolorIconMap : mediumBicolorIconMap;
  let svgContent = icons[key];

  if (!svgContent) {
    const fallbackSize = size === 'small' ? 'medium' : 'small';
    const fallbackFileName = fallbackSize === 'small' ? fileMapping.small : fileMapping.medium;
    const fallbackKey = `./${fallbackFileName}`;
    const fallbackIcons = fallbackSize === 'small' ? smallBicolorIconMap : mediumBicolorIconMap;

    svgContent = fallbackIcons[fallbackKey];

    if (svgContent && __DEV__) {
      console.warn(
        `BicolorIcon "${name}" not found in ${size} size, using ${fallbackSize} size as fallback`
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
    if (svgContent.src && typeof svgContent.src === 'string') {
      const srcValue = svgContent.src;
      if (srcValue.startsWith('data:image/svg+xml,')) {
        const encodedSvg = srcValue.replace('data:image/svg+xml,', '');
        return decodeURIComponent(encodedSvg);
      }
    }

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
 * Replace fill colors in SVG
 * First fill = container (circle/triangle/square)
 * Second+ fills = signifier (checkmark/exclamation/etc)
 */
function replaceColors(
  svgContent: string,
  containerColor: string,
  signifierColor: string
): string {
  let colorIndex = 0;

  let modifiedSvg = svgContent.replace(/<path([^>]*?)fill=(['"])([^'"]+)\2/g, (match, beforeFill, quote, fillValue) => {
    if (fillValue === 'none') {
      return match;
    }
    const newColor = colorIndex === 0 ? containerColor : signifierColor;
    colorIndex++;
    return `<path${beforeFill}fill=${quote}${newColor}${quote}`;
  });

  const shapeElements = ['circle', 'rect', 'polygon', 'ellipse', 'polyline'];
  shapeElements.forEach(element => {
    modifiedSvg = modifiedSvg.replace(
      new RegExp(`<${element}([^>]*?)fill=(['"])([^'"]+)\\2`, 'g'),
      (match, beforeFill, quote, fillValue) => {
        if (fillValue === 'none') {
          return match;
        }
        const newColor = colorIndex === 0 ? containerColor : signifierColor;
        colorIndex++;
        return `<${element}${beforeFill}fill=${quote}${newColor}${quote}`;
      }
    );
  });

  return modifiedSvg;
}

/**
 * Fallback icon when icon not found
 */
const FallbackIcon = ({ size, containerColor, signifierColor }: { size: BicolorIconSize; containerColor: string; signifierColor: string }) => {
  const sizeValue = size === 'small' ? 20 : 24;
  const svgString = `
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="${containerColor}" stroke="${signifierColor}" stroke-width="1.5"/>
      <path d="M10 14V14.5M10 11C10 10.5 10 10 10.5 9.5C11 9 12 8.5 12 7.5C12 6.5 11.5 6 10 6C8.5 6 8 6.5 8 7.5" stroke="${signifierColor}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  return <SvgXml xml={svgString} width={sizeValue} height={sizeValue} />;
};

/**
 * BicolorIcon component
 *
 * Semantic bicolor status icons with two distinct color layers:
 * - Container: outer shape (circle, triangle, square)
 * - Signifier: inner element (checkmark, exclamation, arrow, etc.)
 *
 * @example
 * <BicolorIcon name="positive" size="small" />
 * <BicolorIcon name="alert" size="medium" />
 * <BicolorIcon name="info" containerColor="#FFD700" signifierColor="#000" />
 */
export const BicolorIcon = React.forwardRef<View, BicolorIconProps>(
  (
    {
      name,
      size = 'small',
      signifierColor,
      containerColor,
      style,
      accessibilityLabel,
      accessibilityHidden = true,
    },
    ref
  ) => {
    const sizeValue = size === 'small' ? 20 : 24;

    const colorScheme = defaultColors[name] || {
      signifier: colors.fg.neutral.primary,
      container: colors.bg.neutral.subtle,
    };
    const finalSignifierColor = signifierColor || colorScheme.signifier;
    const finalContainerColor = containerColor || colorScheme.container;

    const rawSvgContent = getBicolorIconSvg(name, size);
    const svgString = normalizeSvgContent(rawSvgContent);

    if (!svgString) {
      if (__DEV__) {
        console.error(`BicolorIcon "${name}" not found in any size`);
      }
      return (
        <View
          ref={ref}
          style={[{ width: sizeValue, height: sizeValue }, style]}
          accessible={!accessibilityHidden}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
        >
          <FallbackIcon size={size} containerColor={finalContainerColor} signifierColor={finalSignifierColor} />
        </View>
      );
    }

    const colorizedSvg = replaceColors(svgString, finalContainerColor, finalSignifierColor);

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

BicolorIcon.displayName = 'BicolorIcon';
