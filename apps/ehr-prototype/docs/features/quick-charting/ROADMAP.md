# Quick Charting — Strategic Roadmap

**Status:** Active — governs design and implementation sequencing
**Last updated:** 2026-02-17

---

## 1. What This Document Covers

This is the master roadmap for the quick charting system and its integration with the broader EHR prototype architecture. It defines:

- The complete scope of work beyond the initial 7-phase implementation
- How multi-surface coordination, care protocols, and order sets fit into the picture
- Phased staging with dependencies and rationale
- Deferred design questions with enough context to resume later
- Handoff guidance for Cowork (spec authoring) and Claude Code (implementation)

---

## 2. System Scope

The quick charting system doesn't exist in isolation. It's one of several input and intelligence surfaces in the EHR encounter experience. The full system includes:

### Input Surfaces (things that write to the chart)

| Surface | Location | Purpose |
|---------|----------|---------|
| **OmniAdd** | Canvas pane, bottom | Provider-initiated structured charting — the primary input tool |
| **OmniAdd Suggestion Layer** | Within OmniAdd detail area | Contextual suggestion pills + cards, order set suggestions, AI-predicted items |
| **AI Palette** | Bottom bar, expanded | Quick awareness of AI suggestions; accept/dismiss between charting actions |
| **AI Drawer** | Left pane | Full AI assistant: suggestions, conversation, activity log |
| **Processing Rail** | Capture mode, right column | AI draft accept (narrative content); order processing status |
| **Care Protocol** | Reference pane, protocol view | Evidence-based clinical guidance with direct-add of recommended items |

### Intelligence Systems (things that generate suggestions)

| System | Feeds Into | Based On |
|--------|-----------|----------|
| **Ambient Recording / Transcription** | AI drafts, AI suggestions | Real-time conversation capture |
| **Suggestion Engine** | All input surfaces | Transcript, patient history, CC, care gaps, protocols, provider patterns |
| **Care Protocol Engine** | Protocol view, suggestion engine | Evidence-based guidelines + patient adaptation |
| **Safety Check System** | Inline alerts, activity log | Drug interactions, allergy cross-refs, dosage validation |

### Reference Surfaces (things that provide context)

| Surface | Location | Content |
|---------|----------|---------|
| **Reference Pane** | Middle column (overview/context pane) | Patient Context, Activity Timeline, Care Protocol |
| **Chart Items List** | Canvas pane, main area | Chronological encounter content (Capture) or structured sections (Review) |
| **Processing Rail** | Canvas pane, right column | Ambient awareness of AI drafts and order status |

### Coordination Architecture

All surfaces read from and write to a shared state model. See MULTI-SURFACE-COORDINATION.md for the full specification, including:
- Cross-surface event flows (what happens when any surface adds an item)
- Suggestion lifecycle (pending → accepted/dismissed/auto-resolved)
- Deduplication and conflict resolution rules

---

## 3. Implementation Phases

### Tier 1: Core Quick Charting (Phases 1-7)

Already specified in PHASED-PLAN.md. These phases build the OmniAdd module, chart items, details pane, processing rail, AI drafts, Process view, Review view, safety checks, and encounter lifecycle.

**Key forward-compatibility requirement:** The chart item data model and activity log defined in these phases must include fields that support later integration with protocols, order sets, and the unified suggestion engine. Specifically:

- `source` field on chart items (values: `manual`, `aiSuggestion`, `aiDraft`, `protocol`, `orderSet`, `maHandoff`)
- `protocolRef` optional field (links item to protocol recommendation that prompted it)
- `orderSetRef` optional field (links item to order set it was part of)
- Activity log event types expanded to include protocol and order set actions

These fields can be optional/unused in Phases 1-7 but must exist in the data model.

**Status:** Fully specified. Ready for Claude Code execution.

---

### Tier 2: Multi-Surface Foundation

