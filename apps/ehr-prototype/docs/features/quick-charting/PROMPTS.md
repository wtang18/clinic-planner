# Quick Charting — Claude Code Execution Prompts

## How to Use

Execute one phase at a time in Claude Code. Each prompt is self-contained with context, scope, and acceptance criteria. Between phases: commit, review, update docs, confirm alignment.

---

## Shared Context Block

Include with every prompt.

```
PROJECT CONTEXT:
React/TypeScript EHR prototype. Mock data, no real backend. Architecture should reflect real clinical workflows.

KEY CONCEPTS:
- Three view facets (Capture, Process, Review) show the same chart items through different lenses
- OmniAdd: persistent inline input at bottom of Capture view for active charting
- Processing Rail: narrow column in Capture showing batch summaries of AI drafts + order processing status
- Details Pane: universal side drawer (opens from right) for any chart item — full fields, all actions, activity log
- AI Drafts: narrative content (HPI, PE, Plan, Instructions) primarily AI-generated from ambient recording, appearing in rail for provider review
- MA Handoff: encounters pre-populated with MA-documented content before provider starts
- Interaction hierarchy: surface (quick actions on card/rail) → pane (detailed editing) → view (batch operations in Process)

FORWARD-COMPATIBLE DATA MODEL:
Every chart item must include these fields from the start (some unused in early phases):
- source: 'manual' | 'aiSuggestion' | 'aiDraft' | 'protocol' | 'orderSet' | 'maHandoff'
- protocolRef?: string (optional — links to protocol recommendation that prompted this item)
- orderSetRef?: string (optional — links to order set this item was part of)
These support future multi-surface coordination (care protocols, order sets, unified suggestion engine). For Phases 1-7, most items will use 'manual' or 'maHandoff'. AI-related sources used starting Phase 4.

ARCHITECTURE:
- src/components/omni-add/ — OmniAdd module (state machine, category selector, search, forms)
- src/components/chart-items/ — Chart item cards
- src/components/processing-rail/ — Rail components
- src/components/details-pane/ — Details pane
- src/components/process-view/ — Process view
- src/components/review/ — Review view
- src/screens/CaptureView/ — Capture view orchestration
- src/types/chart-items.ts — 15 categories, types
- src/types/processing.ts — Processing states
- src/state/ — State management
- src/services/ — Suggestion engine, safety checks, review mapper
- src/data/ — Mock data files

DESIGN SPECS (in /docs/features/quick-charting/):
- CONTEXT.md — Design decisions (40 confirmed decisions, including multi-surface coordination)
- DESIGN-SPEC.md — Full specification
- CATEGORY-MAP.md — All 15 categories at spec level
- PHASED-PLAN.md — 7-phase implementation plan
- MULTI-SURFACE-COORDINATION.md — Cross-surface state model, care protocols, order sets (reference only — not implemented in Phases 1-7)
- ROADMAP.md — Strategic roadmap and deferred questions (reference only)

15 CATEGORIES: chief-complaint, hpi, ros, physical-exam, vitals, medication, allergy, lab, imaging, procedure, diagnosis, plan, instruction, note, referral

INTERACTION PRINCIPLES:
- Touch-first AND keyboard-first equally
- Speed over structure in Capture; structure in Review
- AI suggestions = fastest path (one-action accept)
- Details pane = universal editing surface
- Progressive disclosure at every level
```

---

## Phase 1: OmniAdd State Machine Refactor + Dual Input Paradigm

