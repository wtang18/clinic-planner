/**
 * NodeCard Component
 *
 * Uniform card for all pathway node types on the flow canvas.
 * Differentiates via icon + label + pills (not color).
 *
 * Also exports ReactFlowNodeCard — a wrapper for use as a React Flow
 * custom node type. It extracts React Flow's `data` prop and forwards
 * the fields to NodeCard.
 *
 * Lifecycle state visual treatments (Decision #28, #29):
 * - Active: normal appearance
 * - Paused: orange left border + slight opacity reduction
 * - Draft: dashed border + reduced opacity + "(draft)" label
 *
 * Selected/focus expansion:
 * - Connection handles persistently visible
 * - Title wraps (no truncation)
 * - Lifecycle state badge shown
 * - Description revealed
 * - Elevated z-index (in-place expand, floats above siblings)
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
  ChevronRight,
} from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { PathwayNode, NodeType } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Constants
// ============================================================================

export const NODE_CARD_WIDTH = 200;
export const NODE_CARD_MIN_HEIGHT = 72;

// Lifecycle state → display label + color for the expanded badge
const LIFECYCLE_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  active: { label: 'Active', bg: colors.bg.positive.subtle, fg: colors.fg.positive.primary },
  paused: { label: 'Paused', bg: colors.bg.attention.subtle, fg: colors.fg.attention.primary },
  draft: { label: 'Draft', bg: colors.bg.neutral.subtle, fg: colors.fg.neutral.secondary },
  'needs-review': { label: 'Needs Review', bg: colors.bg.attention.subtle, fg: colors.fg.attention.primary },
  test: { label: 'Test', bg: colors.bg.information.subtle, fg: colors.fg.information.primary },
  archived: { label: 'Archived', bg: colors.bg.neutral.subtle, fg: colors.fg.neutral.spotReadable },
  error: { label: 'Error', bg: colors.bg.alert.subtle, fg: colors.fg.alert.primary },
};

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

/** Data shape passed through React Flow's node.data */
export interface ReactFlowNodeData {
  node: PathwayNode;
  selected: boolean;
  focused: boolean;
  dimmed: boolean;
  disabled: boolean;
  onClick: () => void;
  onDetailsClick: () => void;
  [key: string]: unknown;
}

