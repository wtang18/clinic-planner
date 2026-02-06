# EHR Prototype Layout Specification

Adaptive multi-pane layout system for clinical charting workflows.

**Version**: 1.0
**Last Updated**: 2026-01-29
**Status**: Draft

---

## Overview

The layout follows modern OS conventions (iOS/iPadOS/macOS 26) with:
- **3+1 pane architecture**: Menu | Patient Overview | Canvas | AI Drawer (on-demand)
- **Independent collapse**: Each pane collapses to 0-width with floating toggle controls
- **Adaptive breakpoints**: Responsive behavior for desktop, tablet, and mobile
- **Floating elements**: Sticky headers, floating minibar, dynamic toggle buttons

---

## Layout Architecture

### Visual Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [≡]  [◀Patient]  │  Patient Overview  │  Encounter Header (floating)  [⚙️]│
├──────────────────┼────────────────────┼──────────────────────────────────┤
│                  │                    │                                   │
│  MENU PANE       │  OVERVIEW PANE     │  CANVAS PANE                      │
│  ~200px          │  ~280px            │  flex: 1                          │
│                  │                    │                                   │
│  ┌────────────┐  │  ┌──────────────┐  │  ┌─────────────────────────────┐  │
│  │ Search     │  │  │ Allergies  ▼│  │  │ Chart Items (scrollable)   │  │
│  ├────────────┤  │  ├──────────────┤  │  │                             │  │
│  │ Home       │  │  │ Medications▼│  │  │ • Chief Complaint           │  │
│  │ Visits     │  │  ├──────────────┤  │  │ • Medication                │  │
│  ├────────────┤  │  │ Problems   ▼│  │  │ • Allergy                   │  │
│  │ Workspaces │  │  ├──────────────┤  │  │ • Physical Exam             │  │
│  │ ├ Agent    │  │  │ Vitals     ▼│  │  │ • Lab Order                 │  │
│  │ ├ To Do    │  │  │  (trends)   │  │  │                             │  │
│  │ └ Patients │  │  └──────────────┘  │  │ ┌─────────────────────────┐ │  │
│  ├────────────┤  │                    │  │ │ + Add to chart (inline) │ │  │
│  │ Patient    │  │  [☰ shortcuts]     │  │ └─────────────────────────┘ │  │
│  │ ├ Task 1   │  │                    │  └─────────────────────────────┘  │
│  │ ├ Task 2   │  │                    │                                   │
│  │ └ Visit    │  │                    │  ┌─────────────────────────────┐  │
│  └────────────┘  │                    │  │ AI DRAWER (4th pane)        │  │
│                  │                    │  │ slides in from right        │  │
│                  │                    │  │ ~320px                      │  │
│                  │                    │  └─────────────────────────────┘  │
├──────────────────┴────────────────────┴──────────────────────────────────┤
│                    [Minibar - floating, centered]                         │
│                    [Pa] ─●── 13:44  [▌▌ Pause]  [Na] [+]                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Collapse States

| State | Menu | Overview | Canvas | Use Case |
|-------|------|----------|--------|----------|
| Full | Open | Open | Flex | Desktop landscape, full context |
| Focus | Closed | Open | Flex | Patient-focused charting |
| Immersive | Closed | Closed | Full | Maximum charting space |
| Context | Open | Closed | Flex | Navigation-focused |

### Pane Specifications

#### Menu Pane
| Property | Value |
|----------|-------|
| Width (expanded) | 200px |
| Width (collapsed) | 0px |
| Min content | Icon-only not supported (fully hidden) |
| Toggle control | Floating button at left edge |
| Background | `colors.bg.neutral.base` |
| Border | Right: `colors.border.neutral.low` |

**Content Structure:**
```
├── Search (optional)
├── Hubs
│   ├── Home (schedule, shift details)
│   └── Visits (clinic-level appointments)
├── Workspaces
│   ├── Agent (AI assistant)
│   ├── To Do (tasks, messages, fax, care adherence)
│   └── My Patients (patient list)
└── Patient Workspaces (expandable)
    └── [Patient Name]
        ├── Active tasks
        └── Current visit
```

