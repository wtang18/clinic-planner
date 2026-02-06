# Voice Input for AI Module — Design Specification

**Last Updated:** 2026-02-05
**Status:** Design In Progress
**Phase:** 9 (after Left Pane System)
**Related:** AI_DRAWER.md §7 (footer input row), AI_CONTROL_SURFACE_V2.md (palette input)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Interaction Modes](#2-interaction-modes)
3. [Press-and-Hold Mode](#3-press-and-hold-mode)
4. [Tap Dictation Mode](#4-tap-dictation-mode)
5. [Visual States](#5-visual-states)
6. [Audio Feedback](#6-audio-feedback)
7. [Error Handling](#7-error-handling)
8. [Keyboard Shortcuts](#8-keyboard-shortcuts)
9. [State Model](#9-state-model)
10. [Decision Log](#10-decision-log)

---

## 1. Overview

Voice input provides an alternative to typing for interacting with the AI module. It appears in the AI input row (palette and drawer footer) as a microphone button.

### Surfaces

| Surface | Voice Input Available |
|---------|----------------------|
| AI Minibar | No — minibar has no input |
| AI Palette | Yes — [🎤] in input row |
| AI Drawer | Yes — [🎤] in footer input row |
| Transcription Module | No — TM handles ambient recording, not voice commands |

### Two Interaction Modes

The mic button supports two distinct interaction patterns:

| Gesture | Mode | Behavior |
|---------|------|----------|
| **Press-and-hold** | Direct command | Voice captured while held → released → immediate AI query |
| **Tap** | Dictation | Enters dictation mode → transcribes to input field → user can edit/send |

---

## 2. Interaction Modes

### Why Two Modes?

Different use cases benefit from different interaction patterns:

| Mode | Best For | Mental Model |
|------|----------|--------------|
| **Press-and-hold** | Quick commands, hands-busy situations | "Walkie-talkie" — speak while holding |
| **Tap dictation** | Longer queries, want to review/edit before sending | "Dictation" — compose with voice |

### Mode Selection

The gesture determines the mode — no explicit toggle needed:
- Start pressing and hold → press-and-hold mode
- Quick tap → dictation mode

---

## 3. Press-and-Hold Mode

### Flow

```
1. User presses mic button and holds
2. Visual: Mic button enlarges, waveform appears, "Listening..." label
3. Audio: Subtle "on" sound
4. User speaks command (e.g., "What medications is she allergic to?")
5. User releases button
6. Audio: Subtle "off" sound
7. Transcribed text appears in input field
8. Query auto-sends (no confirmation step)
9. AI processes and responds
```

### Key Characteristics

| Property | Behavior |
|----------|----------|
| Auto-send | Yes — releases sends immediately |
| Edit opportunity | No — bypasses text field editing |
| Cancel | Drag finger away from button before release |
| Minimum hold duration | ~300ms before registering as hold (vs. tap) |
| Maximum duration | 30 seconds (org-configurable) |
| Timeout behavior | Auto-release + send at max duration |

### Visual Feedback During Hold

```
┌───────────────────────────────────────┐
│                                       │
│           ╭─────────────╮             │
│           │ 🎤 |||||||  │             │
│           │ Listening... │             │
│           ╰─────────────╯             │
│                                       │
│  [🎤]  Ask AI...               [📋] [➤] │
└───────────────────────────────────────┘
        ↑
     Enlarged, highlighted
```

---

## 4. Tap Dictation Mode

### Flow

```
1. User taps mic button (quick tap, not hold)
2. Visual: Input row transforms to dictation mode
3. Audio: Subtle "on" sound
4. User speaks (e.g., "Check for drug interactions with the new prescription")
5. Transcription appears in input field in real-time
6. User can:
   a. Tap [✓ Send] to submit
   b. Tap [✕ Clear] to discard and exit dictation mode
   c. Tap [⏹ Stop] to stop listening, then edit text before sending
   d. Tap anywhere in input field to stop and edit
7. On send: Query submitted to AI
```

### Dictation Mode UI

```
Normal input row:
│ [🎤]  Ask AI...               [📋] [➤] │

Dictation mode:
│ [⏹] What medications is she a▌   [✕] [✓] │
       ↑                            ↑   ↑
    Real-time transcription      Clear  Send
```

### Key Characteristics

| Property | Behavior |
|----------|----------|
| Auto-send | No — user must explicitly send |
| Edit opportunity | Yes — can stop and edit before sending |
| Cancel | [✕] clears and exits dictation mode |
| Silence timeout | 3 seconds of silence → auto-stop listening (stay in edit mode) |
| Maximum duration | 60 seconds (longer than press-and-hold) |

### Dictation Controls

| Control | Action |
|---------|--------|
| **[⏹ Stop]** | Stop listening, keep text for editing |
| **[✕ Clear]** | Discard text, exit dictation mode, return to normal input |
| **[✓ Send]** | Submit current text (stops listening if still active) |
| **Tap input field** | Stop listening, place cursor for editing |

---

## 5. Visual States

### Mic Button States

| State | Visual | Label |
|-------|--------|-------|
| **Idle** | 🎤 outline | — |
| **Hover** | 🎤 filled, subtle highlight | — |
| **Press-and-hold active** | 🎤 enlarged, pulsing, waveform | "Listening..." |
| **Dictation active** | 🎤 replaced by ⏹ | — |
| **Processing** | Spinner | "Processing..." |
| **Error** | ⚠ icon | Error message |
| **Disabled** | 🎤 grayed out | — |

### Waveform Indicator

Reuse `WaveformIndicator` component from Transcription Module:
- Size: `mini` (same as transcription bar)
- Appears next to enlarged mic during press-and-hold
- Not shown during tap dictation (transcription in input field is sufficient feedback)

---

## 6. Audio Feedback

### Sound Effects

| Event | Sound | Notes |
|-------|-------|-------|
| Start listening | Soft "click on" | Same for both modes |
| Stop listening | Soft "click off" | — |
| Query sent | None | Visual confirmation sufficient |
| Error | Soft error tone | Accompanies visual error state |

### Respects System Settings

- Honor OS "reduce motion" / "reduce sounds" preferences
- Mute when system audio is muted

---

## 7. Error Handling

### Error Types

| Error | User Message | Recovery |
|-------|--------------|----------|
| Microphone permission denied | "Microphone access needed" | Link to settings |
| No speech detected | "No speech detected" | Auto-dismiss after 2s |
| Network error | "Connection lost" | [Retry] button |
| Transcription failed | "Couldn't transcribe" | [Retry] or type manually |
| Max duration reached | "Recording limit reached" | Auto-send what was captured |

### Error Display

Inline error below input row, auto-dismiss for transient errors:

```
│ [🎤]  Ask AI...               [📋] [➤] │
│ ⚠ No speech detected                   │
```

---

## 8. Keyboard Shortcuts

### Voice Input Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| **Space (hold)** | Press-and-hold mode | When input focused, not typing |
| **⌘⇧V** | Toggle dictation mode | When AI input available |

### Conflict Avoidance

- Space-hold only activates when input is focused AND empty
- If user is typing, space inserts a space character normally
- ⌘⇧V works regardless of focus (opens palette if needed, then starts dictation)

---

## 9. State Model

### Voice Input State

```typescript
interface VoiceInputState {
  mode: 'idle' | 'press-hold' | 'dictation' | 'processing' | 'error';
  isListening: boolean;
  transcribedText: string;
  error: VoiceInputError | null;
  startTime: number | null;
}

type VoiceInputError = {
  type: 'permission' | 'no-speech' | 'network' | 'transcription' | 'timeout';
  message: string;
  recoverable: boolean;
};
```

### Actions

```typescript
type VoiceInputAction =
  | { type: 'PRESS_HOLD_START' }
  | { type: 'PRESS_HOLD_RELEASE' }
  | { type: 'PRESS_HOLD_CANCEL' }
  | { type: 'DICTATION_START' }
  | { type: 'DICTATION_STOP' }
  | { type: 'DICTATION_CLEAR' }
  | { type: 'TRANSCRIPTION_UPDATE'; payload: { text: string } }
  | { type: 'VOICE_INPUT_ERROR'; payload: VoiceInputError }
  | { type: 'VOICE_INPUT_RESET' };
```

---

## 10. Decision Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Two modes via gesture (hold vs. tap) | Supports different use cases without mode toggle UI |
| 2 | Press-and-hold auto-sends | Quick command pattern — no friction |
| 3 | Tap dictation requires explicit send | User expects to review dictated text |
| 4 | 300ms threshold for hold detection | Standard OS convention for press-and-hold |
| 5 | Reuse WaveformIndicator component | Consistency with transcription module |
| 6 | Space-hold only when input empty | Avoid conflict with normal typing |
| 7 | Voice input is AIM-only | TM handles ambient recording; separate concerns |
| 8 | No voice input on minibar | Minibar has no input row |

---

## Open Questions

- [ ] Should dictation mode support "append" (keep existing text) vs "replace"?
- [ ] Wake word support? ("Hey Carbon, ...")
- [ ] Voice command vocabulary beyond natural language queries?

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-05 | Initial specification — two interaction modes, visual states, error handling |
