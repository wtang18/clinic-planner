/**
 * LayerTree Component
 *
 * Figma-style nested hierarchy of pathway → nodes with branch-only indentation.
 * Sequential nodes render at the same indent level. Only children of branch
 * nodes get indented, reflecting the actual flow structure.
 *
 * Click selects a node; shift-click toggles multi-select.
 * Right-aligned indicators: ★ (assigned), 🔺 (escalated), lifecycle label.
 * "Select Mine" button auto-selects assigned + escalated nodes on cohort entry.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  Pause,
  Star,
  Triangle,
} from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { getPathwaysByCohort, PATHWAYS, MOCK_ESCALATION_FLAGS } from '../../data/mock-population-health';
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
      <span style={{ display: 'flex', flexShrink: 0 }}>
        <Pause size={10} fill={colors.fg.neutral.secondary} color="none" strokeWidth={0} />
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
  isExpanded: boolean;
  onToggle: () => void;
}

const PathwayRow: React.FC<PathwayRowProps> = ({
  pathway,
  isExpanded,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        height: 28,
        padding: `0 ${spaceAround.compact}px`,
        backgroundColor: isHovered ? colors.bg.neutral.subtle : 'transparent',
        borderRadius: borderRadius.xs,
        cursor: 'pointer',
        transition: `background-color ${transitions.fast}`,
        userSelect: 'none',
      }}
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      >
        <ChevronRight size={12} />
      </span>

      {/* Label — medium weight, no icon, visually distinct from node rows */}
      <span style={{
        flex: 1,
        fontSize: 13,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        color: colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {pathway.name}
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
  isDimmed: boolean;
  isAssigned: boolean;
  isEscalated: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const NODE_INDENT_BASE = 16; // Base indent under pathway
const NODE_INDENT_STEP = 14; // Additional indent per branch depth

const NodeRow: React.FC<NodeRowProps> = ({ node, depth, isSelected, isDimmed, isAssigned, isEscalated, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

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
        transition: `background-color ${transitions.fast}, opacity ${transitions.fast}, box-shadow ${transitions.fast}`,
        userSelect: 'none',
        opacity: isDimmed ? 0.4 : 1,
        boxShadow: isHovered && !isSelected ? '0 1px 3px rgba(0, 0, 0, 0.06)' : 'none',
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
        fontSize: 13,
        fontFamily: typography.fontFamily.sans,
        color: node.lifecycleState === 'draft'
          ? colors.fg.neutral.spotReadable
          : isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {node.label}
      </span>

      {/* Right-aligned trailing indicators: ★ 🔺 lifecycle */}
      {isAssigned && (
        <Star size={11} fill={colors.fg.neutral.secondary} color="none" strokeWidth={0} style={{ opacity: 0.6, flexShrink: 0 }} />
      )}
      {isEscalated && (
        <Triangle size={11} fill={colors.fg.alert.primary} color={colors.fg.alert.primary} style={{ flexShrink: 0 }} />
      )}

      {/* Lifecycle indicator */}
      <LifecycleIndicator state={node.lifecycleState} />
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

  // Re-expand all pathways when cohort changes (new pathways list)
  useEffect(() => {
    setExpandedPathways(new Set(pathways.map(p => p.id)));
  }, [pathways]);

  // Build escalation lookup set for marker rendering
  const escalatedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const flag of MOCK_ESCALATION_FLAGS) {
      ids.add(flag.nodeId);
    }
    return ids;
  }, []);

  // Compute "mine" node IDs: assigned to current provider OR has escalation flag
  const mineNodeIds = useMemo(() => {
    const ids: string[] = [];
    for (const pathway of pathways) {
      for (const node of pathway.nodes) {
        if (node.assignedProviderId === 'prov-current' || escalatedNodeIds.has(node.id)) {
          ids.push(node.id);
        }
      }
    }
    return ids;
  }, [pathways, escalatedNodeIds]);

  // Auto-apply "Show Mine" on cohort entry (when showMineActive is true and selection is empty)
  const hasAppliedShowMineRef = useRef(false);
  useEffect(() => {
    if (state.showMineActive && state.selectedNodeIds.length === 0 && mineNodeIds.length > 0) {
      // Only auto-apply once per cohort — avoid infinite loops
      if (!hasAppliedShowMineRef.current) {
        hasAppliedShowMineRef.current = true;
        dispatch({ type: 'SHOW_MINE_APPLIED', nodeIds: mineNodeIds });
      }
    }
  }, [state.showMineActive, state.selectedNodeIds.length, mineNodeIds, dispatch]);

  // Reset the auto-apply guard when cohort changes
  useEffect(() => {
    hasAppliedShowMineRef.current = false;
  }, [state.selectedCohortId]);

  // Compute "Show Mine" modification delta for badge
  const showMineDelta = useMemo(() => {
    if (!state.showMineActive) return 0;
    const mineSet = new Set(mineNodeIds);
    const selectedSet = new Set(state.selectedNodeIds);
    let added = 0;
    let removed = 0;
    for (const id of selectedSet) {
      if (!mineSet.has(id)) added++;
    }
    for (const id of mineSet) {
      if (!selectedSet.has(id)) removed++;
    }
    return added - removed;
  }, [state.showMineActive, mineNodeIds, state.selectedNodeIds]);

  // Auto-expand pathways when nodes are selected in the canvas
  useEffect(() => {
    if (state.selectedNodeIds.length === 0) return;
    setExpandedPathways((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const nodeId of state.selectedNodeIds) {
        const pathway = pathways.find((p) => p.nodes.some((n) => n.id === nodeId));
        if (pathway && !next.has(pathway.id)) {
          next.add(pathway.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [state.selectedNodeIds, pathways]);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    dispatch({ type: 'NODE_SELECTED', nodeId, multi: e.shiftKey });
  }, [dispatch]);

  const handleShowMineClick = useCallback(() => {
    dispatch({ type: 'SHOW_MINE_APPLIED', nodeIds: mineNodeIds });
  }, [dispatch, mineNodeIds]);

  const handleClearClick = useCallback(() => {
    dispatch({ type: 'SHOW_MINE_CLEARED' });
  }, [dispatch]);

  const selectionCount = state.selectedNodeIds.length;

  // Build "★ Mine" button label with modification delta
  const mineLabel = useMemo(() => {
    if (!state.showMineActive) return 'Select Mine';
    if (showMineDelta > 0) return `Select Mine + ${showMineDelta}`;
    if (showMineDelta < 0) return `Select Mine − ${Math.abs(showMineDelta)}`;
    return 'Select Mine';
  }, [state.showMineActive, showMineDelta]);

  return (
    <div style={treeStyles.container} data-testid="layer-tree">
      {/* Header row: label left + ★ Mine button right */}
      <div style={treeStyles.header}>
        <span style={treeStyles.headerLabel}>Pathways</span>
        <button
          style={{
            ...treeStyles.mineButton,
            backgroundColor: state.showMineActive ? colors.bg.accent.low : 'transparent',
            color: state.showMineActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
            borderColor: state.showMineActive ? colors.border.accent.medium : colors.border.neutral.low,
          }}
          onClick={handleShowMineClick}
          data-testid="show-mine-button"
        >
          {mineLabel}
        </button>
      </div>

      {/* Selection banner — only when items are selected */}
      {selectionCount > 0 && (
        <div style={treeStyles.selectionBanner} data-testid="layer-tree-selection-banner">
          <span style={treeStyles.selectionLabel}>
            {selectionCount} node{selectionCount !== 1 ? 's' : ''} selected
          </span>
          <button
            style={treeStyles.clearButton}
            onClick={handleClearClick}
            data-testid="clear-selection-button"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      )}

      <div style={treeStyles.scrollArea}>
        {pathways.map((pathway) => {
          const isExpanded = expandedPathways.has(pathway.id);
          const nodeEntries = pathwayNodeEntries.get(pathway.id) ?? [];

          return (
            <React.Fragment key={pathway.id}>
              <PathwayRow
                pathway={pathway}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(pathway.id)}
              />
              {isExpanded && nodeEntries.map((entry) => {
                const dimmedByLifecycle = state.lifecycleFilter.length > 0
                  && !state.lifecycleFilter.includes(entry.node.lifecycleState);
                const dimmedBySearch = state.searchQuery.length > 0
                  && !entry.node.label.toLowerCase().includes(state.searchQuery.toLowerCase());
                const isDimmed = dimmedByLifecycle || dimmedBySearch;

                return (
                  <NodeRow
                    key={entry.node.id}
                    node={entry.node}
                    depth={entry.depth}
                    isSelected={state.selectedNodeIds.includes(entry.node.id)}
                    isDimmed={isDimmed}
                    isAssigned={entry.node.assignedProviderId === 'prov-current'}
                    isEscalated={escalatedNodeIds.has(entry.node.id)}
                    onClick={(e) => handleNodeClick(entry.node.id, e)}
                  />
                );
              })}
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
    justifyContent: 'space-between',
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
  mineButton: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    border: '1px solid',
    borderRadius: borderRadius.sm,
    padding: '2px 8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: `all ${transitions.fast}`,
    outline: 'none',
  },
  selectionBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    margin: `${spaceBetween.coupled}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.xs,
    flexShrink: 0,
  },
  selectionLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap' as const,
  },
  clearButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    backgroundColor: 'transparent',
    border: 'none',
    padding: '2px 4px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `0 ${spaceAround.compact}px 80px`,
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
