# Tx Module Workspace Scoping

**Status**: Design discussion — not yet implemented
**Last discussed**: 2026-02-26

## Goal

The transcription module should only appear within a patient's workspace (overview, current visit, any additional encounter space). All other views (home, visits, to-do, my patients) and their child views should never show the Tx module. When the user navigates away from the patient workspace that owns the Tx session, recording should auto-pause with a toast notification. A persistent recording indicator in the menu pane lets the user tap to return to the active session.

## Current State

- `TranscriptionProvider` is per-encounter (nested inside `EncounterLoader`)
- **No workspace gating** — once recording starts, Tx module stays visible regardless of navigation
- **No auto-pause** — recording continues through workspace/tab switches
- **No global recording indicator** — menu pane doesn't know about active Tx sessions
- `deriveBottomBarVisibility()` in `src/state/leftPane/selectors.ts` has an `inEncounter` parameter but it's **unused**
- `SuggestionScheduleRunner` and `DraftEngineRunner` both depend on `isRecording` / segment arrival — auto-pause affects their behavior

## Proposed Approach

### Three pieces

1. **`ActiveRecordingContext`** — lightweight global provider
   - Holds `{ isRecording, isPaused, encounterId, patientId, patientName }`
   - Written to by `TranscriptionContext` on start/pause/resume/stop
   - Read by menu pane indicator (globally visible, outside encounter provider tree)
   - Read by auto-pause hook to compare against current navigation target

2. **`useTranscriptionAutoPause`** — hook inside EncounterLoader tree
   - Watches `NavigationContext` for active screen/tab
   - Compares against the encounter ID that owns the Tx session
   - On divergence: calls `pause()`, fires toast ("Recording paused — tap to return")
   - On return: calls `resume()` (or waits for user to manually resume — see open question below)

3. **Menu pane recording indicator**
   - Reads from `ActiveRecordingContext`
   - Renders recording dot + patient name (e.g., "Recording: Lauren S.")
   - `onClick` navigates to the source workspace tab and expands Tx palette for immediate context/control

### Suggestion/draft timer behavior on auto-pause

When auto-paused, suggestion schedule timeouts and draft engine timers should also pause. This prevents suggestions from an encounter arriving while the user is looking at a different patient. Implementation: `SuggestionScheduleRunner` already clears timeouts when `isRecording` goes false. `DraftEngineRunner` should follow the same pattern (the `useDraftEngine` hook already stops the engine when `enabled` goes false — if we gate on `isRecording` rather than just segment presence, this comes for free).

## Behavioral Rules

| User location | Tx module visible? | Recording state | Menu indicator |
|---|---|---|---|
| Patient workspace (encounter that owns session) | Yes | Active | Shows "Recording" |
| Same patient, different encounter tab | No | Auto-paused | Shows "Paused — tap to return" |
| Different patient's workspace | No | Auto-paused | Shows "Paused — tap to return" |
| Home / Visits / To-Do / My Patients | No | Auto-paused | Shows "Paused — tap to return" |
| Settings | No | Auto-paused | Shows "Paused — tap to return" |

## Open Questions

1. **One active Tx session constraint**: Can only one Tx session be active across the entire app at a time? This matches clinical reality (provider is in one room) but worth confirming. If yes, starting a new recording in a different encounter should either (a) stop the first session or (b) be blocked with a prompt.

2. **Auto-resume on return**: When the user navigates back to the encounter with the active session, should recording auto-resume or require manual resume? Auto-resume is smoother for demos but could be surprising in real use (provider might return to check something without wanting to record). Suggestion: auto-resume with a brief toast ("Recording resumed") — the pause was system-initiated, so system-initiated resume feels balanced.

3. **Multi-patient workspace edge case**: If a provider has two patient tabs open side by side, what's the scoping rule? Follow the active/focused tab? Or follow which workspace the Tx session was started in?

4. **Toast design**: System toast vs. inline banner in the Tx module area? Toast is more noticeable but transient. Inline banner persists and reminds the user there's a paused session. Could do both — toast on auto-pause, persistent indicator in menu pane.

5. **Tx palette expansion on return**: When user taps the menu indicator to return, should it (a) just navigate to the workspace, (b) navigate + expand palette, or (c) navigate + expand palette + auto-resume? The ask says "expand Tx palette for immediate context/control" — so (b) or (c). Leaning (b) — let the user decide to resume.

## Key Files

| File | Role |
|---|---|
| `src/context/TranscriptionContext.tsx` | Per-encounter Tx state, start/pause/resume/stop |
| `src/navigation/EncounterLoader.tsx` | TranscriptionProvider nesting, runner components |
| `src/navigation/NavigationContext.tsx` | Screen/mode/encounter navigation state |
| `src/state/leftPane/selectors.ts` | `deriveBottomBarVisibility()` — has unused `inEncounter` param |
| `src/state/coordination/selectors.ts` | `txVisible` — currently no encounter context check |
| `src/components/bottom-bar/BottomBarContainer.tsx` | Bridges Tx state to bottom bar session |

## Related Docs

- [Bottom Bar System](../../features/bottom-bar-system/TRANSCRIPTION_MODULE.md)
- [Left Pane System](../../features/left-pane-system/LEFT_PANE_SYSTEM.md)
- [Drawer Coordination](../../features/left-pane-system/DRAWER_COORDINATION.md)
