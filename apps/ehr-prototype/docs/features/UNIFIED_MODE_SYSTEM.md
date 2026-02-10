# Unified Mode System — State Coordination Reference

**Last Updated:** 2026-02-07
**Status:** Reference Document — Consolidates LEFT_PANE_SYSTEM.md, BOTTOM_BAR_SYSTEM.md, DRAWER_COORDINATION.md
**Purpose:** Single source of truth for the 4-mode tier system and cross-surface coordination

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [4-Mode Tier Hierarchy](#2-4-mode-tier-hierarchy)
3. [State Ownership](#3-state-ownership)
4. [Coordination Rules](#4-coordination-rules)
5. [Key Interaction Flows](#5-key-interaction-flows)
6. [Component Wiring](#6-component-wiring)
7. [Common Bugs & Fixes](#7-common-bugs--fixes)

---

## 1. System Overview

The clinical workspace has two UI surfaces for AI and Transcription modules:

| Surface | Location | Tiers Available |
|---------|----------|-----------------|
| **Bottom Bar** | Fixed at bottom of viewport | mini, bar, palette |
| **Left Pane** | Floating sidebar | drawer (via pane views) |

**Core Principle:** Each module (AI, Transcription) renders at exactly ONE tier at any time. When in drawer tier (left pane), that module is **completely hidden** from the bottom bar.

---

## 2. 4-Mode Tier Hierarchy

```
drawer > palette > bar > mini
```

### Tier Definitions

| Tier | Surface | Size | Description |
|------|---------|------|-------------|
| **mini** | Bottom Bar | 48px | Compressed icon anchor; appears when other module is at palette |
| **bar** | Bottom Bar | 160px (TM) / 320px (AI) | Default resting state; controls directly actionable |
| **palette** | Bottom Bar | 432px | Expanded view with additional controls/content |
| **drawer** | Left Pane | Full pane width | Full-featured view; module hidden from bottom bar |

### Resting Tiers (De-escalation Targets)

| Module | Resting Tier | Rationale |
|--------|--------------|-----------|
| AI | bar | AI bar is the default presence |
| Transcription | bar | Transcription bar is the default presence |

**Important:** `mini` is NEVER a resting tier. Modules only go to mini when forced by the other module expanding to palette.

---

## 3. State Ownership

### Single Source of Truth

| State | Owner | Hook |
|-------|-------|------|
| Left Pane `isExpanded` | LeftPaneState | `useLeftPane()` |
| Left Pane `activeView` | LeftPaneState | `useLeftPane()` |
| AI tier (`mini\|bar\|palette\|drawer`) | BottomBarState | `useTierControls()` |
| Transcription tier | BottomBarState | `useTierControls()` |

### Coordination Layer

The `useDrawerCoordination()` hook provides **coordinated actions** that update BOTH state systems atomically:

```typescript
interface CoordinatedActions {
  switchView(view: PaneView): void;    // Updates pane view + adjusts tiers
  collapse(): void;                     // Collapses pane + resets tiers to bar
  expand(): void;                       // Expands pane (opens to menu)
  escalateAIToDrawer(): void;          // AI palette → drawer
  escalateTranscriptionToDrawer(): void;
}
```

**Rule:** Components should use `coordinationActions` instead of direct state updates when the action affects both surfaces.

---

## 4. Coordination Rules

### Rule 1: One Module, One Surface

A module is EITHER in the bottom bar OR in the left pane drawer, never both.

| Module Tier | Renders In | Bottom Bar Presence |
|-------------|------------|---------------------|
| mini, bar, palette | Bottom Bar | Visible at that tier |
| drawer | Left Pane | **Completely hidden** from bottom bar |

### Rule 2: Bottom Bar Mutual Exclusion

Only one module can be at palette tier in the bottom bar at a time.

| Opening | Other Module |
|---------|--------------|
| AI palette | TM → mini |
| TM palette | AI → mini |

### Rule 3: Cross-Surface Combinations ARE Allowed

Drawer (left pane) + Palette (bottom bar) for different modules is valid:

| Allowed | AI | TM |
|---------|----|----|
| ✓ | drawer | bar |
| ✓ | drawer | palette |
| ✓ | bar | drawer |
| ✓ | palette | drawer |
| ✗ | drawer | drawer |

### Rule 4: De-escalation on Pane Collapse

When the left pane collapses while a drawer is active:

1. Active drawer module de-escalates to `bar` (resting tier)
2. Other module stays at its current tier (but if it was mini due to palette, stays at bar)
3. Both modules become visible in bottom bar

**Critical:** The collapse button in AdaptiveLayout MUST call `coordinationActions.collapse()`, not just toggle the pane visibility.

### Rule 5: Re-expand Always Opens to Menu

When pane re-expands after collapse:
- `activeView` resets to `'menu'`
- Module tiers are NOT changed (they stay at bar/mini)
- User must explicitly tap view icon to enter drawer view again

---

## 5. Key Interaction Flows

### Flow A: User Clicks Collapse Button (◧)

```
User clicks ◧ in pane header
    ↓
coordinationActions.collapse() called
    ↓
├── Sets aiTier = 'bar' (if was drawer)
├── Sets transcriptionTier = 'bar' (if was drawer)
├── Sets activeView = 'menu'
└── Sets isExpanded = false
    ↓
Bottom bar shows both modules at bar tier
Pane slides off-screen
```

### Flow B: User Switches View (☰ → ✦)

```
User taps ✦ (AI icon) while viewing Menu
    ↓
coordinationActions.switchView('ai') called
    ↓
├── Sets aiTier = 'drawer'
├── Sets transcriptionTier = 'bar' (de-escalate if was drawer)
└── Sets activeView = 'ai'
    ↓
Bottom bar: AI hidden, TM at bar (full-width)
Left pane: Shows AI drawer content
```

### Flow C: User Escalates from Palette to Drawer

```
User clicks [↗] in AI palette
    ↓
coordinationActions.escalateAIToDrawer() called
    ↓
├── Sets aiTier = 'drawer'
├── Sets transcriptionTier = 'bar'
├── Sets isExpanded = true (if collapsed)
└── Sets activeView = 'ai'
    ↓
Bottom bar: AI hidden, TM at bar
Left pane: Opens/switches to AI drawer
```

---

## 6. Component Wiring

### AdaptiveLayout

The MenuToggleButton (◧) in the pane header MUST be wired to coordination:

```tsx
// AdaptiveLayout.tsx
<MenuToggleButton
  onClick={() => {
    // WRONG: togglePane('menu') - only updates pane visibility
    // RIGHT: Call coordinated collapse
    if (onPaneCollapse) {
      onPaneCollapse();
    }
  }}
/>

// Props interface
interface AdaptiveLayoutProps {
  onPaneCollapse?: () => void;  // Wire to coordinationActions.collapse
}
```

### CaptureView

Wire coordination actions to AdaptiveLayout:

```tsx
// CaptureView.tsx
const { actions: coordinationActions } = useDrawerCoordination();

<AdaptiveLayout
  onPaneCollapse={coordinationActions.collapse}
  menuPaneHeaderContent={
    <ViewIconsRow
      activeView={paneState.activeView}
      onViewChange={coordinationActions.switchView}
    />
  }
/>
```

### BottomBarContainer

Must handle drawer tier by hiding modules:

```tsx
// Visibility: hidden if in drawer
const showAI = aiTier !== 'drawer';
const showTM = transcriptionTier !== 'drawer';

// Grid layout adjusts:
// - Both visible: two-column grid
// - One visible: single-column, full-width
// - Neither visible: container hidden entirely
```

---

## 7. Common Bugs & Fixes

### Bug: Pane collapse doesn't reset bottom bar tiers

**Symptom:** After opening AI drawer and clicking collapse, AI module doesn't appear in bottom bar.

**Cause:** Collapse button calls `togglePane('menu')` instead of `coordinationActions.collapse()`.

**Fix:** Wire `onPaneCollapse` prop to `coordinationActions.collapse()`.

### Bug: Bottom bar clips shadows during animation

**Symptom:** Module shadows get clipped during tier transitions.

**Cause:** `overflow: hidden` on grid wrapper is too aggressive.

**Fix:** Only apply `overflow: hidden` during animation (use animation state tracking), or ensure shadows don't overflow.

### Bug: Both modules stuck at mini tier

**Symptom:** After palette interaction, both modules show as mini anchors.

**Cause:** Tier state not reset when palette collapses.

**Fix:** Use `effectiveTier` calculation that enforces "if neither is at palette/drawer, both are bar":
```tsx
const effectiveAITier = tmExpanded ? 'mini' : (aiExpanded ? aiTier : 'bar');
const effectiveTMTier = aiExpanded ? 'mini' : (tmExpanded ? transcriptionTier : 'bar');
```

### Bug: Module re-appears in bottom bar while still in drawer

**Symptom:** AI appears in bottom bar even though AI drawer is open.

**Cause:** `showAI` calculation doesn't check for drawer tier.

**Fix:** `const showAI = aiTier !== 'drawer';`

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-07 | Initial consolidation from existing specs |
