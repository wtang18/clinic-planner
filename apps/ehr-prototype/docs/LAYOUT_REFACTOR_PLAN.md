# EHR Prototype Layout Refactor (Apple OS 26 Style)

## Overview

Refactor layout to match Apple OS 26 conventions with **two distinct elevation layers**:

1. **Floating Layer (glassmorphic):** Top nav controls + Menu Pane
2. **Content Surface:** Patient Overview Pane + Canvas

The Menu Pane is NOT on the content surface—it floats above and is conceptually the same element as the menu toggle button (just in expanded form).

**Reference:** Wireframes at `resources/layout-wireframe/`

---

## Target Architecture

### Elevation Hierarchy

| Level | Elements | Style |
|-------|----------|-------|
| **Floating** | Top nav control row + Menu Pane | Glassmorphic, blur, shadow |
| **Content Surface** | Patient Overview Pane + Canvas | Solid surface below floating |
| **Minibar** | Recording controls | Floating, bottom-right |

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░ FLOATING LAYER (glassmorphic) ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌──────────────┬───────────────────────────────────────────────────────────┐ │
│ │ [●●●]        │                                                           │ │
│ │ [🔍]         │  [Patient context when overview closed]    [💬][📤][⋯]   │ │
│ │              │                      [<] [☐△]                             │ │
│ │       [☐̲̲]   │  ← menu toggle in upper-right of menu pane when open     │ │
│ │  Menu Pane   │         (transparent - content shows through)             │ │
│ │  (expanded)  │                                                           │ │
│ │  ─────────   │                                                           │ │
│ │  Home        │                                                           │ │
│ │  Visits      │                                                           │ │
│ │  Agent       │                                                           │ │
│ │  To Do    27 │                                                           │ │
│ └──────────────┴───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓ (elevation gap)
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT SURFACE                                     │
│ ┌───────────────────────┐ ┌──────────────────────────────────────────────┐  │
│ │  Patient Overview     │ │              Canvas                          │  │
│ │  (on surface)         │ │              (on surface)                    │  │
│ └───────────────────────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                                              ┌───────────────┐
                                                              │    Minibar    │
                                                              └───────────────┘
```

### Control Button Legend

| Icon | Name | Controls | Behavior |
|------|------|----------|----------|
| `[☐̲̲]` | Menu toggle (pane w/ dots) | Floating Menu Pane | **Inside menu pane** when open, **in nav row** when closed |
| `[☐△]` | Overview toggle (pane w/ triangle) | Patient Overview Pane | Always in floating nav row |
| `[<]` | Back chevron | Canvas navigation | Always in floating nav row (canvas zone) |
| `[Capture▾]` | Mode selector | Canvas view mode | **Contextual** - appears in floating nav row when working on encounter |
| `[💬]` | AI/Chat | AI Drawer | Always in floating nav row (right zone) |

### Contextual Controls in Floating Nav Row

The floating nav row supports **contextual controls** that appear based on what's being worked on:

| Context | Contextual Controls |
|---------|---------------------|
| **Encounter** | Mode selector (Capture / Process / Review) |
| **Other work** | TBD - appropriate controls for that work type |

These controls live in the floating layer, NOT embedded in the canvas content below.

### Key Insight: Menu Pane IS the Menu Button

When **closed**: Menu toggle button appears in floating nav row (left zone)
When **open**: Menu pane "grows" from button; toggle moves to upper-right corner OF the menu pane

This is one conceptual element in two visual states, not two separate elements.

---

## State Mapping (4 Combinations)

### State 1: Menu OPEN + Patient Overview OPEN
```
FLOATING LAYER:
┌──────────────┬─────────────────────────┬──────────────────────────┬─────────────┐
│ [●●●]        │ Patient Name            │                          │             │
│ [🔍]         │ MRN · DOB      [≡]      │  [<] [☐△]  [Capture ▾]   │ [💬][📤][⋯] │
│ [☐△]     [☐̲̲]│ (overview header)       │  (canvas controls)       │             │
├──────────────┤                         │                          │             │
│  Menu Pane   │    (glass/transparent)  │                          │             │
│  content...  │                         │                          │             │
└──────────────┴─────────────────────────┴──────────────────────────┴─────────────┘

CONTENT SURFACE (margin-left to avoid menu overlap):
               ┌─────────────────────────┬────────────────────────────────────┐
               │   Patient Overview      │         Canvas                     │
               └─────────────────────────┴────────────────────────────────────┘