```
PHASE 1: OMNIADD STATE MACHINE REFACTOR

[Include shared context block]

GOAL: Replace the current linear 3-step OmniAdd with a tree-based state machine supporting both touch and keyboard. Architectural foundation for all subsequent phases.

WHAT TO BUILD:

1. STATE MACHINE (src/components/omni-add/OmniAddStateMachine.ts)
States: ROOT, CATEGORY_SELECTED, QUICK_PICK, SEARCH, DETAIL, TEXT_INPUT, DATA_ENTRY, ADDING
Transitions by category variant:
- Structured (medication, lab, imaging, procedure, diagnosis, allergy, referral): ROOT → CATEGORY → QUICK_PICK/SEARCH → DETAIL → ADD → ROOT
- Narrative (chief-complaint, hpi, ros, physical-exam, plan, instruction, note): ROOT → CATEGORY → TEXT_INPUT → ADD → ROOT
- Data entry (vitals): ROOT → CATEGORY → DATA_ENTRY → ADD → ROOT
Back navigation at every level. Track breadcrumb path.
Batch mode: after ADD, return to CATEGORY (not ROOT). "Done with [Category]" exits batch.

CHART ITEM TYPE (src/types/chart-items.ts):
When defining/extending the ChartItem type, include these fields (see shared context "FORWARD-COMPATIBLE DATA MODEL"):
- source: 'manual' | 'aiSuggestion' | 'aiDraft' | 'protocol' | 'orderSet' | 'maHandoff'
  Set to 'manual' for all OmniAdd-created items in this phase.
- protocolRef?: string (optional, unused)
- orderSetRef?: string (optional, unused)
- activityLog: ActivityLogEntry[] (empty array for now — populated starting Phase 3)
This ensures the data model is stable from Phase 1 onward.

2. BREADCRUMB NAVIGATION
Display: `+ Rx > Benzonatate`
CRITICAL: Tapping a breadcrumb level returns to that level's SELECTION state — to choose a different option. Tapping "Benzonatate" returns to Rx quick-picks (not Benzonatate's details). Tapping "Rx" returns to root. Tapping "+" returns to root.
Back button / Escape moves back one level.

3. CATEGORY SELECTOR (modify CategorySelector.tsx)
Primary row: Rx (M), Lab (L), Dx (D), Imaging (I), Proc (P)
Secondary behind "More": CC, HPI, ROS, PE, Vitals, Allergy, Plan, Instruction, Note, Referral
Each category knows its interaction variant.

4. DUAL INPUT MODE
ROOT state:
- Touch: category pills visible
- Keyboard: text input "Add item... (/ for categories)". Typing searches all categories. Prefixes: rx:, lab:, dx:, etc. Single-key shortcuts M/L/D/I/P when empty.
CATEGORY state:
- Touch: quick-pick chips + "Other" (search)
- Keyboard: scoped search + quick-picks visible

5. QUICK-PICK CHIPS (src/components/omni-add/QuickPickChips.tsx)
Horizontal scrollable chips. Last chip = "Other" (opens search).
Hardcoded mock data per category for cough visit:
- Rx: Benzonatate, Dextromethorphan, Guaifenesin, Codeine
- Lab: Rapid COVID-19, Rapid Flu A/B, Strep, CBC
- Dx: Acute bronchitis, URI, Cough unspecified, Pneumonia
- Imaging: Chest X-ray, Chest CT
- Procedure: Rapid Strep Test, Nebulizer Treatment

6. NARRATIVE INPUT (src/components/omni-add/NarrativeInput.tsx)
Text area with category-specific placeholder. Expandable. "Add" button.
Note: narrative categories are primarily AI-drafted (Phase 4), but OmniAdd is the manual/secondary path. Keep this simple for now.

7. VITALS INPUT (src/components/omni-add/VitalsInput.tsx)
Grid: BP (sys/dia), HR, Temp, RR, SpO2, Weight, Height, BMI (auto-calc), Pain (0-10).
Number inputs with units. Out-of-range highlighting. "Add" when any field has value.

8. BATCH MODE
After adding: return to CATEGORY level (not ROOT).
"Done with [Category]" chip/button to exit.
Keyboard: Enter = add + stay; Escape = back to ROOT.

9. UNDO
Cmd/Ctrl+Z removes last-added item. Touch: toast with "Undo" for 5 seconds.

ACCEPTANCE CRITERIA:
- [ ] Full tree navigation via touch: tap Rx → quick-picks → Benzonatate → detail form → add → stays at Rx
- [ ] Full tree navigation via keyboard: type "rx:" → arrow to item → Enter → tab fields → Enter to add
- [ ] Single-key shortcuts (M/L/D/I/P) work when input focused and empty
- [ ] "More" reveals secondary categories
- [ ] Narrative category (e.g., HPI) shows text input
- [ ] Vitals shows numeric grid with BMI auto-calc
- [ ] Breadcrumbs show position; tapping breadcrumb level returns to selection state for that level
- [ ] Escape navigates back one level
- [ ] Batch mode works (stays at category after add)
- [ ] Undo works (keyboard + touch toast)
```

---

## Phase 2: Detail Forms for Exemplar Categories (Rx, Lab, Dx)

