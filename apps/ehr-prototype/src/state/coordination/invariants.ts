/**
 * Coordination State Machine — Structural Invariants
 *
 * Eight invariants that must hold at ALL times. Any state violating an invariant
 * is invalid and must be rejected by the reducer.
 *
 * @see COORDINATION_STATE_MACHINE.md §4
 */

import type { CoordinationState, InvariantResult } from './types';

// ---------------------------------------------------------------------------
// Individual Invariant Checks
// ---------------------------------------------------------------------------

/**
 * INV-1: Drawer ↔ Pane Bidirectional Lock
 *
 * aiTier === 'drawer'  ↔  (paneView === 'ai' AND paneExpanded === true)
 * txTier === 'drawer'  ↔  (paneView === 'transcript' AND paneExpanded === true)
 */
function checkDrawerPaneLock(state: CoordinationState): string[] {
  const violations: string[] = [];

  // Forward: if drawer, pane must show that view and be expanded
  if (state.aiTier === 'drawer') {
    if (state.paneView !== 'ai' || !state.paneExpanded) {
      violations.push(
        `INV-1: aiTier is 'drawer' but paneView='${state.paneView}', paneExpanded=${state.paneExpanded} (expected paneView='ai', paneExpanded=true)`
      );
    }
  }
  if (state.txTier === 'drawer') {
    if (state.paneView !== 'transcript' || !state.paneExpanded) {
      violations.push(
        `INV-1: txTier is 'drawer' but paneView='${state.paneView}', paneExpanded=${state.paneExpanded} (expected paneView='transcript', paneExpanded=true)`
      );
    }
  }

  // Reverse: if pane shows ai/transcript, that module must be at drawer
  if (state.paneView === 'ai' && state.paneExpanded) {
    if (state.aiTier !== 'drawer') {
      violations.push(
        `INV-1: paneView='ai' and paneExpanded=true but aiTier='${state.aiTier}' (expected 'drawer')`
      );
    }
  }
  if (state.paneView === 'transcript' && state.paneExpanded) {
    if (state.txTier !== 'drawer') {
      violations.push(
        `INV-1: paneView='transcript' and paneExpanded=true but txTier='${state.txTier}' (expected 'drawer')`
      );
    }
  }

  return violations;
}

/**
 * INV-2: Anchor Requires Other Module at Palette
 *
 * aiTier === 'anchor'  →  txTier === 'palette'
 * txTier === 'anchor'  →  aiTier === 'palette'
 *
 * Corollaries: both-at-anchor forbidden, anchor+bar forbidden, anchor+drawer forbidden.
 */
function checkAnchorRequiresPalette(state: CoordinationState): string[] {
  const violations: string[] = [];

  if (state.aiTier === 'anchor' && state.txTier !== 'palette') {
    violations.push(
      `INV-2: aiTier is 'anchor' but txTier='${state.txTier}' (expected 'palette')`
    );
  }
  if (state.txTier === 'anchor' && state.aiTier !== 'palette') {
    violations.push(
      `INV-2: txTier is 'anchor' but aiTier='${state.aiTier}' (expected 'palette')`
    );
  }

  return violations;
}

/**
 * INV-3: Mutual Exclusion — One Palette Maximum in Bottom Bar
 *
 * NOT (aiTier === 'palette' AND txTier === 'palette')
 */
function checkOnePaletteMax(state: CoordinationState): string[] {
  if (state.aiTier === 'palette' && state.txTier === 'palette') {
    return ['INV-3: Both aiTier and txTier are at palette (only one allowed)'];
  }
  return [];
}

/**
 * INV-4: Mutual Exclusion — One Drawer Maximum
 *
 * NOT (aiTier === 'drawer' AND txTier === 'drawer')
 */
function checkOneDrawerMax(state: CoordinationState): string[] {
  if (state.aiTier === 'drawer' && state.txTier === 'drawer') {
    return ['INV-4: Both aiTier and txTier are at drawer (only one allowed)'];
  }
  return [];
}

