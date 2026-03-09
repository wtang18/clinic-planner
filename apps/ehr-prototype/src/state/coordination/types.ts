/**
 * Coordination State Machine — Type Definitions
 *
 * Single source of truth for the anchor-bar-palette-pane coordination system.
 * Defines the state tuple, action types, and derived types.
 *
 * @see COORDINATION_STATE_MACHINE.md §3 (State Tuple), §13 (Provider Architecture)
 */

// ---------------------------------------------------------------------------
// Tier & View Primitives
// ---------------------------------------------------------------------------

/**
 * Visual tier of a module.
 *
 * - `anchor` (48px) — Compressed icon in bottom bar. Only valid when the other module is at palette.
 * - `bar` (contextual width) — Default resting state with status + controls.
 * - `palette` (design-token width) — Expanded detail view in bottom bar.
 * - `drawer` (full panel) — Complete view rendered in the left pane, hidden from bottom bar.
 */
export type TierState = 'anchor' | 'bar' | 'palette' | 'drawer';

/**
 * Left pane view.
 *
 * - `menu` — Navigation, search, tasks, patient workspaces (always available)
 * - `ai` — AI drawer (always available)
 * - `transcript` — Transcription drawer (only when txEligible && session exists)
 */
export type PaneView = 'menu' | 'ai' | 'transcript';

/** Module identifier used in action payloads. */
export type ModuleId = 'ai' | 'tm';

/** Reference pane tab (overview/activity are always present; protocol is conditional). */
export type OverviewTab = 'overview' | 'activity' | 'protocol';

// ---------------------------------------------------------------------------
// Coordination State
// ---------------------------------------------------------------------------

/**
 * The complete coordination state tuple (spec §3).
 *
 * Five values fully determine the UI layout of both surfaces (bottom bar + left pane).
 * Any combination not listed in §5/§6 valid states is forbidden.
 */
export interface CoordinationState {
  /** AI module's current tier */
  aiTier: TierState;
  /** Transcription module's current tier. Ignored when txEligible is false. */
  txTier: TierState;
  /** Current left pane view */
  paneView: PaneView;
  /** Whether the left pane is expanded (visible) */
  paneExpanded: boolean;
  /** Whether transcription is eligible (derived from encounter context). Gates TM column. */
  txEligible: boolean;
  /** Whether the overview pane is expanded (visible). Independent of coordination invariants. */
  overviewExpanded: boolean;
  /** Reference pane state — tracks tab visibility and protocol tab lifecycle. */
  referencePane: {
    expanded: boolean;
    activeTab: OverviewTab;
    protocolTabState: import('../../types/protocol').ProtocolTabState;
  };
}

// ---------------------------------------------------------------------------
// Actions (spec §13)
// ---------------------------------------------------------------------------

export type CoordinationAction =
  // Bottom bar interactions (spec §7)
  | { type: 'BAR_TAPPED'; payload: { module: ModuleId } }
  | { type: 'ANCHOR_TAPPED'; payload: { module: ModuleId } }
  | { type: 'PALETTE_COLLAPSED'; payload: { module: ModuleId } }
  | { type: 'PALETTE_ESCALATED'; payload: { module: ModuleId } }

  // Pane interactions (spec §8)
  | { type: 'PANE_VIEW_CHANGED'; payload: { to: PaneView } }
  | { type: 'PANE_COLLAPSED' }
  | { type: 'PANE_EXPANDED' }

  // Keyboard shortcuts (spec §9)
  | { type: 'CMD_K_PRESSED' }
  | { type: 'ESCAPE_PRESSED' }

  // Context changes (spec §10)
  | { type: 'ENCOUNTER_ENTERED'; payload: { encounterId: string; patientId: string } }
  | { type: 'ENCOUNTER_EXITED' }
  | { type: 'ENCOUNTER_SWITCHED'; payload: { encounterId: string; patientId: string } }

  // Overview pane (independent of coordination invariants)
  | { type: 'OVERVIEW_COLLAPSED' }
  | { type: 'OVERVIEW_EXPANDED' }

  // Reference pane tabs & protocol lifecycle
  | { type: 'OVERVIEW_TAB_CHANGED'; payload: { tab: OverviewTab } }
  | { type: 'PROTOCOL_TAB_AVAILABLE' }
  | { type: 'PROTOCOL_TAB_ACTIVATED' }
  | { type: 'PROTOCOL_TAB_DISMISSED' }
  | { type: 'PROTOCOL_TAB_COMPLETED' };

// ---------------------------------------------------------------------------
// Derived Types
// ---------------------------------------------------------------------------

/** Per-module visibility info for the bottom bar. */
export interface ModuleVisibility {
  visible: boolean;
  tier: Exclude<TierState, 'drawer'> | null;
}

/** What the bottom bar should render — derived from CoordinationState. */
export interface BottomBarVisibility {
  ai: ModuleVisibility;
  transcription: ModuleVisibility;
  layout: 'two-column' | 'single-column' | 'hidden';
}

// ---------------------------------------------------------------------------
// Invariant Violation (used by invariants.ts)
// ---------------------------------------------------------------------------

export interface InvariantResult {
  valid: boolean;
  violations: string[];
}
