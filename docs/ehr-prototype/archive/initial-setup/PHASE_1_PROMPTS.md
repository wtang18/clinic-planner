# Phase 1: Foundation — Claude Code Prompts

This document contains Claude Code prompts for building the foundation layer: types, state management, and mock data.

---

## Overview

| Chunk | Description | Dependencies |
|-------|-------------|--------------|
| 1.1 | Core Type Definitions | None |
| 1.2 | State Shape & Initial State | 1.1 |
| 1.3 | Action Definitions | 1.1 |
| 1.4 | Reducers | 1.1, 1.2, 1.3 |
| 1.5 | Selectors | 1.1, 1.2 |
| 1.6 | Store Setup & Middleware | 1.1-1.5 |
| 1.7 | Mock Data Generators | 1.1 |

---

## Chunk 1.1: Core Type Definitions

### Prompt

```
Create TypeScript type definitions for an AI-enhanced EHR (Electronic Health Record) system.

## Requirements

Create the following files in `/src/types/`:

### 1. `/src/types/common.ts`
Common types used throughout the system:
- `UserReference`: { id, name, role? }
- `Role`: 'provider' | 'nurse' | 'ma' | 'scribe' | 'tech' | 'admin' | 'billing'
- `Priority`: 'low' | 'normal' | 'high' | 'urgent'
- `SyncStatus`: 'local' | 'syncing' | 'synced' | 'error'
- `Address`: { line1, line2?, city, state, zip }
- `Timestamped`: { createdAt: Date, modifiedAt: Date }
- `Auditable`: extends Timestamped with createdBy, modifiedBy as UserReference

### 2. `/src/types/patient.ts`
Patient context types:
- `PatientContext`: Full patient record with demographics, contact, insurance, clinicalSummary
- `Demographics`: firstName, lastName, dateOfBirth, age, gender, preferredName?, pronouns?
- `InsuranceInfo`: payerId, payerName, memberId, groupNumber?, planType?
- `ProblemListItem`: description, icdCode, status ('active'|'resolved'|'inactive'), onsetDate?
- `MedicationSummary`: name, dosage, frequency, status
- `AllergySummary`: allergen, reaction?, severity
- `EncounterSummary`: date, type, chiefComplaint?, provider

### 3. `/src/types/encounter.ts`
Encounter and visit types:
- `EncounterMeta`: id, status, type, timing fields, facility?, room?, billingStatus?
- `EncounterStatus`: 'scheduled' | 'checked-in' | 'in-progress' | 'complete' | 'signed' | 'amended' | 'cancelled'
- `EncounterType`: 'office-visit' | 'urgent-care' | 'telehealth' | 'annual-wellness' | 'follow-up' | 'procedure' | 'consult'
- `VisitMeta`: chiefComplaint?, visitReason?, scheduledDuration?, actualDuration?, serviceType?

### 4. `/src/types/references.ts`
Reference types for external entities:
- `FacilityReference`: id, name, type?, address?, phone?, fax?
- `ProviderReference`: id, name, specialty?, npi?, facility?
- `PharmacyReference`: id, name, ncpdpId?, address?, phone?, fax?
- `LabVendorReference`: id, name, accountNumber?

### 5. `/src/types/chart-items.ts`
Chart item types (this is the largest file):

Base types:
- `ItemCategory`: union of all categories ('chief-complaint', 'hpi', 'ros', 'physical-exam', 'vitals', 'medication', 'allergy', 'lab', 'imaging', 'procedure', 'diagnosis', 'plan', 'instruction', 'note', 'referral')
- `ItemSource`: discriminated union with types 'manual', 'transcription', 'suggestion', 'import', 'device', 'ai-generated'
- `ItemStatus`: 'draft' | 'pending-review' | 'confirmed' | 'ordered' | 'completed' | 'cancelled'
- `Tag`: { label, type: TagType, color?, actionable?, action? }
- `TagType`: 'status' | 'source' | 'alert' | 'category' | 'ai' | 'workflow'

Base interface:
- `ChartItemBase`: id, category, createdAt, createdBy, modifiedAt, modifiedBy, source, status, displayText, displaySubtext?, tags, linkedDiagnoses, linkedEncounters, _meta (syncStatus, aiGenerated, aiConfidence?, requiresReview)

Item variants (each extends ChartItemBase):
- `MedicationItem`: category 'medication', data with drugName, genericName?, ndc?, rxNorm?, dosage, route, frequency, duration?, quantity?, refills?, isControlled, controlSchedule?, prescriptionType, pharmacy?, reportedBy?, verificationStatus?, actions array
- `LabItem`: category 'lab', data with testName, testCode?, panelName?, priority, collectionType, labVendor?, orderStatus, requisitionId?, collectedAt?, resultedAt?, results? (array of LabResult)
- `LabResult`: component, value, unit, referenceRange, flag?
- `DiagnosisItem`: category 'diagnosis', data with description, icdCode, snomedCode?, type ('encounter'|'chronic'|'historical'), ranking?, clinicalStatus, onsetDate?, resolvedDate?, isPOA?
- `VitalsItem`: category 'vitals', data with measurements (VitalMeasurement[]), capturedAt, position?
- `VitalMeasurement`: type (VitalType), value, unit, flag?
- `VitalType`: union of vital types
- `PhysicalExamItem`: category 'physical-exam', data with system (ExamSystem), finding, isNormal, structuredFindings?
- `ExamSystem`: union of body systems
- `ImagingItem`: category 'imaging', data with studyType, bodyPart, indication, priority, facility?, requiresAuth, authStatus?, orderStatus, scheduledAt?, completedAt?, radiologistReport?, impression?
- `NarrativeItem`: category is union of narrative types, data with text, format, structuredElements?
- `AllergyItem`: category 'allergy', data with allergen, allergenType, reaction?, severity, reportedBy, verificationStatus, onsetDate?
- `InstructionItem`: category 'instruction', data with text, instructionType, followUpInterval?, followUpProvider?, printable, requiresAcknowledgment
- `ReferralItem`: category 'referral', data with specialty, reason, urgency, referToProvider?, referToFacility?, referralStatus, scheduledDate?, requiresAuth, authStatus?
- `ProcedureItem`: category 'procedure', data with procedureName, cptCode?, performedAt?, performedBy?, indication, technique?, findings?, complications?, procedureStatus

Union type:
- `ChartItem`: union of all item variants

### 6. `/src/types/care-gaps.ts`
Care gap types:
- `CareGapCategory`: union of categories
- `CareGapDefinition`: id, name, category, description, eligibility, frequency, closureCriteria, qualityMeasure?, priority, patientFacingName?, actionLabel?
- `CareGapEligibility`: ageRange?, gender?, diagnoses?, medications?, excludeDiagnoses?, customCriteria?
- `CareGapFrequency`: interval, customDays?, anchorDate?
- `CareGapClosureCriteria`: discriminated union with types 'lab-result', 'immunization', 'procedure', 'imaging', 'assessment', 'encounter', 'medication', 'composite'
- `CareGapInstance`: id, definitionId, patientId, status, statusReason?, timing fields, closureAttempts, closedBy?, excluded, exclusionReason?, excludedBy?, excludedAt?, addressedThisEncounter, encounterActions, _display
- `CareGapStatus`: 'open' | 'pending' | 'closed' | 'excluded' | 'expired'
- `CareGapClosureAttempt`: attemptedAt, itemId, itemType, result, failureReason?
- `CareGapExclusionReason`: discriminated union with types 'patient-declined', 'medical-contraindication', 'hospice', 'life-expectancy', 'completed-elsewhere', 'other'

### 7. `/src/types/suggestions.ts`
Suggestion and task types:
- `Suggestion`: id, type, status, content, source, relatedItemId?, sourceSegmentId?, confidence, reasoning?, createdAt, expiresAt?, actedAt?, displayText, displaySubtext?
- `SuggestionType`: 'chart-item' | 'dx-association' | 'correction' | 'care-gap-action' | 'follow-up'
- `SuggestionStatus`: 'active' | 'accepted' | 'accepted-modified' | 'dismissed' | 'expired' | 'superseded'
- `SuggestionSource`: 'transcription' | 'ai-analysis' | 'care-gap' | 'cds' | 'import'
- `SuggestionContent`: discriminated union with types 'new-item', 'dx-link', 'correction', 'care-gap-action'
- `BackgroundTask`: id, type, status, priority, trigger, result?, error?, progress?, progressMessage?, createdAt, startedAt?, completedAt?, displayTitle, displayStatus
- `TaskType`: union of task types
- `TaskStatus`: 'queued' | 'processing' | 'pending-review' | 'ready' | 'completed' | 'failed' | 'cancelled'

### 8. `/src/types/transcription.ts`
Transcription types:
- `TranscriptionState`: status, startedAt?, pausedAt?, currentSegment?, totalDuration, segmentCount
- `TranscriptionStatus`: 'idle' | 'recording' | 'paused' | 'processing' | 'error'
- `TranscriptSegment`: id, text, startTime, endTime, confidence, speaker?, entities?
- `ExtractedEntity`: type, text, normalizedValue?, span, confidence
- `EntityType`: union of entity types

### 9. `/src/types/collaboration.ts`
Collaboration types:
- `Handoff`: from, to, at, note?
- `CollaborationState`: currentOwner, handoffHistory
- `ItemLock`: itemId, userId, acquiredAt, expiresAt

### 10. `/src/types/index.ts`
Re-export all types from a single entry point.

## Guidelines
- Use strict TypeScript
- Add JSDoc comments for complex types
- Use discriminated unions for variant types
- Ensure all types are exported
- Use `readonly` where appropriate for immutable data
```

