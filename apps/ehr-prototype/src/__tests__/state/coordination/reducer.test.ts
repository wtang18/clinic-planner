/**
 * Tests for coordination state machine reducer.
 *
 * Every transition from spec §7-§10 is covered.
 * Each test verifies the exact before→after state.
 *
 * @see COORDINATION_STATE_MACHINE.md §7-§10
 */

import { describe, it, expect } from 'vitest';
import { coordinationReducer, initialCoordinationState } from '../../../state/coordination/reducer';
import type { CoordinationState, CoordinationAction } from '../../../state/coordination/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reduce(state: CoordinationState, action: CoordinationAction): CoordinationState {
  return coordinationReducer(state, action);
}

// Named states from the spec for readability
const S = {
  // Non-encounter
  N1: { aiTier: 'bar' as const,     txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: true,  txEligible: false },
  N2: { aiTier: 'bar' as const,     txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: false, txEligible: false },
  N3: { aiTier: 'palette' as const, txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: true,  txEligible: false },
  N4: { aiTier: 'palette' as const, txTier: 'bar' as const, paneView: 'menu' as const,   paneExpanded: false, txEligible: false },
  N5: { aiTier: 'drawer' as const,  txTier: 'bar' as const, paneView: 'ai' as const,     paneExpanded: true,  txEligible: false },

  // Encounter — both in bottom bar
  E1: { aiTier: 'bar' as const,     txTier: 'bar' as const,     paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E2: { aiTier: 'bar' as const,     txTier: 'bar' as const,     paneView: 'menu' as const, paneExpanded: false, txEligible: true },
  E3: { aiTier: 'palette' as const, txTier: 'anchor' as const,  paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E4: { aiTier: 'palette' as const, txTier: 'anchor' as const,  paneView: 'menu' as const, paneExpanded: false, txEligible: true },
  E5: { aiTier: 'anchor' as const,  txTier: 'palette' as const, paneView: 'menu' as const, paneExpanded: true,  txEligible: true },
  E6: { aiTier: 'anchor' as const,  txTier: 'palette' as const, paneView: 'menu' as const, paneExpanded: false, txEligible: true },

  // Encounter — one in drawer
  E7:  { aiTier: 'drawer' as const,  txTier: 'bar' as const,     paneView: 'ai' as const,         paneExpanded: true, txEligible: true },
  E8:  { aiTier: 'drawer' as const,  txTier: 'palette' as const, paneView: 'ai' as const,         paneExpanded: true, txEligible: true },
  E9:  { aiTier: 'bar' as const,     txTier: 'drawer' as const,  paneView: 'transcript' as const, paneExpanded: true, txEligible: true },
  E10: { aiTier: 'palette' as const, txTier: 'drawer' as const,  paneView: 'transcript' as const, paneExpanded: true, txEligible: true },
};

// ---------------------------------------------------------------------------
// §7 — Bottom Bar Interactions
// ---------------------------------------------------------------------------

describe('§7 BAR_TAPPED', () => {
  it('E1 → E3: Tap AI bar → AI palette, TM anchor', () => {
    expect(reduce(S.E1, { type: 'BAR_TAPPED', payload: { module: 'ai' } })).toEqual(S.E3);
  });

  it('E1 → E5: Tap TM bar → TM palette, AI anchor', () => {
    expect(reduce(S.E1, { type: 'BAR_TAPPED', payload: { module: 'tm' } })).toEqual(S.E5);
  });

  it('E7 → E8: Tap TM bar (AI in drawer) → TM palette (solo)', () => {
    expect(reduce(S.E7, { type: 'BAR_TAPPED', payload: { module: 'tm' } })).toEqual(S.E8);
  });

  it('E9 → E10: Tap AI bar (TM in drawer) → AI palette (solo)', () => {
    expect(reduce(S.E9, { type: 'BAR_TAPPED', payload: { module: 'ai' } })).toEqual(S.E10);
  });

  it('no-op: Tap bar of module already at palette', () => {
    expect(reduce(S.E3, { type: 'BAR_TAPPED', payload: { module: 'ai' } })).toEqual(S.E3);
  });

  it('no-op: Tap TM bar when txEligible=false', () => {
    expect(reduce(S.N1, { type: 'BAR_TAPPED', payload: { module: 'tm' } })).toEqual(S.N1);
  });

  it('N1 → N3: Tap AI bar (non-encounter, solo)', () => {
    expect(reduce(S.N1, { type: 'BAR_TAPPED', payload: { module: 'ai' } })).toEqual(S.N3);
  });
});

describe('§7 ANCHOR_TAPPED', () => {
  it('E3 → E5: Tap TM anchor → TM palette, AI anchor (direct switch)', () => {
    expect(reduce(S.E3, { type: 'ANCHOR_TAPPED', payload: { module: 'tm' } })).toEqual(S.E5);
  });

  it('E5 → E3: Tap AI anchor → AI palette, TM anchor (direct switch)', () => {
    expect(reduce(S.E5, { type: 'ANCHOR_TAPPED', payload: { module: 'ai' } })).toEqual(S.E3);
  });

  it('no-op: Module not at anchor', () => {
    expect(reduce(S.E1, { type: 'ANCHOR_TAPPED', payload: { module: 'ai' } })).toEqual(S.E1);
  });
});

describe('§7 PALETTE_COLLAPSED', () => {
  it('E3 → E1: Collapse AI palette → both at bar', () => {
    expect(reduce(S.E3, { type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } })).toEqual(S.E1);
  });

  it('E5 → E1: Collapse TM palette → both at bar', () => {
    expect(reduce(S.E5, { type: 'PALETTE_COLLAPSED', payload: { module: 'tm' } })).toEqual(S.E1);
  });

  it('E4 → E2: Collapse AI palette (pane collapsed) → both at bar', () => {
    expect(reduce(S.E4, { type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } })).toEqual(S.E2);
  });

  it('E6 → E2: Collapse TM palette (pane collapsed) → both at bar', () => {
    expect(reduce(S.E6, { type: 'PALETTE_COLLAPSED', payload: { module: 'tm' } })).toEqual(S.E2);
  });

  it('E8 → E7: Collapse TM palette (AI in drawer) → TM bar', () => {
    expect(reduce(S.E8, { type: 'PALETTE_COLLAPSED', payload: { module: 'tm' } })).toEqual(S.E7);
  });

  it('E10 → E9: Collapse AI palette (TM in drawer) → AI bar', () => {
    expect(reduce(S.E10, { type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } })).toEqual(S.E9);
  });

  it('N3 → N1: Collapse AI palette (non-encounter)', () => {
    expect(reduce(S.N3, { type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } })).toEqual(S.N1);
  });

  it('N4 → N2: Collapse AI palette (non-encounter, pane collapsed)', () => {
    expect(reduce(S.N4, { type: 'PALETTE_COLLAPSED', payload: { module: 'ai' } })).toEqual(S.N2);
  });
});

