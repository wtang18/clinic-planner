# Problems List Prototype — Design Specification

> **Status:** Active Design (Rev 3)
> **Last Updated:** 2026-03-10
> **Author:** Will Tang
> **PRD Reference:** `apps/carby-os/problems-list/reference/Patient Problem List PRD.md`
> **Figma:** Wm3cfzJvKzITMVvkxpX9mQ
>   - Drawer view: node `12953:13268`
>   - Card states: node `13027:15996`
>   - Detail drawer (Patient Concern): referenced in discussion
> **Purpose:** Internal stakeholder review prototype

---

## 1 Overview

A demo-ready prototype of the structured patient problem list feature for Carby OS. Renders all four clinical record types from the PRD (Conditions, Encounter Diagnoses, SDOH, Health Concerns) in a unified scrollable view with filter controls, inline actions, and a detail drawer with activity history.

**Primary goal:** Give product, clinical, and engineering leadership a tangible, interactive reference for the problem list feature before real engineering begins.

**What this is NOT:** A production implementation. No backend, no real data, no FHIR compliance, no auth. Mock data only.

## 2 Architecture

### 2.1 App Structure

```
apps/carby-os/                          # Shared Vite+React+TS app for Carby OS prototypes
├── src/
│   ├── design-system/                  # Copied from clinic-planner design system
│   │   ├── components/                 # Button, Card, Pill, TogglePill, etc.
│   │   ├── lib/utils.ts               # cn() utility (clsx + tailwind-merge)
│   │   └── index.ts
│   ├── shell/                          # Patient view wrapper (static)
│   │   ├── PatientShell.tsx            # Full patient view layout
│   │   ├── IconNav.tsx                 # Left vertical icon strip
│   │   ├── EncounterSidebar.tsx        # Visit details sidebar
│   │   ├── PatientHeader.tsx           # Name, demographics, contact info
│   │   ├── TabBar.tsx                  # Tab navigation (Problems List active)
│   │   └── mock-patient.ts            # Static patient demographics
│   ├── features/
│   │   └── problems-list/
│   │       ├── ProblemsListView.tsx    # Main container — filter bar + sections
│   │       ├── FilterBar.tsx           # TogglePill row with counts
│   │       ├── ProblemSection.tsx      # Section header + card list
│   │       ├── ProblemCard.tsx         # Individual problem item
│   │       ├── ScreeningBanner.tsx     # SDOH screening summary banner
│   │       ├── ProblemDetailDrawer.tsx # Side drawer — summary + activity log
│   │       ├── ProblemEditMode.tsx     # Inline edit for dates + notes
│   │       ├── types.ts               # ProblemItem, ProblemEvent, enums
│   │       ├── mock-data.ts           # ~15 items with activity histories
│   │       ├── display-labels.ts      # Category-aware label/action mappings
│   │       └── hooks/
│   │           └── useProblemsState.ts # Filter + action + history state
│   └── App.tsx                         # Root — renders PatientShell + route
├── problems-list/
│   ├── reference/                      # PRD (existing)
│   └── docs/                           # This spec, phased plan, progress
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 2.2 Technology

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build | Vite | Fast dev server, minimal config for client-side prototype |
| UI | React + TypeScript | Team standard |
| Styling | Tailwind + CVA + CSS variables | Matches clinic-planner design system |
| Tokens | @carbon-health/design-tokens | Shared monorepo package |
| Icons | @carbon-health/design-icons | Shared monorepo package (Lucide-based) |
| State | React useState/useReducer | Local only — no Redux, no persistence |
| Routing | None (single view) | Tab bar is visual only; Problems List always shown |

### 2.3 Design System Reuse

Components copied from `apps/clinic-planner/design-system/`:
- **Pill** — status pills (Unconfirmed/attention, ICD codes/transparent, source+date/transparent)
- **TogglePill** — filter bar pills
- **Card** — problem item container, summary card in detail drawer
- **Button** — action buttons (Exclude, Confirm, Mark Active, etc.)
- **SearchInput** — placeholder for Add flow
- **Toast** — action feedback
- **SegmentedControl** — if needed for sub-filters

Dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `@carbon-health/design-tokens`, `@carbon-health/design-icons`

## 3 Patient Shell (Static Wrapper)

The shell provides visual context only. Nothing is interactive except the Problems List tab content.

### 3.1 Layout

```
┌──────┬──────────────────┬─────────────────────────────────────────┐
│ Icon │ Encounter        │ Patient Header                          │
│ Nav  │ Sidebar          │ Name · Age/Sex/DOB · Insurance          │
│      │                  │ Contact row · Metadata badges           │
│      │ Visit info       ├─────────────────────────────────────────┤
│      │ Workflow steps   │ Tab Bar                                 │
│      │                  │ Med Hx │ PROBLEMS LIST │ Cases │ ...    │
│      │                  ├─────────────────────────────────────────┤
│      │                  │                                         │
│      │                  │ Problems List Content                   │
│      │                  │ (scrollable)                            │
│      │                  │                                         │
│      │ Finish visit     │                                         │
└──────┴──────────────────┴─────────────────────────────────────────┘
```

### 3.2 Mock Patient

Realistic patient profile:
- **Name:** Maria Santos
- **Age/Sex/DOB:** 52 year old female, 06/14/1973
- **Insurance:** Blue Cross PPO
- **PCP:** Dr. Sarah Chen, MD
- **Patient ID:** 2847391
- **Contact:** (415) 555-0142, m.santos@email.com
- **Address:** 1847 Mission St, San Francisco, CA
- **Appointment:** Follow-up, 10:30 AM PDT
- **Provider:** Albert Chong, PA-C
- **Clinic:** Carbon Health — SoMa

### 3.3 Tab Bar

Tabs: Medical History | **Problems List** (active) | Cases | Vitals | Medications | Care Adherence | Tasks

Only "Problems List" is active. Other tabs show disabled/muted styling. Clicking them does nothing.

## 4 Data Model

### 4.1 Core Types

```typescript
type ProblemCategory = 'condition' | 'encounter-dx' | 'sdoh' | 'health-concern';

