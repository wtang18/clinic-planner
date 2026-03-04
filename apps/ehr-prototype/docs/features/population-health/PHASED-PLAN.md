# Population Health Workspace — Phased Build Plan (Rev 2)

> **Status:** Active Design
> **Last Updated:** 2026-03-03
> **Related Docs:** [Design Spec](./DESIGN-SPEC.md) | [Progress](./PROGRESS.md) | [AppShell Scope System](../../architecture/appshell-scope-system.md) | [Prototype → Production](../../architecture/prototype-to-production.md)

**Target:** Build into existing EHR prototype (React)
**Executor:** Claude Code (each phase is a self-contained prompt)

---

## Build Strategy

This is **Rev 2** of the build plan. Rev 1 described a from-scratch build on a separate-screen architecture (PopHealthView owning its own AdaptiveLayout). That approach was rejected in favor of the AppShell Scope System — a shared shell where scope-specific content plugs into layout slots.

**What already exists:** The first implementation pass produced ~17 pop health files (types, mock data, context, components). An audit against the new architecture found:
- **13 files** work as-is or need only minor updates
- **3 files** need wiring changes (PopHealthView eliminated, PopHealthCanvas re-hosted, PatientPreviewView drill-through call)
- **0 files** need full rework
- **~10 new things** to build (scope system, menu integration, React Flow, center pane updates)

**The hard work is CaptureView extraction** — the encounter workspace currently owns the AdaptiveLayout. The shell needs to own it instead, with scope routers dispatching content.

Eight phases, ordered by dependency. Phase 0 is the architectural prerequisite. Phases 1-7 build pop health content within the new architecture.

**Key principles for implementation:**
- The AppShell (AdaptiveLayout + MenuPane + FloatingNavRow) is persistent across scope switches. Only pane content changes.
- Scope switching is via `navigateToScope()` through a ScopeManager. The URL, menu state, and all three panes update atomically.
- All pop health data is mock/static. No backend. Data structures should be realistic.
- Follow existing codebase patterns. Match existing component, state, and styling conventions.
- "Pathway" for pop health flows, "Protocol" for encounter-level care guidelines.

---

## Phase 0: AppShell Scope Infrastructure

**Goal:** Extract the encounter workspace from owning the layout. Establish the scope system so both encounter and cohort scopes plug into the same shell.

This is the foundational architectural change. Everything else depends on it.

### 0a. Scope Type Definitions

**File:** `src/types/scope.ts` (NEW)

```ts
type Scope =
  | { type: 'hub'; hubId: 'home' | 'visits' }
  | { type: 'todo'; categoryId: string; filterId: string }
  | { type: 'cohort'; cohortId: string; pathwayId?: string; preserved?: CohortViewState }
  | { type: 'patient'; patientId: string; encounterId?: string; preserved?: EncounterViewState }

interface ScopeStackEntry {
  scope: Scope;
  origin?: { label: string; scopeIndex: number };
}
```

### 0b. ScopeManager

**File:** `src/navigation/ScopeManager.tsx` (NEW) — or extend existing `NavigationContext.tsx`

Core operations:
- `navigateToScope(scope, { mode: 'replace' | 'push' })` — replace current scope or push onto stack
- `popScope()` — return to previous scope, restoring preserved state
- `currentScope` — the active scope at top of stack
- `canPop` — whether the stack has depth > 1 (controls return affordance visibility)

The scope stack enables drill-through: cohort → patient → back to cohort with state preserved.

### 0c. CaptureView Extraction

**Currently:** `CaptureView` (or equivalent encounter host) composes `AdaptiveLayout` with encounter-specific content in each pane slot. The FloatingNavRow receives patient-specific props.

**After:** The AppShell owns `AdaptiveLayout`. Thin scope routers decide what content fills each slot based on `currentScope.type`:

```tsx
// AppShell (persistent)
<AdaptiveLayout
  menuPane={<MenuPane />}                    // Already shared
  overviewPane={<ScopeOverview />}            // NEW: routes by scope
  canvasPane={<ScopeCanvas />}                // NEW: routes by scope
  canvasHeaderContent={<ScopeHeader />}       // NEW: routes by scope
  aiControlSurface={<ScopeAIBar />}           // NEW: routes by scope
/>
```

