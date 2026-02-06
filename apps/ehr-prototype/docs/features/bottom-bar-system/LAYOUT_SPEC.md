# Bottom Bar System Specification

> **Purpose:** Canonical reference for bottom bar layout, dimensions, and animation behavior.
> **Status:** Active specification - refer to this document for implementation requirements.

---

## 1. Core Constraints

### 1.1 Fixed Total Width
**The bottom bar total width must ALWAYS be exactly 488px across all states and during all transitions.**

### 1.2 Component Dimensions

| Component | Width | Height |
|-----------|-------|--------|
| TranscriptionBar | 160px | 48px |
| TranscriptionMini | 48px | 48px |
| AIMinibar | 320px | 48px |
| AIMini | 48px | 48px |
| AIPalette (expanded) | 432px | auto (content-driven) |
| TranscriptionPalette (expanded) | 432px | auto |
| Gap between modules | 8px | - |

### 1.3 Width Math

```
Bar State:       160 + 8 + 320 = 488px
AI Expanded:      48 + 8 + 432 = 488px
Trans Expanded:  432 + 8 + 48  = 488px
```

---

## 2. Visual States

### 2.1 State 1: Both at Bar (Default)

```
┌──────────────────────────────────────────────────┐
│  ┌─────────────────┐ 8px ┌────────────────────┐  │
│  │ TranscriptionBar│ gap │    AIMinibar       │  │
│  │    160px        │     │      320px         │  │
│  └─────────────────┘     └────────────────────┘  │
│                                                  │
│  Total: 160 + 8 + 320 = 488px                    │
└──────────────────────────────────────────────────┘
```

### 2.2 State 2: AI Expanded (Palette Open)

```
┌──────────────────────────────────────────────────┐
│  ┌────┐ 8px ┌──────────────────────────────────┐ │
│  │mini│ gap │        AIPaletteInline           │ │
│  │48px│     │           432px                  │ │
│  └────┘     │  ┌────────────────────────────┐  │ │
│             │  │ Context header             │  │ │
│             │  │ Suggestions                │  │ │
│             │  │ Input area                 │  │ │
│             │  └────────────────────────────┘  │ │
│             └──────────────────────────────────┘ │
│                                                  │
│  Total: 48 + 8 + 432 = 488px                     │
└──────────────────────────────────────────────────┘
```

### 2.3 State 3: Transcription Expanded

```
┌──────────────────────────────────────────────────┐
│  ┌──────────────────────────────────┐ 8px ┌────┐ │
│  │    TranscriptionPalette          │ gap │mini│ │
│  │         432px                    │     │48px│ │
│  │  ┌────────────────────────────┐  │     └────┘ │
│  │  │ Transcript content         │  │            │
│  │  └────────────────────────────┘  │            │
│  └──────────────────────────────────┘            │
│                                                  │
│  Total: 432 + 8 + 48 = 488px                     │
└──────────────────────────────────────────────────┘
```

---

## 3. Baseline Alignment

**All components must share the same baseline (bottom-aligned).**

```
                                    ┌─────────────┐
                                    │             │
                                    │   Palette   │
                                    │   (tall)    │
┌────┐    ┌──────────────────┐      │             │
│mini│    │     Minibar      │      │             │
└────┴────┴──────────────────┴──────┴─────────────┘
  ▲              ▲                        ▲
  └──────────────┴────────────────────────┘
              SHARED BASELINE
```

---

## 4. Animation State Machine

### 4.1 States

```typescript
type AnimationStage =
  | 'stable'            // At rest (minibar or palette)
  | 'expanding-width'   // Stage 1 of expand: width animating
  | 'expanding-height'  // Stage 2 of expand: height animating
  | 'collapsing-height' // Stage 1 of collapse: height animating
  | 'collapsing-width'  // Stage 2 of collapse: width animating
```

