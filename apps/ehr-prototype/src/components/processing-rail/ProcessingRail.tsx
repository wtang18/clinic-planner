/**
 * ProcessingRail
 *
 * Responsive sidebar showing operational batch summaries during capture mode.
 * Supports two variants:
 * - 'full' (200px): batch summary rows with expand/collapse
 * - 'gutter' (40px): icon strip with aggregate status indicators
 *
 * Always visible when there are items; hidden when empty.
 */

import React from 'react';
import { useProcessingBatches } from '../../hooks/useProcessingBatches';
import { BatchSummaryRow } from './BatchSummaryRow';
import { RailGutter } from './RailGutter';
import { colors, spaceAround, borderRadius, LAYOUT } from '../../styles/foundations';
import type { RailTier } from '../../styles/foundations';

/** @deprecated Use LAYOUT.railWidth instead */
export const RAIL_WIDTH = LAYOUT.railWidth;

export interface ProcessingRailProps {
  /** Rail display variant — defaults to 'full' */
  variant?: RailTier;
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onRefreshDraft?: (draftId: string) => void;
  onCancelRefresh?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
  style?: React.CSSProperties;
}

export function ProcessingRail({
  variant = 'full',
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onRefreshDraft,
  onCancelRefresh,
  onOpenTaskDetails,
  style,
}: ProcessingRailProps) {
  const batches = useProcessingBatches();
  const hasAnyItems = batches.some(b => b.count > 0);

  if (!hasAnyItems || variant === 'hidden') {
    return null;
  }

  if (variant === 'gutter') {
    return <RailGutter batches={batches} style={style} />;
  }

  return (
    <div style={{ ...styles.container, ...style }}>
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
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: LAYOUT.railWidth,
    minWidth: LAYOUT.railWidth,
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.sm,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    alignSelf: 'flex-start',
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
