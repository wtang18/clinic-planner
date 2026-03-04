/**
 * LayerTree Component
 *
 * Figma-style nested hierarchy of pathway → nodes.
 * Single-click selects a layer; shift-click multi-selects pathways.
 * Inline stats per row: patient count, gap count (right-aligned).
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
import type { PathwayNode, NodeType, Pathway } from '../../types/population-health';
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
  isSelected: boolean;
  onClick: () => void;
}

const NodeRow: React.FC<NodeRowProps> = ({ node, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        height: 28,
        padding: `0 ${spaceAround.compact}px`,
        paddingLeft: spaceAround.compact + 16, // Indented under pathway
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
        color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {node.label}
      </span>

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

          return (
            <React.Fragment key={pathway.id}>
              <PathwayRow
                pathway={pathway}
                isSelected={isSelected}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(pathway.id)}
                onClick={(e) => handlePathwayClick(pathway.id, e)}
              />
              {isExpanded && pathway.nodes.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  isSelected={state.selectedNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
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
