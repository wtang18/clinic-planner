# Bottom Bar System — Implementation Progress

**Last Updated:** 2026-02-05
**Status:** All Chunks Complete — Ready for Polish & E2E Testing

---

## Implementation Overview

Total chunks: 8 (7.0–7.7)
Estimated files: ~30 (new + modified)

---

## Chunk Status

| Chunk | Description | Status | Notes |
|-------|-------------|--------|-------|
| **7.0** | Documentation refactor | `done` | Specs created |
| **7.1** | Bottom bar state & types | `done` | types, reducer, selectors, initialState, mockTranscripts |
| **7.2** | Shared primitives | `done` | DragHandle, MiniAnchor, ControlsBar |
| **7.3** | Transcription module | `done` | 3-container architecture, 2-stage animations |
| **7.4** | AI Surface refactor | `done` | AISurfaceModule with matching tier system |
| **7.5** | Bottom Bar orchestrator | `done` | BottomBarContainer + Provider |
| **7.6** | Sidebar integration | `done` | TranscriptionIndicator on encounter tabs |
| **7.7** | Demo scenarios & Storybook | `done` | Stories for TM, AIM, SharedPrimitives, BottomBarSystem |

**Legend:** `done` | `in-progress` | `pending` | `blocked` | `skipped`

---

## Files Created/Modified

### 7.1: State & Types ✓
- [x] `src/state/bottomBar/types.ts`
- [x] `src/state/bottomBar/reducer.ts`
- [x] `src/state/bottomBar/selectors.ts`
- [x] `src/state/bottomBar/initialState.ts`
- [x] `src/state/bottomBar/mockTranscripts.ts`
- [x] `src/state/bottomBar/demoScenarios.ts`
- [x] `src/state/bottomBar/index.ts`
- [x] `src/hooks/useBottomBar.tsx`

### 7.2: Shared Primitives ✓
- [x] `src/components/bottom-bar/DragHandle.tsx`
- [x] `src/components/bottom-bar/MiniAnchor.tsx`
- [x] `src/components/bottom-bar/ControlsBar.tsx`
- [x] `src/components/bottom-bar/index.ts`

### 7.3: Transcription Module ✓
- [x] `src/components/bottom-bar/transcription/TranscriptionModule.tsx` (unified component)
- [x] `src/components/bottom-bar/transcription/TranscriptionBar.tsx` (legacy, kept for reference)
- [x] `src/components/bottom-bar/transcription/TranscriptionPalette.tsx` (legacy)
- [x] `src/components/bottom-bar/transcription/TranscriptionDrawer.tsx`
- [x] `src/components/bottom-bar/transcription/WaveformIndicator.tsx`
- [x] `src/components/bottom-bar/transcription/AvatarWithBadge.tsx`
- [x] `src/components/bottom-bar/transcription/StatusBadge.tsx`
- [x] `src/components/bottom-bar/transcription/RecordingStatusGroup.tsx`
- [x] `src/components/bottom-bar/transcription/containers/AvatarContainer.tsx`
- [x] `src/components/bottom-bar/transcription/containers/ContentContainer.tsx`
- [x] `src/components/bottom-bar/transcription/containers/ControlsContainer.tsx`
- [x] `src/components/bottom-bar/transcription/containers/index.ts`
- [x] `src/components/bottom-bar/transcription/index.ts`

### 7.4: AI Surface ✓
- [x] `src/components/bottom-bar/ai/AISurfaceModule.tsx`
- [x] `src/components/bottom-bar/ai/index.ts`

### 7.5: Orchestrator ✓
- [x] `src/components/bottom-bar/BottomBarContainer.tsx`
- [x] `src/components/bottom-bar/BottomBarProvider.tsx`

### 7.6: Sidebar Integration ✓
- [x] `src/components/sidebar/TranscriptionIndicator.tsx` (already implemented)
- [x] `src/components/layout/PatientWorkspaceItem.tsx` (added tabRecordingStatuses prop)

### 7.7: Storybook ✓
- [x] `src/stories/bottom-bar/TranscriptionModule.stories.tsx`
- [x] `src/stories/bottom-bar/BottomBarSystem.stories.tsx`
- [x] `src/stories/bottom-bar/SharedPrimitives.stories.tsx`
- [x] `src/stories/bottom-bar/AIPalette.stories.tsx`

---

## Architecture Notes

### TranscriptionModule 3-Container Architecture

The TranscriptionModule uses a unified component with 3 internal containers:

```
TranscriptionModule (frame with 2-stage animation)
├── AvatarContainer (identity: avatar + patient name)
├── ContentContainer (display: waveform, transcript, status)
└── ControlsContainer (actions: timer + buttons)
```

### 2-Stage Animation Pattern

Matches AIM (AI Minibar) animation choreography:

**EXPAND (bar → palette):**
1. Width first: 160px → 432px
2. Height second: 48px → auto

**COLLAPSE (palette → bar):**
1. Height first: auto → 48px
2. Width second: 432px → 160px

