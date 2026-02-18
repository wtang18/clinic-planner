/**
 * DraftItemRow
 *
 * AI draft item within the AI Drafts batch in the Processing Rail.
 * Shows draft label, content preview, and Accept/Edit/Dismiss actions.
 */

import React from 'react';
import type { DraftStatus } from '../../types/drafts';
import { colors, spaceAround, spaceBetween, body, label as labelStyle, borderRadius } from '../../styles/foundations';

export interface DraftItemRowProps {
  draftId: string;
  label: string;
  preview: string;
  status: DraftStatus;
  onAccept?: (draftId: string) => void;
  onEdit?: (draftId: string) => void;
  onDismiss?: (draftId: string) => void;
}

export function DraftItemRow({
  draftId,
  label,
  preview,
  status,
  onAccept,
  onEdit,
  onDismiss,
}: DraftItemRowProps) {
  const isGenerating = status === 'generating';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.aiIndicator}>✦</span>
        <span style={styles.label}>{label}</span>
      </div>
      {preview && (
        <p style={styles.preview}>
          {isGenerating ? 'Generating...' : preview}
        </p>
      )}
      {status === 'pending' && (
        <div style={styles.actions}>
          <button
            onClick={() => onAccept?.(draftId)}
            style={styles.acceptButton}
            aria-label={`Accept ${label}`}
            title="Accept"
          >
            ✓
          </button>
          <button
            onClick={() => onEdit?.(draftId)}
            style={styles.editButton}
            aria-label={`Edit ${label}`}
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={() => onDismiss?.(draftId)}
            style={styles.dismissButton}
            aria-label={`Dismiss ${label}`}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: `${spaceBetween.repeating}px ${spaceAround.compact}px ${spaceBetween.repeating}px ${spaceAround.default}px`,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    marginBottom: 2,
  },
  aiIndicator: {
    fontSize: 12,
    color: colors.fg.generative.spotReadable,
    flexShrink: 0,
  },
  label: {
    ...labelStyle.sm,
    fontWeight: 600,
    color: colors.fg.neutral.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  preview: {
    ...body.xs,
    color: colors.fg.neutral.secondary,
    margin: 0,
    marginBottom: spaceBetween.coupled,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100%',
  },
  actions: {
    display: 'flex',
    gap: spaceBetween.coupled,
  },
  acceptButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 22,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.fg.positive.primary}`,
    background: 'transparent',
    cursor: 'pointer',
    color: colors.fg.positive.primary,
    fontSize: 13,
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 22,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.fg.information.primary}`,
    background: 'transparent',
    cursor: 'pointer',
    color: colors.fg.information.primary,
    fontSize: 13,
  },
  dismissButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 22,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.fg.neutral.secondary}`,
    background: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    fontSize: 13,
  },
};