---

## Chunk 1.2: State Shape & Initial State

### Prompt

```
Create the state shape and initial state factory for the EHR system.

## Requirements

### 1. `/src/state/types.ts`

Define the `EncounterState` interface:

```typescript
interface EncounterState {
  entities: {
    items: Record<string, ChartItem>;
    suggestions: Record<string, Suggestion>;
    tasks: Record<string, BackgroundTask>;
    careGaps: Record<string, CareGapInstance>;
  };
  
  relationships: {
    itemOrder: string[];
    taskToItem: Record<string, string>;
    suggestionToItem: Record<string, string | null>;
    careGapToItems: Record<string, string[]>;
  };
  
  context: {
    encounter: EncounterMeta | null;
    patient: PatientContext | null;
    visit: VisitMeta | null;
  };
  
  session: {
    mode: 'capture' | 'process' | 'review';
    currentUser: User | null;
    transcription: TranscriptionState;
  };
  
  sync: {
    status: SyncStatus;
    queue: QueuedAction[];
    lastSyncedAt: Date | null;
  };
  
  collaboration: CollaborationState;
}
```

Also define:
- `User`: id, name, role, credentials?, npi?
- `QueuedAction`: id, action, queuedAt, retryCount, lastError?
- `Mode`: type alias for the three modes

### 2. `/src/state/initialState.ts`

Create functions:
- `createInitialState(): EncounterState` - Returns empty state
- `createInitialTranscriptionState(): TranscriptionState`
- `createInitialCollaborationState(): CollaborationState`

### 3. `/src/state/validation.ts`

Create validation helpers:
- `isValidState(state: unknown): state is EncounterState`
- `validateEncounterState(state: EncounterState): ValidationResult`
- `ValidationResult`: { valid: boolean, errors: string[] }

## Dependencies
- Import types from `/src/types/`

## Guidelines
- All initial values should be sensible defaults (empty records, null for optional context, etc.)
- Transcription should start in 'idle' status
- Mode should default to 'capture'
- Sync status should default to 'online'
```

