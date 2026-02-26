# AI-Enhanced EHR System

## Project Overview

A next-generation Electronic Health Record system designed around AI-assisted clinical workflows. The system prioritizes fast capture during patient encounters, intelligent background processing, and flexible UI paradigms that adapt to different provider mental models.

### Core Design Principles

1. **Capture Fast, Process Smart** — Chronological note-taking during visits, background AI handles enrichment
2. **Right-Sized AI Interaction** — Minibar → Palette → Drawer pattern avoids chatbot bolt-on antipattern
3. **Foundation + Flexible UI** — Solid state/service layer with swappable presentation layers
4. **Batch Over Interrupt** — Accumulate tasks for review rather than constant interruption
5. **Role-Optimized Workflows** — MA, Provider, Tech each get interfaces tuned to their cognitive needs

---

## Documentation Index

### Architecture & Design

| Document | Description |
|----------|-------------|
| [Architecture Overview](./architecture/OVERVIEW.md) | System layers, data flow, deployment model |
| [State Contract](./architecture/STATE_CONTRACT.md) | State shape, actions, selectors, middleware |
| [AI Integration](./architecture/AI_INTEGRATION.md) | Service layer, local vs. cloud, trigger patterns |
| [Parallel Streams](./architecture/PARALLEL_STREAMS.md) | Transcription, manual input, background task interaction |

### Data Models

| Document | Description |
|----------|-------------|
| [Chart Items](./models/CHART_ITEMS.md) | All chart item type definitions |
| [Care Gaps](./models/CARE_GAPS.md) | Gap definitions, instances, closure criteria |
| [Suggestions & Tasks](./models/SUGGESTIONS_TASKS.md) | AI suggestion and background task models |
| [Supporting Types](./models/SUPPORTING_TYPES.md) | Shared types, enums, references |

### UI Specifications

| Document | Description |
|----------|-------------|
| [Component Library](./ui/COMPONENT_LIBRARY.md) | Primitive components and composition patterns |
| [Screen Layouts](./ui/SCREEN_LAYOUTS.md) | Capture, Task Pane, Review, Patient Overview |
| [Interaction Patterns](./ui/INTERACTION_PATTERNS.md) | Omni-add flow, palette triggers, batch actions |
| [Design Tokens](./ui/DESIGN_TOKENS.md) | Colors, typography, spacing, status indicators |

### Implementation

| Document | Description |
|----------|-------------|
| [Phase 1: Foundation](./implementation/PHASE_1_PROMPTS.md) | Claude Code prompts for core setup |
| [Phase 2: AI Services](./implementation/PHASE_2_PROMPTS.md) | Claude Code prompts for AI layer |
| [Phase 3: UI Build](./implementation/PHASE_3_PROMPTS.md) | Claude Code prompts for components |
| [Phase 4: Integration](./implementation/PHASE_4_PROMPTS.md) | Claude Code prompts for screens + scenarios |

### Scenarios & Testing

| Document | Description |
|----------|-------------|
| [Visit Scenarios](./scenarios/VISIT_SCENARIOS.md) | UC Cough, PC Diabetes detailed walkthroughs |
| [Mock Data](./scenarios/MOCK_DATA.md) | Patient generators, sample data sets |
| [Test Strategy](./scenarios/TEST_STRATEGY.md) | Unit, integration, scenario testing approach |

### Operations & Compliance

| Document | Description |
|----------|-------------|
| [HIPAA Considerations](./compliance/HIPAA.md) | PHI handling, audit requirements, encryption |
| [Audit Logging](./compliance/AUDIT_LOGGING.md) | Action logging, retention, query patterns |

---

## Quick Start

### For Developers
1. Read [Architecture Overview](./architecture/OVERVIEW.md)
2. Review [State Contract](./architecture/STATE_CONTRACT.md)
3. Start with [Phase 1 Prompts](./implementation/PHASE_1_PROMPTS.md)

### For Designers
1. Read [Parallel Streams](./architecture/PARALLEL_STREAMS.md) for interaction model
2. Review [Component Library](./ui/COMPONENT_LIBRARY.md)
3. Check [Design Tokens](./ui/DESIGN_TOKENS.md)

### For Clinical Stakeholders
1. Read [Visit Scenarios](./scenarios/VISIT_SCENARIOS.md)
2. Review [Care Gaps](./models/CARE_GAPS.md)

---

## Project Status

| Phase | Status | Notes |
|-------|--------|-------|
| Architecture Design | ✅ Complete | State contract, AI integration defined |
| Data Models | ✅ Complete | All chart items, care gaps specified |
| Phase 1 Implementation | 🔲 Not Started | Core state management |
| Phase 2 Implementation | 🔲 Not Started | AI service layer |
| Phase 3 Implementation | 🔲 Not Started | UI components |
| Phase 4 Implementation | 🔲 Not Started | Screen integration |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-21 | Initial documentation structure created | — |

---

## Contributing

When updating documentation:

1. **Keep atomic** — One concept per document where possible
2. **Cross-reference** — Link related documents, don't duplicate
3. **Version decisions** — Note when architectural decisions change and why
4. **Update index** — Keep this README's index current
