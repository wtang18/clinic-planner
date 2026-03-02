# Responsive Processing Rail & Ambient Status

**Status**: Design discussion
**Last discussed**: 2026-03-02

## Goal

Make the processing rail responsive to available canvas width, and surface encounter completeness and charge capture (E&M level) as ambient signals during charting — so providers see gaps and billing impact without switching views.

## Current State

### What exists
- **ProcessingRail** (`src/components/processing-rail/ProcessingRail.tsx`): fixed 200px column in CaptureView's CSS grid, sticky-positioned. Shows batch summaries (AI Drafts, Rx, Labs, Imaging, Referrals) with expand/collapse per batch.
- **RailFloatingStatus** (`src/components/processing-rail/RailFloatingStatus.tsx`): compact floating pill for narrow widths. Shows aggregate processing status (icon + label), `position: sticky` with `glass.floating` blur, taps to Process view. Replaces the old gutter/hidden tiers.
- **Two-tier responsive system**: `RailTier = 'full' | 'float'`. Single breakpoint at 640px container width. `useContainerWidth()` hook measures the canvas grid container.
- **CompletenessChecklist** (`src/components/process-view/CompletenessChecklist.tsx`): 8-row checklist with status icons, badges, and tappable rows. Currently only rendered inside ProcessView's `SignOff` section — buried at the bottom.
- **EMLevel / Charge Capture** (`src/components/process-view/EMLevel.tsx`): E&M code (99211-99215) with level bar and 6 element rows. Labeled "Informational" but the product has a charge navigator feature for editing; the default is automatic calculation. Also only inside ProcessView's `SignOff`.
- **SignOffSection** (`src/screens/ReviewView/SignOffSection.tsx`): shared sign-off component with `children` slot. ProcessView passes checklist + E&M as children; ReviewView passes nothing.

### What doesn't exist
- No compact variants of completeness or E&M for the full rail
- ReviewView doesn't show completeness or E&M
- No tab badges for mobile

### Related deferred items
- "Unified morphing right rail" — single rail adapting per mode (separate concern, not blocked by this work)

## Design Decisions

### Completeness and charge capture are ambient signals, not just sign-off gates

Today these are only visible when the provider scrolls to the bottom of ProcessView and is about to sign. That's too late — if ROS is missing or the E&M level is lower than expected, the provider should see that while still charting.

### The rail is an ambient shortcut, not the source of truth

Every piece of information in the rail is also available in Process or Review views. The rail provides glanceable status during charting; removing it at narrow widths loses convenience, not capability.

### Charge capture is editable, not informational

The E&M level auto-calculates by default based on documented elements, but the charge navigator allows manual override. The rail's compact E&M display should indicate the current code and be tappable to open the charge navigator. The "Informational" label on the current component should be removed or replaced with the auto/manual indicator.

## Responsive Tiers

### Tier: Full rail (container width >= 640px)

200px rail with batch summaries. Future: two new sections above — completeness and E&M.

```
┌──────────────────────┐
│ COMPLETENESS         │  ← Phase 2
│ ████████░░░░  5/8    │
├──────────────────────┤
│ CHARGE      99213    │  ← Phase 2
│ ▮▮▮░░               │
├──────────────────────┤
│ PROCESSING           │  ← exists
│ ▶ AI Drafts    ⟳2 ●1│
│ ▶ Prescriptions  ✓3  │
│   ...                │
└──────────────────────┘
```

### Tier: Float (container width < 640px)

No rail column. A compact floating status pill renders inline (right-aligned) above the triage module. It uses `position: sticky` to pin below the top bar on scroll with a `glass.floating` blur treatment.

```
                    ┌─────────────────────────┐
                    │ ⚠ 2 items need attention │
                    └─────────────────────────┘
```

Tapping the pill navigates to Process view where full details live.

### Future: Mobile tab badges (deferred)

Tab badges on the Capture / Process / Review segmented control, communicating status via dot or count indicators. Deferred to mobile phase.

## Implementation Plan

### Phase 1: Responsive rail infrastructure ✅ COMPLETE
1. **`useContainerWidth` hook** — measures the canvas grid container width via `ResizeObserver` callback ref.
2. **Two-tier system** — `RailTier = 'full' | 'float'`, single breakpoint at 640px container width.
3. **CaptureView grid changes** — grid column adapts based on tier. Full tier renders 200px ProcessingRail, float tier renders inline `RailFloatingStatus` pill.
4. **`RailFloatingStatus`** — compact sticky pill with `glass.floating` blur, aggregate status icon + label, taps to Process view.

### Phase 2: Compact completeness in rail ✅ COMPLETE (refined)
5. **`CompletenessCompact`** — always-expanded detail rows with status icons per clinical section + n/m fraction header. No progress bar, no collapse toggle.
6. **`ChargeCaptureCompact`** — created then **removed** (E&M not actionable during charting; lives in sign-off only).
7. **Wire into `ProcessingRail`** — completeness + processing as separate module cards with 8px gap. Processing section guarded by `hasAnyItems`.

### Phase 3: Sign-off consolidation ✅ COMPLETE (refined)
8. **Sign-off removed from ProcessView** — lives in ReviewView only. Process view focuses on operations.
9. **ReviewView sign-off** — shows `EMLevel` as children to `SignOffSection`. Completeness removed from sign-off (lives in rail only).
10. **Sign-off defaults aligned** — "Sign & Close Encounter" used everywhere (was "Sign Encounter" in ReviewView).

### Phase 5+: Rail as navigation hub (planned)
See `rail-navigation-hub.md` for deep-linking, processing restructure (AI embedded in domain areas), and sign-off as completeness row.

### Phase 4: Mobile (deferred)
10. Tab badge component + badge state derivation
11. Inline modules in Process/Review views (mostly already done)

## Breakpoint Detection

Canvas width, not viewport width. The canvas pane is what's left after subtracting:
- Left menu/overview panel (360px when open)
- AI drawer (320px when open)
- Padding/gaps

A `useCanvasWidth` hook using `ResizeObserver` on the canvas container element is the right approach — viewport-based media queries can't account for panel combinations.

## Resolved Questions

1. **Gutter vs float** — **float**. The old 3-tier system (full / gutter / hidden) was replaced with 2 tiers (full / float). A floating status pill preserves processing awareness at all narrow widths without the complexity of a 40px icon strip with popovers.
2. **Completeness row in full rail** — **expand inline**. Tapping the compact completeness row expands to show the 8 checklist rows within the rail. Keeps the provider in charting context.
3. **Build order** — responsive shell first (hook → grid → tier logic), then fill in compact content rows.
4. **Float pill action** — navigates to Process view (not a popover). Keeps interaction model simple.

## Open Questions

1. **Charge navigator entry point** — tapping E&M in the rail should open the charge navigator. Is this a modal, a drawer, or a navigation to a dedicated view? Depends on charge navigator design (not yet prototyped in this codebase).
