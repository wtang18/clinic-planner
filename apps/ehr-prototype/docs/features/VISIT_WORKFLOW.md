# Feature: Visit Workflow

> **Status:** Active Design
> **Last Updated:** 2026-02-23
> **Related Docs:** [Information Architecture](../INFORMATION_ARCHITECTURE.md) | [Navigation Patterns](../NAVIGATION_PATTERNS.md) | [To-Do Feature](./TO_DO.md)
> **Reference:** `apps/ehr-prototype/reference/intake/Workflow Content + Control R2.png`

---

## Overview

Visit Workflow is a structured, phase-based canvas for pre- and post-provider encounter steps: patient check-in, clinical triage, and checkout. These steps are owned by front desk staff and MAs but accessible to all roles.

Workflow and Chart (Capture/Process/Review) are sibling views under a visit in the left menu. Each has its own sub-mode segmented control in the nav row. The `0` key toggles between them; `1/2/3` are context-dependent.

### Design Goals

1. **Structured progression** - Guide staff through check-in → triage → checkout with clear completion signals
2. **Role flexibility** - Any user can access any phase; roles gravitate naturally rather than being gated
3. **Data forward-flow** - Triage inputs (vitals, HPI, history) flow into charting views and patient overview
4. **Quick scanning** - Accordion sections let staff scan all inputs within a phase and edit any section quickly
5. **Context preservation** - Switching between Workflow and Chart preserves position in both

---

## Navigation Architecture

### Left Menu: Visit Sub-Items

Workflow and Chart appear as children under the visit entry in the left menu's patient workspace section.

```
Patient Workspaces
├── Sarah Chen
│   ├── Overview
│   └── 10/12 · UC Cough              [Triage]
│       ╰ Workflow                     ← active, highlighted
│       ╰ Chart
```

#### Visit Row

| Element | Treatment |
|---------|-----------|
| Date prefix | `MM/DD · ` in secondary color, followed by visit label in primary color |
| Status badge | Right-aligned, shows current workflow state (see Status Badges below) |
| Tap behavior | Navigates to last active state (Workflow or Chart, preserving phase/mode) |
| Style | Section header weight — bolder than sub-items, visually groups its children |

#### Sub-Item Rows (Workflow / Chart)

| Element | Treatment |
|---------|-----------|
| Connector | CSS pseudo-element: subtle gray right-angled line (vertical down from visit row, then horizontal right to label). Color: `fg.neutral.spotReadable` |
| Label | Text-only, no icons. Same left edge as visit label. Secondary color, regular weight |
| Active state | Background highlight + primary color text (or accent bar) |
| Tap behavior | Switches to that view, preserving last phase/mode within it |

```
Connector pseudo-element (conceptual):

  10/12 · UC Cough         [Triage]
  │
  ├─ Workflow              ← connector: vertical line + horizontal arm + arrowhead
  │                           centered vertically with label
  └─ Chart
```

The connector uses `::before` pseudo-elements on sub-item rows. The vertical segment extends from the bottom of the visit row. The horizontal arm ends with a small arrowhead (▸) middle-aligned with the sub-item label.

#### Past Visits

Past visits opened for reference are flat — no Workflow/Chart sub-items. They render as read-only summary views.

```
├── 09/28 · Annual Wellness           ← flat, no children, read-only
```

#### Status Badges

Right-aligned on the visit row. Indicates what's currently active or what's next.

| Workflow State | Badge Text | Color Scheme |
|----------------|-----------|--------------|
| Not started | — (no badge) | — |
| Check-in active | `Check-in` | `bg.attention.subtle` / `fg.attention.primary` |
| Triage active | `Triage` | `bg.attention.subtle` / `fg.attention.primary` |
| Charting active | `In Progress` | `bg.accent.subtle` / `fg.accent.primary` |
| Checkout active | `Checkout` | `bg.attention.subtle` / `fg.attention.primary` |
| All complete | `Complete` | `bg.positive.subtle` / `fg.positive.primary` |

### Nav Row: Context-Dependent Segmented Control

A single `SegmentedControl` component in the canvas header area. Content changes based on active view.

**When Workflow is active:**
```
┌──────────────────────────────────────────────┐
│ [Check-in ✓ | Triage | Checkout]             │
└──────────────────────────────────────────────┘
```

Completed phases show a small green checkmark icon after the label.

