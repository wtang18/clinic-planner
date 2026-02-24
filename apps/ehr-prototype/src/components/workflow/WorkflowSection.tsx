/**
 * WorkflowSection Component
 *
 * Controlled accordion section for the visit workflow canvas.
 * Supports 4 visual states: not_started, in_progress, complete, skipped.
 *
 * Expand/collapse is controlled from parent (useWorkflowState).
 */

import React, { useState } from 'react';
import { Check, ChevronRight, ChevronDown, Minus } from 'lucide-react';
import type { SectionState } from '../../screens/IntakeView/intakeChecklist';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface WorkflowSectionProps {
  id: string;
  title: string;
  state: SectionState;
  summary?: string;
  onToggle: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  id,
  title,
  state,
  summary,
  onToggle,
  onComplete,
  onSkip,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = state === 'in_progress';
  const isComplete = state === 'complete';
  const isSkipped = state === 'skipped';

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${isExpanded ? colors.border.accent.low : colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    transition: `border-color ${transitions.fast}`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    backgroundColor: isHovered && !isSkipped ? colors.bg.neutral.subtle : 'transparent',
    opacity: isSkipped ? 0.55 : 1,
  };

  // Left icon
  const renderLeftIcon = () => {
    if (isComplete) {
      return (
        <span style={{
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9,
          backgroundColor: colors.fg.positive.primary,
          color: '#fff',
          flexShrink: 0,
        }}>
          <Check size={11} strokeWidth={3} />
        </span>
      );
    }
    if (isSkipped) {
      return (
        <span style={{
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.fg.neutral.spotReadable,
          flexShrink: 0,
        }}>
          <Minus size={14} />
        </span>
      );
    }
    // Spacer for not_started / in_progress — keeps label alignment consistent
    return <span style={{ width: 18, flexShrink: 0 }} />;
  };

  // Label style
  const labelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: isExpanded ? typography.fontWeight.medium : typography.fontWeight.regular,
    color: isSkipped
      ? colors.fg.neutral.spotReadable
      : isExpanded
      ? colors.fg.accent.primary
      : colors.fg.neutral.primary,
  };

  // Right side
  const renderRightSide = () => {
    if (isSkipped) {
      return (
        <span style={{
          fontSize: 12,
          color: colors.fg.neutral.spotReadable,
          fontFamily: typography.fontFamily.sans,
        }}>
          N/A
        </span>
      );
    }

    if (isComplete && summary) {
      return (
        <span style={{
          fontSize: 12,
          color: colors.fg.neutral.secondary,
          fontFamily: typography.fontFamily.sans,
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {summary}
        </span>
      );
    }

    return isExpanded
      ? <ChevronDown size={14} color={colors.fg.neutral.spotReadable} />
      : <ChevronRight size={14} color={colors.fg.neutral.spotReadable} />;
  };

  return (
    <div style={cardStyle} data-testid={`workflow-section-${id}`}>
      <div
        style={headerStyle}
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {renderLeftIcon()}
        <span style={labelStyle}>{title}</span>
        {renderRightSide()}
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div style={{
          padding: `0 ${spaceAround.default}px ${spaceAround.default}px`,
          borderTop: `1px solid ${colors.border.neutral.low}`,
        }}>
          <div style={{ paddingTop: spaceAround.default }}>
            {children}
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: spaceBetween.related,
            marginTop: spaceAround.default,
            justifyContent: 'flex-end',
          }}>
            {onSkip && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSkip(); }}
                style={{
                  padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  color: colors.fg.neutral.secondary,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.neutral.medium}`,
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
            )}
            {onComplete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                style={{
                  padding: `${spaceAround.tight}px ${spaceAround.default}px`,
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: typography.fontWeight.medium,
                  color: '#fff',
                  backgroundColor: colors.fg.accent.primary,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

WorkflowSection.displayName = 'WorkflowSection';
