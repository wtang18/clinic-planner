# EHR Prototype: Future Considerations

> **Status:** Parking Lot
> **Last Updated:** 2025-01-31
> **Purpose:** Capture ideas, enhancements, and decisions deferred for future consideration

---

## Overview

This document captures ideas that emerged during design discussions but were intentionally deferred. Items here are not rejected—they're parked for future evaluation when the core system is more mature.

---

## Information Architecture

### Unified "My Pending" Aggregate View

**Concept:** Single view showing all pending items across To-Do categories (Tasks, Inbox, Messages, Care).

**Why deferred:**
- Different row structures make unified display complex
- Users typically pick a category based on what kind of work they want to do
- Badge counts on categories provide visibility without aggregation

**Revisit when:**
- User research shows demand for cross-category triage
- Row components are mature enough for polymorphic rendering

**Implementation notes:**
- Would need type-specific row renderers within same list
- Or grouped sections (Tasks section, Messages section, etc.)
- Filter chips become complex (which filters apply to which types?)

### Smart Context Switching

**Concept:** System auto-selects appropriate view based on context.

Examples:
- Morning: prioritize overnight items
- End of day: prioritize items due today
- Returning from vacation: show items from while away
- After completing all Chart Reviews: auto-switch to next category

**Why deferred:**
- Requires usage pattern data to tune
- Risk of being presumptuous about user intent

**Revisit when:**
- Have analytics on user workflows
- Can A/B test smart defaults vs. manual selection

---

## Navigation

### Bidirectional Context Bar

**Concept:** Add "← Prev" to context bar for bidirectional navigation:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ↩ Chart Review (3)   │   ← Prev   │   Next →   │   ✕              │
└─────────────────────────────────────────────────────────────────────┘
```

**Why deferred:**
- "Next" covers 80% of use cases
- "Prev" adds UI complexity
- Can always return to list and navigate from there

**Revisit when:**
- User feedback indicates need for bidirectional flow
- Power users request keyboard shortcuts for prev/next

### Command Palette (Cmd+K)

**Concept:** Global search and command interface:

```
┌─────────────────────────────────────────────┐
│ 🔍 Search patients, actions, or type /...   │
├─────────────────────────────────────────────┤
│ Recent:                                     │
│   Maria Johnson (patient)                   │
│   Chart Review (filter)                     │
│ Actions:                                    │
│   /new-task - Create new task               │
│   /message - Send message                   │
└─────────────────────────────────────────────┘
```

**Why deferred:**
- Core navigation needs to be solid first
- Requires significant engineering investment

**Revisit when:**
- Core navigation patterns are implemented
- Power users are identified and engaged

### Quick Workspace Switcher (Cmd+J)

**Concept:** Fast switching between open patient workspaces:

```
┌─────────────────────────────────────────────┐
│ Switch to:                                  │
│   ▸ Maria Johnson - Today's Visit           │
│     John Smith - Chart Review               │
│     Anna Williams - Message                 │
└─────────────────────────────────────────────┘
```

**Why deferred:**
- Menu pane already shows open workspaces
- Lower priority than core workflows

**Revisit when:**
- Users have many simultaneous workspaces
- Tab management becomes a pain point

---

## To-Do Enhancements

### Custom Saved Filters

**Concept:** Allow users to save filter combinations as named views:
- "My overdue tasks"
- "All Rx requests this week"
- "Unlinked faxes from Quest"

**Open questions:**
- Where do saved filters appear in menu?
- Personal vs. shared filters?
- How many is too many?

**Why deferred:**
- Core filtering needs to work first
- Requires filter persistence infrastructure

### Recents Section

**Concept:** Quick access to recently viewed To-Do items.

```
To Do
├─ Recent                    ← New section
│  ├─ Sign Chart: Maria J.
│  ├─ Lab Results fax
│  └─ Message: John S.
├─ Tasks (4)
└─ ...
```

**Why deferred:**
- Context bar provides return navigation for current session
- Menu could get cluttered

**Revisit when:**
- Users report losing track of in-progress work across sessions

### Notification/Alert Integration

**Concept:** Push new urgent items to user's attention:
- Toast notification: "Stat lab results for Maria Johnson"
- Badge pulse on relevant category
- Sound alert (optional)

**Why deferred:**
- Notification strategy needs holistic design
- Risk of alert fatigue

**Revisit when:**
- Defining overall notification architecture

---

## Patient Workspace

### Workspace Templates

**Concept:** Pre-configured workspace states for common scenarios:
- "Annual Physical" template: Opens specific sections
- "Urgent Visit" template: Prioritizes certain info
- "Follow-up" template: Shows relevant history

**Why deferred:**
- Need to understand workflow patterns first
- Adds complexity to workspace model

**Revisit when:**
- Clear workflow patterns emerge from usage

### Split Canvas View

**Concept:** Split canvas into two panes for comparing/referencing:
- Left: Current visit note
- Right: Previous visit note

```
┌──────────────────────────┬──────────────────────────┐
│   Today's Visit          │   Last Visit (01/15)     │
│   [editing]              │   [reference]            │
└──────────────────────────┴──────────────────────────┘
```

**Why deferred:**
- Significant layout complexity
- Overview pane may serve reference needs

**Revisit when:**
- Users report needing side-by-side comparison
- Canvas layout is more mature

### Workspace Pinning

**Concept:** Pin important workspaces to prevent auto-archive:
- Pinned workspaces don't auto-close after 7 days
- Appear at top of Patient Workspaces section

**Why deferred:**
- Auto-archive behavior not yet implemented
- May not be needed if archive works well

---

## Overview Pane

### Compact/Expanded Modes

**Concept:** Toggle between compact (headlines only) and expanded (full detail) for Overview sections:

```
Compact:                        Expanded:
┌─────────────────────┐        ┌─────────────────────────────┐
│ Allergies (2)       │        │ Allergies                   │
│ Medications (5)     │        │ • Penicillin - Anaphylaxis  │
│ Problems (3)        │        │ • Sulfa - Rash              │
└─────────────────────┘        │                             │
                               │ Medications                 │
                               │ • Lisinopril 10mg daily     │
                               │ • Metformin 500mg BID       │
                               │ • ...                       │
                               └─────────────────────────────┘
