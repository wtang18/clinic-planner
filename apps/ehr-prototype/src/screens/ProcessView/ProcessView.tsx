/**
 * ProcessView Screen
 *
 * Operational batch view for completing outstanding work and signing off.
 * Shows items organized by batch (AI Drafts, Prescriptions, Labs, Imaging, Referrals)
 * with a sign-off section at the bottom.
 *
 * Phase 5: Replaces the task-status-oriented layout with operational batches.
 */

import React, { useCallback } from 'react';
import { useEncounterState, useOpenCareGaps } from '../../hooks';
import { useProcessView } from '../../hooks/useProcessView';
import type { ItemCategory } from '../../types';
import type { BatchType } from '../../types/drafts';
import type { Mode } from '../../state/types';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { DetailsPane } from '../../components/details-pane/DetailsPane';
import { BatchSection } from '../../components/process-view/BatchSection';
import { DraftSection } from '../../components/process-view/DraftSection';
import { SignOff } from '../../components/process-view/SignOff';
import { EmptyState } from '../../components/primitives/EmptyState';

import { List, Plus } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, zIndex } from '../../styles/foundations';

// ============================================================================
// Batch → Category Mapping
// ============================================================================

const BATCH_TO_CATEGORY: Record<BatchType, ItemCategory> = {
  'ai-drafts': 'note', // drafts are narrative; "+" doesn't apply to this section
  'prescriptions': 'medication',
  'labs': 'lab',
  'imaging': 'imaging',
  'referrals': 'referral',
};

// ============================================================================
// ProcessView Component
// ============================================================================

export const ProcessView: React.FC = () => {
  const state = useEncounterState();
  const openCareGaps = useOpenCareGaps();
  const {
    batches,
    drafts,
    checklist,
    emLevel,
    outstandingCount,
    signOffBlockers,
    isSigningOff,
    selectedItemId,
    scopedAddCategory,
    handleItemSelect,
    handleCloseDetailsPane,
    handleAcceptDraft,
    handleEditDraft,
    handleDismissDraft,
    handleBatchAction,
    handleSignOff,
    handleModeChange,
    handleScopedAdd,
    handleClearScopedAdd,
  } = useProcessView();

  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Get selected item for details pane
  const selectedItem = selectedItemId
    ? state.entities.items[selectedItemId] ?? null
    : null;

  // Handle item update from details pane
  const handleItemUpdate = useCallback(
    (id: string, changes: Partial<import('../../types').ChartItem>) => {
      // Dispatch update — uses same pattern as CaptureView
      // This will be handled by the entities reducer
    },
    []
  );

  // Handle item remove from details pane
  const handleItemRemove = useCallback(
    (id: string) => {
      handleCloseDetailsPane();
    },
    [handleCloseDetailsPane]
  );

  // Handle scoped add from batch section "+"
  const handleBatchScopedAdd = useCallback(
    (batchType: BatchType) => {
      const category = BATCH_TO_CATEGORY[batchType];
      if (category) {
        handleScopedAdd(category);
        // Switch to capture mode with the scoped category
        handleModeChange('capture');
      }
    },
    [handleScopedAdd, handleModeChange]
  );

  // Handle item action (review, send, associate-dx, retry)
  const handleItemAction = useCallback(
    (actionType: string, taskId?: string) => {
      if (taskId) {
        // Task-level actions delegate to batch handler
        handleBatchAction('prescriptions', actionType, [taskId]);
      }
    },
    [handleBatchAction]
  );

  // Handle checklist section tap → navigate to capture mode
  const handleChecklistSectionTap = useCallback(
    (sectionId: string) => {
      handleModeChange('capture');
    },
    [handleModeChange]
  );

  // Empty state: no patient/encounter
  if (!patient || !encounter) {
    return (
      <EmptyState
        icon={<List size={64} />}
        title="No Encounter Loaded"
        description="Select a patient and encounter to process."
        size="lg"
        style={styles.emptyContainer}
      />
    );
  }

  // Check if there's any content at all
  const hasContent = drafts.length > 0 || batches.some(b => b.totalCount > 0);

  return (
    <AppShell
      testID="process-view"
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
          {/* AI Drafts section */}
          <DraftSection
            drafts={drafts}
            onAcceptDraft={handleAcceptDraft}
            onEditDraft={handleEditDraft}
            onDismissDraft={handleDismissDraft}
          />

          {/* Operational batch sections */}
          {batches.map((batch) => (
            <BatchSection
              key={batch.type}
              batch={batch}
              onScopedAdd={handleBatchScopedAdd}
              onItemSelect={handleItemSelect}
              onItemAction={handleItemAction}
              onBatchAction={handleBatchAction}
            />
          ))}

          {/* Empty state when no items at all */}
          {!hasContent && (
            <EmptyState
              icon={<List size={48} />}
              title="No Items to Process"
              description="Chart items will appear here as you add them in Capture mode."
              size="md"
              style={styles.emptyState}
            />
          )}

          {/* Sign-Off section */}
          <SignOff
            encounter={encounter}
            checklist={checklist}
            emLevel={emLevel}
            outstandingCount={outstandingCount}
            blockers={signOffBlockers}
            isSigningOff={isSigningOff}
            onSignOff={handleSignOff}
            onChecklistSectionTap={handleChecklistSectionTap}
          />

          {/* Bottom spacing */}
          <div style={{ height: spaceBetween.separated }} />

          {/* Details Pane overlay */}
          <DetailsPane
            item={selectedItem}
            onClose={handleCloseDetailsPane}
            onUpdate={handleItemUpdate}
            onRemove={handleItemRemove}
          />

          {/* Minified OmniAdd FAB — switches to capture with OmniAdd open */}
          <button
            type="button"
            style={styles.fab}
            onClick={() => handleModeChange('capture')}
            title="Add chart item"
            data-testid="process-fab"
          >
            <Plus size={24} color="#fff" />
          </button>
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
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative',
  },
  emptyState: {
    padding: spaceAround.spacious,
  },
  emptyContainer: {
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: colors.fg.accent.primary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
  },
};

ProcessView.displayName = 'ProcessView';
