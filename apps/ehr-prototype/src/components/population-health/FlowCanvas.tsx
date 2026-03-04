/**
 * FlowCanvas Component
 *
 * React Flow-based pathway visualization canvas.
 * Converts PathwayNode[] and PathwayConnection[] into React Flow nodes/edges.
 * Supports multi-pathway rendering with vertical offset and dimming.
 *
 * Replaces the previous manual absolute positioning + SVG overlay approach.
 * React Flow provides built-in pan/zoom, MiniMap, and edge rendering.
 */

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { usePopHealth } from '../../context/PopHealthContext';
import { getPathwaysByCohort, PATHWAYS } from '../../data/mock-population-health';
import { NODE_CARD_WIDTH, NODE_CARD_MIN_HEIGHT, ReactFlowNodeCard } from './NodeCard';
import type { ReactFlowNodeData } from './NodeCard';
import { FilterBar } from './FilterBar';
import type { Pathway } from '../../types/population-health';
import { colors, typography } from '../../styles/foundations';

// ============================================================================
// Layout Constants
// ============================================================================

export const COLUMN_WIDTH = NODE_CARD_WIDTH + 60; // Card width + gap
export const ROW_HEIGHT = NODE_CARD_MIN_HEIGHT + 32; // Card height + vertical gap
const CANVAS_PADDING = 32;

// ============================================================================
// Custom Node Types (module-level — avoids re-registration on every render)
// ============================================================================

const nodeTypes = { nodeCard: ReactFlowNodeCard };

// ============================================================================
// Component
// ============================================================================

export const FlowCanvas: React.FC = () => {
  const { state, dispatch } = usePopHealth();

  // Get pathways to render
  const allPathways = useMemo(() => {
    if (state.selectedCohortId) {
      return getPathwaysByCohort(state.selectedCohortId);
    }
    return PATHWAYS;
  }, [state.selectedCohortId]);

  // If specific pathways selected, show those; otherwise show first
  const activePathways = useMemo(() => {
    if (state.selectedPathwayIds.length > 0) {
      return allPathways.filter((p) => state.selectedPathwayIds.includes(p.id));
    }
    return allPathways.slice(0, 1);
  }, [allPathways, state.selectedPathwayIds]);

  const dimmedPathways = useMemo(() => {
    if (state.selectedPathwayIds.length > 0) {
      return allPathways.filter((p) => !state.selectedPathwayIds.includes(p.id));
    }
    return allPathways.slice(1);
  }, [allPathways, state.selectedPathwayIds]);

  // Node click handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    dispatch({
      type: state.selectedNodeId === nodeId ? 'NODE_DESELECTED' : 'NODE_SELECTED',
      ...(state.selectedNodeId === nodeId ? {} : { nodeId }),
    } as any);
  }, [dispatch, state.selectedNodeId]);

  const handleNodeDetails = useCallback((nodeId: string) => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'node-detail', nodeId } });
  }, [dispatch]);

  // Convert pathway data → React Flow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    const nodes: Node<ReactFlowNodeData>[] = [];
    const edges: Edge[] = [];
    let verticalOffset = 0;

    const processPathway = (pathway: Pathway, dimmed: boolean) => {
      // Convert pathway nodes → React Flow nodes
      for (const pNode of pathway.nodes) {
        const adjustedVerticalPos = pNode.verticalPosition + verticalOffset;

        nodes.push({
          id: pNode.id,
          type: 'nodeCard',
          position: {
            x: CANVAS_PADDING + pNode.columnIndex * COLUMN_WIDTH,
            y: CANVAS_PADDING + adjustedVerticalPos * ROW_HEIGHT,
          },
          data: {
            node: pNode,
            selected: state.selectedNodeId === pNode.id,
            focused: state.selectedNodeId === pNode.id,
            dimmed,
            disabled: pNode.disabled ?? false,
            onClick: () => handleNodeClick(pNode.id),
            onDetailsClick: () => handleNodeDetails(pNode.id),
          },
        });
      }

      // Convert pathway connections → React Flow edges
      for (const conn of pathway.connections) {
        const edgeLabels: string[] = [];
        if (conn.patientCount !== undefined) {
          edgeLabels.push(String(conn.patientCount));
        }
        if (conn.label) {
          edgeLabels.push(conn.label);
        }

        edges.push({
          id: conn.id,
          source: conn.sourceNodeId,
          target: conn.targetNodeId,
          type: 'default',
          style: {
            stroke: colors.border.neutral.low,
            strokeWidth: 1.5,
            opacity: dimmed ? 0.4 : 1,
          },
          label: edgeLabels.length > 0 ? edgeLabels.join(' \u2014 ') : undefined,
          labelStyle: {
            fontSize: 10,
            fill: colors.fg.neutral.secondary,
            fontFamily: typography.fontFamily.sans,
          },
          labelBgStyle: {
            fill: colors.bg.neutral.base,
            fillOpacity: 0.8,
          },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 3,
        });
      }

      // Track max vertical position for offset
      const maxV = pathway.nodes.reduce((m, n) => Math.max(m, n.verticalPosition), 0);
      verticalOffset += maxV + 2; // Gap between pathways
    };

    // Active pathways first
    for (const pathway of activePathways) {
      processPathway(pathway, false);
    }

    // Dimmed pathways below
    for (const pathway of dimmedPathways) {
      processPathway(pathway, true);
    }

    return { flowNodes: nodes, flowEdges: edges };
  }, [activePathways, dimmedPathways, state.selectedNodeId, handleNodeClick, handleNodeDetails]);

  return (
    <div style={canvasStyles.outerContainer} data-testid="flow-canvas">
      {/* Filter bar */}
      <FilterBar />

      {/* React Flow canvas */}
      <div style={canvasStyles.flowContainer}>
        {flowNodes.length > 0 ? (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color={colors.border.neutral.low} gap={20} size={1} />
            <MiniMap
              nodeColor={() => colors.bg.neutral.subtle}
              maskColor="rgba(0, 0, 0, 0.08)"
              style={{ bottom: 12, right: 12 }}
            />
          </ReactFlow>
        ) : (
          <div style={canvasStyles.emptyState}>
            <span style={canvasStyles.emptyText}>No pathways available</span>
          </div>
        )}
      </div>
    </div>
  );
};

FlowCanvas.displayName = 'FlowCanvas';

// ============================================================================
// Styles
// ============================================================================

const canvasStyles: Record<string, React.CSSProperties> = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  flowContainer: {
    flex: 1,
    height: '100%',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
};