type VerificationStatus = 'unconfirmed' | 'confirmed' | 'excluded';

type ClinicalStatus = 'active' | 'inactive' | 'resolved' | 'recurrence';

type ProblemSource = 'reported' | 'diagnosed' | 'screened' | 'imported';

type Severity = 'mild' | 'moderate' | 'severe';

interface ProblemItem {
  id: string;
  category: ProblemCategory;
  description: string;
  icdCode: string | null;          // Required for conditions/encounter-dx, optional for SDOH (Z-codes), null for health-concern
  snomedCode: string | null;
  verificationStatus: VerificationStatus;
  clinicalStatus: ClinicalStatus;
  source: ProblemSource;
  sourceDate: string;               // Display format: "MM/DD/YY"
  severity?: Severity;
  onsetDate?: string;               // When condition actually started (may differ from sourceDate)
  abatementDate?: string;           // When condition ended — set on inactive/resolved, cleared on reactivation. Maps to FHIR Condition.abatementDateTime
  notes?: string;                   // Free text annotations
  history: ProblemEvent[];          // Activity log, newest first
  relatedScreeningId?: string;      // SDOH only — links to screening instrument
}
```

### 4.2 Activity History Types

Each problem maintains a chronological activity log. Every status change or edit creates a new event.

```typescript
type ProblemEventType =
  // Status changes (auto-generated on action)
  | 'reported'            // Initial entry by patient/provider
  | 'imported'            // CCDA / system import
  | 'screening-detected'  // Added from screening results (SDOH)
  | 'confirmed'
  | 'excluded'
  | 'undo-excluded'
  | 'marked-active'
  | 'marked-inactive'     // Soft deactivation — Conditions / Encounter Dx (→ clinicalStatus: 'inactive')
  | 'marked-addressed'    // Soft deactivation — SDOH (→ clinicalStatus: 'inactive')
  | 'marked-resolved'     // Definitive resolution — all categories (→ clinicalStatus: 'resolved')
  | 'recurrence'          // Conditions/Encounter Dx only
  | 'reopened'            // Reactivated from resolved/addressed/inactive

  // Manual corrections / edits
  | 'edited'              // Date or notes correction
  | 'note-added'          // Annotation added

  // Removal
  | 'removed';            // Item removed from list (with reason)

type RemovalReason = 'entered-in-error' | 'duplicate' | 'replaced' | 'patient-disputed';

