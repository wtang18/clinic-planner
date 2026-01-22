/**
 * Responsive Utilities for React Native
 * Handles iPhone vs iPad detection and adaptive layouts
 *
 * Key Features:
 * - Device type detection (phone, tablet, large tablet)
 * - iPad Split View / multitasking support
 * - Dynamic window dimension tracking
 * - Responsive scaling helpers
 */

import { useState, useEffect } from 'react';
import { Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';

/**
 * Breakpoint constants
 * Based on actual device dimensions and iPad multitasking modes
 */
export const BREAKPOINTS = {
  // Split View minimum width (iPad in 1/4 split)
  COMPACT: 320,

  // Phone maximum width (iPhone Pro Max)
  PHONE: 430,

  // iPad minimum width (iPad Mini)
  TABLET: 768,

  // iPad Pro minimum width
  TABLET_LARGE: 1024,
} as const;

/**
 * Device type classification
 */
export type DeviceType = 'phone' | 'tablet' | 'tablet-large';

/**
 * Layout size classification
 * - compact: Very narrow (iPad in 1/3 or 1/4 split, or narrow phone)
 * - regular: Standard phone width or iPad in 1/2 split
 * - wide: Full iPad width
 */
export type LayoutSize = 'compact' | 'regular' | 'wide';

/**
 * Device type detection result
 */
export interface DeviceInfo {
  /** Is current device/window width phone-sized? */
  isPhone: boolean;

  /** Is current device/window width tablet-sized? */
  isTablet: boolean;

  /** Is current device/window width large tablet-sized? */
  isTabletLarge: boolean;

  /** Device type classification */
  type: DeviceType;

  /** Current window width */
  width: number;

  /** Current window height */
  height: number;

  /** Is device in portrait orientation? */
  isPortrait: boolean;

  /** Is device in landscape orientation? */
  isLandscape: boolean;
}

/**
 * Adaptive layout information
 * Handles iPad multitasking (Split View, Slide Over)
 */
export interface AdaptiveLayout {
  /** Layout size classification */
  size: LayoutSize;

  /** Should use single-column layout? */
  useSingleColumn: boolean;

  /** Should use multi-column layout? */
  useMultiColumn: boolean;

  /** Number of recommended columns for grid layouts */
  columns: number;

  /** Is likely in iPad Split View mode? */
  isProbablySplitView: boolean;

  /** Should use drawer navigation? (iPad) */
  useDrawerNav: boolean;

  /** Should use stack + tabs navigation? (iPhone) */
  useStackNav: boolean;
}

/**
 * Hook: Get device type and dimensions
 * Tracks window dimensions and updates on resize (iPad multitasking)
 *
 * @example
 * const { isPhone, isTablet, width, isPortrait } = useDeviceType();
 *
 * if (isPhone) {
 *   return <PhoneLayout />;
 * } else {
 *   return <TabletLayout />;
 * }
 */
export function useDeviceType(): DeviceInfo {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isPortrait = height > width;
  const isLandscape = width >= height;

  // Device type classification
  // IMPORTANT: Based on window width, not device type
  // This handles iPad Split View correctly
  const isPhone = width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.TABLET_LARGE;
  const isTabletLarge = width >= BREAKPOINTS.TABLET_LARGE;

  const type: DeviceType = isPhone ? 'phone' : isTablet ? 'tablet' : 'tablet-large';

  return {
    isPhone,
    isTablet,
    isTabletLarge,
    type,
    width,
    height,
    isPortrait,
    isLandscape,
  };
}

/**
 * Hook: Get adaptive layout recommendations
 * Determines optimal layout based on current window size
 * Handles iPad multitasking scenarios
 *
 * @example
 * const layout = useAdaptiveLayout();
 *
 * return (
 *   <FlatList
 *     data={items}
 *     numColumns={layout.columns}
 *     key={layout.columns} // Force re-render on column change
 *   />
 * );
 */
export function useAdaptiveLayout(): AdaptiveLayout {
  const device = useDeviceType();
  const { width, type } = device;

  // Detect probable Split View scenarios
  // iPad in Split View can be as narrow as 320px (1/4 split)
  const isProbablySplitView =
    Platform.OS === 'ios' &&
    width < BREAKPOINTS.TABLET &&
    width >= BREAKPOINTS.COMPACT;

  // Layout size classification
  let size: LayoutSize;
  if (width < BREAKPOINTS.PHONE) {
    size = 'compact'; // Very narrow (Split View or small phone)
  } else if (width < BREAKPOINTS.TABLET) {
    size = 'regular'; // Phone width
  } else {
    size = 'wide'; // Full tablet width
  }

  // Column recommendations for grid layouts
  // Consider both width and orientation for tablet layouts
  let columns = 1;
  if (width >= BREAKPOINTS.TABLET) {
    // Tablet width: 4 columns in landscape, 2 columns in portrait
    columns = device.isLandscape ? 4 : 2;
  } else {
    // All phone-sized devices (including large iPhones): 1 column
    // This ensures clean, readable layouts on mobile views
    columns = 1;
  }

  // Layout mode decisions
  const useSingleColumn = columns === 1;
  const useMultiColumn = columns > 1;

  // Navigation type recommendations
  const useDrawerNav = type !== 'phone' && !isProbablySplitView;
  const useStackNav = type === 'phone' || isProbablySplitView;

  return {
    size,
    useSingleColumn,
    useMultiColumn,
    columns,
    isProbablySplitView,
    useDrawerNav,
    useStackNav,
  };
}

/**
 * Scale a size value based on device width
 * Useful for responsive sizing
 *
 * @param size - Base size in pixels (based on iPhone 12 Pro @ 390px width)
 * @param factor - Scaling factor (0 = no scaling, 1 = full scaling)
 * @returns Scaled size
 *
 * @example
 * const buttonHeight = scale(44); // iPhone: 44, iPad: ~56
 */
export function scale(size: number, factor: number = 0.5): number {
  const { width } = Dimensions.get('window');
  const baseWidth = 390; // iPhone 12 Pro
  const ratio = width / baseWidth;
  const newSize = size + (size * (ratio - 1)) * factor;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale vertically based on device height
 * Useful for spacing, margins
 *
 * @param size - Base size in pixels
 * @param factor - Scaling factor (0 = no scaling, 1 = full scaling)
 * @returns Scaled size
 */
export function verticalScale(size: number, factor: number = 0.5): number {
  const { height } = Dimensions.get('window');
  const baseHeight = 844; // iPhone 12 Pro
  const ratio = height / baseHeight;
  const newSize = size + (size * (ratio - 1)) * factor;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Moderate scale - combines horizontal and vertical scaling
 * Best for most UI elements
 *
 * @param size - Base size in pixels
 * @param factor - Scaling factor (0 = no scaling, 1 = full scaling)
 * @returns Scaled size
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size, 1) - size) * factor;
}