/**
 * INV-5: Cross-Surface Independence
 *
 * A module at drawer does NOT force the other module to anchor.
 * aiTier === 'drawer'  →  txTier ∈ {'bar', 'palette'}  (never 'anchor')
 * txTier === 'drawer'  →  aiTier ∈ {'bar', 'palette'}  (never 'anchor')
 */
function checkCrossSurfaceIndependence(state: CoordinationState): string[] {
  const violations: string[] = [];

  if (state.aiTier === 'drawer' && state.txTier === 'anchor') {
    violations.push(
      `INV-5: aiTier is 'drawer' but txTier='anchor' (drawer doesn't force anchor; expected 'bar' or 'palette')`
    );
  }
  if (state.txTier === 'drawer' && state.aiTier === 'anchor') {
    violations.push(
      `INV-5: txTier is 'drawer' but aiTier='anchor' (drawer doesn't force anchor; expected 'bar' or 'palette')`
    );
  }

  return violations;
}

/**
 * INV-6: Pane Collapse Constraint
 *
 * paneExpanded === false  →  aiTier !== 'drawer' AND txTier !== 'drawer'
 */
function checkPaneCollapseConstraint(state: CoordinationState): string[] {
  if (!state.paneExpanded) {
    const violations: string[] = [];
    if (state.aiTier === 'drawer') {
      violations.push(
        `INV-6: paneExpanded=false but aiTier='drawer' (collapsed pane cannot host drawers)`
      );
    }
    if (state.txTier === 'drawer') {
      violations.push(
        `INV-6: paneExpanded=false but txTier='drawer' (collapsed pane cannot host drawers)`
      );
    }
    return violations;
  }
  return [];
}

/**
 * INV-7: Transcript View Gate
 *
 * paneView === 'transcript'  →  txEligible === true
 *
 * Note: The "AND session exists" part is enforced at the UI layer, not in the state machine,
 * because session state is managed separately.
 */
function checkTranscriptViewGate(state: CoordinationState): string[] {
  if (state.paneView === 'transcript' && !state.txEligible) {
    return [
      `INV-7: paneView='transcript' but txEligible=false (transcript view requires eligible encounter)`
    ];
  }
  return [];
}

/**
 * INV-8: txEligible Gate
 *
 * txEligible === false  →  txTier should not be in an active bottom bar state
 *
 * When txEligible is false, txTier should be 'bar' (inert default).
 * It cannot be 'anchor', 'palette', or 'drawer' because the TM column doesn't exist.
 */
function checkTxEligibleGate(state: CoordinationState): string[] {
  if (!state.txEligible && state.txTier !== 'bar') {
    return [
      `INV-8: txEligible=false but txTier='${state.txTier}' (expected 'bar' — TM column absent when not eligible)`
    ];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const INVARIANT_CHECKS = [
  checkDrawerPaneLock,
  checkAnchorRequiresPalette,
  checkOnePaletteMax,
  checkOneDrawerMax,
  checkCrossSurfaceIndependence,
  checkPaneCollapseConstraint,
  checkTranscriptViewGate,
  checkTxEligibleGate,
] as const;

/**
 * Validates all structural invariants. Non-throwing — returns a result object.
 */
export function validateInvariants(state: CoordinationState): InvariantResult {
  const violations: string[] = [];

  for (const check of INVARIANT_CHECKS) {
    violations.push(...check(state));
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Asserts all structural invariants. Throws in dev mode with a descriptive message.
 * No-op in production builds.
 */
export function assertInvariants(state: CoordinationState): void {
  if (process.env.NODE_ENV === 'production') return;

  const result = validateInvariants(state);
  if (!result.valid) {
    const stateStr = JSON.stringify(state, null, 2);
    throw new Error(
      `Coordination invariant violation:\n${result.violations.join('\n')}\n\nState:\n${stateStr}`
    );
  }
}
