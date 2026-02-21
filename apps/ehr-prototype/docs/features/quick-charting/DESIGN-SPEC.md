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
│  │  ┌─ OmniAdd Module ───────────────┐  │  └─────────────────────────┘  │
│  │  │ ┌─ Omni-Input ──────────────┐  │  │                               │
│  │  │ │ + Add to chart...      ✕  │  │  │                               │
│  │  │ └──────────────────────────┘  │  │                               │
│  │  │ ┌─ Detail Area ─────────────┐  │  │                               │
│  │  │ │ [Rx] [Lab] [Dx] [Img]    │  │  │                               │
│  │  │ │                           │  │  │                               │
│  │  │ │ Suggestion cards...       │  │  │                               │
│  │  │ └──────────────────────────┘  │  │                               │
│  │  └────────────────────────────────┘  │                               │
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

### 2.1 Architecture: Omni-Input + Detail Area

OmniAdd has two components with distinct roles:

**Omni-Input (navigator):** Single-line text field with inline pills. Answers "what am I adding?" Accepts typed input and tapped selections. Pills materialize inside the field as the provider navigates the tree — either by typing terms/prefixes or by selecting items from the detail area. The omni-input determines which content appears in the detail area.

**Detail Area (workspace):** Contextual content below the omni-input that adapts based on the current input state. Shows suggestion pills and suggestion cards at selection depths; shows field-row configuration and text areas at editing depths. Holds the Add/commit action. All selection and configuration happens here.

```
┌─ OmniAdd Module ──────────────────────────────────────────────────────┐
│                                                                        │
│  ┌─ Omni-Input ────────────────────────────────────────────────────┐  │
│  │  + [Rx] [Benzonatate] |                                    ✕   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─ Detail Area ───────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  (content adapts to omni-input state — see §2.4)                │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Omni-Input Behavior

**Text input:** Always-present single-line field. Placeholder: "Add to chart..." Focus via tap, `/`, or `Cmd+K`.

**Pill formation:** As the provider navigates the tree (by typing recognized terms, selecting suggestions, or typing category prefixes), pills materialize in the input field representing committed selections. Pills act as breadcrumbs showing current tree position.

**Pill examples by depth:**
- Root (nothing committed): `|` (cursor only)
- Category committed: `[Rx] |`
- Item committed: `[Rx] [Benzonatate] |`

**Pills behave as characters.** They occupy space in the input like text. Backspace deletes the rightmost pill (or text character). No highlight-then-delete — single backspace removes a pill. Select-all (`Cmd+A`) + delete clears everything.

**Tapping a preceding pill** truncates everything to its right and shows options at that level. Tapping `[Rx]` in `[Rx] [Benzonatate]` removes the item pill, returns to category-scoped suggestions.

**Typing with pills present** filters content in the detail area. `[Rx] amox|` filters Rx suggestions to matches for "amox".

**The ✕ button** clears all pills and text, returns to root state.

### 2.3 Input Recognition and Categorization

The omni-input supports multiple input styles that all resolve through the same ranking system:

**Natural language input:** `benzonatate 100mg po bid 7d` → system recognizes "benzonatate" as an Rx, parses parameters. Auto-inserts `[Rx]` pill, shows suggestion card with parsed values.

**Category prefix:** `rx amoxicillin` or `rx:amoxicillin` → `[Rx]` pill inserts, results scoped to Rx matching "amoxicillin".

**Item name only:** `amoxicillin` → system recognizes as unambiguously Rx → `[Rx]` pill auto-inserts, detail area shows Amoxicillin suggestion cards.

**Ambiguous terms:** `strep` → could be Lab/Dx/Procedure → no category pill auto-inserts. Detail area shows ranked results grouped by category. Provider selects one, both pills insert together.

**Auto-categorization rules:**

| Input Pattern | Behavior | Rationale |
|--------------|----------|-----------|
| Recognized drug name | Auto-insert `[Rx]` | Drug names are unambiguous |
| Recognized lab with no Dx/Proc overlap | Auto-insert `[Lab]` | e.g., "CBC" is only a lab |
| Term matching multiple categories | No auto-insert; show grouped results | Provider disambiguates |
| Category prefix (`rx:`, `lab:`, `dx:`, etc.) | Auto-insert category pill | Provider declared intent |
| Narrative category prefix (`cc`, `hpi`, `ros`, `pe`) | Auto-insert category pill, focus moves to text area | See §2.6 |

**Structured categories never accept free text as a final value.** Every item must resolve to a known entity (medication from formulary, lab from catalog, diagnosis from ICD-10). If typed text has no match, the detail area shows "No matches" with suggestions for similar terms.

### 2.4 Detail Area: Suggestion-Driven at Every Depth

The detail area is always a response to the current omni-input state. Everything in it is a suggestion — at different levels of specificity depending on tree depth. The detail area has three types of content that appear contextually: suggestion pills (quick-select options), suggestion cards (complete item previews with actions), and workspace content (field rows, text areas, data entry grids).

**Depth 1 — Root (no pills, no text):**

The zero-input state. Detail area shows encounter-contextual suggestions: category pills for scoping, and complete suggestion cards for likely next items.

```
  [Rx]  [Lab]  [Dx]  [Imaging]  [Referral]  [More...]

  ┌─ Rx · Benzonatate 100mg PO TID PRN ──────────┐
  │  #15 · 0 refills · CVS              [Add][Edit]│
  └────────────────────────────────────────────────┘
  ┌─ Dx · Acute Bronchitis (J20.9) ──────────────┐
  │  Primary · Acute onset             [Add][Edit] │
  └────────────────────────────────────────────────┘
  ┌─ Lab · Rapid COVID-19 Antigen ────────────────┐
  │  In-House · Routine                [Add][Edit] │
  └────────────────────────────────────────────────┘
