/**
 * Coordination State Machine — Reducer
 *
 * Single reducer implementing all coordination transitions.
 * Every action handler computes the next state and validates invariants in dev mode.
 *
 * @see COORDINATION_STATE_MACHINE.md §7-§10 (transitions), §13 (reducer structure)
 */

import type { CoordinationState, CoordinationAction, TierState, PaneView, ModuleId } from './types';
import { assertInvariants } from './invariants';

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

export const initialCoordinationState: CoordinationState = {
  aiTier: 'bar',
  txTier: 'bar',
  paneView: 'menu',
  paneExpanded: true,
  txEligible: false,
  overviewExpanded: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * When a module de-escalates from drawer, what tier does it land at?
 *
 * - `anchor` if the other module is at palette (spatial pressure from palette)
 * - `bar` otherwise (no spatial pressure)
 *
 * @see COORDINATION_STATE_MACHINE.md §8 "De-escalation landing tier"
 */
function getLandingTier(otherModuleTier: TierState): 'bar' | 'anchor' {
  return otherModuleTier === 'palette' ? 'anchor' : 'bar';
}

/**
 * Get the tier values for a module and its counterpart.
 */
function getModuleTiers(
  state: CoordinationState,
  module: ModuleId
): { selfTier: TierState; otherTier: TierState } {
  if (module === 'ai') {
    return { selfTier: state.aiTier, otherTier: state.txTier };
  }
  return { selfTier: state.txTier, otherTier: state.aiTier };
}

/**
 * Set tier for a specific module, returning partial state update.
 */
function setModuleTier(
  module: ModuleId,
  tier: TierState
): Partial<CoordinationState> {
  return module === 'ai' ? { aiTier: tier } : { txTier: tier };
}

/**
 * Get the pane view that corresponds to a module's drawer.
 */
function moduleToView(module: ModuleId): PaneView {
  return module === 'ai' ? 'ai' : 'transcript';
}

/**
 * Get the module that corresponds to a pane view (if any).
 */
function viewToModule(view: PaneView): ModuleId | null {
  if (view === 'ai') return 'ai';
  if (view === 'transcript') return 'tm';
  return null;
}

/**
 * Get the "other" module.
 */
function otherModule(module: ModuleId): ModuleId {
  return module === 'ai' ? 'tm' : 'ai';
}

// ---------------------------------------------------------------------------
// Action Handlers
// ---------------------------------------------------------------------------

/**
 * BAR_TAPPED — User taps a module's bar to open its palette.
 *
 * - If other module at bar → compress to anchor
 * - If other module in drawer → no effect on it
 *
 * @see spec §7 "Tap Bar"
 */
function handleBarTapped(state: CoordinationState, module: ModuleId): CoordinationState {
  const { selfTier, otherTier } = getModuleTiers(state, module);

  // Only valid if self is at bar
  if (selfTier !== 'bar') return state;

  // If txEligible is false and module is TM, no-op (TM column doesn't exist)
  if (!state.txEligible && module === 'tm') return state;

  // Check if the other module is actually present in the bottom bar
  const other = otherModule(module);
  const otherPresent = other === 'ai' || state.txEligible;

  // Open palette. Other module's behavior depends on where it is.
  if (otherTier === 'bar' && otherPresent) {
    // Other module compresses to anchor (INV-2: anchor requires palette)
    return {
      ...state,
      ...setModuleTier(module, 'palette'),
      ...setModuleTier(other, 'anchor'),
    };
  }

  if (otherTier === 'bar' && !otherPresent) {
    // Other module not visible (txEligible=false) — just open palette solo
    return {
      ...state,
      ...setModuleTier(module, 'palette'),
    };
  }

  if (otherTier === 'drawer') {
    // Other is in drawer, no effect on it. Self goes to palette (solo in bottom bar).
    return {
      ...state,
      ...setModuleTier(module, 'palette'),
    };
  }

  // Other is at anchor or palette — shouldn't happen if self is at bar (invariant violation upstream)
  return state;
}

/**
 * ANCHOR_TAPPED — User taps an anchor for a direct switch.
 *
 * Current palette → anchor, tapped anchor → palette.
 *
 * @see spec §7 "Tap Anchor"
 */
function handleAnchorTapped(state: CoordinationState, module: ModuleId): CoordinationState {
  const { selfTier } = getModuleTiers(state, module);

  // Only valid if self is at anchor
  if (selfTier !== 'anchor') return state;

  // Direct switch: self (anchor) → palette, other (palette) → anchor
  return {
    ...state,
    ...setModuleTier(module, 'palette'),
    ...setModuleTier(otherModule(module), 'anchor'),
  };
}

/**
 * PALETTE_COLLAPSED — User collapses a palette (drag handle, tap, etc.)
 *
 * Both modules return to bar if both in bottom bar.
 * Solo module returns to bar if other is in drawer.
 *
 * @see spec §7 "Drag Handle / Collapse Palette"
 */
function handlePaletteCollapsed(state: CoordinationState, module: ModuleId): CoordinationState {
  const { selfTier, otherTier } = getModuleTiers(state, module);

  // Only valid if self is at palette
  if (selfTier !== 'palette') return state;

  if (otherTier === 'drawer') {
    // Other is in drawer — only collapse the solo module to bar
    return {
      ...state,
      ...setModuleTier(module, 'bar'),
    };
  }

  // Both in bottom bar — both return to bar
  return {
    ...state,
    aiTier: 'bar',
    txTier: 'bar',
  };
}

/**
 * PALETTE_ESCALATED — User taps [↗] in palette to escalate to drawer.
 *
 * Module → drawer, other anchor → bar (INV-5).
 * Pane expands + switches to module's view.
 * Handles drawer swap (E8→E9, E10→E7).
 *
 * @see spec §7 "Tap [↗] Escalation in Palette"
 */
function handlePaletteEscalated(state: CoordinationState, module: ModuleId): CoordinationState {
  const { selfTier, otherTier } = getModuleTiers(state, module);

  // Only valid if self is at palette
  if (selfTier !== 'palette') return state;

  const view = moduleToView(module);
  const other = otherModule(module);

  if (otherTier === 'drawer') {
    // Drawer swap: other module leaves drawer → bar, self enters drawer
    return {
      ...state,
      ...setModuleTier(module, 'drawer'),
      ...setModuleTier(other, 'bar'),
      paneView: view,
      paneExpanded: true,
    };
  }

  // Normal escalation: other was at anchor → bar (INV-5), self → drawer
  return {
    ...state,
    ...setModuleTier(module, 'drawer'),
    ...setModuleTier(other, otherTier === 'anchor' ? 'bar' : otherTier),
    paneView: view,
    paneExpanded: true,
  };
}

/**
 * PANE_VIEW_CHANGED — User taps a view icon in the pane header.
 *
 * Escalate incoming module to drawer, de-escalate outgoing.
 * De-escalation landing follows getLandingTier.
 *
 * @see spec §8 "Tap View Icon in Pane Header"
 */
function handlePaneViewChanged(state: CoordinationState, to: PaneView): CoordinationState {
  // No-op if already on this view
  if (state.paneView === to) return state;

  // INV-7: Can't switch to transcript if not eligible
  if (to === 'transcript' && !state.txEligible) return state;

  const incomingModule = viewToModule(to);
  const outgoingModule = viewToModule(state.paneView);

  // ── Switching to menu ──
  if (to === 'menu') {
    if (!outgoingModule) return { ...state, paneView: 'menu' };

    // De-escalate the outgoing drawer module
    const other = otherModule(outgoingModule);
    const otherTier = other === 'ai' ? state.aiTier : state.txTier;
    const landingTier = getLandingTier(otherTier);

    return {
      ...state,
      ...setModuleTier(outgoingModule, landingTier),
      paneView: 'menu',
    };
  }

  // ── Switching to ai or transcript view ──
  if (!incomingModule) return state;

  const other = otherModule(incomingModule);

  // If outgoing view was also a drawer view, de-escalate that module
  if (outgoingModule) {
    // Drawer swap: outgoing de-escalates, incoming escalates
    // The incoming module's current tier determines how we escalate it
    const incomingCurrentTier = incomingModule === 'ai' ? state.aiTier : state.txTier;

    // Outgoing module lands based on incoming module's NEW position (palette? no — drawer)
    // Since incoming goes to drawer, outgoing lands at bar (drawer doesn't force anchor, INV-5)
    // But if outgoing was at palette in bottom bar... wait, outgoing was at drawer (it was the active view).
    // So outgoing de-escalates from drawer. Incoming goes to drawer.
    // The landing tier for outgoing depends on the OTHER module's tier after incoming escalates to drawer.
    // Since incoming IS the other module and it's going to drawer, outgoing lands at bar.
    // But we also need to check: was the outgoing module's counterpart (which is the incoming module)
    // at some bottom bar tier? No — the incoming module could have been at bar or palette in the bottom bar.

    // Simpler: outgoing leaves drawer → lands at bar (since incoming goes to drawer, no palette pressure)
    return {
      ...state,
      ...setModuleTier(outgoingModule, 'bar'),
      ...setModuleTier(incomingModule, 'drawer'),
      paneView: to,
    };
  }

  // ── From menu to a drawer view ──
  // Incoming module escalates to drawer. Its current tier doesn't matter — it goes to drawer.
  // The other module stays where it is (bar or palette — unaffected).
  const incomingCurrentTier = incomingModule === 'ai' ? state.aiTier : state.txTier;

  // If incoming was at palette, the other was at anchor. Since incoming goes to drawer,
  // the anchor loses its palette companion → other must go to bar (INV-2).
  const otherCurrentTier = other === 'ai' ? state.aiTier : state.txTier;
  let newOtherTier = otherCurrentTier;

  if (incomingCurrentTier === 'palette' && otherCurrentTier === 'anchor') {
    // INV-2: anchor requires palette. Since palette is leaving, anchor → bar
    newOtherTier = 'bar';
  } else if (incomingCurrentTier === 'anchor' && otherCurrentTier === 'palette') {
    // Incoming was at anchor, other has palette. Incoming goes to drawer.
    // Other stays at palette (solo now — valid per INV-5, cross-surface independence)
    newOtherTier = 'palette';
  }

  return {
    ...state,
    ...setModuleTier(incomingModule, 'drawer'),
    ...setModuleTier(other, newOtherTier),
    paneView: to,
  };
}

/**
 * PANE_COLLAPSED — User taps collapse button.
 *
 * De-escalate any active drawer module. Landing tier follows getLandingTier.
 * Pane view resets to menu. Bottom bar states at palette/anchor unaffected.
 *
 * @see spec §8 "Tap Collapse Button"
 */
function handlePaneCollapsed(state: CoordinationState): CoordinationState {
  if (!state.paneExpanded) return state;

  // Find which module (if any) is in a drawer
  const aiInDrawer = state.aiTier === 'drawer';
  const txInDrawer = state.txTier === 'drawer';

  if (aiInDrawer) {
    // AI was in drawer — de-escalate. Landing depends on TM's tier.
    const landingTier = getLandingTier(state.txTier);
    return {
      ...state,
      aiTier: landingTier,
      paneView: 'menu',
      paneExpanded: false,
    };
  }

  if (txInDrawer) {
    // TM was in drawer — de-escalate. Landing depends on AI's tier.
    const landingTier = getLandingTier(state.aiTier);
    return {
      ...state,
      txTier: landingTier,
      paneView: 'menu',
      paneExpanded: false,
    };
  }

  // No drawer active — just collapse, no bottom bar effect
  return {
    ...state,
    paneView: 'menu',
    paneExpanded: false,
  };
}

/**
 * PANE_EXPANDED — User taps expand button.
 *
 * Opens to menu view. No bottom bar side effects.
 *
 * @see spec §8 "Tap Expand Button"
 */
function handlePaneExpanded(state: CoordinationState): CoordinationState {
  if (state.paneExpanded) return state;

  return {
    ...state,
    paneView: 'menu',
    paneExpanded: true,
  };
}

/**
 * CMD_K_PRESSED — AI quick access keyboard shortcut.
 *
 * Finds highest-density AI surface and focuses it. If none expanded, opens AI palette.
 *
 * @see spec §9 "⌘K"
 */
function handleCmdK(state: CoordinationState): CoordinationState {
  // If AI is at drawer — no state change (focus handled by component)
  if (state.aiTier === 'drawer') return state;

  // If AI is at palette — no state change (focus handled by component)
  if (state.aiTier === 'palette') return state;

  // AI is at bar or anchor — open AI palette
  if (state.aiTier === 'bar') {
    if (state.txEligible && state.txTier === 'bar') {
      // Both at bar → AI to palette, TM to anchor
      return {
        ...state,
        aiTier: 'palette',
        txTier: 'anchor',
      };
    }
    if (state.txEligible && state.txTier === 'drawer') {
      // TM in drawer, AI bar (solo) → AI to palette
      return {
        ...state,
        aiTier: 'palette',
      };
    }
    // Non-encounter or TM at other state → AI to palette
    return {
      ...state,
      aiTier: 'palette',
    };
  }

  if (state.aiTier === 'anchor') {
    // AI at anchor means TM is at palette. Direct switch: AI → palette, TM → anchor
    return {
      ...state,
      aiTier: 'palette',
      txTier: 'anchor',
    };
  }

  return state;
}

/**
 * ESCAPE_PRESSED — Collapse palette in bottom bar.
 *
 * Only targets palettes. Never affects drawers or pane state.
 *
 * @see spec §9 "Escape"
 */
function handleEscape(state: CoordinationState): CoordinationState {
  // Find which module has a palette open
  if (state.aiTier === 'palette') {
    return handlePaletteCollapsed(state, 'ai');
  }
  if (state.txTier === 'palette') {
    return handlePaletteCollapsed(state, 'tm');
  }

  // No palette open — no state change
  return state;
}

/**
 * ENCOUNTER_ENTERED — Navigating into an active encounter.
 *
 * txEligible → true, TM column appears at bar.
 *
 * @see spec §10 "Non-Encounter → Encounter"
 */
function handleEncounterEntered(state: CoordinationState): CoordinationState {
  if (state.txEligible) return state;

  return {
    ...state,
    txEligible: true,
    txTier: 'bar',
  };
}

/**
 * ENCOUNTER_EXITED — Leaving encounter context.
 *
 * txEligible → false, TM removed, de-escalate TM if needed.
 *
 * @see spec §10 "Encounter → Non-Encounter"
 */
function handleEncounterExited(state: CoordinationState): CoordinationState {
  if (!state.txEligible) return state;

  let newState: CoordinationState = {
    ...state,
    txEligible: false,
    txTier: 'bar', // Reset to inert default (ignored when txEligible is false)
  };

  // If AI was at anchor (TM was at palette), AI restores to bar
  if (state.aiTier === 'anchor') {
    newState = { ...newState, aiTier: 'bar' };
  }

  // If TM was at drawer, de-escalate → pane view to menu
  if (state.txTier === 'drawer') {
    newState = { ...newState, paneView: 'menu' };
  }

  return newState;
}

/**
 * ENCOUNTER_SWITCHED — Navigating to a different encounter.
 *
 * @see spec §10 "Encounter → Different Encounter"
 */
function handleEncounterSwitched(state: CoordinationState): CoordinationState {
  // If already eligible, tier state is preserved.
  // Recording auto-pause is handled by the session layer, not the coordination state machine.
  // The coordination state machine only cares about txEligible and tiers.
  if (!state.txEligible) {
    // Was not in encounter → entering one
    return handleEncounterEntered(state);
  }

  // Already in encounter → switching. Tiers preserved, session layer handles recording.
  return state;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Coordination reducer — single source of truth for all UI coordination state.
 *
 * Every transition validates invariants in dev mode after computing the next state.
 */
export function coordinationReducer(
  state: CoordinationState,
  action: CoordinationAction
): CoordinationState {
  let next: CoordinationState;

  switch (action.type) {
    case 'BAR_TAPPED':
      next = handleBarTapped(state, action.payload.module);
      break;
    case 'ANCHOR_TAPPED':
      next = handleAnchorTapped(state, action.payload.module);
      break;
    case 'PALETTE_COLLAPSED':
      next = handlePaletteCollapsed(state, action.payload.module);
      break;
    case 'PALETTE_ESCALATED':
      next = handlePaletteEscalated(state, action.payload.module);
      break;
    case 'PANE_VIEW_CHANGED':
      next = handlePaneViewChanged(state, action.payload.to);
      break;
    case 'PANE_COLLAPSED':
      next = handlePaneCollapsed(state);
      break;
    case 'PANE_EXPANDED':
      next = handlePaneExpanded(state);
      break;
    case 'CMD_K_PRESSED':
      next = handleCmdK(state);
      break;
    case 'ESCAPE_PRESSED':
      next = handleEscape(state);
      break;
    case 'ENCOUNTER_ENTERED':
      next = handleEncounterEntered(state);
      break;
    case 'ENCOUNTER_EXITED':
      next = handleEncounterExited(state);
      break;
    case 'ENCOUNTER_SWITCHED':
      next = handleEncounterSwitched(state);
      break;
    case 'OVERVIEW_COLLAPSED':
      next = state.overviewExpanded ? { ...state, overviewExpanded: false } : state;
      break;
    case 'OVERVIEW_EXPANDED':
      next = !state.overviewExpanded ? { ...state, overviewExpanded: true } : state;
      break;
    default:
      next = state;
  }

  // Validate invariants in dev mode
  assertInvariants(next);

  return next;
}
