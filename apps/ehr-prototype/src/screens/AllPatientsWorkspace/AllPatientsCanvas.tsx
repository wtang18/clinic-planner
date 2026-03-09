/**
 * AllPatientsCanvas
 *
 * Canvas for the all-patients scope. Routes between Map (Sankey), Routing,
 * and Table views. Renders filter chips and the slide drawer.
 */

import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { X, LayoutGrid } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { SankeyChart } from '../../components/population-health/SankeyChart';
import { SankeyPriorityColumn, SORT_ITEMS } from '../../components/population-health/SankeyPriorityColumn';
import type { SankeySortMode } from '../../components/population-health/SankeyPriorityColumn';
import { SelectDropdown } from '../../components/primitives/SelectDropdown';
import { PriorityDetailView } from '../../components/population-health/PriorityDetailView';
import { RoutingView } from '../../components/population-health/RoutingView';
import { PopHealthCanvas } from '../PopHealthView/PopHealthCanvas';
import { SlideDrawer } from '../../components/shared/SlideDrawer';
import {
  computeSankeyData,
  filterSankeyData,
  RISK_TIER_LABELS,
  ACTION_STATUS_LABELS,
} from '../../utils/sankey-computation';
import { computeSankeyLayout } from '../../utils/sankey-layout';
import { ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS, getConditionLabel, getPreventiveLabel } from '../../data/mock-all-patients';
import { colors, typography, spaceAround, spaceBetween, borderRadius, LAYOUT, transitions, glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from '../../styles/foundations';
import type { DimensionSelection, RiskTier, ActionStatus } from '../../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const DEFER_OPTIONS = ['1hr', '4hr', 'Tomorrow', '1 wk'] as const;
const ASSIGN_OPTIONS = ['AI', 'MA Chen', 'Dr. Park'] as const;

function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}

// ============================================================================
// SankeyMapView — main Sankey visualization
// ============================================================================

