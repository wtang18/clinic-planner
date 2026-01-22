# Architecture Overview

## System Layers

The system is designed as a layered architecture where each layer has clear responsibilities and interfaces. This enables multiple UI implementations on a stable foundation.

```
┌─────────────────────────────────────────────────────────────┐
│                     UI LAYER (swappable)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Linear    │  │   Canvas    │  │  Sectioned  │  ...    │
│  │   Stream    │  │   Spatial   │  │  Traditional│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  INTERACTION PRIMITIVES                     │
│  (OmniAdd, ChartCard, Palette, Drawer, Minibar, TaskPane)  │
├─────────────────────────────────────────────────────────────┤
│                     STATE LAYER                             │
│  (Encounter state, actions, reducers, selectors)           │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                            │
│  (AI services, transcription, rules engine, validations)   │
├─────────────────────────────────────────────────────────────┤
│                   DATA / COMPLIANCE                         │
│  (FHIR resources, audit log, encryption, access control)   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Contents | Changeability |
|-------|----------|---------------|
| **Data/Compliance** | Patient records, encounter data, audit trail, PHI handling | Locked — HIPAA, regulatory |
| **Service Layer** | AI inference, transcription, Dx suggestion, drug interaction checks | Configurable (enable/disable features) |
| **State Layer** | Encounter state, pending actions, suggestion queue, task statuses | Standardized contract — UI reads/writes via defined interface |
| **Interaction Primitives** | Card, OmniAdd bar, Palette, Drawer, Minibar | Composable library — UI picks what to use |
| **UI Layer** | Layout, flow, visual hierarchy, navigation | Fully customizable per provider/org |

---

## Operational Modes

The system supports three distinct modes optimized for different cognitive contexts:

| Mode | Purpose | Primary UI | Cognitive State |
|------|---------|------------|-----------------|
| **Capture** | Fast input during visit | Chronological stream + OmniAdd | "Getting it down" |
| **Process** | Batch review and approve | Task Pane | "Getting it right" |
| **Review** | Post-visit reference | Section-organized view | "Is this complete?" |

Mode switching is controlled via UI affordance (segmented control) and persisted in session state.

---

## Data Flow

### Capture Flow
```
User Input / Transcription
         │
         ▼
    ┌─────────┐
    │ Action  │ (ITEM_ADDED, SUGGESTION_ACCEPTED, etc.)
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │Middleware│ → Authorization → Validation → Audit → Side Effects
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Reducer │ → State Update
    └────┬────┘
         │
         ├──────────────────┐
         ▼                  ▼
    ┌─────────┐        ┌─────────┐
    │   UI    │        │   AI    │ (triggered by side effects)
    │ Re-render│       │Services │
    └─────────┘        └────┬────┘
                            │
                            ▼
                       New Actions
                    (SUGGESTION_RECEIVED, TASK_CREATED, etc.)
```

### Sync Flow
```
Local Action
     │
     ▼
┌──────────┐
│ Optimistic│ → UI updates immediately
│  Update   │
└────┬─────┘
     │
     ▼
┌──────────┐
│  Sync    │ → Queue action for server
│  Queue   │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐
│  Server  │ ←─→ │ Conflict │ → Resolution UI if needed
│   Sync   │     │ Detection│
└────┬─────┘     └──────────┘
     │
     ▼
┌──────────┐
│  Confirm │ → Update sync status
└──────────┘
```

---

## Role-Based Access

Different roles interact with the same encounter state but may have different UI optimizations and action permissions.

| Role | Primary Mode | Key Actions | UI Optimization |
|------|--------------|-------------|-----------------|
| **MA** | Capture | Vitals, chief complaint, med reconciliation, allergies | Intake-focused, checklist-style |
| **Provider** | Capture → Process → Review | All clinical actions, sign-off | Full charting, AI suggestions prominent |
| **X-Ray Tech** | Capture (limited) | Add imaging items | Imaging-focused, minimal chrome |
| **Scribe** | Capture | Transcription, documentation | Split view with provider |

### Handoff Model

Sequential handoff is the initial supported model:

```typescript
interface CollaborationState {
  currentOwner: User;
  handoffHistory: { from: User; to: User; at: Date }[];
}
```

Real-time collaboration (multiple simultaneous editors) is architecturally supported but not in initial scope.

---

## Technology Decisions

### Frontend
- **Framework**: React (supports web + React Native for tablet)
- **State Management**: Custom store with Redux-like patterns (actions, reducers, selectors)
- **Styling**: Design tokens + component library (framework-agnostic tokens)

### AI Services
- **Local LLM**: For PHI-sensitive operations (transcription, entity extraction, note generation)
- **Cloud APIs**: For non-PHI operations (drug interaction databases, formulary checks)
- **Hybrid**: Decision matrix based on PHI exposure and latency requirements

### Data Layer
- **Format**: FHIR R4 resources where applicable
- **Sync**: Optimistic updates with conflict resolution
- **Audit**: Immutable action log with full provenance

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State contract over direct API calls | UI ↔ State ↔ Services | Enables multiple UIs, centralized audit, testability |
| Intent-based actions | `ITEM_ADDED` not `SET_ITEMS` | Better audit trail, captures "why" not just "what" |
| AI as subscription layer | Services subscribe to state changes | Decouples AI from UI, easy to enable/disable |
| Optimistic updates for capture | UI updates before server confirms | Speed critical during charting |
| Pessimistic updates for process/send | Wait for server confirmation | Safety critical for orders, prescriptions |
| Care gaps as first-class entity | Not just suggestions | Different lifecycle, rules-based, quality measure linkage |

---

## Related Documents

- [State Contract](./STATE_CONTRACT.md) — Detailed state shape, actions, selectors
- [AI Integration](./AI_INTEGRATION.md) — Service patterns, local vs. cloud decisions
- [Parallel Streams](./PARALLEL_STREAMS.md) — How transcription, manual input, and background tasks interact
