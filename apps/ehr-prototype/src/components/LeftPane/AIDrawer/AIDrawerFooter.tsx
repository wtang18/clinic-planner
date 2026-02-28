/**
 * AIDrawerFooter Component
 *
 * Opaque footer for the AI drawer containing the unified suggestion module
 * (mutually exclusive with quick actions), plus the input row.
 *
 * Rendering priority (mutually exclusive):
 * 1. SuggestionEditPanel — when editing a suggestion inline
 * 2. SuggestionModule — when active suggestions exist
 * 3. QuickActionsRow — fallback when no suggestions
 *
 * @see AI_DRAWER.md §7 for full specification
 * @see docs/demo/planned/suggestion-consolidation.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { QuickActionsRow } from './QuickActionsRow';
import { AIDrawerInput } from './AIDrawerInput';
import { SuggestionModule } from '../../suggestions/SuggestionModule';
import { SuggestionEditPanel } from '../../suggestions/SuggestionEditPanel';
import type { Suggestion } from '../../../types/suggestions';
import type { QuickAction } from '../../../hooks/useAIAssistant';
import { SUGGESTION_ACTION_TYPES } from '../../../utils/suggestions';
import { colors, spaceAround } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface AIDrawerFooterProps {
  /** Merged suggestions (ambient + follow-up) */
  suggestions?: Suggestion[];
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Called when a suggestion is accepted with field changes */
  onSuggestionAcceptWithChanges?: (id: string, data: Record<string, unknown>) => void;
  /** Quick actions to display */
  quickActions?: QuickAction[];
  /** Called when a quick action is clicked */
  onQuickActionClick?: (actionId: string) => void;
  /** Current input value */
  inputValue?: string;
  /** Called when input value changes */
  onInputChange?: (value: string) => void;
  /** Called when message is sent */
  onSend?: (value: string) => void;
  /** Called when voice command starts */
  onVoiceCommandStart?: () => void;
  /** Called when voice command ends */
  onVoiceCommandEnd?: (transcript: string) => void;
  /** Whether currently listening for voice */
  isListening?: boolean;
  /** Whether the footer is disabled (loading state) */
  disabled?: boolean;
  /** Placeholder text for input */
  placeholder?: string;
  /** Canned query texts for ArrowUp/Down cycling */
  cannedQueries?: string[];
  /** Reference to focus the input (for ⌘K) */
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AIDrawerFooter: React.FC<AIDrawerFooterProps> = ({
  suggestions = [],
  onSuggestionAccept,
  onSuggestionDismiss,
  onSuggestionAcceptWithChanges,
  quickActions = [],
  onQuickActionClick,
  inputValue,
  onInputChange,
  onSend,
  onVoiceCommandStart,
  onVoiceCommandEnd,
  isListening = false,
  disabled = false,
  placeholder = 'Ask AI...',
  cannedQueries,
  inputRef,
  style,
  testID,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);

  // Count active action-type suggestions for auto-expand
  const activeCount = suggestions.filter(
    (s) =>
      s.status === 'active' &&
      SUGGESTION_ACTION_TYPES.includes(s.type as (typeof SUGGESTION_ACTION_TYPES)[number]),
  ).length;

  // Auto-expand when suggestion count increases
  const prevCountRef = useRef(activeCount);
  useEffect(() => {
    if (activeCount > prevCountRef.current) {
      setIsCollapsed(false);
    }
    prevCountRef.current = activeCount;
  }, [activeCount]);

  // Find editing suggestion
  const editingSuggestion = editingSuggestionId
    ? suggestions.find((s) => s.id === editingSuggestionId) ?? null
    : null;

  // Clear editing state if suggestion is no longer active
  useEffect(() => {
    if (editingSuggestionId && !editingSuggestion) {
      setEditingSuggestionId(null);
    }
  }, [editingSuggestionId, editingSuggestion]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    backgroundColor: colors.bg.neutral.base,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  return (
    <footer style={containerStyle} data-testid={testID}>
      {/* Priority 1: Edit panel (replaces everything above input) */}
      {editingSuggestion && onSuggestionAcceptWithChanges ? (
        <div style={{ padding: spaceAround.default }}>
          <SuggestionEditPanel
            suggestion={editingSuggestion}
            theme="light"
            onAccept={(id, data) => {
              onSuggestionAcceptWithChanges(id, data);
              setEditingSuggestionId(null);
            }}
            onCancel={() => setEditingSuggestionId(null)}
          />
        </div>
      ) : activeCount > 0 && onSuggestionAccept && onSuggestionDismiss ? (
        /* Priority 2: Suggestion module */
        <SuggestionModule
          suggestions={suggestions}
          onAccept={onSuggestionAccept}
          onDismiss={onSuggestionDismiss}
          onEdit={(id) => setEditingSuggestionId(id)}
          theme="light"
          collapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      ) : (
        /* Priority 3: Quick actions */
        quickActions.length > 0 && onQuickActionClick && (
          <QuickActionsRow
            actions={quickActions}
            onActionClick={onQuickActionClick}
            disabled={disabled}
          />
        )
      )}

      {/* Input Row — hidden during editing to reduce visual noise */}
      {!editingSuggestion && onSend && (
        <AIDrawerInput
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          onVoiceCommandStart={onVoiceCommandStart}
          onVoiceCommandEnd={onVoiceCommandEnd}
          isListening={isListening}
          placeholder={placeholder}
          disabled={disabled}
          showMicButton={true}
          showPasteButton={false}
          cannedQueries={cannedQueries}
          inputRef={inputRef}
        />
      )}
    </footer>
  );
};

AIDrawerFooter.displayName = 'AIDrawerFooter';
