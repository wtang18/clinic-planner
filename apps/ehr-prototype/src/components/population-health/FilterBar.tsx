/**
 * FilterBar Component
 *
 * Always-visible bar with lifecycle toggle buttons, filter chips, and inline search.
 * Layout: [Lifecycle toggles] [Filter chips] [Clear all] [--- spacer ---] [Search input]
 */

import React, { useCallback, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { DEFAULT_PATHWAY_FILTERS } from '../../data/mock-population-health';
import type { PopHealthFilter, NodeLifecycleState } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Lifecycle Toggle
// ============================================================================

const LIFECYCLE_TOGGLES: { state: NodeLifecycleState; label: string }[] = [
  { state: 'active', label: 'Active' },
  { state: 'paused', label: 'Paused' },
  { state: 'draft', label: 'Draft' },
];

interface LifecycleToggleProps {
  lifecycleState: NodeLifecycleState;
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

const LifecycleToggle: React.FC<LifecycleToggleProps> = ({ label, isActive, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: borderRadius.full,
      fontSize: 11,
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.medium,
      border: `1px solid ${isActive ? colors.bg.accent.subtle : colors.border.neutral.low}`,
      backgroundColor: isActive ? colors.bg.accent.subtle : colors.bg.neutral.subtle,
      color: isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: `all ${transitions.fast}`,
    }}
    data-testid={`lifecycle-toggle-${label.toLowerCase()}`}
  >
    {label}
  </button>
);

// ============================================================================
// Filter Chip
// ============================================================================

const FilterChip: React.FC<{ filter: PopHealthFilter; onRemove: () => void }> = ({ filter, onRemove }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px 2px 10px',
        backgroundColor: colors.bg.accent.subtle,
        color: colors.fg.accent.primary,
        borderRadius: borderRadius.full,
        fontSize: 12,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        whiteSpace: 'nowrap',
        transition: `opacity ${transitions.fast}`,
      }}
    >
      {filter.label}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          color: colors.fg.accent.secondary,
          padding: 0,
          borderRadius: '50%',
        }}
        aria-label={`Remove filter: ${filter.label}`}
      >
        <X size={10} />
      </button>
    </span>
  );
};

// ============================================================================
// FilterBar Component
// ============================================================================

export const FilterBar: React.FC = () => {
  const { state, dispatch } = usePopHealth();

  // Auto-populate default filters when pathway changes
  const selectedPathwayId = state.selectedPathwayIds[0];
  useEffect(() => {
    if (selectedPathwayId && state.filters.length === 0) {
      const defaults = DEFAULT_PATHWAY_FILTERS[selectedPathwayId];
      if (defaults) {
        defaults.forEach((f) => dispatch({ type: 'FILTER_ADDED', filter: f }));
      }
    }
  }, [selectedPathwayId]); // Only on pathway change

  const handleRemove = (filterId: string) => {
    dispatch({ type: 'FILTER_REMOVED', filterId });
  };

  const handleLifecycleToggle = useCallback((lifecycleState: NodeLifecycleState) => {
    const current = state.lifecycleFilter;
    const next = current.includes(lifecycleState)
      ? current.filter((s) => s !== lifecycleState)
      : [...current, lifecycleState];
    dispatch({ type: 'LIFECYCLE_FILTER_CHANGED', states: next });
  }, [state.lifecycleFilter, dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SEARCH_CHANGED', query: e.target.value });
  }, [dispatch]);

  const handleClearSearch = useCallback(() => {
    dispatch({ type: 'SEARCH_CHANGED', query: '' });
  }, [dispatch]);

  return (
    <div style={barStyles.container} data-testid="filter-bar">
      {/* Lifecycle toggles */}
      <div style={barStyles.toggleGroup}>
        {LIFECYCLE_TOGGLES.map((t) => (
          <LifecycleToggle
            key={t.state}
            lifecycleState={t.state}
            label={t.label}
            isActive={state.lifecycleFilter.includes(t.state)}
            onToggle={() => handleLifecycleToggle(t.state)}
          />
        ))}
      </div>

      {/* Filter chips */}
      {state.filters.length > 0 && (
        <>
          <span style={barStyles.separator} />
          <div style={barStyles.chips}>
            {state.filters.map((f) => (
              <FilterChip key={f.id} filter={f} onRemove={() => handleRemove(f.id)} />
            ))}
            {state.filters.length > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'FILTERS_CLEARED' })}
                style={barStyles.clearButton}
              >
                Clear all
              </button>
            )}
          </div>
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search input */}
      <div style={barStyles.searchContainer}>
        <Search size={12} style={{ color: colors.fg.neutral.secondary, flexShrink: 0 }} />
        <input
          type="text"
          value={state.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search nodes..."
          style={barStyles.searchInput}
          data-testid="filter-bar-search"
        />
        {state.searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            style={barStyles.searchClear}
            aria-label="Clear search"
          >
            <X size={10} />
          </button>
        )}
      </div>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';

// ============================================================================
// Styles
// ============================================================================

const barStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  toggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.neutral.low,
    flexShrink: 0,
  },
  chips: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexWrap: 'wrap',
  },
  clearButton: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.accent.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
    minWidth: 140,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    padding: 0,
    minWidth: 80,
  },
  searchClear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    padding: 0,
    flexShrink: 0,
  },
};
