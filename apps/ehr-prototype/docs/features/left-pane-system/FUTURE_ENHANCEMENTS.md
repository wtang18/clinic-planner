# Future Enhancements — Vision & Opportunities

**Last Updated:** 2026-02-06
**Status:** Documentation Only — Not Scheduled for Implementation
**Origin:** Design sessions for LEFT_PANE_SYSTEM, AI_DRAWER, TRANSCRIPTION_DRAWER, DRAWER_COORDINATION

---

This document captures vision items, enhancement opportunities, and architectural possibilities that emerged during design sessions but are explicitly **out of scope** for the current prototype. They are preserved here to inform future planning and ensure valuable ideas aren't lost.

---

## 1. Beacon Strip — Situational Awareness

### Concept

A compact strip of contextual awareness indicators displayed in the left pane when not in Menu view. Shows what needs attention without requiring the user to switch back to Menu.

### Goals

- Maintain situational awareness of important items while focused on AI or Transcript
- Reduce "what am I missing?" anxiety when nav is hidden
- Provide direct-tap navigation to urgent items

### Design

Small badge icons in the pane header, right-aligned:

```
│ [◧]  [☰] [✦] [🎙?]     [④] [⑥] [①]   │
```

- Only items with badge count > 0 appear
- Tapping navigates directly and switches pane to Menu
- Max ~4 items to prevent header crowding
- Ordered by urgency, not alphabetically

### Context-Dependent Content

| Context | Beacon Sources |
|---|---|
| **During encounter** | Clinic flow / operational awareness: waiting room count, room status, STAT lab results, team alerts |
| **Non-encounter (to-do work)** | Nav badge counts: Tasks, Inbox, Messages, Rx Requests |
| **Non-encounter (population mgmt)** | Panel alerts: overdue screenings, gap closure deadlines |

### Why Deferred

- Encounter-context beacons require a real-time clinic awareness data source not in current architecture
- The ☰ icon is one tap away — beacons are convenience, not necessity
- Pane header space is limited at 320px width

### Prerequisites

- Clinic flow awareness service (for encounter beacons)
- Beacon data provider interface to abstract context-dependent sources

---

## 2. Pane View Persistence

### Concept

Re-expand the left pane to the last active view instead of always defaulting to Menu.

### Design

Store `lastActiveView: PaneView` in pane state. On expand, validate before restoring:

- **Menu:** Always valid
- **AI:** Always valid
- **Transcript:** Valid only if transcription session exists for current patient

If stored view is invalid, fall back: AI → Menu.

### Why Deferred

- Simpler to always open to Menu — predictable, no edge cases
- Can add after user testing reveals whether the default-to-Menu pattern causes friction

---

## 3. Adaptive Pane Width

### Concept

Left pane widens (e.g., 340-360px) when AI Drawer is active for better conversation readability. Returns to 320px for Menu view.

### Design

- CSS transition on pane width (200ms ease-in-out)
- Patient overview and chart canvas columns adjust via flex/grid
- Only AI Drawer triggers wider width (Transcript and Menu use standard 320px)

### Why Deferred

- Adds animation complexity and layout reflow
- 320px is workable for prototype
- Conversation content at 320px should be tested before adding dynamic width

---

## 4. AI-as-Navigator

### Concept

AI actions that navigate the user to specific chart sections, open detail views, or trigger workflows — partially replacing the displaced navigation when the pane is in AI mode.

### Examples

- "Go to Lab Results" → navigates chart canvas to lab section
- "Open Lisinopril details" → opens right-side detail drawer for that medication
- "Start Rx workflow for amoxicillin" → opens prescription workflow
- "Show me overdue care gaps" → navigates to care gap view

### Value

Validates the thesis that AI can serve as an intelligent navigation layer, reducing the need for traditional menu-based wayfinding.

### Why Deferred

- Requires AI action execution framework (intent → navigation mapping)
- Navigation targets need to be addressable/deep-linkable
- Prototype focuses on conversational AI, not agentic navigation

---

## 5. AI Response Modules & Canvas Customization

### Concept

