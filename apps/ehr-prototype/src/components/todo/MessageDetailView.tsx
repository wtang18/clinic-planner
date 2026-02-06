/**
 * MessageDetailView Component
 *
 * Detail view for patient messages from the To-Do list.
 */

import React from 'react';
import { Send, User, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography } from '../../styles/foundations';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface MessageDetailViewProps {
  /** The message item to display */
  item: ToDoItem;
  /** Called when reply action is triggered */
  onReply?: () => void;
  /** Called when navigate to patient is triggered */
  onNavigateToPatient?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MessageDetailView: React.FC<MessageDetailViewProps> = ({
  item,
  onReply,
  onNavigateToPatient,
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const patientRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  };

  const patientNameStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.accent.primary,
  };

  const patientInfoStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const timestampStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const threadStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const messageStyle: React.CSSProperties = {
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    marginBottom: spaceAround.compact,
  };

  const messageSenderStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: colors.fg.neutral.primary,
    marginBottom: 4,
  };

  const messageTextStyle: React.CSSProperties = {
    fontSize: 14,
    color: colors.fg.neutral.primary,
    lineHeight: 1.5,
  };

  const replyContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.related,
    padding: spaceAround.default,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.min,
  };

  const replyInputStyle: React.CSSProperties = {
    flex: 1,
    padding: spaceAround.compact,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    resize: 'none',
    minHeight: 60,
  };

  const sendButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: colors.bg.accent.medium,
    color: colors.fg.neutral.inversePrimary,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>{item.title}</div>

        {/* Patient card */}
        {item.patient.name && (
          <div style={patientRowStyle} onClick={onNavigateToPatient}>
            <User size={16} color={colors.fg.neutral.secondary} />
            <span style={patientNameStyle}>{item.patient.name}</span>
            <span style={patientInfoStyle}>
              {item.patient.age}{item.patient.gender} • MRN: {item.patient.mrn}
            </span>
            <ArrowRight size={14} color={colors.fg.neutral.spotReadable} style={{ marginLeft: 'auto' }} />
          </div>
        )}

        <div style={timestampStyle}>
          <Clock size={12} />
          <span>Received: {new Date(item.createdDate).toLocaleString()}</span>
        </div>
      </div>

      {/* Thread */}
      <div style={threadStyle}>
        <div style={messageStyle}>
          <div style={messageSenderStyle}>{item.patient.name}</div>
          <div style={messageTextStyle}>
            This is a placeholder for the patient message content.
            In a real implementation, this would show the full message text.
          </div>
        </div>
      </div>

      {/* Reply input */}
      <div style={replyContainerStyle}>
        <textarea
          style={replyInputStyle}
          placeholder="Type your reply..."
        />
        <button style={sendButtonStyle} onClick={onReply}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

MessageDetailView.displayName = 'MessageDetailView';