describe('§7 PALETTE_ESCALATED', () => {
  it('E3 → E7: Escalate AI palette → AI drawer, TM anchor→bar', () => {
    expect(reduce(S.E3, { type: 'PALETTE_ESCALATED', payload: { module: 'ai' } })).toEqual(S.E7);
  });

  it('E5 → E9: Escalate TM palette → TM drawer, AI anchor→bar', () => {
    expect(reduce(S.E5, { type: 'PALETTE_ESCALATED', payload: { module: 'tm' } })).toEqual(S.E9);
  });

  it('E8 → E9: Drawer swap — escalate TM palette (AI in drawer) → TM drawer, AI bar', () => {
    expect(reduce(S.E8, { type: 'PALETTE_ESCALATED', payload: { module: 'tm' } })).toEqual(S.E9);
  });

  it('E10 → E7: Drawer swap — escalate AI palette (TM in drawer) → AI drawer, TM bar', () => {
    expect(reduce(S.E10, { type: 'PALETTE_ESCALATED', payload: { module: 'ai' } })).toEqual(S.E7);
  });

  it('N3 → N5: Escalate AI palette (non-encounter) → AI drawer', () => {
    expect(reduce(S.N3, { type: 'PALETTE_ESCALATED', payload: { module: 'ai' } })).toEqual(S.N5);
  });
});

// ---------------------------------------------------------------------------
// §8 — Left Pane Interactions
// ---------------------------------------------------------------------------

