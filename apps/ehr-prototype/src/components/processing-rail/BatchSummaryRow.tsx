/**
 * BatchSummaryRow
 *
 * A single batch row in the Processing Rail — shows leading chevron, batch label,
 * and inline per-status count chips. Expand/collapse to show individual items.
 *
 * Layout: [▶] [Label      ] [⟳2] [●1] [✓1]
 * Empty:       [Label      ] —
 */

import React from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { BatchSummary, StatusBreakdown } from '../../types/drafts';
import { ProcessingItemRow } from './ProcessingItemRow';
import { DraftItemRow } from './DraftItemRow';
import { Spinner } from '../primitives/Spinner';
import { colors, spaceAround, spaceBetween, body } from '../../styles/foundations';

export interface BatchSummaryRowProps {
  batch: BatchSummary;
  /** Whether this is the last row (omits bottom border) */
  isLast?: boolean;
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onRefreshDraft?: (draftId: string) => void;
  onCancelRefresh?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
}

// ============================================================================
// Inline Status Chips
// ============================================================================

const CHIP_DOT_SIZE = 6;

const StatusChips: React.FC<{ breakdown: StatusBreakdown }> = ({ breakdown }) => {
  return (
    <span style={styles.chipsContainer}>
      {breakdown.inProgress > 0 && (
        <span style={styles.chip} data-testid="chip-in-progress">
          <Spinner size="xs" color={colors.fg.information.secondary} />
          <span style={{ ...styles.chipCount, color: colors.fg.information.secondary }}>
            {breakdown.inProgress}
          </span>
        </span>
      )}
      {breakdown.needsAttention > 0 && (
        <span style={styles.chip} data-testid="chip-needs-attention">
          <span style={{
            width: CHIP_DOT_SIZE,
            height: CHIP_DOT_SIZE,
            borderRadius: '50%',
            backgroundColor: colors.fg.alert.secondary,
            flexShrink: 0,
          }} />
          <span style={{ ...styles.chipCount, color: colors.fg.alert.secondary }}>
            {breakdown.needsAttention}
          </span>
        </span>
      )}
      {breakdown.complete > 0 && (
        <span style={styles.chip} data-testid="chip-complete">
          <Check size={10} strokeWidth={2.5} color={colors.fg.positive.primary} />
          <span style={{ ...styles.chipCount, color: colors.fg.positive.primary }}>
            {breakdown.complete}
          </span>
        </span>
      )}
    </span>
  );
};

// ============================================================================
// Chevron Placeholder
// ============================================================================

const CHEVRON_SIZE = 14;

export function BatchSummaryRow({
  batch,
  isLast = false,
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onRefreshDraft,
  onCancelRefresh,
  onOpenTaskDetails,
}: BatchSummaryRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const isEmpty = batch.count === 0;

  return (
    <div style={isLast ? styles.containerLast : styles.container}>
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
          {/* Leading chevron — invisible placeholder when empty for alignment */}
          {!isEmpty ? (
            <span style={styles.chevronIcon}>
              {expanded ? <ChevronDown size={CHEVRON_SIZE} /> : <ChevronRight size={CHEVRON_SIZE} />}
            </span>
          ) : (
            <span style={styles.chevronPlaceholder} />
          )}
          <span style={styles.label}>{batch.label}</span>
        </span>
        <span style={styles.headerRight}>
          {!isEmpty ? (
            <StatusChips breakdown={batch.statusBreakdown} />
          ) : (
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
                onRefresh={onRefreshDraft}
                onCancelRefresh={onCancelRefresh}
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  containerLast: {
    // No bottom border on last row
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
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: colors.fg.neutral.primary,
    wordBreak: 'break-word' as const,
  },
  chevronIcon: {
    display: 'flex',
    alignItems: 'center',
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
  },
  chevronPlaceholder: {
    width: CHEVRON_SIZE,
    flexShrink: 0,
  },
  emptyDash: {
    ...body.sm,
    color: colors.fg.neutral.secondary,
  },
  chipsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '14px',
  },
  itemList: {
    paddingBottom: spaceBetween.repeating,
  },
};
