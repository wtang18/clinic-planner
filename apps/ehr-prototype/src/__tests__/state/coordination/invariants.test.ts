/**
 * Tests for coordination state machine invariants.
 *
 * Validates all 15 valid states pass and all 13 forbidden states fail.
 *
 * @see COORDINATION_STATE_MACHINE.md §4 (Invariants), §5-§6 (Valid States), §14 (Forbidden States)
 */

import { describe, it, expect } from 'vitest';
import { validateInvariants } from '../../../state/coordination/invariants';
import type { CoordinationState } from '../../../state/coordination/types';

// ---------------------------------------------------------------------------
// Valid States (§5 + §6)
// ---------------------------------------------------------------------------

/** All 15 valid states from the spec. */
const VALID_STATES: Record<string, CoordinationState> = {
  // Non-encounter states (§5)
  N1: { aiTier: 'bar',     txTier: 'bar', paneView: 'menu',   paneExpanded: true,  txEligible: false, overviewExpanded: true },
  N2: { aiTier: 'bar',     txTier: 'bar', paneView: 'menu',   paneExpanded: false, txEligible: false, overviewExpanded: true },
  N3: { aiTier: 'palette', txTier: 'bar', paneView: 'menu',   paneExpanded: true,  txEligible: false, overviewExpanded: true },
  N4: { aiTier: 'palette', txTier: 'bar', paneView: 'menu',   paneExpanded: false, txEligible: false, overviewExpanded: true },
  N5: { aiTier: 'drawer',  txTier: 'bar', paneView: 'ai',     paneExpanded: true,  txEligible: false, overviewExpanded: true },

  // Encounter states — both in bottom bar (§6)
  E1: { aiTier: 'bar',     txTier: 'bar',     paneView: 'menu', paneExpanded: true,  txEligible: true, overviewExpanded: true },
  E2: { aiTier: 'bar',     txTier: 'bar',     paneView: 'menu', paneExpanded: false, txEligible: true, overviewExpanded: true },
  E3: { aiTier: 'palette', txTier: 'anchor',  paneView: 'menu', paneExpanded: true,  txEligible: true, overviewExpanded: true },
  E4: { aiTier: 'palette', txTier: 'anchor',  paneView: 'menu', paneExpanded: false, txEligible: true, overviewExpanded: true },
  E5: { aiTier: 'anchor',  txTier: 'palette', paneView: 'menu', paneExpanded: true,  txEligible: true, overviewExpanded: true },
  E6: { aiTier: 'anchor',  txTier: 'palette', paneView: 'menu', paneExpanded: false, txEligible: true, overviewExpanded: true },

  // Encounter states — one in drawer (§6)
  E7:  { aiTier: 'drawer',  txTier: 'bar',     paneView: 'ai',         paneExpanded: true, txEligible: true, overviewExpanded: true },
  E8:  { aiTier: 'drawer',  txTier: 'palette', paneView: 'ai',         paneExpanded: true, txEligible: true, overviewExpanded: true },
  E9:  { aiTier: 'bar',     txTier: 'drawer',  paneView: 'transcript', paneExpanded: true, txEligible: true, overviewExpanded: true },
  E10: { aiTier: 'palette', txTier: 'drawer',  paneView: 'transcript', paneExpanded: true, txEligible: true, overviewExpanded: true },
};