---

## Chunk 1.3: Action Definitions

### Prompt

```
Create action type definitions and action creator functions for the EHR state management.

## Requirements

### 1. `/src/state/actions/types.ts`

Define all action types as a discriminated union. Organize by category:

**Chart Item Actions:**
- `ITEM_ADDED`: { item: ChartItem, source: ItemSource, triggeredBy?: string }
- `ITEM_UPDATED`: { id: string, changes: Partial<ChartItem>, reason: string }
- `ITEM_CONFIRMED`: { id: string }
- `ITEM_CANCELLED`: { id: string, reason?: string }
- `ITEM_DX_LINKED`: { itemId: string, dxId: string }
- `ITEM_DX_UNLINKED`: { itemId: string, dxId: string }
- `ITEM_SENT`: { id: string, destination: string, method: string }
- `ITEMS_BATCH_SENT`: { ids: string[], destination: string }
- `ITEM_RESULT_RECEIVED`: { id: string, result: any }

**Suggestion Actions:**
- `SUGGESTION_RECEIVED`: { suggestion: Suggestion, source: SuggestionSource }
- `SUGGESTION_ACCEPTED`: { id: string }
- `SUGGESTION_ACCEPTED_WITH_CHANGES`: { id: string, changes: Partial<ChartItem> }
- `SUGGESTION_DISMISSED`: { id: string, reason?: string }
- `SUGGESTION_EXPIRED`: { id: string }
- `SUGGESTIONS_CLEARED`: { olderThan: Date }

**Task Actions:**
- `TASK_CREATED`: { task: BackgroundTask, relatedItemId?: string }
- `TASK_PROGRESS`: { id: string, progress: number, status?: string }
- `TASK_COMPLETED`: { id: string, result: any }
- `TASK_FAILED`: { id: string, error: string }
- `TASK_APPROVED`: { id: string }
- `TASK_REJECTED`: { id: string, reason?: string }
- `TASKS_BATCH_APPROVED`: { ids: string[] }

**Care Gap Actions:**
- `CARE_GAP_IDENTIFIED`: { gap: CareGapInstance, source: string }
- `CARE_GAP_ADDRESSED`: { gapId: string, itemId: string, result: 'pending' | 'closed' }
- `CARE_GAP_CLOSED`: { gapId: string, closedBy: { itemId: string, method: string } }
- `CARE_GAP_EXCLUDED`: { gapId: string, reason: CareGapExclusionReason }
- `CARE_GAP_REOPENED`: { gapId: string, reason: string }
- `CARE_GAPS_REFRESHED`: { gaps: CareGapInstance[] }

**Session Actions:**
- `MODE_CHANGED`: { to: Mode, trigger: 'user' | 'auto' }
- `TRANSCRIPTION_STARTED`: {}
- `TRANSCRIPTION_PAUSED`: {}
- `TRANSCRIPTION_STOPPED`: {}
- `TRANSCRIPTION_SEGMENT_RECEIVED`: { segment: TranscriptSegment }
- `ENCOUNTER_OPENED`: { encounterId: string, patient: PatientContext, encounter: EncounterMeta, visit?: VisitMeta }
- `ENCOUNTER_CLOSED`: { save: boolean }

**Collaboration Actions:**
- `HANDOFF_INITIATED`: { to: User, role: Role }
- `HANDOFF_ACCEPTED`: { by: User }
- `ITEM_LOCK_ACQUIRED`: { itemId: string, userId: string }
- `ITEM_LOCK_RELEASED`: { itemId: string }

**Sync Actions:**
- `SYNC_STARTED`: {}
- `SYNC_COMPLETED`: { serverVersion: number }
- `SYNC_FAILED`: { error: string, retryable: boolean }
- `SYNC_CONFLICT_DETECTED`: { itemId: string, local: any, server: any }
- `SYNC_CONFLICT_RESOLVED`: { itemId: string, resolution: 'local' | 'server' | 'merge' }

Create the union type `EncounterAction`.

### 2. `/src/state/actions/creators.ts`

Create action creator functions for each action type. Example:
```typescript
export const itemAdded = (
  item: ChartItem, 
  source: ItemSource, 
  triggeredBy?: string
): ItemAddedAction => ({
  type: 'ITEM_ADDED',
  payload: { item, source, triggeredBy },
});
```

Create all action creators following this pattern.

### 3. `/src/state/actions/guards.ts`

Create type guard functions:
```typescript
export const isItemAction = (action: EncounterAction): action is ChartItemAction => ...
export const isSuggestionAction = (action: EncounterAction): action is SuggestionAction => ...
// etc for each category
```

### 4. `/src/state/actions/index.ts`

Re-export all action types, creators, and guards.

## Guidelines
- Each action should have a `type` string literal and `payload` object
- Action types should be SCREAMING_SNAKE_CASE
- Action creators should be camelCase
- Use const assertions for type literals
```

