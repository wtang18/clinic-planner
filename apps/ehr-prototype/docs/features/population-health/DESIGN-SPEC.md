# Population Health Workspace — Design Specification

> **Status:** Active Design (Rev 2)
> **Last Updated:** 2026-03-03
> **Related Docs:** [AppShell Scope System](../../architecture/appshell-scope-system.md) | [Prototype → Production](../../architecture/prototype-to-production.md) | [Phased Plan](./PHASED-PLAN.md) | [Progress](./PROGRESS.md) | [Information Architecture](../../INFORMATION_ARCHITECTURE.md) | [Navigation Patterns](../../NAVIGATION_PATTERNS.md)

**Context:** This workspace serves the "physician as clinical architect" paradigm — designing, managing, and monitoring care pathways that run against patient cohorts at population scale.

> **Terminology:** "Pathway" refers to population-health-level care flows (the node graphs in this workspace). "Protocol" is reserved for encounter-level care guidelines (e.g., UTI treatment protocol, asthma action plan). This distinction prevents confusion when both concepts coexist in the system.

---

## 1. System Overview

### 1.1 Relationship to Encounter Mode

The EHR prototype operates via a scope system. Each scope type fills the same three-pane shell with different content:

| Scope | Unit of Work | Physician Role | Time Horizon |
|-------|-------------|---------------|--------------|
| **Patient (encounter)** | One patient, one visit | Clinician — diagnose, treat, document | Real-time, in-visit |
| **Cohort (population health)** | Cohorts of patients, pathways | Clinical architect — design systems, handle exceptions | Asynchronous, between visits |

Both scopes share the AppShell (persistent three-pane layout, AI bar, keyboard shortcuts). Only pane content changes on scope switch. See [AppShell Scope System](../../architecture/appshell-scope-system.md) for the full architecture.

| Pane | Patient Scope | Cohort Scope |
|------|--------------|--------------|
| **Left (Menu)** | Patient Workspaces section | My Patients section (cohort navigator) |
| **Center (Context)** | Patient identity + Overview/Activity | Cohort identity + Overview/Activity |
| **Right (Canvas)** | Charting workspace (OmniAdd, chart items, rail) | Pathway canvas (Flow View / Table View) |

Scope switching is via `navigateToScope()`. From cohort scope, a patient drill-through pushes a patient scope onto the scope stack; a return affordance pops back to the preserved cohort state. See [Navigation Patterns](../../NAVIGATION_PATTERNS.md) for the full Cohort → Patient → Return flow.

### 1.2 Design Principles

These extend the encounter-mode principles to population-level work:

1. **Same objects, different lenses** — Flow View and Table View show the same pathway + patient data through different presentations, exactly as Capture/Process/Review show the same chart items. No data lives in only one view.

2. **Center pane is peer or parent context, never child** — The center pane provides complementary context for the canvas work pane. It never drills down into something the canvas is showing. Information hierarchy flows: left pane (scope selection) → center pane (context for that scope) → right pane (active workspace within that scope).

3. **Selection, not navigation** — Clicking a node in the flow, selecting a layer in the tree, or tapping a column are all selection/focus actions. The view does not change. True navigation (scope switch, view facet switch) is limited and explicit.

4. **Minimal visual differentiation** — Node types are visually similar (same card shape, same background). Differentiation is via icon, label, and pill/chip metadata. Color is reserved for state signals (selection, alert, lifecycle state), not type encoding.

5. **Structural parity across scopes** — Cohort scope center pane mirrors patient scope center pane in layout, interaction patterns, and visual treatment. Same collapsible behavior, same segmented control for views, same identity header pattern.

---

## 2. Left Pane — "My Patients" Menu Section

Population health cohorts are a **section within the existing MenuPane**, parallel to "To Do" and "Patient Workspaces" — not a standalone component or separate screen.

### 2.1 Menu Structure

```
My Patients                              ← Section header (cohort scope)
├── All Patients                (2,312)
├── Recent Patients             (5)      ← Last 5 patients seen (always present)
├── Chronic Disease                      ← Category header (collapsible)
│   ├── Overview                         ← Category-level stats view
│   ├── Diabetes               (412)
│   ├── Hypertension           (689)
│   └── COPD                   (127)
├── Preventive Care
│   ├── Overview
│   ├── Screening Gaps         (234)
│   └── Immunization Gaps      (156)
├── Risk Tiers
│   ├── Overview
│   ├── High Risk               (89)
│   ├── Rising Risk            (203)
│   └── Stable               (1,847)
├── Care Transitions
│   ├── Overview
│   └── Recent Discharges        (8)
└── Custom Cohorts
    └── + New Cohort                     ← Future: filter builder
```

### 2.2 Menu Item Behaviors

| Item Type | Click Behavior | Badge |
|-----------|---------------|-------|
| Section header ("My Patients") | Expand/collapse section | Total panel count |
| "All Patients" | Scope to panel-level view | Panel patient count |
| "Recent Patients" | Scope to recently seen patients | Count of recent |
| Category header (e.g., "Chronic Disease") | Expand/collapse children | N/A |
| Category "Overview" | Scope to category stats view | N/A |
| Cohort (e.g., "Diabetes") | Scope to cohort — loads center + canvas | Patient count |

Selecting any cohort or overview item dispatches `navigateToScope({ type: 'cohort', cohortId })`, which loads the center pane (cohort dashboard + pathways) and the canvas pane (pathway canvas).

