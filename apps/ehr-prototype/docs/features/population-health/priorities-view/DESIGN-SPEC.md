# Priorities View — Design Specification

**Status:** Draft — pending review
**Scope:** Defines the Priorities canvas view at cohort scope — the first of three canvas views (Priorities | Flow | Table). Covers priority card design, action tiers, ambient awareness strip, and the automation layer model.
**Related docs:** `../../reference/pop-health/all-patients-view/layer-tree-enhancements/DESIGN-SPEC.md` (selection model — LT1–LT2 complete), `../DESIGN-SPEC.md` (base architecture, Flow + Table views)
**Context:** The Priorities view serves the "what needs my attention right now" job. It's optimized for the specialist provider model — providers focus on their assigned nodes and the tasks that need their action, with ambient awareness of what AI and team members are handling. This view was introduced based on CMO feedback: not all providers are orchestrators; many are specialists who need a focused task-driven interface rather than a full flow visualization.

---

## 1. Role in the View Architecture

Three canvas views at cohort scope, each serving a different job:

| View | Job | Question it answers | Provider mode |
|------|-----|--------------------|-----------------------|
| **Priorities** | Act on what needs attention | "What do I need to do right now?" | Working |
| **Flow** | Understand the care flow structure | "How does this care flow work? Where are patients?" | Comprehending |
| **Table** | Inspect individual patients | "Who specifically? What are the details?" | Inspecting |

The view order (Priorities first) reflects the expected daily workflow: most providers open a cohort to act on items, not to study the flow structure.

### 1.1 Relationship to selection state

The Priorities view consumes the layer tree selection state (LT1–LT2, complete):

- **"Show Mine" active (default):** Shows priority items at the provider's assigned nodes (★) plus escalated items (🔺)
- **Manual selection:** Shows priority items at whatever nodes are selected
- **No selection ("Clear"):** Shows all priority items across the entire care flow (unfiltered)

---

## 2. Layout

### 2.1 View structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◈ Priorities  │  ◎ Flow  │  ▦ Table                    [≡] Q       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  AI: 3 in progress · MA: 2 active · 5 completed today    [▾] │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Sort: [Urgency ▼]  [By node]  [By date]          12 items          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ☐  Maria Santos                              URGENT  2d ago  │  │
│  │     Diabetes A1c Mgmt → Endo Referral                         │  │
│  │     A1c 11.2 — referral pending 14 days, no response          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ☐  James Chen                                URGENT  1d ago  │  │
│  │     Post-Discharge → 48hr Callback  🔺                        │  │
│  │     High readmit risk — not yet reached                       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ☐  Patricia Williams                       REVIEW  3d ago    │  │
│  │     Diabetes A1c Mgmt → Titration Recommendation              │  │
│  │     AI prepared: metformin dose increase 500→1000mg           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ...                                                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Components

The view has four regions, top to bottom:

1. **Ambient awareness strip** (§3) — persistent bar showing AI/team activity
2. **Sort controls + item count** (§4) — sorting options and total count
3. **Priority card list** (§5) — scrollable list of actionable items
4. **Batch action bar** (§8) — sticky bar at bottom when 2+ items are checked

---

## 3. Ambient Awareness Strip

### 3.1 Purpose

Shows what's happening at the provider's nodes that DOESN'T require their action — tasks being handled by AI or team members. This provides situational awareness without cluttering the action queue.

Inspired by the Encounter Status module in the encounter workspace right rail, which shows what AI and MAs are working on and what's ready for review.

### 3.2 Default (collapsed) state

A single-line bar at the top of the Priorities view:

```
AI: 3 in progress · MA: 2 active · 5 completed today    [▾]
```

Content:

| Segment | Meaning |
|---------|---------|
| **AI: N in progress** | Tasks currently being processed by AI automation (Layer 1 items) |
| **MA: N active** | Tasks assigned to medical assistants or other team members (task-level assignment, not node-level) |
| **N completed today** | Tasks completed since start of day by AI + team (builds trust in automation) |

### 3.3 Expanded state

Tapping [▾] expands the strip to show detail:

```
┌────────────────────────────────────────────────────────────────┐
│  Activity at your nodes                                   [▴] │
│                                                                │
│  AI in progress (3):                                          │
│    • Scheduling screening outreach for 2 patients             │
│    • Sending portal message re: lab results for R. Thompson   │
│    • Processing FIT kit reorder for M. Garcia                 │
│                                                                │
│  MA Chen active (2):                                          │
│    • Completing vitals pre-check for J. Adams                 │
│    • Scheduling follow-up appointment for S. Patel            │
│                                                                │
│  Completed today (5):                                         │
│    • AI: Sent 3 screening reminder messages                   │
│    • MA Chen: Updated 2 patient medication lists              │
│                                                                │
│  Items ready for your review (2):   ← links to REVIEW items  │
│    • Patricia Williams — metformin dose increase              │
│    • Robert Kim — statin initiation recommendation            │
└────────────────────────────────────────────────────────────────┘
```

The "Items ready for your review" section links to items in the priority queue below that are tagged as REVIEW (Layer 2 — AI-prepared, human review).

### 3.4 Scope

The ambient strip shows activity at nodes in the current layer tree selection. When "Show Mine" is active, it shows activity at ★ nodes. When a different selection is active, it reflects that selection's scope.

---

## 4. Sort Controls

### 4.1 Sort options

```
Sort: [Urgency ▼]  [By node]  [By date]          12 items
```

| Sort | Behavior |
|------|----------|
| **Urgency** (default) | URGENT items first, then REVIEW, then ACTION NEEDED, then MONITORING. Within each tier, sorted by days waiting (longest first). |
| **By node** | Groups items by care flow node. Within each node group, sorted by urgency. Useful when working through one node at a time. |
| **By date** | Most recently created/updated items first. Useful for seeing what's new. |

The item count ("12 items") shows total items in the current queue.

### 4.2 Filter interaction

Sort controls operate on whatever items are currently visible based on layer tree selection. They do not add additional filtering — the layer tree selection IS the filter.

---

## 5. Priority Card Design

### 5.1 Card anatomy

Each priority card represents a single actionable item — one patient at one care flow node requiring attention.

```
┌────────────────────────────────────────────────────────────────┐
│  ☐  Patient Name                          [BADGE]  [time ago] │
│     Care Flow Name → Node Name  [🔺 if escalation]            │
│     One-line context: key clinical data point or AI summary    │
└────────────────────────────────────────────────────────────────┘
```

| Element | Content | Purpose |
|---------|---------|---------|
| **Checkbox** (☐) | Always visible, for batch selection | Batch actions (§8) |
| **Patient name** | Full name, tappable | Opens side drawer for this patient |
| **Badge** | URGENT / REVIEW / ACTION / MONITOR | Priority tier at a glance |
| **Time indicator** | "2d ago", "4hr ago" | Time since item entered this state |
| **Care flow → Node** | Flow name + node name | Structural location context |
| **Escalation marker** | 🔺 if cross-boundary escalation | Distinguishes items at your nodes (★) from escalated items (🔺) |
| **Context line** | Key clinical data or AI reasoning summary | Enough info for quick triage without opening drawer |

### 5.2 Badge types

The badge maps to the four-layer automation model:

| Badge | Automation Layer | Meaning |
|-------|-----------------|---------|
| **URGENT** | Layer 3-4 (human-driven or human-only) | Requires immediate provider action. Time-sensitive. |
| **REVIEW** | Layer 2 (AI-prepared, human review) | AI has prepared the action; provider needs to approve/modify. One-tap potential. |
| **ACTION** | Layer 3 (human-driven, AI-assisted) | Requires provider judgment. AI provides context but doesn't pre-fill. |
| **MONITOR** | Layer 3-4 | No immediate action needed, but provider should be aware. Lower priority. |

Layer 1 items (AI-handled, no review) do NOT appear as cards — they're represented in the ambient strip.

### 5.3 Context line examples

The context line provides the single most relevant data point for quick triage:

| Scenario | Context line |
|----------|-------------|
| Lab result | "A1c 11.2 — referral pending 14 days, no response" |
| AI-prepared action | "AI prepared: metformin dose increase 500→1000mg" |
| Post-discharge | "High readmit risk — not yet reached after 48hrs" |
| Screening outreach | "3rd outreach attempt — patient declined twice previously" |
| Cross-boundary escalation | "Escalated from MA Chen: abnormal BP trend, needs clinical review" |

