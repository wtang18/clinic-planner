# AppShell Extraction + Pop Health Integration — Implementation Directive

## Context

We attempted three incremental approaches to integrate population health into the prototype: inline integration (cohort rendering inside CaptureView), undo + separate PopHealthView, and menu state patching. Each solved one problem and introduced the next. The cumulative patch cost now exceeds the cost of doing the extraction properly.

This directive implements the Option C architecture (Thin AppShell + Scope Renderers) from APPSHELL-ARCHITECTURE-DIRECTIVE.md. It combines:
- The full CaptureView extraction into AppShell + EncounterWorkspace
- Scope stack with drill-through support
- NavRow generalization
- CohortWorkspace build-out

Pop health component fixes (FlowCanvas, LayerTree, CohortContextPane) are already complete and committed separately.

Reference documents:
- docs/architecture/APPSHELL-ARCHITECTURE-DIRECTIVE.md — Resolved architecture decisions
- docs/architecture/PROTOTYPE-TO-PRODUCTION.md — Migration guide with upgrade triggers
- docs/features/population-health/PHASED-PLAN.md — Pop health phasing

---

## Execution Order

Two phases. Phase A (component fixes) is already complete and committed. Phase B is the extraction — seven steps executed in order. Each step should leave the app compilable (tsc clean). Commit after each step if possible, or at minimum after B3, B5, and B7.

### Phase A: Pop Health Component Fixes — COMPLETE

Already implemented and committed: FlowCanvas (MiniMap removal, node tapping, sizing), LayerTree (default expanded, font sizes), CohortContextPane (Alerts tab, showIcon prop on CohortIdentityHeader). No further action needed.

### Phase B: AppShell Extraction

### B1: Scope Type Definitions

File: src/types/scope.ts (NEW)

```typescript
/** Preserved view state for cohort workspace (restored on popScope) */
export interface CohortViewState {
  selectedPathwayIds: string[];
  selectedNodeId: string | null;
  activeView: 'flow' | 'table';
  scrollPosition?: { x: number; y: number };
  filters?: unknown[];
}

/** Preserved view state for encounter workspace (restored on popScope) */
export interface EncounterViewState {
  mode: 'capture' | 'process' | 'review';
  scrollPosition?: number;
}

/** Discriminated union of all scope types — identity + params only, no UI state */
export type Scope =
  | { type: 'hub'; hubId: 'home' | 'visits' }
  | { type: 'todo'; categoryId: string; filterId: string }
  | { type: 'cohort'; cohortId: string; pathwayId?: string }
  | { type: 'patient'; patientId: string; encounterId?: string }

/** Entry in the scope stack — includes historical snapshot */
export interface ScopeStackEntry {
  scope: Scope;
  originLabel?: string;
  preservedState?: CohortViewState | EncounterViewState;
}
```

Note: `preservedState` lives on `ScopeStackEntry`, NOT on `Scope`. Scope is just identity. Preserved state is a property of the historical snapshot captured during push.

### B2: Scope Stack in NavigationContext

File: src/navigation/NavigationContext.tsx (MODIFY)

Add scope-aware navigation alongside existing methods. Non-breaking — all existing navigate/goBack calls continue working.

**New state:**
```typescript
const [scopeStack, setScopeStack] = useState<ScopeStackEntry[]>([]);
const [restoredState, setRestoredState] = useState<CohortViewState | EncounterViewState | null>(null);
```

**New methods on context value:**

```typescript
/** Navigate to a scope. mode='replace' (default) clears stack. mode='push' preserves return path. */
navigateToScope: (scope: Scope, options?: {
  mode?: 'replace' | 'push';
  originLabel?: string;
  preserveState?: CohortViewState | EncounterViewState;
}) => void;

/** Pop scope stack, navigate to previous scope, make preserved state available */
popScope: () => void;

/** Current scope — explicit if set via navigateToScope, otherwise derived from current screen */
currentScope: Scope | null;

/** Whether scope stack has depth > 1 */
canPopScope: boolean;

/** Label of origin scope for return affordance */
scopeOriginLabel: string | null;

/** State preserved from most recent popScope(). Workspace reads on mount, then calls clearRestoredState(). */
restoredState: CohortViewState | EncounterViewState | null;

/** Clear restored state after workspace has hydrated from it */
clearRestoredState: () => void;
```

