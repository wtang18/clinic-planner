# AI Context Targeting

**Status**: Design discussion — not yet implemented
**Last discussed**: 2026-02-26

## Goal

The AI palette's context header should support targeting specific objects in the chart, enabling progressively narrower or broader context scopes. A provider could target AI queries at a specific chart item, a section/workflow phase, the whole encounter, the entire patient record, or even a cohort.

## Current State

- Context header displays patient name + encounter label (e.g., "Linda Garcia · Acute Cough")
- `ContextTarget` type supports: `encounter`, `patient`, `section`, `item`, `cohort`, `global`
- `ContextLevelPopover` lets users switch between available levels (encounter, patient, section)
- **No actual context narrowing** — switching levels updates visual label only, does not affect query/response behavior
- Canned responses are keyed by scenario ID, not by context scope
- No mechanism to target a specific chart item or section

## Proposed Scope Levels

| Level | Example Target | What It Means |
|-------|---------------|---------------|
| `item` | "Benzonatate 100mg" | AI focuses on a single chart item — drug interactions, dosing, alternatives |
| `section` | "Assessment & Plan" | AI focuses on a chart section or workflow phase |
| `encounter` | "Acute Cough Visit" | AI considers the full encounter context (current default) |
| `patient` | "Linda Garcia" | AI considers full patient history — past encounters, medications, problems |
| `cohort` | "Diabetic Panel" | AI considers population-level data (registry view) |
| `global` | "Clinical Guidelines" | AI draws from general medical knowledge, no patient context |

## Interaction Design

### Setting Context Target

1. **Click-to-target from chart**: Click a chart item → option to "Ask AI about this item" → palette opens with `item`-level context, label shows the item name
2. **Section targeting**: Click a section header (Assessment, Plan, etc.) → AI scopes to that section
3. **Level selector in palette**: The existing `ChevronsUpDown` button already renders a popover for switching levels. Currently visual-only — would need to actually filter/adjust AI behavior
4. **Keyboard shortcut**: From a selected chart item, a chord like `⌘+Shift+A` could open AI palette pre-targeted to that item

### Visual Indicators

- Context header shows scope icon + target label (e.g., pill icon + "Benzonatate 100mg")
- Breadcrumb-style display: `Patient > Encounter > Item` with clickable segments to broaden
- "Broaden scope" action: single click to go from item → section → encounter → patient

### Response Behavior

When context is narrowed:
- AI responses should be specific to the targeted object
- Query suggestions should change based on scope (e.g., item-level: "Check interactions", "Find alternatives"; encounter-level: "Summarize visit", "Suggest orders")
- Follow-up suggestions should relate to the targeted context

## Implementation Considerations

- `CannedResponse` data would need scope variants per query, or separate query sets per scope
- In a real system, the context target would be sent as part of the LLM prompt context
- For the prototype, could implement as additional canned response sets keyed by `{scenarioId}:{scope}:{targetId}`
- Quick actions should update dynamically when scope changes (different actions make sense at item vs encounter level)
- The `useAIAssistant` hook already has `setContext()` — would need to carry the specific target ID

## Dependencies

- Chart item selection infrastructure (already exists via `handleItemSelect`)
- Section/category grouping in the chart view
- AI query routing based on context scope (new)
