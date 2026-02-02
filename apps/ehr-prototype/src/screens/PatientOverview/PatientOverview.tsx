/**
 * PatientOverview Screen
 *
 * Displays patient context information and care gaps.
 */

import React from 'react';
import {
  useEncounterState,
  useDiagnoses,
  useMedications,
  useAllergies,
  useOpenCareGaps,
} from '../../hooks';
import { selectPatientOverviewData } from '../../state/selectors/views';

import {
  DemographicsCard,
  AllergiesCard,
  ProblemListCard,
  MedicationsCard,
  CareGapsCard,
  RecentEncountersCard,
} from './PatientCards';

import { User } from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';

// ============================================================================
// Component
// ============================================================================

export const PatientOverview: React.FC = () => {
  const state = useEncounterState();
  const diagnoses = useDiagnoses();
  const medications = useMedications();
  const allergies = useAllergies();
  const openCareGaps = useOpenCareGaps();

  // Get view data
  const viewData = selectPatientOverviewData(state);

  // Patient context
  const patient = viewData.patient;

  // Empty state
  if (!patient) {
    return (
      <div style={styles.emptyContainer}>
        <User size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
        <div style={styles.emptyTitle}>No Patient Selected</div>
        <div style={styles.emptyDescription}>
          Select a patient to view their overview and care gaps.
        </div>
      </div>
    );
  }

  // Get recent encounters from patient clinical summary
  const recentEncounters = patient.clinicalSummary?.recentEncounters?.map(
    (enc, index) => ({
      id: `enc-${index}`,
      date: enc.date,
      type: enc.type,
      chiefComplaint: enc.chiefComplaint,
    })
  );

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Patient Overview</h1>
      </div>

      {/* Main Content Grid */}
      <div style={styles.grid}>
        {/* Left Column */}
        <div style={styles.column}>
          {/* Demographics */}
          <DemographicsCard patient={patient} />

          {/* Allergies */}
          <AllergiesCard allergies={allergies} />

          {/* Problem List */}
          <ProblemListCard problems={diagnoses} />
        </div>

        {/* Right Column */}
        <div style={styles.column}>
          {/* Medications */}
          <MedicationsCard medications={medications} />

          {/* Care Gaps */}
          <CareGapsCard gaps={openCareGaps} />

          {/* Recent Encounters */}
          <RecentEncountersCard encounters={recentEncounters} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: colors.bg.neutral.min,
    padding: spaceAround.defaultPlus,
  },
  header: {
    marginBottom: spaceAround.defaultPlus,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.fg.neutral.primary,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spaceBetween.relatedPlus,
    maxWidth: '1200px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedPlus,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.tight,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    maxWidth: '320px',
  },
};

PatientOverview.displayName = 'PatientOverview';
