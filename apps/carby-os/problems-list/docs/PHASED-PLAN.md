# Problems List Prototype — Phased Plan

> **Status:** Draft (Rev 2)
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
- [x] App starts on `npm run dev`
- [x] Patient shell matches Figma reference (recognizable, not pixel-perfect)
- [x] Design system components render with correct tokens
- [x] Problems List tab is highlighted/active

---

## Phase 2: Problems List — Data + Filter Bar + Sections

**Goal:** Problems list content renders with all 4 sections and working filter pills.

**Scope:**
- Define TypeScript types (ProblemItem, ProblemEvent, enums)
- Create mock data (~15 items across 4 categories, each with 2-5 history events)
- Build `display-labels.ts` — category-aware action label mappings
- Build FilterBar with TogglePill components
- Build ProblemSection (header + card list)
- Build ProblemCard (description, pill row, state-dependent actions, chevron)
- Build ScreeningBanner for SDOH section (compact summary + "View All" → toast)
- Wire filter pills to filter visible items across sections
- Dynamic counts on filter pills
- Collapsible sections (chevron toggle)
- Source pill label logic (changes by state per §5.4)

**Exit Criteria:**
- [x] All 4 sections render with correct mock data
- [x] Filter pills toggle and filter items correctly
- [x] Counts update dynamically
- [x] Multiple filters can be active simultaneously
- [x] Sections collapse/expand
- [x] Card layout matches Figma (pills, actions, chevron)
- [ ] Screening banner renders at top of SDOH section
- [ ] Category-aware action labels (Mark Resolved, Mark Addressed, Reopen)
- [ ] Source pill labels change based on item state
- [ ] Undo Exclude button shown on excluded cards
- [ ] Recurrence state renders correctly for Conditions/Enc Dx

---

## Phase 3: Problems List — Interactive Actions + State Management

**Goal:** Card actions update item state in place, including activity history tracking.

**Scope:**
- Enhance `useProblemsState` hook with activity history management
- Wire all actions: Confirm, Exclude, Undo Exclude, Mark Active, Mark Inactive, Mark Resolved, Mark Addressed, Reopen
- Each action appends a ProblemEvent to the item's history[]
- Action buttons show/hide based on current item state per §5.3 matrix
- Confirmed state shows both Activate + Deactivate options
- Filter counts update after actions
- Toast feedback on actions
- Add button placeholder (toast or in-place SearchInput stub)

**Exit Criteria:**
- [x] All card actions functional
- [x] Card re-renders with updated state after action
- [x] Correct action buttons shown per state (per Design Spec §5.3)
- [x] Filter pill counts reflect state changes
- [x] Toast appears on action
- [ ] Undo Exclude action works
- [ ] Activity events generated on each action
- [ ] Category-specific action labels (Mark Resolved vs Mark Inactive)

---

## Phase 4: Detail Drawer + Edit Mode + Polish

**Goal:** Chevron opens detail drawer with summary card, activity log, edit mode, and future placeholders.

**Scope:**
- Build ProblemDetailDrawer (side drawer from right)
- Summary card with Edit button (reuses ProblemCard in detail mode)
- Activity log — chronological list of ProblemEvents from item history
- Related Screening section for SDOH items (conditional, static card)
- Edit mode (ProblemEditMode) — dates + notes inline fields (Health Concerns: also description)
  - Save generates `edited` event in history
  - Locked fields shown as display text, not inputs
- Kebab menu (⋯) with disabled Split/Merge items → "Coming soon" toast
- Remove button in footer with confirmation
- Visual polish: spacing, typography, color alignment with Figma
- Dual display mode verification (tab vs drawer rendering)
- Empty states when filters yield zero items

**Exit Criteria:**
- [ ] Chevron opens detail drawer with correct category title
- [ ] Summary card shows same pills/actions as list card + Edit button
- [ ] Activity log renders events newest-first with actor + timestamp
- [ ] SDOH items show Related Screening section when applicable
- [ ] Edit mode: can edit dates + notes (+ description for Health Concerns)
- [ ] Save creates activity event and returns to detail view
- [ ] Kebab menu shows disabled Split/Merge placeholders
- [ ] Remove button works with confirmation
- [ ] ProblemsListView works in both tab and drawer mode
- [ ] Visual quality suitable for stakeholder review
