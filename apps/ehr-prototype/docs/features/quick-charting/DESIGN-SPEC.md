# Quick Charting — Design Specification

## 1. System Overview

### 1.1 Encounter View Facets

Three views show the same chart items through different lenses:

| View | Purpose | Organization | Primary Interaction |
|------|---------|-------------|-------------------|
| **Capture** | Speed of input during encounter | Chronological stream | OmniAdd (active charting) + rail (ambient awareness) |
| **Process** | Complete outstanding work | Operational batches by type | Batch actions, status management, sign-off |
| **Review** | Structured documentation for sign-off | Clinical sections (CC/HPI, ROS, PE, Assessment, Plan) | Read, verify, edit via details pane |

Every chart item exists once. The views arrange and surface it differently. The view switcher should feel like a view mode toggle (list/grid/column), not navigation tabs — reinforcing the "same objects, different lens" mental model.

### 1.2 Capture Mode Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Encounter Header (visit type, patient, provider, status)                  │
│                                                                          │
│  ┌───────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │                                       │  │                         │  │
│  │  Chart Items List                     │  │  Processing Rail        │  │
│  │  (chronological stream)               │  │  (batch summaries)      │  │
│  │                                       │  │                         │  │
│  │  ┌─────────────────────────────────┐  │  │  AI Drafts              │  │
│  │  │ Card: CC (MA-documented)        │  │  │  3 ready for review •••│  │
│  │  ├─────────────────────────────────┤  │  │                         │  │
│  │  │ Card: Vitals (MA-recorded)      │  │  │  Prescriptions          │  │
│  │  ├─────────────────────────────────┤  │  │  1 ready to send   •••│  │
│  │  │ Card: HPI (MA-documented)       │  │  │                         │  │
│  │  ├─────────────────────────────────┤  │  │  Labs (In-House)        │  │
│  │  │ Card: Rx (provider-added)       │  │  │  2 need Dx         •••│  │
│  │  ├─────────────────────────────────┤  │  │                         │  │
│  │  │ Card: Lab (provider-added)      │  │  │  Labs (Quest)           │  │
│  │  └─────────────────────────────────┘  │  │  —                      │  │
│  │                                       │  │                         │  │
│  │  ┌─────────────────────────────────┐  │  └─────────────────────────┘  │
│  │  │  OmniAdd Module                 │  │                               │
│  │  │  (always visible at bottom)     │  │                               │
│  │  └─────────────────────────────────┘  │                               │
│  └───────────────────────────────────────┘                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │  Ambient Recording Minibar                                           ││
│  └──────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Interaction Hierarchy

Three levels of interaction, escalating in depth:

| Level | Surface | Actions | Examples |
|-------|---------|---------|----------|
| **Surface** | Card face, rail row | Quick actions: accept draft, dismiss, simple status toggle, inline field edit on structured items | One-tap accept AI draft; tap dosage chip on Rx card to change |
| **Pane** | Details pane (side drawer) | Full editing, all actions, Dx association, activity log | Tap any card → details pane opens with full fields + actions + history |
| **View** | Process view | Batch operations, multi-item workflows, sign-off | Send All Rx, Associate All Dx, complete sign-off checklist |

---

## 2. OmniAdd Module

### 2.1 State Machine

Tree-based state machine with three interaction variants:

```
                    ┌─────────┐
                    │  ROOT   │ ← Returns here after add (unless batch mode)
                    └────┬────┘
                         │
            ┌────────────┼────────────────┐
            │            │                │
     ┌──────▼──────┐ ┌──▼────────┐ ┌─────▼──────────┐
     │  STRUCTURED  │ │ NARRATIVE │ │  DATA ENTRY    │
     │  SEARCH     │ │ (manual)  │ │  (vitals)      │
     └──────┬──────┘ └──┬────────┘ └─────┬──────────┘
            │            │                │
     ┌──────▼──────┐ ┌──▼────────┐ ┌─────▼──────────┐
     │ QUICK-PICK  │ │ TEXT      │ │  FIELDS        │
     │ or SEARCH   │ │ INPUT     │ │  (numeric)     │
     └──────┬──────┘ └──┬────────┘ └─────┬──────────┘
            │            │                │
     ┌──────▼──────┐    │                │
     │  DETAIL     │    │                │
     │  FIELDS     │    │                │
     └──────┬──────┘    │                │
            └────────────┼────────────────┘
                         │
                    ┌────▼────┐
                    │  ADD    │ → chart items list + processing rail (if applicable)
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  ROOT   │ (or CATEGORY if batch mode)
                    └─────────┘
```

