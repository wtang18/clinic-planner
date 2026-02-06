# EHR Prototype: Navigation Patterns

> **Status:** Active Design
> **Last Updated:** 2025-01-31
> **Related Docs:** [Information Architecture](./INFORMATION_ARCHITECTURE.md) | [To-Do Feature](./features/TO_DO.md)

---

## Overview

This document defines navigation patterns, flows, and behaviors for moving between views in the EHR prototype.

---

## Core Navigation Flows

### To-Do → Patient → Return

The most common workflow: working through a list of tasks.

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. USER IN TO-DO LIST                                               │
│    Menu: To Do > Tasks > Chart Review (selected)                    │
│    Canvas: List of Chart Review tasks                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Click task row
┌─────────────────────────────────────────────────────────────────────┐
│ 2. PATIENT WORKSPACE OPENS                                          │
│    Menu: Patient Workspaces > Maria Johnson > Sign Chart (new tab)  │
│    Overview: Patient context [Overview] [Activity]                  │
│    Canvas: Chart with sign-off section                              │
│    Context Bar: [↩ Chart Review (3) | Next → | ✕]                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Complete task OR click "Next →"
┌─────────────────────────────────────────────────────────────────────┐
│ 3a. NEXT TASK (same or different patient)                           │
│    Workspace switches to next task's patient                        │
│    Context Bar updates: [↩ Chart Review (2) | Next → | ✕]           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ OR click "↩ Chart Review"
┌─────────────────────────────────────────────────────────────────────┐
│ 3b. RETURN TO LIST                                                  │
│    Canvas: Back to Chart Review list (item marked complete)         │
│    Context Bar: Hidden                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Search → Patient

```
1. User searches for patient (global search or My Patients)
2. Click patient result
3. Patient workspace opens:
   - Overview: Patient context
   - Canvas: Patient Home (summary + quick actions)
4. No context bar (didn't come from To-Do)
```

### Schedule → Visit

```
1. User in Visits hub viewing today's schedule
2. Click scheduled appointment
3. Patient workspace opens:
   - Overview: Patient context
   - Canvas: Visit workspace (charting view)
   - Child tab: "Today's Visit" created
4. No context bar (didn't come from To-Do)
```

---

## Context Bar

### Purpose

A persistent navigation aid that appears when navigating FROM a To-Do list TO a patient workspace. Enables quick return or progression without losing place.

**Not a toast:** Does not auto-dismiss. Visually distinct from notification toasts.

### Visual Design

```
┌────────────────────────────────────────────────────────────────┐
│  ↩ Chart Review (3 remaining)   │   Next →   │   ✕            │
└────────────────────────────────────────────────────────────────┘
```

| Element | Purpose |
|---------|---------|
| ↩ [Filter Name] | Return to originating To-Do list |
| (N remaining) | Shows count for context/motivation |
| Next → | Load next item in same filtered list |
| ✕ | Dismiss bar, stay in current workspace |

### Behavior Rules

| Trigger | Context Bar Action |
|---------|-------------------|
| Navigate from To-Do to patient | **Appears** with return context |
| Click "↩ [Filter]" | **Hides**, returns to To-Do list |
| Click "Next →" | **Updates** with new context (may change patient) |
| Click "✕" | **Dismisses**, user stays in workspace |
| Navigate elsewhere via menu | **Hides** (user chose different destination) |
| Return to same workspace later | **Reappears** if not dismissed |
| Complete To-Do item | **Updates** count; shows "All done!" if last |

### "Next" Behavior

"Next →" loads the next item from the same filtered list:
- Uses current sort order
- May switch to different patient
- If no more items: bar shows "All done! ↩ Chart Review"

### Context Bar Scope

Context bar is **per workspace**, showing only the most recent source:
- User opens Task A (from Chart Review) for Maria → context bar shows "↩ Chart Review"
- User opens Task B (from Rx Requests) for Maria → context bar updates to "↩ Rx Requests"
- Only one context bar per workspace, always reflects most recent entry point
- Different workspaces can have different context bars

### Position

