# EHR Prototype: Implementation Plan

> **Status:** Active
> **Created:** 2025-01-31
> **Tracks:** [PROGRESS.md](./PROGRESS.md)

---

## Overview

Phased implementation plan to build out the EHR prototype IA with mock content/data. Each phase builds on the previous, delivering working functionality incrementally.

### Guiding Principles

1. **Scaffold first, polish later** - Get structure working before styling details
2. **Mock data from day one** - Every component has realistic sample data
3. **Vertical slices** - Each phase delivers end-to-end functionality
4. **Test as you go** - Visual verification at each milestone

---

## Phase 1: Overview Pane Foundation

**Goal:** Implement segmented control in Overview pane with Overview and Activity tabs.

### 1.1 Segmented Control Component

**File:** `src/components/primitives/SegmentedControl.tsx`

```typescript
interface SegmentedControlProps {
  segments: Array<{ id: string; label: string }>;
  activeSegment: string;
  onChange: (segmentId: string) => void;
}
```

**Styling:**
- Pill-shaped container with subtle background
- Active segment has solid fill
- Smooth transition on segment change

### 1.2 Overview Pane Tab Structure

**File:** `src/components/layout/PatientOverviewPane.tsx`

Changes:
- Add segmented control at top (below any header content)
- Manage active tab state
- Render appropriate content based on active tab
- Overview tab = existing sections (allergies, meds, problems, vitals)
- Activity tab = placeholder for now

### 1.3 Activity Tab Placeholder

**File:** `src/components/overview/ActivityTab.tsx`

Initial implementation:
- Empty state: "Activity timeline coming soon"
- Basic structure for timeline items
- Mock data structure defined

### 1.4 Mock Data

**File:** `src/scenarios/patientData.ts`

Expand existing mock data:
- Patient activity events (visits, results, messages)
- Timestamps and event types
- Status indicators

### Deliverables
- [x] SegmentedControl component
- [x] PatientOverviewPane with tab switching
- [x] ActivityTab placeholder component
- [x] Mock activity data structure

### Verification
- Tabs switch smoothly
- Overview tab shows existing sections
- Activity tab shows placeholder
- State persists during session

---

## Phase 2: Menu Pane Restructure

**Goal:** Restructure menu to support To-Do section with nested filters.

### 2.1 Menu Section Headers

**File:** `src/components/layout/MenuPane.tsx`

Changes:
- "To Do" becomes section header (not clickable nav item)
- Add collapsible category items under To Do
- Support nested filter items under categories

### 2.2 Menu Data Structure

**File:** `src/components/layout/MenuPane.tsx` (types)

```typescript
interface MenuCategory {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  defaultFilter: string;
  filters: MenuFilter[];
}

interface MenuFilter {
  id: string;
  label: string;
  badge?: number;
}
```

### 2.3 To-Do Categories

Implement four categories with filters:

**Tasks:**
- My Pending, Chart Review, Chart Sign-Off, Review Results, Rx Requests, Follow-Ups, All Tasks

**Inbox:**
- Unsorted, All Faxes

**Messages:**
- My Pending, All Messages

**Care:**
- My Pending, All Care

### 2.4 Click Behavior

- Click category → expand + navigate to default filter
- Click filter → navigate to that filter's list
- Visual indication of selected filter

### 2.5 Mock Badge Counts

**File:** `src/scenarios/todoData.ts`

```typescript
const todoCounts = {
  tasks: { myPending: 4, chartReview: 1, ... },
  inbox: { unsorted: 6 },
  messages: { myPending: 12 },
  care: { myPending: 3 }
};
```

### Deliverables
- [x] Menu section header support
- [x] Collapsible category components
- [x] Nested filter items
- [x] Click-to-expand-and-navigate behavior
- [x] Badge count display
- [x] Mock To-Do count data

### Verification
- To Do section shows as header
- Categories expand/collapse
- Clicking category lands on default filter
- Badge counts display correctly

---

## Phase 3: To-Do List View

**Goal:** Build canvas list view for To-Do items with filter chips.

### 3.1 To-Do List Container

**File:** `src/components/todo/ToDoListView.tsx`

Structure:
```
┌─────────────────────────────────────────┐
│ Search bar          [Filter] [+ Action] │
├─────────────────────────────────────────┤
│ [Filter chips row]                      │
├─────────────────────────────────────────┤
│ [List of items]                         │
├─────────────────────────────────────────┤
│ [Pagination]              [Bulk Actions]│
└─────────────────────────────────────────┘
```

### 3.2 Filter Chips Component

**File:** `src/components/todo/FilterChips.tsx`

