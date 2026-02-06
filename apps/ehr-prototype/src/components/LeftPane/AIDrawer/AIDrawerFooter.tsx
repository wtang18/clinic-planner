/**
 * AIDrawerFooter Component
 *
 * Opaque footer for the AI drawer containing quick actions row and input row.
 * This is the only opaque element in the drawer, anchored to the bottom.
 *
 * @see AI_DRAWER.md §7 for full specification
 */

import React, { useRef } from 'react';
import { QuickActionsRow } from './QuickActionsRow';
import { AIDrawerInput } from './AIDrawerInput';
import type { QuickAction } from '../../../hooks/useAIAssistant';
import { colors, spaceAround, borderRadius } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface AIDrawerFooterProps {
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
  inputRef,
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg.neutral.base,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  return (
    <footer style={containerStyle} data-testid={testID}>
      {/* Quick Actions Row */}
      {quickActions.length > 0 && onQuickActionClick && (
        <QuickActionsRow
          actions={quickActions}
          onActionClick={onQuickActionClick}
          disabled={disabled}
        />
      )}

      {/* Input Row */}
      {onSend && (
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
          inputRef={inputRef}
        />
      )}
    </footer>
  );
};

AIDrawerFooter.displayName = 'AIDrawerFooter';
