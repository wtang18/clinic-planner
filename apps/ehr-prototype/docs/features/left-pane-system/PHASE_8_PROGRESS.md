# Phase 8: Left Pane System — Progress Tracker

**Last Updated:** 2026-02-06
**Status:** In Progress (3/10 chunks complete)

---

## Chunk Progress

| Chunk | Description | Status | Verified | Notes |
|---|---|---|---|---|
| **8.0** | Documentation updates | ✅ Complete | ☑ | Cross-references added to AI_CONTROL_SURFACE_V2, BOTTOM_BAR_SYSTEM, TRANSCRIPTION_MODULE, README |
| **8.1** | Left pane state & types | ✅ Complete | ☑ | types.ts, reducer.ts, selectors.ts, useLeftPane.tsx |
| **8.2** | Left pane container | ✅ Complete | ☑ | LeftPaneContainer, PaneHeader, PaneContent with placeholders |
| **8.3** | AI drawer view | 🔲 Not Started | ☐ | Context header, suggestions, conversation history |
| **8.4** | AI drawer footer | 🔲 Not Started | ☐ | Quick actions, input row, filtering logic |
| **8.5** | Transcription drawer view | 🔲 Not Started | ☐ | Transcript, view indicator pill, controls |
| **8.6** | Settings modal & activity log | 🔲 Not Started | ☐ | Full-screen modals for both |
| **8.7** | Drawer ↔ bottom bar coordination | 🔲 Not Started | ☐ | De-escalation, composition, grid updates |
| **8.8** | Keyboard shortcuts | 🔲 Not Started | ☐ | ⌘K and Escape updates |
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
- [ ] AI drawer: suggestions, conversation, quick actions render
- [ ] Quick actions filtered by active suggestions
- [ ] Conversation: user right, AI left, system centered
- [ ] Follow-up actions only on latest AI response
- [ ] Transcript: live transcript with speaker diarization
- [ ] View indicator pill: correct state (Live/Paused/Processing)
- [ ] [↓ Latest] on scroll-up, scrolls to bottom on tap
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

### Modified Files

| File | Chunk | Changes |
|---|---|---|
| `docs/features/bottom-bar-system/AI_CONTROL_SURFACE_V2.md` | 8.0 | Added supersession notice for §5 |
| `docs/features/bottom-bar-system/BOTTOM_BAR_SYSTEM.md` | 8.0 | Added cross-reference to DRAWER_COORDINATION |
| `docs/features/bottom-bar-system/TRANSCRIPTION_MODULE.md` | 8.0 | Added session scope update notice |
| `docs/README.md` | 8.0 | Added Bottom Bar and Left Pane system sections |
| `src/hooks/index.ts` | 8.1 | Added left pane hook exports |
| `src/components/index.ts` | 8.2 | Added LeftPane component exports |

---

## Reuse Audit

Track which existing components were reused vs. new creation:

| Need | Existing Component | Reused? | Notes |
|---|---|---|---|
| View toggle icons | IconButton | ☑ | Used for collapse button; custom ViewIcon for view toggles |
| Suggestion display | SuggestionCard? | ☐ | Chunk 8.3 |
| AI response renderer | ResponseDisplay? | ☐ | Chunk 8.3 |
| Context banner | ContextBanner? | ☐ | Chunk 8.3 |
| Quick action chips | QuickAction? | ☐ | Chunk 8.4 |
| AI text input | AIInput? | ☐ | Chunk 8.4 |
| Transcript segments | TranscriptSegment? | ☐ | Chunk 8.5 |
| Waveform indicator | WaveformIndicator | ☐ | Chunk 8.5 |
| Controls bar | ControlsBar | ☐ | Chunk 8.5 |
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
