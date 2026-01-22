/**
 * Styling Utilities
 *
 * Helper functions for working with design tokens in components.
 */

import type { ItemCategory, ItemStatus, Tag } from '../types/chart-items';
import type { Priority } from '../types/common';
import { colors } from './tokens';

// ============================================================================
// Category Colors
// ============================================================================

/**
 * Color set for a category
 */
export interface CategoryColors {
  /** Background color */
  bg: string;
  /** Text color */
  text: string;
  /** Border color */
  border: string;
  /** Icon color */
  icon: string;
  /** Light background for badges */
  lightBg: string;
}

/**
 * Get colors for a chart item category
 */
export function getCategoryColor(category: ItemCategory): CategoryColors {
  switch (category) {
    case 'medication':
      return {
        bg: colors.clinical.medicationLight,
        text: colors.clinical.medicationDark,
        border: colors.clinical.medication,
        icon: colors.clinical.medication,
        lightBg: colors.clinical.medicationLight,
      };

    case 'lab':
      return {
        bg: colors.clinical.labLight,
        text: colors.clinical.labDark,
        border: colors.clinical.lab,
        icon: colors.clinical.lab,
        lightBg: colors.clinical.labLight,
      };

    case 'diagnosis':
      return {
        bg: colors.clinical.diagnosisLight,
        text: colors.clinical.diagnosisDark,
        border: colors.clinical.diagnosis,
        icon: colors.clinical.diagnosis,
        lightBg: colors.clinical.diagnosisLight,
      };

    case 'vitals':
      return {
        bg: colors.clinical.vitalLight,
        text: colors.clinical.vitalDark,
        border: colors.clinical.vital,
        icon: colors.clinical.vital,
        lightBg: colors.clinical.vitalLight,
      };

    case 'imaging':
      return {
        bg: colors.clinical.imagingLight,
        text: colors.clinical.imagingDark,
        border: colors.clinical.imaging,
        icon: colors.clinical.imaging,
        lightBg: colors.clinical.imagingLight,
      };

    case 'procedure':
      return {
        bg: colors.clinical.procedureLight,
        text: colors.clinical.procedureDark,
        border: colors.clinical.procedure,
        icon: colors.clinical.procedure,
        lightBg: colors.clinical.procedureLight,
      };

    case 'allergy':
      return {
        bg: colors.clinical.allergyLight,
        text: colors.clinical.allergyDark,
        border: colors.clinical.allergy,
        icon: colors.clinical.allergy,
        lightBg: colors.clinical.allergyLight,
      };

    case 'referral':
      return {
        bg: colors.clinical.referralLight,
        text: colors.clinical.referralDark,
        border: colors.clinical.referral,
        icon: colors.clinical.referral,
        lightBg: colors.clinical.referralLight,
      };

    // Narrative categories
    case 'chief-complaint':
    case 'hpi':
    case 'ros':
    case 'physical-exam':
    case 'plan':
    case 'note':
    case 'instruction':
    default:
      return {
        bg: colors.neutral[100],
        text: colors.neutral[700],
        border: colors.neutral[300],
        icon: colors.neutral[500],
        lightBg: colors.neutral[50],
      };
  }
}

// ============================================================================
// Status Colors
// ============================================================================

/**
 * Get color for an item status
 */
export function getStatusColor(status: ItemStatus): string {
  switch (status) {
    case 'draft':
      return colors.neutral[400];
    case 'pending-review':
      return colors.status.warning;
    case 'confirmed':
      return colors.status.success;
    case 'ordered':
      return colors.status.info;
    case 'completed':
      return colors.status.success;
    case 'cancelled':
      return colors.neutral[400];
    default:
      return colors.neutral[500];
  }
}

/**
 * Get background color for an item status
 */
