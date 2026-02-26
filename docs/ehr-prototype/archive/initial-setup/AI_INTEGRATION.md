# AI Integration Architecture

## Overview

AI services operate as a subscription layer that watches state changes and dispatches actions. This decouples AI from the UI layer and provides consistent integration points.

```
       ┌──────────────────────────────┐
       │      AI Service Layer        │
       │  ┌─────────────────────────┐ │
       │  │ Transcription Service   │ │◄── Subscribes to transcription events
       │  │ Entity Extraction       │ │◄── Subscribes to new segments
       │  │ Dx Mapping Service      │ │◄── Subscribes to new items
       │  │ Note Generation         │ │◄── Subscribes to mode changes
       │  │ Care Gap Monitor        │ │◄── Subscribes to items + encounter open
       │  └─────────────────────────┘ │
       │            │                 │
       │            ▼                 │
       │     Dispatches actions       │
       └──────────────────────────────┘
                    │
                    ▼
              State Store
```

---

## Service Interface

```typescript
interface AIService {
  id: string;
  name: string;
  
  // What state changes trigger this service
  triggers: {
    actions?: string[];           // Action types to react to
    stateChanges?: string[];      // State paths to watch
    interval?: number;            // Polling interval (ms)
  };
  
  // Execution
  shouldRun: (state: EncounterState, trigger: any) => boolean;
  run: (state: EncounterState, trigger: any) => Promise<AIServiceResult>;
  
  // Configuration
  config: {
    local: boolean;               // Run on local LLM vs. cloud
    timeout: number;
    retryable: boolean;
    requiresNetwork: boolean;
  };
}

interface AIServiceResult {
  actions: EncounterAction[];     // Actions to dispatch
  notifications?: Notification[]; // UI notifications (for minibar)
}
```

---

## Service Registry

```typescript
interface AIServiceRegistry {
  services: Map<string, AIService>;
  
  register(service: AIService): void;
  unregister(serviceId: string): void;
  
  // Enable/disable at runtime
  enable(serviceId: string): void;
  disable(serviceId: string): void;
  isEnabled(serviceId: string): boolean;
  
  // Get services that should run for a given trigger
  getTriggeredServices(action: EncounterAction): AIService[];
}
```

---

## Core Services

### 1. Transcription Entity Extraction

**Purpose**: Extract structured entities from transcription segments.

```typescript
const entityExtractionService: AIService = {
  id: 'entity-extraction',
  name: 'Transcription Entity Extraction',
  
  triggers: {
    actions: ['TRANSCRIPTION_SEGMENT_RECEIVED'],
  },
  
  shouldRun: (state, trigger) => {
    return trigger.payload.segment.confidence > 0.7;
  },
  
  run: async (state, trigger) => {
    const segment = trigger.payload.segment;
    const entities = await extractEntities(segment.text, state.context.patient);
    
    const actions: EncounterAction[] = entities.map(entity => ({
      type: 'SUGGESTION_RECEIVED',
      payload: {
        suggestion: {
          id: uuid(),
          type: entity.type,
          content: entity,
          confidence: entity.confidence,
          source: 'transcription',
          sourceSegmentId: segment.id,
          status: 'active',
          createdAt: new Date(),
          expiresAt: addMinutes(new Date(), 2), // 2 min TTL
        },
        source: 'transcription',
      },
    }));
    
    return { actions };
  },
  
  config: {
    local: true,      // PHI in transcription — keep local
    timeout: 2000,
    retryable: false, // Real-time, don't retry old segments
    requiresNetwork: false,
  },
};
```

### 2. Diagnosis Association

**Purpose**: Suggest diagnosis linkages for orders.

```typescript
const dxAssociationService: AIService = {
  id: 'dx-association',
  name: 'Diagnosis Association',
  
  triggers: {
    actions: ['ITEM_ADDED'],
  },
  
  shouldRun: (state, trigger) => {
    const item = trigger.payload.item;
    return ['medication', 'lab', 'imaging', 'procedure'].includes(item.category)
      && item.linkedDiagnoses.length === 0;
  },
  
  run: async (state, trigger) => {
    const item = trigger.payload.item;
    const diagnoses = Object.values(state.entities.items)
      .filter(i => i.category === 'diagnosis');
    
    const suggestions = await suggestDxAssociation(item, diagnoses, state.context.patient);
    
    return {
      actions: [
        {
          type: 'TASK_CREATED',
          payload: {
            task: {
              id: uuid(),
              type: 'dx-association',
              status: 'pending-review',
              relatedItemId: item.id,
              result: suggestions,
              createdAt: new Date(),
            },
            relatedItemId: item.id,
          },
        },
      ],
    };
  },
  
  config: {
    local: true,      // Uses patient diagnoses — keep local
    timeout: 5000,
    retryable: true,
    requiresNetwork: false,
  },
};
```

