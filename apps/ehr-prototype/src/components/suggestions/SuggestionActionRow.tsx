/**
 * SuggestionActionRow — Themed compact row for AI suggestions.
 *
 * Layout:
 *   [Badge]  Label                    [Dismiss] [Edit] [Add]
 *            Summary (truncated)
 *
 * Badge sits top-left, label + summary stack vertically, actions pin right.
 * Replaces the inline compact variant rendering in SuggestionList with proper
 * component structure and theme support (light for drawer, dark for palette).
 */

import React from 'react';
import { Ban } from 'lucide-react';
import type { Suggestion } from '../../types/suggestions';
import { getCategoryBadge, buildSuggestionSummary } from '../../utils/suggestion-helpers';
import { EDITABLE_SUGGESTION_CATEGORIES } from '../../services/ai/entity-extraction/suggestion-validators';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import {
  colors,
  spaceAround,
  spaceBetween,
  borderRadius,
  typography,
  transitions,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionActionRowProps {
  suggestion: Suggestion;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onEdit?: (id: string) => void;
  theme?: 'light' | 'dark';
  exiting?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/** Suggestion types that have an editable template with a structured CategoryFieldDef */
function hasEditableTemplate(suggestion: Suggestion): boolean {
  if (suggestion.content.type === 'new-item') {
    return EDITABLE_SUGGESTION_CATEGORIES.has(suggestion.content.category);
  }
  if (suggestion.content.type === 'care-gap-action') {
    const cat = suggestion.content.actionTemplate.category;
    return cat != null && EDITABLE_SUGGESTION_CATEGORIES.has(cat);
  }
  return false;
}

/** Get the category for badge rendering */
function getSuggestionCategory(suggestion: Suggestion): string | null {
  if (suggestion.content.type === 'new-item') {
    return suggestion.content.category;
  }
  if (suggestion.content.type === 'care-gap-action') {
    return suggestion.content.actionTemplate.category ?? null;
  }
  return null;
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionActionRow: React.FC<SuggestionActionRowProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  onEdit,
  theme = 'light',
  exiting = false,
}) => {
  const isDark = theme === 'dark';
  const category = getSuggestionCategory(suggestion);
  const badge = category ? getCategoryBadge(category as any) : null;
  const summary = buildSuggestionSummary(suggestion);
  const label = suggestion.actionLabel || suggestion.displayText;
  const canEdit = hasEditableTemplate(suggestion) && onEdit;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.bg.transparent.min,
    borderRadius: borderRadius.sm,
    transition: `all ${transitions.fast}`,
    ...(exiting ? { opacity: 0, transform: 'translateX(-10px)' } : {}),
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `1px ${spaceAround.nudge4}px`,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: isDark ? 'rgba(255,255,255,0.7)' : colors.fg.transparent.medium,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.bg.transparent.subtle,
    borderRadius: borderRadius.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    flexShrink: 0,
    lineHeight: '16px',
    marginTop: 2,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const summaryStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    color: isDark ? 'rgba(255,255,255,0.5)' : colors.fg.neutral.spotReadable,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      style={containerStyle}
      data-testid={`suggestion-action-row-${suggestion.id}`}
    >
      {/* Left: badge + stacked text */}
      {badge && <span style={badgeStyle}>{badge}</span>}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        flex: 1,
      }}>
        <span style={labelStyle}>{label}</span>
        {summary && <span style={summaryStyle}>{summary}</span>}
      </div>

      {/* Right: actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        flexShrink: 0,
        alignSelf: 'center',
      }}>
        <IconButton
          icon={<Ban size={14} />}
          label="Dismiss"
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(suggestion.id)}
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : colors.fg.neutral.spotReadable }}
        />
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(suggestion.id)}
            style={{
              color: isDark ? 'rgba(255,255,255,0.7)' : colors.fg.neutral.secondary,
              height: 28,
              padding: '0 8px',
            }}
          >
            Edit
          </Button>
        )}
        <Button
          variant="primary"
          size="xs"
          shape="rect"
          onClick={() => onAccept(suggestion.id)}
          style={{ height: 28, padding: '0 10px' }}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

SuggestionActionRow.displayName = 'SuggestionActionRow';