#### Patient Overview Pane
| Property | Value |
|----------|-------|
| Width (expanded) | 280px |
| Width (collapsed) | 0px |
| Toggle control | Floating button or header tap |
| Background | `colors.bg.neutral.min` |
| Border | Right: `colors.border.neutral.low` |

**Content Structure:**
```
├── Patient Identity Header
│   ├── Name
│   ├── MRN
│   ├── DOB / Age
│   └── [☰] Shortcuts menu
├── Collapsible Sections
│   ├── Allergies
│   ├── Medications (active)
│   ├── Problems (active conditions)
│   └── Vitals (recent + trends)
└── (Future: custom sections)
```

**Section Behavior:**
- Default: First 2-3 items visible, "Show more" expands
- Collapse: Header only with item count badge
- Data: Read from longitudinal patient record, not encounter

#### Canvas Pane
| Property | Value |
|----------|-------|
| Width | `flex: 1` (fills remaining space) |
| Min width | 400px (forces collapse of other panes) |
| Background | `colors.bg.neutral.min` |

**Content Structure:**
```
├── Encounter Header (sticky/floating)
│   ├── Visit type + Chief complaint
│   ├── Provider + credentials
│   ├── Badges (Self-pay, UC, etc.)
│   ├── Time, Room, Appt ID
│   ├── Organization
│   └── Mode Selector (right side)
├── Chart Items (scrollable)
│   ├── [Items in chronological order]
│   └── OmniAdd (inline, follows last item)
└── (Content scrolls behind floating header)
```

**Floating Header Behavior (Apple OS 26 style):**
- Header floats above content
- Content scrolls behind with blur/fade effect
- Header can collapse to compact state on scroll
- Tap to expand/restore

#### AI Drawer (4th Pane)
| Property | Value |
|----------|-------|
| Width (expanded) | 320px |
| Width (collapsed) | 0px |
| Position | Right edge, overlays or pushes canvas |
| Entry | Slide from right |
| Trigger | Minibar action, suggestion tap, keyboard shortcut |

**Content (placeholder for now):**
```
├── Drawer Header
│   ├── Title (e.g., "AI Suggestions", "Item Details")
│   └── Close button
├── Content Area
│   └── Context-dependent content
└── Actions Footer (optional)
```

---

## Toggle Controls

### Design Pattern
Following iOS/iPadOS split view conventions:

```
Collapsed state:
┌─────────────────────────────────────┐
│ [≡]  Patient Name | Canvas...      │
└─────────────────────────────────────┘
  ↑ Floating toggle appears at edge

Expanded state:
┌───────┬───────────┬─────────────────┐
│ Menu  │ Overview  │ Canvas          │
│  [◀]  │    [◀]    │                 │
└───────┴───────────┴─────────────────┘
        ↑ Toggle in pane header
```

### Toggle Button Specs
| Property | Value |
|----------|-------|
| Size | 32x32px (touch target 44x44px) |
| Icon | Chevron or hamburger |
| Position | Edge of collapsed pane |
| Background | `colors.bg.neutral.base` with shadow |
| Border radius | `borderRadius.sm` |
| Animation | 200ms ease-out |

---

## Floating Elements

### Minibar
| Property | Value |
|----------|-------|
| Position | Fixed, bottom center |
| Width | Auto (content-based), max 600px |
| Margin | 16px from bottom edge |
| Background | `colors.bg.neutral.base` with blur |
| Border radius | `borderRadius.full` |
| Shadow | `elevation.lg` |
| Z-index | `zIndex.docked` |

**Content:**
```
[Patient Avatar] [●─────── 13:44] [▌▌ Pause] [Next Patient] [+]
     ↑                  ↑              ↑            ↑         ↑
  Patient ID      Progress/Time   Record control  Quick nav  Actions
```

**Patient Indicator Requirement:**
- Shows which patient is being recorded
- Avatar/initials + name
- Visual connection to active chart
- Warning if recording patient differs from viewed patient

### Inline OmniAdd
| Property | Value |
|----------|-------|
| Position | Inline with chart items |
| Placement | After last added item, or top if empty |
| Width | Full width of chart items container |
| Appearance | Card-like with prominent `+` affordance |

