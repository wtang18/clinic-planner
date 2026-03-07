# Sankey Navigator — Design Specification

**Status:** Draft — pending review
**Scope:** Defines the inline priority navigation behavior on the All-Patients Sankey Map view — when a user taps a Sankey bar, the Sankey shrinks and a priority column appears alongside it. This replaces the previously planned separate Routing canvas view at all-patients scope.
**Related docs:** `../ALL-PATIENTS-DESIGN-SPEC.md` (Sankey Map view base spec), `../ROUTING-DESIGN-SPEC.md` (predecessor concept — preserved for reference), `../priorities-view/DESIGN-SPEC.md` (priority card patterns reused here)
**Context:** The original design had three canvas views at all-patients scope: Map | Routing | Table. Through design iteration, the Routing view was eliminated. Instead, the Sankey itself becomes an interactive navigator — tapping bars surfaces a priority column inline, making the Sankey both a visualization and a navigation/triage tool. This keeps the user in flow rather than requiring a view switch.

---

## 1. Role in the View Architecture

All-patients scope now has two canvas views:

| View | Question it answers |
|------|-------------------|
| **Map** (Sankey + navigator) | "Where is everyone? What needs attention?" — with inline priority drill-down |
| **Table** | "Who specifically? What are the details?" |

The Routing view tab is removed. Its "morning briefing" and "where to go next" functions are absorbed by the Sankey navigator interaction.

### 1.1 What the Sankey navigator replaces

The predecessor Routing view (see `../ROUTING-DESIGN-SPEC.md`) provided:

- Cohort subgroup cards grouped by category
- Node concentration detail per cohort
- Deep links to cohort scope at specific nodes

The Sankey navigator provides the same value through a different interaction model:

| Routing view feature | Sankey navigator equivalent |
|---------------------|---------------------------|
| Cohort subgroup cards | Priority column showing items from selected Sankey bar |
| Node concentration detail | Priority cards show care flow → node context |
| Deep links to cohort scope | Card actions include "Go to cohort" navigation |
| Category grouping | Sankey axes provide the grouping (condition, risk, action) |
| Attention summary per cohort | Priority column shows urgency-sorted items |

---

## 2. Interaction Model

### 2.1 Default state (no bar tapped)

The Map view shows the full Sankey at 100% width, exactly as specified in `../ALL-PATIENTS-DESIGN-SPEC.md`. No priority column is visible. The center pane dimension list and stats module function as before.

### 2.2 Bar tap → priority column appears

When the user taps a Sankey bar (a segment on any axis — e.g., "Urgent" on the action axis, "Diabetes" on the condition axis, "High Risk" on the risk axis):