---

## Chunk 1.4: Reducers

### Prompt

```
Create reducer functions for the EHR state management.

## Requirements

### 1. `/src/state/reducers/entities.ts`

Create reducers for entity collections:

```typescript
// Items reducer
export function itemsReducer(
  state: Record<string, ChartItem>,
  action: EncounterAction
): Record<string, ChartItem>

// Suggestions reducer  
export function suggestionsReducer(
  state: Record<string, Suggestion>,
  action: EncounterAction
): Record<string, Suggestion>

// Tasks reducer
export function tasksReducer(
  state: Record<string, BackgroundTask>,
  action: EncounterAction
): Record<string, BackgroundTask>

// Care gaps reducer
export function careGapsReducer(
  state: Record<string, CareGapInstance>,
  action: EncounterAction
): Record<string, CareGapInstance>
```

Handle all relevant actions for each entity type. Ensure immutable updates.

### 2. `/src/state/reducers/relationships.ts`

Create reducer for relationships:

```typescript
export function relationshipsReducer(
  state: EncounterState['relationships'],
  action: EncounterAction
): EncounterState['relationships']
```

Handle:
- `ITEM_ADDED`: Add to itemOrder
- `ITEM_CANCELLED`: Remove from itemOrder (or mark somehow)
- `TASK_CREATED`: Add taskToItem mapping
- `SUGGESTION_RECEIVED`: Add suggestionToItem mapping
- `CARE_GAP_ADDRESSED`: Add to careGapToItems

### 3. `/src/state/reducers/context.ts`

Create reducer for context:

```typescript
export function contextReducer(
  state: EncounterState['context'],
  action: EncounterAction
): EncounterState['context']
```

Handle:
- `ENCOUNTER_OPENED`: Set encounter, patient, visit
- `ENCOUNTER_CLOSED`: Clear or preserve based on save flag

### 4. `/src/state/reducers/session.ts`

Create reducer for session:

```typescript
export function sessionReducer(
  state: EncounterState['session'],
  action: EncounterAction
): EncounterState['session']
```

Handle:
- `MODE_CHANGED`: Update mode
- `TRANSCRIPTION_*`: Update transcription state
- `HANDOFF_ACCEPTED`: Update currentUser (if applicable)

### 5. `/src/state/reducers/sync.ts`

Create reducer for sync:

```typescript
export function syncReducer(
  state: EncounterState['sync'],
  action: EncounterAction
): EncounterState['sync']
```

Handle:
- `SYNC_STARTED`: status = 'syncing'
- `SYNC_COMPLETED`: status = 'synced', update lastSyncedAt
- `SYNC_FAILED`: status = 'error'

### 6. `/src/state/reducers/collaboration.ts`

Create reducer for collaboration:

```typescript
export function collaborationReducer(
  state: CollaborationState,
  action: EncounterAction
): CollaborationState
```

Handle:
- `HANDOFF_ACCEPTED`: Update currentOwner, add to handoffHistory
- `ENCOUNTER_OPENED`: Set initial owner

### 7. `/src/state/reducers/root.ts`

Create the root reducer that combines all sub-reducers:

```typescript
export function rootReducer(
  state: EncounterState,
  action: EncounterAction
): EncounterState
```

### 8. `/src/state/reducers/index.ts`

Re-export all reducers.

## Guidelines
- All reducers must be pure functions
- Use spread operators for immutable updates
- Handle unknown actions by returning current state
- Add JSDoc comments explaining what each reducer handles
```