```

Category pills at top: tapping one inserts the corresponding pill into the omni-input and advances the detail area to depth 2.

Suggestion cards below: fully fleshed-out items the provider probably wants to add next, based on encounter context (CC, patient history, ambient recording, care protocols, provider patterns). Each card has Add (accept as-is) and Edit (open field configuration).

**Depth 1b — Root with typed text (searching):**

Provider has typed text but no category is committed. Detail area shows ranked results across all categories, replacing category pills with search results.

```
  ┌─ Lab · Rapid Strep Test ──────────────────────┐
  │  In-House · Routine                [Add][Edit] │
  └────────────────────────────────────────────────┘
  ┌─ Dx · Streptococcal pharyngitis (J02.0) ─────┐
  │  Primary · Acute onset             [Add][Edit] │
  └────────────────────────────────────────────────┘
  ┌─ Procedure · Rapid Strep Collection ──────────┐
  │  In-Office                         [Add][Edit] │
  └────────────────────────────────────────────────┘
```

Results ranked by relevance and encounter context. Each result shows its category badge. Selecting one inserts both `[Category]` and `[Item]` pills into the omni-input.

Keyboard: arrow keys highlight results, Enter accepts the top/highlighted result.

**Depth 2 — Category committed (e.g., `[Rx] |`):**

Detail area shows suggestions within that category: item pills for quick selection, and suggestion cards for common items.

```
  [Benzonatate]  [Dextromethorphan]  [Guaifenesin]  [Amoxicillin]

  ┌─ Benzonatate 100mg PO TID PRN ───────────────┐
  │  #15 · 0 refills · CVS              [Add][Edit]│
  └────────────────────────────────────────────────┘
  ┌─ Dextromethorphan 30mg PO Q6H PRN ───────────┐
  │  #20 · 0 refills · CVS              [Add][Edit]│
  └────────────────────────────────────────────────┘
```

Tapping an item pill inserts it into the omni-input and advances to depth 3. Typing filters both pills and cards. The pills are the quick-select layer; the cards are the fully configured previews.

**Depth 3 — Item committed (e.g., `[Rx] [Benzonatate]`):**

Detail area shows the item's configurable fields (unselected) with a suggestion card at the bottom representing the recommended configuration.

```
  → Dosage          [100 mg]  [200 mg]  [Other]
  → Route           [PO]  [IM]  [Other]
  → Frequency       [TID PRN]  [BID]  [Other]
  → Quantity        ___
  → Refills         ___

  ┌─ Suggested ───────────────────────────────────┐
  │  100 mg PO TID PRN cough #15, 0RF             │
  │                                  [Edit] [Add]  │
  └────────────────────────────────────────────────┘
```

Field rows are visible with pill options but **unselected by default**. This shows the anatomy of the item — what fields exist and what options are available — giving providers a sense of control and visibility without implying the system has already decided.

The suggestion card at the bottom represents the system's recommended configuration. Two actions:

**Add:** Accepts the suggestion as-is. Item added to chart with the suggested values. Fastest path.

**Edit:** Pre-selects the suggestion's values across the field rows and hides the suggestion card (since the provider is indicating the suggestion isn't exactly right). The provider adjusts fields as needed using the now-highlighted pills. An Add button remains at the bottom. A Clear affordance resets field selections and restores the suggestion card.

```
  After tapping Edit on suggestion:

  → Dosage          [•100 mg]  [200 mg]  [Other]
  → Route           [•PO]  [IM]  [Other]
  → Frequency       [•TID PRN]  [BID]  [Other]
  → Quantity        15
  → Refills         0

                                    [Clear]  [Add]
