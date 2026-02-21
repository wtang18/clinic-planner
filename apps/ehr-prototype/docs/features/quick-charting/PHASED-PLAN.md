# Quick Charting — Phased Implementation Plan

## Overview

7 phases, ordered by foundational dependency and impact. Each phase is scoped for a focused Claude Code session (2-6 hours). Phases 1-4 are the core architecture. Phases 5-7 extend coverage and complete the system.

**Forward-compatibility:** The chart item data model includes `source`, `protocolRef`, and `orderSetRef` fields from Phase 1 onward, supporting future integration with care protocols, order sets, and the unified suggestion engine (see ROADMAP.md for extended phases). These fields are optional/unused in early phases but must exist in the type definition.

---

## Phase 1: OmniAdd Omni-Input + Detail Area Architecture

**Goal:** Build the OmniAdd module with the unified omni-input (navigator) + detail area (workspace) architecture. Foundational interaction model for all charting input.

**Scope:**
- Omni-input component: single-line text field with inline pills, placeholder "Add to chart...", focus via `/` or `Cmd+K`
- Pill behavior: pills as characters (single backspace deletes), tap preceding pill truncates, Cmd+A + Delete clears all
- Detail area component: contextual workspace adapting to input state (tree depth)
- Depth 1 (root): category suggestion pills + encounter-contextual suggestion cards with [Add][Edit]
- Depth 1b (typed text): ranked result cards across categories, arrow key navigation, Enter accepts
- Depth 2 (category committed): item suggestion pills + item suggestion cards within category
- Depth 3 (item committed): field-row structure (unselected) + single suggestion card — handled by Phase 2 forms
- Input recognition service: category prefix detection, item name matching, auto-categorization for unambiguous terms
- Narrative categories: focus moves to text area in detail area on category commit
- Vitals: data entry grid in detail area
- Batch mode: stay-in-category after add
- Undo: Cmd+Z / undo toast
- Mock item catalog with suggestion configurations for cough visit

**Does NOT include:** Detailed field forms (Phase 2), processing rail, AI drafts, details pane.

**Exit criteria:**
- Omni-input with pill insertion/deletion works via touch and keyboard
- Detail area adapts correctly at each tree depth
- [Add] on suggestion card adds item directly to chart (fastest path)
- Search/filter via typed text shows ranked results across categories
- Auto-categorization works for unambiguous terms, grouped results for ambiguous
- Narrative and vitals category variants functional
- Batch mode, undo, Escape behavior all functional

---

## Phase 2: Detail Forms for Exemplar Categories (Rx, Lab, Dx)

**Goal:** Build category-specific field-row configuration and suggestion card generation for the three highest-priority structured categories. Establishes the depth 3 detail area pattern.

**Scope:**
- Shared form components: ChipSelect (pill options), FieldRow (label + pills/input), SuggestionCard (summary + Add/Edit)
- Medication form: dosage, route, frequency, sig (auto), quantity (auto), refills, duration, pharmacy, DAW
- Lab form: collection method, reference lab, priority, fasting, instructions
- Diagnosis form: ICD-10 display, specificity, designation, onset, clinical status
- Suggestion card generation per item from default prescribing/ordering patterns
- Edit flow: pre-selects card values across field rows, Clear restores suggestion card
- Expanded mock data (10+ items per category)
- Card display updates for richer summaries

**Exit criteria:**
- Depth 3 shows field rows (unselected) + suggestion card for Rx/Lab/Dx items
- [Add] on suggestion card adds item with defaults (no field interaction needed)
- [Edit] pre-selects values, [Clear] restores, [Add] commits configuration
- Smart defaults mean most items need 0-2 field adjustments
- Both touch and keyboard work through all forms

---

## Phase 3: Details Pane + Activity Log

**Goal:** Build the universal details pane (side drawer) that every chart item opens. This is the primary editing surface and the home for the activity log.

