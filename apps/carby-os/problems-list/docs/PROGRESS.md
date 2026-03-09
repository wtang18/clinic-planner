# Problems List Prototype — Progress

> **Last Updated:** 2026-03-09

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation — App Scaffold + Design System + Shell | **Complete** |
| 2 | Problems List — Data + Filter Bar + Sections | **Complete** |
| 3 | Problems List — Interactive Actions | **Complete** |
| 4 | Detail Drawer + Polish | Not Started — awaiting Figma |

## What's Done

### Phase 1: Foundation (Tasks 1-4)
- Vite + React + TypeScript app at `apps/carby-os/`
- Tailwind CSS configured with full design token system
- 7 design system components copied from clinic-planner (Button, Card, Pill, TogglePill, SearchInput, Toast, SegmentedControl)
- Patient shell: IconNav, EncounterSidebar, PatientHeader, TabBar, PatientShell
- Mock patient: Maria Santos, 52F, with full demographics and appointment data

### Phase 2: Data + UI (Tasks 5-8)
- Type system: ProblemItem, ScreeningInstrument, FilterKey, enums for category/status/source
- 15 mock items across 4 categories (6 conditions, 3 encounter dx, 3 SDOH, 3 health concerns)
- useProblemsState hook: filter logic, dynamic counts, action handlers
- FilterBar with TogglePill components (multi-select, sticky)
- ProblemSection with collapsible headers, action buttons, empty states
- ProblemCard with state-dependent pills and actions
- ScreeningInstruments cards for SDOH section

### Phase 3: Interactivity (Task 9-10)
- ProblemsListView wiring all sections with shared action handlers
- Card actions: Confirm, Exclude, Mark Active, Mark Inactive, Mark Addressed, Reopen, Update (placeholder)
- Filter counts update dynamically after actions
- Visual polish pass against Figma (node 12953:13268)
- Vite build verified passing

## Current Focus

Phase 4 — Detail drawer. Awaiting Figma node for drawer design.

## Blockers

- Detail drawer Figma node needed for Phase 4 (user has it ready)

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