const SankeyMapView: React.FC<{
  sortMode: SankeySortMode;
  batchMode: boolean;
  checkedIds: Set<string>;
  onCheckToggle: (id: string) => void;
  onSectionCheck: (ids: string[]) => void;
  removedIds: Set<string>;
  onRemoveCard: (id: string) => void;
  onVisibleCountChange: (count: number) => void;
}> = ({ sortMode, batchMode, checkedIds, onCheckToggle, onSectionCheck, removedIds, onRemoveCard, onVisibleCountChange }) => {
  const { state, dispatch } = usePopHealth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });

  const navigatorOpen = state.sankeyNavigatorBandId !== null;

  // ResizeObserver for container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute Sankey data (filtered if selection active)
  const sankeyData = useMemo(() => {
    const hasSelection =
      state.dimensionSelection.conditions.length > 0 ||
      state.dimensionSelection.preventive.length > 0 ||
      state.dimensionSelection.riskTiers.length > 0 ||
      state.dimensionSelection.actionStatuses.length > 0;

    if (hasSelection) {
      return filterSankeyData(
        ALL_PATIENTS,
        state.dimensionSelection,
        CONDITION_COHORTS,
        PREVENTIVE_COHORTS,
      );
    }
    return computeSankeyData(ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS);
  }, [state.dimensionSelection]);

  // Band click → unified: select dimension AND open navigator
  const handleBandClick = useCallback(
    (bandId: string, axis: 'left' | 'center' | 'right') => {
      let dimensionAxis: keyof DimensionSelection;
      let dimensionId: string;
      if (axis === 'center') {
        dimensionAxis = 'riskTiers';
        dimensionId = bandId.replace(/^risk-/, '');
      } else if (axis === 'right') {
        dimensionAxis = 'actionStatuses';
        dimensionId = bandId.replace(/^action-/, '');
      } else {
        dimensionAxis = bandId.startsWith('prev-') ? 'preventive' : 'conditions';
        dimensionId = bandId;
      }
      dispatch({ type: 'DIMENSION_TOGGLED', axis: dimensionAxis, id: dimensionId });
    },
    [dispatch],
  );

  const handleBandHover = useCallback(
    (bandId: string | null) => {
      dispatch({ type: 'BAND_HOVERED', bandId });
    },
    [dispatch],
  );

  const handleBackgroundClick = useCallback(() => {
    dispatch({ type: 'DIMENSIONS_CLEARED' });
  }, [dispatch]);

  const handleCardDetails = useCallback((itemId: string) => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'priority-detail', priorityItemId: itemId } });
  }, [dispatch]);

  // All axes hidden?
  const allHidden = !state.axisVisibility.conditions &&
    !state.axisVisibility.preventive &&
    !state.axisVisibility.riskLevel &&
    !state.axisVisibility.actionStatus;

  // When chips are showing (selection active), chips already push content below
  // the nav bar — no extra paddingTop needed. When no chips, keep nav clearance.
  const hasSelection =
    state.dimensionSelection.conditions.length > 0 ||
    state.dimensionSelection.preventive.length > 0 ||
    state.dimensionSelection.riskTiers.length > 0 ||
    state.dimensionSelection.actionStatuses.length > 0;

  // SVG height: subtract 80px for fixed AI bar clearance, with a 400px minimum
  const svgHeight = Math.max(containerSize.height - 80, 400);

  // Recompute layout using adjusted height (compact padding when navigator open)
  const adjustedLayout = useMemo(
    () =>
      computeSankeyLayout(
        sankeyData,
        containerSize.width,
        svgHeight,
        state.axisVisibility,
        navigatorOpen,
      ),
    [sankeyData, containerSize.width, svgHeight, state.axisVisibility, navigatorOpen],
  );

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Sankey chart pane — flexes to fill remaining space after priority column */}
      <div
        ref={containerRef}
        style={{
          flex: '1 1 auto',
          minWidth: navigatorOpen ? 300 : undefined,
          position: 'relative',
          overflow: 'auto',
          paddingTop: hasSelection ? 0 : LAYOUT.headerHeight,
          transition: 'flex 300ms ease',
        }}
      >
        {allHidden ? (
          <EmptyMessage
            title="No axes visible"
            description="Enable at least one dimension axis to view the Sankey diagram."
          />
        ) : (
          <div style={{ minHeight: 400 }}>
            <SankeyChart
              layout={adjustedLayout}
              dimensionSelection={state.dimensionSelection}
              hoveredBandId={state.hoveredBandId}
              onBandClick={handleBandClick}
              onBandHover={handleBandHover}
              compact={navigatorOpen}
              navigatorBandId={state.sankeyNavigatorBandId}
              onBackgroundClick={handleBackgroundClick}
            />
          </div>
        )}
      </div>

      {/* Sankey priority column — slides in at 60% */}
      {navigatorOpen && state.sankeyNavigatorBandId && (
        <SankeyPriorityColumn
          bandId={state.sankeyNavigatorBandId}
          dimensionSelection={state.dimensionSelection}
          sortMode={sortMode}
          batchMode={batchMode}
          checkedIds={checkedIds}
          onCheckToggle={onCheckToggle}
          onSectionCheck={onSectionCheck}
          removedIds={removedIds}
          onRemoveCard={onRemoveCard}
          onVisibleCountChange={onVisibleCountChange}
          onCardDetails={handleCardDetails}
          onClearFilters={() => dispatch({ type: 'DIMENSIONS_CLEARED' })}
        />
      )}
    </div>
  );
};

SankeyMapView.displayName = 'SankeyMapView';

// ============================================================================
// Empty message
// ============================================================================

const EmptyMessage: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 12,
    padding: spaceAround.spacious,
  }}>
    <span style={{
      fontSize: 15,
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.semibold,
      color: colors.fg.neutral.secondary,
    }}>
      {title}
    </span>
    <span style={{
      fontSize: 13,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.spotReadable,
      textAlign: 'center',
      maxWidth: 300,
    }}>
      {description}
    </span>
    {action}
  </div>
);

EmptyMessage.displayName = 'EmptyMessage';

// ============================================================================
// Placeholder views
// ============================================================================

const TablePlaceholder: React.FC = () => (
  <EmptyMessage
    title="Table View"
    description="Sortable, filterable patient table with condition, risk, and action columns. Coming soon."
  />
);

TablePlaceholder.displayName = 'TablePlaceholder';

// ============================================================================
// DimensionFilterChips
// ============================================================================