Work that ensures the quick charting system is architecturally ready for integration with the broader EHR.

#### Phase A: Quick Charting Spec Forward-Compatibility Updates

**What:** Update CONTEXT.md, DESIGN-SPEC.md, and CATEGORY-MAP.md with forward-compatible data model fields and notes about future integration points.

**Specific updates:**
- Chart item data model: `source`, `protocolRef`, `orderSetRef` fields
- Activity log event types: protocol-related events added to the enum
- OmniAdd suggestion types: `orderSet` variant documented alongside `singleItem`
- Processing rail: protocol progress indicator noted as a future batch summary type
- Process view sign-off: protocol adherence noted as a future informational metric

**Effort:** ~1 hour of spec editing
**Dependency:** None — do first
**Handoff:** This conversation (already in progress)

#### Phase B: Prototype Reconciliation Audit

**What:** Map existing prototype components to the multi-surface coordination model. Identify integration points and potential friction.

**Components to audit:**
- `src/components/suggestions/` → SuggestionCard, SuggestionChip, SuggestionList: how these evolve toward unified suggestion model
- `src/components/care-gaps/` → care gaps as a source feeding into the suggestion engine AND protocol addenda
- `src/components/overview/` → PatientOverviewPane: views become reference pane architecture
- `src/components/ai-ui/` → AIMinibar, AIPalette: how these consume from unified suggestion state
- `src/screens/CaptureView/` → how CaptureView wires reference pane, OmniAdd, rail, and AI module

**Effort:** ~2 hours of code review + notes
**Dependency:** Phase A (so the spec is settled)
**Handoff:** Claude Code (read existing code, produce reconciliation notes)

---

### Tier 3: New Systems Design

New design specifications that extend the EHR beyond quick charting. Each is a substantial spec document best authored in Cowork with the shared context pattern.

#### Phase C: Reference Pane Architecture

**What:** Define the reference pane (currently "overview pane") as a general-purpose contextual reference container with a view controller.

**Design scope:**
- Naming: Reference Pane (or Context Pane) — the container; views are the content
- View controller: tab bar or segmented control, dynamic tab appearance, badges
- View inventory for encounter context: Patient Context, Activity Timeline, Care Protocol
- View inventory for other contexts (future): Coding Guidelines, Payer Rules, etc.
- Cross-pane coordination: how AI module protocol activation triggers protocol view appearance in reference pane
- Patient Context view: confirm stable (already built)
- Activity Timeline view: confirm stable (already built)
- Protocol view tab: appears on activation, shows progress badge

**Output:** REFERENCE-PANE-SPEC.md
**Dependency:** Phase A (data model settled)
**Handoff:** Cowork

#### Phase D: Care Protocol Data Model & State

**What:** Define the protocol template structure, active protocol state management, patient adaptation logic, and multi-protocol integration.

**Design scope:**
- Protocol template data model: cards, items, four item types (orderable, documentable, guidance, advisory), conditionality
- Active protocol state: activation, completion tracking, adaptation overlays
- Patient adaptation: Level 1 (chart awareness) and Level 2 (history personalization) fully specified; Levels 3-4 noted as future
- Multi-protocol integration: primary + addenda model
- Protocol ↔ chart items binding: matching logic (category + concept/code match for prototype; clinical terminology mapping for production)
- Protocol activation flow: AI suggests → provider accepts → reference pane switches to protocol view

**Output:** PROTOCOL-SPEC.md
**Dependency:** Phase A (data model), logically parallel with Phase C
**Handoff:** Cowork

#### Phase E: Order Set Component Design

**What:** Design the shared order set review flow component that renders in OmniAdd, protocol view, and AI drawer contexts.

