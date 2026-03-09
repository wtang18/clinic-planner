/**
 * SuggestionCard — Item preview card with one-tap [Add] and [Edit]
 *
 * Appears at every depth to show contextual suggestions:
 * - Root (depth 0): encounter-contextual cross-category suggestions
 * - Category (depth 1): category-scoped suggestions
 * - Item (depth 2): single recommendation card below field rows
 *
 * Phase 1: Shell implementation with summary text + [Add][Edit] buttons.
 * Phase 2 will add full field rows, pre-selection, and NL parsing.
 */

import React from 'react';
import { Pencil } from 'lucide-react';
import type { ItemIntent } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { buildItemSummary, getCategoryBadge } from '../../utils/suggestion-helpers';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionCardProps {
  item: QuickPickItem;
  /** Display summary (e.g., "100mg PO TID PRN #21, 0RF") */
  summary?: string;
  /** Override intent for badge display (e.g., 'report' → Med, 'rule-out' → R/O) */
  intent?: ItemIntent;
  /** Called when user taps [Add] — accepts with defaults */
  onAdd: (item: QuickPickItem) => void;
  /** Called when user taps [Edit] — opens depth 3 with pre-selected values */
  onEdit: (item: QuickPickItem) => void;
  disabled?: boolean;
  /** Show ⌘↩ shortcut hint on the Add button (depth 2 only) */
  showShortcutHint?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  item,
  summary,
  intent,
  onAdd,
  onEdit,
  disabled = false,
  showShortcutHint = false,
}) => {
  const displaySummary = summary || buildItemSummary(item);

  return (
    <div style={styles.card} data-testid={`suggestion-card-${item.id}`} data-omni-section>
      {/* Left: badge + content */}
      <div style={styles.content}>
        <span style={styles.badge}>{getCategoryBadge(item.category, intent)}</span>
        <div style={styles.textArea}>
          <span style={styles.label}>{item.label}</span>
          {displaySummary && (
            <span style={styles.summary}>{displaySummary}</span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div style={styles.actions}>
        <IconButton
          icon={<Pencil size={14} />}
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          disabled={disabled}
          data-testid={`suggestion-edit-${item.id}`}
        />
        <Button
          variant="primary"
          size="xs"
          shape="pill"
          onClick={() => onAdd(item)}
          disabled={disabled}
          data-testid={`suggestion-add-${item.id}`}
          style={{ height: 28, padding: '0 10px' }}
        >
          Add{showShortcutHint && <span style={{ opacity: 0.7, marginLeft: 4, fontSize: 11 }}>⌘↩</span>}
        </Button>
      </div>
    </div>
  );
};

SuggestionCard.displayName = 'SuggestionCard';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.transparent.min,
    border: `1px solid ${colors.border.neutral.subtle}`,
    borderRadius: borderRadius.sm,
    transition: `border-color ${transitions.fast}`,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    flex: 1,
    minWidth: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `1px ${spaceAround.nudge4}px`,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.transparent.medium,
    backgroundColor: colors.bg.transparent.subtle,
    borderRadius: borderRadius.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  textArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  summary: {
    fontSize: 11,
    fontFamily: typography.fontFamily.mono,
    color: colors.fg.neutral.spotReadable,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  },
};