Chip types:
- Dropdown (Sort, Type, Location)
- Toggle (Mine Only, Incomplete)

### 3.3 To-Do Item Row Components

**Files:**
- `src/components/todo/TaskRow.tsx`
- `src/components/todo/FaxRow.tsx`
- `src/components/todo/MessageRow.tsx`
- `src/components/todo/CareRow.tsx`

Each with type-specific columns and styling.

### 3.4 Mock To-Do Items

**File:** `src/scenarios/todoData.ts`

```typescript
const mockTasks: Task[] = [
  {
    id: '1',
    type: 'call',
    title: 'Call Patient: Questions About Today\'s Visit',
    patient: { name: 'Dante P.', age: 31, gender: 'M', mrn: '12345678' },
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending'
  },
  // ... more items
];
```

### 3.5 Empty States

**File:** `src/components/todo/EmptyState.tsx`

- "All caught up!" for empty filtered view
- "No items" for empty category

### Deliverables
- [x] ToDoListView container
- [x] FilterChips component
- [x] TaskRow component (unified as ToDoRow)
- [x] FaxRow component (unified as ToDoRow)
- [x] MessageRow component (unified as ToDoRow)
- [x] CareRow component (unified as ToDoRow)
- [x] EmptyState component
- [x] Comprehensive mock To-Do data
- [ ] Pagination component (basic) - deferred to Phase 7

### Verification
- List renders with mock data
- Filter chips toggle/select
- Different row types render correctly
- Empty states show appropriately

---

## Phase 4: Patient Workspace Child Tabs

**Goal:** Support child tabs within patient workspaces for To-Do items.

### 4.1 Workspace Tab Bar

**File:** `src/components/layout/WorkspaceTabBar.tsx`

- Horizontal tab bar below floating nav row (or integrated)
- Shows child tabs for active workspace
- Close button on tabs
- Overflow handling (scroll or dropdown)

### 4.2 Tab State Management

**File:** `src/context/WorkspaceContext.tsx`

```typescript
interface Workspace {
  patientId: string;
  activeTabId: string;
  tabs: WorkspaceTab[];
}

interface WorkspaceTab {
  id: string;
  type: 'visit' | 'task' | 'fax' | 'message' | 'care';
  label: string;
  sourceFilter?: string; // For context bar
}
```

### 4.3 Tab Content Routing

**File:** `src/components/layout/CanvasPane.tsx`

Route to appropriate detail view based on active tab type:
- Visit → Visit workspace
- Task → Task detail view
- Fax → Fax detail view
- etc.

### 4.4 Detail View Placeholders

**Files:**
- `src/components/todo/TaskDetailView.tsx`
- `src/components/todo/FaxDetailView.tsx`
- `src/components/todo/MessageDetailView.tsx`
- `src/components/todo/CareDetailView.tsx`

Basic structure with mock content, action buttons.

### Deliverables
- [x] WorkspaceTabBar component
- [x] WorkspaceContext for state management
- [x] Tab routing in CanvasPane (integrated in CaptureView)
- [x] TaskDetailView placeholder
- [x] FaxDetailView placeholder
- [x] MessageDetailView placeholder
- [x] CareDetailView placeholder
- [x] PatientWorkspaceItem shows workspace tabs as nested menu items
- [x] Tab close functionality with X button on hover
- [x] Workspace close functionality (X on patient header)
- [x] Explicit close + patient workspace exit for cleanup

### Workflow Decision (Refined)

**To-Do workflow follows email inbox pattern:**
```
To-Do List → To-Do Detail → [Open Patient Chart] → Patient Workspace
     ↑___________|  (back)                              (with context bar - Phase 5)
```

- Clicking To-Do item shows detail view (stays in category)
- Back button returns to list (preserves filter/position)
- Explicit "Open Patient Chart" action creates workspace
- Supports quick triage without workspace clutter

### Verification
- Clicking To-Do item shows detail view (stays in To-Do category)
- Back button returns to filtered list
- "Open Patient Chart" creates patient workspace
- Tabs show as nested items under patient in menu pane
- Switching tabs changes canvas content
- Closing tab (X button) removes tab and switches to overview
- Closing workspace (X on header) removes entire workspace

---

## Phase 5: Context Bar

**Goal:** Implement navigation context bar for To-Do → Patient flows.

**Trigger:** When user clicks "Open Patient Chart" from To-Do detail view, context bar appears in patient workspace showing source filter and navigation options.

### 5.1 Context Bar Component

**File:** `src/components/navigation/ContextBar.tsx`

