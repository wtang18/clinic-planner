/**
 * AIInputArea Component
 *
 * Input area for the AI palette with:
 * - Auto-growing textarea (max 120px in palette, 200px in drawer)
 * - Control row with drawer button + send button
 *
 * Styled to match glassmorphic dark theme.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PanelRight, Send, Mic } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { useAIInputRegistry } from '../../hooks/useAIKeyboardShortcuts';

// ============================================================================
// Types
// ============================================================================

export interface AIInputAreaProps {
  /** Current input value */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when send is clicked or Enter pressed */
  onSend?: (value: string) => void;
  /** Called when drawer button is clicked */
  onOpenDrawer?: () => void;
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
  /** Max height for textarea (120px for palette, 200px for drawer) */
  maxHeight?: number;
  /** Whether to show drawer button */
  showDrawerButton?: boolean;
  /** Whether to show microphone button */
  showMicButton?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AIInputArea: React.FC<AIInputAreaProps> = ({
  value: controlledValue,
  onChange,
  onSend,
  onOpenDrawer,
  onVoiceCommandStart,
  onVoiceCommandEnd,
  isListening = false,
  placeholder = 'Ask AI...',
  disabled = false,
  maxHeight = 120,
  showDrawerButton = true,
  showMicButton = true,
  style,
  testID,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Register with keyboard shortcuts for ⌘K focus
  const inputRegistry = useAIInputRegistry();
  useEffect(() => {
    if (inputRegistry && textareaRef.current) {
      inputRegistry.registerPaletteInput(textareaRef.current);
    }
    return () => {
      if (inputRegistry) {
        inputRegistry.registerPaletteInput(null);
      }
    };
  }, [inputRegistry]);

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Auto-grow textarea - starts at 1 line, grows as needed
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minH = 24; // Single line height (without padding)
      // When empty, force minimum height (fixes initial render issue)
      if (!value || value.length === 0) {
        textarea.style.height = `${minH}px`;
        return;
      }
      // Reset to min to get accurate scrollHeight
      textarea.style.height = `${minH}px`;
      // Only grow, capped at maxHeight
      const newHeight = Math.max(minH, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [maxHeight, value]);

  // Run adjustHeight when value changes
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Also run on mount to ensure correct initial height
  useEffect(() => {
    // Small delay to ensure textarea is fully rendered
    const timer = setTimeout(() => {
      adjustHeight();
    }, 0);
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
    // Stop all keyboard events from bubbling to parent handlers (e.g., AdaptiveLayout shortcuts)
    // EXCEPT Tab for accessibility navigation
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
    padding: spaceAround.compact,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    ...style,
  };

  // Unified input container - contains both textarea and controls
  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    transition: 'border-color 150ms ease, background-color 150ms ease',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 24, // Single line content height
    maxHeight,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: 14,
    lineHeight: '20px', // Consistent line height
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.inversePrimary,
    resize: 'none',
    outline: 'none',
  };

  const controlRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    paddingTop: 0,
  };

  const leftControlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const rightControlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const micButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    border: 'none',
    backgroundColor: isListening ? colors.fg.accent.primary : 'transparent',
    color: isListening ? colors.fg.neutral.inversePrimary : colors.fg.neutral.inversePrimary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : (isListening ? 1 : 0.6),
    transition: 'all 150ms ease',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 0.6,
    transition: 'all 150ms ease',
  };

  const sendButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: value.trim() && !disabled
      ? colors.fg.accent.primary
      : 'transparent',
    opacity: value.trim() && !disabled ? 1 : 0.4,
    borderRadius: borderRadius.full,
  };

  const focusedInputContainerStyle: React.CSSProperties = {
    ...inputContainerStyle,
    borderColor: isFocused ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
    backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Unified input container */}
      <div style={focusedInputContainerStyle}>
        {/* Growing textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={textareaStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Control row - contained within input */}
        <div style={controlRowStyle}>
          {/* Left controls - Mic button */}
          <div style={leftControlsStyle}>
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
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }
                }}
              >
                <Mic size={16} />
              </button>
            )}
          </div>

          {/* Right controls - Drawer + Send */}
          <div style={rightControlsStyle}>
            {/* Drawer button */}
            {showDrawerButton && onOpenDrawer && (
              <button
                type="button"
                style={buttonStyle}
                onClick={onOpenDrawer}
                disabled={disabled}
                title="Open full drawer"
                onMouseEnter={(e) => {
                  if (!disabled) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.opacity = disabled ? '0.4' : '0.6';
                }}
              >
                <PanelRight size={16} />
              </button>
            )}

            {/* Send button */}
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

AIInputArea.displayName = 'AIInputArea';
