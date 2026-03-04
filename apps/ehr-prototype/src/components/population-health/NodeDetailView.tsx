/**
 * NodeDetailView Component
 *
 * Detail drawer content for a pathway node.
 * Shows lifecycle state badge, configuration, flow breakdown (inbound/at-stage/outbound/throughput),
 * patient list at this stage, and stage metrics.
 */

import React, { useMemo } from 'react';
import { Users, Clock, AlertTriangle, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import {
  PATHWAYS,
  getPatientsByNode,
} from '../../data/mock-population-health';
import type { NodeFlowState } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface NodeDetailViewProps {
  nodeId: string;
}

// ============================================================================
// Lifecycle Badge
// ============================================================================

const LIFECYCLE_COLORS: Record<string, { bg: string; fg: string }> = {
  active: { bg: colors.bg.positive.subtle, fg: colors.fg.positive.primary },
  paused: { bg: colors.bg.attention.subtle, fg: colors.fg.attention.primary },
  draft: { bg: colors.bg.neutral.subtle, fg: colors.fg.neutral.secondary },
  'needs-review': { bg: colors.bg.attention.subtle, fg: colors.fg.attention.primary },
  test: { bg: colors.bg.information.subtle, fg: colors.fg.information.primary },
  archived: { bg: colors.bg.neutral.subtle, fg: colors.fg.neutral.spotReadable },
  error: { bg: colors.bg.alert.subtle, fg: colors.fg.alert.primary },
};

const LifecycleBadge: React.FC<{ state: string }> = ({ state: lifecycleState }) => {
  const style = LIFECYCLE_COLORS[lifecycleState] ?? LIFECYCLE_COLORS.draft;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: borderRadius.full,
      fontSize: 11,
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: style.bg,
      color: style.fg,
      textTransform: 'capitalize',
    }}>
      {lifecycleState.replace('-', ' ')}
    </span>
  );
};

// ============================================================================
// Flow Breakdown
// ============================================================================

const FlowBreakdown: React.FC<{ flowState: NodeFlowState }> = ({ flowState }) => (
  <div style={detailStyles.flowContainer}>
    {/* Inbound */}
    <div style={detailStyles.flowGroup}>
      <div style={detailStyles.flowGroupHeader}>
        <ArrowDownRight size={12} color={colors.fg.neutral.secondary} />
        <span style={detailStyles.flowGroupLabel}>Inbound</span>
      </div>
      <div style={detailStyles.flowRow}>
        <span style={detailStyles.flowRowLabel}>Natural flow</span>
        <span style={detailStyles.flowRowValue}>{flowState.inbound.natural}</span>
      </div>
      {flowState.inbound.error > 0 && (
        <div style={detailStyles.flowRow}>
          <span style={{ ...detailStyles.flowRowLabel, color: colors.fg.alert.primary }}>Error / pileup</span>
          <span style={{ ...detailStyles.flowRowValue, color: colors.fg.alert.primary }}>{flowState.inbound.error}</span>
        </div>
      )}
    </div>

    {/* At Stage */}
    <div style={detailStyles.flowGroup}>
      <div style={detailStyles.flowGroupHeader}>
        <Activity size={12} color={colors.fg.neutral.secondary} />
        <span style={detailStyles.flowGroupLabel}>At This Stage</span>
      </div>
      <div style={detailStyles.flowRow}>
        <span style={detailStyles.flowRowLabel}>In progress</span>
        <span style={detailStyles.flowRowValue}>{flowState.atStage.inProgress}</span>
      </div>
      <div style={detailStyles.flowRow}>
        <span style={detailStyles.flowRowLabel}>Waiting</span>
        <span style={detailStyles.flowRowValue}>{flowState.atStage.waiting}</span>
      </div>
      {flowState.atStage.error > 0 && (
        <div style={detailStyles.flowRow}>
          <span style={{ ...detailStyles.flowRowLabel, color: colors.fg.alert.primary }}>Error</span>
          <span style={{ ...detailStyles.flowRowValue, color: colors.fg.alert.primary }}>{flowState.atStage.error}</span>
        </div>
      )}
    </div>

    {/* Outbound */}
    <div style={detailStyles.flowGroup}>
      <div style={detailStyles.flowGroupHeader}>
        <ArrowUpRight size={12} color={colors.fg.neutral.secondary} />
        <span style={detailStyles.flowGroupLabel}>Outbound</span>
      </div>
      <div style={detailStyles.flowRow}>
        <span style={detailStyles.flowRowLabel}>Completed</span>
        <span style={detailStyles.flowRowValue}>{flowState.outbound.completed}</span>
      </div>
      {flowState.outbound.byPath && Object.entries(flowState.outbound.byPath).map(([path, count]) => (
        <div key={path} style={detailStyles.flowRow}>
          <span style={detailStyles.flowRowLabel}>&rarr; {path}</span>
          <span style={detailStyles.flowRowValue}>{count}</span>
        </div>
      ))}
    </div>

    {/* Throughput */}
    {flowState.throughput && (
      <div style={detailStyles.flowGroup}>
        <div style={detailStyles.flowRow}>
          <span style={detailStyles.flowRowLabel}>Avg. time in stage</span>
          <span style={detailStyles.flowRowValue}>{flowState.throughput.avgDaysInStage} days</span>
        </div>
        {flowState.throughput.patientsPerDay !== undefined && (
          <div style={detailStyles.flowRow}>
            <span style={detailStyles.flowRowLabel}>Throughput</span>
            <span style={detailStyles.flowRowValue}>{flowState.throughput.patientsPerDay}/day</span>
          </div>
        )}
      </div>
    )}
  </div>
);

