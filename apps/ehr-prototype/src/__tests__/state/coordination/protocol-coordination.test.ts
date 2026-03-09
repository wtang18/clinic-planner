/**
 * Tests for protocol-related coordination actions.
 *
 * Covers 5 new actions (OVERVIEW_TAB_CHANGED, PROTOCOL_TAB_AVAILABLE,
 * PROTOCOL_TAB_ACTIVATED, PROTOCOL_TAB_DISMISSED, PROTOCOL_TAB_COMPLETED)
 * plus referencePane reset on ENCOUNTER_EXITED.
 *
 * Also tests the 3 new selectors: selectIsProtocolTabVisible,
 * selectProtocolTabBadge, selectActiveOverviewTab.
 *
 * @see COORDINATION_STATE_MACHINE.md, DESIGN-SPEC.md Phase 1
 */

import { describe, it, expect } from 'vitest';
import { coordinationReducer, initialCoordinationState } from '../../../state/coordination/reducer';
import {
  selectIsProtocolTabVisible,
  selectProtocolTabBadge,
  selectActiveOverviewTab,
} from '../../../state/coordination/selectors';
import type { CoordinationState, CoordinationAction } from '../../../state/coordination/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reduce(state: CoordinationState, action: CoordinationAction): CoordinationState {
  return coordinationReducer(state, action);
}

/** Base encounter state for protocol tests (txEligible=true). */
const E1: CoordinationState = {
  aiTier: 'bar',
  txTier: 'bar',
  paneView: 'menu',
  paneExpanded: true,
  txEligible: true,
  overviewExpanded: true,
  referencePane: { expanded: true, activeTab: 'overview', protocolTabState: 'available' },
};

// ---------------------------------------------------------------------------
// OVERVIEW_TAB_CHANGED
// ---------------------------------------------------------------------------

describe('OVERVIEW_TAB_CHANGED', () => {
  it('switches to activity tab', () => {
    const next = reduce(E1, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'activity' } });
    expect(next.referencePane.activeTab).toBe('activity');
  });

  it('switches from activity back to overview', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, activeTab: 'activity' as const } };
    const next = reduce(state, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'overview' } });
    expect(next.referencePane.activeTab).toBe('overview');
  });

  it('blocks protocol tab when protocolTabState=hidden', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'hidden' as const } };
    const next = reduce(state, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'protocol' } });
    expect(next.referencePane.activeTab).toBe('overview'); // unchanged
  });

  it('allows protocol tab when protocolTabState=available', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'available' as const } };
    const next = reduce(state, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'protocol' } });
    expect(next.referencePane.activeTab).toBe('protocol');
  });

  it('allows protocol tab when protocolTabState=active', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'active' as const } };
    const next = reduce(state, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'protocol' } });
    expect(next.referencePane.activeTab).toBe('protocol');
  });

  it('no-ops when already on the same tab', () => {
    const next = reduce(E1, { type: 'OVERVIEW_TAB_CHANGED', payload: { tab: 'overview' } });
    expect(next).toBe(E1); // reference equality
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_TAB_AVAILABLE
// ---------------------------------------------------------------------------

describe('PROTOCOL_TAB_AVAILABLE', () => {
  it('transitions from hidden to available', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'hidden' as const } };
    const next = reduce(state, { type: 'PROTOCOL_TAB_AVAILABLE' });
    expect(next.referencePane.protocolTabState).toBe('available');
  });

  it('no-ops if already past hidden', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'active' as const } };
    const next = reduce(state, { type: 'PROTOCOL_TAB_AVAILABLE' });
    expect(next).toBe(state); // reference equality — unchanged
  });

  it('does not change active tab', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'hidden' as const } };
    const next = reduce(state, { type: 'PROTOCOL_TAB_AVAILABLE' });
    expect(next.referencePane.activeTab).toBe('overview');
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_TAB_ACTIVATED
// ---------------------------------------------------------------------------

