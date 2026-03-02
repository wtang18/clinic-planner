/**
 * ProcessingRail
 *
 * 200px sidebar showing ambient documentation signals during capture mode.
 * Two separate module cards:
 * - Completeness: always-visible detail rows per clinical section
 * - Processing: operational batch summaries (visible when items exist)
 *
 * At narrow widths, CaptureView uses RailFloatingStatus instead of this
 * component — ProcessingRail is only rendered for the 'full' rail tier.
 */

import React from 'react';
import { useProcessingBatches } from '../../hooks/useProcessingBatches';
import { useSelector } from '../../hooks/useEncounterState';
import { selectCompletenessChecklist } from '../../state/selectors/process-view';
import { BatchSummaryRow } from './BatchSummaryRow';
import { CompletenessCompact } from './CompletenessCompact';
import { colors, spaceAround, spaceBetween, borderRadius, LAYOUT } from '../../styles/foundations';

/** @deprecated Use LAYOUT.railWidth instead */
export const RAIL_WIDTH = LAYOUT.railWidth;

export interface ProcessingRailProps {
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onRefreshDraft?: (draftId: string) => void;
  onCancelRefresh?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
  style?: React.CSSProperties;
}

export function ProcessingRail({
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onRefreshDraft,
  onCancelRefresh,
  onOpenTaskDetails,
  style,
}: ProcessingRailProps) {
  const batches = useProcessingBatches();
  const checklist = useSelector(selectCompletenessChecklist);
  const hasAnyItems = batches.some(b => b.count > 0);

  return (
    <div style={{ ...styles.rail, ...style }}>
      {/* Completeness module */}
      <div style={styles.module}>
        <CompletenessCompact checklist={checklist} />
      </div>

      {/* Processing module — only when items exist */}
      {hasAnyItems && (
        <div style={styles.module}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Processing</span>
          </div>
          <div style={styles.content}>
            {batches.map((batch, index) => (
              <BatchSummaryRow
                key={batch.type}
                batch={batch}
                isLast={index === batches.length - 1}
                onAcceptDraft={onAcceptDraft}
                onEditDraft={onEditDraft}
                onDismissDraft={onDismissDraft}
                onRefreshDraft={onRefreshDraft}
                onCancelRefresh={onCancelRefresh}
                onOpenTaskDetails={onOpenTaskDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  rail: {
    width: LAYOUT.railWidth,
    minWidth: LAYOUT.railWidth,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    alignSelf: 'flex-start',
  },
  module: {
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  content: {
    padding: 0,
  },
};
