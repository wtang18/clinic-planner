/**
 * PatientCards Components
 *
 * Individual card components for the patient overview screen.
 */

import React from 'react';
import type {
  PatientContext,
  DiagnosisItem,
  MedicationItem,
  AllergyItem,
  CareGapInstance,
  EncounterMeta,
} from '../../types';
import { User, AlertTriangle, Heart, Pill, FileText, Calendar } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { Card } from '../../components/primitives/Card';
import { Badge } from '../../components/primitives/Badge';
import { CardIconContainer } from '../../components/primitives/CardIconContainer';
import { ListItemRow } from '../../components/primitives/ListItemRow';
import { SectionTitle } from '../../components/primitives/SectionTitle';

// ============================================================================
// Demographics Card
// ============================================================================

interface DemographicsCardProps {
  patient: PatientContext;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({ patient }) => {
  const { demographics, mrn, contact, insurance } = patient;

  const fullName = demographics.preferredName
    ? `${demographics.preferredName} (${demographics.firstName}) ${demographics.lastName}`
    : `${demographics.firstName} ${demographics.lastName}`;

  return (
    <Card variant="default" padding="lg">
      <SectionTitle
        title="Patient Information"
        icon={<CardIconContainer color="accent" size="lg"><User size={20} /></CardIconContainer>}
        style={styles.cardHeader}
      />

      <div style={styles.demographicsGrid}>
        <div style={styles.demographicsMain}>
          <div style={styles.patientName}>{fullName}</div>
          <div style={styles.patientMeta}>
            {demographics.age} years old · {demographics.gender}
            {demographics.pronouns && ` · ${demographics.pronouns}`}
          </div>
        </div>

        <div style={styles.demographicsDetails}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>MRN</span>
            <span style={styles.detailValue}>{mrn}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>DOB</span>
            <span style={styles.detailValue}>
              {new Date(demographics.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
          {contact?.phone && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Phone</span>
              <span style={styles.detailValue}>{contact.phone}</span>
            </div>
          )}
          {insurance?.primary && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Insurance</span>
              <span style={styles.detailValue}>{insurance.primary.payerName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// Allergies Card
// ============================================================================

interface AllergiesCardProps {
  allergies: AllergyItem[];
}

export const AllergiesCard: React.FC<AllergiesCardProps> = ({ allergies }) => {
  const severeAllergies = allergies.filter((a) => a.data.severity === 'severe');
  const hasSevere = severeAllergies.length > 0;

  return (
    <Card
      variant={hasSevere ? 'elevated' : 'default'}
      padding="lg"
      style={hasSevere ? { borderColor: colors.fg.alert.secondary, borderWidth: '2px' } : undefined}
    >
      <SectionTitle
        title="Allergies"
        icon={<CardIconContainer color={hasSevere ? 'alert' : 'default'} size="lg"><AlertTriangle size={20} /></CardIconContainer>}
        trailing={allergies.length === 0 ? <Badge variant="success" size="sm">NKDA</Badge> : undefined}
        style={styles.cardHeader}
      />

      {allergies.length > 0 && (
        <div style={styles.allergyList}>
          {allergies.map((allergy) => (
            <ListItemRow
              key={allergy.id}
              variant="subtle"
              trailing={
                <Badge
                  variant={allergy.data.severity === 'severe' ? 'error' : allergy.data.severity === 'moderate' ? 'warning' : 'default'}
                  size="sm"
                >
                  {allergy.data.severity}
                </Badge>
              }
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div>
                <span style={styles.allergyName}>{allergy.data.allergen}</span>
                {allergy.data.reaction && (
                  <div style={styles.allergyReaction}>{allergy.data.reaction}</div>
                )}
              </div>
            </ListItemRow>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Problem List Card
// ============================================================================

interface ProblemListCardProps {
  problems: DiagnosisItem[];
}

export const ProblemListCard: React.FC<ProblemListCardProps> = ({ problems }) => {
  const activeProblems = problems.filter((p) => p.data.clinicalStatus === 'active');

  return (
    <Card variant="default" padding="lg">
      <SectionTitle
        title="Problem List"
        icon={<CardIconContainer color="accent" size="lg"><FileText size={20} /></CardIconContainer>}
        count={`${activeProblems.length} active`}
        style={styles.cardHeader}
      />

      {activeProblems.length === 0 ? (
        <div style={styles.emptyState}>No active problems documented</div>
      ) : (
        <div style={styles.problemList}>
          {activeProblems.map((problem) => (
            <ListItemRow
              key={problem.id}
              trailing={
                problem.data.type ? (
                  <Badge variant={problem.data.type === 'chronic' ? 'warning' : 'default'} size="sm">
                    {problem.data.type}
                  </Badge>
                ) : undefined
              }
              style={{ padding: spaceAround.tight, borderBottom: `1px solid ${colors.bg.neutral.subtle}` }}
            >
              <span style={styles.problemName}>{problem.data.description}</span>
              {problem.data.icdCode && (
                <code style={styles.icdCode}>{problem.data.icdCode}</code>
              )}
            </ListItemRow>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Medications Card
// ============================================================================

interface MedicationsCardProps {
  medications: MedicationItem[];
}

export const MedicationsCard: React.FC<MedicationsCardProps> = ({ medications }) => {
  const activeMeds = medications.filter((m) => m.status === 'confirmed' || m.status === 'ordered');

  return (
    <Card variant="default" padding="lg">
      <SectionTitle
        title="Current Medications"
        icon={<CardIconContainer color="accent" size="lg"><Pill size={20} /></CardIconContainer>}
        count={activeMeds.length}
        style={styles.cardHeader}
      />

      {activeMeds.length === 0 ? (
        <div style={styles.emptyState}>No active medications</div>
      ) : (
        <div style={styles.medList}>
          {activeMeds.map((med) => (
            <ListItemRow
              key={med.id}
              style={{ padding: spaceAround.tight, borderBottom: `1px solid ${colors.bg.neutral.subtle}`, flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div>
                <div style={styles.medName}>{med.data.drugName}</div>
                <div style={styles.medDetails}>
                  {med.data.dosage && `${med.data.dosage} `}
                  {med.data.route && `${med.data.route} `}
                  {med.data.frequency && med.data.frequency}
                </div>
              </div>
            </ListItemRow>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Care Gaps Card
// ============================================================================

interface CareGapsCardProps {
  gaps: CareGapInstance[];
}

export const CareGapsCard: React.FC<CareGapsCardProps> = ({ gaps }) => {
  const openGaps = gaps.filter((g) => g.status === 'open');
  const overdueGaps = openGaps.filter((g) => g.dueBy && g.dueBy < new Date());

  return (
    <Card variant="default" padding="lg">
      <SectionTitle
        title="Care Gaps"
        icon={<CardIconContainer color="accent" size="lg"><Heart size={20} /></CardIconContainer>}
        trailing={
          openGaps.length > 0
            ? <Badge variant="warning" size="sm">{openGaps.length} open</Badge>
            : <Badge variant="success" size="sm">All closed</Badge>
        }
        style={styles.cardHeader}
      />

      {openGaps.length === 0 ? (
        <div style={styles.emptyState}>No open care gaps</div>
      ) : (
        <div style={styles.gapList}>
          {openGaps.map((gap) => {
            const isOverdue = gap.dueBy && gap.dueBy < new Date();
            return (
              <ListItemRow
                key={gap.id}
                variant="subtle"
                trailing={
                  <>
                    {isOverdue && (
                      <Badge variant="error" size="sm">Overdue</Badge>
                    )}
                    {!isOverdue && gap.dueBy && (
                      <Badge variant="warning" size="sm">
                        Due {gap.dueBy.toLocaleDateString()}
                      </Badge>
                    )}
                  </>
                }
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <div>
                  <span style={styles.gapName}>{gap._display.name}</span>
                  <div style={styles.gapDescription}>{gap._display.actionLabel}</div>
                </div>
              </ListItemRow>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Recent Encounters Card
// ============================================================================

interface RecentEncountersCardProps {
  encounters?: Array<{
    id: string;
    date: Date;
    type: string;
    chiefComplaint?: string;
  }>;
}

export const RecentEncountersCard: React.FC<RecentEncountersCardProps> = ({ encounters = [] }) => {
  return (
    <Card variant="default" padding="lg">
      <SectionTitle
        title="Recent Encounters"
        icon={<CardIconContainer color="accent" size="lg"><Calendar size={20} /></CardIconContainer>}
        style={styles.cardHeader}
      />

      {encounters.length === 0 ? (
        <div style={styles.emptyState}>No recent encounters</div>
      ) : (
        <div style={styles.encounterList}>
          {encounters.map((enc) => (
            <div key={enc.id} style={styles.encounterItem}>
              <div style={styles.encounterDate}>
                {enc.date.toLocaleDateString()}
              </div>
              <div style={styles.encounterDetails}>
                <span style={styles.encounterType}>{enc.type}</span>
                {enc.chiefComplaint && (
                  <span style={styles.encounterCC}>- {enc.chiefComplaint}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    marginBottom: spaceAround.default,
  },
  demographicsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  demographicsMain: {
    marginBottom: spaceAround.tight,
  },
  patientName: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.nudge4,
  },
  patientMeta: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
  },
  demographicsDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spaceBetween.relatedCompact,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: colors.fg.neutral.primary,
  },
  allergyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
  },
  allergyName: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
  allergyReaction: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    marginTop: spaceAround.nudge4,
  },
  problemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
  problemName: {
    fontSize: 14,
    color: colors.fg.neutral.primary,
  },
  icdCode: {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.subtle,
    padding: `${spaceAround.nudge2}px ${spaceAround.nudge4}px`,
    borderRadius: borderRadius.xs,
  },
  medList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
  medName: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.nudge2,
  },
  medDetails: {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  },
  gapList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
  },
  gapName: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
  gapDescription: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
  },
  encounterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
  encounterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.tight,
    borderBottom: `1px solid ${colors.bg.neutral.subtle}`,
  },
  encounterDate: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    minWidth: '100px',
  },
  encounterDetails: {
    flex: 1,
  },
  encounterType: {
    fontSize: 14,
    color: colors.fg.neutral.primary,
  },
  encounterCC: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    marginLeft: spaceAround.nudge4,
  },
  emptyState: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic',
    padding: spaceAround.tight,
  },
};