**When Chart is active:**
```
┌──────────────────────────────────────────────┐
│ [Capture | Process | Review]                 │
└──────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Key | Behavior |
|-----|----------|
| `0` | Toggle between Workflow and Chart (preserves phase/mode in each) |
| `1` | Workflow: Check-in / Chart: Capture |
| `2` | Workflow: Triage / Chart: Process |
| `3` | Workflow: Checkout / Chart: Review |

Legend panel descriptions update based on active context (future polish; initial implementation may use generic labels).

---

## SegmentedControl Component

A new generic `SegmentedControl` component replaces the current `ModeSelector`. Used by both Workflow and Chart views, and available for future reuse.

### API

```typescript
interface Segment<T extends string> {
  key: T;
  label: string;
  icon?: React.ReactNode;       // Optional leading icon
  badge?: React.ReactNode;      // Optional trailing badge (e.g., checkmark)
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
  variant?: 'topBar' | 'inline';
  disabled?: boolean;
  style?: React.CSSProperties;
}
```

### Variants

| Property | `topBar` | `inline` |
|----------|----------|----------|
| Height | `GLASS_BUTTON_HEIGHT` (44px) | 32–36px |
| Container | Glass pill (`glass.button` + backdrop blur) | Solid `bg.neutral.low` |
| Border radius | `GLASS_BUTTON_RADIUS` (22px) | Proportional to height |
| Selected fill | Translucent light gray (`rgba(0, 0, 0, 0.07)`) | `bg.neutral.base` (white) + subtle shadow |
| Selected text | `fg.neutral.primary`, medium weight | Same |
| Unselected text | `fg.neutral.secondary`, regular weight | Same |
| Font size | 14px | 13px |
| Icons | 16px | 14px |
| Backdrop blur | Yes | No |

### Selected State Improvement

The current ModeSelector's selected segment (`bg.neutral.base` white on glass white) has insufficient contrast. The new `topBar` variant uses a translucent gray fill for the selected segment:

- **Selected:** `background: rgba(0, 0, 0, 0.07)`, `color: fg.neutral.primary`, `fontWeight: medium`
- **Unselected:** `background: transparent`, `color: fg.neutral.secondary`, `fontWeight: regular`
- **Hover (unselected):** `background: rgba(0, 0, 0, 0.04)`
- **Optional subtle shadow on selected:** `box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06)`

---

## Workflow Phases

### Phase Model

Three phases with a linear progression. Phases can be completed in order; "Complete [Phase]" buttons advance to the next phase.

```
Check-in ──→ Triage ──→ [Charting happens here] ──→ Checkout
```

Charting (Capture/Process/Review) happens between Triage and Checkout but is its own top-level view, not a workflow phase.

### Phase Completion

Each phase has an inline "Complete [Phase]" button at the bottom of its section list, styled consistently with the sign-off modules in Process/Review views.

**Behavior on tap:**
1. All sections in the phase collapse to summary state
2. Phase tab gets a checkmark badge
3. Auto-advance to next phase (Check-in → Triage, Triage → Chart, Checkout → done)
4. Visit status badge updates

**Validation:** Soft — the button is always enabled. Uncompleted sections are allowed (for demo flexibility). In production, this would enforce required sections.

---

## Phase 1: Check-In

**Typical owner:** Front desk staff
**Purpose:** Verify patient identity, collect payment, obtain consent

### Sections

| # | Section | Input Type | Collapse Summary Example |
|---|---------|-----------|-------------------------|
| 1 | Billing Provider | Pre-populated select, verify | "Neeru Singh, MD" |
| 2 | Supervisor | Pre-populated select, verify | "Dr. Mercedes H." |
| 3 | Patient Information | Pre-populated fields, verify/confirm | "Verified 10/12" |
| 4 | Patient Cards | Upload/photo placeholder (ID, insurance) | "2 cards on file" |
| 5 | Specialty | Dropdown select | "Primary Care" |
| 6 | Responsible Party | Tab selector (Insurance In/Out, Worker's Comp, Org/School, Patient) | "Insurance (In-Network)" |
| 7 | Credit Card | Card on file display or "N/A" | "Visa ••••4242" or "N/A" |
| 8 | Consent Forms | Acknowledge/sign list | "3 of 3 signed" |
| 9 | Payment Collection | Copay + balance display | "$215.00 collected" |

### Design Notes

- Billing Provider and Supervisor are encounter-level metadata. They live here because check-in is where encounter setup happens. These fields are pre-populated from scheduling data.
- Payment Collection combines copay collection and patient balance into one section (the reference had them separate, but they're tightly coupled).
- Credit Card can be explicitly skipped ("N/A") without blocking phase completion.

---

## Phase 2: Triage

**Typical owner:** Medical Assistant (MA)
**Purpose:** Prepare patient for provider — room assignment, vitals, clinical intake

### Sections

| # | Section | Input Type | Collapse Summary Example |
|---|---------|-----------|-------------------------|
| 1 | Assign Room | Button grid (Room 1–6, Pending Results, Virtual Room) | "Exam Room 3" |
| 2 | Vitals | Structured form (BP, pulse, resp rate, O2 sat, temp, height, weight) + metric/imperial toggle | "BP 120/80, HR 72, T 98.6°F" |
| 3 | HPI | Text input (chief complaint + follow-up) | "Cold and Flu Symptoms" |
| 4 | Medical History | Review/update checklist (conditions, surgeries, family hx) | "Updated 10/12" |
| 5 | Rx Renewals | Review current meds, flag renewal requests | "2 pending" or "None" |

### Data Flow (Option C — Shared Entry Points)

Triage sections write to shared encounter state. This data is consumed by other views:

```
Triage (primary input)         Chart View                    Patient Overview
───────────────────────        ──────────                    ────────────────
Vitals form            ──→     Visit Context module          Vitals trends
                               (right rail, read + edit)     (across encounters)

