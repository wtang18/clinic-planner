# Phase 2: AI Services — Claude Code Prompts

This document contains Claude Code prompts for building the AI service layer. All prompts are designed for **auto-accept mode** (`--dangerously-skip-permissions`).

---

## Safety Notes for Auto-Accept

✅ **Safe operations in this phase:**
- Creating new files in `/src/services/`
- Creating new files in `/src/utils/`
- Installing standard npm packages

⚠️ **Review after completion:**
- AI service configurations (timeouts, thresholds)
- Mock LLM responses for testing
- Any environment variable references

---

## Overview

| Chunk | Description | Dependencies | Est. Files |
|-------|-------------|--------------|------------|
| 2.1 | AI Service Infrastructure | Phase 1 complete | 5 |
| 2.2 | Transcription Service | 2.1 | 4 |
| 2.3 | Entity Extraction Service | 2.1, 2.2 | 4 |
| 2.4 | Diagnosis Association Service | 2.1 | 3 |
| 2.5 | Drug Interaction Service | 2.1 | 3 |
| 2.6 | Care Gap Monitor Service | 2.1 | 4 |
| 2.7 | Note Generation Service | 2.1 | 3 |
| 2.8 | Service Registry & Manager | 2.1-2.7 | 3 |

---

## Chunk 2.1: AI Service Infrastructure

### Prompt

```
Create the AI service infrastructure for an EHR system. This establishes the base patterns all AI services will use.

## Requirements

Create the following NEW files (do not modify existing files):

### 1. `/src/services/ai/types.ts`

Define the core AI service interfaces:

```typescript
interface AIService {
  id: string;
  name: string;
  
  // What triggers this service
  triggers: AIServiceTriggers;
  
  // Execution
  shouldRun: (state: EncounterState, trigger: TriggerContext) => boolean;
  run: (state: EncounterState, trigger: TriggerContext) => Promise<AIServiceResult>;
  
  // Configuration
  config: AIServiceConfig;
}

interface AIServiceTriggers {
  actions?: string[];           // Action types to react to
  stateChanges?: string[];      // State paths to watch
  interval?: number;            // Polling interval (ms)
}

interface AIServiceConfig {
  local: boolean;               // Run on local LLM vs cloud
  timeout: number;              // Max execution time (ms)
  retryable: boolean;           // Can retry on failure
  requiresNetwork: boolean;     // Needs network access
  maxRetries?: number;          // Default 3
  retryDelayMs?: number;        // Default 1000
}

interface AIServiceResult {
  actions: EncounterAction[];   // Actions to dispatch
  notifications?: Notification[];
}

interface TriggerContext {
  type: 'action' | 'state-change' | 'interval';
  action?: EncounterAction;
  changedPaths?: string[];
  timestamp: Date;
}

interface Notification {
  type: 'info' | 'warning' | 'error';
  message: string;
  persistent?: boolean;
  actionLabel?: string;
  actionTarget?: string;
}
```

### 2. `/src/services/ai/registry.ts`

Create the service registry:

```typescript
interface AIServiceRegistry {
  services: Map<string, AIService>;
  enabledServices: Set<string>;
  
  register(service: AIService): void;
  unregister(serviceId: string): void;
  
  enable(serviceId: string): void;
  disable(serviceId: string): void;
  isEnabled(serviceId: string): boolean;
  
  getService(serviceId: string): AIService | undefined;
  getAllServices(): AIService[];
  getEnabledServices(): AIService[];
  
  getTriggeredServices(action: EncounterAction): AIService[];
}

// Export factory function
export function createServiceRegistry(): AIServiceRegistry
```

### 3. `/src/services/ai/executor.ts`

Create the service executor with timeout and retry logic:

```typescript
interface ServiceExecutor {
  execute(
    service: AIService,
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult>;
  
  cancel(serviceId: string): void;
}

interface ExecutionOptions {
  timeout?: number;
  retries?: number;
  onProgress?: (progress: number, message?: string) => void;
}

// Export factory function
export function createServiceExecutor(): ServiceExecutor
```

Implementation should include:
- Timeout handling with Promise.race
- Retry logic with exponential backoff
- Cancellation support via AbortController
- Error wrapping with service context

### 4. `/src/services/ai/subscription-manager.ts`

Create the subscription manager that coordinates services:

```typescript
interface AISubscriptionManager {
  start(): void;
  stop(): void;
  