**navigateToScope implementation:**
1. If `mode === 'push'`: create `ScopeStackEntry` from current scope + `options.preserveState` + `options.originLabel`, push onto stack
2. If `mode === 'replace'` (default): clear the scope stack
3. Translate scope to screen navigation:
   - `{ type: 'hub', hubId: 'home' }` → navigate to demo/home screen
   - `{ type: 'cohort', cohortId }` → navigate to 'population-health' screen with cohortId param
   - `{ type: 'patient', encounterId }` → navigateToEncounter(encounterId)
   - `{ type: 'todo', categoryId, filterId }` → navigate to encounter screen with todo params

**popScope implementation:**
1. Pop top entry from scopeStack
2. Set `restoredState` to popped entry's `preservedState`
3. Set `scopeOriginLabel` from remaining top-of-stack (or null)
4. Call `navigateToScope(poppedEntry.scope, { mode: 'replace' })` to navigate to the restored scope

**currentScope derivation (fallback):**
When no explicit scope has been set, derive from current screen state. This ensures existing navigation calls that don't use navigateToScope still produce a valid currentScope.

**State capture flow (who does what):**
1. Workspace assembles its own `preserveState` object (selected items, scroll position, etc.)
2. Workspace passes it to `navigateToScope(targetScope, { mode: 'push', preserveState: myState })`
3. Scope manager stores it on the ScopeStackEntry — the manager is generic and doesn't know what the state contains

**State restoration flow:**
1. `popScope()` sets `restoredState` from the popped entry
2. Target workspace reads `restoredState` on mount
3. Workspace hydrates its local state from `restoredState`
4. Workspace calls `clearRestoredState()` — explicit clear, not auto-clear, because multiple components in the workspace may need to read it during the same mount cycle

### B3: State Audit + AppShell Creation

This is the critical step. Before writing AppShell, audit every piece of CaptureView state and categorize it.

**Step 1: Audit CaptureView state.** Go through every useState, useCallback, useMemo, useEffect in CaptureView. Categorize each as:

- **Shell state** — shared across workspaces, persists on scope switch. Moves to AppShell.
- **Encounter state** — specific to encounter workspace. Stays in EncounterWorkspace.
- **Tangled** — currently serves both purposes. Needs to be split.

Expected categorization (verify against actual code):

Shell state (moves up):
- `selectedNavItem` + menu selection handlers
- Patient workspaces list (open tabs) — may already be in WorkspaceProvider
- Pane coordination (overview collapsed, left pane collapsed) — may already be in CoordinationProvider
- `viewMode` partially — the shell needs to know "which scope" but the encounter-specific modes (capture/process/review) stay in encounter
- Menu callbacks: `onNavItemSelect`, `onCohortSelect`, `onToDoFilterSelect`, `onPatientSelect` — all become `navigateToScope` calls

Encounter state (stays):
- Chart items, active encounter data, selected chart item
- Transcription session state
- AI conversation state
- OmniAdd state
- View mode within encounter (capture/process/review)
- Processing rail state
- Details pane open/closed + selected item
- Encounter-specific keyboard handlers (1/2/3 mode switching)

Likely tangled:
- `selectedNavItem` — drives menu highlight (shell) AND some encounter routing (encounter). Split: shell owns selectedNavItem for menu highlight; encounter reads currentScope for its own routing.
- `handleNavBack` — has scope-dependent behavior. Replace with navigateToScope/popScope.

**Step 2: Create AppShell.**

File: src/screens/AppShell/AppShell.tsx (NEW)

AppShell should be ~200–300 lines. It owns:

```typescript
const AppShell: React.FC = () => {
  const { currentScope, navigateToScope, canPopScope, scopeOriginLabel, popScope } = useNavigation();
  // Pane coordination — if not already in CoordinationProvider, manage here
  // selectedNavItem for menu highlight
  // Patient workspaces from WorkspaceProvider

  return (
    <AdaptiveLayout
      menuPane={
        <LeftPaneContainer
          menuPaneProps={{
            patientWorkspaces,
            selectedNavItem,
            onNavItemSelect: handleNavItemSelect,      // calls navigateToScope
            onCohortSelect: handleCohortSelect,        // calls navigateToScope
            onToDoFilterSelect: handleToDoFilterSelect, // calls navigateToScope
            onPatientSelect: handlePatientSelect,      // calls navigateToScope
          }}
          // Transcription/AI drawer controls — only passed when scope is patient
          // (or handled by each workspace independently)
        />
      }
      overviewPane={<ScopeOverview />}
      canvasPane={<ScopeCanvas />}
      canvasHeaderContent={<ScopeCanvasHeader />}
      overviewHeaderContent={<ScopeOverviewHeader />}
      collapsedIdentityContent={<ScopeCollapsedIdentity />}
      aiControlSurface={<ScopeAIBar />}
      {...paneCoordinationProps}
    />
  );
};
```