### 4.2 State Flow Diagram

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│   MINIBAR   │ ──────► │ EXPANDING_WIDTH │ ──────► │   PALETTE   │
│  (stable)   │         │   (stage 1)     │         │  (stable)   │
└─────────────┘         └─────────────────┘         └─────────────┘
       ▲                        │                          │
       │                        ▼                          ▼
       │                ┌─────────────────┐         ┌─────────────────┐
       └─────────────── │ COLLAPSING_WIDTH│ ◄────── │COLLAPSING_HEIGHT│
                        │   (stage 2)     │         │   (stage 1)     │
                        └─────────────────┘         └─────────────────┘
```

---

## 5. 2-Stage Animation Sequences

### 5.1 Expand: Minibar → Palette

**Stage 1: Width Expansion (150ms)**
- AI width: 320px → 432px
- Transcription width: 160px → 48px
- Height: stays at 48px
- Minibar content: fades OUT

**Stage 2: Height Expansion (200ms)**
- Width: stays at 432px
- Height: 48px → auto
- Palette content: fades IN

```
BEFORE                              AFTER STAGE 1                    AFTER STAGE 2
┌─────────────────┐ ┌────────────┐  ┌────┐ ┌────────────────────┐   ┌────┐ ┌────────────────────┐
│ TranscriptionBar│ │  AIMinibar │  │mini│ │  AI (wide, short)  │   │mini│ │    AIPalette       │
│    160px        │ │   320px    │  │48px│ │      432px         │   │48px│ │      432px         │
└─────────────────┘ └────────────┘  └────┘ └────────────────────┘   └────┘ │  ┌──────────────┐  │
                                           height: 48px                     │  │ Content      │  │
                                                                            │  └──────────────┘  │
                                                                            └────────────────────┘
                                                                            height: ~300px
```

### 5.2 Collapse: Palette → Minibar

**Stage 1: Height Collapse (200ms)**
- Height: auto → 48px
- Width: stays at 432px
- Palette content: fades OUT

**Stage 2: Width Collapse (150ms)**
- AI width: 432px → 320px
- Transcription width: 48px → 160px
- Minibar content: fades IN

```
BEFORE                              AFTER STAGE 1                    AFTER STAGE 2
┌────┐ ┌────────────────────┐      ┌────┐ ┌────────────────────┐   ┌─────────────────┐ ┌────────────┐
│mini│ │    AIPalette       │      │mini│ │  AI (wide, short)  │   │ TranscriptionBar│ │  AIMinibar │
│48px│ │      432px         │      │48px│ │      432px         │   │    160px        │ │   320px    │
└────┘ │  ┌──────────────┐  │      └────┘ └────────────────────┘   └─────────────────┘ └────────────┘
       │  │ Content      │  │             height: 48px
       │  └──────────────┘  │
       └────────────────────┘
       height: ~300px
```

---

## 6. Content Fade Rules

| Animation Stage | Minibar Content | Palette Content |
|-----------------|-----------------|-----------------|
| `stable` (bar) | opacity: 1 | N/A |
| `expanding-width` | opacity: 0 (fading out) | opacity: 0 (hidden) |
| `expanding-height` | N/A | opacity: 1 (fading in) |
| `stable` (palette) | N/A | opacity: 1 |
| `collapsing-height` | N/A | opacity: 0 (fading out) |
| `collapsing-width` | opacity: 1 (fading in) | opacity: 0 (hidden) |

**Key principle:** Content fades OUT before its container shrinks, fades IN after its container expands.

---

## 7. Implementation Constants

```typescript
// BottomBarContainer.tsx
const WIDTHS = {
  transcription: { bar: 160, mini: 48 },
  ai: { bar: 320, mini: 48, expanded: 432 },
  gap: 8,
  total: 488,
} as const;

// AISurfaceModule.tsx
const BAR_WIDTH = 320;
const BAR_HEIGHT = 48;
const EXPANDED_WIDTH = 432;