  // Manual trigger for testing
  triggerService(serviceId: string, context?: Partial<TriggerContext>): Promise<void>;
  
  // Status
  isRunning(): boolean;
  getRunningTasks(): { serviceId: string; startedAt: Date }[];
}

interface SubscriptionManagerConfig {
  registry: AIServiceRegistry;
  store: Store;
  executor: ServiceExecutor;
  notificationHandler?: (notifications: Notification[]) => void;
}

// Export factory function
export function createSubscriptionManager(config: SubscriptionManagerConfig): AISubscriptionManager
```

The manager should:
- Subscribe to store actions
- Check which services should run for each action
- Execute services via executor
- Dispatch resulting actions back to store
- Handle notifications

### 5. `/src/services/ai/index.ts`

Export all AI service infrastructure:
- All types
- Registry factory
- Executor factory
- Subscription manager factory

## Guidelines
- Use TypeScript strict mode
- All async operations should be properly typed
- Include JSDoc comments for public APIs
- Do not import from files that don't exist yet
- Use types from `/src/types/` and `/src/state/`
```

---

## Chunk 2.2: Transcription Service

### Prompt

```
Create the transcription service for the EHR system. This handles audio transcription state and segment processing.

## Requirements

Create the following NEW files:

### 1. `/src/services/transcription/types.ts`

Define transcription-specific types:

```typescript
interface TranscriptionConfig {
  sampleRate: number;           // Default 16000
  language: string;             // Default 'en-US'
  enableSpeakerDiarization: boolean;
  maxSegmentDuration: number;   // seconds
  silenceThreshold: number;     // dB
  minConfidence: number;        // 0-1, filter low confidence
}

interface TranscriptionEvent {
  type: 'segment' | 'partial' | 'error' | 'status-change';
  timestamp: Date;
  data: TranscriptSegment | PartialTranscript | TranscriptionError | TranscriptionStatus;
}

interface PartialTranscript {
  text: string;
  confidence: number;
  isFinal: boolean;
}

interface TranscriptionError {
  code: string;
  message: string;
  recoverable: boolean;
}

type TranscriptionEventHandler = (event: TranscriptionEvent) => void;
```

### 2. `/src/services/transcription/transcription-service.ts`

Create the transcription service:

```typescript
interface TranscriptionService {
  // Lifecycle
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<TranscriptSegment[]>;
  
  // State
  getStatus(): TranscriptionStatus;
  getSegments(): TranscriptSegment[];
  getDuration(): number;
  
  // Events
  onEvent(handler: TranscriptionEventHandler): () => void;
  
