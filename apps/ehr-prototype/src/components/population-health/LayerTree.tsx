/**
 * LayerTree Component
 *
 * Figma-style nested hierarchy of pathway → nodes with branch-only indentation.
 * Sequential nodes render at the same indent level. Only children of branch
 * nodes get indented, reflecting the actual flow structure.
 *
 * Single-click selects a layer; shift-click multi-selects pathways.
 * Inline stats per row: patient count, gap count dots (right-aligned).
 * Lifecycle state indicators: active (none), paused (Pause icon), draft (dashed border + label).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronRight,
  Users,
  Filter,
  GitBranch,
  Zap,
  Clock,
  AlertTriangle,
  BarChart2,
  CornerDownLeft,
  Circle,
  Play,
  Pause,
} from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { getPathwaysByCohort, PATHWAYS } from '../../data/mock-population-health';
import type { PathwayNode, NodeType, Pathway, NodeLifecycleState } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Node Type Icons
// ============================================================================

const NODE_TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  'cohort-source': <Users size={12} />,
  'filter': <Filter size={12} />,
  'branch': <GitBranch size={12} />,
  'action': <Zap size={12} />,
  'wait-monitor': <Clock size={12} />,
  'escalation': <AlertTriangle size={12} />,
  'metric': <BarChart2 size={12} />,
  'loop-reference': <CornerDownLeft size={12} />,
};

// ============================================================================
// Branch-Only Indentation Helper
// ============================================================================

/** Flat node entry with computed indent depth based on branch parentage */
interface FlatNodeEntry {
  node: PathwayNode;
  depth: number;
  isBranchChild: boolean;
}

/**
 * Computes a flat list of nodes with branch-only indentation.
 * - Sequential (non-branch) connections: child stays at parent's depth
 * - Branch connections: each target gets depth + 1
 *
 * Traverses from the first node (cohort-source) using BFS over connections.
 */
function computeBranchIndentation(pathway: Pathway): FlatNodeEntry[] {
  if (pathway.nodes.length === 0) return [];

  const depthMap = new Map<string, number>();
  const branchChildSet = new Set<string>();

  // Build adjacency from connections
  const childrenOf = new Map<string, string[]>();
  for (const conn of pathway.connections) {
    const existing = childrenOf.get(conn.sourceNodeId) ?? [];
    existing.push(conn.targetNodeId);
    childrenOf.set(conn.sourceNodeId, existing);
  }

  // Find branch node IDs
  const branchNodeIds = new Set(
    pathway.nodes.filter((n) => n.type === 'branch').map((n) => n.id)
  );

  // BFS from root nodes (nodes with no incoming connections)
  const hasIncoming = new Set(pathway.connections.map((c) => c.targetNodeId));
  const roots = pathway.nodes.filter((n) => !hasIncoming.has(n.id));
  if (roots.length === 0 && pathway.nodes.length > 0) {
    roots.push(pathway.nodes[0]);
  }

  const queue: Array<{ nodeId: string; depth: number }> = [];
  for (const root of roots) {
    depthMap.set(root.id, 0);
    queue.push({ nodeId: root.id, depth: 0 });
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const children = childrenOf.get(nodeId) ?? [];
    const isBranchSource = branchNodeIds.has(nodeId);

    for (const childId of children) {
      if (visited.has(childId)) continue;
      const childDepth = isBranchSource ? depth + 1 : depth;
      // Only set depth if not already set (first path wins, or take max)
      if (!depthMap.has(childId) || depthMap.get(childId)! < childDepth) {
        depthMap.set(childId, childDepth);
      }
      if (isBranchSource) {
        branchChildSet.add(childId);
      }
      queue.push({ nodeId: childId, depth: childDepth });
    }
  }

  // Also include nodes not reachable via connections (orphan/draft nodes)
  for (const node of pathway.nodes) {
    if (!depthMap.has(node.id)) {
      depthMap.set(node.id, 0);
    }
  }

  // Sort by columnIndex then verticalPosition (maintains visual order)
  const sorted = [...pathway.nodes].sort((a, b) => {
    if (a.columnIndex !== b.columnIndex) return a.columnIndex - b.columnIndex;
    return a.verticalPosition - b.verticalPosition;
  });

  return sorted.map((node) => ({
    node,
    depth: depthMap.get(node.id) ?? 0,
    isBranchChild: branchChildSet.has(node.id),
  }));
}

