/**
 * Scope System Types
 *
 * Scope = "where am I" — identity + params for the current workspace.
 * The scope stack enables drill-through navigation (cohort → patient → back)
 * with state preservation across transitions.
 *
 * Preserved state lives on ScopeStackEntry (historical snapshot), not on Scope itself.
 * The calling workspace assembles its preserveState before pushing; the scope system
 * stores it opaquely and returns it on pop.
 */

// ============================================================================
// Preserved State Types
// ============================================================================

/** Preserved state for cohort views (restored on popScope) */
export interface CohortViewState {
  selectedPathwayIds: string[];
  selectedNodeId: string | null;
  activeView: 'flow' | 'table';
  scrollPosition?: { x: number; y: number };
  activeFilters?: unknown[];
}

/** Preserved state for encounter views (restored on popScope) */
export interface EncounterViewState {
  mode: 'capture' | 'process' | 'review';
  scrollPosition?: number;
}

// ============================================================================
// Scope Types
// ============================================================================

/** Discriminated union of all scope types — identity only, no UI state */
export type Scope =
  | { type: 'hub'; hubId: 'home' | 'visits' }
  | { type: 'todo'; categoryId: string; filterId: string }
  | { type: 'cohort'; cohortId: string; pathwayId?: string }
  | { type: 'patient'; patientId: string; encounterId?: string };

/** Entry in the scope stack */
export interface ScopeStackEntry {
  scope: Scope;
  /** Label shown in return affordance (e.g., "Diabetes T2") */
  originLabel?: string;
  /** UI state snapshot captured at push time — restored on pop */
  preservedState?: CohortViewState | EncounterViewState;
}
