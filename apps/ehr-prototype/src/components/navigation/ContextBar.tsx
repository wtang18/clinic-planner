/**
 * ContextBar Component
 *
 * Navigation context bar that appears when navigating from To-Do → Patient workspace.
 * Shows source filter, current item title, and navigation controls.
 *
 * Visual design:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ← Chart Review (3 remaining)  │  Call Patient: Lab...  │ Next → │ ✕ │
 * └──────────────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ContextBarProps {
  /** Source filter name (e.g., "Chart Review") */
  sourceFilter: string;
  /** Source category ID (e.g., "tasks") */
  sourceCategoryId: string;
  /** Remaining items in filtered list */
  remainingCount: number;
  /** Current task/item title */
  currentTaskTitle: string;
  /** Whether there's a next item */
  hasNext: boolean;
  /** Called when "Return to list" is clicked */
  onReturn: () => void;
  /** Called when "Next" is clicked */
  onNext: () => void;
  /** Called when dismiss (X) is clicked */
  onDismiss: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ContextBar: React.FC<ContextBarProps> = ({
  sourceFilter,
  sourceCategoryId,
  remainingCount,
  currentTaskTitle,
  hasNext,
  onReturn,
  onNext,
  onDismiss,
  style,
  testID,
}) => {
  const [isReturnHovered, setIsReturnHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [isDismissHovered, setIsDismissHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.accent.subtle,
    borderBottom: `1px solid ${colors.border.accent.low}`,
    minHeight: 44,
    ...style,
  };

  const returnButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: isReturnHovered ? colors.bg.accent.medium : 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    flexShrink: 0,
  };

  const returnTextStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
  };

  const countBadgeStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.accent.secondary,
    marginLeft: spaceBetween.relatedCompact,
  };

  const separatorStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    backgroundColor: colors.border.accent.low,
    flexShrink: 0,
  };

  const titleContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0, // Allow text truncation
    overflow: 'hidden',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const nextButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: isNextHovered && hasNext ? colors.bg.accent.medium : 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: hasNext ? 'pointer' : 'default',
    transition: `background-color ${transitions.fast}`,
    opacity: hasNext ? 1 : 0.4,
    flexShrink: 0,
  };

  const nextTextStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
  };

  const dismissButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: isDismissHovered ? colors.bg.neutral.medium : 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    flexShrink: 0,
    marginLeft: spaceBetween.relatedCompact,
  };

  // Build the remaining count text
  const remainingText = remainingCount === 0
    ? '(All done!)'
    : remainingCount === 1
    ? '(1 remaining)'
    : `(${remainingCount} remaining)`;

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Return to list button */}
      <button
        type="button"
        style={returnButtonStyle}
        onClick={onReturn}
        onMouseEnter={() => setIsReturnHovered(true)}
        onMouseLeave={() => setIsReturnHovered(false)}
        aria-label={`Return to ${sourceFilter}`}
      >
        <ArrowLeft size={14} color={colors.fg.accent.primary} />
        <span style={returnTextStyle}>{sourceFilter}</span>
        <span style={countBadgeStyle}>{remainingText}</span>
      </button>

      {/* Separator */}
      <div style={separatorStyle} aria-hidden="true" />

      {/* Current task title */}
      <div style={titleContainerStyle}>
        <span style={titleStyle} title={currentTaskTitle}>
          {currentTaskTitle}
        </span>
      </div>

      {/* Separator */}
      <div style={separatorStyle} aria-hidden="true" />

      {/* Next button */}
      <button
        type="button"
        style={nextButtonStyle}
        onClick={() => hasNext && onNext()}
        onMouseEnter={() => setIsNextHovered(true)}
        onMouseLeave={() => setIsNextHovered(false)}
        disabled={!hasNext}
        aria-label="Next item"
      >
        <span style={nextTextStyle}>Next</span>
        <ArrowRight size={14} color={colors.fg.accent.primary} />
      </button>

      {/* Dismiss button */}
      <button
        type="button"
        style={dismissButtonStyle}
        onClick={onDismiss}
        onMouseEnter={() => setIsDismissHovered(true)}
        onMouseLeave={() => setIsDismissHovered(false)}
        aria-label="Dismiss context bar"
      >
        <X size={14} color={colors.fg.neutral.secondary} />
      </button>
    </div>
  );
};

ContextBar.displayName = 'ContextBar';
