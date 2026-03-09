# Care Protocol System — Phased Build Plan

**Status:** Not started (CP0 in progress)
**Prerequisites:** Encounter state infrastructure (reducer, entities, coordination) must be stable. AI suggestion system and chart item pipeline must be functional.
**Total estimated effort:** ~35-45 hours across 9 phases (CP0-CP8)

---

## Phase Overview

| Phase | Name | Effort | Dependencies |
|-------|------|--------|-------------|
| **CP0** | Documentation & type foundation | ~2 hrs | None |
| **CP1** | State management | ~4-5 hrs | CP0 complete |
| **CP2** | Mock data (LBP + URI protocols) | ~3-4 hrs | CP1 complete |
| **CP3** | Reference pane container (3-tab, search, empty state) | ~3-4 hrs | CP1 complete |
| **CP4** | Core UI components (ProtocolView, cards, items) | ~5-6 hrs | CP2 + CP3 complete |
| **CP5** | Actions & integration (wire callbacks, assessment form) | ~4-5 hrs | CP4 complete |
| **CP6** | Severity scoring & patient adaptation | ~4-5 hrs | CP5 complete |
| **CP7** | Demo integration (LBP scenario) | ~3-4 hrs | CP6 complete |
| **CP7.5** | Enhancement (URI scenario, polish) | ~3-4 hrs | CP7 complete |
| **CP8** | Polish & edge cases (animations, keyboard, activity log) | ~3-4 hrs | CP7.5 complete |

CP2 and CP3 can run in parallel (no dependency between them). All other phases are sequential.

---

## Phase CP0: Documentation & Type Foundation

**Goal:** Establish the specification documents and define all TypeScript types for the protocol system before writing any runtime code.

### Deliverables

1. **Design specification** (this directory)
   - DESIGN-SPEC.md — restructured from reference spec
   - PHASED-PLAN.md — phase table with dependencies
   - PROGRESS.md — phase tracker

2. **TypeScript type definitions**
   - `src/types/protocol.ts` — all interfaces from DESIGN-SPEC section 1
   - Re-export from `src/types/index.ts`
   - Type-check passes (`tsc --noEmit`)

### Acceptance criteria

- All three doc files created and reviewed
- `protocol.ts` types compile cleanly
- No runtime code yet — types only

---

## Phase CP1: State Management

**Goal:** Build the reducer, selectors, coordination extensions, and side-effect middleware for care protocols.

### Deliverables

1. **Protocol reducer** (`src/state/reducers/protocol.ts`)
   - Handle all 10 protocol action types (section 1.8)
   - Integrate into root reducer

2. **Protocol selectors** (`src/state/selectors/protocol.ts`)
   - All 7 selectors (section 1.9)
   - Completion computation logic (advisory excluded from count)

3. **Coordination state extension**
   - Add `referencePane` to `CoordinationState`
   - New coordination actions: `OVERVIEW_TAB_CHANGED`, `PROTOCOL_TAB_AVAILABLE`, `PROTOCOL_TAB_ACTIVATED`, `PROTOCOL_TAB_DISMISSED`, `PROTOCOL_TAB_COMPLETED`
   - Reducer handlers for all new actions
   - `ENCOUNTER_EXITED` / `ENCOUNTER_SWITCHED` reset referencePane state

4. **Side-effect middleware**
   - Cross-surface resolution: `ITEM_ADDED` triggers protocol item matching
   - `SUGGESTION_ACCEPTED` triggers protocol item marking
   - Auto-complete detection: after `PROTOCOL_ITEM_ADDRESSED`, check if all items addressed

5. **Tests**
   - Protocol reducer tests (action round-trips, completion logic)
   - Selector tests (completion ratio, severity scoring, linked items)
   - Coordination reducer tests (tab lifecycle transitions)
   - Cross-surface middleware tests

### Acceptance criteria