  // Configuration
  updateConfig(config: Partial<TranscriptionConfig>): void;
}

// Export factory
export function createTranscriptionService(
  config?: Partial<TranscriptionConfig>
): TranscriptionService
```

Implementation notes:
- Use a mock audio processor for now (real implementation would use Web Audio API)
- Simulate segment generation for testing
- Properly manage status transitions
- Clean up resources on stop

### 3. `/src/services/transcription/mock-transcription.ts`

Create mock transcription for testing:

```typescript
interface MockTranscriptionConfig {
  segments: Array<{
    text: string;
    delayMs: number;
    confidence?: number;
    speaker?: string;
  }>;
  autoStart?: boolean;
}

export function createMockTranscriptionService(
  mockConfig: MockTranscriptionConfig
): TranscriptionService
```

Include pre-built mock scenarios:
- `UC_COUGH_SEGMENTS`: Segments for urgent care cough visit
- `PC_DIABETES_SEGMENTS`: Segments for primary care diabetes visit

### 4. `/src/services/transcription/index.ts`

Export all transcription service components.

## Guidelines
- Transcription service should be stateful but not depend on global state
- Events should be typed discriminated unions
- Mock service should be timing-accurate for realistic testing
- Include segment IDs using UUID generation
```

---

## Chunk 2.3: Entity Extraction Service

### Prompt

```
Create the entity extraction AI service for the EHR system. This extracts structured medical entities from transcription segments.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/entity-extraction/types.ts`

Define entity extraction types:

```typescript
interface EntityExtractionConfig {
  minConfidence: number;        // 0-1, default 0.6
  enabledEntityTypes: EntityType[];
  contextWindowSize: number;    // How many previous segments to include
}

interface ExtractionResult {
  entities: ExtractedEntity[];
  processingTimeMs: number;
  modelUsed: string;
}

interface EntityToSuggestionMapping {
  entityType: EntityType;
  suggestionType: SuggestionType;
  itemCategory: ItemCategory;
  templateBuilder: (entity: ExtractedEntity, context: ExtractionContext) => Partial<ChartItem>;
}

interface ExtractionContext {
  segment: TranscriptSegment;
  previousSegments: TranscriptSegment[];
  patientContext: PatientContext | null;
  existingItems: ChartItem[];
}
```

### 2. `/src/services/ai/entity-extraction/entity-extraction-service.ts`

Create the AI service implementation:

```typescript
export const entityExtractionService: AIService = {
  id: 'entity-extraction',
  name: 'Transcription Entity Extraction',
  
  triggers: {
    actions: ['TRANSCRIPTION_SEGMENT_RECEIVED'],
  },
  
  shouldRun: (state, trigger) => {
    // Check segment confidence threshold
    // Check if service is appropriate for current mode
  },
  
  run: async (state, trigger) => {
    // Extract entities from segment
    // Map entities to suggestions
    // Return SUGGESTION_RECEIVED actions
  },
  
  config: {
    local: true,          // PHI in transcription
    timeout: 2000,
    retryable: false,     // Real-time, don't retry old segments
    requiresNetwork: false,
  },
};
```

### 3. `/src/services/ai/entity-extraction/extractors.ts`

Create entity extraction logic:

```typescript
// Main extraction function
export async function extractEntities(
  text: string,
  context: ExtractionContext,
  config: EntityExtractionConfig
): Promise<ExtractionResult>

// Entity-specific extractors
export function extractMedications(text: string): ExtractedEntity[]
export function extractDiagnoses(text: string): ExtractedEntity[]
export function extractSymptoms(text: string): ExtractedEntity[]
export function extractVitals(text: string): ExtractedEntity[]
export function extractLabTests(text: string): ExtractedEntity[]

// Normalization
export function normalizeMedication(text: string): { name: string; rxNorm?: string } | null
export function normalizeDiagnosis(text: string): { description: string; icdCode?: string } | null
```

Implementation notes:
- Use regex patterns for initial extraction (production would use NLP/LLM)
- Include common medication name mappings
- Include common symptom/diagnosis patterns
- Return confidence scores based on pattern match quality

### 4. `/src/services/ai/entity-extraction/index.ts`

Export all entity extraction components.

## Guidelines
- Extractors should be pure functions for testability
- Include common medical terminology patterns
- Confidence scoring should be consistent
- Map extracted entities to appropriate suggestion types
```

---

## Chunk 2.4: Diagnosis Association Service

### Prompt

```
Create the diagnosis association AI service for the EHR system. This suggests ICD-10 diagnosis linkages for orders and medications.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/dx-association/types.ts`

Define diagnosis association types:

```typescript
interface DxAssociationConfig {
  autoLinkThreshold: number;    // Confidence above this auto-links (default 0.95)
  suggestionThreshold: number;  // Confidence above this creates suggestion (default 0.6)
  maxSuggestions: number;       // Max Dx suggestions per item (default 3)
}

interface DxAssociationResult {
  itemId: string;
  suggestions: DxSuggestion[];
  autoLinked?: DxSuggestion;    // If confidence was high enough
}

interface DxSuggestion {
  diagnosisId?: string;         // If existing Dx in chart
  description: string;
  icdCode: string;
  confidence: number;
  reasoning: string;
  isNew: boolean;               // Suggests adding new Dx
}

interface DxMappingRule {
  itemPattern: {
    category: ItemCategory;
    namePattern?: RegExp;
    codePattern?: RegExp;
  };
  suggestedDx: {
    description: string;
    icdCode: string;
    confidence: number;
  }[];
}
```

### 2. `/src/services/ai/dx-association/dx-association-service.ts`

Create the AI service implementation:

```typescript
export const dxAssociationService: AIService = {
  id: 'dx-association',
  name: 'Diagnosis Association',
  
  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_UPDATED'],
  },
  
