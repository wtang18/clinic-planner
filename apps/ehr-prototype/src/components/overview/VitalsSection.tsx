/**
 * VitalsSection Component
 *
 * Displays recent vitals with mini sparklines in the overview pane.
 */

import React from 'react';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { OverviewSection } from '../layout/OverviewSection';

// ============================================================================
// Types
// ============================================================================

export interface VitalReading {
  value: number;
  unit: string;
  timestamp: string;
  isAbnormal?: boolean;
}

export interface Vital {
  id: string;
  name: string;
  shortName: string;
  readings: VitalReading[];
  normalRange?: { min: number; max: number };
}

export interface VitalsSectionProps {
  /** List of vitals */
  vitals: Vital[];
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Called when a vital is clicked */
  onVitalClick?: (vitalId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Mini Sparkline Component
// ============================================================================

const MiniSparkline: React.FC<{ values: number[]; width?: number; height?: number; isAbnormal?: boolean }> = ({
  values,
  width = 48,
  height = 16,
  isAbnormal = false,
}) => {
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={isAbnormal ? colors.fg.alert.secondary : colors.fg.accent.primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ============================================================================
// Component
// ============================================================================

export const VitalsSection: React.FC<VitalsSectionProps> = ({
  vitals,
  defaultCollapsed = false,
  onVitalClick,
  style,
  testID,
}) => {
  // Check if any vital has abnormal latest reading
  const hasAbnormalVitals = vitals.some(
    (v) => v.readings.length > 0 && v.readings[v.readings.length - 1]?.isAbnormal
  );

  // Generate collapsed summary
  const abnormalVitals = vitals.filter(
    (v) => v.readings.length > 0 && v.readings[v.readings.length - 1]?.isAbnormal
  );
  const collapsedSummary = hasAbnormalVitals
    ? `\u26A0\uFE0F ${abnormalVitals.map((v) => v.shortName).join(', ')}`
    : vitals.length > 0
    ? 'Recent vitals recorded'
    : undefined;

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.related,
    padding: `${spaceAround.tight}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.xs,
    cursor: onVitalClick ? 'pointer' : 'default',
  };

  const getTrend = (readings: VitalReading[]) => {
    if (readings.length < 2) return null;
    const latest = readings[readings.length - 1].value;
    const previous = readings[readings.length - 2].value;
    const diff = latest - previous;
    const percentChange = Math.abs(diff / previous) * 100;

    if (percentChange < 2) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: string | null, isAbnormal?: boolean) => {
    const color = isAbnormal ? colors.fg.alert.secondary : colors.fg.neutral.secondary;
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color={color} />;
      case 'down':
        return <TrendingDown size={14} color={color} />;
      default:
        return <Minus size={14} color={color} />;
    }
  };

  return (
    <OverviewSection
      title="Vitals"
      count={vitals.length}
      collapsedSummary={collapsedSummary}
      hasAlert={hasAbnormalVitals}
      icon={<Heart size={16} />}
      defaultCollapsed={defaultCollapsed}
      style={style}
      testID={testID}
    >
      {vitals.length === 0 ? (
        <div
          style={{
            padding: `${spaceAround.compact}px 0`,
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.spotReadable,
          }}
        >
          No vitals recorded
        </div>
      ) : (
        <div style={listStyle}>
          {vitals.map((vital) => {
            const latestReading =
              vital.readings.length > 0
                ? vital.readings[vital.readings.length - 1]
                : null;
            const trend = getTrend(vital.readings);
            const values = vital.readings.map((r) => r.value);

            return (
              <div
                key={vital.id}
                style={{
                  ...itemStyle,
                  borderLeft: latestReading?.isAbnormal
                    ? `3px solid ${colors.fg.alert.secondary}`
                    : 'none',
                }}
                onClick={() => onVitalClick?.(vital.id)}
                role={onVitalClick ? 'button' : undefined}
                tabIndex={onVitalClick ? 0 : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: typography.fontFamily.sans,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.fg.neutral.primary,
                      minWidth: 80,
                    }}
                  >
                    {vital.shortName}
                  </span>
                  <MiniSparkline
                    values={values}
                    isAbnormal={latestReading?.isAbnormal}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
                  {latestReading && (
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: typography.fontFamily.sans,
                        fontWeight: typography.fontWeight.semibold,
                        color: latestReading.isAbnormal
                          ? colors.fg.alert.secondary
                          : colors.fg.neutral.primary,
                      }}
                    >
                      {latestReading.value}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: typography.fontWeight.regular,
                          color: colors.fg.neutral.secondary,
                          marginLeft: 2,
                        }}
                      >
                        {latestReading.unit}
                      </span>
                    </span>
                  )}
                  {getTrendIcon(trend, latestReading?.isAbnormal)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OverviewSection>
  );
};

VitalsSection.displayName = 'VitalsSection';
