# All-Patients View — Design Specification

**Status:** Draft — pending review
**Related docs:** Population Health DESIGN-SPEC.md, PHASED-PLAN.md, PROGRESS.md
**Context:** This spec defines the canvas and center pane behavior when "All Patients" is selected in the left pane cohort navigator. It provides the highest-level population overview — the physician-architect's entry point for understanding panel state and triaging attention.

---

## Terminology

| Term | Meaning | Context |
|------|---------|---------|
| **Condition cohort** | A group of patients sharing a diagnosed condition (e.g., Diabetes, CHF, COPD). A patient may belong to multiple condition cohorts. | Left axis of Sankey, top zone |
| **Preventive cohort** | A group of patients eligible for or due for a preventive intervention (e.g., Colon Cancer Screening, Immunizations Due). Based on demographics/guidelines, not diagnosis. | Left axis of Sankey, bottom zone |
| **Risk tier** | Whole-person risk assessment accounting for conditions, social determinants, utilization history, and behavioral factors. Each patient has exactly one risk tier. | Center axis of Sankey |
| **Action status** | Current operational state — what needs to happen for this patient right now, across all their care flow enrollments. Each patient has exactly one action status. | Right axis of Sankey |
| **Dimension** | Any selectable category within the Sankey (a condition, a risk tier, an action status). Dimensions are listed in the center pane for selection and filtering. | Center pane dimension list |

---

## 1. Relationship to Cohort-Level Views

The All-Patients view is the **panel-level scope** within population health mode. It sits above category and cohort scopes in the navigation hierarchy:

| Scope | Left Pane Selection | Center Pane Content | Canvas Content |
|-------|--------------------|--------------------|----------------|
| **All Patients** | "All Patients" selected | Dynamic stats module + dimension list | Sankey map / Attention pipeline / Table |
| **Category** | Category header selected (e.g., "Chronic Disease") | Category overview (future spec) | Category overview (future spec) |
| **Cohort** | Specific cohort selected (e.g., "Diabetes") | Dashboard + care flow layer tree | Flow View / Table View |

The All-Patients view answers: "Across my entire panel, what's the clinical makeup, risk distribution, and operational status — and where should I focus?"

---

## 2. Design Principles

These extend the population health design principles (see main DESIGN-SPEC.md §1.2) to the All-Patients scope:

1. **Conditions → Risk → Action is the narrative.** The three-axis Sankey reads left-to-right as a clinical-to-operational pipeline. Left axis = what patients have. Center axis = how risky they are holistically. Right axis = what needs to happen now.

2. **Center pane controls canvas at every scope.** Just as the care flow layer tree drives the flow canvas at cohort level, the dimension list drives the Sankey at All-Patients level. Same architectural pattern, different content.

3. **Dynamic stats respond to selection.** The center pane stats module is contextually responsive to whatever is selected in the dimension list below it. Default shows panel-level metrics. Selecting dimensions narrows to the selected subpopulation. Consistent with cohort-level behavior where stats respond to layer tree selection.

4. **Scope-filter, don't navigate.** Clicking Sankey bands or dimension list items filters the current view — it does not navigate to a different scope. Explicit drill-down affordances (in the stats module or modal) are the only navigation triggers. Consistent with "selection, not navigation" principle.

---

## 3. Canvas Pane — View Switcher

### 3.1 Structure

The canvas top bar contains a segmented control with three views:

```
┌──────────────────────────────────────────────────┐
│  ◉ Map  │  ▤ Pipeline  │  ▦ Table    [⊞] [≡] Q │
└──────────────────────────────────────────────────┘
```

- **Map** — Three-axis Sankey visualization (this spec, fully built)
- **Pipeline** — Attention pipeline grouped by urgency (placeholder with note in v1)
- **Table** — Patient data grid with all-patients columns (placeholder with note in v1)

The filter button [≡] and search [Q] are shared across all three views. Active filters (from center pane dimension selections) persist across view switches.

### 3.2 Placeholder behavior (Pipeline + Table)

When Pipeline or Table view is selected, the canvas shows:

