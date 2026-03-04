# AppShell Architecture — Implementation Directive

> **Status:** Active Design
> **Last Updated:** 2026-03-03
> **Related Docs:** [Prototype → Production](./prototype-to-production.md) | [Information Architecture](../INFORMATION_ARCHITECTURE.md) | [Navigation Patterns](../NAVIGATION_PATTERNS.md) | [Pop Health Design Spec](../features/population-health/DESIGN-SPEC.md)

---

## Context

This directive resolves the architecture decisions from the Option C (Hybrid: Thin AppShell + Scope Renderers) analysis. It incorporates review feedback and makes several upgrades to the original recommendations based on scope requirements — specifically, drill-through navigation from population health → patient encounter is in scope for this pass, which changes the scope state and routing decisions.

Read [Prototype → Production](./prototype-to-production.md) for detailed rationale on each decision, including when prototype shortcuts are acceptable vs. when production-grade patterns are needed now.

---

## Decisions

### Decision 1: Scope State — Explicit Scope Stack

**CHANGED from original recommendation.** Do NOT derive scope from `selectedNavItem`. Build an explicit scope stack.

> **Note:** The [Prototype → Production](./prototype-to-production.md) guide (Section 1.1) describes scope derivation as the prototype approach with an upgrade path to an explicit stack. **This directive goes directly to the production approach** because drill-through navigation (the documented trigger condition) is in scope for this pass.

**Why the change:** Drill-through navigation (cohort → patient → back to cohort) is in scope. This requires knowing where the user came from, not just where they are. A derived value has no history — a stack does.

**Implementation:**

```typescript
type Scope =
  | { type: 'hub'; hubId: 'home' | 'visits' }
  | { type: 'todo'; categoryId: string; filterId: string }
  | { type: 'cohort'; cohortId: string; pathwayId?: string; preserved?: CohortViewState }
  | { type: 'patient'; patientId: string; encounterId?: string; preserved?: EncounterViewState }

interface ScopeManager {
  current: Scope
  stack: Scope[]                          // history for back/forward
  push(scope: Scope): void                // navigate to new scope, adds to stack
  pop(): Scope | null                     // go back to previous scope
  replace(scope: Scope): void             // swap current without adding history
  origin: Scope | null                    // where the user came from (for drill-through UI)
}
```

This can live inside NavigationContext (collapsing scope and navigation into one concept) or as a peer context. Collapsing is cleaner if it doesn't over-complicate NavigationContext — use judgment.

Menu selections use `replace()` (flat switches, no stack). Drill-through uses `push()` (stacked, preserves return path). Return actions use `pop()`.

`selectedNavItem` still exists for menu highlight state, but scope is the authoritative source for what renders. Keep them in sync — when `push()` or `replace()` is called, update `selectedNavItem` to match. When a menu item is clicked directly, call `replace()` with the corresponding scope.

---

### Decision 2: Content Delivery — Direct Composition with Scope Routers

**UNCHANGED.** Use thin scope router components:

```typescript
const ScopeCanvas: React.FC<{ scope: Scope }> = ({ scope }) => {
  switch (scope.type) {
    case 'patient': return <EncounterCanvas />;
    case 'cohort': return <PopHealthCanvas />;
    case 'todo': return <ToDoCanvas />;
    default: return <HubCanvas />;
  }
};
```

Same pattern for ScopeOverview, ScopeHeader, ScopeAIBar. Each scope component wraps its own providers internally. Standard React, no unusual patterns.

---

### Decision 2b: Cross-Slot State — Duplicate Derivation

**UNCHANGED.** Both EncounterCanvas and EncounterOverview independently derive patient data from mock data. Zero-cost for static data. No shared provider needed.

If cross-slot selection sync is needed within a scope (e.g., selecting a chart item in canvas highlights it in overview), use a lightweight scope-specific context inside the scope renderer — not a provider above AppShell. This context mounts/unmounts with the scope, which is correct behavior.

---

### Decision 3: NavRow — Generalize Props

**CHANGED from original recommendation.** Generalize scope-specific prop names as part of this pass. The app already has 4 scope types using 3 different prop paths — generalize now rather than accumulate more tech debt.

