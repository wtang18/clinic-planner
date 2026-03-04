# Prototype → Production: Architecture Migration Guide

> **Status:** Reference
> **Last Updated:** 2026-03-03
> **Related Docs:** [AppShell Scope System](./appshell-scope-system.md) | [Information Architecture](../INFORMATION_ARCHITECTURE.md) | [Pop Health Design Spec](../features/population-health/DESIGN-SPEC.md)

---

> **Cross-reference note:** The [AppShell Scope System directive](./appshell-scope-system.md) resolves implementation decisions for the current prototype pass. For Decisions 1, 3, and 6, the directive went directly to the production approach described in this document because the documented trigger conditions were already met. The relevant sections below are annotated with callouts noting this.

---

## How to Read This Document

This prototype was built with deliberate architectural shortcuts — places where the "right for prototype" decision differs from the "right for production" decision. Each shortcut is documented here with three things:

1. **What we did and why** — the prototype decision and its rationale
2. **When it breaks** — the specific conditions that make the shortcut insufficient
3. **What to build instead** — the production upgrade path

Shortcuts are grouped by system. The AppShell/scope architecture section is comprehensive. Other systems (charting, AI, transcription) have brief flags for known upgrade points.

---

## 1. AppShell & Multi-Scope Architecture

### Context

The app supports multiple workspace types ("scopes") within a single shell: encounter (patient charting), population health (cohort management), to-do, and hub views. The shell — menu, three-pane layout, pane collapse/expand states — must persist across scope switches. Scope-specific content swaps within the shell's slots.

The core architectural tension: React conflates component tree structure with component identity. If the wrapper around a component changes (e.g., `<EncounterProvider>` → `<PopHealthProvider>`), React treats everything inside as new UI and tears it down, even if the actual layout component is identical. This means naively wrapping the layout in scope-specific providers causes the shell to unmount/remount on every scope switch — producing visible flicker and state loss.

### 1.1 Scope State (Decision 1)

> **Implementation note:** The [AppShell directive](./appshell-scope-system.md) went directly to the production approach (explicit scope stack) because drill-through navigation — the trigger condition documented below — is in scope for the current pass.

**Prototype approach:** Scope is derived from `selectedNavItem` string. A function inspects the menu selection's prefix (`registry-` → cohort, `patient-` → encounter, etc.) and returns the active scope. No explicit scope state variable exists.

**Why this works:** Derived state can't desync. There's no moment where the menu says "patient" but the scope says "cohort." The mapping from menu item to scope is a pure function with no ambiguity.

**When it breaks:**

- **Context-dependent routing.** If the same menu item should produce different scopes depending on prior context (e.g., clicking a patient from cohort view means "drill into this patient within the cohort context" vs. clicking from the hub means "open standalone encounter"), the derivation function needs to inspect more than just `selectedNavItem`. Once it depends on navigation history or prior scope, it's a state machine masquerading as a derivation — make it explicit.

- **Back/forward navigation.** If scope changes should be reversible via browser-style back/forward (or an in-app equivalent), you need a scope stack — an ordered history of scope transitions. Derivation gives you the current state but has no memory of prior states.

**Production upgrade:**

Replace the derivation function with an explicit scope manager:

```
ScopeManager {
  currentScope: Scope                    // discriminated union with params
  scopeStack: Scope[]                    // history for back/forward
  push(scope: Scope): void               // navigate to new scope (adds to stack)
  pop(): Scope | null                    // go back
  replace(scope: Scope): void            // swap current without adding history
}
```

This can live inside NavigationContext (collapsing scope and navigation into one concept) or as a peer context. Collapsing is cleaner — the navigation stack *is* the scope stack. `navigate()` pushes a scope, `goBack()` pops it. The derivation function becomes the seed implementation: v1 of `push()` computes scope from the menu selection the same way the prototype does, but now wraps it in a managed state.

**Trigger to upgrade:** When you implement drill-through navigation (cohort → patient → back to cohort) and need the "back" action to restore the previous scope + its parameters.

---

### 1.2 Content Delivery to Layout Slots (Decision 2)

