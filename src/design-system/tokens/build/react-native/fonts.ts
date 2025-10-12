/**
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
  assets: ['./src/design-system/assets/fonts'],
};
