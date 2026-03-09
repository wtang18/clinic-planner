# Problems List Prototype — Design Specification

> **Status:** Active Design
> **Last Updated:** 2026-03-09
> **Author:** Will Tang
> **PRD Reference:** `apps/carby-os/problems-list/reference/Patient Problem List PRD.md`
> **Figma:** Wm3cfzJvKzITMVvkxpX9mQ (node 12953:13268 — drawer view)
> **Purpose:** Internal stakeholder review prototype

---

## 1 Overview

A demo-ready prototype of the structured patient problem list feature for Carby OS. Renders all four clinical record types from the PRD (Conditions, Encounter Diagnoses, SDOH, Health Concerns) in a unified scrollable view with filter controls and inline actions.

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
│   │       ├── ScreeningInstruments.tsx # SDOH screening tool cards
│   │       ├── ProblemDetailDrawer.tsx # Side drawer for item detail (Phase 2)
│   │       ├── types.ts               # ProblemItem, enums
│   │       ├── mock-data.ts           # ~15 realistic items
│   │       └── hooks/
│   │           └── useProblemsState.ts # Filter + action state management
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
- **Card** — problem item container
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

Realistic patient profile (not "test Test"):
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

## 4 Problems List — Data Model

### 4.1 Types

```typescript
type ProblemCategory = 'condition' | 'encounter-dx' | 'sdoh' | 'health-concern';

type VerificationStatus = 'unconfirmed' | 'confirmed' | 'excluded' | 'entered-in-error';

type ClinicalStatus = 'active' | 'inactive' | 'recurrence' | 'resolved';

type ProblemSource = 'reported' | 'diagnosed' | 'screened' | 'imported';

type Severity = 'mild' | 'moderate' | 'severe';

interface ProblemItem {
  id: string;
  category: ProblemCategory;
  description: string;
  icdCode: string | null;
  snomedCode: string | null;
  verificationStatus: VerificationStatus;
  clinicalStatus: ClinicalStatus;
  source: ProblemSource;
  sourceDate: string;           // Display format: "MM/DD/YY"
  severity?: Severity;
  onsetDate?: string;
  resolvedDate?: string;
}

interface ScreeningInstrument {
  id: string;
  name: string;
  abbreviation: string;
}
```

### 4.2 Mock Data (~15 items)

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
| Anxiety | — | Confirmed | Resolved | Reported 08/20/24 |

**Screening Instruments:**
- AHC HRSN Screening Tool
- PRAPARE
- (+2 More placeholder)

## 5 Problems List — Interaction Design

### 5.1 Filter Bar

Row of TogglePill components at top of content area. Sticky on scroll.

| Filter | Behavior | Count Logic |
|--------|----------|-------------|
| All | Shows all items (deselects other filters) | — |
| Unconfirmed | Items where verificationStatus = 'unconfirmed' | Dynamic |
| Active | Items where clinicalStatus = 'active' | Dynamic |
| Inactive | Items where clinicalStatus = 'inactive' OR 'resolved' | Dynamic |
| Confirmed | Items where verificationStatus = 'confirmed' | Dynamic |
| Excluded | Items where verificationStatus = 'excluded' | Dynamic |

- Multiple filters can be active simultaneously (matching Figma where Unconfirmed + Active + Confirmed are all selected)
- Counts update dynamically as actions change item states
- Active pill: teal fill (`bg.input.low` / `#c9e6f0`), count in `fg.input.secondary` (`#376c89`)
- Inactive pill: bordered outline (`rgba(0,0,0,0.12)`)

### 5.2 Sections

Four sections rendered in order:
1. **Conditions** — section header + "Add" button + collapse chevron
2. **Encounter Dx** — section header + "Automatically imported" label + info chevron
3. **Social Determinants** — section header + "Administer Screening" + "Add" buttons + collapse chevron + screening instrument cards
4. **Health Concerns** — section header + "Add" button + collapse chevron

Sections are collapsible (chevron toggles). All expanded by default.

Items within each section are filtered by the active filter pills. If a section has zero visible items after filtering, it still shows the header (with "(0)" or empty state).

### 5.3 Card Actions

Actions vary by item state. Buttons are small pill-shaped (transparent variant, 12px semibold).

| Item State | Available Actions |
|------------|-------------------|
| Unconfirmed (any category) | Exclude · Confirm · → (detail) |
| Confirmed + Active | Mark Inactive · Mark Active · → (detail) |
| Confirmed + Inactive | Mark Active · → (detail) |
| Excluded | → (detail) only |
| Health Concern — Resolved | Reopen · → (detail) |
| SDOH — Confirmed + Active | Update · Mark Addressed · → (detail) |

**Action behaviors:**
- **Confirm** → `verificationStatus: 'confirmed'`, `clinicalStatus: 'active'`
- **Exclude** → `verificationStatus: 'excluded'`
- **Mark Inactive** → `clinicalStatus: 'inactive'`
- **Mark Active** → `clinicalStatus: 'active'`
- **Reopen** → `clinicalStatus: 'active'`
- **Mark Addressed** → `clinicalStatus: 'resolved'`
- **Update** → placeholder (toast: "Update flow not yet implemented")

All actions update state in place. Card re-renders with new pills and action buttons. Filter counts update.

### 5.4 Card Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Condition description text                    [Action] [Action] │
│ [Status Pill] [ICD Code] [Source · Date]                    [→] │
└─────────────────────────────────────────────────────────────────┘
```

- **Description:** 14px Inter Medium, `#181818`
- **Status pill:** Unconfirmed = attention variant (`#f3e197` bg, `#523f25` text). Others = transparent.
- **ICD code pill:** transparent variant, monospace-ish
- **Source + date pill:** transparent variant, source in regular weight, date in medium weight
- **Action buttons:** transparent background (`rgba(0,0,0,0.12)`), full-round, 12px semibold
- **Chevron:** right arrow icon, opens detail drawer

### 5.5 Detail Drawer (Phase 2)

Side drawer sliding in from right. Will be designed from separate Figma node (user has this ready).

For Phase 1: chevron click shows a toast "Detail view — coming in Phase 2" or a minimal placeholder drawer.

### 5.6 Add/Search Flow

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

### 6.2 Typography

| Element | Spec |
|---------|------|
| Drawer/page title | Heading XL: Inter 20px Semibold |
| Section header | 16px Inter Semibold |
| Card description | 14px Inter Medium |
| Pill text | 12px Inter Medium |
| Source label in pill | 12px Inter Regular |
| Action button text | 12px Inter Semibold |

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

## 7 Dual Display Mode

The ProblemsListView component renders identically whether placed in:
1. **Tab content area** (main screen) — no header, full width of right pane
2. **Side drawer** (SlideDrawer overlay) — has drawer header with title + close button

The component accepts a `mode: 'tab' | 'drawer'` prop. In 'drawer' mode, the parent wraps it with a drawer header. The content inside is identical.

For this prototype, tab view is the primary surface. Drawer mode is available but secondary.

## 8 Scope & Non-Goals

**In scope:**
- Static patient shell matching Carby OS patient view
- All 4 problem sections with realistic mock data
- Interactive filter pills with dynamic counts
- Card actions that update state (Confirm, Exclude, Mark Active/Inactive, etc.)
- SDOH screening instrument cards
- Collapsible sections

**Out of scope / deferred:**
- Detail drawer (Phase 2 — pending Figma)
- Real search / ICD-10 lookup
- Drag-and-drop reordering
- CCDA import reconciliation view
- Permissions model (all actions available to all users in demo)
- Responsive/mobile layout
- Dark mode
- Backend / Supabase integration
- FHIR compliance
