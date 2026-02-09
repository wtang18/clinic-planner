/**
 * Tests for coordination state machine selectors.
 *
 * Verifies grid template output for each of the 15 valid states matches spec §11.
 *
 * @see COORDINATION_STATE_MACHINE.md §11 (Width Model), §13 (Selectors)
 */

import { describe, it, expect } from 'vitest';
import {
  selectBottomBarVisibility,
  selectGridTemplate,
  selectIsBottomBarHidden,
  selectPaneContent,
  selectIsModuleInDrawer,
  selectHasPaletteOpen,
  GRID_TOKENS,
} from '../../../state/coordination/selectors';
import type { CoordinationState } from '../../../state/coordination/types';

// ---------------------------------------------------------------------------
// Named States
// ---------------------------------------------------------------------------

const S = {
  N1: { aiTier: 'bar' as const,     txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: true,  txEligible: false },
  N2: { aiTier: 'bar' as const,     txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: false, txEligible: false },
  N3: { aiTier: 'palette' as const, txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: true,  txEligible: false },
  N4: { aiTier: 'palette' as const, txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: false, txEligible: false },
  N5: { aiTier: 'drawer' as const,  txTier: 'bar' as const, paneView: 'ai' as const,     paneExpanded: true,  txEligible: false },

  E1: { aiTier: 'bar' as const,     txTier: 'bar' as const,     paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E2: { aiTier: 'bar' as const,     txTier: 'bar' as const,     paneView: 'menu' as const, paneExpanded: false, txEligible: true },
  E3: { aiTier: 'palette' as const, txTier: 'anchor' as const,  paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E4: { aiTier: 'palette' as const, txTier: 'anchor' as const,  paneView: 'menu' as const, paneExpanded: false, txEligible: true },
  E5: { aiTier: 'anchor' as const,  txTier: 'palette' as const, paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E6: { aiTier: 'anchor' as const,  txTier: 'palette' as const, paneView: 'menu' as const, paneExpanded: false, txEligible: true },

  E7:  { aiTier: 'drawer' as const,  txTier: 'bar' as const,     paneView: 'ai' as const,         paneExpanded: true, txEligible: true },
  E8:  { aiTier: 'drawer' as const,  txTier: 'palette' as const, paneView: 'ai' as const,         paneExpanded: true, txEligible: true },
  E9:  { aiTier: 'bar' as const,     txTier: 'drawer' as const,  paneView: 'transcript' as const, paneExpanded: true, txEligible: true },
  E10: { aiTier: 'palette' as const, txTier: 'drawer' as const,  paneView: 'transcript' as const, paneExpanded: true, txEligible: true },
};

// ---------------------------------------------------------------------------
// selectBottomBarVisibility
// ---------------------------------------------------------------------------

describe('selectBottomBarVisibility', () => {
  it('N1/N2: AI visible at bar, TM not visible (txEligible=false)', () => {
    const vis = selectBottomBarVisibility(S.N1);
    expect(vis.ai).toEqual({ visible: true, tier: 'bar' });
    expect(vis.transcription).toEqual({ visible: false, tier: null });
    expect(vis.layout).toBe('single-column');
  });

  it('N5: AI in drawer → hidden, TM not visible → hidden layout', () => {
    const vis = selectBottomBarVisibility(S.N5);
    expect(vis.ai).toEqual({ visible: false, tier: null });
    expect(vis.transcription).toEqual({ visible: false, tier: null });
    expect(vis.layout).toBe('hidden');
  });

  it('E1: Both visible at bar → two-column', () => {
    const vis = selectBottomBarVisibility(S.E1);
    expect(vis.ai).toEqual({ visible: true, tier: 'bar' });
    expect(vis.transcription).toEqual({ visible: true, tier: 'bar' });
    expect(vis.layout).toBe('two-column');
  });

  it('E3: AI palette, TM anchor → two-column', () => {
    const vis = selectBottomBarVisibility(S.E3);
    expect(vis.ai).toEqual({ visible: true, tier: 'palette' });
    expect(vis.transcription).toEqual({ visible: true, tier: 'anchor' });
    expect(vis.layout).toBe('two-column');
  });

  it('E7: AI in drawer, TM at bar → single-column', () => {
    const vis = selectBottomBarVisibility(S.E7);
    expect(vis.ai).toEqual({ visible: false, tier: null });
    expect(vis.transcription).toEqual({ visible: true, tier: 'bar' });
    expect(vis.layout).toBe('single-column');
  });

  it('E9: TM in drawer, AI at bar → single-column', () => {
    const vis = selectBottomBarVisibility(S.E9);
    expect(vis.ai).toEqual({ visible: true, tier: 'bar' });
    expect(vis.transcription).toEqual({ visible: false, tier: null });
    expect(vis.layout).toBe('single-column');
  });
});

// ---------------------------------------------------------------------------
// selectGridTemplate (spec §11)
// ---------------------------------------------------------------------------

describe('selectGridTemplate', () => {
  // Single-column states: solo module at palette token width
  it.each([
    ['N1', S.N1], ['N2', S.N2], ['N3', S.N3], ['N4', S.N4],
    ['E7', S.E7], ['E8', S.E8], ['E9', S.E9], ['E10', S.E10],
  ])('%s: single-column → palette-width token', (id, state) => {
    expect(selectGridTemplate(state)).toBe(GRID_TOKENS.paletteWidth);
  });

  // Hidden state
  it('N5: hidden → none', () => {
    expect(selectGridTemplate(S.N5)).toBe('none');
  });

  // Two-column: both at bar (proportional)
  it.each([['E1', S.E1], ['E2', S.E2]])(
    '%s: both at bar → proportional grid',
    (id, state) => {
      const template = selectGridTemplate(state);
      expect(template).toContain(GRID_TOKENS.barRatioTm);
      expect(template).toContain(GRID_TOKENS.barRatioAi);
      expect(template).toContain(GRID_TOKENS.minTmBar);
      expect(template).toContain(GRID_TOKENS.gap);
    }
  );

  // AI palette + TM anchor
  it.each([['E3', S.E3], ['E4', S.E4]])(
    '%s: AI palette + TM anchor → anchor gap palette',
    (id, state) => {
      const template = selectGridTemplate(state);
      expect(template).toBe(
        `${GRID_TOKENS.anchorWidth} ${GRID_TOKENS.gap} ${GRID_TOKENS.paletteWidth}`
      );
    }
  );

  // TM palette + AI anchor
  it.each([['E5', S.E5], ['E6', S.E6]])(
    '%s: TM palette + AI anchor → palette gap anchor',
    (id, state) => {
      const template = selectGridTemplate(state);
      expect(template).toBe(
        `${GRID_TOKENS.paletteWidth} ${GRID_TOKENS.gap} ${GRID_TOKENS.anchorWidth}`
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Convenience Selectors
// ---------------------------------------------------------------------------

describe('selectIsBottomBarHidden', () => {
  it('N5 is hidden (AI in drawer, no TM)', () => {
    expect(selectIsBottomBarHidden(S.N5)).toBe(true);
  });

  it('E1 is not hidden', () => {
    expect(selectIsBottomBarHidden(S.E1)).toBe(false);
  });

  it('E7 is not hidden (TM bar still visible)', () => {
    expect(selectIsBottomBarHidden(S.E7)).toBe(false);
  });
});

describe('selectPaneContent', () => {
  it('returns paneView directly', () => {
    expect(selectPaneContent(S.E1)).toBe('menu');
    expect(selectPaneContent(S.E7)).toBe('ai');
    expect(selectPaneContent(S.E9)).toBe('transcript');
  });
});

describe('selectIsModuleInDrawer', () => {
  it('AI in drawer when aiTier=drawer', () => {
    expect(selectIsModuleInDrawer(S.E7, 'ai')).toBe(true);
    expect(selectIsModuleInDrawer(S.E7, 'tm')).toBe(false);
  });

  it('TM in drawer when txTier=drawer', () => {
    expect(selectIsModuleInDrawer(S.E9, 'tm')).toBe(true);
    expect(selectIsModuleInDrawer(S.E9, 'ai')).toBe(false);
  });

  it('neither in drawer when both in bottom bar', () => {
    expect(selectIsModuleInDrawer(S.E1, 'ai')).toBe(false);
    expect(selectIsModuleInDrawer(S.E1, 'tm')).toBe(false);
  });
});

describe('selectHasPaletteOpen', () => {
  it('true when AI at palette', () => {
    expect(selectHasPaletteOpen(S.E3)).toBe(true);
  });

  it('true when TM at palette (txEligible)', () => {
    expect(selectHasPaletteOpen(S.E5)).toBe(true);
  });

  it('false when both at bar', () => {
    expect(selectHasPaletteOpen(S.E1)).toBe(false);
  });

  it('false for TM palette when txEligible=false', () => {
    // Artificial state for testing the gate (wouldn't normally occur)
    const state: CoordinationState = {
      aiTier: 'bar', txTier: 'palette', paneView: 'menu', paneExpanded: true, txEligible: false,
    };
    expect(selectHasPaletteOpen(state)).toBe(false);
  });
});
