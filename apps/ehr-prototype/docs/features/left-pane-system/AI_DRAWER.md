# AI Drawer — Design Specification

**Last Updated:** 2026-02-06
**Status:** Design Complete — Ready for Implementation
**Supersedes:** AI_CONTROL_SURFACE_V2.md §5 ("Needs dedicated design session")
**Related:** LEFT_PANE_SYSTEM.md (pane container), DRAWER_COORDINATION.md (bottom bar interaction), AI_CONTROL_SURFACE_V2.md §3-9 (minibar/palette content, nudge governance, context targeting), VOICE_INPUT.md (voice input — Phase 9)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Layout](#2-layout)
3. [Context Header](#3-context-header)
4. [Scroll Content Area](#4-scroll-content-area)
5. [Suggestions Section](#5-suggestions-section)
6. [Conversation History](#6-conversation-history)
7. [Footer: Quick Actions & Input](#7-footer-quick-actions--input)
8. [Empty States](#8-empty-states)
9. [Activity Log Modal](#9-activity-log-modal)
10. [Conversation Model](#10-conversation-model)
11. [Auto-Escalation](#11-auto-escalation)
12. [Bottom-Up Context Targeting](#12-bottom-up-context-targeting)
13. [Decision Log](#13-decision-log)
14. [Future Vision](#14-future-vision)

---

## 1. Overview

The AI Drawer is the **drawer-density** rendering of the AI module. The AI module is a single object with three progressive density tiers:

| Tier | Surface | Content Scope |
|---|---|---|
| **Minibar** | Bottom bar | Status line, nudge text, badge count |
| **Palette** | Bottom bar (expanded upward) | Quick actions, top suggestions, input, short responses |
| **Drawer** | Left pane | Everything palette has + full conversation history, all suggestions, activity log access |

The drawer doesn't replace the palette's content — it **contains** it plus more. The three tiers are three renderers reading from the same state tree. Switching between them is purely a UI concern — no data loading, no state reset.

### When the Drawer is Active

- AI module renders in the left pane at full pane height
- AI minibar, palette, and mini anchor are **hidden** from the bottom bar
- Bottom bar shows only the transcription module (if in encounter) or is hidden entirely (if no encounter and no transcription)

---

## 2. Layout

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░ gradient fade ░░░░░░░░░░░░ │
│ [◧]  [☰] [✦] [🎙?]                     │  A: Pane header (from LEFT_PANE_SYSTEM)
│                                         │
│ 🔄 Lauren · Cough x 5 days    [📋] [✕] │  E: Context header (floating, blur)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  (scrollable content — §4)              │  C: Scroll area
│                                         │
├─────────────────────────────────────────┤
│ [📋 Suggest] [⚠ Check] [📝 Summ...]  → │  Quick actions (horizontal scroll)
│ [🎤]  Ask AI...               [📋] [➤] │  D: Input row (opaque footer)
└─────────────────────────────────────────┘
```

### Zone Ownership

| Zone | Height | Owner |
|---|---|---|
| A — Pane header | ~40px | LEFT_PANE_SYSTEM (shared) |
| E — Context header | ~36px (floating) | AI Drawer |
| C — Scroll area | Flex fill | AI Drawer |
| D — Footer | ~80-90px | AI Drawer |

---

## 3. Context Header

A floating translucent bar displaying the AI module's current context scope. Uses heavy backdrop blur (`blur(20px)+`) so content scrolling behind is hinted at but not legible.

### Content

```
│ 🔄 Lauren Svendsen · Cough x 5 days    [📋] [✕] │
   ↑                                        ↑    ↑
   │                                        │    └── Dismiss: broadens scope one level
   │                                        └─────── Activity log modal
   └────────────────────────────────────────────── Context scope indicator
```

### Elements

| Element | Behavior |
|---|---|
| **🔄 Scope indicator** | Shows current context target (encounter, patient, global) |
| **Patient · Encounter label** | Safety anchor — confirms which patient/context AI is operating on |
| **[📋] Activity log** | Opens full-screen activity/history modal (§9) |
| **[✕] Dismiss** | Pops scope one level up the hierarchy (item → section → encounter → patient → global). Does not close the drawer. |

### Scope Hierarchy

```
Item → Section → Encounter → Patient → Global
(most narrow)                        (most broad)
```

Dismissing [✕] pops one level. At global scope, [✕] is hidden.

### Context Differences from Transcription

| Property | AI Drawer Context Header | Transcription Drawer Context Header |
|---|---|---|
| Scope | Flexible, user-directed | Fixed to session's encounter |
| Dismiss | Broadens scope | Not applicable |
| Activity log | [📋] icon present | Not present |
| Settings | No ⚙ (AI settings are global) | [⚙] present (opens full-screen modal) |

---

## 4. Scroll Content Area

The scroll area contains two sections in order:

1. **Suggestions section** (§5) — collapsible, at top
2. **Conversation history** (§6) — chronological thread

Content scrolls behind the floating context header with appropriate top padding.

---

## 5. Suggestions Section

AI-generated suggestions appear at the top of the scroll area as a collapsible section.

### Layout

```
│ ✦ 3 suggestions                [Show all] │
│ ● Add: Acute bronchitis (J20.9)    [+] [✕] │
│ ● Order: CBC w/ diff                [+] [✕] │
│ ● Consider: Chest X-ray             [+] [✕] │
```

### Display Rules

| Rule | Detail |
|---|---|
| **Default visible** | 3 suggestions shown. If more, [Show all] expands the section. |
| **Grouping** | Group by source if multiple sources present (transcription, AI analysis, care gap) |
| **Confidence threshold** | Only suggestions above confidence threshold (~0.6) appear. Below-threshold items accessible via [Show all]. |
| **Empty state** | Section collapses entirely when no active suggestions. No "No pending suggestions" message. |
| **Accepted/dismissed** | Animate out of the list. Accepted items appear in the activity log. |
| **Source label** | Each suggestion shows a source label: "From conversation", "Based on history", "Care gap" |

### Actions Per Suggestion

| Action | Icon | Behavior |
|---|---|---|
| **Accept** | [+] | Adds item to chart. Suggestion animates out. Logged in activity log. |
| **Dismiss** | [✕] | Removes suggestion. Logged in activity log as dismissed. |
| **Tap row** | — | Inline expand with editable fields → [Cancel] [Add to chart] |

### Interaction with Quick Actions

**Rule: Quick actions that would produce results already represented by active suggestions are filtered out.**

Each suggestion has a `source` and `category`. Each quick action maps to a category. If active suggestions cover a category, the corresponding quick action is suppressed from the footer.

Example: If there are active medication suggestions, "Suggest orders" is suppressed. When all medication suggestions are accepted/dismissed, "Suggest orders" reappears.

---

## 6. Conversation History

The multi-turn conversation between the user and AI renders as a chronological thread below the suggestions section.

### Message Types

| Type | Alignment | Visual |
|---|---|---|
| **User message** | Right-aligned bubble | Tinted background (violet) |
| **AI response** | Left-aligned, no bubble | Plain text on pane background |
| **System message** | Centered, muted | Small text — context changes, mode switches |

### Layout

```
│                                         │
│  System · 2:20 PM                       │
│  Context: Lauren Svendsen               │
│  Cough x 5 days · Capture mode          │
│                                         │
│        ┌───────────────────────┐        │
│        │ What meds is she on?  │  You   │
│        └───────────────────────┘        │
│                                         │
│  Lauren is currently taking:            │
│  • Metformin 500mg BID                  │
│  • Lisinopril 10mg daily               │
│  • Tylenol Extra Strength 500mg PRN    │
│  [Got it] [Ask more]                    │
│                                         │
│        ┌───────────────────────┐        │
│        │ Any interactions?     │  You   │
│        └───────────────────────┘        │
│                                         │
│  No significant interactions found      │
│  between these medications.             │
│  [Got it] [Ask more]                    │
│                                         │
```

### Display Rules

| Rule | Detail |
|---|---|
| **Timestamps** | On system messages and the first message in a conversation cluster. Not on every message. |
| **Follow-up actions** | Only shown on the **latest** AI response. Previous responses show text only — actions already acted on or expired. |
| **Auto-scroll** | Drawer auto-scrolls to the newest message on new content. If the user has manually scrolled up, auto-scroll pauses until they scroll back to bottom. |
| **Loading state** | "Thinking..." indicator with spinner below the latest user message while AI processes. |
| **Suggestion accept/dismiss** | Not shown in conversation thread — that's what the activity log is for. Keeps conversation focused on Q&A. |

### Context Change Markers

When the user changes AI context scope mid-conversation:

```
│  No significant interactions found.     │
│  [Got it]                               │
│                                         │
│  ─ · Context changed to: Lauren S. · ─  │
│                                         │
│        ┌───────────────────────┐        │
│        │ What's her A1c trend? │  You   │
│        └───────────────────────┘        │
```

### Palette ↔ Drawer Continuity

- Messages sent from the palette appear in the drawer when the user escalates
- The drawer shows the full history; the palette only shows the latest exchange (last user message + AI response)
- Responses truncated in the palette (due to limited viewport) render fully in the drawer
- Drawer always opens scrolled to the bottom (latest message)

---

## 7. Footer: Quick Actions & Input

The footer is the only **opaque** element in the AI drawer, anchored to the bottom of the pane. It contains two rows.

### Layout

```
├─────────────────────────────────────────┤
│ [📋 Suggest] [⚠ Check] [📝 Summ...]  → │  Quick action chips (horizontal scroll)
│ [🎤]  Ask AI...               [📋] [➤] │  Input row
└─────────────────────────────────────────┘
```

### Quick Action Chips

- Horizontal scrollable row of contextual action shortcuts
- Function as pre-composed prompts — tapping a chip is equivalent to typing the corresponding query
- Content is determined by Role × Workflow × Mode (defined in AI_CONTROL_SURFACE_V2.md §9)
- Chips that are redundant with active suggestions are filtered out (see §5)
- After a response, inline follow-up actions (Got it, Ask more, etc.) appear on the response in the scroll area — not in the quick actions row

### Quick Action States

| State | Quick Actions Content |
|---|---|
| No conversation, no suggestions | Full Role × Workflow × Mode default set |
| Active suggestions present | Filtered set (redundant actions removed) |
| After accepting/dismissing all suggestions in a category | Corresponding quick action reappears |

### Input Row

| Element | Description |
|---|---|
| **[🎤] Mic** | Voice input — two modes: press-and-hold for direct commands, tap for dictation. See **VOICE_INPUT.md** (Phase 9). |
| **Text input** | Auto-growing textarea, placeholder "Ask AI...", max height ~120px |
| **[📋] Paste/attach** | Future: attach context, paste chart items |
| **[➤] Send** | Submit query. Disabled when input is empty. |

### Keyboard Behavior

| Key | Action |
|---|---|
| Enter | Submit query |
| Shift+Enter | New line |
| ⌘K | Focus input (if drawer is active view) |

---

## 8. Empty States

### During Encounter (No Conversation, No Suggestions)

```
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 🔄 Lauren · Cough x 5 days    [📋] [✕] │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│                                         │
│                                         │
│            ✦                            │
│                                         │
│     AI is ready to help with            │
│     this encounter.                     │
│                                         │
│     Try asking a question or            │
│     use a quick action below.           │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [📋 Suggest] [⚠ Check] [📝 Summ...]  → │
│ [🎤]  Ask AI...               [📋] [➤] │
└─────────────────────────────────────────┘
```

### Outside Encounter (Inbox, Tasks, Population Management)

```
│ 🔄 Global                          [📋] │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│            ✦                            │
│                                         │
│     How can I help?                     │
│                                         │
├─────────────────────────────────────────┤
│ [📊 Prioritize] [📝 Draft] [🔍 Find] → │
│ [🎤]  Ask AI...               [📋] [➤] │
└─────────────────────────────────────────┘
```

### With Suggestions, No Conversation

Suggestions section renders at the top. No empty state illustration — the suggestions themselves are the call to action.

---

## 9. Activity Log Modal

The activity log is accessed via the [📋] icon in the AI drawer's context header. It opens as a **full-screen modal**.

### Content

A reverse-chronological timeline of all AI-related actions during the encounter/session:

```
┌─────────────────────────────────────────────────────────────┐
│  AI Activity                                        [Done]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Today · Cough x 5 days                                     │
│                                                             │
│  ✓ Drug interaction check              2:34 PM              │
│    No interactions found between                            │
│    Metformin, Lisinopril, Tylenol                          │
│                                                             │
│  ✕ Dismissed: Consider A1c recheck     2:31 PM              │
│    Care gap · Last A1c 8 months ago                        │
│                                                             │
│  ✓ Dx association: Lisinopril → I10    2:28 PM              │
│    Auto-linked, confirmed by provider                      │
│                                                             │
│  ✓ CBC w/ Differential ordered         2:25 PM              │
│    Accepted from suggestion                                │
│                                                             │
│  ✕ Dismissed: Add Vitamin D            2:22 PM              │
│    AI suggestion · Low confidence                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Entry Types

| Entry Type | Icon | Content |
|---|---|---|
| Accepted suggestion | ✓ | What was added + source |
| Dismissed suggestion | ✕ | What was dismissed + why it was suggested |
| Dismissed nudge | ✕ | Nudge text + category |
| Background task completed | ✓ | Task result summary |
| Background task failed | ⚠ | Error + [Retry] option |

### Rules

- **Not re-actionable.** Dismissed items are historical — no "undo dismiss" in the log.
- **Scoped to encounter** during encounters. Scoped to workflow session outside encounters.
- **[Done]** closes the modal and returns to the AI drawer.

---

## 10. Conversation Model

### Scope

| Context | Conversation Scope |
|---|---|
| During encounter | Per-encounter — tied to the encounter lifecycle |
| Outside encounter (inbox, tasks) | Per-workflow-session — persists while user stays in workflow area |

### Persistence

| State | Conversation |
|---|---|
| Encounter open/active | Persists, fully interactive |
| Encounter signed/closed | Read-only, persists for a grace period (org-configurable, e.g., 24-72 hours) |
| Grace period expired | Cleared. Activity log remains as the durable record. |
| Navigate to different patient | Clears (new patient context). Previous patient's conversation preserved if encounter still open. |
| Navigate from non-encounter to encounter | Non-encounter conversation clears. Fresh encounter conversation starts. |
| Navigate within same patient workspace | Preserved (transcription scope = patient workspace; AI matches) |

### Read-Only State (Post-Sign)

After encounter close, the conversation is viewable but the input row is replaced:

```
├─────────────────────────────────────────┤
│  Encounter signed · 2:45 PM             │
│  Conversation available until Feb 7     │
└─────────────────────────────────────────┘
```

No input, no quick actions. Review only.

### Manual Clear

Future enhancement: "Clear conversation" text link at top of conversation thread. Low priority — automatic lifecycle boundaries handle most cases.

---

## 11. Auto-Escalation

**Rule: Never auto-escalate from palette to drawer.**

The palette → drawer transition rearranges the layout (switches left pane content, reconfigures bottom bar). This is too heavy for an automatic action.

Instead, escalation is always user-initiated via:

1. **Drawer icon** in the palette's input row control area
2. **"Continue in drawer ↗"** follow-up action on AI responses

### "Continue in Drawer" Follow-Up

Appears as a tappable text link (same style as other response follow-ups like "Got it", "Ask more") when:

- 2+ messages in the current conversation, OR
- Response content exceeds ~3 scroll-lengths in the palette

Does **not** appear:
- On the first response
- For short, self-contained answers
- In the drawer itself (already there)

### ✦ View Toggle

The user can also switch to the AI drawer via the ✦ icon in the left pane header at any time. If there's an existing conversation (started in the palette), it appears in full in the drawer.

---

## 12. Bottom-Up Context Targeting

When a user taps an AI affordance on a specific chart item (e.g., the ✦ icon on a Lisinopril row), the AI module opens at **palette** tier (bottom bar) with the scope narrowed to that item.

| Element | Behavior |
|---|---|
| **Target** | Opens AI palette, not drawer |
| **Scope** | Narrowed to the specific item (e.g., "Lisinopril 10mg · Lauren Svendsen") |
| **Context header** | Shows item-level scope |
| **Quick actions** | Change to item-specific set (Alternatives, Interactions, Dose adjust) |
| **Escalation** | User can escalate to drawer normally; item scope carries over |

This keeps bottom-up targeting lightweight (palette) while preserving the option to go deeper (drawer).

---

## 13. Decision Log

| # | Decision | Rationale |
|---|---|---|
| 1 | Drawer contains everything palette has + more | Single state tree, three renderers. Drawer is superset. |
| 2 | Quick actions in footer (not top of scroll) | They're prompt shortcuts — functionally equivalent to typing. Belong near the input. |
| 3 | Quick actions filtered by active suggestions | Avoid showing actions that would produce redundant results |
| 4 | Conversation per-encounter, time-bounded persistence | Aligns with clinical workflow boundaries. Grace period for post-sign review. |
| 5 | Activity log in full-screen modal (not inline) | Keeps conversation thread clean. History is reference, not primary workflow. |
| 6 | No AI settings in drawer | AI preferences are global, not session-scoped. Settings live in app settings. |
| 7 | Never auto-escalate to drawer | Layout rearrangement too heavy for automatic action. "Continue in drawer" as follow-up. |
| 8 | Bottom-up targeting opens palette, not drawer | Palette is the lightweight interaction surface for item-specific queries. |
| 9 | Follow-up actions only on latest response | Previous responses are historical. Avoids stale action confusion. |
| 10 | Suggestions collapse when empty | No wasted space; conversation fills the scroll area |

---

## 14. Future Vision

### AI Responses as UI Modules

AI responses can evolve beyond text and suggestions to include rich interactive elements:

| Generation | Response Types |
|---|---|
| **v1 (current)** | Text, structured text, recommendations, summary |
| **v2 (future)** | + Charts/visualizations, interactive calculators, comparison tables |
| **v3 (vision)** | + Custom widgets, workspace modules, layout configurations |

### Promotion Pattern

Interactive response modules can be promoted from the AI drawer to the main chart canvas:

```
│  Here's Lauren's A1c trend:             │
│  ┌─────────────────────────────┐        │
│  │  📈 A1c over 24 months      │        │
│  │  7.4 ──── 7.2 ──── 6.8     │        │
│  └─────────────────────────────┘        │
│  [Add to canvas] [Share] [Got it]       │
```

"Add to canvas" promotes the widget from the AI drawer into the main work pane as a persistent module.

### Canvas Customization Spectrum

| Mode | Description |
|---|---|
| **Structured** | Fixed sections (current: Allergies, Meds, Problems, etc.) |
| **Flexible** | Rearrangeable sections + addable widgets |
| **Prompt-driven** | "Set up a workspace for managing CHF patients" → AI proposes layout |

This frames why the AI drawer is architecturally important — it's not just a chat interface, it's the staging area for dynamic workspace customization.

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-06 | Initial specification — drawer layout, conversation model, suggestion rules, activity log, future vision |
