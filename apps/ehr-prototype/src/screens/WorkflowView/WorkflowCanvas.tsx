/**
 * WorkflowCanvas Component
 *
 * Main canvas for the visit workflow. Shows accordion sections for the
 * active phase, with "Complete [Phase]" button at the bottom.
 * Each section renders placeholder form content.
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { WorkflowPhase } from '../IntakeView/intakeChecklist';
import { WORKFLOW_PHASES } from '../IntakeView/intakeChecklist';
import { WorkflowSection } from '../../components/workflow/WorkflowSection';
import type { UseWorkflowStateResult } from './useWorkflowState';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';
import {
  BillingProviderSection,
  SupervisorSection,
  PatientInfoSection,
  PatientCardsSection,
  SpecialtySection,
  ResponsiblePartySection,
  CreditCardSection,
  ConsentFormsSection,
  PaymentCollectionSection,
  AssignRoomSection,
  VitalsSection,
  HPISection,
  MedicalHistorySection,
  RxRenewalsSection,
  ReviewBillSection,
  AdditionalChargesSection,
  BookFollowUpSection,
} from './sections/PlaceholderSections';

// ============================================================================
// Types
// ============================================================================

export interface WorkflowCanvasProps {
  phase: WorkflowPhase;
  workflowState: UseWorkflowStateResult;
  encounter?: {
    type?: string;
    date?: Date;
    id?: string;
  };
}

// ============================================================================
// Section → Component mapping
// ============================================================================

const SECTION_COMPONENTS: Record<string, React.FC> = {
  // Check-in
  'billing-provider': BillingProviderSection,
  'supervisor': SupervisorSection,
  'patient-info': PatientInfoSection,
  'patient-cards': PatientCardsSection,
  'specialty': SpecialtySection,
  'responsible-party': ResponsiblePartySection,
  'credit-card': CreditCardSection,
  'consent-forms': ConsentFormsSection,
  'payment-collection': PaymentCollectionSection,
  // Triage
  'assign-room': AssignRoomSection,
  'vitals': VitalsSection,
  'hpi': HPISection,
  'medical-history': MedicalHistorySection,
  'rx-renewals': RxRenewalsSection,
  // Checkout
  'review-bill': ReviewBillSection,
  'additional-charges': AdditionalChargesSection,
  'book-follow-up': BookFollowUpSection,
};

// ============================================================================
// Component
// ============================================================================

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  phase,
  workflowState,
  encounter,
}) => {
  const phaseMeta = WORKFLOW_PHASES.find((p) => p.key === phase);
  if (!phaseMeta) return null;

  const isPhaseComplete = workflowState.completedPhases.has(phase);
  const progress = workflowState.phaseProgress(phase);

  return (
    <div style={styles.wrapper}>
      {/* Encounter context header */}
      {encounter && (
        <div style={styles.contextHeader}>
          <span style={styles.contextLabel}>
            {encounter.date ? encounter.date.toLocaleDateString() : 'Today'} · {encounter.type || 'Visit'}
          </span>
        </div>
      )}

      {/* Progress indicator */}
      <div style={styles.progressRow}>
        <div style={styles.progressBar}>
          <div style={{
            width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%',
            height: '100%',
            backgroundColor: isPhaseComplete ? colors.fg.positive.primary : colors.fg.accent.primary,
            borderRadius: 2,
            transition: 'width 250ms ease',
          }} />
        </div>
        <span style={styles.progressLabel}>
          {progress.done} of {progress.total} sections
        </span>
      </div>

      {/* Accordion sections */}
      <div style={styles.sectionsContainer}>
        {phaseMeta.sections.map((sectionDef) => {
          const state = workflowState.sectionStates[sectionDef.id] || 'not_started';
          const isExpanded = workflowState.expandedSectionId === sectionDef.id;
          const SectionContent = SECTION_COMPONENTS[sectionDef.id];

          return (
            <WorkflowSection
              key={sectionDef.id}
              id={sectionDef.id}
              title={sectionDef.title}
              state={isExpanded ? 'in_progress' : state}
              onToggle={() => workflowState.toggleSection(sectionDef.id)}
              onComplete={() => workflowState.completeSection(sectionDef.id)}
              onSkip={sectionDef.optional ? () => workflowState.skipSection(sectionDef.id) : undefined}
            >
              {SectionContent ? <SectionContent /> : (
                <div style={styles.placeholder}>
                  Placeholder content for {sectionDef.title}
                </div>
              )}
            </WorkflowSection>
          );
        })}
      </div>

      {/* Complete Phase button */}
      {!isPhaseComplete && (
        <div style={styles.completeCard}>
          <button
            type="button"
            style={styles.completeButton}
            onClick={() => workflowState.completePhase(phase)}
          >
            <Check size={16} />
            Complete {phaseMeta.label}
          </button>
          <p style={styles.completeHint}>
            Marks all sections as done and advances to the next phase.
          </p>
        </div>
      )}

      {/* Phase complete state */}
      {isPhaseComplete && (
        <div style={styles.completeBanner}>
          <Check size={18} color={colors.fg.positive.primary} />
          <span style={styles.completeBannerText}>
            {phaseMeta.label} complete
          </span>
        </div>
      )}
    </div>
  );
};

WorkflowCanvas.displayName = 'WorkflowCanvas';

// ============================================================================
// Styles
// ============================================================================

const styles = {
  wrapper: {
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
    padding: `${spaceAround.spacious}px ${spaceAround.default}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.separated,
  } as React.CSSProperties,

  contextHeader: {
    marginBottom: spaceBetween.coupled,
  } as React.CSSProperties,

  contextLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  } as React.CSSProperties,

  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  } as React.CSSProperties,

  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bg.neutral.low,
    borderRadius: 2,
    overflow: 'hidden',
  } as React.CSSProperties,

  progressLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
  } as React.CSSProperties,

  placeholder: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic',
    padding: `${spaceAround.compact}px 0`,
  } as React.CSSProperties,

  completeCard: {
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    padding: spaceAround.default,
    textAlign: 'center',
  } as React.CSSProperties,

  completeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.compact}px ${spaceAround.spacious}px`,
    fontSize: 15,
    fontFamily: typography.fontFamily.sans,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.fg.accent.primary,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  } as React.CSSProperties,

  completeHint: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    marginTop: spaceBetween.coupled,
    marginBottom: 0,
  } as React.CSSProperties,

  completeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.default}px`,
    backgroundColor: colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
  } as React.CSSProperties,

  completeBannerText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.sans,
    fontWeight: 500,
    color: colors.fg.positive.primary,
  } as React.CSSProperties,
};