Each scope router is a thin switch:
```tsx
function ScopeCanvas() {
  const { currentScope } = useScopeManager();
  switch (currentScope.type) {
    case 'patient': return <EncounterCanvas />;
    case 'cohort': return <PopHealthCanvas />;
    case 'hub': return <HubCanvas />;
    case 'todo': return <TodoCanvas />;
  }
}
```

`EncounterCanvas` is what `CaptureView` currently renders in the canvas slot — extracted into a scope-specific component. The key change: CaptureView no longer owns AdaptiveLayout; it becomes the content that fills the layout's slots when `scope.type === 'patient'`.

### 0d. FloatingNavRow Generalization

**File:** `src/components/layout/FloatingNavRow.tsx` (MODIFY)

Add `workspaceContent` slot prop that replaces patient-identity-specific rendering when provided. When `workspaceContent` is absent, existing encounter behavior is unchanged. Zero regression risk.

```ts
// NEW prop — full left+center zone override
workspaceContent?: React.ReactNode;

// NEW prop — mode selector in right zone
canvasHeaderContent?: React.ReactNode;
```

Cohort scope provides `workspaceContent` with cohort label + collapsible identity. Patient scope continues using existing patient identity props.

### 0e. Return Affordance

When `canPop` is true (stack depth > 1), the canvas top bar shows a return affordance:

```
┌──────────────────────────────────────────────────────┐
│  ← Diabetes T2                    [canvas controls]  │
└──────────────────────────────────────────────────────┘
```

Tapping calls `popScope()`, which restores the previous scope from the stack (including preserved view state).

### 0f. Verification

- `npx tsc --noEmit` — 0 errors
- `npm run test:run` — all tests pass
- Encounter mode works identically (now rendered via scope router, but same components)
- Scope stack operations work (push/pop/replace)
- DemoLauncher still launches encounter scenarios correctly

**Estimated effort:** 4-5 hours (largest prerequisite — CaptureView extraction is the bulk)

---

## Phase 1: Types + Mock Data + React Flow Setup

**Goal:** Update existing types and mock data for the revised design spec. Add React Flow dependency.

### 1a. Update Population Health Types

**File:** `src/types/population-health.ts` (MODIFY existing)

Key changes from Rev 1:
- Add `NodeLifecycleState`: `'active' | 'paused' | 'draft' | 'needs-review' | 'test' | 'archived' | 'error'`
- Add `lifecycleState` field to `ProtocolNode` (rename to `PathwayNode` if clean; or keep internal name and use "pathway" in UI labels only — decide based on existing reference count)
- Add `NodeOwnership` type (future): `{ ownerId: string; ownerType: 'provider' | 'ai-agent' | 'integration' }`
- Add `CohortCategory` with `'overview'` option for category overview views
- Update filter categories to include `'lifecycle-state'`
- Ensure `columnIndex` and `verticalPosition` support React Flow's position format

### 1b. Update Mock Data

**File:** `src/data/mock-population-health.ts` (MODIFY existing)

- Add lifecycle state to existing mock nodes (most = `'active'`, add 1-2 `'paused'` and 1-2 `'draft'` nodes)
- Add category overview entries for each category group
- Verify 2-3 patients overlap with encounter mock data for drill-through
- Add "Recent Patients" mock data (last 5 patients seen)

### 1c. React Flow Dependency

```bash
npm install @xyflow/react
```

React Flow replaces the manual `FlowCanvas.tsx` + `ConnectionLines.tsx`. It provides node positioning, edge rendering, drag-and-drop, pan/zoom, and minimap.

### 1d. PopHealthContext Updates

**File:** `src/context/PopHealthContext.tsx` (MODIFY existing)

- Add lifecycle state filter actions
- Add `CATEGORY_OVERVIEW_SELECTED` action
- Verify context plays well with ScopeManager (PopHealthContext manages internal pop health state; ScopeManager manages cross-scope navigation)

### 1e. Verification

- `npx tsc --noEmit` — 0 errors
- `npm run test:run` — all tests pass
- React Flow imports resolve correctly

**Estimated effort:** 2-3 hours

---

## Phase 2: Menu Integration — "My Patients" Section

**Goal:** Integrate cohort navigation into the existing MenuPane as the "My Patients" section. Replace standalone CohortNavigator.

### 2a. MenuPane "My Patients" Section

**File:** `src/components/layout/MenuPane.tsx` (MODIFY)

