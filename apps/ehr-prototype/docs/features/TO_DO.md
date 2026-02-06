# Feature: To-Do Workflow

> **Status:** Design Complete
> **Last Updated:** 2025-01-31
> **Related Docs:** [Information Architecture](../INFORMATION_ARCHITECTURE.md) | [Navigation Patterns](../NAVIGATION_PATTERNS.md)

---

## Overview

To-Do is the central hub for actionable work items. It aggregates tasks, faxes, messages, and care adherence items into filterable, workable lists.

### Design Goals

1. **Reduce friction** - Minimize clicks from "I need to do work" to "I'm doing work"
2. **Preserve context** - Never lose your place in a list
3. **Support throughput** - Enable power users to process many items efficiently
4. **Clear ownership** - Know what's mine vs. all items

---

## Information Architecture

### Menu Structure

```
To Do                            ← Section header (not clickable)
├─ Tasks              (4)        ← Badge = My Pending count
│  ├─ My Pending      (4)
│  ├─ Chart Review
│  ├─ Chart Sign-Off
│  ├─ Review Results
│  ├─ Rx Requests
│  ├─ Follow-Ups
│  └─ All Tasks
├─ Inbox              (6)        ← Badge = Unsorted count
│  ├─ Unsorted        (6)
│  └─ All Faxes
├─ Messages          (12)        ← Badge = My Pending count
│  ├─ My Pending     (12)
│  └─ All Messages
└─ Care               (3)        ← Badge = My Pending count
   ├─ My Pending      (3)
   └─ All Care
```

### Category Definitions

| Category | Contains | Default Filter |
|----------|----------|----------------|
| **Tasks** | Discrete action items (calls, chart work, follow-ups) | My Pending |
| **Inbox** | Incoming faxes requiring triage/filing | Unsorted |
| **Messages** | Patient and staff message threads | My Pending |
| **Care** | Care adherence tracking (imaging, follow-ups) | My Pending |

---

## Task Types (Tasks Category)

| Filter | Description |
|--------|-------------|
| My Pending | Tasks assigned to me, not completed |
| Chart Review | Charts requiring review before sign-off |
| Chart Sign-Off | Charts ready for signature |
| Review Results | Lab/imaging results needing review |
| Rx Requests | Prescription refill requests |
| Follow-Ups | Patient follow-up tasks |
| All Tasks | Unfiltered view of all tasks |

---

## Fax Inbox

### Location-Based Filtering

Fax inboxes are location-specific (each clinic has its own fax number).

**Default behavior:**
- Defaults to user's clock-in location for the day
- Location shown in filter chips: `[Boston Downtown 123-456-7890]`
- Can switch locations via filter chip