**Scope:**
- Details pane component: opens from right on tap of any card
- Pane structure: details section (category-specific fields, editable) + actions section (context-sensitive) + activity log section
- Activity log data model: timestamped entries per item (created, edited, status changes, AI actions)
- Auto-generate activity log entries when items are created via OmniAdd
- Quick inline edit on structured item cards (tap a field chip to change it without opening pane)
- Pane works from any view (Capture, Process, Review — but only Capture exists so far)
- Responsive: ~350-400px on desktop, side panel overlay on tablet

**Key architectural decisions:**
- Activity log is append-only per item
- Pane reads/writes to the same state as cards (single source of truth)
- Opening pane for an unreviewed MA item clears the unreviewed indicator

**Exit criteria:**
- Tap any chart item card → details pane opens with full fields, actions, activity log
- Edit a field in the pane → card updates immediately
- Quick inline edit on Rx card (tap dosage chip) → changes without opening pane
- Activity log shows creation entry for all items
- Pane close via Escape, close button, or tapping outside

---

## Phase 4: Processing Rail + AI Draft Infrastructure

**Goal:** Add the processing rail in Capture mode and the AI draft system (mock). These are intertwined because the rail hosts both processing status and AI drafts.

**Scope:**

**Processing Rail:**
- Narrow column (~200px) right of chart items list, collapsible
- Batch summary rows: AI Drafts, Prescriptions, Labs (In-House), Labs (Send-Out by vendor), Imaging, Referrals
- Each batch shows aggregate status (count + most urgent indicator + colored dot/icon + text)
- Tap to expand batch → show individual items
- Kebab menu per item with contextual quick actions
- Simple actions via inline popover (Dx association picker)
- Complex actions → open details pane
- Notification model: count updates + brief highlight pulse on change
- Responsive: persistent desktop/tablet landscape, drawer on portrait

**AI Draft System:**
- Mock draft generation: rules-based, triggered by encounter stage (CC draft at start, HPI after a delay, etc.)
- Draft cards in the "AI Drafts" batch in rail
- Accept action: one-tap promotes draft to chart items list at bottom (chronological)
- Edit action: opens details pane with draft content editable, confirm promotes to list
- Dismiss action: removes from rail
- AI enrichment of MA content: "Updated HPI" label, acceptance replaces original, original preserved in activity log
- Draft content from mock templates (realistic length/content per category — see CATEGORY-MAP)

**Processing state auto-creation:**
- Adding Rx via OmniAdd → creates processing entry (Dx association → pharmacy → send)
- Adding Lab → creates processing entry (Dx association → collection → requisition → sample → results)
- Adding Imaging, Referral, etc. → appropriate processing entries
- Processing state tracked per item, reflected on card (inline status dot) and in rail

**Exit criteria:**
- Rail visible alongside chart items with batch summaries
- Expanding a batch shows individual items with status
- Adding Rx/Lab creates processing entries in correct batches
- Dx association via inline popover from rail kebab works
- AI draft appears in rail after mock delay
- One-tap accept moves draft to chart list at bottom
- Edit opens details pane with draft content
- Accepted AI draft replaces MA original (if applicable) with activity log preserved
- Inline status dots on cards reflect processing state
- Rail collapses on tablet portrait

---

## Phase 5: Process View + Sign-Off

**Goal:** Build the Process view as a full encounter facet — the workspace for completing outstanding work and signing off.

**Scope:**
- Process view accessed via view switcher (same data, different lens)
- Operational batch sections: AI Drafts, Prescriptions (In-House / External by pharmacy), Labs (In-House / Send-Out by vendor), Imaging, Referrals
- Full item cards within each batch showing step-by-step progress
- Batch actions: "Associate All → [Dx]", "Collect Samples", "Send All Rx", "Submit All Labs"
- Inline "+" per batch section (opens OmniAdd scoped to that category)
- Minified OmniAdd (FAB or compact bar) for cross-category adding
- Sign-off section at bottom: completeness checklist, charge capture indicator (mock E&M level), "Sign & Close"
- Items tappable to open details pane (same pane as Capture mode)

