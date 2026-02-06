# Phase 8: Left Pane System — Progress Tracker

**Last Updated:** 2026-02-06
**Status:** In Progress (8/10 chunks complete)

---

## Chunk Progress

| Chunk | Description | Status | Verified | Notes |
|---|---|---|---|---|
| **8.0** | Documentation updates | ✅ Complete | ☑ | Cross-references added to AI_CONTROL_SURFACE_V2, BOTTOM_BAR_SYSTEM, TRANSCRIPTION_MODULE, README |
| **8.1** | Left pane state & types | ✅ Complete | ☑ | types.ts, reducer.ts, selectors.ts, useLeftPane.tsx |
| **8.2** | Left pane container | ✅ Complete | ☑ | LeftPaneContainer, PaneHeader, PaneContent with placeholders |
| **8.3** | AI drawer view | ✅ Complete | ☑ | AIContextHeader, SuggestionsSection, ConversationHistory, AIDrawerView |
| **8.4** | AI drawer footer | ✅ Complete | ☑ | QuickActionsRow, AIDrawerInput, AIDrawerFooter |
| **8.5** | Transcription drawer view | ✅ Complete | ☑ | TranscriptionContextHeader, ViewIndicatorPill, TranscriptContent, TranscriptionControlsFooter, TranscriptionDrawerView |
| **8.6** | Settings modal & activity log | 🔲 Not Started | ☐ | Full-screen modals for both |
| **8.7** | Drawer ↔ bottom bar coordination | ✅ Complete | ☑ | useDrawerCoordination hook, action overrides in LeftPaneContainer |
| **8.8** | Keyboard shortcuts | ✅ Complete | ☑ | useAIKeyboardShortcuts hook, AIKeyboardShortcutsProvider, input registration |
| **8.9** | Storybook stories & demo | 🔲 Not Started | ☐ | Component stories, workflow demos, a11y |

**Legend:** 🔲 Not Started · 🔄 In Progress · ✅ Complete · ⚠️ Blocked · 🔁 Needs Revision

---

## Verification Checklist

### Functional

- [x] Left pane shows Menu view by default
- [x] View switching (☰ / ✦ / 🎙) works correctly (UI ready, needs integration)
- [x] 🎙 icon conditional on transcription session for current patient
- [x] Active view icon shows indicator
- [x] Pane collapse/expand; always re-expands to Menu
- [x] AI drawer: suggestions, conversation, quick actions render
- [x] Quick actions row with horizontal scroll
- [ ] Conversation: user right, AI left, system centered
- [ ] Follow-up actions only on latest AI response
- [x] Transcript: live transcript with speaker diarization
- [x] View indicator pill: correct state (Live/Paused/Processing)
- [x] [↓ Latest] on scroll-up, scrolls to bottom on tap
- [ ] Settings modal from ⚙ (header and footer)
- [ ] Activity log modal from 📋
- [ ] Both modals close with [Done]

### Coordination

- [ ] AI drawer active → AI hidden from bottom bar
- [ ] Transcript drawer active → Transcription hidden from bottom bar
- [ ] Menu active → both modules at resting tiers
- [ ] Pane collapsed → both modules at resting tiers
- [ ] No dual-surface rendering
- [ ] Cross-surface combos work
- [ ] De-escalation: straight to resting tier

### Keyboard

- [ ] ⌘K focuses correct AI input per state
- [ ] Escape behavior per spec
- [ ] Enter sends, Shift+Enter newline

### Visual

- [x] Header: view icons left, collapse pinned right
- [x] Gradient fade on header
- [ ] Context headers float with blur
- [ ] Opaque footer only on drawer views
- [x] Menu view identical to pre-Phase 8 sidebar

### Storybook

- [ ] All component stories render
- [ ] Composite workflows demonstrate transitions
- [ ] a11y addon: no critical issues

---

## Components Created/Modified

Track files touched during implementation:

### New Files

