/**
 * PatientPreviewView Component
 *
 * Drawer content for patient preview in population health context.
 * Shows patient header, pathway assignments, clinical summary, and drill-through button.
 */

import React, { useMemo, useCallback } from 'react';
import { User, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { useNavigation } from '../../navigation/NavigationContext';
import {
  MOCK_POP_HEALTH_PATIENTS,
  PATHWAYS,
  ENCOUNTER_PATIENT_MAP,
} from '../../data/mock-population-health';
import { Button } from '../primitives/Button';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface PatientPreviewViewProps {
  patientId: string;
}

// ============================================================================
// Component
// ============================================================================

export const PatientPreviewView: React.FC<PatientPreviewViewProps> = ({ patientId }) => {
  const { state } = usePopHealth();
  const { navigateToEncounter } = useNavigation();

  const patient = useMemo(
    () => MOCK_POP_HEALTH_PATIENTS.find((p) => p.patientId === patientId),
    [patientId]
  );

  const encounterId = ENCOUNTER_PATIENT_MAP[patientId];

  const handleOpenWorkspace = useCallback(() => {
    if (encounterId) {
      navigateToEncounter(encounterId, 'capture');
    }
  }, [encounterId, navigateToEncounter]);

  if (!patient) {
    return (
      <div style={pvStyles.emptyState} data-testid="patient-preview-view">
        <span style={pvStyles.emptyText}>Patient not found</span>
      </div>
    );
  }

  const riskColor = patient.riskTier === 'high'
    ? colors.fg.alert.primary
    : patient.riskTier === 'rising'
      ? colors.fg.attention.primary
      : colors.fg.positive.primary;

  return (
    <div style={pvStyles.container} data-testid="patient-preview-view">
      {/* Patient header */}
      <div style={pvStyles.header}>
        <div style={pvStyles.avatar}>
          <User size={20} color={colors.fg.neutral.secondary} />
        </div>
        <div style={pvStyles.headerInfo}>
          <span style={pvStyles.name}>{patient.name}</span>
          <span style={pvStyles.demographics}>
            {patient.age} · {patient.gender} ·{' '}
            <span style={{ color: riskColor, fontWeight: 500 }}>
              {patient.riskTier} risk
            </span>
          </span>
        </div>
      </div>

      {/* Pathway assignments */}
      <div style={pvStyles.section}>
        <h4 style={pvStyles.sectionTitle}>Pathway Status</h4>
        {patient.pathways.map((assignment) => {
          const pathway = PATHWAYS.find((p) => p.id === assignment.pathwayId);
          const currentNode = pathway?.nodes.find((n) => n.id === assignment.currentNodeId);
          const daysInStage = Math.floor(
            (Date.now() - assignment.stageEntryDate.getTime()) / 86400000
          );

          const statusColor = assignment.status === 'escalated'
            ? colors.fg.alert.primary
            : assignment.status === 'stalled'
              ? colors.fg.attention.primary
              : colors.fg.neutral.primary;

          return (
            <div key={assignment.pathwayId} style={pvStyles.pathwayCard}>
              <div style={pvStyles.pathwayHeader}>
                <span style={pvStyles.pathwayName}>{pathway?.name ?? 'Unknown'}</span>
                <span style={{ ...pvStyles.statusBadge, color: statusColor }}>
                  {assignment.status}
                </span>
              </div>
              <div style={pvStyles.pathwayMeta}>
                <span style={pvStyles.metaItem}>
                  Stage: {currentNode?.label ?? 'Unknown'}
                </span>
                <span style={pvStyles.metaItem}>
                  <Clock size={11} /> {daysInStage}d in stage
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical summary */}
      <div style={pvStyles.section}>
        <h4 style={pvStyles.sectionTitle}>Clinical Data</h4>
        <div style={pvStyles.clinicalGrid}>
          {Object.entries(patient.clinicalData).map(([key, value]) => {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (s) => s.toUpperCase())
              .trim();
            let displayValue = String(value);
            if (value instanceof Date) {
              displayValue = value.toLocaleDateString();
            } else if (Array.isArray(value)) {
              displayValue = value.join(', ');
            }

            return (
              <div key={key} style={pvStyles.clinicalField}>
                <span style={pvStyles.fieldLabel}>{label}</span>
                <span style={pvStyles.fieldValue}>{displayValue}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent pathway actions */}
      {patient.pathways[0]?.history.length > 0 && (
        <div style={pvStyles.section}>
          <h4 style={pvStyles.sectionTitle}>Recent Actions</h4>
          <div style={pvStyles.timeline}>
            {patient.pathways[0].history.slice(-4).reverse().map((event, i) => (
              <div key={i} style={pvStyles.timelineItem}>
                <div style={pvStyles.timelineDot} />
                <div style={pvStyles.timelineContent}>
                  <span style={pvStyles.timelineAction}>{event.action}</span>
                  <span style={pvStyles.timelineDate}>
                    {event.date.toLocaleDateString()}
                    {event.result && ` · ${event.result}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill-through button */}
      <div style={pvStyles.footer}>
        {encounterId ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenWorkspace}
            leftIcon={<ExternalLink size={14} />}
            style={{ width: '100%' }}
          >
            Open Patient Workspace
          </Button>
        ) : (
          <div style={pvStyles.unavailable}>
            <AlertCircle size={14} color={colors.fg.neutral.secondary} />
            <span style={pvStyles.unavailableText}>
              Patient chart not available in prototype
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

PatientPreviewView.displayName = 'PatientPreviewView';

// ============================================================================
// Styles
// ============================================================================

const pvStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.separatedSm,
    padding: spaceAround.default,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors.bg.neutral.subtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  demographics: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
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
  pathwayCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  pathwayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathwayName: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
  statusBadge: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize' as const,
  },
  pathwayMeta: {
    display: 'flex',
    gap: spaceBetween.related,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  clinicalGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
  },
  clinicalField: {
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
    maxWidth: '60%',
    wordBreak: 'break-word' as const,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    paddingLeft: 12,
    borderLeft: `2px solid ${colors.border.neutral.low}`,
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
    position: 'relative',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: colors.fg.neutral.secondary,
    marginTop: 5,
    marginLeft: -16,
    flexShrink: 0,
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  timelineAction: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  },
  timelineDate: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  footer: {
    paddingTop: spaceAround.compact,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  unavailable: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.compact,
  },
  unavailableText: {
    fontSize: 13,
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
