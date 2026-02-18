/**
 * BatchSummaryRow
 *
 * A single batch row in the Processing Rail — shows batch label, aggregate status dot,
 * item count badge, and expand/collapse to show individual items.
 */

import React from 'react';
import type { BatchSummary, BatchAggregateStatus, BatchItem } from '../../types/drafts';
import { ProcessingItemRow } from './ProcessingItemRow';
import { DraftItemRow } from './DraftItemRow';
import { colors, spaceAround, spaceBetween, body, label as labelStyle, borderRadius } from '../../styles/foundations';

export interface BatchSummaryRowProps {
  batch: BatchSummary;
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
}

export function BatchSummaryRow({
  batch,
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onOpenTaskDetails,
}: BatchSummaryRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const isEmpty = batch.count === 0;

  return (
    <div style={styles.container}>
      <button
        onClick={() => !isEmpty && setExpanded(e => !e)}
        style={{
          ...styles.header,
          cursor: isEmpty ? 'default' : 'pointer',
          opacity: isEmpty ? 0.5 : 1,
        }}
        disabled={isEmpty}
        aria-expanded={expanded}
      >
        <span style={styles.headerLeft}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: statusColor(batch.aggregateStatus),
          }} />
          <span style={styles.label}>{batch.label}</span>
        </span>
        <span style={styles.headerRight}>
          {batch.count > 0 && (
            <span style={styles.countBadge}>{batch.count}</span>
          )}
          {!isEmpty && (
            <span style={styles.chevron}>{expanded ? '▾' : '▸'}</span>
          )}
          {isEmpty && (
            <span style={styles.emptyDash}>—</span>
          )}
        </span>
      </button>

      {expanded && batch.items.length > 0 && (
        <div style={styles.itemList}>
          {batch.items.map(item => (
            item.kind === 'draft' ? (
              <DraftItemRow
                key={item.draftId}
                draftId={item.draftId}
                label={item.label}
                preview={item.preview}
                status={item.status}
                onAccept={onAcceptDraft}
                onEdit={onEditDraft}
                onDismiss={onDismissDraft}
              />
            ) : (
              <ProcessingItemRow
                key={item.taskId}
                taskId={item.taskId}
                label={item.label}
                status={item.status}
                onOpenDetails={onOpenTaskDetails}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function statusColor(status: BatchAggregateStatus): string {
  switch (status) {
    case 'needs-attention':
      return colors.fg.attention.primary;
    case 'in-progress':
      return colors.fg.information.primary;
    case 'complete':
      return colors.fg.positive.primary;
    case 'idle':
    default:
      return colors.fg.neutral.secondary;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${spaceBetween.repeating}px ${spaceAround.compact}px`,
    background: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  label: {
    ...labelStyle.md,
    fontWeight: 500,
    color: colors.fg.neutral.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  countBadge: {
    ...labelStyle.sm,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    padding: `0 ${spaceBetween.coupled}px`,
    minWidth: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 10,
    color: colors.fg.neutral.secondary,
  },
  emptyDash: {
    ...body.sm,
    color: colors.fg.neutral.secondary,
  },
  itemList: {
    paddingBottom: spaceBetween.repeating,
  },
};
