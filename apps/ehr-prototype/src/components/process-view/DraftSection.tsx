/**
 * DraftSection Component
 *
 * Renders AI Drafts in the Process view with full content preview
 * and prominent Accept/Edit/Dismiss actions.
 */

import React from 'react';
import { Sparkles, Ban, Pencil, RefreshCw } from 'lucide-react';
import type { AIDraft } from '../../types';
import { SectionHeader } from '../primitives/SectionHeader';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { Spinner } from '../primitives/Spinner';
import { TypingDots } from '../primitives/TypingDots';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DraftSectionProps {
  drafts: AIDraft[];
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
  onRefreshDraft?: (draftId: string) => void;
  onCancelRefresh?: (draftId: string) => void;
  style?: React.CSSProperties;
}

// ============================================================================
// DraftCard
// ============================================================================

interface DraftCardProps {
  draft: AIDraft;
  onAccept?: () => void;
  onEdit?: () => void;
  onDismiss?: () => void;
  onRefresh?: () => void;
  onCancel?: () => void;
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onAccept, onEdit, onDismiss, onRefresh, onCancel }) => {
  const isInProgress = draft.status === 'generating' || draft.status === 'updating';
  const isPending = draft.status === 'pending';

  return (
    <div style={styles.card} data-testid={`draft-card-${draft.id}`}>
      {/* Header — label left, actions right */}
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <span style={styles.sparkle}>
            <Sparkles size={14} color={colors.fg.accent.primary} />
          </span>
          <span style={styles.cardLabel}>{draft.label}</span>
        </div>
        {isPending && (
          <div style={styles.cardHeaderActions} data-testid="draft-actions">
            <IconButton
              icon={<Ban size={14} />}
              label={`Dismiss ${draft.label}`}
              variant="ghost"
              size="sm"
              shape="rounded"
              onClick={onDismiss}
              data-testid={`dismiss-draft-${draft.id}`}
            />
            <IconButton
              icon={<Pencil size={14} />}
              label={`Edit ${draft.label}`}
              variant="ghost"
              size="sm"
              shape="rounded"
              onClick={onEdit}
              data-testid={`edit-draft-${draft.id}`}
            />
            <IconButton
              icon={<RefreshCw size={14} />}
              label={`Refresh ${draft.label}`}
              variant="ghost"
              size="sm"
              shape="rounded"
              onClick={onRefresh}
              data-testid={`refresh-draft-${draft.id}`}
            />
            <Button
              variant="primary"
              size="xs"
              shape="rect"
              onClick={onAccept}
              data-testid={`accept-draft-${draft.id}`}
            >
              Accept
            </Button>
          </div>
        )}
        {draft.status === 'updating' && (
          <div style={styles.cardHeaderActions}>
            <Button
              variant="secondary"
              size="xs"
              shape="rect"
              onClick={onCancel}
              data-testid={`cancel-refresh-${draft.id}`}
            >
              Stop refresh
            </Button>
          </div>
        )}
      </div>

      {/* Content body */}
      <div style={styles.cardContent}>
        {draft.status === 'generating' ? (
          <TypingDots />
        ) : draft.status === 'updating' ? (
          <p style={styles.contentText}>{draft.content}</p>
        ) : (
          <p style={styles.contentText}>{draft.content}</p>
        )}
      </div>

      {/* Metadata pills row */}
      <div style={styles.pillsRow}>
        {draft.status === 'updating' && (
          <span style={styles.statusPill}>
            <Spinner size="xs" color={colors.fg.information.secondary} />
            <span>Refreshing...</span>
          </span>
        )}
        {draft.confidence !== undefined && isPending && (
          <span style={styles.confidencePill}>
            <span style={styles.confidenceBold}>{Math.round(draft.confidence * 100)}%</span>
            <span>Confidence</span>
          </span>
        )}
        {(draft.version ?? 1) > 1 && (
          <span style={styles.updatedPill}>Updated</span>
        )}
        {draft.enrichesItemId && (
          <span style={styles.enrichBadge}>Updates existing</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DraftSection
// ============================================================================

export const DraftSection: React.FC<DraftSectionProps> = ({
  drafts,
  onAcceptDraft,
  onEditDraft,
  onDismissDraft,
  onRefreshDraft,
  onCancelRefresh,
  style,
}) => {
  if (drafts.length === 0) {
    return null; // Don't show empty AI Drafts section
  }

  return (
    <div style={{ ...styles.section, ...style }} data-testid="batch-ai-drafts">
      <SectionHeader
        title="AI Drafts"
        count={`${drafts.length}`}
        trailing={
          <span style={styles.sparkleHeader}>
            <Sparkles size={16} color={colors.fg.accent.primary} />
          </span>
        }
        testID="draft-section-header"
      />
      <div style={styles.sectionContent}>
        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            onAccept={() => onAcceptDraft?.(draft.id)}
            onEdit={() => onEditDraft?.(draft.id)}
            onDismiss={() => onDismissDraft?.(draft.id)}
            onRefresh={() => onRefreshDraft?.(draft.id)}
            onCancel={() => onCancelRefresh?.(draft.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  section: {
    borderTop: `1px solid ${colors.border.neutral.low}`,
    paddingTop: spaceAround.default,
    paddingBottom: spaceAround.default,
  },
  sectionContent: {
    paddingTop: spaceAround.tight,
    paddingBottom: spaceAround.tight,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  },
  sparkleHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spaceBetween.repeating,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  cardHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  },
  sparkle: {
    display: 'flex',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    lineHeight: 1.3,
  },
  cardContent: {},
  contentText: {
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.fg.neutral.primary,
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
  pillsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: spaceBetween.coupled,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: borderRadius.xs,
    backgroundColor: colors.bg.neutral.subtle,
    color: colors.fg.information.secondary,
  },
  confidencePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: borderRadius.xs,
    backgroundColor: colors.bg.neutral.subtle,
    color: colors.fg.neutral.secondary,
  },
  confidenceBold: {
    fontWeight: typography.fontWeight.semibold,
  },
  updatedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: borderRadius.xs,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
  },
  enrichBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: borderRadius.xs,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
  },
};

DraftSection.displayName = 'DraftSection';
