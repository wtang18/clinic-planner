# Bottom Bar + Left Pane Integration Plan

**Created:** 2026-02-06
**Status:** Active
**Priority Workflow:** Charting

---

## Overview

This document guides the integration of two major UI systems into the EHR prototype:

1. **Bottom Bar System** (Phase 7) - AI Minibar + Transcription Module
2. **Left Pane System** (Phase 8) - Menu / AI Drawer / Transcript Drawer

These systems must coordinate: drawer views in the left pane suppress corresponding modules in the bottom bar to prevent duplicate UI.

---

## Current State

| System | Components | State/Hooks | App Integration |
|--------|------------|-------------|-----------------|
| **Bottom Bar** | ✅ AIMinibar, TranscriptionModule, BottomBarContainer | ✅ useBottomBar, tier state | ❌ Not integrated |
| **Left Pane** | 🔄 Container shell + placeholders | ✅ useLeftPane, coordination selectors | ❌ Not integrated |

### What's Built

**Bottom Bar (Phase 7 complete):**
- `src/components/bottom-bar/` - Full component hierarchy
- `src/state/bottomBar/` - Tier state management
- `src/hooks/useBottomBar.tsx` - Provider and hooks
- Tri-state system: mini → bar → palette

**Left Pane (Phase 8 partial):**
- `src/state/leftPane/` - State, reducer, selectors (8.1 ✅)
- `src/components/LeftPane/` - Container, header, content switcher (8.2 ✅)
- `src/hooks/useLeftPane.tsx` - Provider and hooks
- `deriveBottomBarVisibility()` - Coordination logic (built, not wired)

### What's Missing

- AI Drawer content (suggestions, conversation, input)
- Transcript Drawer content (live transcript, controls)
- Actual integration into prototype app screens
- Wiring coordination between systems

---

## Integration Approach

### Phase Ordering

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 8 COMPLETION (Left Pane Content)                         │
├─────────────────────────────────────────────────────────────────┤
│  8.3  AI Drawer View        - Context header, suggestions,      │
│                               conversation history               │
│  8.4  AI Drawer Footer      - Quick actions, input row          │
│  8.5  Transcript Drawer     - Live transcript, controls         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  APP INTEGRATION (Both Systems)                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Wire LeftPaneProvider into app root                          │
│  • Wire BottomBarProvider into app root                         │
│  • Replace current sidebar with LeftPaneContainer               │
│  • Add BottomBarContainer to app shell                          │
│  • Connect coordination (useBottomBarVisibility)                │
│  • 8.7 Drawer ↔ Bottom Bar Coordination verification            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  POLISH & VALIDATION                                             │
├─────────────────────────────────────────────────────────────────┤
│  8.8  Keyboard Shortcuts    - ⌘K focus, Escape behavior         │
│  8.9  Storybook Stories     - Component stories, workflows      │
│  8.6  Settings/Activity Log - Full-screen modals (defer)        │
└─────────────────────────────────────────────────────────────────┘
```

### Deferred Items

- **8.6 Settings Modal & Activity Log** - Nice-to-have, not critical path
- **Phase 9 Voice Input** - Spec complete, implement after core integration

---

## Priority Workflows

### 1. Charting (Primary Focus)

The charting workflow is the initial integration target:

**Screen:** Active encounter with patient chart open

**Expected UI State:**
- Left pane: Menu view (default) with encounter context
- Bottom bar: Both modules at resting tier (mini)
- User can expand AI or Transcription from either surface

**Key Interactions:**
- Start transcription → TM escalates to bar tier
- Open AI drawer → AI module hides from bottom bar
- ⌘K → Focus AI input (drawer if open, else palette)

**Demo Scenario:**
1. Provider opens patient chart
2. Starts ambient transcription (TM → bar tier with waveform)
3. AI suggests "Add diagnosis: Type 2 Diabetes" based on transcript
4. Provider taps suggestion → confirmation flow
5. Provider opens AI drawer to ask follow-up question
6. AI module disappears from bottom bar (no duplication)

### 2. Quick Follow-ups (Secondary)

**Screen:** Patient list / schedule view

**Expected UI State:**
- Left pane: Menu view with patient list
- Bottom bar: Both modules at mini tier
- Quick access to AI for cross-patient queries

### 3. Review Mode (Tertiary)

**Screen:** Completed encounter review

**Expected UI State:**
- Left pane: Can switch to Transcript drawer to review session
- Bottom bar: TM at mini (no active recording)
- Historical transcript playback

---

## Integration Checklist

### Pre-Integration (Current Phase)

- [x] Bottom bar components built and tested in Storybook
- [x] Left pane state/hooks implemented
- [x] Left pane container shell built
- [ ] AI Drawer content components (8.3, 8.4)
- [ ] Transcript Drawer content components (8.5)

### App Integration

- [ ] Add `LeftPaneProvider` to app root
- [ ] Add `BottomBarProvider` to app root
- [ ] Replace sidebar in AppShell with `LeftPaneContainer`
- [ ] Add `BottomBarContainer` to app shell layout
- [ ] Wire `useBottomBarVisibility` to BottomBarContainer
- [ ] Verify coordination: drawer open → module hidden
- [ ] Verify de-escalation: drawer close → module at resting tier

### Validation

- [ ] Charting workflow end-to-end
- [ ] No duplicate UI (AI in drawer AND bottom bar)
- [ ] Keyboard shortcuts work correctly
- [ ] Responsive behavior (tablet breakpoint)
- [ ] Storybook stories for key workflows

---

## Architecture Notes

### Provider Hierarchy

```tsx
<LeftPaneProvider>
  <BottomBarProvider>
    <AppShell>
      <LeftPaneContainer />  {/* Reads from both providers */}
      <MainContent />
      <BottomBarContainer /> {/* Reads from both providers */}
    </AppShell>
  </BottomBarProvider>
