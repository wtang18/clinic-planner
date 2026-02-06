# Transcription Module — Design Specification

**Last Updated:** 2026-02-03
**Status:** Design Complete — Ready for Implementation
**Related:** BOTTOM_BAR_SYSTEM.md (orchestration), AI_SURFACE.md (AI counterpart), SHARED_PATTERNS.md (shared components)

---

## Table of Contents

1. [Identity & Purpose](#1-identity--purpose)
2. [Scope & Boundaries](#2-scope--boundaries)
3. [Progressive Disclosure Tiers](#3-progressive-disclosure-tiers)
4. [Bar (Default State)](#4-bar-default-state)
5. [Palette (Expanded Detail)](#5-palette-expanded-detail)
6. [Drawer (Full Transcript View)](#6-drawer-full-transcript-view)
7. [Mini Anchor (Minimized State)](#7-mini-anchor-minimized-state)
8. [Recording Lifecycle](#8-recording-lifecycle)
9. [Workspace Switching & Session Management](#9-workspace-switching--session-management)
10. [Sidebar Indicators](#10-sidebar-indicators)
11. [Consent UX](#11-consent-ux)
12. [Session Recovery](#12-session-recovery)
13. [Role-Based Defaults](#13-role-based-defaults)
14. [Voice Commands (Separation)](#14-voice-commands-separation)
15. [Open Items](#15-open-items)

---

## 1. Identity & Purpose

### Name: Transcription Module

The module is called the **Transcription Module** — not "Context Pill" (v1 name), not "Recording Module."

**Rationale:**
- Matches the output the user interacts with — text segments, entities, suggestions — not raw audio files
- Differentiates from voice commands (which are AI interactions, not transcription)
- Aligns with clinical vocabulary (medical transcriptionists, dictation services)
- Supports cognitive separation: "transcription module transcribes the visit; AI surface helps you act on it"

**Note:** Patient-facing language may still use "recording" for consent purposes ("This visit is being recorded to assist with documentation"), but the clinician-facing UI uses "transcription."

### Patient + Encounter Label = Safety Anchor

The patient name and encounter label displayed in the transcription module serve a **safety function**: confirming *which patient and encounter* is being recorded. This is distinct from the AI Surface's context targeting, which is fluid and user-directed.

- Transcription module context: fixed, safety-critical ("you are recording *this* patient")
- AI Surface context target: flexible, user-directed ("AI is focused on *this* scope")

---

## 2. Scope & Boundaries

### What It Does

- Displays transcription recording state (idle, recording, paused, processing, error)
- Provides start/pause/resume/discard controls
- Shows live transcript preview (palette) and full transcript (drawer)
- Anchors patient/encounter identity during recording
- Houses transcription settings and preferences

### What It Does NOT Do

- **No voice commands** — voice commands to the AI live in the AI Surface's input row
- **No entity extraction display** — extracted entities surface as suggestions in the AI Surface palette, not in the transcription module
- **No AI interaction** — no chat, no responses, no suggestions
- **No context targeting** — scope is always the bound encounter

### Visibility Rules

| Context | Transcription Module Visible? | Grid Layout |
|---|---|---|
| In encounter | ✓ | `[Transcription bar] │ gap │ [AI minibar]` |
| Patient workspace, no encounter | ✗ | `[AI minibar — full width]` |
| Inbox / Tasks | ✗ | `[AI minibar — full width]` |
| Schedule | ✗ | `[AI minibar — full width]` |
| Admin | ✗ | `[AI minibar — full width]` |

**Rule:** Transcription module is encounter-only. It appears when an encounter is active and disappears when the user leaves encounter context. The AI Surface expands to full width when the transcription module is hidden.

### Encounter Binding

Transcription is bound to a **specific encounter**, not just a patient. The module displays both patient name and encounter label to disambiguate when a patient has multiple open encounters.

---

## 3. Progressive Disclosure Tiers

The Transcription Module uses three-tier progressive disclosure, paralleling the AI Surface:

| Tier | Height | When Active | Purpose |
|---|---|---|---|
| **Mini** | 48px (icon only) | AI palette or drawer is open | Persistent anchor with state badge |
| **Bar** | ~160px fixed width | Default during encounters | Status, timer, primary controls |
| **Palette** | ~150-180px | User taps bar for more detail | Full context, waveform, transcript preview, discard |
| **Drawer** | Full panel | User escalates from palette | Complete live transcript, segment history, settings |

### Interaction Grammar

Consistent with AI Surface — same patterns for both modules:

| Gesture | Behavior |
|---|---|
| Tap bar (not action button) | Opens palette |
| Tap drag handle | Collapses palette to bar |
| Drag handle down | Collapses palette to bar |
| Tap mini anchor | Direct-switch: closes other module's palette, opens own |
| Tap [↗] in palette | Escalates to drawer |
| Escape key | Closes own palette, restores both to bar |

**Bar controls are direct-action.** Tapping the mic/pause/resume button in the bar acts immediately without opening the palette. The palette is opt-in for more detail.

---

## 4. Bar (Default State)

Single fixed width (~160px). No variable widths — palette handles all "expanded" content.

### Bar Layout

```
┌───────────────────────────────────────────────────────┐
│  [Initials]  Center Content              [Action Btn] │
└───────────────────────────────────────────────────────┘
     Left         Center                      Right
```

### States

| Status | Left | Center | Right |
|---|---|---|---|
| **idle** | Initials avatar | `Patient Name` (truncated) | [Mic] |
| **recording** | Initials avatar | Mini waveform + `0:42` | [Pause] |
| **paused** | Initials avatar | `Paused · 4:32` | [Resume] |
| **processing** | Initials avatar | `Processing…` + spinner | — |
| **error** | Initials avatar | `Mic error` (red) | [Retry] |

### Tap Behavior

| Tap target | Action |
|---|---|
| Action button (Mic/Pause/Resume/Retry) | Direct action — does not open palette |
| Bar area (not action button) | Opens palette |

---

## 5. Palette (Expanded Detail)

Minimal three-zone layout. Opens when user taps the bar.

### Zone Structure

| Zone | Content | Fixed/Scrollable |
|---|---|---|
| **Header** | Drag handle + patient initials + full patient name + encounter label | Fixed |
| **Content** | Varies by status (see below) | Fixed (content is short) |
| **Controls** | Duration + action buttons + settings, pinned bottom-right | Fixed |

### By Status

**IDLE:**
```
┌───────────────────────────────────────────────────────┐
│  ═══                                                  │
│  [LS]  Lauren Svendsen · Cough x 5 days              │
│───────────────────────────────────────────────────────│
│        Confirm patient consent before recording.      │
│───────────────────────────────────────────────────────│
│                                       [🎙 Start] [⚙] │
└───────────────────────────────────────────────────────┘
```

**RECORDING:**
```
┌───────────────────────────────────────────────────────┐
│  ═══                                                  │
│  [LS]  Lauren Svendsen · Cough x 5 days              │
│───────────────────────────────────────────────────────│
│  [▁▃▅]  "...some chest tightness too"          [↗]  │
│───────────────────────────────────────────────────────│
│                              ● 4:32   [⏸ Pause] [⚙] │
└───────────────────────────────────────────────────────┘
```

**PAUSED:**
```
┌───────────────────────────────────────────────────────┐
│  ═══                                                  │
│  [LS]  Lauren Svendsen · Cough x 5 days              │
│───────────────────────────────────────────────────────│
│  [▁▃▅]  "...last captured utterance"           [↗]  │
│───────────────────────────────────────────────────────│
│  [🗑 Discard]                ⏸ 4:32  [▶ Resume] [⚙] │
└───────────────────────────────────────────────────────┘
```

**ERROR:**
```
┌───────────────────────────────────────────────────────┐
│  ═══                                                  │
│  [LS]  Lauren Svendsen · Cough x 5 days              │
│───────────────────────────────────────────────────────│
│  [⚠]   Microphone not detected                       │
│───────────────────────────────────────────────────────│
│                              ⚠ Error  [🔄 Retry] [⚙] │
└───────────────────────────────────────────────────────┘
```

### Content Zone Details

**Waveform:** Avatar-width (~36-40px), same column as the initials in the header. Serves as a status indicator ("audio is being captured"), not a data visualization. The transcript preview line carries the accuracy signal.

**Transcript preview:** Single rolling line showing the most recent partial or completed utterance. Continuously updating during recording, frozen at last captured line when paused.

**Drawer escalation:** [↗] icon button aligned right of the transcript preview line. Opens the full transcript drawer.

**Consent text (idle):** Clinician-facing guidance — e.g., "Confirm patient consent before recording." Org-configurable copy in future settings.

### Controls Zone

Primary action button always occupies the **rightmost position** for muscle memory consistency.

| Status | Controls layout |
|---|---|
| **idle** | `[🎙 Start] [⚙]` |
| **recording** | `● 4:32   [⏸ Pause] [⚙]` |
| **paused** | `[🗑 Discard]   ⏸ 4:32   [▶ Resume] [⚙]` |
| **processing** | `⏳ Processing…` |
| **error** | `⚠ Error   [🔄 Retry] [⚙]` |

**Discard** is spatially separated from Resume (left-side vs. right-side) to prevent accidental taps. Discard is only accessible in the palette (not the bar) — destructive action behind an extra tap.

### Discard Confirmation

Tap [Discard] → inline confirmation replaces the controls zone:

```
│  Discard recording? This cannot be undone.  [Cancel] [Discard] │
```

No toast-and-undo pattern — explicit confirmation for destructive action.

### Dismissing the Palette

- Tap drag handle (same component as AI palette — tap to collapse)
- Drag handle down
- Tap AI mini anchor (direct-switch)
- Escape key

No close button (✕) in the palette.

### Dimensions

| Property | Value |
|---|---|
| Max height | ~150-180px |
| Width | Same grid column as bar (CSS Grid) |

---

## 6. Drawer (Full Transcript View)

The full-detail view for reviewing complete transcripts and managing settings.

### When Used

- Reviewing what was said earlier in the visit
- Confirming AI captured something correctly
- Scribe actively documenting (future)
- Adjusting transcription settings
- Post-visit review before signing note

### Drawer Anatomy

```
┌───────────────────────────────────────────────────────┐
│  ═══                                                  │
│  [LS]  Lauren Svendsen · Cough x 5 days              │
│  [Live Transcript]  [Settings]               ← tabs  │
├───────────────────────────────────────────────────────┤
│                                                       │
│  (scrollable content area)                            │
│                                                       │
├───────────────────────────────────────────────────────┤
│                              ● 4:32   [⏸ Pause] [⚙] │
└───────────────────────────────────────────────────────┘
```

| Zone | Content | Behavior |
|---|---|---|
| **Header** | Drag handle + patient/encounter + tab switcher | Fixed |
| **Content** | Tab-dependent scrollable area | Scrolls independently |
| **Controls** | Same controls bar as palette | Fixed bottom, pinned right |

Controls bar is the **same component** as the palette's — identical layout, same positions.

### Tab 1: Live Transcript

Full scrolling transcript with speaker attribution.

```
│  🔵 Dr. Chen                                  0:42  │
│  So the cough started about five days ago,           │
│  and it's gotten worse at night?                     │
│                                                       │
│  🟢 Patient                                   0:48  │
│  Yeah, especially when I lie down. And I've          │
│  had some chest tightness too.                       │
│                                                       │
│  🔵 Dr. Chen                                  1:02  │
│  Any fever or shortness of breath?                   │
│                                                       │
│  🟢 Patient                                   1:08  │
│  No fever. Maybe a little short of breath            │
│  going up stairs but nothing major. ▌                │
```

**Speaker diarization display:**

| Element | Treatment |
|---|---|
| Speaker label | Colored dot + role label (`Dr. Chen` / `Patient` / `Unknown`) |
| Timestamp | Right-aligned, subdued — segment start time |
| Text | Left-aligned body text, comfortable line length |
| Segment breaks | Whitespace between speakers, no horizontal rules |

**Auto-scroll behavior:**

| State | Behavior |
|---|---|
| Recording, user hasn't scrolled | Auto-scroll to bottom, following live input |
| Recording, user scrolled up | Pinned at user's position. Show "↓ Live" FAB to jump to bottom |
| Paused | No auto-scroll, free browsing |

**Confidence-based text treatment:**

| Confidence | Treatment |
|---|---|
| High (>0.85) | Normal text |
| Medium (0.6-0.85) | Slightly muted or lighter weight |
| Low (<0.6) | Dotted underline or dimmed with `?` marker |

**Future: inline entity highlights.** Tapping a highlighted entity could show a tooltip connecting what was heard to what the AI did with it. Deferred — not v1.

### Tab 2: Settings

| Setting | Control | Scope |
|---|---|---|
| Microphone source | Dropdown | Session |
| Language | Dropdown | Persistent |
| Speaker diarization | Toggle | Persistent |
| Speaker labels | Editable (rename "Speaker 1" → "Dr. Chen") | Session |
| Auto-punctuation | Toggle | Persistent |
| Low-confidence display | Toggle (show/hide flagged segments) | Persistent |

Minimal for v1. Settings tab exists so configuration has a home without needing a separate modal.

### Drawer Sizing & Responsiveness

| Breakpoint | Drawer behavior |
|---|---|
| Desktop | Side panel, pushes content |
| Tablet | Overlay panel |
| Mobile | Bottom sheet, full height |

Same behavior as AI drawer — shared responsive pattern, independent content.

---

## 7. Mini Anchor (Minimized State)

When the AI Surface palette or drawer is open, the Transcription Module collapses to a **mini anchor** — a 48px tappable icon.

### Appearance

| State | Icon | Badge |
|---|---|---|
| idle | Mic icon | None |
| recording | Mic icon | Pulsing red dot |
| paused | Mic icon | Static amber dot |
| processing | Mic icon | Spinner |
| error | Mic icon | Red exclamation |

### Tap Behavior: Direct Switch

Tapping the mini anchor **directly opens** the transcription module's palette and closes the AI Surface's palette/drawer. One tap, not two.

Animation sequence:
1. AI palette collapses (200ms)
2. Transcription palette expands (300ms, can overlap by 100ms)
3. AI Surface restores to minibar state

---

## 8. Recording Lifecycle

### Status Model

| Status | Description | Transitions to |
|---|---|---|
| `idle` | No recording, ready to start | `recording` |
| `recording` | Actively capturing audio | `paused`, `processing` (on encounter close) |
| `paused` | Recording suspended by user or auto-pause | `recording` (resume), `idle` (discard), `processing` (finalize) |
| `processing` | Post-recording, finalizing segments | `idle` (complete) |
| `error` | Recording error (mic failure, etc.) | `idle` (retry success), `error` (retry failure) |

### System-Wide Constraint

**One `recording` state system-wide.** Multiple `paused` sessions can coexist, but only one encounter can be actively recording at any time. Starting a new recording in a different encounter auto-pauses any existing recording.

### Manual Start

Recording does not auto-start when an encounter opens. The user must explicitly tap the mic button. Auto-start may be added as an org/user preference in the future.

### Summarization Output Routing

When transcription processing completes (or user triggers "Summarize"):

| Output | Destination | Rationale |
|---|---|---|
| Full transcript | Transcription module drawer | "What was said" — recording artifact |
| Generated note/summary | AI Surface palette as actionable response | "What to do about it" — AI output |

This maintains cognitive separation between the transcription module and AI Surface.

---

## 9. Workspace Switching & Session Management

### Auto-Pause Rules

Recording auto-pauses when the user navigates away from the encounter being recorded. This includes:

| Navigation | Triggers auto-pause? |
|---|---|
| Switch to different patient's workspace | ✓ |
| Switch to same patient's different encounter | ✓ |
| Switch to same patient's Overview (non-encounter view) | ✓ |
| Switch to Inbox, Tasks, Schedule, Admin | ✓ |
| Stay in same encounter | ✗ |

**Rule:** Leaving the encounter view pauses transcription. The encounter is the recording boundary.

### Auto-Pause Behavior

When auto-pause triggers:

1. Status changes from `recording` → `paused`
2. Current segment is finalized and saved (no audio data lost)
3. Toast notification: "Transcription paused — Cough x 5 days" (auto-dismiss 3s)
4. Sidebar indicator updates (⏸ icon on encounter row)
5. Transcription module disappears (if navigating to non-encounter view)

### Returning to Encounter

When user navigates back to an encounter with a paused session:

1. Transcription module reappears in bar state: `Paused · 4:32` + [Resume]
2. **Does not auto-resume** — user must explicitly tap Resume
3. Palette (if opened) shows full context + discard option

**Rationale for manual resume:** User may have stepped away from patient. Auto-resume would capture empty room or hallway conversation. Explicit action = explicit consent.

### Same Patient, Different Encounters

| Scenario | Behavior |
|---|---|
| Encounter A is recording, user opens Encounter B | Auto-pause A. Encounter B shows idle transcription module. |
| User starts recording in Encounter B | Allowed. A stays paused, B is now recording. |
| User returns to Encounter A | A shows paused state. Manual resume required. |

### Encounter Close

Closing an encounter with an active or paused transcription session:
1. Auto-stop recording
2. Finalize and save all segments
3. Trigger processing/summarization
4. Sidebar indicator updates to processing state, then clears on completion

### Session Limits

| Rule | Detail |
|---|---|
| **Auto-finalize** | Paused sessions auto-finalize after 2 hours. Toast on next login: "Transcription for Lauren Svendsen (Cough x 5 days) was auto-finalized." |
| **Soft limit** | Maximum 3 concurrent paused sessions. Starting a 4th recording prompts user to finalize one first. |

Finalization prompt:
```
┌───────────────────────────────────────────────────────┐
│  You have 3 paused transcriptions:                    │
│                                                       │
│  Lauren Svendsen · Cough x 5 days · 4:32   [Finalize]│
│  Ivan T. · Back pain · 12:07               [Finalize]│
│  Maria G. · Annual wellness · 8:45         [Finalize] │
│                                                       │
│  Finalize at least one to start a new recording.      │
└───────────────────────────────────────────────────────┘
```

---

## 10. Sidebar Indicators

The sidebar (menu pane) shows transcription state for encounters with active or paused sessions.

| Transcription State | Sidebar Indicator |
|---|---|
| idle | None |
| recording | 🔴 Pulsing red dot |
| paused | ⏸ Pause icon (static, amber) |
| processing/summarizing | Spinner or progress arc |

```
PATIENT WORKSPACES
  Lauren Svendsen
    Overview
    Cough x 5 days  🔴        ← recording in progress
  Ivan T.
    Overview
    Back pain  ⏸               ← paused session
  Maria G.
    Overview
    Annual wellness  ◐         ← summarizing in progress
```

Tapping the workspace/encounter navigates back and restores the transcription module to its previous state.

---

## 11. Consent UX

**Principle:** The system *reminds*, it doesn't *enforce*. Consent management is a clinical/legal process. The app supports it but doesn't gate recording behind a consent checkbox.

### Implementation

- **Idle palette content zone** displays clinician-facing guidance text: "Confirm patient consent before recording."
- **Org-configurable:** Copy can be customized to match specific consent workflows (e.g., "Inform patient this visit will be transcribed," or reference a specific consent form).
- **Default copy provided** for out-of-box experience.
- **No first-time modal or blocking flow** — guidance is visible whenever the palette is opened in idle state.

---

## 12. Session Recovery

Handles browser crash, tab close, or network drop during recording.

### Incremental Persistence

Finalized segments are saved incrementally as they complete (~every 15-30 seconds). Not buffered until session end.

| Layer | Behavior |
|---|---|
| Finalized segments | Persisted incrementally, safe from crashes |
| In-progress partial segment | May be lost (max ~30s of audio) |

### Recovery UX

When user reopens an encounter after an interruption:

**Bar:**
```
┌───────────────────────────────────────────────────────┐
│  [LS]  ⚠ Recovered · 4:32                  [Resume] │
└───────────────────────────────────────────────────────┘
```

**Palette:** Adds detail — "Session interrupted. 14 of ~15 segments recovered." User can resume or finalize.

**Key principle:** Recovery is the default, not a special case. Users should never lose more than ~30s of transcript.

---

## 13. Role-Based Defaults

### Default Tier by Role

| Role | Default Tier | Rationale |
|---|---|---|
| Provider | Bar | Transcription runs in background, provider focuses on patient |
| MA | Bar | May or may not use transcription during intake |
| Scribe (future) | Bar (v1), Palette or Drawer (future) | Scribe's primary job is monitoring transcript |
| X-Ray Tech | Bar (idle) | Unlikely to use transcription |
| Front Desk | Not visible | Not in encounters |
| Clinic Manager | Not visible | Not in encounters |

### Future Scribe Considerations

When scribe role is supported, the drawer becomes the primary work surface — live scrolling transcript as the scribe's main view. Role-based default could auto-open drawer on encounter entry. This is future scope.

---

## 14. Voice Commands (Separation)

Voice commands (discrete commands to the AI) are **not** part of the Transcription Module. They live in the AI Surface.

### Rationale

- Voice commands are **AI interactions** — talking *to* the AI, not passively recording
- Keeping them separate reinforces cognitive separation: transcription = "room is being listened to" (passive), AI = "I'm talking to the AI" (active)

### Where Voice Commands Live

AI palette input row, mic button anchored bottom-left:

```
┌───────────────────────────────────────────────────────┐
│  ...palette content...                                │
│───────────────────────────────────────────────────────│
│  [🎤]  Ask AI...                          [📋] [➤]  │
└───────────────────────────────────────────────────────┘
```

### Two Activation Patterns

| Pattern | Gesture | Behavior |
|---|---|---|
| **Tap + hold** | Press and hold 🎤, speak, release to send | Quick commands |
| **Tap + speak + send** | Tap 🎤 to toggle, speak, tap ➤ to send or ✕ to cancel | Longer input |

### Ambient Transcription During Voice Commands

Ambient transcription **pauses** during voice command input and resumes automatically after. Simplest approach for v1 — avoids command audio leaking into transcript.

### Keyboard Shortcut

Hold-to-talk keyboard shortcut is nice-to-have, not v1 priority.

---

## 15. Open Items

### Needs Dedicated Design Session
- [ ] AI Surface drawer content and behavior (conversation history, nudge/activity logs)
- [ ] Error and degraded states (AI service failure, network drops — crosses both modules)
- [ ] Critical Alert System (modal vs. banner rules, severity escalation)

### Needs Implementation Detail
- [ ] Waveform visualization component (avatar-width, status-indicator purpose)
- [ ] Speaker diarization model (how are speakers identified and labeled?)
- [ ] Segment persistence architecture (incremental save implementation)
- [ ] Session recovery detection and restoration flow

### Future Scope
- [ ] Auto-start recording preference (org/user configurable)
- [ ] Scribe role — drawer as primary work surface, auto-open on encounter entry
- [ ] Inline entity highlights in drawer transcript
- [ ] Multi-device handoff (tablet → desktop during encounter)
- [ ] Keyboard shortcut for voice command (hold-to-talk)
- [ ] Consent text org-configuration admin UI

### Accessibility (Defer to SHARED_PATTERNS)
- [ ] Screen reader announcements for recording state changes (ARIA live regions)
- [ ] Keyboard-only flow for start/pause/resume
- [ ] Tab order between transcription bar and AI minibar
- [ ] Focus management on palette open/close

---

## Decision Log

All decisions made during this design session, for traceability:

| # | Decision | Section |
|---|---|---|
| 1 | Name: **Transcription Module** | §1 |
| 2 | Patient + encounter label = **safety anchor** | §1 |
| 3 | **Workspace-scoped** auto-pause | §9 |
| 4 | **Encounter-bound** recording | §2 |
| 5 | **Three-tier**: mini → bar → palette → drawer | §3 |
| 6 | **Mutual exclusion** — max one module at palette/drawer | BOTTOM_BAR_SYSTEM |
| 7 | **Mini anchors** with state badging, direct-switch tap | §7 |
| 8 | **Parallel interaction grammar** across both modules | §3 |
| 9 | Drawer houses live transcript + settings | §6 |
| 10 | **Single fixed-width bar** (~160px) | §4 |
| 11 | **Discard only in palette** | §5 |
| 12 | **Minimal three-zone palette** — header, content, controls | §5 |
| 13 | **No entity extraction in palette** — surfaces in AI palette | §5 |
| 14 | **One-line transcript preview** with drawer escalation | §5 |
| 15 | **No close button** — drag handle or mini anchor | §5 |
| 16 | **Avatar-width mini waveform** — status indicator, not data viz | §5 |
| 17 | **Duration in controls zone** (bottom) | §5 |
| 18 | **Primary action pinned bottom-right** | §5 |
| 19 | **Discard positioned left-side** when paused | §5 |
| 20 | **Shared drag handle component** — tap to collapse | §3, SHARED_PATTERNS |
| 21 | **Idle palette shows consent guidance** (revised from "hide content zone") | §5, §11 |
| 22 | **Bar controls are direct-action** — no palette intermediation | §4 |
| 23 | **Palette is opt-in detail** — consistent across both modules | §3 |
| 24 | **Default tier: Bar** for all encounter roles | §13 |
| 25 | **Encounter-only visibility** — hidden outside encounters | §2 |
| 26 | **Manual start (v1)** — no auto-start | §8 |
| 27 | **Sidebar paused-session indicator** | §10 |
| 28 | **Sidebar indicators**: pulsing dot / pause icon / progress arc | §10 |
| 29 | No AI minibar echo needed — transcription bar always present | §10 |
| 30 | **Summarization output split**: transcript → drawer, note → AI palette | §8 |
| 31 | **Voice commands in AI Surface** input row, mic bottom-left | §14 |
| 32 | **Two patterns**: tap+hold and tap+speak+send | §14 |
| 33 | **Ambient pauses during voice command** | §14 |
| 34 | **Keyboard shortcut** — nice to have, not v1 | §14 |
| 35 | **Drawer tabs**: Live Transcript + Settings | §6 |
| 36 | **Controls bar identical** across palette and drawer | §6 |
| 37 | **Auto-scroll with "↓ Live" FAB** | §6 |
| 38 | **Confidence-based text treatment** | §6 |
| 39 | **Entity highlights deferred** — future inline treatment | §6 |
| 40 | **Independent drawer panels** (not shared with AI) | §6 |
| 41 | **Responsive drawer**: push / overlay / bottom sheet | §6 |
| 42 | **Minimal v1 settings** | §6 |
| 43 | **Auto-pause on navigation away** from encounter | §9 |
| 44 | **Manual resume required** — no auto-resume | §9 |
| 45 | **One recording system-wide** — multiple paused allowed | §9 |
| 46 | **Auto-pause feedback**: toast + sidebar indicator | §9 |
| 47 | **Encounter close = auto-stop** + trigger processing | §9 |
| 48 | **Idle palette consent guidance** — clinician-facing, org-configurable | §11 |
| 49 | **Incremental segment persistence** (~15-30s), max ~30s loss on crash | §12 |
| 50 | **Auto-finalize after 2h paused**, soft limit of 3 concurrent paused sessions | §9 |

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-03 | Initial specification — 50 design decisions covering full module lifecycle |