```
PHASE 2: DETAIL FORMS FOR RX, LAB, DX

[Include shared context block]

GOAL: Build category-specific detail forms for Medication, Lab, Diagnosis. These establish the pattern for all structured search categories.

PREREQUISITES: Phase 1 complete.

WHAT TO BUILD:

1. SHARED FORM COMPONENTS (src/components/omni-add/forms/shared/)

ChipSelect.tsx:
- Horizontal chips, single-select (multi option). "Other" chip reveals text input.
- Keyboard: arrows to navigate, Enter to select. Touch: tap to select.

FieldRow.tsx:
- Label left, input/chips right. Supports ChipSelect, text, number, toggle, search/select.
- Required field indicator (subtle). Expandable: tap to show chips, collapsed shows current value.

2. MEDICATION FORM (src/components/omni-add/forms/MedicationForm.tsx)
Fields in order: Dosage (ChipSelect), Route (ChipSelect), Frequency (ChipSelect), Instructions/Sig (auto-generated text), Quantity (number, auto-calc from frequency×duration), Refills (number), Duration (ChipSelect), Pharmacy (search/select), DAW (toggle).
Smart defaults: ALL fields pre-populated on drug selection. Sig auto-generates. Quantity auto-calculates.
Mock data (src/data/mock-medications.ts): Benzonatate, Dextromethorphan, Amoxicillin, Metformin, Lisinopril + 10 more common primary care meds with default prescribing patterns.

3. LAB FORM (src/components/omni-add/forms/LabForm.tsx)
Fields: Collection method (In-House/Send Out), Reference lab (if Send Out), Priority, Fasting (toggle), Special instructions.
Mock data (src/data/mock-labs.ts): Rapid COVID, Flu A/B, Strep, CBC, CMP, Lipid Panel, A1C, TSH, UA + 10 more.

4. DIAGNOSIS FORM (src/components/omni-add/forms/DiagnosisForm.tsx)
Fields: ICD-10 code (read-only), Specificity (if children exist), Designation (Primary/Secondary, first defaults Primary), Onset, Clinical status, Associated orders (read-only auto-linked).
Mock data (src/data/mock-diagnoses.ts): Acute bronchitis (J20.9) with children, URI (J06.9), Cough (R05.9) with children, Essential HTN (I10), Type 2 DM (E11.9) with children + 15 more.

5. CARD DISPLAY UPDATES
Richer card summaries: Rx shows drug+dosage+route+frequency. Lab shows name+collection+status. Dx shows name+ICD+designation.
Card shows "Last edited by [name] · [time]" (placeholder data for now — activity log comes in Phase 3).

ACCEPTANCE CRITERIA:
- [ ] Benzonatate → full form with all fields pre-populated → modify dosage via chips → add → formatted card
- [ ] Sig auto-generates, quantity auto-calculates
- [ ] Lab form hides reference lab when "In-House" selected
- [ ] Dx form shows specificity prompt, first Dx defaults to Primary
- [ ] ChipSelect and FieldRow reusable across all three forms
- [ ] Keyboard: Tab between fields, arrow keys for chips
- [ ] Touch: tap to expand field, tap chip to select
```

---

## Phase 3: Details Pane + Activity Log