- Top of canvas pane, below floating nav row
- Subtle/integrated style (not blocking content)
- Sticky (doesn't scroll with content)

### Future Enhancement

Consider adding "← Prev" for bidirectional navigation:
```
┌─────────────────────────────────────────────────────────────────────┐
│  ↩ Chart Review (3)   │   ← Prev   │   Next →   │   ✕             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Menu Click Behaviors

### To-Do Categories

| Click Target | Behavior |
|--------------|----------|
| "Tasks (4)" | Expand children + navigate to My Pending |
| "My Pending (4)" | Navigate to My Pending list |
| "Chart Review" | Navigate to Chart Review list |
| "All Tasks" | Navigate to unfiltered task list |

**Rationale:** Badge count on category represents default filter (My Pending). Clicking delivers what the badge promises.

### Patient Workspaces

| Click Target | Behavior |
|--------------|----------|
| "Maria Johnson" | Expand children + navigate to Overview |
| "Today's Visit" | Navigate to visit tab |
| "[Task name]" | Navigate to task tab |

**Rationale:** Clicking patient opens their context. Specific work is in child tabs.

### Expand vs. Navigate

For expandable items (categories with children):
- Single click: expand AND navigate to default child
- Expand indicator (chevron): expand/collapse only, no navigation

---

## Breadcrumb Model

The app uses an **implicit breadcrumb** model through menu state:

```
Menu shows current location:
To Do
├─ Tasks
│  ├─ My Pending ← (highlighted/selected)
│  └─ ...
```

Combined with the context bar for To-Do flows, users always know:
1. Where they are (menu highlight)
2. Where they came from (context bar, if from To-Do)
3. How to get back (context bar or menu click)

### No Explicit Breadcrumb Trail

**Decision:** No persistent "Home > To Do > Tasks > My Pending" breadcrumb bar.

**Rationale:**
- Menu already shows hierarchy
- Context bar handles return navigation
- Saves vertical space
- EHR workflows are more "hub and spoke" than deep hierarchies

---

## Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd + \` | Toggle menu pane |
| `Cmd + Shift + \` | Toggle overview pane |
| `Cmd + .` | Toggle AI drawer |
| `Escape` | Close AI drawer / Dismiss context bar |
| `Cmd + [` | Go back (browser-like) |
| `Cmd + ]` | Go forward |

### Future: Power User Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + K` | Global search (command palette) |
| `Cmd + J` | Quick switch between open workspaces |
| `N` (in To-Do list) | Go to next item |
| `P` (in To-Do list) | Go to previous item |

---

## Deep Linking

### URL Structure

```
/home                           → Staff dashboard
/visits                         → Schedule view
/to-do/tasks/my-pending         → Tasks > My Pending list
/to-do/tasks/chart-review       → Tasks > Chart Review list
/to-do/inbox/unsorted           → Inbox > Unsorted list
/patient/{id}                   → Patient workspace (Overview)
/patient/{id}/visit/{visitId}   → Patient workspace > Visit tab
/patient/{id}/task/{taskId}     → Patient workspace > Task tab
```

### Bookmarkable States

| State | Bookmarkable | Notes |
|-------|--------------|-------|
| To-Do filter view | Yes | Full URL path |
| Patient workspace | Yes | Patient ID in URL |
| Patient child tab | Yes | Tab ID in URL |
| Filter chips (Newest, Mine Only) | Partial | Via query params if needed |
| Context bar state | No | Session-only |

---

## Transition Animations

### Pane Transitions

| Transition | Animation |
|------------|-----------|
| Menu open/close | Slide + fade (300ms ease-out) |
| Overview open/close | Width collapse (250ms ease-out) |
| Patient workspace switch | Crossfade (200ms) |

### Context Bar

| Transition | Animation |
|------------|-----------|
| Appear | Slide down + fade in (200ms) |
| Update | Content crossfade (150ms) |
| Dismiss | Slide up + fade out (150ms) |

### List → Detail

| Transition | Animation |
|------------|-----------|
| Click To-Do item | Workspace slides in from right (300ms) |
| Return to list | Workspace slides out to right (250ms) |

---

## Edge Cases

### Multiple To-Do Items for Same Patient

User opens Task A for Maria, then opens Task B for Maria:
- Both become child tabs in Maria's workspace
- Context bar shows most recent source (Task B's list)
- Switching between tabs doesn't change context bar

### Navigating Away Then Back

User is in Chart Review → Maria → navigates to Home → back to Maria:
- Context bar reappears (Maria was reached via To-Do)
- Context bar remembers original source (Chart Review)

### Last Item in List

User completes last item in Chart Review:
- Context bar: "All done! ↩ Chart Review"
- "Next →" disabled or hidden
- Click return → shows empty list with "All caught up!" message

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-31 | Initial navigation patterns documentation | Claude + William |