---

## Chunk 1.5: Selectors

### Prompt

```
Create selector functions for deriving data from the EHR state.

## Requirements

### 1. `/src/state/selectors/entities.ts`

Primitive entity selectors:

```typescript
// Items
export const selectItem = (state: EncounterState, id: string): ChartItem | undefined
export const selectAllItems = (state: EncounterState): ChartItem[]
export const selectItemIds = (state: EncounterState): string[]

// Suggestions
export const selectSuggestion = (state: EncounterState, id: string): Suggestion | undefined
export const selectAllSuggestions = (state: EncounterState): Suggestion[]

// Tasks
export const selectTask = (state: EncounterState, id: string): BackgroundTask | undefined
export const selectAllTasks = (state: EncounterState): BackgroundTask[]

// Care Gaps
export const selectCareGap = (state: EncounterState, id: string): CareGapInstance | undefined
export const selectAllCareGaps = (state: EncounterState): CareGapInstance[]
```

### 2. `/src/state/selectors/derived.ts`

Derived selectors with filtering/grouping:

```typescript
// Items by category
export const selectItemsByCategory = (
  state: EncounterState, 
  category: ItemCategory
): ChartItem[]

// Items by status
export const selectItemsByStatus = (
  state: EncounterState, 
  status: ItemStatus
): ChartItem[]

// Active suggestions (not expired, dismissed, etc.)
export const selectActiveSuggestions = (state: EncounterState): Suggestion[]