| File | Chunk | Description |
|---|---|---|
| `src/state/leftPane/types.ts` | 8.1 | PaneView, LeftPaneState, BottomBarVisibility types |
| `src/state/leftPane/reducer.ts` | 8.1 | leftPaneReducer, initialState, action creators |
| `src/state/leftPane/selectors.ts` | 8.1 | deriveBottomBarVisibility, view selectors |
| `src/state/leftPane/index.ts` | 8.1 | Barrel exports |
| `src/hooks/useLeftPane.tsx` | 8.1 | LeftPaneProvider, useLeftPane, useBottomBarVisibility hooks |
| `src/components/LeftPane/LeftPaneContainer.tsx` | 8.2 | Main container with collapse/expand |
| `src/components/LeftPane/PaneHeader.tsx` | 8.2 | View icons + collapse button |
| `src/components/LeftPane/PaneContent.tsx` | 8.2 | Content switcher with MenuPane pass-through |
| `src/components/LeftPane/index.ts` | 8.2 | Barrel exports |
| `src/components/LeftPane/AIDrawer/AIContextHeader.tsx` | 8.3 | Floating context header with blur backdrop |
| `src/components/LeftPane/AIDrawer/SuggestionsSection.tsx` | 8.3 | Collapsible suggestions section, reuses SuggestionList |
| `src/components/LeftPane/AIDrawer/ConversationHistory.tsx` | 8.3 | User/AI/system message thread with auto-scroll |
| `src/components/LeftPane/AIDrawer/AIDrawerView.tsx` | 8.3 | Main AI drawer container with empty states |
| `src/components/LeftPane/AIDrawer/index.ts` | 8.3, 8.4 | Barrel exports for AIDrawer |
| `src/components/LeftPane/AIDrawer/QuickActionsRow.tsx` | 8.4 | Horizontal scrollable quick action chips |
| `src/components/LeftPane/AIDrawer/AIDrawerInput.tsx` | 8.4 | Light-themed input with mic/send buttons |
| `src/components/LeftPane/AIDrawer/AIDrawerFooter.tsx` | 8.4 | Footer container for quick actions + input |
| `src/components/LeftPane/TranscriptionDrawer/TranscriptionContextHeader.tsx` | 8.5 | Floating header with patient info |
| `src/components/LeftPane/TranscriptionDrawer/ViewIndicatorPill.tsx` | 8.5 | Live/Paused/Processing pill with waveform |
| `src/components/LeftPane/TranscriptionDrawer/TranscriptContent.tsx` | 8.5 | Scrollable transcript with speaker diarization |
| `src/components/LeftPane/TranscriptionDrawer/TranscriptionControlsFooter.tsx` | 8.5 | Light-themed controls footer |
| `src/components/LeftPane/TranscriptionDrawer/TranscriptionDrawerView.tsx` | 8.5 | Main container composing all pieces |
| `src/components/LeftPane/TranscriptionDrawer/index.ts` | 8.5 | Barrel exports |
| `src/hooks/useDrawerCoordination.tsx` | 8.7 | Coordination hook bridging left pane and bottom bar |
| `src/hooks/useAIKeyboardShortcuts.tsx` | 8.8 | ⌘K and Escape shortcuts with left pane awareness |

### Modified Files