describe('Invariant Validation — Valid States', () => {
  for (const [id, state] of Object.entries(VALID_STATES)) {
    it(`${id} passes all invariants`, () => {
      const result = validateInvariants(state);
      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Forbidden States (§14)
// ---------------------------------------------------------------------------

const FORBIDDEN_STATES: Record<string, { state: CoordinationState; expectedInvariant: string }> = {
  'drawer without pane lock (AI drawer, pane=menu)': {
    state: { aiTier: 'drawer', txTier: 'bar', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-1',
  },
  'drawer with collapsed pane (AI)': {
    state: { aiTier: 'drawer', txTier: 'bar', paneView: 'ai', paneExpanded: false, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-1', // also INV-6
  },
  'drawer without pane lock (TM drawer, pane=menu)': {
    state: { aiTier: 'bar', txTier: 'drawer', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-1',
  },
  'drawer wrong view (TM drawer, pane=ai)': {
    state: { aiTier: 'bar', txTier: 'drawer', paneView: 'ai', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-1',
  },
  'both at anchor': {
    state: { aiTier: 'anchor', txTier: 'anchor', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-2',
  },
  'anchor without palette (AI anchor, TM bar)': {
    state: { aiTier: 'anchor', txTier: 'bar', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-2',
  },
  'anchor with drawer (AI anchor, TM drawer)': {
    state: { aiTier: 'anchor', txTier: 'drawer', paneView: 'transcript', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-2', // also INV-5
  },
  'anchor without palette (TM anchor, AI bar)': {
    state: { aiTier: 'bar', txTier: 'anchor', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-2',
  },
  'two palettes': {
    state: { aiTier: 'palette', txTier: 'palette', paneView: 'menu', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-3',
  },
  'two drawers': {
    state: { aiTier: 'drawer', txTier: 'drawer', paneView: 'ai', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-4', // also INV-1
  },
  'drawer forces anchor (AI drawer, TM anchor)': {
    state: { aiTier: 'drawer', txTier: 'anchor', paneView: 'ai', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-5', // also INV-2
  },
  'drawer forces anchor reversed (TM drawer, AI anchor)': {
    state: { aiTier: 'anchor', txTier: 'drawer', paneView: 'transcript', paneExpanded: true, txEligible: true, overviewExpanded: true },
    expectedInvariant: 'INV-5', // also INV-2
  },
  'transcript view without eligibility': {
    state: { aiTier: 'bar', txTier: 'bar', paneView: 'transcript', paneExpanded: true, txEligible: false, overviewExpanded: true },
    expectedInvariant: 'INV-7',
  },
};

describe('Invariant Validation — Forbidden States', () => {
  for (const [description, { state, expectedInvariant }] of Object.entries(FORBIDDEN_STATES)) {
    it(`rejects: ${description} (${expectedInvariant})`, () => {
      const result = validateInvariants(state);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      // At least one violation should reference the expected invariant
      expect(result.violations.some(v => v.includes(expectedInvariant))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// INV-8 specific tests
// ---------------------------------------------------------------------------

describe('INV-8: txEligible Gate', () => {
  it('rejects txTier=palette when txEligible=false', () => {
    const state: CoordinationState = {
      aiTier: 'bar', txTier: 'palette', paneView: 'menu', paneExpanded: true, txEligible: false,
    };
    const result = validateInvariants(state);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('INV-8'))).toBe(true);
  });

  it('rejects txTier=anchor when txEligible=false', () => {
    const state: CoordinationState = {
      aiTier: 'palette', txTier: 'anchor', paneView: 'menu', paneExpanded: true, txEligible: false,
    };
    const result = validateInvariants(state);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('INV-8'))).toBe(true);
  });

  it('rejects txTier=drawer when txEligible=false', () => {
    const state: CoordinationState = {
      aiTier: 'bar', txTier: 'drawer', paneView: 'transcript', paneExpanded: true, txEligible: false,
    };
    const result = validateInvariants(state);
    expect(result.valid).toBe(false);
    // Should hit both INV-7 and INV-8
    expect(result.violations.some(v => v.includes('INV-8'))).toBe(true);
  });

  it('allows txTier=bar when txEligible=false (inert default)', () => {
    const state: CoordinationState = {
      aiTier: 'bar', txTier: 'bar', paneView: 'menu', paneExpanded: true, txEligible: false,
    };
    const result = validateInvariants(state);
    expect(result.valid).toBe(true);
  });
});