- All protocol actions dispatch and update state correctly
- Selectors return correct computed values
- Coordination tab state machine transitions match spec
- Cross-surface resolution triggers on `ITEM_ADDED` from any source
- All tests passing

---

## Phase CP2: Mock Data (LBP + URI Protocols)

**Goal:** Create realistic protocol template data for the two demo protocols.

### Deliverables

1. **Protocol template registry** (`src/mocks/protocols/registry.ts`)
   - Lookup map of `ProtocolTemplate` objects by ID

2. **Low Back Pain protocol** (`src/mocks/protocols/low-back-pain.ts`)
   - 5-6 cards: History & Assessment, Examination, Diagnostics, Treatment, Education, Follow-Up
   - STarT Back-inspired severity scoring model (3 paths: Mild/Moderate/Severe)
   - Conditional items (neurological exam conditional on red flag results)
   - Level 2 annotation targets (comorbidity, medication, recency fields)

3. **URI protocol** (`src/mocks/protocols/uri.ts`)
   - 3-4 cards: History & Assessment, Examination, Treatment, Follow-Up
   - No severity scoring
   - Minimal conditional items (antibiotic conditional on duration >10d)
   - Allergy annotation targets only

4. **Patient data enhancement**
   - Ensure mock patient has: T2DM + HTN on problem list, Metformin on meds, Sulfa allergy, A1c result from 8 months ago

### Acceptance criteria

- Both templates load from registry and pass type-check
- LBP template has severity scoring model with 3 paths
- Conditional items have valid `ProtocolCondition` definitions
- Patient data includes all annotation-triggering fields

---

## Phase CP3: Reference Pane Container (3-Tab, Search, Empty State)

**Goal:** Extend the reference pane to support the Protocol tab as a third segment, with search and empty state.

### Deliverables

1. **Segmented control extension**
   - Dynamic segment array based on `protocolTabState`
   - Protocol segment conditional rendering (hidden when state is `'hidden'`)
   - Badge rendering (dot for active, check for completed)

2. **Tab switching**
   - `OVERVIEW_TAB_CHANGED` dispatches on segment tap
   - Auto-switch to Protocol tab on `PROTOCOL_TAB_ACTIVATED`
   - Revert to Overview on `PROTOCOL_TAB_DISMISSED`

3. **Protocol search** (`ProtocolSearch.tsx`)
   - Simple text-match search against protocol registry
   - Manual activation from search results
   - Positioned within Protocol tab empty state

4. **Empty state**
   - "No active protocol" message with "Browse protocols" link
   - Link opens search inline

### Acceptance criteria

- Protocol segment appears/disappears based on coordination state
- Badge renders correctly for each tab state
- Auto-switch to Protocol tab works on activation
- Search finds and can activate protocols manually
- Empty state renders when no protocol is loaded

---

## Phase CP4: Core UI Components (ProtocolView, Cards, Items)

**Goal:** Build the visual component hierarchy for protocol rendering — read-only display with expand/collapse.

### Deliverables

1. **ProtocolView** (`ProtocolView.tsx`)
   - Reads active protocol from state via selectors
   - Renders header + card list + addenda section
   - Scrollable with 80px bottom padding (bottom bar clearance)

2. **ProtocolHeader** (`ProtocolHeader.tsx`)
   - Protocol name, severity badge (if scoring model), overall completion, actions menu

3. **ProtocolCard** (`ProtocolCard.tsx`)
   - Collapsed and expanded states with all visual treatments
   - Key signal slot with priority hierarchy
   - Completion indicator (X/Y excluding advisory items)
   - Step numbers (sequential) vs. checkboxes (unordered)

4. **Item components** (4 files in `items/`)
   - OrderableItem, DocumentableItem, GuidanceItem, AdvisoryItem
   - All visual states per DESIGN-SPEC section 2.3
   - Conditional rendering (hide vs. show-inactive)

5. **ProtocolAddenda** (`ProtocolAddenda.tsx`)
   - Compact flat list of secondary protocol items
   - Dedup against primary protocol