```
┌─────────────────────────────────────────────────┐
│                                                   │
│              [icon: pipeline/table]                │
│                                                   │
│         Attention Pipeline view                    │
│         Coming soon                                │
│                                                   │
│   This view will show patients grouped by          │
│   attention urgency — Urgent, Action Needed,       │
│   Monitoring, All Current, and Not Enrolled.       │
│                                                   │
│   Center pane dimension selections will filter     │
│   this view identically to Map view.               │
│                                                   │
└─────────────────────────────────────────────────┘
```

Similar placeholder for Table view. The view switcher tabs are fully functional (switching works, active state renders correctly). Only the canvas content is placeholder.

---

## 4. Canvas Pane — Map View (Three-Axis Sankey)

### 4.1 Axis definitions

The Sankey visualization has three vertical axes arranged left to right:

**Left Axis — Clinical Cohorts (over-counts panel)**

Two visual zones separated by a subtle horizontal divider:

| Zone | Content | Examples |
|------|---------|----------|
| **Conditions** (top) | Diagnosed conditions. A patient with multiple conditions appears in multiple bands. | Diabetes, CHF, Hypertension, COPD, CKD |
| **Preventive** (bottom) | Guideline-driven screening/prevention populations. A patient eligible for multiple screenings appears in multiple bands. | Colon Cancer Screening, Breast Cancer Screening, Immunizations Due |

Special bands:
- **Unknown** — Patients not yet fully assessed. May appear in either zone depending on what's unknown (unscreened vs undiagnosed).
- **Confirmed No Conditions** — Assessed patients with no active diagnoses. Appears in the Conditions zone.

The left axis total exceeds the panel size due to multi-condition and multi-screening overlap. This over-count IS the clinical story — it represents the total care burden.

Within each zone, bands are ordered by patient count (largest on top). Bands below a display threshold are grouped into an "Other" bucket with expand affordance.

Default display: top 6-8 condition bands + Other, top 3-4 preventive bands + Other. Physician can expand "Other" to see all, or use center pane visibility controls to customize.

**Center Axis — Risk Tiers (equals panel size)**

Each patient appears exactly once, in their whole-person risk tier:

| Tier | Description |
|------|-------------|
| **Critical** | Acute/unstable, active deterioration, multiple uncontrolled conditions |
| **High** | Complex multi-morbidity, social determinant risk factors, history of acute events |
| **Moderate** | Managed chronic conditions, stable but requiring ongoing monitoring |
| **Low** | Healthy or well-controlled, minimal intervention needed |
| **Unassessed** | New to panel or overdue for risk stratification |

Bands ordered top-to-bottom by severity (Critical at top). Center axis sums to exactly the panel size. This is the normalization point — the moment the physician sees their actual panel count and risk profile.

**Right Axis — Action Status (equals panel size)**

Each patient appears exactly once, in their current operational state:

| Status | Description |
|--------|-------------|
| **Urgent** | Clinical escalation, overdue critical intervention, safety concern. Action needed today/this week. |
| **Action Needed** | Exception in a care flow, follow-up due, pending task requires human decision. Action needed this week/this month. |
| **Monitoring** | In an active care flow, currently in hold/wait state, everything on schedule. System is managing. |
| **All Current** | In a care flow, all tasks complete/current. Actively managed, nothing due right now. |
| **Not Enrolled** | No active care flow. May be appropriate (healthy, low-risk) or may be a gap (at-risk, should be in a flow). |

Bands ordered top-to-bottom by urgency (Urgent at top). Right axis sums to exactly the panel size.

**Not Enrolled visual treatment:** The band renders in neutral/default style. However, flow segments that trace from High/Critical risk through to Not Enrolled receive an attention treatment (warm accent, subtle alert indicator) — surfacing the specific problem of unmanaged at-risk patients without creating false urgency for healthy unenrolled patients.

### 4.2 Flow bands (connections between axes)

**Left → Center (convergence zone):**
Bands flow from condition/preventive cohorts to risk tiers. Multi-condition patients produce overlapping bands that converge at the center axis. This zone is narrower than center → right to minimize visual crossing.

Visual treatment: semi-transparent bands so crossings blend rather than occlude. Muted color (gray or light warm tone) by default. Highlighted on dimension selection.

**Center → Right (divergence zone):**
Bands flow from risk tiers to action statuses. No overlap — each patient follows exactly one path. This zone can be wider since paths don't cross within a risk tier (though they can cross between tiers).

