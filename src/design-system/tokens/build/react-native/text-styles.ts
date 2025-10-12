/**
 * React Native Text Style Utilities
 * Auto-generated from Figma design tokens
 *
 * Usage:
 * import { Text } from 'react-native';
 * import { textStyles } from '@/design-system/tokens/build/react-native/text-styles';
 *
 * <Text style={textStyles.body.md.medium}>Hello World</Text>
 */

import { TextStyle } from 'react-native';

export interface TextStyleDefinition extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface TextStyleCategory {
  lg: {
    regular?: TextStyleDefinition;
    medium?: TextStyleDefinition;
    semibold?: TextStyleDefinition;
    bold?: TextStyleDefinition;
  };
  md: {
    regular?: TextStyleDefinition;
    medium?: TextStyleDefinition;
    semibold?: TextStyleDefinition;
    bold?: TextStyleDefinition;
  };
  sm: {
    regular?: TextStyleDefinition;
    medium?: TextStyleDefinition;
    semibold?: TextStyleDefinition;
    bold?: TextStyleDefinition;
  };
}

export interface TextStyles {
  display: TextStyleCategory;
  headline: TextStyleCategory;
  title: TextStyleCategory;
  body: TextStyleCategory;
  label: TextStyleCategory;
}

export const textStyles: TextStyles = {
  "display": {
    "lg": {},
    "md": {},
    "sm": {}
  },
  "headline": {
    "lg": {},
    "md": {},
    "sm": {}
  },
  "title": {
    "lg": {},
    "md": {},
    "sm": {}
  },
  "body": {
    "lg": {},
    "md": {},
    "sm": {}
  },
  "label": {
    "lg": {},
    "md": {},
    "sm": {}
  }
};

/**
 * Helper to create text style with custom color
 * @param style - Base text style from textStyles
 * @param color - Custom color value
 */
export function withColor(style: TextStyleDefinition, color: string): TextStyle {
  return { ...style, color };
}

/**
 * Helper to create text style with custom alignment
 * @param style - Base text style from textStyles
 * @param textAlign - Text alignment ('left' | 'center' | 'right' | 'justify')
 */
export function withAlign(
  style: TextStyleDefinition,
  textAlign: 'left' | 'center' | 'right' | 'justify'
): TextStyle {
  return { ...style, textAlign };
}

/**
 * Responsive text size helper
 * Adjusts font size based on device width
 * @param baseSize - Base font size
 * @param scale - Scale factor (default 1.0)
 */
import { Dimensions, Platform, PixelRatio } from 'react-native';

export function responsiveTextSize(baseSize: number, scale: number = 1.0): number {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;

  // Base width (iPhone 12 Pro)
  const baseWidth = 390;

  // Calculate scale
  const calculatedScale = (width / baseWidth) * scale;

  // Apply scale and round to nearest pixel
  const newSize = baseSize * calculatedScale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(newSize);
}

/**
 * Create responsive text style
 * @param style - Base text style
 * @param scale - Optional scale factor
 */
export function makeResponsive(
  style: TextStyleDefinition,
  scale?: number
): TextStyleDefinition {
  return {
    ...style,
    fontSize: responsiveTextSize(style.fontSize, scale),
    lineHeight: responsiveTextSize(style.lineHeight, scale),
  };
}
