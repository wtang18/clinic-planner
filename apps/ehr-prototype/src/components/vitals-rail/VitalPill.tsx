/**
 * VitalPill Component
 *
 * Compact vital display pill for the VitalsRail. Supports 4 states:
 * - Empty: dashes with label on neutral background
 * - Single: value + label, colored by flag
 * - Multi: stacked readings with timestamps
 * - Overflow: top 2 readings + "+N Readings" indicator
 *
 * Color coding by flag:
 * - normal/undefined: neutral background
 * - high/low: alert subtle background
 * - critical: alert medium background
 */

import React from 'react';
import type { VitalReading } from '../../types/vitals';
import { colors, typography, borderRadius, spaceBetween } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface VitalPillProps {
  label: string;
  readings: VitalReading[];
  /** For BP, pass merged systolic+diastolic as formatValue. */
  formatValue?: (readings: VitalReading[]) => string[];
}

// ============================================================================
// Flag → Color mapping
// ============================================================================

function flagBg(flag?: VitalReading['flag']): string {
  switch (flag) {
    case 'high':
    case 'low':
      return colors.bg.alert.low;
    case 'critical':
      return colors.bg.alert.medium;
    default:
      return colors.bg.neutral.subtle;
  }
}

function flagFg(flag?: VitalReading['flag']): string {
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
// Helpers
// ============================================================================

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'p' : 'a';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')}${ampm}`;
}

const MAX_VISIBLE = 2;

// ============================================================================
// Component
// ============================================================================

export const VitalPill: React.FC<VitalPillProps> = ({ label, readings, formatValue }) => {
  // Empty state
  if (readings.length === 0) {
    return (
      <div style={{ ...styles.pill, backgroundColor: colors.bg.neutral.subtle }}>
        <span style={{ ...styles.value, color: colors.fg.neutral.spotReadable }}>--</span>
        <span style={styles.label}>{label}</span>
      </div>
    );
  }

  // Format values
  const formattedValues = formatValue
    ? formatValue(readings)
    : readings.map((r) => String(r.value));

  // Single reading
  if (readings.length === 1) {
    const flag = readings[0].flag;
    return (
      <div style={{ ...styles.pill, backgroundColor: flagBg(flag) }}>
        <span style={{ ...styles.value, color: flagFg(flag) }}>{formattedValues[0]}</span>
        <span style={{ ...styles.label, color: flag ? flagFg(flag) : styles.label.color }}>{label}</span>
      </div>
    );
  }

  // Multi / Overflow
  const visible = readings.slice(0, MAX_VISIBLE);
  const overflow = readings.length - MAX_VISIBLE;
  const topFlag = readings[0].flag;

  return (
    <div style={{ ...styles.pill, backgroundColor: flagBg(topFlag), flexDirection: 'column', alignItems: 'stretch' }}>
      {visible.map((r, i) => (
        <div key={i} style={styles.multiRow}>
          <span style={{ ...styles.value, color: flagFg(r.flag), fontSize: 12 }}>
            {formattedValues[i]}
          </span>
          {readings.length > 1 && (
            <span style={styles.timestamp}>{formatTime(r.timestamp)}</span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <span style={styles.overflow}>+{overflow} Reading{overflow > 1 ? 's' : ''}</span>
      )}
      <span style={{ ...styles.label, color: topFlag ? flagFg(topFlag) : styles.label.color, marginTop: 1 }}>
        {label}
      </span>
    </div>
  );
};

VitalPill.displayName = 'VitalPill';

// ============================================================================
// Styles
// ============================================================================

const styles = {
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '5px 8px',
    borderRadius: borderRadius.sm,
    minHeight: 28,
  } as React.CSSProperties,

  value: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    lineHeight: 1.2,
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textTransform: 'lowercase' as const,
    lineHeight: 1.2,
  } as React.CSSProperties,

  multiRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  } as React.CSSProperties,

  timestamp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    lineHeight: 1.2,
  } as React.CSSProperties,

  overflow: {
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic' as const,
    lineHeight: 1.2,
  } as React.CSSProperties,
};
