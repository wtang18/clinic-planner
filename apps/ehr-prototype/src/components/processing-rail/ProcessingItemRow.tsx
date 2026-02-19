/**
 * ProcessingItemRow
 *
 * Individual task item within an expanded batch in the Processing Rail.
 * Shows task label, status text, and a "details" action.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';

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
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    color: colors.fg.neutral.primary,
    wordBreak: 'break-word' as const,
  },
  status: {
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 400,
    color: colors.fg.neutral.secondary,
    wordBreak: 'break-word' as const,
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
