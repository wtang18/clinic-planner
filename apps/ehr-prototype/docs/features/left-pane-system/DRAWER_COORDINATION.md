# Drawer ↔ Bottom Bar Coordination

**Last Updated:** 2026-02-06
**Status:** Design Complete — Ready for Implementation
**Updates:** BOTTOM_BAR_SYSTEM.md (mutual exclusion §3, state coordination §5), SHARED_PATTERNS.md (tier transitions §5-6)
**Related:** LEFT_PANE_SYSTEM.md, AI_DRAWER.md, TRANSCRIPTION_DRAWER.md

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Rule: One Module, One Surface](#2-core-rule-one-module-one-surface)
3. [Bottom Bar Composition Matrix](#3-bottom-bar-composition-matrix)
4. [De-escalation Rules](#4-de-escalation-rules)
5. [Escalation Paths](#5-escalation-paths)
6. [Cross-Surface Mutual Exclusion](#6-cross-surface-mutual-exclusion)
7. [Transition Sequences](#7-transition-sequences)
8. [Keyboard Shortcuts](#8-keyboard-shortcuts)
9. [Edge Cases](#9-edge-cases)
10. [State Model Updates](#10-state-model-updates)

---

## 1. Overview

With the introduction of the Left Pane System, the AI and Transcription modules now have a fourth density tier — the **drawer** — that renders in the left pane rather than the bottom bar. This document defines how the drawer tier coordinates with the existing minibar/bar/palette tiers in the bottom bar.

### Key Principle

Each module (AI, Transcription) renders at **exactly one density** at any time. When the drawer density is active (left pane), that module's bottom bar presence is fully suppressed. The module **moves** between surfaces — it doesn't clone.

---

## 2. Core Rule: One Module, One Surface

| Module State | Renders In | Bottom Bar Presence |
|---|---|---|
| AI at minibar | Bottom bar | Minibar visible |
| AI at palette | Bottom bar | Palette visible |
| AI at drawer | Left pane | **All AI surfaces hidden from bottom bar** |
| Transcription at mini | Bottom bar | Mini anchor visible |
| Transcription at bar | Bottom bar | Bar visible |
| Transcription at palette | Bottom bar | Palette visible |
| Transcription at drawer | Left pane | **All transcription surfaces hidden from bottom bar** |

**Never** are two surfaces for the same module visible simultaneously. At no point do the AI palette (bottom bar) and AI drawer (left pane) coexist. Same for transcription.

---

## 3. Bottom Bar Composition Matrix

The bottom bar's content depends on which modules are currently at bottom-bar tiers vs. drawer tier.

### During Encounter

| Left Pane View | Bottom Bar Content | Bottom Bar Layout |
|---|---|---|
| **Menu** | Transcription bar + AI minibar | Two-module grid (existing spec) |
| **AI Drawer** | Transcription bar only | Single module, full-width |
| **Transcript Drawer** | AI minibar only | Single module, full-width |
| **Pane collapsed** | Transcription bar + AI minibar | Two-module grid (default) |

### Outside Encounter (No Transcription)

| Left Pane View | Bottom Bar Content | Bottom Bar Layout |
|---|---|---|
| **Menu** | AI minibar only | Single module, full-width |
| **AI Drawer** | Nothing | **Bottom bar hidden entirely** |
| **Pane collapsed** | AI minibar only | Single module, full-width |

### Grid Layout Implications

When only one module occupies the bottom bar, it renders at full container width — no grid coordination needed. The CSS Grid `grid-template-columns` simplifies to `1fr`.

When the bottom bar has no content (AI drawer active + no encounter), the entire bottom bar container collapses. This provides maximum canvas space for non-patient-facing work.

---

## 4. De-escalation Rules

De-escalation occurs when a module moves from the drawer (left pane) back to the bottom bar. This happens when:

1. The user switches the left pane to a different view (e.g., AI → Menu)
2. The user collapses the left pane

### Landing Tier

**Rule: Straight to resting tier.** No transient palette state.

| Module | Resting Tier | Rationale |
|---|---|---|
| AI | Minibar | Minibar is the AI module's default state |
| Transcription | Bar | Bar is the transcription module's default state |

### De-escalation by Trigger

| Trigger | Outgoing Module | Lands At |
|---|---|---|
| Tap ☰ (switch to Menu) while AI drawer active | AI | Minibar in bottom bar |
| Tap ☰ (switch to Menu) while Transcript drawer active | Transcription | Bar in bottom bar |
| Tap 🎙 (switch to Transcript) while AI drawer active | AI | Minibar in bottom bar |
| Tap ✦ (switch to AI) while Transcript drawer active | Transcription | Bar in bottom bar |
| Collapse pane while AI drawer active | AI | Minibar in bottom bar |
| Collapse pane while Transcript drawer active | Transcription | Bar in bottom bar |

### Unread Response Handling

If the AI has an unread response when de-escalating from drawer to minibar:

1. Minibar shows the response indicator (existing minibar content type: `response`)
2. User taps minibar → palette opens showing the response
3. User can act on it from palette, or escalate back to drawer

No new behavior needed — the existing minibar → palette response flow handles it naturally.

---

## 5. Escalation Paths

Escalation moves a module from the bottom bar to the left pane drawer.

### AI Module Escalation

| Entry Point | Current State | Action |
|---|---|---|
| **Drawer icon** in palette input row | AI at palette (bottom bar) | Palette collapses → left pane switches to AI drawer |
| **"Continue in drawer ↗"** follow-up action | AI at palette with 2+ messages | Palette collapses → left pane switches to AI drawer |
| **✦ toggle** in pane header | Left pane showing Menu or Transcript | Left pane switches to AI drawer. If AI was at palette, palette collapses first. |
| **⌘K** (when drawer already open) | AI at drawer (left pane) | Focus drawer input field (no escalation needed) |

### Transcription Module Escalation

| Entry Point | Current State | Action |
|---|---|---|
| **[↗] escalation** in transcription palette content zone | Transcription at palette (bottom bar) | Palette collapses → left pane switches to Transcript drawer |
| **🎙 toggle** in pane header | Left pane showing Menu or AI | Left pane switches to Transcript drawer. If transcription was at palette, palette collapses first. |

### Auto-Escalation

**Never auto-escalate.** The palette → drawer transition rearranges the layout. This is always user-initiated. See AI_DRAWER.md §11.

---

## 6. Cross-Surface Mutual Exclusion

### Original Rule (BOTTOM_BAR_SYSTEM.md §3)

> Only one module can be at palette or drawer tier at a time within the bottom bar.

### Updated Rule

The original mutual exclusion applies **per surface**. Modules on different surfaces do not conflict.

| State | Allowed? | Reason |
|---|---|---|
| AI palette (bottom) + Transcript palette (bottom) | ✗ | Same surface — original rule applies |
| AI drawer (left pane) + Transcript bar (bottom) | ✓ | Different surfaces |
| AI drawer (left pane) + Transcript palette (bottom) | ✓ | Different surfaces |
| Transcript drawer (left pane) + AI minibar (bottom) | ✓ | Different surfaces |
| Transcript drawer (left pane) + AI palette (bottom) | ✓ | Different surfaces |
| AI drawer (left pane) + Transcript drawer (left pane) | ✗ | Same surface — only one pane view at a time |

### Practical Scenario

AI drawer is open in the left pane. User taps the transcription bar in the bottom bar to open the transcription palette. This is **allowed**:

- AI stays in the left pane (drawer tier)
- Transcription palette expands in the bottom bar
- The bottom bar only has the transcription module (AI is suppressed from bottom bar)
- No grid conflict — palette expands from the full-width transcription bar

The user is simultaneously viewing the full AI conversation (left pane) and peeking at the transcript preview (bottom bar palette). If they want more transcript detail, tapping [↗] or 🎙 switches the left pane to Transcript drawer — which de-escalates AI to minibar in the bottom bar.

---

## 7. Transition Sequences

All transitions between drawer and bottom bar tiers follow a clean sequential pattern. Both surfaces for the same module are **never visible simultaneously**.

### Palette → Drawer (Escalation)

```
T=0ms:    Palette begins collapsing (200ms ease-in)
T=200ms:  Palette fully collapsed. Module invisible for a moment.
T=200ms:  Bottom bar grid transitions (200ms) — may change column count
T=200ms:  Left pane content swaps to drawer view (content swap, no animation)
T=500ms:  Settled. Module visible in left pane. Bottom bar reconfigured.
```

Total perceived duration: ~400-500ms.

### Drawer → Minibar/Bar (De-escalation)

```
T=0ms:    Left pane content swaps to target view (Menu, AI, or Transcript)
T=0ms:    Bottom bar grid transitions (200ms) — column count may change
T=100ms:  Module appears at resting tier in bottom bar (fade in, 150ms)
T=300ms:  Settled. Module visible in bottom bar. Left pane showing new view.
```

Total perceived duration: ~300ms. Faster than escalation because there's no collapse step.

### Direct Switch (AI Drawer → Transcript Drawer)

```
T=0ms:    Left pane content swaps from AI to Transcript
T=0ms:    Bottom bar: AI minibar fades in, transcription bar fades out (200ms crossfade)
T=200ms:  Settled. AI at minibar in bottom bar. Transcription in left pane.
```

Both modules change simultaneously but on different surfaces — no conflict.

---

## 8. Keyboard Shortcuts

### ⌘K — AI Quick Access

| Current State | ⌘K Action |
|---|---|
| Left pane showing Menu | Open AI palette in bottom bar, focus input |
| Left pane showing AI drawer | Focus drawer input field |
| Left pane showing Transcript | Open AI palette in bottom bar, focus input |
| Left pane collapsed | Open AI palette in bottom bar, focus input |
| AI palette already open | Focus palette input field |

**Rule:** ⌘K finds the highest-density AI surface currently visible and focuses its input. If no AI surface is expanded, it opens the palette in the bottom bar.

### Escape

| Current State | Escape Action |
|---|---|
| AI palette open (bottom bar) | Collapse to minibar |
| Transcript palette open (bottom bar) | Collapse to bar |
| AI drawer (left pane), input focused | Blur input |
| AI drawer (left pane), input not focused | No action |
| Transcript drawer (left pane) | No action |

**Rule:** Escape never closes a left pane view. Within the left pane, it only manages focus — blurs active inputs, dismisses inline popovers or confirmations.

---

## 9. Edge Cases

### Pane Collapse While Module at Drawer

When the user collapses the left pane while a drawer is active:

1. Module de-escalates to resting tier in bottom bar (§4)
2. Bottom bar grid reconfigures to accommodate the returning module
3. Pane collapse animation runs simultaneously

When the user re-expands the pane:

1. Pane opens to Menu view (per LEFT_PANE_SYSTEM.md §4)
2. Module remains at its current bottom bar tier
3. User can switch to the drawer view via the toggle icon if desired

### AI Drawer + No Encounter = Empty Bottom Bar

When the AI drawer is active and there's no encounter (no transcription module), the bottom bar has no content. The bottom bar container should collapse/hide entirely, providing maximum workspace area.

When the user switches away from the AI drawer (back to Menu), the AI minibar reappears and the bottom bar container returns.

### Session Ends While Viewing Transcript Drawer

If the transcription session is finalized while the user is viewing the transcript drawer:

1. Transcript remains viewable (don't yank the user out of the view)
2. Controls footer updates to reflect finalized state (no Pause/Resume)
3. View indicator pill changes to appropriate state
4. 🎙 icon remains in pane header until the user navigates away
5. On navigation away, 🎙 icon fades out and transcript view becomes unavailable

### Both Modules at Resting Tier — Default State

When neither module is at drawer tier (both in bottom bar), the system behaves exactly as defined in BOTTOM_BAR_SYSTEM.md — two-module grid, mutual exclusion at palette tier, mini anchor system for direct switching. No changes to existing behavior.

---

## 10. State Model Updates

### Extended Tier Type

The existing `TierState` type gains the `drawer` option, which signals rendering in the left pane rather than the bottom bar:

```typescript
type TierState = 'mini' | 'bar' | 'palette' | 'drawer';
```

### Module Visibility Derivation

Given the left pane state and module tiers, derive what's visible in the bottom bar:

```typescript
interface BottomBarVisibility {
  ai: {
    visible: boolean;
    tier: Exclude<TierState, 'drawer'> | null;
  };
  transcription: {
    visible: boolean;
    tier: Exclude<TierState, 'drawer'> | null;
  };
  layout: 'two-column' | 'single-column' | 'hidden';
}

function deriveBottomBarVisibility(
  aiTier: TierState,
  transcriptionTier: TierState | null, // null = no session
  inEncounter: boolean,
): BottomBarVisibility {
  const aiInDrawer = aiTier === 'drawer';
  const txInDrawer = transcriptionTier === 'drawer';

  const aiVisible = !aiInDrawer;
  const txVisible = transcriptionTier !== null && !txInDrawer && inEncounter;

  const aiBottomTier = aiVisible ? (aiTier as Exclude<TierState, 'drawer'>) : null;
  const txBottomTier = txVisible ? (transcriptionTier as Exclude<TierState, 'drawer'>) : null;

  let layout: 'two-column' | 'single-column' | 'hidden';
  if (aiVisible && txVisible) layout = 'two-column';
  else if (aiVisible || txVisible) layout = 'single-column';
  else layout = 'hidden';

  return {
    ai: { visible: aiVisible, tier: aiBottomTier },
    transcription: { visible: txVisible, tier: txBottomTier },
    layout,
  };
}
```

### Coordination Actions

New actions for drawer-related coordination:

```typescript
type DrawerCoordinationAction =
  | { type: 'MODULE_ESCALATED_TO_DRAWER'; payload: { module: 'ai' | 'transcription' } }
  | { type: 'MODULE_DE_ESCALATED_FROM_DRAWER'; payload: { module: 'ai' | 'transcription' } };
```

These actions trigger:
1. Setting the module's tier to `drawer` (or back to resting tier)
2. Recalculating bottom bar visibility
3. Updating left pane active view

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-06 | Initial specification — coordination rules, composition matrix, transition sequences, state model updates |
