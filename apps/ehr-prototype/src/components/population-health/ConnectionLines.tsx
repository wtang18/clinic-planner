/**
 * ConnectionLines Component
 *
 * SVG overlay rendering bezier curves between protocol nodes.
 * Computes paths from node positions + connection data.
 */

import React, { useMemo } from 'react';
import type { ProtocolNode, ProtocolConnection } from '../../types/population-health';
import { NODE_CARD_WIDTH, NODE_CARD_MIN_HEIGHT } from './NodeCard';
import { COLUMN_WIDTH, ROW_HEIGHT } from './FlowCanvas';
import { colors, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ConnectionLinesProps {
  connections: ProtocolConnection[];
  nodes: ProtocolNode[];
  containerWidth: number;
  containerHeight: number;
}

// ============================================================================
// Helpers
// ============================================================================

function getNodeCenter(node: ProtocolNode): { x: number; y: number } {
  return {
    x: node.columnIndex * COLUMN_WIDTH + NODE_CARD_WIDTH / 2,
    y: node.verticalPosition * ROW_HEIGHT + NODE_CARD_MIN_HEIGHT / 2,
  };
}

function getNodeRight(node: ProtocolNode): { x: number; y: number } {
  return {
    x: node.columnIndex * COLUMN_WIDTH + NODE_CARD_WIDTH,
    y: node.verticalPosition * ROW_HEIGHT + NODE_CARD_MIN_HEIGHT / 2,
  };
}

function getNodeLeft(node: ProtocolNode): { x: number; y: number } {
  return {
    x: node.columnIndex * COLUMN_WIDTH,
    y: node.verticalPosition * ROW_HEIGHT + NODE_CARD_MIN_HEIGHT / 2,
  };
}

// ============================================================================
// Component
// ============================================================================

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  nodes,
  containerWidth,
  containerHeight,
}) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, ProtocolNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const paths = useMemo(() => {
    return connections.map((conn) => {
      const source = nodeMap.get(conn.sourceNodeId);
      const target = nodeMap.get(conn.targetNodeId);
      if (!source || !target) return null;

      const start = getNodeRight(source);
      const end = getNodeLeft(target);

      // Horizontal bezier control point offset
      const cpOffset = COLUMN_WIDTH * 0.35;

      const d = `M ${start.x} ${start.y} C ${start.x + cpOffset} ${start.y}, ${end.x - cpOffset} ${end.y}, ${end.x} ${end.y}`;

      // Label midpoint
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      return { conn, d, midX, midY };
    }).filter(Boolean) as Array<{ conn: ProtocolConnection; d: string; midX: number; midY: number }>;
  }, [connections, nodeMap]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerWidth,
        height: containerHeight,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      data-testid="connection-lines"
    >
      {paths.map(({ conn, d, midX, midY }) => (
        <g key={conn.id}>
          <path
            d={d}
            fill="none"
            stroke={colors.border.neutral.low}
            strokeWidth={1.5}
          />
          {/* Patient count label at midpoint */}
          {conn.patientCount !== undefined && (
            <text
              x={midX}
              y={midY - 6}
              textAnchor="middle"
              fill={colors.fg.neutral.secondary}
              fontSize={10}
              fontFamily={typography.fontFamily.sans}
            >
              {conn.patientCount}
            </text>
          )}
          {/* Connection label */}
          {conn.label && (
            <text
              x={midX}
              y={midY + 10}
              textAnchor="middle"
              fill={colors.fg.neutral.spotReadable}
              fontSize={9}
              fontFamily={typography.fontFamily.sans}
            >
              {conn.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

ConnectionLines.displayName = 'ConnectionLines';