Note: Narrative categories (CC, HPI, ROS, PE, Plan, Instruction) are primarily AI-drafted via ambient recording. The OmniAdd narrative flow is the secondary/manual path — used when the provider wants to add or write content directly rather than waiting for or accepting an AI draft.

### 2.2 Root State

**Touch:** Category pills in priority order. Primary row: Rx (M), Lab (L), Dx (D), Imaging (I), Proc (P). Secondary behind "More": CC, HPI, ROS, PE, Vitals, Allergy, Plan, Instruction, Note, Referral.

**Keyboard:** Focused text input with placeholder "Add item... (/ for categories)". Typing searches across all categories. Category prefixes (`rx:`, `lab:`, `dx:`) narrow scope. Single-key shortcuts (M, L, D, I, P) when input is empty.

**Both:** AI suggestion row below input showing complete, actionable items based on encounter context.

### 2.3 Breadcrumb Navigation

Breadcrumbs show current tree path: `+ Rx > Benzonatate`

Tapping a breadcrumb level returns to that level's **selection state** — not forward into its details. Examples:
- Tapping "Rx" in `+ Rx > Benzonatate` returns to the Rx category root (quick-picks/search) to choose a different drug
- Tapping "+" returns to OmniAdd root

Back button and Escape key move back one level.

### 2.4 Structured Search Flow

**Categories:** medication, lab, imaging, procedure, diagnosis, allergy, referral

1. **Category selected** → Quick-pick chips (AI-generated based on CC/patient context) + "Other" (search)
2. **Item selected** → Detail fields specific to category, pre-populated with smart defaults
3. **Add** → Card appears in chart items list; processing entry created if applicable

### 2.5 Narrative Flow (Manual/Secondary Path)

**Categories:** chief-complaint, hpi, ros, physical-exam, plan, instruction, note

1. **Category selected** → Text input area with category-specific placeholder
2. **Type content** — template/snippet support for ROS (system toggles) and PE (system sections)
3. **Add** → Card appears in chart items list

Note is the only purely manual narrative category. All others are primarily AI-drafted from ambient recording (see Section 3).

### 2.6 Structured Data Entry Flow

**Category:** vitals

1. **Category selected** → Grid of vital sign fields (BP, HR, Temp, RR, SpO2, Weight, Height, BMI, Pain)
2. **Enter values** — out-of-range highlighting, BMI auto-calc, trend indicators vs. last recorded
3. **Add** → Vitals card appears in chart items list

Vitals are typically MA-entered during rooming. Provider updates via OmniAdd if needed.

### 2.7 AI Suggestion Layer

Suggestions appear at multiple points in OmniAdd:

| Context | Suggestion Type | Example |
|---------|----------------|---------|
| Root (no category) | Complete items across categories | "Rx: Benzonatate 100mg PO TID PRN #15, 0RF" |
| Category selected | Pre-filled items within category | Within Rx: common cough medications with full details |
| After adding item | Next likely item | After Rx, suggest associated Dx |
| Order sets | Multi-item bundles | "Bronchitis" → Rx + Dx + Labs |

**Suggestion sources (priority order):**
1. Ambient recording transcript
2. Chief complaint + visit type
3. Patient history (problems, meds, allergies, recent labs)
4. Active care protocol recommendations (see MULTI-SURFACE-COORDINATION.md §5)
5. Order sets / clinical pathways
6. Care gaps (overdue screenings, monitoring)
7. Provider's prescribing patterns

**Accepting a suggestion:** One tap (touch) or Enter (keyboard) adds the complete item, bypassing the tree. This is the fastest path.

**Order sets:** Single suggestion that adds multiple items. Two interaction paths:
- **Quick add (primary):** One-tap accepts all default-selected items with smart defaults. Fastest path for trusted order sets.
- **Review & customize (secondary):** Expand the order set suggestion to see contents. Shows a review flow with checkboxes per item (standard items pre-checked, conditional items unchecked, contraindicated items flagged). Each item has an [Edit] affordance for field customization. [Add Selected] batch-adds checked items.

Order sets are the shared data structure behind OmniAdd bundled suggestions, AI suggestion bundles, and care protocol card sections. See MULTI-SURFACE-COORDINATION.md §4 for the full order set architecture.

