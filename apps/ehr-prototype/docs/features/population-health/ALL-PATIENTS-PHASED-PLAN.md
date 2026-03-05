# All-Patients View — Phased Build Plan

**Status:** Draft — pending review
**Target:** Build into existing EHR prototype (React), extends population health workspace
**Executor:** Claude Code (each phase is a self-contained prompt)
**Reference:** all-patients-view/DESIGN-SPEC.md, population-health/DESIGN-SPEC.md
**Prerequisite:** Population health Phase 1 (data model + mode switching) must be complete

---

## Build Strategy

Four phases, ordered by dependency. This build plan extends the population health workspace — it assumes Phase 1 of the main PHASED-PLAN (data model + mode switching) is complete and the left pane cohort navigator (Phase 2) exists with an "All Patients" entry point.

These phases can run in parallel with or after the main population health Phases 3-7 (cohort-level views). The All-Patients view and cohort-level views share the data model but have independent UI components.

**Key architectural decisions for Claude Code:**
- The All-Patients view reuses the three-pane layout. Center and right pane content swap when "All Patients" is selected in the left pane (distinct from cohort-level content).
- All data is computed from the extended mock patient records. The Sankey data structure is derived at render time from patient condition assignments, risk tiers, and action statuses.
- The center pane dimension list manages selection state via shared React context. Both the center pane stats module and the canvas Sankey consume this state.
- ECharts is the primary rendering approach for the Sankey. If ECharts' Sankey doesn't support the required customization (two-zone left axis, per-band styling, dynamic axis removal), switch to custom SVG. Spike this in Phase A1 before committing.

---

## Phase A1: Data Model Extensions + Sankey Spike

**Goal:** Extend the population health data model with risk tiers, action statuses, and condition/preventive assignments. Validate the Sankey rendering approach.

**Deliverables:**

1. **Extended type definitions** — Add to existing `src/types/population-health.ts`:
   - `RiskTier` enum: critical, high, moderate, low, unassessed
   - `ActionStatus` enum: urgent, action-needed, monitoring, all-current, not-enrolled
   - `ConditionAssignment`: patientId, conditionCohortId, diagnosisDate
   - `PreventiveAssignment`: patientId, preventiveCohortId, eligibilityBasis, lastScreeningDate, nextDueDate
   - Extend `PopHealthPatient` (or equivalent) with riskTier, riskScore, actionStatus, conditionAssignments, preventiveAssignments
   - `SankeyData`, `SankeyBand`, `SankeyFlow`, `SankeyAxisGroup` types
   - `DimensionSelection` and `AxisVisibility` state types

2. **Extended mock data** — Enrich existing mock patients:
   - Assign risk tiers (realistic distribution: ~5% critical, ~15% high, ~40% moderate, ~35% low, ~5% unassessed)
   - Assign action statuses (distribution: ~5% urgent, ~15% action-needed, ~30% monitoring, ~40% all-current, ~10% not-enrolled)
   - Create condition cohort definitions and assignments (patients can have 0-4 conditions, avg ~1.6)
   - Create preventive cohort definitions and assignments
   - Ensure cross-axis distributions are realistic (e.g., some high-risk patients are "all current," some low-risk are "action needed")

3. **Sankey data computation** — Utility function:
   - Takes patient records + condition/preventive assignments
   - Computes SankeyData: axis bands with counts, flow links between bands with patient counts and IDs
   - Handles the deduplication: left axis over-counts (multi-condition), center/right do not
   - Supports filtering: given a DimensionSelection, recomputes SankeyData for the filtered subset

4. **Rendering spike** — Validate ECharts Sankey:
   - Install `echarts` and `echarts-for-react`
   - Build a minimal three-level Sankey with mock data
   - Test: hover emphasis, click event callbacks, dynamic data update (re-render on filter)
   - Test: can the left axis be split into two visual zones? Can individual bands have custom styling (attention highlight)?
   - **Decision gate:** If ECharts handles the requirements, proceed with ECharts. If not, plan Phase A2 with custom SVG approach. Document the decision.

**Implementation notes:**
- The mock data extensions should be consistent with existing patient records from the main population health mock data. Patients who exist in care flows should have condition assignments matching those flows (e.g., patients in the Diabetes A1c care flow should have a Diabetes condition assignment).
- The Sankey data computation function is the core data layer — everything else renders from its output. Invest in getting this right. Unit test the computation if the project has a test framework.
- For the spike, a standalone page/route is fine. It will be integrated into the three-pane layout in Phase A2.

**Estimated effort:** 3-4 hours

---

## Phase A2: Canvas — Sankey Map View

**Goal:** Build the Sankey visualization in the canvas pane, rendered when "All Patients" is selected and Map view is active.

**Deliverables:**

1. **Canvas top bar for All-Patients scope:**
   - Segmented control: Map | Pipeline | Table
   - Map view active by default
   - Pipeline and Table tabs switch to placeholder views (see DESIGN-SPEC §3.2)
   - Filter chip area (receives active filters from center pane dimension selections)

