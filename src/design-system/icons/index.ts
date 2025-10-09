/**
 * Icon system exports
 *
 * This module provides a complete icon system with:
 * - 386 unique icon names
 * - 207 small icons (20x20px)
 * - 321 medium icons (24x24px)
 * - 142 icons available in both sizes
 *
 * Usage:
 * import { Icon } from '@/design-system/icons';
 * <Icon name="star" size="small" />
 *
 * Bicolor Icons:
 * import { BicolorIcon } from '@/design-system/icons';
 * <BicolorIcon name="success" size="medium" />
 */

export { Icon, type IconProps, type IconSize } from './Icon';
export type { IconName } from './icon-names';
export { ALL_ICON_NAMES, SMALL_ICON_NAMES, MEDIUM_ICON_NAMES } from './icon-names';

export { BicolorIcon, type BicolorIconProps, type BicolorIconSize, type BicolorIconName } from './BicolorIcon';