// ============================================================================
// Lifecycle Indicator
// ============================================================================

const LifecycleIndicator: React.FC<{ state: NodeLifecycleState }> = ({ state: lifecycleState }) => {
  if (lifecycleState === 'active') return null;

  if (lifecycleState === 'paused') {
    return (
      <span style={{ display: 'flex', color: colors.fg.neutral.secondary, flexShrink: 0 }}>
        <Pause size={10} />
      </span>
    );
  }

  if (lifecycleState === 'draft') {
    return (
      <span style={{
        fontSize: 10,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.spotReadable,
        flexShrink: 0,
      }}>
        (draft)
      </span>
    );
  }

  // Other states — show as muted label
  return (
    <span style={{
      fontSize: 10,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.spotReadable,
      flexShrink: 0,
    }}>
      ({lifecycleState})
    </span>
  );
};

// ============================================================================
// Pathway Row
// ============================================================================

interface PathwayRowProps {
  pathway: Pathway;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onClick: (e: React.MouseEvent) => void;
}

const PathwayRow: React.FC<PathwayRowProps> = ({
  pathway,
  isSelected,
  isExpanded,
  onToggle,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const totalPatients = pathway.nodes[0]?.patientCount ?? 0;

  const statusIcon = pathway.status === 'active'
    ? <Play size={10} />
    : pathway.status === 'paused'
      ? <Pause size={10} />
      : <Circle size={10} />;

  const statusColor = pathway.status === 'active'
    ? colors.fg.positive.primary
    : pathway.status === 'paused'
      ? colors.fg.attention.primary
      : colors.fg.neutral.secondary;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        height: 28,
        padding: `0 ${spaceAround.compact}px`,
        backgroundColor: isSelected
          ? colors.bg.accent.low
          : isHovered
            ? colors.bg.neutral.subtle
            : 'transparent',
        borderRadius: borderRadius.xs,
        cursor: 'pointer',
        transition: `background-color ${transitions.fast}`,
        userSelect: 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      data-testid={`layer-pathway-${pathway.id}`}
    >
      {/* Chevron */}
      <span
        style={{
          display: 'flex',
          color: colors.fg.neutral.spotReadable,
          transition: `transform ${transitions.fast}`,
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <ChevronRight size={12} />
      </span>

      {/* Status dot */}
      <span style={{ color: statusColor, display: 'flex', flexShrink: 0 }}>
        {statusIcon}
      </span>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 13,
        fontFamily: typography.fontFamily.sans,
        fontWeight: isSelected ? typography.fontWeight.medium : typography.fontWeight.regular,
        color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {pathway.name}
      </span>

      {/* Patient count */}
      <span style={{
        fontSize: 11,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.secondary,
        flexShrink: 0,
      }}>
        {totalPatients}
      </span>
    </div>
  );
};

// ============================================================================
// Node Row
// ============================================================================

interface NodeRowProps {
  node: PathwayNode;
  depth: number;
  isSelected: boolean;
  onClick: () => void;
}

const NODE_INDENT_BASE = 16; // Base indent under pathway
const NODE_INDENT_STEP = 14; // Additional indent per branch depth

const NodeRow: React.FC<NodeRowProps> = ({ node, depth, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDraft = node.lifecycleState === 'draft';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        height: 28,
        padding: `0 ${spaceAround.compact}px`,
        paddingLeft: spaceAround.compact + NODE_INDENT_BASE + (depth * NODE_INDENT_STEP),
        backgroundColor: isSelected
          ? colors.bg.accent.low
          : isHovered
            ? colors.bg.neutral.subtle
            : 'transparent',
        borderRadius: borderRadius.xs,
        cursor: 'pointer',
        transition: `background-color ${transitions.fast}`,
        userSelect: 'none',
        // Draft nodes get a dashed left border
        ...(isDraft ? {
          borderLeft: `2px dashed ${colors.border.neutral.low}`,
        } : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      data-testid={`layer-node-${node.id}`}
    >
      {/* Node type icon */}
      <span style={{
        display: 'flex',
        color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
        flexShrink: 0,
      }}>
        {NODE_TYPE_ICONS[node.type]}
      </span>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 12,
        fontFamily: typography.fontFamily.sans,
        color: isDraft
          ? colors.fg.neutral.spotReadable
          : isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {node.label}
      </span>

      {/* Lifecycle indicator */}
      <LifecycleIndicator state={node.lifecycleState} />

      {/* Gap count (alert dot) */}
      {node.gapCount !== undefined && node.gapCount > 0 && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: colors.fg.attention.primary,
          flexShrink: 0,
        }} />
      )}

      {/* Patient count */}
      {node.patientCount !== undefined && (
        <span style={{
          fontSize: 11,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
          flexShrink: 0,
        }}>
          {node.patientCount}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// LayerTree Component
// ============================================================================

export const LayerTree: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const [expandedPathways, setExpandedPathways] = useState<Set<string>>(new Set());

  const pathways = useMemo(() => {
    if (state.selectedCohortId) {
      return getPathwaysByCohort(state.selectedCohortId);
    }
    return PATHWAYS;
  }, [state.selectedCohortId]);

  // Pre-compute branch-indented node lists for each pathway
  const pathwayNodeEntries = useMemo(() => {
    const entries = new Map<string, FlatNodeEntry[]>();
    for (const pathway of pathways) {
      entries.set(pathway.id, computeBranchIndentation(pathway));
    }
    return entries;
  }, [pathways]);

  const toggleExpanded = useCallback((pathwayId: string) => {
    setExpandedPathways((prev) => {
      const next = new Set(prev);
      if (next.has(pathwayId)) {
        next.delete(pathwayId);
      } else {
        next.add(pathwayId);
      }
      return next;
    });
  }, []);

  const handlePathwayClick = useCallback((pathwayId: string, e: React.MouseEvent) => {
    dispatch({
      type: 'PATHWAY_SELECTED',
      pathwayId,
      multi: e.shiftKey,
    });
    // Auto-expand on select
    setExpandedPathways((prev) => new Set(prev).add(pathwayId));
  }, [dispatch]);

  const handleNodeClick = useCallback((nodeId: string) => {
    dispatch({ type: 'NODE_SELECTED', nodeId });
  }, [dispatch]);

  return (
    <div style={treeStyles.container} data-testid="layer-tree">
      <div style={treeStyles.header}>
        <span style={treeStyles.headerLabel}>Pathways</span>
      </div>
      <div style={treeStyles.scrollArea}>
        {pathways.map((pathway) => {
          const isSelected = state.selectedPathwayIds.includes(pathway.id);
          const isExpanded = expandedPathways.has(pathway.id);
          const nodeEntries = pathwayNodeEntries.get(pathway.id) ?? [];

          return (
            <React.Fragment key={pathway.id}>
              <PathwayRow
                pathway={pathway}
                isSelected={isSelected}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(pathway.id)}
                onClick={(e) => handlePathwayClick(pathway.id, e)}
              />
              {isExpanded && nodeEntries.map((entry) => (
                <NodeRow
                  key={entry.node.id}
                  node={entry.node}
                  depth={entry.depth}
                  isSelected={state.selectedNodeId === entry.node.id}
                  onClick={() => handleNodeClick(entry.node.id)}
                />
              ))}
              {/* Divider between pathways */}
              <div style={treeStyles.divider} />
            </React.Fragment>
          );
        })}

        {pathways.length === 0 && (
          <div style={treeStyles.emptyState}>
            <span style={treeStyles.emptyText}>No pathways for this cohort</span>
          </div>
        )}
      </div>
    </div>
  );
};

LayerTree.displayName = 'LayerTree';

// ============================================================================
// Styles
// ============================================================================

const treeStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    flexShrink: 0,
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `0 ${spaceAround.compact}px ${spaceAround.compact}px`,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.neutral.low,
    margin: `${spaceBetween.coupled}px 0`,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.default,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
};