  shouldRun: (state, trigger) => {
    // Check if item needs Dx linkage (medications, labs, imaging, procedures)
    // Check if item already has linked diagnoses
  },
  
  run: async (state, trigger) => {
    // Get item from trigger
    // Get existing diagnoses from state
    // Run association logic
    // Return TASK_CREATED action with suggestions
  },
  
  config: {
    local: true,          // Uses patient context
    timeout: 5000,
    retryable: true,
    requiresNetwork: false,
  },
};
```

### 3. `/src/services/ai/dx-association/dx-mapper.ts`

Create diagnosis mapping logic:

```typescript
// Main mapping function
export async function suggestDxAssociation(
  item: ChartItem,
  existingDiagnoses: DiagnosisItem[],
  patientContext: PatientContext | null,
  config: DxAssociationConfig
): Promise<DxAssociationResult>

// Rule-based mapping
export function applyMappingRules(item: ChartItem): DxSuggestion[]

// Context-aware ranking
export function rankByPatientContext(
  suggestions: DxSuggestion[],
  patientContext: PatientContext | null
): DxSuggestion[]

// Common mapping rules
export const DX_MAPPING_RULES: DxMappingRule[]
```

Include mapping rules for:
- Common medications → diagnoses (Metformin → E11.9, Lisinopril → I10)
- Common labs → diagnoses (A1C → E11.9, Lipid panel → E78.5)
- Common imaging → diagnoses (Chest X-ray → various respiratory)

### 4. `/src/services/ai/dx-association/index.ts`

Export all diagnosis association components.

## Guidelines
- Rules should be configurable/extensible
- Consider existing chart diagnoses in ranking
- Provide clear reasoning for suggestions
- Support both linking to existing Dx and suggesting new Dx
```

---

## Chunk 2.5: Drug Interaction Service

### Prompt

```
Create the drug interaction checking AI service for the EHR system.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/drug-interaction/types.ts`

Define drug interaction types:

```typescript
interface DrugInteractionConfig {
  checkAgainstActive: boolean;      // Check against active meds
  checkAgainstProposed: boolean;    // Check against other new meds
  severityThreshold: InteractionSeverity; // Minimum severity to report
}

type InteractionSeverity = 'mild' | 'moderate' | 'severe' | 'contraindicated';

interface DrugInteraction {
  drug1: DrugReference;
  drug2: DrugReference;
  severity: InteractionSeverity;
  description: string;
  clinicalEffects: string;
  recommendation: string;
  source: string;                   // "FDA", "Lexicomp", etc.
}

interface DrugReference {
  name: string;
  rxNorm?: string;
  ndc?: string;
}

interface InteractionCheckResult {
  medication: MedicationItem;
  interactions: DrugInteraction[];
  checkedAgainst: DrugReference[];
  checkTimestamp: Date;
}
```

### 2. `/src/services/ai/drug-interaction/drug-interaction-service.ts`

Create the AI service implementation:

```typescript
export const drugInteractionService: AIService = {
  id: 'drug-interaction',
  name: 'Drug Interaction Checker',
  
  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_UPDATED'],
  },
  
  shouldRun: (state, trigger) => {
    // Check if item is a medication
    // Check if not a discontinuation
  },
  
  run: async (state, trigger) => {
    // Get medication from trigger
    // Get current medications from state
    // Check interactions
    // Return TASK_CREATED for alerts, or empty if no interactions
  },
  
  config: {
    local: false,         // Drug database is external
    timeout: 3000,
    retryable: true,
    requiresNetwork: true,
  },
};
```

