# Population Health Workspace — Progress Tracker

> **Status:** Active Design — Architecture Phase (Rev 2)
> **Last Updated:** 2026-03-03
> **Related Docs:** [Design Spec](./DESIGN-SPEC.md) | [Phased Plan](./PHASED-PLAN.md) | [AppShell Scope System](../../architecture/appshell-scope-system.md)

---

## Phase Status (Rev 2 Plan)

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | AppShell Scope Infrastructure | Not started | CaptureView extraction, ScopeManager, scope routers |
| 1 | Types + Mock Data + React Flow | Not started | Update existing types/data, add React Flow dependency |
| 2 | Menu Integration ("My Patients") | Not started | Cohort tree into MenuPane, scenario-aware |
| 3 | Center Pane — Cohort Context | Not started | Identity parity, Overview/Activity, branch-only tree |
| 4 | Flow View — React Flow Migration | Not started | Replace FlowCanvas + ConnectionLines |
| 5 | Cross-Pane Sync + Filters | Not started | Requires 3 + 4 |
| 6 | Detail Drawer + Drill-Through | Not started | Scope push/pop, return affordance |
| 7 | Table View + Polish | Not started | Wire existing table, AI bar, full journey |

### Previous Implementation (Rev 1)

First pass built ~17 pop health files on a separate-screen architecture (PopHealthView owning its own AdaptiveLayout). Audit findings against the new AppShell architecture:
- **13 files** work as-is or need minor updates
- **3 files** need wiring changes (PopHealthView → eliminated, PopHealthCanvas → re-hosted, PatientPreviewView → drill-through call)
- **2 files** to be replaced (FlowCanvas → React Flow, ConnectionLines → React Flow)
- **0 files** need full rework

---

## Open Design Questions

| # | Question | Context | Status |
|---|----------|---------|--------|
| 1 | Connection line differentiation | Multi-pathway overlay may create visual confusion. Currently all same style. | Assess in practice |
| 2 | Column-tap parent-slide animation | Exact choreography for upstream node repositioning. Needs to feel smooth. | Assess in practice |
| 3 | Node config editing — live vs. preview | Inline editing in detail drawer: apply immediately or require explicit save? | Read-only for v1 |
| 4 | Visual density at 7+ columns | React Flow pan/zoom + minimap may suffice. | Assess in practice |
| 5 | Detail drawer width | 40-50% starting point. Adjust based on content density. | Assess in practice |
| 6 | Filter panel layout | Filter drawer panel, pathway-specific filter appearance. | Defer to implementation |
| 7 | "All Patients" canvas view | Stats-only view? System-map of all pathways as collapsed blocks? | Design decision needed |
| 8 | Custom cohort creation flow | Currently pre-defined cohorts only. Future: filter-builder. | Future scope |
| 9 | Pathway creation flow | Currently view/edit only. Future: template-based, AI-assisted. | Future scope |
| 10 | Downstream role views | RN, MA, coordinator perspectives. Data model supports, UI not built. | Future scope |
| 11 | Column snap threshold | How far can a node be dragged before snapping to next column? | Assess in practice |
| 12 | Alerts segmentation | Critical in Overview vs. full list — own tab or "View all" expansion? | Assess in practice |
| 13 | Activity feed granularity | How much detail per event in Activity tab. | Assess in practice |
| 14 | ~~Inbound/outbound connector state~~ | ~~Should anchor points or edges show patient queue/throughput counts?~~ | **Resolved** → Decision #44-47 |

---