HPI intake             ──→     HPI in chart items            HPI summary card
                               (AI-enrichable, editable)

Medical History        ──→     (visible in overview)         History section
                                                             (full timeline)

Rx Renewals            ──→     Chart items with              Medications list
                               intent: 'refill'
```

**Key principle:** Triage is the intake form (primary input surface). Chart view is the consumption and refinement surface. The data flows forward — MA enters, provider reviews/amends.

**Visit Context module in Chart's right rail:** Shows a compact read-only summary of triage data (vitals, HPI snippet, flagged renewals). Each item has an "Edit" affordance for provider corrections. This module only appears in Chart view — Workflow uses full canvas width with no rail.

---

## Phase 3: Checkout

**Typical owner:** Front desk staff
**Purpose:** Close the visit — billing, payment collection, follow-up scheduling

### Sections

| # | Section | Input Type | Collapse Summary Example |
|---|---------|-----------|-------------------------|
| 1 | Review Bill | Charge/CPT code summary (read-only + confirm) | "$450.00 — 3 line items" |
| 2 | Additional Charges | Add charges, process payment | "$50.00 collected" |
| 3 | Book Follow-Up | Date picker / scheduler placeholder | "Follow-up in 2 weeks" |

### Gating

Checkout becomes available after the provider signals readiness (e.g., completing Review mode sign-off in Chart). For the prototype, this gating is soft — Checkout is always accessible but shows an "Awaiting provider sign-off" banner if charting isn't complete.

---

## Accordion Section Component

Each section within a phase uses a shared accordion component with consistent behavior.

### Section States

| State | Visual | Behavior |
|-------|--------|----------|
| `not_started` | Collapsed, no summary, neutral styling | Tap to expand |
| `in_progress` | Expanded, form content visible | Active editing |
| `complete` | Collapsed, green check + one-line summary + chevron | Tap chevron to re-expand for editing |
| `skipped` | Collapsed, skip indicator ("N/A"), dimmed | For optional sections only |

### Expanded State

```
┌────────────────────────────────────────────────────┐
│  ▾  Vitals                                         │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Systolic] [Diastolic] [Pulse]    bpm             │
│  [Resp Rate] [O2 Sat] % [Oxy On ▾]                │
│  [Temperature] °F [Height] cm [Weight] kg          │
│                                                    │
│  [Metric | Imperial]                    [Save]     │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Collapsed State (Complete)

```
┌────────────────────────────────────────────────────┐
│  ✓  Vitals     BP 120/80, HR 72, T 98.6°F      ▸  │
└────────────────────────────────────────────────────┘
```

- Green checkmark icon (left)
- Section label (bold)
- One-line summary derived from section data (secondary color)
- Chevron (right) — tap to re-expand for editing

### Auto-Advance

When a section is marked complete (via its "Save" or "Done" action), the next section in the phase auto-expands. This creates a guided top-to-bottom flow without being a rigid stepper. Users can still manually expand/collapse any section at any time.

---

## Canvas Layout

### Workflow View (Full Width, No Rail)

