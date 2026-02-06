# AI Control Surface — Design Specification v2

**Last Updated:** 2026-02-03
**Status:** Design Complete — Ready for Implementation
**Supersedes:** AI_CONTROL_SURFACE.md (v1, 2026-02-02)

> **📌 Partial Supersession Notice**
> - **AI_DRAWER.md** (in `features/left-pane-system/`) supersedes §5 (Drawer - Full Assistant)
> - The drawer now renders in the left pane, not as a bottom bar expansion
> - §3-4, §6-12 remain authoritative for minibar/palette behavior

---

## Table of Contents

1. [System Context](#1-system-context)
2. [Physical Architecture](#2-physical-architecture)
3. [Minibar (Collapsed State)](#3-minibar-collapsed-state)
4. [Palette (Expanded State)](#4-palette-expanded-state)
5. [Drawer (Full Assistant)](#5-drawer-full-assistant)
6. [Context Targeting](#6-context-targeting)
7. [Nudge Governance](#7-nudge-governance)
8. [Mode-Aware Behavior](#8-mode-aware-behavior)
9. [Role × Workflow × Mode Composition](#9-role--workflow--mode-composition)
10. [Audio Input Model](#10-audio-input-model)
11. [Population Management Interface](#11-population-management-interface)
12. [Implementation Notes](#12-implementation-notes)
13. [Open Items](#13-open-items)

---

## 1. System Context

### What the AI Control Surface Is

The AI Control Surface is a **bottom-docked UI component** that provides cross-cutting AI awareness, free-text/voice command input, proactive nudges, and quick actions. It uses a three-tier progressive disclosure model: Minibar → Palette → Drawer.

### What It Is NOT

The AI Control Surface is **one of several AI touchpoints** in the system, not the central AI hub. Other touchpoints handle domain-specific responsibilities:

| Touchpoint | Responsibility | Scope |
|---|---|---|
| **AI Control Surface** | Cross-cutting AI awareness, commands, nudges | Global / encounter-wide |
| **Inline item actions** | Item-specific AI operations | Single chart item |
| **Section modules** | Embedded processing status per chart section | Single section |
| **OmniAdd** | Input-focused item creation with AI assist | Input context |
| **Alert overlays** | Critical patient safety alerts (modal/banner) | Safety-critical |
| **Transcription feedback** | Live entity extraction display | Transcription stream |

### Responsibility Boundaries

The AI Control Surface **does**:
- Provide cross-cutting AI awareness (activity indicators, completion badges)
- Accept free-text and voice command input
- Deliver proactive nudges (non-critical, governed)
- Offer context-relevant quick actions
- Serve as entry point to the full AI drawer

The AI Control Surface **does not**:
- Handle critical patient safety alerts (dedicated alert system)
- Manage item-specific actions (inline affordances on chart items)
- Show domain-specific processing status (section modules)
- Display live transcription text (dedicated transcription UI)

---

## 2. Physical Architecture

### Layout: CSS Grid Single Component

The Control Surface is a **single component** with two regions coordinated via CSS Grid. This replaces the v1 architecture of two separate animated components.

```
┌──────────────────────────────────────────────────────────────┐
│  [Context Pill]  │ gap │  [AI Surface]                       │
│  Grid column 1   │     │  Grid column 2                      │
└──────────────────────────────────────────────────────────────┘
     Fixed total width — grid enforces constant container
```

```typescript
type AIControlState =
  | { mode: 'minibar'; transcription: TranscriptionStatus; expanded: boolean }
  | { mode: 'palette'; transcription: TranscriptionStatus }
  | { mode: 'drawer'; transcription: TranscriptionStatus };

// Grid column allocation by state
const getGridColumns = (state: AIControlState): string => {
  if (state.mode === 'palette') return '48px 1fr';      // Pill minimized
  if (state.mode === 'minibar' && state.expanded) return '260px 1fr';  // Expanded transcription
  return '160px 1fr';                                     // Default
};
```

### Three-Tier Progressive Disclosure

| Tier | Height | Trigger | Content |
|---|---|---|---|
| **Minibar** | 48px | Default state | Single-line status, idle prompt, or nudge |
| **Palette** | ~400px max | Tap minibar or ⌘K | Quick actions, suggestions, AI responses |
| **Drawer** | Full panel | Tap drawer icon or auto-escalate | Complete AI assistant with conversation |

### Transitions

| From → To | Animation | Duration | Trigger |
|---|---|---|---|
| Minibar → Palette | Vertical expand + pill minimizes | 300ms | User tap, ⌘K, auto-open (governed) |
| Palette → Minibar | Vertical collapse + pill restores | 200ms | Close button, tap minimized pill, Escape |
| Palette → Drawer | Slide-over or expand | 300ms | Drawer icon, auto-escalate (3+ messages) |
| Drawer → Palette | Reverse slide | 200ms | Collapse button |
| Any → Any (mode switch) | Palette closes, minibar updates | 300ms | User switches operational mode |

---

## 3. Minibar (Collapsed State)

### Content Types

Five mutually exclusive content types, displayed one at a time with a defined priority hierarchy:

| Priority | Type | Visual | Description |
|---|---|---|---|
| 1 (highest) | `command-listening` | Waveform + live text | Voice command mode active |
| 2 | `response` | Tinted text summary | After AI query completion |
| 3 | `nudge` | Tinted text + optional inline action | Proactive governed push |
| 4 | `activity` | Subtle pulse + task count | Background processing awareness |
| 5 (lowest) | `idle` | "Ask AI · ⌘K" (muted) | Nothing pending |

### Content Type Details

#### `idle`
- Display: `Ask AI · ⌘K` in muted text
- Behavior: Tap opens palette. Keyboard shortcut ⌘K opens palette.
- When: Nothing else to show.

#### `nudge`
- Display: Tinted text (max ~50 chars) + optional inline action button
- Behavior: Tap text opens palette with nudge detail. Tap action executes inline.
- Dismissal: Swipe or ✕. Dismissed nudges never resurface as nudges.
- Frequency: Governed by tier system (see §7).

#### `activity`
- Display varies by task count:
  - 1 task: `✨ Checking drug interactions…` (specific, named)
  - 2-3 tasks: `✨ AI active · 2 tasks running` (aggregate)
  - 4+ tasks: `✨ AI active · 4 tasks running`
- Completion flash: `✨ Drug interaction check — clear ✓` (3 seconds, then folds into count)
- Badge: `[✨³]` = 3 informational results ready to review in palette

#### `response`
- Display: Tinted summary of most recent AI response (truncated to one line)
- Behavior: Tap opens palette showing full response
- Persistence: Until user opens palette to see response, or new higher-priority content arrives

#### `command-listening`
- Display: Animated waveform + live transcription text of voice command
- Behavior: Active while voice command is being processed
- Duration: Typically 2-10 seconds per command

### Activity Escalation

Task completion results follow a three-tier escalation path:

| Severity | Definition | Destination |
|---|---|---|
| **Critical** | Patient safety (drug interactions, allergy alerts) | Dedicated alert system (modal/banner). Minibar not involved. |
| **Attention** | Should see soon (Dx linkage needed, order ready to send) | Minibar nudge with action button |
| **Informational** | FYI (formulary confirmed, note generated) | Activity indicator + badge count |

---

## 4. Palette (Expanded State)

### Layout Anatomy

```
┌─────────────────────────────────────────────────────┐
│  1. Nudge banner (sticky, collapsible, cycles)       │
│─────────────────────────────────────────────────────│
│  2. Primary content area (one of four types)         │
│                                                      │
│                                                      │
│─────────────────────────────────────────────────────│
│  3. Secondary compact row (tap to swap with primary) │
│─────────────────────────────────────────────────────│
│  4. Input / action row                               │
└─────────────────────────────────────────────────────┘
```

### Primary Content Priority Engine

The palette shows **one primary content type** at a time. The system auto-selects based on priority:

```
if (hasResponse)                → primary = 'response'
else if (hasSuggestions)        → primary = 'suggestions'
else if (hasActivityAttention)  → primary = 'activity-expanded'
else                            → primary = 'quick-actions'
```

**Key rule:** Quick actions hide when suggestions exist. Suggestions are the specific version of what quick actions would produce. Quick actions only appear when nothing more specific is available.

**User override:** The secondary compact row is an active toggle. Tap it to swap primary and secondary. Once manually switched, palette respects user's choice until closed.

### Primary Content Types

#### Quick Actions
Context-dependent action chips. Sets defined per Role × Workflow × Mode (see §9).

Example set (Provider · Encounter · Capture):
```
[📋 Suggest orders]  [⚠️ Check interactions]  [📝 Summarize]  [🔍 Review gaps]
```

#### Suggestions

```typescript
interface PaletteSuggestion {
  id: string;
  displayText: string;
  category: ItemCategory;         // diagnosis, medication, lab, etc.
  confidence: number;             // 0–1
  source: 'transcription' | 'ai-analysis' | 'care-gap';
  sourceLabel: string;            // Human-readable: "From conversation", "Based on history"
  editable: boolean;
  editableFields?: EditableField[];
  rank: number;
}
```

Display rules:
- Show top 3-5 suggestions expanded
- Group by source if multiple sources present
- Collapse below confidence threshold (e.g., 0.6) behind "+N more"
- If >10 total, show top 5 + "View all in drawer"
- Editing: Tap row → inline expand with editable fields → [Cancel] [Add to chart]

#### AI Response

| Type | Display | Actions |
|---|---|---|
| `text` | Plain answer | Got it · Ask more · Copy |
| `structured` | Table/list with severity indicators | Acknowledge · Act on… · Ask more |
| `recommendation` | List of items with rationale | Add all · Add selected · Dismiss |
| `summary` | Formatted clinical text (HPI/Assessment/Plan) | Use this · Edit · Regenerate |
| `error` | Error message | Retry · Dismiss |

**No auto-collapse after response.** Clinical users need to act on responses, not just read and dismiss. Palette stays open until explicitly closed.

Follow-up suggestions appear as **tappable text links** below the response (not chips — differentiated from quick actions).

#### Activity Summary (Process Mode Primary)

Task inbox showing items grouped by status:
- Needs attention (drug interactions, Dx linkage)
- Ready to send (labs, prescriptions)
- Bottom: [Batch approve all]

Note: In Process mode, the palette's activity summary **defers to the Task Pane** if it's already visible. The palette then shows only AI-specific tasks, suggestions, and nudges.

### Nudge Banner

- Sticky at top of palette, collapsible on scroll
- Cycles if multiple nudges pending (with dot indicators)
- Structure matches minibar nudge but with expanded detail + multiple action buttons
- Dismissing in palette = dismissed globally (same contract as minibar)

### Input Row

- Always present at bottom: "Ask AI…" text input with send button
- When AI response is displayed and input is hidden by response actions, an "Ask AI" button in the action row reveals input inline
- Drawer auto-escalation:
  - User taps drawer icon → immediate transition
  - 2nd follow-up message → system suggests "Continue in full assistant?" (non-blocking)
  - 3rd message → auto-transition, palette content transfers
  - Content exceeds ~3 scroll-lengths → show "Open full view" affordance

---

## 5. Drawer (Full Assistant)

> **Status:** Needs dedicated design session. Key points established:

- Full conversation history with the AI assistant
- Contains nudge history log (dismissed nudges viewable but not re-actionable as nudges)
- Activity log (all completed background tasks and their results)
- Supports multi-turn conversation with full context
- Can be opened directly via drawer icon or auto-escalated from palette
- Content from palette transfers seamlessly on transition

---

## 6. Context Targeting

### Context Target Types

```typescript
type ContextTargetType =
  | 'encounter'   // Patient + specific visit (default during encounters)
  | 'patient'     // Patient broadly (all encounters, history)
  | 'section'     // Specific chart section (medications, labs, etc.)
  | 'item'        // Specific chart item (a single medication)
  | 'cohort'      // Group of patients (aggregate, no individual PHI)
  | 'global';     // No patient context (general clinical Q&A)
```

### Scope Hierarchy

```
Item → Section → Encounter → Patient → Cohort → Global
(most narrow)                              (most broad)
```

### Navigation

- **Dismissing** the context banner pops one level up the stack (not straight to global)
- **Re-narrowing:** ↻ icon or [+] button to pick a new target
- **Bottom-up entry:** Tapping an AI affordance on a chart item/section pushes that scope onto the stack

Context stack example:
```
[global] → [patient: Lauren] → [encounter: cough-5d] → [item: Lisinopril]
  ✕ pops to encounter    ✕ pops to patient    ✕ pops to global
```

### Entry Points

| Direction | Mechanism | Example |
|---|---|---|
| **Top-down** | Change scope in palette header banner | Dismiss, re-add, pick from list |
| **Bottom-up** | Tap AI affordance on chart item/section | "AI" icon on Lisinopril row → palette targets that item |

### Context Target → Content Cascade

| Target | Quick Actions | Suggestions | Nudges | AI Scoping |
|---|---|---|---|---|
| **Item** (Lisinopril) | Alternatives? · Interactions? · Dose adjust? | Item-specific | Item-specific | Scoped to this item |
| **Section** (Medications) | Review all meds · Reconcile · Check interactions | Section-wide | Section-relevant | Scoped to this section |
| **Encounter** | Full encounter set (default) | All active suggestions | All encounter nudges | Full visit context |
| **Patient** | Summarize history · Trends · Care gaps | Cross-encounter | Patient-level | Full patient history |
| **Cohort** | Compare outcomes · Treatment patterns | Aggregate insights | Population-level | No individual PHI |
| **Global** | General clinical Q&A | None | None | No patient context |

### Palette Header Variations

```
Encounter:  [↻] Lauren Svendsen · Cough x 5 days   [✕]
Patient:    [👤] Lauren Svendsen · All encounters    [↻] [✕]
Item:       [💊] Lisinopril 10mg daily               [↑] [✕]
Section:    [📋] Medications (3 items)               [↑] [✕]
Cohort:     [👥] Diabetic patients on Metformin (n=47)    [✕]
Global:     [🌐] General assistant                   [+]
```

### Cohort Support (v1)

Natural language input only — no dedicated cohort definition UI. The AI infers scope from the query ("How are my diabetic patients doing on this regimen?") and the palette header updates to show the inferred cohort context.

---

## 7. Nudge Governance

### Nudge Structure

```typescript
interface MinibarNudge {
  id: string;
  category: 'care-gap' | 'workflow' | 'quality' | 'efficiency' | 'regulatory';
  priority: 'low' | 'medium' | 'high';
  text: string;                  // Max ~50 chars for minibar display
  icon?: string;
  tint: 'info' | 'action' | 'warning';
  inlineAction?: {
    label: string;
    action: string;
    payload: Record<string, unknown>;
  };
  detail?: {
    title: string;
    body: string;
    actions: NudgeAction[];
  };
  source: 'care-gap-engine' | 'workflow-rules' | 'ai-analysis' | 'org-policy';
  dismissable: boolean;
  expiresAt?: Date;
  ruleId: string;
  suppressible: boolean;
}
```

### Nudge Examples

| Category | Text | Tint | Inline Action |
|---|---|---|---|
| Care gap | "A1C overdue · last 14mo ago" | action | [Order] |
| Workflow | "3 items need Dx linkage" | info | [Review] |
| Workflow | "Ready to summarize this conversation?" | info | [Summarize] |
| Regulatory | "PDMP check required for controlled Rx" | warning | [Check] |
| Quality | "HPI section thin — 2 sentences" | info | [Expand] |

### Governance Tiers

```
System → Org → Practice → Location → Provider
```

Each tier can:
- Enable/disable nudge categories
- Set frequency caps
- Set priority thresholds
- Customize timing rules

Inheritance: Lower tiers inherit from higher tiers and can restrict further. Lower tiers **cannot** override safety-critical nudges or expand beyond what higher tiers allow.

### Frequency Controls

```typescript
interface NudgeFrequencyConfig {
  maxPerEncounter: number;       // Default: 3
  maxPerHour: number;            // Default: 5
  cooldownAfterDismiss: number;  // Seconds. Default: 120
}
```

### Nudge Lifecycle

```
Generated → Governance check → Displayed → Outcome → Logged
                                              │
                                    ┌─────────┼─────────┐──────────┐
                                    ▼         ▼         ▼          ▼
                                  Action   Dismiss   Expire    Supersede
```

- **Dismissed** nudges never resurface as nudges but are logged in the drawer for reference
- **Dismissed care gap nudges** re-appear as checklist items in Review mode's pre-flight check (different mechanism — not a nudge)

---

## 8. Mode-Aware Behavior

### Design Principle

The AI surface shifts its personality across operational modes:

```
QUIET ◄──────────────────────────────────────────► ACTIVE
  │                                                    │
  Capture                    Process               Review
  "I'm here when             "Here's what          "Here's what's
   you need me"               needs fixing"         still missing"
```

Least intrusive during Capture (patient in the room), most proactive during Review (quality gate before sign-off).

### Capture Mode

**Cognitive state:** "Getting it down" — patient typically in room, speed and flow paramount.

| Component | Behavior |
|---|---|
| Minibar default | `idle` — quiet |
| Nudge frequency | Suppressed except `high` priority. Max 1/encounter during active recording. Loosens when paused. |
| Activity display | Badge only, no flash-on-complete (accumulate silently) |
| Palette primary | Suggestions (from transcription entity extraction) |
| Palette quick actions | Minimal: "Suggest orders" · "Check interactions" |
| Palette auto-open | No — user opens intentionally |
| Nudge categories | `regulatory` always. `care-gap` and `workflow` only when recording paused. `quality` and `efficiency` suppressed. |

#### Capture Sub-States (Transcription-Aware)

| Transcription State | AI Surface Adjustment |
|---|---|
| `idle` (not started) | Standard capture behavior |
| `recording` | **Maximum quiet.** Nudges suppressed to `regulatory` only. Activity badge-only. Suggestions accumulate but don't push to minibar. |
| `paused` | **Brief proactivity window.** Workflow nudge ("Summarize?") if enough content. Pending suggestions surfaced to minibar. `attention`-level activity promoted to nudge. Wait 2-3s after pause before surfacing (avoid accidental pause triggers). Surface at most 1 nudge + suggestion count. Don't auto-open palette. |
| `processing` | Activity indicator: "Processing conversation…". On completion, suggestions batch-appear in palette. |

### Process Mode

**Cognitive state:** "Getting it right" — patient typically not in room, accuracy and thoroughness matter.

| Component | Behavior |
|---|---|
| Minibar default | `activity` — "N tasks to review" (orienting) |
| Nudge frequency | Standard. All categories except `efficiency`. Max 3/session. |
| Activity display | Expanded — show task counts, flash completion for 3s |
| Palette primary | Activity summary (tasks needing review) |
| Palette quick actions | "Batch approve" · "Link diagnoses" · "Send orders" · "Flag for review" |
| Palette auto-open | Auto-open on mode entry if ≥3 tasks need review (one-time, dismissable) |
| Nudge categories | All except `efficiency`. `workflow` particularly relevant. |

**Task Pane deference:** When the Task Pane (Process mode's primary UI) is visible, the palette defers — showing only suggestions, nudges, and AI queries rather than duplicating the task list. The palette's activity section becomes "AI-specific tasks" only.

### Review Mode

**Cognitive state:** "Is this complete?" — post-visit quality gate before sign-off.

| Component | Behavior |
|---|---|
| Minibar default | `nudge` — proactively surface completeness: "2 items to review before sign-off" |
| Nudge frequency | Most active. All categories. Max 5/session (higher budget for quality gate). |
| Activity display | Note generation status prominent if in progress |
| Palette primary | Completeness checklist or AI response (if note just generated) |
| Palette quick actions | "Generate note" · "Check completeness" · "Review gaps · N" · "Sign off" |
| Palette auto-open | Auto-open on mode entry with completeness summary. Auto-nudge if sign-off attempted with unresolved items. |
| Activity escalation | All results promoted to nudges immediately — last chance to surface issues. |

#### Pre-Flight Checklist (Review Palette)

```
┌─────────────────────────────────────────────────────┐
│  Ready for sign-off?                                 │
│                                                      │
│  ✓ All items have Dx linkage                         │
│  ✓ Drug interactions reviewed                        │
│  ⚠ 1 care gap not addressed (A1C)        [Address]   │
│  ⚠ HPI section thin — 2 sentences        [Expand]    │
│  ✓ Note generated and reviewed                       │
│                                                      │
│  [Review gaps · 1]  [Generate note]  [Sign off]      │
└─────────────────────────────────────────────────────┘
```

#### Sign-Off Blocking

If user taps "Sign off" with unresolved items, palette intercepts (not a modal):

```
┌─────────────────────────────────────────────────────┐
│  Cannot sign off — 2 items need attention            │
│                                                      │
│  ⚠ Care gap: A1C not addressed                       │
│    [Order A1C]  [Exclude: Not applicable]  [Skip]    │
│                                                      │
│  ⚠ PDMP not checked (required for controlled Rx)     │
│    [Check PDMP]                                      │
│                                                      │
│  [Override and sign] (requires documented reason)    │
└─────────────────────────────────────────────────────┘
```

"Override and sign" exists because clinical judgment sometimes supersedes system rules — but it requires a documented reason for audit logging.

### Mode Transition Behaviors

| Transition | AI Surface Behavior |
|---|---|
| Capture → Process | Minibar: idle/quiet → activity-forward. Palette primary swaps to activity summary if open. Pending suggestions carry over. Nudge budget resets. May auto-surface: "5 tasks to review." |
| Process → Review | Minibar: → completeness-oriented. Palette shows pre-flight checklist on first open. Note generation triggers automatically if not already done. Dismissed care gap nudges re-appear as checklist items (not nudges). |
| Review → Capture | Resets to capture quiet mode. Carries over unresolved items but doesn't nag. |
| Any → Any | Palette closes on mode switch (clean slate). Minibar updates within 300ms. Context target maintained. Nudge history maintained (dismissed stays dismissed). |

---

## 9. Role × Workflow × Mode Composition

### Context Model

Three independent axes compose together:

```typescript
interface AIContextProfile {
  role: Role;
  workflow: Workflow;
  mode?: OperationalMode;           // Only applies within encounters
  traits: {
    nudgeFrequency: 'minimal' | 'standard' | 'active';
    transcriptionAvailable: boolean;
    voiceCommandAvailable: boolean;
    quickActionSet: string;
    minibarVariant: 'standard' | 'compact' | 'status-only';
    paletteFeatures: PaletteFeature[];
    activityVisibility: 'full' | 'summary' | 'hidden';
  };
}
```

### Minibar Variants

| Variant | Content Types | Roles |
|---|---|---|
| `standard` | All five types | Provider, Scribe, Clinic Manager |
| `compact` | `idle` + `nudge` only | MA, X-Ray Tech |
| `status-only` | Minimal indicator | Front Desk |

### Non-Encounter Workflows

Modes (Capture/Process/Review) only apply within encounters. Outside encounters, behavior is simpler — driven by Role × Workflow only:

| Workflow | Minibar Default | Nudge Tolerance | Quick Actions |
|---|---|---|---|
| **Inbox / Tasks** | "N items need attention" | High (review context) | Prioritize · Batch sign · Draft response |
| **Schedule** | Idle | Low (focused work) | Find opening · Check conflicts · Patient prep |
| **Check-in** | "N patients in queue" or idle | Medium | Verify insurance · Missing docs · Print forms |
| **Admin** | Idle | Medium | Unsigned notes · Compliance · Utilization |

### Complete Trait Resolution Table

| Role | Workflow | Mode | Minibar Variant | Nudge Freq | Primary Content Bias | Quick Actions |
|---|---|---|---|---|---|---|
| Provider | Encounter | Capture (recording) | standard | minimal | Suggestions (passive) | Suggest orders · Check interactions |
| Provider | Encounter | Capture (paused) | standard | standard | Suggestions (active) | Suggest orders · Check interactions · Summarize |
| Provider | Encounter | Process | standard | standard | Activity summary | Batch approve · Link Dx · Send orders |
| Provider | Encounter | Review | standard | active | Completeness checklist | Generate note · Check completeness · Sign off |
| Provider | Inbox | — | standard | active | Quick actions | Prioritize · Batch sign · Draft response |
| MA | Encounter | Capture | standard | standard | Suggestions (intake) | Intake checklist · Verify meds · Flag allergies |
| MA | Check-in | — | compact | medium | Quick actions | Verify insurance · Missing docs · Print forms |
| Scribe | Encounter | Capture (recording) | standard | standard | Suggestions (active) | Note structure · Section jump · Capture check |
| X-Ray Tech | Encounter | Capture | compact | minimal | Quick actions | View order · Protocol reference |
| Front Desk | Check-in | — | status-only | medium | — | Queue status · Eligibility · Print forms |
| Clinic Mgr | Admin | — | standard | medium | Quick actions | Unsigned notes · Compliance · Utilization |

### Scribe Interruption Tolerance

A Scribe's interruption tolerance during recording is **higher** than a Provider's. The Scribe's job is documentation, not splitting attention between patient and screen.

- Nudge frequency during recording: `standard` (vs. Provider's `minimal`)
- Minibar can show transcription-derived suggestions more proactively
- Palette can show real-time entity extraction counts as a working aid

---

## 10. Audio Input Model

### Two Concurrent Streams

| Stream | Purpose | Duration | Processing |
|---|---|---|---|
| **Ambient transcription** | Continuous background capture of conversation | Session-long | Entity extraction, suggestion generation |
| **Voice commands** | Discrete commands to the AI | 2-10 seconds | Intent recognition, action execution |

### Activation Model: Wake Word / Push-to-Command

Ambient transcription runs continuously. Voice command mode activates temporarily via button press or trigger phrase.

| Component | During Ambient | During Command |
|---|---|---|
| Context Pill | Shows recording state (waveform, duration) | Shows "Listening for command…" overlay |
| Minibar | Normal behavior per mode | `command-listening` content type (highest priority) |
| Palette | Shows live transcription confirmation for voice command | |

Command mode times out after ~10 seconds of silence, returning to ambient-only.

---

## 11. Population Management Interface

### Paradigm Difference

| Dimension | Encounter Workflows | Population Management |
|---|---|---|
| Tempo | Minutes (single visit) | Days/weeks (ongoing) |
| Trigger | Clinician action or conversation | Data changes, time thresholds, registry updates |
| User posture | Actively engaged | Scanning dashboards, delegating |
| AI role | Assistant (suggests, checks) | Agent (monitors, flags, prioritizes) |
| Scale | 1 patient | 50–2000+ patients |

### Connection to AI Control Surface

The AI Control Surface is **not** the primary interface for population management. It serves as a contextual enrichment layer when a provider opens a specific patient's chart from "My Patients."

```
Population Management Layer
  │
  ├─→ My Patients dashboard (primary UI for population overview)
  ├─→ Inbox/Tasks (delegated work items for MA/staff)
  └─→ AI Control Surface (contextual nudge when viewing specific patient)
```

Example: Provider opens Lauren Svendsen from panel →
- Context target auto-set to `patient` level (not encounter)
- Palette quick actions: "View care gaps (3)" · "Compare to panel" · "Outreach history"
- Nudge: "A1C overdue — flagged in panel review 2 weeks ago"
- If provider starts encounter → context narrows, population insights persist as available context

### Tiered Automation Model (Future)

| Level | AI Does | Human Does |
|---|---|---|
| **Monitor** | Watches for conditions, flags thresholds | Reviews flags, decides action |
| **Triage** | Prioritizes flagged patients by urgency | Reviews prioritized list, adjusts |
| **Prepare** | Pre-stages actions (draft orders, outreach) | Reviews and approves |
| **Act** | Executes routine actions per protocol | Monitors exceptions, handles escalations |

v1 scope: Monitor + Triage. Prepare is stretch. Act requires significant governance/compliance work.

### Deferred Design Areas

- Dashboard UI for "My Patients" (worklist/registry view)
- Automation protocol definitions (what AI can do autonomously)
- UC vs. PC panel differences (empaneled vs. recent patients)
- Delegation model (routing work to correct role)
- HEDIS / CMS quality measure integration

---

## 12. Implementation Notes

### v1 Refactor from Current Implementation

The current implementation has documented bugs (animation desync, width overflow, state conflicts). The refactor path:

1. **Merge to single component** with CSS Grid layout
2. **Single state machine** replaces 4+ competing state variables
3. **`gridTemplateColumns` animation** replaces independent motion.divs
4. **Remove width math** — grid container enforces constant total width

### State Machine (Core)

```typescript
type ControlSurfaceEvent =
  | { type: 'TOGGLE_PALETTE' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TRANSCRIPTION_CHANGED'; status: TranscriptionStatus }
  | { type: 'MODE_CHANGED'; mode: OperationalMode }
  | { type: 'NUDGE_RECEIVED'; nudge: MinibarNudge }
  | { type: 'NUDGE_DISMISSED'; id: string }
  | { type: 'ACTIVITY_UPDATED'; tasks: BackgroundTask[] }
  | { type: 'RESPONSE_RECEIVED'; response: AIResponse }
  | { type: 'CONTEXT_TARGET_CHANGED'; target: ContextTarget }
  | { type: 'COMMAND_LISTENING_START' }
  | { type: 'COMMAND_LISTENING_END' };
```

### Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard-accessible
- Screen reader announcements for state changes (nudges, activity completion)
- Reduced motion support (instant transitions, no waveform animation)
- Focus management: palette trap-focus when open, return focus on close

### Animation Specifications

| Property | Duration | Easing |
|---|---|---|
| Horizontal (grid columns) | 200ms | ease-out |
| Vertical (palette expand) | 300ms | ease-out |
| Content fade | 150ms | ease-in-out |
| Nudge banner cycle | 400ms | ease-in-out |
| Activity flash | 3000ms display, 200ms fade-out | linear / ease-out |

---

## 13. Open Items

### Needs Dedicated Design Session
- [ ] Drawer content and behavior (conversation history, nudge/activity logs, multi-turn UX)
- [ ] Population management dashboard ("My Patients" primary UI)
- [ ] Error and degraded states (AI service failure, network drops, partial results)

### Needs Implementation Detail
- [ ] Nudge governance admin UI (tier configuration)
- [ ] Context target picker UI (for top-down scope changes)
- [ ] Voice command intent recognition model and supported commands
- [ ] Cohort context — how AI infers cohort from natural language queries

### Carried Forward from v1
- [ ] CSS Grid refactor of current implementation
- [ ] Toast + undo for transcription discard
- [ ] Keyboard shortcuts (Space for pause/resume, ⌘K for palette)
- [ ] Haptic feedback for mobile interactions
- [ ] Visual regression tests for all state transitions

---

## Document History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-02-02 | Initial spec — transcription pill + minibar state matrix, bug documentation |
| v2 | 2026-02-03 | Complete redesign: content model, nudge governance, context targeting, mode-aware behavior, role × workflow × mode composition, population management framing |
