# AI Suggestion Surface Consolidation

**Status**: Design discussion — not yet implemented
**Last discussed**: 2026-02-27

## Goal

Consolidate AI suggestions into a single module at the bottom of both the AI drawer (left pane) and AI palette (bottom bar). Currently, suggestions appear in two places within the AI drawer (top section + inline within conversation responses), creating duplication and unclear triage priority. This doc defines a unified model.

## Current State

### What exists — AI Drawer (left pane)

```
┌──────────────────────┐
│ Context Header       │
│ ─────────────────    │
│ Suggestions (top)    │  ← Surface A: SuggestionsSection
│                      │
│ Conversation         │
│   AI Response text   │
│   Follow-up cards    │  ← Surface B: inline SuggestionList
│                      │
│ ─────────────────    │
│ Quick Actions        │
│ [Input area]         │
└──────────────────────┘
```

- **Surface A** (SuggestionsSection): Shows ambient-generated suggestions at top of drawer
- **Surface B** (inline follow-ups): Shows query-response suggestions within conversation
- Two independent data sources, different interaction flows, same visual cards

### What exists — AI Palette (bottom bar)

```
┌─────────────────────────────────┐
│ Context Header                  │
│ ─────────────────               │
│ AI Response text                │
│   Follow-up suggestion cards    │  ← inline at bottom
│   Non-chart action buttons      │
│                                 │
│ ─────────────────               │
│ [Input area]                    │
└─────────────────────────────────┘
```

- Single-turn: one response at a time, cleared before next
- Suggestions are inline within the response area
- No separate suggestion section

### Problems

1. **Duplicate triage surfaces**: Provider must check two places in the drawer for suggestions
2. **Inconsistent placement**: Top in drawer, bottom/inline in palette
3. **Unclear priority**: Which suggestions should the provider address first?
4. **Quick actions compete**: Quick actions and suggestions both say "here's what to do next" but live in different locations

## Proposed Design

### Single Bottom Module

Consolidate all suggestions into one collapsible module positioned above the input area, in both drawer and palette:

```
AI Drawer (proposed)                AI Palette (proposed)
┌──────────────────────┐           ┌──────────────────────┐
│ Context Header       │           │ Context Header       │
│ ─────────────────    │           │ ─────────────────    │
│                      │           │                      │
│ Conversation         │           │ AI Response text     │
│   Response text      │           │   (no inline cards)  │
│   (no inline cards)  │           │                      │
│                      │           │                      │
│ ─────────────────    │           │ ─────────────────    │
│ ▸ Suggestions (3)    │           │ ▸ Suggestions (3)    │
│ [Input area]         │           │ [Input area]         │
└──────────────────────┘           └──────────────────────┘
```

### Why Bottom Placement

- **Proximity to input**: Suggestions and input are both "what to do next" — grouped together
- **Conversation stays clean**: AI responses are text, not interleaved with action cards
- **Consistency**: Same position in both drawer and palette
- **Natural reading flow**: Read response → see suggestions below → take action or ask follow-up

### Mutual Exclusivity with Quick Actions

The bottom module shows **one thing at a time** — either suggestions or quick actions, never both:

| Condition | Bottom Module Shows |
|---|---|
| No suggestions, no conversation | Quick actions (starter prompts) |
| Suggestions arrive (any source) | Suggestion cards — quick actions hidden |
| All suggestions resolved | Quick actions return |

This avoids visual competition. Both answer the same question: **"What should I do next?"**

### Expand/Collapse Behavior

| Event | Module Behavior |
|---|---|
| New suggestions arrive (any source) | Auto-expand |
| Provider manually collapses | Stay collapsed until new suggestions arrive |
| Provider accepts/dismisses one | Count updates live ("▸ Suggestions (2)") |
| All suggestions resolved (count = 0) | Auto-hide, quick actions return |

**Always expand on new arrivals**, regardless of source (ambient, query follow-up, care gap). Simple, one rule.

When collapsed, show count badge: **"▸ Suggestions (3)"** — gives awareness without taking space.

### Suggestion Sources & Ordering

Suggestions flow into the unified module from multiple sources:

| Source | Trigger | Example |
|---|---|---|
| Ambient transcription | AI detects actionable content from recording | "Heard mention of amoxicillin → Add Amoxicillin 500mg" |
| Query follow-up | AI response includes chart-actionable items | "What meds for cough?" → Guaifenesin, Benzonatate cards |
| Care gap analysis | Patient history triggers guideline check | "Overdue for A1C screening" |
| CDS rules | Clinical decision support fires | "Drug interaction: Amoxicillin + Methotrexate" |

**Ordering**: Recency (newest first). Care gaps could be pinned at top in future if they need priority treatment, but start simple.

