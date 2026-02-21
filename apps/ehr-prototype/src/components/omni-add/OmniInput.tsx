/**
 * OmniInput — Unified Token Input
 *
 * A single input field with inline pills (token input). Pills represent
 * committed navigation state (category, item). The real <input> sits after
 * the last pill for typing.
 *
 * Layout:
 *   ┌─ Container ────────────────────────────────────────────────┐
 *   │ [+ icon] [Rx](pill) [Benzonatate](pill) |text input      │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Interactions:
 * - Backspace on empty input → delete rightmost pill
 * - Click pill → truncate everything after it
 * - Escape → clear all
 * - Space (depth 0) → commit category if recognized
 * - Focus: `/` or `Cmd+K` (handled by parent)
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Pill } from './omni-input-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface OmniInputProps {
  pills: Pill[];
  text: string;
  onTextChange: (text: string) => void;
  onBackspace: () => void;
  onPillClick: (index: number) => void;
  onClear: () => void;
  onSubmit?: () => void;
  /** Called when Space is pressed at depth 0 with non-empty text */
  onSpace?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const OmniInput: React.FC<OmniInputProps> = ({
  pills,
  text,
  onTextChange,
  onBackspace,
  onPillClick,
  onClear,
  onSubmit,
  onSpace,
  placeholder = 'Add to chart...',
  disabled = false,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [iconHovered, setIconHovered] = useState(false);

  const hasContent = pills.length > 0 || text.length > 0;
  const showClear = hasContent && iconHovered;

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Focus input when clicking the container
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keydown on the hidden input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && text === '') {
        e.preventDefault();
        onBackspace();
      }
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      if (e.key === ' ' && text.trim() && pills.length === 0 && onSpace) {
        e.preventDefault();
        onSpace();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (pills.length > 0 || text) {
          onClear();
        } else {
          inputRef.current?.blur();
        }
      }
    },
    [text, pills.length, onBackspace, onSubmit, onClear, onSpace],
  );

  // Dynamic placeholder based on depth
  const effectivePlaceholder = pills.length === 0
    ? placeholder
    : pills.length === 1
      ? `Search ${pills[0].label}...`
      : 'Type or select...';

  return (
    <div
      style={styles.container}
      onClick={handleContainerClick}
      data-testid="omni-input"
    >
      {/* Leading icon: + or ✕ on hover when there's content */}
      <span
        style={styles.leadingIcon}
        onMouseEnter={() => setIconHovered(true)}
        onMouseLeave={() => setIconHovered(false)}
        onClick={showClear ? (e) => { e.stopPropagation(); onClear(); } : undefined}
        role={showClear ? 'button' : undefined}
        aria-label={showClear ? 'Clear input' : undefined}
      >
        {showClear ? <X size={14} /> : <Plus size={14} />}
      </span>

      {/* Pills */}
      {pills.map((pill, i) => (
        <span
          key={`${pill.type}-${pill.value}`}
          style={{
            ...styles.pill,
            ...(pill.type === 'category' ? styles.categoryPill : styles.itemPill),
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPillClick(i);
          }}
          data-testid={`pill-${pill.type}-${i}`}
          role="button"
          tabIndex={0}
        >
          {pill.label}
        </span>
      ))}

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={effectivePlaceholder}
        style={styles.input}
        disabled={disabled}
        data-testid="omni-input-field"
        autoComplete="off"
        spellCheck={false}
      />

    </div>
  );
};

OmniInput.displayName = 'OmniInput';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    minHeight: 36,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bg.neutral.base,
    cursor: 'text',
    transition: `border-color ${transitions.fast}`,
  },
  leadingIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    color: colors.fg.neutral.spotReadable,
    cursor: 'pointer',
    borderRadius: borderRadius.sm,
    transition: `color ${transitions.fast}`,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `2px ${spaceAround.nudge6}px`,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    userSelect: 'none' as const,
    flexShrink: 0,
    transition: `opacity ${transitions.fast}`,
    lineHeight: '14px',
  },
  categoryPill: {
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
  },
  itemPill: {
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
  },
  input: {
    flex: 1,
    minWidth: 80,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    padding: 0,
    lineHeight: '20px',
  },
};
