/**
 * Generate React Native text style utilities from Figma design tokens
 * Converts web font classes to React Native StyleSheet-compatible objects
 */

const fs = require('fs');
const path = require('path');

// Read typography tokens
const typographyTokens = require('../figma-export/typography-core-figma-export.json');

/**
 * Map font weight names to React Native font family names
 * Assumes fonts are loaded with naming convention: Inter-Regular, Inter-Medium, etc.
 */
const fontWeightToFamily = {
  'Regular': 'Inter-Regular',
  'Medium': 'Inter-Medium',
  'SemiBold': 'Inter-SemiBold',
  'Bold': 'Inter-Bold',
};

/**
 * Convert Figma font weight number to font family name
 */
function getFontFamily(fontWeight) {
  const weightMap = {
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
  };
  const weightName = weightMap[fontWeight] || 'Regular';
  return fontWeightToFamily[weightName];
}

/**
 * Convert Figma text style to React Native text style object
 */
function convertTextStyle(figmaStyle) {
  return {
    fontFamily: getFontFamily(figmaStyle.fontWeight),
    fontSize: parseFloat(figmaStyle.fontSize),
    lineHeight: parseFloat(figmaStyle.lineHeight),
    letterSpacing: parseFloat(figmaStyle.letterSpacing || 0),
  };
}

// Generate text styles structure
const textStyles = {
  display: { lg: {}, md: {}, sm: {} },
  headline: { lg: {}, md: {}, sm: {} },
  title: { lg: {}, md: {}, sm: {} },
  body: { lg: {}, md: {}, sm: {} },
  label: { lg: {}, md: {}, sm: {} },
};

// Process typography tokens
Object.entries(typographyTokens).forEach(([key, value]) => {
  // Parse key like "Display/Lg/Regular"
  const parts = key.split('/');
  if (parts.length === 3) {
    const [category, size, weight] = parts;
    const categoryLower = category.toLowerCase();
    const sizeLower = size.toLowerCase();
    const weightLower = weight.toLowerCase();

    if (textStyles[categoryLower] && textStyles[categoryLower][sizeLower]) {
      textStyles[categoryLower][sizeLower][weightLower] = convertTextStyle(value);
    }
  }
});

// Generate TypeScript file
const tsContent = `/**
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

export const textStyles: TextStyles = ${JSON.stringify(textStyles, null, 2)};

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
`;

// Write TypeScript file
const outputPath = path.join(__dirname, '../dist/react-native');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

fs.writeFileSync(
  path.join(outputPath, 'text-styles.ts'),
  tsContent
);

// Also write a font loading helper
const fontLoaderContent = `/**
 * Font Loading Helper for React Native
 * Lists all required font files for the design system
 *
 * Usage with Expo:
 * import { useFonts } from 'expo-font';
 * import { fontAssets } from '@/design-system/tokens/build/react-native/fonts';
 *
 * const [fontsLoaded] = useFonts(fontAssets);
 */

export const fontAssets = {
  'Inter-Regular': require('../../../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../../../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../../../assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('../../../assets/fonts/Inter-Bold.ttf'),
};

export const fontFamilies = Object.keys(fontAssets);

/**
 * Get font loading configuration for react-native.config.js
 */
export const fontConfig = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
`;

fs.writeFileSync(
  path.join(outputPath, 'fonts.ts'),
  fontLoaderContent
);

console.log('✓ Generated React Native text style utilities');
console.log(`  Output: ${path.join(outputPath, 'text-styles.ts')}`);
console.log(`  Font loader: ${path.join(outputPath, 'fonts.ts')}`);
console.log(`  Categories: ${Object.keys(textStyles).join(', ')}`);
