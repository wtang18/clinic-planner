# All-Patients View — Progress Tracker

**Status:** A1–A3.1 complete, R1 (Routing View) complete
**Last updated:** 2026-03-05

---

## Phase Status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| A1 | Data Model Extensions + Sankey Spike | Complete | Custom SVG, 3-axis model, 33 tests |
| A2 | Canvas — Sankey Map View | Complete | SankeyChart, AllPatientsCanvas, header, keyboard shortcuts |
| A3 | Center Pane — Dynamic Stats + Dimension List | Complete | Stats module, 4 dimension sections, eye toggle |
| A3.1 | Sankey Refinements | Complete | Label padding, top bar clearance, scroll, investigate button |
| R1 | Routing View Core + Card Layout | Complete | Pipeline→routing rename, routing types, mock data enrichment, routing-computation.ts, RoutingView component, 20 new tests. See ROUTING-PROGRESS.md |
| R2 | Routing Navigation + Context Transfer | Not started | Deep links, scope navigation, floating anchor |
| A4 | Table View + Integration Polish | Not started | Requires A2 + A3 |

---

## Open Design Questions

| # | Question | Context | Status |
|---|----------|---------|--------|
| 1 | ECharts vs custom SVG | Spike in Phase A1 will determine rendering approach. ECharts preferred if it supports two-zone left axis and per-band styling. | Resolve in A1 |
| 2 | Convergence zone visual clarity | Left-to-center zone may tangle at 8-10 condition bands. Zone width and transparency need tuning. | Assess in practice |
| 3 | Small population threshold | At what patient count does the stats module switch from aggregate metrics to inline patient list? Testing needed. | Assess in practice |
| 4 | "Other" bucket threshold | How many top conditions/preventive items to show before collapsing to "Other"? Spec says 6-8 conditions, 3-4 preventive. | Assess in practice |
| 5 | Axis removal animation | Does dynamically removing/adding a Sankey axis feel smooth? Transition design needed. | Assess in practice |
| 6 | Attention pre-highlight intensity | Urgent/Action Needed bands need to draw the eye without overwhelming the default state. | Assess in practice |

---

## Design Decisions Log

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Sankey axis assignment | Left: conditions+preventive, Center: risk, Right: action status | Clinical narrative; risk normalizes to panel size | 2026-03-05 |
| 2 | Left axis zones | Two zones (conditions/preventive) with center pane show/hide | Visibility without conflation; center pane controls | 2026-03-05 |
| 3 | Right axis split | "All Current" + "Not Enrolled" separate bands | Surfaces enrollment gaps; risk highlighting for urgency | 2026-03-05 |
| 4 | Condition grouping | Top N + Other, user-expandable | Simple, customizable, no algorithmic logic | 2026-03-05 |
| 5 | Overview module placement | Dynamic stats in center pane | Clean architecture; canvas stays pure visualization | 2026-03-05 |
| 6 | Default Sankey state | Full three-axis, attention bands pre-highlighted | Readable density; immediate focal point | 2026-03-05 |
| 7 | Axis visibility control | Separate accordion + eye toggle per section | Independent list visibility vs axis visibility | 2026-03-05 |
| 8 | Click behavior | Scope-filter, not navigate; explicit drill-down affordances | Consistent with selection-not-navigation principle | 2026-03-05 |
| 9 | Multi-select logic | Within axis: OR, cross axis: AND | Matches natural intent | 2026-03-05 |
| 10 | Preset views | Deferred | Core interaction sufficient; presets additive | 2026-03-05 |
| 11 | Canvas views | Map + Routing + Table | Establishes three-view structure; Pipeline renamed to Routing in R1 | 2026-03-05 |
| 12 | Investigation modal | Absorbed into Routing view + Table view | No modal needed; three surfaces cover all depths | 2026-03-05 |
| 13 | Technical approach | ECharts primary, custom SVG fallback | ECharts handles multi-level Sankey natively; spike validates | 2026-03-05 |
| 14 | Risk Tiers scope | Not a left pane category; lives on Sankey center axis + dimension list + cohort-level filter | Risk is a patient attribute (cross-cutting lens), not a care-flow-organized grouping | 2026-03-05 |

---

## Future Capabilities (Noted, Not Scoped)

- Routing view Phase R2: navigation, context transfer, deep links (see ROUTING-PHASED-PLAN.md)
- Table view at All-Patients scope (full build — separate spec)
- Category overview views (separate spec per category type)
- Saved/preset view configurations
- Historical comparison (ghost overlay of prior period band widths)
- Throughput rate metrics on Sankey bands
- Patient overlap visualization (explicit multi-cohort membership view)
- Animated transitions showing patient flow over time
- Export/share Sankey snapshot
- AI-suggested cohort insights ("Your CHF patients have unusually high urgent action rates")