### 2.3 Scenario-Aware Content

The "My Patients" section adapts to the provider scenario:

| Scenario | My Patients Content |
|----------|-------------------|
| **Primary care (PC)** | Full tree: All Patients, categories, cohorts, custom cohorts |
| **Urgent care (UC)** | Minimal: Recent Patients only (no population cohorts) |

This is a scenario config flag on the demo launcher entry. The MenuPane renders the appropriate content based on the active scenario.

### 2.4 Category Overview Views

Each category header has an "Overview" child item that shows aggregate stats for all cohorts in that category:

- **Chronic Disease Overview**: Patient counts per condition, quality measure summary, trend sparklines
- **Preventive Care Overview**: Gap closure rates, outreach pipeline status
- **Risk Tiers Overview**: Tier distribution, movement between tiers over time
- **Care Transitions Overview**: Active transitions, 30-day readmission rate

These are stats-only views in the canvas — no pathway visualization. They provide a quick orientation before drilling into specific cohorts.

### 2.5 Cohort Definition

Each cohort is defined by a set of criteria (registry source + filters). For v1, cohorts are pre-defined with static criteria. The criteria are visible when viewing the cohort in the canvas (the leftmost column of a pathway flow starts with the cohort source node showing its filter definition).

Future: custom cohort creation via filter builder.

---

## 3. Center Pane — Cohort Context

The center pane for cohort scope mirrors the patient scope center pane in structure. It has a collapsible identity header and a segmented control for views.

### 3.1 Cohort Identity Header

Renders identically to the patient identity header in encounter mode:

```
┌─────────────────────────────┐
│  Diabetes                   │  ← Cohort name (same typography as patient name)
│  412 patients · Chronic     │  ← Metadata (same pattern as age/sex/MRN)
│  ▲ 3% from last month      │  ← Trend indicator
├─────────────────────────────┤
│ [Overview]  [Activity]      │  ← Segmented control
├─────────────────────────────┤
│                             │
│  [Tab content here]         │
│                             │
└─────────────────────────────┘
```

The identity header collapses via the same button in the canvas top bar that collapses patient identity — structural parity across scopes.

### 3.2 Overview Tab

The Overview tab has two modules, stacked vertically:

#### 3.2.1 Dashboard Module (Top)

Content adapts to current selection scope:

| Selection | Dashboard Shows |
|-----------|----------------|
| Cohort selected (no layer selection) | Cohort-level aggregate metrics: patient count, key quality measures, trend sparklines, risk distribution |
| Pathway layer selected | Pathway-level performance: patients in pipeline by stage, gap closure rate, conversion metrics, escalation count |
| Child node layer selected | Node-level metrics: patient count at that stage, time-in-stage distribution, success/failure rates |

**Alerts:** Critical alerts float to the Overview tab as a persistent attention section:
- Escalations requiring immediate action
- Time-sensitive flags (e.g., "3 post-discharge patients missed 48hr follow-up window")
- Trend warnings (e.g., "A1c gap closure trending down 8% MoM")

Alerts are tappable — tapping an alert selects the relevant pathway layer and node, updating both the dashboard scope and the canvas highlight state.

> **Full alerts view:** The complete alert list, including lower-severity items, lives in a dedicated section accessible from the Overview tab (e.g., "View all alerts" link or separate alerts segment). Only critical/time-sensitive alerts float to the default Overview surface.

#### 3.2.2 Pathway Layer Tree (Bottom)

Nested layer hierarchy showing all pathways for the selected cohort.

**Structure — Branch-Only Indentation:**

The layer tree indents **only at decision points (branches)**, not at every parent-child relationship. This keeps the tree compact while clearly showing the pathway's logical structure.

```
PATHWAYS (3 active)                              [patients] [gaps]

▼ Diabetes A1c Management                           87     34
  Cohort: All Diabetics                             412      —
  Filter: A1c > 9%                                   87      —
  ▼ Branch: Currently on insulin?                     —      —
    ├ Yes → Endocrine referral pathway               23      8
    │   Wait: Referral 30 days                       18      —
    │   Branch: Completed?                            —      —
    │     ├ Yes → Metric: A1c Δ at 90 days            —      —
    │     └ No → Escalation: No response              5      5
    └ No → Intensification pathway                   64     26
        Action: Auto A1c lab order                   64      —
        Wait: 14 days for completion                 41      —
        Action: Titration recommendation             18      —
        Escalation: No response                      12     12
  Metric: A1c Δ at 90 days                            —      —

▶ Colon Cancer Screening Outreach                   234     89
▶ Post-Discharge Follow-up                             8      5
```

**Indentation rules:**
- **Indent-0**: Pathway header (collapsible)
- **Indent-1**: All sequential nodes (cohort, filter, actions, waits, metrics)
- **Indent-2**: Branch children — each branch arm is indented under its branch node
- **Indent-3**: Sequential nodes within a branch arm
- **Indent-4+**: Nested branches within branch arms (and so on recursively)

Non-branch nodes in a linear sequence stay at the same indentation level regardless of their parent-child relationship. Only branching creates visual hierarchy.

**Interaction:**