```
┌──────────────────────────────────────────────────────────────┐
│  10/12 · UC Cough                                            │
│  Dr. Neeru Singh · Supervised by Dr. Mercedes H.             │  ← Encounter context
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Accordion Section ──────────────────────────────────┐    │
│  │  ✓  Billing Provider    Neeru Singh, MD           ▸  │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ▾  Patient Cards                                    │    │
│  │     [Upload / Take Photo placeholder]                │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │     Specialty                                        │    │
│  └──────────────────────────────────────────────────────┘    │
│  ...                                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         [ ✓ Complete Check-in ]                      │    │  ← Inline, scrolls with content
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Max-width 900px, centered (matches capture view `contentWrapper`)
- Scrolling canvas with sections stacking vertically
- "Complete [Phase]" button inline at the bottom, scrolls with content

### Chart View (With Right Rail Modules)

```
┌──────────────────────────────────────────┬───────────────────┐
│  Canvas (charting content)               │  Right Rail        │
│                                          │  ┌───────────────┐ │
│  [Chart items, OmniAdd, etc.]            │  │ Visit Context  │ │
│                                          │  │ (triage data)  │ │
│                                          │  ├───────────────┤ │
│                                          │  │ Processing     │ │
│                                          │  │ (AI drafts)    │ │
│                                          │  └───────────────┘ │
└──────────────────────────────────────────┴───────────────────┘
```

The right rail is a modular container. Visit Context module appears in Chart view only. Processing module (existing ProcessingRail content) is a separate module within the same rail.

---

## Right Rail Module Architecture

The existing `ProcessingRail` component is refactored into a modular rail system. The rail is a container; modules are the content.

### Modules

| Module | Appears In | Content |
|--------|-----------|---------|
| **Visit Context** | Chart view | Compact triage data (vitals, HPI, renewals) with edit affordances |
| **Processing** | Chart view (Capture mode) | AI drafts (existing ProcessingRail content) |
| **Sign-off** | Chart view (Process/Review) | Future: review checklist |

### Module Behavior

- Each module is independently collapsible
- Modules can be shown/hidden based on view context and mode
- Module order is fixed (Visit Context above Processing)
- Rail is hidden entirely in Workflow view (full canvas width)

---

## Role Model

### Soft Role Signaling

All roles can access all phases. Roles gravitate naturally based on workflow:

| Role | Primary Phases | Also Accesses |
|------|----------------|---------------|
| Front Desk | Check-in, Checkout | Triage (in small clinics) |
| MA | Triage | Check-in (walk-in patients) |
| Provider | Chart (Capture/Process/Review) | Triage (amend vitals/HPI), Checkout (review bill) |

### No Hard Gating

- Phase tabs are never locked or hidden based on role
- "Complete [Phase]" buttons are available to all users
- Phase headers may include a subtle role hint ("Typically: Front Desk") for orientation
- Attribution on completed phases: "Completed by [Name] at [Time]"

### Rationale

- Providers sometimes walk patients in and do their own triage
- MAs sometimes handle checkout
- Small clinics have one person doing everything
- Hard gating creates friction for edge cases and slows demo workflows

---

## Scenario-Driven Defaults

Each demo scenario defines where the encounter is in its lifecycle. The UI starts at the correct phase/mode.

### Scenario Workflow State

```typescript
interface ScenarioWorkflowState {
  /** Which phases are complete */
  completedPhases: WorkflowPhase[];
  /** Currently active view */
  activeView: 'workflow' | 'chart';
  /** Currently active phase (when workflow is active) */
  activePhase?: WorkflowPhase;
  /** Currently active mode (when chart is active) */
  activeMode?: Mode;
  /** Pre-filled section data per phase (for demo state) */
  prefilled?: {
    checkIn?: Record<string, unknown>;
    triage?: Record<string, unknown>;
  };
}
```

### Example Scenarios

| Scenario | Completed Phases | Active View | Default |
|----------|-----------------|-------------|---------|
| New walk-in patient | — | Workflow | Check-in |
| Patient checked in | Check-in | Workflow | Triage |
| Triage complete | Check-in, Triage | Chart | Capture |
| Mid-charting (AI review) | Check-in, Triage | Chart | Process |
| Ready for checkout | Check-in, Triage | Workflow | Checkout |
| Visit complete | Check-in, Triage, Checkout | Chart | Review |

The `0` key toggle preserves last-active state within each view. If you were on Triage, toggle to Chart (lands on last chart mode), toggle back — you're on Triage again.

---

## Current Implementation (v0)

A basic intake checklist was implemented as a scaffold:

| File | Contents |
|------|----------|
| `src/screens/IntakeView/intakeChecklist.ts` | `ViewContext` type, static checklist data |
| `src/screens/IntakeView/useIntakeChecklist.ts` | Checkbox state hook |
| `src/screens/IntakeView/IntakeCanvas.tsx` | Flat checklist with checkboxes |
| `src/components/layout/EncounterViewSwitcher.tsx` | Mutual-exclusion toggle (to be replaced) |

This v0 will be replaced by the full workflow system. The `EncounterViewSwitcher` is removed in favor of left-menu sub-items. The `IntakeCanvas` checklist is replaced by the accordion phase canvas. The `ViewContext` type and `0` key shortcut are preserved and extended.

---

## Implementation Boundary (Prototype)

For the current prototype phase:

**In scope:**
- Nav architecture (left menu sub-items, context-dependent segmented control, `0` key toggle)
- SegmentedControl generic component (`topBar` + `inline` variants)
- Workflow canvas with accordion sections and phase completion
- All 3 phases with placeholder form sections (correct labels, layouts, input placeholders)
- Section state machine (not_started → in_progress → complete → skipped)
- Phase completion and auto-advance
- Scenario-driven defaults

**Not in scope (deferred to data model phase):**
- Real data persistence or form validation
- Wiring triage data to shared encounter state
- Visit Context right rail module (depends on data flow)
- Real-time multi-user handoff
- Role-based phase attribution

---

## Future Considerations

### Real Data Model

When wiring real data, each section maps to a typed data slice:

```typescript
interface WorkflowData {
  checkIn: {
    billingProvider?: string;
    supervisor?: string;
    patientInfoVerified?: boolean;
    // ...
  };
  triage: {
    room?: string;
    vitals?: VitalsData;
    hpi?: string;
    // ...
  };
  checkout: {
    billReviewed?: boolean;
    followUpDate?: Date;
    // ...
  };
}
```

This data lives in encounter state and is consumed by charting views.

### Real-Time Handoff

In production, Check-in → Triage → Checkout spans different users on different devices. The workflow state is shared via real-time sync. Phase completion by one user triggers notifications for the next.

### Conditional Phases

Not every encounter type needs all phases:
- Telehealth: Skip room assignment in Triage
- Quick follow-up: Abbreviated Check-in
- Walk-in vs. scheduled: Different Check-in sections

The phase and section lists could be encounter-type-configurable.

### Smart Defaults

Auto-populate sections based on context:
- Returning patient: Pre-fill from last visit
- Scheduled appointment: Pre-fill from scheduling data
- Emergency: Skip non-critical sections, flag for later completion

---

## Design Decisions Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| 3 phases (not 4) | Visit phase content overlaps with charting. Billing provider/supervisor housed in Check-in. | 4-phase model with Visit phase for encounter metadata + order dashboard |
| Left menu sub-items (not nav row toggle) | More discoverable, consistent hierarchy, keeps nav row clean | Mutual-exclusion toggle in nav row (EncounterViewSwitcher — v0 implementation) |
| Accordion (not stepper) | Allows quick scanning of all inputs + easy re-editing of any section | Vertical stepper with strict progression |
| Soft phase validation | Prototype flexibility; can click through without filling every section | Strict validation blocking completion until required sections done |
| No right rail in Workflow | No useful modules identified for workflow phases. Full canvas width preferred. | Rail with billing provider/supervisor metadata |
| Billing provider in Check-in | Encounter setup naturally happens at check-in. Avoids inventing a rail module. | Encounter context bar settings popover |
| Inline complete buttons | Consistent with sign-off modules in Process/Review. Scrolls with content. | Sticky bottom button (always visible) |
| Same SegmentedControl for both views | Visual consistency, component reuse. Context switch communicated via left menu highlight. | Different styling to distinguish Workflow from Chart |
| Shared data entry points (Option C) | Maximum flexibility. MA starts in Triage, provider can amend in Chart. | Strict phase ownership (Option B) — cleaner separation but requires context-switching for corrections |
| Context-dependent 1/2/3 keys | Natural mapping — the segmented control is visible, keys match segments | Separate key sets (1/2/3 for chart, 4/5/6 for workflow) |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-23 | Initial visit workflow architecture document | Claude + William |