1. **Sankey shrinks** to ~40% of canvas width, sliding left
2. **Priority column appears** in the remaining ~60%, sliding in from the right
3. **Sankey bar stays highlighted** — the tapped bar is visually selected
4. **Stats module updates** to reflect the tapped bar's population (same behavior as current dimension selection)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◉ Map  │  ▦ Table                                       [≡] Q       │
├──────────────────────┬───────────────────────────────────────────────┤
│                      │                                               │
│   [Sankey ~40%]      │  Priority Items for: Urgent (23 patients)     │
│                      │                                               │
│   Conditions   Risk  │  Sort: [Urgency ▼]  [By cohort]  [By date]   │
│   ┃         ┃  ┃     │                                               │
│   ┃ Diabetes┃──┃High │  ┌─────────────────────────────────────────┐  │
│   ┃         ┃  ┃     │  │ Maria Santos              URGENT  2d   │  │
│   ┃─────────┃──┃─────│  │ Diabetes → Endo Referral               │  │
│   ┃ Hyper   ┃  ┃Med  │  │ A1c 11.2 — referral pending 14d       │  │
│   ┃─────────┃  ┃     │  └─────────────────────────────────────────┘  │
│   ┃ Screen  ┃──┃─────│                                               │
│   ┃         ┃  ┃Low  │  ┌─────────────────────────────────────────┐  │
│   ┃─────────┃──┃     │  │ James Chen                URGENT  1d   │  │
│             ACTION    │  │ Post-Discharge → 48hr Callback         │  │
│             ┃ ■■■ ┃   │  │ High readmit risk — not reached        │  │
│             ┃ Urgent  │  └─────────────────────────────────────────┘  │
│             ┃─────┃   │                                               │
│             ┃ Act ┃   │  ┌─────────────────────────────────────────┐  │
│             ┃─────┃   │  │ Robert Kim                ACTION  3d   │  │
│             ┃ Mon ┃   │  │ Diabetes → Titration Recommendation    │  │
│             ┃─────┃   │  │ A1c 9.8 — current regimen failing     │  │
│                      │  └─────────────────────────────────────────┘  │
│                      │                                               │
│                      │  ...                                          │
│                      │                                               │
└──────────────────────┴───────────────────────────────────────────────┘
```

### 2.3 Shrunk Sankey behavior

When the Sankey is at ~40% width:

- The Sankey re-renders at the smaller width (responsive resize, not clip/crop)
- Labels may truncate or reposition for readability
- Hover/tap interactions on the Sankey still work — tapping a different bar updates the priority column
- The selected bar shows a persistent highlight (fill or border accent)
- Flow ribbons are still visible but may be thinner/simplified at narrow width

### 2.4 Priority column content

The priority column shows items from the selected Sankey bar's population — patients who match that bar's dimension value (e.g., all patients in "Urgent" action status across all cohorts).

This is a cross-cohort priority view — it pulls items from ALL cohorts that have patients in the selected bar. This is the Sankey navigator's unique value: a panel-wide priority view filtered by dimension.

### 2.5 Dismiss

| Action | Result |
|--------|--------|
| Tap the same bar again | Priority column slides out, Sankey returns to 100% |
| Tap a different bar | Priority column updates to new bar's items (no dismiss/reappear — content swap) |
| Tap empty area of Sankey | Priority column slides out, Sankey returns to 100% |
| Switch to Table view | Priority column dismissed, Table shows at full width |

---

## 3. Priority Column Design

### 3.1 Column header

```
Priority Items for: [Dimension Value] ([N] patients)
```

The header shows what Sankey bar was tapped and the patient count. If multiple bars are selected (future — shift+click), the header shows the combined selection.

### 3.2 Sort controls

```
Sort: [Urgency ▼]  [By cohort]  [By date]          23 items
```

| Sort | Behavior |
|------|----------|
| **Urgency** (default) | URGENT first, then REVIEW/ACTION/MONITOR. Within tiers, by days waiting. |
| **By cohort** | Groups items by cohort (Diabetes, Screening, Post-Discharge, etc.). Within each cohort, by urgency. |
| **By date** | Most recent first. |

"By cohort" replaces "By node" from the cohort-scope Priorities view — at all-patients scope, the cohort grouping is more useful than node grouping since items span multiple care flows.

### 3.3 Priority cards

Cards follow the same design as cohort-scope priority cards (see `../priorities-view/DESIGN-SPEC.md` §5) with one addition: the care flow → node context line includes the **cohort name** since items span multiple cohorts:

```
┌─────────────────────────────────────────────────────────┐
│  Maria Santos                              URGENT  2d   │
│  Diabetes › A1c Management → Endo Referral              │
│  A1c 11.2 — referral pending 14 days, no response       │
└─────────────────────────────────────────────────────────┘
```

vs. cohort-scope card (cohort name omitted since you're already in that cohort):

```
│  Diabetes A1c Mgmt → Endo Referral                      │
```

### 3.4 Card interaction

| Action | Behavior |
|--------|----------|
| **Tap card** | Expand to show quick actions (same as cohort-scope: defer, assign, flag, details) |
| **Tap patient name / "Details"** | Opens side drawer (same drawer pattern as cohort-scope Priorities view) |
| **Tap cohort name** | Navigates to that cohort scope with the relevant node focused. Context transfer carries the active dimension filter. |

The cohort name tap is the navigation path that replaces the Routing view's "›" affordance and node deep links. It takes the provider from the all-patients priority view directly into the cohort they need to work in.

### 3.5 Navigation to cohort scope

When the provider taps a cohort name on a priority card, the system:

1. Switches left pane selection to that cohort
2. Opens the Priorities view at cohort scope (not Flow view)
3. Pre-selects the relevant node in the layer tree
4. Carries the action status filter (e.g., "Urgent") as a pre-applied filter
5. Shows the floating anchor: "← Back to All Patients" for return

This is the same context transfer pattern described in `../ROUTING-DESIGN-SPEC.md` §5, now triggered from a priority card rather than a Routing view subgroup card.

---

## 4. Interaction with Center Pane

### 4.1 Dimension selection sync

Tapping a Sankey bar is equivalent to selecting that dimension value in the center pane dimension list. The two stay in sync:

- Tap "Urgent" bar on Sankey → "Urgent" becomes selected in the dimension list → stats module updates → priority column appears
- Select "Urgent" in the dimension list directly → Sankey "Urgent" bar highlights → priority column appears

### 4.2 Multi-dimension selection

When multiple dimensions are selected (e.g., "Urgent" + "Diabetes"), the priority column shows items matching the intersection — urgent patients in the Diabetes cohort. This matches the existing `DimensionSelection` behavior where multiple selections narrow the population.

### 4.3 Stats module coordination

The stats module (top of center pane) continues to show aggregate metrics for the current selection, whether driven by Sankey bar tap or dimension list selection. The priority column is additive — it doesn't replace the stats module; it adds item-level detail.

---

## 5. Relationship to Cohort-Scope Priorities View

The Sankey navigator's priority column and the cohort-scope Priorities view share significant design patterns:

| Pattern | Shared? | Difference at all-patients scope |
|---------|---------|--------------------------------|
| Card layout | Yes — same anatomy | Adds cohort name to context line |
| Badge types | Yes — URGENT/REVIEW/ACTION/MONITOR | Same |
| Quick actions | Yes — defer/assign/flag/details | Adds "Go to cohort" navigation |
| Side drawer | Yes — same structure | Same |
| Sort options | Mostly — urgency and date sort | "By cohort" replaces "By node" |
| Batch actions | Yes — same batch bar + review | Same |
| Ambient strip | No | Not present in priority column (panel-wide activity is too broad to be useful) |
| Checkbox/batch | Yes | Same |
| Automation layers | Yes — same 4-layer model | Same |

The ambient strip is NOT included in the Sankey navigator's priority column. At all-patients scope, the aggregated AI/team activity across all cohorts would be too noisy to be useful. Ambient awareness is a cohort-scope concern.

---

## 6. Edge Cases

### 6.1 Empty bar

Tapping a Sankey bar with zero priority items (e.g., "All Current" action status — no items need attention):

```
Priority Items for: All Current (842 patients)

