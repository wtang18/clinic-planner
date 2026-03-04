/**
 * FilterBar Component
 *
 * Renders filter chips below the canvas top bar.
 * Chip dismiss removes filter; pre-populated filters per pathway.
 */

import React, { useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { DEFAULT_PATHWAY_FILTERS } from '../../data/mock-population-health';
import type { PopHealthFilter } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

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

  if (state.filters.length === 0) {
    return null;
  }

  return (
    <div style={barStyles.container} data-testid="filter-bar">
      <span style={barStyles.label}>Filters:</span>
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
  label: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
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
};
