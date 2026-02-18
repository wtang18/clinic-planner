/**
 * SignOff Component (Process View)
 *
 * Sign-off section for the Process view with:
 * - Encounter completeness checklist
 * - Mock E&M level suggestion
 * - Outstanding items summary
 * - Protocol adherence placeholder (reserved slot)
 * - "Sign & Close Encounter" button
 */

import React from 'react';
import { PenTool, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ChecklistItem, EMLevel as EMLevelType } from '../../state/selectors/process-view';
import type { SignOffBlocker } from '../../screens/ReviewView/SignOffSection';
import type { EncounterMeta } from '../../types';
import { CompletenessChecklist } from './CompletenessChecklist';
import { EMLevel } from './EMLevel';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SignOffProps {
  encounter: EncounterMeta;
  checklist: ChecklistItem[];
  emLevel: EMLevelType;
  outstandingCount: number;
  blockers: SignOffBlocker[];
  isSigningOff: boolean;
  onSignOff: () => void;
  onChecklistSectionTap?: (sectionId: string) => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SignOff: React.FC<SignOffProps> = ({
  encounter,
  checklist,
  emLevel,
  outstandingCount,
  blockers,
  isSigningOff,
  onSignOff,
  onChecklistSectionTap,
  style,
}) => {
  const hasErrors = blockers.some(b => b.severity === 'error');
  const errorBlockers = blockers.filter(b => b.severity === 'error');
  const warningBlockers = blockers.filter(b => b.severity === 'warning');

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="process-sign-off"
      style={{ ...styles.container, ...style }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <PenTool size={24} />
        </div>
        <div>
          <h3 style={styles.title}>Sign & Close Encounter</h3>
          <p style={styles.subtitle}>
            Review completeness and sign off on your documentation
          </p>
        </div>
      </div>

      {/* Completeness Checklist */}
      <CompletenessChecklist
        checklist={checklist}
        onSectionTap={onChecklistSectionTap}
        style={styles.checklistSection}
      />

      {/* E&M Level */}
      <EMLevel emLevel={emLevel} style={styles.emSection} />

      {/* Outstanding items */}
      {outstandingCount > 0 && (
        <div style={styles.outstandingRow} data-testid="outstanding-count">
          <AlertTriangle size={16} color={colors.fg.attention.secondary} />
          <span style={styles.outstandingText}>
            {outstandingCount} item{outstandingCount !== 1 ? 's' : ''} still need attention
          </span>
        </div>
      )}

      {/* Protocol adherence placeholder */}
      <div style={styles.protocolPlaceholder} data-testid="protocol-placeholder">
        <span style={styles.protocolText}>Protocol adherence: --</span>
        <span style={styles.protocolNote}>(Future feature)</span>
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div style={styles.blockersContainer}>
          {errorBlockers.length > 0 && (
            <div style={styles.blockerGroup}>
              <span style={styles.blockerGroupTitle}>
                <AlertTriangle size={14} color={colors.fg.alert.secondary} />
                Required ({errorBlockers.length})
              </span>
              <ul style={styles.blockerList}>
                {errorBlockers.map((b, i) => (
                  <li key={i} style={{ ...styles.blockerItem, color: colors.fg.alert.secondary }} data-testid="sign-off-blocker">
                    {b.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warningBlockers.length > 0 && (
            <div style={styles.blockerGroup}>
              <span style={styles.blockerGroupTitle}>
                <AlertTriangle size={14} color={colors.fg.attention.secondary} />
                Recommended ({warningBlockers.length})
              </span>
              <ul style={styles.blockerList}>
                {warningBlockers.map((b, i) => (
                  <li key={i} style={{ ...styles.blockerItem, color: colors.fg.attention.secondary }}>
                    {b.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Ready state */}
      {blockers.length === 0 && (
        <div style={styles.readyState}>
          <CheckCircle size={20} color={colors.fg.positive.secondary} />
          <span style={styles.readyText}>All documentation complete. Ready to sign.</span>
        </div>
      )}

      {/* Sign button */}
      <Button
        variant="primary"
        size="lg"
        disabled={hasErrors || isSigningOff}
        onClick={onSignOff}
        style={styles.signButton}
        data-testid="sign-close-btn"
      >
        {isSigningOff ? 'Signing...' : 'Sign & Close Encounter'}
      </Button>

      {/* Legal note */}
      {!hasErrors && (
        <p style={styles.legalNote}>
          By signing, I confirm that this documentation accurately reflects the
          care provided and is complete to the best of my knowledge.
        </p>
      )}

      {/* Encounter info */}
      <div style={styles.encounterInfo}>
        <span>Encounter: {encounter.id}</span>
        <span>&middot;</span>
        <span>Status: {encounter.status}</span>
      </div>
    </Card>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: spaceAround.spacious,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.related,
    marginBottom: spaceAround.defaultPlus,
  },
  headerIcon: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.sm,
    color: colors.fg.accent.primary,
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    margin: 0,
  },
  checklistSection: {
    marginBottom: spaceAround.default,
  },
  emSection: {
    marginBottom: spaceAround.default,
  },
  outstandingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.attention.subtle,
    borderRadius: borderRadius.sm,
    marginBottom: spaceAround.default,
  },
  outstandingText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.attention.secondary,
  },
  protocolPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    marginBottom: spaceAround.default,
  },
  protocolText: {
    fontSize: 13,
    color: colors.fg.neutral.disabled,
  },
  protocolNote: {
    fontSize: 11,
    color: colors.fg.neutral.disabled,
    fontStyle: 'italic',
  },
  blockersContainer: {
    marginBottom: spaceAround.default,
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
  },
  blockerGroup: {
    marginBottom: spaceAround.compact,
  },
  blockerGroupTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.tight,
  },
  blockerList: {
    margin: 0,
    paddingLeft: spaceAround.spacious,
    listStyle: 'disc',
  },
  blockerItem: {
    fontSize: 13,
    marginBottom: 2,
  },
  readyState: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.default,
    backgroundColor: colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
    marginBottom: spaceAround.default,
  },
  readyText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.positive.secondary,
  },
  signButton: {
    width: '100%',
    marginBottom: spaceAround.default,
  },
  legalNote: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    margin: 0,
    marginBottom: spaceAround.default,
  },
  encounterInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.repeating,
    fontSize: 12,
    color: colors.fg.neutral.disabled,
  },
};

SignOff.displayName = 'SignOff';
