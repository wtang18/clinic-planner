# Quick Charting — Project Context

## What This Is

Design specification and implementation plan for the "quick charting" system in the future-state EHR prototype. Covers the OmniAdd inline charting module, the processing rail, AI draft layer, details pane, and how chart items flow across three encounter view facets (Capture, Process, Review).

Also includes multi-surface coordination architecture (see MULTI-SURFACE-COORDINATION.md and ROADMAP.md) defining how quick charting integrates with the AI module (palette/drawer), care protocols, order sets, and the reference pane.

## Strategic Intent

Current-state EHR charting requires providers to navigate to specific modules/sections, search structured databases with correct terminology, and manage documentation structure while actively seeing patients. This creates cognitive overhead and slows encounter throughput.

The quick charting concept inverts this: one inline input surface ("OmniAdd") handles all active charting. AI generates narrative documentation (HPI, PE, Plan, Instructions) from ambient recording. Structure is deferred to Review mode. The provider's job during the encounter is to capture intent quickly and review AI drafts — not fight with forms or worry about documentation organization.

This maps directly to the company's mandate to increase primary care capacity: reducing per-encounter charting time and cognitive load directly increases the number of patients a provider can see without sacrificing documentation quality.

## Design Decisions (Confirmed)

### Core Interaction Model

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Primary interaction target | Both tablet/touch and keyboard/desktop equally | Providers use tablets in exam rooms and desktops at workstations; neither can be second-class |
| 2 | Scope | Full pattern + architecture with all 15 categories mapped at spec level | Need complete picture to ensure the pattern scales |
| 3 | Input paradigm | Dual: touch (progressive disclosure tree) + keyboard (command palette) | Different contexts demand different input modes |
| 4 | Capture mode focus | Chronological, unstructured — capture intent fast | Structure lives in Review mode; Capture optimizes for speed and low cognitive load |

### Views & Navigation

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 5 | Views model | Three facets/lenses on the same objects (Capture, Process, Review) — not separate containers | One data source, three organizational lenses; reinforces that items exist once |
| 6 | Adding from non-Capture views | Inline targeted "+" per section + minified OmniAdd affordance | Provider may need to add items while in Process or Review; shouldn't force return to Capture |
| 7 | Breadcrumb interaction | Tapping a level returns to that level's selection state (to choose a different option) | E.g., tapping "Benzonatate" in `+ Rx > Benzonatate` returns to Rx quick-picks to choose a different drug |

### AI Drafts & Narrative Content

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 8 | Narrative categories | AI-draft-then-edit as primary pattern; OmniAdd as secondary/manual path | Provider notes, instructions, HPI, PE, etc. are primarily AI-generated from ambient recording |
| 9 | AI draft triggers | Progressive, stage-based generation as encounter unfolds | CC early, HPI after history, PE after exam, Plan after orders; drafts trickle in, not flood |
| 10 | AI draft placement | Accept promotes to chart list; rail only shows pending drafts | Chart list is single source of truth for encounter content |
| 11 | AI draft positioning | Chronological at acceptance time (bottom of list, like all other adds) | Consistent with OmniAdd behavior; no retroactive insertions |
| 12 | AI draft review | Accept (one-tap on rail surface) or edit (opens details pane) — no inline editing | Quick accept for trusted drafts; pane for any modifications |
| 13 | AI + MA content | AI enriches MA content; accepted version replaces original in chart list | Provider reviews one unified document; original preserved in activity log |

### Details Pane & Editing

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 14 | Details pane | Universal — every chart item has a details pane with full fields, all actions, activity log | Single consistent pattern for inspecting/editing any item from any view |
| 15 | Editing model | Details pane is primary; quick inline field edits on structured items as shortcut | Pane handles all editing; inline edits (e.g., tap dosage chip) for speed on structured items |
| 16 | Quick actions | Stay on card/rail surface — accept, dismiss, simple status changes | Zero-navigation for lightweight interactions |
| 17 | Activity log | Full chain of custody per item: created, AI-generated, MA-documented, edited, status changes | Accountability, compliance, AI transparency |

### Card Display & Authorship

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 18 | Card display | Summary + category badge + status indicator + "Last edited by [name] · [time]" | Clean card surface; full history in details pane |
| 19 | Authorship on cards | "Last edited by" line; full chain in activity log | Minimal card surface; activity log handles audit trail |
| 20 | MA content treatment | Unreviewed MA items get subtle indicator; author name shown; no special badge | Provider needs to know what hasn't been reviewed |

### Processing Rail & Process View

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 21 | Rail in Capture | Minimal — batch summaries expanding to items on tap; colored dot/icon + text status | Peripheral awareness during charting |
| 22 | Rail interactivity | Simple actions via inline popover; complex actions → details pane or Process view | Quick fixes stay in Capture; heavy work in Process |
| 23 | Rail notifications | Subtle count updates + brief highlight pulse; no toasts/sounds | Non-interruptive |
| 24 | Rail content types | AI drafts pending review + processing status for orders | Two categories of ambient activity |
| 25 | Process view | Full third view; hybrid batch-by-type with status within batches | Operational batches reflect how clinic work gets done |
| 26 | Operational batches | In-house Rx, external Rx by pharmacy, in-house labs, send-out labs by vendor, imaging, referrals | Groups match physical execution patterns |
| 27 | Sign-off | Bottom of Process view as final processing step | Natural terminus after handling all batches |
| 28 | Process filtering | Deferred to implementation | |

