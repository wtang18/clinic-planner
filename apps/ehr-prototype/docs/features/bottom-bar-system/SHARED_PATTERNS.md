# Shared Patterns — Bottom Bar System Components

**Last Updated:** 2026-02-03
**Status:** Design Complete — Ready for Implementation
**Related:** BOTTOM_BAR_SYSTEM.md (orchestration), TRANSCRIPTION_MODULE.md, AI_SURFACE.md

---

## Table of Contents

1. [Overview](#1-overview)
2. [Drag Handle](#2-drag-handle)
3. [Mini Anchor](#3-mini-anchor)
4. [Controls Bar](#4-controls-bar)
5. [Progressive Disclosure Tiers](#5-progressive-disclosure-tiers)
6. [Animation Specifications](#6-animation-specifications)
7. [Accessibility Requirements](#7-accessibility-requirements)

---

## 1. Overview

Both the Transcription Module and AI Surface share common interaction patterns and components. This document specifies the shared primitives to ensure consistency and enable component reuse.

### Shared Components

| Component | Used By | Purpose |
|---|---|---|
| Drag Handle | Both palettes, both drawers | Collapse/dismiss affordance |
| Mini Anchor | Both modules (when other is expanded) | Persistent presence + direct switch |
| Controls Bar | Transcription palette + drawer | Consistent action zone (AI Surface has its own input row pattern) |
| Tier System | Both modules | Consistent progressive disclosure model |

---

## 2. Drag Handle

A horizontal handle bar at the top of palettes and drawers. Serves as both a visual affordance and an interactive element.

### Appearance

```
═══
```

Small horizontal bar, centered, subtle (gray on dark surface or dark on light surface, depending on theme). ~40px wide, 4px tall, rounded ends.

### Interactions

| Gesture | Action |
|---|---|
| **Tap** | Collapses palette to bar / drawer to palette |
| **Drag down** | Collapses with gesture-following animation |
| **Drag up** (from palette) | Could escalate to drawer (optional, implementation-dependent) |

### Rules

- Same component instance in both modules — no behavioral differences
- Always the topmost element in palette and drawer views
- Does not appear in bar or mini states
- Tap target area extends beyond visual handle for accessibility (minimum 44px tall tap target)

---

## 3. Mini Anchor

A 48px tappable icon that represents a module when the other module is expanded to palette or drawer.

### Anatomy

```
┌──────┐
│ icon │
│  ●   │ ← badge (optional)
└──────┘
  48px
```

### Per-Module Configuration

| Property | Transcription Mini Anchor | AI Mini Anchor |
|---|---|---|
| Icon | Mic / waveform | Sparkle / AI mark |
| Badge type | State dot (recording/paused/error) | Count or dot (suggestions/nudges/activity) |

### Badge Specifications

**Transcription badges:**

| State | Badge | Visual |
|---|---|---|
| idle | None | — |
| recording | Pulsing red dot | 8px circle, #EF4444, pulse animation 1.5s ease-in-out |
| paused | Static amber dot | 8px circle, #F59E0B, no animation |
| processing | Spinner | 8px, rotating, subdued color |
| error | Red exclamation | 8px, #EF4444, static |

**AI badges:**

| State | Badge | Visual |
|---|---|---|
| Nothing pending | None | — |
| Suggestions waiting | Numeric count | Filled circle with number, accent color |
| Nudge pending | Tinted dot | 8px circle, theme accent color |
| Activity running | Subtle pulse | Icon itself pulses subtly |
| Alert | Numeric + warning tint | Filled circle with number, warning color |

### Interaction

| Gesture | Action |
|---|---|
| **Tap** | Direct switch — opens own palette, closes other module's palette/drawer |
| **Long press** | Reserved for future (tooltip? quick peek?) |

### Positioning

Mini anchors occupy the grid column of their parent module. When in mini state, the column compresses to 48px.

---

## 4. Controls Bar

A fixed-bottom action zone used in the Transcription Module's palette and drawer. The AI Surface uses its own input row pattern (text input + mic + send), but both share the principle of pinned-bottom actions.

### Layout Principle

```
┌───────────────────────────────────────────────────────┐
│  [Secondary actions]    Status    [Primary action] [⚙] │
└───────────────────────────────────────────────────────┘
   Left                  Center              Right (pinned)
```

- **Primary action** always occupies the rightmost position (before settings gear)
- **Secondary/destructive actions** positioned left-side, spatially separated from primary
- **Status indicator** (duration, state) centered

### Consistency Rule

The Controls Bar is the **same component** in both palette and drawer. Identical layout, identical positions. Users build muscle memory once.

---

## 5. Progressive Disclosure Tiers

Both modules follow the same tier model:

| Tier | Height | Purpose | Shared Pattern |
|---|---|---|---|
| **Mini** | 48px | Persistent anchor when other module expanded | Mini Anchor component |
| **Bar / Minibar** | ~48px (single line) | Default state — status + direct actions | Module-specific content |
| **Palette** | Variable (~150-400px) | Expanded detail + additional controls | Drag Handle + content zones |
| **Drawer** | Full panel | Complete feature view | Drag Handle + tabs + content + controls |

### Tier Transitions

| Transition | Animation | Duration |
|---|---|---|
| Bar → Palette | Vertical expand upward from bar | 300ms |
| Palette → Bar | Vertical collapse downward | 200ms |
| Palette → Drawer | Expand to full panel / slide-over | 300ms |
| Drawer → Palette | Collapse / reverse slide | 200ms |
| Bar → Mini | Horizontal compress | 200ms (coordinated with grid) |
| Mini → Bar | Horizontal expand | 200ms (coordinated with grid) |

### Tier Interactions (Shared Grammar)

| Gesture | From Tier | To Tier |
|---|---|---|
| Tap bar/minibar area (not action buttons) | Bar/Minibar | Palette |
| Tap drag handle | Palette | Bar/Minibar |
| Drag handle down | Palette | Bar/Minibar |
| Tap [↗] or escalation affordance | Palette | Drawer |
| Tap drag handle | Drawer | Palette (or Bar, depending on module) |
| Tap other module's mini anchor | Any | Forces down to mini, other opens |
| Escape key | Palette/Drawer | Bar/Minibar (both modules restore) |

---

## 6. Animation Specifications

### Timing Tokens

| Token | Value | Usage |
|---|---|---|
| `--transition-expand` | 300ms ease-out | Opening palette, drawer |
| `--transition-collapse` | 200ms ease-in | Closing palette, drawer |
| `--transition-grid` | 200ms ease-in-out | Grid column changes (mini ↔ bar) |
| `--transition-switch` | 300ms total | Direct switch between modules (200ms collapse + 100ms overlap + 300ms expand) |

### Grid Animation

All horizontal layout changes animate via `grid-template-columns` transition on the container. This ensures both modules animate in perfect sync — no independent `motion.div` desync issues (the v1 bug).

```css
.bottom-bar-container {
  display: grid;
  transition: grid-template-columns var(--transition-grid);
}
```

### Vertical Expansion

Palettes and drawers expand vertically from the bar. The expansion origin is the top edge of the bar (expand upward), not the bottom of the viewport.

### Coordination Sequence

When performing a direct switch (tap mini anchor):

```
T=0ms:    Open module begins collapsing (200ms)
T=100ms:  Grid columns begin transitioning (200ms)
T=200ms:  Open module fully collapsed, grid mostly transitioned
T=200ms:  Target module begins expanding (300ms)
T=500ms:  Target module fully expanded, grid settled
```

Total perceived duration: ~400ms (overlapping animations).

---

## 7. Accessibility Requirements

### ARIA Live Regions

Recording state changes must be announced to screen readers:

```html
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Updated dynamically -->
  Recording in progress. Duration: 4 minutes 32 seconds.
</div>
```

| State Change | Announcement |
|---|---|
| idle → recording | "Recording started for [Patient Name], [Encounter Label]" |
| recording → paused | "Recording paused at [duration]" |
| paused → recording | "Recording resumed" |
| recording → processing | "Processing transcription" |
| auto-pause (workspace switch) | "Recording paused — navigated away from encounter" |
| error | "Transcription error: [error description]" |

### Keyboard Navigation

| Key | Action |
|---|---|
| Tab | Navigate between transcription bar and AI minibar |
| Enter/Space | Activate focused control (mic, pause, resume) |
| Escape | Close open palette/drawer, restore both to bar |
| ⌘K (or Ctrl+K) | Open AI palette directly |

### Focus Management

| Event | Focus Behavior |
|---|---|
| Palette opens | Focus moves to first interactive element in palette |
| Palette closes | Focus returns to the bar element that opened it |
| Direct switch (mini anchor tap) | Focus moves to first interactive element in newly-opened palette |
| Drawer opens | Focus moves to first interactive element in drawer |

### Minimum Tap Targets

All interactive elements must meet minimum 44×44px tap targets per WCAG 2.1 AA, including:

- Mini anchor (48px — meets requirement)
- Drag handle tap area (extend to 44px tall minimum)
- Bar action buttons
- Palette/drawer controls

### Color Independence

Recording state must not be communicated by color alone:

| State | Color | Non-color indicator |
|---|---|---|
| recording | Red dot | Pulsing animation + "Recording" text + waveform |
| paused | Amber dot | Static + "Paused" text + frozen waveform |
| error | Red | Exclamation icon + error text |

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-03 | Initial specification — extracted shared patterns from Transcription Module and AI Surface design sessions |