```
- Menu toggle `[☐̲̲]` is in **upper-right corner of menu pane**
- Overview toggle `[☐△]` in left zone of nav row (below menu toggle)
- Mode selector `[Capture ▾]` in canvas zone (contextual for encounters)

### State 2: Menu OPEN + Patient Overview CLOSED
```
FLOATING LAYER:
┌──────────────┬──────────────────────────────────────────────────┬─────────────┐
│ [●●●]        │                                                  │             │
│ [🔍]         │     Patient Name · MRN · DOB   [Capture ▾]       │ [💬][📤][⋯] │
│ [☐△]     [☐̲̲]│              [<] [☐△]                            │             │
├──────────────┤                                                  │             │
│  Menu Pane   │         (glass/transparent)                      │             │
│  content...  │                                                  │             │
└──────────────┴──────────────────────────────────────────────────┴─────────────┘

CONTENT SURFACE:
               ┌──────────────────────────────────────────────────────────────┐
               │                        Canvas                                │
               └──────────────────────────────────────────────────────────────┘
```
- Patient identity moves to center of floating layer (above canvas)
- Overview toggle `[☐△]` appears in canvas zone to re-open
- Mode selector remains in canvas zone

### State 3: Menu CLOSED + Patient Overview OPEN
```
FLOATING LAYER:
┌─────┬─────────────────────────┬──────────────────────────────────┬─────────────┐
│     │ Patient Name            │                                  │             │
│[☐̲̲] │ MRN · DOB      [≡]      │  [<] [☐△]       [Capture ▾]      │ [💬][📤][⋯] │
│[☐△]│                         │                                  │             │
└─────┴─────────────────────────┴──────────────────────────────────┴─────────────┘

CONTENT SURFACE (full width):
┌─────────────────────────┬────────────────────────────────────────────────────┐
│   Patient Overview      │              Canvas                                │
└─────────────────────────┴────────────────────────────────────────────────────┘
```
- Menu collapsed → toggle `[☐̲̲]` in nav row (far left)
- Content surface expands to fill space

### State 4: Menu CLOSED + Patient Overview CLOSED
```
FLOATING LAYER:
┌─────┬────────────────────────────────────────────────────────────┬─────────────┐
│     │                                                            │             │
│[☐̲̲] │       Patient Name · MRN · DOB        [Capture ▾]          │ [💬][📤][⋯] │
│[☐△]│                    [<] [☐△]                                │             │
└─────┴────────────────────────────────────────────────────────────┴─────────────┘

CONTENT SURFACE:
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Canvas                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```
- Maximum canvas space
- All toggles stacked on left edge of nav row
- Mode selector in canvas zone

---

## Current vs. Target Gap Analysis

| Aspect | Current Implementation | Target (Wireframes) |
|--------|------------------------|---------------------|
| **Elevation model** | All panes on same surface | Two layers: floating + content |
| **Menu pane** | CollapsiblePane on content surface | Floating, glassmorphic, above content |
| **Menu toggle** | Always in UnifiedHeaderRow | Inside menu pane when open |
| **Nav controls** | Unified header row (correct concept) | Same, but menu portion floats |
| **Patient identity** | In PatientOverviewPane header | Migrates to nav row when pane closed |
| **Mode selector** | In FloatingHeader (canvas content) | In floating nav row (canvas zone) |
| **Visual style** | Solid backgrounds | Glassmorphic blur on floating layer |

---

## Implementation Phases

### Phase 1: Floating Layer Architecture

**Goal:** Restructure layout into two elevation layers.

#### Changes to `AdaptiveLayout.tsx`
- Split into `FloatingLayer` and `ContentSurface` containers
- FloatingLayer contains: nav controls + MenuPane (when open)
- ContentSurface contains: PatientOverviewPane + CanvasPane
- ContentSurface gets `marginLeft` when menu open (keeps content visible)

#### Changes to `MenuPane.tsx`
- Add glassmorphic styling (blur, transparency, shadow)
- Move menu toggle button INTO the pane (upper-right corner)
- When collapsed, MenuPane disappears entirely (toggle moves to nav row)

#### New: `FloatingNavRow.tsx`
Replace/refactor `UnifiedHeaderRow.tsx`:
- Part of floating layer (same elevation as menu pane)
- Glassmorphic style
- Dynamic slot content based on pane states
- **Contextual controls slot** in canvas zone (e.g., ModeSelector for encounters)

#### Styling Updates
- Add glassmorphic tokens: `backdrop-filter: blur(20px)`, `rgba(255,255,255,0.8)`
- Shadow for floating layer: `shadows.lg` or custom
- Z-index: floating layer above content surface

### Phase 2: Menu Pane Refactor

**Goal:** Menu pane becomes floating, toggle lives inside when open.

#### MenuPane Changes
1. Remove from CollapsiblePane wrapper
2. Apply floating styles directly
3. Add internal header with:
   - Search icon (left)
   - Menu toggle button (right) → closes menu
4. Position: fixed/absolute, left edge, below nav row top zone

#### State Logic
```typescript
// When menu open:
// - MenuPane renders with internal toggle
// - Nav row left zone shows: [overview toggle] only
// - Content surface has left margin

