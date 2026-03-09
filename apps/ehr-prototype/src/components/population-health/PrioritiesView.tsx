/**
 * PrioritiesView Component
 *
 * Main canvas view for the Priorities tab. Shows a filtered, sorted list
 * of PriorityCards computed from pathway/patient/escalation data.
 *
 * PV4 features:
 * - Responsibility filter (Mine/Team/AI) with ambient counts
 * - Collapsible section headers for all sort modes
 * - Batch mode with section-level and refine-based selection
 * - Cohort-scoped: only shows priorities for the active cohort's pathways
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { PATHWAYS, MOCK_POP_HEALTH_PATIENTS, MOCK_ESCALATION_FLAGS, getPathwaysByCohort } from '../../data/mock-population-health';
import { derivePriorityItems, computePriorityQueue, groupBySection, computeResponsibilityCounts } from '../../utils/priority-computation';
import { PriorityCard } from './PriorityCard';
import { SelectDropdown } from '../primitives/SelectDropdown';
import { RefineDropdown } from './RefineDropdown';
import { colors, typography, spaceAround, borderRadius, transitions, LAYOUT, glass } from '../../styles/foundations';
import type { PrioritySortMode, PriorityItem, Responsibility } from '../../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const SORT_ITEMS = [
  { key: 'urgency' as PrioritySortMode, label: 'Urgency', description: 'Grouped by priority tier' },
  { key: 'by-node' as PrioritySortMode, label: 'By Node', description: 'Grouped by care flow step' },
  { key: 'by-date' as PrioritySortMode, label: 'By Date', description: 'Grouped by recency' },
];

const RESPONSIBILITY_ITEMS = [
  { key: 'mine' as Responsibility, label: 'Mine', description: 'Items needing your action' },
  { key: 'team' as Responsibility, label: 'Team', description: 'Assigned to team members' },
  { key: 'ai' as Responsibility, label: 'AI', description: 'Being handled autonomously' },
];

const DEFER_OPTIONS = ['1hr', '4hr', 'Tomorrow', '1 wk'] as const;
const ASSIGN_OPTIONS = ['AI', 'MA Chen', 'Dr. Park'] as const;

// ============================================================================
// Helpers
// ============================================================================

/** Toggle an id in a Set, returning a new Set. */
function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

// ============================================================================
// SectionHeader Sub-component
// ============================================================================

