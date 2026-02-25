/**
 * InlineVitalPill Component
 *
 * Compact inline vital display for the TriageModule.
 * Shows label + value (e.g., "BP 120/80", "HR 72").
 * Flags out-of-range values with alert colors.
 */

import React from 'react';
import { colors, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface InlineVitalPillProps {
  label: string;
  value: string;
  flag?: 'high' | 'low' | 'critical';
}

// ============================================================================
// Flag → Color mapping (adapted from VitalPill)
// ============================================================================

function flagBg(flag?: InlineVitalPillProps['flag']): string {
  switch (flag) {
    case 'high':
    case 'low':
      return colors.bg.alert.low;
    case 'critical':
      return colors.bg.alert.medium;
    default:
      return colors.bg.transparent.subtle;
  }
}

function flagFg(flag?: InlineVitalPillProps['flag']): string {
  switch (flag) {
    case 'high':
    case 'low':
    case 'critical':
      return colors.fg.alert.primary;
    default:
      return colors.fg.neutral.primary;
  }
}

// ============================================================================
// Component
// ============================================================================

export const InlineVitalPill: React.FC<InlineVitalPillProps> = ({ label, value, flag }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 8px',
    borderRadius: borderRadius.sm,
    backgroundColor: flagBg(flag),
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
  }}>
    <span style={{
      fontWeight: 500,
      color: colors.fg.neutral.secondary,
      textTransform: 'uppercase' as const,
      fontSize: 10,
      letterSpacing: 0.3,
    }}>
      {label}
    </span>
    <span style={{
      fontWeight: 600,
      color: flagFg(flag),
    }}>
      {value}
    </span>
  </span>
);

InlineVitalPill.displayName = 'InlineVitalPill';
