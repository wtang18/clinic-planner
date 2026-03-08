/**
 * PrioritiesView Component
 *
 * Main canvas view for the Priorities tab. Shows a filtered, sorted list
 * of PriorityCards computed from pathway/patient/escalation data.
 * Supports three sort modes (urgency, by-node, by-date) with section
 * headers in by-node mode. Follows the RoutingView pattern.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { PATHWAYS, MOCK_POP_HEALTH_PATIENTS, MOCK_ESCALATION_FLAGS } from '../../data/mock-population-health';
import { derivePriorityItems, computePriorityQueue } from '../../utils/priority-computation';
import { PriorityCard } from './PriorityCard';
import { SegmentedControl } from '../primitives/SegmentedControl';
import { colors, typography, spaceAround, transitions, LAYOUT, glass } from '../../styles/foundations';
import type { PrioritySortMode, PriorityItem } from '../../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const SORT_SEGMENTS: { key: PrioritySortMode; label: string }[] = [
  { key: 'urgency', label: 'Urgency' },
  { key: 'by-node', label: 'By Node' },
  { key: 'by-date', label: 'By Date' },
];

// ============================================================================
// Component
// ============================================================================

export const PrioritiesView: React.FC = () => {
  const { state } = usePopHealth();
  const [sortMode, setSortMode] = useState<PrioritySortMode>('urgency');

  // Staged entrance animation
  const [visible, setVisible] = useState(false);
  const mountRef = useRef(false);
  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  // Derive all priority items from source data (memoized)
  const allItems = useMemo(
    () => derivePriorityItems(PATHWAYS, MOCK_POP_HEALTH_PATIENTS, MOCK_ESCALATION_FLAGS),
    [],
  );

  // Filter + sort based on selected nodes and sort mode
  const sortedItems = useMemo(
    () => computePriorityQueue(allItems, state.selectedNodeIds, sortMode),
    [allItems, state.selectedNodeIds, sortMode],
  );

  // Group by node label for "by-node" sort mode
  const groupedByNode = useMemo(() => {
    if (sortMode !== 'by-node') return null;
    const groups = new Map<string, PriorityItem[]>();
    for (const item of sortedItems) {
      const existing = groups.get(item.nodeLabel);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(item.nodeLabel, [item]);
      }
    }
    return groups;
  }, [sortMode, sortedItems]);

  // Whether we have items at all (for empty state variant)
  const hasAnyItems = allItems.length > 0;

  // ---- Styles ----
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'auto',
    opacity: visible ? 1 : 0,
    transition: `opacity ${transitions.base}`,
  };

  const barStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: LAYOUT.headerHeight + spaceAround.tight,
    paddingBottom: spaceAround.tight,
    paddingLeft: spaceAround.default,
    paddingRight: spaceAround.default,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    flexShrink: 0,
    ...glass.floating,
  };

  const countStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  };

  const listStyle: React.CSSProperties = {
    padding: `0 ${spaceAround.default}px ${spaceAround.default}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingTop: 12,
    paddingBottom: 4,
  };

  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 8,
    padding: spaceAround.spacious,
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const emptySubtitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textAlign: 'center',
  };

  // ---- Empty state ----
  if (sortedItems.length === 0) {
    return (
      <div style={containerStyle} data-testid="priorities-view">
        <div style={barStyle}>
          <SegmentedControl
            segments={SORT_SEGMENTS}
            value={sortMode}
            onChange={setSortMode}
            variant="inline"
            size="sm"
          />
          <span style={countStyle}>0 items</span>
        </div>
        <div style={emptyStyle}>
          <span style={emptyTitleStyle}>
            {hasAnyItems
              ? 'No priority items at selected nodes'
              : 'All clear — no items need attention'}
          </span>
          <span style={emptySubtitleStyle}>
            {hasAnyItems
              ? 'Try selecting different nodes in the layer tree, or clear the selection to see all items.'
              : 'No patients require priority action at this time.'}
          </span>
        </div>
      </div>
    );
  }

  // ---- Grouped rendering (by-node mode) ----
  if (groupedByNode) {
    return (
      <div style={containerStyle} data-testid="priorities-view">
        <div style={barStyle}>
          <SegmentedControl
            segments={SORT_SEGMENTS}
            value={sortMode}
            onChange={setSortMode}
            variant="inline"
            size="sm"
          />
          <span style={countStyle}>{sortedItems.length} items</span>
        </div>
        <div style={listStyle}>
          {Array.from(groupedByNode.entries()).map(([nodeLabel, items]) => (
            <React.Fragment key={nodeLabel}>
              <div style={sectionHeaderStyle}>
                {nodeLabel} ({items.length})
              </div>
              {items.map((item) => (
                <PriorityCard key={item.id} item={item} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ---- Flat rendering (urgency / by-date modes) ----
  return (
    <div style={containerStyle} data-testid="priorities-view">
      <div style={barStyle}>
        <SegmentedControl
          segments={SORT_SEGMENTS}
          value={sortMode}
          onChange={setSortMode}
          variant="inline"
          size="sm"
        />
        <span style={countStyle}>{sortedItems.length} items</span>
      </div>
      <div style={listStyle}>
        {sortedItems.map((item) => (
          <PriorityCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

PrioritiesView.displayName = 'PrioritiesView';
