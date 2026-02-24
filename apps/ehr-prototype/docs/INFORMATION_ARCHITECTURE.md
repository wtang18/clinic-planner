# EHR Prototype: Information Architecture

> **Status:** Active Design
> **Last Updated:** 2026-02-23
> **Related Docs:** [Layout Refactor](./LAYOUT_REFACTOR_PLAN.md) | [Navigation Patterns](./NAVIGATION_PATTERNS.md) | [To-Do Feature](./features/TO_DO.md) | [Visit Workflow](./features/VISIT_WORKFLOW.md)

---

## Overview

This document defines the information architecture (IA) for the EHR prototype, establishing how content is organized, how users navigate, and how different views relate to each other.

### Design Principles

1. **Context Preservation** - Users shouldn't lose their place when switching tasks
2. **Progressive Disclosure** - Show what's needed, reveal more on demand
3. **Consistent Patterns** - Similar actions work similarly across the app
4. **Minimal Navigation Depth** - Reduce clicks to reach actionable content

---

## Layout Structure

### Three-Pane Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLOATING LAYER                                │
│ ┌──────────┬────────────────────────────────────────────────────────┐│
│ │  Menu    │              Floating Nav Row                          ││
│ │  Pane    │   [controls] [patient context] [mode] [AI toggle]      ││
│ │          │                                                        ││
│ └──────────┴────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTENT SURFACE                               │
│ ┌──────────────────────┐ ┌──────────────────────────────────────────┐│
│ │   Overview Pane      │ │           Canvas Pane                    ││
│ │   (360px)            │ │           (flex)                         ││
│ │                      │ │                                          ││
│ └──────────────────────┘ └──────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Pane Purposes

| Pane | Purpose | Width | Collapsible |
|------|---------|-------|-------------|
| **Menu Pane** | Navigation hub (hubs, To-Do, patient workspaces) | 320px | Yes (floating) |
| **Overview Pane** | Contextual information (patient context, filters) | 360px | Yes |
| **Canvas Pane** | Primary work area (content, lists, details) | Flex | No |

### Pane Behavior by Context

| Menu Selection | Overview Pane | Canvas Pane |
|----------------|---------------|-------------|
| Home | Disabled/hidden | Staff dashboard |
| Visits | Disabled/hidden | Schedule view |
| To-Do category | Optional (filter chips) or disabled | Filtered item list |
| Patient Workspace | [Overview] [Activity] tabs | Active content |

---

## Menu Pane Structure

### Hierarchy

```
Hubs
├─ Home                          ← Staff dashboard
└─ Visits                        ← Schedule/calendar

To Do                            ← Section header (not clickable)
├─ Tasks              (4)        ← Click = expand + land on My Pending
│  ├─ My Pending      (4)
│  ├─ Chart Review
│  ├─ Chart Sign-Off
│  ├─ Review Results
│  ├─ Rx Requests
│  ├─ Follow-Ups
│  └─ All Tasks
├─ Inbox              (6)        ← Click = expand + land on Unsorted
│  ├─ Unsorted        (6)
│  └─ All Faxes
├─ Messages          (12)        ← Click = expand + land on My Pending
│  ├─ My Pending     (12)
│  └─ All Messages
└─ Care               (3)        ← Click = expand + land on My Pending
   ├─ My Pending      (3)
   └─ All Care

Patient Workspaces               ← Section header
├─ Maria Johnson                 ← Click = expand + land on Overview
│  ├─ Today's Visit
│  └─ [child tabs from To-Do]
└─ John Smith
```

### Menu Item Behaviors

| Item Type | Click Behavior | Badge Represents |
|-----------|----------------|------------------|
| Hub (Home, Visits) | Navigate to view | N/A |
| To-Do category | Expand + land on default filter | My Pending count (or Unsorted for Inbox) |
| To-Do filter | Navigate to filtered list | Items matching filter |
| Patient workspace | Expand + land on Overview | Pending items for patient |
| Patient child tab | Navigate to that tab | N/A |