const DimensionFilterChips: React.FC<{
  sortMode?: SankeySortMode;
  onSortChange?: (mode: SankeySortMode) => void;
  navigatorOpen?: boolean;
  batchMode?: boolean;
  onBatchToggle?: () => void;
  // Batch bar props (used when batchMode is true)
  batchPickerMode?: 'default' | 'defer' | 'assign';
  onBatchPickerModeChange?: (mode: 'default' | 'defer' | 'assign') => void;
  checkedCount?: number;
  visibleItemCount?: number;
  onBatchDefer?: () => void;
  onBatchAssign?: () => void;
  onExitBatch?: () => void;
}> = ({
  sortMode, onSortChange, navigatorOpen,
  batchMode, onBatchToggle,
  batchPickerMode, onBatchPickerModeChange,
  checkedCount = 0, visibleItemCount = 0,
  onBatchDefer, onBatchAssign, onExitBatch,
}) => {
  const { state, dispatch } = usePopHealth();
  const sel = state.dimensionSelection;

  const chips = useMemo(() => {
    const items: { key: string; label: string; axis: keyof DimensionSelection; id: string }[] = [];

    for (const id of sel.conditions) {
      items.push({ key: `cond-${id}`, label: getConditionLabel(id), axis: 'conditions', id });
    }
    for (const id of sel.preventive) {
      items.push({ key: `prev-${id}`, label: getPreventiveLabel(id), axis: 'preventive', id });
    }
    for (const tier of sel.riskTiers) {
      items.push({ key: `risk-${tier}`, label: RISK_TIER_LABELS[tier], axis: 'riskTiers', id: tier });
    }
    for (const status of sel.actionStatuses) {
      items.push({ key: `action-${status}`, label: ACTION_STATUS_LABELS[status], axis: 'actionStatuses', id: status });
    }

    return items;
  }, [sel]);

  if (chips.length === 0) return null;

  // Shared bar container style
  const barStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    paddingTop: LAYOUT.headerHeight + spaceAround.tight,
    flexWrap: 'wrap',
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    ...glass.floating,
  };

  // ---- Batch bar mode ----
  if (batchMode && navigatorOpen) {
    const actionBtnBase: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: 28,
      padding: '0 10px',
      fontSize: 12,
      fontWeight: typography.fontWeight.medium,
      fontFamily: typography.fontFamily.sans,
      borderRadius: borderRadius.full,
      ...glass.secondary,
      border: 'none',
      transition: `background ${transitions.fast}`,
    };

    return (
      <div style={barStyle}>
        {batchPickerMode === 'default' && (
          <>
            <span style={{
              fontSize: 12,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.secondary,
              whiteSpace: 'nowrap',
            }}>
              Batch Edit:
            </span>
            {sortMode !== undefined && onSortChange && (
              <SelectDropdown
                value={sortMode}
                items={SORT_ITEMS}
                onChange={onSortChange}
                position="bottom-left"
                testID="sankey-sort-dropdown"
              />
            )}
            <span style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.secondary,
              whiteSpace: 'nowrap',
            }}>
              {checkedCount} of {visibleItemCount}
            </span>
            <div style={{ flex: 1 }} />
            <button
              style={{
                ...actionBtnBase,
                color: checkedCount > 0 ? colors.fg.neutral.primary : colors.fg.neutral.disabled,
                cursor: checkedCount > 0 ? 'pointer' : 'default',
              }}
              onClick={() => checkedCount > 0 && onBatchPickerModeChange?.('defer')}
              data-testid="sankey-batch-defer"
            >
              Defer ▾
            </button>
            <button
              style={{
                ...actionBtnBase,
                color: checkedCount > 0 ? colors.fg.neutral.primary : colors.fg.neutral.disabled,
                cursor: checkedCount > 0 ? 'pointer' : 'default',
              }}
              onClick={() => checkedCount > 0 && onBatchPickerModeChange?.('assign')}
              data-testid="sankey-batch-assign"
            >
              Assign ▾
            </button>
            <button
              style={{
                ...actionBtnBase,
                color: colors.fg.neutral.primary,
                cursor: 'pointer',
              }}
              onClick={onExitBatch}
              data-testid="sankey-batch-cancel"
            >
              Cancel
            </button>
          </>
        )}
        {batchPickerMode === 'defer' && (
          <>
            {DEFER_OPTIONS.map((opt) => (
              <button
                key={opt}
                style={{ ...actionBtnBase, color: colors.fg.neutral.primary, cursor: 'pointer' }}
                onClick={onBatchDefer}
              >
                {opt}
              </button>
            ))}
            <button
              style={{ ...actionBtnBase, color: colors.fg.neutral.secondary, cursor: 'pointer' }}
              onClick={() => onBatchPickerModeChange?.('default')}
            >
              Cancel
            </button>
          </>
        )}
        {batchPickerMode === 'assign' && (
          <>
            {ASSIGN_OPTIONS.map((opt) => (
              <button
                key={opt}
                style={{ ...actionBtnBase, color: colors.fg.neutral.primary, cursor: 'pointer' }}
                onClick={onBatchAssign}
              >
                {opt}
              </button>
            ))}
            <button
              style={{ ...actionBtnBase, color: colors.fg.neutral.secondary, cursor: 'pointer' }}
              onClick={() => onBatchPickerModeChange?.('default')}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  }

  // ---- Normal chips mode ----
  // Group chips by Sankey axis column: left (conditions+preventive), center (riskTiers), right (actionStatuses)
  const leftChips = chips.filter(c => c.axis === 'conditions' || c.axis === 'preventive');
  const centerChips = chips.filter(c => c.axis === 'riskTiers');
  const rightChips = chips.filter(c => c.axis === 'actionStatuses');
  const groups = [leftChips, centerChips, rightChips].filter(g => g.length > 0);

  return (
    <div style={barStyle}>
      {/* Sort pill — leading, before chips (navigator only) */}
      {navigatorOpen && sortMode !== undefined && onSortChange && (
        <>
          <SelectDropdown
            value={sortMode}
            items={SORT_ITEMS}
            onChange={onSortChange}
            position="bottom-left"
            testID="sankey-sort-dropdown"
          />
          <span style={{
            width: 1,
            height: 16,
            backgroundColor: colors.border.neutral.low,
            flexShrink: 0,
          }} />
        </>
      )}
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && (
            <span style={{
              width: 1,
              height: 16,
              backgroundColor: colors.border.neutral.low,
              flexShrink: 0,
            }} />
          )}
          {group.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => dispatch({ type: 'DIMENSION_TOGGLED', axis: chip.axis, id: chip.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: 26,
                padding: '0 8px 0 10px',
                fontSize: 12,
                fontFamily: typography.fontFamily.sans,
                fontWeight: typography.fontWeight.medium,
                color: colors.fg.accent.primary,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.accent.medium}`,
                borderRadius: borderRadius.full,
                cursor: 'pointer',
                transition: `all ${transitions.fast}`,
              }}
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </React.Fragment>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'DIMENSIONS_CLEARED' })}
          style={{
            height: 26,
            padding: '0 10px',
            fontSize: 12,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.spotReadable,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Clear all
        </button>
      )}
      {/* Batch toggle — trailing, after spacer (navigator only) */}
      {navigatorOpen && onBatchToggle && (
        <>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onBatchToggle}
            data-testid="sankey-batch-toggle"
            style={{
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
            }}
          >
            <LayoutGrid size={12} /> Batch
          </button>
        </>
      )}
    </div>
  );
};

DimensionFilterChips.displayName = 'DimensionFilterChips';

// ============================================================================
// AllPatientsCanvas (main export)
// ============================================================================

export const AllPatientsCanvas: React.FC = () => {
  const { state, dispatch, isDrawerOpen, currentDrawerView, canDrawerGoBack } = usePopHealth();
  const [sortMode, setSortMode] = useState<SankeySortMode>('urgency');
  const [batchMode, setBatchMode] = useState(false);
  const [batchPickerMode, setBatchPickerMode] = useState<'default' | 'defer' | 'assign'>('default');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [visibleItemCount, setVisibleItemCount] = useState(0);
  const navigatorOpen = state.sankeyNavigatorBandId !== null;

  // Reset all batch + sort state when navigator band changes
  useEffect(() => {
    setSortMode('urgency');
    setBatchMode(false);
    setBatchPickerMode('default');
    setCheckedIds(new Set());
    setRemovedIds(new Set());
  }, [state.sankeyNavigatorBandId]);

  // Reset picker when batch mode exits
  useEffect(() => {
    if (!batchMode) {
      setBatchPickerMode('default');
      setCheckedIds(new Set());
    }
  }, [batchMode]);

  const handleBatchToggle = useCallback(() => {
    setBatchMode((prev) => !prev);
  }, []);

  const handleExitBatch = useCallback(() => {
    setBatchMode(false);
  }, []);

  const handleCheckToggle = useCallback((id: string) => {
    setCheckedIds((prev) => toggleInSet(prev, id));
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleVisibleCountChange = useCallback((count: number) => {
    setVisibleItemCount(count);
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

  const handleSectionCheck = useCallback((sectionIds: string[]) => {
    setCheckedIds((prev) => {
      const allChecked = sectionIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allChecked) {
        for (const id of sectionIds) next.delete(id);
      } else {
        for (const id of sectionIds) next.add(id);
      }
      return next;
    });
  }, []);

  // Keyboard shortcuts 1/2/3 for Map/Routing/Table (all-patients mode only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (state.routingTargetCohortId) return; // Don't register all-patients shortcuts when viewing cohort
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      if (index === 1) dispatch({ type: 'ALL_PATIENTS_VIEW_CHANGED', view: 'map' });
      if (index === 2) dispatch({ type: 'ALL_PATIENTS_VIEW_CHANGED', view: 'routing' });
      if (index === 3) dispatch({ type: 'ALL_PATIENTS_VIEW_CHANGED', view: 'table' });
    };
    window.addEventListener('ehr:context-segment', handler);
    return () => window.removeEventListener('ehr:context-segment', handler);
  }, [dispatch, state.routingTargetCohortId]);

  // Keyboard shortcuts 1/2 for Flow/Table (cohort mode — when routing-navigated)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!state.routingTargetCohortId) return;
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      if (index === 1) dispatch({ type: 'VIEW_CHANGED', view: 'flow' });
      if (index === 2) dispatch({ type: 'VIEW_CHANGED', view: 'table' });
    };
    window.addEventListener('ehr:context-segment', handler);
    return () => window.removeEventListener('ehr:context-segment', handler);
  }, [dispatch, state.routingTargetCohortId]);

  // When routing-navigated, delegate to cohort canvas
  if (state.routingTargetCohortId) {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
        data-testid="all-patients-canvas"
      >
        <PopHealthCanvas />
      </div>
    );
  }

  const isPriorityDetail = currentDrawerView?.type === 'priority-detail';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
      data-testid="all-patients-canvas"
    >
      {/* Filter chips overlay */}
      <DimensionFilterChips
        sortMode={sortMode}
        onSortChange={setSortMode}
        navigatorOpen={navigatorOpen}
        batchMode={batchMode}
        onBatchToggle={handleBatchToggle}
        batchPickerMode={batchPickerMode}
        onBatchPickerModeChange={setBatchPickerMode}
        checkedCount={checkedIds.size}
        visibleItemCount={visibleItemCount}
        onBatchDefer={handleBatchDefer}
        onBatchAssign={handleBatchAssign}
        onExitBatch={handleExitBatch}
      />

      {/* Main view */}
      {state.allPatientsView === 'map' && (
        <SankeyMapView
          sortMode={sortMode}
          batchMode={batchMode}
          checkedIds={checkedIds}
          onCheckToggle={handleCheckToggle}
          onSectionCheck={handleSectionCheck}
          removedIds={removedIds}
          onRemoveCard={handleRemoveCard}
          onVisibleCountChange={handleVisibleCountChange}
        />
      )}
      {state.allPatientsView === 'routing' && <RoutingView />}
      {state.allPatientsView === 'table' && <TablePlaceholder />}

      {/* Standard drawer (filter, dimension-detail) — hidden when priority-detail is active */}
      <SlideDrawer
        open={isDrawerOpen && !isPriorityDetail}
        onClose={() => dispatch({ type: 'DRAWER_CLOSED' })}
        showBack={canDrawerGoBack}
        onBack={() => dispatch({ type: 'DRAWER_BACK' })}
        header={
          currentDrawerView?.type === 'dimension-detail' ? (
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.primary,
            }}>
              Dimension Details
            </span>
          ) : currentDrawerView?.type === 'filter' ? (
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.primary,
            }}>
              Filters
            </span>
          ) : undefined
        }
        testID="all-patients-drawer"
      >
        {currentDrawerView?.type === 'filter' && (
          <div style={{ padding: 20, color: colors.fg.neutral.secondary, fontSize: 13, fontFamily: typography.fontFamily.sans }}>
            Advanced filter controls for all-patients view.
          </div>
        )}
        {currentDrawerView?.type === 'dimension-detail' && (
          <div style={{ padding: 20, color: colors.fg.neutral.secondary, fontSize: 13, fontFamily: typography.fontFamily.sans }}>
            Details for dimension: {currentDrawerView.dimensionId}
          </div>
        )}
      </SlideDrawer>

      {/* Priority detail drawer — wide, self-contained (same dual-drawer pattern as PopHealthCanvas) */}
      {isPriorityDetail && currentDrawerView.type === 'priority-detail' && (
        <PriorityDetailView
          priorityItemId={currentDrawerView.priorityItemId}
          open={isDrawerOpen}
          onClose={() => dispatch({ type: 'DRAWER_CLOSED' })}
          showBack={canDrawerGoBack}
          onBack={canDrawerGoBack ? () => dispatch({ type: 'DRAWER_BACK' }) : undefined}
        />
      )}
    </div>
  );
};

AllPatientsCanvas.displayName = 'AllPatientsCanvas';
