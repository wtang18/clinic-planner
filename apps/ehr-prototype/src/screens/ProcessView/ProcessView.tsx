/**
 * ProcessView Screen
 *
 * Operational batch view for completing outstanding work.
 * Shows items organized by batch (AI Drafts, Prescriptions, Labs, Imaging, Referrals).
 * Sign-off lives in ReviewView only.
 *
 * ProcessCanvas is the canvas-only content rendered inside CaptureView's
 * single AdaptiveLayout. ProcessView is the legacy wrapper (kept for
 * backwards compat) that renders its own AdaptiveLayout.
 */

import React, { useCallback } from 'react';
import { useEncounterState } from '../../hooks';
import { useProcessView } from '../../hooks/useProcessView';
import type { ItemCategory } from '../../types';
import type { BatchType } from '../../types/drafts';

import { DetailsPane } from '../../components/details-pane/DetailsPane';
import { BatchSection } from '../../components/process-view/BatchSection';
import { DraftSection } from '../../components/process-view/DraftSection';
import { EMLevel } from '../../components/process-view/EMLevel';
import { EmptyState } from '../../components/primitives/EmptyState';
import { useScrollToSection } from '../../hooks/useScrollToSection';

import { EncounterContextBar } from '../../components/layout/EncounterContextBar';
import { List } from 'lucide-react';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';

// ============================================================================
// Batch → Category Mapping
// ============================================================================

const BATCH_TO_CATEGORY: Partial<Record<BatchType, ItemCategory>> = {
  'ai-drafts': 'note',
  'prescriptions': 'medication',
  'labs': 'lab',
  'imaging': 'imaging',
  'referrals': 'referral',
  // visit-note and charge-nav have dedicated sections, not BatchSection
};

// ============================================================================
// ProcessCanvas — canvas-only content (no AdaptiveLayout)
// ============================================================================

export const ProcessCanvas: React.FC = () => {
  useScrollToSection();

  const state = useEncounterState();
  const {
    batches,
    drafts,
    emLevel,
    selectedItemId,
    scopedAddCategory,
    handleItemSelect,
    handleCloseDetailsPane,
    handleAcceptDraft,
    handleEditDraft,
    handleDismissDraft,
    handleRefreshDraft,
    handleCancelRefresh,
    handleBatchAction,
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

  // Check if there's any content at all (charge-nav always has E&M, so count as content)
  const hasContent = drafts.length > 0 || batches.some(b => b.totalCount > 0) || emLevel.elements.some(e => e.documented);

  return (
    <>
      <div style={styles.mainContent}>
        <EncounterContextBar
          encounter={encounter}
          specialty={encounter.specialty}
          chiefComplaint={state.context.visit?.chiefComplaint}
          providerName={state.session.currentUser?.name}
          providerCredentials={state.session.currentUser?.credentials?.join(', ')}
          room={encounter.room}
          payer={patient.insurance?.primary?.payerName}
          groupName={patient.insurance?.primary?.groupName}
          caseId={encounter.caseId}
          tags={encounter.tags}
          locked={encounter.locked}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        />

        {/* Visit Note section (AI Drafts) */}
        <div data-section-id="visit-note">
          <DraftSection
            drafts={drafts}
            onAcceptDraft={handleAcceptDraft}
            onEditDraft={handleEditDraft}
            onDismissDraft={handleDismissDraft}
            onRefreshDraft={handleRefreshDraft}
            onCancelRefresh={handleCancelRefresh}
          />
        </div>

        {/* Operational batch sections */}
        {batches.map((batch) => (
          <div key={batch.type} data-section-id={batch.type}>
            <BatchSection
              batch={batch}
              onScopedAdd={handleBatchScopedAdd}
              onItemSelect={handleItemSelect}
              onItemAction={handleItemAction}
              onBatchAction={handleBatchAction}
            />
          </div>
        ))}

        {/* Charge Nav section */}
        <div data-section-id="charge-nav">
          <EMLevel emLevel={emLevel} style={{ marginBottom: 16 }} />
        </div>

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

        {/* Bottom spacing */}
        <div style={{ height: spaceBetween.separated }} />
      </div>

      {/* Details Pane overlay */}
      <DetailsPane
        item={selectedItem}
        onClose={handleCloseDetailsPane}
        onUpdate={handleItemUpdate}
        onRemove={handleItemRemove}
      />
    </>
  );
};

ProcessCanvas.displayName = 'ProcessCanvas';

// ============================================================================
// ProcessView — legacy wrapper (backwards compat, renders own layout)
// ============================================================================

export const ProcessView: React.FC = () => <ProcessCanvas />;

ProcessView.displayName = 'ProcessView';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  mainContent: {
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative',
    paddingBottom: 80,
  },
  emptyState: {
    padding: spaceAround.spacious,
  },
  emptyContainer: {
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
};
