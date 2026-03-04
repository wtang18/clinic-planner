/**
 * NodeDetailView Component
 *
 * Detail drawer content for a pathway node.
 * Shows configuration, patient list at this stage, and stage metrics.
 */

import React, { useMemo } from 'react';
import { Users, Clock, AlertTriangle, BarChart2 } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import {
  PATHWAYS,
  getPatientsByNode,
} from '../../data/mock-population-health';
import type { PathwayNode, PathwayPatient } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface NodeDetailViewProps {
  nodeId: string;
}

// ============================================================================
// Component
// ============================================================================

export const NodeDetailView: React.FC<NodeDetailViewProps> = ({ nodeId }) => {
  const { state, dispatch } = usePopHealth();

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
