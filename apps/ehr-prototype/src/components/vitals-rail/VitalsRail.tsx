/**
 * VitalsRail Component
 *
 * Right rail module displaying vitals during charting. Matches ProcessingRail
 * chrome (200px width, same border/radius/header style).
 *
 * Shows 6 VitalPills in a 2-column grid: BP, HR, RR, Temp, SpO₂, BMI.
 * Always renders (unlike ProcessingRail) — empty state shows dashes.
 *
 * BP is special: merges systolic + diastolic readings into "120/80 bp" display.
 */

import React from 'react';
import type { VitalsSnapshot, VitalReading } from '../../types/vitals';
import { VitalPill } from './VitalPill';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Constants (matching ProcessingRail)
// ============================================================================

const RAIL_WIDTH = 200;

// ============================================================================
// Types
// ============================================================================

export interface VitalsRailProps {
  vitals: VitalsSnapshot;
  style?: React.CSSProperties;
}

// ============================================================================
// BP formatter — merges systolic[i] + diastolic[i] into "120/80"
// ============================================================================

function formatBP(systolic: VitalReading[], diastolic: VitalReading[]): {
  readings: VitalReading[];
  formatValue: (readings: VitalReading[]) => string[];
} {
  // Use systolic readings as the "carrier" — merge diastolic values into display
  const readings = systolic;
  const formatValue = (rs: VitalReading[]) =>
    rs.map((r, i) => {
      const dia = diastolic[i];
      return dia ? `${r.value}/${dia.value}` : String(r.value);
    });
  return { readings, formatValue };
}

// ============================================================================
// Component
// ============================================================================

export const VitalsRail: React.FC<VitalsRailProps> = ({ vitals, style }) => {
  const bp = formatBP(vitals.systolic, vitals.diastolic);

  return (
    <div style={{ ...styles.container, ...style }}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Vitals</span>
      </div>

      {/* Content: 2-col grid of 6 pills */}
      <div style={styles.content}>
        <div style={styles.grid}>
          <VitalPill label="bp" readings={bp.readings} formatValue={bp.formatValue} />
          <VitalPill label="hr" readings={vitals.pulse} />
          <VitalPill label="rr" readings={vitals.respRate} />
          <VitalPill label="temp" readings={vitals.temp} />
          <VitalPill label="spo₂" readings={vitals.spo2} />
          <VitalPill label="bmi" readings={vitals.bmi} />
        </div>
      </div>
    </div>
  );
};

VitalsRail.displayName = 'VitalsRail';

// ============================================================================
// Styles (matching ProcessingRail chrome)
// ============================================================================

const styles = {
  container: {
    width: RAIL_WIDTH,
    minWidth: RAIL_WIDTH,
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.sm,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  } as React.CSSProperties,

  headerTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    fontFamily: typography.fontFamily.sans,
  } as React.CSSProperties,

  content: {
    padding: `${spaceAround.tight}px ${spaceAround.tight}px`,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spaceBetween.coupled,
  } as React.CSSProperties,
};