// Animation timing
const STAGE_1_DURATION = 0.15; // 150ms - width animations
const STAGE_2_DURATION = 0.2;  // 200ms - height animations
const CONTENT_FADE_DURATION = 0.1; // 100ms - content fades
```

---

## 8. Grid Column Mapping

| Animation Stage | Grid Template Columns |
|-----------------|----------------------|
| `stable` (bar) | `160px 320px` |
| `expanding-width` | `48px 432px` |
| `expanding-height` | `48px 432px` |
| `stable` (palette) | `48px 432px` |
| `collapsing-height` | `48px 432px` |
| `collapsing-width` | `160px 320px` |

---

## 9. AIPaletteInline Content Structure

### 9.1 Visual Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────┐
│ ─────────────── DragHandle ─────────────────        │ 32px tap target
├─────────────────────────────────────────────────────┤
│ ↳ Patient Name · Context Label           [X]       │ ContextTargetHeader
├─────────────────────────────────────────────────────┤
│                                                     │
│ SUGGESTED ACTIONS (section header, 11px uppercase) │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💡 Action label                    [Add][Dismiss]│ │ SuggestionRow (up to 3)
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💡 Other suggestion              [Add][Dismiss]+N│ │ SuggestionRow (single, with +N)
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ─── OR (when no suggestions) ───                   │
│                                                     │
│ [Generate Note] [Check Interactions]               │ QuickAction chips
│                                                     │
│ ─── OR (empty state) ───                           │
│                                                     │
│           ✨ AI assistance available               │
│        Ask a question or wait for suggestions      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Ask AI...                                       │ │ AIInputArea
│ │ [🎤]                               [📄] [➤]   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 9.2 Component Hierarchy

```
AIPaletteInline (motion.div, 432px wide)
├── Content Wrapper (motion.div, handles opacity fade)
│   ├── DragHandle
│   │   └── SVG polyline (flat → chevron on hover)
│   │   └── onClick → triggers collapse animation
│   │
│   ├── ContextTargetHeader
│   │   ├── CornerDownRight icon (↳)
│   │   ├── Patient name + context label
│   │   └── X button (clears context, NOT dismiss palette)
│   │
│   ├── Content Area (scrollable)
│   │   ├── Action Suggestions Section (if actionSuggestions.length > 0)
│   │   │   ├── Section header "SUGGESTED ACTIONS"
│   │   │   └── SuggestionRow × max 3
│   │   │
│   │   ├── Other Suggestions (if otherSuggestions.length > 0)
│   │   │   └── Single SuggestionRow with "+N" indicator
│   │   │
│   │   ├── Quick Actions (if no suggestions, has actions)
│   │   │   ├── QuickAction "Generate Note"
│   │   │   └── QuickAction "Check Interactions"
│   │   │
│   │   └── Empty State (if no suggestions, no actions)
│   │       ├── Sparkles icon
│   │       └── "AI assistance available" text
│   │
│   └── AIInputArea
│       └── Auto-growing textarea + control row
│           ├── Mic button (left)
│           ├── Drawer button (right)
│           └── Send button (right, accent when has text)
```

### 9.3 Subcomponent Details

#### DragHandle
- **File:** `src/components/bottom-bar/DragHandle.tsx`
- **Height:** 32px (accessible tap target)
- **Visual:** SVG polyline, flat line → chevron on hover
- **Behavior:** Click triggers `onCollapse` → starts `collapsing-height` animation

#### ContextTargetHeader
- **Defined in:** `AISurfaceModule.tsx` (inline component)
- **Layout:** Flex row with gap
- **Content:**
  - CornerDownRight icon (14px, rgba white 0.5)
  - Patient name (13px, medium weight, inverse primary)
  - Optional context label (" · {label}", rgba white 0.6)
  - X button (24x24px, clears context only)

#### SuggestionRow
- **Defined in:** `AISurfaceModule.tsx` (inline component)
- **Layout:** Flex row, 28px icon container + text + action buttons
- **Content:**
  - Lightbulb icon (14px, generative color background)
  - Label text (13px, truncated with ellipsis)
  - "Add" button (positive color)
  - "Dismiss" button (transparent)
  - "+N >" indicator (if totalCount > 1)

#### QuickAction
- **Defined in:** `AISurfaceModule.tsx` (inline component)
- **Layout:** Flex button with icon + label
- **Style:** rgba white 0.08 bg, 0.15 on hover, md border radius

#### AIInputArea
- **File:** `src/components/ai-ui/AIInputArea.tsx`
- **Layout:** Container with unified input box
- **Features:**
  - Auto-growing textarea (min 24px, max 120px in palette)
  - Control row below textarea
  - Mic button (push-to-talk, left)
  - Drawer button (opens full drawer, right)
  - Send button (accent when has text, right)

### 9.4 Styling Constants

```typescript
// Container
glass.glassDark // Glassmorphic background
borderRadius.lg // Large border radius