2. **Sankey visualization component:**
   - Renders the three-axis Sankey from SankeyData
   - Left axis: two visual zones (conditions top, preventive bottom) with subtle divider
   - Center axis: risk tiers, ordered by severity
   - Right axis: action statuses, ordered by urgency
   - Flow bands between axes with semi-transparent fill
   - Band labels with patient counts positioned outside the Sankey body
   - Panel summary annotations (enrollment count on left, panel size at center)

3. **Default visual state:**
   - All axes visible, all bands rendered
   - Attention pre-highlight: Urgent and Action Needed bands on right axis have warm accent treatment
   - Flow bands connecting to Urgent/Action Needed are slightly more prominent

4. **Hover interaction:**
   - Hovering a Sankey band temporarily highlights connected flows, dims others
   - Tooltip shows band label + count + brief stats
   - Hover state clears on mouse exit (no persistent change)

5. **Click interaction on Sankey:**
   - Clicking a band on the Sankey dispatches to the shared DimensionSelection state (same as clicking in center pane)
   - This triggers: Sankey highlight/dim, stats module update, filter chip appearance
   - Click empty area to clear selection

6. **Placeholder views:**
   - Pipeline placeholder: icon + title + description explaining future content
   - Table placeholder: icon + title + description explaining future content
   - Both rendered within the canvas pane container with centered layout

**Implementation notes:**
- If ECharts was validated in Phase A1 spike, build the Sankey as an ECharts component wrapped in a React container. Map SankeyData to ECharts option format. Wire click/hover events to React state updates.
- If custom SVG was chosen, build as a React component rendering SVG elements. Use a layout computation module that calculates: band y-positions (proportional to count within each axis), band heights, flow path curves (cubic bezier from source band edge to target band edge). Handle the two-zone divider as a horizontal line element positioned between condition and preventive zones.
- The attention pre-highlight: for ECharts, use `itemStyle` overrides on Urgent/Action Needed nodes. For custom SVG, apply a CSS class with warm fill color.
- Ensure the Sankey is responsive to container width. If the canvas pane resizes (e.g., center pane collapses), the Sankey should reflow.

**Estimated effort:** 4-5 hours

---

## Phase A3: Center Pane — Dynamic Stats + Dimension List

**Goal:** Build the center pane content for All-Patients scope: dynamic stats module and dimension list with selection and visibility controls.

**Deliverables:**

1. **Center pane scope detection:**
   - When "All Patients" is selected in left pane, center pane renders All-Patients content (instead of cohort dashboard + layer tree)
   - Smooth transition between scopes

2. **Dynamic stats module:**
   - Default state: panel-level metrics (total patients, needs attention count, not enrolled count, enrollment rate, trend indicator)
   - Filtered state: recalculates all metrics for the selected subpopulation
   - Header shows selection context label (e.g., "Diabetes · High Risk") when filtered; "Panel Overview" when unfiltered
   - "View Details" button (opens investigation modal — wired in Phase A4)
   - Contextual action links when selection is specific enough (e.g., "Open Diabetes ›" when a single condition is selected)
   - Small population behavior: when filtered to < ~15 patients, show inline patient name list instead of purely aggregate metrics

3. **Dimension list:**
   - Four sections: Conditions, Preventive, Risk Level, Action Status
   - Each section header: label + patient count + eye icon (axis visibility) + chevron (accordion)
   - Eye icon toggles axis visibility in Sankey (dispatches to AxisVisibility state)
   - Chevron toggles list item visibility in center pane (UI-only, independent of eye icon)
   - Dimension items: clickable rows with label + count
   - Click to select/deselect (toggles in DimensionSelection state)
   - Shift-click for multi-select
   - Selected items have visual active state (background tint or left accent)
   - Conditions and Preventive sections: show top N items + expandable "Other (X)" bucket
   - "Other" expansion reveals remaining items, which are individually selectable

4. **Shared state management:**
   - DimensionSelection context: consumed by both center pane and canvas
   - AxisVisibility context: consumed by canvas Sankey for axis show/hide
   - Selection changes in center pane immediately update Sankey (highlight/dim) and stats module (recalculate)
   - Selection changes from Sankey clicks (Phase A2) immediately update center pane active states

5. **Filter chips in canvas top bar:**
   - Active dimension selections render as dismissible chips in the canvas filter area
   - Dismissing a chip deselects the corresponding dimension
   - Chips are the same component used in cohort-level filter bar (reuse existing pattern)

**Implementation notes:**
- The shared state (DimensionSelection, AxisVisibility) should use React context or the same state management pattern as the cohort-level selection state. Consistency matters — if the existing prototype uses a specific state lib (zustand, jotai, context), match it.
- Stats computation: a memoized function that takes the patient records + current DimensionSelection and returns the stats object. Should be fast enough for immediate feedback on selection changes (~72 patients in demo, trivial; at scale, memoize with selection key).
- The dimension list is the most complex center pane component. Build it as a generic `DimensionSection` component that receives: section label, items array, visibility state, selection state, and callbacks. Render four instances.
- The "Other" bucket: compute at render time from patient data — items below rank N in count become "Other." When expanded, render them as normal selectable items.

