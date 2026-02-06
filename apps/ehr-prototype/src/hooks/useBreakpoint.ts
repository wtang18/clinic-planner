/**
 * useBreakpoint Hook
 *
 * Reactive breakpoint detection for responsive layout adaptation.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, Dimensions } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'desktopXL';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  desktopXL: number;
}

export interface BreakpointState {
  /** Current breakpoint */
  breakpoint: Breakpoint;
  /** Current window width */
  width: number;
  /** Current window height */
  height: number;
  /** Is mobile breakpoint */
  isMobile: boolean;
  /** Is tablet breakpoint */
  isTablet: boolean;
  /** Is desktop breakpoint (includes desktopXL) */
  isDesktop: boolean;
  /** Is desktop XL breakpoint */
  isDesktopXL: boolean;
  /** Is smaller than desktop (mobile or tablet) */
  isBelowDesktop: boolean;
  /** Is larger than mobile (tablet or desktop) */
  isAboveMobile: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const BREAKPOINTS: BreakpointConfig = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  desktopXL: 1440,
};

// ============================================================================
// Helpers
// ============================================================================

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktopXL) return 'desktopXL';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

function getInitialDimensions(): { width: number; height: number } {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

// ============================================================================
// Hook
// ============================================================================

export function useBreakpoint(): BreakpointState {
  const [dimensions, setDimensions] = useState(getInitialDimensions);

  const handleResize = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // React Native dimensions listener
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, [handleResize]);

  const breakpoint = getBreakpoint(dimensions.width);

  return {
    breakpoint,
    width: dimensions.width,
    height: dimensions.height,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'desktopXL',
    isDesktopXL: breakpoint === 'desktopXL',
    isBelowDesktop: breakpoint === 'mobile' || breakpoint === 'tablet',
    isAboveMobile: breakpoint !== 'mobile',
  };
}

/**
 * Hook to check if we're at or above a specific breakpoint
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const { width } = useBreakpoint();
  return width >= BREAKPOINTS[minBreakpoint];
}

/**
 * Hook to check if we're at or below a specific breakpoint
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const { width } = useBreakpoint();
  const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'desktopXL'];
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint);
  const currentBreakpoint = getBreakpoint(width);
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  return currentIndex <= maxIndex;
}