**Behavior:**
- Moves to insertion point as items are added
- Expands to full input mode on focus
- Shows contextual suggestions based on position
- Can be triggered by keyboard (`Cmd+K` or `a`)

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Menu | Overview | Canvas | AI Drawer |
|------------|-------|------|----------|--------|-----------|
| Desktop XL | >1440px | Open | Open | Flex | Push |
| Desktop | 1024-1440px | Open | Open | Flex | Overlay |
| Tablet | 768-1024px | Closed* | Open | Flex | Overlay |
| Mobile | <768px | Sheet | Sheet | Full | Sheet |

*Auto-closed but can be toggled open

### Mobile Adaptations

**Menu Pane:**
- Becomes bottom sheet or side sheet
- Gesture: Swipe from left edge
- Backdrop overlay when open

**Patient Overview:**
- Becomes bottom sheet
- Gesture: Tap patient name in canvas header
- Can be pinned as split view on tablets

**AI Drawer:**
- Becomes bottom sheet (half or full height)
- Gesture: Swipe up from minibar

**Canvas:**
- Full width always
- Floating header remains
- Minibar adapts to narrower width

---

## Animation Specifications

### Pane Collapse/Expand
```css
transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Floating Header Scroll
```css
/* Header background blur on scroll */
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.8);
transition: all 150ms ease-out;
```

### Drawer Slide
```css
transform: translateX(100%); /* closed */
transform: translateX(0);    /* open */
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Toggle Button Appearance
```css
opacity: 0;
transform: scale(0.8);
/* On hover near edge or after collapse */
opacity: 1;
transform: scale(1);
transition: all 150ms ease-out;
```

---

## Component Hierarchy

```tsx
<AdaptiveLayout>
  {/* Collapse state management */}
  <LayoutStateProvider>

    {/* Left panes */}
    <CollapsiblePane id="menu" edge="left" width={200}>
      <MenuPane />
    </CollapsiblePane>

    <CollapsiblePane id="overview" edge="left" width={280}>
      <PatientOverviewPane />
    </CollapsiblePane>

    {/* Main canvas */}
    <CanvasPane>
      <FloatingHeader>
        <EncounterContext />
        <ModeSelector />
      </FloatingHeader>

      <ScrollableContent>
        <ChartItemList />
        <InlineOmniAdd />
      </ScrollableContent>
    </CanvasPane>

    {/* Right drawer */}
    <CollapsiblePane id="ai-drawer" edge="right" width={320} overlay>
      <AIDrawer />
    </CollapsiblePane>

    {/* Floating elements */}
    <FloatingMinibar>
      <PatientIndicator />
      <RecordingControls />
      <QuickActions />
    </FloatingMinibar>

    {/* Mobile sheets */}
    <MobileSheetPortal />

  </LayoutStateProvider>
</AdaptiveLayout>
```

---

## Accessibility

### Keyboard Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd+\` | Toggle menu pane |
| `Cmd+Shift+\` | Toggle patient overview |
| `Cmd+.` | Toggle AI drawer |
| `Escape` | Close any open drawer/sheet |
| `Tab` | Navigate between panes |

### Screen Reader
- Panes have `role="region"` with `aria-label`
- Collapse state announced via `aria-expanded`
- Toggle buttons have descriptive labels

### Reduced Motion
- Respect `prefers-reduced-motion`
- Instant transitions when enabled

---

## Design Tokens Reference

```typescript
// Widths
const MENU_WIDTH = 200;
const OVERVIEW_WIDTH = 280;
const AI_DRAWER_WIDTH = 320;
const CANVAS_MIN_WIDTH = 400;

// Breakpoints
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;
const BREAKPOINT_DESKTOP_XL = 1440;

// Z-index layers
const Z_PANE = 1;
const Z_FLOATING_HEADER = 10;
const Z_DRAWER = 100;
const Z_MINIBAR = 50;
const Z_SHEET = 200;
const Z_OVERLAY = 150;
```

---

## Open Questions

1. **Gesture conflicts**: How to handle swipe gestures that might conflict with content scrolling?
2. **Persistence**: Should collapse states persist per-user or per-session?
3. **Multi-patient**: When viewing Patient A but recording Patient B, how prominent should the warning be?
4. **Shortcuts menu**: What actions should be in the patient overview hamburger menu?

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-29 | Initial draft |