```
PHASE 3: DETAILS PANE + ACTIVITY LOG

[Include shared context block]

GOAL: Build the universal details pane — the primary editing surface for every chart item. This is the single consistent pattern for inspecting, editing, and taking action on any item.

PREREQUISITES: Phases 1-2 complete.

WHAT TO BUILD:

1. DETAILS PANE COMPONENT (src/components/details-pane/DetailsPane.tsx)
Side drawer opening from right. Three sections:
- Details: category-specific fields, all editable (reuse form components from Phase 2)
- Actions: context-sensitive action buttons based on item's current state and category
- Activity Log: chronological list of all events for this item

Width: ~350-400px on desktop, side panel overlay on tablet.
Close: Escape key, close button, tap outside.

2. PANE CONTENT BY CATEGORY
For Rx/Lab/Dx: same fields as OmniAdd forms, all editable in pane.
For narrative categories: full text editor (simple textarea for now — structured editors come Phase 6).
For vitals: numeric field grid.
For other structured categories: placeholder fields (full forms come Phase 6).

3. ACTIONS SECTION
Actions vary by category and processing state. Examples:
- Rx: Associate Diagnosis, Select Pharmacy, Send/Dispense, Remove
- Lab: Associate Diagnosis, Send Requisition, Mark Sample Collected, Enter Results, Remove
- Dx: Change Specificity, Associate Orders, Set Primary/Secondary, Remove
- Any item: Remove from Chart
Actions are buttons. Executing an action updates state and appends to activity log.

4. ACTIVITY LOG (src/types/activity-log.ts, integrated into chart item state)
Data model per entry:
- timestamp: Date
- action: string (e.g., "created", "edited", "dx_associated", "ai_generated", "accepted", "sent", "protocol_added", "order_set_added")
- actor: string (e.g., "MA Sarah K.", "Dr. Anderson", "AI (ambient)")
- details: string (optional — e.g., "Changed dosage from 100mg to 200mg")

CHART ITEM SOURCE TRACKING (forward-compatible — see shared context):
The chart item data model must include from the start:
- source: 'manual' | 'aiSuggestion' | 'aiDraft' | 'protocol' | 'orderSet' | 'maHandoff'
  Default to 'manual' for OmniAdd adds, 'maHandoff' for pre-populated MA content.
  'aiSuggestion' and 'aiDraft' used starting Phase 4.
  'protocol' and 'orderSet' are future — include in the type but unused for now.
- protocolRef?: string (optional, unused in Phases 1-7)
- orderSetRef?: string (optional, unused in Phases 1-7)

The "created" activity log entry should reference the source: "Created via OmniAdd by Dr. Anderson" or "Documented by MA Sarah K. during intake".

Auto-generate "created" entry when items are added via OmniAdd.
Display: chronological list in pane, most recent at bottom.
Format: "10:02a  Created by MA Sarah K." / "10:15a  Dx associated: Acute bronchitis (J20.9)"

5. CARD → PANE INTERACTION
Tap any card → pane opens for that item.
"Last edited by" on card → opens pane scrolled to activity log.
Three-dot menu on card includes "Open details" (same as tap).

6. QUICK INLINE EDIT (structured items only)
Structured item cards (Rx, Lab, Dx, etc.) allow single-field quick edits on the card surface.
Example: tap the dosage value on an Rx card → ChipSelect appears inline to change it.
This is a SHORTCUT — the pane is always available for full editing.
Narrative items: NO inline editing. All edits go through pane.

7. UNREVIEWED INDICATOR
MA-documented items show a subtle unreviewed indicator (e.g., faint left border or small dot).
Opening the details pane for an unreviewed item clears the indicator.
Track "reviewed" state per item.

ACCEPTANCE CRITERIA:
- [ ] Tap any chart item card → details pane opens from right with correct fields, actions, activity log
- [ ] Edit a field in pane → card updates immediately (single source of truth)
- [ ] Activity log shows "Created by [actor]" for all items
- [ ] Execute an action (e.g., "Remove") → state updates, activity log records it
- [ ] Quick inline edit: tap dosage chip on Rx card → change without opening pane
- [ ] Narrative items: tap card → pane opens with text editor (no inline edit on card)
- [ ] Unreviewed indicator on MA items clears when pane opened
- [ ] Pane closes via Escape, close button, tap outside
- [ ] Pane works responsively (desktop width vs. tablet overlay)
```

---

## Phase 4: Processing Rail + AI Draft Infrastructure