**Prototype approach:** Direct conditional rendering via thin scope router components. AppShell renders `<ScopeCanvas scope={scope} />`, which is a switch statement returning `<EncounterCanvas />` or `<PopHealthCanvas />` based on scope. Each scope component wraps its own providers internally. Standard React, no unusual patterns.

**Why this works:** The layout component (`AdaptiveLayout`) is always the same component at the same tree position. Only the *children* passed to its slots change. React preserves AdaptiveLayout's state (and the shell's DOM) because the component identity is stable. Scope-specific providers mount inside the slot content, not around the layout, so their lifecycle doesn't affect the shell.

**When it breaks:**

- **Cross-slot shared state.** If EncounterCanvas and EncounterOverview (rendered in different layout slots) need to share state — e.g., "selected chart item" drives both the canvas highlight and the overview scroll position — that state can't live in either component. It needs a provider above both. But putting a scope-specific provider above AdaptiveLayout reintroduces the tree-shape problem (see Context section above).

- **Expensive data derivation.** The prototype uses duplicate derivation — both EncounterCanvas and EncounterOverview independently call `getPatientByMrn(id)` and get the same static data. If that function becomes a network call, you're doubling API requests. If it returns computed state (aggregations, transformations), you're doubling compute.

**Production upgrade:**

Move shared scope state to an **external store** (React Query, Zustand, Redux, or a simple module-level cache). External stores don't participate in the React component tree — they don't change tree structure, so they don't trigger remounts. Any component anywhere in the tree can read from the store without needing a provider wrapper.

```
// Conceptual — not prescribing a specific library
encounterStore = {
  patient: Patient | null
  selectedChartItemId: string | null
  // ... other encounter state
}

// Both EncounterCanvas and EncounterOverview subscribe:
const patient = useEncounterStore(s => s.patient);
const selectedId = useEncounterStore(s => s.selectedChartItemId);
```

The scope router components stay the same. What changes is where they get their data — from an external store instead of inline derivation. The store is populated when the scope activates and cleared (or backgrounded) when it deactivates.