### 2.8 Batch Mode

After adding an item, OmniAdd returns to category level (not root) for batch adds:
- "Done with [Category]" affordance returns to root
- Keyboard: Enter adds and stays; Escape returns to root
- Touch: category chip stays active with "adding more" state

### 2.9 Undo

- Keyboard: Cmd/Ctrl+Z removes last-added chart item
- Touch: toast with "Undo" for 5 seconds after add
- Undo removes item from chart list and processing state

---

## 3. AI Draft System

### 3.1 Overview

Narrative content (CC, HPI, ROS, PE, Plan, Instructions) is primarily AI-generated from ambient recording. Drafts appear in the processing rail as they're ready, and the provider accepts or edits them.

### 3.2 Draft Generation (Progressive, Stage-Based)

| Encounter Stage | AI Draft | Trigger |
|----------------|----------|---------|
| 0-30s | CC refinement | Patient's first description of symptoms |
| 2-5 min | HPI | Patient history discussion detected |
| 5-10 min | ROS | Review of systems conversation detected |
| Exam phase | PE | Provider's verbal exam narration detected |
| After orders placed | Plan | Treatment decisions captured |
| Late encounter | Patient Instructions | Diagnoses + orders inform instruction generation |

Drafts update silently in the rail — provider sees latest version, not every revision. If the provider manually adds content for a category before AI generates a draft, AI skips that category or offers enrichment.

### 3.3 AI + MA Content Interaction

MA often documents CC, basic HPI, vitals, allergy confirmation, and med reconciliation before the provider starts. When AI generates drafts for categories that already have MA content:

- AI **enriches** the MA's content with information from the provider's conversation
- Draft is labeled "Updated [category]" in the rail (not "Draft")
- Accepting the AI version **replaces** the MA's original card in the chart list
- MA's original content is preserved in the item's activity log

### 3.4 Draft Review Flow

```
Draft appears in rail → Provider sees "HPI Draft ready" → Two paths:

Path A (Accept):
  One-tap "Accept" on rail → Content promoted to chart items list at bottom
  → Draft removed from rail → Activity log records: "AI-generated, accepted by [provider]"

Path B (Edit):
  Tap "Edit" on rail → Details pane opens from right with full content editable
  → Provider modifies → Confirms → Content promoted to chart items list at bottom
  → Draft removed from rail → Activity log records: "AI-generated, edited and accepted by [provider]"

Dismiss:
  Provider dismisses draft → Removed from rail → AI may regenerate later with new context
```

### 3.5 Draft vs. Suggestion Distinction

| | AI Suggestion (OmniAdd) | AI Draft (Rail) |
|-|------------------------|-----------------|
| Content type | Structured items (Rx, Lab, Dx, etc.) | Narrative content (HPI, PE, Plan, etc.) |
| Where it appears | Suggestion row in OmniAdd | Processing rail under "AI Drafts" |
| Provider action | Accept = adds via OmniAdd flow | Accept = promotes to chart list |
| Generation | Based on context/rules | Based on ambient recording |

---

## 4. Chart Item Cards