---

## 6. Card Interaction — Action Tiers

### 6.1 Tier overview

| Tier | Surface | Triggered by | Use case |
|------|---------|-------------|----------|
| **Quick** | Expanded card | Tap/focus on card | Defer, assign, flag — fast disposition without context |
| **Structured** | Side drawer | Tap patient name or "Details" | Full context + forms for clinical decisions |
| **Deep** | Patient workspace | "Open Patient Workspace" in drawer | Complex cases needing full chart access |
| **Batch** | Batch bar + drawer | Check 2+ items | Bulk disposition of similar items |

### 6.2 Quick actions (expanded card)

Tapping a priority card expands it by ~60px to reveal a quick action row:

```
┌────────────────────────────────────────────────────────────────┐
│  ☐  Maria Santos                              URGENT  2d ago  │
│     Diabetes A1c Mgmt → Endo Referral                         │
│     A1c 11.2 — referral pending 14 days, no response          │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│     [Defer ⏱]  [Assign →]  [Flag 🚩]  [Details ›]            │
└────────────────────────────────────────────────────────────────┘
```

| Quick action | Behavior |
|-------------|----------|
| **Defer** | Removes from current queue, reappears after deferral period (1hr/4hr/tomorrow/1wk — picker on tap) |
| **Assign** | Opens small popover to assign to a team member or AI. Removes from provider's queue, adds to assignee's. |
| **Flag** | Marks for follow-up. Visual flag indicator on card. Card stays in queue. |
| **Details** | Opens side drawer (same as tapping patient name) |

Quick actions are designed for items where the provider can make a disposition without needing additional context — "I know I can't deal with this now, defer it" or "this should go to the MA."

### 6.3 Column reflow on expansion

When a card expands:

- Cards below it in the list shift down by the expansion amount
- Animated transition (smooth slide, ~200ms)
- Multiple cards can be expanded simultaneously
- Collapsing: tap the expanded card again, or tap a different card (previous card collapses, new card expands)

### 6.4 Structured actions (side drawer)

The side drawer opens from the right edge when the provider taps a patient name or "Details." Content is organized in sections:

**Section 1 — Patient header + clinical snapshot**

```
┌────────────────────────────────────────────────┐
│  Maria Santos, 58F                             │
│  Diabetes Type 2 · Hypertension · BMI 32       │
│  Risk: High · Last visit: 2 weeks ago          │
│  ──────────────────────────────────────────     │
│  A1c: 11.2 (target <7.0) ↑ from 10.4          │
│  Current meds: Metformin 500mg BID             │
│  eGFR: 62 (mild CKD)                          │
│  BP trend: 148/92 → 142/88 → 150/94           │
└────────────────────────────────────────────────┘
```

Clinical data points are specific to the care flow context. Diabetes flow shows A1c, meds, eGFR. Screening flow shows screening history, eligibility, decline count. The system selects relevant data based on the care flow the item is associated with.

**Section 2 — Priority context**

```
┌────────────────────────────────────────────────┐
│  Why this item needs attention:                │
│                                                 │
│  Node: Endocrine Referral                      │
│  Status: Referral sent 14 days ago, no         │
│  response from endocrine clinic.               │
│                                                 │
│  AI assessment: Patient's A1c has increased    │
│  despite current regimen. eGFR decline         │
│  suggests avoiding certain medication classes.  │
│  Endocrine consultation is time-sensitive       │
│  given trajectory.                              │
│                                                 │
│  Suggested actions:                            │
│  • Re-send referral with urgency flag          │
│  • Call endocrine clinic directly              │
│  • Consider interim medication adjustment      │
└────────────────────────────────────────────────┘
```

Node-specific context explains what the care flow automation has done so far and why this item escalated to the provider. AI reasoning provides clinical assessment. Suggested actions are starting points, not prescriptions.

**Section 3 — Actions**

```
┌────────────────────────────────────────────────┐
│  Actions:                                       │
│                                                 │
│  [Re-send referral (urgent)] [Call clinic]      │
│  [Adjust medication]  [Defer]  [Assign →]      │
│                                                 │
│  ──────────────────────────────────────────     │
│  [Open Patient Workspace ›]                     │
└────────────────────────────────────────────────┘
```

Actions are node-type-specific:

| Node type | Available actions |
|-----------|------------------|
| Referral | Re-send, call, cancel, change recipient, adjust urgency |
| Lab/order | Re-order, extend wait period, cancel, flag for follow-up |
| Medication | Adjust dose, change medication, add medication, consult pharmacy |
| Outreach | Re-send (different channel), schedule call, mark declined, escalate |
| Monitoring | Extend monitoring, change frequency, escalate, discharge from flow |

Tapping an action replaces the action section with the relevant form (e.g., "Adjust medication" shows a dose selector, reason field, and confirmation button). After submission, the drawer shows a confirmation state and auto-closes after 2 seconds, or stays open if there are additional items to review.

**Deep link:** "Open Patient Workspace" at the bottom for cases that need full chart access. This triggers the mode switch to encounter mode with floating anchor return.

### 6.5 REVIEW items — streamlined drawer

For REVIEW badge items (AI-prepared, provider approves), the drawer has a streamlined layout:

```
┌────────────────────────────────────────────────┐
│  Patricia Williams, 64F                        │
│  Diabetes Type 2 · A1c 9.4                     │
│  ──────────────────────────────────────────     │
│                                                 │
│  AI Recommendation:                            │
│  Increase metformin from 500mg to 1000mg BID   │
│                                                 │
│  Reasoning: A1c 9.4 despite 3 months on        │
│  current dose. No contraindications. eGFR 78.  │
│  Weight stable. No GI complaints reported.     │
│                                                 │
│  [✓ Approve]  [✎ Modify]  [✕ Decline]         │
│                                                 │
│  ──────────────────────────────────────────     │
│  [Open Patient Workspace ›]                     │
└────────────────────────────────────────────────┘
```

The "Approve" action is the expected primary path — one tap to accept the AI's recommendation. "Modify" expands to allow edits. "Decline" requires a reason.

---

## 7. Automation Layer Model

### 7.1 Four layers

The automation model determines which items appear in the provider's queue vs. the ambient strip:

| Layer | Handler | Provider involvement | Where it appears |
|-------|---------|---------------------|-----------------|
| **Layer 1: AI-handled** | AI executes autonomously | None unless exception | Ambient strip only |
| **Layer 2: AI-prepared** | AI prepares, provider reviews | Approve/modify/decline | Priority queue as REVIEW card |
| **Layer 3: Human-driven, AI-assisted** | Provider decides, AI provides context | Full decision-making | Priority queue as ACTION or URGENT card |
| **Layer 4: Human-only** | Provider handles entirely | Full ownership | Priority queue as ACTION or URGENT card |

### 7.2 Layer assignment

Each priority item's layer is determined by rules associated with the care flow node type and the item's characteristics:

| Factor | Layer impact |
|--------|-------------|
| Node type is routine action (screening outreach, standard reminder) | Layer 1 candidate |
| Normal result within expected range | Layer 1 (auto-process) |
| Standard order with no contraindications | Layer 2 (AI prepares, provider reviews) |
| Abnormal result or clinical judgment needed | Layer 3 (provider decides) |
| Novel situation, patient complexity, sensitive topic | Layer 4 (provider-only) |
| Patient has 3+ active care flows | Bump up one layer (complexity risk) |
| Patient previously declined or non-adherent | Bump up one layer (needs judgment) |

Layer assignment is configurable at the care flow level. Providers or administrators can adjust which items auto-process vs. require review.

### 7.3 Trust building

The ambient strip's "completed today" count and expanded detail view serve a deliberate trust-building function. Providers can see exactly what AI handled, building confidence over time. If an AI-handled item was wrong, the provider can flag it from the expanded detail, which adjusts future layer assignments (feedback loop).

---

## 8. Batch Actions

### 8.1 Batch selection

Each priority card has a checkbox (☐). When 2+ checkboxes are selected, a sticky batch action bar appears at the bottom of the view:

