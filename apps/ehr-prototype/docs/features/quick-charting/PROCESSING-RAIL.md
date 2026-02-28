# Processing Rail & Process View — Architecture Reference

## Overview

The processing rail surfaces **operational work** — tasks that need completing before an encounter can be signed off. It has two presentations sharing the same underlying state:

| | Compact Rail | Process Canvas |
|---|---|---|
| **Visible when** | Capture mode (charting context) | Process mode (charting context) |
| **Layout** | 200px sidebar, right of chart items | Full canvas (900px max, centered) |
| **Data lens** | Task-centric — groups tasks by parent item category | Item-centric — groups items with tasks joined in |
| **Self-hides** | Yes, when no active items | No |

Both are fed from the same encounter state: `entities.items`, `entities.tasks`, `entities.drafts`, and `relationships.taskToItem`.

## What Populates the Rail

### Object Type 1: AI Drafts

AI-generated narrative content from ambient transcription. Each draft has a lifecycle:

```
generating → pending → accepted | dismissed
```

Only `pending` and `generating` drafts are visible (via `selectActiveDrafts()`).

### Object Type 2: Background Tasks

Operational tasks attached to chart items. Task types include:

| Task type | Category | What it does |
|-----------|----------|-------------|
| `rx-send` | medication | E-prescribe to pharmacy |
| `drug-interaction` | medication | Drug interaction check |
| `formulary-check` | medication | Insurance formulary lookup |
| `lab-send` | lab | Send lab order |
| `prior-auth-check` | imaging | Prior authorization |
| `dx-association` | any orderable | Link diagnosis to order |
| `care-gap-evaluation` | any | Care gap check |

### Routing Into Batches

Tasks are sorted into **5 fixed batches** based on their parent item's `category`:

| Batch | Source category |
|-------|----------------|
| AI Drafts | Drafts with status `pending` or `generating` |
| Prescriptions | `medication` items |
| Labs | `lab` items |
| Imaging | `imaging` items |
| Referrals | `referral` items |

Within the process view, batches are further **sub-grouped** (e.g., medications by pharmacy, labs by in-house vs. vendor, imaging by facility).

### Compact Rail vs. Process View Filtering

The **compact rail** (selector: `selectProcessingBatches()`) excludes tasks with status `completed` or `cancelled`. It's a live work queue that drains as things get done.

The **process view** (selector: `selectProcessViewBatches()`) shows ALL items of relevant categories regardless of task status. Completed tasks appear with green checkmarks on their processing steps. It's a complete operational dashboard for review and sign-off.

## What Is Intent?

`ItemIntent` describes the clinical purpose of a chart item:

| Intent | Badge | Typical category | Generates tasks? |
|--------|-------|-------------------|-----------------|
| `prescribe` | Rx | medication | Yes (rx-send, drug-interaction, formulary-check) |
| `order` | Ord | lab, imaging, procedure | Yes (lab-send, prior-auth-check) |
| `refer` | Ref | referral | Yes (referral tasks) |
| `assess` | Dx | diagnosis | No (documentation only) |
| `rule-out` | R/O | diagnosis | No (differential) |
| `report` | varies | allergy, medication | No (patient-reported, informational) |
| `draft` | — | narrative (CC, HPI, etc.) | No (documentation only) |

**Intent does NOT directly gate rail membership** — category does. But intent determines whether an item generates operational tasks. A `medication` with intent `prescribe` spawns e-prescribe tasks. A `medication` with intent `report` (patient-reported med) does not.

## Available Actions

### Compact Rail (Capture Mode)

| Object | Actions |
|--------|---------|
| AI Draft | Accept, Edit, Dismiss |
| Task | Open Details |

### Process View (Process Mode)

**On drafts:** Accept (creates ChartItem from content), Edit (accept + open detail pane), Dismiss.

**On items:** Each item gets a computed `nextAction` via `deriveNextAction()`:

| Next action | Trigger |
|-------------|---------|
| Review | Task has status `pending-review` |
| Retry | Task `failed` |
| Associate Dx | Item has no linked diagnosis |
| Send | Task is `ready` |

**Batch-level actions:** Send All Rx, Collect Samples, Send All (imaging/referrals), Associate All → Dx.

**Sign-off:** "Sign & Close Encounter" — blocked by unreviewed AI items, pending tasks, or missing diagnoses (errors block; warnings allow).

## How Items Clear

| Object | Clears from compact rail when… | Clears from process view when… |
|--------|------|------|
| AI Draft | Status → `accepted` or `dismissed` | Same |
| Background Task | Status → `completed` or `cancelled` | Never — shows with green checkmarks |
| ChartItem | N/A (rail shows tasks, not items) | Only if deleted from encounter |

On encounter close with `save: false`, all drafts are cleared. With `save: true`, drafts are preserved.

## Key Files

| Purpose | Path |
|---------|------|
| Compact rail component | `src/components/processing-rail/ProcessingRail.tsx` |
| Batch summary row | `src/components/processing-rail/BatchSummaryRow.tsx` |
| Draft item row | `src/components/processing-rail/DraftItemRow.tsx` |
| Task item row | `src/components/processing-rail/ProcessingItemRow.tsx` |
| Full process view | `src/screens/ProcessView/ProcessView.tsx` |
| Batch section (full) | `src/components/process-view/BatchSection.tsx` |
| Draft section (full) | `src/components/process-view/DraftSection.tsx` |
| Process item card | `src/components/process-view/ProcessItemCard.tsx` |
| Sign-off section | `src/components/process-view/SignOff.tsx` |
| Completeness checklist | `src/components/process-view/CompletenessChecklist.tsx` |
| Batch selectors (compact) | `src/state/selectors/batches.ts` |
| Process view selectors (full) | `src/state/selectors/process-view.ts` |
| useProcessingBatches hook | `src/hooks/useProcessingBatches.ts` |
| useProcessView hook | `src/hooks/useProcessView.ts` |
| Draft types | `src/types/drafts.ts` |
| ChartItem types (incl. ItemIntent) | `src/types/chart-items.ts` |
| Draft selectors | `src/state/selectors/drafts.ts` |

## Data Flow

```
EncounterState
  ├── entities.items ──────┐
  ├── entities.tasks ──────┤
  ├── entities.drafts ─────┤
  └── relationships ───────┘
         │
         ├─ selectProcessingBatches() → useProcessingBatches() → ProcessingRail
         │  (task-centric, excludes completed)       (compact, capture mode)
         │
         └─ selectProcessViewBatches() → useProcessView() → ProcessCanvas
            (item-centric, all items)       (full, process mode)
                                            ├─ BatchSection → ChartItemCard
                                            ├─ DraftSection → DraftCard
                                            └─ SignOff → CompletenessChecklist + EMLevel
```
