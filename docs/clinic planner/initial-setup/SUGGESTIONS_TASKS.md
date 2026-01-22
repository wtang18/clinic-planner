# Suggestions & Background Tasks

## Overview

Suggestions and background tasks are the primary outputs of AI services. They represent different interaction patterns:

- **Suggestions** — Ephemeral, require user acceptance to become chart items
- **Background Tasks** — Processing jobs that enrich or validate existing items

---

## Suggestions

### Structure

```typescript
interface Suggestion {
  id: string;
  type: SuggestionType;
  status: SuggestionStatus;
  
  // What's being suggested
  content: SuggestionContent;
  
  // Context
  source: SuggestionSource;
  relatedItemId?: string;      // If suggestion relates to existing item
  sourceSegmentId?: string;    // If from transcription
  
  // Confidence
  confidence: number;          // 0-1
  reasoning?: string;          // Why AI suggested this
  
  // Lifecycle
  createdAt: Date;
  expiresAt?: Date;            // TTL for ephemeral suggestions
  actedAt?: Date;              // When accepted/dismissed
  
  // Display
  displayText: string;
  displaySubtext?: string;
}
```

### Types

```typescript
type SuggestionType =
  | 'chart-item'        // Suggests adding a new chart item
  | 'dx-association'    // Suggests linking item to diagnosis
  | 'correction'        // Suggests correcting existing item
  | 'care-gap-action'   // Suggests action to close care gap
  | 'follow-up';        // Suggests follow-up action
```

### Status

```typescript
type SuggestionStatus =
  | 'active'            // Visible, can be acted on
  | 'accepted'          // User accepted
  | 'accepted-modified' // User accepted with changes
  | 'dismissed'         // User explicitly dismissed
  | 'expired'           // TTL exceeded
  | 'superseded';       // Replaced by newer suggestion
```

### Source

```typescript
type SuggestionSource =
  | 'transcription'     // From speech-to-text + entity extraction
  | 'ai-analysis'       // From AI analyzing chart context
  | 'care-gap'          // From care gap engine
  | 'cds'               // Clinical Decision Support rules
  | 'import';           // From external system data
```

### Content

```typescript
type SuggestionContent =
  | {
      type: 'new-item';
      itemTemplate: Partial<ChartItem>;  // Pre-filled item data
      category: ItemCategory;
    }
  | {
      type: 'dx-link';
      targetItemId: string;
      suggestedDx: DiagnosisSuggestion[];
    }
  | {
      type: 'correction';
      targetItemId: string;
      field: string;
      currentValue: any;
      suggestedValue: any;
    }
  | {
      type: 'care-gap-action';
      careGapId: string;
      actionTemplate: Partial<ChartItem>;
    };

interface DiagnosisSuggestion {
  description: string;
  icdCode: string;
  confidence: number;
  reasoning?: string;
}
```

---

## Suggestion Lifecycle

### Creation → Expiration Flow

```
AI Service detects opportunity
         │
         ▼
SUGGESTION_RECEIVED
         │
         ▼
┌─────────────────────┐
│  Status: active     │
│  Visible in UI      │
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────────┬──────────────┐
     ▼           ▼             ▼              ▼
  User        User          Time           Newer
  accepts     dismisses     passes         suggestion
     │           │             │              │
     ▼           ▼             ▼              ▼
  ACCEPTED   DISMISSED      EXPIRED      SUPERSEDED
     │
     ▼
  ITEM_ADDED (if chart-item type)
```

### TTL Rules

| Source | Default TTL | Rationale |
|--------|-------------|-----------|
| Transcription | 60s | Context shifts quickly |
| AI analysis | 5 min | More durable context |
| Care gap | Session | Relevant for entire encounter |
| CDS alert | Until addressed | Safety-critical |

### Deduplication

Before surfacing a suggestion, check for:

1. **Exact match** — Same item already in chart → don't suggest
2. **Similar item** — Related item exists → dim suggestion
3. **Recent dismissal** — User dismissed similar recently → don't suggest

```typescript
function shouldSurfaceSuggestion(
  suggestion: Suggestion,
  state: EncounterState
): boolean {
  const items = Object.values(state.entities.items);
  const recentDismissals = Object.values(state.entities.suggestions)
    .filter(s => s.status === 'dismissed' && isRecent(s.actedAt));
  
  // Check exact match
  if (suggestion.content.type === 'new-item') {
    const template = suggestion.content.itemTemplate;
    const exists = items.some(item => 
      item.category === suggestion.content.category &&
      isSameEntity(item, template)
    );
    if (exists) return false;
  }
  
  // Check recent dismissal
  const wasDismissed = recentDismissals.some(s =>
    isSimilarSuggestion(s, suggestion)
  );
  if (wasDismissed) return false;
  
  return true;
}
```

---

## Background Tasks

### Structure

```typescript
interface BackgroundTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  
  // What triggered this task
  trigger: {
    action: string;           // Action type that triggered
    itemId?: string;          // Related item
  };
  
  // Result
  result?: any;               // Type depends on task type
  error?: string;
  
  // Progress
  progress?: number;          // 0-100
  progressMessage?: string;
  
  // Lifecycle
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // For UI
  displayTitle: string;
  displayStatus: string;
}
```

### Types

```typescript
type TaskType =
  | 'dx-association'      // Link item to diagnosis
  | 'drug-interaction'    // Check for interactions
  | 'formulary-check'     // Check insurance coverage
  | 'prior-auth-check'    // Check auth requirements
  | 'note-generation'     // Generate visit note
  | 'care-gap-evaluation' // Evaluate care gap closure
  | 'lab-send'            // Send lab order
  | 'rx-send'             // E-prescribe medication
  | 'validation';         // Validate item data
```

