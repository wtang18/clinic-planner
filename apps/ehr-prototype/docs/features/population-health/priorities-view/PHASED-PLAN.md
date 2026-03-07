# Priorities View — Phased Build Plan

**Status:** Not started
**Prerequisites:** Main Population Health Phase 3 (center pane + layer tree) and Layer Tree Enhancements LT2 ("Show Mine" + selection sync) must be complete. The Priorities view depends on the multi-select selection state from the layer tree.
**Total estimated effort:** ~10-14 hours across 4 phases

---

## Phase Overview

| Phase | Name | Effort | Dependencies |
|-------|------|--------|-------------|
| **PV1** | Priority card list + data model | ~3-4 hrs | Layer tree LT2 complete |
| **PV2** | Card interaction — quick actions + expansion | ~2-3 hrs | PV1 complete |
| **PV3** | Side drawer — structured actions + REVIEW flow | ~3-4 hrs | PV2 complete |
| **PV4** | Ambient strip + batch actions + polish | ~2-3 hrs | PV3 complete |

PV1 and PV2 could partially overlap (card rendering + interaction can be iterative), but PV3 depends on PV2's card interaction patterns being stable.

---

## Phase PV1: Priority Card List + Data Model

**Goal:** Render the priority queue as a scrollable list of cards, driven by layer tree selection state, with sort controls.

### Deliverables

1. **PriorityItem data model + mock data**
   - `PriorityItem` type definition with all fields (§10.1)
   - Mock priority items for all 3 care flows (15-20 items across badge types)
   - Computation: filter by selected nodes, exclude deferred, exclude Layer 1, sort by urgency

2. **Card rendering**
   - Card layout: checkbox + patient name + badge + time + care flow context + context line
   - Badge visual treatments (URGENT, REVIEW, ACTION, MONITOR)
   - Escalation marker (🔺) on cross-boundary items
   - Stale indicator for items past threshold

3. **Sort controls**
   - Urgency / By node / By date sort options
   - Item count display
   - Sort state persistence within session

4. **Layer tree integration**
   - Subscribe to layer tree selection state
   - Recompute queue on selection change
   - Empty state for "all clear"

### Acceptance criteria

- Priority cards render from mock data, filtered by layer tree selection
- "Show Mine" default selection produces a focused queue
- Sort by urgency, node, and date all work correctly
- Empty state displays when queue is clear

---

## Phase PV2: Card Interaction — Quick Actions + Expansion

**Goal:** Add card focus/expansion with quick action row and column reflow.

### Deliverables

1. **Card expansion**
   - Tap card → expands by ~60px to reveal action row
   - Animated transition (~200ms)
   - Cards below shift down (column reflow)
   - Multiple expanded cards supported
   - Tap again → collapse

2. **Quick action row**
   - Defer: deferral period picker (1hr/4hr/tomorrow/1wk)
   - Assign: popover with team member list + AI option
   - Flag: toggle flag marker on card
   - Details: opens drawer (stub — full drawer in PV3)

3. **Deferral mechanics**
   - Deferred items removed from queue
   - Return after deferral period with "Deferred" indicator
   - Deferral count tracking (prevent infinite cycling)

4. **Checkbox + batch selection state**
   - Check/uncheck individual items
   - Selection count tracked (batch bar in PV4)

### Acceptance criteria

- Cards expand/collapse with smooth animation
- Quick actions (defer, assign, flag) work and update queue
- Column reflow is smooth with no overlap
- Deferred items disappear and return correctly

---

## Phase PV3: Side Drawer — Structured Actions + REVIEW Flow

**Goal:** Build the side drawer with clinical snapshot, priority context, AI reasoning, and node-type-specific action forms.

### Deliverables

1. **Drawer framework**
   - Slide in from right edge, ~40-50% canvas width
   - Dismiss: tap outside or close button
   - Section-based layout with clear visual separation

2. **Section 1: Patient header + clinical snapshot**
   - Demographics, conditions, risk tier
   - Care-flow-specific clinical data points
   - Mock data for each care flow type

3. **Section 2: Priority context**
   - Node-specific context: what automation has done, why escalated
   - AI reasoning display
   - Suggested actions list

4. **Section 3: Actions**
   - Node-type-specific action buttons
   - Tap action → inline form replaces action section
   - Submission → confirmation → auto-close (2s)
   - "Open Patient Workspace" deep link

5. **REVIEW streamlined flow**
   - Approve/Modify/Decline layout for AI-prepared items
   - AI recommendation prominently displayed
   - One-tap approve path
   - Modify → expands to editable form
   - Decline → requires reason

### Acceptance criteria

- Drawer opens from card tap (patient name or "Details")
- Clinical snapshot shows care-flow-relevant data
- AI reasoning displays for items that have it
- Action forms are node-type-specific
- REVIEW items show streamlined approve/modify/decline
- Drawer auto-closes after successful action

---

## Phase PV4: Ambient Strip + Batch Actions + Polish

**Goal:** Add the ambient awareness strip, batch action bar, batch review drawer, and overall polish.

### Deliverables

1. **Ambient awareness strip**
   - Collapsed: single-line with AI/MA/completed counts
   - Expanded: detail list of activity items + "ready for review" links
   - Scoped to current layer tree selection
   - `AmbientActivity` data model + mock data

2. **Batch action bar**
   - Sticky bar at bottom when 2+ items checked
   - Defer all / Assign all / Review actions
   - Selection count display

3. **Batch review drawer**
   - Spot-check list with per-item approve/modify/skip
   - "Approve remaining" bulk action
   - Progress indicator ("2/5 reviewed")

4. **Polish**
   - Smooth transitions between all states
   - Keyboard shortcuts (future consideration)
   - Performance with 50+ items in queue
   - Consistent spacing, typography, badge colors

### Acceptance criteria

- Ambient strip shows accurate AI/team activity counts
- Expanded strip links to REVIEW items in queue
- Batch bar appears on multi-select, actions work
- Batch review drawer processes items sequentially
- "Approve remaining" works for unreviewed items
- View performs well with realistic item counts

---

## Dependency Diagram

```
Main Phase 3 (center pane + base layer tree)
└── Layer Tree LT1 (multi-select + markers)
    └── Layer Tree LT2 ("Show Mine" + sync)
        └── PV1 (card list + data model)
            └── PV2 (quick actions + expansion)
                └── PV3 (side drawer + REVIEW flow)
                    └── PV4 (ambient strip + batch + polish)
```

## Mock Data Requirements

For realistic demo:

| Category | Count | Details |
|----------|-------|---------|
| URGENT items | 3-4 | Time-sensitive, high clinical risk, varied node types |
| REVIEW items | 4-5 | AI-prepared medication adjustments, lab orders, referrals |
| ACTION items | 5-6 | Require provider judgment — abnormal results, non-adherence, complex cases |
| MONITOR items | 3-4 | Lower priority awareness items |
| Layer 1 (ambient only) | 6-8 | Screening outreach, routine reminders — shown in strip, not queue |
| Cross-boundary (🔺) | 2-3 | Items from non-owned nodes escalated to provider |
| Deferred | 2 | Items in deferred state with return dates |
