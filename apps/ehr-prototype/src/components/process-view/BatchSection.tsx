/**
 * BatchSection Component
 *
 * A section for one operational batch (Prescriptions, Labs, etc.).
 * Uses shared SectionHeader and ChartItemCard for cross-view consistency.
 */

import React from 'react';
import { Send, Link2, FlaskConical } from 'lucide-react';
import type { ProcessBatch, SubGroup } from '../../state/selectors/process-view';
import type { BatchType } from '../../types/drafts';
import { ChartItemCard } from '../chart-items/ChartItemCard';
import { SectionHeader } from '../primitives/SectionHeader';
import { Button } from '../primitives/Button';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface BatchSectionProps {
  batch: ProcessBatch;
  /** Called when inline "+" is clicked */
  onScopedAdd?: (batchType: BatchType) => void;
  /** Called when an item is selected (opens details pane) */
  onItemSelect?: (itemId: string) => void;
  /** Called when an item action button is clicked */
  onItemAction?: (actionType: string, taskId?: string) => void;
  /** Called when a batch action is invoked */
  onBatchAction?: (batchType: BatchType, action: string, taskIds?: string[]) => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Helpers
// ============================================================================

/** Get batch action config for a batch type */
function getBatchActions(batch: ProcessBatch): { label: string; action: string; icon: React.ReactNode }[] {
  const readyTaskIds = batch.subGroups
    .flatMap(g => g.items)
    .flatMap(i => i.tasks.filter(t => t.status === 'ready'))
    .map(t => t.id);

  const unlinkedItems = batch.subGroups
    .flatMap(g => g.items)
    .filter(i => i.item.linkedDiagnoses.length === 0);

  const actions: { label: string; action: string; icon: React.ReactNode }[] = [];

  if (unlinkedItems.length > 1) {
    actions.push({
      label: `Associate All \u2192 Dx`,
      action: 'associate-dx',
      icon: <Link2 size={14} />,
    });
  }

  switch (batch.type) {
    case 'prescriptions':
      if (readyTaskIds.length > 1) {
        actions.push({ label: 'Send All Rx', action: 'send-all', icon: <Send size={14} /> });
      }
      break;
    case 'labs':
      if (readyTaskIds.length > 1) {
        actions.push({ label: 'Collect Samples', action: 'send-all', icon: <FlaskConical size={14} /> });
      }
      break;
    case 'imaging':
      if (readyTaskIds.length > 1) {
        actions.push({ label: 'Send All', action: 'send-all', icon: <Send size={14} /> });
      }
      break;
    case 'referrals':
      if (readyTaskIds.length > 1) {
        actions.push({ label: 'Send All', action: 'send-all', icon: <Send size={14} /> });
      }
      break;
  }

  return actions;
}

// ============================================================================
// Component
// ============================================================================

export const BatchSection: React.FC<BatchSectionProps> = ({
  batch,
  onScopedAdd,
  onItemSelect,
  onItemAction,
  onBatchAction,
  style,
}) => {
  // Empty state
  if (batch.totalCount === 0) {
    return (
      <div style={{ ...styles.section, ...style }} data-testid={`batch-${batch.type}`}>
        <SectionHeader
          title={batch.label}
          count="None"
          onAdd={onScopedAdd ? () => onScopedAdd(batch.type) : undefined}
          addLabel={`Add ${batch.label}`}
          testID={`batch-header-${batch.type}`}
        />
      </div>
    );
  }

  const batchActions = getBatchActions(batch);

  const batchActionsTrailing = batchActions.length > 0 ? (
    <div style={{ display: 'flex', gap: spaceBetween.repeating }} data-testid="batch-actions">
      {batchActions.map((action) => {
        const readyTaskIds = batch.subGroups
          .flatMap(g => g.items)
          .flatMap(i => i.tasks.filter(t => t.status === 'ready'))
          .map(t => t.id);

        return (
          <Button
            key={action.action}
            variant="ghost"
            size="xs"
            leftIcon={action.icon}
            onClick={() => onBatchAction?.(batch.type, action.action, readyTaskIds)}
            data-testid={`batch-action-${action.action}`}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <div style={{ ...styles.section, ...style }} data-testid={`batch-${batch.type}`}>
      <SectionHeader
        title={batch.label}
        count={`${batch.totalCount}`}
        trailing={batchActionsTrailing}
        onAdd={onScopedAdd ? () => onScopedAdd(batch.type) : undefined}
        addLabel={`Add ${batch.label}`}
        testID={`batch-header-${batch.type}`}
      />

      <div style={styles.sectionContent}>
        {/* Sub-groups */}
        {batch.subGroups.map((subGroup) => (
          <SubGroupSection
            key={subGroup.key}
            subGroup={subGroup}
            showSubHeader={batch.subGroups.length > 1}
            onItemSelect={onItemSelect}
            onItemAction={onItemAction}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SubGroupSection
// ============================================================================

const SubGroupSection: React.FC<{
  subGroup: SubGroup;
  showSubHeader: boolean;
  onItemSelect?: (itemId: string) => void;
  onItemAction?: (actionType: string, taskId?: string) => void;
}> = ({ subGroup, showSubHeader, onItemSelect, onItemAction }) => (
  <div style={styles.subGroup} data-testid={`subgroup-${subGroup.key}`}>
    {showSubHeader && (
      <div style={styles.subGroupHeader}>
        <span style={styles.subGroupLabel}>{subGroup.label}</span>
        <span style={styles.subGroupCount}>{subGroup.items.length}</span>
      </div>
    )}
    <div style={styles.itemList}>
      {subGroup.items.map((processItem) => (
        <ChartItemCard
          key={processItem.item.id}
          item={processItem.item}
          processingSteps={processItem.processingSteps}
          nextAction={processItem.nextAction}
          onSelect={() => onItemSelect?.(processItem.item.id)}
          onAction={onItemAction}
        />
      ))}
    </div>
  </div>
);

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  section: {
    borderTop: `1px solid ${colors.border.neutral.low}`,
    paddingTop: spaceAround.default,
    paddingBottom: spaceAround.default,
  },
  sectionContent: {
    paddingTop: spaceAround.tight,
    paddingBottom: spaceAround.tight,
  },
  subGroup: {
    marginBottom: spaceAround.compact,
  },
  subGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.tight,
    paddingLeft: spaceAround.nudge4,
  },
  subGroupLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  subGroupCount: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
};

BatchSection.displayName = 'BatchSection';
