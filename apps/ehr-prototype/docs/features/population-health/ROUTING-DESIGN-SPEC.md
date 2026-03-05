# Routing View — Design Specification

**Status:** Draft — pending review
**Scope:** Defines the Routing canvas view at All-Patients scope — the second of three canvas views (Map | Routing | Table)
**Related docs:** `all-patients-view/DESIGN-SPEC.md` (Map view, center pane, shared state), `population-health/DESIGN-SPEC.md` (cohort-level views)
**Context:** The Routing view replaces the previously planned Pipeline and Investigation Modal. It is the operational bridge between the Map view (population-level comprehension) and the Table view (patient-level data). Its job: decompose the current dimension selection into actionable subgroups with care flow node-level detail and navigation paths to cohort scope.

---

## 1. Role in the View Architecture

Three canvas views at All-Patients scope, each at a different resolution:

| View | Resolution | Question it answers | Physician mode |
|------|-----------|--------------------|-----------------------|
| **Map** | Population | "Where is everyone? How do conditions, risk, and action relate?" | Comprehending |
| **Routing** | Subgroup | "Where should I go to act? Which cohorts and nodes need attention?" | Deciding |
| **Table** | Patient | "Who specifically? What are the details for each patient?" | Inspecting |

The physician zooms in progressively: Map → Routing → Table. All three views consume the same shared `DimensionSelection` state from the center pane dimension list. Selecting dimensions filters all three views identically.

The Routing view's unique contribution: it shows **cohort × care flow node** detail that neither the Map (too high-level — stops at condition/risk/action axes) nor the Table (too low-level — individual patient rows) provides. It answers: "Of these 23 urgent patients, how many are in each cohort, at which specific care flow nodes, and how do I get to those nodes to act?"

---

## 2. Design Principles

1. **Route, don't analyze.** The Routing view is a decision surface, not an analytical tool. The physician uses it to decide which cohort scope to enter, not to study population distributions. Keep content action-oriented.

2. **Every card is a doorway.** Each cohort subgroup card leads somewhere — to a specific cohort scope, pre-filtered and pre-focused. The view is an index of entry points, not a destination.

3. **Node-level detail is the unique value.** The Sankey shows conditions → risk → action. The Routing view adds the next level: which specific care flow nodes are patients concentrated at. This bridges the population view to the workflow view.

4. **Shared state, different lens.** The center pane dimension list is the universal filter control. The Routing view is one of three visualizations of the filtered result. No separate filter state, no separate selection mechanism.

---

## 3. Layout

### 3.1 Default state (nothing selected)

When no dimensions are selected, the Routing view shows the **full cohort index** — every cohort with headline metrics, node distribution, and navigation affordances. This is the "morning briefing" state: here's your full panel organized by cohort, here's the headline for each.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◉ Map  │  ◈ Routing  │  ▦ Table                      [≡] Q        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CHRONIC DISEASE                                                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Diabetes A1c Management                    142 patients   ›  │  │
│  │  ⚠ 8 urgent · 26 action needed · avg 11d waiting             │  │
│  │                                                                │  │
│  │  Node concentration:                                          │  │
│  │  A1c Due (34) · Endo Referral (8) · Adjust Med (19)          │  │
│  │  Await Results (12) · Quarterly Review (69)                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Hypertension Management                     89 patients   ›  │  │
│  │  ⚠ 3 urgent · 12 action needed · avg 8d waiting              │  │
│  │  ...                                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  PREVENTIVE CARE                                                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Colon Cancer Screening                   1,204 patients   ›  │  │
│  │  ⚠ 4 urgent · 41 action needed · avg 14d waiting             │  │
│  │  ...                                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  CARE TRANSITIONS                                                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Post-Discharge Follow-up                     67 patients  ›  │  │
│  │  ...                                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  NOT IN ANY CARE FLOW                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  35 patients not enrolled                                  ›  │  │
│  │  ⚠ 12 high/critical risk                                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Cards are grouped by category (Chronic Disease, Preventive Care, Care Transitions) matching the left pane navigator structure. Within each category, cards are ordered by attention priority (highest urgent + action-needed count first).