interface ProblemEvent {
  id: string;
  type: ProblemEventType;
  performedBy: string;         // "Paige Anderson, PA-C" or "System — CCDA Import"
  performedAt: string;         // When this event was RECORDED (ISO or display format)
  effectiveDate?: string;      // When this event ACTUALLY happened (for backdated entries)
  note?: string;               // Optional annotation on this event
  removalReason?: RemovalReason; // Only for type: 'removed'. Default: 'entered-in-error'
  changes?: {                  // For edits — what changed
    field: string;
    from: string;
    to: string;
  }[];
}
```

**`performedAt` vs `effectiveDate`:** Most events only need `performedAt` (recorded now, happened now). `effectiveDate` is used when documenting past events (e.g., backdating an onset date, recording a recurrence that was noticed last week). The source pill on the card uses `effectiveDate` when present, otherwise `performedAt`.

### 4.3 Screening Types

```typescript
interface ScreeningInstrument {
  id: string;
  name: string;               // "PRAPARE Screening"
  abbreviation: string;       // "PRAPARE"
  administeredDate: string;
  administeredBy: string;
  score?: string;             // "4/10"
  interpretation?: string;    // "Moderate risk"
}
```

### 4.4 Status Model

Seven statuses across all categories. The same internal statuses are used everywhere; only action button labels vary by category (see §5.3).

| Status | Description | Applies To |
|--------|-------------|-----------|
| `unconfirmed` | Awaiting provider review | All 4 categories |
| `confirmed` | Provider verified, not yet marked active/inactive | All 4 (transitional state) |
| `active` | Currently active clinical issue | All 4 |
| `inactive` | No longer active but may recur (soft deactivation) | All 4 |
| `resolved` | Definitively resolved, no longer relevant (hard close) | All 4 |
| `excluded` | Determined not relevant/applicable | All 4 |
| `recurrence` | Previously resolved, now active again | Conditions + Encounter Dx only |

**Status pill display labels are unified** — the same label is used regardless of category (e.g., "Active" not "Ongoing", "Inactive" not "Addressed"). Category-specific vocabulary is expressed through **action button labels** instead (§5.3).

**Status representation:** Statuses map to two fields working together:

| Display Status | `verificationStatus` | `clinicalStatus` |
|---------------|---------------------|------------------|
| Unconfirmed | `unconfirmed` | `active` (default) |
| Confirmed | `confirmed` | `active` (default) |
| Active | `confirmed` | `active` |
| Inactive | `confirmed` | `inactive` |
| Resolved | `confirmed` | `resolved` |
| Excluded | `excluded` | (unchanged) |
| Recurrence | `confirmed` | `recurrence` |

> **Note on Confirmed vs Active:** "Confirmed" is the transitional state immediately after confirming an unconfirmed item. The card shows both "Mark Active" and "Mark Inactive" to let the provider explicitly set clinical status. Once set, the card moves to "Active" or "Inactive" state and shows only the opposite toggle. In practice, confirming often implies active, but the explicit choice prevents assumptions.

### 4.5 Recurrence Model — One Card, Many Episodes

A problem that recurs over time is represented as **one card** with multiple events in its activity history. The card always displays the **current/latest state**.

When a condition recurs:
1. A `recurrence` event is added to the item's `history[]`
2. `clinicalStatus` changes to `'recurrence'`
3. The source pill shows `Recurrence [DATE]` (the recurrence date)

**Example: Low Back Pain through time**
```
Card: "Chronic Low Back Pain"
Current: Active (Recurrence 02/01/26)
Pills: [Recurrence] [M54.5] [Recurrence 02/01/26]

Activity (in detail drawer):
  Recurrence noted by Dr. Kim, MD — 02/01/26, 2:30p PT
  Marked inactive by Paige Anderson, PA-C — 08/15/25, 9:15a PT
  Marked active by Paige Anderson, PA-C — 03/01/25, 10:01a PT
  Confirmed by Paige Anderson, PA-C — 01/02/25, 10:00a PT
  Reported via CCDA Import — 01/02/25, 9:45a PT