/**
 * Get responsive padding based on device size
 * Returns appropriate padding for phone vs tablet
 *
 * @returns Padding object with horizontal and vertical values
 *
 * @example
 * const padding = getResponsivePadding();
 * <View style={{ paddingHorizontal: padding.horizontal }} />
 */
export function getResponsivePadding() {
  const { type } = useDeviceType();

  if (type === 'phone') {
    return {
      horizontal: 16,
      vertical: 12,
    };
  } else if (type === 'tablet') {
    return {
      horizontal: 24,
      vertical: 16,
    };
  } else {
    return {
      horizontal: 32,
      vertical: 20,
    };
  }
}

/**
 * Check if device is iPad (actual device, not window size)
 * Useful for enabling iPad-specific features (Apple Pencil, etc.)
 *
 * Note: Use useDeviceType() for layout decisions (handles Split View)
 */
export function isIPad(): boolean {
  if (Platform.OS !== 'ios') return false;

  // Check if device is iPad based on actual device info
  // This won't change during Split View, unlike window dimensions
  const { width, height } = Dimensions.get('screen');
  const maxDimension = Math.max(width, height);

  return maxDimension >= 1024; // iPad minimum: 1024x768
}

/**
 * Get safe minimum touch target size
 * Apple HIG: 44x44pt minimum
 *
 * @returns Minimum touch target size
 */
export function getMinTouchTarget(): number {
  const { isPhone } = useDeviceType();

  // iPhone needs larger touch targets (thumb-optimized)
  return isPhone ? 44 : 40;
}

/**
 * Check if current layout should use master-detail pattern
 * True for iPad in full width, false for iPhone and iPad Split View
 */
export function shouldUseMasterDetail(): boolean {
  const { width } = Dimensions.get('window');
  return width >= BREAKPOINTS.TABLET;
}
