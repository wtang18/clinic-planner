# Layout Refactor Implementation Plan

Phased approach to implement the adaptive multi-pane layout system.

**Created**: 2026-01-29
**Reference**: [LAYOUT_SPEC.md](./LAYOUT_SPEC.md)

---

## Summary

| Phase | Focus | Est. Scope | Dependencies |
|-------|-------|-----------|--------------|
| 0 | Font fix + prep | Small | None |
| 1 | Core layout infrastructure | Medium | Phase 0 |
| 2 | Menu pane (visual) | Small | Phase 1 |
| 3 | Patient overview pane | Medium | Phase 1 |
| 4 | Canvas refactor | Medium | Phase 1 |
| 5 | AI drawer scaffold | Small | Phase 1 |
| 6 | Minibar enhancements | Small | Phase 4 |
| 7 | Responsive/mobile | Medium | All above |

---

## Phase 0: Font Fix + Preparation

### Goal
Fix the font rendering issue and prepare codebase for layout refactor.

### Tasks

#### 0.1 Global Font Reset
Create a global CSS reset that ensures Inter font inheritance across all elements.

**File**: `src/styles/global.ts` (update or create)

```typescript
// Global styles injected at app root
export const globalStyles = `
  *, *::before, *::after {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
                 'Segoe UI', Roboto, sans-serif;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
```

**File**: `src/App.tsx` - Inject global styles

#### 0.2 Typography Token Update
Update `typography.ts` to include fallback stack.

```typescript
fontFamily: {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  // ...
}
```

#### 0.3 Audit Existing Styles
Review and update components that hardcode font styles without using tokens:
- `DemoLauncher.tsx`
- `AppRouter.tsx`
- Any component using raw `fontFamily` strings

### Verification
- [ ] DemoLauncher displays Inter font
- [ ] All screens display Inter font
- [ ] Fallback works when Inter not loaded (shows system font, not serif)

---

## Phase 1: Core Layout Infrastructure

### Goal
Create the foundational layout components that support the 3+1 pane architecture.

### Tasks

#### 1.1 Create `AdaptiveLayout` Component
New root layout component replacing/wrapping `AppShell`.

**File**: `src/components/layout/AdaptiveLayout.tsx`

```typescript
interface AdaptiveLayoutProps {
  children: React.ReactNode;
}

// Provides layout context (collapse states, breakpoints)
// Renders pane slots in correct order
// Handles responsive behavior
```

#### 1.2 Create `LayoutStateContext`
Context for managing pane collapse states.

**File**: `src/context/LayoutStateContext.tsx`

```typescript
interface LayoutState {
  menuCollapsed: boolean;
  overviewCollapsed: boolean;
  aiDrawerOpen: boolean;
  // Responsive
  isMobile: boolean;
  isTablet: boolean;
}

interface LayoutActions {
  toggleMenu: () => void;
  toggleOverview: () => void;
  toggleAIDrawer: () => void;
  // Batch
  setLayout: (preset: 'full' | 'focus' | 'immersive' | 'context') => void;
}
```

#### 1.3 Create `CollapsiblePane` Component
Generic collapsible pane with edge toggle controls.

**File**: `src/components/layout/CollapsiblePane.tsx`

```typescript
interface CollapsiblePaneProps {
  id: string;
  edge: 'left' | 'right';
  width: number;
  collapsed: boolean;
  onToggle: () => void;
  overlay?: boolean; // Overlay vs push behavior
  children: React.ReactNode;
}
```

Features:
- Animated collapse/expand
- Floating toggle button when collapsed
- Respects `prefers-reduced-motion`

#### 1.4 Create `FloatingToggleButton` Component
Edge-anchored button that appears when pane is collapsed.

**File**: `src/components/layout/FloatingToggleButton.tsx`

```typescript
interface FloatingToggleButtonProps {
  edge: 'left' | 'right';
  offset: number; // Distance from top
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}
```

#### 1.5 Update `AppProviders` with Layout Context
Add `LayoutStateProvider` to provider hierarchy.

### Verification
- [ ] `AdaptiveLayout` renders correctly
- [ ] Collapse states persist during session
- [ ] Toggle buttons appear/disappear correctly
- [ ] Animations are smooth

---

## Phase 2: Menu Pane (Visual Structure)

### Goal
Create the menu pane with visual structure for navigation hubs and patient workspaces.

### Tasks

#### 2.1 Create `MenuPane` Component
Container component for menu content.

**File**: `src/components/layout/MenuPane.tsx`

```typescript
interface MenuPaneProps {
  activePatientId?: string;
  onNavigate?: (destination: string) => void;
}
```

#### 2.2 Create `MenuSection` Component
Collapsible section within menu.

**File**: `src/components/layout/MenuSection.tsx`

```typescript
interface MenuSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}
```

#### 2.3 Create `MenuNavItem` Component
Individual navigation item.

**File**: `src/components/layout/MenuNavItem.tsx`

```typescript
interface MenuNavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  active?: boolean;
  onClick?: () => void;
}
```

#### 2.4 Create `PatientWorkspaceItem` Component
Patient-specific workspace item with tasks/visits.

**File**: `src/components/layout/PatientWorkspaceItem.tsx`

```typescript
interface PatientWorkspaceItemProps {
  patient: { id: string; name: string; };
  tasks: { id: string; title: string; date?: string; }[];
  activeVisit?: { id: string; title: string; };
  expanded?: boolean;
  onToggle?: () => void;
}
```

#### 2.5 Compose Menu Content
Wire up components with mock/placeholder data for:
- Home, Visits (hubs)
- Agent, To Do, My Patients (workspaces)
- Current patient workspace (expanded example)

### Verification
- [ ] Menu renders with all sections
- [ ] Sections expand/collapse
- [ ] Patient workspace shows tasks and visit
- [ ] Collapse hides entire pane, toggle reveals it

---

## Phase 3: Patient Overview Pane

### Goal
Create the patient overview pane with longitudinal data sections.

### Tasks

#### 3.1 Create `PatientOverviewPane` Component
Container for patient overview content.

**File**: `src/components/layout/PatientOverviewPane.tsx`

```typescript
interface PatientOverviewPaneProps {
  patient: Patient;
  onShortcutSelect?: (action: string) => void;
}
```

#### 3.2 Create `PatientIdentityHeader` Component
Patient name, MRN, DOB with shortcuts menu.

**File**: `src/components/layout/PatientIdentityHeader.tsx`

```typescript
interface PatientIdentityHeaderProps {
  patient: Patient;
  onMenuOpen?: () => void;
}
```

Features:
- Avatar/initials
- Name (prominent)
- MRN, DOB/Age
- Hamburger menu trigger

#### 3.3 Create `OverviewSection` Component
Collapsible section for longitudinal data.

**File**: `src/components/layout/OverviewSection.tsx`

```typescript
interface OverviewSectionProps {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

#### 3.4 Create Section Content Components

**Allergies Section**: `src/components/overview/AllergiesSection.tsx`
```typescript
// List of allergies with severity indicators
// "No known allergies" state
```

**Medications Section**: `src/components/overview/MedicationsSection.tsx`
```typescript
// Active medications list
// Drug name, dosage, frequency
// "Show all" expansion
```

**Problems Section**: `src/components/overview/ProblemsSection.tsx`
```typescript
// Active problem list
// ICD code, description, onset
```

**Vitals Section**: `src/components/overview/VitalsSection.tsx`
```typescript
// Recent vitals with mini trend indicators
// BP, HR, Temp, SpO2, Weight
```

#### 3.5 Create `ShortcutsMenu` Component
Dropdown menu for quick actions.

**File**: `src/components/layout/ShortcutsMenu.tsx`

```typescript
// Actions like: View full chart, Print summary, etc.
```

### Verification
- [ ] Patient identity displays correctly
- [ ] All four sections render with mock data
- [ ] Sections collapse/expand independently
- [ ] Shortcuts menu opens (placeholder actions)
- [ ] Pane collapses fully with toggle

---

## Phase 4: Canvas Refactor

### Goal
Refactor the canvas area with floating header and inline OmniAdd.

### Tasks

#### 4.1 Create `CanvasPane` Component
Main canvas container with floating header support.

**File**: `src/components/layout/CanvasPane.tsx`

```typescript
interface CanvasPaneProps {
  header: React.ReactNode;
  children: React.ReactNode;
}
```

#### 4.2 Create `FloatingHeader` Component
Sticky header that content scrolls behind.

**File**: `src/components/layout/FloatingHeader.tsx`

```typescript
interface FloatingHeaderProps {
  children: React.ReactNode;
  collapsible?: boolean;
  blurOnScroll?: boolean;
}
```

Features:
- Blur backdrop when content behind
- Optional compact state on scroll
- Tap to restore full header

#### 4.3 Create `EncounterContextBar` Component
Encounter-specific header content.

**File**: `src/components/layout/EncounterContextBar.tsx`

```typescript
interface EncounterContextBarProps {
  encounter: Encounter;
  provider?: Provider;
  mode: 'capture' | 'process' | 'review';
  onModeChange: (mode: string) => void;
}
```

Content:
- Visit type + chief complaint (left)
- Provider info
- Badges (self-pay, UC, etc.)
- Time, room, appt ID
- Organization
- Mode selector (right)

#### 4.4 Refactor `OmniAddBar` for Inline Positioning
Update OmniAdd to work as inline element.

**File**: `src/components/omni-add/InlineOmniAdd.tsx`

```typescript
interface InlineOmniAddProps {
  insertAfterIndex?: number; // Position in chart items
  onItemAdd: (item: ChartItem) => void;
  // ... existing props
}
```

Behavior:
- Renders inline with chart items
- Position follows last-added item
- If empty, appears at top
- Scroll into view when activated

#### 4.5 Update `CaptureView` to Use New Components
Integrate new canvas components into CaptureView.

### Verification
- [ ] Floating header stays fixed on scroll
- [ ] Content scrolls behind header with blur
- [ ] Encounter context displays all fields
- [ ] Mode selector works
- [ ] OmniAdd appears inline at correct position
- [ ] Adding item moves OmniAdd below it

---

## Phase 5: AI Drawer Scaffold

### Goal
Create the 4th pane (AI drawer) with placeholder content.

### Tasks

#### 5.1 Create `AIDrawer` Component
Slide-in drawer from right edge.

**File**: `src/components/layout/AIDrawer.tsx`

```typescript
interface AIDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

Features:
- Slide animation from right
- Backdrop overlay (optional based on breakpoint)
- Close on escape, backdrop click
- Header with title and close button

#### 5.2 Create `AIDrawerContent` Placeholder
Placeholder content showing future capabilities.

**File**: `src/components/ai-ui/AIDrawerContent.tsx`

```typescript
// Placeholder showing:
// - AI suggestions list
// - Item detail view
// - Context panel
```

#### 5.3 Wire Drawer Triggers
Connect drawer open to:
- Minibar AI button
- Suggestion card tap (future)
- Keyboard shortcut

### Verification
- [ ] Drawer slides in from right
- [ ] Drawer closes on escape, backdrop
- [ ] Placeholder content visible
- [ ] Minibar opens drawer

---

## Phase 6: Minibar Enhancements

### Goal
Enhance minibar with patient indicator for multi-patient awareness.

### Tasks

#### 6.1 Create `PatientIndicator` Component
Shows which patient is being recorded.

**File**: `src/components/ai-ui/PatientIndicator.tsx`

```typescript
interface PatientIndicatorProps {
  patient: { id: string; name: string; initials: string; };
  isRecording: boolean;
  onPatientClick?: () => void;
}
```

Features:
- Avatar/initials
- Patient name (truncated)
- Recording indicator animation
- Tap to go to patient

#### 6.2 Create `RecordingMismatchWarning` Component
Warning when viewing different patient than recording.

**File**: `src/components/ai-ui/RecordingMismatchWarning.tsx`

```typescript
// Shows when:
// - Recording Patient A
// - Viewing Patient B's chart
```

#### 6.3 Update `Minibar` Component
Integrate patient indicator and warning.

### Verification
- [ ] Patient indicator shows in minibar
- [ ] Recording animation plays
- [ ] Warning shows when patient mismatch (if applicable)

---

## Phase 7: Responsive & Mobile

### Goal
Implement responsive behavior for tablet and mobile breakpoints.

### Tasks

#### 7.1 Create `useBreakpoint` Hook
Reactive hook for current breakpoint.

**File**: `src/hooks/useBreakpoint.ts`

```typescript
type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'desktop-xl';

function useBreakpoint(): {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

#### 7.2 Create `MobileSheet` Component
Bottom sheet for mobile overlays.

**File**: `src/components/layout/MobileSheet.tsx`

```typescript
interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  height?: 'auto' | 'half' | 'full';
  children: React.ReactNode;
}
```

Features:
- Swipe to dismiss
- Backdrop overlay
- Multiple height states
- Handle indicator

#### 7.3 Update `AdaptiveLayout` for Mobile
- Menu → left sheet
- Patient overview → bottom sheet
- AI drawer → bottom sheet
- Minibar → compact mode

#### 7.4 Touch Gestures
- Swipe from left edge → open menu
- Swipe from right edge → open AI drawer
- Swipe down on sheet → dismiss

#### 7.5 Tablet-Specific Behavior
- Default to menu collapsed
- Split view support (future)

### Verification
- [ ] Layout adapts at each breakpoint
- [ ] Sheets work on mobile
- [ ] Gestures function correctly
- [ ] No gesture conflicts with content scroll

---

## Integration Checklist

After all phases:

- [ ] Full 3+1 pane layout working
- [ ] All panes collapse/expand independently
- [ ] Floating header scrolls correctly
- [ ] OmniAdd positioned inline
- [ ] Minibar shows patient context
- [ ] AI drawer opens/closes
- [ ] Responsive on all breakpoints
- [ ] Keyboard shortcuts work
- [ ] Accessibility requirements met
- [ ] Performance acceptable (no jank on collapse/expand)

---

## Migration Notes

### Files to Deprecate
- `AppShell.tsx` - replaced by `AdaptiveLayout`
- `PatientHeader.tsx` - split into `PatientIdentityHeader` + `EncounterContextBar`

### Files to Refactor
- `CaptureView.tsx` - use new canvas components
- `ProcessView.tsx` - use new canvas components
- `ReviewView.tsx` - use new canvas components
- `Minibar.tsx` - add patient indicator

### Backwards Compatibility
- Keep `AppShell` temporarily for non-encounter screens
- Or update all screens to use `AdaptiveLayout`

---

## Open Items

1. **State persistence**: LocalStorage vs session for collapse states?
2. **Animation performance**: Test on lower-end devices
3. **Keyboard shortcuts**: Need to register new shortcuts for pane toggles
4. **Minibar position**: Should it move/resize when drawer opens?

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-29 | Initial plan |
