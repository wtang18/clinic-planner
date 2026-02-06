# Phase 7: Bottom Bar System — Implementation Plan & Claude Code Prompts

**Last Updated:** 2026-02-03
**Status:** Ready for Implementation
**Context:** Demo prototype — not production. Simulate behaviors, use existing design tokens/patterns.

---

## Table of Contents

1. [Implementation Philosophy](#1-implementation-philosophy)
2. [Execution Plan](#2-execution-plan)
3. [Chunk 7.0: Documentation Refactor](#chunk-70-documentation-refactor)
4. [Chunk 7.1: Bottom Bar State & Types](#chunk-71-bottom-bar-state--types)
5. [Chunk 7.2: Shared Primitives](#chunk-72-shared-primitives)
6. [Chunk 7.3: Transcription Module](#chunk-73-transcription-module)
7. [Chunk 7.4: AI Surface Refactor](#chunk-74-ai-surface-refactor)
8. [Chunk 7.5: Bottom Bar Orchestrator](#chunk-75-bottom-bar-orchestrator)
9. [Chunk 7.6: Sidebar Integration](#chunk-76-sidebar-integration)
10. [Chunk 7.7: Demo Scenarios & Storybook](#chunk-77-demo-scenarios--storybook)
11. [Verification Checklist](#verification-checklist)

---

## 1. Implementation Philosophy

### Demo Prototype, Not Production

This is a **demo/testing prototype**. Key implications:

| Concern | Production Approach | Our Approach |
|---|---|---|
| Audio capture | Web Audio API, MediaRecorder | **Simulated** — timer + fake waveform, no real mic |
| Transcription | Whisper/Deepgram websocket | **Simulated** — timed reveal of pre-written transcript segments |
| Speaker diarization | ML model | **Simulated** — pre-tagged speaker labels in mock data |
| Segment persistence | Server-side storage | **In-memory** — state only, demo controller can snapshot |
| Auto-finalize timer | Background scheduler | **setTimeout** — simple, visible in demo controls |
| Session recovery | IndexedDB + service worker | **Skipped** — mention in UI but don't implement |

### Use Existing Patterns

The codebase already has design tokens, primitives, and conventions. This phase should:

- **Import from** `src/styles/foundations/` (colors, spacing, borderRadius, typography, shadows, transitions, zIndex)
- **Compose from** existing primitives (Button, Badge, IconButton, Card, Spinner, etc.)
- **Follow** existing component patterns (props interfaces, StyleSheet.create, export conventions)
- **Extend** existing state patterns (store dispatch, context providers, hooks)

### Spec as Guidance, Not Prescription

The design specs define *behavior and intent*. Sizing values (160px, 48px, etc.) are **guidance for proportion and priority**, not pixel-perfect mandates. Implementation should use the closest design tokens and let the existing spacing/sizing system drive actual measurements.

---

## 2. Execution Plan

| Chunk | Description | Mode | Dependencies | Est. Files |
|---|---|---|---|---|
| **7.0** | Documentation refactor | Auto-accept | None | 0 code, 4 docs |
| **7.1** | Bottom bar state, types, hooks | Auto-accept | Phase 1 store | 5 |
| **7.2** | Shared primitives (DragHandle, MiniAnchor, ControlsBar) | Auto-accept | 7.1, Phase 3 primitives | 4 |
| **7.3** | Transcription Module (bar, palette, drawer) | Auto-accept | 7.1, 7.2 | 6 |
| **7.4** | AI Surface refactor (adapt existing Minibar/Palette) | **Manual review** | 7.1, 7.2 | 4 (modified) |
| **7.5** | Bottom Bar orchestrator (grid container, coordination) | **Manual review** | 7.1–7.4 | 3 |
| **7.6** | Sidebar transcription indicators | **Manual review** | 7.1 | 2 (modified) |
| **7.7** | Demo scenarios + Storybook stories | Auto-accept | 7.1–7.6 | 6 |

**Total:** ~30 files (new + modified)

### Dependency Graph

```
7.0 (docs) ──────────────────────────────────────────→ done (no code deps)

7.1 (state/types) ─┬─→ 7.2 (shared primitives) ─┬─→ 7.5 (orchestrator)
                    │                              │
                    ├─→ 7.3 (transcription)  ──────┤
                    │                              │
                    ├─→ 7.4 (AI refactor)    ──────┤
                    │                              │
                    └─→ 7.6 (sidebar)              └─→ 7.7 (demo/stories)
```

---

## Chunk 7.0: Documentation Refactor

### Purpose

Restructure project knowledge so Claude Code has clean, non-contradictory spec docs to reference. The existing `AI_CONTROL_SURFACE_V2.md` (770 lines) currently mixes orchestration, AI-specific behavior, and transcription concerns. The three new docs (TRANSCRIPTION_MODULE.md, BOTTOM_BAR_SYSTEM.md, SHARED_PATTERNS.md) were created in this session and need to be added to the project, while the v2 doc needs a deprecation notice pointing to the new structure.

### Prompt

```
Refactor the project documentation for the Bottom Bar System.

## Context

We've split the monolithic AI_CONTROL_SURFACE_V2.md into a system of focused documents. Three new specs have been created and need to be added to the project. The existing v2 doc needs updating to point to the new structure.

## Tasks

### 1. Add the three new spec documents to the project root

These files have already been written and are ready to add:
- `TRANSCRIPTION_MODULE.md` — Transcription module component spec (50 design decisions)
- `BOTTOM_BAR_SYSTEM.md` — Bottom bar orchestration spec (grid, mutual exclusion, coordination)
- `SHARED_PATTERNS.md` — Shared components and patterns (drag handle, mini anchor, animation, a11y)

Copy them from the outputs directory into the project docs.

### 2. Update AI_CONTROL_SURFACE_V2.md with deprecation header

Add a deprecation notice at the top of AI_CONTROL_SURFACE_V2.md:

```markdown
> **⚠️ PARTIALLY SUPERSEDED**
> This document's orchestration layer (§1-2), audio input model (§10), and physical architecture
> have been superseded by the Bottom Bar System docs:
> - **BOTTOM_BAR_SYSTEM.md** — Grid layout, mutual exclusion, workspace switching
> - **TRANSCRIPTION_MODULE.md** — Transcription component (was "Context Pill")
> - **SHARED_PATTERNS.md** — Shared components, animation tokens, accessibility
>
> Sections §3-9 and §11 (AI-specific: minibar content, palette content, nudge governance,
> context targeting, mode-aware behavior, role composition, population management) remain
> authoritative until a dedicated AI_SURFACE.md is created.
```

### 3. Update README.md documentation index

Add a new "Bottom Bar System" section to the documentation index:

```markdown
### Bottom Bar System

| Document | Description |
|----------|-------------|
| [Bottom Bar System](./BOTTOM_BAR_SYSTEM.md) | Grid layout, mutual exclusion, state coordination |
| [Transcription Module](./TRANSCRIPTION_MODULE.md) | Recording lifecycle, bar/palette/drawer, session management |
| [AI Control Surface v2](./AI_CONTROL_SURFACE_V2.md) | AI minibar/palette content, nudge governance, context targeting |
| [Shared Patterns](./SHARED_PATTERNS.md) | Drag handle, mini anchor, animation tokens, accessibility |
```

### 4. Create PHASE_7_PROMPTS.md

Add the implementation prompts document (this file) to the project as `PHASE_7_PROMPTS.md`.

## Guidelines
- Don't modify the content of the three new spec docs — they're final
- The deprecation notice should be helpful, not alarming — it's a normal refactor
- Keep README index alphabetically consistent with existing sections
```

---

## Chunk 7.1: Bottom Bar State & Types

### Purpose

Define the state model, types, and hooks that both modules consume. This is the foundation — all subsequent chunks depend on it.

### Prompt

```
Create the state management layer for the Bottom Bar System.

## Context

The Bottom Bar System coordinates two modules: Transcription Module and AI Surface. They share mutual exclusion rules (only one expanded at a time) and respond to workspace context (encounter vs. non-encounter). This state layer manages tier visibility, transcription recording lifecycle, and cross-module coordination.

Read these spec docs for full behavioral requirements:
- BOTTOM_BAR_SYSTEM.md (§2-6: grid layout, mutual exclusion, state coordination, workspace switching)
- TRANSCRIPTION_MODULE.md (§8-9: recording lifecycle, session management)
- SHARED_PATTERNS.md (§5: tier system)

## Requirements

### 1. CREATE `src/state/bottomBar/types.ts`

```typescript
// Tier states for progressive disclosure
export type TierState = 'mini' | 'bar' | 'palette' | 'drawer';

// Transcription recording status
export type TranscriptionStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'error' | 'recovered';

// Per-encounter transcription session
export interface TranscriptionSession {
  encounterId: string;
  patientId: string;
  patientName: string;          // Display name for bar/palette header
  patientInitials: string;      // Avatar content
  encounterLabel: string;       // e.g., "Cough x 5 days"
  status: TranscriptionStatus;
  durationSeconds: number;      // Elapsed recording time
  segments: TranscriptSegment[];
  pausedAt?: number;            // Timestamp when paused
  startedAt?: number;           // Timestamp when recording started
}

// Individual transcript segment (for demo, pre-authored content)
export interface TranscriptSegment {
  id: string;
  speaker: 'provider' | 'patient' | 'unknown';
  speakerLabel: string;         // e.g., "Dr. Chen", "Patient"
  text: string;
  timestamp: number;            // Seconds into recording
  confidence: number;           // 0-1, for display treatment
  revealed: boolean;            // For demo: progressive reveal
}

// Bottom bar layout state
export interface BottomBarState {
  // Module tier states
  transcriptionTier: TierState;
  aiTier: TierState;

  // Context
  isEncounterActive: boolean;
  activeEncounterId: string | null;

  // Transcription sessions (keyed by encounterId)
  sessions: Record<string, TranscriptionSession>;

  // Which encounter is currently recording (only one system-wide)
  activeRecordingEncounterId: string | null;
}

// Actions
export type BottomBarAction =
  // Tier management
  | { type: 'BOTTOM_BAR/SET_TRANSCRIPTION_TIER'; tier: TierState }
  | { type: 'BOTTOM_BAR/SET_AI_TIER'; tier: TierState }
  | { type: 'BOTTOM_BAR/DIRECT_SWITCH'; target: 'transcription' | 'ai' }

  // Context
  | { type: 'BOTTOM_BAR/SET_ENCOUNTER_ACTIVE'; encounterId: string; patientId: string; patientName: string; patientInitials: string; encounterLabel: string }
  | { type: 'BOTTOM_BAR/CLEAR_ENCOUNTER' }

  // Transcription lifecycle
  | { type: 'TRANSCRIPTION/START'; encounterId: string }
  | { type: 'TRANSCRIPTION/PAUSE'; encounterId: string }
  | { type: 'TRANSCRIPTION/RESUME'; encounterId: string }
  | { type: 'TRANSCRIPTION/STOP'; encounterId: string }
  | { type: 'TRANSCRIPTION/DISCARD'; encounterId: string }
  | { type: 'TRANSCRIPTION/TICK'; encounterId: string }  // Timer increment
  | { type: 'TRANSCRIPTION/REVEAL_SEGMENT'; encounterId: string; segmentId: string }
  | { type: 'TRANSCRIPTION/AUTO_PAUSE'; encounterId: string; reason: string }
  | { type: 'TRANSCRIPTION/SET_STATUS'; encounterId: string; status: TranscriptionStatus }
  | { type: 'TRANSCRIPTION/AUTO_FINALIZE'; encounterId: string };
```

### 2. CREATE `src/state/bottomBar/reducer.ts`

Implement the reducer with mutual exclusion enforcement:

```typescript
export function bottomBarReducer(state: BottomBarState, action: BottomBarAction): BottomBarState
```

Key rules to enforce in the reducer:
- **Mutual exclusion:** When one module goes to palette/drawer, force the other to mini
- **DIRECT_SWITCH:** Collapse the currently-expanded module to bar, expand the target to palette
- **One recording system-wide:** Starting recording in encounter B auto-pauses encounter A
- **Paused session limit:** Max 3 concurrent paused sessions (reject START if at limit)
- **Encounter context:** When CLEAR_ENCOUNTER, auto-pause any active recording
- **Auto-finalize:** TRANSCRIPTION/AUTO_FINALIZE removes the session and cleans up

### 3. CREATE `src/state/bottomBar/selectors.ts`

Memoized selectors:

```typescript
// Current encounter's transcription session (or null)
export const selectCurrentSession = (state: BottomBarState): TranscriptionSession | null => ...

// All paused sessions across encounters
export const selectPausedSessions = (state: BottomBarState): TranscriptionSession[] => ...

// Grid template string based on current tiers and encounter context
export const selectGridTemplate = (state: BottomBarState): string => ...

// Whether a module can expand (checks mutual exclusion)
export const selectCanExpand = (state: BottomBarState, module: 'transcription' | 'ai'): boolean => ...

// Active recording session (any encounter)
export const selectActiveRecording = (state: BottomBarState): TranscriptionSession | null => ...

// Count of paused sessions (for limit checking)
export const selectPausedSessionCount = (state: BottomBarState): number => ...
```

### 4. CREATE `src/hooks/useBottomBar.ts`

React hooks that wrap the reducer:

```typescript
// Main orchestration hook — used by BottomBarContainer
export function useBottomBar()

// Transcription controls — used by TranscriptionModule components
export function useTranscription(encounterId: string)

// Tier switching — used by both modules
export function useTierControls(module: 'transcription' | 'ai')
```

The `useTranscription` hook should manage the demo timer: when status is 'recording', run a setInterval that dispatches TICK every second and progressively reveals transcript segments.

### 5. CREATE `src/state/bottomBar/initialState.ts`

Default state and factory for creating demo-ready initial state:

```typescript
export const defaultBottomBarState: BottomBarState = { ... }

// Factory for demo scenarios with pre-loaded sessions
export function createDemoBottomBarState(scenario: 'empty' | 'mid-encounter' | 'multi-patient'): BottomBarState
```

### 6. CREATE `src/state/bottomBar/mockTranscripts.ts`

Pre-authored transcript segments for the "Cough x 5 days" demo scenario:

```typescript
export const coughEncounterTranscript: TranscriptSegment[] = [
  { id: 'seg-1', speaker: 'provider', speakerLabel: 'Dr. Chen', text: 'So the cough started about five days ago, and it\'s gotten worse at night?', timestamp: 42, confidence: 0.95, revealed: false },
  { id: 'seg-2', speaker: 'patient', speakerLabel: 'Patient', text: 'Yeah, especially when I lie down. And I\'ve had some chest tightness too.', timestamp: 48, confidence: 0.92, revealed: false },
  // ... 8-12 more segments covering HPI, exam findings, plan discussion
]
```

Include segments with varied confidence levels (some < 0.6 for low-confidence display testing).

## Guidelines
- Use existing store patterns from `src/state/` — follow the same dispatch/reducer/selector conventions
- Import types from existing `src/state/types.ts` where overlapping (e.g., PatientId references)
- Timer management via useEffect cleanup — don't leak intervals
- All state is in-memory, no persistence needed for demo
- The `selectGridTemplate` selector returns CSS grid-template-columns strings — these drive the actual layout
```

---

## Chunk 7.2: Shared Primitives

### Purpose

Build the three shared components used by both modules: DragHandle, MiniAnchor, and ControlsBar.

### Prompt

```
Create shared primitive components for the Bottom Bar System.

## Context

Read SHARED_PATTERNS.md for behavioral specs. These components are used by both the Transcription Module and AI Surface to maintain consistent interaction grammar.

## Requirements

### 1. CREATE `src/components/bottom-bar/DragHandle.tsx`

A tappable/draggable handle for collapsing palettes and drawers.

```typescript
interface DragHandleProps {
  onCollapse: () => void;       // Called on tap or completed drag-down
  style?: ViewStyle;
}
```

Implementation:
- Centered horizontal bar, use existing borderRadius and neutral color tokens
- Minimum 44px tall tap target (the bar itself is smaller visually)
- Pressable with opacity feedback on press
- Accessible: role="button", accessibilityLabel="Collapse panel"
- No drag gesture implementation needed for demo — tap-only is sufficient

### 2. CREATE `src/components/bottom-bar/MiniAnchor.tsx`

A 48px tappable icon with optional state badge.

```typescript
interface MiniAnchorProps {
  module: 'transcription' | 'ai';
  onPress: () => void;          // Triggers direct-switch

  // Transcription badges
  transcriptionStatus?: TranscriptionStatus;

  // AI badges
  suggestionCount?: number;
  hasNudge?: boolean;
  isActive?: boolean;
}
```

Implementation:
- Use existing IconButton as base or build from Pressable + existing icon components
- Badge positioning: absolute, top-right corner of the icon
- Use status color tokens: colors.status.error for recording/error, colors.status.warning for paused
- Pulsing animation for recording state: use Animated API or simple opacity keyframes
- Accessible: accessibilityLabel should include state ("Transcription, recording in progress")

### 3. CREATE `src/components/bottom-bar/ControlsBar.tsx`

Fixed-bottom action zone for the Transcription Module.

```typescript
interface ControlsBarProps {
  status: TranscriptionStatus;
  durationSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
  onSettings: () => void;
  onRetry?: () => void;
  showDiscard?: boolean;        // Only when paused and in palette/drawer
}
```

Implementation:
- Use existing Button and IconButton primitives
- Layout: secondary actions left, status/duration center, primary action right, settings gear far-right
- Duration display: format as `M:SS` — simple helper function
- Discard button: use Button variant="danger" or "ghost" with error color
- Primary action is always the rightmost non-settings button
- Inline discard confirmation: when discard tapped, replace controls with "Discard recording? [Cancel] [Discard]"
- Use existing spacing tokens for gaps between elements

### 4. CREATE `src/components/bottom-bar/index.ts`

Export all shared components.

## Guidelines
- Compose from existing primitives — don't rebuild Button/Badge/IconButton from scratch
- Use design tokens from `src/styles/foundations/` — no raw hex colors or pixel values
- StyleSheet.create for all styles, following existing component conventions
- Keep components pure/presentational — all state management is in hooks from 7.1
- These will be used in Storybook stories in 7.7, so keep props clean and well-typed
```

---

## Chunk 7.3: Transcription Module

### Purpose

Build the Transcription Module's three visual tiers: bar, palette, and drawer.

### Prompt

```
Create the Transcription Module components for the Bottom Bar System.

## Context

Read TRANSCRIPTION_MODULE.md for the full spec. The Transcription Module has four visual states: mini (handled by MiniAnchor from 7.2), bar, palette, and drawer. This is a demo prototype — audio recording is simulated with timers and pre-authored transcript segments.

## Requirements

### 1. CREATE `src/components/bottom-bar/transcription/TranscriptionBar.tsx`

The default visible state during encounters. Fixed width in the grid.

```typescript
interface TranscriptionBarProps {
  session: TranscriptionSession | null;
  patientName: string;
  patientInitials: string;
  onMicPress: () => void;          // Start/pause/resume depending on status
  onBarPress: () => void;          // Open palette
}
```

Implementation:
- Row layout: [Avatar/Initials] [Center content] [Action button]
- Center content changes by status — see TRANSCRIPTION_MODULE.md §4 for state table
- Avatar: circular, use patient initials, same pattern as existing PatientHeader
- Waveform during recording: simple animated bars (3-4 bars oscillating height) — decorative only
- Duration text: use body-sm or caption typography token
- Action button: use existing IconButton with appropriate icon per status
- onBarPress fires when tapping the bar area (not the action button)
- Dark surface background to match existing bottom bar in screenshots

### 2. CREATE `src/components/bottom-bar/transcription/TranscriptionPalette.tsx`

Expanded detail view with three zones.

```typescript
interface TranscriptionPaletteProps {
  session: TranscriptionSession;
  onCollapse: () => void;
  onEscalateToDrawer: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
  onSettings: () => void;
}
```

Implementation — three zones:
- **Header zone:** DragHandle + patient initials + full name + encounter label
- **Content zone:** Status-dependent content:
  - Idle: Guidance text ("Confirm patient consent before recording.") — use body-sm, muted color
  - Recording/Paused: Mini waveform + one-line transcript preview + [↗] drawer escalation button
  - Error: Warning icon + error message
- **Controls zone:** ControlsBar component from 7.2

The palette expands upward from the bar position. For demo, just render conditionally (show/hide) — smooth animation is nice-to-have.

### 3. CREATE `src/components/bottom-bar/transcription/TranscriptionDrawer.tsx`

Full-panel view with tabs.

```typescript
interface TranscriptionDrawerProps {
  session: TranscriptionSession;
  onCollapse: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
  onSettings: () => void;
}
```

Implementation:
- **Header:** DragHandle + patient/encounter label + tab bar ([Live Transcript] [Settings])
- **Live Transcript tab:** ScrollView of transcript segments
  - Each segment: colored speaker dot + label, text, right-aligned timestamp
  - Confidence-based styling: normal (>0.85), muted/lighter (0.6-0.85), underline+dimmed (<0.6)
  - Auto-scroll: use ref.scrollToEnd() when new segments revealed, unless user has scrolled up
  - "↓ Live" button at bottom-right when scrolled up during recording
  - Speaker colors: use two distinct colors from existing palette (e.g., primary for provider, clinical.lab for patient)
- **Settings tab:** Simple form with mock controls:
  - Microphone source: Select component, values are mock device names
  - Language: Select, "English (US)" / "Spanish" / "Mandarin"
  - Speaker diarization: Toggle
  - Auto-punctuation: Toggle
  - Low-confidence display: Toggle
  - Use existing Input, Select, Toggle primitives where available
- **Controls zone:** Same ControlsBar, pinned at bottom

### 4. CREATE `src/components/bottom-bar/transcription/WaveformIndicator.tsx`

Simple animated waveform bars for visual recording feedback.

```typescript
interface WaveformIndicatorProps {
  isActive: boolean;             // Animates when true, freezes when false
  size: 'mini' | 'bar';         // mini = avatar-width in palette, bar = compact in bar
}
```

Implementation:
- 3-4 vertical bars with staggered height animation
- Use Animated API or simple CSS transitions
- Frozen (static, mid-height) when paused
- Hidden when idle
- Bar colors: use status.error (recording red) or neutral depending on context

### 5. CREATE `src/components/bottom-bar/transcription/TranscriptionModule.tsx`

Container that renders the correct tier based on state.

```typescript
interface TranscriptionModuleProps {
  tier: TierState;
  encounterId: string;
}
```

Implementation:
- Switch on tier: 'mini' → MiniAnchor, 'bar' → TranscriptionBar, 'palette' → TranscriptionPalette, 'drawer' → TranscriptionDrawer
- Connect to hooks from 7.1 for state + dispatch
- This is the component that gets placed in the grid column

### 6. CREATE `src/components/bottom-bar/transcription/index.ts`

Export all transcription components.

## Guidelines
- Compose from existing primitives — Button, IconButton, Badge, Card, Spinner, etc.
- Use design tokens throughout — colors, spacing, typography, borderRadius
- Dark surface: the existing bottom bar uses a dark background (see screenshots). Match that pattern.
- Keep the drawer simple for demo — it doesn't need perfect auto-scroll behavior. Get the visual right.
- Transcript segments render from the mock data created in 7.1 — progressively revealed by the timer
- Settings tab is visual only in demo — toggles can update local component state, no persistence needed
```

---

## Chunk 7.4: AI Surface Refactor

### Purpose

Adapt the existing Minibar and Palette components to work within the new Bottom Bar grid system. This modifies existing files — **run with manual review**.

### Prompt

```
Refactor the existing AI Surface components (Minibar, Palette) to integrate with the Bottom Bar System.

## Context

The existing Minibar and Palette components (in `src/components/ai-ui/`) were built as standalone components. They need to be adapted to work within the new CSS Grid-based Bottom Bar container, which coordinates them with the Transcription Module.

Read BOTTOM_BAR_SYSTEM.md §3-5 for mutual exclusion and coordination rules.

## Requirements

### 1. CREATE `src/components/bottom-bar/ai/AISurfaceModule.tsx`

Wrapper that renders the AI Surface at the appropriate tier, paralleling TranscriptionModule.

```typescript
interface AISurfaceModuleProps {
  tier: TierState;
}
```

Implementation:
- 'mini' → MiniAnchor (module='ai', with suggestion count from existing store)
- 'bar' → Existing Minibar component (or a thin adapter around it)
- 'palette' → Existing Palette component (or adapter)
- 'drawer' → Placeholder for now (can show "Full AI assistant — coming soon" or expand palette content)

The key change is that Minibar/Palette no longer manage their own open/closed state — the BottomBar orchestrator controls that via tier prop.

### 2. MODIFY `src/components/ai-ui/Minibar.tsx`

Adapt to receive tier-control props instead of managing its own expand/collapse state:

- Remove internal isOpen/isExpanded state if present
- Accept `onBarPress: () => void` prop to signal "user wants to open palette" to the orchestrator
- Accept `onMiniPress: () => void` for when it's being used as a mini anchor in the grid
- Keep all existing content rendering (status badges, sync indicator, etc.)
- Ensure it works at both "bar" width and "full-width" (when no transcription module present)

### 3. MODIFY `src/components/ai-ui/Palette.tsx`

Adapt to receive orchestrated open/close instead of managing its own:

- Remove internal open/close state management
- Accept `onCollapse: () => void` instead of managing its own close button
- Use DragHandle component from 7.2 instead of any existing close mechanism
- Keep all existing content: context header, quick actions, suggestion chips, input row
- Add `onEscalateToDrawer: () => void` prop for future drawer escalation

### 4. CREATE `src/components/bottom-bar/ai/index.ts`

Export the AI Surface module components.

## Guidelines
- MINIMAL changes to existing Minibar/Palette — adapt, don't rewrite
- The goal is to make them work within the grid container, not to redesign them
- If existing components are hard to adapt, create thin wrapper components that delegate to them
- Preserve all existing functionality — suggestions, quick actions, input row, etc.
- Test that the AI Surface still works correctly as a standalone (non-encounter mode, full-width)
```

---

## Chunk 7.5: Bottom Bar Orchestrator

### Purpose

The grid container that coordinates both modules. This is the integration point — **run with manual review**.

### Prompt

```
Create the Bottom Bar orchestrator that coordinates the Transcription Module and AI Surface in a CSS Grid layout.

## Context

Read BOTTOM_BAR_SYSTEM.md §2 for the grid architecture and §5 for the state coordination matrix. This is the container component that enforces mutual exclusion and drives layout transitions.

## Requirements

### 1. CREATE `src/components/bottom-bar/BottomBarContainer.tsx`

The main orchestrator component.

```typescript
interface BottomBarContainerProps {
  // Provided by parent layout (AppShell or screen component)
  isEncounterActive: boolean;
  encounterId?: string;
  patientContext?: {
    patientId: string;
    patientName: string;
    patientInitials: string;
    encounterLabel: string;
  };
}
```

Implementation:
- Renders as a CSS Grid container (on web, use View with flexbox approximation for RN)
- Grid template driven by `selectGridTemplate` selector from 7.1
- Contains two children: TranscriptionModule (column 1) and AISurfaceModule (column 2)
- When !isEncounterActive: hides TranscriptionModule, AISurfaceModule takes full width
- Wires all dispatch actions through to child components
- Manages encounter context: dispatches SET_ENCOUNTER_ACTIVE/CLEAR_ENCOUNTER on prop changes
- Handles workspace switching: when encounterId changes, dispatches AUTO_PAUSE for previous encounter
- Toast notifications for auto-pause: use existing toast/notification pattern if available, or simple Animated banner

Position: fixed bottom, full viewport width, above any system bars. Use existing zIndex tokens.

### 2. CREATE `src/components/bottom-bar/BottomBarProvider.tsx`

Context provider that wraps the bottom bar state.

```typescript
export const BottomBarProvider: React.FC<{ children: React.ReactNode }>
```

- Creates the bottom bar reducer/state
- Provides state + dispatch via React context
- Wraps the BottomBarContainer and makes state available to any descendant (including sidebar indicators in 7.6)

### 3. MODIFY `src/components/layout/AppShell.tsx` (or equivalent layout wrapper)

Integrate the BottomBarProvider and BottomBarContainer into the app layout:

- Wrap app content with BottomBarProvider
- Replace existing Minibar placement with BottomBarContainer
- Pass encounter context from navigation/routing state to BottomBarContainer
- Ensure main content area accounts for bottom bar height (padding-bottom or flex layout)

## Guidelines
- The grid transition animation is nice-to-have — start with instant layout changes, add transitions later
- For Expo/React Native Web, use Platform.select for web-specific CSS Grid vs. RN flexbox
- The container should be simple — all business logic lives in the reducer (7.1) and hooks
- Test encounter switching: navigate between encounters and verify auto-pause behavior
- Test non-encounter views: navigate to Inbox/Tasks and verify transcription module disappears
```

---

## Chunk 7.6: Sidebar Integration

### Purpose

Add transcription state indicators to the sidebar navigation. **Run with manual review** since it modifies existing sidebar components.

### Prompt

```
Add transcription recording/paused indicators to the sidebar navigation.

## Context

Read TRANSCRIPTION_MODULE.md §10 for indicator specifications. The sidebar should show recording state next to encounter rows so users can see which encounters have active or paused transcription sessions.

## Requirements

### 1. CREATE `src/components/sidebar/TranscriptionIndicator.tsx`

Small indicator component for sidebar encounter rows.

```typescript
interface TranscriptionIndicatorProps {
  status: TranscriptionStatus | null;   // null = no session for this encounter
}
```

Implementation:
- 'recording': small pulsing red dot, use Animated opacity loop
- 'paused': static pause icon (⏸), amber color
- 'processing': small Spinner component, subdued
- null / 'idle': render nothing
- Size: small enough to sit next to encounter label without disrupting layout (~12-16px)
- Use existing Badge component with dot variant if it supports this, otherwise build minimal

### 2. MODIFY sidebar encounter row component

Find the component that renders encounter rows in the sidebar (likely in `src/components/layout/` or `src/components/sidebar/`). Add the TranscriptionIndicator next to the encounter label:

```tsx
// Pseudocode for the modification
<TouchableOpacity onPress={navigateToEncounter}>
  <EncounterIcon />
  <Text>{encounterLabel}</Text>
  <TranscriptionIndicator status={sessionStatus} />  {/* NEW */}
</TouchableOpacity>
```

- Get session status from BottomBar context: look up session by encounterId, read status
- Only show indicator for encounters that have a transcription session (recording, paused, or processing)

## Guidelines
- Minimal changes to existing sidebar — just adding the indicator element
- Use BottomBar context (from 7.5 provider) to access session state
- Keep indicator small and non-intrusive — it should be glanceable
- If the sidebar component structure doesn't have individual encounter rows yet, skip this chunk and add a TODO
```

---

## Chunk 7.7: Demo Scenarios & Storybook

### Purpose

Create Storybook stories and demo scenario presets for testing all Bottom Bar states.

### Prompt

```
Create Storybook stories and demo scenarios for the Bottom Bar System.

## Context

The Bottom Bar System has many states across two modules. We need comprehensive visual testing and demo-friendly scenario presets. Follow existing Storybook conventions from Phase 5.

## Requirements

### 1. CREATE `src/stories/bottom-bar/TranscriptionBar.stories.tsx`

Stories for the TranscriptionBar in all states:
- Idle (patient name visible, mic button)
- Recording (waveform + timer, pause button)
- Paused (paused label + timer, resume button)
- Processing (spinner, no action)
- Error (error message, retry button)
- Truncated patient name (long name test)

### 2. CREATE `src/stories/bottom-bar/TranscriptionPalette.stories.tsx`

Stories for the palette in all states:
- Idle with consent guidance text
- Recording with transcript preview
- Paused with discard option
- Discard confirmation inline
- Error state

### 3. CREATE `src/stories/bottom-bar/TranscriptionDrawer.stories.tsx`

Stories for the drawer:
- Live transcript tab with multiple speakers
- Live transcript with varied confidence levels
- Settings tab
- Auto-scroll behavior (recording with "↓ Live" button)

### 4. CREATE `src/stories/bottom-bar/BottomBarSystem.stories.tsx`

Full system stories showing both modules coordinated:
- Both at bar (default encounter state)
- Transcription palette open, AI mini
- AI palette open, transcription mini
- Direct switch animation (tap mini anchor)
- Non-encounter (AI only, full width)
- Workspace switching (auto-pause toast)

### 5. CREATE `src/stories/bottom-bar/SharedPrimitives.stories.tsx`

Stories for shared components:
- DragHandle (tap interaction)
- MiniAnchor (transcription states: idle, recording, paused, error)
- MiniAnchor (AI states: nothing pending, suggestions, nudge, active)
- ControlsBar (all status variants)

### 6. CREATE `src/state/bottomBar/demoScenarios.ts`

Pre-built scenario states for the demo controller:

```typescript
export const bottomBarScenarios = {
  // Bare state — just entered encounter, nothing started
  encounterIdle: { ... },

  // Mid-recording — 4:32 into transcription, segments revealing
  midRecording: { ... },

  // Paused — provider stepped away
  paused: { ... },

  // Multi-patient — two paused sessions in sidebar + one active
  multiPatient: { ... },

  // Processing — recording done, summarizing
  postRecording: { ... },

  // Error — microphone not detected
  micError: { ... },
};
```

These integrate with the existing DemoController/DemoLauncher from Phase 6 if available.

## Guidelines
- Follow existing story conventions: Meta, StoryObj, controls/args
- Include realistic clinical data (patient names, encounter labels, transcript content)
- System stories should be interactive — clicking the mini anchor should trigger direct-switch
- Use the BottomBarProvider wrapper in stories that need state management
- Label stories clearly for non-technical stakeholders ("Recording in Progress", "Two Patients Paused")
```

---

## Verification Checklist

After completing all Phase 7 chunks:

### Functional
- [ ] Transcription bar renders in all 5 states (idle, recording, paused, processing, error)
- [ ] Tapping mic button starts recording (timer counts, segments reveal)
- [ ] Tapping pause pauses recording (timer stops, waveform freezes)
- [ ] Tapping resume continues recording
- [ ] Discard shows inline confirmation, then clears session
- [ ] Palette opens on bar tap, closes on drag handle tap
- [ ] Drawer shows scrollable transcript with speaker labels
- [ ] Mini anchor shows correct badge per recording state

### Coordination
- [ ] Opening transcription palette forces AI to mini (mutual exclusion)
- [ ] Opening AI palette forces transcription to mini
- [ ] Tapping mini anchor performs direct-switch
- [ ] Navigating away from encounter auto-pauses recording
- [ ] Returning to encounter shows paused state with resume option
- [ ] Non-encounter views show AI-only, full width
- [ ] Sidebar shows recording/paused indicators

### Visual
- [ ] Dark surface background matches existing bottom bar style
- [ ] All colors from design tokens (no raw hex values)
- [ ] All spacing from token system
- [ ] Typography consistent with existing components
- [ ] Waveform animation runs smoothly

### Demo-Ready
- [ ] Storybook stories cover all major states
- [ ] Demo scenarios load with pre-built state
- [ ] Transcript reveals progressively during recording
- [ ] Confidence-based text styling visible in drawer
- [ ] Settings tab renders with mock controls

---

## Related Documents

- [TRANSCRIPTION_MODULE.md](./TRANSCRIPTION_MODULE.md) — Component spec (50 decisions)
- [BOTTOM_BAR_SYSTEM.md](./BOTTOM_BAR_SYSTEM.md) — Orchestration spec
- [SHARED_PATTERNS.md](./SHARED_PATTERNS.md) — Shared components and patterns
- [AI_CONTROL_SURFACE_V2.md](./AI_CONTROL_SURFACE_V2.md) — AI-specific behavior (§3-9, §11)
- [Phase 3: UI Components](./PHASE_3_PROMPTS.md) — Existing component implementations
- [Phase 5: Storybook](./PHASE_5_PROMPTS.md) — Story conventions
- [Phase 6: Demo & Testing](./PHASE_6_PROMPTS.md) — Demo controller patterns