Add "My Patients" section parallel to "To Do" and "Patient Workspaces":
- Uses existing `MenuNavItem` / `MenuSection` patterns
- Collapsible category groups (Chronic Disease, Preventive Care, Risk Tiers, Care Transitions)
- Category "Overview" child items
- Cohort items with inline patient counts
- "All Patients" and "Recent Patients" at top level
- Selection dispatches `navigateToScope({ type: 'cohort', cohortId })`

### 2b. Scenario-Aware Content

**File:** `src/navigation/DemoLauncher.tsx` (MODIFY)

Add "Dr. Chen's Panel" card for PC provider scenario. This scenario config flag controls whether MenuPane renders the full My Patients tree (PC) or just Recent Patients (UC).

### 2c. CohortNavigator Retirement

**File:** `src/components/population-health/CohortNavigator.tsx` — content absorbed into MenuPane. The file can be removed or kept as a sub-component if the tree logic is complex enough to warrant separation.

### 2d. Verification

- MenuPane shows "My Patients" section for PC scenario
- Selecting a cohort triggers scope change
- UC scenario shows only "Recent Patients"
- No regression in To Do or Patient Workspaces sections

**Estimated effort:** 2-3 hours

---

## Phase 3: Center Pane — Cohort Context

**Goal:** Update the center pane for cohort scope: identity parity, Overview/Activity tabs, branch-only layer tree.

### 3a. Cohort Identity Header

**File:** `src/components/population-health/CohortContextPane.tsx` (NEW or rename existing)

Renders the cohort identity in the same visual pattern as patient identity:
- Same typography for cohort name (= patient name)
- Same metadata row pattern for patient count + category + trend
- Same collapsible behavior via canvas top bar button
- Segmented control: `[Overview] [Activity]`

### 3b. Overview Tab — Dashboard + Layer Tree

**Dashboard module:** Update existing `Dashboard.tsx` to:
- Float critical alerts to Overview (not separate section)
- Add "View all alerts" expansion or link
- Scope metrics to selection (cohort → pathway → node)

**Layer tree:** Rewrite existing `LayerTree.tsx` for branch-only indentation:
- Sequential nodes at same indent level
- Only branches create visual hierarchy
- Uses existing `MenuNavItem` row height patterns (28px)
- Inline summary stats (patient count, gap count) right-aligned
- Selection syncs bidirectionally with canvas (wired in Phase 5)

### 3c. Activity Tab

**File:** `src/components/population-health/CohortActivityFeed.tsx` (NEW)

Temporal feed of cohort events:
- Patient additions/removals
- Stage transitions
- Batch actions
- Escalations
- Configuration changes

Filterable by event type. Can be placeholder content for v1 (static mock events) with the tab structure wired.

### 3d. Verification

- Cohort identity renders with same pattern as patient identity
- Overview/Activity tabs switch correctly
- Layer tree shows branch-only indentation
- Dashboard metrics scope to selection
- Alerts float critical items to overview

**Estimated effort:** 3-4 hours

---

## Phase 4: Flow View — React Flow Migration

**Goal:** Replace manual FlowCanvas + ConnectionLines with React Flow. Largest content phase.

### 4a. React Flow Canvas

**File:** `src/components/population-health/FlowCanvas.tsx` (REWRITE)

Replace manual absolute positioning + SVG overlay with React Flow:

```tsx
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';

// Convert pathway nodes → React Flow nodes
// Convert pathway connections → React Flow edges
// Column-snap via onNodeDragStop
```

Key features:
- Column-snap on drag release (`onNodeDragStop` snaps x to nearest column)
- Pan and zoom (React Flow built-in)
- Minimap for large pathways
- Custom node type registration for NodeCard

### 4b. NodeCard as React Flow Custom Node

**File:** `src/components/population-health/NodeCard.tsx` (MODIFY)

Wrap existing NodeCard as a React Flow custom node:
- Add always-visible chevron `>` for details drawer
- Add lifecycle state visual treatments (Active, Paused with cascade dimming, Draft with dashed border)
- Anchor points via React Flow handles (replace manual circles)
- Focus state: expanded title, visible anchors, connectors to top

### 4c. Canvas Top Bar Updates

**File:** `src/screens/PopHealthView/PopHealthCanvas.tsx` (MODIFY)

- Add search button (🔍) next to segmented control
- Add filter button (⚙) — opens filter controls in drawer
- Pathway label from center pane selection