### 4.1 Card Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│ [Category Badge]  Item Summary Text                    [⚡][•••] │
│ Last edited by Dr. Anderson · 10:15a                            │
└──────────────────────────────────────────────────────────────────┘
```

**Category Badge:** Colored label (Rx, Lab, Chief Complaint, etc.)

**Item Summary:** Primary content. Rx: drug + dosage + route + frequency. Narrative: first line truncated. Vitals: formatted readings.

**Status Indicator [⚡]:** Colored dot/icon for processing state. Only visible when processing is incomplete:
- ⚠ Amber: needs attention (action required)
- 🔵 Blue: in progress
- ✓ Green (brief): just completed
- No indicator: complete or no processing needed

**Last edited by:** Author name + timestamp. Links to activity log in details pane.

**Unreviewed indicator:** MA-documented items the provider hasn't reviewed show a subtle unreviewed marker (e.g., faint left border or small dot). Clears when provider opens the details pane or explicitly confirms.

**Three-dot menu:** Open details, quick actions relevant to current state.

### 4.2 Quick Inline Edits (Structured Items Only)

Structured item cards (Rx, Lab, Dx, etc.) support quick inline edits for single fields without opening the details pane. Example: tapping the dosage value on an Rx card shows a chip selector inline to change it. This is a shortcut — the details pane is always available for full editing.

Narrative items do not support inline editing — all edits go through the details pane.

### 4.3 Card Ordering

**Capture mode:** Strictly chronological. Items appear at the bottom when added (whether via OmniAdd, AI draft acceptance, or any other path). The list reflects encounter activity order.

**Process mode:** Organized by operational batch (see Section 6).

**Review mode:** Organized by clinical documentation section (see Section 7).

---

## 5. Details Pane

### 5.1 Overview

Every chart item has a details pane — a side drawer that opens from the right when the provider taps a card (in any view). The pane is the universal surface for full inspection, editing, and action.

### 5.2 Pane Contents

```
┌─ Details Pane ──────────────────────────────────┐
│                                                  │
│  [Category Badge]  Item Name            [Close]  │
│                                                  │
│  ── Details ──────────────────────────────────── │
│  (Category-specific fields, all editable)        │
│                                                  │
│  For Rx: Dosage, Route, Frequency, Sig,          │
│  Quantity, Refills, Duration, Pharmacy, DAW       │
│                                                  │
│  For HPI: Full text editor                       │
│                                                  │
│  For Lab: Collection method, Reference lab,      │
│  Priority, Fasting, Instructions                 │
│                                                  │
│  ── Actions ──────────────────────────────────── │
│  (All available actions for current state)        │
│                                                  │
│  [Associate Diagnosis]                           │
│  [Send to Pharmacy]                              │
│  [Remove from Chart]                             │
│                                                  │
│  ── Activity Log ─────────────────────────────── │
│  10:02a  Created by MA Sarah K.                  │
│  10:08a  AI enriched from ambient recording      │
│  10:12a  Reviewed by Dr. Anderson                │
│  10:15a  Dx associated: Acute bronchitis (J20.9) │
│  10:18a  E-prescribed to CVS Pharmacy            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5.3 Pane Behavior

- Opens from right side, overlaying or pushing content depending on viewport
- Same pane structure regardless of which view it's opened from (Capture, Process, or Review)
- Changes made in the pane are immediately reflected on the card and in all views
- Pane can be opened for AI drafts in the rail (pre-acceptance) for the edit flow
- On desktop: pane width ~350-400px; on tablet: side panel overlay

### 5.4 Activity Log

Chronological record of every action on the item:
- Created (by whom: MA, Provider, AI; from which surface: OmniAdd, AI suggestion, AI draft, protocol, order set)
- AI-generated / AI-enriched (with source: ambient recording)
- Reviewed / accepted
- Edited (by whom, what changed)
- Status changes (Dx associated, requisition sent, sample collected, etc.)
- Sent / submitted / prescribed
- Protocol reference (if item was added from a care protocol recommendation)

The activity log serves as the audit trail for compliance, AI transparency, and multi-user accountability.

#### Source Tracking (Forward-Compatibility)

Every chart item records its origin via a `source` field:

| Source Value | Meaning |
|-------------|---------|
| `manual` | Provider added via OmniAdd (no suggestion involved) |
| `aiSuggestion` | Provider accepted an AI suggestion (from OmniAdd suggestion layer, AI palette, or AI drawer) |
| `aiDraft` | Provider accepted an AI-generated narrative draft from the processing rail |
| `protocol` | Provider added from a care protocol recommendation |
| `orderSet` | Provider added as part of an order set (batch add) |
| `maHandoff` | Item was documented by MA during intake/rooming |

Optional references for traceability:
- `protocolRef`: links to the protocol recommendation that prompted this item (if applicable)
- `orderSetRef`: links to the order set this item was part of (if applicable)

These fields support future analytics (e.g., "what % of items come from AI suggestions?") and activity log display ("Added from Acute Bronchitis protocol").

---

## 6. Processing Rail (Capture Mode)

### 6.1 Purpose

Peripheral awareness surface during active charting. Shows what's happening alongside the provider's OmniAdd input: AI drafts waiting for review and processing status for orders. The provider glances right to see the state of things without context-switching.

### 6.2 Layout

Narrow column (~200px) to the right of the chart items list. Shows **batch-level summaries** that expand to show individual items on tap.