> **Note:** The [Prototype → Production](./prototype-to-production.md) guide (Section 1.3) describes keeping encounter-specific prop names as the prototype approach with a trigger to generalize later. **This directive goes directly to the production approach** because we already have 4 scopes using 3 different prop paths — the trigger condition ("new scope needs collapse/expand behavior and can't get it through workspaceContent") is met.

Rename:

| Current (scope-specific)     | New (scope-agnostic)                 | Behavior                                                                 |
|------------------------------|--------------------------------------|--------------------------------------------------------------------------|
| `patientIdentity`            | `collapsedIdentityContent`           | ReactNode shown in canvas zone when overview pane is collapsed           |
| `isToDoView`                 | `canvasViewMode: 'standard' \| 'list'` | Controls which NavRow layout pattern renders                            |
| `todoTitle`                  | `canvasViewTitle`                    | Title string for list-mode views                                         |

Internal NavRow conditionals change from `if (isToDoView)` to `if (canvasViewMode === 'list')`. The collapse/expand identity behavior (currently only wired for patient scope) becomes available to all scopes via `collapsedIdentityContent`.

`workspaceContent` override remains available as an escape hatch but should not be the default path for new scopes.

Each scope provides its own values for these generalized props. The scope router pattern (Decision 2) handles this — a `scopeNavRowProps(scope)` function or equivalent returns the right config per scope.

---

### Decision 4: AI Bar — Per-Scope Instances

**UNCHANGED.** Each scope renders its own BottomBarContainer with scope-specific props. The bar remounts on scope switch.

Mask the remount with a CSS enter transition (fade-in or slide-up, ~150ms). This reinforces the mental model that the AI context has changed.

---

### Decision 5: Keyboard Shortcuts — No New Architecture

**UNCHANGED.** Shell-level shortcuts (pane toggles) live in AppShell. Scope-specific shortcuts register/unregister on mount/unmount inside scope renderers. The custom event pattern (`ehr:context-segment`) handles scope-remapped keys (1/2/3). No changes needed.

---

### Decision 6: Menu Routing — Generic navigateToScope

**CHANGED from original recommendation.** Do NOT use per-transition callbacks. Build a generic `navigateToScope` function that any component can call.

> **Note:** The [Prototype → Production](./prototype-to-production.md) guide (Section 1.5) describes scope-specific menu routing as the prototype approach with a trigger to upgrade when a third cross-scope navigation path is added. **This directive goes directly to the production approach** because drill-through makes callback proliferation an immediate concern — the trigger condition is met before we even start building.

```typescript
// Any component, in any scope, can call:
navigateToScope({ type: 'patient', patientId: 'sarah-chen', encounterId: 'enc-001' })
```

This replaces individual callbacks like `onDrillToPatient`, `onReturnToCohort`, etc. The scope manager (Decision 1) handles the routing logic — determining whether this is a `push` (drill-through), `replace` (flat menu switch), or `pop` (return).

Heuristic for push vs. replace:
- If called from inside a scope renderer's canvas content (drill-through) → `push`
- If called from menu selection → `replace`
- If called from a return/back affordance → `pop`

Expose this as `navigateToScope(scope, { mode: 'push' | 'replace' })` and `goBack()`. Let the caller specify intent rather than having the manager guess.

---

### Decision 7: Provider Hierarchy — Persistent Shell + Scope-Specific Renderers

**UNCHANGED in structure.** Same boundary:

```
NavigationProvider / ScopeManager    (persistent)
└── CoordinationProvider             (persistent — pane geometry)
    └── WorkspaceProvider            (persistent — open patient tabs)
        └── AppShell                 (persistent — menu, scope routing)
            ├── MenuPane             (persistent)
            ├── AdaptiveLayout       (persistent)
            │   ├── ScopeOverview    (scope-specific content)
            │   ├── ScopeCanvas      (scope-specific content)
            │   └── ScopeHeader      (scope-specific content)
            └── ScopeAIBar           (scope-specific content)
```

**NEW: Scope state preservation for drill-through return.**

