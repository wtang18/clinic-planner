/**
 * ReviewView Screen
 *
 * The final review interface before signing the encounter.
 * Shows items organized by clinical category with sign-off controls.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  useEncounterState,
  useDispatch,
  useChartItems,
  useOpenCareGaps,
  usePendingTasks,
  useItemsRequiringReview,
  useDiagnoses,
} from '../../hooks';
import { selectReviewViewData } from '../../state/selectors/views';
import type { ChartItem, ItemCategory } from '../../types';
import type { Mode } from '../../state/types';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { CareGapList } from '../../components/care-gaps/CareGapList';
import { FileText } from 'lucide-react';
import { CollapsibleGroup } from '../../components/primitives/CollapsibleGroup';

import { SignOffSection, SignOffBlocker } from './SignOffSection';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SectionTitle } from '../../components/primitives/SectionTitle';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';

// ============================================================================
// Section Categories
// ============================================================================

interface ReviewSectionConfig {
  id: string;
  title: string;
  categories: ItemCategory[];
}

const REVIEW_SECTIONS: ReviewSectionConfig[] = [
  {
    id: 'cc-hpi',
    title: 'Chief Complaint / HPI',
    categories: ['chief-complaint', 'hpi'],
  },
  {
    id: 'ros',
    title: 'Review of Systems',
    categories: ['ros'],
  },
  {
    id: 'pe',
    title: 'Physical Exam',
    categories: ['physical-exam'],
  },
  {
    id: 'vitals',
    title: 'Vitals',
    categories: ['vitals'],
  },
  {
    id: 'assessment',
    title: 'Assessment',
    categories: ['diagnosis'],
  },
  {
    id: 'plan',
    title: 'Plan',
    categories: ['medication', 'lab', 'imaging', 'referral', 'procedure', 'instruction'],
  },
  {
    id: 'note',
    title: 'Visit Note',
    categories: ['note'],
  },
];

// ============================================================================
// ReviewSection Component
// ============================================================================

interface ReviewSectionProps {
  title: string;
  items: ChartItem[];
  defaultExpanded?: boolean;
  onItemEdit?: (id: string) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  items,
  defaultExpanded = true,
  onItemEdit,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);

  if (items.length === 0) return null;

  return (
    <div style={styles.section}>
      <CollapsibleGroup
        title={title}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        badge={{ label: `${items.length} item${items.length !== 1 ? 's' : ''}`, variant: 'default' }}
        style={styles.sectionHeader}
      >
        <div style={styles.sectionContent}>
          {items.map((item) => (
            <div key={item.id} style={styles.itemWrapper}>
              <ChartItemCard
                item={item}
                variant="expanded"
                onEdit={onItemEdit ? () => onItemEdit(item.id) : undefined}
              />
            </div>
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );
};

// ============================================================================
// ReviewView Component
// ============================================================================

export const ReviewView: React.FC = () => {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const allItems = useChartItems();
  const openCareGaps = useOpenCareGaps();
  const pendingTasks = usePendingTasks();
  const itemsRequiringReview = useItemsRequiringReview();
  const diagnoses = useDiagnoses();

  const [isSigningOff, setIsSigningOff] = useState(false);

  // Get view data
  const viewData = selectReviewViewData(state);

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Group items by section
  const itemsBySection = useMemo(() => {
    const grouped: Record<string, ChartItem[]> = {};

    for (const section of REVIEW_SECTIONS) {
      const sectionItems = allItems.filter((item) =>
        section.categories.includes(item.category)
      );
      grouped[section.id] = sectionItems;
    }

    return grouped;
  }, [allItems]);

  // Calculate sign-off blockers
  const signOffBlockers = useMemo((): SignOffBlocker[] => {
    const blockers: SignOffBlocker[] = [];

    // Check for unreviewed AI content
    if (itemsRequiringReview.length > 0) {
      blockers.push({
        type: 'unreviewed-ai',
        message: `${itemsRequiringReview.length} AI-generated item${itemsRequiringReview.length !== 1 ? 's' : ''} require${itemsRequiringReview.length === 1 ? 's' : ''} review`,
        severity: 'error',
      });
    }

    // Check for pending tasks
    if (pendingTasks.length > 0) {
      blockers.push({
        type: 'pending-task',
        message: `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} still pending`,
        severity: 'error',
      });
    }

    // Check for missing diagnosis
    if (diagnoses.length === 0) {
      blockers.push({
        type: 'missing-dx',
        message: 'No diagnosis documented',
        severity: 'warning',
      });
    }

    // Check for missing visit note
    const noteItems = allItems.filter((i) => i.category === 'note');
    if (noteItems.length === 0) {
      blockers.push({
        type: 'missing-note',
        message: 'No visit note generated',
        severity: 'warning',
      });
    }

    // Check for incomplete items
    const incompleteItems = allItems.filter(
      (item) => item.status === 'pending-review'
    );
    if (incompleteItems.length > 0) {
      blockers.push({
        type: 'incomplete-item',
        message: `${incompleteItems.length} item${incompleteItems.length !== 1 ? 's' : ''} pending review`,
        severity: 'warning',
      });
    }

    return blockers;
  }, [itemsRequiringReview, pendingTasks, diagnoses, allItems]);

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: Mode) => {
      dispatch({
        type: 'MODE_CHANGED',
        payload: { to: mode, trigger: 'user' },
      });
    },
    [dispatch]
  );

  // Handle sign off
  const handleSignOff = useCallback(async () => {
    setIsSigningOff(true);

    try {
      dispatch({
        type: 'ENCOUNTER_SIGNED',
        payload: {
          signedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Sign-off failed:', error);
    } finally {
      setIsSigningOff(false);
    }
  }, [dispatch]);

  // Handle item edit
  const handleItemEdit = useCallback(
    (itemId: string) => {
      // Switch to capture mode for editing
      dispatch({
        type: 'MODE_CHANGED',
        payload: { to: 'capture', trigger: 'user' },
      });
    },
    [dispatch]
  );

  // If no patient/encounter loaded, show empty state
  if (!patient || !encounter) {
    return (
      <EmptyState
        icon={<FileText size={64} />}
        title="No Encounter Loaded"
        description="Select a patient and encounter to review documentation."
        size="lg"
        style={styles.emptyContainer}
      />
    );
  }

  return (
    <AppShell
      testID="review-view"
      header={
        <div style={styles.headerContainer}>
          <PatientHeader
            patient={patient}
            encounter={encounter}
            careGapCount={openCareGaps.length}
          />
          <div style={styles.modeSelectorContainer}>
            <ModeSelector
              currentMode={state.session.mode}
              onModeChange={handleModeChange}
            />
          </div>
        </div>
      }
      main={
        <div style={styles.mainContent}>
          {/* Review Sections */}
          {REVIEW_SECTIONS.map((section) => (
            <ReviewSection
              key={section.id}
              title={section.title}
              items={itemsBySection[section.id]}
              onItemEdit={handleItemEdit}
            />
          ))}

          {/* Care Gaps Summary */}
          {openCareGaps.length > 0 && (
            <div style={styles.section} data-testid="care-gap-summary">
              <SectionTitle
                title="Care Gaps"
                count={`${openCareGaps.length} open`}
                style={{ marginBottom: spaceAround.compact }}
              />
              <div style={styles.sectionContent}>
                <CareGapList
                  gaps={openCareGaps}
                  groupBy="status"
                  compact
                  onAction={() => {}}
                  onExclude={() => {}}
                />
              </div>
            </div>
          )}

          {/* Sign-off Section */}
          <SignOffSection
            encounter={encounter}
            onSignOff={handleSignOff}
            blockers={signOffBlockers}
            isSigningOff={isSigningOff}
          />

          {/* Bottom spacing */}
          <div style={{ height: spaceBetween.separated }} />
        </div>
      }
    />
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  modeSelectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.base,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  mainContent: {
    padding: spaceAround.defaultPlus,
    maxWidth: '900px',
    margin: '0 auto',
  },
  section: {
    marginBottom: spaceAround.defaultPlus,
  },
  sectionHeader: {
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.subtle,
  },
  sectionContent: {
    padding: spaceAround.default,
    paddingTop: spaceAround.compact,
  },
  itemWrapper: {
    marginBottom: spaceAround.compact,
  },
  emptyContainer: {
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
};

ReviewView.displayName = 'ReviewView';