```

**Why deferred:**
- Current single mode may be sufficient
- Adds UI complexity

**Revisit when:**
- Users report Overview pane is too dense or too sparse

### Section Tapping → Canvas Detail

**Concept:** Tapping an Overview section (e.g., "Allergies") loads full detail + history + trends in canvas.

**Current status:** Designed but not implemented.

**Implementation notes:**
- Each section becomes a navigable entity
- Canvas shows section-specific detail view
- May create child tab or replace canvas content
- Individual overview items (e.g., a specific allergy, medication) should also be tappable to open a detail/activity-log view. This requires mapping overview data objects (`Allergy`, `Medication`, etc.) to `ChartItem` entities or creating a lightweight detail pane for non-chart-item data.

---

## Quick Charting

### NL Parameter Parsing — Non-Rx Categories

**Concept:** The unified omni-input includes regex-based NL parameter parsing for Rx items (e.g., "benzonatate 100mg po tid" → pre-filled dosage/route/frequency). Extending this to other categories (labs, imaging, referrals) would allow similar shorthand entry.

**Why deferred:** Rx parsing covers the highest-value use case. Other categories have less standardized shorthand. AI-assisted parsing is a better fit for free-text → structured mapping in non-Rx categories.

**Scope:**
- Lab: "cbc stat" → priority=stat, "lipid fasting" → fastingRequired=true
- Imaging: "cxr pa lateral" → study type + views
- Dx: "j20.9 acute bronchitis" → ICD code + description
- Generic: AI-assisted entity extraction from free text

**Revisit when:**
- Rx NL parsing is validated with users
- AI integration enables more sophisticated text understanding
- Provider feedback identifies high-value shorthand patterns for other categories

---

## Layout Architecture

### Unified Morphing Right Rail

**Concept:** A single right-rail component that adapts content per encounter mode:
- **Capture mode**: Processing status (current ProcessingRail — draft generation, task progress, status updates)
- **Process mode**: Completeness checklist + E&M level estimate + sign-off action
- **Review mode**: Final review summary + sign & close action

The rail provides persistent contextual information alongside the main content column, keeping status/actions visible while scrolling items.

**Why deferred:**
- Significant architectural refactor — requires new layout component, per-mode rail content, responsive behavior
- Current inline approach (ProcessingRail in capture, sign-off sections in process/review) works, though sign-off scrolls away
- Needs responsive design decisions first (rail width ranges, collapse behavior)

**Open decisions:**
- **Width**: Processing rail is 200px; sign-off needs ~280px minimum. Should the rail width vary per mode, or use a single width (e.g., 260px) that works for all?
- **Responsive behavior**: Should the rail grow at wide resolutions (e.g., flex 200-280px)? At what breakpoint does it collapse? Does it become a bottom sheet, inline section, or drawer on small screens?
- **Attention mechanism**: When collapsed on mobile, the rail receives async updates (draft results, processing status). How does the user know to expand it? Badge count? Notification dot? Toast?
- **Unified API**: Should this be one `<RightRail mode={mode} />` component, or a generic `<RightRail>` slot that each view fills with mode-specific content?
- **Coexistence**: In process/review modes, should the rail show processing status alongside sign-off (stacked), or replace processing entirely?

**Lighter-weight alternative:** Sticky footer for sign-off actions in process/review views. Keeps single-column layout while making the sign action persistent. Lower effort but less cohesive than the rail pattern.

**Revisit when:**
- Current refinements stabilize and encounter workflow patterns are validated
- Responsive layout phase is planned
- User research indicates sign-off actions need to be more persistent/visible

---

## Cross-Location Features

### Multi-Location Dashboard

**Concept:** For supervisors/admins, view across multiple locations:
- Aggregate To-Do counts
- Staff coverage overview
- Cross-location item assignment

**Why deferred:**
- Focus on single-location workflows first
- Requires role-based access control

### Location Handoff

**Concept:** Formally hand off work when changing locations:
- "End shift at Clinic A" action
- Reassigns pending items to covering staff
- Documents handoff in audit trail

**Why deferred:**
- Complex workflow implications
- Needs policy alignment

---

## Technical Considerations

### Offline Support

**Concept:** Work continues with intermittent connectivity:
- Queue actions when offline
- Sync when connection restored
- Conflict resolution for concurrent edits

**Why deferred:**
- Significant technical investment
- Unclear priority based on deployment context

### Real-time Collaboration

**Concept:** Multiple users can see each other's activity:
- "Dr. Smith is viewing this chart"
- Real-time updates when items are claimed
- Avoid duplicate work

**Why deferred:**
- Requires WebSocket infrastructure
- Privacy considerations for patient data

---

## Evaluation Criteria

When revisiting deferred items, consider:

1. **User demand** - Are users asking for this?
2. **Workflow impact** - Does it meaningfully improve efficiency?
3. **Implementation cost** - Engineering effort vs. value
4. **Maintenance burden** - Long-term complexity added
5. **Alternatives** - Can existing features solve the need?

---

## Changelog

| Date | Item Added/Updated | Reason |
|------|-------------------|--------|
| 2025-01-31 | Initial future considerations | Captured from IA design discussions |
| 2025-02-19 | Quick Charting data model cleanup | Deferred from Round 4.4 (defensive `?.` workaround in place) |
| 2025-02-19 | Overview item → detail view | Extended Section Tapping entry with individual item tapping |
| 2025-02-20 | Layout Architecture: Unified Morphing Right Rail | Documented from Round 4.5 responsive rail discussion |
| 2025-02-21 | Removed: Quick Charting Data Model Cleanup | Addressed in OmniAdd UX Rewrite Phase 0 |
| 2025-02-21 | Added: NL Parameter Parsing — Non-Rx Categories | Deferred from OmniAdd UX Rewrite; Rx-only regex included |
