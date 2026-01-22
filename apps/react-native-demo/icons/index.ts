/**
 * React Native Icon System
 *
 * Provides Icon and BicolorIcon components that match the web design system API.
 *
 * - 386 icon names
 * - 2 sizes: small (20px) and medium (24px)
 * - Cross-platform support (iOS, Android, Web)
 */

export { Icon, type IconProps, type IconSize } from './Icon';
export { BicolorIcon, type BicolorIconProps, type BicolorIconSize, type BicolorIconName } from './BicolorIcon';

// Re-export icon names type from web design system
export type { IconName } from '@design-system/icons/icon-names';
