/**
 * FlowCanvas Component
 *
 * React Flow-based pathway visualization canvas.
 * Converts PathwayNode[] and PathwayConnection[] into React Flow nodes/edges.
 * Supports multi-pathway rendering with vertical offset and dimming.
 *
 * Applies lifecycle filters, search query, chip filters, and stream highlighting
 * (connected-node tracing) to determine node/edge visibility.
 *
 * UX enhancements:
 * - Conditional vertical scroll (horizontal-only when content fits vertically)
 * - Horizontal column snapping (debounced snap to column boundary on scroll end)
 * - Column hover highlight (translucent vertical band + column number tooltip)
 * - Tree-to-canvas auto-scroll (smooth pan to selected node's column)
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  PanOnScrollMode,
} from '@xyflow/react';
import type { Node, Edge, Viewport } from '@xyflow/react';
import { usePopHealth } from '../../context/PopHealthContext';
import { getPathwaysByCohort, PATHWAYS } from '../../data/mock-population-health';
import { NODE_CARD_WIDTH, NODE_CARD_MIN_HEIGHT, ReactFlowNodeCard } from './NodeCard';
import type { ReactFlowNodeData } from './NodeCard';
import type { Pathway, PathwayNode, PathwayConnection, PopHealthFilter } from '../../types/population-health';
import { colors, typography } from '../../styles/foundations';
import { injectReactFlowStyles } from './react-flow-styles';

// Inject React Flow CSS once (avoids bare CSS import incompatible with Metro)
injectReactFlowStyles();

// ============================================================================
// Layout Constants
// ============================================================================

export const COLUMN_WIDTH = NODE_CARD_WIDTH + 60; // Card width + gap
export const ROW_HEIGHT = NODE_CARD_MIN_HEIGHT + 32; // Card height + vertical gap
export const CANVAS_PADDING = 32;
const NODE_CENTER_OFFSET = (COLUMN_WIDTH - NODE_CARD_WIDTH) / 2; // 30px — centers node within column
const COLUMN_HEADER_HEIGHT = 24; // Reserved strip for column number labels

// ============================================================================
// Custom Node Types (module-level — avoids re-registration on every render)
// ============================================================================

const nodeTypes = { nodeCard: ReactFlowNodeCard };

// ============================================================================
// Stream Highlighting — Connected Node Tracing
// ============================================================================

/**
 * BFS traversal to find all nodes connected to nodeId (upstream + downstream).
 * Returns the set of node IDs reachable from nodeId in either direction.
 */
function getConnectedNodeIds(
  nodeId: string,
  connections: PathwayConnection[],
): Set<string> {
  const connected = new Set<string>([nodeId]);

  // Build adjacency maps
  const forwardMap = new Map<string, string[]>(); // source → targets
  const backwardMap = new Map<string, string[]>(); // target → sources
  for (const conn of connections) {
    const fwd = forwardMap.get(conn.sourceNodeId) ?? [];
    fwd.push(conn.targetNodeId);
    forwardMap.set(conn.sourceNodeId, fwd);

    const bwd = backwardMap.get(conn.targetNodeId) ?? [];
    bwd.push(conn.sourceNodeId);
    backwardMap.set(conn.targetNodeId, bwd);
  }

  // BFS forward (downstream)
  const fwdQueue = [nodeId];
  while (fwdQueue.length > 0) {
    const current = fwdQueue.shift()!;
    for (const next of forwardMap.get(current) ?? []) {
      if (!connected.has(next)) {
        connected.add(next);
        fwdQueue.push(next);
      }
    }
  }

  // BFS backward (upstream)
  const bwdQueue = [nodeId];
  while (bwdQueue.length > 0) {
    const current = bwdQueue.shift()!;
    for (const prev of backwardMap.get(current) ?? []) {
      if (!connected.has(prev)) {
        connected.add(prev);
        bwdQueue.push(prev);
      }
    }
  }

  return connected;
}

// ============================================================================
// Node Visibility
// ============================================================================

type NodeVisibility = 'visible' | 'dimmed';

function computeNodeVisibility(
  node: PathwayNode,
  lifecycleFilter: string[],
  searchQuery: string,
  chipFilters: PopHealthFilter[],
  connectedSet: Set<string> | null,
): NodeVisibility {
  // Lifecycle filter: if filter active and node doesn't match → dimmed
  if (lifecycleFilter.length > 0 && !lifecycleFilter.includes(node.lifecycleState)) {
    return 'dimmed';
  }

  // Search query: case-insensitive includes on label
  if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
    return 'dimmed';
  }

  // Chip filters: check applicable filters
  for (const filter of chipFilters) {
    if (filter.category === 'lifecycle-state') {
      // Already handled above via lifecycleFilter
      continue;
    }
    if (filter.category === 'status') {
      // Status filters apply to node lifecycle/disabled state
      if (filter.field === 'status' && filter.operator === 'eq') {
        if (node.lifecycleState !== filter.value) return 'dimmed';
      }
    }
    // Other filter categories pass through (not applicable to nodes directly)
  }

  // Stream highlighting: if a node is selected and this node is not in connected set → dimmed
  if (connectedSet && !connectedSet.has(node.id)) {
    return 'dimmed';
  }

  return 'visible';
}

