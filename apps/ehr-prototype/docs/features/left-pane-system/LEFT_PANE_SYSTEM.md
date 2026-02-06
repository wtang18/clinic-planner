# Left Pane System — Design Specification

**Last Updated:** 2026-02-06
**Status:** Design Complete — Ready for Implementation
**Related:** AI_DRAWER.md, TRANSCRIPTION_DRAWER.md, DRAWER_COORDINATION.md, BOTTOM_BAR_SYSTEM.md

---

## Table of Contents

1. [Overview](#1-overview)
2. [Multi-View Architecture](#2-multi-view-architecture)
3. [Pane Header](#3-pane-header)
4. [Collapse & Expand](#4-collapse--expand)
5. [View Switching](#5-view-switching)
6. [Visual Treatment](#6-visual-treatment)
7. [Pane Layout Zones](#7-pane-layout-zones)
8. [Keyboard Shortcuts](#8-keyboard-shortcuts)
9. [State Model](#9-state-model)
10. [Decision Log](#10-decision-log)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Overview

The Left Pane is the primary sidebar panel in the clinical workspace. It has an existing function as the **navigation menu** — housing search, nav items, task counts, and patient workspaces. This specification extends the left pane to also serve as the host surface for the **AI drawer** and **Transcription drawer** views.

### Design Rationale

- **Avoids 4-column layout:** Adding a dedicated AI/transcript panel as a fourth column is unworkable on ≤1440px screens. Reusing the left pane avoids this.
- **Deep focus, not navigation:** When actively using AI or reviewing a transcript, navigation is secondary. The left pane's content switches to match the user's current focus.
- **Spatial convention:** Left = ambient intelligence (AI, transcription). Center = primary work (chart canvas). Right = item detail (detail drawers, Rx workflows).

### Key Principle

The left pane is a **container with switchable views**. The existing collapse/expand button controls the pane's visibility. A new set of view icons in the pane header controls which content renders inside it.

---

## 2. Multi-View Architecture

### Views

| View | Icon | Content | Availability |
|---|---|---|---|
| **Menu** | ☰ | Navigation, search, task counts, patient workspaces | Always |
| **AI Drawer** | ✦ | Full AI assistant — conversation, suggestions, quick actions | Always |
| **Transcript Drawer** | 🎙 | Live transcript, recording controls, settings access | When transcription session exists for current patient |

### View Availability Matrix

| Condition | ☰ Menu | ✦ AI | 🎙 Transcript |
|---|---|---|---|
| No encounter, no session | ✓ | ✓ | ✗ |
| Encounter active, no session | ✓ | ✓ | ✗ |
| Active/paused session for current patient | ✓ | ✓ | ✓ |
| Session processing/summarizing | ✓ | ✓ | ✓ (read-only) |
| Session finalized, still on encounter | ✓ | ✓ | ✓ (until navigate away) |
| Session finalized, navigated away | ✓ | ✓ | ✗ |
| Viewing different patient (session exists on other patient) | ✓ | ✓ | ✗ |

### One View at a Time

Only one view renders in the pane at any time. Switching views preserves the state of the outgoing view in the store — scroll position, in-progress input, conversation history — so returning to it is seamless.

---

## 3. Pane Header

The pane header is the fixed top element of the left pane. It contains the collapse control and view switching icons.

### Layout

```
┌─────────────────────────────────────────┐
│ [☰] [✦] [🎙?]                     [◧]  │
└─────────────────────────────────────────┘
  ↑    ↑    ↑                         ↑
  │    │    └── Transcript (cond.)    └── Collapse (pinned right)
  │    └─────── AI (always)
  └──────────── Menu (always)
```

View switching icons are **left-aligned**. The collapse/expand button is **pinned to the upper-right corner** of the pane. This creates visual separation between navigation controls (left) and the pane visibility control (right).

### Icon Behavior

| Icon | Tap Action | Visual State |
|---|---|---|
| **◧** | Collapse or expand the pane | Toggles between collapse/expand icon states |
| **☰** | Switch pane content to Menu view | Active indicator (underline/tint) when Menu is active |
| **✦** | Switch pane content to AI Drawer view | Active indicator when AI is active |
| **🎙** | Switch pane content to Transcript Drawer view | Active indicator when Transcript is active |

### Active Indicator

The currently active view icon shows an active state — a subtle underline, fill, or tint change. Only one icon is active at a time. The ◧ collapse button does not participate in the active indicator system.

### Conditional 🎙 Icon

The 🎙 icon visibility follows the transcription session lifecycle:

- **Appears:** Fades in (200ms) when a transcription session starts for the current patient
- **Disappears:** Fades out when the session condition clears (finalized + navigated away, or switched to different patient)
- **No badge:** Recording state is communicated through the bottom bar transcription module and the menu pane sidebar indicators — not duplicated on the header icon

### Pane Header Dimensions

| Property | Value |
|---|---|
| Height | ~40px |
| Collapse button | ~32px tap target |
| View icons | ~28px each, ~8px gap |
| Padding | 8px horizontal |

---

## 4. Collapse & Expand

### Existing Behavior (Preserved)

The ◧ button collapses the entire pane — all views hidden. The center columns (patient overview, chart canvas) expand to fill the vacated space. The ◧ button remains visible (typically as a small tab or icon at the screen edge) to allow re-expansion.

### Re-expand Behavior

**Rule: Pane always re-expands to Menu view.**

This is the simplest, most predictable behavior. Module state (AI conversation, transcript scroll position) is preserved in the store — only the active view selection resets.

Rationale: Menu is the universal default. If the user collapsed the pane during AI work, they may be returning to a different context. Menu is always safe. The user can switch to AI/Transcript with a single tap if needed.

### Collapse While Drawer Active

When the pane is collapsed while a drawer view (AI or Transcript) is active, the corresponding module de-escalates to the bottom bar:

| Collapsed From | Module Behavior |
|---|---|
| AI Drawer | AI module appears at minibar tier in bottom bar |
| Transcript Drawer | Transcription module appears at bar tier in bottom bar |
| Menu | No module changes — bottom bar remains as-is |

See DRAWER_COORDINATION.md for full de-escalation rules.

---

## 5. View Switching

### Mechanics

Tapping a view icon in the pane header immediately switches the pane content. The transition is a simple content swap — no directional animation needed.

### De-escalation on Switch

When switching away from a drawer view, the module that was in the drawer de-escalates to its resting tier in the bottom bar:

| Switch | Outgoing Module | Lands At |
|---|---|---|
| AI → Menu | AI module | Minibar (bottom bar) |
| AI → Transcript | AI module | Minibar (bottom bar) |
| Transcript → Menu | Transcription module | Bar (bottom bar) |
| Transcript → AI | Transcription module | Bar (bottom bar) |

**Rule: Straight to resting tier.** No transient palette state. The user actively chose to leave the drawer — that's an intentional de-escalation.

**Unread response handling:** If the AI has an unread response when de-escalating, the minibar shows the response indicator (existing minibar behavior). The user can tap the minibar to open the palette and see the response.

### State Preservation

When switching away from a view, the following state is preserved in the store (not component-local):

| View | Preserved State |
|---|---|
| **AI Drawer** | Conversation history, scroll position, in-progress input text, suggestion list state |
| **Transcript Drawer** | Scroll position, waveform state |
| **Menu** | Scroll position, expanded/collapsed sections |

Returning to a view restores all preserved state.

---

## 6. Visual Treatment

The left pane uses a layered visual treatment inspired by modern OS patterns (macOS, iOS) to maximize the feeling of content space while maintaining fixed reference points.

### Zone Layering

| Zone | Treatment | Behavior |
|---|---|---|
| **Pane header** | Gradient fade from pane background to transparent | Consistent height, content fades into it from below |
| **Context header** (AI/Transcript only) | Floating bar with high `backdrop-filter: blur(20px+)` + tint | Content passes behind but is not legible |
| **Scroll content** | No treatment — full content area | Extends behind floating elements with top padding |
| **Footer** (AI/Transcript only) | Opaque, hard top edge | Only opaque element eating pane area |

### Gradient Header

The pane header sits within a gradient that fades from the pane's background color (opaque at top) to transparent. This follows the Apple OS pattern of not having a hard separator bar — content visually fades as it scrolls toward the header.

The gradient height is consistent and does not extend beyond the header zone.

### Floating Context Header

The context header (patient/encounter info) in AI and Transcript views floats over the scroll content with a heavy blur:

- `backdrop-filter: blur(20px)` minimum
- Tinted to match pane background at ~70-80% opacity
- Content scrolling behind is hinted at but **not legible** — this is deliberate

### Opaque Footer

Only the footer zone (input row for AI, controls bar for Transcript) uses a fully opaque background with a hard top edge. This is the only element that truly "eats" pane height.

### Scroll Content Padding

The scrollable content area has top padding equal to the combined height of the pane header + context header, so content starts below the floating elements when scrolled to the top. As the user scrolls, content slides behind the floating bars.

---

## 7. Pane Layout Zones

### Zone Model

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░ gradient fade ░░░░░░░░░░░░ │
│ [◧]  [☰] [✦] [🎙?]                     │  A: Pane header (gradient)
│                                         │
│ Context info (view-specific)            │  E: Context header (floating, blur)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  ...scrollable content...               │  C: Scroll area
│                                         │
├─────────────────────────────────────────┤
│  Footer controls (view-specific)        │  D: Opaque footer
└─────────────────────────────────────────┘
```

### Zone Dimensions

| Zone | Height | Present In |
|---|---|---|
| **A — Pane header** | ~40px | All views |
| **E — Context header** | ~36px (floating) | AI Drawer, Transcript Drawer |
| **C — Scroll area** | Flex fill | All views |
| **D — Footer** | ~80-90px (AI), ~48px (Transcript), 0px (Menu) | AI Drawer, Transcript Drawer |

### Vertical Budget

On a typical screen (800px usable height, minus 48px app header, minus 48px bottom bar):

| View | Fixed Chrome | Scrollable Height |
|---|---|---|
| Menu | ~40px (header only) | ~664px |
| AI Drawer | ~40px + ~36px floating + ~90px footer = ~166px | ~538px |
| Transcript Drawer | ~40px + ~36px floating + ~48px footer = ~124px | ~580px |

### Menu View Layout

```
┌─────────────────────────────────────────┐
│ [◧]  [☰] [✦]                            │  Pane header
├─────────────────────────────────────────┤
│ 🔍 Search...                            │
│                                         │
│ 🏠 Home                                 │
│ 📅 Visits                               │
│ 👥 My Patients                          │
│                                         │
│ TO DO                                   │
│   Tasks                            4    │
│   Inbox                            6    │  Scrollable nav
│   Messages                         6    │
│   Care Adherence                   5    │
│                                         │
│ PATIENT WORKSPACES                      │
│   Lauren Svendsen                  🔴   │
│     Overview                            │
│     Cough x 5 days                      │
│   Ivan T.                               │
│     Overview                            │
└─────────────────────────────────────────┘
```

No context header, no footer. Full height for navigation. Sidebar indicators (🔴 recording, ⏸ paused) show next to relevant encounters.

### AI Drawer Layout

See AI_DRAWER.md for complete specification.

### Transcript Drawer Layout

See TRANSCRIPTION_DRAWER.md for complete specification.

---

## 8. Keyboard Shortcuts

### ⌘K — AI Quick Access

⌘K always targets the **palette** (bottom bar) as the lightweight AI entry point. It never directly opens the left pane AI drawer.

| Current State | ⌘K Action |
|---|---|
| Pane showing Menu, bottom bar has AI minibar | Open AI palette in bottom bar, focus input |
| Pane showing Menu, AI palette already open | Focus palette input field |
| Pane showing AI drawer | Focus drawer input field (highest-density surface wins) |
| Pane showing Transcript | Open AI palette in bottom bar, focus input |
| Pane collapsed, bottom bar has AI minibar | Open AI palette in bottom bar, focus input |
| Pane collapsed, AI palette already open | Focus palette input field |

**Principle:** ⌘K means "I want to talk to AI quickly." It finds the highest-density AI surface currently visible and focuses its input. If no AI surface is expanded, it opens the palette.

### Escape — De-escalate One Step

Escape is lightweight and non-destructive. It never closes a left pane view.

| Current State | Escape Action |
|---|---|
| AI palette open (bottom bar) | Collapse palette to minibar |
| Transcript palette open (bottom bar) | Collapse palette to bar |
| AI drawer (left pane), input focused | Blur input |
| AI drawer (left pane), input not focused | No action |
| Transcript drawer (left pane) | No action |

**Principle:** Escape does focus management only within the left pane. Closing a drawer view requires an explicit tap on a different view icon (☰ or ✦). This prevents accidental dismissal of a deep AI conversation.

---

## 9. State Model

### Pane State

```typescript
interface LeftPaneState {
  isExpanded: boolean;           // Pane visible or collapsed
  activeView: PaneView;         // Current view
}

type PaneView = 'menu' | 'ai' | 'transcript';
```

### View Switching Action

```typescript
type PaneAction =
  | { type: 'PANE_VIEW_CHANGED'; payload: { to: PaneView } }
  | { type: 'PANE_COLLAPSED' }
  | { type: 'PANE_EXPANDED' };
```

### Reducer Logic

```typescript
function paneReducer(state: LeftPaneState, action: PaneAction): LeftPaneState {
  switch (action.type) {
    case 'PANE_VIEW_CHANGED':
      // Validate transcript availability before allowing switch
      return { ...state, activeView: action.payload.to };

    case 'PANE_COLLAPSED':
      return { ...state, isExpanded: false };
      // Side effect: de-escalate active drawer module to bottom bar

    case 'PANE_EXPANDED':
      return { ...state, isExpanded: true, activeView: 'menu' };
      // Always re-expand to menu

    default:
      return state;
  }
}
```

### Initial State

```typescript
const initialPaneState: LeftPaneState = {
  isExpanded: true,
  activeView: 'menu',
};
```

---

## 10. Decision Log

| # | Decision | Rationale |
|---|---|---|
| 1 | Reuse left pane for AI/Transcript drawers instead of adding a fourth column | Avoids layout overflow on ≤1440px; left = ambient intelligence spatial convention |
| 2 | Icon buttons (not segmented control) for view switching | Handles conditional 🎙 gracefully; takes less space; matches panel-switching patterns in dev tools |
| 3 | Always re-expand to Menu view | Simplest predictable behavior; can add view persistence after testing |
| 4 | De-escalate straight to resting tier on view switch | User actively chose to leave; palette flash would feel like second-guessing |
| 5 | ⌘K targets palette, not drawer | Palette is the quick interaction surface; drawer is for deliberate deep focus |
| 6 | Escape never closes a left pane view | Prevents accidental loss of AI conversation context |
| 7 | Floating visual treatment for context headers | Maximizes perceived content space at 320px pane width |
| 8 | Opaque footer only for control bars | Single hard chrome element per view; everything else floats |
| 9 | Transcription scoped to patient workspace | Provider can review other encounters within same patient without interrupting recording |
| 10 | No beacon strip for prototype | ☰ is one tap away; document beacon vision as future scope |

---

## 11. Future Enhancements

See FUTURE_ENHANCEMENTS.md for detailed documentation. Key items relevant to the left pane:

- **Beacon strip:** Nav badges with count > 0 displayed in pane header when in non-Menu views. Provides situational awareness without switching to Menu. Future evolution: encounter-context beacons showing clinic flow data (waiting room status, STAT lab results) during encounters.
- **Pane view persistence:** Re-expand to last active view instead of always Menu. Requires validity checking (transcript view only valid when session exists for current context).
- **Adaptive pane width:** Wider pane (340-360px) when AI drawer is active for better conversation readability. Static 320px for prototype.
- **AI-as-navigator:** AI actions that navigate to chart sections or open specific views, partially replacing displaced nav when in AI mode.

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-06 | Initial specification — multi-view pane architecture, view switching, visual treatment, keyboard shortcuts |