```

Recurrence is only applicable to **Conditions** and **Encounter Dx**. Health Concerns use "Reopen" and SDOH uses "Reopen" to reactivate.

### 4.6 Edit Constraints

Because Conditions, Encounter Dx, and SDOH items come from **controlled vocabularies** (ICD-10, Z-codes, standardized screening instruments), their descriptions and codes are not free-text editable.

| Field | Conditions | Encounter Dx | SDOH | Health Concerns |
|-------|-----------|-------------|------|----------------|
| **Description** | 🔒 Locked | 🔒 Locked | 🔒 Locked | ✏️ Editable |
| **ICD code** | 🔒 Locked | 🔒 Locked | 🔒 Locked | N/A |
| **Onset / effective date** | ✏️ Editable | ✏️ Editable | ✏️ Editable | ✏️ Editable |
| **Notes** | ✏️ Editable | ✏️ Editable | ✏️ Editable | ✏️ Editable |
| **Status** | Via action buttons | Via action buttons | Via action buttons | Via action buttons |

**Wrong code?** The correct workflow is: Remove the incorrect item → Add the correct one from the controlled list. See §5.8 for future split/merge considerations.

### 4.7 Mock Data (~15 items)

**Conditions (6):**
| Description | ICD-10 | Verification | Clinical | Source |
|-------------|--------|-------------|----------|--------|
| Type 2 Diabetes Mellitus | E11.9 | Confirmed | Active | Diagnosed 03/15/22 |
| Essential Hypertension | I10 | Confirmed | Active | Diagnosed 01/08/20 |
| Chronic Low Back Pain | M54.5 | Unconfirmed | Active | Reported 11/20/25 |
| Asthma, Mild Persistent | J45.30 | Confirmed | Inactive | Diagnosed 06/02/18 |
| Hypothyroidism, Unspecified | E03.9 | Confirmed | Active | Imported 09/14/24 |
| Obesity, BMI 30-34.9 | E66.01 | Unconfirmed | Active | Reported 02/28/26 |

**Encounter Dx (3):**
| Description | ICD-10 | Verification | Clinical | Source |
|-------------|--------|-------------|----------|--------|
| Acute Sinusitis, Unspecified | J01.90 | Confirmed | Active | Diagnosed 03/09/26 |
| Urinary Tract Infection | N39.0 | Confirmed | Active | Diagnosed 01/15/26 |
| Vitamin D Deficiency | E55.9 | Unconfirmed | Active | Reported 03/09/26 |

**SDOH (3):**
| Description | ICD-10 | Verification | Clinical | Source |
|-------------|--------|-------------|----------|--------|
| Food Insecurity | Z59.48 | Unconfirmed | Active | Screened 02/10/26 |
| Transportation Insecurity | Z59.82 | Confirmed | Active | Screened 02/10/26 |
| Financial Strain | Z59.86 | Unconfirmed | Active | Screened 02/10/26 |

**Health Concerns (3):**
| Description | ICD-10 | Verification | Clinical | Source |
|-------------|--------|-------------|----------|--------|
| Weight Management Goal | — | Confirmed | Active | Reported 01/05/26 |
| Smoking Cessation | — | Unconfirmed | Active | Reported 12/12/25 |
| Anxiety | — | Confirmed | Inactive | Reported 08/20/24 |

Each item includes 2-5 mock `ProblemEvent` entries in its `history[]` to populate the activity log in the detail drawer.

**Screening Instruments (for SDOH banner):**
| Name | Abbreviation | Administered | Score |
|------|-------------|-------------|-------|
| AHC HRSN Screening Tool | AHC HRSN | 02/10/26 | 3 needs identified |
| PRAPARE | PRAPARE | 02/10/26 | 4/10 Moderate risk |

## 5 Interaction Design

### 5.1 Filter Bar

Row of TogglePill components at top of content area. Sticky on scroll.

| Filter | Behavior | Count Logic |
|--------|----------|-------------|
| All | Shows all items (deselects other filters) | — |
| Unconfirmed | Items where verificationStatus = 'unconfirmed' | Dynamic |
| Active | Items where clinicalStatus = 'active' OR 'recurrence' | Dynamic |
| Inactive | Items where clinicalStatus = 'inactive' | Dynamic |
| Resolved | Items where clinicalStatus = 'resolved' | Dynamic |
| Confirmed | Items where verificationStatus = 'confirmed' | Dynamic |
| Excluded | Items where verificationStatus = 'excluded' | Dynamic |

- Multiple filters can be active simultaneously
- Counts update dynamically as actions change item states
- Active pill: teal fill (`bg.input.low` / `#c9e6f0`), count in `fg.input.secondary` (`#376c89`)
- Inactive pill: bordered outline (`rgba(0,0,0,0.12)`)

### 5.2 Sections

Four sections rendered in order:

1. **Conditions** — section header + "Add" button + collapse chevron
2. **Encounter Dx** — section header + "Automatically imported" label + info chevron
3. **Social Determinants** — section header + "Add" button + collapse chevron + **screening banner** (see §5.7)
4. **Health Concerns** — section header + "Add" button + collapse chevron

Sections are collapsible (chevron toggles). All expanded by default.

Items within each section are filtered by the active filter pills. If a section has zero visible items after filtering, it still shows the header with "(0)" or empty state text.

