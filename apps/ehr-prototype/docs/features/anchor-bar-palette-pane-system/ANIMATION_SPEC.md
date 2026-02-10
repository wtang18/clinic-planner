# Animation Specification

**Last Updated:** 2026-02-08
**Status:** Canonical Reference — All animation behavior
**Supersedes:** Animation sections in SHARED_PATTERNS.md §6, DRAWER_COORDINATION.md §7, SPEC.md (Animation Specifications), AI_CONTROL_SURFACE_V2.md §12 (Animation Specifications)
**Related:** COORDINATION_STATE_MACHINE.md (state transitions this doc animates)

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Animation Strategy](#2-animation-strategy)
3. [Timing Tokens](#3-timing-tokens)
4. [Spring Configurations](#4-spring-configurations)
5. [Transition Choreography — Bottom Bar](#5-transition-choreography--bottom-bar)
6. [Transition Choreography — Cross-Surface](#6-transition-choreography--cross-surface)
7. [Transition Choreography — Context Changes](#7-transition-choreography--context-changes)
8. [Shared Element Transitions](#8-shared-element-transitions)
9. [Content Animations](#9-content-animations)
10. [Interrupted Animation Handling](#10-interrupted-animation-handling)
11. [Accessibility — Reduced Motion](#11-accessibility--reduced-motion)
12. [Implementation Approach](#12-implementation-approach)
13. [Decision Log](#13-decision-log)

---

## 1. Purpose

This document is the **single reference for all animation behavior** in the Bottom Bar System and Left Pane System. It defines choreography, timing, shared element transitions, and interrupted animation handling.

COORDINATION_STATE_MACHINE.md defines **what** transitions occur. This document defines **how** they look and feel.

### Relationship to State Machine

Every animation in this document corresponds to a state transition in COORDINATION_STATE_MACHINE.md §7-§10. The state IDs (E1-E10, N1-N5) are used as references throughout.

---

## 2. Animation Strategy

### Core Principles

1. **Option B staging for direct switches.** Collapse the departing module first, then expand the arriving module. Avoids simultaneous shape-change chaos.
2. **Single-stage for simple transitions.** Bar → palette (solo), palette → bar, and grid-only changes animate in one step.
3. **Cross-surface handoff sequencing.** A module is never visible in both the bottom bar and left pane simultaneously. "Leave A, then appear in B."
4. **Shared element continuity.** Key visual elements (avatar, state indicator) morph between tier positions rather than disappearing and reappearing.
5. **Grid-coordinated horizontal changes.** All width changes go through CSS grid `grid-template-columns` transitions. No independent `motion.div` width animations.

### What Animates vs. What Doesn't

| Animates | Does not animate |
|---|---|
| Grid column width changes | Pane content swaps (instant) |
| Palette vertical expand/collapse | State value changes (instant in reducer) |
| Shared element position/size morphing | Module visibility toggling (controlled by grid) |
| Module fade-in on return from drawer | Pane view icon highlighting |
| Module pop-in on return from drawer | Bottom bar show/hide (display: none toggle) |

---

## 3. Timing Tokens

```typescript
// CSS custom properties
const animationTokens = {
  // Tier transitions
  '--transition-expand':    '300ms ease-out',    // Palette opening (vertical)
  '--transition-collapse':  '200ms ease-in',     // Palette closing (vertical)

  // Grid layout
  '--transition-grid':      '200ms ease-in-out', // Column width changes

  // Cross-module
  '--transition-fade':      '150ms ease-in-out', // Module appearing/disappearing
  '--transition-pop':       '200ms ease-out',    // Module returning from drawer (scale)

  // Shared elements
  '--transition-morph':     '250ms ease-in-out', // Shared element position/size morphing

  // Height (no overshoot)
  '--ease-height':          '[0.32, 0.72, 0, 1]', // iOS-like ease for vertical
};

// Derived totals (for orchestration timeouts)
const TIMING = {
  COLLAPSE_DURATION:       200,   // ms
  EXPAND_DURATION:         300,   // ms
  GRID_DURATION:           200,   // ms
  FADE_DURATION:           150,   // ms
  MORPH_DURATION:          250,   // ms
  DIRECT_SWITCH_TOTAL:     500,   // collapse + expand (overlapping)
  CROSS_SURFACE_TOTAL:     400,   // collapse + grid + swap
};
```

---

## 4. Spring Configurations

For Framer Motion spring-based animations (used for content elements, not layout):

```typescript
// Standard spring — buttons, badges, icons
const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

// Snappy spring — quick feedback (tap responses)
const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 600,
  damping: 40,
};

// Gentle spring — content reveals, staggered items
const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Height transition — no overshoot (tween, not spring)
const HEIGHT_TRANSITION = {
  type: 'tween',
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1],  // iOS-like
};
```

---

## 5. Transition Choreography — Bottom Bar

All transitions between bottom-bar-only states. Reference state IDs from COORDINATION_STATE_MACHINE.md §6.

### 5.1 Bar → Palette (solo module)

**States:** N1→N3, E7→E8, E9→E10
**What happens:** Module is already at palette width (solo bar = palette width). Only vertical expansion.

```
T=0ms:    Palette content expands upward from bar top edge [300ms ease-out]
          Shared elements morph from bar positions → palette positions [250ms]
T=300ms:  Settled
```

Single-stage. No grid change. The simplest transition.

### 5.2 Bar → Palette (two modules, other goes to anchor)

**States:** E1→E3 (AI palette), E1→E5 (TM palette)
**What happens:** Tapped module expands to palette, other module compresses to anchor. Grid columns shift.

```
T=0ms:    Grid columns transition [200ms ease-in-out]
            (bar+bar proportional → anchor + palette)
          Departing module's shared elements morph to anchor positions [250ms]
          Expanding module begins vertical palette expand [300ms ease-out]
          Expanding module's shared elements morph to palette positions [250ms]
T=300ms:  Settled
```

Single-stage — grid shift and vertical expand happen simultaneously. Grid cells isolate modules, preventing overlap. Shared elements provide visual continuity during the resize.

### 5.3 Palette → Bar (both restore)

**States:** E3→E1, E5→E1, E4→E2, E6→E2
**What happens:** Palette collapses, anchor expands back to bar. Grid reverses.

```
T=0ms:    Palette collapses downward [200ms ease-in]
          Grid columns transition [200ms ease-in-out]
            (anchor + palette → bar+bar proportional)
          Shared elements morph from palette/anchor positions → bar positions [250ms]
T=200ms:  Settled
```

Single-stage. Collapse and grid shift are the same duration so they settle together.

### 5.4 Palette → Bar (solo, other in drawer)

**States:** E8→E7, E10→E9, N3→N1, N4→N2
**What happens:** Solo palette collapses. Width unchanged (solo = palette width at both tiers).

```
T=0ms:    Palette collapses downward [200ms ease-in]
          Shared elements morph from palette positions → bar positions [250ms]
T=200ms:  Settled
```

Vertical only. Simplest collapse.

### 5.5 Direct Switch — Anchor Tap (Option B Staged)

**States:** E3→E5, E5→E3
**What happens:** Departing palette collapses, grid shifts, arriving palette expands. This is the highest-complexity bottom-bar transition.

```
Stage 1 — Collapse departing palette:
T=0ms:    Departing palette collapses vertically [200ms ease-in]
          Departing shared elements morph toward anchor position [200ms]
          Grid columns begin transitioning [200ms ease-in-out]
            (e.g., anchor+palette → palette+anchor)
T=200ms:  Departing module at anchor. Grid settled. Arriving module at palette width.

Stage 2 — Expand arriving palette:
T=200ms:  Arriving palette expands vertically [300ms ease-out]
          Arriving shared elements morph from anchor → palette positions [250ms]
T=500ms:  Settled
```

Total: ~500ms. The grid shift rides with Stage 1 so column positions are correct before Stage 2 begins.

**Orchestration:** Stage 2 triggers on `transitionend` of the palette collapse, or a 200ms `setTimeout` as fallback.

---

## 6. Transition Choreography — Cross-Surface

Transitions where a module moves between the bottom bar and left pane. The critical rule: **a module is never visible in both surfaces simultaneously.**

### 6.1 Palette → Drawer (Escalation via [↗])

**States:** E3→E7, E5→E9, E3→E10¹, E5→E8¹, N3→N5
**What happens:** Palette dismisses entirely (not to bar), module appears in left pane.

¹ When other module's palette stays (per corrected transitions)

```
Stage 1 — Leave bottom bar:
T=0ms:    Palette dismisses (collapse + fade out) [200ms ease-in]
          Shared elements fade out with palette [200ms]
T=200ms:  Palette gone. Module in neither surface (clean handoff point).

Stage 2 — Enter left pane + adjust bottom bar:
T=200ms:  Left pane content swaps to drawer view (instant — no animation)
          Grid adjusts for remaining module [200ms ease-in-out]
            If other module was anchor → expands to bar or stays palette
            If solo → grid becomes single-column at palette width
T=400ms:  Settled
```

Total: ~400ms.

### 6.2 Drawer → Bar (De-escalation via pane view switch or collapse)

**States:** E7→E1, E9→E1, E8→E5², E10→E3², N5→N1
**What happens:** Module leaves left pane, appears in bottom bar at bar tier.

² When other module's palette is open, returning module lands at anchor

```
T=0ms:    Left pane content swaps to new view (instant)
          Grid adjusts — adds column for returning module [200ms ease-in-out]
            Solo module shrinks from palette width → proportional bar width
T=50ms:   Returning module fades in [150ms ease-in-out]
          Returning module pops (scale 1.05 → 1.0) [200ms ease-out]
T=200ms:  Settled
```

Total: ~200ms. The 50ms delay before fade-in ensures the pane has swapped first (no double-rendering).

### 6.3 Drawer Swap (AI drawer → TM drawer, or vice versa)

**States:** E7→E9, E9→E7, E8→E9³, E10→E7³
**What happens:** One module leaves the pane, the other enters. Bottom bar modules swap simultaneously.

³ When a palette is involved, it de-escalates as part of the swap

```
T=0ms:    Left pane content swaps (instant crossfade or simple swap)
          Bottom bar: departing module fades in at bar [150ms]
          Bottom bar: arriving module fades out [150ms]
          (crossfade in bottom bar)
T=200ms:  Settled
```

Both modules change simultaneously on different surfaces. The pane swap is the primary event; the bottom bar crossfade is secondary.

---

## 7. Transition Choreography — Context Changes

### 7.1 Module Returning from Drawer (Two-Column Restored)

**Trigger:** Pane collapses or view switches to menu while one module in drawer and other at bar.
**What happens:** Solo bar shrinks, returning module appears beside it.

```
T=0ms:    Solo module bar shrinks from palette width → proportional width [200ms ease-in-out]
T=0ms:    Returning module fades in + pops [200ms]
            Scale: 0.95 → 1.0 (subtle, not dramatic)
            Opacity: 0 → 1
T=200ms:  Settled
```

The fade+pop gives the returning module a clear "arriving" signal while the existing bar's shrink is a smooth accommodation.

### 7.2 Encounter → Non-Encounter (TM Column Removed)

```
T=0ms:    TM column fades out [150ms]
          Grid transitions to single-column [200ms]
          AI bar expands to palette width (solo) [200ms]
T=200ms:  Settled
```

### 7.3 Non-Encounter → Encounter (TM Column Added)

```
T=0ms:    Grid transitions to two-column [200ms]
          AI bar shrinks from palette width → proportional [200ms]
T=50ms:   TM bar fades in + pops [200ms]
T=200ms:  Settled
```

Same pattern as module returning from drawer — the new column "arrives."

---

## 8. Shared Element Transitions

### 8.1 Concept

Shared elements are UI elements that persist visually across tier changes. Instead of disappearing with the departing tier and reappearing with the arriving tier, they smoothly morph position and size between their locations in each tier.

This creates visual continuity — the user's eye tracks the element and understands the module is "the same thing" at a different density.

### 8.2 Implementation: Framer Motion `layoutId`

Each shared element gets a stable `layoutId` that matches across component instances at different tiers. Framer Motion automatically animates position/size between them on mount/unmount.

```tsx
// In Anchor component (48px tier)
<motion.div layoutId={`${module}-avatar`}>
  <Avatar size={24} initials={initials} />
</motion.div>

// In Bar component (bar tier)
<motion.div layoutId={`${module}-avatar`}>
  <Avatar size={32} initials={initials} />
</motion.div>

// In Palette component (palette tier)
<motion.div layoutId={`${module}-avatar`}>
  <Avatar size={40} initials={initials} />
</motion.div>
```

Requires `<AnimatePresence>` wrapping the tier-switching container and `<LayoutGroup>` for each module to scope animations.

```tsx
<LayoutGroup id="tm-module">
  <AnimatePresence mode="wait">
    {tier === 'anchor' && <Anchor key="anchor" module="tm" ... />}
    {tier === 'bar' && <TranscriptionBar key="bar" ... />}
    {tier === 'palette' && <TranscriptionPalette key="palette" ... />}
  </AnimatePresence>
</LayoutGroup>
```

### 8.3 Shared Elements Per Module

Not every element should be a shared element. Too many creates visual noise. Limit to 2-3 high-value elements per module.

#### Transcription Module

| Element | layoutId | Across Tiers | Visual Value |
|---|---|---|---|
| Patient avatar | `tm-avatar` | anchor → bar → palette | **High** — primary visual identifier, eye anchor |
| Recording state indicator | `tm-state-dot` | anchor → bar → palette | **High** — continuity of recording/paused/error status |
| Record/pause button | `tm-record-btn` | bar → palette | **Medium** — action continuity between tiers |

#### AI Module

| Element | layoutId | Across Tiers | Visual Value |
|---|---|---|---|
| AI icon (sparkle) | `ai-icon` | anchor → bar → palette | **High** — primary visual identifier |
| Suggestion count badge | `ai-badge` | anchor → bar → palette | **Medium** — info continuity |
| Input field | `ai-input` | bar → palette | **Medium** — if bar has a mini input, morph to palette's full input |

### 8.4 Shared Element Timing

Shared elements animate on the `--transition-morph` token (250ms ease-in-out). This is slightly longer than the grid transition (200ms) to allow the element to "settle" after the layout shift.

During Option B staged direct switches:
- **Stage 1:** Departing module's shared elements morph from palette positions → anchor positions (simultaneous with palette collapse)
- **Stage 2:** Arriving module's shared elements morph from anchor positions → palette positions (simultaneous with palette expand)

The user's eye tracks the avatar/indicator as it moves — creating a sense of the module "traveling" rather than "disappearing and reappearing."

### 8.5 Cross-Surface Shared Elements

Shared elements do **not** morph between bottom bar and left pane (cross-surface). The surfaces are physically distant on screen, and a morphing element flying across the viewport would be distracting.

For cross-surface transitions (palette → drawer, drawer → bar):
- Bottom bar shared elements **fade out** with the departing tier
- Left pane content **appears instantly** (no morph from bottom bar)
- On de-escalation, bar shared elements **fade + pop in** (no morph from pane)

### 8.6 Elements That Are NOT Shared

| Element | Reason |
|---|---|
| Drag handle | Only exists in palette tier — no source/target to morph between |
| Palette content body (transcript, suggestions) | Too complex to morph; appears/disappears with tier |
| Bar status text ("Recording · 4:32") | Text content changes between tiers; morph would be confusing |
| Quick action chips | Staggered fade-in is more appropriate (see §9) |
| [↗] escalation affordance | Palette-only element |

---

## 9. Content Animations

Animations for content within a tier (not tier transitions themselves).

### 9.1 Palette Content Reveal

When a palette opens, its content appears with a staggered fade-in:

```
T=0ms:    Palette container expands (§5)
T=100ms:  Context header fades in [150ms]
T=150ms:  Primary content area fades in [150ms]
T=200ms:  Action buttons / chips stagger in [150ms each, 50ms stagger]
T=350ms:  Fully revealed
```

This prevents a "flash of all content at once" and guides the eye top-to-bottom.

### 9.2 Suggestion / Response Items

New items entering a list (suggestions, conversation messages):

```typescript
// Each item
initial: { opacity: 0, x: -8 }
animate: { opacity: 1, x: 0 }
transition: { ...SPRING_GENTLE, delay: index * 0.05 }
```

### 9.3 Badge Count Changes

When a badge count updates (e.g., AI suggestion count changes from 2 → 3):

```typescript
// Scale bump
animate: { scale: [1, 1.2, 1] }
transition: { duration: 0.3, ease: 'easeOut' }
```

### 9.4 Recording State Changes

| State Change | Animation |
|---|---|
| idle → recording | Red dot scales in from 0 → 1 + begins pulsing |
| recording → paused | Pulse stops, dot color transitions red → amber [200ms] |
| paused → recording | Dot color transitions amber → red [200ms], pulse resumes |
| any → error | Dot morphs to exclamation icon [200ms], warning tint |
| recording (ongoing) | Subtle pulse: scale 1.0 → 1.15 → 1.0, 1.5s loop |

### 9.5 Waveform Animation

During active recording, a subtle waveform visualization:
- 3-5 bars with randomized heights
- Animation: each bar oscillates independently, ~0.8-1.2s period
- Amplitude reflects (simulated) audio level
- On pause: bars settle to minimum height over 300ms
- On resume: bars ramp up over 200ms

---

## 10. Interrupted Animation Handling

### 10.1 Rapid Click Protection

If the user triggers a new transition before the current one completes:

**Rule: Cancel current, start new from current visual position.**

Do not queue animations. Do not complete the current animation before starting the new one. Snap to whatever the current interpolated state is and begin the new transition from there.

```typescript
// Pseudocode
function handleTransition(newState) {
  // Cancel any running animation
  cancelCurrentAnimation();

  // Read current visual position (not target position)
  const currentVisualState = readComputedLayout();

  // Start new animation from current visual state to new target
  animateTo(newState, { from: currentVisualState });
}
```

### 10.2 Specific Rapid-Click Scenarios

| Scenario | Behavior |
|---|---|
| Open palette, immediately close | Palette reverses collapse from current height |
| Open palette, immediately tap anchor (direct switch) | Stage 1 starts immediately (palette begins collapsing from current height) |
| Tap anchor during Stage 1 of a direct switch | Cancel Stage 1, reverse — re-expand the departing palette |
| Tap anchor during Stage 2 of a direct switch | Cancel Stage 2, start new Stage 1 (collapse the partially-expanded arriving palette) |
| Escalate to drawer, immediately collapse pane | Palette dismissal may still be animating — let it complete, then proceed with de-escalation. The 200ms palette dismiss is short enough that waiting is acceptable. |

### 10.3 `transitionend` Reliability

CSS `transitionend` events can be unreliable (missed if element is removed, or if transition is interrupted). For Option B staging:

**Primary:** Listen for `transitionend` on the palette collapse to trigger Stage 2.
**Fallback:** `setTimeout(TIMING.COLLAPSE_DURATION)` as safety net.
**Cleanup:** If Stage 2 fires from both event and timeout, the second invocation should be a no-op (check if Stage 2 already started).

```typescript
let stage2Started = false;

function onStage1Complete() {
  if (stage2Started) return; // Idempotent
  stage2Started = true;
  beginStage2();
}

// Primary
paletteEl.addEventListener('transitionend', onStage1Complete, { once: true });

// Fallback
setTimeout(onStage1Complete, TIMING.COLLAPSE_DURATION + 16); // +1 frame buffer
```

---

## 11. Accessibility — Reduced Motion

### 11.1 `prefers-reduced-motion` Support

All animations respect the user's OS-level reduced motion preference.

```typescript
const prefersReducedMotion = useReducedMotion(); // Framer Motion hook
// or
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 11.2 Behavior with Reduced Motion

| Normal Behavior | Reduced Motion Behavior |
|---|---|
| Palette vertical expand (300ms) | Instant height change (0ms) |
| Palette vertical collapse (200ms) | Instant height change (0ms) |
| Grid column transition (200ms) | Instant column change (0ms) |
| Shared element morph (250ms) | Instant position/size change (0ms) |
| Module fade-in (150ms) | Instant opacity change (0ms) |
| Content stagger fade-in | All content appears instantly |
| Recording dot pulse | Static dot, no pulse |
| Waveform animation | Static bars at mid-height |
| Badge scale bump | No scale animation |

**Key principle:** All state changes still occur — only the animated transition between states is removed. The user sees the same before/after, just without motion in between.

### 11.3 Spring Animations with Reduced Motion

```typescript
// Apply conditionally
const transition = prefersReducedMotion
  ? { duration: 0 }
  : SPRING_CONFIG;

// Tap feedback
whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
```

### 11.4 ARIA Announcements

State changes that are normally communicated through animation should have ARIA announcements as fallback:

```html
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Updated dynamically on state changes -->
</div>
```

| State Change | Announcement |
|---|---|
| Palette opened | "[Module] expanded" |
| Palette closed | "[Module] collapsed" |
| Direct switch | "[New module] expanded, [previous module] collapsed" |
| Drawer opened | "[Module] opened in sidebar" |
| Drawer closed | "[Module] returned to bottom bar" |
| Recording started | "Recording started for [Patient Name]" |
| Recording paused | "Recording paused at [duration]" |
| Recording resumed | "Recording resumed" |
| Error | "Transcription error: [description]" |

---

## 12. Implementation Approach

### 12.1 Recommended Library: Framer Motion

Framer Motion is recommended for:
- `layoutId` shared element transitions (§8)
- `AnimatePresence` for mount/unmount animations
- `useReducedMotion` hook
- Spring physics for content animations

### 12.2 CSS Grid for Layout Transitions

Grid column changes use native CSS transitions (not Framer Motion):

```css
.bottom-bar-container {
  display: grid;
  transition: grid-template-columns var(--transition-grid);
}
```

This ensures both columns animate in perfect sync — the grid enforces coordination. Framer Motion `motion.div` is NOT used for column widths (this was the v1 desync bug).

### 12.3 Hybrid Approach

| Concern | Technology |
|---|---|
| Grid column widths | CSS `grid-template-columns` transition |
| Palette height expand/collapse | CSS `height` transition or Framer `HEIGHT_TRANSITION` |
| Shared element morphing | Framer `layoutId` + `LayoutGroup` |
| Content reveals (stagger, fade) | Framer `motion.div` + spring configs |
| Module fade/pop on return | Framer `motion.div` with `initial`/`animate` |
| Recording dot pulse | CSS `@keyframes` animation |
| Waveform bars | CSS `@keyframes` or Framer (simple oscillation) |

### 12.4 Option B Staging Orchestration

For the direct switch (§5.5), implement staging with a simple state machine:

```typescript
type SwitchStage = 'idle' | 'collapsing' | 'expanding' | 'settled';

const [stage, setStage] = useState<SwitchStage>('idle');

// Stage 1: Collapse departing
function beginDirectSwitch(targetModule) {
  setStage('collapsing');
  // Palette collapse animation starts via CSS/Framer
}

// Stage 1 complete → Stage 2
function onCollapseComplete() {
  dispatch({ type: 'ANCHOR_TAPPED', payload: { module: targetModule } });
  setStage('expanding');
  // Palette expand animation starts via CSS/Framer
}

// Stage 2 complete
function onExpandComplete() {
  setStage('settled');
}
```

---

## 13. Decision Log

| # | Decision | Rationale |
|---|---|---|
| 1 | Option B staging for direct switches | Avoids simultaneous shape-change chaos. Collapse-then-expand reads as intentional choreography. Each stage is visually simple. |
| 2 | Single-stage for simple transitions | Bar→palette (solo), palette→bar, and grid-only changes don't need staging. One step is sufficient and faster. |
| 3 | Cross-surface handoff: "leave A, then appear in B" | Module must never be visible in two surfaces. Brief invisibility (1 frame) is imperceptible and preferable to double-rendering. |
| 4 | Shared elements limited to 2-3 per module | More creates visual noise. Avatar and state indicator are highest value. |
| 5 | Framer Motion `layoutId` for shared elements | Minimal code, handles cross-component morphing automatically, likely already in dependency tree. |
| 6 | No cross-surface shared element morphing | Elements flying across the viewport from bottom bar to left pane would be distracting. Fade out + instant appear is cleaner. |
| 7 | CSS grid for column transitions, Framer for content | Grid ensures perfect column sync (v1 bug fix). Framer handles the richer content animations where spring physics add value. |
| 8 | Rapid click: cancel and restart from current position | Never queue animations. Never force completion. Responsive to user input at all times. |
| 9 | `transitionend` + `setTimeout` fallback for staging | `transitionend` is unreliable. Dual approach with idempotency check provides robust orchestration. |
| 10 | All animations respect `prefers-reduced-motion` | WCAG 2.1 AA compliance. State changes still occur, only motion is removed. |
| 11 | Palette → drawer: palette dismisses entirely, not to bar | Escalation is a surface change. No intermediate bar state — palette goes away, module appears in pane. |

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-08 | Initial specification — consolidated from SHARED_PATTERNS.md §6, DRAWER_COORDINATION.md §7, SPEC.md, with new shared element transitions, interrupted animation handling, and Option B staging |