```
┌─ Processing Rail ──────────────────┐
│                                    │
│  AI Drafts                         │
│  3 ready for review           •••  │
│                                    │
│  Prescriptions                     │
│  1 ready to dispense          •••  │
│                                    │
│  Labs (In-House)                   │
│  🔵 2 items · 1 needs Dx     •••  │
│    ┌────────────────────────────┐  │
│    │ COVID-19 Antigen           │  │
│    │ ⚠ needs Dx           •••  │  │
│    ├────────────────────────────┤  │
│    │ Influenza A/B              │  │
│    │ 🔵 sample collected   •••  │  │
│    └────────────────────────────┘  │
│                                    │
│  Labs (Quest)                      │
│  —                                 │
│                                    │
│  Imaging                           │
│  —                                 │
│                                    │
│  Referrals                         │
│  —                                 │
│                                    │
└────────────────────────────────────┘
```

### 6.3 Batch Summary Rows

Each batch type shows:
- Batch label (AI Drafts, Prescriptions, Labs (In-House), Labs (Quest), Imaging, Referrals)
- Aggregate status: count + most urgent status indicator (colored dot/icon + text)
- Kebab menu for batch-level or item-level quick actions
- Tap to expand/collapse individual items within the batch

Empty batches show "—" and take minimal vertical space.