// ============================================================================
// Component
// ============================================================================

export const NodeDetailView: React.FC<NodeDetailViewProps> = ({ nodeId }) => {
  const { dispatch } = usePopHealth();

  // Find node across all pathways
  const { node, pathway } = useMemo(() => {
    for (const p of PATHWAYS) {
      const n = p.nodes.find((n) => n.id === nodeId);
      if (n) return { node: n, pathway: p };
    }
    return { node: null, pathway: null };
  }, [nodeId]);

  const patients = useMemo(() => {
    if (!pathway) return [];
    return getPatientsByNode(pathway.id, nodeId);
  }, [pathway, nodeId]);

  if (!node || !pathway) {
    return (
      <div style={detailStyles.emptyState} data-testid="node-detail-view">
        <span style={detailStyles.emptyText}>Node not found</span>
      </div>
    );
  }

  return (
    <div style={detailStyles.container} data-testid="node-detail-view">
      {/* Configuration section */}
      <div style={detailStyles.section}>
        <h4 style={detailStyles.sectionTitle}>Configuration</h4>
        <div style={detailStyles.fieldGrid}>
          <div style={detailStyles.field}>
            <span style={detailStyles.fieldLabel}>Type</span>
            <span style={detailStyles.fieldValue}>{node.type}</span>
          </div>
          <div style={detailStyles.field}>
            <span style={detailStyles.fieldLabel}>Pathway</span>
            <span style={detailStyles.fieldValue}>{pathway.name}</span>
          </div>
          <div style={detailStyles.field}>
            <span style={detailStyles.fieldLabel}>Status</span>
            <LifecycleBadge state={node.lifecycleState} />
          </div>
          {node.description && (
            <div style={detailStyles.field}>
              <span style={detailStyles.fieldLabel}>Description</span>
              <span style={detailStyles.fieldValue}>{node.description}</span>
            </div>
          )}
          {Object.entries(node.config).map(([key, value]) => (
            <div key={key} style={detailStyles.field}>
              <span style={detailStyles.fieldLabel}>{key}</span>
              <span style={detailStyles.fieldValue}>{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow breakdown (when flow data is available) */}
      {node.flowState && (
        <div style={detailStyles.section}>
          <h4 style={detailStyles.sectionTitle}>Flow</h4>
          <FlowBreakdown flowState={node.flowState} />
        </div>
      )}

      {/* Stage metrics */}
      <div style={detailStyles.section}>
        <h4 style={detailStyles.sectionTitle}>Stage Metrics</h4>
        <div style={detailStyles.metricsRow}>
          <div style={detailStyles.metricItem}>
            <Users size={14} color={colors.fg.neutral.secondary} />
            <span style={detailStyles.metricValue}>{node.patientCount ?? 0}</span>
            <span style={detailStyles.metricLabel}>patients</span>
          </div>
          {node.gapCount !== undefined && node.gapCount > 0 && (
            <div style={detailStyles.metricItem}>
              <AlertTriangle size={14} color={colors.fg.attention.primary} />
              <span style={detailStyles.metricValue}>{node.gapCount}</span>
              <span style={detailStyles.metricLabel}>gaps</span>
            </div>
          )}
        </div>
      </div>

      {/* Patient list */}
      <div style={detailStyles.section}>
        <h4 style={detailStyles.sectionTitle}>
          Patients at Stage ({patients.length})
        </h4>
        <div style={detailStyles.patientList}>
          {patients.map((patient) => {
            const assignment = patient.pathways.find((a) => a.pathwayId === pathway.id);
            const daysInStage = assignment
              ? Math.floor((Date.now() - assignment.stageEntryDate.getTime()) / 86400000)
              : 0;

            return (
              <div
                key={patient.patientId}
                style={detailStyles.patientRow}
                onClick={() => dispatch({
                  type: 'DRAWER_OPENED',
                  view: { type: 'patient-preview', patientId: patient.patientId },
                })}
                role="button"
                tabIndex={0}
              >
                <div style={detailStyles.patientInfo}>
                  <span style={detailStyles.patientName}>{patient.name}</span>
                  <span style={detailStyles.patientMeta}>
                    {patient.age}{patient.gender[0]} · {patient.riskTier} risk
                  </span>
                </div>
                <div style={detailStyles.patientStage}>
                  <Clock size={12} color={colors.fg.neutral.secondary} />
                  <span style={detailStyles.daysLabel}>{daysInStage}d</span>
                </div>
              </div>
            );
          })}

          {patients.length === 0 && (
            <span style={detailStyles.emptyText}>No patients at this stage</span>
          )}
        </div>
      </div>
    </div>
  );
};

NodeDetailView.displayName = 'NodeDetailView';

// ============================================================================
// Styles
// ============================================================================

const detailStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.separatedSm,
    padding: spaceAround.default,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    margin: 0,
  },
  fieldGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
  },
  field: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spaceBetween.related,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    textAlign: 'right' as const,
  },
  // Flow breakdown styles
  flowContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  flowGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  flowGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  flowGroupLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
  },
  flowRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  flowRowLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  flowRowValue: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
  // Metrics styles
  metricsRow: {
    display: 'flex',
    gap: spaceBetween.separatedSm,
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  patientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  patientRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    flex: 1,
    minWidth: 0,
  },
  patientName: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
  patientMeta: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  patientStage: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  daysLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
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