Visual treatment: same semi-transparent bands. The divergence pattern from a single risk tier shows how that tier's patients distribute across action statuses.

### 4.3 Axis labels and counts

Each band on each axis displays:
- Band label (condition name, risk tier, action status)
- Patient count

Labels positioned outside the Sankey (left of left axis, right of right axis, above/below center axis) to avoid occluding flow bands.

Panel-level summary annotations:
- Left axis footer: "X enrollments across Y conditions" (acknowledges over-count)
- Center axis header: "Panel: X patients" (normalization reference)
- Right axis footer: none needed (sums to same as center)

### 4.4 Default visual state

On first render (nothing selected in center pane):
- All three axes fully visible
- All bands rendered at default opacity
- Right-axis "Urgent" and "Action Needed" bands have subtle warm accent treatment (pre-highlight) to draw physician's eye
- Flow bands connecting to Urgent/Action Needed are slightly more prominent than other flows
- Center pane stats module shows panel-level defaults

### 4.5 Interaction model

**Hover a band:** Temporary highlight. That band's flows highlight through other axes. Non-connected flows dim. Tooltip shows count and basic stats. Hover is preview — no state change.

**Click a band (in center pane dimension list or directly on Sankey):** Locks the selection. Sankey highlights the selected band's flows. Non-connected flows dim. Center pane stats module updates to show the selected subpopulation. Selection persists until cleared.

**Multi-select (shift-click or multiple selections in dimension list):**

*Within one axis:* OR logic. Selecting "Diabetes" + "CHF" highlights patients in either condition. Stats show the union.

*Across axes:* AND logic. Selecting "Diabetes" (left) + "High Risk" (center) highlights the intersection — high-risk diabetic patients. Stats show the intersection count and breakdown.

**Click to clear:** Click a selected dimension again to deselect. Or dismiss the filter chip in the canvas top bar.

**Hover on Sankey directly:** Hovering a band on the Sankey itself behaves as preview (temporary highlight). This complements the center pane selection (which is persistent).

### 4.6 Dynamic axis visibility

Each dimension section in the center pane has an independent visibility toggle (eye icon). Toggling axis visibility reshapes the Sankey:

| Visible axes | Sankey shape | Use case |
|-------------|-------------|----------|
| All three | Full three-axis Sankey | Default: complete picture |
| Left + Right | Two-axis (conditions → action) | "What conditions drive action needs?" |
| Center + Right | Two-axis (risk → action) | "How does risk translate to workload?" |
| Left + Center | Two-axis (conditions → risk) | "What conditions drive risk?" |
| One axis only | Single-axis bar chart equivalent | Focused distribution view |

The Sankey re-renders smoothly when axes are toggled. Band heights recalculate to fill available space.

---

## 5. Center Pane — All-Patients Scope

### 5.1 Structure

The center pane at All-Patients scope has two modules:

```
┌──────────────────────────────────┐
│ PANEL OVERVIEW                   │
│ 2,312 patients                   │
│                                  │
│ 118 need attention               │
│ 35 not enrolled                  │
│ 85% enrollment rate              │
│ ↗ +3% vs last month             │
│                                  │
│ [View Details]                   │
├──────────────────────────────────┤
│ CONDITIONS                 👁 ▼  │
│   Diabetes               412     │
│   Hypertension           634     │
│   CHF                     89     │
│   COPD                   156     │
│   CKD                     78     │
│   Other (4)              112     │
│                                  │
│ PREVENTIVE               👁 ▼   │
│   Colon Cancer Screen  1,204     │
│   Breast Cancer Screen   589     │
│   Immunizations Due      345     │
│                                  │
│ RISK LEVEL               👁 ▼   │
│   Critical                45     │
│   High                   312     │
│   Moderate               867     │
│   Low                    954     │
│   Unassessed             134     │
│                                  │
│ ACTION STATUS            👁 ▼   │
│   Urgent                  23     │
│   Action Needed           95     │
│   Monitoring             847     │
│   All Current          1,312     │
│   Not Enrolled            35     │
└──────────────────────────────────┘
```

### 5.2 Dynamic stats module (top)

The stats module at the top of the center pane is always visible and contextually responsive:

