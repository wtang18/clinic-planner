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
import { useAIInputRegistry } from '../../../hooks/useAIKeyboardShortcuts';

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
  /** Canned query texts for ArrowUp/Down cycling */
  cannedQueries?: string[];
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
  cannedQueries,
  inputRef: externalRef,
  style,
  testID,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [cycleIndex, setCycleIndex] = useState<number | null>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalTextareaRef;

  // Register with keyboard shortcuts for ⌘K focus
  const inputRegistry = useAIInputRegistry();
  useEffect(() => {
    if (inputRegistry && textareaRef.current) {
      inputRegistry.registerDrawerInput(textareaRef.current);
    }
    return () => {
      if (inputRegistry) {
        inputRegistry.registerDrawerInput(null);
      }
    };
  }, [inputRegistry, textareaRef]);

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minH = 44;
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

  // Check if current value matches a canned query (cycling mode)
  const isCycledValue = cycleIndex !== null && cannedQueries && cannedQueries[cycleIndex] === value;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCycleIndex(null);
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const setCycledQuery = (index: number) => {
    if (!cannedQueries || cannedQueries.length === 0) return;
    const query = cannedQueries[index];
    setCycleIndex(index);
    if (controlledValue === undefined) {
      setInternalValue(query);
    }
    onChange?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop keyboard events from bubbling except Tab
    if (e.key !== 'Tab') {
      e.stopPropagation();
    }

    // ArrowUp/Down cycling through canned queries
    if (cannedQueries && cannedQueries.length > 0 && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const isEmpty = !value.trim();
      if (isEmpty || isCycledValue) {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
          const next = cycleIndex === null ? cannedQueries.length - 1 : (cycleIndex - 1 + cannedQueries.length) % cannedQueries.length;
          setCycledQuery(next);
        } else {
          const next = cycleIndex === null ? 0 : (cycleIndex + 1) % cannedQueries.length;
          setCycledQuery(next);
        }
        return;
      }
    }

    // Escape clears input and resets cycle
    if (e.key === 'Escape') {
      setCycleIndex(null);
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onChange?.('');
      return;
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
      setCycleIndex(null);
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
    border: `1px solid ${isFocused ? colors.fg.accent.primary : colors.border.neutral.low}`,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    transition: 'border-color 150ms ease',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 44,
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
      <style>{`textarea[data-drawer-input]::placeholder { color: ${colors.fg.neutral.disabled}; }`}</style>
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
          data-drawer-input
        />

        <div style={controlRowStyle}>
          {/* Left controls - Mic button + cycle hint */}
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
            {isCycledValue && cannedQueries && (
              <span style={{
                fontSize: 11,
                color: colors.fg.neutral.disabled,
                fontFamily: typography.fontFamily.sans,
                whiteSpace: 'nowrap',
              }}>
                {(cycleIndex ?? 0) + 1} of {cannedQueries.length}
              </span>
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