**Menu callbacks:** All menu item handlers call `navigateToScope` with the appropriate scope + `mode: 'replace'`:

```typescript
const handleNavItemSelect = (itemId: string) => {
  setSelectedNavItem(itemId);
  // Map itemId to scope — this is the routing logic
  if (itemId === 'home') navigateToScope({ type: 'hub', hubId: 'home' }, { mode: 'replace' });
  if (itemId === 'visits') navigateToScope({ type: 'hub', hubId: 'visits' }, { mode: 'replace' });
  // etc.
};

const handleCohortSelect = (cohortId: string) => {
  setSelectedNavItem(`cohort-${cohortId}`);
  navigateToScope({ type: 'cohort', cohortId }, { mode: 'replace' });
};

const handlePatientSelect = (patientId: string, encounterId: string) => {
  setSelectedNavItem(`patient-${patientId}`);
  navigateToScope({ type: 'patient', patientId, encounterId }, { mode: 'replace' });
};
```

**Scope router components (4–5 thin files):**

File: src/screens/AppShell/ScopeCanvas.tsx (NEW, ~20 lines)
```typescript
const ScopeCanvas: React.FC = () => {
  const { currentScope } = useNavigation();
  switch (currentScope?.type) {
    case 'patient': return <EncounterCanvas />;
    case 'cohort': return <CohortCanvas />;
    case 'todo': return <ToDoCanvas />;       // existing placeholder
    default: return <HubCanvas />;            // existing placeholder
  }
};
```

Same pattern for ScopeOverview, ScopeCanvasHeader, ScopeOverviewHeader, ScopeCollapsedIdentity, ScopeAIBar. Each is a thin switch. Each returns the workspace-specific component for that slot.

Todo and hub scopes: render their current existing implementations (however rudimentary) through the router. This wires them into the architecture even though their content doesn't change yet.

### B4: FloatingNavRow Generalization

File: src/components/layout/FloatingNavRow.tsx (MODIFY)

Rename props:

| Current | New | Type |
|---|---|---|
| `patientIdentity` | `collapsedIdentityContent` | `ReactNode` |
| `isToDoView` | `canvasViewMode` | `'standard' \| 'list'` |
| `todoTitle` | `canvasViewTitle` | `string` |

Update internal conditionals:
- `if (isToDoView)` → `if (canvasViewMode === 'list')`
- `patientIdentity && ...` → `collapsedIdentityContent && ...`
- References to `todoTitle` → `canvasViewTitle`

Update all consumer callsites to use new prop names. These are:
- AppShell (new, already uses new names)
- Any other direct FloatingNavRow consumers (search for imports)

`workspaceContent` remains available as an escape hatch but should not be the default path for new scopes.

### B5: Extract EncounterWorkspace from CaptureView

File: src/screens/EncounterWorkspace/EncounterWorkspace.tsx (NEW — or rename/refactor CaptureView)

CaptureView minus all shell wiring becomes EncounterWorkspace. It no longer renders AdaptiveLayout, MenuPane, or FloatingNavRow directly. Instead it exports slot-filling components that the scope routers consume:

```typescript
// What AppShell's scope routers call:
export const EncounterCanvas: React.FC = () => { /* chart items, OmniAdd, processing rail */ };
export const EncounterOverview: React.FC = () => { /* PatientOverviewPane */ };
export const EncounterCanvasHeader: React.FC = () => { /* Capture/Process/Review segmented control + mode-specific header */ };
export const EncounterOverviewHeader: React.FC = () => { /* PatientIdentityHeader */ };
export const EncounterCollapsedIdentity: React.FC = () => { /* compact patient identity for collapsed overview */ };
export const EncounterAIBar: React.FC = () => { /* BottomBarContainer with transcription + encounter AI */ };
```

Each of these components accesses encounter state via encounter-specific providers/hooks. The providers wrap the components internally (or wrap a parent EncounterWorkspace component that renders nothing but provides context to the slot components via React context).

**Cross-slot shared state within encounter:** EncounterCanvas and EncounterOverview both need patient data, selected chart item, etc. Two options:

Option A (recommended for prototype): Duplicate derivation. Both independently call mock data functions. Zero-cost with static data.

Option B: EncounterProvider wraps the slot components. But it can't wrap them from inside a slot — it needs to be above them. This means either:
- AppShell conditionally wraps its content in EncounterProvider when scope is patient (tree shape changes — may cause remount, test this)
- Or an external store that both components read from

