/**
 * AIDrawerView Component
 *
 * The full AI drawer view that renders in the left pane.
 * Contains context header, suggestions section, conversation history,
 * and empty states.
 *
 * Footer (quick actions + input) is implemented in Chunk 8.4.
 *
 * @see AI_DRAWER.md for full specification
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AIContextHeader, type ContextScope } from './AIContextHeader';
export type { ContextScope };
import { SuggestionsSection } from './SuggestionsSection';
import { ConversationHistory, type ConversationMessage } from './ConversationHistory';
import type { Suggestion } from '../../../types/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface AIDrawerViewProps {
  /** Current context scope */
  scope?: ContextScope;
  /** Patient name */
  patientName?: string;
  /** Encounter label */
  encounterLabel?: string;
  /** Specific item label (for item-level scope) */
  itemLabel?: string;
  /** Active suggestions */
  suggestions?: Suggestion[];
  /** Conversation messages */
  messages?: ConversationMessage[];
  /** Whether AI is processing */
  isLoading?: boolean;
  /** Whether in read-only mode (post-sign) */
  isReadOnly?: boolean;
  /** Read-only info for post-sign state */
  readOnlyInfo?: {
    signedAt: Date;
    availableUntil: Date;
  };
  /** Available context levels for switching */
  availableContextLevels?: ContextScope[];
  /** Called when user selects a different context level */
  onContextLevelChange?: (level: ContextScope) => void;
  /** Called when activity log is opened */
  onOpenActivityLog?: () => void;
  /** Called when scope is broadened */
  onBroadenScope?: () => void;
  /** Called when suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when suggestion is dismissed */
  onSuggestionDismiss?: (id: string, reason?: string) => void;
  /** Called when follow-up action is clicked */
  onFollowUpClick?: (actionId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
  /** Children for footer (passed from parent) */
  children?: React.ReactNode;
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  scope: ContextScope;
  patientName?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ scope, patientName }) => {
  const isInEncounter = scope === 'encounter' || scope === 'patient' || scope === 'item' || scope === 'section';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: spaceAround.spacious,
    textAlign: 'center',
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    marginBottom: spaceAround.default,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 16,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.tight,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: 1.5,
    maxWidth: 240,
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        <Sparkles size={28} />
      </div>
      <h3 style={headingStyle}>
        {isInEncounter ? 'AI is ready to help' : 'How can I help?'}
      </h3>
      <p style={subheadingStyle}>
        {isInEncounter
          ? 'Try asking a question or use a quick action below.'
          : 'Ask me anything or use a quick action to get started.'}
      </p>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const AIDrawerView: React.FC<AIDrawerViewProps> = ({
  scope = 'global',
  patientName,
  encounterLabel,
  itemLabel,
  suggestions = [],
  messages = [],
  isLoading = false,
  isReadOnly = false,
  readOnlyInfo,
  availableContextLevels,
  onContextLevelChange,
  onOpenActivityLog,
  onBroadenScope,
  onSuggestionAccept,
  onSuggestionDismiss,
  onFollowUpClick,
  style,
  testID,
  children,
}) => {
  const hasContent = suggestions.length > 0 || messages.length > 0 || isLoading;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    ...style,
  };

  const scrollContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  // Read-only footer for post-sign state
  const readOnlyFooterStyle: React.CSSProperties = {
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.subtle,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    textAlign: 'center',
    flexShrink: 0,
  };

  const readOnlyTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: 1.5,
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Context Header - floating with blur */}
      <AIContextHeader
        scope={scope}
        patientName={patientName}
        encounterLabel={encounterLabel}
        itemLabel={itemLabel}
        availableContextLevels={availableContextLevels}
        onContextLevelChange={onContextLevelChange}
        onOpenActivityLog={onOpenActivityLog}
        onBroadenScope={onBroadenScope}
      />

      {/* Scroll Content Area */}
      <div style={scrollContentStyle}>
        {hasContent ? (
          <>
            {/* Suggestions Section */}
            {suggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
              <SuggestionsSection
                suggestions={suggestions}
                onAccept={onSuggestionAccept}
                onDismiss={onSuggestionDismiss}
              />
            )}

            {/* Conversation History */}
            <ConversationHistory
              messages={messages}
              isLoading={isLoading}
              onFollowUpClick={onFollowUpClick}
              style={{ flex: 1 }}
            />
          </>
        ) : (
          /* Empty State */
          <EmptyState scope={scope} patientName={patientName} />
        )}
      </div>

      {/* Footer - either read-only message or children (quick actions + input from 8.4) */}
      {isReadOnly && readOnlyInfo ? (
        <div style={readOnlyFooterStyle}>
          <p style={readOnlyTextStyle}>
            Encounter signed · {formatTime(readOnlyInfo.signedAt)}
            <br />
            Conversation available until {formatDate(readOnlyInfo.availableUntil)}
          </p>
        </div>
      ) : (
        <div style={{ flexShrink: 0 }}>{children}</div>
      )}
    </div>
  );
};

AIDrawerView.displayName = 'AIDrawerView';