### 3. Note Generation

**Purpose**: Generate visit note from chart items.

```typescript
const noteGenerationService: AIService = {
  id: 'note-generation',
  name: 'Visit Note Generation',
  
  triggers: {
    actions: ['MODE_CHANGED'],
  },
  
  shouldRun: (state, trigger) => {
    return trigger.payload.to === 'review'
      && !state.entities.items.find(i => 
          i.category === 'note' && i._meta.aiGenerated
        );
  },
  
  run: async (state, trigger) => {
    const items = Object.values(state.entities.items);
    const note = await generateVisitNote(items, state.context);
    
    return {
      actions: [
        {
          type: 'ITEM_ADDED',
          payload: {
            item: {
              id: uuid(),
              category: 'note',
              displayText: 'Visit Note',
              data: {
                text: note.text,
                format: 'structured',
              },
              _meta: {
                aiGenerated: true,
                aiConfidence: note.confidence,
                requiresReview: true,
                syncStatus: 'local',
              },
              // ... other base fields
            },
            source: { type: 'ai-generated' },
          },
        },
      ],
      notifications: [
        {
          type: 'info',
          message: 'Visit note draft ready for review',
          actionLabel: 'Review',
          actionTarget: 'note-review',
        },
      ],
    };
  },
  
  config: {
    local: true,      // Full narrative — keep local
    timeout: 15000,
    retryable: true,
    requiresNetwork: false,
  },
};
```

### 4. Care Gap Monitor

**Purpose**: Track care gap closure based on chart items.

```typescript
const careGapMonitorService: AIService = {
  id: 'care-gap-monitor',
  name: 'Care Gap Monitor',
  
  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_RESULT_RECEIVED', 'ENCOUNTER_OPENED'],
  },
  
  shouldRun: (state, trigger) => {
    if (trigger.type === 'ENCOUNTER_OPENED') return true;
    
    const item = trigger.payload.item;
    return ['lab', 'imaging', 'immunization', 'procedure', 'assessment']
      .includes(item?.category);
  },
  
  run: async (state, trigger) => {
    const actions: EncounterAction[] = [];
    
    if (trigger.type === 'ENCOUNTER_OPENED') {
      // Refresh all gaps for patient
      const gaps = await evaluatePatientGaps(state.context.patient);
      actions.push({
        type: 'CARE_GAPS_REFRESHED',
        payload: { gaps },
      });
    } else {
      // Check if item closes any gaps
      const item = trigger.payload.item;
      const openGaps = Object.values(state.entities.careGaps)
        .filter(g => g.status === 'open');
      
      for (const gap of openGaps) {
        const result = await evaluateGapClosure(gap, item);
        if (result.matches) {
          actions.push({
            type: 'CARE_GAP_ADDRESSED',
            payload: {
              gapId: gap.id,
              itemId: item.id,
              result: result.pending ? 'pending' : 'closed',
            },
          });
        }
      }
    }
    
    return { actions };
  },
  
  config: {
    local: false,     // Needs gap definitions from server
    timeout: 10000,
    retryable: true,
    requiresNetwork: true,
  },
};
```

### 5. Drug Interaction Checker

**Purpose**: Check for drug-drug interactions when medications are added.

