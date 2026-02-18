/**
 * NarrativeInput Component
 *
 * Text entry for narrative chart item categories (CC, HPI, ROS, PE, Plan, Instruction, Note).
 * AI-primary categories show a hint that AI will generate content from ambient recording.
 * Manual-only categories (Note) show a simple text area.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ItemCategory } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Button } from '../primitives/Button';

export interface NarrativeInputProps {
  category: ItemCategory;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  /** Initial text (for editing) */
  initialText?: string;
  autoFocus?: boolean;
}

/** Categories where AI is the primary input (OmniAdd is secondary/manual) */
const AI_PRIMARY_CATEGORIES: ItemCategory[] = [
  'chief-complaint', 'hpi', 'ros', 'physical-exam', 'plan', 'instruction',
];

const CATEGORY_LABELS: Record<string, string> = {
  'chief-complaint': 'Chief Complaint',
  'hpi': 'History of Present Illness',
  'ros': 'Review of Systems',
  'physical-exam': 'Physical Exam',
  'plan': 'Plan',
  'instruction': 'Patient Instructions',
  'note': 'Clinical Note',
};

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  'chief-complaint': 'e.g., Cough x 5 days, worse at night',
  'hpi': 'Describe the history of present illness...',
  'ros': 'Review of systems findings...',
  'physical-exam': 'Physical exam findings...',
  'plan': 'Treatment plan...',
  'instruction': 'Patient instructions...',
  'note': 'Clinical note, coordination note, or addendum...',
};

export const NarrativeInput: React.FC<NarrativeInputProps> = ({
  category,
  onSubmit,
  onCancel,
  initialText = '',
  autoFocus = true,
}) => {
  const [text, setText] = React.useState(initialText);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isAIPrimary = AI_PRIMARY_CATEGORIES.includes(category);
  const label = CATEGORY_LABELS[category] || category;
  const placeholder = CATEGORY_PLACEHOLDERS[category] || 'Enter text...';

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  };

  const hintStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    padding: `${spaceAround.tight}px 0`,
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 80,
    maxHeight: 200,
    padding: spaceAround.compact,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderRadius: borderRadius.sm,
    resize: 'vertical',
    outline: 'none',
    transition: `border-color ${transitions.fast}`,
    lineHeight: 1.5,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const shortcutHintStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.disabled,
  };

  return (
    <div style={containerStyle} data-testid="narrative-input">
      {isAIPrimary && (
        <div style={hintStyle}>
          <Sparkles size={12} color={colors.fg.accent.primary} />
          <span>AI typically generates {label.toLowerCase()} from ambient recording. Use this for manual entry.</span>
        </div>
      )}

      <textarea
        ref={textareaRef}
        style={textareaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={`Enter ${label.toLowerCase()}`}
        data-testid="narrative-textarea"
      />

      <div style={actionsStyle}>
        <span style={shortcutHintStyle}>
          {navigator.platform.includes('Mac') ? '\u2318' : 'Ctrl'}+Enter to add
        </span>
        <div style={{ display: 'flex', gap: spaceBetween.repeating }}>
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="narrative-cancel">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!text.trim()}
            data-testid="narrative-submit"
          >
            Add {label}
          </Button>
        </div>
      </div>
    </div>
  );
};

NarrativeInput.displayName = 'NarrativeInput';