If you need to **preserve scope state across switches** (e.g., the user's scroll position in the cohort view survives a round-trip to encounter and back), the store holds state for all scopes simultaneously, keyed by scope type. Only the active scope's data drives rendering; inactive scopes' data stays in memory.

**Trigger to upgrade:** When you introduce real API calls, cross-slot selection sync, or need to preserve scope state across switches.

---

### 1.3 NavRow Prop Generalization (Decision 3)

> **Implementation note:** The [AppShell directive](./appshell-scope-system.md) went directly to the production approach (generalized prop names) because the trigger condition documented below — multiple scopes needing collapse/expand behavior — was already met with 4 scopes using 3 different prop paths.

**Prototype approach:** NavRow (FloatingNavRow) has encounter-specific prop names: `patientIdentity`, `isToDoView`, `todoTitle`. The population health scope uses the generic `workspaceContent` override prop to bypass these. The NavRow's internal behavior is driven by `overviewCollapsed` and `isToDoView` flags, not scope identity.

**Why this works:** The NavRow doesn't need to know about scopes. It renders whatever props it receives. The encounter-specific names are historical but functional.

**Concern (mild):** With 4 scopes and 3 different prop-path strategies (encounter uses `patientIdentity`, to-do uses `isToDoView` + `todoTitle`, cohort uses `workspaceContent`), the prop interface implicitly encodes scope assumptions. Each new scope must reverse-engineer which prop path to use, and the `workspaceContent` override skips some of the layout behaviors (collapse/expand identity display) that the named props get for free.

**Production upgrade:**

Generalize the scope-specific props to scope-agnostic equivalents:

| Current (scope-specific)     | Generalized                          | Behavior                                      |
|------------------------------|--------------------------------------|-----------------------------------------------|
| `patientIdentity`            | `collapsedIdentityContent`           | Content shown in canvas zone when overview pane is collapsed |
| `isToDoView` + `todoTitle`   | `canvasViewMode` + `canvasViewTitle`  | Switches NavRow layout pattern; title for list-mode views |

The internal conditional logic changes from `if (isToDoView)` to `if (canvasViewMode === 'list')`, which is a find-and-replace refactor. The collapse/expand behavior that currently only works for `patientIdentity` becomes available to all scopes via `collapsedIdentityContent`.

**Trigger to upgrade:** When a new scope needs the collapse/expand identity behavior and can't get it through `workspaceContent`, or when onboarding engineers consistently struggle with the prop interface.

---

### 1.4 AI Control Surface (Decision 4)

**Prototype approach:** Each scope renders its own BottomBarContainer instance with scope-specific props. When scope switches, the old AI bar unmounts and the new one mounts. Conversation state, suggestions, and transcription context are scoped to the renderer and reset on switch.

**Why this works:** Clean encapsulation. The encounter AI bar knows about encounter concepts (transcription, chart suggestions). The cohort AI bar knows about cohort concepts (patient queries, gap analysis). Neither is coupled to the other. The visual remount is masked by a CSS transition and is arguably correct UX — the user is switching context.

**When it breaks:**

- **Cross-scope AI continuity.** A provider asks the AI in population health: "which of my diabetic patients missed their last A1c?" Then drills into one of those patients. In the encounter, they say "order an A1c for this patient." If the AI doesn't remember the population health conversation, the provider has to re-establish context. Cross-scope AI continuity is a strong product differentiator for an integrated EHR.

- **Long-running background AI tasks.** If the AI is generating a summary or running an analysis when the user switches scopes, the unmount kills the in-flight task. The user switches back and the result is gone.

**Production upgrade:**

Two-layer AI architecture:

```
AI Conversation Store (persistent, above AppShell)
├── encounterConversation: { messages[], pendingTasks[] }
├── cohortConversation: { messages[], pendingTasks[] }
├── crossScopeContext: { recentTopics[], lastQuery }
└── activeScopeKey: string

ScopeAIBar (per-scope, reads from store)
├── Renders BottomBarContainer with scope-specific UI
├── Sends messages to the active conversation in the store
└── Reads cross-scope context for continuity
```

The store is external (not a React provider), so it doesn't affect tree structure. Each scope's AI bar reads from and writes to its own conversation slice. Cross-scope context is a lightweight summary of recent interactions that gets injected into the new scope's AI context when activated.

The BottomBarContainer can remain per-scope (different UI per scope is still correct) or be unified with scope-aware rendering — separate decision based on how similar the bar layouts end up being.

**Trigger to upgrade:** When cross-scope AI continuity becomes a design requirement, or when background AI tasks (draft generation, analysis) need to survive scope switches.

---

### 1.5 Menu Routing & Drill-Through (Decision 6)

> **Implementation note:** The [AppShell directive](./appshell-scope-system.md) went directly to the production approach (generic `navigateToScope`) because drill-through creates cross-scope navigation paths immediately, meeting the trigger condition documented below.

**Prototype approach:** Menu selections update `selectedNavItem` in AppShell state. Scope-specific parameters (which cohort, which patient) are dispatched to scope-specific context stores. Follows the existing to-do pattern: `selectedNavItem` + `todoViewState`.

**Why this works:** Consistent with existing code. Each scope manages its own parameters. The mapping from menu selection to scope + params is straightforward.

**When it breaks:**

- **Drill-through callback proliferation.** Cross-scope navigation (cohort → patient, patient → cohort) requires callbacks from inside scope renderers up to AppShell: `onDrillToPatient(patientId)`, `onReturnToCohort(cohortId)`, etc. With N scopes and bidirectional transitions, callback count grows as N × (N-1). At 4 scopes, that's 12 possible transitions.

- **Deep-linking.** If the app needs URL-based routing (share a link to a specific patient encounter, or to a specific cohort pathway view), the URL must encode scope + params. The prototype's state-based routing doesn't produce URLs.

**Production upgrade:**

Replace scope-specific callbacks with a generic navigation function:

```
navigateToScope(scope: Scope): void

// Where Scope is a discriminated union:
type Scope =
  | { type: 'hub'; hubId: 'home' | 'visits' }
  | { type: 'todo'; categoryId: string; filterId: string }
  | { type: 'cohort'; cohortId: string; pathwayId?: string }
  | { type: 'patient'; patientId: string; encounterId?: string }
```

This is essentially Decision 1's ScopeManager with a typed input. Any scope renderer calls `navigateToScope({ type: 'patient', patientId: '123' })` regardless of which scope it's currently in. AppShell handles the routing, menu state update, and parameter dispatch in one place. For URL support, the Scope union serializes cleanly to route params.

**Trigger to upgrade:** When you add a third cross-scope navigation path, or when deep-linking becomes a requirement.

---

### 1.6 Provider Hierarchy & State Preservation (Decision 7)

**Prototype approach:** A clear boundary between persistent infrastructure (above AppShell: NavigationProvider, CoordinationProvider, WorkspaceProvider) and task context (inside scope renderers: EncounterLoader, TranscriptionProvider, PopHealthProvider). Scope-specific state resets on scope switch.

**Why this works:** Correct mental model. Workspace environment (pane geometry, open tabs, menu state) survives scope switches because it's the user's environment. Task context (which chart item is selected, transcription session, cohort node focus) resets because the user is switching tasks.

**Known gap: transcription.**

Transcription state lives inside the encounter scope renderer. If a provider is in an active encounter with ambient recording running, switches briefly to population health to check something, and switches back — the transcription session is gone. The TranscriptionProvider unmounted, so the recording state, accumulated transcript, and session metadata are lost.

For the prototype with simulated transcription, this is cosmetic. For production with real audio recording, this is a bug — the provider didn't end the encounter, they just glanced at another screen. The exam room audio should keep recording.

**Production upgrade for transcription:**

Move transcription lifecycle above the scope boundary:

```
TranscriptionSessionManager (persistent, above AppShell)
├── activeSession: { encounterId, startTime, audioStream, transcript[] } | null
├── isRecording: boolean
├── pauseOnScopeSwitch: boolean    // user preference
└── resume(): void
```

The session manager is persistent. When the encounter scope unmounts, recording can either continue (background recording) or auto-pause with state preserved. When encounter scope remounts, it reads the active session from the manager and resumes the UI without losing data.

Same pattern applies to any long-running task: in-flight AI generation, unsaved form edits, pending order submissions. If a task's lifecycle is longer than a scope visit, its state belongs above the scope boundary.

**Trigger to upgrade:** When real transcription, real-time data, or any async workflows are introduced that shouldn't reset on scope switch.

---

## 2. Quick Charting System — Migration Flags

These are not detailed upgrade plans — they flag areas where prototype shortcuts exist and hint at the production direction.

### 2.1 Chart Item State Management

**Prototype:** Chart items are stored in React state within the encounter scope renderer. Adding, editing, removing items updates local state. Mock data initializes state on mount.

**Production concern:** Chart items are the clinical record. They need persistence, conflict resolution (two surfaces editing the same item), audit trails, and optimistic updates with rollback. Local React state can't provide any of these.

**Upgrade direction:** Chart item store as a service layer with local cache + sync. React components subscribe to the cache. Writes go through the service (which handles validation, conflict detection, audit logging) and update the cache. Consider CRDT or OT patterns if real-time collaboration (MA and provider editing simultaneously) is a requirement.

### 2.2 Suggestion Engine

**Prototype:** Suggestion rankings are computed synchronously from static data. The engine runs as a pure function called during render.

**Production concern:** Real suggestions involve ML inference, patient history lookups, formulary checks, and drug interaction screening. These are async, potentially slow, and may return results after the user has moved on.

**Upgrade direction:** Suggestion engine as an async service with streaming results. UI shows suggestions as they arrive (not all-at-once). Stale suggestions auto-expire when context changes. Priority scoring may need server-side computation.

### 2.3 Processing Rail & Order Workflow

**Prototype:** Processing states are local enums. "Send to pharmacy" is a button that changes a status string.

**Production concern:** Order workflows involve external system integrations (pharmacy networks, lab interfaces, payer authorization). State transitions have real-world consequences and may fail or require retry. Some transitions are irreversible.

**Upgrade direction:** Order state machine with durable execution. Each order tracks its lifecycle through defined states with transition guards. Failed external calls retry with backoff. The UI reflects pending/confirmed/failed states from the durable execution layer, not from local state.

### 2.4 AI Draft Generation

**Prototype:** AI drafts are pre-written mock content that appears on a timer simulating generation.

**Production concern:** Real AI generation is streaming, variable-latency, and may produce content that needs safety checks before display. The generation context (transcript + chart state) must be assembled and sent to the model, and partial results streamed back.

**Upgrade direction:** AI generation pipeline: context assembly → model call (streaming) → safety/clinical validation → incremental display. Draft state lives in the AI conversation store (see 1.4 above). Generation survives scope switches if the store is persistent.

---

## 3. Population Health — Migration Flags

### 3.1 Protocol Data Model

**Prototype:** Protocols are static JSON structures defining nodes, connections, and mock patient assignments.

**Production concern:** Protocols need versioning (changes to a protocol shouldn't retroactively alter patients mid-pathway), patient assignment rules (enrollment criteria, automatic re-evaluation), and outcome tracking.

**Upgrade direction:** Protocol-as-code with versioned templates. Active protocol instances are separate from templates — modifying a template creates a new version; existing patients continue on their enrolled version unless explicitly migrated. Patient assignment is rule-based with manual override capability.

### 3.2 Flow View Rendering

**Prototype:** Node positions are computed from static `columnIndex` and `verticalPosition` fields in mock data. Layout is deterministic.

**Production concern:** Real protocols may have dozens of nodes with dynamic branching. Manual positioning doesn't scale. The layout engine needs auto-layout with manual override capability.

**Upgrade direction:** Graph layout algorithm (dagre, elk, or custom) with manual position overrides stored per-protocol. Auto-layout runs on protocol change; user adjustments are persisted as overrides. Consider WebGL rendering (via React Flow or similar) if node counts exceed what SVG handles performantly.

### 3.3 Cross-Pane Selection Sync

**Prototype:** Selection state is managed via React context with bidirectional sync between center pane (layer tree) and canvas (node graph).

**Production concern:** This context is scope-specific and resets on scope switch (per Decision 7). If a user selects a protocol layer, switches to encounter, and comes back — the selection is gone.

**Upgrade direction:** If selection preservation across scope switches is desired, move selection state to the external store (see 1.2). Otherwise, the reset behavior is acceptable and arguably correct — the user re-orients on return.

---

## 4. General Production Considerations

### 4.1 Prototype-to-Production Drift Risk

The most common failure mode: the prototype gradually becomes production through incremental feature additions, without a deliberate architectural upgrade pass. Each individual addition seems small, but the accumulated shortcuts create compounding technical debt.

**Mitigation:** If the prototype is being used as a reference for production development, treat the systems in Section 1 as the architectural blueprint and the shortcuts as the parts that get replaced. Don't port the shortcuts — port the patterns and rebuild the data layer.

If the prototype itself is being evolved into production, schedule explicit upgrade passes aligned with the triggers noted in each section. Don't wait for breakage — upgrade proactively when the trigger condition is met.

### 4.2 What Ports Cleanly

These prototype elements are designed to transfer without significant rework:

- **AdaptiveLayout component** — scope-agnostic, slot-based, handles pane coordination. Production-ready pattern.
- **Scope router components** — thin switch statements mapping scope → content. Pattern scales to any number of scopes.
- **ShortcutManager + custom event architecture** — decoupled key binding from action handling. No prototype shortcuts here.
- **CoordinationProvider** — pane state machine. Already handles the full state space for three-pane coordination.
- **Component composition patterns** — how scope renderers compose providers internally. The *pattern* is correct; the *data sources* change.

### 4.3 What Needs Replacement

These prototype elements were built for speed and should be replaced, not evolved:

- **Static mock data as the data layer** — replace with API client + cache. This is the single biggest change and affects every component that reads data.
- **Local React state for domain objects** (chart items, protocol instances, patient data) — replace with external store + sync layer.
- **Synchronous suggestion engine** — replace with async service.
- **Simulated transcription** — replace with real audio pipeline + session management above the scope boundary.
- **Timer-based AI draft "generation"** — replace with streaming model integration.