```
PHASE 4: PROCESSING RAIL + AI DRAFTS

[Include shared context block]

GOAL: Add the processing rail in Capture mode and the AI draft system. The rail is the peripheral awareness surface showing both AI drafts and order processing status.

PREREQUISITES: Phases 1-3 complete.

WHAT TO BUILD:

1. PROCESSING STATE (src/types/processing.ts, src/state/processing.ts)
Per-category processing states (see CATEGORY-MAP.md):
- Rx: Dx association → pharmacy → send/dispense (+ optional prior auth)
- Lab: Dx association → collection method → requisition → sample → results
- Imaging: Dx association → indication → order → scheduling → results
- Procedure: Dx association → consent → perform → document findings
- Referral: Dx association → prior auth → send → scheduling → report → close loop
- Dx: specificity → order association
- Allergy: severity confirmation
- Instruction: send/print

Auto-create processing entries when items added via OmniAdd.
State actions update processing state + append to item's activity log.

2. OPERATIONAL BATCH MODEL (src/types/batches.ts)
Items grouped by how they get executed:
- AI Drafts (pending review)
- Prescriptions: In-House (dispense) / External (by pharmacy)
- Labs: In-House / Send-Out (by vendor: Quest, LabCorp, etc.)
- Imaging: In-House / External (by facility)
- Referrals

Batch has: type, sub-group label, items[], aggregate status (worst status across items), action availability.

FORWARD-COMPATIBLE NOTE: A future "Protocol Progress" batch summary row will appear when a care protocol is active (e.g., "Protocol: 4/7 ✓"). Include a batch type enum value for 'protocol_progress' but don't implement rendering — just reserve the slot.

3. PROCESSING RAIL (src/components/processing-rail/)

ProcessingRail.tsx:
- Narrow column (~200px) right of chart items, collapsible
- Shows batch summary rows (collapsed by default)
- Responsive: persistent desktop/landscape, drawer on portrait

BatchSummaryRow.tsx:
- Batch label + aggregate status (colored dot/icon + text + count)
- Tap to expand → show individual items
- Kebab menu per row
- Empty batches show "—" with minimal height

ProcessingItemRow.tsx:
- Item name + current status (dot + text)
- Kebab menu with contextual quick actions

4. RAIL QUICK ACTIONS
Simple actions via inline popover from kebab:
- Dx association: small popover showing encounter diagnoses as chips, one tap to associate
- Dismiss AI draft: removes from rail

Complex actions route to details pane:
- Kebab → "Open details" → details pane

5. RAIL NOTIFICATIONS
When batch status changes (new item, state transition, new AI draft):
- Batch summary row updates count/status
- Brief highlight pulse on affected row (~1 second)
- No toasts, sounds, or external badges

6. AI DRAFT SYSTEM (src/services/draft-engine.ts)

Mock draft engine:
- Rules-based generation triggered by encounter stage
- Uses timers to simulate progressive generation:
  - CC refinement: immediate if CC exists, else after 5 seconds
  - HPI: after 15-second delay (simulating 2-5 min of conversation)
  - ROS: after 30-second delay
  - PE: after 45-second delay
  - Plan: after 60-second delay (after some orders placed)
  - Instructions: after 75-second delay
- Drafts use realistic mock content (see CATEGORY-MAP for examples)

Draft data model:
- category, content (text), status (pending | accepted | dismissed), generatedAt, source ("ambient recording")
- If enriching MA content: label "Updated [category]", reference to original item

Draft cards in "AI Drafts" batch in rail:
- Preview: first 1-2 lines truncated
- Actions: [Accept] [Edit] [✕ Dismiss]
- Accept: one-tap → content promoted to chart items list at bottom → draft removed from rail → item source set to 'aiDraft' → activity log: "AI-generated from ambient, accepted by [provider]"
- Edit: opens details pane with full content editable → confirm → promotes to list → source: 'aiDraft'
- Dismiss: removed from rail, AI may regenerate later

AI enrichment of MA content:
- If MA already documented CC/HPI, AI draft is labeled "Updated CC" / "Updated HPI"
- Accepting replaces the MA's original card in the chart list
- MA's original preserved in activity log: "Original by MA Sarah K.: [content]" → "AI enriched from ambient recording" → "Accepted by Dr. Anderson"

7. INLINE STATUS ON CARDS
Modify ChartItemCard:
- Colored dot for processing state: ⚠ amber (needs attention), 🔵 blue (in progress), ✓ green brief (just completed), none (complete/no processing)
- Tapping status dot opens details pane for that item

8. LAYOUT INTEGRATION
Modify CaptureView:
- Chart items list (flex-grow) | Processing Rail (fixed ~200px, collapsible)
- OmniAdd spans full width below both columns
- Collapsed rail → chart items take full width

ACCEPTANCE CRITERIA:
- [ ] Rail visible as right column with batch summary rows
- [ ] Adding Rx creates processing entry in Prescriptions batch; adding Lab in Labs batch
- [ ] Expanding a batch shows individual items with status
- [ ] Dx association via inline popover from rail kebab
- [ ] AI drafts appear in "AI Drafts" batch after mock delays
- [ ] One-tap accept promotes draft to chart list at bottom
- [ ] Edit opens details pane with draft content editable
- [ ] AI enrichment: "Updated HPI" replaces MA's HPI, activity log preserves history
- [ ] Inline status dots on cards match processing state
- [ ] Rail notification: highlight pulse on batch status change
- [ ] Rail collapses; chart items expand to full width
- [ ] Rail becomes drawer on tablet portrait
```