### 3. `/src/services/ai/drug-interaction/interaction-checker.ts`

Create interaction checking logic:

```typescript
// Main check function
export async function checkDrugInteractions(
  newMedication: MedicationItem,
  currentMedications: MedicationItem[],
  config: DrugInteractionConfig
): Promise<InteractionCheckResult>

// Mock interaction database
export const KNOWN_INTERACTIONS: DrugInteraction[]

// Lookup functions
export function findInteractions(
  drug1: string,
  drug2: string
): DrugInteraction | null

export function normalizeDrugName(name: string): string
```

Include known interactions:
- Metformin + Contrast dye (severe)
- Warfarin + NSAIDs (moderate)
- ACE inhibitors + Potassium supplements (moderate)
- SSRIs + MAOIs (contraindicated)
- Statins + Grapefruit (mild)

### 4. `/src/services/ai/drug-interaction/index.ts`

Export all drug interaction components.

## Guidelines
- Severity levels should trigger different UI behaviors
- Severe/contraindicated should create blocking alerts
- Include clinical recommendations in results
- Mock database should be realistic for testing
```

---

## Chunk 2.6: Care Gap Monitor Service

### Prompt

```
Create the care gap monitoring AI service for the EHR system.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/care-gap-monitor/types.ts`

Define care gap monitoring types:

```typescript
interface CareGapMonitorConfig {
  evaluateOnEncounterOpen: boolean;
  evaluateOnItemAdd: boolean;
  relevantItemCategories: ItemCategory[];
}

interface GapEvaluationResult {
  gapId: string;
  status: 'no-change' | 'addressed' | 'closed' | 'pending';
  addressedBy?: {
    itemId: string;
    itemType: string;
  };
  reason?: string;
}

interface PatientGapEvaluation {
  patientId: string;
  evaluatedAt: Date;
  gaps: CareGapInstance[];
  newGaps: CareGapInstance[];
  closedGaps: string[];
}
```

### 2. `/src/services/ai/care-gap-monitor/care-gap-monitor-service.ts`

Create the AI service implementation:

```typescript
export const careGapMonitorService: AIService = {
  id: 'care-gap-monitor',
  name: 'Care Gap Monitor',
  
  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_RESULT_RECEIVED', 'ENCOUNTER_OPENED'],
  },
  
  shouldRun: (state, trigger) => {
    // For ENCOUNTER_OPENED: always run
    // For ITEM_*: check if item category is relevant to gaps
  },
  
  run: async (state, trigger) => {
    // If ENCOUNTER_OPENED: evaluate all gaps for patient
    // If ITEM_*: check if item addresses any open gaps
    // Return appropriate care gap actions
  },
  
  config: {
    local: false,         // Gap definitions from server
    timeout: 10000,
    retryable: true,
    requiresNetwork: true,
  },
};
```

### 3. `/src/services/ai/care-gap-monitor/gap-evaluator.ts`

Create gap evaluation logic:

```typescript
// Evaluate all gaps for a patient
export async function evaluatePatientGaps(
  patient: PatientContext
): Promise<PatientGapEvaluation>

// Check if item closes a specific gap
export async function evaluateGapClosure(
  gap: CareGapInstance,
  item: ChartItem
): Promise<GapEvaluationResult>

// Match item against closure criteria
export function matchesClosureCriteria(
  item: ChartItem,
  criteria: CareGapClosureCriteria
): { matches: boolean; pending: boolean; reason?: string }

// Get suggested actions to close a gap
export function getClosureActions(
  gap: CareGapInstance
): ClosureAction[]

interface ClosureAction {
  type: 'order-lab' | 'order-imaging' | 'schedule-procedure' | 'administer' | 'document';
  label: string;
  itemTemplate?: Partial<ChartItem>;
}
```

### 4. `/src/services/ai/care-gap-monitor/index.ts`

Export all care gap monitor components.

## Guidelines
- Handle composite closure criteria (AND/OR logic)
- Track closure attempts even if not fully closed
- Distinguish between "addressed" (action taken) and "closed" (criteria met)
- Support pending states (lab ordered but not resulted)
```