**Design scope:**
- Data model: OrderSet and OrderSetItem types (drafted in MULTI-SURFACE-COORDINATION.md §4.2)
- Review flow layout: checkbox list, per-item edit, batch add, patient adaptation rendering
- Container adaptation: how the component renders differently in OmniAdd (inline), protocol view (sheet/panel), AI drawer (inline in scroll area)
- Item states: standard (pre-checked), conditional (unchecked), contraindicated (warning, not selectable)
- [Edit] per item: inline expand vs. details pane
- Batch actions: Add Selected, Select All, Deselect All
- Order set in OmniAdd suggestion layer: expandable suggestion type that shows order set contents

**Output:** Section within DESIGN-SPEC.md or standalone ORDER-SET-SPEC.md
**Dependency:** Phases A, C, D
**Handoff:** Cowork

---

### Tier 4: Integration & Intelligence

Systems that connect the new components and add intelligence layers. These are later-phase design work.

#### Phase F: Unified Suggestion Engine

**What:** Design the single suggestion engine that generates, routes, and manages suggestions across all surfaces.

**Design scope:**
- Suggestion data model: source, confidence, target surface routing, lifecycle
- Source integration: ambient recording, patient history, care gaps, protocols, provider patterns
- Surface routing logic: which suggestions appear where based on confidence and context
- Deduplication: same item suggested by multiple sources
- Evolution path for existing prototype suggestions components

**Output:** SUGGESTION-ENGINE-SPEC.md
**Dependency:** Phases A, D, E
**Handoff:** Cowork

#### Phase G: AI Module ↔ Protocol Coordination

**What:** Define the interaction patterns between the AI module (palette/drawer) and the protocol system.

**Design scope:**
- Protocol suggestion nudge format in AI palette
- Protocol recommendations in AI drawer suggestion section (relationship to protocol view in reference pane)
- Activity log integration: protocol-related entries
- AI-driven guidance tracking: how ambient AI detects when guidance items have been addressed in conversation

**Output:** Additions to MULTI-SURFACE-COORDINATION.md
**Dependency:** Phases C, D, F
**Handoff:** Cowork

---

### Tier 5: Refinement & Future Features

Design questions that are important but don't block any implementation tier.

#### Phase H: Protocol UX Refinement

**What:** Detailed protocol interaction design decisions.

**Scope:**
- Role-aware density: verbose mode for residents/new NPs (clinical reasoning per recommendation) vs. compact mode for experienced providers
- Deviation tracking: [Decline] action on protocol items with optional reason, creating a deviation record distinct from "not yet addressed"
- Empty state: what the protocol tab shows when no protocol is active (hidden tab vs. "No active protocol" with search/browse vs. AI-suggested protocols)
- Provider protocol preferences: customization, global dismissals

**Dependency:** Phases C, D
**Handoff:** Cowork (fold into PROTOCOL-SPEC.md)

#### Phase I: Advanced Intelligence Features

**What:** Sophisticated features layering on core systems.

**Scope:**
- Guidance item completion detection: AI listens to ambient transcription and auto-marks protocol guidance items when relevant conversation is detected
- OmniAdd protocol awareness: protocol recommendations boost certain suggestions when provider is in a matching category
- Protocol analytics: adherence rates, deviation patterns
- Multi-protocol integration refinement: Approach C (primary + addenda) edge cases, conflicting recommendations

**Dependency:** Phases D, F, G
**Handoff:** Cowork

---

## 4. Phase Dependency Map

```
Tier 1: Core Quick Charting
  Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                    │         │
                                    ├→ Phase 6 ├→ Phase 7
                                    │
Tier 2: Multi-Surface Foundation    │
  Phase A ─────────────────────────►│ (forward-compat fields used in Phases 1-7)
  Phase A → Phase B                 │
                                    │
Tier 3: New Systems Design          │
  Phase A → Phase C ────────────────┤
  Phase A → Phase D ────────────────┤
  Phase C + D → Phase E             │
                                    │
Tier 4: Integration                 │
  Phase D + E → Phase F             │
  Phase C + D + F → Phase G         │
                                    │
Tier 5: Refinement                  │
  Phase C + D → Phase H             │
  Phase D + F + G → Phase I         │
```

