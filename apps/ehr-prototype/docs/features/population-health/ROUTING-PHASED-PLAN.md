# Routing View — Phased Build Plan

**Status:** Draft — pending review
**Target:** Build into existing EHR prototype (React), extends population health workspace All-Patients scope
**Executor:** Claude Code (each phase is a self-contained prompt)
**Reference:** `routing-view/DESIGN-SPEC.md`, `all-patients-view/DESIGN-SPEC.md`, `population-health/DESIGN-SPEC.md`
**Prerequisite:** All-Patients Phase A1 (data model extensions + Sankey spike) must be complete. Phase A2 (canvas view switcher) must exist with the three-tab structure (Map | Routing | Table).

---

## Build Strategy

Two phases, tightly sequenced. The Routing view is a canvas view within the All-Patients scope — it shares the `DimensionSelection` context, the view switcher infrastructure, and the patient data model established in the All-Patients Phases A1-A3. The Routing view adds a new canvas content component and a navigation/context-transfer mechanism.

**Key architectural decisions for Claude Code:**
- The Routing view is a React component rendered inside the existing canvas pane when "Routing" is selected in the view switcher. It replaces the Pipeline placeholder created in All-Patients Phase A2.
- All data comes from the same extended mock patient records used by the Sankey. The `RoutingData` structure is derived at render time from patient records + care flow definitions + current `DimensionSelection`.
- The Routing view does NOT have its own selection state. It consumes `DimensionSelection` from the shared context and dispatches to it (card body click adds a cohort to the selection). This is the same pattern as the Sankey.
- Navigation from the Routing view (clicking "›" or a node name) triggers a scope change in the left pane navigator — the same mechanism used for any cohort navigation. Context transfer (pre-applied filters, focused node) is passed via the navigation action payload.

---

## Phase R1: Routing View Core + Card Layout

**Goal:** Build the Routing view canvas content, including cohort subgroup cards with attention summaries and node concentration, responsive to DimensionSelection state.

**Deliverables:**

1. **RoutingData computation** — Utility function:
   - Takes patient records + care flow definitions + current DimensionSelection
   - Groups patients by cohort (condition and preventive assignments) within each category
   - Computes per-cohort: total patients, filtered patients (matching selection), attention summary (urgent/action-needed counts, avg days waiting, risk breakdown), node concentration (which care flow nodes patients are at)
   - Builds the UnenrolledGroup for patients not in any care flow
   - Returns `RoutingData` structure (see DESIGN-SPEC §7)
   - Memoized on DimensionSelection key — same pattern as Sankey data computation

2. **RoutingView component:**
   - Receives RoutingData from shared context/computation
   - Renders category groups (Chronic Disease, Preventive Care, Care Transitions) with headers
   - Within each category, renders RoutingCohortCard components sorted by attention priority (highest urgent + action-needed count first)
   - Renders the "Not In Any Care Flow" section at the bottom
   - Handles empty states: no matching patients for a category (hide category header + cards), no matching patients at all (centered empty state message)

3. **RoutingCohortCard component:**
   - Card header: cohort name + patient count ("X patients" or "X of Y pts" when filtered) + "›" navigation affordance
   - Attention summary: urgent count, action-needed count, avg days waiting, risk breakdown (when relevant)
   - Node concentration section: top 3-4 care flow nodes where patients are concentrated, with counts. "+ N more nodes" expand affordance if more exist. Each node name rendered as a clickable link (navigation wired in Phase R2).
   - Card body click: dispatches to DimensionSelection (adds/toggles this cohort as a condition/preventive selection). Same selection behavior as clicking a Sankey band.
   - Hover: subtle card highlight, no state change

4. **UnenrolledCard component:**
   - Special card for patients not in any care flow
   - Shows: total unenrolled count (filtered/total when selection active), risk breakdown (with highlight for high/critical), condition breakdown (what conditions unenrolled patients have)
   - No node concentration (no care flow nodes to show)
   - "›" affordance navigates to Table view filtered to unenrolled patients (wired in Phase R2)

5. **Responsive to DimensionSelection:**
   - RoutingData recomputes when DimensionSelection changes
   - Cards with zero matching patients hide
   - Category headers hide when no cohorts match within that category
   - Cards re-sort by attention priority within the filtered set
   - "X of Y pts" format appears when selection is active

6. **View switcher integration:**
   - Replace the Pipeline placeholder (from All-Patients Phase A2) with the RoutingView component
   - View switcher tab label: "Routing" (with appropriate icon)
   - Filter chips in canvas top bar apply to Routing view identically to Map view

**Implementation notes:**
- The RoutingData computation needs access to CareFlow definitions (node names, structure) — these come from the existing care flow mock data. For each patient in a cohort, look up their current care flow node from the CareFlowPatient record (or equivalent).
- Card ordering: sort by `urgentCount + actionNeededCount` descending, then by `filteredPatients` descending as tiebreaker.
- The "Other" bucket logic for conditions/preventive in the Sankey doesn't apply here — the Routing view shows one card per cohort, regardless of ranking. Low-prevalence cohorts get their own cards (they're more useful here than as "Other" since the physician might route to them).
- Node concentration: for patients in cohorts with multiple care flows, show nodes from ALL care flows the cohort uses. Group by care flow if needed (e.g., "Diabetes A1c: A1c Due (3), Endo Referral (2) · Diabetes Foot Care: Annual Exam (1)").

**Estimated effort:** 3-4 hours

