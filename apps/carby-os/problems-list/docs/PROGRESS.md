# Problems List Prototype — Progress

> **Last Updated:** 2026-03-10

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation — App Scaffold + Design System + Shell | **Complete** |
| 2 | Problems List — Data + Filter Bar + Sections | **Complete** |
| 3 | Problems List — Interactive Actions + State Management | **Complete** |
| 4 | Detail Drawer + Edit Mode + Polish | **Complete** (1 deferred item) |

## What's Done

### Phase 1: Foundation (Tasks 1-4) ✅
- Vite + React + TypeScript app at `apps/carby-os/`
- Tailwind CSS configured with full design token system
- 7 design system components copied from clinic-planner (Button, Card, Pill, TogglePill, SearchInput, Toast, SegmentedControl)
- Patient shell: IconNav, EncounterSidebar, PatientHeader, TabBar, PatientShell
- Mock patient: Maria Santos, 52F, with full demographics and appointment data

### Phase 2: Data + UI (Tasks 5-8) — Partially Done
- Type system: ProblemItem, ScreeningInstrument, FilterKey, enums for category/status/source
- 15 mock items across 4 categories (6 conditions, 3 encounter dx, 3 SDOH, 3 health concerns)
- useProblemsState hook: filter logic, dynamic counts, action handlers
- FilterBar with TogglePill components (multi-select, sticky)
- ProblemSection with collapsible headers, action buttons, empty states
- ProblemCard with state-dependent pills and actions
- ScreeningInstruments cards for SDOH section

**Rev 2 updates (complete):**
- [x] Replace ScreeningInstruments gallery with ScreeningBanner
- [x] Add ProblemEvent type + history[] to ProblemItem
- [x] Add display-labels.ts for category-aware action mapping
- [x] Source pill label logic (label changes by state)
- [x] Undo Exclude button on excluded cards
- [x] Recurrence state rendering (Asthma mock item set to recurrence)
- [x] Category-specific action labels (Mark Resolved, Mark Addressed, Reopen)
- [x] Mock data: add 2-5 ProblemEvent entries per item

### Phase 3: Interactivity (Tasks 9-10) ✅
- ProblemsListView wiring all sections with shared action handlers
- Card actions: Confirm, Exclude, Mark Active, Mark Inactive, Mark Addressed, Reopen, Note Recurrence
- Filter counts update dynamically after actions
- Visual polish pass against Figma (node 12953:13268)
- Vite build verified passing

**Rev 2 updates (complete):**
- [x] Undo Exclude action
- [x] Activity event generation on each action (append to history[])
- [x] Confirmed transitional state (shows both Activate + Deactivate)

### Phase 4: Detail Drawer + Edit Mode + Polish ✅
- ProblemDetailDrawer: 600px right drawer with summary card, activity log, action buttons
- Pencil icon → ProblemEditMode (inline edit for dates, notes, HC description)
- Kebab menu: contextual undo actions, disabled Split/Merge placeholders
- Remove button in footer (only for items with ≤1 history event)
- Recurrence state: "Note Recurrence" as equal peer to "Mark Active" on inactive Conditions/Enc Dx
- Contextual undo: Undo Mark Active, Undo Mark Inactive, Undo Mark Resolved, Undo Mark Addressed, Undo Reopen, Undo Recurrence — all in kebab menu
- Section headers: tappable to collapse/expand, auto-animate transitions (200ms)
- Collapsed sections show active item count
- Pill `subtle-outlined` border fixed to `fg-transparent-soft`

**Deferred:**
- [ ] SDOH items: Related Screening section in detail drawer (low priority — screening data is in ScreeningBanner)

## Current Focus

All phases complete. Prototype is demo-ready for stakeholder review.

## Blockers

None — all Figma references available.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-09 | Vite + React over Next.js | Client-side prototype, no SSR/backend needed |
| 2026-03-09 | Copy design system components (not extract) | Faster setup, can extract to shared package later |
| 2026-03-09 | apps/carby-os/ as shared app for all production EHR prototypes | Reusable patient shell across features |
| 2026-03-09 | All 4 record types in scope | Stakeholder review needs full picture |
| 2026-03-09 | Demo-ready interactions (not static mock) | Internal stakeholders need to feel the workflow |
| 2026-03-09 | @ts-nocheck on copied DS components | React types mismatch with design-icons; prototype trade-off |
| 2026-03-09 | Direct token CSS imports (no index.css bundle) | Worktree missing bundled index.css; import individual layers |
| 2026-03-09 | Unified status labels across categories | Same display labels (Active, Inactive, etc.) for consistency; category-specific vocabulary expressed through action button labels only |
| 2026-03-09 | Category-aware action labels | Mark Resolved (Health Concerns), Mark Addressed (SDOH), Mark Inactive (Conditions/Enc Dx) — matches clinical vocabulary |
| 2026-03-09 | Undo Exclude on excluded cards | Figma shows this; spec originally missed it |
| 2026-03-09 | One card per problem with activity history | Recurrences are events in history, not separate cards |
| 2026-03-09 | Descriptions + ICD codes not editable | Controlled vocabulary items — correct via remove + re-add. Health Concern descriptions are the exception (free text). |
| 2026-03-09 | SDOH screening banner replaces gallery | Simpler — separates screening admin from SDOH conditions. Detail-level results live in SDOH detail drawer. |
| 2026-03-09 | Split/Merge as disabled placeholder | Kebab menu in detail drawer with "Coming soon" items — shows the concept without building it |
| 2026-03-09 | performedAt vs effectiveDate in events | Supports backdated entries — recorded now but happened in the past |
| 2026-03-10 | Note Recurrence as equal peer to Mark Active | Don't lean providers one way or another — logging correct state, not pushing a preferred path |
| 2026-03-10 | Contextual undo in kebab menu | Primary buttons for intentional clinical decisions; kebab for corrections. Applied to all categories for consistency. |
| 2026-03-10 | Recurrence renders as info-emphasis pill | Recurrence is effectively active — similar visual treatment helps providers scan overall status |
| 2026-03-10 | Remove only for items with ≤1 history event | Items with rich history are too important to casually delete; editing is the safer path |

## Rev 2 Summary (2026-03-09)

Design spec updated from Figma card states review (node 13027:15996) and detail drawer discussion. Key additions:

1. **6 status states** identified from Figma (was 4 in original spec): Unconfirmed, Confirmed, Active, Inactive, Excluded, Recurrence
2. **Undo Exclude** action added — all categories
3. **Category-aware action labels** — Mark Resolved/Mark Addressed/Mark Inactive vary by category
4. **Activity history model** — ProblemEvent type with performedAt/effectiveDate
5. **Recurrence grouping** — one card, many episodes in history
6. **Edit constraints** — locked descriptions/codes for controlled vocabularies
7. **Detail drawer** structure — summary card + related screening (SDOH) + activity log + edit mode + remove + split/merge placeholder
8. **SDOH screening banner** — replaces gallery/preview cards
9. **Source pill label logic** — changes by state (Reported → Diagnosed → Onset → Recurrence)
10. **Edge case matrix** — 25+ scenarios documented