describe('PROTOCOL_TAB_ACTIVATED', () => {
  it('sets protocolTabState=active and auto-switches to protocol tab', () => {
    const state = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'available' as const } };
    const next = reduce(state, { type: 'PROTOCOL_TAB_ACTIVATED' });

    expect(next.referencePane.protocolTabState).toBe('active');
    expect(next.referencePane.activeTab).toBe('protocol');
  });

  it('auto-switches even from activity tab', () => {
    const state = {
      ...E1,
      referencePane: { ...E1.referencePane, protocolTabState: 'available' as const, activeTab: 'activity' as const },
    };
    const next = reduce(state, { type: 'PROTOCOL_TAB_ACTIVATED' });
    expect(next.referencePane.activeTab).toBe('protocol');
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_TAB_DISMISSED
// ---------------------------------------------------------------------------

describe('PROTOCOL_TAB_DISMISSED', () => {
  it('sets protocolTabState=dismissed and returns to overview if on protocol tab', () => {
    const state = {
      ...E1,
      referencePane: { ...E1.referencePane, protocolTabState: 'active' as const, activeTab: 'protocol' as const },
    };
    const next = reduce(state, { type: 'PROTOCOL_TAB_DISMISSED' });

    expect(next.referencePane.protocolTabState).toBe('dismissed');
    expect(next.referencePane.activeTab).toBe('overview');
  });

  it('preserves current tab if not on protocol', () => {
    const state = {
      ...E1,
      referencePane: { ...E1.referencePane, protocolTabState: 'active' as const, activeTab: 'activity' as const },
    };
    const next = reduce(state, { type: 'PROTOCOL_TAB_DISMISSED' });

    expect(next.referencePane.protocolTabState).toBe('dismissed');
    expect(next.referencePane.activeTab).toBe('activity');
  });
});

// ---------------------------------------------------------------------------
// PROTOCOL_TAB_COMPLETED
// ---------------------------------------------------------------------------

describe('PROTOCOL_TAB_COMPLETED', () => {
  it('sets protocolTabState=completed', () => {
    const state = {
      ...E1,
      referencePane: { ...E1.referencePane, protocolTabState: 'active' as const, activeTab: 'protocol' as const },
    };
    const next = reduce(state, { type: 'PROTOCOL_TAB_COMPLETED' });

    expect(next.referencePane.protocolTabState).toBe('completed');
  });

  it('preserves active tab (stays on protocol)', () => {
    const state = {
      ...E1,
      referencePane: { ...E1.referencePane, protocolTabState: 'active' as const, activeTab: 'protocol' as const },
    };
    const next = reduce(state, { type: 'PROTOCOL_TAB_COMPLETED' });
    expect(next.referencePane.activeTab).toBe('protocol');
  });
});

// ---------------------------------------------------------------------------
// ENCOUNTER_EXITED — referencePane reset
// ---------------------------------------------------------------------------

describe('ENCOUNTER_EXITED — referencePane reset', () => {
  it('resets referencePane to defaults', () => {
    const state: CoordinationState = {
      ...E1,
      referencePane: { expanded: false, activeTab: 'protocol', protocolTabState: 'active' },
    };
    const next = reduce(state, { type: 'ENCOUNTER_EXITED' });

    expect(next.referencePane).toEqual({
      expanded: true,
      activeTab: 'overview',
      protocolTabState: 'available',
    });
  });
});

// ---------------------------------------------------------------------------
// OVERVIEW_COLLAPSED / OVERVIEW_EXPANDED — sync with referencePane
// ---------------------------------------------------------------------------

describe('OVERVIEW_COLLAPSED / OVERVIEW_EXPANDED sync', () => {
  it('OVERVIEW_COLLAPSED syncs referencePane.expanded=false', () => {
    const next = reduce(E1, { type: 'OVERVIEW_COLLAPSED' });
    expect(next.overviewExpanded).toBe(false);
    expect(next.referencePane.expanded).toBe(false);
  });

  it('OVERVIEW_EXPANDED syncs referencePane.expanded=true', () => {
    const state: CoordinationState = {
      ...E1,
      overviewExpanded: false,
      referencePane: { ...E1.referencePane, expanded: false },
    };
    const next = reduce(state, { type: 'OVERVIEW_EXPANDED' });
    expect(next.overviewExpanded).toBe(true);
    expect(next.referencePane.expanded).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Protocol-related selectors
// ---------------------------------------------------------------------------

describe('selectIsProtocolTabVisible', () => {
  it('false when hidden', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'hidden' as const } };
    expect(selectIsProtocolTabVisible(s)).toBe(false);
  });

  it('true when available', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'available' as const } };
    expect(selectIsProtocolTabVisible(s)).toBe(true);
  });

  it('true when active', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'active' as const } };
    expect(selectIsProtocolTabVisible(s)).toBe(true);
  });

  it('true when completed', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'completed' as const } };
    expect(selectIsProtocolTabVisible(s)).toBe(true);
  });

  it('true when dismissed', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'dismissed' as const } };
    expect(selectIsProtocolTabVisible(s)).toBe(true);
  });
});

describe('selectProtocolTabBadge', () => {
  it('returns dot for active', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'active' as const } };
    expect(selectProtocolTabBadge(s)).toBe('dot');
  });

  it('returns check for completed', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'completed' as const } };
    expect(selectProtocolTabBadge(s)).toBe('check');
  });

  it('returns null for hidden', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'hidden' as const } };
    expect(selectProtocolTabBadge(s)).toBeNull();
  });

  it('returns null for available', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'available' as const } };
    expect(selectProtocolTabBadge(s)).toBeNull();
  });

  it('returns null for dismissed', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, protocolTabState: 'dismissed' as const } };
    expect(selectProtocolTabBadge(s)).toBeNull();
  });
});

describe('selectActiveOverviewTab', () => {
  it('returns the active tab', () => {
    expect(selectActiveOverviewTab(E1)).toBe('overview');
  });

  it('reflects updated tab', () => {
    const s = { ...E1, referencePane: { ...E1.referencePane, activeTab: 'protocol' as const } };
    expect(selectActiveOverviewTab(s)).toBe('protocol');
  });
});