---

## Phase 5: Process View + Sign-Off

```
PHASE 5: PROCESS VIEW + SIGN-OFF

[Include shared context block]

GOAL: Build Process as a full encounter view facet. The workspace for completing all outstanding work and signing off.

PREREQUISITES: Phases 1-4 complete.

WHAT TO BUILD:

1. PROCESS VIEW (src/components/process-view/ProcessView.tsx)
Full-canvas view accessed via view switcher. Same data as Capture, organized by operational batch.

Sections (top to bottom):
a. AI Drafts — pending drafts with preview + Accept/Edit/Dismiss
b. Prescriptions — In-House (dispense) / External (by pharmacy)
c. Labs — In-House / Send-Out by vendor
d. Imaging — In-House / External
e. Referrals
f. Sign Off — completeness + charge capture + sign action

Each section is collapsible. Empty sections show minimal "No [type]" state.

2. BATCH SECTION COMPONENT (src/components/process-view/BatchSection.tsx)
Header with batch label + count + aggregate status
Sub-groups (e.g., In-House vs. Quest for labs)
Item cards within sub-groups showing:
- Item name + summary
- Step-by-step progress (checkmarks for complete, circles for pending, warning for needs attention)
- Action buttons for next required step
Batch action buttons when multiple items share pending action:
- "Associate All → [suggested Dx]"
- "Collect Samples" / "Send All" / "Dispense All"
- Single confirmation tap

3. AI DRAFTS IN PROCESS VIEW
Same drafts as rail, but with more space:
- Full content preview (not truncated)
- Accept / Edit / Dismiss actions more prominent
- Edit opens details pane (same as from rail)

4. ADDING FROM PROCESS VIEW
Inline "+": each batch section header has a "+" that opens OmniAdd scoped to that category type (e.g., "+" on Labs opens OmniAdd at Lab category)
Minified OmniAdd: compact bar at bottom or FAB that expands to full OmniAdd overlay for cross-category adding.

5. SIGN-OFF SECTION (src/components/process-view/SignOff.tsx)
Encounter completeness checklist:
- Per clinical section: CC, HPI, ROS, PE, Assessment (Dx), Plan, Orders, Instructions
- Status: ✓ documented, ⚠ pending/incomplete, ○ not documented
- Tapping incomplete items navigates to relevant content

Charge capture:
- Mock E&M level suggestion (99211-99215) based on documented elements
- Show which elements contribute to the level
- Informational only

Outstanding items summary:
- Count of items still needing attention across all batches

FORWARD-COMPATIBLE NOTE: When a care protocol is active (future), the sign-off section will include an informational protocol adherence indicator: "Protocol adherence: 10/12 items addressed". This is NOT blocking — purely informational quality awareness. Reserve a slot in the sign-off layout for this but don't implement.

"Sign & Close Encounter" button:
- Disabled if critical items incomplete (with explanation)
- Enabled when minimum requirements met

6. VIEW SWITCHER UPDATE
Ensure Capture/Process/Review switcher reflects the "facets" model:
- Same visual weight for all three options
- Switching preserves scroll position per view
- Active facet indicator

ACCEPTANCE CRITERIA:
- [ ] Process view shows all items organized by operational batch
- [ ] Sub-groups work (In-House Labs vs. Quest Labs)
- [ ] Batch actions: "Associate All → [Dx]" associates all items in batch
- [ ] "Send All Rx" / "Collect Samples" batch actions work
- [ ] AI drafts section shows full previews with Accept/Edit/Dismiss
- [ ] Inline "+" adds items scoped to that batch category
- [ ] Minified OmniAdd works for cross-category adding
- [ ] Sign-off shows completeness checklist + mock E&M level
- [ ] "Sign & Close" disabled when critical items incomplete
- [ ] Details pane opens from Process view cards (same pane)
- [ ] View switcher works between Capture and Process
```

---

## Phase 6: Remaining Category Forms + Narrative Polish

