# Phase 8: Left Pane System — Progress Tracker

**Last Updated:** 2026-02-06
**Status:** Not Started

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

- [ ] Left pane shows Menu view by default
- [ ] View switching (☰ / ✦ / 🎙) works correctly
- [ ] 🎙 icon conditional on transcription session for current patient
- [ ] Active view icon shows indicator
- [ ] Pane collapse/expand; always re-expands to Menu
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

- [ ] Header: view icons left, collapse pinned right
- [ ] Gradient fade on header
- [ ] Context headers float with blur
- [ ] Opaque footer only on drawer views
- [ ] Menu view identical to pre-Phase 8 sidebar

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
| | | |

### Modified Files

| File | Chunk | Changes |
|---|---|---|
| | | |

---

## Reuse Audit

Track which existing components were reused vs. new creation:

| Need | Existing Component | Reused? | Notes |
|---|---|---|---|
| View toggle icons | IconButton? | ☐ | |
| Suggestion display | SuggestionCard? | ☐ | |
| AI response renderer | ResponseDisplay? | ☐ | |
| Context banner | ContextBanner? | ☐ | |
| Quick action chips | QuickAction? | ☐ | |
| AI text input | AIInput? | ☐ | |
| Transcript segments | TranscriptSegment? | ☐ | |
| Waveform indicator | WaveformIndicator? | ☐ | |
| Controls bar | ControlsBar? | ☐ | |
| Patient avatar | Avatar/Initials? | ☐ | |
| Modal | Modal? | ☐ | |
| Toggle/Switch | Toggle? | ☐ | |
| Dropdown/Select | Select? | ☐ | |

---

## Issues & Decisions

Track any issues encountered or decisions made during implementation:

| # | Issue | Decision | Chunk |
|---|---|---|---|
| | | | |

---

## Notes

- Phase 7 (Bottom Bar System) must be complete before starting Phase 8
- Chunks marked "Manual review" in PHASE_8_PROMPTS.md should be run one at a time
- Always run the reuse audit before creating new components
- Update this tracker after each chunk completes

---

## Future Phases

| Phase | Name | Scope | Spec |
|-------|------|-------|------|
| **9** | Voice Input for AI | Press-and-hold commands, tap dictation for AI input | VOICE_INPUT.md |
| **10** | Scribe Role Support | Drawer-first workflow, role-based defaults | TBD |
| **11** | Entity Extraction Display | Extracted entities from transcription | TBD |