```

Fields with `•` indicate pre-selected values from the suggestion. Provider taps different pills to change, adjusts numeric fields as needed. Add commits the current configuration.

**Natural language fast path:** If the provider typed parameters (e.g., `benzonatate 100mg po bid 7d`), the system parses these and the suggestion card reflects the parsed values. Add accepts the parsed result. Edit pre-fills with the parsed values if adjustments are needed. The parsing doesn't need to be perfect — the suggestion card makes parsed values visible so misparses are obvious, and Edit gives a one-tap path to correction.

### 2.5 Detail Area: Keyboard-Only Flow

The entire OmniAdd flow is completable without mouse or touch:

1. `/` or `Cmd+K` → focus omni-input
2. Type: `benzonatate 100mg po bid 7d`
3. `↑`/`↓` arrow keys → highlight different suggestion cards (top result highlighted by default)
4. `Enter` → accepts highlighted suggestion card (Add). Pills insert, item added to chart.
5. Cursor returns to omni-input (batch mode: scoped to same category)

If the provider wants to customize before adding:

1. Type: `benzonatate`
2. `Enter` → accepts top suggestion, inserts pills, shows depth 3 with suggestion card
3. `Tab` → moves focus into field rows
4. `Tab`/`Shift+Tab` → navigate between fields
5. Arrow keys within a field → navigate pill options
6. `Enter` on a pill → select it
7. `Tab` past last field or `Cmd+Enter` → Add (commit item)

`Escape` behavior by context:
- Focus in field rows → blur fields, return focus to omni-input
- Focus in omni-input with pills → blur omni-input entirely (preserve contents)
- Empty omni-input → blur omni-input

### 2.6 Category Variants

The three category variants (structured search, narrative, data entry) all enter through the omni-input but produce different detail area content at depth 2+.

**Structured Search (medication, lab, imaging, procedure, diagnosis, allergy, referral):**
Detail area shows item suggestions (pills + cards) at depth 2, field configuration at depth 3. Described fully in §2.4.

**Narrative (chief-complaint, hpi, ros, physical-exam, plan, instruction, note):**
Narrative categories require explicit declaration — a typed prefix (`cc`, `hpi`, etc.) or a category pill tap. Free text is indistinguishable from structured search terms, so the system cannot auto-detect narrative intent.

Once a narrative category pill is committed (e.g., `[CC]`), **focus automatically moves to the detail area**, which shows:

```
  ┌─ AI Draft (if available) ─────────────────────┐
  │  Patient reports cough x 5 days, productive    │
  │  with yellow sputum, worse at night. Tried     │
  │  OTC Robitussin without relief...              │
  │                                  [Edit] [Add]  │
  └────────────────────────────────────────────────┘

  — or write manually —
  ┌────────────────────────────────────────────────┐
  │  |                                             │
  │                                                │
  └────────────────────────────────────────────────┘
                                            [Add]
