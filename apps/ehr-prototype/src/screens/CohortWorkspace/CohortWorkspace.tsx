/**
 * CohortWorkspace
 *
 * Cohort-scoped workspace — wraps PopHealthCanvas in PopHealthProvider.
 * Also exports slot-filling sub-components for AppShell's scope routing:
 * - CohortCanvasHeader — Flow/Table segmented control
 * - CohortAIBar — BottomBarContainer with cohort context defaults
 */

import React, { useEffect, useState } from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { PopHealthCanvas } from '../PopHealthView/PopHealthCanvas';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';
import { BottomBarContainer } from '../../components/bottom-bar/BottomBarContainer';
import { Layers, Table2, Search, SlidersHorizontal } from 'lucide-react';
import { colors, typography, transitions, glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from '../../styles/foundations';

// ============================================================================
// CohortWorkspace
// ============================================================================

/**
 * CohortWorkspace renders inside PopHealthProvider (provided by AppShell when
 * viewMode === 'cohort'). It does NOT wrap its own PopHealthProvider — that
 * would shadow the one that CohortCanvasHeader and CohortContextPane read from
 * in the header/overview AdaptiveLayout slots.
 */
export const CohortWorkspace: React.FC<{ cohortId: string }> = ({ cohortId }) => (
  <CohortWorkspaceInner />
);

CohortWorkspace.displayName = 'CohortWorkspace';

/** Inner component — must be inside PopHealthProvider */
const CohortWorkspaceInner: React.FC = () => {
  const { dispatch } = usePopHealth();

  // Keyboard shortcut handler for cohort context segments (1/2/3)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      if (index === 1) dispatch({ type: 'VIEW_CHANGED', view: 'flow' });
      if (index === 2) dispatch({ type: 'VIEW_CHANGED', view: 'table' });
      // index 3+: no-op in cohort mode
    };
    window.addEventListener('ehr:context-segment', handler);
    return () => window.removeEventListener('ehr:context-segment', handler);
  }, [dispatch]);

  return <PopHealthCanvas />;
};

CohortWorkspaceInner.displayName = 'CohortWorkspaceInner';

// ============================================================================
// CohortCanvasHeader — Search + Flow/Table segmented control + Filter button
// (must be inside PopHealthProvider)
// ============================================================================

export const CohortCanvasHeader: React.FC = () => {
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
      {/* Flow/Table segmented control */}
      <SegmentedControl
        segments={[
          { key: 'flow' as const, label: 'Flow', icon: <Layers size={14} /> },
          { key: 'table' as const, label: 'Table', icon: <Table2 size={14} /> },
        ]}
        value={state.activeView}
        onChange={(view) => dispatch({ type: 'VIEW_CHANGED', view })}
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
          width: 200,
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
          placeholder="Search nodes..."
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

CohortCanvasHeader.displayName = 'CohortCanvasHeader';

// ============================================================================
// CohortAIBar — BottomBarContainer with cohort-scoped defaults
// ============================================================================

const COHORT_CANNED_QUERIES = [
  'Show patients with A1c > 9%',
  'Which patients are overdue for follow-up?',
  'Summarize escalated patients',
  'List patients not seen in 6+ months',
];

export const CohortAIBar: React.FC = () => {
  // CohortAIBar renders outside the PopHealthProvider tree (it's in the AI bar slot
  // which is below AdaptiveLayout). For now, use a minimal setup with no PopHealth state.
  return (
    <BottomBarContainer
      patientName=""
      contextTarget={{ type: 'encounter', label: 'Cohort' }}
      availableContextLevels={['encounter']}
      suggestions={[]}
      cannedQueries={COHORT_CANNED_QUERIES}
      transcriptionEnabled={false}
    />
  );
};

CohortAIBar.displayName = 'CohortAIBar';
