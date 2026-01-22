/**
 * VitalsCard Component
 *
 * Specialized card for displaying vitals items with measurement flags.
 */

import React from 'react';
import type { VitalsItem, VitalMeasurement, VitalType } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';

// ============================================================================
// Types
// ============================================================================

export interface VitalsCardProps {
  /** The vitals item to display */
  vitals: VitalsItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Whether to show trend indicators (requires historical data) */
  showTrends?: boolean;
  /** Historical vitals for trend calculation */
  historicalVitals?: VitalsItem[];
  /** Whether the card is selected */
  selected?: boolean;
  /** Called when selected */
  onSelect?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const HeartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5,12 12,5 19,12" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19,12 12,19 5,12" />
  </svg>
);

// ============================================================================
// Constants
// ============================================================================

const VITAL_CONFIG: Record<VitalType, { label: string; unit: string; icon?: string }> = {
  'bp-systolic': { label: 'BP Sys', unit: 'mmHg' },
  'bp-diastolic': { label: 'BP Dia', unit: 'mmHg' },
  'pulse': { label: 'Pulse', unit: 'bpm' },
  'temp': { label: 'Temp', unit: '°F' },
  'resp': { label: 'Resp', unit: '/min' },
  'spo2': { label: 'SpO2', unit: '%' },
  'weight': { label: 'Weight', unit: 'lbs' },
  'height': { label: 'Height', unit: 'in' },
  'bmi': { label: 'BMI', unit: '' },
  'pain-scale': { label: 'Pain', unit: '/10' },
};

// ============================================================================
// Helper Components
// ============================================================================