## Design Decisions Log

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Left pane content | Cohorts only (no pathways) | "Who" vs "what" separation | 2026-03-02 |
| 2 | Center pane role | Peer/parent context, never child | Architectural consistency | 2026-03-02 |
| 3 | Pathway visualization | Layer tree (center) + column-grid flow (canvas) | Hierarchical outline + spatial graph | 2026-03-02 |
| 4 | Node visual language | Uniform card, icon+label+pill, no color for type | Scalable; color reserved for state | 2026-03-02 |
| 5 | Node interaction | Tap body = focus; chevron = drawer (independent) | Lightweight inspection vs. deep engagement | 2026-03-02, **updated 2026-03-03** |
| 6 | Column grid layout | Columns as guides, snap-to-column, user-positionable | Users can arrange for readability; columns = guides, not hierarchy | 2026-03-02, **updated 2026-03-03** |
| 7 | Loop/retry flows | Loop Reference node type instead of backward edges | Preserves left-to-right direction | 2026-03-02 |
| 8 | Cross-pathway reference | Reference chip on node, no cross-pathway edges | Keeps each pathway's flow self-contained | 2026-03-02 |
| 9 | Multi-pathway overlay | Separate vertical bands, no color differentiation | Color reserved for state | 2026-03-02 |
| 10 | Column-tap stacking | Lens-style collect/release, other columns stable | Lightweight, reversible | 2026-03-02 |
| 11 | Shared filters | Filter button opens right drawer, chips below top bar | Unified across both views | 2026-03-02, **updated 2026-03-03** |
| 12 | View facets | Flow View + Table View (segmented control) | Same objects, different lenses | 2026-03-02 |
| 13 | Patient drill-through | Scope push/pop via ScopeManager | Uses scope stack, not mode switch | 2026-03-02, **updated 2026-03-03** |
| 14 | Escalation handling | Filter-based, not separate queue | Consistent with filter architecture | 2026-03-02 |
| 15 | Canvas layout model | Columns as layout guides, not strict hierarchy | Nodes snap to columns but users can arrange freely within | 2026-03-02, **updated 2026-03-03** |
| 16 | Pathway count (demo) | 3 fully built: diabetes A1c, cancer screening, post-discharge | Demonstrates chronic/preventive/transition range | 2026-03-02 |
| 17 | Mock data approach | Aggregate metrics at realistic scale, 10-20 patients per cohort | Convincing demo without excess data | 2026-03-02 |
| 18 | Pathway creation | View only for v1 (read-only detail drawer) | Reduces scope | 2026-03-02, **updated 2026-03-03** |
| 19 | Node anchor points | React Flow handles (hidden default → visible on focus) | React Flow manages connection routing | 2026-03-02, **updated 2026-03-03** |
| 20 | Stream-scoped stacking | Deferred to post-v1 | Additive filter on existing behavior | 2026-03-02 |
| 21 | AppShell architecture | Option C: Hybrid (Thin AppShell + Scope Renderers) | Persistent shell with scope-specific content in layout slots | 2026-03-03 |
| 22 | Scope state management | Explicit scope stack (ScopeManager) | Drill-through requires navigation history | 2026-03-03 |
| 23 | NavRow prop generalization | Generalize now (workspaceContent slot) | 4 scopes, 3 prop paths — clean up now | 2026-03-03 |
| 24 | Menu routing | Generic navigateToScope + scope manager | Drill-through makes per-transition callbacks proliferate | 2026-03-03 |
| 25 | Return affordance | Canvas top bar (back-arrow + origin label) | Consistent with ContextBar pattern | 2026-03-03 |
| 26 | Terminology | "Pathway" for pop health, "Protocol" for encounter | Prevent confusion when both coexist | 2026-03-03 |
| 27 | Rendering engine | React Flow (@xyflow/react) | Replaces manual FlowCanvas + ConnectionLines; handles drag, edges, pan/zoom | 2026-03-03 |
| 28 | Node lifecycle states | 7 states: Active, Paused, Draft, Needs Review, Test, Archived, Error | Comprehensive lifecycle; build full type system, render subset for prototype | 2026-03-03 |
| 29 | Pause cascade | Visual dimming of downstream children; state at originating node only | Children retain own state; dimming = "blocked by upstream pause" | 2026-03-03 |
| 30 | State transitions | Flow-level governance (not per-node guards) | Pathway designer has full control | 2026-03-03 |
| 31 | Error state | Added for broken nodes, failsafes, AI monitoring alerts | System-detected, automatic transition | 2026-03-03 |
| 32 | Node ownership | Separate from lifecycle; future concept (provider, AI, third-party) | Documented for type system, not rendered in v1 | 2026-03-03 |
| 33 | Archived visibility | Hidden by default, filter-controlled | Reduces visual noise | 2026-03-03 |
| 34 | Details affordance | Always-visible chevron `>` on node card | Independent from focus; no tap-first required | 2026-03-03 |
| 35 | Node focus behavior | Tap body = inline expansion (full title, anchors, connectors to top) | Lightweight, reversible enrichment of current view | 2026-03-03 |
| 36 | Menu integration | "My Patients" section within MenuPane (not standalone component) | Parallel to "To Do" and "Patient Workspaces" sections | 2026-03-03 |
| 37 | Category overviews | Stats-only views per category (Chronic Disease Overview, etc.) with placeholders | Quick orientation before drilling into cohorts | 2026-03-03 |
| 38 | Center pane identity | Same visual pattern as patient identity (name, metadata, collapsible) | Structural parity across scopes | 2026-03-03 |
| 39 | Center pane views | Overview + Activity segmented control (parallels patient pane) | Activity tab tracks cohort events | 2026-03-03 |
| 40 | Alerts placement | Critical alerts float to Overview; full list in dedicated view/expansion | Reduce noise while surfacing urgent items | 2026-03-03 |
| 41 | Layer tree indentation | Branch-only (sequential nodes same indent; only branches create hierarchy) | Compact tree; visual hierarchy matches logical branching | 2026-03-03 |
| 42 | Search in canvas | Search button in top bar, expands inline | Quick node/patient search within canvas | 2026-03-03 |
| 43 | Prototype lifecycle scope | Build full type system, render Active + Paused + Draft only | Extensible without refactor; upgrade prototype as needed | 2026-03-03 |
| 44 | Patient flow visibility model | Three tiers: edge counts (canvas), anchor enrichment (focus), full breakdown (drawer) | Progressive disclosure; each tier adds detail without cluttering the previous | 2026-03-03 |
| 45 | Edge flow count display | Natural count above edge, error/exception count below edge; toggleable via top bar | Visual differentiation of healthy flow vs. problems; clean canvas by default | 2026-03-03 |
| 46 | Anchor enrichment on focus | Focused node anchors show inbound/outbound summary counts | At-a-glance flow story without opening drawer | 2026-03-03 |
| 47 | Flow breakdown in drawer | Node Detail View includes Flow section: inbound (with attribution), at-stage, outbound (with branch distribution), throughput | Deep engagement; full patient flow story with attribution and metrics | 2026-03-03 |
| 48 | NodeFlowState data model | Explicit interface for flow state; static mock data, structured for future real-time engine | Upgrade boundary: replace data source without touching rendering | 2026-03-03 |

---

## Future Capabilities (Noted, Not Scoped)

- Stream-scoped column stacking (tap node → stacking only collects downstream descendants)
- AI-assisted pathway creation via AI palette/pane (inline edit or full flow generation)
- Custom cohort creation via filter builder
- Template-based pathway creation (pick template, customize parameters)
- Downstream role views (RN, MA, coordinator perspectives)
- System-map view (all pathways as collapsed blocks for "All Patients")
- Real-time pathway execution engine (currently static mock data)
- Pathway versioning and change tracking
- Pathway sharing across providers/organizations
- Integration with quality measure reporting
- SDOH data integration for cohort definition and risk stratification
- Node ownership rendering (provider, AI agent, third-party integration)
- Drag-to-connect pathway creation (using anchor points)
