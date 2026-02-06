# Parallel Streams Interaction Model

## The Three Streams

During active charting, three concurrent streams of input can affect the encounter state:

| Stream | Trigger | Latency | Output |
|--------|---------|---------|--------|
| **A. Transcription → Suggestions** | Ambient (always listening) | ~1-2s | Suggestion chips in OmniAdd |
| **B. Manual Input** | User action (tap/type) | <300ms | Item added to chart |
| **C. Background AI Tasks** | Item added (auto) or user-initiated | 2-15s | Enrichment, associations, validations |

```
┌─────────────────────────────────────────────────────────────┐
│                     ENCOUNTER STATE                          │
└─────────────────────────────────────────────────────────────┘
        ▲               ▲                    ▲
        │               │                    │
   ┌────┴────┐    ┌────┴────┐         ┌────┴────┐
   │Stream A │    │Stream B │         │Stream C │
   │Transcrip│    │ Manual  │         │Background│
   └────┬────┘    └────┬────┘         └────┬────┘
        │               │                    │
   Suggestions      Chart Items         Tasks/Alerts
```

---

## Stream A: Transcription → Suggestions

### Flow

```
Audio Input
     │
     ▼
┌──────────────┐
│ Transcription│ → Text segments
│   Service    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Entity     │ → Structured entities
│  Extraction  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Suggestion  │ → UI-ready suggestions
│   Factory    │
└──────┬───────┘
       │
       ▼
   SUGGESTION_RECEIVED
```

### Suggestion Lifecycle

| State | Description | Duration |
|-------|-------------|----------|
| `active` | Visible in OmniAdd, can be accepted | 0-60s |
| `accepted` | User accepted, converted to ChartItem | — |
| `dismissed` | User explicitly dismissed | — |
| `expired` | TTL exceeded without action | — |
| `superseded` | Replaced by newer related suggestion | — |

### Suggestion Behavior Rules

| Event | Behavior |
|-------|----------|
| **User accepts suggestion** | Convert to ChartItem, remove from suggestions, trigger Stream C |
| **User adds same item manually** | Dismiss suggestion (dedupe) |
| **User adds different but related item** | Dim suggestion, keep visible |
| **60s passes with no action** | Expire suggestion, fade out |
| **New suggestion for same entity** | Supersede old, show new |
| **Max 4 active suggestions** | Oldest expires when 5th arrives |

### Confidence Display

```
High confidence (>0.85)     →  Full opacity, prominent position
Medium confidence (0.6-0.85) →  Slightly dimmed
Low confidence (<0.6)       →  Don't show (or show with ? indicator)
```

---

## Stream B: Manual Input

### Flow

```
User Interaction (tap, type, voice command)
     │
     ▼
┌──────────────┐
│   OmniAdd    │ → Parse input, show progressive disclosure
│   Component  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Action    │ → ITEM_ADDED
│   Dispatch   │
└──────┬───────┘
       │
       ├────────────────────┐
       ▼                    ▼
   State Update        Trigger Stream C
   (immediate)         (background)
```

### Progressive Disclosure Flow

```
[+ Add] 
   │
   ▼
[Lab] [Rx] [Dx] [Other]     ← Category selection
   │
   ▼ (user selects Rx)
[Benzonatate] [Dextro...] [Guaifenesin] [Other...]  ← Contextual suggestions
   │
   ▼ (user selects Benzonatate)
[Dosage] [Instructions] [Quantity] [Refills]   ← Detail fields
   │
   ▼ (suggestion auto-fills)
"100 mg PO TID PRN cough #15, 0RF"             ← Smart default
   │
   ▼ (user confirms or modifies)
ITEM_ADDED dispatched
```

---

## Stream C: Background AI Tasks

### Flow

```
Trigger (ITEM_ADDED, etc.)
     │
     ▼
┌──────────────┐
│  AI Service  │ → Async processing
│   Manager    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Task       │ → TASK_CREATED (status: processing)
│   Created    │
└──────┬───────┘
       │
       ▼ (2-15s)
┌──────────────┐
│   Task       │ → TASK_COMPLETED or TASK_FAILED
│   Resolved   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Task Pane  │ → Shows in appropriate section
│   Updated    │
└──────────────┘
```

### Task States

| State | Location | User Action |
|-------|----------|-------------|
| `processing` | Task Pane: "Processing" section | Wait or cancel |
| `pending-review` | Task Pane: "Needs Review" section | Approve, reject, modify |
| `ready` | Task Pane: "Ready to Send" section | Send or batch send |
| `completed` | Task Pane: "Completed" section | View or hide |
| `failed` | Task Pane: "Needs Review" with error | Retry or dismiss |

### Task Types

| Type | Triggered By | Output |
|------|--------------|--------|
| `dx-association` | Rx, Lab, Imaging added | Suggested diagnosis linkage |
| `drug-interaction` | Rx added | Alert if interaction found |
| `formulary-check` | Rx added | Coverage status |
| `prior-auth` | Imaging, Procedure added | Auth requirement status |
| `note-generation` | Mode → Review | Draft visit note |
| `care-gap-check` | Encounter opened, items added | Gap status updates |

