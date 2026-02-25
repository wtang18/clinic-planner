/**
 * WorkflowSection Component
 *
 * Controlled accordion section for the visit workflow canvas.
 * Supports 4 visual states: not_started, in_progress, complete, skipped.
 *
 * Expand/collapse is controlled from parent (useWorkflowState).
 */

import React, { useState } from 'react';
import { Check, ChevronRight, ChevronDown, Minus, Circle } from 'lucide-react';
import type { SectionState } from '../../screens/IntakeView/intakeChecklist';
import { Button } from '../primitives/Button';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface WorkflowSectionProps {
  id: string;
  title: string;
  state: SectionState;
  isExpanded: boolean;
  summary?: string;
  onToggle: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  /** Content rendered left-aligned in the action row (e.g., unit toggle) */
  footerLeft?: React.ReactNode;
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  id,
  title,
  state,
  isExpanded,
  summary,
  onToggle,
  onComplete,
  onSkip,
  footerLeft,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isComplete = state === 'complete';
  const isSkipped = state === 'skipped';

  // Left icon — outlined circles for incomplete, filled green check for complete
  const renderLeftIcon = () => {
    if (isComplete) {
      return (
        <span style={{
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          backgroundColor: colors.fg.positive.primary,
          color: '#fff',
          flexShrink: 0,
        }}>
          <Check size={10} strokeWidth={3} />
        </span>
      );
    }
    if (isSkipped) {
      return (
        <span style={{
          width: 16,
          height: 16,
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
    // Outlined circle for not_started / in_progress
    return (
      <Circle
        size={16}
        color={state === 'in_progress' ? colors.fg.accent.primary : colors.fg.neutral.spotReadable}
        strokeWidth={1.5}
        style={{ flexShrink: 0 }}
      />
    );
  };

  // Label style — 14px medium, secondary color; accent only when expanded
  const labelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: isSkipped
      ? colors.fg.neutral.spotReadable
      : isExpanded
      ? colors.fg.accent.primary
      : colors.fg.neutral.primary,
  };

  // Right side — summary + chevron for non-skipped; N/A for skipped
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
    return (
      <>
        {!isExpanded && isComplete && summary && (
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
        )}
        {isExpanded
          ? <ChevronDown size={14} color={colors.fg.neutral.spotReadable} />
          : <ChevronRight size={14} color={colors.fg.neutral.spotReadable} />}
      </>
    );
  };

  // Container — card with border matching overview collapsible cards
  const containerStyle: React.CSSProperties = {
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bg.neutral.base,
    overflow: 'hidden',
  };

  // Header — CollapsibleGroup style with persistent subtle background
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    backgroundColor: isHovered && !isSkipped ? colors.bg.neutral.subtle : 'transparent',
    opacity: isSkipped ? 0.55 : 1,
    userSelect: 'none',
  };

  return (
    <div style={containerStyle} data-testid={`workflow-section-${id}`}>
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

      {/* Expandable content — always rendered for smooth CSS transitions */}
      <div style={{
        maxHeight: isExpanded ? 600 : 0,
        opacity: isExpanded ? 1 : 0,
        overflow: 'hidden',
        transition: `max-height ${transitions.base}, opacity ${transitions.fast}`,
      }}>
        <div style={{
          padding: `0 ${spaceAround.default}px ${spaceAround.default}px`,
          borderTop: `1px solid ${colors.border.neutral.low}`,
        }}>
          <div style={{ paddingTop: spaceAround.compact }}>
            {children}
          </div>

          {/* Action row: optional left content + right-aligned buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.related,
            marginTop: spaceAround.default,
          }}>
            {footerLeft}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: spaceBetween.related }}>
              {onSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onSkip(); }}
                >
                  Skip
                </Button>
              )}
              {onComplete && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WorkflowSection.displayName = 'WorkflowSection';
