# AI Control Surface Feature Specification

**Last Updated:** 2026-02-02
**Status:** In Development - Needs Refactoring

---

## Overview

The AI Control Surface is a unified bottom-docked component that combines:
- **Transcription Pill** - Recording controls and status
- **AI Minibar/Palette** - AI assistance, suggestions, and commands

These two modules have **tightly coupled states** and should animate as a single coordinated unit.

---

## Core Requirements

### R1: Constant Total Width
The combined width of both modules (including gap) must remain constant during all transitions to prevent visual jitter.

```
Total Width = TranscriptionPill + Gap + AISurface = CONSTANT
```

### R2: Button Position Consistency
Primary action buttons (Start/Pause/Resume) must always be **pinned to the rightmost position** for muscle memory.

### R3: Coordinated State Transitions
When one module changes state, the other must respond in sync (same timing, no visual lag).

### R4: Recording State Handoffs
Transcription state changes should trigger corresponding minibar content changes.

---

## State Dimensions

### Transcription Status (External Input)
| Value | Description |
|-------|-------------|
| `idle` | No recording, ready to start |
| `recording` | Actively recording |
| `paused` | Recording paused by user |
| `processing` | Post-recording processing |
| `error` | Recording error |

### AI Mode (External Input)
| Value | Description |
|-------|-------------|
| `minibar` | Collapsed single-line view |
| `palette` | Expanded multi-line panel |
| `drawer` | Full side drawer (future) |

### Transcription Pill Size (Derived)
| Value | Width | Trigger |
|-------|-------|---------|
| `minimized` | 48px | Palette is open |
| `default` | 160px | Normal state |
| `expanded` | 260px | User-expanded OR recording started |

---

## Complete State Matrix

### When AI Mode = `minibar` (Default)

| Trans. Status | Pill Size | Pill Content | Pill Actions | Minibar Content |
|---------------|-----------|--------------|--------------|-----------------|
| `idle` | default (160px) | Initials + Patient Name (truncated) | [Mic] | Normal content |
| `idle` | expanded (260px) | Initials + Patient Name (full) | [Mic] | Normal content |
| `recording` | default (160px) | Initials + Compact Waveform + Time | [Pause] | Normal content |
| `recording` | expanded (260px) | Initials + Full Waveform + Time | [Discard] [Pause] | Normal content |
| `paused` | expanded (260px) | Initials + Static Waveform + Time | [Discard] [Resume] | "Recording paused" + [Summarize] |

### When AI Mode = `palette` (Expanded)

| Trans. Status | Pill Size | Pill Content | Pill Actions | AI Surface |
|---------------|-----------|--------------|--------------|------------|
| `idle` | minimized (48px) | Initials only | Click → close palette | Full palette |
| `recording` | minimized (48px) | Initials + pulse indicator | Click → close palette | Full palette |
| `paused` | minimized (48px) | Initials + pulse indicator | Click → close palette | Full palette |

---

## State Transition Rules

### T1: Start Recording (idle → recording)
```
IF transcription_status changes to 'recording':
  - Auto-expand pill to 260px (unless palette open)
  - Show compact waveform in default, full waveform in expanded
  - Primary button: Pause (rightmost)
```

### T2: Pause Recording (recording → paused)
```
IF user clicks Pause:
  - Expand pill if in default size
  - Change primary button to Resume (rightmost)
  - Add Discard button (inboard/left)
  - Minibar changes to "Recording paused" + Summarize action
```

### T3: Resume Recording (paused → recording)
```
IF user clicks Resume:
  - Stay expanded
  - Change primary button back to Pause
  - Minibar returns to normal content
```

### T4: Discard Recording (paused → idle)
```
IF user clicks Discard:
  - Reset to idle state
  - Pill contracts to default 160px
  - Show toast "Recording discarded" + Undo (TODO)
  - Minibar returns to normal content
```

### T5: Open Palette (minibar → palette)
```
IF user clicks minibar to expand:
  - Pill minimizes to 48px
  - AI surface expands to fill remaining space
  - Pill shows initials only (with pulse if recording)
```

### T6: Close Palette (palette → minibar)
```
IF user clicks close OR clicks minimized pill:
  - Pill expands back to default (160px)
  - AI surface contracts
  - If was recording: return to recording state display
  - If was paused: return to paused state display
```

---

## Current Implementation Issues

### Issue 1: Animation Desync
**Problem:** Transcription and AI surface animate independently with separate motion.div elements. Even with same timing, browser rendering causes visual jitter.

**Current Code (AIControlSurface.tsx:298-333):**
```tsx
// Two separate motion.div with independent animate props
<motion.div animate={{ width: transcriptionWidth }} ... />
<motion.div style={{ flex: 1 }} ... />
```

**Root Cause:** The `flex: 1` approach doesn't guarantee synchronized animation because flexbox reflow happens after the width animation on the first element.