### Acceptance criteria

- ProtocolView renders the full card tree from mock data
- Cards expand/collapse with correct key signal and completion
- All 4 item types render with correct visual treatments
- Conditional items hidden or shown-inactive as specified
- Advisory items excluded from completion counts

---

## Phase CP5: Actions & Integration (Wire Callbacks, Assessment Form)

**Goal:** Wire up all interactive actions — `[+]`, `[Edit]`, `[Add All]`, checkbox, skip, and connect to the chart item pipeline.

### Deliverables

1. **Orderable `[+]` action**
   - Check for matching pending suggestion first
   - If match: dispatch `SUGGESTION_ACCEPTED`
   - If no match: dispatch `ITEM_ADDED` with `source: { type: 'protocol' }`
   - Dispatch `PROTOCOL_ITEM_ADDRESSED` in both cases

2. **Orderable `[Edit]` action**
   - Open existing detail pane with `defaultData` pre-filled
   - On confirm: follow same `[+]` flow with modified data

3. **Card-level actions**
   - `[Add All Orderables]` — batch add all unaddressed orderables in card
   - `[Review & Add]` — open review flow for batch
   - Card expand/collapse toggle with `PROTOCOL_CARD_TOGGLED`

4. **Documentable + Guidance checkboxes**
   - Manual check dispatches `PROTOCOL_ITEM_ADDRESSED` with `type: 'manual'`
   - Uncheck reverts to `'pending'`

5. **Skip action**
   - Available on orderable, documentable, and guidance items
   - Dispatches `PROTOCOL_ITEM_SKIPPED` with optional reason
   - "Undo skip" reverts to pending

6. **Protocol-level actions menu**
   - Dismiss protocol
   - Add All (protocol-wide)

### Acceptance criteria

- `[+]` adds chart items and marks protocol items addressed
- Suggestion dedup works (matching suggestion resolved, not duplicated)
- `[Add All]` batch-adds all orderables in a card
- Checkboxes toggle documentable/guidance items
- Skip and undo-skip work with activity log entries
- Protocol dismiss clears tab and logs event

---

## Phase CP6: Severity Scoring & Patient Adaptation

**Goal:** Implement the severity scoring panel, path selection, and Level 1-2 patient adaptation annotations.

### Deliverables

1. **SeverityScoringPanel** (`SeverityScoringPanel.tsx`)
   - Expandable panel below severity badge
   - Each ScoringInput with value, weight, visual indicator
   - Missing inputs shown with "Needed" label
   - Formula result mapped to path

2. **Path selector**
   - Segmented control showing all severity paths
   - Current path highlighted
   - Override control: provider selects different path
   - Override indicator: "Recommended: [X] | Current: [Y] (override)"

3. **Path-dependent rendering**
   - Items `'active'` on current path render normally
   - Items `'de-emphasized'` render dimmed (40% opacity) with "Not on current path" label

4. **Patient adaptation annotations** (`src/utils/protocol-adaptation.ts`)
   - Compute annotations from `PatientContext.clinicalSummary`
   - Types: comorbidity, medication, allergy, recency
   - Render inline beneath relevant items in secondary text
   - Allergy annotations escalate orderables to `contraindicated` state

5. **Condition evaluation engine**
   - Evaluate `ProtocolCondition` against patient context and chart state
   - Re-evaluate on chart state changes
   - Highlight newly revealed items

### Acceptance criteria

- Scoring panel shows correct values for LBP protocol
- Path selection changes which items are active vs. de-emphasized
- Manual override persists and shows indicator
- Patient annotations render for LBP patient (T2DM, Metformin, Sulfa allergy)
- Contraindicated orderables show warning and block `[+]` action
- Condition changes reveal/hide items correctly

---

## Phase CP7: Demo Integration (LBP Scenario)

**Goal:** Wire the LBP protocol into the demo scenario system for end-to-end demonstration.

### Deliverables

