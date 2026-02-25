/**
 * VitalCell Component
 *
 * Responsive grid card for a single vital sign in the TriageModule expanded view.
 * Supports single/multiple readings, OOR flag tinting, timestamps, and overflow.
 *
 * Layout (single reading):   "110/70 bp"
 * Layout (multiple):         "110/70 bp  8:58a"  (bold, most recent)
 *                            "108/77     8:56a"  (lighter, older)
 * Overflow (>2 readings):    "+N Readings" link after 2nd row.
 */

import React, { useState } from 'react';
import { colors, body, typography, borderRadius, spaceAround, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface VitalCellReading {
  value: string;
  timestamp?: string;   // e.g. "8:58a"
  flag?: 'high' | 'low' | 'critical';
  itemId?: string;      // originating VitalsItem ID for per-reading click
}

export interface VitalCellProps {
  label: string;                    // "bp", "hr", "rr", "temp", "spo₂", "bmi"
  readings: VitalCellReading[];     // Most recent first, max ~3 shown
  flag?: 'high' | 'low' | 'critical';  // OOR flag for most-recent reading
  onReadingClick?: (itemId: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function cellBg(flag?: VitalCellProps['flag']): string {
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

function flagColor(flag?: VitalCellReading['flag']): string {
  switch (flag) {
    case 'high':
    case 'low':
    case 'critical':
      return colors.fg.alert.primary;
    default:
      return colors.fg.neutral.primary;
  }
}

function flagSecondaryColor(flag?: VitalCellReading['flag']): string {
  if (flag === 'high' || flag === 'low' || flag === 'critical') return colors.fg.alert.secondary;
  return colors.fg.neutral.spotReadable;
}

// ============================================================================
// Component
// ============================================================================

const MAX_VISIBLE_READINGS = 2;

export const VitalCell: React.FC<VitalCellProps> = ({ label, readings, flag, onReadingClick }) => {
  const hasMultiple = readings.length > 1;
  const overflowCount = readings.length - MAX_VISIBLE_READINGS;
  const visibleReadings = readings.slice(0, MAX_VISIBLE_READINGS);

  if (readings.length === 0) {
    // Empty cell — dashes
    return (
      <div style={{ ...styles.container, backgroundColor: colors.bg.transparent.subtle }}>
        <div style={styles.readingRow}>
          <span style={styles.valuePrimary}>--</span>
          <span style={styles.label}>{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: cellBg(flag),
      }}
    >
      {visibleReadings.map((reading, i) => {
        const isPrimary = i === 0;
        const clickable = !!(reading.itemId && onReadingClick);
        return (
          <ReadingRow
            key={i}
            reading={reading}
            isPrimary={isPrimary}
            label={isPrimary ? label : undefined}
            showTimestamp={hasMultiple}
            cellFlag={flag}
            clickable={clickable}
            onClick={clickable ? () => onReadingClick!(reading.itemId!) : undefined}
          />
        );
      })}
      {overflowCount > 0 && (
        <span style={styles.overflow}>+{overflowCount} Reading{overflowCount > 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

VitalCell.displayName = 'VitalCell';

// ============================================================================
// ReadingRow — per-reading clickable row
// ============================================================================

const ReadingRow: React.FC<{
  reading: VitalCellReading;
  isPrimary: boolean;
  label?: string;
  showTimestamp: boolean;
  cellFlag?: VitalCellProps['flag'];
  clickable: boolean;
  onClick?: () => void;
}> = ({ reading, isPrimary, label, showTimestamp, cellFlag, clickable, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const valueColor = isPrimary
    ? flagColor(reading.flag)
    : flagSecondaryColor(reading.flag);

  const labelColor = cellFlag
    ? colors.fg.alert.secondary
    : colors.fg.neutral.secondary;

  const timestampColor = cellFlag
    ? colors.fg.alert.secondary
    : colors.fg.neutral.spotReadable;

  return (
    <div
      style={{
        ...styles.readingRow,
        cursor: clickable ? 'pointer' : 'default',
        borderRadius: borderRadius.xs,
        backgroundColor: hovered && clickable ? 'rgba(0,0,0,0.04)' : 'transparent',
        transition: `background-color ${transitions.fast}`,
        margin: '0 -2px',
        padding: '0 2px',
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
      } : undefined}
    >
      <span style={{
        ...(isPrimary ? styles.valuePrimary : styles.valueSecondary),
        color: valueColor,
      }}>
        {reading.value}
      </span>
      {label && (
        <span style={{ ...styles.label, color: labelColor }}>{label}</span>
      )}
      {showTimestamp && reading.timestamp && (
        <span style={{ ...styles.timestamp, color: timestampColor }}>{reading.timestamp}</span>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    borderRadius: borderRadius.sm,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    gap: 2,
    minWidth: 0,
  } as React.CSSProperties,

  readingRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 0,
  } as React.CSSProperties,

  valuePrimary: {
    fontSize: body.sm.medium.fontSize,
    fontWeight: body.sm.medium.fontWeight,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    lineHeight: `${body.sm.medium.lineHeight}px`,
  } as React.CSSProperties,

  valueSecondary: {
    fontSize: body.sm.regular.fontSize,
    fontWeight: body.sm.regular.fontWeight,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    lineHeight: `${body.sm.regular.lineHeight}px`,
  } as React.CSSProperties,

  label: {
    fontSize: body.sm.regular.fontSize,
    fontWeight: body.sm.regular.fontWeight,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: `${body.sm.regular.lineHeight}px`,
  } as React.CSSProperties,

  timestamp: {
    fontSize: body.sm.regular.fontSize,
    fontWeight: body.sm.regular.fontWeight,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    marginLeft: 'auto',
    lineHeight: `${body.sm.regular.lineHeight}px`,
    flexShrink: 0,
  } as React.CSSProperties,

  overflow: {
    fontSize: body.xs.regular.fontSize,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.accent.primary,
    cursor: 'pointer',
    marginTop: 2,
  } as React.CSSProperties,
};