**Future: Protocol progress indicator.** When a care protocol is active, a compact summary row appears at the top of the rail: "Protocol: 4/7 ✓". This gives peripheral awareness of protocol completion during charting without overloading the rail with protocol detail. Items added from the protocol appear in standard processing batches (they're regular chart items). See MULTI-SURFACE-COORDINATION.md §5 for the care protocol system.

### 6.4 Quick Actions from Rail

**Simple actions** happen via inline popover from kebab menu:
- Dx association: small picker showing encounter diagnoses, one tap to associate
- Dismiss AI draft: removes from rail

**Complex actions** route to the details pane or Process view:
- Full item editing → details pane
- Batch send/submit → Process view
- Multi-step workflows → Process view

### 6.5 Notifications

When a new AI draft appears or processing state changes:
- Batch summary row updates count/status text
- Brief highlight pulse on the affected row (~1 second)
- No toasts, sounds, or badges outside the rail
- Rail header may show total "needs attention" count as persistent badge

### 6.6 Responsive Behavior

| Viewport | Rail Behavior |
|----------|--------------|
| Desktop (>1200px) | Persistent, right side |
| Tablet landscape | Persistent, narrower |
| Tablet portrait | Collapsible drawer/overlay, toggled by button |

---

## 7. Process View

### 7.1 Purpose

Full-canvas workspace for completing outstanding work. The provider switches here when they're done capturing and need to process orders, review remaining AI drafts, and sign off.

### 7.2 Organization: Hybrid Batch-by-Type with Status

Items grouped by operational batch type (how they get executed in the clinic), with status shown within each batch. This reflects how clinic staff actually work: one Quest requisition for all Quest labs, all in-house dispensing done together, etc.

```
┌─ Process View ──────────────────────────────────────────────────────┐
│                                                                      │
│ ┌─ AI Drafts ──────────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  Updated HPI                              [Accept] [Edit] [✕]    │ │
│ │  "42yo female presents with cough x 5 days, non-productive,      │ │
│ │   worse at night and lying down. Denies fever, chills, SOB..."   │ │
│ │                                                                   │ │
│ │  PE Draft                                 [Accept] [Edit] [✕]    │ │
│ │  "Lungs: mild wheezing bilaterally, no rales or consolidation.   │ │
│ │   Good air movement. HEENT: mild nasal mucosal edema..."         │ │
│ │                                                                   │ │
│ │  Patient Instructions                     [Accept] [Edit] [✕]    │ │
│ │  "Bronchitis home care: rest, fluids, humidifier..."             │ │
│ │                                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─ Prescriptions ──────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  Dispense In-House (1)                                           │ │
│ │  ┌────────────────────────────────────────────────────────────┐  │ │
│ │  │ Benzonatate 100mg PO TID PRN                               │  │ │
│ │  │ ✓ Dx associated · ✓ Details complete         [Dispense]    │  │ │
│ │  └────────────────────────────────────────────────────────────┘  │ │
│ │                                                                   │ │
│ │  Send to Pharmacy (0)                                            │ │
│ │  No external prescriptions                                       │ │
│ │                                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─ Labs ───────────────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  In-House (2)                                                    │ │
│ │  ┌────────────────────────────────────────────────────────────┐  │ │
│ │  │ Rapid COVID-19 Antigen         ⚠ needs Dx                  │  │ │
│ │  │ Rapid Influenza A/B            ⚠ needs Dx                  │  │ │
│ │  │                                                             │  │ │
│ │  │ [Associate All → Acute bronchitis (J20.9)]                  │  │ │
│ │  │ [Collect Samples]                                           │  │ │
│ │  └────────────────────────────────────────────────────────────┘  │ │
│ │                                                                   │ │
│ │  Quest Diagnostics (0)                                           │ │
│ │  No send-out labs                                                │ │
│ │                                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─ Imaging ────────────────────────────────────────────────────────┐ │
│ │  (No imaging orders)                                              │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─ Referrals ──────────────────────────────────────────────────────┐ │
│ │  (No referrals)                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─ Sign Off ───────────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  Encounter Completeness                                          │ │
│ │  ✓ CC documented          ✓ Assessment complete                  │ │
│ │  ✓ HPI documented         ✓ Plan documented                     │ │
│ │  ⚠ ROS pending review     ✓ Orders processed                    │ │
│ │  ✓ PE documented          ✓ Instructions sent                   │ │
│ │                                                                   │ │
│ │  Charge Capture: E&M Level 99213 (suggested)                     │ │
│ │                                                                   │ │
│ │  [Sign & Close Encounter]                                        │ │
│ │                                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.3 Batch Actions

Batch actions appear when multiple items in a batch share a pending action:
- "Associate All → [suggested Dx]" — AI suggests the most likely diagnosis for the batch
- "Collect Samples" — mark all in-house labs as collected
- "Dispense All" / "Send All" — process all ready items in a batch
- Single confirmation tap per batch action

### 7.4 Adding Items from Process View

Two affordances:
- **Inline "+"** per batch section: opens OmniAdd scoped to that category (e.g., "+" in Labs section opens OmniAdd at Lab category)
- **Minified OmniAdd**: floating action button or compact bar that expands to full OmniAdd for cross-category adding

### 7.5 Sign-Off Section

Lives at the bottom of Process view as the final step. Shows:
- Encounter completeness checklist (required sections documented/reviewed)
- Outstanding items (items still needing attention flagged)
- Charge capture: suggested E&M level based on documentation
- "Sign & Close Encounter" action (blocked if critical items are incomplete)

**Future: Protocol adherence indicator.** When a care protocol is active, the sign-off section shows an informational metric: "Protocol adherence: 10/12 items addressed (2 conditional items declined)". This is not blocking — it's quality awareness. Deviations are tracked in the activity log. See MULTI-SURFACE-COORDINATION.md §5 and ROADMAP.md §6 (deferred question P6: deviation tracking).

---

## 8. Review View

### 8.1 Section Mapping

Chart items automatically organized into clinical documentation sections:

| Review Section | Source Categories | Notes |
|---------------|-------------------|-------|
| Chief Complaint / HPI | chief-complaint, hpi | Combined narrative |
| Review of Systems | ros | System-by-system display |
| Physical Examination | physical-exam, vitals | Exam findings + vital signs |
| Assessment | diagnosis | Problem list with ICD-10 codes |
| Plan | plan, medication, lab, imaging, procedure, referral, instruction | Grouped by order type |
| Allergies | allergy | Confirmed/updated list |
| Notes | note | Provider notes, addenda |

### 8.2 Section Behavior

- Each section shows a completeness indicator (✓ documented, ⚠ incomplete, ○ not documented)
- "Edit" on a section opens the details pane for the relevant item
- "Add" on empty sections opens OmniAdd scoped to that category
- Only the latest version of each item is shown (e.g., AI-enriched HPI replaces MA original; full history in activity log)

### 8.3 Adding Items from Review View

Same two affordances as Process view:
- **Inline "+"** per section
- **Minified OmniAdd** for cross-category adding

---

## 9. Encounter Lifecycle

### 9.1 Pre-Provider (MA Phase)

MA documents during rooming:
- Vitals (from devices + manual entry)
- Chief complaint (from patient intake)
- Basic HPI (onset, duration, what they've tried)
- Allergy confirmation/update
- Medication reconciliation

These items are in the chart items list when the provider opens the encounter.

### 9.2 Provider Opens Encounter

Provider sees:
- Chart items list pre-populated with MA content (some items may show unreviewed indicator)
- OmniAdd ready at bottom
- Rail showing batch category headers with "—" (no active processing yet)
- No AI activity (ambient recording hasn't started)

### 9.3 Provider Starts Encounter (Explicit Action)

Provider taps "Start" on ambient recording minibar (or equivalent action). This triggers:
- Ambient recording begins
- Encounter status updates (e.g., "Clinician Started")
- AI processing activates — begins listening for content to generate drafts
- Rail transitions from passive to active ("Listening...")

### 9.4 Active Encounter

Provider charts via OmniAdd while AI drafts trickle into the rail:
- First 30-60s: AI may refine CC based on conversation
- 2-5 min: HPI draft appears (enriching MA's version if applicable)
- During exam: PE draft appears from verbal narration
- As orders are placed: Plan and Instructions drafts appear
- Processing entries accumulate as structured items are added

Provider interleaves OmniAdd input with AI draft review as they see fit.

### 9.5 Wrap-Up

Provider switches to Process view to:
- Review/accept remaining AI drafts
- Complete batch actions (associate Dx, send Rx, submit labs)
- Handle any outstanding items
- Review sign-off checklist
- Sign and close encounter

---

## 10. Cross-Cutting Concerns

### 10.1 Responsive Layout

| Viewport | Chart Items | Rail | Details Pane | OmniAdd |
|----------|-------------|------|-------------|---------|
| Desktop (>1200px) | Main area minus rail | Persistent right, ~200px | Side drawer, ~350-400px | Full width below items |
| Tablet landscape | Main area minus rail | Persistent right, narrower | Side panel overlay | Full width below items |
| Tablet portrait | Full width | Collapsible drawer | Side panel overlay | Full width below items |

### 10.2 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` or `Cmd+K` | Focus OmniAdd |
| `M` | Medication category (when OmniAdd focused + empty) |
| `L` | Lab category |
| `D` | Diagnosis category |
| `I` | Imaging category |
| `P` | Procedure category |
| `Escape` | Back one level / close pane |
| `Enter` | Select / Add item / Accept suggestion |
| `Tab` / `Shift+Tab` | Navigate detail fields |
| `Cmd+Z` | Undo last add |
| `↑` / `↓` | Navigate suggestions / search results |

### 10.3 Safety Checks

- **Allergy alerts:** Inline warning when Rx conflicts with patient allergies (not blocking modal — override with acknowledgment)
- **Drug interaction:** Informational alert during Rx add, severity-coded
- **Duplicate detection:** Warn when adding item matching existing chart item
- **Dosage range:** Flag if outside typical range
- All safety alerts recorded in activity log when acknowledged

### 10.4 Ambient Recording Integration

Minibar at bottom shows active recording status. Connection points:
- Recording transcript feeds AI draft generation
- Recording transcript feeds AI suggestion engine for OmniAdd
- Provider start action activates recording + AI processing
- Recording is independent of charting — always running once started

---

## 11. Related Architecture Documents

This spec defines the quick charting system in isolation. The following documents extend the architecture:

| Document | Scope |
|----------|-------|
| **MULTI-SURFACE-COORDINATION.md** | How OmniAdd, AI module, processing rail, and care protocols share chart state; unified suggestion engine; order set architecture; care protocol system |
| **ROADMAP.md** | Strategic phased plan covering quick charting (Phases 1-7) through to care protocols, reference pane, and advanced AI integration; deferred design questions |
| **CONTEXT.md** | All confirmed design decisions (40 decisions, including multi-surface coordination) |
| **CATEGORY-MAP.md** | All 15 chart item categories with interaction variants, fields, processing states, AI patterns |
| **PHASED-PLAN.md** | Implementation sequencing for Phases 1-7 (Claude Code) |
| **PROMPTS.md** | Self-contained Claude Code prompts per phase |

### Prototype Architecture Documents (in prototype repo)

| Document | Scope |
|----------|-------|
| **COORDINATION_STATE_MACHINE.md** | Bottom bar ↔ left pane UI coordination (15 valid states, tier transitions) |
| **AI_CONTROL_SURFACE_V2.md** | AI minibar/palette: nudges, suggestions, context targeting, activity escalation |
| **AI_DRAWER.md** | AI drawer: conversation model, suggestion rendering, activity log modal, future vision |
| **TRANSCRIPTION_MODULE.md** | Transcription recording lifecycle, session management |
| **LEFT_PANE_SYSTEM.md** | Left pane container, view switching |