---

## Chunk 2.7: Note Generation Service

### Prompt

```
Create the visit note generation AI service for the EHR system.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/note-generation/types.ts`

Define note generation types:

```typescript
interface NoteGenerationConfig {
  format: 'soap' | 'problem-oriented' | 'narrative';
  includeSections: NoteSection[];
  maxLength?: number;
  includeDisclaimer: boolean;
}

type NoteSection = 
  | 'chief-complaint'
  | 'hpi'
  | 'ros'
  | 'physical-exam'
  | 'assessment'
  | 'plan'
  | 'medications'
  | 'follow-up';

interface GeneratedNote {
  text: string;
  format: string;
  sections: NoteSectionContent[];
  confidence: number;
  generatedAt: Date;
  basedOnItems: string[];         // Item IDs used
}

interface NoteSectionContent {
  section: NoteSection;
  content: string;
  sourceItems: string[];
}

interface NoteTemplate {
  format: string;
  sectionOrder: NoteSection[];
  sectionTemplates: Record<NoteSection, string>;
}
```

### 2. `/src/services/ai/note-generation/note-generation-service.ts`

Create the AI service implementation:

```typescript
export const noteGenerationService: AIService = {
  id: 'note-generation',
  name: 'Visit Note Generation',
  
  triggers: {
    actions: ['MODE_CHANGED'],
  },
  
  shouldRun: (state, trigger) => {
    // Check if transitioning to 'review' mode
    // Check if note doesn't already exist
  },
  
  run: async (state, trigger) => {
    // Gather all chart items
    // Generate structured note
    // Return ITEM_ADDED action with note
  },
  
  config: {
    local: true,          // Full narrative contains PHI
    timeout: 15000,
    retryable: true,
    requiresNetwork: false,
  },
};
```

### 3. `/src/services/ai/note-generation/note-generator.ts`

Create note generation logic:

```typescript
// Main generation function
export async function generateVisitNote(
  items: ChartItem[],
  context: {
    encounter: EncounterMeta;
    patient: PatientContext;
    visit: VisitMeta;
  },
  config: NoteGenerationConfig
): Promise<GeneratedNote>

// Section generators
export function generateHPI(items: ChartItem[]): string
export function generateROS(items: ChartItem[]): string
export function generatePhysicalExam(items: ChartItem[]): string
export function generateAssessment(items: ChartItem[]): string
export function generatePlan(items: ChartItem[]): string

// Helpers
export function groupItemsByCategory(items: ChartItem[]): Record<ItemCategory, ChartItem[]>
export function formatMedicationList(medications: MedicationItem[]): string
export function formatDiagnosisList(diagnoses: DiagnosisItem[]): string
```

Include SOAP note template structure.

### 4. `/src/services/ai/note-generation/index.ts`

Export all note generation components.

## Guidelines
- Generated notes should be clearly marked as AI-generated
- Include all relevant chart items in the note
- Use appropriate medical terminology
- Support different note formats
- Include item IDs for traceability
```

---

## Chunk 2.8: Service Registry & Manager

### Prompt

```
Create the service registry initialization and unified manager for the EHR AI services.

## Requirements

Create the following NEW files:

### 1. `/src/services/ai/services/all-services.ts`

Register all AI services:

```typescript
import { entityExtractionService } from '../entity-extraction';
import { dxAssociationService } from '../dx-association';
import { drugInteractionService } from '../drug-interaction';
import { careGapMonitorService } from '../care-gap-monitor';
import { noteGenerationService } from '../note-generation';

export const ALL_AI_SERVICES: AIService[] = [
  entityExtractionService,
  dxAssociationService,
  drugInteractionService,
  careGapMonitorService,
  noteGenerationService,
];

// Service IDs for easy reference
export const SERVICE_IDS = {
  ENTITY_EXTRACTION: 'entity-extraction',
  DX_ASSOCIATION: 'dx-association',
  DRUG_INTERACTION: 'drug-interaction',
  CARE_GAP_MONITOR: 'care-gap-monitor',
  NOTE_GENERATION: 'note-generation',
} as const;
```