```

If an AI draft exists for this category (from ambient recording), it appears as a suggestion card. Add accepts as-is; Edit opens the content in the text area for modification.

Below the AI draft (or as the only content if no draft exists): a text area for manual entry with a category-specific placeholder. Template/snippet support for ROS (system toggles) and PE (system sections).

If the provider types content after the prefix (`cc cough x 5 days`), the text after the category token pre-fills the text area.

Note is the only purely manual narrative category. All others are primarily AI-drafted from ambient recording (see Section 3).

**Data Entry (vitals):**
`[Vitals]` pill committed → detail area shows the numeric field grid (BP, HR, Temp, RR, SpO2, Weight, Height, BMI, Pain). Out-of-range highlighting, BMI auto-calc, trend indicators vs. last recorded. Add button at bottom.

Vitals are typically MA-entered during rooming. Provider updates via OmniAdd if needed.

### 2.7 Suggestion Engine

All content in the detail area is generated by the suggestion engine. Different tree depths produce different suggestion types, but the engine is unified.

**Suggestion sources (priority order):**
1. Ambient recording transcript
2. Chief complaint + visit type
3. Patient history (problems, meds, allergies, recent labs)
4. Active care protocol recommendations (see MULTI-SURFACE-COORDINATION.md §5)
5. Order sets / clinical pathways
6. Care gaps (overdue screenings, monitoring)
7. Provider's prescribing patterns

**Suggestion types by depth:**

| Depth | Pill Suggestions | Card Suggestions |
|-------|-----------------|------------------|
| Root (zero-input) | Category pills (Rx, Lab, Dx...) | Complete items across categories |
| Root (typed text) | None (results replace pills) | Ranked results across categories |
| Category committed | Item pills within category | Complete items within category |
| Item committed | Field-level option pills | Top recommended configuration |
| After adding item | Next-likely category pills | Next-likely complete items |

**Accepting a suggestion card:** Tap Add (touch) or Enter on highlighted card (keyboard). Adds the complete item to the chart, bypassing further configuration. This is the fastest path.

**Result ranking (Approach 4 — weighted inline results):** All typed input produces ranked results in the detail area. The top result is always highlighted and one Enter away. Alternative results are visible below. The provider can verify the system's best guess before committing. Ranking considers: exact match strength, encounter context relevance, category frequency patterns, and provider history.

**Ambiguity resolution:** When a typed term matches multiple categories, results are shown grouped by category with the most likely match promoted to the top. No auto-categorization occurs for ambiguous terms. The provider selects from the ranked results, and both category + item pills insert together.

**Natural language parameter parsing:** When input includes recognizable parameters (dosage, route, frequency, duration patterns), the suggestion card reflects parsed values. The parsing pipeline: identify item → identify category → extract parameters → match to field values → generate suggestion card with pre-filled configuration. Parsing is best-effort — misparses are visible in the suggestion card for the provider to catch. Rule-based pattern matching for common clinical abbreviations is sufficient for the prototype; the architecture supports swapping in AI-assisted parsing later.

**Order sets:** Single suggestion card that represents multiple items. See MULTI-SURFACE-COORDINATION.md §4 for the full order set architecture. In the detail area, an order set card shows a summary (e.g., "Bronchitis Workup · 3 items: Rx, Dx, Lab") with Add (accept all with defaults) and Edit (open order set review flow with per-item checkboxes and customization).

### 2.8 Batch Mode

After adding an item, OmniAdd returns to category level (not root) for batch adds:
- Omni-input shows `[Rx] |` with cursor ready for next item
- Detail area shows category-scoped suggestions (next likely items)
- "Done with [Category]" affordance returns to root
- Keyboard: Escape exits batch mode to root
- Backspace on category pill also exits to root

### 2.9 Undo

- Keyboard: Cmd/Ctrl+Z removes last-added chart item
- Touch: toast with "Undo" for 5 seconds after add
- Undo removes item from chart list and processing state

### 2.10 Correction and Editing

**Backspace behavior** — pills are characters:

| State | Backspace |
|-------|-----------|
| Text present after pills | Delete text character |
| Cursor against rightmost pill, no text | Delete that pill |
| Multiple pills, rightmost deleted | Cursor at end of previous pill |
| Last pill deleted | Return to root |

Deleting an item pill returns to category-scoped suggestions (detail area updates to depth 2). Deleting a category pill returns to root suggestions (detail area updates to depth 1). Since the suggestion engine immediately responds with contextual options, the item just removed is likely the top suggestion — making re-selection a single tap/Enter if the deletion was accidental.

**Tapping a preceding pill** truncates everything to its right. Tapping `[Rx]` in `[Rx] [Benzonatate]` removes `[Benzonatate]` and returns to category-scoped suggestions. This matches standard breadcrumb navigation.

**Clearing the entire input:** `Cmd+A` + delete, or tap the ✕ button.

**Within the configuration field view** (depth 3 after Edit): tapping different pills changes selections. Clear resets all selections and restores the suggestion card. These changes are local to the field view — the omni-input pills are unaffected.

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

| | AI Suggestion (OmniAdd Detail Area) | AI Draft (Rail) |
|-|-------------------------------------|-----------------|
| Content type | Structured items (Rx, Lab, Dx, etc.) | Narrative content (HPI, PE, Plan, etc.) |
| Where it appears | Suggestion cards in OmniAdd detail area | Processing rail under "AI Drafts" |
| Provider action | Accept = Add on suggestion card | Accept = promotes to chart list |
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
| `/` or `Cmd+K` | Focus omni-input |
| `Escape` | Context-dependent: close field editing → blur omni-input → close details pane |
| `Enter` | Accept highlighted suggestion card (Add) / Select pill option / Submit item from field view |
| `Cmd+Enter` | Add item (when focus is in field rows) |
| `↑` / `↓` | Navigate suggestion cards / search results |
| `Tab` / `Shift+Tab` | Navigate between detail area fields |
| `Backspace` | Delete text character or rightmost pill |
| `Cmd+A` + `Delete` | Clear all pills and text in omni-input |
| `Cmd+Z` | Undo last add |

Category prefixes (type in omni-input): `rx`, `lab`, `dx`, `img`, `proc`, `cc`, `hpi`, `ros`, `pe`, `vitals`, `allergy`, `plan`, `instruction`, `note`, `referral`

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
