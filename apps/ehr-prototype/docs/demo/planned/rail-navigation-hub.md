# Rail as Navigation Hub

**Status**: Design discussion
**Last discussed**: 2026-03-02
**Related**: `responsive-rail-and-ambient-status.md`, `process-tab-philosophy.md`

## Goal

Evolve the processing rail from a passive status display into an active navigation hub. The two modules (Completeness, Processing) become deep-link surfaces: tapping a row switches to the target view and scrolls to the relevant section.

Separately, restructure the Processing module so AI activity is embedded in domain areas (Rx, Labs, Charge Nav, Visit Note) rather than siloed in a separate "AI Drafts" section.

## Current State

### What exists
- **Completeness module** (`CompletenessCompact`): always-expanded checklist rows with status icons in the rail. Capture mode only. No tap action.
- **Processing module**: batch summary rows (AI Drafts, Prescriptions, Labs, Imaging, Referrals) with expand/collapse and status chips. AI Drafts is its own top-level batch, separate from domain areas.
- **ProcessView**: full process canvas with batch details, draft lifecycle actions, sign-off with completeness + E&M.
- **ReviewView**: clinical sections (CC/HPI, ROS, PE, Assessment, Plan, etc.) with sign-off at bottom.
- **Sign-off**: currently in both ProcessView and ReviewView. Title/subtitle/buttonLabel aligned as "Sign & Close Encounter".

### What doesn't exist
- No deep-linking from rail rows to view sections
- No scroll anchoring in ProcessView or ReviewView
- AI activity is not embedded in domain areas
- No mode-switch + scroll-to-section navigation action
- Sign-off is not represented as a completeness row

## Design Decisions

### The rail is a navigation hub, not just a status display

Each row in both modules is tappable. Tapping performs two actions atomically:
1. Switch to the target mode (Review or Process)
2. Scroll to the relevant section within that view

This gives providers a persistent, glanceable map of the encounter that doubles as a shortcut to any section.

### Completeness rows deep-link to Review view

Review view is organized by clinical documentation sections — the same sections tracked by the completeness checklist. Each completeness row maps 1:1 to a Review section.

| Completeness Row | Review Section |
|---|---|
| Chief Complaint | CC / HPI |
| HPI | CC / HPI |
| Review of Systems | ROS |
| Physical Exam | PE |
| Assessment | Assessment |
| Plan | Plan |
| Orders | Plan (orders sub-section) |
| Instructions | Plan (instructions) |
| Sign-off | Sign-off card |

**Sign-off as a completeness row**: The last row tracks whether the encounter is ready to sign. Status derived from the blocker list:
- `documented` — no blockers (ready to sign)
- `pending` — warning-only blockers (can sign with warnings)
- `not-documented` — error blockers (cannot sign)

Tapping navigates to Review > sign-off section.

### Processing rows deep-link to Process view

Each processing row maps to a section in Process view. Tapping navigates to Process > that section.

| Processing Row | Process Section |
|---|---|
| Prescriptions | Rx batch |
| Labs | Labs batch |
| Imaging | Imaging batch |
| Referrals | Referrals batch |
| Visit Note | Visit note section |
| Charge Nav | Charge navigator section |

### AI activity is embedded in domain areas, not siloed

Currently, "AI Drafts" is a separate top-level batch in the processing module. This doesn't scale — in the future, AI may be active in prescriptions (suggesting routes), labs (suggesting panels), charge navigation (auto-calculating E&M), and visit notes (generating narratives).

**New model**: Each processing row represents an area of the chart where work is happening. The "who" (AI, human, system) is visible when you expand the row, not in the row's category.

```
┌──────────────────────┐
│ PROCESSING           │
│ ▶ Prescriptions ⟳    │  ← AI routing, e-prescribe pending
│ ▶ Labs          ✓    │  ← all sent
│ ▶ Imaging       —    │  ← nothing to process
│ ▶ Referrals     —    │
│ ▶ Visit Note    ●    │  ← AI draft needs review
│ ▶ Charge Nav    ✓    │  ← auto-calculated
└──────────────────────┘
```

Expanding a row shows individual work items with their actor and status:
```
│ ▼ Prescriptions ⟳    │
│   🤖 Route to pharmacy   ⟳ │
│   📋 Amoxicillin 500mg   ✓ │
│   📋 Ibuprofen 400mg     ⟳ │
```

The status chips on the collapsed row are aggregates of all work items within that area, regardless of actor.

### Sign-off lives only in Review view

Process view focuses on operational tasks (orders, routing, AI work). Review view focuses on documentation completeness and the signing decision. Sign-off belongs in Review only — having it in Process lets providers skip the review step.

### Completeness lives only in the capture-mode rail

The completeness module appears in the rail during capture mode, where providers are actively documenting and need to see gaps. It does not appear in:
- **Process view** — providers are handling operations, not assessing documentation gaps
- **Review view** — the view itself IS the completeness structure (sections with status icons)

### E&M / Charge Capture lives only in sign-off

The E&M level is a billing artifact useful at sign-off time. It doesn't need a dedicated rail module — it appears in the sign-off card within Review view, and as a "Charge Nav" row in the Processing module (for when AI is actively calculating).

## Navigation Architecture

### `navigateToSection(mode, sectionId)`

A single navigation action that:
1. Calls `handleModeChange(mode)` — dispatches `MODE_CHANGED` + updates NavigationContext
2. After mode transition, scrolls to the element with `data-section-id={sectionId}`