// When menu closed:
// - MenuPane hidden
// - Nav row left zone shows: [menu toggle] [overview toggle]
// - Content surface full width
```

### Phase 3: Patient Identity Migration

**Goal:** Patient name/MRN moves to nav row when overview pane closed.

#### Changes to `FloatingNavRow.tsx`
- Center slot content is dynamic:
  - Overview OPEN: Empty or encounter context only
  - Overview CLOSED: Patient identity (name, MRN, DOB) + back chevron + overview toggle

#### Changes to `PatientOverviewPane.tsx`
- Header content remains for when pane is open
- No changes to internal structure

### Phase 4: Glassmorphic Styling

**Goal:** Apply Apple-style blur/transparency to floating layer.

#### New tokens in `src/styles/foundations/`
```typescript
// glass.ts
export const glass = {
  background: 'rgba(255, 255, 255, 0.72)',
  backgroundDark: 'rgba(30, 30, 30, 0.72)',
  blur: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};
```

#### Apply to:
- FloatingNavRow
- MenuPane (when open)
- Ensure content surface has solid background (doesn't show through)

### Phase 5: Content Margin Behavior

**Goal:** Content surface adjusts when menu open.

#### Behavior
- Initial: Content surface has `marginLeft: menuWidth` when menu open
- Transition: Smooth animation when menu opens/closes
- Future: Remove margin for infinite canvas (content flows under menu)

---

## Files to Modify

### Core Layout (Major Changes)
| File | Changes |
|------|---------|
| `AdaptiveLayout.tsx` | Split into FloatingLayer + ContentSurface |
| `UnifiedHeaderRow.tsx` → `FloatingNavRow.tsx` | Rename, add glassmorphic, dynamic slots |
| `MenuPane.tsx` | Floating style, internal toggle, remove CollapsiblePane |
| `LayoutStateContext.tsx` | Add `isMenuToggleInPane` derived state |

### Styling
| File | Changes |
|------|---------|
| `src/styles/foundations/glass.ts` | New - glassmorphic tokens |
| `src/styles/foundations/index.ts` | Export glass tokens |

### Minor Updates
| File | Changes |
|------|---------|
| `PatientOverviewPane.tsx` | No structural changes, ensure header works standalone |
| `CollapsiblePane.tsx` | Remove menu-specific logic, keep for overview only |
| `ModeSelector.tsx` | Move from canvas FloatingHeader to FloatingNavRow |
| `FloatingHeader.tsx` | Remove ModeSelector, simplify to just encounter context |

---

## Verification Plan

### Visual Checks (all 4 states)
- [ ] Menu OPEN + Overview OPEN: Menu floats, toggle in pane, content has margin
- [ ] Menu OPEN + Overview CLOSED: Patient name in nav center, toggle in pane
- [ ] Menu CLOSED + Overview OPEN: Toggle in nav row, content full width
- [ ] Menu CLOSED + Overview CLOSED: Both toggles in nav row, max canvas

### Interaction Checks
- [ ] Clicking menu toggle (in pane) closes menu
- [ ] Clicking menu toggle (in nav row) opens menu
- [ ] Keyboard shortcuts still work (Cmd+\, Cmd+Shift+\)
- [ ] Patient identity correctly shows/hides based on overview state

### Style Checks
- [ ] Floating layer has blur effect
- [ ] Content visible through glassmorphic background
- [ ] Shadow creates clear elevation distinction
- [ ] Smooth transitions on open/close

---

## Execution Order

```
Phase 1 ─── FloatingLayer + ContentSurface split
    │
Phase 2 ─── MenuPane floating + internal toggle
    │
Phase 3 ─── Patient identity migration
    │
Phase 4 ─── Glassmorphic styling
    │
Phase 5 ─── Content margin behavior
```

Each phase builds on the previous. No parallelization recommended due to interdependencies.
