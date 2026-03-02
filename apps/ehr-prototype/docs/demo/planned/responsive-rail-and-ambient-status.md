# Responsive Processing Rail & Ambient Status

**Status**: Design discussion
**Last discussed**: 2026-03-02

## Goal

Make the processing rail responsive to available canvas width, and surface encounter completeness and charge capture (E&M level) as ambient signals during charting — so providers see gaps and billing impact without switching views.

## Current State

### What exists
- **ProcessingRail** (`src/components/processing-rail/ProcessingRail.tsx`): fixed 200px column in CaptureView's CSS grid, sticky-positioned. Shows batch summaries (AI Drafts, Rx, Labs, Imaging, Referrals) with expand/collapse per batch.
- **CompletenessChecklist** (`src/components/process-view/CompletenessChecklist.tsx`): 8-row checklist with status icons, badges, and tappable rows. Currently only rendered inside ProcessView's `SignOff` section — buried at the bottom.
- **EMLevel / Charge Capture** (`src/components/process-view/EMLevel.tsx`): E&M code (99211-99215) with level bar and 6 element rows. Labeled "Informational" but the product has a charge navigator feature for editing; the default is automatic calculation. Also only inside ProcessView's `SignOff`.
- **SignOffSection** (`src/screens/ReviewView/SignOffSection.tsx`): shared sign-off component with `children` slot. ProcessView passes checklist + E&M as children; ReviewView passes nothing.

### What doesn't exist
- No responsive behavior — rail is always 200px or hidden (when empty)
- No compact variants of completeness or E&M for the rail
- No breakpoint-aware layout switching
- ReviewView doesn't show completeness or E&M
- No icon gutter / collapsed rail state
- No tab badges for mobile

### Related deferred items
- "Unified morphing right rail" — single rail adapting per mode (separate concern, not blocked by this work)
- "Responsive layout" — processing rail fixed at 200px, no responsive behavior

## Design Decisions

### Completeness and charge capture are ambient signals, not just sign-off gates

Today these are only visible when the provider scrolls to the bottom of ProcessView and is about to sign. That's too late — if ROS is missing or the E&M level is lower than expected, the provider should see that while still charting.

### The rail is an ambient shortcut, not the source of truth

Every piece of information in the rail is also available in Process or Review views. The rail provides glanceable status during charting; removing it at narrow widths loses convenience, not capability.

### Charge capture is editable, not informational

The E&M level auto-calculates by default based on documented elements, but the charge navigator allows manual override. The rail's compact E&M display should indicate the current code and be tappable to open the charge navigator. The "Informational" label on the current component should be removed or replaced with the auto/manual indicator.

## Responsive Tiers

### Tier 1: Full rail (canvas width > 600px)

200px rail with two new sections above the existing batch summaries:

```
┌──────────────────────┐
│ COMPLETENESS         │
│ ████████░░░░  5/8    │  ← compact progress bar + fraction
├──────────────────────┤
│ CHARGE      99213    │  ← code pill + mini level bar
│ ▮▮▮░░               │
├──────────────────────┤
│ PROCESSING           │  ← existing header
│ ▶ AI Drafts    ⟳2 ●1│
│ ▶ Prescriptions  ✓3  │
│   ...                │
└──────────────────────┘
```

**Completeness row**: single row — label, mini horizontal progress bar, `n/m` fraction. Color transitions: all green (complete), amber (some pending), neutral (mostly not started). Tappable — navigates to Review view or expands inline detail.

**E&M row**: label, CPT code in a pill badge, mini 5-segment level bar below. Tappable — opens charge navigator. Shows "auto" or "manual" indicator if overridden.

### Tier 2: Icon gutter (canvas width 400-600px)

Rail collapses to ~40px vertical icon strip, same grid position:

```
┌────┐
│ ◔  │  ← completeness: circular progress ring (green/amber/red fill)
│213 │  ← E&M: CPT code as small text in pill
│ ●  │  ← processing: aggregate status dot (spinner/red/green)
└────┘
```

Each icon is tappable — opens a popover with the full detail (the same content as the 200px tier, rendered in a floating card anchored to the icon).

### Tier 3: Hidden rail + tab badges (canvas width < 400px, mobile)

Rail is completely hidden. Status communicated via:
- **Badges on top bar segmented control** tabs (Capture / Process / Review) — dot or count indicating items needing attention
- **Inline content in views** — completeness and E&M render directly in ProcessView and ReviewView (already exists for Process, needs adding to Review via `SignOffSection` children slot)

This tier is **deferred to mobile phase**.

## Implementation Plan

### Phase 1: Responsive rail infrastructure
1. **`useCanvasWidth` hook** — measures the canvas work pane width (not viewport, since left panels eat space). Returns current tier: `'full' | 'gutter' | 'hidden'`.
2. **CaptureView grid changes** — grid column 2 width adapts based on tier. `RAIL_WIDTH` becomes dynamic.
3. **Rail container** — `ProcessingRail` accepts a `variant` prop (`'full' | 'gutter'`) and renders accordingly. At `'hidden'`, CaptureView doesn't render the rail column.

### Phase 2: Compact completeness + E&M rows for full rail
4. **`CompletenessCompact`** — progress bar + fraction row for the 200px rail. Reads from `selectCompletenessChecklist`.
5. **`ChargeCaptureCompact`** — code pill + level bar row. Reads from `selectMockEMLevel`. Tappable.
6. **Wire into `ProcessingRail`** — new rows rendered above batch summaries.

### Phase 3: Icon gutter
7. **`RailGutter`** component — 40px icon strip with completeness ring, E&M pill, processing dot.
8. **Popover on tap** — floating card with detail content, anchored to the tapped icon.

### Phase 4: ReviewView completeness + E&M (quick win)
9. **`useReviewView`** — call `selectCompletenessChecklist` and `selectMockEMLevel` selectors.
10. **ReviewView sign-off** — pass checklist + E&M as `children` to `SignOffSection`.

### Phase 5: Mobile (deferred)
11. Tab badge component + badge state derivation
12. Rail hidden at mobile breakpoint
13. Inline modules in Process/Review views (mostly already done)

## Breakpoint Detection

Canvas width, not viewport width. The canvas pane is what's left after subtracting:
- Left menu/overview panel (360px when open)
- AI drawer (320px when open)
- Padding/gaps

A `useCanvasWidth` hook using `ResizeObserver` on the canvas container element is the right approach — viewport-based media queries can't account for panel combinations.

## Resolved Questions

1. **Gutter icon behavior** — **popover**. Tapping a gutter icon opens a floating card with detail content, anchored to the icon. More surgical than expanding the full rail.
2. **Completeness row in full rail** — **expand inline**. Tapping the compact completeness row expands to show the 8 checklist rows within the rail. Keeps the provider in charting context.
3. **Build order** — responsive shell first (hook → grid → variant prop), then fill in compact content rows.

## Open Questions

1. **Charge navigator entry point** — tapping E&M in the rail should open the charge navigator. Is this a modal, a drawer, or a navigation to a dedicated view? Depends on charge navigator design (not yet prototyped in this codebase).
