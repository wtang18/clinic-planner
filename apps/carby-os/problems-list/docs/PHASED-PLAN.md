# Problems List Prototype — Phased Plan

> **Status:** Draft
> **Last Updated:** 2026-03-09
> **Design Spec:** `DESIGN-SPEC.md`

---

## Phase 1: Foundation — App Scaffold + Design System + Shell

**Goal:** Vite app running with design system components and static patient view shell.

**Scope:**
- Initialize Vite + React + TypeScript app at `apps/carby-os/`
- Configure Tailwind, import `@carbon-health/design-tokens` CSS
- Copy design system components from clinic-planner (Button, Pill, TogglePill, Card, Toast, SearchInput)
- Copy `cn()` utility and any shared dependencies
- Build static PatientShell layout: IconNav, EncounterSidebar, PatientHeader, TabBar
- Mock patient data (Maria Santos profile)
- Problems List tab active, other tabs visually present but inert
- Verify: `npm run dev` serves the app, shell renders correctly

**Exit Criteria:**
- [ ] App starts on `npm run dev`
- [ ] Patient shell matches Figma reference (recognizable, not pixel-perfect)
- [ ] Design system components render with correct tokens
- [ ] Problems List tab is highlighted/active

---

## Phase 2: Problems List — Data + Filter Bar + Sections

**Goal:** Problems list content renders with all 4 sections and working filter pills.

**Scope:**
- Define TypeScript types (ProblemItem, enums)
- Create mock data (~15 items across 4 categories)
- Build FilterBar with TogglePill components
- Build ProblemSection (header + card list)
- Build ProblemCard (description, pill row, action buttons, chevron)
- Build ScreeningInstruments row for SDOH section
- Wire filter pills to filter visible items across sections
- Dynamic counts on filter pills
- Collapsible sections (chevron toggle)

**Exit Criteria:**
- [ ] All 4 sections render with correct mock data
- [ ] Filter pills toggle and filter items correctly
- [ ] Counts update dynamically
- [ ] Multiple filters can be active simultaneously
- [ ] Sections collapse/expand
- [ ] Card layout matches Figma (pills, actions, chevron)

---

## Phase 3: Problems List — Interactive Actions

**Goal:** Card actions update item state in place.

**Scope:**
- Build `useProblemsState` hook (state management for items)
- Wire Confirm → updates verificationStatus + clinicalStatus
- Wire Exclude → updates verificationStatus
- Wire Mark Active / Mark Inactive → updates clinicalStatus
- Wire Reopen (health concerns) → updates clinicalStatus
- Wire Mark Addressed (SDOH) → updates clinicalStatus
- Action buttons show/hide based on current item state
- Filter counts update after actions
- Toast feedback on actions
- Add button placeholder (toast or in-place SearchInput stub)

**Exit Criteria:**
- [ ] All card actions functional
- [ ] Card re-renders with updated state after action
- [ ] Correct action buttons shown per item state (see Design Spec §5.3)
- [ ] Filter pill counts reflect state changes
- [ ] Toast appears on action

---

## Phase 4: Detail Drawer + Polish

**Goal:** Chevron opens detail view; visual polish pass.

**Scope:**
- Build ProblemDetailDrawer (side drawer from right)
- Detail view contents (pending separate Figma node)
- Visual polish: spacing, typography, color alignment with Figma
- Dual display mode verification (tab vs drawer rendering)
- Empty states when filters yield zero items
- Review with stakeholders, iterate

**Exit Criteria:**
- [ ] Chevron opens detail drawer with item info
- [ ] Detail drawer matches Figma (pending design)
- [ ] ProblemsListView works in both tab and drawer mode
- [ ] Visual quality suitable for stakeholder review
