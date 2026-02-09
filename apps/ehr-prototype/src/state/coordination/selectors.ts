/**
 * Coordination State Machine — Selectors
 *
 * Derived state from CoordinationState. These are pure functions
 * that compute what the UI should render.
 *
 * @see COORDINATION_STATE_MACHINE.md §11 (Width Model), §13 (Selectors)
 */

import type { CoordinationState, BottomBarVisibility, PaneView } from './types';

// ---------------------------------------------------------------------------
// Design Token CSS Custom Property Names (spec §11)
// ---------------------------------------------------------------------------

export const GRID_TOKENS = {
  paletteWidth: 'var(--bottom-bar-palette-width)',
  anchorWidth: 'var(--bottom-bar-anchor-width)',
  gap: 'var(--bottom-bar-gap)',
  barRatioTm: 'var(--bottom-bar-bar-ratio-tm)',
  barRatioAi: 'var(--bottom-bar-bar-ratio-ai)',
  minTmBar: 'var(--bottom-bar-min-tm-bar)',
} as const;

// ---------------------------------------------------------------------------
// Bottom Bar Visibility
// ---------------------------------------------------------------------------

/**
 * Determines what the bottom bar should render based on coordination state.
 *
 * @see spec §13 selectBottomBarVisibility example
 */
export function selectBottomBarVisibility(state: CoordinationState): BottomBarVisibility {
  const aiInDrawer = state.aiTier === 'drawer';
  const txInDrawer = state.txTier === 'drawer';
  const aiVisible = !aiInDrawer;
  const txVisible = state.txEligible && !txInDrawer;

  let layout: BottomBarVisibility['layout'];
  if (aiVisible && txVisible) layout = 'two-column';
  else if (aiVisible || txVisible) layout = 'single-column';
  else layout = 'hidden';

  return {
    ai: {
      visible: aiVisible,
      tier: aiVisible ? (state.aiTier as Exclude<typeof state.aiTier, 'drawer'>) : null,
    },
    transcription: {
      visible: txVisible,
      tier: txVisible ? (state.txTier as Exclude<typeof state.txTier, 'drawer'>) : null,
    },
    layout,
  };
}

// ---------------------------------------------------------------------------
// Grid Template
// ---------------------------------------------------------------------------

/**
 * Computes CSS grid-template-columns string using design token var() references.
 *
 * The gap is encoded as a fixed-width column (not CSS `gap` property) so that
 * the grid template fully describes the layout for animation purposes.
 *
 * @see spec §11 "Grid Templates by State"
 */
export function selectGridTemplate(state: CoordinationState): string {
  const vis = selectBottomBarVisibility(state);

  if (vis.layout === 'hidden') {
    return 'none';
  }

  if (vis.layout === 'single-column') {
    // Solo module at bar or palette → always palette token width
    return GRID_TOKENS.paletteWidth;
  }

  // Two-column: both AI and TM visible in bottom bar
  const aiTier = vis.ai.tier!;
  const txTier = vis.transcription.tier!;

  // AI palette + TM anchor (E3/E4): TM on left, AI on right
  // Note: TM is always the left column, AI is always the right column
  if (aiTier === 'palette' && txTier === 'anchor') {
    return `${GRID_TOKENS.anchorWidth} ${GRID_TOKENS.gap} ${GRID_TOKENS.paletteWidth}`;
  }

  // TM palette + AI anchor (E5/E6): TM on left, AI on right
  if (txTier === 'palette' && aiTier === 'anchor') {
    return `${GRID_TOKENS.paletteWidth} ${GRID_TOKENS.gap} ${GRID_TOKENS.anchorWidth}`;
  }

  // Both at bar (E1/E2): proportional with TM having min floor
  return `minmax(${GRID_TOKENS.minTmBar}, ${GRID_TOKENS.barRatioTm}) ${GRID_TOKENS.gap} ${GRID_TOKENS.barRatioAi}`;
}

// ---------------------------------------------------------------------------
// Convenience Selectors
// ---------------------------------------------------------------------------

/**
 * Whether the bottom bar should be hidden entirely (no modules visible).
 */
export function selectIsBottomBarHidden(state: CoordinationState): boolean {
  return selectBottomBarVisibility(state).layout === 'hidden';
}

/**
 * What the left pane should render.
 */
export function selectPaneContent(state: CoordinationState): PaneView {
  return state.paneView;
}

/**
 * Whether a specific module is currently in the drawer.
 */
export function selectIsModuleInDrawer(
  state: CoordinationState,
  module: 'ai' | 'tm'
): boolean {
  if (module === 'ai') return state.aiTier === 'drawer';
  return state.txTier === 'drawer';
}

/**
 * Whether any module is at palette tier in the bottom bar.
 */
export function selectHasPaletteOpen(state: CoordinationState): boolean {
  return state.aiTier === 'palette' || (state.txEligible && state.txTier === 'palette');
}
