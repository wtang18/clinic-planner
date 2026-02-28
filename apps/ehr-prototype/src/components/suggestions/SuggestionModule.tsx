/**
 * SuggestionModule Component
 *
 * Unified collapsible suggestion container for both the AI drawer footer
 * and the palette surface. Consolidates all chart-item suggestions into
 * a single module that is mutually exclusive with quick actions.
 *
 * Behavior:
 * - Returns null when 0 active action-type suggestions (parent shows quick actions)
 * - Expanded: header (Sparkles + "Suggestions" + count badge + chevron) + SuggestionList
 * - Collapsed: header only with count badge
 * - Parent manages collapsed state + auto-expand logic
 *
 * @see docs/demo/planned/suggestion-consolidation.md
 */

import React from 'react';
import { Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import type { Suggestion } from '../../types/suggestions';
import { SUGGESTION_ACTION_TYPES } from '../../utils/suggestions';
import { SuggestionList } from './SuggestionList';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionModuleProps {
  /** All suggestions (will be filtered to action types internally) */
  suggestions: Suggestion[];
  /** Called when a suggestion is accepted */
  onAccept: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onDismiss: (id: string) => void;
  /** Called when a suggestion's edit button is clicked */
  onEdit?: (id: string) => void;
  /** Color theme: 'light' for drawer, 'dark' for palette */
  theme: 'light' | 'dark';
  /** Maximum suggestions visible before "show more" */
  maxVisible?: number;
  /** Whether the module is collapsed (header only) */
  collapsed?: boolean;
  /** Called when collapse/expand toggle is clicked */
  onToggleCollapse?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionModule: React.FC<SuggestionModuleProps> = ({
  suggestions,
  onAccept,
  onDismiss,
  onEdit,
  theme,
  maxVisible = 3,
  collapsed = false,
  onToggleCollapse,
  style,
}) => {
  const isDark = theme === 'dark';

  // Filter to active action-type suggestions
  const activeSuggestions = suggestions.filter(
    (s) =>
      s.status === 'active' &&
      SUGGESTION_ACTION_TYPES.includes(s.type as (typeof SUGGESTION_ACTION_TYPES)[number]),
  );

  // Return null when no active suggestions — parent shows quick actions instead
  if (activeSuggestions.length === 0) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderTop: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isDark ? colors.fg.generative.spotReadable : colors.fg.accent.primary,
  };

  const titleStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
  };

  const countBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: `0 ${spaceAround.tight}px`,
    borderRadius: borderRadius.full,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.bg.accent.subtle,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: isDark ? colors.fg.generative.spotReadable : colors.fg.accent.primary,
  };

  const chevronStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    color: isDark ? 'rgba(255, 255, 255, 0.5)' : colors.fg.neutral.secondary,
  };

  const contentStyle: React.CSSProperties = {
    padding: `0 ${spaceAround.default}px ${spaceAround.compact}px`,
  };

  const ChevronIcon = collapsed ? ChevronRight : ChevronDown;

  return (
    <div style={containerStyle} data-testid="suggestion-module">
      {/* Header — always visible */}
      <div
        style={headerStyle}
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggleCollapse?.()}
      >
        <span style={iconStyle}>
          <Sparkles size={16} />
        </span>
        <span style={titleStyle}>Suggestions</span>
        <span style={countBadgeStyle}>{activeSuggestions.length}</span>
        <span style={chevronStyle}>
          <ChevronIcon size={14} />
        </span>
      </div>

      {/* Content — hidden when collapsed */}
      {!collapsed && (
        <div style={contentStyle}>
          <SuggestionList
            suggestions={activeSuggestions}
            maxVisible={maxVisible}
            onAccept={onAccept}
            onDismiss={onDismiss}
            onEdit={onEdit}
            variant="compact"
            theme={theme}
            showHeader={false}
          />
        </div>
      )}
    </div>
  );
};

SuggestionModule.displayName = 'SuggestionModule';