describe('§8 PANE_VIEW_CHANGED', () => {
  it('E1 → E7: Menu → AI view (both at bar)', () => {
    expect(reduce(S.E1, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } })).toEqual(S.E7);
  });

  it('E1 → E9: Menu → Transcript view (both at bar)', () => {
    expect(reduce(S.E1, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } })).toEqual(S.E9);
  });

  it('E3 → E7: Menu → AI view (AI palette, TM anchor) → AI drawer, TM bar', () => {
    // AI was at palette, goes to drawer. TM was at anchor, but anchor requires palette (INV-2).
    // Since AI (palette) is leaving bottom bar, TM anchor has no palette companion.
    // TM goes to bar.
    expect(reduce(S.E3, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } })).toEqual(S.E7);
  });

  it('E5 → E9: Menu → Transcript view (TM palette, AI anchor) → TM drawer, AI bar', () => {
    expect(reduce(S.E5, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } })).toEqual(S.E9);
  });

  it('E3 → E10: Menu → Transcript view (AI palette stays, TM anchor→drawer)', () => {
    // TM was at anchor → goes to drawer. AI was at palette → stays at palette.
    // E10: { aiTier: 'palette', txTier: 'drawer', paneView: 'transcript' }
    const result = reduce(S.E3, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } });
    expect(result).toEqual(S.E10);
  });

  it('E5 → E8: Menu → AI view (AI anchor→drawer, TM palette stays)', () => {
    // AI was at anchor → goes to drawer. TM was at palette → stays.
    // E8: { aiTier: 'drawer', txTier: 'palette', paneView: 'ai' }
    const result = reduce(S.E5, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } });
    expect(result).toEqual(S.E8);
  });

  it('E7 → E1: AI view → Menu (AI de-escalates drawer→bar)', () => {
    expect(reduce(S.E7, { type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } })).toEqual(S.E1);
  });

  it('E7 → E9: AI view → Transcript view (drawer swap)', () => {
    expect(reduce(S.E7, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } })).toEqual(S.E9);
  });

  it('E8 → E5: AI view → Menu (AI drawer→anchor, TM palette stays)', () => {
    // AI de-escalates from drawer. TM is at palette → landing is anchor.
    const result = reduce(S.E8, { type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } });
    expect(result).toEqual(S.E5);
  });

  it('E8 → E9: AI view → Transcript view (AI drawer→bar, TM palette→drawer)', () => {
    // Drawer swap from E8
    const result = reduce(S.E8, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } });
    expect(result).toEqual(S.E9);
  });

  it('E9 → E1: Transcript view → Menu (TM de-escalates drawer→bar)', () => {
    expect(reduce(S.E9, { type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } })).toEqual(S.E1);
  });

  it('E9 → E7: Transcript view → AI view (drawer swap)', () => {
    expect(reduce(S.E9, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } })).toEqual(S.E7);
  });

  it('E10 → E3: Transcript view → Menu (TM drawer→anchor, AI palette stays)', () => {
    // TM de-escalates from drawer. AI is at palette → landing is anchor.
    const result = reduce(S.E10, { type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } });
    expect(result).toEqual(S.E3);
  });

  it('E10 → E7: Transcript view → AI view (TM drawer→bar, AI palette→drawer)', () => {
    const result = reduce(S.E10, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } });
    expect(result).toEqual(S.E7);
  });

  it('N1 → N5: Menu → AI view (non-encounter)', () => {
    expect(reduce(S.N1, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } })).toEqual(S.N5);
  });

  it('N5 → N1: AI view → Menu (non-encounter)', () => {
    expect(reduce(S.N5, { type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } })).toEqual(S.N1);
  });

  it('no-op: Switch to transcript when txEligible=false', () => {
    expect(reduce(S.N1, { type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } })).toEqual(S.N1);
  });

  it('no-op: Already on same view', () => {
    expect(reduce(S.E7, { type: 'PANE_VIEW_CHANGED', payload: { to: 'ai' } })).toEqual(S.E7);
  });
});

