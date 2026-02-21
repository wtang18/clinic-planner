# Multi-Surface Coordination Architecture

**Status:** Design specification — captures how all input surfaces, AI systems, and clinical guidance coordinate around a shared chart state.

**Related docs:**
- DESIGN-SPEC.md (quick charting system)
- CONTEXT.md (quick charting decisions)
- AI_CONTROL_SURFACE_V2.md (AI minibar/palette)
- AI_DRAWER.md (AI drawer in left pane)
- TRANSCRIPTION_MODULE.md (ambient recording)
- COORDINATION_STATE_MACHINE.md (bottom bar + left pane UI coordination)

---

## 1. The Coordination Problem

Multiple surfaces can generate, suggest, or facilitate chart items during an encounter. Each serves a different cognitive mode, but they all write to the same chart. Without coordination, the provider sees redundant suggestions, mismatched completion states, and disconnected workflows.

This document defines:
- Every surface that can add items to the chart
- How they share state
- How suggestions, order sets, and care protocols interrelate
- The unified state model that makes it all work

---

## 2. Input Surfaces

### 2.1 Surface Inventory

| Surface | Location | Primary Intent | Cognitive Mode | Input Type |
|---------|----------|---------------|----------------|------------|
| **OmniAdd** | Canvas pane, bottom | Provider-initiated structured charting | "I know what I want to add" | Active — provider drives |
| **OmniAdd Suggestion Layer** | Within OmniAdd detail area, at each depth | Contextual shortcuts within active charting | "Here's what you probably want next" | Semi-active — provider sees and accepts |
| **AI Palette** | Bottom bar, expanded | Cross-cutting awareness + quick actions | "What should I be thinking about?" | Ambient — AI surfaces, provider acts |
| **AI Drawer** | Left pane | Full AI assistant: suggestions, conversation, activity | "Let me explore / ask / review AI's perspective" | Deliberate — provider engages deeply |
| **Processing Rail** | Capture mode, right column | Peripheral awareness of AI drafts + order status | "What's happening alongside my charting?" | Passive — provider glances, acts when ready |
| **Care Protocol** | Reference pane (overview), protocol view | Evidence-based clinical guidance adapted to patient | "What does the standard of care recommend?" | Reference — provider follows or selects |

### 2.2 Surface Relationships

```
                    ┌──────────────────────────────┐
                    │   Chart Items State           │
                    │   (Single Source of Truth)     │
                    └──────────┬───────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼──────┐    ┌───────▼───────┐    ┌──────▼───────┐
    │  ACTIVE     │    │  AMBIENT      │    │  REFERENCE   │
    │  INPUT      │    │  INTELLIGENCE │    │  GUIDANCE    │
    ├─────────────┤    ├───────────────┤    ├──────────────┤
    │ OmniAdd     │    │ AI Palette    │    │ Care Protocol│
    │ OmniAdd     │    │ AI Drawer     │    │ (Reference   │
    │  Suggestions│    │ Processing    │    │  Pane)       │
    │             │    │  Rail Drafts  │    │              │
    └─────────────┘    └───────────────┘    └──────────────┘
```

All surfaces READ from and WRITE to the same chart items state. No surface "owns" items. The chart items list is the single record of what's in the encounter.

### 2.3 What Each Surface Does Best

