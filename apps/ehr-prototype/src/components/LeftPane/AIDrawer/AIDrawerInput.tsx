/**
 * AIDrawerInput Component
 *
 * Light-themed input row for the AI drawer footer.
 * Contains mic button, auto-growing textarea, and send button.
 *
 * @see AI_DRAWER.md §7 for full specification
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Clipboard } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface AIDrawerInputProps {
  /** Current input value */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when send is clicked or Enter pressed */
  onSend?: (value: string) => void;
  /** Called when voice command starts (push-to-talk) */
  onVoiceCommandStart?: () => void;
  /** Called when voice command ends */
  onVoiceCommandEnd?: (transcript: string) => void;
  /** Whether currently listening for voice command */
  isListening?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Max height for textarea */
  maxHeight?: number;
  /** Whether to show microphone button */
  showMicButton?: boolean;
  /** Whether to show paste/attach button */
  showPasteButton?: boolean;
  /** Reference to focus the input */
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AIDrawerInput: React.FC<AIDrawerInputProps> = ({
  value: controlledValue,
  onChange,
  onSend,
  onVoiceCommandStart,
  onVoiceCommandEnd,
  isListening = false,
  placeholder = 'Ask AI...',
  disabled = false,
  maxHeight = 120,
  showMicButton = true,
  showPasteButton = false,
  inputRef: externalRef,
  style,
  testID,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalTextareaRef;

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minH = 24;
      if (!value || value.length === 0) {
        textarea.style.height = `${minH}px`;
        return;
      }
      textarea.style.height = `${minH}px`;
      const newHeight = Math.max(minH, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [maxHeight, value, textareaRef]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    const timer = setTimeout(() => adjustHeight(), 0);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop keyboard events from bubbling except Tab
    if (e.key !== 'Tab') {
      e.stopPropagation();
    }

    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && onSend) {
      onSend(value.trim());
      if (controlledValue === undefined) {
        setInternalValue('');
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    ...style,
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${isFocused ? colors.fg.accent.primary : colors.border.neutral.default}`,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    transition: 'border-color 150ms ease',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 24,
    maxHeight,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: 14,
    lineHeight: '20px',
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    resize: 'none',
    outline: 'none',
  };

  const controlRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    paddingTop: 0,
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.secondary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 150ms ease',
  };

  const micButtonStyle: React.CSSProperties = {
    ...iconButtonStyle,
    borderRadius: borderRadius.full,
    backgroundColor: isListening ? colors.fg.accent.primary : 'transparent',
    color: isListening ? colors.fg.neutral.inversePrimary : colors.fg.neutral.secondary,
  };

  const sendButtonStyle: React.CSSProperties = {
    ...iconButtonStyle,
    borderRadius: borderRadius.full,
    backgroundColor: value.trim() && !disabled ? colors.fg.accent.primary : 'transparent',
    color: value.trim() && !disabled ? colors.fg.neutral.inversePrimary : colors.fg.neutral.disabled,
    cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={inputContainerStyle}>
        <textarea
          ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={textareaStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div style={controlRowStyle}>
          {/* Left controls - Mic button */}
          <div style={buttonGroupStyle}>
            {showMicButton && (
              <button
                type="button"
                style={micButtonStyle}
                onMouseDown={onVoiceCommandStart}
                onMouseUp={() => onVoiceCommandEnd?.('')}
                onMouseLeave={() => {
                  if (isListening) onVoiceCommandEnd?.('');
                }}
                disabled={disabled}
                title={isListening ? 'Release to send' : 'Hold to speak'}
                onMouseEnter={(e) => {
                  if (!disabled && !isListening) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.subtle;
                    (e.currentTarget as HTMLElement).style.color = colors.fg.neutral.primary;
                  }
                }}
              >
                <Mic size={16} />
              </button>
            )}
          </div>

          {/* Right controls - Paste + Send */}
          <div style={buttonGroupStyle}>
            {showPasteButton && (
              <button
                type="button"
                style={iconButtonStyle}
                disabled={disabled}
                title="Paste context"
                onMouseEnter={(e) => {
                  if (!disabled) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.subtle;
                    (e.currentTarget as HTMLElement).style.color = colors.fg.neutral.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = colors.fg.neutral.secondary;
                }}
              >
                <Clipboard size={16} />
              </button>
            )}

            <button
              type="button"
              style={sendButtonStyle}
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              title="Send message"
              onMouseEnter={(e) => {
                if (value.trim() && !disabled) {
                  (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AIDrawerInput.displayName = 'AIDrawerInput';
