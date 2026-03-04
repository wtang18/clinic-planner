/**
 * NodeCard Component
 *
 * Uniform card for all pathway node types on the flow canvas.
 * Differentiates via icon + label + pills (not color).
 */

import React, { useState } from 'react';
import {
  Users,
  Filter,
  GitBranch,
  Zap,
  Clock,
  AlertTriangle,
  BarChart2,
  CornerDownLeft,
} from 'lucide-react';
import type { PathwayNode, NodeType } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Constants
// ============================================================================

export const NODE_CARD_WIDTH = 200;
export const NODE_CARD_MIN_HEIGHT = 72;

const NODE_TYPE_ICONS: Record<NodeType, React.FC<{ size: number }>> = {
  'cohort-source': Users,
  'filter': Filter,
  'branch': GitBranch,
  'action': Zap,
  'wait-monitor': Clock,
  'escalation': AlertTriangle,
  'metric': BarChart2,
  'loop-reference': CornerDownLeft,
};

// ============================================================================
// Types
// ============================================================================

export interface NodeCardProps {
  node: PathwayNode;
  selected?: boolean;
  focused?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDetailsClick?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  selected = false,
  focused = false,
  dimmed = false,
  disabled = false,
  onClick,
  onDetailsClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const Icon = NODE_TYPE_ICONS[node.type];

  const containerStyle: React.CSSProperties = {
    width: NODE_CARD_WIDTH,
    minHeight: NODE_CARD_MIN_HEIGHT,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${selected || focused ? colors.border.accent.low : colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    cursor: disabled ? 'default' : 'pointer',
    opacity: dimmed ? 0.4 : disabled ? 0.5 : 1,
    transition: `all ${transitions.fast}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    position: 'relative',
    boxShadow: selected
      ? `0 0 0 1.5px ${colors.border.accent.low}`
      : '0 1px 3px rgba(0, 0, 0, 0.04)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    color: selected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: 1.3,
  };

  const pillsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  };

  // Anchor point (connection handle) styles
  const anchorStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    [side]: -4,
    transform: 'translateY(-50%)',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colors.bg.neutral.base,
    border: `1.5px solid ${colors.border.neutral.low}`,
    opacity: isHovered ? 1 : 0,
    transition: `opacity ${transitions.fast}`,
    pointerEvents: 'none',
  });

  return (
    <div
      style={containerStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`node-card-${node.id}`}
      role="button"
      tabIndex={disabled ? undefined : 0}
    >
      {/* Anchor points */}
      <div style={anchorStyle('left')} />
      <div style={anchorStyle('right')} />

      {/* Header: icon + label */}
      <div style={headerStyle}>
        <span style={iconStyle}>
          <Icon size={16} />
        </span>
        <span style={labelStyle}>{node.label}</span>
      </div>

      {/* Description */}
      {node.description && (
        <span style={descriptionStyle}>{node.description}</span>
      )}

      {/* Pills */}
      {node.pills.length > 0 && (
        <div style={pillsStyle}>
          {node.pills.map((pill, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                fontFamily: typography.fontFamily.sans,
                fontWeight: typography.fontWeight.medium,
                padding: '1px 6px',
                borderRadius: borderRadius.xs,
                backgroundColor: pill.variant === 'warning'
                  ? colors.bg.attention.subtle
                  : pill.variant === 'info'
                    ? colors.bg.information.subtle
                    : colors.bg.neutral.subtle,
                color: pill.variant === 'warning'
                  ? colors.fg.attention.primary
                  : pill.variant === 'info'
                    ? colors.fg.information.primary
                    : colors.fg.neutral.secondary,
                whiteSpace: 'nowrap',
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      )}

      {/* Inline action bar (on focus) */}
      {focused && onDetailsClick && (
        <div style={{
          position: 'absolute',
          bottom: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDetailsClick(); }}
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.medium,
              color: colors.fg.accent.primary,
              backgroundColor: colors.bg.neutral.base,
              border: `1px solid ${colors.border.neutral.low}`,
              borderRadius: borderRadius.sm,
              padding: '4px 12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              whiteSpace: 'nowrap',
            }}
          >
            Details
          </button>
        </div>
      )}
    </div>
  );
};

NodeCard.displayName = 'NodeCard';