**Default state (nothing selected):** Shows panel-level metrics — total patients, patients needing attention, enrollment rate, trend indicator. Provides a "View Details" affordance that opens an investigation modal.

**Filtered state (dimensions selected):** Stats recalculate to the selected subpopulation. The module header updates to show the active filter context:

```
┌──────────────────────────────────┐
│ DIABETES · HIGH RISK             │
│ 47 patients                      │
│                                  │
│ 8 need attention                 │
│ 0 not enrolled                   │
│ 100% enrollment rate             │
│                                  │
│ [View Details]  [Open Diabetes ›]│
└──────────────────────────────────┘
```

The filter context label (e.g., "Diabetes · High Risk") serves as a breadcrumb showing what's selected. Action links update contextually — "Open Diabetes" navigates to the Diabetes cohort flow view. "View Details" opens the investigation modal scoped to the selection.

When the selection narrows to a small population (< ~15 patients), the stats module could show an inline patient list preview instead of aggregate metrics, eliminating the need for the modal at that scale.

### 5.3 Dimension list (bottom)

Four sections, each with independent controls:

**Section header:** Label + eye icon (axis visibility toggle) + chevron (accordion expand/collapse).

- **Eye icon:** Controls whether this dimension group appears as an axis on the Sankey. Filled = visible. Outline = hidden. Toggling re-renders the Sankey.
- **Chevron:** Controls whether the dimension items are listed in the center pane. Collapsing a section hides the items from the list but does NOT affect Sankey axis visibility. These are independent controls.

**Dimension items:** Clickable rows with label + patient count. Click to select (highlight in Sankey, update stats). Shift-click to multi-select. Selected items have an active visual state (background highlight or left accent bar).

**"Other" buckets:** Condition and Preventive sections show top N items + an expandable "Other (X)" row. Expanding "Other" reveals the remaining items. Items within "Other" are selectable — expanding + selecting a specific low-prevalence condition is a valid exploration path.

### 5.4 Interaction flow

1. Physician opens All-Patients view. Sankey renders in default state. Stats show panel-level metrics.
2. Physician scans the Sankey. Attention bands (Urgent, Action Needed) are subtly pre-highlighted.
3. Physician clicks "Urgent" in the Action Status section of the dimension list. Sankey highlights all flows terminating at Urgent. Stats update to "23 patients — Urgent."
4. Physician shift-clicks "High Risk" in Risk Level section. Sankey narrows further: only flows from High Risk to Urgent. Stats update to "18 patients — High Risk · Urgent."
5. Stats module now shows: 18 patients, which conditions they come from, action link to drill down. "View Details" opens modal with patient list.
6. Physician clicks "View Details." Modal shows the 18 patients with names, conditions, risk factors, what action is urgent. Deep links available per patient or per condition cohort.
7. Physician clicks "Open Diabetes ›" to navigate into the Diabetes cohort flow view, pre-filtered to urgent patients.

---

## 6. Investigation Modal

### 6.1 Purpose

The modal is the intermediate depth between the stats module (compact) and full cohort navigation (deep). It provides enough detail to answer most investigatory questions without leaving the All-Patients view.

### 6.2 Content

The modal adapts to the current selection:

**Header:** Selection context label (e.g., "Diabetes · High Risk · Urgent") + patient count.

**Sections:**

1. **Patient list** — Scrollable table of matching patients. Columns: name, age/sex, risk tier, primary conditions, current care flow stage, days in current state, action needed. Sortable by any column.

2. **Distribution breakdown** — For each unselected axis, shows how the selected patients distribute. If "Diabetes + High Risk" is selected, breakdown shows action status distribution of those 47 patients. Visualized as compact horizontal bar.

3. **Key metrics** — Average time in current state, trend vs. prior period, enrollment coverage within selection.

4. **Drill-down affordances:**
   - Per-patient: "Open [Patient Name]" → navigates to patient workspace
   - Per-cohort: "Open [Cohort] Flow View" → navigates to cohort scope, filtered to selection
   - Both are explicit navigation actions (leave the All-Patients view)

### 6.3 Behavior

- Opens as a centered modal overlay (canvas dims behind)
- Scrollable content within fixed-height container
- Close via X button, click outside, or Escape
- Selection changes in the center pane (behind the modal) update the modal content live
- Deep link navigation closes the modal and navigates to the target scope