### 5.3 Card Actions

Actions vary by item state AND category. Buttons are small pill-shaped (transparent variant, 12px semibold). **Max 2 action buttons per card** (plus the → chevron).

**State → Action matrix:**

| State | Actions (all categories) | Button count |
|-------|------------------------|:---:|
| Unconfirmed | Exclude · Confirm · → | 2 |
| Confirmed (transitional) | {Soft Close} · Mark Active · → | 2 |
| Active | {Soft Close} · Mark Resolved · → | 2 |
| Active + Recurrence | {Soft Close} · Mark Resolved · → | 2 |
| Inactive | {Reactivate} · → | 1 |
| Resolved | {Reactivate} · → | 1 |
| Excluded | Undo Exclude · → | 1 |

**Category-aware action labels** (replace `{Soft Close}` and `{Reactivate}` above):

| Placeholder | Conditions / Enc Dx | SDOH | Health Concerns |
|-------------|--------------------|----- |----------------|
| `{Soft Close}` | Mark Inactive | Mark Addressed | Mark Inactive |
| `Mark Resolved` | Mark Resolved | Mark Resolved | Mark Resolved |
| `{Reactivate}` (from inactive) | Mark Active | Reopen | Reopen |
| `{Reactivate}` (from resolved) | Mark Active | Reopen | Reopen |
| `{Reactivate}` (from confirmed) | Mark Active | Mark Active | Mark Active |

> **Inactive vs Resolved:** "Inactive" = condition paused but may recur (e.g., seasonal asthma in remission). "Resolved" = definitively over, no longer clinically relevant (e.g., acute sinusitis cured). Both set `abatementDate`; only the `clinicalStatus` value differs. This maps to FHIR R4 Condition.clinicalStatus values `inactive` and `resolved`.

**Action behaviors:**

| Action | State Change | Activity Event |
|--------|-------------|----------------|
| **Confirm** | `verificationStatus → 'confirmed'` | `confirmed` |
| **Exclude** | `verificationStatus → 'excluded'` | `excluded` |
| **Undo Exclude** | `verificationStatus → 'unconfirmed'` | `undo-excluded` |
| **Mark Active** | `clinicalStatus → 'active'`, clear `abatementDate` | `marked-active` |
| **Mark Inactive** | `clinicalStatus → 'inactive'`, set `abatementDate` to today | `marked-inactive` |
| **Mark Addressed** | `clinicalStatus → 'inactive'`, set `abatementDate` to today | `marked-addressed` |
| **Mark Resolved** | `clinicalStatus → 'resolved'`, set `abatementDate` to today | `marked-resolved` |
| **Reopen** | `clinicalStatus → 'active'`, clear `abatementDate` | `reopened` |

> **`abatementDate` lifecycle:** Set automatically when deactivating (inactive or resolved). Cleared automatically when reactivating (Mark Active, Reopen). Editable via detail drawer edit mode for backdating.

All actions:
1. Update state in place
2. Append a `ProblemEvent` to the item's `history[]`
3. Card re-renders with new pills and action buttons
4. Filter counts update
5. Show a brief toast confirmation

### 5.4 Card Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Condition description text                    [Action] [Action] │
│ [Status Pill] [ICD Code] [Source · Date]                    [→] │
└─────────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Description:** 14px Inter Medium, `#181818`
- **Status pill:** Unconfirmed = attention variant (`#f3e197` bg, `#523f25` text). All other statuses = transparent variant.
- **ICD code pill:** transparent variant. Shown for Conditions, Encounter Dx, and SDOH (Z-codes). Hidden for Health Concerns.
- **Source + date pill:** transparent variant, source label in regular weight, date in medium weight
- **Action buttons:** transparent background (`rgba(0,0,0,0.12)`), full-round, 12px semibold
- **Chevron:** right arrow icon, opens detail drawer
- **Long descriptions:** truncate with ellipsis on card, full text shown in detail drawer

**Source pill label logic** — the source label changes based on current state:

| Current State | Source Pill Label |
|---------------|------------------|
| Unconfirmed | `Reported [DATE]` or `Screened [DATE]` (initial source) |
| Confirmed (transitional) | `Diagnosed [DATE]` (confirmation date) |
| Active | `Onset [DATE]` (when first made active, or effectiveDate) |
| Active + Recurrence | `Recurrence [DATE]` (latest recurrence date) |
| Inactive | Preserves last relevant label (e.g., `Onset [DATE]`) |
| Resolved | `Resolved [DATE]` (abatementDate) |
| Excluded | `Reported [DATE]` (reverts to original source) |

