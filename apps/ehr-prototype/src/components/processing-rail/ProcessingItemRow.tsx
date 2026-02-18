/**
 * ProcessingItemRow
 *
 * Individual task item within an expanded batch in the Processing Rail.
 * Shows task label, status text, and a "details" action.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, body, label as labelStyle } from '../../styles/foundations';

export interface ProcessingItemRowProps {
  taskId: string;
  label: string;
  status: string;
  onOpenDetails?: (taskId: string) => void;
}

export function ProcessingItemRow({ taskId, label, status, onOpenDetails }: ProcessingItemRowProps) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <span style={styles.label}>{label}</span>
        <span style={styles.status}>{status}</span>
      </div>
      {onOpenDetails && (
        <button
          onClick={() => onOpenDetails(taskId)}
          style={styles.detailsButton}
          aria-label={`Open details for ${label}`}
          title="Details"
        >
          ⋯
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceBetween.coupled}px ${spaceAround.compact}px ${spaceBetween.coupled}px ${spaceAround.default}px`,
    minHeight: 32,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    flex: 1,
  },
  label: {
    ...labelStyle.sm,
    color: colors.fg.neutral.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  status: {
    ...body.xs,
    color: colors.fg.neutral.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  detailsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    fontSize: 14,
    flexShrink: 0,
  },
};