---

## 7. Data Model Additions

The following types extend the population health data model (see main DESIGN-SPEC Phase 1):

```
// Risk assessment for whole-person stratification
RiskTier: 'critical' | 'high' | 'moderate' | 'low' | 'unassessed'

// Operational action status
ActionStatus: 'urgent' | 'action-needed' | 'monitoring' | 'all-current' | 'not-enrolled'

// Condition cohort assignment (a patient can have multiple)
ConditionAssignment: {
  patientId: string
  conditionCohortId: string
  diagnosisDate?: Date
  severity?: string
}

// Preventive cohort assignment (a patient can have multiple)
PreventiveAssignment: {
  patientId: string
  preventiveCohortId: string
  eligibilityBasis: string  // e.g., "age 50+, average risk"
  lastScreeningDate?: Date
  nextDueDate?: Date
}

// Extended patient record for population health
PopHealthPatient: {
  ...existing CareFlowPatient fields
  riskTier: RiskTier
  riskScore?: number           // numeric score behind the tier
  riskFactors?: string[]       // contributing factors
  actionStatus: ActionStatus
  actionDetails?: string       // what specific action is needed
  conditionAssignments: ConditionAssignment[]
  preventiveAssignments: PreventiveAssignment[]
}

// Sankey visualization data (computed from patient records)
SankeyData: {
  leftAxis: SankeyAxisGroup[]     // conditions + preventive zones
  centerAxis: SankeyBand[]        // risk tiers
  rightAxis: SankeyBand[]         // action statuses
  flows: SankeyFlow[]             // connections between bands
}

SankeyAxisGroup: {
  zone: 'conditions' | 'preventive'
  bands: SankeyBand[]
}

SankeyBand: {
  id: string
  label: string
  count: number
  metadata?: Record<string, any>
}

SankeyFlow: {
  sourceId: string       // band on left or center axis
  targetId: string       // band on center or right axis
  patientCount: number
  patientIds: string[]   // for drill-down
}

// Center pane dimension list state
DimensionSelection: {
  conditions: string[]        // selected condition IDs
  preventive: string[]        // selected preventive IDs
  riskTiers: RiskTier[]       // selected risk tiers
  actionStatuses: ActionStatus[]  // selected action statuses
}

AxisVisibility: {
  conditions: boolean
  preventive: boolean
  riskLevel: boolean
  actionStatus: boolean
}
```

### 7.1 Mock data requirements

For the demo with ~72 patients (from existing mock data), extend each patient record with:

- Risk tier assignment (distribution: ~5% critical, ~15% high, ~40% moderate, ~35% low, ~5% unassessed)
- Action status assignment (distribution: ~5% urgent, ~15% action-needed, ~30% monitoring, ~40% all-current, ~10% not-enrolled)
- Condition cohort assignments (patients can have 0-4 conditions; average ~1.6 per patient)
- Preventive cohort assignments (most patients eligible for at least one screening)

The distributions should produce a realistic Sankey where:
- Multi-morbidity convergence is visible (left-to-center)
- High-risk patients aren't exclusively in Urgent (some are All Current — the system works)
- Not Enrolled includes both low-risk (appropriate) and some high-risk (gap to surface)
- Unknown/Unassessed populations are small but visible

---

## 8. Technical Approach

### 8.1 Sankey rendering

**Primary recommendation: Apache ECharts** via `echarts-for-react` wrapper.

Rationale: ECharts supports multi-level Sankey charts natively — nodes at different "depth" levels map to the three axes. Built-in interactions (hover emphasis, click events) integrate with React state via callbacks. The library handles layout computation (band sizing, flow routing, crossing minimization) which is the most complex part of a custom implementation.

Integration pattern:
- Sankey configuration derived from `SankeyData` computed from patient records
- ECharts events (`click`, `mouseover`) dispatch to React state (dimension selection, hover preview)
- React state changes (from center pane dimension list) drive ECharts option updates (highlight/dim series)
- Axis visibility toggles trigger Sankey re-render with recalculated data (exclude hidden axis from node/link data)

**Fallback: Custom SVG in React.**

