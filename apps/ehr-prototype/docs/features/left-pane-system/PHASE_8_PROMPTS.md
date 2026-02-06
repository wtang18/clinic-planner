# Phase 8: Left Pane System — Implementation Plan & Claude Code Prompts

**Last Updated:** 2026-02-06
**Status:** Ready for Implementation
**Context:** Demo prototype — not production. Simulate behaviors, use existing design tokens/patterns.
**Depends On:** Phase 7 (Bottom Bar System) must be implemented first.

---

## Table of Contents

1. [Implementation Philosophy](#1-implementation-philosophy)
2. [Execution Plan](#2-execution-plan)
3. [Chunk 8.0: Documentation Updates](#chunk-80-documentation-updates)
4. [Chunk 8.1: Left Pane State & Types](#chunk-81-left-pane-state--types)
5. [Chunk 8.2: Left Pane Container](#chunk-82-left-pane-container)
6. [Chunk 8.3: AI Drawer View](#chunk-83-ai-drawer-view)
7. [Chunk 8.4: AI Drawer Footer](#chunk-84-ai-drawer-footer)
8. [Chunk 8.5: Transcription Drawer View](#chunk-85-transcription-drawer-view)
9. [Chunk 8.6: Settings Modal & Activity Log Modal](#chunk-86-settings-modal--activity-log-modal)
10. [Chunk 8.7: Drawer ↔ Bottom Bar Coordination](#chunk-87-drawer--bottom-bar-coordination)
11. [Chunk 8.8: Keyboard Shortcuts](#chunk-88-keyboard-shortcuts)
12. [Chunk 8.9: Storybook Stories & Demo Scenarios](#chunk-89-storybook-stories--demo-scenarios)
13. [Verification Checklist](#verification-checklist)

---

## 1. Implementation Philosophy

### Demo Prototype, Not Production

Same philosophy as Phase 7. Key implications for this phase:

| Concern | Production Approach | Our Approach |
|---|---|---|
| AI conversation | Claude API / local LLM | **Simulated** — timed reveal of pre-written responses |
| Suggestion engine | ML pipeline from transcription entities | **Simulated** — pre-configured suggestions triggered by demo controller |
| Activity log persistence | Database-backed audit trail | **In-memory** — state only, lost on refresh |
| Conversation persistence | Server-stored, encounter-scoped | **In-memory** — lives in store, demo controller can reset |
| Settings | User preferences service | **In-memory** — local state, no persistence |

### CRITICAL: Reuse Existing Patterns First

The codebase has established conventions from Phases 1-7. **Do not create new patterns, components, or modules when existing ones can be extended or composed.**

Before creating anything new, check:

1. **Existing components** in `src/components/` — can an existing primitive (Button, Badge, Card, IconButton, etc.) serve the need?
2. **Existing hooks** in `src/hooks/` — is there a hook that already manages similar state?
3. **Existing state patterns** in `src/state/` — can the store structure be extended rather than duplicated?
4. **Existing design tokens** in `src/styles/foundations/` — use established colors, spacing, typography. Don't introduce new magic numbers.
5. **Existing layout patterns** — AppShell, SplitPane, etc. Compose from these.

**If you're unsure whether to create new vs. reuse existing**, stop and ask. Describe what you need and what existing options you've found. Suggest an approach and wait for confirmation. Creating unnecessary abstractions adds maintenance burden.

### Spec as Guidance, Not Prescription

The design specs (LEFT_PANE_SYSTEM.md, AI_DRAWER.md, TRANSCRIPTION_DRAWER.md, DRAWER_COORDINATION.md) define *behavior and intent*. Specific pixel values are guidance for proportion and priority — use the closest design tokens. ASCII layouts show *content relationships*, not pixel-perfect wireframes.

### Pane Header Layout Clarification

**Important:** The spec documents show the pane header as `[◧] [☰] [✦] [🎙?]` in ASCII diagrams for compactness. The actual layout is:

```
┌─────────────────────────────────────────┐
│ [☰] [✦] [🎙?]                     [◧]  │
└─────────────────────────────────────────┘
  ↑    ↑    ↑                         ↑
  View icons (left-aligned)     Collapse (pinned right)
```

View switching icons are **left-aligned**. The collapse/expand button (◧) is **pinned to the upper-right corner** of the pane. This creates visual separation between navigation controls (left) and pane visibility (right). Apply this layout in all pane header implementations, regardless of how the ASCII diagrams are formatted in the spec docs.

---

## 2. Execution Plan

| Chunk | Description | Mode | Dependencies | Est. Files |
|---|---|---|---|---|
| **8.0** | Documentation updates | Auto-accept | None | 0 code, 5+ docs |
| **8.1** | Left pane state, types, hooks | Auto-accept | Phase 7 state | 3-4 |
| **8.2** | Left pane container (shell, header, view switching) | Auto-accept | 8.1 | 3-4 |
| **8.3** | AI drawer view (context header, suggestions, conversation) | **Manual review** | 8.1, 8.2, existing AI components | 5-6 |
| **8.4** | AI drawer footer (quick actions, input row) | **Manual review** | 8.3, existing palette components | 2-3 |
| **8.5** | Transcription drawer view (transcript, pill, controls) | **Manual review** | 8.1, 8.2, existing transcription components | 4-5 |
| **8.6** | Settings modal + activity log modal | Auto-accept | 8.3, 8.5 | 3-4 |
| **8.7** | Drawer ↔ bottom bar coordination | **Manual review** | 8.1-8.5, Phase 7 orchestrator | 2-3 (modified) |
| **8.8** | Keyboard shortcuts (⌘K updates, Escape) | Auto-accept | 8.7 | 1-2 (modified) |
| **8.9** | Storybook stories + demo scenarios | Auto-accept | 8.1-8.8 | 5-6 |

**Total:** ~30-35 files (new + modified)

### Dependency Graph

```
8.0 (docs) ──────────────────────────────────────────────→ done (no code deps)

8.1 (state/types) ─┬─→ 8.2 (pane container) ─┬─→ 8.7 (coordination)
                    │                          │
                    ├─→ 8.3 (AI drawer)  ──────┤
                    │   └─→ 8.4 (AI footer)    │
                    │                          │
                    ├─→ 8.5 (tx drawer)  ──────┤
                    │                          │
                    └─→ 8.6 (modals)           ├─→ 8.8 (keyboard)
                                               │
                                               └─→ 8.9 (stories/demo)
```

### Manual Review Chunks

Chunks marked **Manual review** modify existing Phase 7 components or involve complex cross-module coordination. Run these one at a time and verify before proceeding.

---

## Chunk 8.0: Documentation Updates

### Purpose

Add the new spec documents to the project and update existing docs with cross-references. Ensures Claude Code (and human reviewers) can find all relevant specifications.

### Prompt

```
Update project documentation for the Left Pane System.

## Context

We've designed a Left Pane System that extends the existing sidebar to host AI and Transcription drawer views. Five new spec docs have been created. Existing docs need cross-references and deprecation notices updated.

## Tasks

### 1. Add new spec documents to the project root

Add these files (already written, copy from project knowledge or outputs):
- `LEFT_PANE_SYSTEM.md` — Left pane container spec (multi-view architecture, visual treatment, keyboard shortcuts)
- `AI_DRAWER.md` — AI module at drawer density (conversation, suggestions, activity log)
- `TRANSCRIPTION_DRAWER.md` — Transcription module at drawer density (transcript view, pill, settings modal)
- `DRAWER_COORDINATION.md` — How drawers coordinate with bottom bar (de-escalation, composition matrix)
- `FUTURE_ENHANCEMENTS.md` — Vision items deferred from prototype (beacon strip, AI modules, canvas customization)

### 2. Update AI_CONTROL_SURFACE_V2.md deprecation notice

The existing deprecation notice should be extended. §5 ("Drawer - Full Assistant") is now superseded by AI_DRAWER.md. Update the notice to include:

```markdown
> - **AI_DRAWER.md** — AI drawer in left pane (supersedes §5)
```

### 3. Update BOTTOM_BAR_SYSTEM.md with cross-reference

Add a note at the top of §3 (Mutual Exclusion Rules) and §5 (State Coordination Matrix):

```markdown
> **📌 Updated by DRAWER_COORDINATION.md** — Mutual exclusion rules extended for left pane drawer tier.
> Cross-surface combinations (drawer in left pane + palette in bottom bar) are now allowed.
```

### 4. Update TRANSCRIPTION_MODULE.md §9

Add a note to §9 (Workspace Switching & Session Management):

```markdown
> **📌 Updated by TRANSCRIPTION_DRAWER.md §8** — Session scope changed from encounter to patient workspace.
> Navigation within the same patient does not pause recording.
```

### 5. Update README.md documentation index

Add a new "Left Pane System" section:

```markdown
### Left Pane System

| Document | Description |
|----------|-------------|
| [Left Pane System](./LEFT_PANE_SYSTEM.md) | Multi-view pane architecture, visual treatment, view switching |
| [AI Drawer](./AI_DRAWER.md) | AI module at drawer density — conversation, suggestions, activity log |
| [Transcription Drawer](./TRANSCRIPTION_DRAWER.md) | Transcription at drawer density — transcript view, settings |
| [Drawer Coordination](./DRAWER_COORDINATION.md) | Drawer ↔ bottom bar de-escalation, composition matrix |
| [Future Enhancements](./FUTURE_ENHANCEMENTS.md) | Vision items deferred from prototype |
```

### 6. Add PHASE_8_PROMPTS.md to project

Add this implementation prompts document.

## Guidelines
- Don't modify the content of the new spec docs — they're final
- Cross-reference notes should be additive — don't rewrite existing spec sections
- Keep README index organized by system area
```

---

## Chunk 8.1: Left Pane State & Types

### Purpose

Define the state model for the left pane — view switching, pane visibility, and integration points with the existing bottom bar state. This is the foundation for all subsequent chunks.

### Prompt

```
Create the state management layer for the Left Pane System.

## Context

The Left Pane System adds three views (Menu, AI Drawer, Transcript Drawer) to the existing sidebar. It coordinates with the Bottom Bar System from Phase 7 — when a module is at drawer tier in the left pane, its bottom bar presence is suppressed.

Read these spec docs for behavioral requirements:
- LEFT_PANE_SYSTEM.md (§2: multi-view architecture, §4: collapse/expand, §5: view switching, §9: state model)
- DRAWER_COORDINATION.md (§2: one module one surface, §4: de-escalation, §10: state model updates)

CRITICAL: Before creating new files, check what already exists in `src/state/`. The Phase 7 bottom bar state likely has types and hooks you should extend rather than duplicate. Specifically, `TierState` should gain the 'drawer' value if it doesn't already have it.

## Requirements

### 1. EXTEND existing `TierState` type to include 'drawer'

Find the existing TierState definition (likely in `src/state/bottomBar/types.ts` or similar). Add `'drawer'` to the union if not present:

```typescript
export type TierState = 'mini' | 'bar' | 'palette' | 'drawer';
```

### 2. CREATE left pane types

Create types for left pane state. Keep in the same state directory structure as Phase 7:

```typescript
export type PaneView = 'menu' | 'ai' | 'transcript';

export interface LeftPaneState {
  isExpanded: boolean;
  activeView: PaneView;
}
```

### 3. CREATE left pane reducer/actions

```typescript
export type LeftPaneAction =
  | { type: 'PANE_VIEW_CHANGED'; payload: { to: PaneView } }
  | { type: 'PANE_COLLAPSED' }
  | { type: 'PANE_EXPANDED' };
```

Reducer logic:
- `PANE_VIEW_CHANGED`: Set activeView. Validate that 'transcript' is only allowed when a transcription session exists for the current patient.
- `PANE_COLLAPSED`: Set isExpanded to false. Side effect: the coordination layer (Chunk 8.7) will handle de-escalating the active drawer module.
- `PANE_EXPANDED`: Set isExpanded to true, activeView to 'menu' (always re-expand to menu).

Initial state: `{ isExpanded: true, activeView: 'menu' }`

### 4. CREATE derived state hook

A hook that computes what the bottom bar should show given the current pane state and module tiers. Reference the `deriveBottomBarVisibility` function in DRAWER_COORDINATION.md §10:

```typescript
function useBottomBarVisibility(): {
  ai: { visible: boolean; tier: Exclude<TierState, 'drawer'> | null };
  transcription: { visible: boolean; tier: Exclude<TierState, 'drawer'> | null };
  layout: 'two-column' | 'single-column' | 'hidden';
}
```

### 5. CREATE left pane context/provider

Follow the same context provider pattern used by Phase 7's bottom bar state. The left pane state should be accessible by both the pane container and the bottom bar orchestrator.

## Guidelines
- Reuse existing store patterns (context, provider, useReducer) from Phase 7
- Don't duplicate types that already exist — extend them
- Keep the state flat and simple — no nested objects unless necessary
- If the Phase 7 state structure doesn't accommodate this cleanly, describe the issue and suggest a refactor approach before proceeding
```

---

## Chunk 8.2: Left Pane Container

### Purpose

Build the pane shell component — the container that houses the pane header and swappable view content. This is the structural frame that all three views render inside.

### Prompt

```
Create the Left Pane container component.

## Context

The Left Pane is an existing sidebar in the app. We're extending it to support three switchable views: Menu (existing nav), AI Drawer, and Transcript Drawer. The container component manages the pane header with view switching icons and renders the appropriate view content.

Read: LEFT_PANE_SYSTEM.md (§3: pane header, §4: collapse/expand, §6: visual treatment, §7: zones)

CRITICAL: The existing sidebar/navigation component already exists somewhere in `src/components/`. Find it first. This chunk should WRAP or EXTEND the existing sidebar — not replace it. The Menu view IS the existing sidebar content.

## Requirements

### 1. FIND the existing sidebar/navigation component

Look in `src/components/` for the current sidebar implementation. It likely renders search, nav items, task counts, and patient workspaces. Note its props, exports, and how it's used in the app shell.

### 2. CREATE `src/components/LeftPane/LeftPaneContainer.tsx`

A container component that:
- Reads pane state from the left pane context (Chunk 8.1)
- Renders a fixed header with view switching icons
- Renders the appropriate view content below the header
- Handles collapse/expand

```tsx
// Conceptual structure — adapt to match existing component conventions
export function LeftPaneContainer() {
  const { isExpanded, activeView } = useLeftPaneState();
  const dispatch = useLeftPaneDispatch();

  if (!isExpanded) {
    return <CollapsedPaneTab onExpand={() => dispatch({ type: 'PANE_EXPANDED' })} />;
  }

  return (
    <View style={styles.container}>
      <PaneHeader
        activeView={activeView}
        onViewChange={(view) => dispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: view } })}
        onCollapse={() => dispatch({ type: 'PANE_COLLAPSED' })}
        showTranscript={/* derive from transcription session state */}
      />
      <PaneContent activeView={activeView} />
    </View>
  );
}
```

### 3. CREATE `src/components/LeftPane/PaneHeader.tsx`

The header with view icons and collapse button.

**IMPORTANT LAYOUT:** View icons are LEFT-ALIGNED. Collapse button (◧) is PINNED TO UPPER-RIGHT.

```
┌─────────────────────────────────────────┐
│ [☰] [✦] [🎙?]                     [◧]  │
└─────────────────────────────────────────┘
  left-aligned                   pinned-right
```

- Use `flexDirection: 'row'` with `justifyContent: 'space-between'`
- View icons group on the left, collapse button alone on the right
- Active view icon shows active state (tint change, underline, or fill — use existing active indicator pattern if one exists)
- 🎙 icon conditionally visible (fade in/out, 200ms) based on transcription session existence
- Use existing `IconButton` component if available

### 4. CREATE `src/components/LeftPane/PaneContent.tsx`

Content switcher that renders the appropriate view:

```tsx
function PaneContent({ activeView }: { activeView: PaneView }) {
  switch (activeView) {
    case 'menu':
      return <ExistingSidebar />; // The current sidebar content
    case 'ai':
      return <AIDrawerView />;    // Chunk 8.3
    case 'transcript':
      return <TranscriptDrawerView />; // Chunk 8.5
  }
}
```

For now, AI and Transcript views can be placeholder components that say "AI Drawer — Coming in 8.3" and "Transcript Drawer — Coming in 8.5".

### 5. APPLY visual treatment

Per LEFT_PANE_SYSTEM.md §6:
- Pane header zone: gradient fade from pane background to transparent (not a hard separator bar)
- Container width: use existing sidebar width (likely 320px or defined in layout tokens)
- Use existing design tokens for background colors, spacing, shadows

### 6. INTEGRATE into AppShell

Find the existing app shell / layout component. Replace the direct sidebar render with `<LeftPaneContainer />`. The Menu view should render exactly what the sidebar showed before — no visual changes to existing nav.

## Guidelines
- The Menu view MUST look identical to the current sidebar — this is a refactor, not a redesign
- Find and reuse existing components: IconButton, any active indicator patterns, sidebar primitives
- If the existing sidebar has internal state (scroll position, expanded sections), preserve it
- Pane width should match the existing sidebar width — don't introduce a new width constant
```

---

## Chunk 8.3: AI Drawer View

### Purpose

Build the AI drawer's scroll content area — context header, suggestions section, and conversation history renderer.

### Prompt

```
Create the AI Drawer view component for the left pane.

## Context

The AI Drawer is the full-detail AI interaction surface that renders in the left pane. It contains a floating context header, a collapsible suggestions section, and a multi-turn conversation history.

Read: AI_DRAWER.md (§2: layout, §3: context header, §4: scroll content, §5: suggestions, §6: conversation history, §8: empty states)

CRITICAL: Check what AI components already exist from Phase 7 and earlier phases. The AI palette likely has suggestion rendering, response display, and context targeting components. REUSE these — the drawer should compose from the same building blocks, rendered at a different density.

## Requirements

### 1. AUDIT existing AI components

Before creating anything, find and list:
- Suggestion display components (SuggestionCard, SuggestionChip, etc.)
- AI response renderers (ResponseDisplay, ChatMessage, etc.)
- Context targeting components (context banner, scope indicator)
- Quick action chip components

Report what you find. If existing components can serve drawer needs with minor adaptation (different sizing, layout), prefer that over creating new components.

### 2. CREATE `src/components/LeftPane/AIDrawer/AIDrawerView.tsx`

The main drawer view component:

```tsx
export function AIDrawerView() {
  return (
    <View style={styles.container}>
      <AIContextHeader />          {/* Floating, blur backdrop */}
      <ScrollView style={styles.scrollContent}>
        <SuggestionsSection />     {/* Collapsible */}
        <ConversationHistory />    {/* Chronological thread */}
      </ScrollView>
      {/* Footer (Quick Actions + Input) is Chunk 8.4 */}
    </View>
  );
}
```

### 3. CREATE `src/components/LeftPane/AIDrawer/AIContextHeader.tsx`

Floating context header with blur backdrop:

```
│ 🔄 Lauren · Cough x 5 days    [📋] [✕] │
```

- Shows current context scope (encounter name, patient, or "Global")
- [📋] opens activity log modal (Chunk 8.6)
- [✕] pops scope one level up. Hidden at global scope.
- Uses `backdrop-filter: blur(20px)` or platform equivalent
- Tinted background at ~70-80% opacity matching pane background
- Position: sticky/absolute at top of scroll area, below pane header

### 4. CREATE `src/components/LeftPane/AIDrawer/SuggestionsSection.tsx`

Collapsible section at top of scroll area:

- Show top 3 suggestions by default
- [Show all] / [Show less] toggle
- Group by source if multiple sources
- Each suggestion: text + [+] accept + [✕] dismiss
- Animate items out on accept/dismiss
- Collapses entirely when no suggestions
- For prototype: read suggestions from AI state (pre-configured mock data)

### 5. CREATE `src/components/LeftPane/AIDrawer/ConversationHistory.tsx`

Chronological thread of user messages, AI responses, and system messages:

- User messages: right-aligned, tinted bubble
- AI responses: left-aligned, no bubble, with action buttons on latest response only
- System messages: centered, muted (context changes)
- Auto-scroll to bottom on new messages (pause if user scrolled up)
- For prototype: use pre-written conversation data from demo controller

### 6. CREATE empty state components

Per AI_DRAWER.md §8:
- During encounter, no conversation: illustration + "AI is ready to help..." + quick action footer still visible
- Outside encounter: illustration + "How can I help?"
- With suggestions but no conversation: suggestions render, no empty state illustration

## Guidelines
- REUSE existing suggestion/response components from Phase 7 AI palette if they exist
- If existing components need modification for drawer density, prefer adding a `density` or `variant` prop over creating parallel components
- Use existing design tokens for colors (user message tint, AI response background)
- Conversation state should live in the same store the AI palette reads from — same data, different renderer
- If you're unsure about component reuse vs. creation, describe the situation and ask
```

---

## Chunk 8.4: AI Drawer Footer

### Purpose

Build the quick action chips row and input row that anchor to the bottom of the AI drawer.

### Prompt

```
Create the AI Drawer footer — quick actions and input row.

## Context

The footer is the only opaque element in the AI drawer. It contains a horizontal-scrolling row of quick action chips above a text input row. Quick actions are contextual prompt shortcuts — functionally equivalent to typing queries.

Read: AI_DRAWER.md (§7: footer specification)

CRITICAL: The AI palette (Phase 7) likely has quick action chips and an input row already. Check if these can be reused directly or with minor adaptation. The drawer footer is conceptually the same as the palette's action/input area, just rendered at full pane width.

## Requirements

### 1. AUDIT existing palette footer components

Find:
- Quick action chip components
- AI input row / text input component
- Send button, mic button components

### 2. CREATE `src/components/LeftPane/AIDrawer/AIDrawerFooter.tsx`

Container for both rows:

```tsx
export function AIDrawerFooter() {
  return (
    <View style={styles.footer}>
      <QuickActionsRow />
      <AIInputRow />
    </View>
  );
}
```

- Opaque background matching pane background
- Hard top edge (subtle border or shadow)
- Full pane width

### 3. CREATE or REUSE `QuickActionsRow`

Horizontal scroll of contextual action chips:

- Content: Role × Workflow × Mode specific (reuse the quick action configuration from AI_CONTROL_SURFACE_V2.md §9)
- Filtering: chips whose category is covered by active suggestions are suppressed
- Tap: dispatches the chip's pre-composed query to the AI conversation state
- Scroll: horizontal, with fade indicators on edges if content overflows

### 4. CREATE or REUSE `AIInputRow`

Text input with controls:

```
│ [🎤]  Ask AI...               [📋] [➤] │
```

- Auto-growing textarea (max ~120px height)
- Send button [➤] disabled when empty
- Enter to send, Shift+Enter for new line
- [🎤] mic toggle (placeholder for prototype — can be disabled/hidden)
- [📋] paste/attach button (placeholder for prototype)

### 5. Post-encounter read-only state

When encounter is signed/closed but conversation is in grace period:

```
│  Encounter signed · 2:45 PM             │
│  Conversation available until Feb 7     │
```

Replace the footer with a status message. No input, no quick actions.

## Guidelines
- If the AI palette has an input component, extend it with a `variant` or `context` prop for drawer use
- Quick action data/configuration should be shared between palette and drawer — don't duplicate
- Filter logic for suggestion-redundant quick actions should be a shared utility/hook
```

---

## Chunk 8.5: Transcription Drawer View

### Purpose

Build the transcription drawer — floating context header, view indicator pill, scrollable transcript content, and controls footer.

### Prompt

```
Create the Transcription Drawer view component for the left pane.

## Context

The Transcription Drawer is the full-detail transcription surface in the left pane. It shows the live transcript with speaker diarization, a floating view indicator pill, and recording controls.

Read: TRANSCRIPTION_DRAWER.md (§2: layout, §3: context header, §4: view indicator pill, §5: scroll content, §6: controls footer)
Also reference: TRANSCRIPTION_MODULE.md (§6: original drawer spec, §4-5: bar/palette for shared component patterns)

CRITICAL: Phase 7 built the transcription bar, palette, and potentially a drawer component. The transcript segment renderer, speaker labels, waveform indicator, and controls bar should already exist. REUSE them. The left pane drawer should compose from these same building blocks.

## Requirements

### 1. AUDIT existing transcription components

Find and list:
- Transcript segment renderer (speaker label + timestamp + text)
- Waveform indicator component
- Controls bar component (Start/Pause/Resume/Discard)
- Patient/encounter header component

### 2. CREATE `src/components/LeftPane/TranscriptDrawer/TranscriptDrawerView.tsx`

Main view component:

```tsx
export function TranscriptDrawerView() {
  return (
    <View style={styles.container}>
      <TranscriptContextHeader />     {/* Floating, blur */}
      <ViewIndicatorPill />           {/* Floating, below context header */}
      <ScrollView style={styles.scrollContent}>
        <TranscriptSegmentList />     {/* Reuse existing segment renderer */}
      </ScrollView>
      <TranscriptControlsFooter />    {/* Opaque, anchored bottom */}
    </View>
  );
}
```

### 3. CREATE `src/components/LeftPane/TranscriptDrawer/TranscriptContextHeader.tsx`

Floating context header:

```
│ [LS] Lauren Svendsen · Cough x 5 days      [⚙] │
```

- Patient initials avatar (reuse existing avatar component)
- Patient · Encounter label (safety anchor)
- [⚙] settings icon opens full-screen modal (Chunk 8.6)
- Floating with `backdrop-filter: blur(20px)` treatment
- No scope dismiss control (unlike AI drawer — transcription context is fixed)

### 4. CREATE `src/components/LeftPane/TranscriptDrawer/ViewIndicatorPill.tsx`

Small floating pill centered below context header:

```
┌──────────────┐
│ ||||| Live    │      (recording, following live)
└──────────────┘

┌──────────────┐ ┌───────────┐
│ ||||| Live    │ │ ↓ Latest  │   (recording, scrolled up)
└──────────────┘ └───────────┘

┌───────────┐
│ ⏸ Paused   │              (paused)
└───────────┘
```

- Waveform: reuse existing `WaveformIndicator` component at `mini` size
- Always visible — recording state is safety-critical
- [↓ Latest] button: appears when user scrolls up during recording. Tapping scrolls to bottom and resumes auto-follow.
- Floating at same z-index as context header

### 5. REUSE transcript segment list

The Phase 7 drawer should have a transcript segment renderer. Reuse it here with any necessary layout adjustments for left pane width (320px vs whatever the bottom bar drawer used).

If the segment renderer doesn't exist yet, create it following TRANSCRIPTION_MODULE.md §6:
- Speaker diarization: colored dot + role label + timestamp
- Text: left-aligned body text
- Segment breaks: whitespace, no horizontal rules
- Active cursor: blinking `▌` on most recent partial segment

### 6. REUSE controls footer

The controls bar from the transcription palette/drawer (Phase 7) should be the same component. Controls layout per TRANSCRIPTION_DRAWER.md §6:

```
Recording:  [🗑]   🔴 4:32   [⏸ Pause] [⚙]
Paused:     [🗑 Discard]   ⏸ 4:32   [▶ Resume] [⚙]
```

If the existing controls bar doesn't have a [⚙] button, add one. It opens the same settings modal as the context header [⚙].

### 7. Auto-scroll behavior

- When recording and user hasn't scrolled: auto-scroll to latest segment
- When user scrolls up: pause auto-scroll, show [↓ Latest] in pill
- When user taps [↓ Latest]: scroll to bottom, resume auto-scroll

## Guidelines
- Maximize reuse of Phase 7 transcription components
- If adapting a component for drawer density, add a prop (e.g., `size`, `density`, or `context`) — don't fork
- The controls footer is the SAME component as the palette's controls bar per spec
- If components don't exist yet from Phase 7, flag this and proceed with creation
```

---

## Chunk 8.6: Settings Modal & Activity Log Modal

### Purpose

Build the two full-screen modals: transcription settings and AI activity log.

### Prompt

```
Create the Transcription Settings modal and AI Activity Log modal.

## Context

Both are full-screen modals triggered from their respective drawer views. They overlay the entire app and return the user to where they were on dismiss.

Read:
- TRANSCRIPTION_DRAWER.md §7 (settings modal)
- AI_DRAWER.md §9 (activity log modal)

## Requirements

### 1. CHECK for existing modal patterns

The codebase likely has a Modal component from Phase 3 primitives. Find it and use it as the base for full-screen modals. If only a centered dialog modal exists, extend it with a `fullscreen` variant.

### 2. CREATE `src/components/Modals/TranscriptionSettingsModal.tsx`

Full-screen modal with settings form:

```
┌─────────────────────────────────────────────────────────────┐
│  Transcription Settings                             [Done]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Microphone              [Built-in Microphone ▾]            │
│  Language                [English (US) ▾]                   │
│  Speaker diarization     [toggle]                           │
│  Speaker labels                                             │
│    Speaker 1             [Dr. Chen              ]           │
│    Speaker 2             [Patient               ]           │
│  Auto-punctuation        [toggle]                           │
│  Low-confidence display  [toggle]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- All changes apply immediately (direct manipulation — toggles toggle, dropdowns select)
- [Done] closes the modal. Not "Save."
- Use existing form primitives: Select/Dropdown, Toggle/Switch, TextInput
- Settings state: in-memory for prototype. Create a simple settings state with defaults.
- Triggered from: [⚙] in transcription context header or controls footer

### 3. CREATE `src/components/Modals/ActivityLogModal.tsx`

Full-screen modal with reverse-chronological activity timeline:

```
┌─────────────────────────────────────────────────────────────┐
│  AI Activity                                        [Done]  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Drug interaction check              2:34 PM              │
│    No interactions found                                    │
│  ✕ Dismissed: Consider A1c recheck     2:31 PM              │
│    Care gap · Last A1c 8 months ago                        │
│  ✓ CBC w/ Differential ordered         2:25 PM              │
│    Accepted from suggestion                                │
└─────────────────────────────────────────────────────────────┘
```

- Entry types: accepted suggestion (✓), dismissed suggestion (✕), dismissed nudge (✕), background task completed (✓), background task failed (⚠)
- Not re-actionable — read-only history
- [Done] closes the modal
- For prototype: pre-populated with mock activity data from demo controller
- Triggered from: [📋] in AI drawer context header

### 4. CREATE activity log entry component

A reusable `ActivityLogEntry` component for each timeline item:

```tsx
interface ActivityLogEntryProps {
  type: 'accepted' | 'dismissed' | 'completed' | 'failed';
  title: string;
  detail: string;
  timestamp: string;
}
```

## Guidelines
- Reuse existing Modal, Toggle, Select, TextInput primitives
- Full-screen modals should have consistent header treatment (title left, action button right)
- Both modals use scrollable content areas for overflow
- Transcription continues recording while settings modal is open
```

---

## Chunk 8.7: Drawer ↔ Bottom Bar Coordination

### Purpose

Wire up the coordination between left pane drawer views and the bottom bar. This is the critical integration chunk — when a module moves to the drawer, its bottom bar presence is suppressed, and vice versa.

### Prompt

```
Implement drawer ↔ bottom bar coordination.

## Context

When a module (AI or Transcription) renders at drawer tier in the left pane, it must be hidden from the bottom bar. When it de-escalates from the drawer (user switches views or collapses pane), it returns to its resting tier in the bottom bar.

Read: DRAWER_COORDINATION.md (all sections, especially §3: composition matrix, §4: de-escalation, §7: transition sequences)

CRITICAL: This chunk MODIFIES the Phase 7 Bottom Bar Orchestrator. Do not create a parallel orchestrator. Find the existing one and extend it to be drawer-aware.

## Requirements

### 1. FIND the Phase 7 Bottom Bar Orchestrator

Locate the component/hook that manages which modules appear in the bottom bar and their tiers. This is what needs to become drawer-aware.

### 2. INTEGRATE left pane state into bottom bar visibility

The bottom bar needs to read the left pane state to know when a module is at drawer tier. Use the `useBottomBarVisibility` hook from Chunk 8.1 to derive visibility.

Key rules:
- AI at drawer → AI hidden from bottom bar
- Transcription at drawer → Transcription hidden from bottom bar
- Both at resting tiers → original Phase 7 behavior (two-column grid)
- Only one module at drawer → single-column in bottom bar
- Both modules hidden → bottom bar container hidden entirely

### 3. IMPLEMENT de-escalation side effects

When `PANE_VIEW_CHANGED` or `PANE_COLLAPSED` fires and the outgoing view was a drawer:

```
AI drawer → [any other view]: Set AI tier to 'minibar'
Transcript drawer → [any other view]: Set Transcription tier to 'bar'
```

This should be handled in the reducer or as middleware/effect — whichever pattern Phase 7 established.

### 4. IMPLEMENT escalation side effects

When user escalates to drawer (via palette drawer icon, "Continue in drawer", or view toggle):

```
AI palette → AI drawer: Set AI tier to 'drawer', collapse palette
Transcript palette → Transcript drawer: Set Transcription tier to 'drawer', collapse palette
```

### 5. UPDATE bottom bar grid layout

If the bottom bar uses CSS Grid with fixed column templates, update it to respond to the `layout` value from `useBottomBarVisibility`:

- `two-column`: existing behavior
- `single-column`: `grid-template-columns: 1fr`
- `hidden`: container hidden or `display: none`

### 6. HANDLE edge case: pane collapse

When pane collapses while drawer is active:
1. De-escalate module to resting tier
2. Bottom bar grid reconfigures
3. Pane collapse animation runs

All should happen smoothly — the module shouldn't flash in the bottom bar before the pane finishes collapsing.

## Guidelines
- Extend existing orchestrator, don't create a new one
- De-escalation must be synchronous with view switching — no flicker
- If Phase 7 orchestrator architecture doesn't cleanly support this, describe the issue and propose a refactor before proceeding
- Test: switching between all three pane views should never show a module in two places simultaneously
```

---

## Chunk 8.8: Keyboard Shortcuts

### Purpose

Update keyboard shortcut handling for ⌘K and Escape to work with the left pane system.

### Prompt

```
Update keyboard shortcuts for left pane integration.

## Context

⌘K (AI quick access) and Escape (de-escalate) need updated behavior to account for the left pane drawer views.

Read: LEFT_PANE_SYSTEM.md §8 (keyboard shortcuts), DRAWER_COORDINATION.md §8

CRITICAL: Keyboard shortcuts likely already exist from Phase 7 or earlier. Find and modify the existing handler — don't create a parallel system.

## Requirements

### 1. FIND existing keyboard shortcut handler

Look for a global keydown listener, keyboard hook, or shortcut manager.

### 2. UPDATE ⌘K behavior

| Current State | ⌘K Action |
|---|---|
| Pane showing Menu, AI at minibar | Open AI palette in bottom bar, focus input |
| Pane showing Menu, AI palette open | Focus palette input |
| Pane showing AI drawer | Focus drawer input |
| Pane showing Transcript drawer | Open AI palette in bottom bar, focus input |
| Pane collapsed | Open AI palette in bottom bar, focus input |

Logic: Find the highest-density visible AI surface. Focus its input. If no AI surface is expanded, open the palette.

### 3. UPDATE Escape behavior

| Current State | Escape Action |
|---|---|
| AI palette open (bottom bar) | Collapse to minibar |
| Transcript palette open (bottom bar) | Collapse to bar |
| AI drawer, input focused | Blur input |
| AI drawer, input not focused | No action |
| Transcript drawer | No action |

Escape never closes a left pane view. Within the pane, it only manages focus.

## Guidelines
- Modify existing shortcut system — don't create a new one
- ⌘K should feel instant — no perceived delay between keypress and input focus
- Test all combinations in the state table
```

---

## Chunk 8.9: Storybook Stories & Demo Scenarios

### Purpose

Add Storybook stories for all new components and create demo scenarios that exercise the full left pane workflow.

### Prompt

```
Create Storybook stories and demo scenarios for the Left Pane System.

## Context

Each new component needs Storybook documentation. Additionally, create composite stories that demonstrate full workflows: opening the AI drawer, having a conversation, switching to transcript, escalating from palette to drawer, etc.

## Requirements

### 1. Component Stories

Create stories for each major component:

- `LeftPaneContainer.stories.tsx` — all three views, collapsed state
- `PaneHeader.stories.tsx` — active states, conditional 🎙 icon
- `AIDrawerView.stories.tsx` — empty state, with suggestions, with conversation, read-only post-sign
- `AIContextHeader.stories.tsx` — different scope levels, dismiss behavior
- `SuggestionsSection.stories.tsx` — 0, 3, 10 suggestions, accept/dismiss animations
- `ConversationHistory.stories.tsx` — short exchange, long thread, context change markers
- `AIDrawerFooter.stories.tsx` — full quick actions, filtered quick actions, typing state
- `TranscriptDrawerView.stories.tsx` — recording, paused, scrolled up with [↓ Latest]
- `ViewIndicatorPill.stories.tsx` — all states
- `TranscriptionSettingsModal.stories.tsx` — default values, changed values
- `ActivityLogModal.stories.tsx` — mixed entry types

### 2. Composite Pattern Stories

- `LeftPaneWorkflow.stories.tsx` — demonstrates:
  - Menu → AI Drawer transition
  - AI conversation with suggestion accept/dismiss
  - AI Drawer → Transcript Drawer switch (de-escalation of AI to bottom bar minibar)
  - Transcript Drawer → Menu (de-escalation of transcription to bottom bar)
  - Pane collapse/expand cycle

- `DrawerEscalation.stories.tsx` — demonstrates:
  - AI palette "Continue in drawer" → drawer opens
  - ⌘K focusing correct surface in different states
  - Palette ↔ drawer conversation continuity

### 3. Demo Controller Integration

If a demo controller exists from Phase 7:
- Add controls for: switching pane views, triggering suggestions, advancing conversation, changing recording state
- Add a "Full encounter walkthrough" demo that exercises the left pane through a realistic clinical scenario

### 4. Accessibility verification

All stories should pass the a11y addon checks:
- Focus management on view switch (first focusable element in new view receives focus)
- ARIA labels on view toggle icons
- Keyboard navigation through all interactive elements
- Screen reader announcements for view changes

## Guidelines
- Follow existing Storybook conventions from Phase 5
- Use realistic clinical data in demo scenarios
- Each story should be self-contained (no dependencies on other stories being run first)
```

---

## Verification Checklist

After completing all Phase 8 chunks, verify:

### Functional

- [ ] Left pane shows Menu view by default
- [ ] Tapping ☰ / ✦ / 🎙 switches views correctly
- [ ] 🎙 icon only appears when transcription session exists for current patient
- [ ] Active view icon shows active state indicator
- [ ] Pane collapse/expand works; always re-expands to Menu
- [ ] AI drawer shows suggestions, conversation, and quick actions
- [ ] Quick actions filter when corresponding suggestions are active
- [ ] Conversation messages render correctly (user right, AI left, system centered)
- [ ] Follow-up actions only on latest AI response
- [ ] Transcript drawer shows live transcript with speaker diarization
- [ ] View indicator pill shows correct state (Live with waveform, Paused)
- [ ] [↓ Latest] appears on scroll-up during recording, scrolls to bottom on tap
- [ ] Settings modal opens from ⚙ in context header and controls footer
- [ ] Activity log modal opens from 📋 in AI context header
- [ ] Both modals close with [Done] and return to drawer view

### Coordination

- [ ] When AI drawer active: AI hidden from bottom bar, transcription bar full-width
- [ ] When Transcript drawer active: Transcription hidden from bottom bar, AI minibar full-width
- [ ] When Menu active: both modules at resting tiers in bottom bar
- [ ] When pane collapsed: both modules at resting tiers in bottom bar
- [ ] No module appears on two surfaces simultaneously
- [ ] Cross-surface combos work (AI drawer + transcription palette in bottom bar)
- [ ] De-escalation on view switch: straight to resting tier, no palette flash

### Keyboard

- [ ] ⌘K focuses correct AI input based on current state
- [ ] Escape de-escalates palettes, blurs drawer input, never closes pane view
- [ ] Enter sends message in AI input; Shift+Enter adds newline

### Visual

- [ ] Pane header: view icons left-aligned, collapse button pinned upper-right
- [ ] Gradient fade on pane header (no hard separator)
- [ ] Context headers float with blur backdrop
- [ ] Opaque footer only on AI drawer and Transcript drawer
- [ ] Menu view looks identical to pre-Phase 8 sidebar

### Storybook

- [ ] All component stories render without errors
- [ ] Composite workflow stories demonstrate full transitions
- [ ] a11y addon passes with no critical issues

---

## Related Documents

- [LEFT_PANE_SYSTEM.md](./LEFT_PANE_SYSTEM.md) — Pane container specification
- [AI_DRAWER.md](./AI_DRAWER.md) — AI module drawer specification
- [TRANSCRIPTION_DRAWER.md](./TRANSCRIPTION_DRAWER.md) — Transcription module drawer specification
- [DRAWER_COORDINATION.md](./DRAWER_COORDINATION.md) — Bottom bar coordination specification
- [FUTURE_ENHANCEMENTS.md](./FUTURE_ENHANCEMENTS.md) — Deferred vision items
- [Phase 7 Prompts](./PHASE_7_PROMPTS.md) — Bottom Bar System implementation (prerequisite)