```typescript
interface ContextBarProps {
  sourceFilter: string;      // "Chart Review"
  sourceCategoryId: string;  // "tasks"
  remainingCount: number;    // 3
  currentTaskTitle: string;  // "Call Patient: Lab Results"
  onReturn: () => void;
  onNext: () => void;
  onDismiss: () => void;
  hasNext: boolean;
}
```

Visual design:
```
┌──────────────────────────────────────────────────────────────┐
│ ← Chart Review (3 remaining)  │  Call Patient: Lab...  │ Next → │ ✕ │
└──────────────────────────────────────────────────────────────┘
```
- Left: Return link with remaining count
- Center: Current task title (truncated)
- Right: Next item button + dismiss
- Transitions: slide down on appear, slide up on dismiss

### 5.2 Context Bar State

**File:** `src/context/NavigationContext.tsx`

Track:
- Source filter when navigating from To-Do
- Current position in filtered list
- Remaining count

Per-workspace context bar state:
```typescript
interface WorkspaceContextBar {
  workspaceId: string;
  sourceFilter: string;
  sourceFilterId: string;
  currentIndex: number;
  totalCount: number;
  dismissed: boolean;
}
```

### 5.3 Navigation Integration

**File:** `src/hooks/useToDoNavigation.ts`

Hook to manage To-Do navigation:
- `navigateToItem(item, filter)` - opens item, sets context
- `navigateToNext()` - moves to next item
- `returnToList()` - returns to source filter
- `dismissContextBar()` - hides bar for this workspace

### 5.4 Context Bar Behaviors

Implement rules:
- Appears on To-Do → patient navigation
- Updates when opening new To-Do item in same workspace
- Hides when navigating via menu
- Reappears when returning to workspace
- Shows "All done!" when last item completed

### Deliverables
- [x] ContextBar component (`src/components/navigation/ContextBar.tsx`)
- [x] NavigationContext for state (integrated with WorkspaceContext)
- [x] useToDoNavigation hook (`src/hooks/useToDoNavigation.ts`)
- [x] Integration with workspace tabs (via CaptureView)
- [x] "Next" functionality
- [x] "Return" functionality
- [x] Dismiss behavior

### Verification
- Context bar appears when clicking "Open Patient Chart" from To-Do detail
- Shows correct filter name and remaining count
- "Next" loads next item in filtered list
- "Return" goes back to To-Do list view
- "✕" dismisses bar for current session
- Bar hides when navigating via menu (cleared on navigation)

---

## Phase 6: Activity Tab Implementation

**Goal:** Build out the Activity tab with timeline functionality.

### 6.1 Activity Timeline Component

**File:** `src/components/overview/ActivityTimeline.tsx`

Structure:
```
┌─────────────────────────────────┐
│ [Filter] [Sort]                 │
├─────────────────────────────────┤
│ ★ Today                         │
│   Visit (In Progress)           │
│   ├─ Chart note started         │
│   └─ 2 pending orders           │
├─────────────────────────────────┤
│ Yesterday                       │
│   Lab results received          │
│   Message from specialist       │
├─────────────────────────────────┤
│ Jan 28                          │
│   Prescription refill           │
└─────────────────────────────────┘
```

### 6.2 Timeline Item Component

**File:** `src/components/overview/TimelineItem.tsx`

Props:
- Event type (visit, result, message, prescription, etc.)
- Title, description
- Timestamp
- Status (if applicable)
- Nested items (if applicable)

### 6.3 Timeline Filtering

Filters:
- Type: All, Visits, Results, Messages, Documents
- Time: Today, This Week, This Month, All Time

### 6.4 Timeline → Canvas Integration

Clicking timeline item:
- Creates child tab in workspace (if actionable)
- Or opens detail view in canvas

### 6.5 Mock Timeline Data

**File:** `src/scenarios/patientData.ts`

```typescript
const mockTimeline: TimelineEvent[] = [
  {
    id: '1',
    type: 'visit',
    title: 'Office Visit',
    date: '2024-01-31',
    status: 'in_progress',
    children: [
      { type: 'note', title: 'Chart note started' },
      { type: 'order', title: '2 pending orders' }
    ]
  },
  // ... more events
];
```

### Deliverables
- [ ] ActivityTimeline component
- [ ] TimelineItem component
- [ ] Timeline filter controls
- [ ] Timeline → canvas navigation
- [ ] Comprehensive mock timeline data

### Verification
- Timeline renders with grouped dates
- Filter changes update display
- Clicking item navigates appropriately
- Current visit/activity highlighted

---

## Phase 7: Polish and Integration

**Goal:** Refine interactions, add transitions, ensure cohesive experience.

