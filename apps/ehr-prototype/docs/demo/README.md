# Demo Scenarios

How to run through the EHR prototype in demos. Focused on charting mode — the core ambient-AI-assisted clinical documentation flow.

## Quick Start

Launch the prototype, pick a scenario from the encounter selector. Each scenario seeds different patient data, clinical history, and timed AI behaviors.

## Implemented Scenarios

| Scenario | ID | Patient | Visit Type | Best For Showing |
|---|---|---|---|---|
| [UC Cough](walkthroughs/uc-cough.md) | `uc-cough` | Lauren S., 42F | Urgent Care | Ambient recording, suggestion flow, Rx tasks, processing rail lifecycle |
| [PC Diabetes](walkthroughs/pc-diabetes.md) | `pc-diabetes` | Robert M., 58M | Follow-up | Care gap suggestions, med adjustments, multi-task types |
| [Annual Wellness](walkthroughs/annual-wellness.md) | `demo-healthy` | Dante P., 45M | AWV | Clean slate, immediate suggestions, no recording needed |

## Planned Scenarios

These don't exist yet. The matrix below captures the range we want to cover — each scenario should demonstrate a distinct combination of dimensions, not just a different specialty.

### Scenario Dimensions

| Dimension | Values | Why It Matters |
|---|---|---|
| **Specialty** | UC, PC, workplace health, behavioral health, telehealth | Different workflows, different chart item mix |
| **Complexity** | Simple acute, chronic management, multi-morbidity, new patient | Affects suggestion density, task volume, narrative length |
| **Starting context** | Pre-charting, checking in, mid-visit, wrapping up, completed/locked | Demonstrates different entry points and read-only states |
| **Patient demographics** | Age range, insurance type (self-pay, commercial, Medicare, Medicaid) | Affects formulary checks, care gaps, prior auth behavior |
| **Data density** | Clean slate vs. heavy clinical history | Shows how the UI handles 0 vs. 20+ pre-existing items |
| **Visit modality** | In-person, telehealth, async review | Affects which surfaces are available (no PE in telehealth, no recording in async) |
| **AI feature exposure** | Full ambient, suggestions-only, review-only | Lets demos target specific audiences (clinicians vs. ops vs. investors) |
| **Error/edge cases** | Formulary failure, drug interaction alert, missing required fields | Shows system resilience and clinical safety UX |

### Planned Matrix

| Scenario | Specialty | Complexity | Starting Context | Key Differentiator |
|---|---|---|---|---|
| Workplace Health — Pre-employment | Occ Med | Simple | Pre-charting | Minimal history, protocol-driven, checkbox-heavy |
| Behavioral Health — Follow-up | Psychiatry | Moderate | Mid-visit | Narrative-heavy, no PE, medication safety (interactions) |
| Geriatric — Multi-morbidity | PC | High | Checking in | 5+ problems, polypharmacy, multiple care gaps |
| Telehealth — Med Refill | PC | Simple | Mid-visit | No physical exam surface, video visit context |
| Completed Visit — Read-only | Any | Any | Completed/locked | Demonstrates locked state, no editing, review-only |
| New Patient — Full Intake | PC | Moderate | Pre-charting | Empty history, full data entry, onboarding flow |

> These are aspirational. Priority order TBD based on demo audience needs.

## How Walkthroughs Are Structured

Each walkthrough file follows the same format:

1. **Setup** — What data is pre-seeded, patient context, what to expect before you touch anything
2. **Phases** — Ordered steps grouped by clinical flow (not timestamps). Each phase has:
   - **Do**: What action to take
   - **Expect**: What the UI should show
   - **Demonstrates**: Which feature/system is being exercised
3. **Callout conventions**:
   - `> [!NOTE]` — Timing detail or behavior worth knowing
   - `> [!VISUAL ONLY]` — UI renders but isn't wired to state
   - `> [!NOT IMPLEMENTED]` — Referenced in design but not built
   - `> [!PARTIAL]` — Feature exists but not all paths are wired
4. **What's Not Covered** — Explicit list of things this scenario doesn't exercise

## Feature Coverage

See [COVERAGE.md](COVERAGE.md) for the full feature-by-scenario matrix with implementation status.

## Planned Refinements

Design discussions and open questions for features that affect demo behavior. Pick these up in future sessions.

| Feature | Doc | Status |
|---|---|---|
| [Process Tab Philosophy](planned/process-tab-philosophy.md) | Role-agnostic work queue, live-updating AI drafts, activity logs, multi-thread visibility | Core principle defined; implementation phases TBD |
| [Suggestion Consolidation](planned/suggestion-consolidation.md) | Unified bottom module for suggestions in drawer + palette, mutual exclusivity with quick actions | Design complete; 3-phase implementation outlined |
| [Tx Workspace Scoping](planned/tx-workspace-scoping.md) | Auto-pause recording when navigating away from patient workspace, global recording indicator in menu pane, tap-to-return | Open questions on auto-resume, multi-session constraints |
| [Care Protocols](planned/care-protocols.md) | Guideline-driven checklists in reference pane or via AI palette responses | Two paths proposed (AI palette vs. dedicated tab), starting with AI palette |

## Related Docs

- [COVERAGE.md](COVERAGE.md) — Feature implementation status matrix
- [Quick Charting ROADMAP](../../resources/quick-chart-specs-prompts/ROADMAP.md) — Strategic direction for future tiers
- [PROGRESS.md](../PROGRESS.md) — Implementation phase tracker
