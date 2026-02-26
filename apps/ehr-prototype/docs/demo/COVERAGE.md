# Feature Coverage Matrix

Implementation status of demo-visible features, by scenario. Use this to answer "is X real?" and "which scenario shows Y?"

**Last audited**: 2026-02-26

## Status Legend

| Status | Meaning |
|---|---|
| **Wired** | Real state flow end-to-end. Actions dispatch, reducers update, UI reflects. |
| **Partial** | Feature exists but not all paths/categories are connected. See notes. |
| **Visual only** | UI renders but no state change occurs. Looks right, does nothing. |
| **Stubbed** | Action type exists in the reducer, but nothing triggers it or consumes the result. |
| **Not implemented** | Referenced in design specs but no code exists. |

---

## Core Charting Features

| Feature | Status | UC Cough | PC Diabetes | AWV | Notes |
|---|---|---|---|---|---|
| **Ambient recording** | Wired | 11 segments, ~31s | 9 segments, ~24s | No transcript | `TranscriptionProvider`, `mock-transcription.ts` |
| **AI Draft generation** | Wired | After 1st segment (3s–75s) | After 1st segment | Immediate | `DraftEngineRunner` → `useDraftEngine` → `draft-engine.ts` |
| **Suggestion scheduling** | Wired | 6 items, onRecord | 4 items, mixed timing | 5 items, immediate | `SuggestionScheduleRunner` → `suggestion-schedule.ts` |
| **Suggestion accept/dismiss** | Wired | Full | Full | Full | Creates chart items via `materializeChartItem()` |
| **Task creation (side effects)** | Wired | On Rx accept | On lab/med accept | On lab accept | `side-effect-handlers.ts` → `TASK_TEMPLATES` |
| **Task lifecycle (auto-progress)** | Wired | All 3 Rx tasks | All task types | Lab tasks | `TaskLifecycleRunner` → `task-lifecycle-simulator.ts` |
| **Processing rail display** | Wired | AI Drafts + Prescriptions batches | AI Drafts + multiple batches | AI Drafts + Labs | `ProcessingRail.tsx`, `useProcessingBatches()` |
| **Chart item CRUD** | Wired | Full | Full | Full | Add, edit, remove. State persists in `entities.items`. |

## OmniAdd V2

| Feature | Status | Notes |
|---|---|---|
| **Text input recognition** | Wired | Parses free text, suggests matching categories. `input-recognizer.ts` |
| **Medication (Rx) form** | Wired | Full fields: type, dosage, route, frequency, duration, refills. 8+ quick-picks. |
| **Lab order form** | Wired | Priority, collection type, vendor. 10+ quick-picks. |
| **Diagnosis form** | Wired | Status, severity, verification. 15+ quick-picks. |
| **Imaging order form** | Wired | Modality, body region, priority, contrast. 10+ quick-picks. |
| **Procedure form** | Wired | Type, location, priority. 8+ quick-picks. |
| **Allergy form** | Wired | Type, severity, verification. 5+ quick-picks. |
| **Referral form** | Wired | Department, provider, reason. 5+ quick-picks. |
| **Reported medication** | Wired | Intent override (`report` vs `prescribe`). Separate field config. |
| **Narrative categories** | Partial | CC, HPI, Plan, Instruction, Note — text entry works. No structured fields, no quick-picks. |
| **ROS / Physical Exam** | Partial | Auto-stub pattern creates items. No structured field forms or quick-picks. |
| **E-prescribe action** | Not implemented | Item is created but no "send" action exists. |
| **Lab send action** | Not implemented | Same — item created, no send. |

## Keyboard Shortcuts