### Decision: To-Do Categories Not Directly Selectable

**Rationale:**
- "All Tasks" is rarely a useful starting point
- Badge count represents "My Pending" - clicking should show those items
- Consistent promise: badge says 4, click shows 4

**Alternative Considered:** Click shows "All" with filter chips
- Rejected: misleading when badge shows filtered count

---

## Patient Workspace Model

### Workspace Lifecycle

**Opening a Workspace:**
- Via schedule (click visit)
- Via To-Do (click item)
- Via search (find patient)
- Via "My Patients" panel

**Initial State by Entry Point:**

| Entry Point | Overview Pane | Canvas Pane |
|-------------|---------------|-------------|
| Search | [Overview] tab | Patient Home (summary + quick actions) |
| To-Do item | [Overview] tab | Specific item detail (child tab) |
| Schedule visit | [Overview] tab | Visit workspace |
| My Patients | [Overview] tab | Patient Home |

**Patient Home Canvas:**
- Upcoming appointments
- Pending tasks for this patient
- Recent activity summary
- Quick actions: Start Visit, Send Message, Order Labs

### Child Tabs

Child tabs represent specific work contexts within a patient workspace:
- Today's Visit
- Task: Call Patient
- Fax: Lab Results
- Message Thread

**Rules:**
- Flat structure (no nested child tabs)
- Auto-created when opening To-Do items
- Can be manually closed
- System suggests cleanup for stale tabs (like Slack)

### Visit Sub-Items (Workflow / Chart)

Active encounters show **Workflow** and **Chart** as sub-items under the visit entry:

```
├── Sarah Chen
│   ├── Overview
│   └── 10/12 · UC Cough              [Triage]
│       ╰ Workflow
│       ╰ Chart                        ← active
```

- Visit row: date prefix + label, right-aligned status badge, tappable (goes to last active state)
- Sub-items: text-only, no icons, CSS connector arrows (right-angled line from visit row)
- Past visits: flat, no sub-items (read-only reference)
- Nav row segmented control is context-dependent: Workflow phases or Chart modes

See [Visit Workflow](./features/VISIT_WORKFLOW.md) for full details.

### Workspace Persistence

- Workspaces persist during session
- Auto-archive after 7 days of inactivity
- Recent Patients list for quick re-open
- Never auto-close workspace with pending items

---

## Overview Pane Modes

### Patient Context Mode

When a patient workspace is active:

```
┌─────────────────────────────┐
│ [Overview]  [Activity]      │  ← Segmented control
├─────────────────────────────┤
│                             │
│  [Tab content here]         │
│                             │
└─────────────────────────────┘
```

**Overview Tab:**
- Allergies (safety-critical, always first)
- Medications
- Problems
- Care Gaps
- Vitals

**Activity Tab:**
- Temporal feed of patient events
- Filterable/sortable
- Selection → loads detail in canvas

### Disabled/Hidden Mode

For non-patient contexts (Home, Visits, To-Do lists):
- Overview pane can be hidden entirely
- Canvas takes full available width
- Or: narrow filter sidebar within canvas

---

## Hub Definitions

### Home

Staff dashboard showing:
- Personal staffing schedule (2-week calendar view)
- Today's details:
  - Other staff at location(s)
  - Metrics (RVU, length of stay, review/NPS)
  - Clinic/region/company announcements
- "Jump back in" - recent patients/workspaces

### Visits

Schedule/calendar view:
- Today's appointments
- Clicking visit → opens patient workspace with visit tab
- Filter by provider, location, status

---

## Future Considerations

See [FUTURE_CONSIDERATIONS.md](./FUTURE_CONSIDERATIONS.md) for:
- Unified "My Pending" aggregate view
- Custom saved filters
- Cross-location workflows
- Workspace templates

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-23 | Added Visit sub-items (Workflow/Chart) to Patient Workspace model | Claude + William |
| 2025-01-31 | Initial IA documentation | Claude + William |
