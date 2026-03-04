/**
 * ScopeReturnBar Component
 *
 * Canvas top bar affordance for returning to the previous scope after drill-through.
 * Shown when the scope stack has depth > 1 (e.g., navigated from cohort → patient).
 *
 * Placement: Top of canvas content (same slot/position as ContextBar).
 * ScopeReturnBar takes precedence over ContextBar when both apply.
 *
 * Visual:
 * ┌──────────────────────────────────────────────────────┐
 * │  ← Diabetes T2                                       │
 * └──────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ScopeReturnBarProps {
  /** Label from the origin scope (e.g., "Diabetes T2") */
  originLabel: string;
  /** Called when back arrow or label is clicked */
  onReturn: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ScopeReturnBar: React.FC<ScopeReturnBarProps> = ({
  originLabel,
  onReturn,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    minHeight: 36,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    backgroundColor: isHovered ? colors.bg.neutral.subtle : 'transparent',
    flexShrink: 0,
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    lineHeight: 1.3,
  };

  return (
    <div
      style={containerStyle}
      onClick={onReturn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testID}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onReturn();
        }
      }}
      aria-label={`Return to ${originLabel}`}
    >
      <div style={contentStyle}>
        <ArrowLeft size={16} color={colors.fg.accent.primary} />
        <span style={labelStyle}>{originLabel}</span>
      </div>
    </div>
  );
};

ScopeReturnBar.displayName = 'ScopeReturnBar';