For items with old dates (>1 year ago), display year only: `Onset 2022` instead of `Onset 03/15/22`.

### 5.5 Detail Drawer

Side drawer sliding in from right. Contains a summary card (matching the list card) and an activity history log.

**Structure:**

```
┌─ Header ──────────────────────────────────────────┐
│ [←]  {Category Title}                        [×] │
├───────────────────────────────────────────────────┤
│ ┌─ Summary Card ──────────────────────────────┐  │
│ │ {Description}                        [Edit] │  │
│ │ [{Status}] [{ICD}?] [{Source DATE}]         │  │
│ │                                              │  │
│ │ [{Primary Action}]                           │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌─ Related Screening (SDOH only) ─────────────┐  │  ← conditional
│ │ 📋 {Screening Name}                         │  │
│ │ Score: {score} · {interpretation}            │  │
│ │                         [View Full Results]  │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Activity                                           │
│ ─────────────────────────────────────────────────  │
│ {Event description by Actor}           {timestamp} │
│ ─────────────────────────────────────────────────  │
│ {Event description by Actor}           {timestamp} │
│ ─────────────────────────────────────────────────  │
│ ... (scrollable, newest first)                     │
│                                                    │
│                                                    │
│ [⋯ More Options]         ← kebab menu, see §5.8   │
│                                                    │
│ ┌─ Footer ───────────────────────────────────────┐│
│ │ [🚫 Remove]                                    ││
│ └────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────┘
```

**Drawer header title** varies by category:

| Category | Drawer Title |
|----------|-------------|
| Conditions | Condition Details |
| Encounter Dx | Encounter Diagnosis Details |
| SDOH | Social Determinant Details |
| Health Concerns | Patient Concern Details |

**Header navigation:**
- **← back:** navigates back if drawers are stacked (e.g., returning from screening detail). Hidden if this is the first drawer.
- **× close:** closes all drawers, returns to list view.

**Summary card** reuses the ProblemCard component in a `mode: 'detail'` variant:
- Shows the same pills and action buttons as the list card
- Adds an **Edit** button (top right) — see §5.6
- Actions work from the drawer (same behavior as on the list card)

**Related Screening** (SDOH only, conditional):
- Shown when the SDOH item has a `relatedScreeningId`
- Compact card showing screening name, score, interpretation
- "View Full Results" button: v1 → toast "Screening details — coming soon"
- Hidden for manually-added SDOH items

**Activity section:**
- Chronological list, newest first
- Each row: event description (left) + timestamp (right)
- Rows separated by thin horizontal dividers
- Event descriptions: "{Action} by {Name, Credential}" or "{Action}" for system events
- Timestamps: "MM/DD/YY, HH:MMa PT"
- For items with 10+ events, consider showing "N earlier events" collapsed at bottom

**Footer:**
- Red "Remove" button with prohibition icon
- Click → confirmation dialog with reason picker:

```
┌─ Remove Confirmation ─────────────────────────────┐
│ Remove "{description}" from problem list?          │
│                                                     │
│ Reason:                                            │
│ ○ Entered in Error  (default, pre-selected)        │
│ ○ Duplicate                                        │
│ ○ Replaced                                         │
│ ○ Patient Disputed                                 │
│                                                     │
│                        [Cancel]  [Remove]          │
└────────────────────────────────────────────────────┘
```

- On confirm → creates a `removed` event with the selected `removalReason`, hides item from list, closes drawer
- Toast: "Removed: {description}"
- **For v1:** Simple inline radio group in a confirmation overlay. "Entered in Error" pre-selected.

### 5.6 Edit Mode

The Edit button in the detail drawer summary card opens inline editing for editable fields only.

**Conditions / Encounter Dx / SDOH edit mode:**

```
┌─ Edit Mode ──────────────────────────────────────┐
│ [Cancel]  Edit {Category}                 [Save] │
├──────────────────────────────────────────────────┤
│ Glaucoma associated with anomalies of iris       │  ← display only
│ H40.50X0+                                        │  ← display only
│                                                    │
│ Onset Date                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ 01/02/25                                     │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ Notes                                             │
│ ┌──────────────────────────────────────────────┐ │
│ │ Patient reports symptoms worsening since...  │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Health Concerns edit mode** — adds editable description:

```
┌─ Edit Mode ──────────────────────────────────────┐
│ [Cancel]  Edit Patient Concern            [Save] │
├──────────────────────────────────────────────────┤
│ Description                                       │
│ ┌──────────────────────────────────────────────┐ │
│ │ Anxiety                                      │ │  ← editable
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ Reported Date                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ 08/20/24                                     │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ Notes                                             │
│ ┌──────────────────────────────────────────────┐ │
│ │ [Optional annotation]                        │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Save behavior:** Creates an `edited` event in history with `changes[]` showing what was modified. Toast: "Changes saved." Returns to detail view.

