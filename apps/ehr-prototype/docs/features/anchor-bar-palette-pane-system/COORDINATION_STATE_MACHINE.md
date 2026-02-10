# Coordination State Machine

**Last Updated:** 2026-02-08
**Status:** Canonical Reference — Supersedes coordination rules in other documents
**Supersedes:** Coordination-related sections in BOTTOM_BAR_SYSTEM.md §3/§5, DRAWER_COORDINATION.md §3/§4/§6, LEFT_PANE_SYSTEM.md §4/§5
**Related:** SHARED_PATTERNS.md (animation specs), AI_DRAWER.md, TRANSCRIPTION_DRAWER.md

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Glossary](#2-glossary)
3. [State Tuple](#3-state-tuple)
4. [Structural Invariants](#4-structural-invariants)
5. [Valid States — txEligible: false](#5-valid-states--txeligible-false)
6. [Valid States — txEligible: true](#6-valid-states--txeligible-true)
7. [User Actions & Transitions — Bottom Bar](#7-user-actions--transitions--bottom-bar)
8. [User Actions & Transitions — Left Pane](#8-user-actions--transitions--left-pane)
9. [User Actions & Transitions — Keyboard Shortcuts](#9-user-actions--transitions--keyboard-shortcuts)
10. [Context Transitions](#10-context-transitions)
11. [Width Model & Grid Templates](#11-width-model--grid-templates)
12. [Animation Specifications](#12-animation-specifications)
13. [Provider Architecture](#13-provider-architecture)
14. [Forbidden States](#14-forbidden-states)
15. [Decision Log](#15-decision-log)

---

## 1. Purpose

This document is the **single source of truth** for coordination between the Bottom Bar System and Left Pane System. It defines every valid state, every user action, and every resulting state transition.

If this document conflicts with BOTTOM_BAR_SYSTEM.md, DRAWER_COORDINATION.md, or LEFT_PANE_SYSTEM.md, **this document wins**. Those documents remain authoritative for their non-coordination content (visual design, component internals, content specifications).

### Why This Document Exists

Coordination rules were previously distributed across three documents with no unified state machine. This caused ambiguity during implementation — particularly around:

- What happens to the bottom bar when a module enters/exits the drawer
- Which state combinations are valid
- How user actions in one system affect the other
- Provider hierarchy and data flow

---

## 2. Glossary

### Tier Names (TierState)

| Tier | Size | Surface | Description |
|---|---|---|---|
| **anchor** | 48px | Bottom bar | Compressed icon indicator. Only valid when the other module is at `palette`. Provides state badge + tap target for direct switch. |
| **bar** | Contextual (see §11) | Bottom bar | Default resting state. Shows status + direct action controls. Width varies: proportional when both modules at bar, palette-width when solo. |
| **palette** | Fixed token width | Bottom bar | Expanded detail view. Variable height. Opened by tapping bar, closed by drag handle or Escape. |
| **drawer** | Full panel | Left pane | Complete feature view. Renders inside the left pane container, not the bottom bar. |

### Module Names

| Module | Abbreviation | Description |
|---|---|---|
| **AI Surface** | AI | AI assistant — suggestions, quick actions, conversation |
| **Transcription Module** | TM | Transcription — recording, transcript, settings |

### Component Names

| Component | Module | Tier |
|---|---|---|
| `Anchor` | Shared (via `module` prop) | `anchor` |
| `AIBar` | AI | `bar` |
| `TranscriptionBar` | TM | `bar` |
| `AIPalette` | AI | `palette` |
| `TranscriptionPalette` | TM | `palette` |
| `AIDrawer` | AI | `drawer` |
| `TranscriptionDrawer` | TM | `drawer` |

### Surfaces

| Surface | Contains | Location |
|---|---|---|
| **Bottom bar** | Modules at `anchor`, `bar`, or `palette` tier | Fixed bottom of viewport |
| **Left pane** | Module at `drawer` tier, or navigation menu | Left sidebar |

### Pane Views

| View | Icon | Content | Availability |
|---|---|---|---|
| `menu` | ☰ | Navigation, search, tasks, patient workspaces | Always |
| `ai` | ✦ | AI drawer (full conversation, suggestions, activity) | Always |
| `transcript` | 🎙 | Transcription drawer (live transcript, controls, settings) | Only when `txEligible: true` AND session exists |

---

## 3. State Tuple

The complete coordination state is defined by five values:

```typescript
interface CoordinationState {
  aiTier: TierState;
  txTier: TierState;           // Only meaningful when txEligible is true
  paneView: PaneView;
  paneExpanded: boolean;
  txEligible: boolean;         // Derived from encounter context
}

type TierState = 'anchor' | 'bar' | 'palette' | 'drawer';
type PaneView = 'menu' | 'ai' | 'transcript';
```

### txEligible Derivation

`txEligible` is a derived boolean, not stored directly. It gates whether the transcription column exists in the bottom bar.

| Encounter Context | txEligible | Rationale |
|---|---|---|
| Active/in-progress encounter | `true` | Provider can start/resume recording |
| Paused encounter (stepped away) | `true` | Session exists, can resume |
| Past/completed encounter | `false` | Read-only chart review; transcript available as canvas object |
| Future/scheduled encounter | `false` | Patient not present; trivially changeable to `true` for pre-charting |
| Non-encounter view (inbox, tasks) | `false` | No patient context for transcription |

When `txEligible: false`, `txTier` is ignored and the transcription column is absent from the bottom bar.

### TM-Internal Mode (Separate Concern)

The coordination state machine does not govern what controls appear inside the TM. That is an internal concern:

```typescript
// NOT part of coordination state — internal to TM components
type TMMode = 'live' | 'pre-chart'; // Future expansion
```

---

## 4. Structural Invariants

These rules must hold at ALL times. Any state violating an invariant is invalid and must be rejected by the reducer.

### INV-1: Drawer ↔ Pane Bidirectional Lock

```
aiTier === 'drawer'  ↔  (paneView === 'ai' AND paneExpanded === true)
txTier === 'drawer'  ↔  (paneView === 'transcript' AND paneExpanded === true)
```

If a module is at drawer, the pane MUST be showing that module's view and MUST be expanded.
If the pane is showing `ai` or `transcript` view, that module MUST be at drawer tier.

### INV-2: Anchor Requires Other Module at Palette

```
aiTier === 'anchor'  →  txTier === 'palette'
txTier === 'anchor'  →  aiTier === 'palette'
```

Anchor exists ONLY to compress a module when the other module's palette needs space. A module at anchor without the other at palette is invalid.

Corollary: **Both modules at anchor is forbidden.** One at anchor + other at bar is forbidden. One at anchor + other at drawer is forbidden.

### INV-3: Mutual Exclusion — One Palette Maximum in Bottom Bar

```
NOT (aiTier === 'palette' AND txTier === 'palette')
```

Only one module can be at palette tier in the bottom bar at any time.

### INV-4: Mutual Exclusion — One Drawer Maximum

```
NOT (aiTier === 'drawer' AND txTier === 'drawer')
```

Only one pane view at a time. Since drawer ↔ pane view (INV-1), two drawers is impossible.

### INV-5: Cross-Surface Independence

A module at drawer tier does NOT force the other module to anchor. The drawer module is not in the bottom bar, so there is no spatial pressure. The remaining module can be at `bar` or `palette` freely.

```
aiTier === 'drawer'  →  txTier ∈ {'bar', 'palette'}  (never 'anchor')
txTier === 'drawer'  →  aiTier ∈ {'bar', 'palette'}  (never 'anchor')
```

### INV-6: Pane Collapse Constraint

```
paneExpanded === false  →  aiTier !== 'drawer' AND txTier !== 'drawer'
```

If the pane is collapsed, no module can be at drawer.

### INV-7: Transcript View Gate

```
paneView === 'transcript'  →  txEligible === true AND session exists
```

### INV-8: txEligible Gate

```
txEligible === false  →  txTier is ignored, transcription column absent
```

---

## 5. Valid States — txEligible: false

When transcription is not eligible (non-encounter, past encounter, future encounter). Only AI participates in the bottom bar.

| ID | aiTier | paneView | paneExpanded | Bottom Bar | Left Pane | Notes |
|---|---|---|---|---|---|---|
| **N1** | `bar` | `menu` | `true` | AI bar (palette width) | Menu | Default non-encounter |
| **N2** | `bar` | `menu` | `false` | AI bar (palette width) | Collapsed | Pane collapsed |
| **N3** | `palette` | `menu` | `true` | AI palette | Menu | AI palette open |
| **N4** | `palette` | `menu` | `false` | AI palette | Collapsed | Palette stays on pane collapse |
| **N5** | `drawer` | `ai` | `true` | **Hidden** | AI drawer | AI in left pane, bar empty |

- `paneView: 'transcript'` is forbidden (INV-7 — txEligible is false)
- States N1-N4: AI is solo in the bottom bar, so bar renders at palette width (see §11)
- State N5: Bottom bar container hides entirely (no modules present)

---

## 6. Valid States — txEligible: true

When transcription is eligible (active encounter with session capability).

### Both Modules in Bottom Bar

| ID | aiTier | txTier | paneView | paneExpanded | Bottom Bar Layout | Notes |
|---|---|---|---|---|---|---|
| **E1** | `bar` | `bar` | `menu` | `true` | Two-col proportional | **Default encounter state** |
| **E2** | `bar` | `bar` | `menu` | `false` | Two-col proportional | Pane collapsed, bars unaffected |
| **E3** | `palette` | `anchor` | `menu` | `true` | `anchor + palette` | AI expanded, TM compressed |
| **E4** | `palette` | `anchor` | `menu` | `false` | `anchor + palette` | AI expanded, pane collapsed |
| **E5** | `anchor` | `palette` | `menu` | `true` | `palette + anchor` | TM expanded, AI compressed |
| **E6** | `anchor` | `palette` | `menu` | `false` | `palette + anchor` | TM expanded, pane collapsed |

### One Module in Drawer, Other in Bottom Bar

| ID | aiTier | txTier | paneView | paneExpanded | Bottom Bar Layout | Notes |
|---|---|---|---|---|---|---|
| **E7** | `drawer` | `bar` | `ai` | `true` | TM bar solo (palette width) | AI in pane |
| **E8** | `drawer` | `palette` | `ai` | `true` | TM palette solo | AI in pane, TM expanded |
| **E9** | `bar` | `drawer` | `transcript` | `true` | AI bar solo (palette width) | TM in pane |
| **E10** | `palette` | `drawer` | `transcript` | `true` | AI palette solo | TM in pane, AI expanded |

**Key:** In E7-E10, the solo module in the bottom bar operates independently. It can be at `bar` or `palette` without affecting the drawer module. When solo at `bar`, it renders at palette width (see §11).

### Summary of All Valid States

Total: 5 (non-encounter) + 10 (encounter) = **15 valid states**

Any state not listed here is **forbidden** (see §14).

---

## 7. User Actions & Transitions — Bottom Bar

Every bottom bar interaction and its resulting state change. Each row specifies the exact before → after state. Transitions that don't change state (no-ops) are omitted.

### Tap Bar (opens palette)

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E1 (bar/bar) | Tap AI bar | E3 (palette/anchor) | TM compresses to anchor |
| E1 (bar/bar) | Tap TM bar | E5 (anchor/palette) | AI compresses to anchor |
| E7 (AI drawer, TM bar) | Tap TM bar | E8 (AI drawer, TM palette) | TM expands, no drawer effect |
| E9 (TM drawer, AI bar) | Tap AI bar | E10 (TM drawer, AI palette) | AI expands, no drawer effect |

**Rule:** Tapping a bar opens that module's palette. If the other module is also in the bottom bar at bar, it compresses to anchor. If the other module is in the drawer, no effect on it.

### Tap Anchor (direct switch)

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E3 (AI palette, TM anchor) | Tap TM anchor | E5 (TM palette, AI anchor) | AI collapses to anchor, TM expands |
| E5 (TM palette, AI anchor) | Tap AI anchor | E3 (AI palette, TM anchor) | TM collapses to anchor, AI expands |

**Rule:** Tapping an anchor performs a direct switch — closes the current palette and opens the tapped module's palette. The previously-expanded module goes to anchor, not bar.

### Drag Handle / Collapse Palette

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E3 (AI palette, TM anchor) | Collapse AI palette | E1 (bar/bar) | Both restore to bar |
| E5 (TM palette, AI anchor) | Collapse TM palette | E1 (bar/bar) | Both restore to bar |
| E4 (AI palette, TM anchor, pane collapsed) | Collapse AI palette | E2 (bar/bar, pane collapsed) | Both restore to bar |
| E6 (TM palette, AI anchor, pane collapsed) | Collapse TM palette | E2 (bar/bar, pane collapsed) | Both restore to bar |
| E8 (AI drawer, TM palette) | Collapse TM palette | E7 (AI drawer, TM bar) | TM returns to bar (solo) |
| E10 (TM drawer, AI palette) | Collapse AI palette | E9 (TM drawer, AI bar) | AI returns to bar (solo) |
| N3 (AI palette, non-encounter) | Collapse AI palette | N1 (AI bar) | AI returns to bar |
| N4 (AI palette, pane collapsed) | Collapse AI palette | N2 (AI bar, pane collapsed) | AI returns to bar |

**Rule:** Collapsing a palette always returns BOTH modules to bar (when both in bottom bar). When one module is in the drawer, only the bottom bar module returns to bar.

### Tap [↗] Escalation in Palette

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E3 (AI palette, TM anchor) | Tap [↗] in AI palette | E7 (AI drawer, TM bar) | AI → drawer, TM → bar (not anchor), pane opens to AI view |
| E5 (TM palette, AI anchor) | Tap [↗] in TM palette | E9 (TM drawer, AI bar) | TM → drawer, AI → bar (not anchor), pane opens to TM view |
| E8 (AI drawer, TM palette) | Tap [↗] in TM palette | E9 (TM drawer, AI bar) | TM palette→drawer (swap), AI drawer→bar |
| E10 (TM drawer, AI palette) | Tap [↗] in AI palette | E7 (AI drawer, TM bar) | AI palette→drawer (swap), TM drawer→bar |
| N3 (AI palette, non-encounter) | Tap [↗] in AI palette | N5 (AI drawer) | AI → drawer, pane opens to AI view, bottom bar hides |

**Rule:** [↗] in palette escalates that module to drawer. The other module de-escalates from anchor to bar (INV-5: drawer doesn't force anchor). If the pane was collapsed, it expands. If the pane was showing menu, it switches to the escalated module's view.

---

## 8. User Actions & Transitions — Left Pane

### Tap View Icon in Pane Header

Switching the pane view de-escalates the outgoing drawer module (if any) and escalates the incoming view's module to drawer (if applicable).

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E1 (bar/bar, menu) | Tap ✦ | E7 (AI drawer, TM bar) | AI escalates to drawer, TM stays bar |
| E1 (bar/bar, menu) | Tap 🎙 | E9 (TM drawer, AI bar) | TM escalates to drawer, AI stays bar |
| E3 (AI palette, TM anchor, menu) | Tap ✦ | E7 (AI drawer, TM bar) | AI escalates palette→drawer, TM anchor→bar |
| E5 (TM palette, AI anchor, menu) | Tap 🎙 | E9 (TM drawer, AI bar) | TM escalates palette→drawer, AI anchor→bar |
| E3 (AI palette, TM anchor, menu) | Tap 🎙 | E10 (TM drawer, AI palette) | TM anchor→drawer, AI palette stays |
| E5 (TM palette, AI anchor, menu) | Tap ✦ | E8 (AI drawer, TM palette) | AI anchor→drawer, TM palette stays |
| E7 (AI drawer, TM bar) | Tap ☰ | E1 (bar/bar, menu) | AI de-escalates drawer→bar |
| E7 (AI drawer, TM bar) | Tap 🎙 | E9 (TM drawer, AI bar) | AI drawer→bar, TM bar→drawer (swap) |
| E8 (AI drawer, TM palette) | Tap ☰ | E5 (TM palette, AI anchor) | AI de-escalates drawer→anchor (TM palette stays) |
| E8 (AI drawer, TM palette) | Tap 🎙 | E9 (TM drawer, AI bar) | AI drawer→bar, TM palette→drawer |
| E9 (TM drawer, AI bar) | Tap ☰ | E1 (bar/bar, menu) | TM de-escalates drawer→bar |
| E9 (TM drawer, AI bar) | Tap ✦ | E7 (AI drawer, TM bar) | TM drawer→bar, AI bar→drawer (swap) |
| E10 (TM drawer, AI palette) | Tap ☰ | E3 (AI palette, TM anchor) | TM de-escalates drawer→anchor (AI palette stays) |
| E10 (TM drawer, AI palette) | Tap ✦ | E7 (AI drawer, TM bar) | TM drawer→bar, AI palette→drawer |
| N1 (AI bar, menu) | Tap ✦ | N5 (AI drawer) | AI escalates to drawer, bar hides |
| N5 (AI drawer) | Tap ☰ | N1 (AI bar, menu) | AI de-escalates drawer→bar |

**De-escalation landing tier:** When a module de-escalates from drawer, it lands at:
- **bar** — if the other module is at bar or drawer (no spatial pressure)
- **anchor** — if the other module is at palette (spatial pressure from palette)

### Tap Collapse Button (◧)

| From State | Action | To State | Side Effects |
|---|---|---|---|
| E1 (bar/bar, menu, expanded) | Collapse pane | E2 (bar/bar, menu, collapsed) | No bottom bar effect |
| E3 (AI palette, TM anchor, expanded) | Collapse pane | E4 (AI palette, TM anchor, collapsed) | No bottom bar effect |
| E5 (TM palette, AI anchor, expanded) | Collapse pane | E6 (TM palette, AI anchor, collapsed) | No bottom bar effect |
| E7 (AI drawer, TM bar) | Collapse pane | E2 (bar/bar, menu, collapsed) | AI de-escalates drawer→bar, paneView→menu |
| E8 (AI drawer, TM palette) | Collapse pane | E6 (TM palette, AI anchor, collapsed) | AI de-escalates drawer→anchor (TM palette stays) |
| E9 (TM drawer, AI bar) | Collapse pane | E2 (bar/bar, menu, collapsed) | TM de-escalates drawer→bar, paneView→menu |
| E10 (TM drawer, AI palette) | Collapse pane | E4 (AI palette, TM anchor, collapsed) | TM de-escalates drawer→anchor (AI palette stays) |
| N1 (AI bar, menu, expanded) | Collapse pane | N2 (collapsed) | No bottom bar effect |
| N3 (AI palette, expanded) | Collapse pane | N4 (AI palette, collapsed) | No bottom bar effect |
| N5 (AI drawer) | Collapse pane | N2 (AI bar, collapsed) | AI de-escalates drawer→bar, bar appears |

**Rule:** Collapsing the pane de-escalates any active drawer module. The de-escalation landing tier follows the same rule as view switching. Pane view resets to `menu`. If pane was showing menu with no drawer active, collapse has no bottom bar effect.

### Tap Expand Button (◧)

| From State | Action | To State |
|---|---|---|
| E2 (bar/bar, collapsed) | Expand pane | E1 (bar/bar, menu, expanded) |
| E4 (AI palette, TM anchor, collapsed) | Expand pane | E3 (AI palette, TM anchor, expanded) |
| E6 (TM palette, AI anchor, collapsed) | Expand pane | E5 (TM palette, AI anchor, expanded) |
| N2 (AI bar, collapsed) | Expand pane | N1 (AI bar, menu, expanded) |
| N4 (AI palette, collapsed) | Expand pane | N3 (AI palette, expanded) |

**Rule:** Expanding the pane always opens to `menu` view. No bottom bar side effects. The user must explicitly tap a view icon to re-enter a drawer.

---

## 9. User Actions & Transitions — Keyboard Shortcuts

### ⌘K — AI Quick Access

**Principle:** "I want to talk to AI quickly." Finds the highest-density visible AI surface and focuses its input. If none expanded, opens AI palette.

| Current State | ⌘K Action | Resulting State |
|---|---|---|
| AI at drawer (pane showing AI) | Focus drawer input field | No state change |
| AI at palette (bottom bar) | Focus palette input field | No state change |
| AI at bar (bottom bar), TM at bar | Open AI palette, focus input | → AI palette, TM anchor |
| AI at bar (solo, other in drawer) | Open AI palette, focus input | → AI palette (solo) |
| AI at anchor (TM at palette) | Open AI palette, TM → anchor | Direct switch + focus |
| Pane collapsed, AI at bar | Open AI palette, focus input | AI → palette (pane stays collapsed) |

### Escape — Collapse Palette

**Principle:** Quick dismiss of palette to unblock content. Only targets palettes in the bottom bar. Never affects drawers or pane state.

| Current State | Escape Action | Resulting State |
|---|---|---|
| AI palette open, TM anchor | Collapse palette | → bar/bar (both restore) |
| TM palette open, AI anchor | Collapse palette | → bar/bar (both restore) |
| AI palette open (solo, other in drawer) | Collapse palette | → AI bar (solo) |
| TM palette open (solo, other in drawer) | Collapse palette | → TM bar (solo) |
| AI drawer, input focused | Blur input | No state change |
| AI drawer, input not focused | No action | No state change |
| TM drawer | No action | No state change |
| Both at bar | No action | No state change |

**Rule:** Escape never closes a pane view. Escape never de-escalates a drawer. Within the left pane, Escape only manages focus (blur active inputs).

---

## 10. Context Transitions

### Encounter → Non-Encounter

When navigating from an active encounter to a non-encounter view (inbox, tasks, etc.):

1. If TM is recording → auto-pause, show toast "Transcription paused — [encounter name]"
2. `txEligible` becomes `false`
3. TM column disappears from bottom bar
4. If AI was at anchor (TM was at palette) → AI restores to bar
5. If TM was at drawer → TM de-escalates, pane switches to menu
6. AI becomes solo in bottom bar at palette width

### Non-Encounter → Encounter

1. `txEligible` becomes `true`
2. TM column appears in bottom bar (idle or restored paused state)
3. AI adjusts from solo to two-column proportional
4. If encounter has paused session → TM bar shows "Paused · 4:32 [Resume]"

### Encounter → Different Encounter

1. If TM is recording → auto-pause current, save segment
2. If TM was at drawer → TM de-escalates (session is encounter-scoped... *correction:* session is patient-scoped per TRANSCRIPTION_DRAWER.md §8)
3. If navigating within same patient → TM state preserved, no pause
4. If navigating to different patient → auto-pause, new encounter shows idle or restored state
5. AI context updates to new encounter

### Recording Continuity Rules

| Rule | Detail |
|---|---|
| One `recording` system-wide | Starting new recording auto-pauses existing |
| Multiple `paused` allowed | Up to 3 concurrent paused sessions |
| Auto-finalize | Paused sessions auto-finalize after 2 hours |
| Manual resume required | Returning to encounter does NOT auto-resume |
| Patient-scoped sessions | Navigation within same patient does not interrupt recording |

---

## 11. Width Model & Grid Templates

### Design Tokens

```typescript
const tokens = {
  '--bottom-bar-palette-width':   '320px',  // Tunable — fixed width for palette and solo bar
  '--bottom-bar-anchor-width':    '48px',   // Fixed
  '--bottom-bar-gap':             '12px',   // Gap between columns
  '--bottom-bar-bar-ratio-tm':    '1fr',    // TM proportion in bar+bar
  '--bottom-bar-bar-ratio-ai':    '2fr',    // AI proportion in bar+bar (2x TM)
  '--bottom-bar-min-tm-bar':      '120px',  // Floor for TM in bar+bar layout
};
```

### Grid Templates by State

| State(s) | Grid Template | Total Width |
|---|---|---|
| **E1/E2** — both at bar | `minmax(var(--min-tm-bar), var(--bar-ratio-tm)) var(--gap) var(--bar-ratio-ai)` | Responsive (proportional) |
| **E3/E4** — AI palette, TM anchor | `var(--anchor-width) var(--gap) var(--palette-width)` | anchor + gap + palette |
| **E5/E6** — TM palette, AI anchor | `var(--palette-width) var(--gap) var(--anchor-width)` | palette + gap + anchor |
| **E7** — AI drawer, TM bar (solo) | `var(--palette-width)` | palette width (single column) |
| **E8** — AI drawer, TM palette (solo) | `var(--palette-width)` | palette width (single column) |
| **E9** — TM drawer, AI bar (solo) | `var(--palette-width)` | palette width (single column) |
| **E10** — TM drawer, AI palette (solo) | `var(--palette-width)` | palette width (single column) |
| **N1/N2** — AI bar (non-encounter) | `var(--palette-width)` | palette width (single column) |
| **N3/N4** — AI palette (non-encounter) | `var(--palette-width)` | palette width (single column) |
| **N5** — AI drawer (non-encounter) | N/A | Bottom bar hidden entirely |

### Key Width Rules

1. **Solo bar = palette width.** When only one module is in the bottom bar, its bar renders at palette token width. This means bar → palette transition is vertical-only (no width change).
2. **Bar + bar is proportional.** AI gets ~2x the width of TM. TM has a minimum floor.
3. **Palette is always palette token width.** Regardless of context.
4. **Anchor is always 48px.**
5. **Bottom bar container is centered** on screen. Total width is the sum of its columns.

---

## 12. Animation Specifications

> **See ANIMATION_SPEC.md for complete animation behavior.**
>
> This document defines **what** transitions occur. ANIMATION_SPEC.md defines **how** they look and feel, including:
> - Timing tokens and spring configurations
> - Transition choreography per transition type (Option B staging for direct switches, single-stage for simple transitions, cross-surface handoff sequencing)
> - Shared element transitions (avatar, state indicators morphing between tiers via Framer Motion `layoutId`)
> - Interrupted animation handling (rapid-click protection)
> - Reduced motion accessibility
>
> Key animation principles:
> - **Grid-coordinated horizontal changes.** All width changes use CSS `grid-template-columns` transitions. No independent `motion.div` width animations.
> - **Cross-surface rule:** A module is never visible in both bottom bar and left pane simultaneously. Transitions use a "leave A, then appear in B" handoff.
> - **Direct switch staging:** Collapse departing palette first (200ms), then expand arriving palette (300ms). Total ~500ms.

---

## 13. Provider Architecture

### Provider Hierarchy

```
AppProviders
└── CoordinationProvider          ← NEW: single source of truth
    ├── State: { aiTier, txTier, paneView, paneExpanded }
    ├── Derived: txEligible (from encounter context)
    ├── Derived: bottomBarVisibility (from state + txEligible)
    ├── Derived: gridTemplate (from bottomBarVisibility)
    ├── Actions: all coordination actions
    │
    ├── LeftPaneContainer
    │   ├── Reads: paneView, paneExpanded
    │   ├── Renders: Menu | AIDrawer | TranscriptionDrawer
    │   └── Dispatches: VIEW_CHANGED, PANE_COLLAPSED, PANE_EXPANDED
    │
    └── BottomBarContainer
        ├── Reads: bottomBarVisibility, gridTemplate
        ├── Renders: modules based on visibility
        └── Dispatches: TIER_CHANGED, DIRECT_SWITCH
```

### Why One Provider (Not Three)

The previous architecture had three separate providers (BottomBarProvider, LeftPaneProvider, LayoutStateProvider) that needed coordination. This caused bugs because:

- Actions in one provider needed side effects in another
- No atomic transitions across providers
- Race conditions between state updates

The CoordinationProvider owns all coordination state and exposes derived values. Individual components read what they need via selectors/hooks.

### Actions

```typescript
type CoordinationAction =
  // Bottom bar interactions
  | { type: 'BAR_TAPPED';       payload: { module: 'ai' | 'tm' } }
  | { type: 'ANCHOR_TAPPED';    payload: { module: 'ai' | 'tm' } }
  | { type: 'PALETTE_COLLAPSED'; payload: { module: 'ai' | 'tm' } }
  | { type: 'PALETTE_ESCALATED'; payload: { module: 'ai' | 'tm' } }

  // Pane interactions
  | { type: 'PANE_VIEW_CHANGED'; payload: { to: PaneView } }
  | { type: 'PANE_COLLAPSED' }
  | { type: 'PANE_EXPANDED' }

  // Keyboard
  | { type: 'CMD_K_PRESSED' }
  | { type: 'ESCAPE_PRESSED' }

  // Context changes
  | { type: 'ENCOUNTER_ENTERED';  payload: { encounterId: string; patientId: string } }
  | { type: 'ENCOUNTER_EXITED' }
  | { type: 'ENCOUNTER_SWITCHED'; payload: { encounterId: string; patientId: string } };
```

### Reducer Structure

The reducer enforces all invariants from §4. Every action handler:

1. Computes the new state
2. Validates against invariants
3. Rejects invalid transitions (no-op or throw in dev)

```typescript
function coordinationReducer(
  state: CoordinationState,
  action: CoordinationAction
): CoordinationState {
  const next = computeNextState(state, action);

  // Invariant validation (dev-mode assertions)
  assertInvariants(next);

  return next;
}
```

### Derived State (Selectors)

```typescript
// What the bottom bar should render
function selectBottomBarVisibility(state: CoordinationState): BottomBarVisibility {
  const aiInDrawer = state.aiTier === 'drawer';
  const txInDrawer = state.txTier === 'drawer';
  const aiVisible = !aiInDrawer;
  const txVisible = state.txEligible && !txInDrawer;

  let layout: 'two-column' | 'single-column' | 'hidden';
  if (aiVisible && txVisible) layout = 'two-column';
  else if (aiVisible || txVisible) layout = 'single-column';
  else layout = 'hidden';

  return {
    ai: { visible: aiVisible, tier: aiVisible ? state.aiTier : null },
    transcription: { visible: txVisible, tier: txVisible ? state.txTier : null },
    layout,
  };
}

// Grid template string
function selectGridTemplate(state: CoordinationState): string {
  const vis = selectBottomBarVisibility(state);
  if (vis.layout === 'hidden') return 'none';
  if (vis.layout === 'single-column') return 'var(--bottom-bar-palette-width)';

  // Two-column cases
  const { ai, transcription } = vis;
  if (ai.tier === 'palette' && transcription.tier === 'anchor')
    return 'var(--bottom-bar-anchor-width) var(--bottom-bar-gap) var(--bottom-bar-palette-width)';
  if (transcription.tier === 'palette' && ai.tier === 'anchor')
    return 'var(--bottom-bar-palette-width) var(--bottom-bar-gap) var(--bottom-bar-anchor-width)';

  // Both at bar (proportional)
  return 'minmax(var(--bottom-bar-min-tm-bar), var(--bottom-bar-bar-ratio-tm)) var(--bottom-bar-gap) var(--bottom-bar-bar-ratio-ai)';
}
```

---

## 14. Forbidden States

For completeness, these are the state combinations that violate invariants and must never occur.

| Forbidden Combination | Violates | Why |
|---|---|---|
| `aiTier: drawer, paneView: menu` | INV-1 | Drawer ↔ pane lock |
| `aiTier: drawer, paneExpanded: false` | INV-1, INV-6 | Drawer requires expanded pane |
| `txTier: drawer, paneView: menu` | INV-1 | Drawer ↔ pane lock |
| `txTier: drawer, paneView: ai` | INV-1 | Wrong view for TM drawer |
| `aiTier: anchor, txTier: anchor` | INV-2 | Both at anchor |
| `aiTier: anchor, txTier: bar` | INV-2 | Anchor without palette |
| `aiTier: anchor, txTier: drawer` | INV-2, INV-5 | Anchor without palette; drawer doesn't force anchor |
| `aiTier: bar, txTier: anchor` | INV-2 | Anchor without palette |
| `aiTier: palette, txTier: palette` | INV-3 | Two palettes |
| `aiTier: drawer, txTier: drawer` | INV-4 | Two drawers |
| `aiTier: drawer, txTier: anchor` | INV-2, INV-5 | Anchor requires palette; drawer doesn't force anchor |
| `txTier: drawer, aiTier: anchor` | INV-2, INV-5 | Same as above, reversed |
| `paneView: transcript, txEligible: false` | INV-7 | Transcript view without eligibility |

---

## 15. Decision Log

Decisions made during the design of this state machine, with rationale.

| # | Decision | Rationale |
|---|---|---|
| 1 | Rename `mini` → `anchor`, `minibar` → `bar` | Eliminates naming confusion between mini/minibar. Anchor describes the 48px state's purpose. Bar is the universal resting state name. **Full rename in code required.** |
| 2 | `txEligible` is a boolean, not a richer type | Coordination only cares "does TM column exist?" Internal TM behavior (live vs pre-chart) is a separate concern. |
| 3 | Past encounter transcripts as canvas objects, not TM | Avoids adding a readonly TM mode that multiplies coordination state. Future enhancement to open in drawer via Option C. |
| 4 | Drawer ↔ pane is a bidirectional lock | If pane shows AI/TM view, the module MUST be at drawer. If module is at drawer, pane MUST show that view. No "pane showing AI while AI is at bar." |
| 5 | Pane collapse only de-escalates drawers | Collapsing while on menu view has no bottom bar effect. Palette-or-below tiers are independent of pane state. |
| 6 | Always re-expand pane to menu | Simplest, most predictable. Menu is the default/most important pane state. Future enhancement: view persistence. |
| 7 | Drawer does NOT force other module to anchor | Drawer removes the module from bottom bar entirely — no spatial pressure. Remaining module stays at bar or can go to palette independently. |
| 8 | Anchor ONLY valid when other module at palette | Anchor solves a spatial problem (palette is wide). No other situation requires it. Both-at-anchor and anchor+bar are forbidden. |
| 9 | Solo bar renders at palette width | When only one module in bottom bar, its bar expands to palette width. Bar → palette becomes vertical-only. Simplifies animation. |
| 10 | Bar+bar is asymmetric: AI gets 2x TM | AI houses more actions and information. TM bar is primarily a status indicator with mic button. TM has a min-width floor. |
| 11 | [↗] in palette is a valid path to drawer | In addition to pane header icons. Provides escalation affordance in context. |
| 12 | Pane header icons can escalate from anchor directly to drawer | Skips bar/palette. Pane is an independent escalation path. |
| 13 | Escape only targets palettes in bottom bar | Quick dismiss of expanded content blocking the canvas. Never affects drawers (prevents accidental loss of deep conversation). |
| 14 | ⌘K focuses highest-density AI surface | If drawer is open, focuses drawer input. If palette is open, focuses palette input. Otherwise opens palette. |
| 15 | Single CoordinationProvider replaces three separate providers | Atomic state transitions, no cross-provider coordination bugs, single source of truth. |
| 16 | Palette width and bar container width are responsive design tokens | Easy to tune later. Not hardcoded pixel values. |
| 17 | Module returning from drawer: fade+pop animation, other module shrinks | Clear "arriving" signal for returning module. Horizontal resize of existing bar is acceptable. |

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-08 | Initial specification — complete state machine extracted from BOTTOM_BAR_SYSTEM.md, DRAWER_COORDINATION.md, LEFT_PANE_SYSTEM.md with clarifications and corrections from design review |