**Key insight:** Tier 1 (Phases 1-7) and Tier 2 (Phase A) can proceed immediately. Phase A makes Tier 1 forward-compatible. Tier 3 (Phases C-E) is the next design sprint. Tiers 4-5 are later.

---

## 5. Handoff Strategy

### This Conversation → Immediate Documentation

| Deliverable | Status |
|-------------|--------|
| ROADMAP.md (this document) | ✅ Created |
| MULTI-SURFACE-COORDINATION.md | ✅ Created |
| Updated CONTEXT.md (new decisions) | ✅ Updated |
| Updated DESIGN-SPEC.md (forward-compatibility) | ✅ Updated |

### Cowork → Future Spec Authoring

Use Cowork for Phases C, D, E, F, G, H, I — substantial new design specs.

**Shared context block** for Cowork prompts (include with every prompt):

```
CONTEXT: QUICK CHARTING + MULTI-SURFACE COORDINATION

I'm a principal product designer at a healthcare tech company building 
a full EHR suite. I have a comprehensive quick charting design spec 
(OmniAdd, chart items, details pane, processing rail, AI drafts, 
Process view, Review mode) and a multi-surface coordination architecture
covering how all input surfaces (OmniAdd, AI palette/drawer, processing
rail, care protocols) share state.

Key reference documents (in my project files):
- DESIGN-SPEC.md — full quick charting system design
- MULTI-SURFACE-COORDINATION.md — cross-surface state model, care protocols, order sets
- ROADMAP.md — phased plan and dependency map
- CONTEXT.md — confirmed design decisions (30+ decisions)
- CATEGORY-MAP.md — all 15 chart item categories mapped

The EHR prototype also has:
- Bottom bar system: AI minibar/palette + Transcription module (anchor/bar/palette/drawer tiers)
- Left pane system: menu + AI drawer + transcript drawer
- Coordination state machine: governs bottom bar ↔ left pane UI transitions
- Reference pane (overview pane): patient context + activity timeline views

Strategic lens: Provider shortages → rethinking care team roles → enabling
appropriate care without always requiring direct provider attention → 
optimizing encounters when providers ARE needed.
```

**Recommended Cowork prompt sequence:**
1. Phase C: Reference Pane Architecture → produce REFERENCE-PANE-SPEC.md
2. Phase D: Care Protocol Spec → produce PROTOCOL-SPEC.md
3. Phase E: Order Set Component → produce ORDER-SET-SPEC.md or section within DESIGN-SPEC.md
4. Phases F-I as needed

### Claude Code → Implementation

Claude Code receives the complete spec package and implements Tier 1 (Phases 1-7).

**Spec package for Claude Code:**
- DESIGN-SPEC.md (what to build)
- CONTEXT.md (decisions and constraints)
- CATEGORY-MAP.md (category-specific details)
- PHASED-PLAN.md (sequencing)
- PROMPTS.md (phase-by-phase prompts with acceptance criteria)

**Important:** PROMPTS.md already contains self-contained prompts per phase. Each prompt includes all context Claude Code needs — no dependency on this conversation's history.

Claude Code does NOT need ROADMAP.md or MULTI-SURFACE-COORDINATION.md for Tier 1 implementation. Those documents inform future phases.

---

## 6. Deferred Design Questions

Questions captured during design discussions. Each has enough context to resume work later without re-deriving the question.

### Protocol System

