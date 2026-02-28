# Care Protocols in Demo

**Status**: Design discussion — not yet implemented
**Last discussed**: 2026-02-26

## Goal

Show care protocols during certain encounters — guideline-driven checklists that track what's been documented vs. what's still needed. Previously discussed as a third tab in the reference/context pane (alongside Overview and Activity).

## Current State

### What exists
- **Type system is forward-compatible**: `protocolRef` and `orderSetRef` fields on `ChartItemBase`, `protocol` variant in `ItemSource` union
- **Reference pane tab controller**: `PatientOverviewPane` has a `SegmentedControl` with Overview and Activity tabs, ready for a third
- **Full design spec**: MULTI-SURFACE-COORDINATION.md §5 covers protocol structure, activation flow, item types (Orderable, Documentable, Guidance, Advisory), patient adaptation (4 levels), multi-protocol model
- **Roadmap placement**: Tier 3, Phases C-E (Reference Pane Architecture → Protocol Data Model → Order Set Components)

### What doesn't exist
- No protocol view component
- No protocol state management
- No protocol template data
- No chart-item-to-protocol matching logic
- No AI-triggered protocol activation

## Two Delivery Paths

### Path A: AI Palette Responses (Low cost, high demo value)

Include protocol-style content in canned AI responses. When the user asks "Suggest orders" or "What's the guideline?", the AI responds with an actionable protocol-like list:

> **Per acute bronchitis guidelines (ACP):**
> - [+] Benzonatate 100mg TID for cough suppression
> - [+] Chest X-ray if no improvement in 7-10 days
> - [i] Antibiotics not recommended unless bacterial superinfection suspected
> - [+] Return visit in 2 weeks if symptoms persist

This delivers the *concept* of protocol-guided care through an existing surface (AI palette/drawer) without building a new pane. Follow-up actions on the response let the user add items directly.

**Pros**: Minimal new code. Exercises existing AI surface. Natural conversational framing.
**Cons**: Ephemeral (scrolls away in conversation). Not persistent/visible during charting. No automatic progress tracking.

### Path B: Dedicated Protocol Tab (Medium cost, full demo experience)

Add a third tab to PatientOverviewPane with a static protocol card. Items auto-check as matching chart items appear.

Minimal implementation (~150-200 lines):
1. `CareProtocol` type: `{ id, name, diagnosisCode, items[] }`
2. Protocol item: `{ label, category, status: 'pending' | 'addressed' | 'skipped', chartItemId? }`
3. `PROTOCOL_TEMPLATES` map keyed by diagnosis code (J20.9 → Acute Bronchitis)
4. `ProtocolView` component rendering checklist cards
5. Matching logic: when a chart item's category + content matches a protocol item, mark it "addressed"

**Pros**: Persistent reference surface. Visual progress tracking. Closer to production vision.
**Cons**: New surface to maintain. Matching logic has edge cases. Creates expectation of protocol library that doesn't exist.

### Recommendation

**Start with Path A** (AI palette responses) — this is being implemented as part of the AI canned responses work. Include protocol-style content in the UC Cough responses.

**Revisit Path B** when protocols are a specific demo talking point for a target audience (e.g., clinical ops, quality team). The infrastructure (tab controller, type fields) is ready whenever we want it.

## Protocol Content (UC Cough — For Either Path)

Based on ACP/AAFP guidelines for acute bronchitis:

| Item | Type | Category |
|---|---|---|
| Document symptom duration and quality | Documentable | `hpi` |
| Lung auscultation | Documentable | `physical-exam` |
| Diagnose acute bronchitis (J20.9) | Orderable | `diagnosis` |
| Benzonatate 100mg TID for cough | Orderable | `medication` |
| Supportive care instructions | Documentable | `instruction` |
| Chest X-ray if no improvement in 7-10 days | Guidance | `imaging` |
| Antibiotics NOT recommended (viral etiology) | Advisory | — |
| Return visit if worsening or >2 weeks | Guidance | `instruction` |

## Open Questions

1. **Protocol activation trigger**: In the full system, protocols are activated by AI based on CC/Dx. For demo purposes, should the protocol auto-appear when a matching diagnosis is added to the chart? Or should it be present from encounter load (based on CC)?

2. **Multi-protocol handling**: The PC Diabetes scenario could have overlapping protocols (diabetes management + hypertension). The spec defines a primary + addenda model. For demo, is showing a single protocol sufficient?

3. **Protocol ↔ AI palette interaction**: If both Path A and Path B exist, should tapping "Suggest orders" in the AI palette reference the active protocol? ("2 remaining protocol items: CXR, follow-up instructions"). This creates a nice cross-surface connection but adds coupling.

4. **Progress in processing rail**: The design spec calls for a "Protocol: 4/7 ✓" indicator in the processing rail. Worth adding for demo? It's a small addition if the protocol state exists.

## Key Files

| File | Role |
|---|---|
| `src/types/chart-items.ts` | `protocolRef`, `orderSetRef` fields, `protocol` source variant |
| `src/components/layout/PatientOverviewPane.tsx` | Tab controller, ready for third tab |
| `docs/features/quick-charting/MULTI-SURFACE-COORDINATION.md` | Full protocol spec (§5) |
| `docs/features/quick-charting/ROADMAP.md` | Tier 3 phases C-E |
| `docs/features/quick-charting/CONTEXT.md` | Decisions #31-40 |

## Related Docs

- [AI Canned Responses](./ai-canned-responses.md) — Path A implementation (if created)
- [COVERAGE.md](../COVERAGE.md) — Feature status matrix
- [MULTI-SURFACE-COORDINATION.md](../../features/quick-charting/MULTI-SURFACE-COORDINATION.md) — Full design spec
