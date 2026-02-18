/**
 * ReviewView Screen
 *
 * The final review interface before signing the encounter.
 * Shows items organized by clinical category with:
 * - Section completeness indicators
 * - "+Add" buttons on empty sections (scoped OmniAddBar)
 * - Inline DetailsPane editing (no mode switch)
 * - Safety alert banners on medication cards
 * - Sign-off with safety-critical blockers
 */

import React, { useState, useCallback } from 'react';
import {
  useEncounterState,
  useOpenCareGaps,
  useItemActions,
} from '../../hooks';
import type { ChartItem, ItemCategory } from '../../types';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { CareGapList } from '../../components/care-gaps/CareGapList';
import { DetailsPane } from '../../components/details-pane';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { SafetyAlertBanner } from '../../components/safety/SafetyAlertBanner';
import { FileText } from 'lucide-react';

import { SignOffSection } from './SignOffSection';
import { ReviewSectionHeader } from './ReviewSectionHeader';
import { useReviewView, REVIEW_SECTIONS } from './useReviewView';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SectionTitle } from '../../components/primitives/SectionTitle';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// ReviewSection Component
// ============================================================================

interface ReviewSectionProps {
  sectionId: string;
  title: string;
  items: ChartItem[];
  status: 'documented' | 'incomplete' | 'not-documented';
  safetyAlertsForItem: (itemId: string) => import('../../services/safety/types').SafetyAlert[];
  onItemEdit: (id: string) => void;
  onAdd: () => void;
  onAcknowledgeAlert: (alertId: string, itemId: string) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  sectionId,
  title,
  items,
  status,
  safetyAlertsForItem,
  onItemEdit,
  onAdd,
  onAcknowledgeAlert,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={styles.section} data-testid={`review-section-${sectionId}`}>
      <ReviewSectionHeader
        title={title}
        status={status}
        itemCount={items.length}
        onAdd={onAdd}
      />

      {!isCollapsed && (
        <div style={styles.sectionContent}>
          {items.length === 0 ? (
            <div style={styles.emptySection}>
              <span style={styles.emptySectionText}>Not documented</span>
            </div>
          ) : (
            items.map((item) => {
              const alerts = safetyAlertsForItem(item.id);
              return (
                <div key={item.id} style={styles.itemWrapper}>
                  <ChartItemCard
                    item={item}
                    variant="expanded"
                    showActions
                    onEdit={() => onItemEdit(item.id)}
                  />
                  {alerts.length > 0 && alerts.map((alert) => (
                    <SafetyAlertBanner
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={() => onAcknowledgeAlert(alert.id, item.id)}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ReviewView Component
// ============================================================================

export const ReviewView: React.FC = () => {
  const state = useEncounterState();
  const openCareGaps = useOpenCareGaps();
  const { addItem } = useItemActions();

  const {
    itemsBySection,
    sectionStatuses,
    selectedItem,
    scopedAddCategory,
    safetyAlerts,
    signOffBlockers,
    isSigningOff,
    handleItemEdit,
    handleItemUpdate,
    handleItemRemove,
    handleCloseDetailsPane,
    handleScopedAdd,
    handleCancelScopedAdd,
    handleSignOff,
    handleModeChange,
    acknowledgeAlert,
  } = useReviewView();

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Get alerts for a specific item
  const getAlertsForItem = useCallback(
    (itemId: string) => safetyAlerts.filter((a) => a.relatedItemId === itemId),
    [safetyAlerts]
  );

  // Handle scoped add — determine the first category for the section
  const handleSectionAdd = useCallback(
    (sectionCategories: ItemCategory[]) => {
      handleScopedAdd(sectionCategories[0]);
    },
    [handleScopedAdd]
  );

  // Handle scoped item add from OmniAddBar
  const handleScopedItemAdd = useCallback(
    (item: Partial<ChartItem>) => {
      const now = new Date();
      const fullItem: ChartItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: item.category || 'note',
        displayText: item.displayText || '',
        displaySubtext: item.displaySubtext,
        createdAt: now,
        createdBy: { id: 'current-user', name: 'Current User' },
        modifiedAt: now,
        modifiedBy: { id: 'current-user', name: 'Current User' },
        source: { type: 'manual' },
        status: 'confirmed' as const,
        tags: item.tags || [],
        linkedDiagnoses: item.linkedDiagnoses || [],
        linkedEncounters: item.linkedEncounters || [],
        activityLog: [{
          timestamp: now,
          action: 'created',
          actor: 'Current User',
          details: `Added in Review mode (${item.category || 'note'})`,
        }],
        _meta: {
          syncStatus: 'pending' as const,
          aiGenerated: false,
          requiresReview: false,
          reviewed: true,
        },
        ...item,
      } as ChartItem;

      addItem(fullItem, { type: 'manual' });
      handleCancelScopedAdd();
    },
    [addItem, handleCancelScopedAdd]
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
              sectionId={section.id}
              title={section.title}
              items={itemsBySection[section.id]}
              status={sectionStatuses[section.id]}
              safetyAlertsForItem={getAlertsForItem}
              onItemEdit={handleItemEdit}
              onAdd={() => handleSectionAdd(section.categories)}
              onAcknowledgeAlert={acknowledgeAlert}
            />
          ))}

          {/* Scoped Add Bar */}
          {scopedAddCategory && (
            <div style={styles.scopedAddContainer} data-testid="scoped-add-bar">
              <OmniAddBar
                onItemAdd={handleScopedItemAdd}
                initialCategory={scopedAddCategory}
              />
              <button
                type="button"
                onClick={handleCancelScopedAdd}
                style={styles.cancelAddButton}
              >
                Cancel
              </button>
            </div>
          )}

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

  // DetailsPane is not rendered here — we use the same approach as CaptureView
  // The DetailsPane is rendered as a sibling at the root level
};

ReviewView.displayName = 'ReviewView';

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
  sectionContent: {
    padding: spaceAround.default,
    paddingTop: spaceAround.compact,
  },
  itemWrapper: {
    marginBottom: spaceAround.compact,
  },
  emptySection: {
    padding: `${spaceAround.default}px`,
    textAlign: 'center' as const,
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.fg.neutral.disabled,
    fontStyle: 'italic',
  },
  emptyContainer: {
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
  scopedAddContainer: {
    marginBottom: spaceAround.defaultPlus,
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
  },
  cancelAddButton: {
    display: 'block',
    margin: `${spaceAround.compact}px auto 0`,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    fontSize: 13,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
