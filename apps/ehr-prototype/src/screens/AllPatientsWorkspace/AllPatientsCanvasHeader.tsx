/**
 * AllPatientsCanvasHeader
 *
 * Nav row header for the all-patients scope: Map/Routing/Table segmented
 * control + filter button + search input. Follows CohortCanvasHeader pattern.
 */

import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { colors, typography, transitions, glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from '../../styles/foundations';
import type { AllPatientsView } from '../../types/population-health';

// ============================================================================
// Component
// ============================================================================

export const AllPatientsCanvasHeader: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SEARCH_CHANGED', query: e.target.value });
  };

  const handleFilterClick = () => {
    dispatch({ type: 'DRAWER_OPENED', view: { type: 'filter' } });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Map/Routing/Table segmented control */}
      <SegmentedControl
        segments={[
          { key: 'map' as const, label: 'Map' },
          { key: 'routing' as const, label: 'Routing' },
          { key: 'table' as const, label: 'Table' },
        ]}
        value={state.allPatientsView}
        onChange={(view) => dispatch({ type: 'ALL_PATIENTS_VIEW_CHANGED', view })}
        variant="topBar"
      />

      {/* Filter icon button */}
      <button
        type="button"
        onClick={handleFilterClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: GLASS_BUTTON_HEIGHT,
          height: GLASS_BUTTON_HEIGHT,
          ...glass.button,
          borderRadius: GLASS_BUTTON_RADIUS,
          cursor: 'pointer',
          color: colors.fg.neutral.primary,
          transition: `all ${transitions.fast}`,
        }}
        aria-label="Open filter controls"
        title="Filters"
      >
        <SlidersHorizontal size={16} />
      </button>

      {/* Glassmorphic search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: GLASS_BUTTON_HEIGHT,
          width: isSearchFocused ? 240 : 160,
          ...glass.button,
          borderRadius: GLASS_BUTTON_RADIUS,
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
          transition: `all ${transitions.fast}`,
          border: isSearchFocused ? `1px solid ${colors.border.accent.medium}` : glass.button.border,
        }}
      >
        <Search size={14} color={colors.fg.neutral.secondary} style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search patients..."
          value={state.searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.primary,
          }}
        />
      </div>
    </div>
  );
};

AllPatientsCanvasHeader.displayName = 'AllPatientsCanvasHeader';
