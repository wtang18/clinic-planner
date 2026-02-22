/**
 * SuggestionsSection Component
 *
 * Collapsible suggestions section at the top of the AI drawer scroll area.
 * Shows top 3 by default with expand option.
 * Supports edit-before-accept: clicking [Edit] replaces the list with a
 * SuggestionEditPanel inline.
 *
 * @see AI_DRAWER.md §5 for full specification
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Suggestion } from '../../../types/suggestions';
import { SuggestionList } from '../../suggestions/SuggestionList';
import { SuggestionEditPanel } from '../../suggestions/SuggestionEditPanel';
import { SUGGESTION_ACTION_TYPES } from '../../../utils/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionsSectionProps {
  /** All available suggestions */
  suggestions: Suggestion[];
  /** Called when a suggestion is accepted */
  onAccept: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onDismiss: (id: string, reason?: string) => void;
  /** Called when a suggestion is accepted with field changes */
  onAcceptWithChanges?: (id: string, data: Record<string, unknown>) => void;
  /** Default number of visible suggestions */
  defaultVisible?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  suggestions,
  onAccept,
  onDismiss,
  onAcceptWithChanges,
  defaultVisible = 3,
  style,
  testID,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);

  // Filter to action-type suggestions (same set shown in palette)
  const actionSuggestions = suggestions.filter(s =>
    SUGGESTION_ACTION_TYPES.includes(s.type as typeof SUGGESTION_ACTION_TYPES[number])
  );

  // Don't render if no action suggestions
  if (actionSuggestions.length === 0) {
    return null;
  }

  const visibleSuggestions = isExpanded ? actionSuggestions : actionSuggestions.slice(0, defaultVisible);
  const hasMore = actionSuggestions.length > defaultVisible;

  const editingSuggestion = editingSuggestionId
    ? suggestions.find(s => s.id === editingSuggestionId) ?? null
    : null;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.fg.accent.primary,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  };

  const countBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: `0 ${spaceAround.tight}px`,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bg.accent.subtle,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
  };

  const toggleButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    border: 'none',
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  const contentStyle: React.CSSProperties = {
    padding: `0 ${spaceAround.default}px ${spaceAround.compact}px`,
  };

  return (
    <section style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>
            <Sparkles size={16} />
          </span>
          <span style={titleStyle}>Suggestions</span>
          <span style={countBadgeStyle}>{actionSuggestions.length}</span>
        </div>

        {/* Show all / Show less toggle */}
        {hasMore && !editingSuggestion && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={toggleButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.accent.subtle;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show all
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Content: edit panel or suggestion list */}
      <div style={contentStyle}>
        {editingSuggestion && onAcceptWithChanges ? (
          <SuggestionEditPanel
            suggestion={editingSuggestion}
            theme="light"
            onAccept={(id, data) => {
              onAcceptWithChanges(id, data);
              setEditingSuggestionId(null);
            }}
            onCancel={() => setEditingSuggestionId(null)}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={isExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SuggestionList
                suggestions={visibleSuggestions}
                onAccept={onAccept}
                onDismiss={onDismiss}
                onEdit={(id) => setEditingSuggestionId(id)}
                variant="compact"
                showHeader={false}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

SuggestionsSection.displayName = 'SuggestionsSection';
