/**
 * DraftItemRow
 *
 * AI draft item within the AI Drafts batch in the Processing Rail.
 * Shows draft label, content preview, and Accept/Edit/Dismiss actions.
 */

import React from 'react';
import { Check, Pencil, X, RefreshCw } from 'lucide-react';
import type { DraftStatus } from '../../types/drafts';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';
import { IconButton } from '../primitives/IconButton';
import { Spinner } from '../primitives/Spinner';
import { TypingDots } from '../primitives/TypingDots';

export interface DraftItemRowProps {
  draftId: string;
  label: string;
  preview: string;
  status: DraftStatus;
  onAccept?: (draftId: string) => void;
  onEdit?: (draftId: string) => void;
  onDismiss?: (draftId: string) => void;
  onRefresh?: (draftId: string) => void;
  onCancelRefresh?: (draftId: string) => void;
}

export function DraftItemRow({
  draftId,
  label,
  preview,
  status,
  onAccept,
  onEdit,
  onDismiss,
  onRefresh,
  onCancelRefresh,
}: DraftItemRowProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>
          {label}
          {status === 'updating' && (
            <span style={styles.labelSpinner}>
              <Spinner size="xs" color={colors.fg.information.secondary} />
            </span>
          )}
        </span>
      </div>
      <p style={styles.preview}>
        {status === 'generating' ? (
          <TypingDots />
        ) : preview ? (
          preview
        ) : null}
      </p>
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
            icon={<RefreshCw size={14} />}
            label={`Refresh ${label}`}
            variant="ghost"
            size="sm"
            shape="rounded"
            onClick={() => onRefresh?.(draftId)}
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
      {status === 'updating' && (
        <div style={styles.actions}>
          <button
            style={styles.stopRefreshButton}
            onClick={() => onCancelRefresh?.(draftId)}
            aria-label={`Stop refresh ${label}`}
          >
            Stop refresh
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: `${spaceBetween.repeating}px ${spaceAround.compact}px ${spaceBetween.repeating}px ${spaceAround.default}px`,
    borderTop: '1px solid rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    marginBottom: 2,
  },
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    color: colors.fg.neutral.primary,
    wordBreak: 'break-word' as const,
  },
  labelSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
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
  stopRefreshButton: {
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 500,
    color: colors.fg.neutral.secondary,
    background: 'transparent',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
  },
};
