/**
 * PriorityDetailView Component
 *
 * Self-contained drawer for priority item detail. Renders its own SlideDrawer
 * (size="wide") so the footer content stays coupled with the view's state.
 *
 * Sections:
 * 1. Patient header (avatar, name, demographics, risk, conditions)
 * 2. Priority context (badge, "why this needs attention", AI reasoning for REVIEW)
 * 3. Clinical snapshot (key-value grid)
 * 4. Recent actions timeline
 * 5. Inline actions (defer/assign/flag for non-REVIEW)
 *
 * Sticky footer:
 * - REVIEW: [Open Workspace] ··· [More] [Decline] [Approve]
 * - Non-REVIEW: [Open Workspace] ··· [More]
 */

import React, { useMemo, useCallback, useState } from 'react';
import { User, AlertTriangle, Sparkles, Flag, Timer, ArrowRight } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { useNavigation } from '../../navigation/NavigationContext';
import {
  MOCK_POP_HEALTH_PATIENTS,
  PATHWAYS,
  MOCK_ESCALATION_FLAGS,
  ENCOUNTER_PATIENT_MAP,
  getPathwaysByCohort,
} from '../../data/mock-population-health';
import { derivePriorityItems } from '../../utils/priority-computation';
import { SlideDrawer } from '../shared/SlideDrawer';
import { DrawerFooter } from '../shared/DrawerFooter';
import {
  colors,
  spaceAround,
  spaceBetween,
  typography,
  borderRadius,
  transitions,
  glass,
} from '../../styles/foundations';
import type { PriorityBadge } from '../../types/population-health';

// ============================================================================
// Badge Color Mapping (matches PriorityCard)
// ============================================================================

const BADGE_COLORS: Record<PriorityBadge, { bg: string; fg: string }> = {
  URGENT: { bg: colors.bg.alert.low, fg: colors.fg.alert.primary },
  REVIEW: { bg: colors.bg.attention.low, fg: colors.fg.attention.primary },
  ACTION: { bg: colors.bg.accent.low, fg: colors.fg.accent.primary },
  MONITOR: { bg: colors.bg.neutral.low, fg: colors.fg.neutral.secondary },
};

// ============================================================================
// Picker Options (matches PriorityCard)
// ============================================================================

const DEFER_OPTIONS = ['1hr', '4hr', 'Tomorrow', '1 wk'] as const;
const ASSIGN_OPTIONS = ['AI', 'MA Chen', 'Dr. Park'] as const;

type PickerMode = 'default' | 'defer' | 'assign';

// ============================================================================
// Types
// ============================================================================