| Feature | Status | Notes |
|---|---|---|
| **Chord engine** | Wired | G-chord sequences, flat shortcuts, modifier combos. `ShortcutManager.ts` |
| **Legend panel** | Wired | `?` opens legend. 3 tabs (Navigate, Charting, Panes). Arrow keys cycle tabs. |
| **Context segment shortcuts** | Wired | `1/2/3` switch between Capture/Process/Review (or Check-in/Triage/Checkout). |
| **Mode toggle** | Wired | `0` toggles Workflow ↔ Chart. |
| **OmniAdd open** | Wired | `/` focuses OmniAdd input. |
| **Transcription toggle** | Wired | `R` starts/stops recording. |
| **Pane shortcuts** | Wired | `Cmd+\`, `Cmd+]`, `Cmd+[` for left pane. `Cmd+Shift+\`, `Cmd+Shift+]`, `Cmd+Shift+[` for overview. |
| **AI Palette** | Partial | `Cmd+K` opens palette (handled by `useAIKeyboardShortcuts`, not ShortcutManager). Legend entry is static. |
| **G → H (Home)** | Wired | Navigates to home. |
| **G → , (Settings)** | Wired | Navigates to settings. |
| **G → 1-9 (Workspace)** | Wired | Navigates to patient workspace slots. |
| **G → V/P/S/T/F/M/C** | Stubbed | 7 navigation chords registered but dispatch placeholder events. No destination pages. |
| **Save (Cmd+S)** | Wired | Dispatches save. Hidden from legend. |

## Task Types & Outcomes

| Task Type | Status | Default Outcome | Timing | Notes |
|---|---|---|---|---|
| `drug-interaction` | Wired | Completed (no interactions) | 1s + 2s | Always passes clean in demo |
| `formulary-check` | Wired | **Failed** ("Not covered") | 1s + 3s | Always fails — shows failure UX |
| `dx-association` | Wired | **Pending-review** | 1s + 1.5s | Pauses for user to link diagnosis |
| `care-gap-evaluation` | Wired | Completed | 1s + 2s | |
| `prior-auth-check` | Wired | Completed | 1s + 2.5s | |
| `note-generation` | Wired | Completed | 1s + 4s | |
| `lab-send` | Wired | Completed (simulated) | 0.5s + 2s | Task completes but no actual send |
| `rx-send` | Wired | Completed (simulated) | 0.5s + 2s | Task completes but no actual send |
| `validation` | Wired | Completed | 0.5s + 1s | |
| Task approval/rejection | Wired | — | — | `TASK_APPROVED`, `TASK_REJECTED` actions |
| Batch approve | Wired | — | — | `TASKS_BATCH_APPROVED` action |

## Workflow & Navigation

| Feature | Status | Notes |
|---|---|---|
| **3-phase workflow** (check-in/triage/checkout) | Partial | Phase switching works via segmented control and `1/2/3` keys. Phase-specific content rendering is wired. Triage form completion tracking works. Full checkout flow (sign-off, lock) is not implemented. |
| **Context bar** | Wired | Shows patient name, visit type, phase indicator. |
| **Mode toggle** (Chart ↔ Workflow) | Wired | Switches layout and available surfaces. |
| **Left pane** (menu/AI/transcript) | Wired | 3 views with pane shortcuts. Menu shows encounter navigation. |
| **Overview pane** | Wired | Patient sidebar with demographics, problems, meds, allergies. |
| **Process mode (full task pane)** | Wired | Slide-in pane with grouped task sections. Batch approve button. |

## Not Implemented

These are referenced in design specs or VISIT_SCENARIOS.md but have no code:

| Feature | Design Spec | Notes |
|---|---|---|
| MA → Provider handoff | VISIT_SCENARIOS.md | Simulated by pre-seeding items on encounter load |
| Encounter signing / locking | VISIT_SCENARIOS.md | No sign-off flow, no locked state |
| Lab results arriving | VISIT_SCENARIOS.md | No inbound result simulation |
| E-prescribe send | VISIT_SCENARIOS.md | Item created, "send" is visual only |
| Care gap exclusion | VISIT_SCENARIOS.md | `CARE_GAP_EXCLUDED` action exists but no UI triggers it |
| Drug interaction alerts | SUGGESTIONS_TASKS.md | Alert generators exist in mocks but no alert UI renders them |
| Unified morphing right rail | Deferred | Open design questions |
| Overview item detail views | Deferred | Individual allergy/med/problem detail panes |
| Responsive layout | Deferred | Processing rail fixed at 200px |
| Cross-category switching | Deferred | Switching category in suggestion edit panel |
| Ambiguous entity resolution | Deferred | Multiple resolution options for ambiguous extractions |

---

## Source Files Quick Reference

| System | Key Files |
|---|---|
| Draft engine | `services/draft-engine/draft-engine.ts`, `types.ts`, `mock-content.ts` |
| Task lifecycle | `services/task-lifecycle-simulator.ts` |
| Suggestion schedule | `navigation/suggestion-schedule.ts` |
| Side-effect handlers | `services/side-effect-handlers.ts` |
| Mock transcripts | `services/transcription/mock-transcription.ts` |
| Mock suggestions | `mocks/generators/suggestions.ts` |
| Mock tasks | `mocks/generators/tasks.ts` |
| OmniAdd machine | `components/omni-add/omni-add-machine.ts` |
| Field definitions | `components/omni-add/fields/index.ts` |
| Shortcut registration | `shortcuts/defaultShortcuts.ts` |
| Pane shortcuts | `shortcuts/usePaneShortcuts.ts` |
| Processing rail | `components/processing-rail/ProcessingRail.tsx` |
| Encounter loader | `navigation/EncounterLoader.tsx` |
| Chart item factory | `utils/chart-item-factory.ts` |