interface VitalDisplayProps {
  measurement: VitalMeasurement;
  compact?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ measurement, compact, trend }) => {
  const config = VITAL_CONFIG[measurement.type] || { label: measurement.type, unit: measurement.unit };
  const isAbnormal = measurement.flag && measurement.flag !== 'normal';
  const isCritical = measurement.flag === 'critical';
  const isHigh = measurement.flag === 'high' || (measurement.flag === 'critical' && measurement.value > 0);
  const isLow = measurement.flag === 'low';

  const flagColor = isCritical
    ? colors.status.error
    : isAbnormal
    ? colors.status.warning
    : colors.neutral[700];

  const flagBgColor = isCritical
    ? colors.status.errorLight
    : isAbnormal
    ? colors.status.warningLight
    : colors.neutral[50];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    alignItems: compact ? 'center' : 'flex-start',
    gap: compact ? spacing[2] : spacing[1],
    padding: compact ? spacing[2] : spacing[3],
    backgroundColor: flagBgColor,
    borderRadius: radii.md,
    minWidth: compact ? 'auto' : '80px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  };

  const valueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
  };

  const valueStyle: React.CSSProperties = {
    fontSize: compact ? typography.fontSize.sm[0] : typography.fontSize.lg[0],
    fontWeight: typography.fontWeight.semibold,
    color: flagColor,
    fontFamily: typography.fontFamily.mono,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[400],
  };

  const trendIconStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    display: 'flex',
    color: trend === 'up' ? colors.status.error : trend === 'down' ? colors.status.success : colors.neutral[400],
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{config.label}</span>
      <div style={valueContainerStyle}>
        {isAbnormal && (
          <span style={{ width: '14px', height: '14px', display: 'flex', color: flagColor }}>
            {isHigh ? <ArrowUpIcon /> : isLow ? <ArrowDownIcon /> : null}
          </span>
        )}
        <span style={valueStyle}>{measurement.value}</span>
        <span style={unitStyle}>{config.unit}</span>
        {trend && trend !== 'stable' && (
          <span style={trendIconStyle}>
            {trend === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const VitalsCard: React.FC<VitalsCardProps> = ({
  vitals,
  variant = 'compact',
  showTrends = false,
  historicalVitals = [],
  selected = false,
  onSelect,
  style,
}) => {
  const categoryColors = getCategoryColor('vitals');
  const isCompact = variant === 'compact';
  const { data } = vitals;

  // Check for abnormal vitals
  const abnormalVitals = data.measurements.filter(m => m.flag && m.flag !== 'normal');
  const criticalVitals = data.measurements.filter(m => m.flag === 'critical');
  const hasAbnormal = abnormalVitals.length > 0;
  const hasCritical = criticalVitals.length > 0;

  // Group vitals for display
  const bpMeasurements = data.measurements.filter(m => m.type === 'bp-systolic' || m.type === 'bp-diastolic');
  const otherMeasurements = data.measurements.filter(m => m.type !== 'bp-systolic' && m.type !== 'bp-diastolic');

  // Format BP as combined display
  const bpSystolic = bpMeasurements.find(m => m.type === 'bp-systolic');
  const bpDiastolic = bpMeasurements.find(m => m.type === 'bp-diastolic');

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    padding: isCompact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${hasCritical ? colors.status.error : hasAbnormal ? colors.status.warning : categoryColors.border}`,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.primary[50],
    }),
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isCompact ? '32px' : '40px',
    height: isCompact ? '32px' : '40px',
    backgroundColor: hasCritical ? colors.status.errorLight : hasAbnormal ? colors.status.warningLight : categoryColors.lightBg,
    borderRadius: radii.lg,
    color: hasCritical ? colors.status.error : hasAbnormal ? colors.status.warning : categoryColors.icon,
    flexShrink: 0,
  };

  const headerContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const vitalsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isCompact ? 'repeat(auto-fill, minmax(100px, 1fr))' : 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: spacing[2],
  };

  // Blood pressure combined display
  const BPDisplay: React.FC = () => {
    if (!bpSystolic || !bpDiastolic) return null;

    const bpAbnormal = (bpSystolic.flag && bpSystolic.flag !== 'normal') || (bpDiastolic.flag && bpDiastolic.flag !== 'normal');
    const bpCritical = bpSystolic.flag === 'critical' || bpDiastolic.flag === 'critical';

    const bpColor = bpCritical
      ? colors.status.error
      : bpAbnormal
      ? colors.status.warning
      : colors.neutral[700];

    const bpBgColor = bpCritical
      ? colors.status.errorLight
      : bpAbnormal
      ? colors.status.warningLight
      : colors.neutral[50];

    return (
      <div style={{
        display: 'flex',
        flexDirection: isCompact ? 'row' : 'column',
        alignItems: isCompact ? 'center' : 'flex-start',
        gap: isCompact ? spacing[2] : spacing[1],
        padding: isCompact ? spacing[2] : spacing[3],
        backgroundColor: bpBgColor,
        borderRadius: radii.md,
        minWidth: isCompact ? 'auto' : '100px',
      }}>
        <span style={{
          fontSize: typography.fontSize.xs[0],
          color: colors.neutral[500],
          fontWeight: typography.fontWeight.medium,
        }}>BP</span>
        <span style={{
          fontSize: isCompact ? typography.fontSize.sm[0] : typography.fontSize.lg[0],
          fontWeight: typography.fontWeight.semibold,
          color: bpColor,
          fontFamily: typography.fontFamily.mono,
        }}>
          {bpSystolic.value}/{bpDiastolic.value}
        </span>
        <span style={{
          fontSize: typography.fontSize.xs[0],
          color: colors.neutral[400],
        }}>mmHg</span>
      </div>
    );
  };

  return (
    <Card
      variant={selected ? 'elevated' : 'default'}
      padding="none"
      interactive={!!onSelect}
      selected={selected}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <div style={{ width: isCompact ? '16px' : '20px', height: isCompact ? '16px' : '20px' }}>
              <HeartIcon />
            </div>
          </div>

          <div style={headerContentStyle}>
            <div style={titleContainerStyle}>
              <p style={titleStyle}>Vitals</p>
              {hasCritical && (
                <Badge variant="error" size="sm">Critical</Badge>
              )}
              {hasAbnormal && !hasCritical && (
                <Badge variant="warning" size="sm">Abnormal</Badge>
              )}
            </div>
            <span style={timeStyle}>
              {formatTime(data.capturedAt)}
              {data.position && ` · ${data.position}`}
            </span>
          </div>
        </div>

        {/* Vitals Grid */}
        <div style={vitalsGridStyle}>
          {bpSystolic && bpDiastolic && <BPDisplay />}
          {otherMeasurements.map((measurement, index) => (
            <VitalDisplay
              key={`${measurement.type}-${index}`}
              measurement={measurement}
              compact={isCompact}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatTime(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

VitalsCard.displayName = 'VitalsCard';