### 4d. ConnectionLines Retirement

**File:** `src/components/population-health/ConnectionLines.tsx` — no longer needed. React Flow renders edges. Remove file.

### 4e. Multi-Pathway Rendering

When multiple pathways selected:
- Multiple React Flow node sets rendered in same canvas
- Separate vertical bands in column grid
- Unselected pathways dimmed via node opacity

### 4f. Verification

- Flow renders all 3 mock pathways via React Flow
- Node cards display correctly (icons, labels, pills, lifecycle badges)
- Edges render between nodes and follow during drag
- Column-snap works on node drag release
- Chevron `>` opens details drawer (wire in Phase 6)
- Lifecycle states visually differentiated (active, paused with cascade, draft)
- Pan/zoom works

**Estimated effort:** 4-5 hours (largest content phase)

---

## Phase 5: Cross-Pane Selection Sync + Filters

**Goal:** Wire bidirectional selection, implement column-tap stacking, wire filter/search UI.

### 5a. Center → Canvas Sync

- Pathway selected in layer tree → canvas highlights that flow (others dim)
- Node selected in layer tree → canvas highlights node + upstream/downstream stream
- Multi-select (shift-click) → canvas shows multiple pathways active

### 5b. Canvas → Center Sync

- Node tapped in canvas → corresponding layer selected in tree
- Dashboard metrics scope updates to match selection

### 5c. Column-Tap Stacking

- Tap column background → nodes stack compactly
- Parent nodes slide to maintain alignment
- React Flow edges animate to new positions
- Tap same column to release; tap different column to transfer

### 5d. Filter + Search UI

- Filter button opens right-side drawer panel with filter controls
- Filter categories: Status, Lifecycle state, Patient attributes, Pathway-specific
- Active filters as dismissible chips below top bar
- Search button expands inline search in top bar
- Filters apply to both Flow View (dim) and Table View (hide)

### 5e. Verification

- Bidirectional selection sync works
- Column-tap stacking animates smoothly
- Filters apply correctly to Flow View
- Search highlights matching nodes

**Estimated effort:** 3-4 hours

---

## Phase 6: Detail Drawer + Drill-Through

**Goal:** Wire detail drawer views, implement scope-based drill-through.

### 6a. Node Detail View

**File:** `src/components/population-health/NodeDetailView.tsx` (EXISTS — minor updates)

- Verify it works within SlideDrawer
- Add lifecycle state display
- Configuration section: read-only for v1

### 6b. Patient Preview View

**File:** `src/components/population-health/PatientPreviewView.tsx` (EXISTS — one surgical change)

Change drill-through call:
```ts
// Before:
navigateToEncounter(encounterId, 'capture')

// After:
navigateToScope({ type: 'patient', patientId, encounterId }, { mode: 'push' })
```

### 6c. Drawer Wiring

Wire chevron `>` tap on NodeCard → opens SlideDrawer with NodeDetailView. Wire patient tap → pushes PatientPreviewView onto drawer stack.

### 6d. Drill-Through Verification

- Chevron tap → drawer opens with node detail
- Patient tap in drawer → patient preview (back button works)
- "Open Patient Workspace" → scope push to encounter
- Return affordance (← Cohort Name) → scope pop back to cohort with state restored
- 2-3 patients with matching encounter data render full charts

**Estimated effort:** 2-3 hours

---

## Phase 7: Table View + Polish

**Goal:** Wire Table View, AI bar, polish interactions.

### 7a. Table View

**File:** `src/components/population-health/TableView.tsx` (EXISTS — verify/update)

- Verify column configurability (base + pathway-specific columns)
- Wire row tap → patient preview in drawer
- Wire shared filter bar applies to table rows
- Terminology updates (pathway vs. protocol in labels)

### 7b. Cross-View Sync

- Patient selected in Table → path highlights in Flow on switch
- Node selected in Flow → Table filtered to that stage on switch
- Selection persists across view switches via PopHealthContext

### 7c. AI Bar Wiring

- 2-3 canned queries per cohort with static responses
- AI scope: `{ type: 'cohort', label: cohortName, id: cohortId }`
- Context resets on cohort switch
- CoordinationProvider wraps cohort scope with `txEligible: false`

### 7d. Polish