**Multi-location support:**
- Staff can help other locations' inboxes
- Clear indicator of which location is being viewed
- Switching is session-temporary (doesn't change clock-in)

### Fax Workflow

```
1. Fax arrives → appears in "Unsorted"
2. User opens fax → sees fax content + patient search
3. User links fax to patient → fax moves to patient's documents
4. Optional: User opens patient workspace to act on fax
```

**Linking behavior:**
- Linking updates fax record
- User can stay in Inbox (batch triage) or open patient
- Context bar appears if navigating to patient

---

## List View Design

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔍 Search Tasks                           [≡ Filter] [+ New Task]  │
├─────────────────────────────────────────────────────────────────────┤
│ [Newest ▾] [✓ Mine Only] [✓ Incomplete] [Any Type ▾]               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [Ad] Call Patient: Questions About Today's Visit                │ │
│ │     Dante P. · 31y M · 12345678                                 │ │
│ │     Owner: Paige Anderson, PA-C    Due 9/24/24    Created 9/20  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [Ba] Sign Off Chart: PR1                                        │ │
│ │     ...                                                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ← 1 2 3 4 5 →                                      [Bulk Actions]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Chips

| Chip | Type | Options |
|------|------|---------|
| Sort | Dropdown | Newest First, Oldest First, Due Date, Patient Name |
| Mine Only | Toggle | On/Off |
| Status | Toggle | Incomplete, All |
| Type | Dropdown | Any Type, specific types per category |
| Location (Inbox only) | Dropdown | List of clinic locations |

### Row Structure by Category

**Tasks:**
```
[Avatar] [Title]
         [Patient: Name · Age Gender · MRN]
         [Owner] [Due Date (color-coded)] [Created Date]
```

**Inbox (Faxes):**
```
[Type Icon] [Fax Type: Billing, Lab Results, etc.]
            [Sender: Name · Phone]
            [Patient: Linked or "Review Required"] [Date]
```

**Messages:**
```
[Avatar] [Subject]
         [Patient: Name · Age Gender · MRN]
         [Preview: Patient msg / Staff msg] [Time]
```

**Care Adherence:**
```
[Avatar] [Type: Follow-Up, Imaging, etc.] [Status Badge: New, Urgent, Stat]
         [Patient: Name · Age Gender · MRN]
         [Ref: Owner] [Due Date (color-coded)] [Created Date]
```

---

## Item Selection Flow

### Opening an Item

```
1. User clicks row in To-Do list
2. System checks: Does patient have existing workspace?
   ├─ Yes → Focus that workspace
   └─ No → Create workspace for patient
3. Create child tab with item name (e.g., "Sign Chart: PR1")
4. Canvas shows item detail with actions
5. Overview shows patient context
6. Context bar appears: "↩ [Filter Name] (N) | Next → | ✕"
```

### Completing an Item

```
1. User takes action (signs chart, responds to message, etc.)
2. Item marked complete in system
3. Context bar updates count
4. User choices:
   ├─ "Next →" → Load next item (same filter)
   ├─ "↩ Filter" → Return to list
   └─ "✕" → Stay in patient workspace
```

---

## Actions and Events

### Completing Actions Creates Events

| Action | Timeline Event |
|--------|----------------|
| Sign chart | "Chart signed by [Provider]" |
| Review results | "Results reviewed by [Provider]" |
| Send message | "Message sent to [Patient]" |
| Approve Rx refill | "Prescription sent: [Med Name]" |
| Deny Rx refill | "Refill denied: [Reason]" |
| File fax | "Document filed to [Section]" |

### Status Transitions

| From | Action | To |
|------|--------|-----|
| Pending | Complete | Done (removed from list) |
| Pending | Reassign | Pending (different owner) |
| Pending | Defer | Scheduled (future date) |

---

## Bulk Actions

Available at list level for batch processing:

| Action | Description |
|--------|-------------|
| Assign to... | Reassign selected items |
| Change due date | Bulk update due dates |
| Mark complete | Complete multiple items |
| Export | Export list to CSV |

---

## Empty States

### No Items in Filter

```
┌─────────────────────────────────────────┐
│                                         │
│     ✓ All caught up!                    │
│                                         │
│     No pending items in Chart Review.   │
│     [View All Tasks]                    │
│                                         │
└─────────────────────────────────────────┘
```

### No Items in Category

```
┌─────────────────────────────────────────┐
│                                         │
│     📭 Inbox empty                      │
│                                         │
│     No faxes to review.                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Reference Screenshots

Screenshots of existing To-Do functionality (different architecture but shows object types and list structure):

- `resources/to-do/To-Do_ Tasks.png`
- `resources/to-do/To-Do_ Fax.png`
- `resources/to-do/To-Do_ Msg.png`
- `resources/to-do/To-Do_ Care Adherence.png`

---

## Future Considerations

### Unified "My Pending" View

Aggregate view showing all pending items across categories.

**Challenges:**
- Different row structures per type
- Filter chips ambiguous across types
- Sorting mixed types (not all have due dates)

**Potential approach:**
- Polymorphic rows (type-specific renderers)
- Grouped sections within unified list
- Smart sorting (urgency-based rather than date-based)

### Custom Saved Filters

Allow users to save filter combinations:
- "My overdue tasks"
- "All Rx requests this week"
- "Unlinked faxes from Quest"

**UI consideration:** Where do saved filters appear?
- As additional menu items under category?
- As filter chip presets?
- As separate "Saved Filters" section?

### Recents

Quick access to recently viewed items:
- "Recent Tasks" showing last 5-10 viewed
- Useful for returning to partially completed work

### Smart Defaults

Auto-set filters based on context:
- Morning: prioritize overnight items
- End of day: prioritize items due today
- After vacation: show items from while away

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-31 | Initial To-Do feature documentation | Claude + William |