A special "Not In Any Care Flow" section at the bottom surfaces unenrolled patients, with risk-based highlighting for at-risk unenrolled patients.

### 3.2 Filtered state (dimensions selected)

When dimensions are selected in the center pane, the Routing view filters and recalculates:

- Cards for cohorts with zero matching patients are hidden
- Patient counts, node distributions, and attention metrics recalculate for the filtered subpopulation
- Category headers hide if no cohorts within that category match
- Card ordering re-sorts by attention priority within the filtered set

**Example: "Urgent" selected in Action Status**

```
┌──────────────────────────────────────────────────────────────────────┐
│  CHRONIC DISEASE                                                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Diabetes A1c Management                   8 of 142 pts   ›  │  │
│  │  All urgent · avg 14d waiting · 6 high risk                   │  │
│  │                                                                │  │
│  │  Node concentration:                                          │  │
│  │  Endo Referral (3) · A1c Due (3) · Outreach (2)              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  CARE TRANSITIONS                                                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Post-Discharge Follow-up                   7 of 67 pts   ›  │  │
│  │  All urgent · avg 6d waiting · 5 high risk                    │  │
│  │                                                                │  │
│  │  Node concentration:                                          │  │
│  │  48hr Callback (4) · PCP Follow-up (3)                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  PREVENTIVE CARE                                                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Colon Cancer Screening                    4 of 1,204 pts ›  │  │
│  │  All urgent · avg 21d waiting · 2 high risk                   │  │
│  │                                                                │  │
│  │  Node concentration:                                          │  │
│  │  Outreach Call (4)                                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  NOT IN ANY CARE FLOW                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  4 patients urgent, not enrolled                           ›  │  │
│  │  ⚠ 3 high/critical risk                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The "X of Y pts" format shows both the filtered count and total cohort size, maintaining context.

---

## 4. Cohort Subgroup Card

### 4.1 Card content

Each card contains:

| Element | Content | Purpose |
|---------|---------|---------|
| **Header** | Cohort name + patient count + "›" navigation affordance | Identification + entry point |
| **Attention summary** | Urgent count, action-needed count, avg days waiting, risk breakdown | Quick triage signal |
| **Node concentration** | Top 3-4 care flow nodes where patients are concentrated, with counts | Bridges to flow view — tells physician WHERE in the pathway patients are |

### 4.2 Node concentration detail

This is the Routing view's unique contribution. For each cohort card, show the specific care flow nodes where patients in the current selection are sitting:

```
Node concentration:
Endo Referral (3) · A1c Due (3) · Outreach (2)
```

The nodes are ordered by patient count (most concentrated first). Show top 3-4 nodes; if patients are spread across more, show "+ N more nodes" with expand affordance.

Each node name is a deep link — clicking "Endo Referral (3)" navigates to the Diabetes cohort flow view with the Endocrine Referral node focused and the active filter applied. This is the most specific navigation the system offers: directly into a care flow at the exact node where patients need attention.

When no dimension filter is active (default state), node concentration shows the full distribution across the care flow. When filtered (e.g., "Urgent"), it shows only nodes where the filtered patients are located.

### 4.3 Card interaction

| Action | Result |
|--------|--------|
| **Click card body** | Scope-filter to this cohort (adds cohort to DimensionSelection). Stats update, Map/Table filter accordingly. Consistent with Sankey band click. |
| **Click "›" affordance** | Navigate to cohort scope, pre-filtered to current action status selection. Left pane selection moves to this cohort. |
| **Click node name** | Navigate to cohort scope with specific node focused. Flow view opens with that node highlighted + filter applied. |
| **Hover card** | Subtle highlight. No state change. |

The card body click (scope-filter) and the "›" click (navigate) are two distinct actions on the same card — consistent with the two-step interaction model (select to preview, explicit affordance to navigate). The "›" affordance should be visually distinct from the card body (e.g., a button or icon at the card's right edge) to avoid accidental navigation.

### 4.4 "Not In Any Care Flow" card

Special card for unenrolled patients. No node concentration (no care flow to show nodes for). Instead shows:

- Total unenrolled count
- Risk breakdown (how many are high/critical risk — the concerning subset)
- Condition breakdown (what conditions do unenrolled patients have — suggests which care flows to build or expand)
- "›" navigates to a filtered Table view showing unenrolled patients (since there's no cohort flow view to enter)

---

## 5. Navigation and Context Transfer

### 5.1 What transfers to cohort scope

When the physician clicks "›" or a node name to navigate to a cohort scope:

| Context | How it transfers |
|---------|-----------------|
| **Action status filter** | Carries as a pre-applied filter in the cohort-level shared filter bar |
| **Focused node** (if node name clicked) | The care flow layer tree auto-expands to the relevant care flow, the canvas flow view focuses the specific node |
| **Risk tier filter** (if selected) | Optionally carries as a filter in cohort-level filter bar |
| **All-Patients state** | Persists in background context for restoration on return |

### 5.2 Return path

A floating anchor or breadcrumb appears at cohort scope: "← Back to All Patients" that returns to the All-Patients scope with the Routing view active and previous state (DimensionSelection, AxisVisibility, scroll position, active view) restored.

This extends the existing floating anchor pattern from patient workspace navigation (main DESIGN-SPEC Phase 6). The return context is stored when navigating away and restored on return.

### 5.3 Round-trip workflow

The intended daily workflow:

1. Open All-Patients, Map view → scan Sankey, identify attention areas
2. Select "Urgent" in dimension list → Sankey highlights, stats update
3. Switch to Routing view → see urgent patients decomposed by cohort and node
4. Click "Endo Referral (3)" on the Diabetes card → navigate to Diabetes flow view, Endocrine Referral node focused, filtered to urgent patients
5. Work through those patients at cohort scope (detail drawer, patient preview, actions)
6. Click "← Back to All Patients" → return to Routing view, state restored
7. The Routing view reflects the same filter state; physician picks the next cohort card to work on

For the demo with static mock data, step 5 won't actually change patient statuses (actions don't persist). The spec notes this as expected production behavior — in production, returning to Routing would show updated counts reflecting actions taken.

---

## 6. Relationship to Other Views

### 6.1 Routing vs Map

The Map shows population distribution across three axes (conditions → risk → action). The Routing view shows the same data decomposed by cohort with care flow node detail. Switching between Map and Routing with the same dimension selection shows the same patients from different angles — Map for the spatial/flow picture, Routing for the operational breakdown.

### 6.2 Routing vs Table

The Table shows individual patients with sortable columns. The Routing view shows cohort-level subgroups with navigation affordances. The physician uses Routing to decide WHERE to work, then either navigates to cohort scope (via "›") or switches to Table to see individual patients.

Table and Routing coexist — the physician might scan the Routing view, click a card body to scope-filter to that cohort, then switch to Table to see the specific patient list. The Table is filtered to that cohort because the scope-filter applies to all views.

### 6.3 Routing absorbs the Investigation Modal

The Routing view replaces the previously planned investigation modal. The modal's planned content maps to the Routing view:

| Investigation Modal element | Routing view equivalent |
|----------------------------|------------------------|
| Selection context header | Center pane stats module (unchanged) |
| Distribution breakdown | Cohort cards with node concentration |
| Patient list | Table view (switch to it) |
| Drill-down affordances | Card "›" and node name deep links |
| Key metrics | Card attention summary + center pane stats |

No modal exists at All-Patients scope. The center pane stats module provides compact metrics, the Routing view provides subgroup detail and navigation, and the Table view provides patient-level data. Three surfaces, each with a clear job, no overlay required.

---

## 7. Data Requirements

The Routing view renders from the same data sources as the Map view:

- `PopHealthPatient` records with condition/preventive assignments, risk tiers, action statuses
- `CareFlow` definitions with node structures (needed for node concentration)
- `DimensionSelection` state (shared with Map and Table)

Additional computation needed:

```
// Routing view data (computed from patient records + care flow definitions)
RoutingData: {
  categories: RoutingCategory[]
  unenrolled: UnenrolledGroup
}

