# Sankey Navigator — Phased Build Plan

**Status:** Not started
**Prerequisites:** All-Patients Phase A2 (Sankey Map view must be rendering) and `priorities-view/` Phase PV1 (priority card data model + rendering must exist for reuse). The Sankey navigator extends both — the Sankey visualization and the priority card components.
**Total estimated effort:** ~5-7 hours across 2 phases

---

## Phase Overview

| Phase | Name | Effort | Dependencies |
|-------|------|--------|-------------|
| **SN1** | Sankey shrink + priority column rendering | ~3-4 hrs | All-Patients A2 + Priorities PV1 |
| **SN2** | Card interaction + cohort navigation + polish | ~2-3 hrs | SN1 complete |

---

## Phase SN1: Sankey Shrink + Priority Column Rendering

**Goal:** When a Sankey bar is tapped, the Sankey shrinks to ~40% and a priority column renders alongside it showing items for the selected dimension value.

### Deliverables

1. **Sankey shrink behavior**
   - Bar tap triggers animated resize from 100% → ~40% width
   - Sankey re-renders at smaller width (responsive, not clip)
   - Selected bar highlight (persistent fill or border accent)
   - Dismiss: tap same bar, tap empty area, or switch view

2. **Priority column container**
   - Column slides in from right, ~60% width
   - Header: "Priority Items for: [Value] (N patients)"
   - Sort controls: Urgency / By cohort / By date + item count

3. **Priority card rendering (reuse)**
   - Reuse `PriorityItem` data model and card component from `priorities-view/`
   - Add cohort name to card context line
   - Mock data: priority items that span multiple cohorts

4. **Dimension selection sync**
   - Bar tap updates `DimensionSelection` state
   - Stats module updates to reflect tapped bar
   - Dimension list checkmark syncs with bar selection

5. **Empty state**
   - "No items need attention" for bars with no priority items
   - Link to Table view

### Acceptance criteria

- Tapping a Sankey bar shrinks Sankey + reveals priority column with animated transition
- Priority cards show items matching the bar's dimension value
- Tapping a different bar swaps priority column content
- Tapping the same bar or empty area dismisses the column
- Stats module and dimension list stay in sync with bar selection

---

## Phase SN2: Card Interaction + Cohort Navigation + Polish

**Goal:** Add card expansion with quick actions, side drawer integration, cohort navigation from cards, and transition polish.

### Deliverables

1. **Card expansion + quick actions (reuse)**
   - Reuse expansion and quick action patterns from `priorities-view/` PV2
   - Defer, assign, flag, details actions

2. **Side drawer integration (reuse)**
   - Reuse drawer component from `priorities-view/` PV3
   - Same patient header + priority context + actions structure

3. **Cohort navigation**
   - Tap cohort name on card → navigate to cohort scope
   - Context transfer: left pane selection, node pre-selection, filter carry
   - Floating anchor: "← Back to All Patients"
   - Return restores: Sankey navigator state (bar selection, scroll position)

4. **Batch actions (reuse)**
   - Checkbox on cards, batch bar on 2+ selected
   - Reuse batch bar + batch review drawer from PV4

5. **Polish**
   - Smooth Sankey shrink animation (~300ms)
   - Label truncation/repositioning at narrow width
   - Virtual scrolling for 50+ item lists
   - Multi-dimension selection (Sankey bar + dimension list combination)

### Acceptance criteria

- Card quick actions work (defer, assign, flag)
- Drawer opens with full priority context
- Cohort name tap navigates to cohort scope with correct context transfer
- Return from cohort restores Sankey navigator state
- Animations are smooth and performant

---

## Dependency Diagram

```
All-Patients A2 (Sankey rendering)  +  Priorities PV1 (card data model)
└── SN1 (Sankey shrink + priority column)
    └── SN2 (card interaction + navigation + polish)
        ↑ reuses: PV2 (quick actions), PV3 (drawer), PV4 (batch)
```

## Component Reuse Map

| Component | Source | Modifications for Sankey navigator |
|-----------|--------|-----------------------------------|
| PriorityItem data model | priorities-view/ PV1 | Query filters by DimensionSelection instead of node selection |
| Priority card | priorities-view/ PV1 | Add cohort name to context line |
| Card expansion + quick actions | priorities-view/ PV2 | Add "Go to cohort" navigation action |
| Side drawer | priorities-view/ PV3 | Same — no modifications |
| Batch bar + review | priorities-view/ PV4 | Same — no modifications |
| Sort controls | priorities-view/ PV1 | "By cohort" replaces "By node" |