// ============================================================================
// Handle Styles
// ============================================================================

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  backgroundColor: colors.bg.neutral.base,
  border: `1.5px solid ${colors.border.neutral.low}`,
};

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
  const [isChevronHovered, setIsChevronHovered] = useState(false);

  const Icon = NODE_TYPE_ICONS[node.type];
  const isPaused = node.lifecycleState === 'paused';
  const isDraft = node.lifecycleState === 'draft';

  // Lifecycle-dependent opacity
  const computedOpacity = dimmed ? 0.4 : isDraft ? 0.7 : isPaused ? 0.85 : disabled ? 0.5 : 1;

  const containerStyle: React.CSSProperties = {
    width: NODE_CARD_WIDTH,
    minHeight: NODE_CARD_MIN_HEIGHT,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.base,
    border: `1px ${isDraft ? 'dashed' : 'solid'} ${selected || focused ? colors.border.accent.low : colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    cursor: disabled ? 'default' : 'pointer',
    opacity: computedOpacity,
    transition: `all ${transitions.fast}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    position: 'relative',
    boxShadow: selected
      ? `0 0 0 1.5px ${colors.border.accent.low}, 0 4px 12px rgba(0, 0, 0, 0.08)`
      : '0 1px 3px rgba(0, 0, 0, 0.04)',
    // Paused: orange left border
    ...(isPaused ? { borderLeft: `3px solid ${colors.fg.attention.primary}` } : {}),
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
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
    // Selected: allow wrapping to show full title
    ...(selected
      ? { lineHeight: 1.3 }
      : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
    ),
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
      {/* React Flow handles — visible on hover or when selected */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          ...handleStyle,
          opacity: isHovered || selected ? 1 : 0,
          transition: `opacity ${transitions.fast}`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          opacity: isHovered || selected ? 1 : 0,
          transition: `opacity ${transitions.fast}`,
        }}
      />

      {/* Header: icon + label + details chevron */}
      <div style={headerStyle}>
        <span style={iconStyle}>
          <Icon size={16} />
        </span>
        <span style={labelStyle}>
          {node.label}
          {isDraft && (
            <span style={{
              fontSize: 11,
              fontWeight: typography.fontWeight.regular,
              color: colors.fg.neutral.secondary,
              marginLeft: 4,
            }}>
              (draft)
            </span>
          )}
        </span>
        {/* Always-visible chevron for details (Decision #34) */}
        {onDetailsClick && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDetailsClick(); }}
            onMouseEnter={() => setIsChevronHovered(true)}
            onMouseLeave={() => setIsChevronHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: 'none',
              backgroundColor: isChevronHovered ? colors.bg.neutral.subtle : 'transparent',
              cursor: 'pointer',
              color: colors.fg.neutral.spotReadable,
              padding: 0,
              flexShrink: 0,
              margin: '-2px -4px 0 0',
              borderRadius: borderRadius.full,
              transition: `background-color ${transitions.fast}`,
            }}
            aria-label={`View details for ${node.label}`}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Description — always if present */}
      {node.description && (
        <span style={descriptionStyle}>{node.description}</span>
      )}

      {/* Pills — unified row: lifecycle badge + flow state + node pills when selected,
          just node pills when collapsed */}
      {(selected || node.pills.length > 0) && (
        <div style={pillsStyle}>
          {/* Lifecycle state badge (selected only) */}
          {selected && (() => {
            const badge = LIFECYCLE_BADGE[node.lifecycleState];
            if (!badge) return null;
            return (
              <span style={{
                fontSize: 10,
                fontFamily: typography.fontFamily.sans,
                fontWeight: typography.fontWeight.medium,
                padding: '1px 6px',
                borderRadius: borderRadius.xs,
                backgroundColor: badge.bg,
                color: badge.fg,
                whiteSpace: 'nowrap',
              }}>
                {badge.label}
              </span>
            );
          })()}
          {/* Flow state pills (selected only) */}
          {selected && node.flowState && (() => {
            const pills: Array<{ label: string; variant?: 'info' | 'warning' }> = [];
            const { atStage, throughput } = node.flowState;
            if (atStage.waiting > 0) pills.push({ label: `${atStage.waiting} waiting`, variant: 'info' });
            if (atStage.inProgress > 0) pills.push({ label: `${atStage.inProgress} in progress` });
            if (atStage.error > 0) pills.push({ label: `${atStage.error} error`, variant: 'warning' });
            if (throughput?.avgDaysInStage != null) pills.push({ label: `avg ${throughput.avgDaysInStage}d` });
            return pills.map((p, i) => (
              <span
                key={`flow-${i}`}
                style={{
                  fontSize: 10,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: typography.fontWeight.medium,
                  padding: '1px 6px',
                  borderRadius: borderRadius.xs,
                  backgroundColor: p.variant === 'warning'
                    ? colors.bg.attention.subtle
                    : p.variant === 'info'
                      ? colors.bg.information.subtle
                      : colors.bg.neutral.subtle,
                  color: p.variant === 'warning'
                    ? colors.fg.attention.primary
                    : p.variant === 'info'
                      ? colors.fg.information.primary
                      : colors.fg.neutral.secondary,
                }}
              >
                {p.label}
              </span>
            ));
          })()}
          {/* Node pills */}
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
                ...(selected ? {} : { whiteSpace: 'nowrap' as const }),
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

NodeCard.displayName = 'NodeCard';

// ============================================================================
// React Flow Custom Node Wrapper
// ============================================================================

/**
 * ReactFlowNodeCard wraps NodeCard for use as a React Flow custom node type.
 * React Flow passes all custom data via the `data` prop, which this wrapper
 * destructures and forwards to NodeCard.
 */
type NodeCardNode = Node<ReactFlowNodeData, 'nodeCard'>;

export const ReactFlowNodeCard: React.FC<NodeProps<NodeCardNode>> = ({ data }) => {
  return (
    <NodeCard
      node={data.node}
      selected={data.selected}
      focused={data.focused}
      dimmed={data.dimmed}
      disabled={data.disabled}
      onClick={data.onClick}
      onDetailsClick={data.onDetailsClick}
    />
  );
};

ReactFlowNodeCard.displayName = 'ReactFlowNodeCard';
