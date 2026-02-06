# Bottom Bar System — Orchestration Specification

**Last Updated:** 2026-02-03
**Status:** Design Complete — Ready for Implementation
**Related:** TRANSCRIPTION_MODULE.md, AI_SURFACE.md (to be refactored from AI_CONTROL_SURFACE_V2.md), SHARED_PATTERNS.md

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Physical Layout](#2-physical-layout)
3. [Mutual Exclusion Rules](#3-mutual-exclusion-rules)
4. [Mini Anchor System](#4-mini-anchor-system)
5. [State Coordination Matrix](#5-state-coordination-matrix)
6. [Workspace Switching Orchestration](#6-workspace-switching-orchestration)
7. [Voice Input Routing](#7-voice-input-routing)
8. [Summarization Handoff](#8-summarization-handoff)
9. [Responsive Behavior](#9-responsive-behavior)
10. [Role × Workflow Grid Composition](#10-role--workflow-grid-composition)
11. [Open Items](#11-open-items)

---

## 1. System Overview

The Bottom Bar System is a coordinated set of UI modules docked to the bottom of the clinical workspace. It currently comprises two modules:

| Module | Purpose | Spec Document |
|---|---|---|
| **Transcription Module** | Ambient transcription recording, monitoring, and review | TRANSCRIPTION_MODULE.md |
| **AI Surface** | AI awareness, commands, suggestions, nudges, and assistance | AI_SURFACE.md |

Both modules share a common interaction grammar, coordinate their states through mutual exclusion rules, and adapt their layout based on context (encounter vs. non-encounter, role, workflow).

### Design Principles

1. **Cognitive separation** — Transcription ("what the room said") and AI ("what to do about it") are visually and conceptually distinct
2. **Parallel interaction grammar** — Both modules use the same gestures for expand/collapse/switch
3. **Mutual exclusion** — Only one module can be expanded (palette/drawer) at a time
4. **Direct action from bar** — Controls in the bar/minibar are directly actionable without opening palettes
5. **Encounter-scoped transcription** — Transcription module only appears during encounters; AI Surface is always present

---

## 2. Physical Layout

### CSS Grid Architecture

The Bottom Bar is a **single CSS Grid container** with two columns, replacing the v1 architecture of two separate animated components.

```
┌────────────────────────────────────────────────────────────────┐
│  [Transcription Module]  │ gap │  [AI Surface]                │
│  Grid column 1           │     │  Grid column 2               │
└────────────────────────────────────────────────────────────────┘
     Fixed total width — grid enforces constant container
```

### Grid Template by Context

| Context | Grid Template | Rationale |
|---|---|---|
| **In encounter (default)** | `160px 12px 1fr` | Transcription bar + gap + AI minibar |
| **In encounter, transcription mini** | `48px 12px 1fr` | Mini anchor + gap + AI palette/drawer |
| **In encounter, AI mini** | `1fr 12px 48px` | Transcription palette/drawer + gap + AI mini anchor |
| **Outside encounter** | `1fr` | AI Surface full width, no transcription |

### Animation

Grid column transitions use `grid-template-columns` with a single CSS transition, ensuring both modules animate in sync. No independent `motion.div` elements — the grid enforces coordination.

```typescript
type BottomBarLayout =
  | { context: 'encounter'; transcription: TierState; ai: TierState }
  | { context: 'non-encounter'; ai: TierState };

type TierState = 'mini' | 'bar' | 'palette' | 'drawer';
```

---

## 3. Mutual Exclusion Rules

> **📌 Extended by DRAWER_COORDINATION.md** (in `features/left-pane-system/`)
> Mutual exclusion rules are extended for the left pane drawer tier.
> Cross-surface combinations (drawer in left pane + palette in bottom bar) are now allowed.

### Core Rule

**Only one module can be at palette tier or above at any time.** The other module must be at bar or mini tier.

### Tier Hierarchy

```
drawer > palette > bar > mini
```

When a module opens its palette or drawer, the other module is forced down:

| Opening module | Other module forced to |
|---|---|
| Palette | Mini |
| Drawer | Mini |

### Transition Rules

| Current State | User Action | Result |
|---|---|---|
| Both at bar | Tap transcription bar | Transcription → palette, AI → mini |
| Both at bar | Tap AI minibar | AI → palette, Transcription → mini |
| Transcription palette, AI mini | Tap AI mini anchor | AI → palette, Transcription → bar |
| AI palette, Transcription mini | Tap Transcription mini anchor | Transcription → palette, AI → bar |
| Transcription palette, AI mini | Tap [↗] in transcription palette | Transcription → drawer, AI stays mini |
| AI drawer, Transcription mini | Tap Transcription mini anchor | AI → bar, Transcription → palette |

### Forbidden Combinations

| Transcription | AI | Allowed? |
|---|---|---|
| palette | palette | ✗ |
| palette | drawer | ✗ |
| drawer | palette | ✗ |
| drawer | drawer | ✗ |
| bar | bar | ✓ (default) |
| bar | palette | ✓ |
| palette | bar | ✓ |
| mini | palette | ✓ |
| palette | mini | ✓ |
| mini | drawer | ✓ |
| drawer | mini | ✓ |

---

## 4. Mini Anchor System

When a module is forced to mini state, it displays a **mini anchor** — a 48px tappable icon with state-appropriate badging.

### Transcription Mini Anchor

| Recording State | Badge |
|---|---|
| idle | None |
| recording | Pulsing red dot |
| paused | Static amber dot |
| processing | Spinner |
| error | Red exclamation |

### AI Mini Anchor

| State | Badge |
|---|---|
| Nothing pending | None (just icon) |
| Suggestions waiting | Numeric count (e.g., `3`) |
| Nudge pending | Dot indicator (tinted) |
| Activity running | Subtle pulse animation |
| Alert (attention-level) | Numeric badge + warning tint |

### Tap Behavior: Direct Switch

Tapping a mini anchor performs a **direct switch** — opens that module's palette and closes the other module's palette/drawer. One tap, not two.

**Animation sequence:**
1. Open module's palette/drawer collapses (200ms)
2. Tapped module's palette expands (300ms, can overlap by 100ms)
3. Previously-open module restores to bar state

---

## 5. State Coordination Matrix

Complete matrix of valid states and the resulting grid layout:

| Transcription Tier | AI Tier | Grid Template | Notes |
|---|---|---|---|
| bar | minibar | `160px 12px 1fr` | Default encounter state |
| bar | palette | `160px 12px 1fr` | AI expanded, transcription stays bar |
| mini | palette | `48px 12px 1fr` | AI palette dominates |
| mini | drawer | `48px 12px 1fr` | AI drawer dominates |
| palette | mini | `1fr 12px 48px` | Transcription expanded |
| palette | minibar | `1fr 12px 160px` | Transcription palette, AI at bar |
| drawer | mini | `1fr 12px 48px` | Transcription drawer dominates |
| — | minibar (full) | `1fr` | Non-encounter, AI only |

**Note:** When transcription palette or drawer is open, whether AI shows as mini (48px) or minibar depends on available space. On mobile, mini is likely; on desktop, minibar may fit alongside transcription palette. The mutual exclusion rule applies to palette/drawer only — bar and minibar are always permitted alongside the other module's palette.

**Clarification on bar vs. mini:** Opening a palette forces the *other* module to mini. But if a module is already at bar and the other opens a palette, the bar module collapses to mini to yield maximum space to the expanded module.

---

## 6. Workspace Switching Orchestration

When users navigate between workspaces, the Bottom Bar System coordinates both modules.

### Encounter → Different Encounter

1. Transcription: auto-pause current recording, save segment
2. Toast: "Transcription paused — [encounter name]"
3. Sidebar: update indicator (⏸ on previous encounter)
4. New encounter: transcription module appears (idle or restored paused state)
5. AI Surface: context target updates to new encounter

### Encounter → Non-Encounter View

1. Transcription: auto-pause current recording
2. Toast: "Transcription paused — [encounter name]"
3. Sidebar: update indicator
4. Grid layout: transcription module hidden, AI Surface takes full width
5. AI Surface: context adjusts to non-encounter workflow (inbox, schedule, etc.)

### Non-Encounter → Encounter

1. Grid layout: transcription module appears
2. If encounter has paused session: bar shows `Paused · 4:32` + [Resume]
3. If no session: bar shows idle state
4. AI Surface: returns to shared-width layout, context targets encounter

### Recording Continuity Rules

| Rule | Detail |
|---|---|
| One `recording` system-wide | Starting a new recording auto-pauses existing |
| Multiple `paused` allowed | Up to 3 concurrent paused sessions |
| Auto-finalize | Paused sessions auto-finalize after 2 hours |
| Manual resume required | Returning to encounter does not auto-resume |

---

## 7. Voice Input Routing

The Bottom Bar System manages two distinct audio input streams:

| Stream | Module | Purpose | Duration |
|---|---|---|---|
| **Ambient transcription** | Transcription Module | Passive conversation capture | Session-long |
| **Voice commands** | AI Surface | Discrete commands to AI | 2-10 seconds |

### Routing Rules

- Ambient transcription: controlled by Transcription Module bar/palette/drawer
- Voice commands: activated via AI Surface palette input row (mic button, bottom-left)
- **Ambient pauses during voice commands** — resumes automatically after command completes
- The two streams never run simultaneously in v1

### Activation

| Input type | Where | How |
|---|---|---|
| Start/pause/resume ambient | Transcription bar (direct action) | Tap mic/pause/resume button |
| Voice command | AI palette input row | Tap+hold mic or tap+speak+send |

---

## 8. Summarization Handoff

When transcription processing completes, outputs route to different modules:

| Output | Destination | Module |
|---|---|---|
| Full transcript | Transcript tab in drawer | Transcription Module |
| Generated note/summary | Actionable response with [Use this] [Edit] [Regenerate] | AI Surface |

This cross-module handoff maintains cognitive separation:
- Transcription Module: "what was said" (recording artifact)
- AI Surface: "what to do about it" (AI output)

### Sidebar during summarization

Encounter row shows progress arc indicator while processing is active.

---

## 9. Responsive Behavior

### Drawer Responsiveness (Both Modules)

| Breakpoint | Drawer behavior |
|---|---|
| Desktop | Side panel, pushes main content |
| Tablet | Overlay panel |
| Mobile | Bottom sheet, full height |

Both modules' drawers follow the same responsive pattern — independent panels, shared behavior.

### Bar/Minibar at Mobile Breakpoints

On narrow screens, the bar and minibar may need to compress. Priority:

1. Action buttons are always visible and tappable
2. Text content truncates before controls are hidden
3. Mini anchors maintain 48px minimum regardless of breakpoint

---

## 10. Role × Workflow Grid Composition

The grid composition varies by role and workflow context:

| Role | Workflow | Transcription Module | AI Surface | Grid |
|---|---|---|---|---|
| Provider | Encounter | Bar (idle/recording) | Minibar | Two-column |
| Provider | Inbox | Hidden | Full-width minibar | Single-column |
| Provider | Schedule | Hidden | Full-width minibar | Single-column |
| MA | Encounter | Bar | Minibar | Two-column |
| MA | Check-in | Hidden | Full-width minibar (compact) | Single-column |
| Scribe (future) | Encounter | Bar/Palette/Drawer | Mini/Minibar | Two-column |
| X-Ray Tech | Encounter | Bar (idle) | Minibar (compact) | Two-column |
| Front Desk | Check-in | Hidden | Full-width minibar (status-only) | Single-column |
| Clinic Manager | Admin | Hidden | Full-width minibar | Single-column |

---

## 11. Open Items

### Needs Design Session
- [ ] AI Surface drawer content and behavior (conversation history, nudge/activity logs)
- [ ] Error and degraded states — how both modules behave during AI service failure, network drops, partial results
- [ ] Critical Alert System — how alerts interact with the bottom bar (overlay? push?)

### Needs Implementation Detail
- [ ] CSS Grid transition timing — exact animation tokens for grid-template-columns changes
- [ ] Mobile bottom sheet behavior — how palette/drawer coexist with system bottom bars
- [ ] Multi-tab coordination — how recording state syncs if same encounter open in two browser tabs

### Future Scope
- [ ] Third module possibilities (e.g., team chat, notifications panel)
- [ ] Scribe-specific layout: transcription drawer as primary + AI minibar
- [ ] Tablet split-view: both drawers side by side on large landscape displays

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-03 | Initial specification — extracted from AI_CONTROL_SURFACE_V2.md + new transcription module coordination rules |
