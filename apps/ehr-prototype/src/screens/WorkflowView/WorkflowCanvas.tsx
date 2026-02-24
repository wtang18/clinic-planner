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
import { EncounterContextBar } from '../../components/layout/EncounterContextBar';
import { Button } from '../../components/primitives/Button';
import type { UseWorkflowStateResult } from './useWorkflowState';
import type { EncounterMeta } from '../../types';
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
  encounter?: EncounterMeta;
  chiefComplaint?: string;
  providerName?: string;
  providerCredentials?: string;
  room?: string;
  payer?: string;
  groupName?: string;
  visitMode?: 'walk-in' | 'scheduled' | 'virtual';
  caseId?: string;
  tags?: string[];
  locked?: boolean;
  visitName?: string;
  onVisitNameChange?: (name: string) => void;
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
// Section summaries for completed sections
// ============================================================================

const SECTION_SUMMARIES: Record<string, string> = {
  'billing-provider': 'Dr. Chen',
  'supervisor': 'Dr. Smith',
  'patient-info': 'Verified',
  'patient-cards': 'Scanned',
  'specialty': 'Primary Care',
  'responsible-party': 'Self',
  'credit-card': 'On file',
  'consent-forms': 'Signed',
  'payment-collection': 'Copay collected',
  'assign-room': 'Room 3',
  'vitals': 'Recorded',
  'hpi': 'Documented',
  'medical-history': 'Reviewed',
  'rx-renewals': 'None',
  'review-bill': 'Reviewed',
  'additional-charges': 'None',
  'book-follow-up': 'Scheduled',
};

// ============================================================================
// Component
// ============================================================================

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  phase,
  workflowState,
  encounter,
  chiefComplaint,
  providerName,
  providerCredentials,
  room,
  payer,
  groupName,
  visitMode,
  caseId,
  tags,
  locked,
  visitName,
  onVisitNameChange,
}) => {
  const phaseMeta = WORKFLOW_PHASES.find((p) => p.key === phase);
  if (!phaseMeta) return null;

  const isPhaseComplete = workflowState.completedPhases.has(phase);
  const progress = workflowState.phaseProgress(phase);
  const allDone = progress.done === progress.total && progress.total > 0;

  return (
    <div style={styles.wrapper}>
      {/* Encounter context bar */}
      {encounter && (
        <EncounterContextBar
          encounter={encounter}
          chiefComplaint={chiefComplaint}
          providerName={providerName}
          providerCredentials={providerCredentials}
          room={room}
          payer={payer}
          groupName={groupName}
          caseId={caseId}
          tags={tags}
          locked={locked}
          visitName={visitName}
          onVisitNameChange={onVisitNameChange}
          visitMode={visitMode}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        />
      )}

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
              state={state}
              isExpanded={isExpanded}
              summary={state === 'complete' ? SECTION_SUMMARIES[sectionDef.id] : undefined}
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

      {/* Complete Phase card with progress */}
      {!isPhaseComplete && (
        <div style={styles.completeCard}>
          {/* Progress inside card */}
          <span style={styles.progressLabel}>
            {allDone
              ? 'All sections complete \u2014 ready to advance'
              : `${progress.done} of ${progress.total} sections`}
          </span>
          <div style={styles.progressBar}>
            <div style={{
              width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%',
              height: '100%',
              backgroundColor: allDone ? colors.fg.positive.primary : colors.fg.accent.primary,
              borderRadius: 2,
              transition: 'width 250ms ease',
            }} />
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Check size={16} />}
            onClick={() => workflowState.completePhase(phase)}
          >
            Complete {phaseMeta.label}
          </Button>
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
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  } as React.CSSProperties,

  placeholder: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic',
    padding: `${spaceAround.compact}px 0`,
  } as React.CSSProperties,

  completeCard: {
    marginTop: spaceBetween.related,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    padding: spaceAround.default,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spaceBetween.related,
  } as React.CSSProperties,

  progressBar: {
    width: '100%',
    maxWidth: 300,
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

  completeHint: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    marginTop: 0,
    marginBottom: 0,
  } as React.CSSProperties,

  completeBanner: {
    marginTop: spaceBetween.related,
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