This likely needs to be async — the target view must render before we can scroll to a section within it. Options:
- `requestAnimationFrame` after mode change to wait for render
- Ref callback on the target section that triggers scroll when it mounts with a pending scroll target
- `useEffect` in the target view that checks for a scroll target on mount

### Scroll anchors

Both ProcessView and ReviewView need stable section IDs.

**ReviewView sections** — already defined in `REVIEW_SECTIONS` config:
```ts
// Add data-section-id to each ReviewSection wrapper
<div data-section-id={section.id} ...>
```

Section IDs: `cc-hpi`, `ros`, `pe`, `vitals`, `assessment`, `plan`, `note`
Plus `sign-off` for the SignOffSection.

**ProcessView sections** — need stable IDs for each batch + new sections:
```ts
// Add data-section-id to each batch section
<div data-section-id={batch.type} ...>
```

Section IDs: `prescriptions`, `labs`, `imaging`, `referrals`, `visit-note`, `charge-nav`

### Scroll target state

A shared navigation state (probably in NavigationContext) that holds a pending scroll target:

```ts
interface ScrollTarget {
  sectionId: string;
  timestamp: number;  // prevent stale scrolls
}
```

The target view reads this on mount/update, scrolls to the section, then clears it.

## Data Model Changes

### Processing batch restructure

Current `BatchType`:
```ts
type BatchType = 'ai-drafts' | 'prescriptions' | 'labs' | 'imaging' | 'referrals';
```

Proposed:
```ts
type BatchType = 'prescriptions' | 'labs' | 'imaging' | 'referrals' | 'visit-note' | 'charge-nav';
```

`ai-drafts` is removed. AI draft items are re-parented:
- Visit note drafts → `visit-note` batch
- HPI/A&P narrative drafts → `visit-note` batch
- E&M calculation → `charge-nav` batch
- Future AI suggestions for orders → respective order batch

Each batch item gains an `actor` field:
```ts
interface BatchItem {
  // ... existing fields
  actor: 'ai' | 'provider' | 'ma' | 'system';
}
```

### Completeness checklist additions

Add sign-off as the 9th checklist item:
```ts
const CHECKLIST_SECTIONS = [
  // ... existing 8 sections
  { id: 'sign-off', label: 'Sign-off', categories: [] },  // special: status from blockers
];
```

Sign-off status is computed differently — not from item categories but from the blocker list.

## Implementation Plan

### Phase 5: Simplification cleanup (do first)
1. Remove `ChargeCaptureCompact` from rail
2. Remove `CompletenessChecklist` from sign-off children (both views)
3. Remove sign-off from ProcessView
4. Make `CompletenessCompact` always expanded, remove progress bar
5. Clean up unused imports/exports

### Phase 6: Processing module restructure
6. Add `visit-note` and `charge-nav` batch types
7. Re-parent AI drafts under domain-specific batches
8. Add `actor` field to batch items
9. Update `selectProcessingBatches` to produce new batch structure
10. Update ProcessingRail to render new batch types
11. Update ProcessView to show visit note + charge nav sections

### Phase 7: Deep-linking
12. Add `data-section-id` anchors to ReviewView and ProcessView sections
13. Add `scrollTarget` to NavigationContext
14. Implement `navigateToSection(mode, sectionId)` action
15. Add scroll-on-mount behavior to target views
16. Wire tap handlers on completeness rows → Review sections
17. Wire tap handlers on processing rows → Process sections

### Phase 8: Sign-off as completeness row
18. Add sign-off to `CHECKLIST_SECTIONS` with blocker-derived status
19. Wire tap to `navigateToSection('review', 'sign-off')`

### Phase 9: Mobile (deferred)
20. Tab badge component + badge state derivation

## Target State

```
┌──────────────────────┐
│ COMPLETENESS    6/9  │
│  ✓ Chief Complaint   │  → tap → Review > CC/HPI
│  ✓ HPI              │  → tap → Review > CC/HPI
│  ○ Review of Systems │  → tap → Review > ROS
│  ✓ Physical Exam    │  → tap → Review > PE
│  ✓ Assessment       │  → tap → Review > Assessment
│  ✓ Plan             │  → tap → Review > Plan
│  ✓ Orders           │  → tap → Review > Plan
│  ○ Instructions     │  → tap → Review > Plan
│  ● Sign-off         │  → tap → Review > sign-off
├────────── 8px ───────┤
│ PROCESSING           │
│ ▶ Prescriptions ⟳    │  → tap → Process > Rx
│ ▶ Labs          ✓    │  → tap → Process > Labs
│ ▶ Imaging       —    │  → tap → Process > Imaging
│ ▶ Referrals     —    │  → tap → Process > Referrals
│ ▶ Visit Note    ●    │  → tap → Process > Visit Note
│ ▶ Charge Nav    ✓    │  → tap → Process > Charge Nav
└──────────────────────┘
```

## Open Questions

1. **Scroll behavior** — `scrollIntoView({ behavior: 'smooth' })` or instant? Smooth is nicer but may feel slow if the section is far away.
2. **Active section highlighting** — should the rail highlight which section the provider is currently viewing? Requires scroll spy (IntersectionObserver on section anchors).
3. **Empty processing rows** — show all rows with "—" for empty batches (current behavior), or hide empty rows? Showing all is more predictable; hiding reduces clutter.
4. **Charge nav scope** — what actions live in the charge navigator section of ProcessView? Currently E&M is a pure computed selector with no task lifecycle. Need to model charge calculation as a background activity.
5. **Visit note section** — does this include all AI narrative drafts (HPI, A&P, visit note), or just the final visit note? If all, the section might be renamed "AI Narratives" or "Documentation Drafts."
