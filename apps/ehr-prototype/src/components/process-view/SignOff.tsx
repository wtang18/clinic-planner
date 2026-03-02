/**
 * SignOff Component (Process View)
 *
 * Thin wrapper around SignOffSection that adds process-specific content:
 * - Encounter completeness checklist
 * - Mock E&M level suggestion
 * - Outstanding items summary
 * - Protocol adherence placeholder (reserved slot)
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ChecklistItem, EMLevel as EMLevelType } from '../../state/selectors/process-view';
import type { SignOffBlocker } from '../../screens/ReviewView/SignOffSection';
import type { EncounterMeta } from '../../types';
import { SignOffSection } from '../../screens/ReviewView/SignOffSection';
import { CompletenessChecklist } from './CompletenessChecklist';
import { EMLevel } from './EMLevel';
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
}) => (
  <SignOffSection
    encounter={encounter}
    blockers={blockers}
    isSigningOff={isSigningOff}
    onSignOff={onSignOff}
    title="Sign & Close Encounter"
    subtitle="Review completeness and sign off on your documentation"
    buttonLabel="Sign & Close Encounter"
    style={style}
    testId="process-sign-off"
  >
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
  </SignOffSection>
);

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
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
};

SignOff.displayName = 'SignOff';
