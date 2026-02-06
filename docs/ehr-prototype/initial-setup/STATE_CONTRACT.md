# State Contract

The state contract defines how any UI (or service) can read from and write to the encounter state. It is the "API" between the data/logic layers and the presentation layer.

## Why It Matters

- **Enables multiple UIs** without duplicating logic
- **Enforces consistency** — all UIs play by the same rules
- **Creates audit surface** — all mutations go through defined channels
- **Allows testing** state logic independent of UI

---

## State Shape

We use a hybrid normalized structure that balances performance with clarity.

```typescript
interface EncounterState {
  // Core domain - normalized for performance
  entities: {
    items: Record<string, ChartItem>;
    suggestions: Record<string, Suggestion>;
    tasks: Record<string, BackgroundTask>;
    careGaps: Record<string, CareGapInstance>;
  };
  
  // Relationships - explicit
  relationships: {
    itemOrder: string[];                        // Display order of items
    taskToItem: Record<string, string>;         // Task ID → Item ID
    suggestionToItem: Record<string, string | null>; // Suggestion ID → Item ID (null if general)
    careGapToItems: Record<string, string[]>;   // Gap ID → Item IDs addressing it
  };
  
  // Context - nested for clarity
  context: {
    encounter: EncounterMeta;
    patient: PatientContext;
    visit: VisitMeta;
  };
  
  // Session - transient, not persisted
  session: {
    mode: Mode;
    currentUser: User;
    transcription: TranscriptionState;
  };
  
  // Sync - tracks server communication
  sync: {
    status: SyncStatus;
    queue: QueuedAction[];
    lastSyncedAt: Date | null;
  };
  
  // Collaboration - multi-user coordination
  collaboration: {
    currentOwner: User;
    handoffHistory: Handoff[];
  };
}

type Mode = 'capture' | 'process' | 'review';
type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Normalized entities | Easy to update single items without copying arrays |
| Explicit relationships | Clear how entities connect, supports complex queries |
| Separate context from entities | Context is read-heavy, rarely mutated |
| Session is transient | Not persisted to server, local UI state |
| UI state NOT in contract | Scroll position, panel open/closed stays in UI layer |

---

## Actions

Actions are the **only** way to modify state. They represent user intent or system events.

### Design: Intent-Based Actions

We use intent-based actions that capture "why" something happened, not just "what" changed.

```typescript
// ❌ CRUD-style (don't use)
{ type: 'ADD_ITEM', payload: item }

// ✅ Intent-based (use this)
{ type: 'ITEM_ADDED', payload: { item, source: 'manual' | 'suggestion' | 'transcription' } }
```

### Action Categories

#### Chart Item Actions

```typescript
type ChartItemAction =
  // Creation
  | { 
      type: 'ITEM_ADDED'; 
      payload: { 
        item: ChartItem; 
        source: ItemSource;
        triggeredBy?: string;  // suggestionId, transcription segmentId
      } 
    }
  
  // Modification
  | { 
      type: 'ITEM_UPDATED'; 
      payload: { 
        id: string; 
        changes: Partial<ChartItem>; 
        reason: 'user-edit' | 'ai-enrichment' | 'external-update' | 'result-received';
      } 
    }
  
  // Status changes
  | { type: 'ITEM_CONFIRMED'; payload: { id: string } }
  | { type: 'ITEM_CANCELLED'; payload: { id: string; reason?: string } }
  
  // Linkages
  | { type: 'ITEM_DX_LINKED'; payload: { itemId: string; dxId: string } }
  | { type: 'ITEM_DX_UNLINKED'; payload: { itemId: string; dxId: string } }
  
  // Ordering/sending
  | { type: 'ITEM_SENT'; payload: { id: string; destination: string; method: string } }
  | { type: 'ITEMS_BATCH_SENT'; payload: { ids: string[]; destination: string } }
  
  // Results
  | { type: 'ITEM_RESULT_RECEIVED'; payload: { id: string; result: any } };
```

#### Suggestion Actions

```typescript
type SuggestionAction =
  | { 
      type: 'SUGGESTION_RECEIVED'; 
      payload: { 
        suggestion: Suggestion;
        source: 'transcription' | 'ai-analysis' | 'care-gap' | 'cds';
      } 
    }
  | { type: 'SUGGESTION_ACCEPTED'; payload: { id: string } }
  | { type: 'SUGGESTION_ACCEPTED_WITH_CHANGES'; payload: { id: string; changes: Partial<ChartItem> } }
  | { type: 'SUGGESTION_DISMISSED'; payload: { id: string; reason?: string } }
  | { type: 'SUGGESTION_EXPIRED'; payload: { id: string } }
  | { type: 'SUGGESTIONS_CLEARED'; payload: { olderThan: Date } };