Go with Option A unless you hit a case where cross-slot selection sync is needed (e.g., selecting a chart item in canvas highlights something in overview). If that case arises, flag it and we'll decide.

**What CaptureView was doing that EncounterWorkspace no longer does:**
- ❌ Rendering AdaptiveLayout — shell does this
- ❌ Rendering MenuPane — shell does this
- ❌ Managing selectedNavItem — shell does this
- ❌ Managing pane coordination — shell / CoordinationProvider does this
- ❌ Handling cohort selection — shell routes to CohortWorkspace
- ❌ Handling patient workspace selection — shell handles
- ✅ All encounter-specific state, hooks, rendering, keyboard handlers — stays

**Expected result:** EncounterWorkspace should be ~800–1000 lines (down from CaptureView's 1493). The reduction comes from removing shell wiring, menu callbacks, and all cohort code paths.

### B6: Build CohortWorkspace

File: src/screens/CohortWorkspace/CohortWorkspace.tsx (NEW — or refactor PopHealthView)

Same pattern as EncounterWorkspace — exports slot-filling components:

```typescript
export const CohortCanvas: React.FC = () => { /* PopHealthCanvas (FlowCanvas/TableView) */ };
export const CohortOverview: React.FC = () => { /* CohortContextPane with tabs */ };
export const CohortCanvasHeader: React.FC = () => { /* Flow/Table segmented control + filter buttons */ };
export const CohortOverviewHeader: React.FC = () => { /* CohortIdentityHeader, showIcon={false} */ };
export const CohortCollapsedIdentity: React.FC = () => { /* compact cohort identity for collapsed overview */ };
export const CohortAIBar: React.FC = () => { /* cohort-scoped BottomBarContainer — cohort context, canned queries, no transcription */ };
```

CohortWorkspace wraps its content in PopHealthProvider internally. The provider mounts when the cohort scope activates and unmounts when it deactivates.

**Keyboard shortcut remapping:** CohortWorkspace registers its own handler for the `ehr:context-segment` custom event, mapping 1 → Flow View, 2 → Table View (key 3 is unmapped in cohort mode — ignore silently). This uses the same custom event pattern the encounter workspace uses for Capture/Process/Review. When scope switches, the encounter handler unregisters (unmount) and the cohort handler registers (mount). The key binding is constant; the action changes per scope.

```typescript
// Inside CohortWorkspace (or CohortCanvas)
useEffect(() => {
  const handler = (e: Event) => {
    const { index } = (e as CustomEvent).detail;
    if (index === 1) dispatch({ type: 'VIEW_CHANGED', view: 'flow' });
    if (index === 2) dispatch({ type: 'VIEW_CHANGED', view: 'table' });
    // index 3+: no-op in cohort mode
  };
  window.addEventListener('ehr:context-segment', handler);
  return () => window.removeEventListener('ehr:context-segment', handler);
}, [dispatch]);
```

**Cohort AI bar:** Build this as a contextually useful AI surface for population health work — not a suppressed encounter bar and not an empty stub. Specifically:

- `contextTarget`: `{ type: 'cohort', label: selectedCohort.name }` — the AI knows it's operating on a cohort
- `transcriptionEnabled`: `false` — transcription is encounter-specific
- `suggestions`: empty array for now (cohort-specific AI suggestions are a future feature)
- `cannedQueries`: cohort-relevant prompts, e.g., "Show patients with A1c > 9%", "Which patients are overdue for follow-up?", "Summarize escalated patients". These give the AI bar immediate utility in the cohort context.
- `patientName`: empty string or cohort name — this prop may need renaming (it's encounter-specific naming on a shared component). Use cohort name if it renders anywhere visible; empty string if it's only used internally.

If BottomBarContainer requires props that don't apply to cohort, pass appropriate defaults (empty string, false, empty array) rather than using `as any` casts. If the prop surface is too encounter-specific to use cleanly, flag it — we may want to refactor BottomBarContainer's interface to be more scope-agnostic. For now, defaults are fine for the prototype.

**Category overview placeholder:** When scope is `{ type: 'cohort', cohortId: 'grp-...' }`, CohortCanvas renders a placeholder instead of PopHealthCanvas:
```typescript
const CohortCanvas: React.FC = () => {
  const { currentScope } = useNavigation();
  if (currentScope?.type === 'cohort' && currentScope.cohortId.startsWith('grp-')) {
    return <CategoryOverviewPlaceholder />;
  }
  return <PopHealthCanvas />;
};
```

### B7: ScopeReturnBar + Drill-Through Wiring

**Return affordance — evaluate placement and recommend.**

Explore these three options and propose one with rationale:

**Option A: Canvas top bar.** Back arrow + origin label above the canvas content. Conventional, but adds height in encounter mode where the top bar area is already dense.

**Option B: Floating chip near AI bar.** Small pill above or adjacent to the bottom bar. Unobtrusive but potentially disconnected from navigation.

**Option C: Left menu contextual item.** Temporary "← Diabetes T2" entry at the top of MenuPane. Keeps navigation in the navigation surface. No canvas real estate cost.

The affordance should:
- Show the origin scope's label (from `scopeOriginLabel`)
- Only appear when `canPopScope` is true
- Call `popScope()` on click
- Not interfere with workspace-specific interactions

**Drill-through wiring:** Not fully wired in this pass (the patient preview drawer that triggers drill-through is a later phase). But the infrastructure is ready:
- `navigateToScope` with `mode: 'push'` works
- `popScope` works
- Return affordance renders when `canPopScope` is true
- Preserved state capture and restoration works

When Phase 6 (patient preview drawer) is built, it calls:
```typescript
navigateToScope(
  { type: 'patient', patientId, encounterId },
  {
    mode: 'push',
    originLabel: selectedCohort.name, // e.g., "Diabetes T2"
    preserveState: {
      selectedPathwayIds: [...],
      selectedNodeId: '...',
      activeView: 'flow',
      scrollPosition: { x: 0, y: canvasScrollTop },
    }
  }
);
```

---

## Verification

### Phase A — COMPLETE (already committed)

### Phase B
1. `npx tsc --noEmit` — 0 errors
2. `npm run test:run` — all tests pass
3. **AppShell renders all scopes:** encounter, cohort, todo, hub all route through scope routers
4. **CaptureView is gone or renamed to EncounterWorkspace.** Grep: zero references to cohort, PopHealth, or `viewMode === 'cohort'` in encounter code
5. **MenuPane is persistent.** Same menu instance, same items, same patient workspaces list in both encounter and cohort modes. Selected item persists across scope switches.
6. **Pane state persists.** Collapse the overview pane in encounter → switch to cohort → overview is still collapsed. Collapse left pane in cohort → switch to encounter → left pane is still collapsed.
7. **Scope switching works.** Click cohort in menu → cohort workspace renders. Click patient workspace → encounter renders. Click home → hub renders. No flicker, no layout remount.
8. **NavRow generalized.** No references to `patientIdentity`, `isToDoView`, `todoTitle` in FloatingNavRow. All consumers use new prop names.
9. **Scope stack.** navigateToScope with push/replace, popScope, currentScope, canPopScope, restoredState, clearRestoredState all function correctly.
10. **Return affordance.** ScopeReturnBar/equivalent renders when canPopScope is true, shows origin label, calls popScope.

---

## File Summary

| File | Action | Phase |
|---|---|---|
| src/types/scope.ts | NEW — scope types, stack entry | B1 |
| src/navigation/NavigationContext.tsx | MODIFY — scope stack, navigateToScope, popScope, restoredState | B2 |
| src/components/layout/FloatingNavRow.tsx | MODIFY — rename props, update conditionals | B4 |
| All FloatingNavRow consumers | MODIFY — update prop names | B4 |
| src/screens/AppShell/AppShell.tsx | NEW — thin shell, AdaptiveLayout, MenuPane, scope routers | B3 |
| src/screens/AppShell/ScopeCanvas.tsx (+ 4–5 siblings) | NEW — thin scope router components | B3 |
| src/screens/EncounterWorkspace/ | NEW (or refactored CaptureView) — encounter slot components | B5 |
| src/screens/CohortWorkspace/ | NEW (or refactored PopHealthView) — cohort slot components | B6 |
| src/components/navigation/ScopeReturnBar.tsx | NEW — return affordance (placement per recommendation) | B7 |
| src/navigation/AppRouter.tsx | MODIFY — route to AppShell instead of individual screens | B3 |

---

## What's Deferred

- **Drill-through trigger** — the patient preview drawer "Open Patient Workspace" button (Phase 6 of pop health plan). Infrastructure is ready; the UI trigger comes later.
- **State preservation hydration** — CohortWorkspace reading `restoredState` on mount. Built in this pass but not fully testable until drill-through trigger exists.
- **Hub and To-Do workspace build-out** — wired into scope routers as existing placeholders. Content development is a future pass.