| File | Chunk | Changes |
|---|---|---|
| `docs/features/bottom-bar-system/AI_CONTROL_SURFACE_V2.md` | 8.0 | Added supersession notice for §5 |
| `docs/features/bottom-bar-system/BOTTOM_BAR_SYSTEM.md` | 8.0 | Added cross-reference to DRAWER_COORDINATION |
| `docs/features/bottom-bar-system/TRANSCRIPTION_MODULE.md` | 8.0 | Added session scope update notice |
| `docs/README.md` | 8.0 | Added Bottom Bar and Left Pane system sections |
| `src/hooks/index.ts` | 8.1 | Added left pane hook exports |
| `src/components/index.ts` | 8.2, 8.3 | Added LeftPane and AIDrawer component exports |
| `src/components/LeftPane/PaneContent.tsx` | 8.3 | Added AIDrawerView integration, removed placeholder |
| `src/components/LeftPane/LeftPaneContainer.tsx` | 8.3 | Added aiDrawerProps and aiDrawerFooter pass-through |
| `src/components/LeftPane/index.ts` | 8.3 | Added AIDrawer exports |
| `src/hooks/index.ts` | 8.7 | Added useDrawerCoordination exports |
| `src/components/LeftPane/LeftPaneContainer.tsx` | 8.7 | Added onViewChange, onCollapse action overrides |
| `src/state/leftPane/selectors.ts` | 8.7 | Fixed tier name 'minibar' → 'mini' |
| `src/context/AppProviders.tsx` | 8.8 | Added AIKeyboardShortcutsProvider |
| `src/shortcuts/defaultShortcuts.ts` | 8.8 | Disabled conflicting ⌘K (handled by new hook) |
| `src/components/LeftPane/AIDrawer/AIDrawerInput.tsx` | 8.8 | Added input registration for ⌘K focus |
| `src/components/ai-ui/AIInputArea.tsx` | 8.8 | Added input registration for ⌘K focus |

---

## Reuse Audit

Track which existing components were reused vs. new creation:

| Need | Existing Component | Reused? | Notes |
|---|---|---|---|
| View toggle icons | IconButton | ☑ | Used for collapse button; custom ViewIcon for view toggles |
| Suggestion display | SuggestionList | ☑ | Reused in SuggestionsSection, variant="default" |
| AI response renderer | — | ☑ | Created new ConversationHistory with AIMessage/UserMessage |
| Context header | — | ☑ | Created new AIContextHeader (different from palette ContextBanner) |
| Quick action chips | — | ☑ | Created QuickActionsRow with light theme (palette version is dark) |
| AI text input | — | ☑ | Created AIDrawerInput with light theme (palette AIInputArea is dark) |
| Transcript segments | — | ☑ | Created TranscriptContent with SegmentRow (new) |
| Waveform indicator | WaveformIndicator | ☑ | Reused in ViewIndicatorPill |
| Controls bar | — | ☑ | Created TranscriptionControlsFooter with light theme (palette ControlsContainer is dark) |
| Patient avatar | Avatar/Initials? | ☐ | |
| Modal | Modal? | ☐ | Chunk 8.6 |
| Toggle/Switch | Toggle? | ☐ | Chunk 8.6 |
| Dropdown/Select | Select? | ☐ | Chunk 8.6 |
| Menu pane content | MenuPane | ☑ | Pass-through in PaneContent |

---

## Issues & Decisions

Track any issues encountered or decisions made during implementation:

| # | Issue | Decision | Chunk |
|---|---|---|---|
| 1 | TierState already had 'drawer' | No change needed - Phase 7 already added it | 8.1 |
| 2 | typography.fontSize not available | Used inline font sizes (16, 14) for placeholder styles | 8.2 |
| 3 | Coordination requires both providers | Created useDrawerCoordination as bridge hook; LeftPaneContainer accepts optional action overrides | 8.7 |

---

## Notes

- Phase 7 (Bottom Bar System) must be complete before starting Phase 8
- Chunks marked "Manual review" in PHASE_8_PROMPTS.md should be run one at a time
- Always run the reuse audit before creating new components
- Update this tracker after each chunk completes
- See [INTEGRATION_PLAN.md](../INTEGRATION_PLAN.md) for the overall integration approach and workflow priorities

---

## Future Phases

| Phase | Name | Scope | Spec |
|-------|------|-------|------|
| **9** | Voice Input for AI | Press-and-hold commands, tap dictation for AI input | VOICE_INPUT.md |
| **10** | Scribe Role Support | Drawer-first workflow, role-based defaults | TBD |
| **11** | Entity Extraction Display | Extracted entities from transcription | TBD |