| # | Question | Context | When to Resolve |
|---|----------|---------|-----------------|
| P1 | **Protocol authoring** — Who creates protocols? Clinical team? AI-generated from guidelines? Both? | Affects whether the system needs a protocol editor or just a protocol renderer | Phase D |
| P2 | **Protocol versioning** — How are protocol updates handled for active encounters? | A protocol might be updated mid-encounter by a system update. Does the active instance stay frozen? | Phase D |
| P3 | **Cross-encounter protocol continuity** — For multi-visit conditions (diabetes management), how does protocol state persist across encounters? | Current model is per-encounter. Chronic conditions need multi-encounter tracking. | Phase D or later |
| P4 | **Protocol ↔ chart matching fidelity** — "Amoxicillin 500mg TID" vs. protocol-recommended "Amoxicillin 500mg BID" — match or partial match? | Prototype can use simple category+concept matching. Production needs clinical terminology mapping (RxNorm, SNOMED). | Phase D (note in spec, defer full solution) |
| P5 | **Role-aware protocol density** — Verbose mode (with clinical reasoning) for trainees vs. compact mode for experienced providers | Affects protocol card rendering. Could be a toggle or a role-based default. | Phase H |
| P6 | **Deviation tracking** — Should the system record when providers deliberately skip protocol recommendations? With reasons? | Clinical quality programs care about adherence. Adds [Decline] action to protocol items. | Phase H |
| P7 | **Empty protocol state** — What shows when no protocol is active? Hidden tab? Browse/search? AI suggestions? | Affects protocol feature discoverability. | Phase H |

### Suggestion Engine

| # | Question | Context | When to Resolve |
|---|----------|---------|-----------------|
| S1 | **Confidence thresholds** — What confidence levels determine which surfaces show a suggestion? | Affects whether low-confidence suggestions appear in OmniAdd vs. only in AI drawer. | Phase F |
| S2 | **Provider feedback loop** — Do accepted/dismissed suggestions train the engine per-provider? | Affects suggestion ranking over time. Privacy implications for per-provider models. | Phase F or later |
| S3 | **Suggestion staleness** — How long do suggestions persist? Do they refresh as encounter context evolves? | Early-encounter suggestions may become irrelevant as the visit progresses. | Phase F |

### Order Sets

| # | Question | Context | When to Resolve |
|---|----------|---------|-----------------|
| O1 | **Provider-custom order sets** — Can providers create and save personal order set variants? | Common EHR feature. Affects order set registry design. | Phase E |
| O2 | **Order set in OmniAdd inline expansion** — How much detail to show inline vs. requiring the review flow? | Tradeoff between speed (inline) and thoroughness (review sheet). | Phase E |
| O3 | **Offline order set availability** — Do order sets work without AI/network for rural/offline settings? | Affects whether order sets are locally cached or server-generated. | Phase E or later |

### AI Integration

| # | Question | Context | When to Resolve |
|---|----------|---------|-----------------|
| A1 | **Guidance item auto-detection accuracy** — How reliable is AI at detecting "provider asked about smoking history" from ambient recording? | Determines whether auto-marking is trustworthy or needs provider confirmation. | Phase I |
| A2 | **AI confidence display for protocol items** — Should protocol recommendations show AI confidence? | Could help providers prioritize. Could also undermine trust in low-confidence items. | Phase I |
| A3 | **Protocol activation from AI drawer** — When AI suggests a protocol in the drawer, does accepting switch the reference pane view automatically? | Cross-pane coordination event. Currently the coordination state machine only governs bottom bar ↔ left pane. | Phase G |

### Architecture

| # | Question | Context | When to Resolve |
|---|----------|---------|-----------------|
| X1 | **Reference pane as input surface** — The protocol view writes to chart state. How does this affect the reference pane's architectural role? | Currently read-only. Protocol adds are "controlled writes" (pre-configured, clinically validated). Need clear boundaries. | Phase C |
| X2 | **Coordination state machine expansion** — Does AI-to-protocol activation need to be part of the coordination state machine, or is it a simpler event? | The existing state machine (COORDINATION_STATE_MACHINE.md) governs bottom bar ↔ left pane. Reference pane is a third participant. | Phase G |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-17 | Initial roadmap — full scope mapping, phased plan, deferred questions, handoff strategy |
