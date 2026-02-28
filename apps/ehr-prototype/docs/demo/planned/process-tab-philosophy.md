# Process Tab — Design Philosophy & Evolution

**Status**: Design discussion — not yet implemented
**Last discussed**: 2026-02-27

## Goal

Establish a clear, principled philosophy for what belongs in the Process tab vs. other surfaces. The Process tab currently blends two roles (AI draft review + operational batch tracking) without a unifying principle. This doc defines that principle and maps out the evolution.

## Core Principle

**Process = work that requires action beyond adding an item to the chart.**

Adding an item to the chart is a *clinical decision*. Everything after that decision — or happening in parallel — is *operational work*. The Process tab is where that work lives, regardless of who does it.

| Actor | Example Work |
|---|---|
| **AI** | Generating HPI narrative, computing E&M level, summarizing visit |
| **MA** | Collecting lab specimens, recording vitals |
| **Provider** | Reviewing AI draft, signing orders, associating diagnoses |
| **System** | E-prescribing, sending referral fax, prior auth check |

### What This Means for Current Surfaces

| Content | Where Triage Happens | Principle |
|---|---|---|
| Narrative AI drafts (HPI, A&P) | **Process tab** | AI is *actively working* — background process with temporal duration |
| Structured AI suggestions (Rx, Lab, Dx) | **AI surface** (palette/drawer) | AI *proposes* — reactive advisory, no background process |
| Accepted items with tasks (e-prescribe, lab send) | **Process tab** | System is *doing work* on provider's behalf |
| Care gap suggestions | **AI surface** | AI *advises* — guideline check, no ongoing work |

### The Distinguishing Test

> Does this involve a process with temporal duration, or is it an instant proposal?

- "AI is generating your HPI" → temporal, show in Process
- "AI suggests adding Amoxicillin" → instant proposal, show in AI surface
- "E-prescribe sent to CVS, awaiting acknowledgment" → temporal, show in Process
- "Consider ordering CBC" → instant proposal, show in AI surface

## Role-Agnostic Design

The Process tab is **not role-specific**. It shows work for all roles — MA, provider, AI, system. This matters because:

- Some visits are MA-only (vitals check, vaccine admin)
- Multiple roles may have concurrent work items on the same encounter
- An X-ray tech or lab tech may need to see their items without a dedicated surface

### Current State

The Process tab already supports this implicitly — medication tasks, lab tasks, and imaging tasks aren't provider-specific. But the UI doesn't surface *who* needs to act.

### Future: Role Filters

Quick filters within the Process tab let any team member focus:

```
[All] [Mine] [MA] [Provider] [AI] [System]
```

- **Default**: All (bird's-eye view of everything happening for this patient)
- **"Mine"**: Based on logged-in role, shows only relevant items
- **Filters are lenses, not separate surfaces** — one Process tab, multiple views

The processing rail (compact sidebar in Capture mode) should always be unfiltered — it's situational awareness, not a task list.

### MA Workflow Across Modes

MAs work primarily in the triage tab (workflow mode) for structured intake tasks. But some MA work is also chart work — collecting specimens, documenting vitals — and that shows up in the Process tab during charting. No need to duplicate surfaces:

- **Triage tab**: MA's primary workflow (check-in sections, vitals, allergies review)
- **Process tab**: Operational tasks that arise from charting decisions (specimen collection, order routing)
- **Provider sees both**: What the MA completed in triage + what's pending in Process

## Live-Updating AI Drafts

Narrative drafts should support continuous refinement as more transcript data arrives. This makes the Process tab a true "active AI work" surface.

### Draft Status Evolution

| State | Indicator | Actions Available |
|---|---|---|
| `generating` | Spinner + "Generating..." | None |
| `updating` | Pulse/rotate icon + "Updating with new details..." | View only (accept/dismiss disabled) |
| `pending` | Solid checkmark + "Ready for review" | Accept, Edit, Dismiss |

The `updating` state prevents mid-air changes — the provider can see the draft is being refined and knows to wait until it settles. The processing rail shows the same status in compact form.

### Versioning

- **Display**: Always show latest version with "Updated" badge when content has changed
- **History**: Track prior versions in an activity log accessible from the draft card
- **No diff view** for now — complexity not justified. Provider sees latest, can check log if needed

### Activity Log Pattern

Every Process tab item can have a provenance trail. This generalizes beyond drafts:

| Item Type | Example Activity Log |
|---|---|
| Narrative draft | v1 generated → v2 updated (new details) → v3 updated → accepted |
| Prescription | Created → e-prescribe sent → pharmacy acknowledged |
| Lab order | Created → specimen collected → results pending |
| Imaging order | Created → prior auth submitted → approved → scheduled |

Data model should assume activity log exists even if UI doesn't render it yet.

## Multi-Thread Visibility

The original motivation: how to show multiple AI processes happening concurrently.

### Two-Level System

**Processing Rail** (compact sidebar, Capture mode) — situational awareness
- Compact badges showing active work threads
- "HPI generating..." "Labs ✓" "Rx ⏳" at a glance
- Counts and status icons, not details
- Always unfiltered — full bird's-eye view
- Self-hides when no active items

**Process Tab** (full canvas, Process mode) — deep dive and action
- Full status of each work thread
- Provider can take action (review draft, retry failed e-prescribe, associate Dx)
- History of completed work with green checkmarks
- Optional role filters for focused views
- Sign-off gate at bottom

## Open Questions

1. **Activity log storage**: Should activity log entries live on the item/task/draft objects themselves (simple), or in a separate `activityLog` collection in encounter state (normalized)? The former is simpler for prototype; the latter scales better.

2. **Draft update triggers**: What signals that a draft should re-enter `updating` state? Options: new transcript segment arrives, provider adds a related chart item, AI detects a correction opportunity. For prototype, probably just transcript-driven.

3. **Role filter persistence**: Should the selected filter persist across mode switches (capture → process → capture)? Or reset to "All" each time? Leaning toward persist within a session.

4. **Processing rail + role filter interaction**: If provider has "Mine" filter active in Process tab and switches to Capture mode, should the compact rail also filter? Argued above for "always unfiltered" — but worth revisiting if users find the inconsistency jarring.

## Key Files

| File | Role |
|---|---|
| `src/screens/ProcessView/ProcessView.tsx` | Process canvas (full view) |
| `src/components/processing-rail/ProcessingRail.tsx` | Compact rail (capture mode sidebar) |
| `src/components/process-view/DraftSection.tsx` | Draft card rendering |
| `src/components/process-view/BatchSection.tsx` | Operational batch rendering |
| `src/state/selectors/process-view.ts` | Batch + draft selectors |
| `src/hooks/useProcessView.ts` | Process view orchestration |
| `src/types/drafts.ts` | AIDraft type (needs `updating` status) |
| `docs/features/quick-charting/PROCESSING-RAIL.md` | Current architecture reference |

## Related Docs

- [PROCESSING-RAIL.md](../../features/quick-charting/PROCESSING-RAIL.md) — Current architecture reference (to be updated when this ships)
- [Suggestion Consolidation](./suggestion-consolidation.md) — Companion doc: where suggestions live
- [Tx Workspace Scoping](./tx-workspace-scoping.md) — Recording lifecycle, related to draft generation triggers
- [COVERAGE.md](../COVERAGE.md) — Feature status matrix