### Issue 2: Width Calculation Mismatch
**Problem:** When transcription expands to 260px, total width exceeds the fixed container.

**Math:**
- Container: 572px (160 + 12 + 400)
- When expanded: 260 + 12 + 400 = 672px (overflow!)

**Current Code (AIControlSurface.tsx:291):**
```tsx
width: TOTAL_CONTROL_WIDTH, // Fixed at 572px - doesn't account for expanded state
```

### Issue 3: Pause Button Not Working
**Problem:** The `onPause` prop is passed but the parent's `handleTranscriptionPauseAndExpand` may not be wired correctly.

**Current Code (AIControlSurface.tsx:327):**
```tsx
onPause={handleTranscriptionPauseAndExpand}
```

But `handleTranscriptionPauseAndExpand` calls `onTranscriptionPause?.()` which is passed from parent - need to verify parent is providing this.

### Issue 4: State Conflicts
**Problem:** Multiple competing state effects:
- `visuallyMinimized` - delayed for animation
- `isTranscriptionExpanded` - user-controlled
- `isPaletteOpen` - drives both

**Conflict scenario:**
1. User is recording (expanded)
2. Opens palette (should minimize)
3. Closes palette (reset expanded to false - loses recording expansion)

---

## Recommendation: Refactor as Single Component

### Why Merge?

| Concern | Separate Components | Single Component |
|---------|---------------------|------------------|
| Animation sync | Hard - independent motion divs | Easy - single animation context |
| State management | Complex - 4+ state variables | Simple - single state machine |
| Width coordination | Error-prone math | Single container controls all |
| Debugging | Scattered across files | All in one place |
| Testability | Integration tests needed | Unit test state machine |

### Proposed Architecture

```tsx
// Single component with explicit state machine
type AIControlState =
  | { mode: 'minibar'; transcription: 'idle' | 'recording' | 'paused'; expanded: boolean }
  | { mode: 'palette'; transcription: 'idle' | 'recording' | 'paused' }
  | { mode: 'drawer'; transcription: 'idle' | 'recording' | 'paused' };

const AIControlSurface: React.FC<Props> = (props) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  // Single animated container with CSS Grid for layout
  return (
    <motion.div
      animate={{
        gridTemplateColumns: getGridColumns(state),
      }}
      style={{
        display: 'grid',
        width: TOTAL_WIDTH, // Always constant
        gap: GAP_WIDTH,
      }}
    >
      {/* Transcription region */}
      <div style={{ gridColumn: 1 }}>
        {renderTranscription(state)}
      </div>

      {/* AI region */}
      <div style={{ gridColumn: 2 }}>
        {renderAISurface(state)}
      </div>
    </motion.div>
  );
};

const getGridColumns = (state: AIControlState): string => {
  if (state.mode === 'palette') {
    return '48px 1fr'; // Minimized + expanded
  }
  if (state.mode === 'minibar' && state.expanded) {
    return '260px 1fr'; // Expanded transcription
  }
  return '160px 1fr'; // Default
};
```

### Benefits of CSS Grid Approach
1. **Single animation target** - `gridTemplateColumns` animates as one
2. **Constant total width** - Grid container enforces it
3. **Natural content flow** - No absolute positioning needed
4. **Simpler state** - One state machine drives everything

---

## Action Items

### Immediate (Fix Current Bugs)
1. [ ] Fix width math to account for expanded transcription state
2. [ ] Verify `onTranscriptionPause` is wired from parent
3. [ ] Debug why expanded state isn't persisting

### Short-term (Refactor)
1. [ ] Create unified state machine for all states
2. [ ] Refactor to single component with CSS Grid layout
3. [ ] Move all animation to single `gridTemplateColumns` transition
4. [ ] Add visual regression tests

### Long-term (Polish)
1. [ ] Add toast + undo for discard
2. [ ] Add keyboard shortcuts (Space to pause/resume)
3. [ ] Add haptic feedback for mobile

---

## Testing Checklist

### State Transitions
- [ ] Idle → Recording: Pill expands, waveform appears
- [ ] Recording → Paused: Button changes to Resume, minibar shows prompt
- [ ] Paused → Recording: Button changes to Pause, minibar clears
- [ ] Paused → Idle (Discard): Everything resets
- [ ] Any → Palette Open: Pill minimizes smoothly
- [ ] Palette → Minibar: Pill restores to correct state

### Animation Quality
- [ ] Total width stays constant during ALL transitions
- [ ] No jitter or flash during palette open/close
- [ ] Smooth 200ms horizontal transitions
- [ ] Smooth 300ms vertical expansion

### Button Behavior
- [ ] Primary action always rightmost
- [ ] Buttons have correct hover states
- [ ] Buttons don't trigger parent click
- [ ] Disabled states work correctly