// Suggestions by source
export const selectSuggestionsBySource = (
  state: EncounterState, 
  source: SuggestionSource
): Suggestion[]

// Tasks by status
export const selectTasksByStatus = (
  state: EncounterState, 
  status: TaskStatus
): BackgroundTask[]

// Pending tasks (needs action)
export const selectPendingTasks = (state: EncounterState): BackgroundTask[]

// Open care gaps
export const selectOpenCareGaps = (state: EncounterState): CareGapInstance[]

// Care gaps by category
export const selectCareGapsByCategory = (
  state: EncounterState, 
  category: CareGapCategory
): CareGapInstance[]
```

### 3. `/src/state/selectors/relationships.ts`

Relationship-based selectors:

```typescript
// Get tasks for a specific item
export const selectTasksForItem = (
  state: EncounterState, 
  itemId: string
): BackgroundTask[]

// Get suggestions for a specific item
export const selectSuggestionsForItem = (
  state: EncounterState, 
  itemId: string
): Suggestion[]

// Get items addressing a care gap
export const selectItemsForCareGap = (
  state: EncounterState, 
  gapId: string
): ChartItem[]

// Get diagnosis items linked to an item
export const selectLinkedDiagnoses = (
  state: EncounterState, 
  itemId: string
): DiagnosisItem[]
```

### 4. `/src/state/selectors/views.ts`

View-specific composed selectors:

```typescript
// Capture View
export interface CaptureViewData {
  items: ChartItem[];
  activeSuggestions: Suggestion[];
  transcriptionStatus: TranscriptionStatus;
  pendingTaskCount: number;
  mode: Mode;
}
export const selectCaptureViewData = (state: EncounterState): CaptureViewData

// Task Pane
export interface TaskPaneData {
  readyToSend: BackgroundTask[];
  needsReview: BackgroundTask[];
  processing: BackgroundTask[];
  completed: BackgroundTask[];
}
export const selectTaskPaneData = (state: EncounterState): TaskPaneData

// Review View
export interface ReviewViewData {
  itemsByCategory: Record<ItemCategory, ChartItem[]>;
  openCareGaps: CareGapInstance[];
  encounter: EncounterMeta | null;
}
export const selectReviewViewData = (state: EncounterState): ReviewViewData

// Patient Overview
export interface PatientOverviewData {
  patient: PatientContext | null;
  problemList: DiagnosisItem[];
  medications: MedicationItem[];
  allergies: AllergyItem[];
  openCareGaps: CareGapInstance[];
}
export const selectPatientOverviewData = (state: EncounterState): PatientOverviewData

// Minibar
export interface MinibarData {
  pendingReviewCount: number;
  alertCount: number;
  transcriptionStatus: TranscriptionStatus;
  syncStatus: SyncStatus;
}
export const selectMinibarData = (state: EncounterState): MinibarData
```

### 5. `/src/state/selectors/index.ts`

Re-export all selectors organized by category.

## Guidelines
- Selectors should be pure functions
- Use helper functions to avoid repetition
- Consider memoization for expensive computations (note: actual memoization implementation in store setup)
- Add JSDoc comments for complex selectors
```

---

## Chunk 1.6: Store Setup & Middleware

### Prompt

```
Create the store setup with middleware for the EHR state management.

## Requirements

### 1. `/src/state/store/types.ts`

Define store-related types:

```typescript
export interface Store {
  getState(): EncounterState;
  dispatch(action: EncounterAction): void;
  subscribe(listener: StoreListener): Unsubscribe;
}

export type StoreListener = (state: EncounterState, action: EncounterAction) => void;
export type Unsubscribe = () => void;

export type Middleware = (
  store: Store
) => (next: Dispatch) => (action: EncounterAction) => void;

export type Dispatch = (action: EncounterAction) => void;
```

### 2. `/src/state/middleware/audit.ts`

Create audit logging middleware:

```typescript
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: EncounterAction;
  userId: string | null;
  encounterId: string | null;
  previousState?: Partial<EncounterState>;  // Optional for debugging
}

export const createAuditMiddleware = (
  logger: (entry: AuditLogEntry) => void
): Middleware
```

The middleware should:
- Log every action with timestamp
- Include user ID from state.session.currentUser
- Include encounter ID from state.context.encounter
- Call the provided logger function

### 3. `/src/state/middleware/validation.ts`

Create validation middleware:

```typescript
export interface ValidationError {
  action: string;
  field: string;
  message: string;
}

