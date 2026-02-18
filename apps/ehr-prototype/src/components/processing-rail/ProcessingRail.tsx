/**
 * ProcessingRail
 *
 * Compact sidebar showing operational batch summaries during capture mode.
 * Displays AI Drafts, Prescriptions, Labs, Imaging, and Referrals batches.
 * Collapsible to save horizontal space.
 */

import React from 'react';
import type { BatchSummary } from '../../types/drafts';
import type { AIDraft } from '../../types/drafts';
import { useProcessingBatches } from '../../hooks/useProcessingBatches';
import { BatchSummaryRow } from './BatchSummaryRow';
import { colors, spaceAround, spaceBetween, body, borderRadius, zIndex } from '../../styles/foundations';
import { LAYOUT } from '../../styles/foundations/layout';

export const RAIL_WIDTH = 200;

export interface ProcessingRailProps {
  isOpen: boolean;
  onToggle: () => void;
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
}

export function ProcessingRail({
  isOpen,
  onToggle,
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onOpenTaskDetails,
}: ProcessingRailProps) {
  const batches = useProcessingBatches();
  const hasAnyItems = batches.some(b => b.count > 0);

  if (!isOpen) {
    return (
      <div style={styles.collapsed}>
        <button
          onClick={onToggle}
          style={styles.toggleButton}
          aria-label="Open processing rail"
          title="Processing"
        >
          <span style={styles.toggleIcon}>‹</span>
          {hasAnyItems && <span style={styles.badge}>{batches.reduce((s, b) => s + b.count, 0)}</span>}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Processing</span>
        <button
          onClick={onToggle}
          style={styles.toggleButton}
          aria-label="Close processing rail"
        >
          <span style={styles.toggleIcon}>›</span>
        </button>
      </div>
      <div style={styles.content}>
        {batches.map(batch => (
          <BatchSummaryRow
            key={batch.type}
            batch={batch}
            onAcceptDraft={onAcceptDraft}
            onEditDraft={onEditDraft}
            onDismissDraft={onDismissDraft}
            onOpenTaskDetails={onOpenTaskDetails}
          />
        ))}
        {!hasAnyItems && (
          <p style={styles.emptyText}>No processing items</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: RAIL_WIDTH,
    minWidth: RAIL_WIDTH,
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.min,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  collapsed: {
    width: 36,
    minWidth: 36,
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.min,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: spaceAround.tight,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  headerTitle: {
    ...body.sm,
    fontWeight: 600,
    color: colors.fg.neutral.primary,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    fontSize: 16,
    position: 'relative' as const,
  },
  toggleIcon: {
    fontSize: 16,
    lineHeight: 1,
  },
  badge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.bg.accent.medium,
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: `${spaceAround.tight}px 0`,
  },
  emptyText: {
    ...body.sm,
    color: colors.fg.neutral.secondary,
    textAlign: 'center' as const,
    padding: spaceAround.default,
    margin: 0,
  },
};