interface PriorityDetailViewProps {
  priorityItemId: string;
  open: boolean;
  onClose: () => void;
  showBack?: boolean;
  onBack?: () => void;
  /** Called when an action removes this item from the queue */
  onRemoveItem?: (id: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const PriorityDetailView: React.FC<PriorityDetailViewProps> = ({
  priorityItemId,
  open,
  onClose,
  showBack,
  onBack,
  onRemoveItem,
}) => {
  const { state, dispatch } = usePopHealth();
  const { navigateToScope } = useNavigation();

  // Inline action state
  const [pickerMode, setPickerMode] = useState<PickerMode>('default');
  const [flagged, setFlagged] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [actionConfirmation, setActionConfirmation] = useState<string | null>(null);

  // Compute the priority item from source data (cohort-scoped)
  const pathways = useMemo(() => {
    if (state.selectedCohortId) {
      return getPathwaysByCohort(state.selectedCohortId);
    }
    return PATHWAYS;
  }, [state.selectedCohortId]);

  const allItems = useMemo(
    () => derivePriorityItems(pathways, MOCK_POP_HEALTH_PATIENTS, MOCK_ESCALATION_FLAGS),
    [pathways],
  );

  const item = useMemo(
    () => allItems.find((i) => i.id === priorityItemId),
    [allItems, priorityItemId],
  );

  // Look up full patient + pathway + node data
  const patient = useMemo(
    () => MOCK_POP_HEALTH_PATIENTS.find((p) => p.patientId === item?.patientId),
    [item?.patientId],
  );

  const pathway = useMemo(
    () => PATHWAYS.find((pw) => pw.id === item?.pathwayId),
    [item?.pathwayId],
  );

  const node = useMemo(
    () => pathway?.nodes.find((n) => n.id === item?.nodeId),
    [pathway, item?.nodeId],
  );

  const patientAssignment = useMemo(
    () => patient?.pathways.find((a) => a.pathwayId === item?.pathwayId),
    [patient, item?.pathwayId],
  );

  const encounterId = item ? ENCOUNTER_PATIENT_MAP[item.patientId] : undefined;

  // ---- Action handlers ----

  const handleOpenWorkspace = useCallback(() => {
    if (encounterId && item) {
      onClose();
      navigateToScope(
        { type: 'patient', patientId: item.patientId, encounterId },
        { mode: 'push' },
      );
    }
  }, [encounterId, item, onClose, navigateToScope]);

  const handleApprove = useCallback(() => {
    if (!item) return;
    onRemoveItem?.(item.id);
    setActionConfirmation('Approved');
    setTimeout(() => onClose(), 1500);
  }, [item, onRemoveItem, onClose]);

  const handleDeclineSubmit = useCallback(() => {
    if (!item) return;
    onRemoveItem?.(item.id);
    setActionConfirmation('Declined');
    setTimeout(() => onClose(), 1500);
  }, [item, onRemoveItem, onClose]);

  const handleDefer = useCallback(() => {
    if (!item) return;
    onRemoveItem?.(item.id);
    setActionConfirmation('Deferred');
    setTimeout(() => onClose(), 1500);
  }, [item, onRemoveItem, onClose]);

  const handleAssign = useCallback(() => {
    if (!item) return;
    onRemoveItem?.(item.id);
    setActionConfirmation('Assigned');
    setTimeout(() => onClose(), 1500);
  }, [item, onRemoveItem, onClose]);

  const handleMoreAction = useCallback((label: string) => {
    if (!item) return;
    onRemoveItem?.(item.id);
    setActionConfirmation(label);
    setTimeout(() => onClose(), 1500);
  }, [item, onRemoveItem, onClose]);

  // ---- Derived data ----

  const isReview = item?.badge === 'REVIEW';
  const badgeColor = item ? BADGE_COLORS[item.badge] : BADGE_COLORS.MONITOR;

  const riskColor = patient?.riskTier === 'high'
    ? colors.fg.alert.primary
    : patient?.riskTier === 'rising'
      ? colors.fg.attention.primary
      : colors.fg.positive.primary;

  // "Why this needs attention" lines
  const attentionLines: string[] = useMemo(() => {
    if (!item) return [];
    const lines: string[] = [];
    if (item.isEscalated && item.escalationReason) {
      lines.push(`Escalated: ${item.escalationReason}`);
    }
    if (item.isStale) {
      lines.push(`Patient has been at this stage for ${item.daysAtStage} days (longer than expected)`);
    }
    lines.push(`Current stage: ${item.nodeLabel} in ${item.pathwayName}`);
    lines.push(`Patient status: ${item.patientStatus}`);
    return lines;
  }, [item]);

  const conditionsList = useMemo(() => {
    if (!patient) return [];
    const conditions = patient.clinicalData.conditions;
    return Array.isArray(conditions) ? conditions as string[] : [];
  }, [patient]);

  // ---- Footer ----

  const moreActions = useMemo(() => [
    { label: 'Escalate', onClick: () => handleMoreAction('Escalated') },
    { label: 'Transfer to another provider', onClick: () => handleMoreAction('Transferred') },
    { label: 'Remove from flow', onClick: () => handleMoreAction('Removed') },
  ], [handleMoreAction]);

  const footer = (item && !actionConfirmation) ? (
    <DrawerFooter
      link={encounterId ? { label: 'Open Workspace \u203A', onClick: handleOpenWorkspace } : undefined}
      moreActions={moreActions}
      secondary={isReview && !declineMode ? { label: 'Decline', onClick: () => setDeclineMode(true) } : undefined}
      primary={isReview ? { label: 'Approve \u2713', onClick: handleApprove } : undefined}
    />
  ) : undefined;

  // ---- Header title ----

  const headerContent = (
    <span style={{
      fontSize: 14,
      fontWeight: 600,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.primary,
    }}>
      Priority Detail
    </span>
  );

  // ---- Body content ----

  const renderBody = () => {
    if (!item || !patient) {
      return (
        <div style={st.emptyState} data-testid="priority-detail-view">
          <span style={st.emptyText}>Priority item not found</span>
        </div>
      );
    }

    if (actionConfirmation) {
      return (
        <div style={st.confirmationContainer} data-testid="priority-detail-confirmation">
          <div style={st.confirmationBadge}>
            {actionConfirmation === 'Declined' ? '\u2717' : '\u2713'} {actionConfirmation}
          </div>
        </div>
      );
    }

    return (
      <div style={st.container} data-testid="priority-detail-view">
        {/* 1. Patient Header */}
        <div style={st.header}>
          <div style={st.avatar}>
            <User size={20} color={colors.fg.neutral.secondary} />
          </div>
          <div style={st.headerInfo}>
            <span style={st.name}>{patient.name}</span>
            <span style={st.demographics}>
              {patient.age} {'\u00B7'} {patient.gender} {'\u00B7'}{' '}
              <span style={{ color: riskColor, fontWeight: 500 }}>
                {patient.riskTier} risk
              </span>
            </span>
            {conditionsList.length > 0 && (
              <span style={st.conditions}>{conditionsList.join(', ')}</span>
            )}
          </div>
        </div>

        {/* 2. Priority Context */}
        <div style={st.section}>
          <div style={st.sectionTitleRow}>
            <h4 style={st.sectionTitle}>Priority Context</h4>
            <span style={{
              fontSize: 11,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.sans,
              color: badgeColor.fg,
              background: badgeColor.bg,
              padding: '2px 8px',
              borderRadius: borderRadius.full,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.5,
            }}>
              {item.badge}
            </span>
          </div>

          <div style={st.attentionBox}>
            <AlertTriangle size={14} color={colors.fg.attention.primary} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={st.attentionContent}>
              <span style={st.attentionTitle}>Why this needs attention</span>
              {attentionLines.map((line, i) => (
                <span key={i} style={st.attentionLine}>{line}</span>
              ))}
            </div>
          </div>

          <div style={st.contextMeta}>
            <span style={st.metaLabel}>Node type</span>
            <span style={st.metaValue}>{node?.type ?? 'unknown'}</span>
          </div>
          <div style={st.contextMeta}>
            <span style={st.metaLabel}>Pathway</span>
            <span style={st.metaValue}>{item.pathwayName}</span>
          </div>
          <div style={st.contextMeta}>
            <span style={st.metaLabel}>Days at stage</span>
            <span style={st.metaValue}>{item.daysAtStage}d</span>
          </div>

          {/* AI reasoning for REVIEW items */}
          {isReview && item.aiReasoning && (
            <div style={st.aiBox}>
              <div style={st.aiHeader}>
                <Sparkles size={14} color={colors.fg.accent.primary} />
                <span style={st.aiTitle}>AI Analysis</span>
              </div>
              <p style={st.aiText}>{item.aiReasoning}</p>
            </div>
          )}
        </div>

        {/* 3. Clinical Snapshot */}
        <div style={st.section}>
          <h4 style={st.sectionTitle}>Clinical Data</h4>
          <div style={st.clinicalGrid}>
            {Object.entries(patient.clinicalData).map(([key, value]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (ch) => ch.toUpperCase())
                .trim();
              let displayValue = String(value);
              if (value instanceof Date) {
                displayValue = value.toLocaleDateString();
              } else if (Array.isArray(value)) {
                displayValue = value.join(', ');
              }
              return (
                <div key={key} style={st.clinicalField}>
                  <span style={st.fieldLabel}>{label}</span>
                  <span style={st.fieldValue}>{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Recent Actions Timeline */}
        {patientAssignment && patientAssignment.history.length > 0 && (
          <div style={st.section}>
            <h4 style={st.sectionTitle}>Recent Actions</h4>
            <div style={st.timeline}>
              {patientAssignment.history.slice(-4).reverse().map((event, i) => (
                <div key={i} style={st.timelineItem}>
                  <div style={st.timelineDot} />
                  <div style={st.timelineContent}>
                    <span style={st.timelineAction}>{event.action}</span>
                    <span style={st.timelineDate}>
                      {event.date.toLocaleDateString()}
                      {event.result && ` \u00B7 ${event.result}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Inline Actions (non-REVIEW items) */}
        {!isReview && (
          <div style={st.section}>
            <h4 style={st.sectionTitle}>Quick Actions</h4>
            <div style={st.inlineActionsRow}>
              {pickerMode === 'default' && (
                <>
                  <button style={st.actionBtn} onClick={() => setPickerMode('defer')}>
                    <Timer size={14} /> Defer
                  </button>
                  <button style={st.actionBtn} onClick={() => setPickerMode('assign')}>
                    <ArrowRight size={14} /> Assign
                  </button>
                  <button style={st.actionBtn} onClick={() => setFlagged((f) => !f)}>
                    <Flag size={14} /> {flagged ? 'Unflag' : 'Flag'}
                  </button>
                </>
              )}
              {pickerMode === 'defer' && (
                <>
                  {DEFER_OPTIONS.map((option) => (
                    <button key={option} style={st.actionBtn} onClick={handleDefer}>
                      {option}
                    </button>
                  ))}
                  <button style={st.cancelBtn} onClick={() => setPickerMode('default')}>
                    Cancel
                  </button>
                </>
              )}
              {pickerMode === 'assign' && (
                <>
                  {ASSIGN_OPTIONS.map((option) => (
                    <button key={option} style={st.actionBtn} onClick={handleAssign}>
                      {option}
                    </button>
                  ))}
                  <button style={st.cancelBtn} onClick={() => setPickerMode('default')}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* REVIEW decline inline input */}
        {isReview && declineMode && (
          <div style={st.section}>
            <h4 style={st.sectionTitle}>Decline Reason</h4>
            <input
              type="text"
              style={st.declineInput}
              placeholder="Enter reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              autoFocus
            />
            <div style={st.declineButtons}>
              <button style={st.cancelBtn} onClick={() => setDeclineMode(false)}>
                Cancel
              </button>
              <button
                style={{
                  ...st.actionBtn,
                  opacity: declineReason.trim().length === 0 ? 0.5 : 1,
                  pointerEvents: declineReason.trim().length === 0 ? 'none' : 'auto',
                }}
                onClick={handleDeclineSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      size="wide"
      showBack={showBack}
      onBack={onBack}
      header={headerContent}
      footer={footer}
      testID="priority-detail-drawer"
    >
      {renderBody()}
    </SlideDrawer>
  );
};

PriorityDetailView.displayName = 'PriorityDetailView';

// ============================================================================
// Styles
// ============================================================================

const st: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.separatedSm,
    padding: spaceAround.default,
    paddingBottom: 80,
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
  confirmationContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  confirmationBadge: {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.positive.primary,
    backgroundColor: colors.bg.positive.low,
    padding: '12px 24px',
    borderRadius: borderRadius.md,
  },
  // Patient header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  },
  avatar: {
    width: 44,
    height: 44,
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
    gap: 2,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  demographics: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  conditions: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  },
  // Section
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
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Attention box
  attentionBox: {
    display: 'flex',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.attention.low,
    borderRadius: borderRadius.sm,
  },
  attentionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  attentionTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.attention.primary,
  },
  attentionLine: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  },
  // Context meta
  contextMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spaceBetween.related,
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    textAlign: 'right' as const,
    textTransform: 'capitalize' as const,
  },
  // AI reasoning
  aiBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.accent.low,
    borderRadius: borderRadius.sm,
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.accent.primary,
  },
  aiText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    lineHeight: 1.5,
    margin: 0,
  },
  // Clinical grid
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
  // Timeline
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
  // Inline actions
  inlineActionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    height: 28,
    padding: '0 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap' as const,
    ...glass.secondary,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.primary,
    transition: `background ${transitions.fast}`,
  },
  cancelBtn: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    height: 28,
    padding: '0 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap' as const,
    ...glass.secondary,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.secondary,
    transition: `background ${transitions.fast}`,
  },
  // Decline input
  declineInput: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    padding: '8px 12px',
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  declineButtons: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
};