```

#### Background Task Actions

```typescript
type TaskAction =
  | { 
      type: 'TASK_CREATED'; 
      payload: { 
        task: BackgroundTask;
        relatedItemId?: string;
      } 
    }
  | { type: 'TASK_PROGRESS'; payload: { id: string; progress: number; status?: string } }
  | { type: 'TASK_COMPLETED'; payload: { id: string; result: any } }
  | { type: 'TASK_FAILED'; payload: { id: string; error: string } }
  | { type: 'TASK_APPROVED'; payload: { id: string } }
  | { type: 'TASK_REJECTED'; payload: { id: string; reason?: string } }
  | { type: 'TASKS_BATCH_APPROVED'; payload: { ids: string[] } };
```

#### Care Gap Actions

```typescript
type CareGapAction =
  | { 
      type: 'CARE_GAP_IDENTIFIED'; 
      payload: { 
        gap: CareGapInstance;
        source: 'system-scan' | 'import' | 'manual';
      } 
    }
  | { 
      type: 'CARE_GAP_ADDRESSED'; 
      payload: { 
        gapId: string; 
        itemId: string;
        result: 'pending' | 'closed';
      } 
    }
  | { 
      type: 'CARE_GAP_CLOSED'; 
      payload: { 
        gapId: string;
        closedBy: { itemId: string; method: 'automatic' | 'manual' };
      } 
    }
  | { 
      type: 'CARE_GAP_EXCLUDED'; 
      payload: { 
        gapId: string; 
        reason: CareGapExclusionReason;
      } 
    }
  | { 
      type: 'CARE_GAP_REOPENED'; 
      payload: { 
        gapId: string; 
        reason: 'result-expired' | 'new-measurement-period' | 'manual';
      } 
    }
  | { 
      type: 'CARE_GAPS_REFRESHED'; 
      payload: { 
        gaps: CareGapInstance[];
      } 
    };
```

#### Session Actions

```typescript
type SessionAction =
  | { type: 'MODE_CHANGED'; payload: { to: Mode; trigger: 'user' | 'auto' } }
  | { type: 'TRANSCRIPTION_STARTED'; payload: {} }
  | { type: 'TRANSCRIPTION_PAUSED'; payload: {} }
  | { type: 'TRANSCRIPTION_SEGMENT_RECEIVED'; payload: { segment: TranscriptSegment } }
  | { type: 'ENCOUNTER_OPENED'; payload: { encounterId: string; patient: PatientContext } }
  | { type: 'ENCOUNTER_CLOSED'; payload: { save: boolean } };
```

#### Collaboration Actions

```typescript
type CollaborationAction =
  | { type: 'HANDOFF_INITIATED'; payload: { to: User; role: Role } }
  | { type: 'HANDOFF_ACCEPTED'; payload: { by: User } }
  | { type: 'ITEM_LOCK_ACQUIRED'; payload: { itemId: string; userId: string } }
  | { type: 'ITEM_LOCK_RELEASED'; payload: { itemId: string } };
```

#### Sync Actions

```typescript
type SyncAction =
  | { type: 'SYNC_STARTED'; payload: {} }
  | { type: 'SYNC_COMPLETED'; payload: { serverVersion: number } }
  | { type: 'SYNC_FAILED'; payload: { error: string; retryable: boolean } }
  | { type: 'SYNC_CONFLICT_DETECTED'; payload: { itemId: string; local: any; server: any } }
  | { type: 'SYNC_CONFLICT_RESOLVED'; payload: { itemId: string; resolution: 'local' | 'server' | 'merge' } };
```

#### Union Type

```typescript
type EncounterAction =
  | ChartItemAction
  | SuggestionAction
  | TaskAction
  | CareGapAction
  | SessionAction
  | CollaborationAction
  | SyncAction;
```

---

## Selectors

Selectors are functions that derive data from state. We provide both primitive and composed selectors.

### Primitive Selectors

```typescript
// Entity access
const selectItem = (state: EncounterState, id: string) => 
  state.entities.items[id];