### Follow-Up Suggestion Flow

When a provider asks a query and the AI response includes actionable suggestions:

1. AI response text renders in conversation area (no inline cards)
2. Suggestion cards appear in the bottom module (auto-expands)
3. Response text can reference suggestions: *"I've suggested 3 medications below based on current guidelines."*
4. Provider triages in the bottom module — same interaction regardless of where the suggestion originated

This decouples suggestions from the conversation thread. The conversation is for information; the suggestion module is for action.

## Implementation Approach

### Phase 1: Consolidate Drawer Suggestions

Move drawer suggestions from top (SuggestionsSection) to bottom module. Remove inline follow-up cards from conversation responses. Wire all suggestion sources into the unified module.

**Files to modify:**
- `src/components/LeftPane/AIDrawer/AIDrawerView.tsx` — Remove SuggestionsSection from top, add bottom module
- `src/components/LeftPane/AIDrawer/AIDrawerFooter.tsx` — Integrate suggestion module above input
- `src/components/LeftPane/AIDrawer/ConversationHistory.tsx` — Remove inline follow-up rendering

**New component:**
- `src/components/ai-ui/SuggestionModule.tsx` — Collapsible suggestion container with count badge, expand/collapse state, mutual exclusivity with quick actions

### Phase 2: Align Palette

Update palette to use the same SuggestionModule pattern. Remove inline follow-up cards from response area.

**Files to modify:**
- `src/components/bottom-bar/ai/AISurfaceModule.tsx` — Replace inline follow-ups with SuggestionModule
- `src/components/ai-ui/AIInputArea.tsx` — Coordinate with SuggestionModule placement

### Phase 3: Unified Suggestion State

Merge suggestion sources into a single prioritized list. Currently `suggestions` (ambient) and `followUpSuggestions` (query) are separate arrays. Unify into one ordered collection.

**Files to modify:**
- `src/hooks/useAIConversation.ts` — Merge follow-up suggestions into main suggestion list
- `src/hooks/useAIAssistant.ts` — Coordinate suggestion sources
- `src/screens/CaptureView/CaptureView.tsx` — Single suggestion prop instead of multiple arrays

## Open Questions

1. **Response text referencing suggestions**: When AI produces both text and suggestions, should the text explicitly say "I've added suggestions below"? Or is the module auto-expanding sufficient signal? Leaning toward explicit text reference for clarity.

2. **Suggestion grouping within module**: When there are 5+ suggestions from mixed sources, should the module group them (e.g., "From your question" / "From transcription")? Or just a flat recency-ordered list? Start flat, add grouping if density becomes a problem.

3. **Module height cap**: If 8 suggestions accumulate, the module could dominate the pane. Should it have a max-height with internal scroll? Probably yes — maybe 3-4 visible cards with scroll for more, matching current SuggestionList behavior.

4. **Palette single-turn clearing**: The palette clears its response on "Clear" action. Should this also clear associated suggestions? Or should suggestions persist until individually resolved? Leaning toward persist — the clinical decision remains even if the text explanation is dismissed.

5. **Transition animation**: When quick actions swap out for suggestions (or vice versa), should there be a crossfade? Or an instant swap? Crossfade feels smoother but adds implementation complexity.

## Key Files

| File | Role |
|---|---|
| `src/components/LeftPane/AIDrawer/AIDrawerView.tsx` | Drawer layout — currently hosts SuggestionsSection at top |
| `src/components/LeftPane/AIDrawer/SuggestionsSection.tsx` | Top suggestion cards (to be replaced) |
| `src/components/LeftPane/AIDrawer/AIDrawerFooter.tsx` | Footer with quick actions + input |
| `src/components/bottom-bar/ai/AISurfaceModule.tsx` | Palette content — inline follow-ups |
| `src/components/suggestions/SuggestionList.tsx` | Shared suggestion card list component |
| `src/components/suggestions/SuggestionActionRow.tsx` | Individual suggestion card |
| `src/hooks/useAIConversation.ts` | Follow-up suggestion state |
| `src/hooks/useAIAssistant.ts` | Ambient suggestion state |

## Related Docs

- [Process Tab Philosophy](./process-tab-philosophy.md) — Companion doc: what belongs in Process vs. AI surfaces
- [AI Context Targeting](./ai-context-targeting.md) — Context scoping affects which suggestions appear
- [Care Protocols](./care-protocols.md) — Protocol-driven suggestions as a future source
- [AI_DRAWER.md](../../features/left-pane-system/AI_DRAWER.md) — Current drawer spec
- [AI_CONTROL_SURFACE_V2.md](../../features/bottom-bar-system/AI_CONTROL_SURFACE_V2.md) — Current palette spec
- [COVERAGE.md](../COVERAGE.md) — Feature status matrix