AI responses evolve beyond text and suggestions to include rich interactive UI elements that can optionally be promoted to the main chart canvas.

### Response Type Evolution

| Generation | Response Types | Surface |
|---|---|---|
| **v1 (current)** | Text, structured text, recommendations, summary | Inline in drawer/palette |
| **v2** | + Charts/visualizations, interactive calculators, comparison tables | Inline, promotable to canvas |
| **v3** | + Custom widgets, workspace modules, layout configurations | Drawer → canvas via drag or action |

### Example Scenarios

| User Request | AI Response Module |
|---|---|
| "Show me her A1c trend" | Interactive line chart with data points |
| "Compare these two antibiotics" | Side-by-side comparison table |
| "Calculate BMI-adjusted dosing" | Interactive calculator widget |
| "Set up my workspace for diabetes management" | Proposed canvas layout, one-click apply |

### Promotion Pattern

```
│  Here's Lauren's A1c trend:             │
│  ┌─────────────────────────────┐        │
│  │  📈 A1c over 24 months      │        │
│  │  7.4 ──── 7.2 ──── 6.8     │        │
│  └─────────────────────────────┘        │
│  [Add to canvas] [Share] [Got it]       │
```

### Canvas Flexibility Spectrum

| Mode | Description | Users |
|---|---|---|
| **Structured** | Fixed sections (current) | Default, most users |
| **Flexible** | Rearrangeable sections + addable widgets | Power users, specialists |
| **Prompt-driven** | AI proposes workspace layout from natural language | Future vision |

### Why Deferred

- Requires widget rendering framework, canvas layout engine, and promotion mechanics
- Significant UX research needed on clinical workspace customization preferences
- Current prototype validates the AI drawer as a conversational interface first

---

## 6. Scribe Role — Drawer as Primary Surface

### Concept

For Scribe users, the transcription drawer is the primary work surface — auto-opened on encounter entry, with inline entity highlighting and documentation assistance.

### Design Differences

| Aspect | Provider | Scribe |
|---|---|---|
| Drawer on encounter entry | Menu (default) | Transcript drawer (auto-open) |
| Entity highlighting | Not shown (too distracting) | Inline highlights on extracted entities |
| AI nudge tolerance during recording | Minimal | Standard (scribe's job is documentation) |
| Primary workflow | Chart canvas | Transcript drawer + chart canvas |

### Why Deferred

- Role-specific layouts add complexity
- Provider workflow is the primary prototype target
- Scribe patterns can be layered on after core architecture is stable

---

## 7. Cross-Module Animation Polish

### Concept

When a module escalates from palette (bottom bar) to drawer (left pane), animate a visual connection between the two surfaces — content slides/morphs toward the left pane rather than a simple cut.

### Why Deferred

- Sequential transition (collapse palette → swap pane content) is clean enough for prototype
- Animation bridging requires coordinated layout awareness between bottom bar and left pane
- Polish item — doesn't affect functionality

---

## 8. Conversation Persistence Beyond Session

### Concept

Extend conversation availability beyond the current grace period. Providers could reference AI conversations from past encounters as part of chart review or quality audits.

### Design

- Conversations stored with encounter metadata
- Accessible from encounter history / chart archive
- Read-only, searchable
- Retention policy: org-configurable (30 days, 90 days, permanent)

### Why Deferred

- Requires persistent conversation storage backend
- HIPAA implications for storing AI conversations alongside clinical records
- Grace period (24-72 hours) covers the immediate post-visit review need

---

## 9. Tablet / Mobile Responsive Patterns

### Concept

How the left pane system behaves at smaller breakpoints:

- **Tablet landscape:** Left pane as overlay (not push) to avoid squeezing center content
- **Tablet portrait:** Left pane as full-screen slide-over
- **Mobile:** Bottom sheet for all drawer content (AI and Transcript)

### Why Deferred

- Prototype targets desktop/laptop form factor
- Mobile clinical workflows differ significantly — likely need separate design session
- Core architecture (state model, view switching) is breakpoint-agnostic

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-06 | Initial compilation of future enhancements from left pane design sessions |