If ECharts' Sankey doesn't support the required customization (two-zone left axis, per-band attention treatment, dynamic axis removal), build as a React SVG component:
- Layout engine: calculate band heights proportional to patient count, flow path curves via cubic bezier
- Rendering: SVG `<rect>` for bands, `<path>` for flows, `<text>` for labels
- Interaction: React event handlers on SVG elements (no D3 DOM manipulation)
- Animation: CSS transitions on SVG attributes or framer-motion

### 8.2 Center pane components

Standard React components. The dimension list is a controlled component — selection state lives in a shared context/store consumed by both the center pane and the canvas.

### 8.3 Investigation modal

Standard React modal component (portal-based). Content components receive the current `DimensionSelection` and compute filtered patient lists and metrics from mock data.

---

## 9. Assess-in-Practice Items

| # | Item | Question | Resolution approach |
|---|------|----------|-------------------|
| 1 | Convergence zone clarity | Does the left-to-center zone become visually tangled at 8-10 bands? | Adjust zone width, transparency, band ordering |
| 2 | Band label readability | Do labels fit next to thin bands (small cohorts)? | Threshold for label display; tooltip for small bands |
| 3 | Two-zone divider | Is the conditions/preventive divider visible enough without being distracting? | Adjust visual treatment — subtle line, spacing, or label |
| 4 | Stats module responsiveness | Does the stats module update feel immediate when selections change? | Ensure computed data is memoized; debounce rapid selections |
| 5 | Modal vs inline for small populations | At what patient count does the inline preview (in stats module) become preferable to the modal? | Test at 5, 10, 15, 20 patients; calibrate threshold |
| 6 | Axis visibility transitions | Does removing/adding an axis feel smooth or jarring? | CSS transition on Sankey container; animate band reflow |
| 7 | Pre-highlight treatment | Is the attention band emphasis noticeable but not overpowering? | Tune opacity/color differential between default and emphasized |
| 8 | ECharts vs custom SVG | Does ECharts' Sankey handle the two-zone left axis and attention styling? | Spike during Phase 1; switch to custom SVG if blocked |

---

## 10. Design Decisions (All-Patients Scope)

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Sankey axis assignment | Left: conditions+preventive, Center: risk tiers, Right: action status | Clinical narrative (have → risk → action); risk as normalization point equals panel size | 2026-03-05 |
| 2 | Left axis zones | Two zones (conditions top, preventive bottom) controlled by center pane | Gives visibility to both workload types without conflating them; center pane is show/hide mechanism | 2026-03-05 |
| 3 | Right axis split | "All Current" + "Not Enrolled" as separate bands | Surfaces enrollment gaps honestly; risk-based highlighting handles false urgency concern | 2026-03-05 |
| 4 | Condition grouping | Top N + Other, user-expandable in center pane | Simple, customizable without algorithmic logic; physician controls granularity | 2026-03-05 |
| 5 | Overview module placement | Dynamic stats in center pane (replaces static stats based on selection) | Cleanest architecture; canvas stays pure visualization; center pane consistent as context provider | 2026-03-05 |
| 6 | Default Sankey state | Full three-axis with attention bands pre-highlighted | Readable at expected band count; immediate focal point without hiding information | 2026-03-05 |
| 7 | Axis visibility control | Separate accordion (list UI) + eye toggle (Sankey axis) | Independent control needed — filtering by dimension vs displaying as axis are different actions | 2026-03-05 |
| 8 | Click behavior | Scope-filter (not navigate); explicit drill-down affordances for navigation | Consistent with "selection, not navigation" principle from main design spec | 2026-03-05 |
| 9 | Dimension multi-select logic | Within axis: OR; across axes: AND | Matches natural intent — "Diabetes OR CHF" vs "Diabetes AND High Risk" | 2026-03-05 |
| 10 | Preset views | Deferred to post-validation | Core interaction rich enough; presets purely additive; demo benefits from showing full exploration | 2026-03-05 |
| 11 | Canvas views at All-Patients | Map (Sankey) + Pipeline + Table; Pipeline and Table as placeholders in v1 | Establishes the three-view structure; full build prioritizes the Sankey as primary exploration tool | 2026-03-05 |
| 12 | Investigation modal | Bridge between stats module and cohort navigation | Provides sufficient depth without leaving All-Patients scope; enables informed drill-down decisions | 2026-03-05 |