const selectAllItems = (state: EncounterState) => 
  state.relationships.itemOrder.map(id => state.entities.items[id]);

const selectSuggestion = (state: EncounterState, id: string) => 
  state.entities.suggestions[id];

const selectTask = (state: EncounterState, id: string) => 
  state.entities.tasks[id];

const selectCareGap = (state: EncounterState, id: string) => 
  state.entities.careGaps[id];
```

### Derived Selectors

```typescript
// Filtered collections
const selectItemsByCategory = (state: EncounterState, category: ItemCategory) =>
  selectAllItems(state).filter(item => item.category === category);

const selectActiveSuggestions = (state: EncounterState) =>
  Object.values(state.entities.suggestions).filter(s => s.status === 'active');

const selectTasksByStatus = (state: EncounterState, status: TaskStatus) =>
  Object.values(state.entities.tasks).filter(t => t.status === status);

const selectOpenCareGaps = (state: EncounterState) =>
  Object.values(state.entities.careGaps).filter(g => g.status === 'open');

// Relationship queries
const selectTasksForItem = (state: EncounterState, itemId: string) =>
  Object.entries(state.relationships.taskToItem)
    .filter(([_, relatedItemId]) => relatedItemId === itemId)
    .map(([taskId]) => state.entities.tasks[taskId]);

const selectItemsForCareGap = (state: EncounterState, gapId: string) =>
  (state.relationships.careGapToItems[gapId] || [])
    .map(id => state.entities.items[id]);
```

### View-Specific Selectors

```typescript
// Capture View
const selectCaptureViewData = (state: EncounterState) => ({
  items: selectAllItems(state),
  activeSuggestions: selectActiveSuggestions(state),
  transcriptionStatus: state.session.transcription.status,
  pendingTaskCount: selectTasksByStatus(state, 'pending-review').length,
  mode: state.session.mode,
});

// Task Pane
const selectTaskPaneData = (state: EncounterState) => ({
  readyToSend: selectTasksByStatus(state, 'ready'),
  needsReview: selectTasksByStatus(state, 'pending-review'),
  processing: selectTasksByStatus(state, 'processing'),
  completed: selectTasksByStatus(state, 'completed'),
});

// Review View
const selectReviewViewData = (state: EncounterState) => ({
  itemsByCategory: groupBy(selectAllItems(state), 'category'),
  openCareGaps: selectOpenCareGaps(state),
  encounter: state.context.encounter,
});
```

---

## Middleware

Middleware intercepts actions before/after they modify state.

### Middleware Pipeline

```
Action dispatched
       │
       ▼
┌─────────────────┐
│  Authorization  │ → Reject if user can't perform action
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │ → Reject if payload invalid
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Audit Logger   │ → Record action to audit trail
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Reducer      │ → Update state
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Side Effects   │ → Trigger AI services, sync, notifications
└────────┬────────┘
         │
         ▼
    UI re-renders
```

### Required Middleware

| Middleware | Purpose |
|------------|---------|
| **Authorization** | Checks if user/role can perform action |
| **Validation** | Rejects invalid actions before state change |
| **Audit Logger** | Records every action with timestamp, user, context |
| **Sync** | Queues changes for server sync, handles conflicts |
| **Side Effects** | Triggers AI services, notifications |

---

## Update Strategies

### Optimistic vs. Pessimistic

| Strategy | Behavior | Use When |
|----------|----------|----------|
| **Optimistic** | UI updates immediately, syncs in background | Low-risk actions, good connectivity |
| **Pessimistic** | UI waits for server confirmation | High-risk actions (send Rx, sign chart) |

### Recommended Approach

- **Optimistic** for capture mode (adding items, editing)
- **Pessimistic** for process/send actions (e-prescribe, lab orders, sign-off)

### Sync Status Tracking

```typescript
interface ChartItem {
  // ... domain fields
  _meta: {
    syncStatus: 'local' | 'syncing' | 'synced' | 'error';
    localVersion: number;
    serverVersion?: number;
  };
}
```

---

## Related Documents

- [Chart Items](../models/CHART_ITEMS.md) — Full ChartItem type definitions
- [Care Gaps](../models/CARE_GAPS.md) — CareGapDefinition and CareGapInstance
- [AI Integration](./AI_INTEGRATION.md) — How AI services dispatch actions