export const validationMiddleware: Middleware
```

The middleware should:
- Validate action payloads before passing to reducer
- Throw or log errors for invalid actions
- Check required fields are present
- Check IDs reference existing entities where applicable

### 4. `/src/state/middleware/sideEffects.ts`

Create side effects middleware for triggering AI services:

```typescript
export type SideEffectHandler = (
  action: EncounterAction, 
  state: EncounterState,
  dispatch: Dispatch
) => void | Promise<void>;

export const createSideEffectsMiddleware = (
  handlers: SideEffectHandler[]
): Middleware
```

The middleware should:
- Run after action is processed (state updated)
- Call all registered handlers
- Handle async handlers without blocking
- Catch and log errors from handlers

### 5. `/src/state/middleware/sync.ts`

Create sync middleware:

```typescript
export interface SyncConfig {
  shouldSync: (action: EncounterAction) => boolean;
  syncAction: (action: EncounterAction, state: EncounterState) => Promise<void>;
}

export const createSyncMiddleware = (config: SyncConfig): Middleware
```

The middleware should:
- Check if action should trigger sync
- Add action to sync queue
- Dispatch SYNC_STARTED, SYNC_COMPLETED, or SYNC_FAILED as appropriate
- Handle offline mode (queue actions)

### 6. `/src/state/store/createStore.ts`

Create the store factory:

```typescript
export interface StoreConfig {
  initialState?: Partial<EncounterState>;
  middleware?: Middleware[];
}

export function createStore(config?: StoreConfig): Store
```

The store should:
- Initialize with provided or default state
- Apply middleware in order
- Notify subscribers after each action
- Support multiple subscribers

### 7. `/src/state/store/index.ts`

Export store creation and types.

## Guidelines
- Middleware should follow the pattern: store => next => action => result
- Audit middleware should be first (sees all actions)
- Validation middleware should be before reducer
- Side effects middleware should be after reducer
- All middleware should handle errors gracefully
```

---

## Chunk 1.7: Mock Data Generators

### Prompt

```
Create mock data generators for testing and prototyping the EHR system.

## Requirements

### 1. `/src/mocks/generators/ids.ts`

ID generation utilities:

```typescript
export function generateId(prefix?: string): string
export function generateMRN(): string
export function generateNPI(): string
```

### 2. `/src/mocks/generators/patients.ts`

Patient data generators:

```typescript
export function generatePatient(overrides?: Partial<PatientContext>): PatientContext

export function generateDemographics(overrides?: Partial<Demographics>): Demographics

export function generateProblemList(count?: number): ProblemListItem[]

export function generateMedicationList(count?: number): MedicationSummary[]

export function generateAllergyList(count?: number): AllergySummary[]

// Pre-built patient templates
export const PATIENT_TEMPLATES = {
  ucCough: PatientContext,      // 42yo F with HTN, DM, presenting with cough
  pcDiabetes: PatientContext,   // 58yo M with DM, HTN, hyperlipidemia
  healthyAdult: PatientContext, // 30yo with no significant history
  pediatric: PatientContext,    // 8yo for well child visit
  geriatric: PatientContext,    // 75yo with multiple comorbidities
}
```

### 3. `/src/mocks/generators/items.ts`

Chart item generators:

```typescript
export function generateChartItem(
  category: ItemCategory, 
  overrides?: Partial<ChartItem>
): ChartItem

export function generateMedicationItem(overrides?: Partial<MedicationItem>): MedicationItem

export function generateLabItem(overrides?: Partial<LabItem>): LabItem

export function generateDiagnosisItem(overrides?: Partial<DiagnosisItem>): DiagnosisItem

export function generateVitalsItem(overrides?: Partial<VitalsItem>): VitalsItem

export function generatePhysicalExamItem(
  system: ExamSystem, 
  overrides?: Partial<PhysicalExamItem>
): PhysicalExamItem

// etc for other item types