</LeftPaneProvider>
```

### Coordination Flow

```
User opens AI drawer
       ↓
leftPaneActions.switchView('ai')
       ↓
LeftPaneState.activeView = 'ai'
       ↓
deriveBottomBarVisibility() returns { ai: { visible: false } }
       ↓
BottomBarContainer hides AI module
       ↓
User sees AI in drawer only (no duplication)
```

### Key Files

| Purpose | File |
|---------|------|
| Left pane state | `src/state/leftPane/reducer.ts` |
| Coordination logic | `src/state/leftPane/selectors.ts` |
| Left pane hook | `src/hooks/useLeftPane.tsx` |
| Bottom bar hook | `src/hooks/useBottomBar.tsx` |
| Left pane container | `src/components/LeftPane/LeftPaneContainer.tsx` |
| Bottom bar container | `src/components/bottom-bar/BottomBarContainer.tsx` |

---

## Success Criteria

### Functional

- [ ] Provider can chart with AI assistance and transcription
- [ ] Switching between drawer and bottom bar feels seamless
- [ ] No UI duplication between surfaces
- [ ] State persists correctly across view switches

### Performance

- [ ] View switches feel instant (<100ms perceived)
- [ ] No layout shift when modules hide/show
- [ ] Smooth animations for tier transitions

### Polish

- [ ] Keyboard shortcuts work intuitively
- [ ] Focus management is correct
- [ ] Accessibility: screen reader announces state changes

---

## Related Documents

- [BOTTOM_BAR_SYSTEM.md](./bottom-bar-system/BOTTOM_BAR_SYSTEM.md) - Bottom bar architecture
- [LEFT_PANE_SYSTEM.md](./left-pane-system/LEFT_PANE_SYSTEM.md) - Left pane architecture
- [DRAWER_COORDINATION.md](./left-pane-system/DRAWER_COORDINATION.md) - Coordination rules
- [AI_DRAWER.md](./left-pane-system/AI_DRAWER.md) - AI drawer spec
- [TRANSCRIPTION_DRAWER.md](./left-pane-system/TRANSCRIPTION_DRAWER.md) - Transcript drawer spec
- [VOICE_INPUT.md](./left-pane-system/VOICE_INPUT.md) - Voice input spec (Phase 9)
- [PHASE_8_PROGRESS.md](./left-pane-system/PHASE_8_PROGRESS.md) - Implementation tracker

---

## Revision History

| Date | Change |
|------|--------|
| 2026-02-06 | Initial plan created |
