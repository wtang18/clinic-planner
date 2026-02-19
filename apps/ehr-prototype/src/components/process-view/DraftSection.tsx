/**
 * DraftSection Component
 *
 * Renders AI Drafts in the Process view with full content preview
 * and prominent Accept/Edit/Dismiss actions.
 */

import React from 'react';
import { Sparkles, Check, Edit2, X, Loader } from 'lucide-react';
import type { AIDraft } from '../../types';
import { SectionHeader } from '../primitives/SectionHeader';
import { Button } from '../primitives/Button';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DraftSectionProps {
  drafts: AIDraft[];
  onAcceptDraft?: (draftId: string) => void;
  onEditDraft?: (draftId: string) => void;
  onDismissDraft?: (draftId: string) => void;
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
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onAccept, onEdit, onDismiss }) => {
  const isGenerating = draft.status === 'generating';
  const isPending = draft.status === 'pending';

  return (
    <div style={styles.card} data-testid={`draft-card-${draft.id}`}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <span style={styles.sparkle}>
            <Sparkles size={14} color={colors.fg.accent.primary} />
          </span>
          <span style={styles.cardLabel}>{draft.label}</span>
        </div>
        {isGenerating && (
          <span style={styles.generatingBadge}>
            <Loader size={12} />
            <span>Generating...</span>
          </span>
        )}
        {draft.enrichesItemId && (
          <span style={styles.enrichBadge}>Updates existing</span>
        )}
      </div>

      {/* Full content preview */}
      <div style={styles.cardContent}>
        {isGenerating ? (
          <span style={styles.generatingText}>AI is drafting content...</span>
        ) : (
          <p style={styles.contentText}>{draft.content}</p>
        )}
      </div>

      {/* Confidence */}
      {draft.confidence !== undefined && isPending && (
        <div style={styles.confidenceRow}>
          <span style={styles.confidenceLabel}>Confidence:</span>
          <span style={styles.confidenceValue}>
            {Math.round(draft.confidence * 100)}%
          </span>
        </div>
      )}

      {/* Actions — prominent for pending drafts */}
      {isPending && (
        <div style={styles.cardActions} data-testid="draft-actions">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Check size={14} />}
            onClick={onAccept}
            data-testid={`accept-draft-${draft.id}`}
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit2 size={14} />}
            onClick={onEdit}
            data-testid={`edit-draft-${draft.id}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={onDismiss}
            data-testid={`dismiss-draft-${draft.id}`}
          >
            Dismiss
          </Button>
        </div>
      )}
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
    marginBottom: spaceAround.defaultPlus,
  },
  sectionContent: {
    padding: spaceAround.default,
    paddingTop: spaceAround.compact,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  sparkleHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.accent.low}`,
    borderRadius: borderRadius.sm,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.compact,
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  sparkle: {
    display: 'flex',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  generatingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: colors.fg.information.secondary,
  },
  enrichBadge: {
    fontSize: 11,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    padding: `2px ${spaceAround.tight}px`,
    borderRadius: borderRadius.sm,
  },
  cardContent: {
    marginBottom: spaceAround.compact,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.fg.neutral.primary,
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
  generatingText: {
    fontSize: 14,
    color: colors.fg.neutral.disabled,
    fontStyle: 'italic',
  },
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.compact,
  },
  confidenceLabel: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
  cardActions: {
    display: 'flex',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
};

DraftSection.displayName = 'DraftSection';