### Status

```typescript
type TaskStatus =
  | 'queued'          // Waiting to start
  | 'processing'      // Currently running
  | 'pending-review'  // Complete, needs user action
  | 'ready'           // Ready to send/finalize
  | 'completed'       // Successfully finished
  | 'failed'          // Error occurred
  | 'cancelled';      // User cancelled

type TaskPriority =
  | 'low'             // Background, no rush
  | 'normal'          // Standard processing
  | 'high'            // Should complete soon
  | 'urgent';         // Needs immediate attention (alerts)
```

### Task Results by Type

```typescript
// Dx Association Result
interface DxAssociationResult {
  suggestions: {
    dxId: string;
    description: string;
    icdCode: string;
    confidence: number;
    reasoning: string;
  }[];
  autoLinked?: string;  // If confidence high enough, auto-linked this Dx
}

// Drug Interaction Result
interface DrugInteractionResult {
  interactions: {
    drug1: string;
    drug2: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    recommendation: string;
  }[];
}

// Formulary Check Result
interface FormularyCheckResult {
  covered: boolean;
  tier?: number;
  copay?: number;
  alternatives?: {
    drugName: string;
    tier: number;
    copay: number;
  }[];
  priorAuthRequired: boolean;
}

// Note Generation Result
interface NoteGenerationResult {
  text: string;
  format: 'plain' | 'structured';
  confidence: number;
  sections: {
    name: string;
    content: string;
  }[];
}
```

---

## Task Lifecycle

### Processing Flow

```
Trigger (ITEM_ADDED, etc.)
         │
         ▼
TASK_CREATED (status: queued)
         │
         ▼
┌─────────────────────┐
│  AI Service picks   │
│  up from queue      │
└──────────┬──────────┘
           │
           ▼
TASK_PROGRESS (status: processing)
           │
     ┌─────┴─────┐
     ▼           ▼
  Success      Failure
     │           │
     ▼           ▼
TASK_COMPLETED  TASK_FAILED
     │
     ▼
┌─────────────────────┐
│  Result determines  │
│  next status        │
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────────┐
     ▼           ▼             ▼
needs-review   ready      completed
(needs user   (ready to  (no action
 decision)     send)      needed)
```

### Task Pane Organization

Tasks are grouped by status for efficient review:

```
┌─────────────────────────────────────────┐
│  PENDING ACTIONS                        │
├─────────────────────────────────────────┤
│                                         │
│  Ready to Send (4)          [Send All]  │
│  ├─ CBC — Dx linked                     │
│  ├─ CMP — Dx linked                     │
│  ├─ Flu rapid — Dx linked               │
│  └─ COVID rapid — Dx linked             │
│                                         │
│  Needs Review (2)                       │
│  ├─ ⚠️ Benzonatate — No Dx linked       │
│  │     [Acute bronchitis] [Cough]       │
│  └─ 📝 Visit Note (draft)    [Review]   │
│                                         │
│  Processing (1)                         │
│  └─ ⏳ Chest X-ray — Checking auth...   │
│                                         │
│  Completed (3)                  [Hide]  │
│  └─ ✓ 3 items sent                      │
└─────────────────────────────────────────┘
```

---

## Batch Operations

### Batch Approval

```typescript
// Single approval
dispatch({ type: 'TASK_APPROVED', payload: { id: taskId } });

// Batch approval
dispatch({ 
  type: 'TASKS_BATCH_APPROVED', 
  payload: { ids: [taskId1, taskId2, taskId3] } 
});
```

### Batch Send

```typescript
dispatch({
  type: 'ITEMS_BATCH_SENT',
  payload: {
    ids: [labId1, labId2, labId3],
    destination: 'quest-diagnostics',
  },
});
```

### Rules for Batch Operations

| Item Type | Can Batch? | Restrictions |
|-----------|------------|--------------|
| Labs | Yes | Same vendor |
| Imaging | Yes | Same facility |
| Medications | Partial | Not controlled substances |
| Referrals | Yes | — |

---

## Alerts

Some tasks produce alerts that require immediate attention.

```typescript
interface Alert {
  id: string;
  taskId: string;
  severity: 'info' | 'warning' | 'critical';
  
  title: string;
  message: string;
  
  // Actions
  actions: AlertAction[];
  requiresAcknowledgment: boolean;
  
  // Lifecycle
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: UserReference;
}

interface AlertAction {
  label: string;
  action: string;  // Action type to dispatch
  payload?: any;
  style: 'primary' | 'secondary' | 'danger';
}
```

### Alert Display

Critical alerts trigger the Palette automatically:

```
┌─────────────────────────────────────────┐
│ ⚠️ Drug Interaction Detected            │
├─────────────────────────────────────────┤
│ Metformin + Contrast Dye                │
│                                         │
│ Severe interaction: Risk of contrast-   │
│ induced nephropathy in diabetic         │
│ patients.                               │
│                                         │
│ Recommendation: Hold Metformin 48h      │
│ before and after contrast.              │
│                                         │
│ [Acknowledge] [Cancel Imaging] [Help]   │
└─────────────────────────────────────────┘
```

---

## Related Documents

- [AI Integration](../architecture/AI_INTEGRATION.md) — Services that create suggestions/tasks
- [State Contract](../architecture/STATE_CONTRACT.md) — Actions for managing suggestions/tasks
- [Parallel Streams](../architecture/PARALLEL_STREAMS.md) — How suggestions interact with manual input