### 7.1 Transition Animations

- Menu expand/collapse
- Tab switching
- Context bar appear/dismiss
- List → detail navigation

### 7.2 Loading States

- Skeleton loaders for lists
- Spinner for detail views
- Optimistic updates where appropriate

### 7.3 Keyboard Shortcuts

Implement shortcuts documented in NAVIGATION_PATTERNS.md:
- `Cmd + \` - Toggle menu
- `Cmd + Shift + \` - Toggle overview
- `Cmd + .` - Toggle AI drawer
- `Escape` - Close/dismiss

### 7.4 Error States

- Failed to load list
- Item not found
- Network error

### 7.5 Responsive Considerations

- Minimum widths honored
- Pane collapse behaviors at breakpoints
- Touch targets for potential tablet use

### Deliverables
- [ ] Transition animations
- [ ] Loading states
- [ ] Keyboard shortcuts
- [ ] Error states
- [ ] Responsive behavior verification

### Verification
- Smooth transitions throughout
- Loading states appear appropriately
- Keyboard shortcuts work
- Errors handled gracefully

---

## Phase 8: Demo Scenarios

**Goal:** Create complete demo scenarios with interconnected mock data.

---

## Future Enhancements (Backlog)

### Manage Workspaces

**Location:** Bottom of menu pane, above future accounts/settings item (anchored at very bottom)

**Capability:**
- View all open patient workspaces
- Bulk close workspaces
- Reorder workspaces
- Search/filter workspaces

**Visual:**
```
┌─────────────────────────┐
│ [Menu content...]       │
│                         │
│ ─────────────────────── │
│ 📋 Manage Workspaces    │ ← Link to workspace management
│ ⚙️ Settings            │ ← Future: anchored at bottom
└─────────────────────────┘
```

**Deferred because:** Core tab functionality must work first; management is an optimization for power users with many open workspaces.

---

### 8.1 Demo Patient: Maria Johnson

Complete patient profile with:
- Demographics, allergies, medications, problems, vitals
- Timeline with recent visits, results, messages
- Active To-Do items (task, message, care adherence)

### 8.2 Demo Patient: John Smith

Second patient with different profile:
- Different conditions, medications
- Different To-Do item types

### 8.3 Demo To-Do Lists

Populated lists for each category:
- Tasks: 8-10 items across filters
- Inbox: 5-6 faxes (some unsorted, some linked)
- Messages: 10-12 threads
- Care: 4-5 adherence items

### 8.4 Demo Staff Dashboard

Home hub content:
- Sample 2-week schedule
- Today's clinic info
- Sample metrics
- Announcements

### 8.5 Demo Flows

Scripted walkthroughs:
1. "Morning Chart Review" - Work through chart sign-offs
2. "Inbox Triage" - Sort incoming faxes
3. "Patient Lookup" - Search and review patient

### Deliverables
- [ ] Maria Johnson complete data
- [ ] John Smith complete data
- [ ] Populated To-Do lists
- [ ] Staff dashboard content
- [ ] Documented demo flows

### Verification
- End-to-end flows work with demo data
- Data is interconnected and consistent
- Realistic clinical scenarios represented

---

## Timeline Estimate

| Phase | Dependency | Estimated Effort |
|-------|------------|------------------|
| Phase 1: Overview Pane Foundation | None | Small |
| Phase 2: Menu Restructure | None | Medium |
| Phase 3: To-Do List View | Phase 2 | Medium-Large |
| Phase 4: Child Tabs | Phase 3 | Medium |
| Phase 5: Context Bar | Phase 4 | Medium |
| Phase 6: Activity Tab | Phase 1 | Medium |
| Phase 7: Polish | Phases 1-6 | Medium |
| Phase 8: Demo Scenarios | Phases 1-7 | Small-Medium |

**Parallel work possible:**
- Phases 1 & 2 can run in parallel
- Phase 6 can start after Phase 1, parallel to Phases 3-5

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scope creep in list views | Start with Tasks only, add other types incrementally |
| Context bar complexity | Build simple version first, add "Next" later |
| Mock data management | Centralize in `/scenarios`, use TypeScript for structure |
| State management complexity | Use React Context, migrate to more robust solution if needed |

---

## Success Criteria

Phase is complete when:
1. All deliverables checked off
2. Verification steps pass
3. No console errors
4. Visual review approved

Project is complete when:
1. All 8 phases done
2. Demo scenarios work end-to-end
3. Documentation updated
4. Ready for stakeholder review

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-31 | Initial implementation plan | Claude + William |
| 2025-02-01 | Phase 5: Context Bar implementation complete | Claude + William |