1. **Scenario trigger**
   - LBP protocol loads on CC match ("low back pain", "back pain")
   - Protocol transitions to `available` state

2. **AI activation simulation**
   - Timed event: AI ambient confirms relevance after ~5s
   - Protocol transitions to `active`, auto-switch to Protocol tab

3. **Simulated auto-detection**
   - Timed events mark documentable items as addressed (simulating ambient transcription)
   - 2-3 items auto-mark during scenario playback

4. **Provider walkthrough path**
   - Severity scoring computes from initial vitals
   - Provider adds items via `[+]`, observes protocol progress
   - Protocol reaches completion

### Acceptance criteria

- LBP protocol activates during demo scenario
- Tab auto-switches with badge
- Documentable items auto-mark from simulated detection
- Severity scoring works with scenario data
- Full lifecycle: available -> active -> completed

---

## Phase CP7.5: Enhancement (URI Scenario, Polish)

**Goal:** Add the URI protocol scenario and polish cross-protocol interactions.

### Deliverables

1. **URI scenario**
   - URI protocol loads on CC match ("sore throat", "cough", "URI")
   - Simpler flow: no severity scoring, fewer cards
   - Demonstrates protocol system without scoring complexity

2. **Multi-protocol scenario**
   - Primary: LBP; Addendum: Diabetes management (care gap items)
   - Addenda section renders below primary protocol
   - Dedup verification: items in both protocols appear once

3. **Polish**
   - Care gaps summary card in Overview tab shows "(In protocol)" links
   - Activity log entries for all lifecycle events
   - Protocol item count in Protocol tab badge area

### Acceptance criteria

- URI protocol works end-to-end
- Multi-protocol rendering correct with dedup
- Care gaps cross-reference protocol addenda
- Activity log complete for all protocol events

---

## Phase CP8: Polish & Edge Cases (Animations, Keyboard, Activity Log)

**Goal:** Final polish pass — transitions, keyboard support, edge cases, and performance.

### Deliverables

1. **Animations**
   - Card expand/collapse (~200ms)
   - Item state transitions (pending -> addressed)
   - Condition-met item reveal highlight
   - Tab segment appear/disappear

2. **Keyboard support**
   - Extend `ehr:cycle-overview-tab` to include Protocol tab when visible
   - Card expand/collapse keyboard shortcut
   - Item action shortcuts (if applicable)

3. **Edge cases**
   - Protocol dismissed mid-completion: state preserved in activity log
   - Re-activation restores previous item states
   - CC change while protocol active: protocol remains (not auto-dismissed)
   - Empty card handling (all items conditional and all hidden)

4. **Activity log completeness**
   - All lifecycle events logged with accurate actor (provider vs. AI vs. system)
   - Log entries appear in Activity tab of reference pane

5. **Performance**
   - Memoize selector computations
   - Debounce condition re-evaluation on rapid chart state changes

### Acceptance criteria

- Animations smooth and consistent
- Keyboard cycle includes Protocol tab
- All edge cases handled gracefully
- Activity log complete and accurate
- No performance issues with full protocol loaded

---

## Dependency Diagram

```
CP0 (docs + types)
└── CP1 (state management)
    ├── CP2 (mock data)          ─┐
    └── CP3 (reference pane)      ├── CP4 (core UI)
                                  ─┘     └── CP5 (actions + integration)
                                              └── CP6 (severity scoring + adaptation)
                                                   └── CP7 (LBP demo integration)
                                                        └── CP7.5 (URI + polish)
                                                             └── CP8 (polish + edge cases)
```

## Mock Data Requirements

| Protocol | Cards | Items | Severity | Conditions | Annotations |
|----------|-------|-------|----------|-----------|-------------|
| **Low Back Pain** | 5-6 | 15-20 | STarT Back (3 paths) | Neurological exam conditional on red flags | Comorbidity, medication, allergy, recency |
| **URI** | 3-4 | 8-12 | None | Antibiotic conditional on duration | Allergy only |