---

## Phase R2: Navigation, Context Transfer, and Polish

**Goal:** Wire up all navigation paths from the Routing view, implement context transfer to cohort scope, and polish the integrated experience.

**Deliverables:**

1. **"›" card navigation:**
   - Clicking "›" on a cohort card triggers navigation to that cohort's scope
   - Left pane selection updates to the target cohort
   - Current action status filter (if any) carries as a pre-applied filter in the cohort-level shared filter bar
   - Current risk tier filter (if any) optionally carries as a cohort-level filter
   - Canvas transitions to the cohort's Flow View (default view at cohort scope)
   - Center pane transitions to the cohort's dashboard + layer tree

2. **Node name deep-link navigation:**
   - Clicking a node name (e.g., "Endo Referral (3)") navigates to the cohort scope with specific node focus
   - Same scope transition as "›" plus: the care flow layer tree auto-expands to the relevant care flow, the canvas flow view focuses/highlights the specific node
   - The active dimension filter (action status, risk tier) carries as a pre-applied filter

3. **Unenrolled "›" navigation:**
   - Navigates to All-Patients Table view (switches view tab to Table) with a "Not Enrolled" filter pre-applied
   - Does NOT navigate to a cohort scope (no cohort to go to)

4. **Return path / state persistence:**
   - When navigating from Routing view to a cohort scope, a floating anchor or breadcrumb appears: "← Back to All Patients"
   - Clicking the anchor returns to All-Patients scope with:
     - Routing view active (not Map)
     - Previous DimensionSelection restored
     - Previous AxisVisibility restored
     - Scroll position restored
   - This reuses the floating anchor pattern from main Phase 6 (patient workspace navigation) if available, or establishes the pattern for reuse

5. **All-Patients state persistence:**
   - The DimensionSelection, AxisVisibility, active view tab, and Routing scroll position persist when navigating away from All-Patients scope
   - State lives at a level above the scope-switching logic (e.g., population health mode context, not within the All-Patients component tree)
   - Returning to All-Patients (via left pane or floating anchor) restores the full state

6. **Integration polish:**
   - Verify bidirectional sync: center pane dimension selection ↔ Routing card highlighting ↔ Map Sankey highlighting ↔ filter chips. All four surfaces should be in sync.
   - Verify view switching: Map → Routing → Table with same DimensionSelection shows consistent data. Filter chips persist across switches.
   - Verify scope transitions: Routing "›" click → cohort scope (correct cohort selected, filter applied) → "← Back" → All-Patients Routing view (state restored)
   - Verify node deep links: node name click → cohort scope (correct cohort, correct flow, correct node focused, filter applied)
   - Empty states: no cohorts match current selection (Routing shows "No cohorts match the current selection" message), single cohort matches (renders normally, just one card)
   - Performance: RoutingData recomputation should feel immediate on selection change

**Implementation notes:**
- Navigation action payload should include: `{ targetCohortId, filters: { actionStatuses?, riskTiers? }, focusNodeId?, returnState: { view: 'routing', dimensionSelection, axisVisibility, scrollPosition } }`
- The floating anchor component should be shared across navigation contexts. If the main Phase 6 anchor exists, extend it. If not, create a reusable component that Phase 6 can later use.
- State persistence: store All-Patients state in a ref or context that persists across scope changes. The simplest approach: a `useRef` in the population health mode component that captures state before navigation and restores on return.
- For the demo, context transfer to cohort scope requires: the cohort-level filter bar accepts pre-applied filters from navigation, and the flow view accepts a `focusNodeId` prop to highlight a specific node on mount.

**Estimated effort:** 3-4 hours

---

## Phase Summary

| Phase | Focus | Key Deliverable | Effort | Dependencies |
|-------|-------|----------------|--------|-------------|
| R1 | Routing view core | RoutingData computation, cohort cards, dimension selection response | 3-4 hrs | All-Patients A1 (data model), A2 (view switcher) |
| R2 | Navigation + polish | Context transfer, deep links, floating anchor, state persistence, integration testing | 3-4 hrs | Phase R1, ideally All-Patients A3 (shared state), Main Phase 2 (left pane) |
| **Total** | | | **~6-8 hrs** | |

Phase R1 can begin as soon as All-Patients Phase A1 is complete and Phase A2 has the view switcher shell in place (even with placeholder Routing tab). Phase R2 requires the left pane navigator (Main Phase 2) and the shared state management (All-Patients Phase A3) for full navigation wiring.

```
All-Patients A1 (data model) ── A2 (Sankey + view switcher) ──── Phase R1 (Routing core)
                                └── A3 (center pane + state) ────── Phase R2 (navigation + polish)
```

### Relationship to other build plans

```
Main Phase 1 ──┬── Main Phase 2 (left pane) ──────────────────────────────────
                ├── All-Patients A1 ──┬── A2 (Sankey canvas) ──── R1 (Routing core)
                │                     └── A3 (center pane) ─────── R2 (navigation + polish)
                │                                                    └── A4 (integration polish)
                ├── Main Phase 3 (cohort center pane) ──────────────
                └── Main Phase 4 (cohort flow view) ────────────────
```

The Routing phases (R1, R2) slot between the All-Patients canvas work (A2) and the All-Patients integration polish (A4). Phase R2's navigation wiring benefits from having cohort-level views partially built (Main Phases 3-4) so navigation targets exist, but can be built with stub targets if those phases aren't complete.
