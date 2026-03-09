/**
 * SankeyPriorityColumn
 *
 * Inline priority column that appears when a Sankey band is clicked.
 * Shows urgency-sorted PriorityCards for patients in the selected band,
 * with collapsible section headers and full card interactions.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PriorityCard } from './PriorityCard';
import {
  deriveSankeyPriorityItems,
} from '../../utils/sankey-priority-bridge';
import { computePriorityQueue, groupBySection } from '../../utils/priority-computation';
import { colors, typography, spaceAround, transitions, LAYOUT } from '../../styles/foundations';
import type { DimensionSelection, PriorityItem, PrioritySortMode } from '../../types/population-health';

// ============================================================================
// Types
// ============================================================================

export type SankeySortMode = 'urgency' | 'by-cohort' | 'by-date';

interface SankeyPriorityColumnProps {
  bandId: string;
  dimensionSelection: DimensionSelection;
  sortMode: SankeySortMode;
  batchMode?: boolean;
  checkedIds: Set<string>;
  onCheckToggle: (id: string) => void;
  onSectionCheck: (ids: string[]) => void;
  removedIds: Set<string>;
  onRemoveCard: (id: string) => void;
  onVisibleCountChange?: (count: number) => void;
  onCardDetails: (itemId: string) => void;
  onClearFilters?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

export const SORT_ITEMS = [
  { key: 'urgency' as SankeySortMode, label: 'Urgency', description: 'Grouped by priority tier' },
  { key: 'by-cohort' as SankeySortMode, label: 'By Cohort', description: 'Grouped by care program' },
  { key: 'by-date' as SankeySortMode, label: 'By Date', description: 'Grouped by recency' },
];

// ============================================================================
// Helpers
// ============================================================================

function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/** Group items by pathway name (for "by-cohort" mode) */
function groupByCohort(items: PriorityItem[]): Map<string, PriorityItem[]> {
  const groups = new Map<string, PriorityItem[]>();
  for (const item of items) {
    const key = item.pathwayName;
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

// ============================================================================
// SectionHeader
// ============================================================================

const SectionHeader: React.FC<{
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  batchMode?: boolean;
  checked?: 'all' | 'some' | 'none';
  onCheckToggle?: () => void;
}> = ({ label, count, collapsed, onToggle, batchMode = false, checked = 'none', onCheckToggle }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      paddingTop: 12,
      paddingBottom: 4,
      cursor: 'pointer',
      userSelect: 'none',
    }}
  >
    {batchMode && (
      <button
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          border: checked === 'all'
            ? `1.5px solid ${colors.bg.accent.medium}`
            : `1.5px solid ${colors.border.neutral.medium}`,
          background: checked === 'all' ? colors.bg.accent.medium : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: `all ${transitions.fast}`,
        }}
        onClick={(e) => { e.stopPropagation(); onCheckToggle?.(); }}
        aria-label={`Select all ${label} items`}
      >
        {checked === 'all' && (
          <span style={{ color: colors.fg.neutral.inversePrimary, fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>
        )}
        {checked === 'some' && (
          <span style={{ color: colors.fg.neutral.secondary, fontSize: 12, fontWeight: 700, lineHeight: 1 }}>━</span>
        )}
      </button>
    )}
    <span
      style={{
        flex: 1,
        fontSize: 11,
        fontWeight: typography.fontWeight.semibold,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}
      onClick={onToggle}
    >
      {label} ({count})
    </span>
    <span style={{ flexShrink: 0, color: colors.fg.neutral.secondary }} onClick={onToggle}>
      {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
    </span>
  </div>
);

// ============================================================================
// Component
// ============================================================================

export const SankeyPriorityColumn: React.FC<SankeyPriorityColumnProps> = ({
  bandId,
  dimensionSelection,
  sortMode,
  batchMode,
  checkedIds,
  onCheckToggle,
  onSectionCheck,
  removedIds,
  onRemoveCard,
  onVisibleCountChange,
  onCardDetails,
  onClearFilters,
}) => {
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set(['MONITOR']));

  // Slide-in animation
  const [visible, setVisible] = useState(false);
  const mountRef = useRef(false);
  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  // Reset column-local state when band changes
  useEffect(() => {
    setFlaggedIds(new Set());
    setCollapsedSections(new Set(['MONITOR']));
  }, [bandId]);

  // Derive items
  const rawItems = useMemo(
    () => deriveSankeyPriorityItems(bandId, dimensionSelection),
    [bandId, dimensionSelection],
  );

  // Map sort mode for priority queue (by-cohort uses urgency sort within groups)
  const queueSortMode: PrioritySortMode = sortMode === 'by-cohort' ? 'urgency' : sortMode === 'by-date' ? 'by-date' : 'urgency';
  const sortedItems = useMemo(
    () => computePriorityQueue(rawItems, [], queueSortMode),
    [rawItems, queueSortMode],
  );

  // Filter removed
  const visibleItems = useMemo(
    () => removedIds.size === 0 ? sortedItems : sortedItems.filter((item) => !removedIds.has(item.id)),
    [sortedItems, removedIds],
  );

  // Group into sections
  const sections = useMemo(() => {
    if (sortMode === 'by-cohort') {
      return groupByCohort(visibleItems);
    }
    // urgency and by-date use the standard groupBySection
    const prioritySortMode: PrioritySortMode = sortMode === 'by-date' ? 'by-date' : 'urgency';
    return groupBySection(visibleItems, prioritySortMode);
  }, [visibleItems, sortMode]);

  // Report visible count to parent
  useEffect(() => {
    onVisibleCountChange?.(visibleItems.length);
  }, [visibleItems.length, onVisibleCountChange]);

  // Handlers
  const handleFlag = useCallback((id: string) => {
    setFlaggedIds((prev) => toggleInSet(prev, id));
  }, []);

  const handleToggleSection = useCallback((label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const getSectionCheckState = useCallback((sectionItems: PriorityItem[]): 'all' | 'some' | 'none' => {
    const ids = sectionItems.map((i) => i.id);
    const checkedCount = ids.filter((id) => checkedIds.has(id)).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === ids.length) return 'all';
    return 'some';
  }, [checkedIds]);

  // ---- Styles ----

  const columnStyle: React.CSSProperties = {
    flex: '1 1 60%',
    maxWidth: 800,
    minWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(20px)',
    transition: `opacity 300ms ease, transform 300ms ease`,
    overflow: 'hidden',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: `0 ${spaceAround.default}px 80px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
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

  return (
    <div style={columnStyle} data-testid="sankey-priority-column">
      {/* Card list or empty state */}
      {visibleItems.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{
            fontSize: 14,
            fontWeight: typography.fontWeight.semibold,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.primary,
          }}>
            No priority items
          </span>
          <span style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.secondary,
            textAlign: 'center',
            maxWidth: 260,
          }}>
            {sortedItems.length === 0
              ? 'No patients match the current filter selection.'
              : 'No patients in this group have actionable items in active care flows.'}
          </span>
          {sortedItems.length === 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              style={{
                height: 32,
                padding: '0 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.accent.primary,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.accent.medium}`,
                borderRadius: 16,
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={listStyle}>
          {Array.from(sections.entries()).map(([sectionLabel, sectionItems]) => {
            const isCollapsed = collapsedSections.has(sectionLabel);
            return (
              <React.Fragment key={sectionLabel}>
                <SectionHeader
                  label={sectionLabel}
                  count={sectionItems.length}
                  collapsed={isCollapsed}
                  onToggle={() => handleToggleSection(sectionLabel)}
                  batchMode={batchMode}
                  checked={getSectionCheckState(sectionItems)}
                  onCheckToggle={() => onSectionCheck(sectionItems.map((i) => i.id))}
                />
                {!isCollapsed && sectionItems.map((item) => (
                  <PriorityCard
                    key={item.id}
                    item={{
                      ...item,
                      contextLine: `${item.pathwayName} — ${item.contextLine}`,
                    }}
                    batchMode={batchMode}
                    checked={checkedIds.has(item.id)}
                    flagged={flaggedIds.has(item.id)}
                    onCheck={() => onCheckToggle(item.id)}
                    onFlag={() => handleFlag(item.id)}
                    onDefer={() => onRemoveCard(item.id)}
                    onAssign={() => onRemoveCard(item.id)}
                    onDetails={() => onCardDetails(item.id)}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

SankeyPriorityColumn.displayName = 'SankeyPriorityColumn';