interface SectionHeaderProps {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  batchMode?: boolean;
  checked?: 'all' | 'some' | 'none';
  onCheckToggle?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  count,
  collapsed,
  onToggle,
  batchMode = false,
  checked = 'none',
  onCheckToggle,
}) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const checkboxStyle: React.CSSProperties = {
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
  };

  const labelTextStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  };

  const chevronStyle: React.CSSProperties = {
    flexShrink: 0,
    color: colors.fg.neutral.secondary,
  };

  return (
    <div style={headerStyle} data-testid={`section-header-${label}`}>
      {batchMode && (
        <button
          style={checkboxStyle}
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
      <span style={labelTextStyle} onClick={onToggle}>
        {label} ({count})
      </span>
      <span style={chevronStyle} onClick={onToggle}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </span>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const PrioritiesView: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const [sortMode, setSortMode] = useState<PrioritySortMode>('urgency');
  const [responsibility, setResponsibility] = useState<Responsibility>('mine');

  // Local interaction state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Batch mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchPickerMode, setBatchPickerMode] = useState<'default' | 'defer' | 'assign'>('default');

  // Collapse state — keyed by section label
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set(['MONITOR']));

  // Refine dropdown state
  const [refineOpen, setRefineOpen] = useState(false);

  // Staged entrance animation
  const [visible, setVisible] = useState(false);
  const mountRef = useRef(false);
  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  // Cohort-scoped pathways (matches FlowCanvas/LayerTree pattern)
  const pathways = useMemo(() => {
    if (state.selectedCohortId) {
      return getPathwaysByCohort(state.selectedCohortId);
    }
    return PATHWAYS;
  }, [state.selectedCohortId]);

  // Derive all priority items from source data (memoized, cohort-scoped)
  const allItems = useMemo(
    () => derivePriorityItems(pathways, MOCK_POP_HEALTH_PATIENTS, MOCK_ESCALATION_FLAGS),
    [pathways],
  );

  // Responsibility counts (computed on full item set before filtering)
  const responsibilityCounts = useMemo(
    () => computeResponsibilityCounts(allItems),
    [allItems],
  );

  // Filter by responsibility
  const responsibilityFiltered = useMemo(
    () => allItems.filter((item) => item.responsibility === responsibility),
    [allItems, responsibility],
  );

  // Filter + sort based on selected nodes and sort mode
  const sortedItems = useMemo(
    () => computePriorityQueue(responsibilityFiltered, state.selectedNodeIds, sortMode),
    [responsibilityFiltered, state.selectedNodeIds, sortMode],
  );

  // Filter out removed items
  const visibleItems = useMemo(
    () => removedIds.size === 0 ? sortedItems : sortedItems.filter((item) => !removedIds.has(item.id)),
    [sortedItems, removedIds],
  );

  // Group by section (all sort modes)
  const sections = useMemo(
    () => groupBySection(visibleItems, sortMode),
    [visibleItems, sortMode],
  );

  // Whether we have items at all (for empty state variant)
  const hasAnyItems = allItems.length > 0;

  const isReadOnly = responsibility !== 'mine';

  // ---- Responsibility items with counts as badges ----
  const responsibilityDropdownItems = useMemo(() =>
    RESPONSIBILITY_ITEMS.map((item) => ({
      ...item,
      badge: responsibilityCounts[item.key],
    })),
    [responsibilityCounts],
  );

  // ---- Handlers ----

  const handleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => toggleInSet(prev, id));
  }, []);

  const handleFlag = useCallback((id: string) => {
    setFlaggedIds((prev) => toggleInSet(prev, id));
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleDetails = useCallback((itemId: string) => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'priority-detail', priorityItemId: itemId } });
  }, [dispatch]);

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

  const handleSectionCheck = useCallback((sectionItems: PriorityItem[]) => {
    setCheckedIds((prev) => {
      const sectionIds = sectionItems.map((i) => i.id);
      const allChecked = sectionIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allChecked) {
        // Uncheck all in section
        for (const id of sectionIds) next.delete(id);
      } else {
        // Check all in section
        for (const id of sectionIds) next.add(id);
      }
      return next;
    });
  }, []);

  const enterBatchMode = useCallback(() => {
    setBatchMode(true);
    setBatchPickerMode('default');
  }, []);

  const exitBatchMode = useCallback(() => {
    setBatchMode(false);
    setCheckedIds(new Set());
    setBatchPickerMode('default');
  }, []);

  const handleBatchDefer = useCallback(() => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      for (const id of checkedIds) next.add(id);
      return next;
    });
    setCheckedIds(new Set());
    setBatchPickerMode('default');
  }, [checkedIds]);

  const handleBatchAssign = useCallback(() => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      for (const id of checkedIds) next.add(id);
      return next;
    });
    setCheckedIds(new Set());
    setBatchPickerMode('default');
  }, [checkedIds]);

  // ---- Render helpers ----

  const getSectionCheckState = useCallback((sectionItems: PriorityItem[]): 'all' | 'some' | 'none' => {
    const ids = sectionItems.map((i) => i.id);
    const checkedCount = ids.filter((id) => checkedIds.has(id)).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === ids.length) return 'all';
    return 'some';
  }, [checkedIds]);

  const renderCard = useCallback((item: PriorityItem) => (
    <PriorityCard
      key={item.id}
      item={item}
      checked={checkedIds.has(item.id)}
      flagged={flaggedIds.has(item.id)}
      batchMode={batchMode}
      readOnly={isReadOnly}
      onCheck={() => handleCheck(item.id)}
      onFlag={() => handleFlag(item.id)}
      onDefer={() => handleRemoveCard(item.id)}
      onAssign={() => handleRemoveCard(item.id)}
      onDetails={() => handleDetails(item.id)}
    />
  ), [checkedIds, flaggedIds, batchMode, isReadOnly, handleCheck, handleFlag, handleRemoveCard, handleDetails]);

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
    gap: 8,
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

  const barRightStyle: React.CSSProperties = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const listStyle: React.CSSProperties = {
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

  const batchBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    cursor: 'pointer',
    borderRadius: borderRadius.full,
    ...glass.ghost,
    border: 'none',
    transition: `background ${transitions.fast}`,
  };

  const batchLabelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
  };

  const cancelBatchBtnStyle: React.CSSProperties = {
    ...batchBtnStyle,
    color: colors.fg.neutral.primary,
    ...glass.secondary,
  };

  const selectionSummaryStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
  };

  const actionBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: checkedIds.size > 0 ? colors.fg.neutral.primary : colors.fg.neutral.disabled,
    cursor: checkedIds.size > 0 ? 'pointer' : 'default',
    borderRadius: borderRadius.full,
    ...glass.secondary,
    transition: `background ${transitions.fast}`,
  };

  const pickerBtnStyle: React.CSSProperties = {
    ...actionBtnStyle,
    color: colors.fg.neutral.primary,
    cursor: 'pointer',
  };

  const cancelBtnStyle: React.CSSProperties = {
    ...actionBtnStyle,
    color: colors.fg.neutral.secondary,
    cursor: 'pointer',
  };

  // ---- Render bar content ----

  const renderBar = () => {
    if (batchMode) {
      return (
        <div style={barStyle}>
          <span style={batchLabelStyle}>Batch Edit:</span>
          <SelectDropdown
            value={sortMode}
            items={SORT_ITEMS}
            onChange={setSortMode}
            testID="sort-dropdown"
          />
          <RefineDropdown
            items={visibleItems}
            checkedIds={checkedIds}
            onCheckedChange={setCheckedIds}
            open={refineOpen}
            onClose={() => setRefineOpen(false)}
            onOpen={() => setRefineOpen(true)}
          />
          <span style={selectionSummaryStyle}>
            {checkedIds.size} of {visibleItems.length}
          </span>
          <div style={barRightStyle}>
            {batchPickerMode === 'default' && (
              <>
                <button
                  style={actionBtnStyle}
                  onClick={() => checkedIds.size > 0 && setBatchPickerMode('defer')}
                  data-testid="batch-defer"
                >
                  Defer ▾
                </button>
                <button
                  style={actionBtnStyle}
                  onClick={() => checkedIds.size > 0 && setBatchPickerMode('assign')}
                  data-testid="batch-assign"
                >
                  Assign ▾
                </button>
              </>
            )}
            {batchPickerMode === 'defer' && (
              <>
                {DEFER_OPTIONS.map((opt) => (
                  <button key={opt} style={pickerBtnStyle} onClick={handleBatchDefer}>
                    {opt}
                  </button>
                ))}
                <button style={cancelBtnStyle} onClick={() => setBatchPickerMode('default')}>
                  Cancel
                </button>
              </>
            )}
            {batchPickerMode === 'assign' && (
              <>
                {ASSIGN_OPTIONS.map((opt) => (
                  <button key={opt} style={pickerBtnStyle} onClick={handleBatchAssign}>
                    {opt}
                  </button>
                ))}
                <button style={cancelBtnStyle} onClick={() => setBatchPickerMode('default')}>
                  Cancel
                </button>
              </>
            )}
            <button style={cancelBatchBtnStyle} onClick={exitBatchMode} data-testid="batch-exit">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={barStyle}>
        <SelectDropdown
          value={sortMode}
          items={SORT_ITEMS}
          onChange={setSortMode}
          testID="sort-dropdown"
        />
        <SelectDropdown
          value={responsibility}
          items={responsibilityDropdownItems}
          onChange={setResponsibility}
          renderTrigger={(item) => (
            <>
              {item.label} {responsibilityCounts[responsibility]}
              <ChevronDown size={12} />
            </>
          )}
          testID="responsibility-dropdown"
        />
        <div style={barRightStyle}>
          <button style={batchBtnStyle} onClick={enterBatchMode} data-testid="batch-enter">
            <LayoutGrid size={12} /> Batch
          </button>
        </div>
      </div>
    );
  };

  // ---- Empty state ----
  if (visibleItems.length === 0) {
    return (
      <div style={containerStyle} data-testid="priorities-view">
        {renderBar()}
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

  // ---- Sectioned rendering (all sort modes) ----
  return (
    <div style={containerStyle} data-testid="priorities-view">
      {renderBar()}
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
                onCheckToggle={() => handleSectionCheck(sectionItems)}
              />
              {!isCollapsed && sectionItems.map(renderCard)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

PrioritiesView.displayName = 'PrioritiesView';