```
PHASE 6: REMAINING CATEGORIES + NARRATIVE POLISH

[Include shared context block]

GOAL: Complete all 15 categories with full OmniAdd flows, details pane content, and proper card display.

PREREQUISITES: Phases 1-3 complete (Phases 4-5 recommended but not blocking).

WHAT TO BUILD:

1. STRUCTURED SEARCH FORMS (OmniAdd + details pane)

ImagingForm: modality, body part, views, contrast, priority, clinical indication, facility, instructions
ProcedureForm: CPT, laterality, site, anesthesia, consent, supplies, complications, findings
AllergyForm: allergen type, reaction (multi-select), severity, status, onset, notes + NKDA one-tap
ReferralForm: specialty, provider/facility (optional), priority, reason, clinical info, prior auth, preference
InstructionForm: content (text + templates), delivery method, language

Mock data files for each.

2. NARRATIVE PANE EDITORS (details pane content for AI-drafted categories)

CC editor: text + optional structured fields (duration, onset, severity)
HPI editor: text + HPI element prompts alongside (OLDCARTS elements as tappable chips)
Plan editor: text + problem-based template structure
Note editor: text + note type selector (Clinical, Coordination, Addendum, Other)

ROS editor (structured): System-by-system toggle grid in details pane.
- 13 systems (Constitutional, HEENT, Respiratory, CV, GI, GU, MSK, Neuro, Psych, Skin, Endocrine, Heme/Lymph, Allergic/Immunologic)
- Each system: Positive / Negative / Not Reviewed toggle
- Positive expands for common symptom checkboxes
- "All negative except..." template
- Auto-generate ROS text from toggles

PE editor (structured): System-by-system sections in details pane.
- Each system: Normal / Abnormal toggle
- Normal: auto-insert standard exam text (editable)
- Abnormal: common finding snippets + free text

3. VITALS POLISH
Trend indicators (↑/↓ vs. last recorded, using mock previous values)
Pain scale (0-10)
Recheck option (add second set)

4. TEMPLATE LIBRARY (src/components/shared/TemplateLibrary.tsx)
Reusable template/snippet picker for narrative categories.
Searchable, organized by category and body system.
Templates in src/data/mock-templates.ts.

5. MOCK DATA
src/data/mock-imaging.ts, mock-procedures.ts, mock-referral-specialties.ts
src/data/mock-templates.ts (narrative templates per category)
src/data/mock-vitals-history.ts (previous values for trends)

ACCEPTANCE CRITERIA:
- [ ] All 15 categories functional in OmniAdd
- [ ] All 15 categories have complete details pane content
- [ ] ROS in pane: system toggle grid, positive systems expand
- [ ] PE in pane: system sections with normal/abnormal + standard text
- [ ] "All negative except" template works in ROS
- [ ] Template library searchable and functional
- [ ] Vitals trend arrows and pain scale
- [ ] All forms work touch + keyboard
- [ ] All categories produce properly formatted cards with correct summary text
```

---

## Phase 7: Review View + Safety Checks + Encounter Lifecycle