| Action | Effect on Center Pane | Effect on Canvas |
|--------|----------------------|-----------------|
| Click pathway header | Dashboard scopes to pathway-level metrics | Canvas shows that pathway's full flow; other pathways dimmed |
| Click child node | Dashboard scopes to node-level metrics | Canvas highlights that node and its upstream/downstream stream; rest dimmed |
| Shift-click additional pathway | Dashboard shows combined metrics for selected pathways | Canvas shows both pathways' flows active (separate vertical bands in column grid) |
| Expand/collapse pathway | Reveals/hides child layers in tree | No canvas change |

**Inline summary stats per layer row:**
- Patient count (how many patients are at or have passed through this node)
- Gap/escalation count (how many need attention)
- Status indicator: active, paused, draft

**Visual indicators:**
- Lifecycle state badge on pathway header (active/paused/draft)
- Alert badge on nodes with pending escalations
- Selection highlight synced bidirectionally with canvas node selection

### 3.3 Activity Tab

Temporal feed of cohort-level events, paralleling the patient Activity tab:

- Patient added to / removed from cohort
- Pathway stage transitions (patient moved from stage X to Y)
- Automatic batch actions triggered (e.g., "24 portal messages sent")
- Escalations created
- Pathway configuration changes
- Provider actions taken on cohort patients

Filterable by event type, date range, pathway. Selection of an event can highlight the relevant node/patient in the canvas.

### 3.4 Center Pane Architectural Constraint

The center pane NEVER becomes a child of what's in the canvas. It is always at the same level or a higher level of abstraction. Concretely:
- When a patient preview opens in the right pane's detail drawer, the center pane does NOT switch to show that patient's chart. It continues showing the cohort dashboard.
- The center pane's scope is controlled exclusively by: (a) left pane cohort selection, and (b) layer tree selection within the center pane itself.

---

## 4. Right Pane — Pathway Canvas

### 4.1 View Facets

The canvas has two view facets, toggled via segmented control in the top bar (consistent with Capture/Process/Review toggle pattern in encounter mode):

| View | Optimized For | Shows |
|------|--------------|-------|
| **Flow View** | Pathway design, logic comprehension, architecture | Node graph visualization (React Flow) |
| **Table View** | Operational work, patient scanning, action-taking | Patient-centric grid with pathway context columns |

Both views show the same underlying data. Selecting a patient in Table View highlights their path if you switch to Flow View. Selecting a node in Flow View filters Table View to patients at that stage.

### 4.2 Canvas Top Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Flow View ● | Table View]    [🔍] [⚙ Filter] [≋ Flow]   [Pathway: Name]  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Active filters: [A1c > 9% ×] [Escalated ×] [High risk ×]              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Segmented control:** Flow View / Table View toggle
- **Search button (🔍):** Expands inline search field in the top bar. Searches across node labels, patient names, and pathway content.
- **Filter button (⚙):** Opens filter controls in a right-side drawer panel. Active filters display as dismissible chips in a floating bar below the top bar.
- **Flow counts toggle (≋):** Toggles patient flow count labels on edges (see §5.7). Off by default for a clean canvas; on shows natural/error counts on all edges with non-zero values. Flow View only.
- **Pathway label:** Shows which pathway(s) are currently active in the canvas, driven by center pane layer selection.

### 4.3 Shared Filter System

Filters apply uniformly across both view facets.

**Filter categories:**

| Category | Filters | Example |
|----------|---------|---------|
| **Status** | Awaiting action, In progress, Escalated, Stalled, Completed | "Show only escalated patients" |
| **Lifecycle state** | Active, Paused, Draft, Needs Review, Test, Archived, Error | "Show only active nodes" |
| **Patient attributes** | Risk tier, Time since last visit, Age range, Payer | "High risk patients only" |
| **Pathway-specific** | Clinical values, medication status, eligibility | For diabetes: A1c range, insulin status |

**How filters apply per view:**

| View | Filter Behavior |
|------|----------------|
| Flow View | Non-matching nodes dim; patient-count pills update to show filtered counts (e.g., "12 of 87 patients"). Flow structure remains intact — nothing collapses. Lifecycle state filters hide/show nodes matching the state. |
| Table View | Non-matching rows hidden. Standard list filtering. |

Pathway-specific filters appear as a contextual section in the filter panel, changing based on which pathway is selected in the center pane.

---

## 5. Flow View — Node Graph Visualization

### 5.1 Rendering Engine: React Flow