**For v1:** Edit mode renders simple text inputs. No date picker widget — plain text field for dates. Save generates the activity event and updates the item.

### 5.7 SDOH Screening Banner

Replaces the previous screening instrument gallery/preview cards. Lives at the top of the SDOH section, above the SDOH problem cards.

```
┌─ Screening Banner ──────────────────────────────────────┐
│ 📋 2 screenings administered · Last: AHC HRSN 02/10/26 │
│                                              [View All] │
└─────────────────────────────────────────────────────────┘
```

**Design:**
- Compact single-line banner with subtle background
- Left: clipboard icon + summary text (count + most recent screening name and date)
- Right: "View All" link/button
- "View All" → v1: toast "Screening History — coming soon"
- When no screenings: "No screenings administered" with "Administer Screening" action (→ toast)

**Rationale:** Separates screening administration (the banner) from screening-linked SDOH conditions (the cards). Detail-level screening results live in each SDOH item's detail drawer (§5.5 Related Screening section) rather than as standalone preview cards.

### 5.8 Split / Merge (Future — Placeholder in v1)

Because descriptions and codes are locked to controlled vocabularies (§4.6), correcting a misclassified problem requires removing and re-adding. Future versions will support split and merge operations.

**Where it lives:** A kebab menu (⋯) in the detail drawer footer area, next to the Remove button.

```
┌─ Detail Drawer Footer Area ──────────────────────┐
│                                                    │
│ [⋯]                              [🚫 Remove]     │
│                                                    │
│ Kebab menu expands to:                            │
│ ┌──────────────────────┐                          │
│ │ Merge with...    🔒  │  ← disabled, "Coming soon" │
│ │ Split record     🔒  │  ← disabled, "Coming soon" │
│ └──────────────────────┘                          │
└───────────────────────────────────────────────────┘
```

**For v1:** Kebab menu renders with two disabled items. Clicking either shows a toast: "Merge/Split — coming in a future release."

**Future merge concept:** Select two cards representing the same problem → pick which to keep → combine activity histories → remove the merged record.

**Future split concept:** Select a card → create a new record from the controlled list → both records inherit the original's activity history (with a "Split from [original]" event).

### 5.9 Add/Search Flow

Section "Add" buttons show a placeholder interaction:
- Click → Toast: "Search powered by CMS ICD-10-CM in production"
- Or: Open a SearchInput in-place that does nothing on submit

Not a real search — the PRD's search leverages existing prod functionality.

## 6 Visual Design

### 6.1 Colors (from Figma design context)