```
PHASE 7: REVIEW VIEW + SAFETY + LIFECYCLE

[Include shared context block]

GOAL: Build Review view, add clinical safety checks, and implement the full encounter lifecycle from MA handoff through sign-off.

PREREQUISITES: Phases 1-6 complete (or at minimum 1-5).

WHAT TO BUILD:

1. REVIEW VIEW (src/components/review/ReviewView.tsx)
Clinical section organization — auto-maps chart items:
- Chief Complaint / HPI: chief-complaint + hpi items → combined narrative
- Review of Systems: ros item → system-by-system display
- Physical Examination: physical-exam + vitals → exam findings + vital signs
- Assessment: diagnosis items → problem list with ICD-10, Primary/Secondary
- Plan: plan + medication + lab + imaging + procedure + referral + instruction → grouped by type
- Allergies: allergy items → confirmed/updated list
- Notes: note items → provider notes/addenda

Review mapper (src/services/review-mapper.ts): maps categories to sections, formats content appropriately (narrative as prose, structured as formatted entries).

Section behavior:
- Completeness indicator: ✓ documented, ⚠ incomplete, ○ not documented
- "Edit" → opens details pane for the relevant item
- "Add" on empty sections → opens OmniAdd scoped to that category
- Only latest version shown (AI-enriched replaces MA original; history in activity log)

Inline "+" per section + minified OmniAdd for cross-category adding.

2. SAFETY CHECKS (src/services/safety-checks.ts)

Allergy cross-reference:
- On medication add, check against patient allergy list
- Inline warning on card: "⚠ Patient has Penicillin allergy" for Amoxicillin
- Severity: Info (related class), Warning (same class), Critical (exact match with severe reaction)
- Dismissible with acknowledgment — logged in activity log

Drug interaction:
- Check new Rx against encounter meds + current med list
- Informational alert, severity-coded
- Mock 5-10 common interactions

Duplicate detection:
- Warn on adding item matching existing chart item
- "Benzonatate already in chart. Add duplicate?"
- Allow override

Dosage range:
- Flag if outside typical range for drug
- Informational, not blocking

All safety events: recorded in activity log when acknowledged/overridden.

3. ENCOUNTER LIFECYCLE

Initial state (MA handoff):
- Chart items pre-populated with MA content:
  - Vitals (BP, HR, Temp, SpO2, Weight, Height)
  - Chief Complaint ("Cough x 5 days")
  - Basic HPI (onset, duration, tried OTC)
  - Allergy confirmation (NKDA or updated list)
  - Medication reconciliation (confirmed active meds)
- All MA items: source set to 'maHandoff', "Created by MA [name]" in activity log
- Unreviewed indicator on MA items (subtle visual marker)
- Rail shows batch category headers with "—" (no active processing)
- OmniAdd ready at bottom
- No AI activity yet

Provider start:
- Explicit action: tap "Start" on ambient recording minibar
- Triggers: recording begins, encounter status updates ("Clinician Started"), AI processing activates, rail transitions to "Listening..."

Progressive activation:
- After start, AI drafts trickle in:
  - ~5s: CC refinement (if CC exists) or CC draft
  - ~15s: HPI draft / Updated HPI (enriching MA version)
  - ~30s: ROS draft
  - ~45s: PE draft
  - ~60s: Plan draft (after orders are placed)
  - ~75s: Instructions draft
- Rail updates with each new draft (highlight pulse)
- Drafts that enrich MA content labeled "Updated [category]"
- Empty batches stay as "—" until items are added via OmniAdd

Wrap-up:
- Provider switches to Process → completes batches → sign-off

MOCK DATA FOR LIFECYCLE:
Create src/data/mock-encounter.ts with pre-populated MA content for the demo scenario:
- Patient: same as existing mock patient
- Visit: Urgent Care, Cough
- MA: Sarah K.
- Provider: Dr. Anderson (or Paige Anderson, PA-C matching Figma)
- MA-documented items with source: 'maHandoff', timestamps, and activity log entries
- AI-accepted items with source: 'aiDraft' and appropriate activity log chains

4. VIEW SWITCHER COMPLETION
All three facets functional: Capture, Process, Review.
Switching preserves state per view.

ACCEPTANCE CRITERIA:
- [ ] Review mode shows all items organized in clinical sections
- [ ] Sections correctly map categories (Plan section groups Rx+Lab+Imaging etc.)
- [ ] Empty sections show "Not documented" with "Add" action
- [ ] "Edit" opens details pane; "Add" opens scoped OmniAdd
- [ ] Latest version shown in Review (AI-enriched replaces MA)
- [ ] Adding Amoxicillin with Penicillin allergy shows warning
- [ ] Duplicate detection warns on repeated items
- [ ] Dosage range alert shows for out-of-range values
- [ ] Safety alerts dismissible, logged in activity log
- [ ] Encounter opens with MA-populated content
- [ ] MA items show unreviewed indicator, clears on pane open
- [ ] Provider start (recording) triggers AI processing
- [ ] AI drafts appear progressively in rail after start
- [ ] Full lifecycle playable: open → review MA → start → chart → process → review → sign off
- [ ] All three view facets work via switcher
```

---

## Between-Phase Checklist

```
After each phase:

1. COMMIT: git add + commit with descriptive message. Tag: phase-N-complete.

2. REVIEW:
   - Walk through all acceptance criteria
   - Test both touch and keyboard
   - Check responsive behavior (desktop, tablet landscape, tablet portrait)
   - Note issues or adjustments

3. UPDATE DOCS:
   - PROGRESS.md: mark phase complete, note deviations
   - CHANGELOG.md: what was added/changed
   - IMPLEMENTATION_NOTES.md: architectural decisions, trade-offs

4. CLEAN: remove debug code, verify imports, no console.log

5. CHECKPOINT: confirm alignment before next phase. Flag anything that changes the plan.
```