### Encounter Lifecycle

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 29 | Initial state | Progressive activation; pre-populated with MA content; explicit provider start triggers ambient/AI | Encounter has content when provider opens it; complexity reveals gradually |
| 30 | Provider start | Explicit action (recording start) triggers AI layer; OmniAdd charting available before start | Separates chart preview from active encounter; privacy/consent for recording |

### Multi-Surface Coordination (from MULTI-SURFACE-COORDINATION.md)

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 31 | Shared chart items state | All input surfaces (OmniAdd, AI, protocol, rail) read from and write to a single chart items state | No surface "owns" items; views are facets on the same data |
| 32 | Source tracking | Every chart item records its origin surface (manual, aiSuggestion, aiDraft, protocol, orderSet, maHandoff) | Audit trail, analytics, and activity log need to know how items entered the chart |
| 33 | Cross-surface suggestion resolution | Accepting from any surface auto-resolves matching suggestions on all other surfaces | Prevents redundant suggestions across OmniAdd, AI palette, AI drawer |
| 34 | Protocol add pattern | Direct add with smart defaults (Pattern 1); order set review flow as secondary "edit" path | Fast primary path; review flow for customization. Protocol items are clinically validated — direct add is safe. |
| 35 | Multi-protocol integration | Primary protocol (from CC/Dx) + compact addenda (from secondary protocols and care gaps) | Matches clinical thinking: visit is for the CC, secondary items are "while they're here" |
| 36 | Protocol item types | Four types: orderable, documentable, guidance, advisory | Not all protocol items are chart objects — guidance and advisory serve different purposes |
| 37 | Reference pane as context container | Overview pane renamed/reframed as "reference pane" — general-purpose contextual reference with view controller | Same pane architecture serves encounter (patient context, activity, protocol), billing (guidelines, rules), population health (panel, gaps) |
| 38 | Order sets as shared concept | Order sets are the common data structure behind OmniAdd bundled suggestions, AI suggestion bundles, and protocol card sections | One data model, three rendering contexts |
| 39 | Protocol activation via AI | AI module suggests protocol based on encounter context; provider accepts; protocol view appears in reference pane | AI is intelligence layer, reference pane is display surface |
| 40 | Patient-adapted protocols | Level 1 (chart state awareness) and Level 2 (patient history personalization) are essential; Levels 3-4 (risk adjustment, dynamic generation) are future | Level 1-2 make protocols feel intelligent; 3-4 require deeper clinical logic |

## Key Constraints

- **Prototype context:** React prototype with mock data, no real backend. Architecture should reflect real-world data patterns.
- **Existing codebase:** See `canvas-work-pane-doc` for current OmniAdd implementation (3-step linear state machine). We're extending/refactoring this.
- **15 item categories** in `src/types/chart-items.ts`: chief-complaint, hpi, ros, physical-exam, vitals, medication, allergy, lab, imaging, procedure, diagnosis, plan, instruction, note, referral.
- **Three encounter view facets** in view controller: Capture, Process, Review.
- **MA handoff:** Encounters typically have MA-documented content (vitals, CC, basic HPI, allergy confirmation, med reconciliation) before the provider starts.

## Category Interaction Variants

| Variant | Categories | OmniAdd Pattern | AI Draft Pattern |
|---------|-----------|-----------------|------------------|
| **Structured search** | medication, lab, imaging, procedure, diagnosis, allergy, referral | Search/quick-pick → select → fill details → add | AI suggests complete items via suggestion layer |
| **Narrative (AI-primary)** | chief-complaint, hpi, ros, physical-exam, plan, instruction | OmniAdd is secondary/manual path | AI generates from ambient → draft in rail → accept or edit in pane |
| **Narrative (manual)** | note | Free text input via OmniAdd | Not AI-generated (ad hoc content) |
| **Structured data entry** | vitals | Numeric fields with units | Typically MA-entered during rooming |

## File References

- Current prototype architecture: `canvas-work-pane-doc`
- Figma designs: Screenshots showing tree-based OmniAdd flow
- Key source files: `OmniAddBar.tsx`, `CategorySelector.tsx`, `QuickAddInput.tsx`, `ItemDetailForm.tsx`, `chart-items.ts`

### Related Architecture Documents (in prototype repo)

- `docs/features/anchor-bar-palette-pane-system/COORDINATION_STATE_MACHINE.md` — Bottom bar + left pane coordination (15 valid states, tier transitions)
- `docs/features/anchor-bar-palette-pane-system/ANIMATION_SPEC.md` — Animation choreography for tier transitions
- `docs/features/bottom-bar-system/AI_CONTROL_SURFACE_V2.md` — AI minibar/palette: nudges, suggestions, context targeting
- `docs/features/bottom-bar-system/TRANSCRIPTION_MODULE.md` — Transcription recording, session management
- `docs/features/left-pane-system/AI_DRAWER.md` — AI drawer: conversation, suggestions, activity log, future vision
- `docs/features/left-pane-system/LEFT_PANE_SYSTEM.md` — Left pane container, view switching
- `docs/features/INTEGRATION_PLAN.md` — Bottom bar + left pane integration status

### Quick Charting Package Documents

- DESIGN-SPEC.md — Full system design specification
- CONTEXT.md — This file: decisions and constraints
- CATEGORY-MAP.md — All 15 categories mapped with interaction variants
- PHASED-PLAN.md — 7-phase implementation plan for Claude Code
- PROMPTS.md — Self-contained Claude Code prompts per phase
- MULTI-SURFACE-COORDINATION.md — Cross-surface state model, care protocols, order sets
- ROADMAP.md — Strategic roadmap with extended phases and deferred questions