describe('§8 PANE_COLLAPSED', () => {
  it('E1 → E2: Collapse pane (menu, no drawer) → no bottom bar effect', () => {
    expect(reduce(S.E1, { type: 'PANE_COLLAPSED' })).toEqual(S.E2);
  });

  it('E3 → E4: Collapse pane (AI palette, TM anchor) → no bottom bar effect', () => {
    expect(reduce(S.E3, { type: 'PANE_COLLAPSED' })).toEqual(S.E4);
  });

  it('E5 → E6: Collapse pane (TM palette, AI anchor) → no bottom bar effect', () => {
    expect(reduce(S.E5, { type: 'PANE_COLLAPSED' })).toEqual(S.E6);
  });

  it('E7 → E2: Collapse pane (AI drawer, TM bar) → AI de-escalates to bar', () => {
    expect(reduce(S.E7, { type: 'PANE_COLLAPSED' })).toEqual(S.E2);
  });

  it('E8 → E6: Collapse pane (AI drawer, TM palette) → AI de-escalates to anchor', () => {
    expect(reduce(S.E8, { type: 'PANE_COLLAPSED' })).toEqual(S.E6);
  });

  it('E9 → E2: Collapse pane (TM drawer, AI bar) → TM de-escalates to bar', () => {
    expect(reduce(S.E9, { type: 'PANE_COLLAPSED' })).toEqual(S.E2);
  });

  it('E10 → E4: Collapse pane (TM drawer, AI palette) → TM de-escalates to anchor', () => {
    expect(reduce(S.E10, { type: 'PANE_COLLAPSED' })).toEqual(S.E4);
  });

  it('N1 → N2: Collapse pane (non-encounter, menu)', () => {
    expect(reduce(S.N1, { type: 'PANE_COLLAPSED' })).toEqual(S.N2);
  });

  it('N3 → N4: Collapse pane (non-encounter, AI palette)', () => {
    expect(reduce(S.N3, { type: 'PANE_COLLAPSED' })).toEqual(S.N4);
  });

  it('N5 → N2: Collapse pane (non-encounter, AI drawer) → AI de-escalates to bar', () => {
    expect(reduce(S.N5, { type: 'PANE_COLLAPSED' })).toEqual(S.N2);
  });

  it('no-op: Already collapsed', () => {
    expect(reduce(S.E2, { type: 'PANE_COLLAPSED' })).toEqual(S.E2);
  });
});

describe('§8 PANE_EXPANDED', () => {
  it('E2 → E1: Expand pane → menu view, no bottom bar effect', () => {
    expect(reduce(S.E2, { type: 'PANE_EXPANDED' })).toEqual(S.E1);
  });

  it('E4 → E3: Expand pane (AI palette, TM anchor)', () => {
    expect(reduce(S.E4, { type: 'PANE_EXPANDED' })).toEqual(S.E3);
  });

  it('E6 → E5: Expand pane (TM palette, AI anchor)', () => {
    expect(reduce(S.E6, { type: 'PANE_EXPANDED' })).toEqual(S.E5);
  });

  it('N2 → N1: Expand pane (non-encounter)', () => {
    expect(reduce(S.N2, { type: 'PANE_EXPANDED' })).toEqual(S.N1);
  });

  it('N4 → N3: Expand pane (non-encounter, AI palette)', () => {
    expect(reduce(S.N4, { type: 'PANE_EXPANDED' })).toEqual(S.N3);
  });

  it('no-op: Already expanded', () => {
    expect(reduce(S.E1, { type: 'PANE_EXPANDED' })).toEqual(S.E1);
  });
});

// ---------------------------------------------------------------------------
// §9 — Keyboard Shortcuts
// ---------------------------------------------------------------------------

describe('§9 CMD_K_PRESSED', () => {
  it('AI at drawer → no state change (focus handled by component)', () => {
    expect(reduce(S.E7, { type: 'CMD_K_PRESSED' })).toEqual(S.E7);
  });

  it('AI at palette → no state change (focus handled by component)', () => {
    expect(reduce(S.E3, { type: 'CMD_K_PRESSED' })).toEqual(S.E3);
  });

  it('AI at bar, TM at bar → AI palette, TM anchor', () => {
    expect(reduce(S.E1, { type: 'CMD_K_PRESSED' })).toEqual(S.E3);
  });

  it('AI at bar (solo, TM in drawer) → AI palette', () => {
    expect(reduce(S.E9, { type: 'CMD_K_PRESSED' })).toEqual(S.E10);
  });

  it('AI at anchor (TM at palette) → direct switch: AI palette, TM anchor', () => {
    expect(reduce(S.E5, { type: 'CMD_K_PRESSED' })).toEqual(S.E3);
  });

  it('Pane collapsed, AI at bar → AI palette (pane stays collapsed)', () => {
    const result = reduce(S.E2, { type: 'CMD_K_PRESSED' });
    expect(result).toEqual(S.E4);
  });

  it('Non-encounter, AI at bar → AI palette', () => {
    expect(reduce(S.N1, { type: 'CMD_K_PRESSED' })).toEqual(S.N3);
  });
});

