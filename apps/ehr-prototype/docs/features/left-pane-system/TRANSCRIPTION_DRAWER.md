# Transcription Drawer — Design Specification

**Last Updated:** 2026-02-06
**Status:** Design Complete — Ready for Implementation
**Extends:** TRANSCRIPTION_MODULE.md §6 (Drawer section — this document provides left-pane-specific detail)
**Related:** LEFT_PANE_SYSTEM.md (pane container), DRAWER_COORDINATION.md (bottom bar interaction)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Layout](#2-layout)
3. [Context Header](#3-context-header)
4. [View Indicator Pill](#4-view-indicator-pill)
5. [Scroll Content Area](#5-scroll-content-area)
6. [Controls Footer](#6-controls-footer)
7. [Settings Modal](#7-settings-modal)
8. [Session Scope Update](#8-session-scope-update)
9. [Decision Log](#9-decision-log)

---

## 1. Overview

The Transcription Drawer is the **drawer-density** rendering of the Transcription Module. Like the AI module, the Transcription Module is a single object with progressive density tiers:

| Tier | Surface | Content Scope |
|---|---|---|
| **Mini anchor** | Bottom bar | Badge only (when AI palette is expanded) |
| **Bar** | Bottom bar | Status line, duration, direct controls (pause/resume) |
| **Palette** | Bottom bar (expanded upward) | Transcript preview, waveform, discard, full controls |
| **Drawer** | Left pane | Full scrolling transcript, controls, settings access |

When the drawer is active in the left pane, all bottom bar transcription surfaces (mini anchor, bar, palette) are **hidden**. The module fully moves to the left pane.

### Relationship to TRANSCRIPTION_MODULE.md

TRANSCRIPTION_MODULE.md defines the full Transcription Module including all four tiers, recording lifecycle, session management, consent UX, and recovery. This document extends §6 (Drawer) with left-pane-specific layout, visual treatment, and the view indicator pill — details that emerged from the left pane architecture design session.

---

## 2. Layout

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░ gradient fade ░░░░░░░░░░░░ │
│ [◧]  [☰] [✦] [🎙]                      │  A: Pane header (from LEFT_PANE_SYSTEM)
│                                         │
│ [LS] Lauren · Cough x 5 days       [⚙] │  E: Context header (floating, blur)
│              ┌──────────────┐           │
│              │ ||||| Live    │           │  View indicator pill (floating)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  🔵 Dr. Chen                     0:42  │
│  So the cough started about five        │
│  days ago, and it's gotten worse...     │
│                                         │
│  🟢 Patient                      0:48  │  C: Scroll area
│  Yeah, especially when I lie down.      │
│  And I've had some chest tightness.     │
│                                         │
│  🔵 Dr. Chen                     1:02  │
│  Any fever or shortness of breath?  ▌   │
│                                         │
├─────────────────────────────────────────┤
│ [🗑]        🔴 4:32      [⏸ Pause] [⚙] │  D: Controls footer (opaque)
└─────────────────────────────────────────┘
```

### Zone Ownership

| Zone | Height | Owner |
|---|---|---|
| A — Pane header | ~40px | LEFT_PANE_SYSTEM (shared) |
| E — Context header | ~36px (floating) | Transcription Drawer |
| Pill — View indicator | ~24px (floating) | Transcription Drawer |
| C — Scroll area | Flex fill | Transcription Drawer |
| D — Controls footer | ~48px | Transcription Drawer |

---

## 3. Context Header

A floating translucent bar displaying the patient and encounter the transcription session belongs to. Uses heavy backdrop blur matching LEFT_PANE_SYSTEM §6 visual treatment.

### Content

```
│ [LS] Lauren Svendsen · Cough x 5 days      [⚙] │
   ↑                                            ↑
   │                                            └── Settings (opens full-screen modal)
   └──────────────────────────────────────────── Patient + encounter (safety anchor)
```

### Elements

| Element | Behavior |
|---|---|
| **[LS] Patient initials** | Avatar matching sidebar indicators |
| **Patient · Encounter label** | Safety anchor — confirms which patient is being recorded. Fixed to session's encounter. |
| **[⚙] Settings** | Opens transcription settings as a full-screen modal (§7) |

### Key Difference from AI Drawer

The transcription context header has **no dismiss/scope-change control**. Transcription is always bound to the encounter that started the session. The user cannot retarget it.

---

## 4. View Indicator Pill

A small floating pill centered below the context header. Identifies the current transcript state and provides a scroll-to-live affordance.

### States

| Recording State | Scroll Position | Pill Content | Additional Element |
|---|---|---|---|
| Recording | At bottom (following live) | `||||| Live` (waveform + label) | None |
| Recording | User scrolled up | `||||| Live` | `[↓ Latest]` button appears beside pill |
| Paused | Any | `⏸ Paused` | None |
| Processing | Any | `⏳ Processing` | None |

### Visual Layout

Following live (recording):
```
              ┌──────────────┐
              │ ||||| Live    │
              └──────────────┘
```

Scrolled up during recording:
```
        ┌──────────────┐ ┌───────────┐
        │ ||||| Live    │ │ ↓ Latest  │
        └──────────────┘ └───────────┘
```

Paused:
```
              ┌───────────┐
              │ ⏸ Paused   │
              └───────────┘
```

### Behavior

| Property | Detail |
|---|---|
| **Visibility** | Always visible — recording state is important safety information |
| **Waveform** | Animates when recording, freezes when paused. Same `WaveformIndicator` component as transcription bar, rendered at `mini` size. |
| **Pill interactivity** | Not tappable — status indicator only |
| **[↓ Latest] button** | Taps to auto-scroll to bottom and resume following live input. Fades in on scroll-up, fades out when user returns to bottom. |
| **Positioning** | Centered horizontally, floating below context header. Same z-index as context header — content scrolls behind it. |

---

## 5. Scroll Content Area

Full scrolling transcript with speaker attribution. Content and display rules match TRANSCRIPTION_MODULE.md §6 (Tab 1: Live Transcript).

### Transcript Segments

```
│  🔵 Dr. Chen                     0:42  │
│  So the cough started about five        │
│  days ago, and it's gotten worse        │
│  at night?                              │
│                                         │
│  🟢 Patient                      0:48  │
│  Yeah, especially when I lie down.      │
│  And I've had some chest tightness      │
│  too.                                   │
│                                         │
│  🔵 Dr. Chen                     1:02  │
│  Any fever or shortness of breath?      │
│                                         │
│  🟢 Patient                      1:08  │
│  No fever. Maybe a little short of      │
│  breath going up stairs but nothing     │
│  major. ▌                               │
```

### Speaker Diarization Display

| Element | Treatment |
|---|---|
| Speaker label | Colored dot + role label (`Dr. Chen` / `Patient` / `Unknown`) |
| Timestamp | Right-aligned, subdued — segment start time |
| Text | Left-aligned body text, comfortable line length |
| Segment breaks | Whitespace between speakers, no horizontal rules |
| Active cursor | `▌` blinking cursor on the most recent partial segment |

### Auto-Scroll Behavior

| State | Behavior |
|---|---|
| Recording, user hasn't scrolled | Auto-scroll to latest segment. New content appears at bottom. |
| Recording, user scrolled up | Auto-scroll paused. [↓ Latest] appears in view indicator area. |
| Recording, user taps [↓ Latest] | Scroll to bottom, resume auto-scroll. |
| Paused | No auto-scroll. User can freely browse. |

### Content Padding

Top padding equals the combined height of context header + view indicator pill, so content starts below the floating elements when scrolled to top.

---

## 6. Controls Footer

The controls footer is the **only opaque element** in the transcription drawer. It anchors to the bottom of the pane with a hard top edge.

### Layout

```
├─────────────────────────────────────────┤
│ [🗑]        🔴 4:32      [⏸ Pause] [⚙] │
└─────────────────────────────────────────┘
```

### Controls by Recording State

| Status | Controls Layout |
|---|---|
| **Recording** | `[🗑]   🔴 4:32   [⏸ Pause] [⚙]` |
| **Paused** | `[🗑 Discard]   ⏸ 4:32   [▶ Resume] [⚙]` |
| **Processing** | `⏳ Processing...` |
| **Error** | `⚠ Error   [🔄 Retry] [⚙]` |
| **Idle** | `[🎙 Start] [⚙]` |

### Control Rules

- **Same component** as the palette's controls bar — identical layout, same positions
- **Primary action** (Pause/Resume/Start) always rightmost for muscle memory
- **[🗑] Discard** spatially separated from primary action (left side) to prevent accidental taps
- **[⚙] Settings** opens the full-screen settings modal (§7)
- **Discard confirmation** is inline: `Discard recording? This cannot be undone. [Cancel] [Discard]`

### Note on Dual ⚙ Icons

Both the context header and the controls footer have a [⚙] icon. Both open the same settings modal. The duplication is intentional — the context header [⚙] is accessible when the user is reviewing transcript (top of view), the footer [⚙] is accessible when the user is interacting with controls (bottom of view). Same target, two entry points.

---

## 7. Settings Modal

Transcription settings open as a **full-screen modal**. The transcript continues running in the background — when the user closes the modal, they return to the drawer with settings applied.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Transcription Settings                             [Done]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Microphone              [Built-in Microphone ▾]            │
│                                                             │
│  Language                [English (US) ▾]                   │
│                                                             │
│  Speaker diarization     [━━━━━━━━━━━●]                     │
│                                                             │
│  Speaker labels                                             │
│    Speaker 1             [Dr. Chen              ]           │
│    Speaker 2             [Patient               ]           │
│                                                             │
│  Auto-punctuation        [━━━━━━━━━━━●]                     │
│                                                             │
│  Low-confidence display  [●━━━━━━━━━━━]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Settings

| Setting | Control | Scope |
|---|---|---|
| **Microphone source** | Dropdown | Session — changes take effect immediately |
| **Language** | Dropdown | Persistent — saved to user preferences |
| **Speaker diarization** | Toggle | Persistent |
| **Speaker labels** | Editable text fields | Session — labels are per-recording |
| **Auto-punctuation** | Toggle | Persistent |
| **Low-confidence display** | Toggle — show/hide flagged low-confidence segments | Persistent |

### Behavior

- **Changes apply immediately.** Toggles and dropdowns are direct manipulation — no save button needed.
- **[Done]** closes the modal. Not "Save" — there's nothing to save, changes are already applied.
- **Transcript continues in background.** Recording state is unaffected by having the modal open.
- **Triggered from:** [⚙] in context header or [⚙] in controls footer (both in this drawer), or [⚙] in the transcription palette/bar controls (when module is at bottom bar tier).

---

## 8. Session Scope Update

This section documents a scope change from the original TRANSCRIPTION_MODULE.md §9.

### Previous Rule (TRANSCRIPTION_MODULE.md §9)

> "Leaving the encounter view pauses transcription."

### Updated Rule

**Leaving the patient workspace pauses transcription. Navigation within the patient workspace does not affect recording.**

| Navigation | Recording Behavior |
|---|---|
| Same patient, different encounter | Continues |
| Same patient, Overview | Continues |
| Same patient, Activity tab | Continues |
| Different patient | Auto-pause |
| Non-patient view (inbox, tasks, schedule) | Auto-pause |

### Rationale

The provider is still physically with the patient regardless of which screen they're looking at. Reviewing a past encounter or checking the patient overview shouldn't interrupt ambient recording of the ongoing conversation.

### Impact on 🎙 Icon Visibility

The 🎙 icon in the pane header is visible whenever a transcription session exists for the **current patient** (not just the current encounter). This matches the broader scope.

---

## 9. Decision Log

| # | Decision | Rationale |
|---|---|---|
| 1 | Drawer in left pane (not independent right drawer) | Left = ambient intelligence spatial convention. Right reserved for chart-item detail views. |
| 2 | No tab bar (Live/Settings) — replaced by floating pill + settings modal | Reduces fixed chrome. Pill is lighter than a tab bar. Settings deserve focused modal. |
| 3 | Full-screen modal for settings | Focused, distraction-free. Transcript runs in background. Not multitasking with chart. |
| 4 | Dual ⚙ icons (header + footer) | Both open same modal. Two entry points for different scroll positions. |
| 5 | View indicator pill always visible | Recording state is safety-critical information — always glanceable. |
| 6 | Waveform on view indicator pill | Real-time visual feedback that audio is being captured. Reuses existing component. |
| 7 | Session scope = patient workspace | Provider shouldn't be interrupted by navigating within the same patient's context. |
| 8 | [↓ Latest] appears on scroll-up only | Auto-scroll affordance only when needed. Fades to avoid permanent visual clutter. |
| 9 | Controls footer is same component as palette controls | Muscle memory. Same layout, same positions, same interactions. |
| 10 | Context header has no scope controls (unlike AI) | Transcription is always bound to the session's encounter. Not user-retargetable. |

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-06 | Initial specification — left pane layout, view indicator pill, settings modal, session scope update |