// Content area
spaceAround.default // Padding (16px)
spaceAround.compact // Gap between items (12px)

// Section header
fontSize: 11
fontWeight: semibold
color: 'rgba(255, 255, 255, 0.5)'
textTransform: 'uppercase'
letterSpacing: '0.05em'

// Borders
'1px solid rgba(255, 255, 255, 0.1)' // Dividers
'1px solid rgba(255, 255, 255, 0.08)' // Suggestion row border
```

### 9.5 Suggestion Filtering Logic

```typescript
// Types that show in "Suggested Actions" section with header
const ACTION_TYPES = ['chart-item', 'care-gap-action'];

// Filter active suggestions
const activeSuggestions = suggestions.filter(s => s.status === 'active');

// Group into action vs other
const actionSuggestions = activeSuggestions.filter(s =>
  ACTION_TYPES.includes(s.type)
);
const otherSuggestions = activeSuggestions.filter(s =>
  !ACTION_TYPES.includes(s.type)
);

// Display rules:
// - actionSuggestions: Show up to 3 with "Suggested Actions" header
// - otherSuggestions: Show first one only with "+N" indicator
// - If no suggestions: Show QuickActions or Empty State
```

---

## 10. Files Involved

| File | Responsibility |
|------|----------------|
| `BottomBarContainer.tsx` | Grid orchestration, animation stage state, width calculations |
| `AISurfaceModule.tsx` | AI tier rendering, animation stage callbacks, AIPaletteInline |
| `AIMinibar.tsx` | Minibar display, content fade during expand |
| `AIInputArea.tsx` | Input area for palette with auto-grow textarea |
| `DragHandle.tsx` | Collapse trigger, SVG chevron animation |
| `TranscriptionModule.tsx` | Transcription tier rendering |
| `TranscriptionBar.tsx` | Transcription bar display |
| `MiniAnchor.tsx` | Mini state display for both modules |

---

## 11. Test Checklist

### Width Consistency
- [ ] Default state: exactly 488px total
- [ ] AI expanded: exactly 488px total
- [ ] Transcription expanded: exactly 488px total
- [ ] No width changes during any animation

### Baseline Alignment
- [ ] Mini, minibar, palette all bottom-aligned
- [ ] No vertical jumping during transitions

### Expand Animation (Minibar → Palette)
- [ ] Stage 1: Width expands first, height stays 48px
- [ ] Stage 1: Transcription shrinks to mini
- [ ] Stage 1: Minibar content fades out
- [ ] Stage 2: Height expands after width complete
- [ ] Stage 2: Palette content fades in
- [ ] No content clipping during transition

### Collapse Animation (Palette → Minibar)
- [ ] Stage 1: Height collapses first, width stays 432px
- [ ] Stage 1: Palette content fades out
- [ ] Stage 2: Width collapses after height complete
- [ ] Stage 2: Transcription expands to bar
- [ ] Stage 2: Minibar content fades in
- [ ] No content clipping during transition

---

## 12. Verification Commands

```bash
# Run Storybook to test
cd apps/ehr-prototype && npm run storybook

# Navigate to: Bottom Bar/System → Interactive
# Test: Click AI minibar to expand, click drag handle to collapse
```
