/**
 * ProcessingRail
 *
 * Compact sidebar showing operational batch summaries during capture mode.
 * Displays AI Drafts, Prescriptions, Labs, Imaging, and Referrals batches.
 * Always visible when there are items; hidden when empty.
 */

import React from 'react';
import { useProcessingBatches } from '../../hooks/useProcessingBatches';
import { BatchSummaryRow } from './BatchSummaryRow';
import { colors, spaceAround, borderRadius } from '../../styles/foundations';

export const RAIL_WIDTH = 200;

export interface ProcessingRailProps {
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
  style?: React.CSSProperties;
}

export function ProcessingRail({
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onOpenTaskDetails,
  style,
}: ProcessingRailProps) {
  const batches = useProcessingBatches();
  const hasAnyItems = batches.some(b => b.count > 0);

  if (!hasAnyItems) {
    return null;
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
            onOpenTaskDetails={onOpenTaskDetails}
          />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: RAIL_WIDTH,
    minWidth: RAIL_WIDTH,
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
    padding: `${spaceAround.tight}px 0`,
  },
};