```typescript
const drugInteractionService: AIService = {
  id: 'drug-interaction',
  name: 'Drug Interaction Checker',
  
  triggers: {
    actions: ['ITEM_ADDED', 'ITEM_UPDATED'],
  },
  
  shouldRun: (state, trigger) => {
    const item = trigger.payload.item || 
      state.entities.items[trigger.payload.id];
    return item?.category === 'medication' 
      && item?.data?.prescriptionType !== 'discontinue';
  },
  
  run: async (state, trigger) => {
    const item = trigger.payload.item || 
      state.entities.items[trigger.payload.id];
    
    const currentMeds = Object.values(state.entities.items)
      .filter(i => i.category === 'medication' && i.id !== item.id);
    
    const interactions = await checkDrugInteractions(item, currentMeds);
    
    if (interactions.length === 0) {
      return { actions: [] };
    }
    
    // Create alert task for significant interactions
    const severeInteractions = interactions.filter(i => i.severity === 'severe');
    
    if (severeInteractions.length > 0) {
      return {
        actions: [
          {
            type: 'TASK_CREATED',
            payload: {
              task: {
                id: uuid(),
                type: 'drug-interaction-alert',
                status: 'pending-review',
                priority: 'high',
                relatedItemId: item.id,
                result: severeInteractions,
                createdAt: new Date(),
              },
              relatedItemId: item.id,
            },
          },
        ],
        notifications: [
          {
            type: 'warning',
            message: `Drug interaction detected: ${severeInteractions[0].description}`,
            persistent: true,
          },
        ],
      };
    }
    
    return { actions: [] };
  },
  
  config: {
    local: false,     // Drug database is external
    timeout: 3000,
    retryable: true,
    requiresNetwork: true,
  },
};
```

---

## Local vs. Cloud Decision Matrix

| Service | PHI Exposure | Latency Needs | Recommendation |
|---------|--------------|---------------|----------------|
| Transcription | High (audio + text) | Real-time | **Local** or on-prem |
| Entity extraction | High | <1s | **Local** |
| Dx association | Medium (codes + narrative context) | 2-5s acceptable | **Local** preferred |
| Drug interaction | Low (just drug codes) | <1s | **Cloud** OK (existing APIs) |
| Note generation | High (full narrative) | 5-15s acceptable | **Local** or BAA-covered cloud |
| Care gap analysis | Medium | Background OK | Either |
| Formulary check | Low (drug + insurance codes) | <2s | **Cloud** OK |

### BAA Requirement

If using cloud AI services that process PHI, a Business Associate Agreement (BAA) must be in place with the provider. This is a HIPAA requirement.

---

## Subscription Manager

The subscription manager coordinates service execution.

```typescript
class AISubscriptionManager {
  private registry: AIServiceRegistry;
  private store: Store<EncounterState>;
  
  constructor(registry: AIServiceRegistry, store: Store<EncounterState>) {
    this.registry = registry;
    this.store = store;
    
    // Subscribe to all actions
    store.subscribe((action, state) => {
      this.handleAction(action, state);
    });
  }
  
  private async handleAction(action: EncounterAction, state: EncounterState) {
    const services = this.registry.getTriggeredServices(action);
    
    for (const service of services) {
      if (!service.shouldRun(state, action)) continue;
      
      try {
        const result = await this.executeWithTimeout(
          service.run(state, action),
          service.config.timeout
        );
        
        // Dispatch resulting actions
        for (const resultAction of result.actions) {
          this.store.dispatch(resultAction);
        }
        
        // Surface notifications
        if (result.notifications) {
          this.notificationService.show(result.notifications);
        }
      } catch (error) {
        if (service.config.retryable) {
          this.retryQueue.add(service, action, state);
        }
        console.error(`AI Service ${service.id} failed:`, error);
      }
    }
  }
  
  private executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]);
  }
}
```

---

## Configuration

Services can be configured at the organization or user level.

```typescript
interface AIServiceConfig {
  serviceId: string;
  enabled: boolean;
  
  // Override defaults
  overrides?: {
    local?: boolean;           // Force local/cloud
    timeout?: number;
    autoApprove?: boolean;     // Skip review for high-confidence results
    confidenceThreshold?: number;
  };
}

// Example: Organization disables note generation
const orgConfig: AIServiceConfig[] = [
  { serviceId: 'note-generation', enabled: false },
  { serviceId: 'dx-association', enabled: true, overrides: { autoApprove: true, confidenceThreshold: 0.95 } },
];
```

---

## Related Documents

- [State Contract](./STATE_CONTRACT.md) — How AI services dispatch actions
- [Parallel Streams](./PARALLEL_STREAMS.md) — How AI interacts with manual input
- [Suggestions & Tasks](../models/SUGGESTIONS_TASKS.md) — Data models for AI outputs
