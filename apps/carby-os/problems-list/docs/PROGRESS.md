# Problems List Prototype — Progress

> **Last Updated:** 2026-03-09

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation — App Scaffold + Design System + Shell | **Complete** |
| 2 | Problems List — Data + Filter Bar + Sections | **Partially Complete** — needs Rev 2 updates |
| 3 | Problems List — Interactive Actions + State Management | **Partially Complete** — needs Rev 2 updates |
| 4 | Detail Drawer + Edit Mode + Polish | Not Started |

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

**Still needed (Rev 2):**
- [ ] Replace ScreeningInstruments gallery with ScreeningBanner
- [ ] Add ProblemEvent type + history[] to ProblemItem
- [ ] Add display-labels.ts for category-aware action mapping
- [ ] Source pill label logic (label changes by state)
- [ ] Undo Exclude button on excluded cards
- [ ] Recurrence state rendering
- [ ] Category-specific action labels (Mark Resolved, Mark Addressed, Reopen)
- [ ] Mock data: add 2-5 ProblemEvent entries per item

### Phase 3: Interactivity (Tasks 9-10) — Partially Done
- ProblemsListView wiring all sections with shared action handlers
- Card actions: Confirm, Exclude, Mark Active, Mark Inactive, Mark Addressed, Reopen, Update (placeholder)
- Filter counts update dynamically after actions
- Visual polish pass against Figma (node 12953:13268)
- Vite build verified passing

**Still needed (Rev 2):**
- [ ] Undo Exclude action
- [ ] Activity event generation on each action (append to history[])
- [ ] Confirmed transitional state (shows both Activate + Deactivate)

## Current Focus

Rev 2 updates to Phases 2-3 + Phase 4 (Detail Drawer).

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
