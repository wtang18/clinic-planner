/**
 * Dashboard Component
 *
 * Displays aggregate metrics and alerts for the selected cohort/protocol.
 * Adapts scope based on PopHealthContext selection:
 * - Cohort selected (no protocol) → cohort-level metrics
 * - Protocol selected → protocol-level metrics
 */

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import {
  getMetricsForProtocol,
  getMetricsForCohort,
  getAlertsForProtocol,
  DASHBOARD_ALERTS,
} from '../../data/mock-population-health';
import type { DashboardMetric, DashboardAlert } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Metric Card
// ============================================================================

const MetricCard: React.FC<{ metric: DashboardMetric }> = ({ metric }) => {
  const trendIcon = metric.trend === 'up'
    ? <TrendingUp size={12} />
    : metric.trend === 'down'
      ? <TrendingDown size={12} />
      : metric.trend === 'stable'
        ? <Minus size={12} />
        : null;

  const trendColor = metric.trend === 'up'
    ? colors.fg.positive.primary
    : metric.trend === 'down'
      ? colors.fg.alert.primary
      : colors.fg.neutral.secondary;

  return (
    <div style={metricStyles.card}>
      <span style={metricStyles.label}>{metric.label}</span>
      <span style={metricStyles.value}>{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
      {metric.trend && (
        <div style={{ ...metricStyles.trend, color: trendColor }}>
          {trendIcon}
          {metric.trendValue && <span>{metric.trendValue}</span>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Alert Row
// ============================================================================

const AlertRow: React.FC<{ alert: DashboardAlert; onClick?: () => void }> = ({ alert, onClick }) => {
  const icon = alert.severity === 'critical'
    ? <AlertCircle size={14} />
    : alert.severity === 'warning'
      ? <AlertTriangle size={14} />
      : <Info size={14} />;

  const iconColor = alert.severity === 'critical'
    ? colors.fg.alert.primary
    : alert.severity === 'warning'
      ? colors.fg.attention.primary
      : colors.fg.accent.primary;

  return (
    <div
      style={alertStyles.row}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span style={{ color: iconColor, display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={alertStyles.message}>{alert.message}</span>
    </div>
  );
};

// ============================================================================
// Dashboard Component
// ============================================================================

export const Dashboard: React.FC = () => {
  const { state, dispatch } = usePopHealth();

  const metrics = useMemo(() => {
    if (state.selectedProtocolIds.length === 1) {
      return getMetricsForProtocol(state.selectedProtocolIds[0]);
    }
    if (state.selectedCohortId) {
      return getMetricsForCohort(state.selectedCohortId);
    }
    return [];
  }, [state.selectedProtocolIds, state.selectedCohortId]);

  const alerts = useMemo(() => {
    if (state.selectedProtocolIds.length === 1) {
      return getAlertsForProtocol(state.selectedProtocolIds[0]);
    }
    return DASHBOARD_ALERTS.slice(0, 3);
  }, [state.selectedProtocolIds]);

  const handleAlertClick = (alert: DashboardAlert) => {
    if (alert.protocolId) {
      dispatch({ type: 'PROTOCOL_SELECTED', protocolId: alert.protocolId });
      if (alert.nodeId) {
        dispatch({ type: 'NODE_SELECTED', nodeId: alert.nodeId });
      }
    }
  };

  return (
    <div style={dashboardStyles.container} data-testid="pop-health-dashboard">
      {/* Metrics grid */}
      {metrics.length > 0 && (
        <div style={dashboardStyles.metricsGrid}>
          {metrics.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={dashboardStyles.alertsSection}>
          <span style={dashboardStyles.sectionLabel}>Alerts</span>
          {alerts.map((a) => (
            <AlertRow
              key={a.id}
              alert={a}
              onClick={() => handleAlertClick(a)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && alerts.length === 0 && (
        <div style={dashboardStyles.emptyState}>
          <span style={dashboardStyles.emptyText}>Select a cohort to view metrics</span>
        </div>
      )}
    </div>
  );
};

Dashboard.displayName = 'Dashboard';

// ============================================================================
// Styles
// ============================================================================

const dashboardStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: `${LAYOUT.headerHeight + spaceAround.compact}px ${spaceAround.default}px ${spaceAround.compact}px`,
    flexShrink: 0,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: spaceBetween.relatedCompact,
  },
  alertsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.default,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
};

const metricStyles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  label: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
  },
};

const alertStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
  },
  message: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    lineHeight: 1.4,
  },
};
