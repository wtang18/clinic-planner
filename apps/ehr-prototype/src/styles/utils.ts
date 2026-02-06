/**
 * Styling Utilities
 *
 * Helper functions for applying design tokens in EHR components.
 * Uses canonical foundations + EHR-specific domain mappings.
 */

import type { ItemCategory, ItemStatus, Tag } from '../types/chart-items';
import type { Priority } from '../types/common';
import { colors } from './foundations/colors';

// ============================================================================
// Category Colors (EHR-specific domain mapping)
// ============================================================================

export interface CategoryColors {
  bg: string;
  text: string;
  border: string;
  icon: string;
  lightBg: string;
}

/**
 * Get colors for a chart item category.
 * Returns monochrome values for all categories.
 */
export function getCategoryColor(_category: ItemCategory): CategoryColors {
  return {
    bg: colors.bg.neutral.subtle,
    text: colors.fg.neutral.secondary,
    border: colors.border.neutral.low,
    icon: colors.fg.neutral.spotReadable,
    lightBg: colors.bg.neutral.min,
  };
}

// ============================================================================
// Status Colors
// ============================================================================

export function getStatusColor(status: ItemStatus): string {
  switch (status) {
    case 'draft':
      return colors.fg.neutral.spotReadable;
    case 'pending-review':
      return colors.fg.attention.secondary;
    case 'confirmed':
      return colors.fg.positive.secondary;
    case 'ordered':
      return colors.fg.information.secondary;
    case 'completed':
      return colors.fg.positive.secondary;
    case 'cancelled':
      return colors.fg.neutral.spotReadable;
    default:
      return colors.fg.neutral.secondary;
  }
}

export function getStatusBgColor(status: ItemStatus): string {
  switch (status) {
    case 'draft':
      return colors.bg.neutral.subtle;
    case 'pending-review':
      return colors.bg.attention.subtle;
    case 'confirmed':
      return colors.bg.positive.subtle;
    case 'ordered':
      return colors.bg.information.subtle;
    case 'completed':
      return colors.bg.positive.subtle;
    case 'cancelled':
      return colors.bg.neutral.subtle;
    default:
      return colors.bg.neutral.subtle;
  }
}

// ============================================================================
// Confidence Colors
// ============================================================================

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) {
    return colors.fg.positive.secondary;
  }
  if (confidence >= 0.6) {
    return colors.fg.attention.secondary;
  }
  return colors.fg.alert.secondary;
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return 'High confidence';
  }
  if (confidence >= 0.6) {
    return 'Medium confidence';
  }
  return 'Low confidence';
}

// ============================================================================
// Priority Styles
// ============================================================================

export interface PriorityStyles {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
}

export function getPriorityStyles(priority: Priority): PriorityStyles {
  switch (priority) {
    case 'urgent':
      return {
        color: colors.fg.alert.secondary,
        bgColor: colors.bg.alert.subtle,
        icon: '🔴',
        label: 'Urgent',
      };
    case 'high':
      return {
        color: colors.fg.attention.secondary,
        bgColor: colors.bg.attention.subtle,
        icon: '🟠',
        label: 'High',
      };
    case 'medium':
      return {
        color: colors.fg.information.secondary,
        bgColor: colors.bg.information.subtle,
        icon: '🟡',
        label: 'Medium',
      };
    case 'low':
      return {
        color: colors.fg.positive.secondary,
        bgColor: colors.bg.positive.subtle,
        icon: '🟢',
        label: 'Low',
      };
    default:
      return {
        color: colors.fg.neutral.secondary,
        bgColor: colors.bg.neutral.subtle,
        icon: '⚪',
        label: 'Normal',
      };
  }
}

// ============================================================================
// Care Gap Colors
// ============================================================================

export function getCareGapPriorityColor(priority: 'routine' | 'important' | 'critical'): {
  color: string;
  bgColor: string;
} {
  if (priority === 'critical') {
    return { color: colors.fg.alert.secondary, bgColor: colors.bg.alert.subtle };
  }
  return { color: colors.fg.neutral.secondary, bgColor: colors.bg.neutral.subtle };
}

// ============================================================================
// Tag Colors
// ============================================================================

export function getTagColor(tag: Tag): { color: string; bgColor: string } {
  if (tag.color) {
    return {
      color: tag.color,
      bgColor: `${tag.color}20`,
    };
  }

  switch (tag.type) {
    case 'status':
      return {
        color: colors.fg.information.secondary,
        bgColor: colors.bg.information.subtle,
      };
    case 'source':
      return {
        color: colors.fg.neutral.secondary,
        bgColor: colors.bg.neutral.subtle,
      };
    case 'alert':
      return {
        color: colors.fg.alert.secondary,
        bgColor: colors.bg.alert.subtle,
      };
    case 'category':
      return {
        color: colors.fg.accent.secondary,
        bgColor: colors.bg.accent.subtle,
      };
    case 'ai':
      return {
        color: colors.fg.generative.spotReadable,
        bgColor: colors.bg.positive.subtle,
      };
    case 'workflow':
      return {
        color: colors.fg.positive.secondary,
        bgColor: colors.bg.positive.subtle,
      };
    default:
      return {
        color: colors.fg.neutral.secondary,
        bgColor: colors.bg.neutral.subtle,
      };
  }
}

// ============================================================================
// Responsive Helpers
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export function mediaQuery(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

export function isMobileWidth(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < parseInt(breakpoints.md);
}