```
┌────────────────────────────────────────────────────────────────┐
│  3 items selected    [Defer all]  [Assign all →]  [Review ›]  │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Batch actions

| Action | Behavior |
|--------|----------|
| **Defer all** | Picker for deferral period, applied to all selected items |
| **Assign all** | Assign all selected items to the same team member or AI |
| **Review** | Opens drawer in batch review mode (§8.3) |

### 8.3 Batch review mode

The drawer shows a spot-check list of the selected items:

```
┌────────────────────────────────────────────────┐
│  Batch Review (3 items)                        │
│  ──────────────────────────────────────────     │
│                                                 │
│  1/3  Patricia Williams                        │
│  AI: Increase metformin 500→1000mg             │
│  [✓ Approve]  [✎ Modify]  [✕ Skip]            │
│                                                 │
│  ──────────────────────────────────────────     │
│  2/3  Robert Kim                               │
│  AI: Initiate atorvastatin 20mg                │
│  [✓ Approve]  [✎ Modify]  [✕ Skip]            │
│                                                 │
│  ──────────────────────────────────────────     │
│  3/3  Dorothy Johnson                          │
│  AI: Reorder A1c lab, 90-day interval          │
│  [✓ Approve]  [✎ Modify]  [✕ Skip]            │
│                                                 │
│  ──────────────────────────────────────────     │
│  [Approve remaining (2)]  [Done]               │
└────────────────────────────────────────────────┘
```

Batch review is optimized for REVIEW items where the provider is approving AI-prepared actions in rapid succession. "Approve remaining" is a power user affordance for high-trust providers.

---

## 9. Edge Cases

### 9.1 Empty queue

When no items need attention (all handled by AI/team or all resolved):

```
┌────────────────────────────────────────────────────────────────┐
│  AI: 0 in progress · MA: 0 active · 12 completed today  [▾]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✓ All clear                                                   │
│  No items need your attention at selected nodes.               │
│                                                                │
│  12 items completed today by AI and team.                      │
│  [View completed items]                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 9.2 Patient in multiple cohorts

A patient may appear in multiple care flows and thus generate multiple priority items. Each item is a separate card tied to its specific care flow and node. The patient name appears on multiple cards — this is intentional (each represents a different clinical context requiring different actions).

Deduplication is NOT applied. The same patient at two different nodes = two separate items with different clinical contexts.

### 9.3 Queue dominance

If one node has disproportionately many items (e.g., 15 patients at screening outreach), the "By node" sort groups them together. The provider can batch-process them. The urgency sort distributes them among items from other nodes based on individual urgency.

Consider: if a single node consistently dominates the queue, this is a signal that the node's automation layer should be adjusted (move more items to Layer 1 or Layer 2).

### 9.4 Deferred items returning

When a deferred item's deferral period expires, it reappears in the queue with a "Deferred" indicator showing when it was deferred and by whom. This prevents items from cycling invisibly.

### 9.5 Stale items

Items that have been in the queue beyond a configurable threshold (e.g., 7 days without action) get a visual "stale" indicator. This surfaces items that may have been overlooked or that the provider is avoiding.

---

## 10. Data Requirements

### 10.1 Core data model

```
PriorityItem: {
  id: string
  patientId: string
  careFlowId: string
  nodeId: string
  automationLayer: 1 | 2 | 3 | 4
  badge: 'URGENT' | 'REVIEW' | 'ACTION' | 'MONITOR'
  assignmentType: 'node-owner' | 'escalation' | 'direct'
  assignedToProviderId: string
  taskAssignment: {                    // task-level (distinct from node-level)
    assignedToId: string
    assignedToType: 'provider' | 'ai' | 'team-member'
    assignedToName: string
  }
  contextLine: string                  // one-line clinical summary
  clinicalSnapshot: ClinicalSnapshot   // for drawer
  aiReasoning: string | null           // AI assessment if applicable
  aiPreparedAction: AiPreparedAction | null  // for REVIEW items
  suggestedActions: Action[]           // node-type-specific
  createdAt: Date
  updatedAt: Date
  deferredUntil: Date | null
  staleThresholdDays: number
  sourceEscalationId: string | null    // links to EscalationFlag if cross-boundary
}

AiPreparedAction: {
  description: string                  // "Increase metformin 500→1000mg"
  reasoning: string                    // clinical reasoning
  actionType: string                   // maps to node-type-specific action
  parameters: Record<string, any>      // pre-filled form values
}

AmbientActivity: {
  aiInProgress: ActivityItem[]
  teamActive: ActivityItem[]
  completedToday: ActivityItem[]
  readyForReview: string[]             // PriorityItem IDs
}

ActivityItem: {
  description: string
  actorName: string                    // "AI", "MA Chen", etc.
  actorType: 'ai' | 'team-member'
  startedAt: Date
  completedAt: Date | null
}
```