| Element | Token / Value |
|---------|--------------|
| Page background | `--color-bg-neutral-subtle` (#f1f1f1) |
| Card background | white, rounded 16px |
| Unconfirmed pill bg | `--color-bg-attention-low` (#f3e197) |
| Unconfirmed pill text | `--color-fg-attention-primary` (#523f25) |
| Neutral pill bg | `--color-bg-transparent-low` (rgba(0,0,0,0.12)) |
| Neutral pill text | `--color-fg-neutral-primary` (#181818) |
| Action button bg | `--bg-transparent-low` (rgba(0,0,0,0.12)) |
| Active filter pill bg | `--bg-input-low` (#c9e6f0) |
| Active filter count | `--fg-input-secondary` (#376c89) |
| Section header text | `--color-fg-neutral-secondary` (#424242), 16px semibold |
| Drawer background | `--color-bg-neutral-subtle`, rounded-tl/bl 24px |
| Remove button | `--color-bg-alert-high` bg, white text |
| Screening banner bg | `--color-bg-neutral-low` or subtle card variant |

### 6.2 Typography

| Element | Spec |
|---------|------|
| Drawer/page title | Heading XL: Inter 20px Semibold |
| Section header | 16px Inter Semibold |
| Card description | 14px Inter Medium |
| Pill text | 12px Inter Medium |
| Source label in pill | 12px Inter Regular |
| Action button text | 12px Inter Semibold |
| Activity event text | 14px Inter Regular |
| Activity timestamp | 12px Inter Regular, `--color-fg-neutral-secondary` |
| Screening banner text | 14px Inter Medium |

### 6.3 Spacing

| Element | Value |
|---------|-------|
| Content padding | 20px horizontal |
| Section gap | 24px |
| Card internal padding | 16px horizontal, 12px vertical |
| Pill gap | 6px |
| Pill internal padding | 6px horizontal, 2px vertical |
| Filter bar gap | 6px |
| Card gap within section | 8px |
| Activity row padding | 12px vertical |
| Drawer content padding | 20px |
| Screening banner padding | 12px 16px |

## 7 Dual Display Mode

The ProblemsListView component renders identically whether placed in:
1. **Tab content area** (main screen) — no header, full width of right pane
2. **Side drawer** (SlideDrawer overlay) — has drawer header with title + close button

The component accepts a `mode: 'tab' | 'drawer'` prop. In 'drawer' mode, the parent wraps it with a drawer header. The content inside is identical.

For this prototype, tab view is the primary surface. Drawer mode is available but secondary.

## 8 Edge Cases & Stress Cases

### Card Display

| Scenario | Behavior |
|----------|----------|
| Very long condition name (60+ chars) | Truncate with ellipsis on card. Full text in detail drawer. |
| No ICD code (Health Concerns, some unconfirmed) | Omit ICD pill. Card renders: description + status + source. |
| Very old onset date (>1 year) | Show year only: `Onset 2022` |
| Same-day multiple status changes | Activity log shows all. Card shows latest state. |
| Empty section (all items filtered out) | Section header stays visible with "(0)" count |
| Section with 20+ items | Scrollable within section. Future: "Show more" pagination. |

### Activity / History

| Scenario | Behavior |
|----------|----------|
| Brand new item (just added) | Activity has one entry: "Added by [Provider]". |
| 20+ activity events | Scrollable log. Consider collapsed "N earlier events" at bottom. |
| System-generated events | `performedBy: 'System — CCDA Import'` or `'System — Screening'` |
| Multiple providers editing | Each event shows its own provider. No conflict resolution in v1. |
| Edit that changes onset date | Activity: "Onset date changed from 01/02/25 to 12/15/24 by [Provider]" |

### Recurrence

| Scenario | Behavior |
|----------|----------|
| 5+ recurrences (chronic condition) | Single card. Full history in activity log. Card shows latest state. |
| Excluded item re-imported via CCDA | v1: creates new card. Future: prompt to link/merge. |
| Category change (Health Concern → Condition) | v1: manual (add new Condition, resolve Health Concern). Future: "Convert to Condition" action. |
| Problem active 10+ years | Onset pill shows year only. Activity may only have recent events. |

### SDOH / Screening

| Scenario | Behavior |
|----------|----------|
| SDOH added manually (no screening) | "Related Screening" section hidden in detail drawer. Source: "Added [DATE]". |
| Screening generates 3 SDOH items | Each links to same screening in detail. Banner counts unique screenings. |
| No screenings administered | Banner: "No screenings administered" with "Administer Screening" (→ toast). |

## 9 Scope & Non-Goals

**In scope (v1):**
- Static patient shell matching Carby OS patient view
- All 4 problem sections with realistic mock data
- Interactive filter pills with dynamic counts
- 7 status states (unconfirmed, confirmed, active, inactive, resolved, excluded, recurrence) with category-aware action labels
- Undo Exclude action on excluded cards
- Recurrence state for Conditions/Encounter Dx
- Activity history (ProblemEvent log) per item
- Detail drawer with summary card + activity log
- Edit mode (dates + notes; description for Health Concerns only)
- SDOH screening banner (compact summary, "View All" → toast)
- Related Screening card in SDOH detail drawer
- Split/Merge placeholder (disabled kebab menu items)
- Collapsible sections
- Remove action in detail drawer with reason picker (entered-in-error, duplicate, replaced, patient-disputed)
- `abatementDate` auto-set on deactivation, auto-cleared on reactivation

**Out of scope / deferred:**
- Screening History view (behind "View All" — future)
- Full split/merge functionality
- Real search / ICD-10 lookup
- Drag-and-drop reordering
- CCDA import reconciliation view
- Permissions model (all actions available to all users in demo)
- Attachment support (documents/images in drawer)
- Timeline visualization for recurrences
- Duplicate detection / merge suggestions
- Responsive/mobile layout
- Dark mode
- Backend / Supabase integration
- FHIR compliance