The Flow View uses [React Flow](https://reactflow.dev/) for node graph rendering. React Flow provides:
- Node positioning with drag-and-drop
- Edge rendering that follows nodes in real-time during drag
- Pan and zoom controls
- Custom node types (our NodeCard component)
- Custom edge rendering
- Built-in minimap for large graphs

This replaces manual absolute positioning + SVG overlay, which was the source of connector alignment issues in the first prototype pass.

### 5.2 Column-as-Guide Layout Model

Columns are **layout guides**, not strict hierarchical positions. Nodes snap to columns but users can arrange nodes within them:

```
 Col 1          Col 2          Col 3          Col 4          Col 5
 ┊              ┊              ┊              ┊              ┊
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Cohort   │──▶│ Filter  │──▶│ Branch  │─┬▶│ Action  │──▶│ Monitor │
│ Source   │   │         │   │         │ │ │ Path A  │   │         │
└─────────┘   └─────────┘   └─────────┘ │ └─────────┘   └─────────┘
 ┊              ┊              ┊        │  ┊              ┊
                                        │ ┌─────────┐   ┌─────────┐
                                        └▶│ Action  │──▶│ Wait    │
                                          │ Path B  │   │         │
                                          └─────────┘   └─────────┘
 ┊              ┊              ┊              ┊              ┊
```

**Layout rules:**

1. **Horizontal:** Nodes snap to column positions on drag release. No free-floating between columns. Column width is uniform. Users can move a node to a different column for organizational purposes (e.g., aligning like-objects across branches).
2. **Vertical:** Free positioning within columns with grid snapping for tidiness. Users can arrange nodes in any vertical order within a column.
3. **Connections:** React Flow edges route automatically between nodes. Edges follow nodes in real-time during drag. Same visual style for all connections (no color or style differentiation by pathway or type).
4. **Multi-pathway:** When multiple pathways are selected (shift-click), each pathway's root node occupies column 1 at different vertical positions. Their flows extend rightward in separate vertical bands sharing the same column grid.
5. **Column snap:** On `onNodeDragStop`, the node's x-position snaps to the nearest column. This preserves the column structure while allowing user arrangement.

**Key difference from v1:** Columns have no inherent hierarchical meaning — a node in column 4 is not necessarily "4 steps deep." Users can place nodes in any column that makes visual sense for their pathway's layout. The default auto-layout places nodes by graph depth, but this can be overridden.

### 5.3 Node Card Design

All node types share the same card shape. Differentiation is through content:

```
                    ┌──────────────────────────────────┐
              ●─────│  [icon]  Node Label          [>] │─────●
                    │  Description or config summary   │
                    │  ┌──────┐ ┌────────────┐        │
                    │  │ pill │ │ pill       │        │
                    │  └──────┘ └────────────┘        │
                    └──────────────────────────────────┘
```

**Always-visible details affordance:** A chevron `>` icon on the right side of the title row serves as the details drawer trigger. This is always visible — users don't need to focus a node first to access its details.

**Anchor points:** Connection attachment circles on left (input) and right (output) edges, vertically aligned with the title/header row. Hidden by default — visible when node is focused (see §5.4 interaction model). React Flow manages the actual connection routing.

**Content by node type:**

| Node Type | Icon | Label Pattern | Pills/Chips |
|-----------|------|--------------|-------------|
| Cohort Source | (group/people) | Cohort name | Patient count, filter criteria summary |
| Filter | (funnel) | Filter description | Criteria, patient count after filter |
| Branch | (fork/split) | Branch condition | Path labels, patient distribution |
| Action | (lightning/send) | Action description | Channel (portal, SMS, phone), timing |
| Wait / Monitor | (clock) | Wait condition | Duration, check criteria, timeout |
| Escalation | (alert/flag) | Escalation target | Target role, priority, pending count |
| Metric / End | (chart/target) | Metric name | Current value, target, trend |
| Loop Reference | (return arrow) | "Returns to [Stage X]" | Retry count, conditions |

Icons are from the Lucide icon set — monochrome, consistent visual weight. The icon differentiates type at a glance; the label and pills provide detail.

**Lifecycle state visual treatments:**

| State | Visual Treatment |
|-------|-----------------|
| Active | Default card appearance — neutral background, full opacity |
| Paused | Reduced opacity (~60%). If node has downstream children, they appear dimmed (~40%) to show cascade effect. Pause state lives at the originating node only. |
| Draft | Dashed border. Full opacity. Indicates "not yet live." |
| Needs Review | Subtle accent indicator (review badge/dot). Full opacity. |
| Test | Badge: "TEST". Full opacity. Indicates A/B test variant. |
| Archived | Hidden by default. When shown via filter: very low opacity (~30%), strikethrough label. |
| Error | Red accent border or badge. Full opacity. System-detected issue requiring attention. |

Color is reserved for state signals only — never for node type differentiation.

### 5.4 Node Interaction Model

**Two independent tap targets per node:**

| Tap Target | Action | Result |
|-----------|--------|--------|
| **Node body** | Focus | Node enters focused state: full title displayed (no truncation), anchor points visible with inbound/outbound flow counts (see §5.7 Tier 2), connectors brought to top z-index, inline expansion of secondary details (configuration summary, patient distribution). Center pane layer tree syncs selection. Dashboard scopes metrics. |
| **Chevron `>`** | Open details drawer | Detail drawer slides in from right. Does NOT require focus first — independent action. |
| **Tap away** | Deselect | Focus dismissed. Center pane and dashboard return to parent scope. |

The focus state is lightweight and reversible — it enriches the current view without opening any panel. The drawer is a deliberate deeper engagement via the always-visible chevron affordance.

**Inline action bar:** On focus, a small floating bar appears near the node with:
- Toggle enable/disable
- Additional contextual actions (future: edit, duplicate, delete)

The inline action bar is secondary to the chevron — it appears only after focus, while the chevron is always available.

### 5.5 Column-Tap Stacking

**Tapping a column background** triggers a visual transition:

1. All nodes in that column slide together into a compact vertical stack for easy scanning.
2. Parent nodes in upstream columns slide to align with their compacted children, maintaining clear origin tracing.
3. All other columns remain in place.
4. React Flow edges smoothly animate to the new positions.

**Release behaviors:**
- Tap the same column again → nodes return to original positions (release).
- Tap a different column → previous column releases, new column collects (lens transfer).
- Tap a node within a collected column → normal node-tap behavior (focus).

This creates a "scanning lens" that can be moved sequentially across columns to inspect each stage.

### 5.6 Connection Lines (Edges)

React Flow handles edge rendering. All edges use the same visual style.

**Special cases:**

| Case | Rendering |
|------|-----------|
| Standard flow (left → right) | Smooth bezier edge from right anchor of source to left anchor of target |
| Branch (one source → multiple targets) | Edges fan out from source to vertically separated targets |
| Convergence (multiple sources → one target) | Edges converge into a single target node |
| Loop / retry | Loop Reference node type (see §5.3) — no backward-flowing edges. Preserves strict left-to-right flow direction. |
| Cross-pathway reference | Reference chip on node ("→ [Pathway Name]"). Tapping the chip selects that pathway in the center pane. No cross-pathway edges. |

**Drag behavior:** When a node is dragged, all connected edges follow in real-time (React Flow built-in). On release, the node snaps to the nearest column position and edges settle.

### 5.7 Patient Flow Visibility

Patient flow through the pathway is visualized at three tiers of detail, from canvas-level overview to deep-engagement breakdown.

#### Tier 1: Edge Flow Counts (Canvas-Level, Toggleable)

Edge labels show patient flow volume between nodes. Toggled via a "Show flow counts" option in the canvas top bar (alongside filter/search controls). When off, edges are clean with no numbers.

```
                    12 natural
┌──────────┐  ─────────────────  ┌──────────┐
│ Filter   │────────────────────▶│ Wait:    │
│          │  ─────────────────  │ 14 days  │
└──────────┘                     └──────────┘
```

```
                    23 natural
┌──────────┐  ─────────────────  ┌──────────┐
│ Filter   │────────────────────▶│ Paused   │
│          │  ─────────────────  │ Node     │
└──────────┘    3 error          └──────────┘
```

**Edge label positions:**
- **Above edge:** Natural accumulation — patients flowing normally through the pathway, including expected wait queues
- **Below edge:** Error/exception count — patients piled up due to pause, stall, error, or timeout at the downstream node

**Display rules:**
- Zero-error edges show only the top (natural) number
- Both-zero edges show nothing
- Numbers are static in the prototype but structured for future real-time computation (see §5.7.4)

#### Tier 2: Anchor Enrichment (On Node Focus)

When a node is focused (tap body), the anchor points expand to show summary flow counts:

```
                       ┌──────────────────────────────────┐
         [23 in]  ◉────│  [icon]  Wait: 14 days       [>] │────○  [18 out]
                       │  Lab result completion            │
                       │  [4 in progress] [3 error]        │
                       └──────────────────────────────────┘
```

- **Left anchor (inbound):** Total patients approaching this node (natural + error)
- **Right anchor (outbound):** Total patients who have passed through this node
- **Node body** (already part of focus expansion): in-progress count + error count as pills/chips

The difference between inbound and outbound counts naturally communicates throughput and bottlenecks at a glance.

#### Tier 3: Flow Breakdown (Detail Drawer)

The Node Detail View (§8.2) includes a **Flow** section with full breakdown:

```
┌─ Flow ──────────────────────────────────┐
│                                         │
│  Inbound                                │
│  ├─ Natural flow         23 patients    │
│  └─ Error/pileup          3 patients    │
│      └─ Upstream pause     3 (Node: X)  │
│                                         │
│  At This Stage                          │
│  ├─ In progress            4 patients   │
│  ├─ Waiting                16 patients  │
│  └─ Error                   3 patients  │
│                                         │
│  Outbound                               │
│  ├─ Completed              18 patients  │
│  ├─ → Path A (insulin)      6           │
│  └─ → Path B (no insulin)  12           │
│                                         │
│  Avg. time in stage: 8.3 days           │
│  Throughput: 2.1 patients/day           │
│                                         │
└─────────────────────────────────────────┘
```

- **Inbound:** Breakdown with attribution (why patients are piling up — upstream pause, timeout, error source)
- **At this stage:** Patients currently being processed, waiting, or in error state at this node
- **Outbound:** Completed patients with branch distribution (for branch nodes, shows per-path counts)
- **Throughput metrics:** Average time in stage, patients per day

#### Tier 4: Data Model for Upgradeability

Mock data includes flow state as explicit fields, structured so a future real-time engine computes them in the same shape:

```ts
interface NodeFlowState {
  inbound: { natural: number; error: number };
  atStage: { inProgress: number; waiting: number; error: number };
  outbound: { completed: number; byPath?: Record<string, number> };
  throughput?: { avgDaysInStage: number; patientsPerDay?: number };
}
```

The rendering layer reads from `NodeFlowState` regardless of whether the source is static mock data or a live computation engine. This shape is the upgrade boundary — replace the data source without touching rendering code.

---

## 6. Node Lifecycle States

### 6.1 State Definitions

Every node in a pathway has a lifecycle state independent of its type:

| State | Meaning | Use Case |
|-------|---------|----------|
| **Active** | Node is live and processing patients | Normal operating state |
| **Paused** | Node is temporarily suspended | Capacity constraints, awaiting external dependency, seasonal hold |
| **Draft** | Node is being designed, not yet live | Building new pathway branch, prototyping changes |
| **Needs Review** | Node requires review before state change | Submitted by designer for clinical review, compliance check |
| **Test** | Node is in A/B test mode | Testing alternate pathway branch against existing |
| **Archived** | Node is retired from active use | Replaced by updated version, no longer relevant |
| **Error** | System-detected issue | Broken integration, failsafe triggered, AI monitoring alert |

### 6.2 State Transitions

State transitions are governed at the **flow level** (not per-node guards). The pathway designer has full control over node states.

```
Draft ──→ Needs Review ──→ Active       (design → review → go live)
Draft ──→ Active                         (skip review, go live directly)
Draft ──→ Archived                       (discard without going live)

Active ──→ Paused ──→ Active             (toggle — temporary suspension)
Active ──→ Needs Review ──→ Active       (submit running node for review)
Active ──→ Archived                      (retire node)
Active ──→ Test ──→ Active               (A/B test → promote winner)

Test ──→ Archived                        (discard test variant)

Any ──→ Error                            (system-detected, automatic)
Error ──→ Active | Paused                (after fix)
```

### 6.3 Cascade Behavior

**Paused cascade:** When a node is paused, its downstream children appear visually dimmed (lower opacity) to communicate that the pathway is interrupted from that point forward. However:
- The paused state **lives at the originating node only** — children retain their own lifecycle state
- Children are NOT state-transitioned to paused; they are only visually indicated as "blocked by upstream pause"
- Unpausing the originating node immediately removes the dimming from all downstream children

**Mixed-state pathways:** A pathway can have nodes in different lifecycle states simultaneously. Common patterns:
- Live pathway with a draft alternate branch (prototyping changes)
- Active pathway with one paused node (temporary hold at a specific step)
- Active pathway with a test variant branching off at a specific decision point

### 6.4 Node Ownership (Future)

Node ownership is conceptually separate from lifecycle state. In the future, different actors may own different nodes:
- **Provider** — physician/NP/MA responsible for the node's configuration
- **AI agent** — automated monitoring, triggering, or decision support
- **Third-party integration** — external service executing an action (lab orders, referral systems)

For v1, all nodes are implicitly provider-owned. The type system should accommodate ownership as a separate dimension from lifecycle state to support future expansion.

### 6.5 Prototype Scope

Build the full type system for all 7 states + Error. For the initial prototype, render a subset:
- **Active** — default state, full visual treatment
- **Paused** — demonstrate cascade dimming behavior
- **Draft** — show dashed border treatment for in-progress design

Other states (Needs Review, Test, Archived, Error) are defined in types and filters but not rendered with dedicated visual treatments until needed. This keeps prototype scope manageable while ensuring the data model supports future expansion.

---

## 7. Table View — Patient Grid

### 7.1 Layout

Standard sortable/filterable data grid. Columns adapt based on pathway context.

**Base columns (always present):**

| Column | Content |
|--------|---------|
| Patient name | Full name, tappable for patient preview |
| Risk tier | High / Rising / Stable |
| Current stage | Which pathway node the patient is at |
| Days in stage | Time since entering current stage |
| Status | Active, Escalated, Stalled, Completed |
| Next action | What the pathway will do next (or "Awaiting human action") |
| Last action | Most recent pathway action taken |

**Pathway-specific columns (contextual):**

| Pathway | Additional Columns |
|---------|-------------------|
| Diabetes A1c | Last A1c value, Last A1c date, Current diabetes meds, Insulin status |
| Cancer Screening | Screening type, Last screening date, Eligibility status, Decline count |
| Post-Discharge | Discharge date, Days since discharge, Readmission risk score, Follow-up status |

### 7.2 Row Interactions

| Action | Result |
|--------|--------|
| Tap patient name | Patient preview opens in detail drawer |
| Tap row action button | Contextual actions: approve pending action, escalate, flag for review, dismiss |
| Sort by column | Standard sort behavior |
| Filter (via shared filter bar) | Rows hidden/shown based on filter criteria |

### 7.3 Cross-View Sync

- Selecting a patient in Table View → if you switch to Flow View, that patient's path through the pathway is highlighted.
- Selecting a node in Flow View → if you switch to Table View, the grid is filtered to patients at that stage.
- Selection state persists across view switches within the same session.

---

## 8. Detail Drawer

### 8.1 Architecture

The detail drawer slides in from the right edge of the canvas, overlaying the canvas content. The canvas behind it remains visible (dimmed) and does not change.

The drawer supports a view stack (child views within the drawer):

```
Detail Drawer
├── Node Detail View (opened via chevron > on any node)
│   ├── Configuration section
│   ├── Patient list at this stage
│   └── Stage metrics
├── Patient Preview View (child of Node Detail or Table View row tap)
│   ├── Patient summary (demographics, risk tier)
│   ├── Pathway-relevant clinical data
│   ├── Pathway history (which pathways, where in each flow)
│   └── "Open Patient Workspace" button → scope push
└── Back navigation (returns to parent view in drawer stack)
```

### 8.2 Node Detail View

Shown when the chevron `>` is tapped on any node in Flow View.

**Sections:**

1. **Configuration** — All configurable properties for this node type (filter criteria, action parameters, timing, escalation targets). Displayed as read-only for v1 (editable is future — see §11 assess in practice).
2. **Flow** — Full patient flow breakdown: inbound (natural + error with attribution), at-stage (in-progress, waiting, error), outbound (completed with branch distribution), throughput metrics. See §5.7 Tier 3 for detailed layout.
3. **Patient List** — Scrollable list of patients currently at this stage. Each row shows patient name, key metric, time in stage. Tapping a patient navigates to Patient Preview View within the drawer.
4. **Stage Metrics** — Conversion rate, average time in stage, completion rate, escalation rate. Trend indicators where applicable.

### 8.3 Patient Preview View

Shown when a patient is tapped from either the Node Detail patient list or a Table View row.

**Content:**
- Patient header: name, age, sex, risk tier, primary insurance
- Pathway context: which pathway(s) this patient is in, current stage in each, time at current stage
- Clinical summary relevant to the pathway context (e.g., for diabetes: A1c history, current meds, last visit; for screening: screening history, eligibility, past declines)
- Recent actions taken by the pathway on this patient (outreach attempts, orders placed, escalations)
- **"Open Patient Workspace" button** — the only true navigation action. Pushes patient scope onto the scope stack. Center pane becomes patient overview. Right pane becomes charting canvas. Return affordance provides "Back to [Cohort Name]" path via scope pop.

### 8.4 Drawer Behavior

- Width: ~40-50% of canvas pane width (assess in practice).
- Canvas behind drawer: visible but dimmed, not interactive while drawer is open.
- Dismiss: tap outside drawer, or explicit close button, or Escape key.
- Back navigation within drawer: when in a child view (e.g., Patient Preview), a back button at the top returns to the parent view (e.g., Node Detail). Dismissing the drawer at any depth closes the entire stack.

---

## 9. Navigation Model

### 9.1 Navigation Actions (Exhaustive List)

| Action | Type | What Changes |
|--------|------|-------------|
| Select cohort in left pane | **Scope change** | Center pane loads new cohort dashboard + pathways. Canvas loads new cohort's pathway context. |
| Select category overview in left pane | **Scope change** | Center pane loads category metrics. Canvas loads stats view (no pathway). |
| Select layer in center pane layer tree | **Selection** | Dashboard scopes metrics. Canvas highlights selected stream. No view change. |
| Shift-click layer in center pane | **Multi-selection** | Dashboard shows combined metrics. Canvas overlays multiple pathways. |
| Toggle Flow View / Table View | **View facet switch** | Canvas swaps presentation. Data and selection state preserved. |
| Tap node body in Flow View | **Focus** | Node enters focused state. Center pane syncs. No view change. |
| Tap chevron `>` on node | **Drawer open** | Detail drawer slides in over canvas. Canvas unchanged beneath. |
| Tap patient in drawer or Table View | **Drawer child view** | Patient Preview replaces current drawer content. Canvas unchanged. |
| "Open Patient Workspace" | **Scope push** | Patient scope pushed onto stack. All three panes change to encounter content. Return affordance visible. |
| Return affordance (← Cohort Name) | **Scope pop** | Returns to cohort scope. Previous state restored from scope stack. |
| Tap column background | **Transient visual** | Column stacking animation. Fully reversible. No state change. |
| Apply/remove filter | **Filter** | Both views update (dim/hide). No navigation. |
| Search | **Filter** | Highlights matching nodes/rows. No navigation. |

### 9.2 Return Affordance

When the user navigates from cohort scope into a patient's encounter workspace via "Open Patient Workspace", a return affordance appears in the canvas top bar:

```
┌──────────────────────────────────────────────────────┐
│  ← Diabetes T2                    [canvas controls]  │
└──────────────────────────────────────────────────────┘
```

Tapping the return affordance:
- Pops the patient scope from the stack
- Returns to cohort scope
- Restores the previous cohort, pathway layer selection, and canvas state (preserved on the scope stack)
- The patient they were viewing remains selected (highlighted in Table View, path highlighted in Flow View)

This is consistent with the existing ContextBar pattern for To-Do → Patient → Return flows. See [Navigation Patterns](../../NAVIGATION_PATTERNS.md) for details.

---

## 10. Mock Data — Three Pathways

### 10.1 Pathway: Diabetes A1c Management

**Type:** Chronic disease, ongoing
**Cohort:** Diabetes (412 patients)
**Entry filter:** A1c > 9% (87 patients)

**Flow structure (7 columns):**

```
Col 1           Col 2          Col 3           Col 4              Col 5           Col 6           Col 7
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐
│ Cohort:   │─▶│ Filter:   │─▶│ Branch:   │┬▶│ Action:       │─▶│ Wait:      │─▶│ Branch:    │┬▶│ Metric:   │
│ Diabetics │  │ A1c > 9%  │  │ On insulin││ │ Endo referral │  │ Referral   │  │ Completed? ││ │ A1c Δ     │
│ (412)     │  │ (87)      │  │ ?         ││ │               │  │ 30 days    │  │            ││ │ at 90 days│
└───────────┘  └───────────┘  └───────────┘│ └───────────────┘  └────────────┘  └────────────┘│ └───────────┘
                                           │                                                  │
                                           │ ┌───────────────┐  ┌────────────┐  ┌────────────┐│
                                           └▶│ Action:       │─▶│ Wait:      │─▶│ Action:    ││
                                             │ Auto A1c lab  │  │ Lab result │  │ Titration  ││
                                             │ order         │  │ 14 days    │  │ recommend  ││
                                             └───────────────┘  └────────────┘  └────────────┘│
                                                                                              │
                                                                                ┌────────────┐│
                                                                                │ Escalation:││
                                                                                │ No response││
                                                                                │ → RN       ││
                                                                                └────────────┘│
                                                                                              │
                                                                                              └▶ (merges)
```

**Mock patients:** 15 patients distributed across stages. Realistic names, A1c values (9.1–13.2), medication lists, visit histories.

### 10.2 Pathway: Colon Cancer Screening Outreach

**Type:** Preventive, campaign-style
**Cohort:** Cancer Screening Gaps (234 patients)
**Entry filter:** Age 45-75, no colonoscopy in 10 years or FIT in 1 year (234 patients match)

**Flow structure (6 columns):**

```
Col 1           Col 2           Col 3           Col 4           Col 5           Col 6
┌───────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐
│ Cohort:   │─▶│ Filter:    │─▶│ Action:    │─▶│ Wait:      │┬▶│ Action:    │─▶│ Metric:   │
│ Screening │  │ Eligible   │  │ Portal     │  │ Response   ││ │ Schedule   │  │ Screening │
│ Gaps (234)│  │ 45-75, no  │  │ message    │  │ 7 days     ││ │ assist     │  │ completion│
└───────────┘  │ recent test│  └────────────┘  └────────────┘│ └────────────┘  └───────────┘
               └────────────┘                                │
                                                             │ ┌────────────┐  ┌────────────┐
                                                             ├▶│ Action:    │─▶│ Wait:      │─▶ (loops to
                                                             │ │ SMS        │  │ Response   │    Schedule)
                                                             │ │ reminder   │  │ 5 days     │
                                                             │ └────────────┘  └────────────┘
                                                             │
                                                             │ ┌────────────┐
                                                             └▶│ Escalation:│
                                                               │ No response│
                                                               │ → Phone    │
                                                               │ outreach   │
                                                               └────────────┘
```

**Mock patients:** 12 patients distributed across stages. Mix of response states, decline history, eligibility edge cases.

### 10.3 Pathway: Post-Discharge Follow-up

**Type:** Care transition, event-triggered
**Cohort:** Recent Discharges (8 patients)
**Entry trigger:** Hospital discharge notification (ADT feed)

**Flow structure (7 columns):**

```
Col 1           Col 2           Col 3           Col 4           Col 5           Col 6           Col 7
┌───────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐
│ Trigger:  │─▶│ Branch:    │┬▶│ Action:    │─▶│ Wait:      │┬▶│ Action:    │─▶│ Action:    │─▶│ Monitor:  │
│ Discharge │  │ Readmit    ││ │ 48hr phone │  │ Reached?   ││ │ Schedule   │  │ Med recon  │  │ 30-day    │
│ event     │  │ risk?      ││ │ outreach   │  │ 48 hours   ││ │ 7-day      │  │ at visit   │  │ readmit   │
└───────────┘  └────────────┘│ └────────────┘  └────────────┘│ │ follow-up  │  └────────────┘  └───────────┘
                             │                               │ └────────────┘
               ┌────────────┐│                 ┌────────────┐│
               │ Action:    ││                 │ Escalation:││
               │ URGENT:    ││                 │ Not reached││
               │ Same-day   ││                 │ → Care     ││
               │ phone + RN ││                 │ coordinator││
               └────────────┘│                 └────────────┘│
                             │                               │
                             └▶ (high risk path continues     └▶ (merges to Schedule)
                                with parallel RN monitoring)
```

**Mock patients:** 8 patients. Mix of risk levels, contact success/failure, timing states.

---

## 11. Assess in Practice

Design decisions intentionally deferred to implementation assessment:

1. **Connection line differentiation** — Currently all same style. If multi-pathway overlay creates visual confusion, consider subtle differentiation (e.g., line weight, opacity).
2. **Column-tap parent-slide animation** — The exact animation choreography for upstream node repositioning during column stacking. Needs to feel smooth without being distracting.
3. **Node configuration editing** — v1 is read-only in detail drawer. Whether future edits are live or preview-mode (apply on explicit save) is an implementation decision with workflow implications.
4. **Visual density at depth** — Pathways with 7+ columns may exceed comfortable viewport width. React Flow's pan/zoom and built-in minimap may suffice; assess when real flows are rendered.
5. **Filter UI details** — The filter drawer panel layout, pathway-specific filter appearance, and chip interaction patterns can be refined during implementation.
6. **Detail drawer width** — 40-50% of canvas width is a starting point. May need adjustment based on content density.
7. **Column snap threshold** — How far can a node be dragged before it snaps to the next column vs. returning to its original? Needs to feel natural.
8. **React Flow customization depth** — Custom edge types, minimap style, controls placement. Assess during integration.
9. **Alerts segmentation** — Whether critical alerts in Overview tab vs. full alerts list needs its own tab or just a "View all" expansion within Overview.
10. **Activity feed granularity** — How much detail per event in the Activity tab. Too detailed = noise; too sparse = not useful.

---

## Revision History

| Rev | Date | Changes | Author |
|-----|------|---------|--------|
| 2 | 2026-03-03 | Major revision: terminology (pathway vs. protocol), menu integration, center pane parity, branch-only layer tree, React Flow adoption, node lifecycle states, updated interaction model, column-as-guide layout, category overviews, activity tab, search/filter in top bar, three-tier patient flow visibility (edge counts, anchor enrichment, drawer breakdown) | Claude + William |
| 1 | 2026-03-02 | Initial design specification | Claude + William |