- Animation smoothing: drawer slide, view facet transition, column-tap stacking
- Empty states: no patients matching filter, no pathway selected, category overview placeholders
- Visual consistency audit: all components use design tokens, no hardcoded colors
- Lifecycle state filter: archived nodes hidden by default, visible when filter active
- Keyboard shortcuts: `1`/`2` for Flow/Table, `Escape` to dismiss drawer, pane toggles

### 7e. Full Journey Verification

Complete user journey test:
1. Demo launcher → "Dr. Chen's Panel" → cohort scope
2. Menu: My Patients → Chronic Disease → Diabetes
3. Center pane: cohort identity, overview metrics, layer tree with branch-only indentation
4. Flow View: React Flow canvas, node cards, edges, pan/zoom
5. Tap node body → focus (expanded title, anchors visible)
6. Tap chevron → detail drawer (node config, patient list, metrics)
7. Tap patient in drawer → patient preview
8. "Open Patient Workspace" → scope push to encounter
9. Return affordance → scope pop back to cohort (state restored)
10. Switch to Table View → patient grid, pathway-specific columns
11. Switch to Activity tab → cohort event feed
12. Apply filter → both views update
13. Column-tap stacking → smooth animation

**Estimated effort:** 3-4 hours

---

## Phase Summary

| Phase | Focus | Key Change | Effort | Dependencies |
|-------|-------|-----------|--------|-------------|
| 0 | AppShell scope infrastructure | CaptureView extraction, ScopeManager, scope routers | 4-5 hrs | None |
| 1 | Types + data + React Flow setup | Lifecycle states, terminology, React Flow dependency | 2-3 hrs | Phase 0 |
| 2 | Menu integration | "My Patients" section in MenuPane, scenario-aware | 2-3 hrs | Phase 0 |
| 3 | Center pane | Identity parity, Overview/Activity, branch-only tree | 3-4 hrs | Phase 1 |
| 4 | Flow View (React Flow) | Replace FlowCanvas + ConnectionLines with React Flow | 4-5 hrs | Phase 1 |
| 5 | Cross-pane sync + filters | Bidirectional selection, stacking, filter/search UI | 3-4 hrs | Phases 3, 4 |
| 6 | Detail drawer + drill-through | Scope push/pop, return affordance, existing drawer views | 2-3 hrs | Phase 4 |
| 7 | Table View + polish | Wire existing table, AI bar, full journey polish | 3-4 hrs | Phases 5, 6 |
| **Total** | | | **~24-31 hrs** | |

### Dependency Graph

```
Phase 0 (AppShell extraction) ─┬── Phase 1 (types + data + React Flow)
                               │     ├── Phase 3 (center pane) ──┐
                               │     └── Phase 4 (flow view) ────┤
                               │                                 └── Phase 5 (sync) ── Phase 6 (drawer) ── Phase 7 (polish)
                               └── Phase 2 (menu integration)
```

Phase 0 is the prerequisite for everything. After Phase 0, Phases 1 and 2 can proceed in parallel (no interdependencies). Phases 3 and 4 can proceed in parallel after Phase 1. Phase 5 requires both 3 and 4. Phase 6 requires 4 (and benefits from 5). Phase 7 requires 5 and 6.

### What's New vs. What's Reused

| Category | Files | Notes |
|----------|-------|-------|
| **New (scope infrastructure)** | ~5 files | Scope types, ScopeManager, scope routers, return affordance |
| **Rewritten** | 2 files | FlowCanvas (→ React Flow), LayerTree (branch-only indentation) |
| **Modified** | ~6 files | MenuPane, FloatingNavRow, types, mock data, PopHealthContext, PopHealthCanvas |
| **Retired** | 2 files | ConnectionLines (→ React Flow), CohortNavigator (→ MenuPane section) |
| **As-is** | ~9 files | Dashboard, TableView, FilterBar, NodeDetailView, PatientPreviewView, SlideDrawer, NodeCard, InlineActionBar, mock data structure |

---

## Revision History

| Rev | Date | Changes | Author |
|-----|------|---------|--------|
| 2 | 2026-03-03 | Complete rewrite for AppShell scope architecture. Added Phase 0 (extraction). Updated all phases for: React Flow, menu integration, terminology, lifecycle states, branch-only tree, interaction model, category overviews, activity tab. | Claude + William |
| 1 | 2026-03-02 | Initial phased plan (from-scratch build, separate-screen architecture) | Claude + William |