### 10.2 Computation

Priority queue is computed from PriorityItems filtered by:

1. Layer tree selection (nodes currently selected)
2. Task-level assignment (items assigned to current provider or unassigned at provider's nodes)
3. Not deferred (deferredUntil is null or in the past)
4. Automation layer 2-4 only (Layer 1 items go to ambient strip)

Sorted by selected sort option (urgency default).

---

## 11. Assess-in-Practice Items

| # | Item | Question | Resolution approach |
|---|------|----------|-------------------|
| 1 | Context line sufficiency | Does one line provide enough for quick triage, or do providers always open the drawer? | Monitor drawer-open rate; if >80%, consider expanding card to two context lines |
| 2 | Quick action usage | Do providers use defer/assign/flag from the expanded card, or always go to drawer? | Track action source; if quick actions unused, simplify card expansion |
| 3 | Ambient strip engagement | Do providers expand the strip, or ignore it? | Track expand rate; if <10%, consider making it more prominent or removing it |
| 4 | REVIEW approval rate | What % of AI-prepared actions are approved without modification? | Track approve/modify/decline ratio; high approval suggests good AI; high decline suggests layer assignment needs tuning |
| 5 | Batch size patterns | How many items do providers typically batch? | Inform batch UI design; if batches are small (2-3), simplify; if large (10+), add bulk approve |
| 6 | Deferral cycling | Do deferred items just get re-deferred? | If cycling >2x, surface as a systemic issue |
| 7 | Expanded card height | Is ~60px expansion enough for quick actions + context? | Adjust based on content; may need more for longer context lines |
| 8 | Card density | How many cards are visible without scrolling? | Target 5-7 visible cards; adjust card height if needed |

---

## 12. Design Decisions

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Priorities as first view | Priorities \| Flow \| Table order | Most providers open a cohort to act, not to study flow structure. Work-first default. | 2026-03-06 |
| 2 | Ambient awareness model | Approach C — persistent strip + expandable detail | Balances focus (action queue uncluttered) with awareness (strip always visible). Mirrors Encounter Status module pattern. | 2026-03-06 |
| 3 | Layer 1 items not in queue | AI-handled items appear only in ambient strip | Keeps queue focused on items needing provider attention. Avoids queue noise. | 2026-03-06 |
| 4 | Card expansion for quick actions | ~60px expansion with actions + one context line | Lightweight triage without opening drawer. Most items can be triaged at this level. | 2026-03-06 |
| 5 | Column reflow on expansion | Cards below shift down, animated transition | Clean layout; avoids overlap. Matches list UI conventions. | 2026-03-06 |
| 6 | Drawer sections | Patient header → Priority context → Actions | Progressive disclosure: who → why → what to do. Actions at bottom after context is established. | 2026-03-06 |
| 7 | REVIEW items streamlined | Approve/Modify/Decline with AI reasoning prominently displayed | Optimized for the common case: provider agrees with AI. One-tap approval. | 2026-03-06 |
| 8 | No deduplication across care flows | Same patient at different nodes = separate cards | Each card represents a different clinical context requiring different actions. Dedup would lose context. | 2026-03-06 |
| 9 | Batch review in drawer | Spot-check list with individual approve/modify/skip + bulk "approve remaining" | Balances thoroughness (review each) with efficiency (bulk approve for trusted items) | 2026-03-06 |
| 10 | Four-layer automation model | Layer 1 (AI auto) / 2 (AI-prepared) / 3 (human+AI) / 4 (human-only) | Clean separation of autonomy levels. Configurable per care flow. Trust-building through ambient visibility. | 2026-03-06 |
| 11 | Canvas control surface | Minimal: expanded card + side drawer. No controls bar, no floating panel, no right rail. | Start simple; add surfaces only when proven need. Card + drawer cover quick and structured tiers. | 2026-03-06 |
| 12 | Two-layer assignment | Node-level (structural, in layer tree) + task-level (dynamic, on priority cards) | Provider can own a node but not every task at it; tasks can be AI-assigned or team-assigned independently | 2026-03-06 |