When a drill-through `push()` happens (cohort → patient), the cohort scope's view state must be captured and preserved so it can be restored on `pop()`. This includes: selected protocol/layer, selected node, scroll position, active filters.

Implementation approach: When `push()` is called, the current scope's renderer serializes its view state into the `preserved` field on the scope stack entry. When `pop()` restores that scope, the renderer reads `preserved` and hydrates from it instead of initializing fresh.

```typescript
// Cohort scope renderer, on drill-through:
const currentViewState: CohortViewState = {
  selectedProtocolId,
  selectedNodeId,
  scrollPosition: canvasRef.current?.scrollTop,
  activeFilters,
};
scopeManager.push(
  { type: 'patient', patientId: 'sarah', origin: scopeManager.current },
  { preserveCurrentState: currentViewState }
);

// Cohort scope renderer, on mount (check for preserved state):
const restoredState = scopeManager.current.preserved;
if (restoredState) {
  // Hydrate from preserved state instead of defaults
}
```

The preserved state is plain data (serializable), not React component state or refs. Scroll position is a number. Selections are IDs. This keeps the scope stack serializable (future: could persist to sessionStorage for page refresh survival).

Each scope variant has its own preserved state type: `CohortViewState` for cohort, `EncounterViewState` for patient, `ToDoViewState` for todo. Hub scopes likely don't need preserved state.

---

## Drill-Through Flow

The full interaction path:

1. Provider is in population health scope, viewing the diabetes cohort flow view
2. They select a node → see patient list in the node detail area or side drawer
3. They tap a patient row → patient preview drawer opens with summary info
4. Drawer has an "Open Patient Workspace" action button
5. Tapping it calls `navigateToScope({ type: 'patient', patientId: '...', encounterId: '...' }, { mode: 'push' })`
6. Scope manager captures cohort view state, pushes patient scope onto the stack
7. App transitions to patient encounter workspace
8. A return affordance is visible, showing origin context (e.g., "← Diabetes T2")
9. Provider does their work in the encounter
10. They tap the return affordance → calls `goBack()`
11. Scope manager pops the patient scope, restores the cohort scope with preserved state
12. Cohort view renders with prior selection, scroll position, and filters intact

**Return affordance placement — recommended: Option A (Canvas top bar).**

Small back-arrow + origin label (e.g., `← Diabetes T2`) in the left side of the canvas header area, before the segmented control. This is consistent with the existing ContextBar pattern used for To-Do → Patient → Return flow. The ContextBar already renders at the top of canvas, below FloatingNavRow — the return affordance follows the same pattern with the same visual language.

The affordance should:
- Show the origin scope's label (cohort name, pathway name, or equivalent)
- Only appear when the scope stack has depth > 1 (i.e., there's somewhere to go back to)
- Disappear after `pop()` is called
- Not interfere with the encounter workspace's primary interactions

---

## Scopes to Build

**This pass:** Population health (cohort/pathway) is the primary new scope. Encounter scope is the existing baseline.

**Scope routers should include cases for:** `patient`, `cohort`, `todo`, `hub`. To-do and hub can render their current placeholder/rudimentary implementations through the new router pattern — this wires them into the architecture even if their content doesn't change yet. This avoids having to re-route them later when they're built out.

---

## Summary of Changes from Original Recommendations

| Decision | Original Recommendation | Revised Directive | Reason |
|---|---|---|---|
| 1. Scope state | Derive from selectedNavItem | Explicit scope stack (ScopeManager) | Drill-through requires navigation history |
| 2. Content delivery | Direct composition, scope routers | Unchanged | — |
| 2b. Cross-slot state | Duplicate derivation | Unchanged | — |
| 3. NavRow | Leave patient-specific props as-is | Generalize prop names | 4 scopes, 3 prop paths — clean up now |
| 4. AI bar | Per-scope instances | Unchanged | — |
| 5. Shortcuts | No new architecture | Unchanged | — |
| 6. Menu routing | selectedNavItem + scope-specific callbacks | Generic navigateToScope + scope manager | Drill-through makes callbacks proliferate |
| 7. Provider hierarchy | Persistent above / scope-specific below | Unchanged structure + add state preservation for drill-through | Cohort state must survive round-trip to patient |