---

## Stream Interaction Patterns

### Pattern 1: Transcription Suggests, User Accepts

```
Time    Stream A                Stream B              Stream C
────────────────────────────────────────────────────────────────
0:00    Segment: "patient       
        taking Lisinopril"
0:01    Entity: medication      
        (Lisinopril)
0:02    Suggestion created      
        (active)
0:05                            User taps suggestion
0:05                            ITEM_ADDED            
0:05    Suggestion → accepted                         TASK_CREATED
                                                      (dx-association)
0:08                                                  TASK_COMPLETED
```

### Pattern 2: User Adds, Transcription Duplicates

```
Time    Stream A                Stream B              Stream C
────────────────────────────────────────────────────────────────
0:00                            User adds Benzonatate
0:00                            ITEM_ADDED            TASK_CREATED
0:03    Segment: "prescribe
        Benzonatate"
0:04    Entity: medication
        (Benzonatate)
0:04    Dedupe check → 
        matches existing item
0:04    Suggestion NOT created
        (already in chart)
```

### Pattern 3: User Adds Different Item

```
Time    Stream A                Stream B              Stream C
────────────────────────────────────────────────────────────────
0:00    Segment: "cough 
        suppressant"
0:01    Suggestion: Benzonatate 
        (active)
0:05                            User adds 
                                Dextromethorphan
0:05                            ITEM_ADDED
0:05    Suggestion: Benzonatate 
        dims (related item 
        added)
0:65    Suggestion expires
```

### Pattern 4: Background Task Needs Attention

```
Time    Stream A                Stream B              Stream C
────────────────────────────────────────────────────────────────
0:00                            User adds Rx
0:00                                                  TASK_CREATED
                                                      (drug-interaction)
0:02                                                  TASK_COMPLETED
                                                      Alert: interaction
0:02                            Minibar: ⚠️ 1 alert
0:02                            Palette auto-opens
                                with alert
0:05                            User reviews,
                                acknowledges
0:05                                                  Task → resolved
```

---

## Conflict Resolution

### Scenario: Stream A and C Produce Conflicting Suggestions

**Example**: Transcription suggests "Acute bronchitis J20.9", Background Dx mapping suggests "Upper respiratory infection J06.9"

**Resolution Strategy**:
1. Both suggestions surface in UI
2. Transcription-sourced suggestion shows transcript excerpt
3. AI-sourced suggestion shows reasoning
4. User picks one (or neither, or different)

```
┌─────────────────────────────────────────┐
│ Diagnosis Suggestions                   │
├─────────────────────────────────────────┤
│ 🎤 "Acute bronchitis" J20.9             │
│    From: "...bronchitis symptoms..."    │
├─────────────────────────────────────────┤
│ 🤖 "Upper respiratory infection" J06.9  │
│    Based on: cough, normal exam         │
├─────────────────────────────────────────┤
│ [Other...]                              │
└─────────────────────────────────────────┘
```

### Scenario: Rapid Sequential Inputs

**Example**: User types quickly while transcription is processing

**Resolution Strategy**:
1. Manual input always takes precedence (immediate)
2. Transcription suggestions check for duplicates before surfacing
3. If duplicate detected, suggestion is silently dropped

---

## Interruptibility

### Non-Blocking (Default)

Clinician can continue charting while Stream C processes.

| Pros | Cons |
|------|------|
| Fast workflow | Review debt accumulates |
| No waiting | May miss important alerts |

### Blocking for Critical Items

Some tasks should interrupt:

| Task Type | Block? | Rationale |
|-----------|--------|-----------|
| Drug interaction (severe) | Yes | Patient safety |
| Allergy alert | Yes | Patient safety |
| Controlled substance check | Yes | Regulatory |
| Dx association | No | Can batch later |
| Formulary check | No | Can batch later |
| Note generation | No | Background task |

### Batched Review Checkpoint

At mode switch (Capture → Process) or sign-off attempt:

```
┌─────────────────────────────────────────┐
│ Review Required                         │
├─────────────────────────────────────────┤
│ 3 items need diagnosis linkage          │
│ 1 drug interaction acknowledged         │
│ 2 care gaps addressed                   │
├─────────────────────────────────────────┤
│ [Review Now]  [Skip to Sign-off]        │
└─────────────────────────────────────────┘
```

---

## Performance Considerations

### Debouncing

| Stream | Debounce Strategy |
|--------|-------------------|
| Transcription segments | Batch into 2-3 second chunks |
| Entity extraction | Wait 500ms after segment ends |
| Suggestion display | Animate in, don't flash |
| Background tasks | Queue, process in order |

### Cancellation

| Scenario | Action |
|----------|--------|
| User closes encounter | Cancel all pending tasks |
| User navigates away | Keep tasks running (session scope) |
| Task timeout | Mark failed, allow retry |
| New task supersedes old | Cancel old task |

---

## Related Documents

- [AI Integration](./AI_INTEGRATION.md) — Service definitions and configuration
- [State Contract](./STATE_CONTRACT.md) — Actions and state shape
- [Interaction Patterns](../ui/INTERACTION_PATTERNS.md) — UI implementation details