// Common item templates
export const ITEM_TEMPLATES = {
  // Medications
  benzonatate: MedicationItem,
  metformin: MedicationItem,
  lisinopril: MedicationItem,
  
  // Labs
  cbc: LabItem,
  cmp: LabItem,
  a1c: LabItem,
  rapidFlu: LabItem,
  rapidCovid: LabItem,
  
  // Diagnoses
  acuteBronchitis: DiagnosisItem,
  typetwoDiabetes: DiagnosisItem,
  essentialHypertension: DiagnosisItem,
}
```

### 4. `/src/mocks/generators/careGaps.ts`

Care gap generators:

```typescript
export function generateCareGapInstance(
  definitionId: string,
  patientId: string,
  overrides?: Partial<CareGapInstance>
): CareGapInstance

// Standard care gap definitions
export const CARE_GAP_DEFINITIONS: CareGapDefinition[] = [
  // Include definitions for:
  // - A1C monitoring (diabetes)
  // - Mammogram (breast cancer screening)
  // - Colonoscopy (colorectal screening)
  // - PHQ-9 (depression screening)
  // - Flu vaccine
  // - Pneumonia vaccine (65+)
  // - Eye exam (diabetes)
  // - Foot exam (diabetes)
]
```

### 5. `/src/mocks/generators/suggestions.ts`

Suggestion generators:

```typescript
export function generateSuggestion(
  type: SuggestionType,
  overrides?: Partial<Suggestion>
): Suggestion

export function generateChartItemSuggestion(
  itemTemplate: Partial<ChartItem>,
  source: SuggestionSource,
  confidence?: number
): Suggestion

export function generateDxAssociationSuggestion(
  targetItemId: string,
  diagnoses: DiagnosisSuggestion[]
): Suggestion
```

### 6. `/src/mocks/generators/tasks.ts`

Task generators:

```typescript
export function generateTask(
  type: TaskType,
  overrides?: Partial<BackgroundTask>
): BackgroundTask

export function generateDxAssociationTask(
  itemId: string,
  suggestedDx: DiagnosisSuggestion[]
): BackgroundTask

export function generateFormularyCheckTask(
  medicationId: string
): BackgroundTask
```

### 7. `/src/mocks/generators/encounters.ts`

Encounter generators:

```typescript
export function generateEncounter(
  type: EncounterType,
  overrides?: Partial<EncounterMeta>
): EncounterMeta

export function generateVisit(overrides?: Partial<VisitMeta>): VisitMeta

// Pre-built encounter templates
export const ENCOUNTER_TEMPLATES = {
  urgentCareCough: { encounter: EncounterMeta, visit: VisitMeta },
  diabetesFollowUp: { encounter: EncounterMeta, visit: VisitMeta },
  annualWellness: { encounter: EncounterMeta, visit: VisitMeta },
}
```

### 8. `/src/mocks/generators/state.ts`

Full state generators:

```typescript
export function generateEncounterState(
  patient: PatientContext,
  encounter: EncounterMeta,
  visit?: VisitMeta,
  options?: {
    items?: ChartItem[];
    careGaps?: CareGapInstance[];
    user?: User;
  }
): EncounterState
```

### 9. `/src/mocks/index.ts`

Re-export all generators and templates.

## Guidelines
- Use realistic medical data (real ICD codes, drug names, etc.)
- Generators should produce valid data that passes validation
- Templates should match the scenario documents
- Include variety in generated data (don't always use same values)
- Add randomization where appropriate but keep deterministic option for testing
```

---

## Execution Order

Run these prompts in sequence:

1. **1.1 Core Types** → Creates all type definitions
2. **1.2 State Shape** → Uses types to define state structure
3. **1.3 Actions** → Uses types to define all actions
4. **1.4 Reducers** → Uses types, state, and actions
5. **1.5 Selectors** → Uses types and state
6. **1.6 Store** → Uses all of the above
7. **1.7 Mock Data** → Uses types for generators

After completing Phase 1, you'll have:
- Complete TypeScript type system
- Functional state management
- Test data generators
- Ready for Phase 2 (AI Services)

---

## Verification

After each chunk, verify:

- [ ] TypeScript compiles without errors
- [ ] All exports are properly defined
- [ ] No circular dependencies
- [ ] Unit tests pass (if applicable)

---

## Related Documents

- [State Contract](../architecture/STATE_CONTRACT.md) — Detailed state design
- [Chart Items](../models/CHART_ITEMS.md) — Item type specifications
- [Visit Scenarios](../scenarios/VISIT_SCENARIOS.md) — Test scenarios