| Surface | Best For | Not For |
|---------|----------|---------|
| **OmniAdd** | Adding specific items the provider has decided on; speed-optimized structured input | Browsing recommendations; reviewing AI output |
| **OmniAdd Suggestions** | Accelerating OmniAdd with contextual suggestion cards and pills; order set shortcuts | Comprehensive care planning; cross-cutting awareness |
| **AI Palette** | Quick awareness checks; accepting/dismissing suggestions between charting actions | Deep editing; extended conversation; protocol review |
| **AI Drawer** | Extended AI interaction; reviewing full suggestion list; asking clinical questions | Rapid item addition (too many taps to add from drawer) |
| **Processing Rail** | Ambient awareness of AI drafts and order status during charting | Detailed editing; batch operations (that's Process view) |
| **Care Protocol** | Structured clinical guidance; batch adding recommended items; training/quality assurance | Ad hoc additions; items not in the protocol; free-form charting |

---

## 3. Unified Suggestion Engine

### 3.1 Architecture

A single suggestion engine generates recommendations consumed by multiple surfaces. Each surface filters and renders suggestions according to its context and display constraints.

```
Suggestion Engine
  │
  ├── Source: Ambient recording transcript
  ├── Source: Chief complaint + visit type
  ├── Source: Patient history (problems, meds, allergies, recent labs)
  ├── Source: Active care protocol recommendations
  ├── Source: Care gaps (overdue screenings, monitoring)
  ├── Source: Order sets / clinical pathways
  ├── Source: Provider patterns (personal prescribing history)
  │
  ├── Generates → Individual item suggestions (single chart items)
  ├── Generates → Order set suggestions (bundled items)
  ├── Generates → AI narrative drafts (HPI, PE, Plan, Instructions)
  ├── Generates → Care gap alerts
  │
  └── Consumed by:
      ├── OmniAdd detail area suggestion cards (filtered to current input context)
      ├── AI Palette suggestion section (top 3, cross-category)
      ├── AI Drawer suggestion section (full list, grouped by source)
      ├── Processing Rail AI Drafts section (narrative drafts only)
      └── Care Protocol progress tracking (maps suggestions to protocol items)
```

### 3.2 Deduplication and Lifecycle

When a suggestion is accepted from ANY surface:
1. The item is added to chart items state
2. The suggestion engine marks it as "accepted" (removes from all surfaces)
3. AI activity log records: "Added [item] from [surface]"
4. Care protocol progress updates (if the item matches a protocol recommendation)
5. Processing state is created (if applicable)

When a suggestion is dismissed from ANY surface:
1. The suggestion is marked "dismissed" globally
2. It disappears from all surfaces (not just the one where it was dismissed)
3. AI activity log records: "Dismissed: [item]"
4. Care protocol does NOT update (dismissing a suggestion ≠ declining a protocol recommendation)

When the provider manually adds an item via OmniAdd that matches a pending suggestion:
1. The matching suggestion is auto-resolved (removed from suggestion surfaces)
2. Care protocol progress updates
3. No duplicate created

### 3.3 Suggestion Confidence and Surface Routing

Not all suggestions appear on all surfaces. Routing depends on confidence and relevance:

| Confidence | OmniAdd Suggestions | AI Palette | AI Drawer | Care Protocol |
|------------|-------------------|------------|-----------|---------------|
| **High** (direct match to CC/conversation) | ✓ (prominent) | ✓ (top suggestion) | ✓ | ✓ (if in protocol) |
| **Medium** (contextual inference) | ✓ (secondary) | ✓ | ✓ | ✓ (as "Consider") |
| **Low** (care gap, tangential) | ✗ | Maybe (as nudge) | ✓ (in full list) | ✓ (in addenda) |

---

## 4. Order Sets

### 4.1 Definition

An order set is a pre-configured bundle of chart items that belong together clinically. Order sets are the shared data structure behind:
- OmniAdd's bundled suggestions ("Bronchitis → Rx + Lab + Dx")
- AI suggestion bundles in palette/drawer
- Care protocol card sections (each card section is effectively a contextual order set)

### 4.2 Order Set Data Model

```typescript
interface OrderSet {
  id: string;
  name: string;                          // "Acute Bronchitis — Diagnostics"
  description?: string;
  source: 'protocol' | 'clinical-pathway' | 'provider-custom' | 'ai-generated';
  items: OrderSetItem[];
  patientAdaptations?: PatientAdaptation[];  // Patient-specific modifications
}

interface OrderSetItem {
  id: string;
  category: ChartItemCategory;           // medication, lab, imaging, etc.
  templateData: Partial<ChartItemData>;   // Pre-filled fields with smart defaults
  conditionality: 'standard' | 'conditional' | 'consider';
  conditionNote?: string;                 // "if >10 days or worsening"
  defaultSelected: boolean;              // Pre-checked in review flow
  patientSpecific?: {                    // Patient-context annotations
    note?: string;                       // "Patient is diabetic — consider A1c if due"
    adjustedConditionality?: 'standard' | 'conditional' | 'consider';
    contraindicated?: boolean;           // "Avoid: codeine (Metformin interaction)"
  };
}
```

### 4.3 Order Set Interaction Patterns

Order sets appear in three contexts with consistent but context-adapted interaction:

**In OmniAdd (suggestion layer):**
- Appears as a single expandable suggestion chip: "Bronchitis workup (4 items)"
- One-tap accept: adds all default-selected items with smart defaults
- Expand: shows individual items with checkboxes → [Add Selected]
- Each item has an [Edit] that opens inline detail fields within OmniAdd

**In AI Palette/Drawer (suggestion section):**
- Appears as a suggestion card with [+] and expandable preview
- [+]: adds all default-selected items
- Expand: shows contents with select/deselect
- Same underlying data as OmniAdd, different rendering

**In Care Protocol (reference pane):**
- Card sections ARE order sets with additional context (guidance, advisories)
- [Add All] per card: adds all orderable items in that section
- [+] per item: adds individual item directly
- [Review & Add]: opens order set review flow (see §4.4)

### 4.4 Order Set Review Flow

A shared component used across surfaces when the provider wants to review/customize before batch adding.

```
┌─ Order Set Review ──────────────────────────────┐
│                                                  │
│  [Protocol/Set Name] (N items)         [Cancel]  │
│                                                  │
│  ☑ Item 1 Name                                   │
│    Category · Key detail · Default setting [Edit] │
│                                                  │
│  ☑ Item 2 Name                                   │
│    Category · Key detail               [Edit]    │
│                                                  │
│  ☐ Item 3 Name (conditional)                     │
│    Category · Note: [condition]        [Edit]    │
│                                                  │
│  ⚠ Item 4 Name (contraindicated)                 │
│    [Warning text]                                │
│                                                  │
│  [Add Selected (N)]                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

- Standard items: pre-checked
- Conditional items: unchecked, present for selection
- Contraindicated items: shown with warning, not selectable
- [Edit] per item: opens details pane or inline expand for field customization
- [Add Selected]: batch adds all checked items to chart

**Where the review flow renders:**
- From OmniAdd: inline expansion within OmniAdd (replaces the suggestion detail area)
- From protocol card: sheet/panel overlaying the reference pane
- From AI drawer: inline within the drawer scroll area

---

## 5. Care Protocols

### 5.1 Overview

Care protocols are structured, evidence-based clinical guidance for specific conditions/scenarios. They surface in the reference pane as a third view alongside Patient Context and Activity Timeline.

Protocols are:
- **Suggested by AI** based on encounter context (CC, Dx, visit type)
- **Displayed in the reference pane** as a persistent, scannable view
- **Adapted to the patient** using history, medications, conditions, and care gaps
- **Connected to chart state** so progress updates as items are added from any surface

### 5.2 Protocol Activation

The AI module suggests activating a protocol based on encounter context:

1. Provider starts encounter for "Cough x 5 days"
2. AI recognizes potential acute bronchitis
3. AI palette shows nudge: "Acute Bronchitis protocol available" or AI drawer suggests: "Activate Acute Bronchitis protocol?"
4. Provider accepts → protocol view appears in reference pane
5. Protocol is immediately adapted to patient context

Alternatively, the provider can manually activate a protocol from the reference pane (search/browse available protocols).

Protocols can also auto-activate with lower confidence (showing as available but not foregrounded) until the provider confirms a diagnosis.

### 5.3 Protocol Structure

A protocol consists of **cards** organized by clinical workflow stage:

| Card | Content Type Mix | Example Items |
|------|-----------------|---------------|
| **History & Assessment** | Guidance + Documentable | Questions to ask, history elements to collect |
| **Examination** | Documentable + Advisory | Exam components, conditional examinations |
| **Diagnostics** | Orderable + Advisory | Labs, imaging, conditional tests |
| **Treatment** | Orderable + Advisory | Medications, therapies, contraindication warnings |
| **Patient Education** | Orderable + Guidance | Instructions, lifestyle recommendations |
| **Follow-Up** | Orderable + Guidance | Return visits, referral criteria, escalation triggers |

Not every protocol has all cards. Simple protocols (e.g., UTI in healthy adult) might have 3-4 cards. Complex protocols (e.g., new diabetes diagnosis) might have 6+.

### 5.4 Protocol Item Types

| Type | Description | Chartable? | Completion Tracking | Add Action |
|------|-------------|-----------|-------------------|------------|
| **Orderable** | Specific chart item: Rx, Lab, Imaging, Referral, Instruction | Yes | Matched against chart items state | [+] direct add or [Add All] batch |
| **Documentable** | Clinical observation to record: PE finding, ROS element, HPI detail | Yes (as narrative content) | Matched against narrative sections (AI draft content or manual documentation) | AI listens for conversation content; manual check-off available |
| **Guidance** | Prompt for the provider: question to ask, thing to consider | Not directly | Tracked by AI detecting relevant conversation content; manual check-off | No [+] — informational |
| **Advisory** | Warning or constraint: drug interaction, contraindication, risk flag | No | Always visible, no completion state | Not addable — persistent warning |

### 5.5 Protocol Actions

**Per-item actions:**
- **[+] (orderable items):** Direct add to chart with smart defaults. Item shows ✓ in protocol.
- **[Edit] (orderable items):** Opens order set review flow for that single item (detail fields editable before adding).
- **Manual check (guidance/documentable):** Provider can manually mark as addressed. Or AI auto-marks when relevant conversation/documentation is detected.

**Per-card actions:**
- **[Add All]:** Adds all orderable items in the card section with smart defaults. Fastest path.
- **[Review & Add]:** Opens order set review flow for the card's orderable items. Provider selects/customizes, then batch adds.

**Protocol-level actions:**
- **[Add All] (top level):** Adds all orderable items across all cards. Power move for straightforward cases.
- **Dismiss protocol:** Removes from reference pane. Logged in AI activity.

### 5.6 Patient Adaptation

Protocols adapt to the patient at four levels of sophistication:

**Level 1: Chart state awareness (essential)**
- Items already in the chart show ✓ automatically
- Items matching pending AI suggestions show "Suggested" indicator
- Completion percentage reflects actual chart state

**Level 2: Patient history personalization (essential)**
- Items filtered/annotated based on patient record
- Comorbidity-driven additions: "Patient has T2DM → Consider A1c if due (last: 8 months ago)"
- Medication-aware advisories: "Patient on Metformin → Avoid codeine cough suppressants"
- Allergy-aware filtering: contraindicated items flagged, alternatives suggested

**Level 3: Risk-adjusted ordering (future)**
- Item conditionality adjusted by patient risk factors
- Immunocompromised → CBC elevated from "Consider" to "Recommend"
- COPD history → Chest X-ray elevated from conditional to standard

**Level 4: Dynamic item generation (future)**
- Protocol generates patient-specific items not in the base template
- "Based on Lauren's last A1c of 7.4 and 8-month gap, recommend A1c recheck"
- Crosses the line from template adaptation to clinical reasoning

### 5.7 Multi-Protocol Integration

When multiple conditions are relevant to the encounter, protocols use a **primary + addenda** model:

**Primary protocol:** Determined by chief complaint or primary diagnosis. Displayed as the full card-based view in the reference pane.

**Addenda:** Secondary protocols/care gaps appear as a compact section below the primary protocol:

```
┌─ Also Recommended ──────────────────────────────┐
│                                                  │
│  Diabetes Management (3 items due)               │
│  ● Order: A1c (last: 8 months ago)      [+]     │
│  ● Review: Medication reconciliation     ○       │
│  ● Refer: Retinal screening (overdue)    [+]     │
│                                                  │
│  Preventive Care (1 item due)                    │
│  ● Order: Flu vaccine (seasonal)         [+]     │
│                                                  │
└──────────────────────────────────────────────────┘
```

Addenda are:
- Compact (no full card structure, just actionable items)
- Sourced from secondary protocols and care gap analysis
- Deduplicated against the primary protocol (if primary already recommends A1c, addenda doesn't repeat it)
- Independently actionable ([+] per item)

---

## 6. Reference Pane Architecture

### 6.1 Naming and Purpose

The reference pane (currently labeled "overview pane" in the prototype) is the persistent middle column that houses contextual reference material supporting the canvas work pane.

**Proposed name:** Reference Pane (or Context Pane)

**General principle:** The reference pane content adapts to the work context. The same pane architecture serves different applications:

| Application | View 1 | View 2 | View 3 |
|-------------|--------|--------|--------|
| **Encounter (charting)** | Patient Context (problems, meds, allergies, vitals) | Activity Timeline (visit history, recent results) | Care Protocol (active protocol + addenda) |
| **Billing/Coding** | Coding Guidelines | Payer Rules | Claim History |
| **Population Health** | Patient Panel | Care Gaps | Quality Measures |

### 6.2 View Switching

The reference pane has a view controller (tab bar or segmented control) at the top. Views switch the pane content while the canvas work remains stable.

During an encounter:
- **Patient Context** — default view (current prototype behavior)
- **Activity Timeline** — visit history, lab trends, referral outcomes
- **Care Protocol** — active protocol(s) when activated, otherwise hidden or showing "No active protocol"

The protocol view tab appears when a protocol is activated (via AI suggestion or manual activation). A subtle badge on the tab indicates protocol progress or items needing attention.

### 6.3 Reference Pane as Input Surface

The reference pane is primarily a read surface — but the care protocol view introduces controlled write capability:

| View | Read/Write | What It Writes |
|------|-----------|---------------|
| Patient Context | Read-only | — |
| Activity Timeline | Read-only | — |
| Care Protocol | Read + controlled write | Adds pre-configured chart items via [+] and [Add All] |

The "controlled write" is important: the protocol view only adds items that are clinically validated, pre-configured, and patient-adapted. It doesn't become a general-purpose input surface. OmniAdd remains the general input tool.

---

## 7. Cross-Surface State Model

### 7.1 Shared State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Encounter State (root)                                      │
│                                                              │
│  ┌─ Chart Items ──────────────────────────────────────────┐  │
│  │  Single source of truth for all encounter content       │  │
│  │  Items have: category, data, author, status, activity   │  │
│  │  Written by: OmniAdd, AI draft accept, Protocol add,   │  │
│  │              AI suggestion accept                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Suggestion State ─────────────────────────────────────┐  │
│  │  All pending suggestions from all sources               │  │
│  │  Status: pending | accepted | dismissed | auto-resolved │  │
│  │  Consumed by: OmniAdd, AI Palette, AI Drawer, Protocol │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Processing State ─────────────────────────────────────┐  │
│  │  Per-item processing status (Dx assoc, send, collect)   │  │
│  │  Consumed by: Processing Rail, Process View, Cards      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ AI Draft State ───────────────────────────────────────┐  │
│  │  Narrative drafts from ambient recording                │  │
│  │  Status: generating | pending_review | accepted | ...   │  │
│  │  Consumed by: Processing Rail, Process View             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Protocol State ───────────────────────────────────────┐  │
│  │  Active protocol(s), item completion, adaptations       │  │
│  │  Reads: Chart Items (to track progress)                 │  │
│  │  Reads: Suggestion State (to show "Suggested" status)   │  │
│  │  Reads: Patient Record (for adaptation)                 │  │
│  │  Consumed by: Reference Pane protocol view              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Order Set Registry ───────────────────────────────────┐  │
│  │  Available order sets (protocol-derived + standalone)    │  │
│  │  Consumed by: OmniAdd suggestions, AI suggestions,      │  │
│  │               Protocol cards, Process View batch actions │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Activity Log ─────────────────────────────────────────┐  │
│  │  Global encounter activity (cross-surface)              │  │
│  │  Written by: all surfaces on every action               │  │
│  │  Consumed by: AI Drawer activity log modal, per-item    │  │
│  │               activity log in details pane              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Cross-Surface Event Flow

**Provider adds item via OmniAdd:**
1. Chart Items: new item added
2. Suggestion State: matching suggestions auto-resolved
3. Processing State: processing entry created (if applicable)
4. Protocol State: matching protocol item marked as addressed
5. Activity Log: "Added [item] via OmniAdd by [provider]"
6. All surfaces react to state change (suggestions disappear, protocol updates, rail shows new processing entry)

**Provider accepts AI suggestion from palette:**
1. Chart Items: new item added
2. Suggestion State: suggestion marked accepted
3. Processing State: processing entry created
4. Protocol State: matching protocol item marked as addressed
5. Activity Log: "Added [item] from AI suggestion by [provider]"

**Provider accepts AI draft from rail:**
1. Chart Items: draft promoted to chart list (or replaces MA original)
2. AI Draft State: draft marked accepted
3. Protocol State: matching documentable items may be addressed
4. Activity Log: "AI-generated [category], accepted by [provider]"

**Provider adds item from protocol [+]:**
1. Chart Items: new item added (with protocol as source)
2. Suggestion State: matching suggestions auto-resolved
3. Processing State: processing entry created
4. Protocol State: item marked as addressed
5. Activity Log: "Added [item] from Care Protocol by [provider]"

**Provider batch adds from protocol [Add All]:**
1-5 repeated for each item in the batch, atomically

### 7.3 Conflict Resolution

| Scenario | Resolution |
|----------|-----------|
| Same item suggested by AI AND in protocol | Show in both surfaces; accepting from either resolves both |
| Provider adds item that matches a pending suggestion | Suggestion auto-resolves; no duplicate |
| Provider adds item that matches a protocol recommendation | Protocol item auto-marks as addressed |
| Two suggestions for similar but not identical items (e.g., different dosages of same drug) | Both shown; accepting one dismisses the other with note |
| Protocol recommends item but AI suggests alternative | Both shown; protocol item marked "Alternative suggested by AI" |
| Provider dismisses suggestion but protocol still recommends it | Protocol item stays; suggestion disappears from AI surfaces |

---

## 8. Implications for Quick Charting Spec

### 8.1 OmniAdd Updates

- **Order set suggestion type:** OmniAdd suggestion layer needs to handle bundled suggestions that expand to show multiple items with select/deselect and batch add.
- **Source tracking:** When an item is added via OmniAdd, record the source (manual, suggestion, order set) for activity log and analytics.
- **Protocol awareness:** OmniAdd suggestions should be aware of active protocol recommendations. If a protocol recommends "Rapid COVID-19" and the provider navigates to Lab category in OmniAdd, the COVID test should be prominently suggested (with "Recommended by protocol" tag).

### 8.2 Processing Rail Updates

- **Protocol progress indicator:** A compact batch summary row in the rail: "Protocol: 4/7 ✓" — gives peripheral awareness of protocol completion during charting.
- **Protocol items in batches:** Items added from a protocol should appear in the same processing batches as manually added items (they're the same chart items). No separate "protocol items" batch.

### 8.3 AI Draft Updates

- **Protocol-aware draft generation:** AI drafts (HPI, PE, Plan) should reference protocol items and recommendations. If the protocol recommends "Ask about smoking history" and the provider asks about it, the HPI draft should include that information.
- **Guidance item tracking:** AI listens for conversation content matching protocol guidance items and auto-marks them as addressed. This feeds into protocol progress.

### 8.4 Details Pane Updates

- **Protocol source in activity log:** If an item was added from a protocol, the activity log shows: "Added from Acute Bronchitis protocol by [provider]"
- **Protocol link:** Items sourced from a protocol could link back to the protocol view for context.

### 8.5 Process View Updates

- **Protocol progress in sign-off:** The sign-off section could include protocol adherence as an informational metric: "Protocol adherence: 10/12 items addressed (2 conditional items declined)". Not blocking — informational for quality awareness.

---

## 9. Implementation Sequencing

This coordination architecture doesn't need to be built all at once. It layers on top of the phased implementation plan:

| Phase | What's Added | Coordination Impact |
|-------|-------------|-------------------|
| **Phases 1-4** (Quick Charting core) | OmniAdd, cards, details pane, rail, AI drafts | Chart items state + processing state + AI draft state established |
| **Phase 5** (Process View) | Process view, batch actions, sign-off | Process view reads shared state |
| **Phase 7** (Encounter Lifecycle) | MA handoff, provider start, full lifecycle | Encounter state management |
| **Future: Suggestion Engine** | Unified suggestion state consumed by all surfaces | Suggestion deduplication, cross-surface resolution |
| **Future: Order Sets** | Order set data model, review flow component | Shared component for OmniAdd, AI, and Protocol surfaces |
| **Future: Care Protocols** | Protocol state, reference pane protocol view, patient adaptation | Protocol state reads chart items; protocol actions write to chart items |
| **Future: Full AI Integration** | AI palette/drawer consuming suggestion state | AI surfaces filter from unified suggestion engine |

**Key architectural decision:** The chart items state model defined in Phases 1-4 must support the `source` and `activityLog` fields from the start. Even before protocols and unified suggestions exist, every item should track how it was created. This is already in the spec (activity log per item, author tracking) — just confirming it's forward-compatible.

---

## 10. Open Questions (Deferred)

| Question | Notes |
|----------|-------|
| Protocol authoring/editing | Who creates protocols? Clinical team? AI-generated from guidelines? Both? |
| Protocol versioning | How are protocol updates handled for active encounters? |
| Protocol analytics | Tracking adherence rates, deviation patterns, outcomes correlation |
| AI confidence display | Should protocol items show AI confidence in the recommendation? |
| Provider protocol preferences | Can providers customize which protocols auto-suggest? Dismiss protocols globally? |
| Offline protocol availability | Do protocols work without AI/network for rural/offline settings? |
| Order set customization | Can providers save personal order set variants? |
| Cross-encounter protocol continuity | For multi-visit conditions (e.g., diabetes management), how does protocol state persist across encounters? |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-17 | Initial specification — multi-surface coordination, order sets, care protocols, reference pane architecture, cross-surface state model |