// ============================================================================
// FlowCanvas — outer shell with ReactFlowProvider
// ============================================================================

export const FlowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
};

FlowCanvas.displayName = 'FlowCanvas';

// ============================================================================
// FlowCanvasInner — all logic, rendered inside ReactFlowProvider
// ============================================================================

const FlowCanvasInner: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const rf = useReactFlow();

  // ---- Viewport & snap state ----
  const [currentViewport, setCurrentViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasClickRef = useRef<string | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Clean up snap timer on unmount
  useEffect(() => {
    return () => {
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, []);

  // ---- Container height measurement ----
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      setContainerHeight(node.clientHeight);
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

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
    canvasClickRef.current = nodeId;
    dispatch({
      type: state.selectedNodeId === nodeId ? 'NODE_DESELECTED' : 'NODE_SELECTED',
      ...(state.selectedNodeId === nodeId ? {} : { nodeId }),
    } as any);
  }, [dispatch, state.selectedNodeId]);

  const handleNodeDetails = useCallback((nodeId: string) => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'node-detail', nodeId } });
  }, [dispatch]);

  // Compute connected node set for stream highlighting
  const connectedNodeSet = useMemo<Set<string> | null>(() => {
    if (!state.selectedNodeId) return null;
    // Find connections from all active pathways that contain the selected node
    for (const pathway of activePathways) {
      if (pathway.nodes.some((n) => n.id === state.selectedNodeId)) {
        return getConnectedNodeIds(state.selectedNodeId, pathway.connections);
      }
    }
    return null;
  }, [state.selectedNodeId, activePathways]);

  // Convert pathway data → React Flow nodes and edges, plus layout metrics
  const { flowNodes, flowEdges, maxColumnIndex, maxVerticalPosition } = useMemo(() => {
    const nodes: Node<ReactFlowNodeData>[] = [];
    const edges: Edge[] = [];
    let verticalOffset = 0;
    let maxCol = 0;
    let maxVert = 0;

    const processPathway = (pathway: Pathway, pathwayDimmed: boolean) => {
      // Convert pathway nodes → React Flow nodes
      for (const pNode of pathway.nodes) {
        const visibility = pathwayDimmed
          ? 'dimmed'
          : computeNodeVisibility(
              pNode,
              state.lifecycleFilter,
              state.searchQuery,
              state.filters,
              connectedNodeSet,
            );
        const isDimmed = visibility === 'dimmed';
        const adjustedVerticalPos = pNode.verticalPosition + verticalOffset;

        // Track layout extents
        if (pNode.columnIndex > maxCol) maxCol = pNode.columnIndex;
        if (adjustedVerticalPos > maxVert) maxVert = adjustedVerticalPos;

        // Search match highlighting: accent border when search matches
        const isSearchMatch = state.searchQuery.length > 0
          && pNode.label.toLowerCase().includes(state.searchQuery.toLowerCase());

        nodes.push({
          id: pNode.id,
          type: 'nodeCard',
          position: {
            x: CANVAS_PADDING + pNode.columnIndex * COLUMN_WIDTH + NODE_CENTER_OFFSET,
            y: CANVAS_PADDING + COLUMN_HEADER_HEIGHT + adjustedVerticalPos * ROW_HEIGHT,
          },
          // Selected node floats above all siblings (RF applies zIndex to its wrapper div)
          zIndex: state.selectedNodeId === pNode.id ? 1000 : undefined,
          data: {
            node: pNode,
            selected: state.selectedNodeId === pNode.id,
            focused: state.selectedNodeId === pNode.id || (isSearchMatch && !isDimmed),
            dimmed: isDimmed,
            disabled: pNode.disabled ?? false,
            onClick: () => handleNodeClick(pNode.id),
            onDetailsClick: () => handleNodeDetails(pNode.id),
          },
        });
      }

      // Build set of dimmed node IDs for edge dimming
      const dimmedNodeIds = new Set<string>();
      for (const pNode of pathway.nodes) {
        if (pathwayDimmed) {
          dimmedNodeIds.add(pNode.id);
        } else {
          const vis = computeNodeVisibility(
            pNode,
            state.lifecycleFilter,
            state.searchQuery,
            state.filters,
            connectedNodeSet,
          );
          if (vis === 'dimmed') dimmedNodeIds.add(pNode.id);
        }
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

        const edgeDimmed = dimmedNodeIds.has(conn.sourceNodeId) || dimmedNodeIds.has(conn.targetNodeId);
        // Stream highlighting: connected edges get accent color
        const isConnectedEdge = connectedNodeSet
          && connectedNodeSet.has(conn.sourceNodeId)
          && connectedNodeSet.has(conn.targetNodeId);

        edges.push({
          id: conn.id,
          source: conn.sourceNodeId,
          target: conn.targetNodeId,
          type: 'default',
          style: {
            stroke: isConnectedEdge ? colors.fg.accent.primary : colors.border.neutral.low,
            strokeWidth: isConnectedEdge ? 2 : 1.5,
            opacity: edgeDimmed ? 0.25 : 1,
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

    return { flowNodes: nodes, flowEdges: edges, maxColumnIndex: maxCol, maxVerticalPosition: maxVert };
  }, [activePathways, dimmedPathways, state.selectedNodeId, state.lifecycleFilter, state.searchQuery, state.filters, connectedNodeSet, handleNodeClick, handleNodeDetails]);

  // ---- Enhancement 2: Conditional vertical scroll ----
  const contentHeight = (maxVerticalPosition + 1) * ROW_HEIGHT + 2 * CANVAS_PADDING + COLUMN_HEADER_HEIGHT;
  const panScrollMode = contentHeight > containerHeight
    ? PanOnScrollMode.Free
    : PanOnScrollMode.Horizontal;

  // ---- Enhancement 3: Horizontal column snapping ----
  const snapToColumn = useCallback((viewport: Viewport) => {
    const rawColumn = -(viewport.x - CANVAS_PADDING) / COLUMN_WIDTH;
    const snappedColumn = Math.max(0, Math.round(rawColumn));
    const targetX = -(snappedColumn * COLUMN_WIDTH) + CANVAS_PADDING;
    const clampedX = Math.min(CANVAS_PADDING, targetX);
    if (Math.abs(clampedX - viewport.x) < 2) return; // avoid jitter
    rf.setViewport({ x: clampedX, y: viewport.y, zoom: 1 }, { duration: 200 });
  }, [rf]);

  const handleMove = useCallback((_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    setCurrentViewport(viewport);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
  }, []);

  const handleMoveEnd = useCallback((event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    if (!event) return; // programmatic move (snap or auto-scroll) — don't re-snap
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => snapToColumn(viewport), 150);
  }, [snapToColumn]);

  // ---- Enhancement 4: Column hover highlight ----
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const flowX = e.clientX - rect.left - currentViewport.x;
    const col = Math.floor((flowX - CANVAS_PADDING) / COLUMN_WIDTH);
    setHoveredColumn(col >= 0 && col <= maxColumnIndex ? col : null);
  }, [currentViewport.x, maxColumnIndex]);

  const handleMouseLeave = useCallback(() => {
    setHoveredColumn(null);
  }, []);

  // ---- Enhancement 5: Tree-to-canvas auto-scroll ----
  useEffect(() => {
    if (!state.selectedNodeId) return;
    // Skip canvas-initiated selections
    if (canvasClickRef.current === state.selectedNodeId) {
      canvasClickRef.current = null;
      return;
    }
    canvasClickRef.current = null;

    // Find selected node's flow position
    const node = flowNodes.find(n => n.id === state.selectedNodeId);
    if (!node) return;

    // Target: node in 2nd column slot (1 column offset from left + padding)
    const targetX = -(node.position.x - COLUMN_WIDTH - CANVAS_PADDING);
    const clampedX = Math.min(CANVAS_PADDING, targetX);

    // Vertical: center node in viewport
    const targetY = -(node.position.y - containerHeight / 2 + NODE_CARD_MIN_HEIGHT / 2);
    const clampedY = Math.min(0, targetY);

    rf.setViewport({ x: clampedX, y: clampedY, zoom: 1 }, { duration: 250 });
  }, [state.selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={canvasStyles.outerContainer} data-testid="flow-canvas">
      {/* React Flow canvas */}
      <div
        ref={containerRef}
        style={canvasStyles.flowContainer}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Column hover highlight overlay — z-index 0 so nodes/edges render on top */}
        {hoveredColumn !== null && (
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: CANVAS_PADDING + hoveredColumn * COLUMN_WIDTH + currentViewport.x,
            width: COLUMN_WIDTH,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 150ms ease',
          }}>
            <span style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              opacity: 0.6,
              color: colors.fg.neutral.spotReadable,
              fontFamily: typography.fontFamily.sans,
            }}>
              {hoveredColumn + 1}
            </span>
          </div>
        )}

        {flowNodes.length > 0 ? (
          <div style={canvasStyles.rfWrapper}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            minZoom={1}
            maxZoom={1}
            panOnDrag={false}
            panOnScroll={true}
            panOnScrollMode={panScrollMode}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            onNodeClick={(_event, node) => handleNodeClick(node.id)}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
            proOptions={{ hideAttribution: true }}
          >
            <Background color={colors.border.neutral.low} gap={20} size={1} />
          </ReactFlow>
          </div>
        ) : (
          <div style={canvasStyles.emptyState}>
            <span style={canvasStyles.emptyText}>No pathways available</span>
          </div>
        )}
      </div>
    </div>
  );
};

FlowCanvasInner.displayName = 'FlowCanvasInner';

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
    position: 'relative',
  },
  rfWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 1, // Above column overlay (z-index 0) so nodes/edges render on top
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
