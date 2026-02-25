/**
 * VitalsCard Component
 *
 * Specialized card for displaying vitals items with measurement flags.
 */

import React from 'react';
import { Heart, ArrowUp, ArrowDown } from 'lucide-react';
import type { VitalsItem, VitalMeasurement, VitalType } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { AbnormalFlag } from '../primitives/AbnormalFlag';

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

  const flagBgColor = isCritical
    ? colors.bg.alert.subtle
    : isAbnormal
    ? colors.bg.attention.subtle
    : colors.bg.neutral.min;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    alignItems: compact ? 'center' : 'flex-start',
    gap: compact ? spaceBetween.repeating : spaceBetween.coupled,
    padding: compact ? spaceAround.tight : spaceAround.compact,
    backgroundColor: flagBgColor,
    borderRadius: borderRadius.sm,
    minWidth: compact ? 'auto' : '80px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontWeight: typography.fontWeight.medium,
  };

  const valueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const trendIconStyle: React.CSSProperties = {
    display: 'flex',
    color: trend === 'up' ? colors.fg.alert.secondary : trend === 'down' ? colors.fg.positive.secondary : colors.fg.neutral.disabled,
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{config.label}</span>
      <div style={valueContainerStyle}>
        <AbnormalFlag
          flag={measurement.flag}
          value={measurement.value}
          unit={config.unit}
          size={compact ? 'sm' : 'md'}
          style={{ fontFamily: typography.fontFamily.mono, fontWeight: typography.fontWeight.semibold }}
        />
        {trend && trend !== 'stable' && (
          <span style={trendIconStyle}>
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
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
    gap: spaceBetween.relatedCompact,
    padding: isCompact ? spaceAround.compact : spaceAround.default,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.bg.accent.subtle,
    }),
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const headerContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.repeating,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? 14 : 16,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  };

  const vitalsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isCompact ? 'repeat(auto-fill, minmax(100px, 1fr))' : 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: spaceBetween.repeating,
  };

  // Blood pressure combined display
  const BPDisplay: React.FC = () => {
    if (!bpSystolic || !bpDiastolic) return null;

    const bpAbnormal = (bpSystolic.flag && bpSystolic.flag !== 'normal') || (bpDiastolic.flag && bpDiastolic.flag !== 'normal');
    const bpCritical = bpSystolic.flag === 'critical' || bpDiastolic.flag === 'critical';

    const bpColor = bpCritical
      ? colors.fg.alert.secondary
      : bpAbnormal
      ? colors.fg.attention.secondary
      : colors.fg.neutral.secondary;

    const bpBgColor = bpCritical
      ? colors.bg.alert.subtle
      : bpAbnormal
      ? colors.bg.attention.subtle
      : colors.bg.neutral.min;

    return (
      <div style={{
        display: 'flex',
        flexDirection: isCompact ? 'row' : 'column',
        alignItems: isCompact ? 'center' : 'flex-start',
        gap: isCompact ? spaceBetween.repeating : spaceBetween.coupled,
        padding: isCompact ? spaceAround.tight : spaceAround.compact,
        backgroundColor: bpBgColor,
        borderRadius: borderRadius.sm,
        minWidth: isCompact ? 'auto' : '100px',
      }}>
        <span style={{
          fontSize: 12,
          color: colors.fg.neutral.spotReadable,
          fontWeight: typography.fontWeight.medium,
        }}>BP</span>
        <span style={{
          fontSize: isCompact ? 14 : 18,
          fontWeight: typography.fontWeight.semibold,
          color: bpColor,
          fontFamily: typography.fontFamily.mono,
        }}>
          {bpSystolic.value}/{bpDiastolic.value}
        </span>
        <span style={{
          fontSize: 12,
          color: colors.fg.neutral.disabled,
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
          <CardIconContainer color={hasCritical ? 'alert' : 'default'} size={isCompact ? 'md' : 'lg'}>
            <Heart size={isCompact ? 16 : 20} />
          </CardIconContainer>

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
