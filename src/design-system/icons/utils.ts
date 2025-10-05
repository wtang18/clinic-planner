/**
 * Icon utility functions
 */

import type { IconName } from './icon-names';
import { ALL_ICON_NAMES, SMALL_ICON_NAMES, MEDIUM_ICON_NAMES } from './icon-names';

/**
 * Check if an icon exists
 */
export function iconExists(name: string): name is IconName {
  return ALL_ICON_NAMES.includes(name as IconName);
}

/**
 * Check if an icon exists in small size
 */
export function hasSmallIcon(name: IconName): boolean {
  return SMALL_ICON_NAMES.includes(name);
}

/**
 * Check if an icon exists in medium size
 */
export function hasMediumIcon(name: IconName): boolean {
  return MEDIUM_ICON_NAMES.includes(name);
}

/**
 * Check if an icon exists in both sizes
 */
export function hasBothSizes(name: IconName): boolean {
  return hasSmallIcon(name) && hasMediumIcon(name);
}

/**
 * Get all available icon names
 */
export function getAllIcons(): readonly IconName[] {
  return ALL_ICON_NAMES;
}

/**
 * Get all small icon names
 */
export function getSmallIcons(): readonly IconName[] {
  return SMALL_ICON_NAMES;
}

/**
 * Get all medium icon names
 */
export function getMediumIcons(): readonly IconName[] {
  return MEDIUM_ICON_NAMES;
}

/**
 * Search for icons by name pattern
 */
export function searchIcons(query: string): IconName[] {
  const lowerQuery = query.toLowerCase();
  return ALL_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(lowerQuery)
  ) as IconName[];
}

/**
 * Get icon statistics
 */
export function getIconStats() {
  const totalIcons = ALL_ICON_NAMES.length;
  const smallIcons = SMALL_ICON_NAMES.length;
  const mediumIcons = MEDIUM_ICON_NAMES.length;
  const bothSizes = ALL_ICON_NAMES.filter((name) => hasBothSizes(name)).length;

  return {
    total: totalIcons,
    small: smallIcons,
    medium: mediumIcons,
    bothSizes,
    smallOnly: smallIcons - bothSizes,
    mediumOnly: mediumIcons - bothSizes,
  };
}
