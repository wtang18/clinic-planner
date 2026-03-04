/**
 * FlowCanvas Component
 *
 * Column-grid layout engine for protocol node visualization.
 * Nodes positioned via columnIndex/verticalPosition data.
 * Supports multi-protocol rendering with dimming.
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { getProtocolsByCohort, PROTOCOLS } from '../../data/mock-population-health';
import { NodeCard, NODE_CARD_WIDTH, NODE_CARD_MIN_HEIGHT } from './NodeCard';
import { ConnectionLines } from './ConnectionLines';
import { FilterBar } from './FilterBar';
import type { Protocol, ProtocolNode } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Layout Constants (exported for ConnectionLines)
// ============================================================================

export const COLUMN_WIDTH = NODE_CARD_WIDTH + 60; // Card width + gap
export const ROW_HEIGHT = NODE_CARD_MIN_HEIGHT + 32; // Card height + vertical gap
const CANVAS_PADDING = 32;

// ============================================================================
// Component
// ============================================================================

export const FlowCanvas: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get protocols to render
  const allProtocols = useMemo(() => {
    if (state.selectedCohortId) {
      return getProtocolsByCohort(state.selectedCohortId);
    }
    return PROTOCOLS;
  }, [state.selectedCohortId]);

  // If specific protocols selected, show those; otherwise show all
  const activeProtocols = useMemo(() => {
    if (state.selectedProtocolIds.length > 0) {
      return allProtocols.filter((p) => state.selectedProtocolIds.includes(p.id));
    }
    return allProtocols.slice(0, 1); // Default: show first protocol
  }, [allProtocols, state.selectedProtocolIds]);

  const dimmedProtocols = useMemo(() => {
    if (state.selectedProtocolIds.length > 0) {
      return allProtocols.filter((p) => !state.selectedProtocolIds.includes(p.id));
    }
    return allProtocols.slice(1);
  }, [allProtocols, state.selectedProtocolIds]);

  // Compute layout dimensions
  const layout = useMemo(() => {
    let maxCol = 0;
    let maxRow = 0;
    let verticalOffset = 0;

    const protocolLayouts: Array<{
      protocol: Protocol;
      verticalOffset: number;
      dimmed: boolean;
    }> = [];

    // Active protocols first
    for (const protocol of activeProtocols) {
      protocolLayouts.push({ protocol, verticalOffset, dimmed: false });
      for (const node of protocol.nodes) {
        maxCol = Math.max(maxCol, node.columnIndex);
        maxRow = Math.max(maxRow, node.verticalPosition + verticalOffset);
      }
      // Find max vertical position in this protocol
      const maxV = protocol.nodes.reduce((m, n) => Math.max(m, n.verticalPosition), 0);
      verticalOffset += maxV + 2; // Gap between protocols
    }

    // Dimmed protocols below
    for (const protocol of dimmedProtocols) {
      protocolLayouts.push({ protocol, verticalOffset, dimmed: true });
      for (const node of protocol.nodes) {
        maxCol = Math.max(maxCol, node.columnIndex);
        maxRow = Math.max(maxRow, node.verticalPosition + verticalOffset);
      }
      const maxV = protocol.nodes.reduce((m, n) => Math.max(m, n.verticalPosition), 0);
      verticalOffset += maxV + 2;
    }

    return {
      protocolLayouts,
      width: (maxCol + 1) * COLUMN_WIDTH + CANVAS_PADDING * 2,
      height: (maxRow + 1) * ROW_HEIGHT + CANVAS_PADDING * 2,
    };
  }, [activeProtocols, dimmedProtocols]);

  const handleNodeClick = useCallback((nodeId: string) => {
    dispatch({
      type: state.selectedNodeId === nodeId ? 'NODE_DESELECTED' : 'NODE_SELECTED',
      ...(state.selectedNodeId === nodeId ? {} : { nodeId }),
    } as any);
  }, [dispatch, state.selectedNodeId]);

  const handleNodeDetails = useCallback((nodeId: string) => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'node-detail', nodeId } });
  }, [dispatch]);

  return (
    <div style={canvasStyles.outerContainer} data-testid="flow-canvas">
      {/* Filter bar */}
      <FilterBar />

      {/* Scrollable canvas */}
      <div style={canvasStyles.scrollContainer} ref={scrollRef}>
        <div
          style={{
            position: 'relative',
            width: layout.width,
            minHeight: layout.height,
            padding: CANVAS_PADDING,
          }}
        >
          {/* Render each protocol */}
          {layout.protocolLayouts.map(({ protocol, verticalOffset, dimmed }) => (
            <React.Fragment key={protocol.id}>
              {/* Connection lines (behind nodes) */}
              <ConnectionLines
                connections={protocol.connections}
                nodes={protocol.nodes.map((n) => ({
                  ...n,
                  verticalPosition: n.verticalPosition + verticalOffset,
                }))}
                containerWidth={layout.width}
                containerHeight={layout.height}
              />

              {/* Nodes */}
              {protocol.nodes.map((node) => {
                const adjustedNode: ProtocolNode = {
                  ...node,
                  verticalPosition: node.verticalPosition + verticalOffset,
                };

                return (
                  <div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: CANVAS_PADDING + adjustedNode.columnIndex * COLUMN_WIDTH,
                      top: CANVAS_PADDING + adjustedNode.verticalPosition * ROW_HEIGHT,
                      transition: `left ${transitions.base}, top ${transitions.base}`,
                    }}
                  >
                    <NodeCard
                      node={node}
                      selected={state.selectedNodeId === node.id}
                      focused={state.selectedNodeId === node.id}
                      dimmed={dimmed}
                      disabled={node.disabled}
                      onClick={() => handleNodeClick(node.id)}
                      onDetailsClick={() => handleNodeDetails(node.id)}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {/* Empty state */}
          {layout.protocolLayouts.length === 0 && (
            <div style={canvasStyles.emptyState}>
              <span style={canvasStyles.emptyText}>No protocols available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FlowCanvas.displayName = 'FlowCanvas';

// ============================================================================
// Styles
// ============================================================================

import { transitions } from '../../styles/foundations';

const canvasStyles: Record<string, React.CSSProperties> = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'auto',
    paddingTop: LAYOUT.headerHeight,
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