### 2. `/src/services/ai/services/service-config.ts`

Create configurable service settings:

```typescript
interface AIServicesConfig {
  enabledServices: string[];
  serviceOverrides: Record<string, Partial<AIServiceConfig>>;
  globalSettings: {
    maxConcurrentTasks: number;
    defaultTimeout: number;
    enableLocalLLM: boolean;
    cloudEndpoint?: string;
  };
}

export const DEFAULT_CONFIG: AIServicesConfig = {
  enabledServices: [
    'entity-extraction',
    'dx-association',
    'drug-interaction',
    'care-gap-monitor',
    'note-generation',
  ],
  serviceOverrides: {},
  globalSettings: {
    maxConcurrentTasks: 5,
    defaultTimeout: 10000,
    enableLocalLLM: true,
  },
};

export function mergeConfig(
  base: AIServicesConfig,
  overrides: Partial<AIServicesConfig>
): AIServicesConfig
```

### 3. `/src/services/ai/services/ai-manager.ts`

Create the unified AI manager:

```typescript
interface AIManager {
  // Lifecycle
  initialize(store: Store, config?: Partial<AIServicesConfig>): void;
  shutdown(): void;
  
  // Service control
  enableService(serviceId: string): void;
  disableService(serviceId: string): void;
  isServiceEnabled(serviceId: string): boolean;
  
  // Status
  getStatus(): AIManagerStatus;
  getServiceStatus(serviceId: string): ServiceStatus;
  
  // Events
  onServiceComplete(handler: (serviceId: string, result: AIServiceResult) => void): () => void;
  onServiceError(handler: (serviceId: string, error: Error) => void): () => void;
}

interface AIManagerStatus {
  initialized: boolean;
  running: boolean;
  enabledServices: string[];
  runningTasks: number;
}

interface ServiceStatus {
  enabled: boolean;
  lastRun?: Date;
  lastError?: string;
  runCount: number;
  errorCount: number;
}

// Export singleton factory
export function createAIManager(): AIManager
```

### 4. `/src/services/index.ts`

Export unified service layer:

```typescript
// AI Services
export * from './ai';
export * from './ai/services/ai-manager';
export * from './ai/services/all-services';
export * from './ai/services/service-config';

// Transcription
export * from './transcription';

// Convenience function
export function initializeServices(store: Store, config?: Partial<AIServicesConfig>): AIManager
```

## Guidelines
- Manager should be the single entry point for AI services
- Support runtime enable/disable of services
- Track service statistics for monitoring
- Clean shutdown should cancel pending tasks
- Export everything needed for UI integration
```

---

## Execution Order

Run these prompts in sequence:

1. **2.1 AI Service Infrastructure** → Base patterns
2. **2.2 Transcription Service** → Handles audio/text
3. **2.3 Entity Extraction** → Uses transcription output
4. **2.4 Dx Association** → Independent of transcription
5. **2.5 Drug Interaction** → Independent of transcription
6. **2.6 Care Gap Monitor** → Independent of transcription
7. **2.7 Note Generation** → Uses all items
8. **2.8 Registry & Manager** → Ties everything together

---

## Verification Checklist

After completing Phase 2:

- [ ] All files compile with no TypeScript errors
- [ ] Services can be registered in registry
- [ ] Subscription manager dispatches actions
- [ ] Mock transcription generates segments
- [ ] Entity extraction produces suggestions
- [ ] Dx association creates tasks
- [ ] Drug interaction detects conflicts
- [ ] Care gap monitor evaluates gaps
- [ ] Note generation produces structured output
- [ ] AI Manager initializes all services

---

## Related Documents

- [AI Integration](./AI_INTEGRATION.md) — Architecture reference
- [State Contract](./STATE_CONTRACT.md) — Actions dispatched by services
- [Parallel Streams](./PARALLEL_STREAMS.md) — How services interact