**Exit criteria:**
- Switch to Process view shows same items organized by operational batch
- Batch actions work (associate all, send all, etc.)
- Adding items from Process view works (inline "+" and minified OmniAdd)
- Sign-off section shows completeness status
- Mock E&M level calculation based on documented sections
- Details pane opens from Process view cards

---

## Phase 6: Remaining Category Forms + Narrative Polish

**Goal:** Build detail forms/pane content for all remaining categories. Polish narrative editing in the details pane.

**Scope:**
- Structured search forms: Imaging, Procedure, Allergy, Referral, Instruction
- Narrative pane editors: CC (text + duration/severity), HPI (text + element structure), Plan (problem-based template), Note (text + type selector)
- Structured narrative editors: ROS (system-toggle grid in pane), PE (system-section view in pane)
- Vitals polish: trends, pain scale, recheck option
- Template/snippet library for narrative categories
- Mock data for all categories
- All 15 categories fully functional in OmniAdd, details pane, and card display

**Exit criteria:**
- All 15 categories have functional OmniAdd flows
- All 15 categories have complete details pane content
- ROS edit in pane shows system-toggle grid
- PE edit in pane shows system-section view
- Template library works for narrative categories
- All categories produce properly formatted cards

---

## Phase 7: Review View + Safety Checks + Encounter Lifecycle

**Goal:** Build the Review view, add safety checks, and implement the full encounter lifecycle (MA handoff → provider start → active encounter → wrap-up).

**Scope:**

**Review View:**
- Clinical section organization: CC/HPI, ROS, PE/Vitals, Assessment, Plan, Allergies, Notes
- Auto-map chart items to sections by category
- Completeness indicators per section
- "Edit" → opens details pane; "Add" → opens scoped OmniAdd
- Inline "+" per section + minified OmniAdd
- Only latest version shown (AI-enriched replaces MA original); full history in activity log

**Safety Checks:**
- Allergy-medication cross-reference (inline warning, dismissible, logged)
- Drug-drug interaction alerts (severity-coded)
- Duplicate detection
- Dosage range validation
- All safety events recorded in activity log

**Encounter Lifecycle:**
- Initial state: chart items pre-populated with MA content (vitals, CC, basic HPI, allergies, med reconciliation)
- Unreviewed indicator on MA items (clears on pane open)
- Explicit provider start action (recording start) → triggers AI processing
- Progressive activation: rail shows "Listening..." after start, drafts trickle in as encounter progresses
- Empty batches show "—" in rail; complexity scales with encounter

**Exit criteria:**
- Review mode shows items in clinical documentation sections
- Empty sections show "Not documented" with Add action
- Safety alerts fire during Rx add and display on cards
- Encounter opens with MA-populated content
- Provider start triggers AI draft generation
- AI drafts appear progressively in rail
- Full encounter lifecycle playable: open → review MA content → start → chart → process → review → sign off

---

## Phase Dependency Map

```
Phase 1 (State Machine)
  │
  ├──→ Phase 2 (Exemplar Forms)
  │      │
  │      ├──→ Phase 3 (Details Pane + Activity Log)
  │      │      │
  │      │      ├──→ Phase 4 (Rail + AI Drafts)
  │      │      │      │
  │      │      │      ├──→ Phase 5 (Process View + Sign-Off)
  │      │      │      │
  │      │      │      └──→ Phase 7 (Review + Safety + Lifecycle)
  │      │      │
  │      │      └──→ Phase 6 (All Categories)
  │      │             │
  │      │             └──→ Phase 7
  │      │
  │      └──→ Phase 6 (can start after Phase 2 for non-pane work)
  │
  └──→ Phase 6 (narrative OmniAdd flows don't need Phase 2)
```

Phase 6 and 7 can partially overlap. Phase 5 and 7 are independent of Phase 6 (they work with whatever categories exist). Cleanest execution is sequential.
