# Routing View — Progress Tracker

**Status:** Phase R1 complete
**Last updated:** 2026-03-05

---

## Phase Status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| R1 | Routing View Core + Card Layout | **Complete** | pipeline→routing rename, routing types, mock data enrichment (currentNodeLabel + daysWaiting), routing-computation.ts (3 pure functions), RoutingView component, 15 new tests |
| R2 | Navigation, Context Transfer, Polish | Not started | Requires R1, benefits from Main Phase 2 + All-Patients A3 |

---

## Open Design Questions

| # | Question | Context | Status |
|---|----------|---------|--------|
| 1 | Card density at full panel | How many cohort cards render in default state? If 10+, does the view feel like a long list? | Assess in practice |
| 2 | Node concentration usefulness | Does showing top 3-4 nodes provide enough context for routing decisions? | Assess in practice |
| 3 | "X of Y pts" formatting | Is "8 of 142 pts" immediately clear, or does it require a moment to parse? | Assess in practice |
| 4 | Card-body click vs "›" click | Will physicians accidentally navigate when they meant to scope-filter, or vice versa? | Assess in practice |
| 5 | Category ordering | Should categories always show in fixed order, or reorder by attention priority? | Assess in practice |
| 6 | Return state accuracy | Does returning from cohort scope correctly restore scroll position and filter state? | Assess in practice |

---

## Design Decisions Log

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Second canvas view identity | Routing view (replaces Pipeline) | Pipeline didn't add significant value over Sankey + dimension list; Routing provides unique subgroup-level bridge with cohort/node detail and deep links | 2026-03-05 |
| 2 | Investigation modal | Removed — absorbed into Routing view + Table view | Modal content was redundant with Routing (subgroup breakdown) and Table (patient list); three surfaces (stats, Routing, Table) cover all depths | 2026-03-05 |
| 3 | "View Details" button in stats module | Removed | No modal to trigger; Routing view and Table view serve the detail function directly as canvas views | 2026-03-05 |
| 4 | Card interaction model | Click body to scope-filter, click "›" to navigate | Consistent with two-step pattern (select to preview, explicit affordance to navigate) used across the system | 2026-03-05 |
| 5 | Node name as deep link | Clicking a node name navigates to cohort scope with that node focused | Most specific navigation path — takes physician directly to the workflow location where patients need attention | 2026-03-05 |
| 6 | Default state content | Full cohort index grouped by category | "Morning briefing" — shows complete panel organized by operational units before any filtering | 2026-03-05 |
| 7 | Unenrolled patients | Dedicated card at bottom with risk + condition breakdown | Surfaces enrollment gaps; risk highlighting identifies the concerning subset | 2026-03-05 |
| 8 | View name | "Routing" over "Pipeline", "Breakdown", "Index" | Best describes the view's function: deciding where to go to act | 2026-03-05 |

---

## Future Capabilities (Noted, Not Scoped)

- Cohort card mini-chart showing attention trend over time
- Drag-to-reorder cards for physician-preferred priority
- Collapsible category sections with remembered state
- "Pin" frequently accessed cohorts to top of Routing view
- Smart ordering: ML-suggested cohort priority based on acuity patterns
- Routing view at category scope (subset of cohort cards within one category)