export function getStatusBgColor(status: ItemStatus): string {
  switch (status) {
    case 'draft':
      return colors.neutral[100];
    case 'pending-review':
      return colors.status.warningLight;
    case 'confirmed':
      return colors.status.successLight;
    case 'ordered':
      return colors.status.infoLight;
    case 'completed':
      return colors.status.successLight;
    case 'cancelled':
      return colors.neutral[100];
    default:
      return colors.neutral[100];
  }
}

// ============================================================================
// Confidence Colors
// ============================================================================

/**
 * Get color based on confidence score (0-1)
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) {
    return colors.ai.confidence.high;
  }
  if (confidence >= 0.6) {
    return colors.ai.confidence.medium;
  }
  return colors.ai.confidence.low;
}

/**
 * Get confidence level label
 */
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

/**
 * Styles for a priority level
 */
export interface PriorityStyles {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
}

/**
 * Get styles for a priority level
 */
export function getPriorityStyles(priority: Priority): PriorityStyles {
  switch (priority) {
    case 'urgent':
      return {
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: '🔴',
        label: 'Urgent',
      };
    case 'high':
      return {
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: '🟠',
        label: 'High',
      };
    case 'medium':
      return {
        color: colors.status.info,
        bgColor: colors.status.infoLight,
        icon: '🟡',
        label: 'Medium',
      };
    case 'low':
      return {
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: '🟢',
        label: 'Low',
      };
    default:
      return {
        color: colors.neutral[500],
        bgColor: colors.neutral[100],
        icon: '⚪',
        label: 'Normal',
      };
  }
}

// ============================================================================
// Care Gap Colors
// ============================================================================

/**
 * Get colors for care gap priority
 */
export function getCareGapPriorityColor(priority: 'routine' | 'important' | 'critical'): {
  color: string;
  bgColor: string;
} {
  switch (priority) {
    case 'critical':
      return {
        color: colors.careGap.critical,
        bgColor: colors.careGap.criticalLight,
      };
    case 'important':
      return {
        color: colors.careGap.important,
        bgColor: colors.careGap.importantLight,
      };
    case 'routine':
      return {
        color: colors.careGap.routine,
        bgColor: colors.careGap.routineLight,
      };
    default:
      return {
        color: colors.neutral[500],
        bgColor: colors.neutral[100],
      };
  }
}

// ============================================================================
// Tag Colors
// ============================================================================

/**
 * Get colors for a tag
 */
export function getTagColor(tag: Tag): { color: string; bgColor: string } {
  // Use custom color if provided
  if (tag.color) {
    return {
      color: tag.color,
      bgColor: `${tag.color}20`, // 20 is alpha hex
    };
  }

  // Default colors based on tag type
  switch (tag.type) {
    case 'status':
      return {
        color: colors.status.info,
        bgColor: colors.status.infoLight,
      };
    case 'source':
      return {
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
      };
    case 'alert':
      return {
        color: colors.status.error,
        bgColor: colors.status.errorLight,
      };
    case 'category':
      return {
        color: colors.primary[600],
        bgColor: colors.primary[100],
      };
    case 'ai':
      return {
        color: colors.ai.suggestion,
        bgColor: colors.ai.suggestionLight,
      };
    case 'workflow':
      return {
        color: colors.status.success,
        bgColor: colors.status.successLight,
      };
    default:
      return {
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
      };
  }
}

// ============================================================================
// Responsive Helpers
// ============================================================================

/**
 * Breakpoint values
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Create a media query string
 */
export function mediaQuery(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

/**
 * Check if we're on a mobile-sized screen
 * Note: This is a simple check and should be used with caution
 */
export function isMobileWidth(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < parseInt(breakpoints.md);
}

// ============================================================================
// CSS Variable Helpers
// ============================================================================

/**
 * Generate CSS custom properties from tokens
 */
export function generateCSSVariables(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          vars[`--color-${category}-${key}`] = value;
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            vars[`--color-${category}-${key}-${subKey}`] = subValue as string;
          });
        }
      });
    }
  });

  return vars;
}
