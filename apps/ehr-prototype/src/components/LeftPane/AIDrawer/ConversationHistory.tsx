/**
 * ConversationHistory Component
 *
 * Chronological thread of user messages, AI responses, and system messages.
 * Renders in the AI drawer scroll area below suggestions.
 *
 * @see AI_DRAWER.md §6 for full specification
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type MessageType = 'user' | 'ai' | 'system';

export interface ConversationMessage {
  /** Unique message ID */
  id: string;
  /** Message type */
  type: MessageType;
  /** Message content */
  content: string;
  /** Timestamp */
  timestamp: Date;
  /** Follow-up actions (only shown on latest AI response) */
  followUpActions?: Array<{
    id: string;
    label: string;
  }>;
}

export interface ConversationHistoryProps {
  /** Messages to display */
  messages: ConversationMessage[];
  /** Whether AI is currently processing a response */
  isLoading?: boolean;
  /** Called when a follow-up action is clicked */
  onFollowUpClick?: (actionId: string) => void;
  /** Called when user scrolls (for auto-scroll pause detection) */
  onScroll?: (isAtBottom: boolean) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Message Components
// ============================================================================

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `${spaceAround.tight}px 0`,
  };

  const bubbleStyle: React.CSSProperties = {
    maxWidth: '85%',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.xs,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 1.5,
    color: colors.fg.neutral.primary,
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>{content}</div>
    </div>
  );
};

interface AIMessageProps {
  content: string;
  followUpActions?: ConversationMessage['followUpActions'];
  showFollowUps: boolean;
  onFollowUpClick?: (actionId: string) => void;
}

const AIMessage: React.FC<AIMessageProps> = ({
  content,
  followUpActions,
  showFollowUps,
  onFollowUpClick,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: `${spaceAround.tight}px 0`,
    gap: spaceBetween.relatedCompact,
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '90%',
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 1.6,
    color: colors.fg.neutral.primary,
    whiteSpace: 'pre-wrap',
  };

  const actionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.relatedCompact,
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    border: `1px solid ${colors.border.neutral.default}`,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>{content}</div>

      {/* Follow-up actions - only on latest response */}
      {showFollowUps && followUpActions && followUpActions.length > 0 && (
        <div style={actionsContainerStyle}>
          {followUpActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onFollowUpClick?.(action.id)}
              style={actionButtonStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.accent.subtle;
                (e.currentTarget as HTMLElement).style.borderColor = colors.fg.accent.primary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = colors.border.neutral.default;
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface SystemMessageProps {
  content: string;
  timestamp: Date;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ content, timestamp }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${spaceAround.default}px 0`,
    gap: spaceBetween.coupled,
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const contentStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textAlign: 'center',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div style={containerStyle}>
      <span style={timestampStyle}>System · {formatTime(timestamp)}</span>
      <span style={contentStyle}>{content}</span>
    </div>
  );
};

// ============================================================================
// Loading Indicator
// ============================================================================

const LoadingIndicator: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px 0`,
  };

  const textStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    fontStyle: 'italic',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={containerStyle}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', color: colors.fg.accent.primary }}
      >
        <Loader2 size={16} />
      </motion.span>
      <span style={textStyle}>Thinking...</span>
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  isLoading = false,
  onFollowUpClick,
  onScroll,
  style,
  testID,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Find the latest AI message for showing follow-up actions
  const latestAIMessageId = [...messages]
    .reverse()
    .find((m) => m.type === 'ai')?.id;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading, shouldAutoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShouldAutoScroll(isAtBottom);
    onScroll?.(isAtBottom);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: `0 ${spaceAround.default}px`,
    overflowY: 'auto',
    ...style,
  };

  // Empty state - no messages
  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onScroll={handleScroll}
      data-testid={testID}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {message.type === 'user' && <UserMessage content={message.content} />}
            {message.type === 'ai' && (
              <AIMessage
                content={message.content}
                followUpActions={message.followUpActions}
                showFollowUps={message.id === latestAIMessageId}
                onFollowUpClick={onFollowUpClick}
              />
            )}
            {message.type === 'system' && (
              <SystemMessage content={message.content} timestamp={message.timestamp} />
            )}
          </motion.div>
        ))}

        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}
      </AnimatePresence>
    </div>
  );
};

ConversationHistory.displayName = 'ConversationHistory';