### Animation Phases

```typescript
type AnimationPhase =
  | 'idle-mini'           // 48×48 micro state
  | 'idle-bar'            // 160×48 bar state
  | 'expanding-width'     // Stage 1: width animation
  | 'expanding-height'    // Stage 2: height animation
  | 'idle-palette'        // 432×auto palette state
  | 'collapsing-height'   // Stage 1: height animation
  | 'collapsing-width'    // Stage 2: width animation
  | 'mini-expanding-width'  // mini→palette width
  | 'mini-collapsing-width' // palette→mini width
```

### Key Layout Decisions

1. **Button always anchored to right edge** - Uses `marginLeft: auto` in flexbox
2. **Avatar pinned to left edge** - No layout animation on AvatarContainer
3. **Crossfade during transitions** - Waveform, timer, name fade out during width/height changes
4. **No framer-motion `layout` props** - Prevents position interpolation issues

---

## Session Notes

### 2026-02-05: Animation Polish Session

**Issues Fixed:**
1. **Avatar jumping** - Removed `layout` prop from AvatarContainer
2. **Control button sliding to center** - Removed `layoutId`/`layout` from UnifiedActionButton
3. **Control button flash during bar→palette** - Use bar layout during `expanding-height` phase
4. **Control button flash to left** - Changed `marginLeft: 8` to `marginLeft: 'auto'`
5. **Avatar sliding during palette→mini** - Pin to left during collapse, center only at idle-mini
6. **Waveform-timer gap too large** - Adjusted flex and spacing in ControlsContainer

**Key Insight:** Framer-motion's `layout` and `layoutId` props animate position changes during container resize, causing elements to interpolate through center positions. Solution: Remove layout props and use CSS for positioning.

### 2026-02-05: Sidebar Integration (7.6)

**Implementation:**
- `TranscriptionIndicator` component already existed with all states (recording, paused, processing, complete, none)
- Updated `PatientWorkspaceItem` to use `TranscriptionIndicator` instead of inline Mic/Check icons
- Added `tabRecordingStatuses` prop (Record<string, RecordingStatus>) for per-tab indicators
- Visit-type tabs now show indicator when recording/paused/processing via `recordingStatusToIndicator()` helper

**Usage:**
```tsx
<PatientWorkspaceItem
  name="John Doe"
  workspaceTabs={tabs}
  recordingStatus="recording"  // patient-level summary
  tabRecordingStatuses={{      // per-tab detail
    'visit-123': 'recording',
    'visit-456': 'paused',
  }}
/>
```

### 2026-02-03: Initial Planning Session

**Architecture Shift:**
- Previous: `TranscriptionPill` + `AIMinibar` as independent components
- New: `BottomBarContainer` as CSS Grid orchestrator, modules as grid children

---

## Next Steps

### Polish Tasks (All Chunks Complete)
- [ ] Verify mutual exclusion (TM palette open → AIM mini, vice versa)
- [ ] Test all tier transitions in Storybook
- [ ] Verify crossfade timing matches AIM
- [ ] Test palette→mini direct transition

### Future Phases
- **Phase 8**: Voice commands in AI Surface input row
- **Phase 9**: Scribe role support (drawer as primary view)
- **Phase 10**: Entity extraction display

---

## Verification Checklist

### Functional ✓
- [x] Transcription module renders in all states (idle, recording, paused, processing, error)
- [x] Mic button starts recording
- [x] Pause/Resume controls work
- [x] Palette opens on bar tap, closes on drag handle
- [x] Mini mode shows avatar with status badge
- [ ] Discard shows inline confirmation (needs verification)
- [ ] Drawer shows scrollable transcript (needs verification)

### Animation ✓
- [x] 2-stage expand: width first, height second
- [x] 2-stage collapse: height first, width second
- [x] Avatar stays pinned to left during transitions
- [x] Button stays pinned to right during transitions
- [x] Crossfade on waveform/timer/name during transitions

### Coordination (partial)
- [ ] Opening TM palette forces AIM to mini
- [ ] Opening AIM palette forces TM to mini
- [ ] Direct-switch via mini anchor tap
- [x] Sidebar indicators update with recording state (via tabRecordingStatuses prop)

---

## Document References

| Document | Purpose |
|----------|---------|
| [BOTTOM_BAR_SYSTEM.md](./BOTTOM_BAR_SYSTEM.md) | Grid layout, mutual exclusion, coordination |
| [TRANSCRIPTION_MODULE.md](./TRANSCRIPTION_MODULE.md) | Component spec with 50 decisions |
| [AI_CONTROL_SURFACE_V2.md](./AI_CONTROL_SURFACE_V2.md) | AI-specific behavior |
| [SHARED_PATTERNS.md](./SHARED_PATTERNS.md) | Shared components, animation, a11y |
| [PHASE_7_PROMPTS.md](./PHASE_7_PROMPTS.md) | Implementation prompts per chunk |
