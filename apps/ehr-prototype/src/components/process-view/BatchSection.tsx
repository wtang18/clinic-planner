/**
 * BatchSection Component
 *
 * A collapsible section for one operational batch (Prescriptions, Labs, etc.).
 * Renders sub-groups, item cards, status indicator, inline "+" button,
 * and batch action buttons.
 */

import React, { useState } from 'react';
import { Plus, Send, Link2, FlaskConical } from 'lucide-react';
import type { ProcessBatch, SubGroup } from '../../state/selectors/process-view';
import type { BatchType } from '../../types/drafts';
import { ProcessItemCard } from './ProcessItemCard';
import { CollapsibleGroup } from '../primitives/CollapsibleGroup';
import { Button } from '../primitives/Button';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

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

function getStatusDotColor(status: ProcessBatch['aggregateStatus']): string {
  switch (status) {
    case 'needs-attention':
      return colors.fg.attention.secondary;
    case 'in-progress':
      return colors.fg.information.secondary;
    case 'complete':
      return colors.fg.positive.secondary;
    case 'idle':
    default:
      return colors.fg.neutral.disabled;
  }
}

function getBadgeVariant(status: ProcessBatch['aggregateStatus']): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'needs-attention':
      return 'warning';
    case 'in-progress':
      return 'info';
    case 'complete':
      return 'success';
    default:
      return 'default';
  }
}

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Empty state
  if (batch.totalCount === 0) {
    return (
      <div style={{ ...styles.emptySection, ...style }} data-testid={`batch-${batch.type}`}>
        <div style={styles.emptyHeader}>
          <span style={styles.emptyLabel}>{batch.label}</span>
          {onScopedAdd && (
            <button
              type="button"
              style={styles.addButton}
              onClick={() => onScopedAdd(batch.type)}
              title={`Add ${batch.label}`}
              data-testid={`add-${batch.type}`}
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        <span style={styles.emptyText}>No {batch.label.toLowerCase()}</span>
      </div>
    );
  }

  const batchActions = getBatchActions(batch);

  const trailingContent = (
    <div style={styles.headerTrailing}>
      {/* Status dot */}
      <span
        style={{
          ...styles.statusDot,
          backgroundColor: getStatusDotColor(batch.aggregateStatus),
        }}
        data-testid="batch-status-dot"
      />
      {/* Inline "+" button */}
      {onScopedAdd && (
        <button
          type="button"
          style={styles.addButton}
          onClick={(e) => {
            e.stopPropagation();
            onScopedAdd(batch.type);
          }}
          title={`Add ${batch.label}`}
          data-testid={`add-${batch.type}`}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ ...styles.section, ...style }} data-testid={`batch-${batch.type}`}>
      <CollapsibleGroup
        title={batch.label}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        badge={{ label: batch.totalCount, variant: getBadgeVariant(batch.aggregateStatus) }}
        trailing={trailingContent}
        style={styles.sectionHeader}
      >
        <div style={styles.sectionContent}>
          {/* Batch actions */}
          {batchActions.length > 0 && (
            <div style={styles.batchActions} data-testid="batch-actions">
              {batchActions.map((action) => {
                const readyTaskIds = batch.subGroups
                  .flatMap(g => g.items)
                  .flatMap(i => i.tasks.filter(t => t.status === 'ready'))
                  .map(t => t.id);

                return (
                  <Button
                    key={action.action}
                    variant="secondary"
                    size="sm"
                    leftIcon={action.icon}
                    onClick={() => onBatchAction?.(batch.type, action.action, readyTaskIds)}
                    data-testid={`batch-action-${action.action}`}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}

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
      </CollapsibleGroup>
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
        <span style={styles.subGroupCount}>({subGroup.items.length})</span>
      </div>
    )}
    <div style={styles.itemList}>
      {subGroup.items.map((processItem) => (
        <ProcessItemCard
          key={processItem.item.id}
          processItem={processItem}
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
    marginBottom: spaceAround.defaultPlus,
  },
  sectionHeader: {
    backgroundColor: colors.bg.neutral.subtle,
  },
  sectionContent: {
    padding: spaceAround.default,
    paddingTop: spaceAround.compact,
  },
  headerTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    padding: 0,
  },
  batchActions: {
    display: 'flex',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.compact,
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
    color: colors.fg.neutral.disabled,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
  emptySection: {
    marginBottom: spaceAround.defaultPlus,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  emptyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.nudge4,
  },
  emptyLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.fg.neutral.disabled,
  },
};

BatchSection.displayName = 'BatchSection';
