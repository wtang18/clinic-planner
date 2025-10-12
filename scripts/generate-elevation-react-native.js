/**
 * Generate React Native elevation utilities
 * Creates platform-specific shadow implementations (iOS vs Android)
 *
 * Since our elevation system uses CSS variables which don't translate directly,
 * we create React Native-friendly elevation presets based on our scale
 */

const fs = require('fs');
const path = require('path');

// React Native elevation presets
// Tuned for optimal appearance on both iOS and Android
const elevations = {
  xs: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
  },
  sm: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: { elevation: 3 },
  },
  md: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
  },
  lg: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    },
    android: { elevation: 10 },
  },
  xl: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    android: { elevation: 16 },
  },
  '2xl': {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.20,
      shadowRadius: 24,
    },
    android: { elevation: 24 },
  },
  none: {
    ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: { elevation: 0 },
  },
};

// Generate TypeScript file
const tsContent = `/**
 * React Native Elevation Utilities
 * Platform-specific shadow implementations
 *
 * iOS: Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * Android: Uses elevation property
 *
 * Usage:
 * import { elevation } from '@/design-system/tokens/build/react-native/elevation';
 * import { View } from 'react-native';
 *
 * <View style={[styles.card, elevation.lg]} />
 *
 * Elevation Scale:
 * - xs: Extra small - Barely visible, subtle depth
 * - sm: Small - Subtle card shadow, hover states
 * - md: Medium - Default card shadow (recommended for most cards)
 * - lg: Large - Elevated cards, sticky headers, dropdowns
 * - xl: Extra large - Popovers, floating menus
 * - 2xl: 2XL - Modals, dialogs, maximum elevation
 * - none: Remove shadow
 */

import { Platform, ViewStyle } from 'react-native';

export interface ElevationStyle {
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  android: {
    elevation: number;
  };
}

/**
 * Elevation style definitions
 * Contains both iOS and Android shadow properties
 */
export const elevationStyles: Record<string, ElevationStyle> = ${JSON.stringify(elevations, null, 2)};

/**
 * Platform-specific elevation styles
 * Automatically applies correct shadow properties based on platform
 */
export const elevation: Record<string, ViewStyle> = {
  xs: Platform.select(elevationStyles.xs) as ViewStyle,
  sm: Platform.select(elevationStyles.sm) as ViewStyle,
  md: Platform.select(elevationStyles.md) as ViewStyle,
  lg: Platform.select(elevationStyles.lg) as ViewStyle,
  xl: Platform.select(elevationStyles.xl) as ViewStyle,
  '2xl': Platform.select(elevationStyles['2xl']) as ViewStyle,
  none: Platform.select(elevationStyles.none) as ViewStyle,
};

/**
 * Combine multiple elevation levels (useful for stacked elements)
 * @param levels - Array of elevation level names
 * @returns Combined elevation style
 *
 * @example
 * <View style={[styles.card, combineElevations('md', 'lg')]} />
 */
export function combineElevations(...levels: Array<keyof typeof elevation>): ViewStyle {
  if (Platform.OS === 'ios') {
    // On iOS, combine shadow properties
    const combined = levels.reduce((acc, level) => {
      const style = elevation[level] as any;
      return {
        ...acc,
        shadowRadius: Math.max(acc.shadowRadius || 0, style.shadowRadius || 0),
        shadowOpacity: Math.max(acc.shadowOpacity || 0, style.shadowOpacity || 0),
        shadowOffset: {
          width: style.shadowOffset?.width || 0,
          height: Math.max(acc.shadowOffset?.height || 0, style.shadowOffset?.height || 0),
        },
      };
    }, { shadowOffset: { width: 0, height: 0 } } as ViewStyle);
    return combined;
  } else {
    // On Android, use the highest elevation
    const maxElevation = Math.max(
      ...levels.map(level => ((elevation[level] as any).elevation || 0))
    );
    return { elevation: maxElevation } as ViewStyle;
  }
}

/**
 * Create custom elevation with specific values
 * @param shadowHeight - Height of shadow offset (determines perceived elevation)
 * @param shadowOpacity - Shadow opacity (0-1)
 * @returns Platform-specific elevation style
 *
 * @example
 * <View style={customElevation(6, 0.15)} />
 */
export function customElevation(shadowHeight: number, shadowOpacity: number = 0.14): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: shadowHeight },
      shadowOpacity,
      shadowRadius: shadowHeight * 1.5,
    } as ViewStyle;
  } else {
    // Android elevation roughly = shadowHeight * 1.5
    return { elevation: Math.round(shadowHeight * 1.5) } as ViewStyle;
  }
}

/**
 * IMPORTANT: Android shadows require backgroundColor
 *
 * ❌ Bad - Shadow won't appear:
 * <View style={elevation.lg}>
 *
 * ✅ Good - Shadow appears correctly:
 * <View style={[{ backgroundColor: '#FFF' }, elevation.lg]}>
 *
 * If you're experiencing missing shadows on Android, ensure your View has
 * a background color set.
 */
`;

// Write TypeScript file
const outputPath = path.join(__dirname, '../src/design-system/tokens/build/react-native');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

fs.writeFileSync(
  path.join(outputPath, 'elevation.ts'),
  tsContent
);

console.log('✓ Generated React Native elevation utilities');
console.log(`  Output: ${path.join(outputPath, 'elevation.ts')}`);
console.log(`  Levels: ${Object.keys(elevations).join(', ')}`);