describe('§9 ESCAPE_PRESSED', () => {
  it('AI palette open, TM anchor → bar/bar', () => {
    expect(reduce(S.E3, { type: 'ESCAPE_PRESSED' })).toEqual(S.E1);
  });

  it('TM palette open, AI anchor → bar/bar', () => {
    expect(reduce(S.E5, { type: 'ESCAPE_PRESSED' })).toEqual(S.E1);
  });

  it('AI palette (solo, TM in drawer) → AI bar', () => {
    expect(reduce(S.E10, { type: 'ESCAPE_PRESSED' })).toEqual(S.E9);
  });

  it('TM palette (solo, AI in drawer) → TM bar', () => {
    expect(reduce(S.E8, { type: 'ESCAPE_PRESSED' })).toEqual(S.E7);
  });

  it('no-op: Both at bar', () => {
    expect(reduce(S.E1, { type: 'ESCAPE_PRESSED' })).toEqual(S.E1);
  });

  it('no-op: AI drawer (never affects drawers)', () => {
    expect(reduce(S.E7, { type: 'ESCAPE_PRESSED' })).toEqual(S.E7);
  });

  it('no-op: TM drawer (never affects drawers)', () => {
    expect(reduce(S.E9, { type: 'ESCAPE_PRESSED' })).toEqual(S.E9);
  });

  it('Non-encounter, AI palette → AI bar', () => {
    expect(reduce(S.N3, { type: 'ESCAPE_PRESSED' })).toEqual(S.N1);
  });
});

// ---------------------------------------------------------------------------
// §10 — Context Transitions
// ---------------------------------------------------------------------------

describe('§10 ENCOUNTER_ENTERED', () => {
  it('Non-encounter → encounter: txEligible becomes true, TM at bar', () => {
    const result = reduce(S.N1, { type: 'ENCOUNTER_ENTERED', payload: { encounterId: 'e1', patientId: 'p1' } });
    expect(result.txEligible).toBe(true);
    expect(result.txTier).toBe('bar');
    expect(result.aiTier).toBe('bar'); // unchanged
  });

  it('no-op: Already in encounter', () => {
    expect(reduce(S.E1, { type: 'ENCOUNTER_ENTERED', payload: { encounterId: 'e1', patientId: 'p1' } })).toEqual(S.E1);
  });
});

describe('§10 ENCOUNTER_EXITED', () => {
  it('Encounter → non-encounter: txEligible false, TM reset', () => {
    const result = reduce(S.E1, { type: 'ENCOUNTER_EXITED' });
    expect(result.txEligible).toBe(false);
    expect(result.txTier).toBe('bar'); // inert default
    expect(result.aiTier).toBe('bar'); // unchanged
  });

  it('AI at anchor restores to bar when TM goes away', () => {
    // E5: AI anchor, TM palette → exit encounter → AI bar
    const result = reduce(S.E5, { type: 'ENCOUNTER_EXITED' });
    expect(result.aiTier).toBe('bar');
    expect(result.txEligible).toBe(false);
  });

  it('TM in drawer de-escalates, pane goes to menu', () => {
    const result = reduce(S.E9, { type: 'ENCOUNTER_EXITED' });
    expect(result.txTier).toBe('bar');
    expect(result.paneView).toBe('menu');
    expect(result.txEligible).toBe(false);
  });

  it('no-op: Already not in encounter', () => {
    expect(reduce(S.N1, { type: 'ENCOUNTER_EXITED' })).toEqual(S.N1);
  });
});

describe('§10 ENCOUNTER_SWITCHED', () => {
  it('Already in encounter → no tier changes (session layer handles recording)', () => {
    const result = reduce(S.E1, { type: 'ENCOUNTER_SWITCHED', payload: { encounterId: 'e2', patientId: 'p2' } });
    expect(result).toEqual(S.E1);
  });

  it('Not in encounter → entering one (same as ENCOUNTER_ENTERED)', () => {
    const result = reduce(S.N1, { type: 'ENCOUNTER_SWITCHED', payload: { encounterId: 'e1', patientId: 'p1' } });
    expect(result.txEligible).toBe(true);
    expect(result.txTier).toBe('bar');
  });
});

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

describe('Initial State', () => {
  it('is a valid state', () => {
    // Should not throw
    expect(() => coordinationReducer(initialCoordinationState, { type: 'PANE_EXPANDED' })).not.toThrow();
  });

  it('matches N1 (default non-encounter)', () => {
    expect(initialCoordinationState).toEqual(S.N1);
  });
});