RoutingCategory: {
  name: string                    // "Chronic Disease", "Preventive Care", etc.
  cohorts: RoutingCohortCard[]
}

RoutingCohortCard: {
  cohortId: string
  cohortName: string
  totalPatients: number           // unfiltered cohort size
  filteredPatients: number        // patients matching current DimensionSelection
  attentionSummary: {
    urgentCount: number
    actionNeededCount: number
    avgDaysWaiting: number
    riskBreakdown: Record<RiskTier, number>
  }
  nodeConcentration: NodeConcentrationItem[]  // sorted by count desc
}

NodeConcentrationItem: {
  nodeId: string
  nodeName: string
  careFlowId: string
  patientCount: number
  patientIds: string[]
}

UnenrolledGroup: {
  totalCount: number
  filteredCount: number
  riskBreakdown: Record<RiskTier, number>
  conditionBreakdown: { conditionName: string, count: number }[]
}
```

The `RoutingData` is recomputed whenever `DimensionSelection` changes — same memoization pattern as the Sankey data computation.

---

## 8. Assess-in-Practice Items

| # | Item | Question | Resolution approach |
|---|------|----------|-------------------|
| 1 | Card density at full panel | How many cohort cards render in default state? If 10+, does the view feel like a long list? | Category grouping helps; consider collapsing categories with all-healthy cohorts |
| 2 | Node concentration usefulness | Does showing top 3-4 nodes provide enough context for routing decisions? | Test with real care flow structures; adjust N based on typical node count per flow |
| 3 | "X of Y pts" formatting | Is "8 of 142 pts" immediately clear, or does it require a moment to parse? | Test with users; alternative: "8 patients (of 142 total)" |
| 4 | Card-body click vs "›" click | Will physicians accidentally navigate when they meant to scope-filter, or vice versa? | Ensure sufficient visual separation; consider click-anywhere-to-filter + only-button-to-navigate |
| 5 | Category ordering | Should categories always show in fixed order, or reorder by attention priority? | Fixed order provides spatial stability; attention badges handle prioritization |
| 6 | Return state accuracy | Does returning from cohort scope correctly restore scroll position and filter state? | Test round-trip; ensure state persistence is robust |

---

## 9. Design Decisions

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Second canvas view identity | Routing view (replaces Pipeline) | Pipeline didn't add significant value over Sankey + dimension list; Routing provides subgroup-level bridge with cohort/node detail and deep links | 2026-03-05 |
| 2 | Investigation modal | Removed — absorbed into Routing view + Table view | Modal content was redundant with Routing (subgroup breakdown) and Table (patient list); no overlay needed | 2026-03-05 |
| 3 | "View Details" in stats module | Removed | No modal to trigger; Routing view and Table view serve the detail function directly as canvas views | 2026-03-05 |
| 4 | Card interaction model | Click body to scope-filter, click "›" to navigate | Consistent with two-step pattern (select vs act) used across the system | 2026-03-05 |
| 5 | Node name as deep link | Clicking a node name navigates to cohort scope with that node focused | Most specific navigation path — takes physician directly to the workflow location where patients need attention | 2026-03-05 |
| 6 | Default state content | Full cohort index grouped by category | "Morning briefing" — shows complete panel organized by operational units before any filtering | 2026-03-05 |
| 7 | Unenrolled patients | Dedicated card at bottom with risk + condition breakdown | Surfaces enrollment gaps; risk highlighting identifies the concerning subset | 2026-03-05 |
| 8 | View name | "Routing" over "Pipeline", "Breakdown", "Index" | Best describes the view's function: deciding where to go to act | 2026-03-05 |
