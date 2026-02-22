/**
 * DraftItemRow
 *
 * AI draft item within the AI Drafts batch in the Processing Rail.
 * Shows draft label, content preview, and Accept/Edit/Dismiss actions.
 */

import React from 'react';
import { Check, Pencil, X } from 'lucide-react';
import type { DraftStatus } from '../../types/drafts';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';
import { IconButton } from '../primitives/IconButton';

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
          <IconButton
            icon={<Check size={14} />}
            label={`Accept ${label}`}
            variant="ghost"
            size="sm"
            shape="rounded"
            onClick={() => onAccept?.(draftId)}
            style={{ color: colors.fg.positive.primary }}
          />
          <IconButton
            icon={<Pencil size={14} />}
            label={`Edit ${label}`}
            variant="ghost"
            size="sm"
            shape="rounded"
            onClick={() => onEdit?.(draftId)}
            style={{ color: colors.fg.information.primary }}
          />
          <IconButton
            icon={<X size={14} />}
            label={`Dismiss ${label}`}
            variant="ghost"
            size="sm"
            shape="rounded"
            onClick={() => onDismiss?.(draftId)}
          />
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
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    color: colors.fg.neutral.primary,
    wordBreak: 'break-word' as const,
  },
  preview: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    color: colors.fg.neutral.secondary,
    margin: 0,
    marginBottom: spaceBetween.coupled,
    wordBreak: 'break-word' as const,
  },
  actions: {
    display: 'flex',
    gap: spaceBetween.coupled,
  },
};