**Estimated effort:** 3-4 hours

---

## Phase A4: Investigation Modal + Integration Polish

**Goal:** Build the investigation modal, wire up all cross-component interactions, and polish the integrated experience.

**Deliverables:**

1. **Investigation modal:**
   - Triggered by "View Details" in stats module
   - Header: selection context label + patient count
   - Patient list table: name, age/sex, risk tier, conditions, current care flow stage, days in state, action needed. Sortable columns.
   - Distribution breakdown: for each unselected axis, show how selected patients distribute (compact horizontal bars)
   - Key metrics: avg time in current state, trend indicator
   - Drill-down affordances: per-patient "Open [Name]" link, per-cohort "Open [Cohort] ›" link
   - Close: X button, click-outside, Escape key
   - Modal content updates live if center pane selection changes while modal is open

2. **Navigation from drill-down links:**
   - "Open [Cohort] ›" sets left pane selection to that cohort, closing modal and transitioning to cohort-level center pane + canvas
   - "Open [Patient]" triggers the patient workspace navigation (mode switch to encounter mode with floating anchor back) — reuses Phase 6 mechanism from main build plan
   - Both are explicit navigation — center pane and canvas fully transition to the target scope

3. **Integration polish:**
   - Verify bidirectional sync: center pane selection ↔ Sankey highlight ↔ filter chips ↔ stats module. All four should be in sync at all times.
   - Verify axis visibility: toggling eye icon removes/adds axis from Sankey, Sankey re-renders smoothly
   - Verify scope transitions: selecting a cohort in left pane (after being in All Patients) transitions center pane from dimension list to layer tree, canvas from Sankey to flow view. Returning to All Patients restores previous state.
   - Verify placeholder views: Pipeline and Table tabs render placeholders correctly, filter chips persist across view switches
   - Empty states: no patients matching current selection (Sankey shows empty state message), all axes hidden (Sankey shows guidance to enable an axis)
   - Performance: stats computation and Sankey re-render should feel immediate on selection change

4. **State persistence on scope change:**
   - When physician navigates from All Patients to a cohort and back, the previous DimensionSelection and AxisVisibility should be restored
   - Store All-Patients view state in a persistent context that survives scope changes

**Implementation notes:**
- The modal should be rendered via React portal to avoid z-index issues with the three-pane layout.
- Patient list in the modal can reuse table components from the cohort-level Table View (Phase 7 of main plan) if available, or be a simpler custom table.
- State persistence: the DimensionSelection and AxisVisibility state should live at a level above the scope-switching logic (e.g., in the population health mode context, not within the All-Patients component tree).

**Estimated effort:** 3-4 hours

---

## Phase Summary

| Phase | Focus | Key Deliverable | Effort | Dependencies |
|-------|-------|----------------|--------|-------------|
| A1 | Data model + Sankey spike | Extended types, enriched mock data, rendering validation | 3-4 hrs | Main Phase 1 |
| A2 | Canvas — Sankey Map View | Three-axis Sankey with interactions + placeholder views | 4-5 hrs | Phase A1 |
| A3 | Center Pane — Stats + Dimensions | Dynamic stats, dimension list, shared state, filter chips | 3-4 hrs | Phase A1 |
| A4 | Modal + Integration Polish | Investigation modal, drill-down navigation, full sync verification | 3-4 hrs | Phases A2, A3 |
| **Total** | | | **~13-17 hrs** | |

Phases A2 and A3 can be built in parallel after A1 (they share state interfaces but have independent UI components). Phase A4 requires both A2 and A3.

```
Main Phase 1 (data model) ── Phase A1 (extensions + spike) ──┬── Phase A2 (Sankey canvas)
                                                               └── Phase A3 (center pane)
                                                                    └── Phase A4 (modal + polish)
```

### Relationship to main build plan

This All-Patients build can interleave with the main population health build:

```
Main Phase 1 ──┬── Main Phase 2 (left pane) ──────────────────────────────────────
                ├── Main Phase 3 (center pane, cohort level) ──┐
                ├── Main Phase 4 (canvas, flow view) ──────────┤
                ├── Phase A1 (all-patients data + spike) ──┐   └── Main Phase 5+ ...
                │                                          ├── Phase A2 (Sankey)
                │                                          └── Phase A3 (center pane, all-patients)
                │                                               └── Phase A4 (modal + polish)
```

Phase A1 can start as soon as Main Phase 1 is complete. Phases A2 and A3 can run in parallel with Main Phases 3 and 4. Phase A4 can run whenever A2 and A3 are done. No blocking dependency between the All-Patients stream and the cohort-level stream after Phase 1.