✓ No items need attention
All patients in this segment are on track.

[Switch to Table to view patients →]
```

### 6.2 Very large result set

Some bars may have 50+ priority items (e.g., "Action Needed" across all cohorts). The priority column handles this with:

- Virtual scrolling for performance
- "By cohort" sort to group related items
- Batch actions for bulk disposition
- A note at the top: "50 items — consider filtering by adding dimensions"

### 6.3 Narrow viewport

If the viewport is too narrow for 40%/60% split:

- Sankey shrinks to minimum readable width (~30%)
- Priority column gets the remaining space
- At extreme narrow widths, consider stacking vertically or defaulting to Table view

### 6.4 Multiple bar selection (future)

The current spec supports single bar tap. Future enhancement: shift+click to select multiple bars, with priority column showing the union (e.g., "Urgent + Action Needed" items). This follows the same multi-select pattern being established at cohort scope.

---

## 7. Data Requirements

The priority column reuses the same `PriorityItem` data model from `../priorities-view/DESIGN-SPEC.md` §10.1. The difference is in the query:

```
// Cohort-scope Priorities view query:
items = allPriorityItems
  .filter(item => selectedNodeIds.includes(item.nodeId))
  .filter(item => item.automationLayer >= 2)
  .filter(item => !item.isDeferred)

// Sankey navigator priority column query:
items = allPriorityItems
  .filter(item => matchesDimensionSelection(item.patient, currentDimensionSelection))
  .filter(item => item.automationLayer >= 2)
  .filter(item => !item.isDeferred)
```

The cohort-scope view filters by node selection. The all-patients view filters by dimension selection (which may span multiple cohorts and care flows).

---

## 8. Assess-in-Practice Items

| # | Item | Question | Resolution approach |
|---|------|----------|-------------------|
| 1 | Sankey readability at 40% | Is the shrunk Sankey still useful, or just visual noise? | If labels become unreadable, consider further reducing or hiding labels, or allowing user to collapse Sankey entirely |
| 2 | 40/60 split ratio | Is 40% Sankey / 60% priority column the right balance? | Assess with real content; may need adjustable divider |
| 3 | Priority column vs. Table view | Do providers use the priority column at all-patients scope, or just go directly to Table? | Track usage; if column unused, the Sankey navigator concept may not justify its complexity |
| 4 | Cohort name navigation | Is tapping cohort name on a card intuitive for navigating to cohort scope? | Test with users; may need a more explicit "Go to cohort" button |
| 5 | Transition animation | Sankey shrink + column slide-in: how fast? Does it feel smooth? | Target ~300ms; test with users |

---

## 9. Design Decisions

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Routing view eliminated | Replaced by inline Sankey navigator | Keeps user in flow; avoids view-switch for drill-down. Sankey as visualization + navigator. | 2026-03-06 |
| 2 | All-patients canvas views | Map (with navigator) + Table | Two views sufficient when Map becomes interactive. Simpler mental model. | 2026-03-06 |
| 3 | Sankey shrink ratio | ~40% Sankey / ~60% priority column | Priority column needs enough width for card content; Sankey at 40% is still readable for navigation | 2026-03-06 |
| 4 | Priority column card design | Reuses cohort-scope card patterns + adds cohort name | Consistency across scopes; cohort name needed since items span cohorts | 2026-03-06 |
| 5 | Cohort name as navigation | Tap cohort name on card → navigate to cohort scope | Direct replacement for Routing view's deep-link functionality | 2026-03-06 |
| 6 | No ambient strip at all-patients | Panel-wide AI/team activity too broad to be useful | Ambient awareness is cohort-specific; all-patients scope focuses on triage/routing | 2026-03-06 |
| 7 | Bar tap = dimension select | Tapping Sankey bar syncs with center pane dimension list | Single source of truth for selection state; no separate navigator state | 2026-03-06 |
| 8 | "By cohort" sort option | Replaces "By node" at all-patients scope | Cohort grouping more useful than node grouping when spanning multiple care flows | 2026-03-06 |
