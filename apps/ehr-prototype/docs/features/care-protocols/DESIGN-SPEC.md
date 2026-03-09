# Care Protocol System — Design Specification

**Status:** Draft
**Scope:** Data model, component architecture, lifecycle management, reference pane integration, severity scoring, and cross-surface resolution for clinical care protocols within encounter mode.
**Related docs:** `../../reference/care-protocols/PROTOCOL-SPEC.md` (historical reference), `../../reference/care-protocols/REFERENCE-PANE-SPEC.md` (historical reference), `../anchor-bar-palette-pane-system/` (coordination state machine)
**Context:** Care protocols provide structured clinical guidance during encounters. A protocol is a versioned template of cards and items that guide the provider through condition-specific evaluation, treatment, and follow-up. The system integrates with the existing chart item pipeline, AI suggestion surface, and reference pane container to provide a unified clinical workflow.

---

## 1. Data Model

### 1.1 ProtocolTemplate

Static, versioned definition of clinical guidance for a condition. Templates live in a protocol registry (mock data in prototype) and are loaded by reference when activated.

```typescript
interface ProtocolTemplate {
  id: string;                          // e.g., 'low-back-pain-v1'
  name: string;                        // e.g., 'Low Back Pain Evaluation'
  version: string;
  description: string;
  triggerConditions: ProtocolTrigger[];
  severityScoringModel?: SeverityScoringModel;
  autoExpandFirstCard: boolean;
  cards: ProtocolCardDef[];
}

interface ProtocolTrigger {
  type: 'cc-match' | 'dx-match' | 'visit-type-match';
  value: string;
  confidenceThreshold: number;
}
```

### 1.2 ProtocolCardDef

Cards group protocol items into clinical stages. Each card collapses and expands independently.

```typescript
interface ProtocolCardDef {
  id: string;                          // e.g., 'history-assessment'
  label: string;
  description?: string;
  stage: ProtocolStage;
  cardType: 'sequential' | 'unordered';
  sortOrder: number;
  items: ProtocolItemDef[];
}

type ProtocolStage =
  | 'history-assessment'
  | 'examination'
  | 'diagnostics'
  | 'treatment'
  | 'education'
  | 'follow-up';
```

### 1.3 ProtocolItemDef — 4 Item Types

Each item has a base definition plus a type-specific payload.

```typescript
interface ProtocolItemDef {
  id: string;
  label: string;
  description?: string;
  itemType: ProtocolItemType;
  sortOrder: number;
  condition?: ProtocolCondition;
  conditionBehavior: 'hide' | 'show-inactive';
}

type ProtocolItemType =
  | OrderableItemDef
  | DocumentableItemDef
  | GuidanceItemDef
  | AdvisoryItemDef;
```

**Orderable** — maps to a specific chart item that can be added via `[+]`:

```typescript
interface OrderableItemDef {
  type: 'orderable';
  chartCategory: ItemCategory;
  defaultData: Partial<ChartItemDataMap[ItemCategory]>;
  orderSetGroup?: string;              // Batch grouping for [Add All]
  matchFields: string[];               // Dedup keys (e.g., ['drugName'])
}
```

**Documentable** — clinical observation mapping to narrative content:

```typescript
interface DocumentableItemDef {
  type: 'documentable';
  narrativeSection: 'hpi' | 'physical-exam' | 'ros' | 'plan';
  detectionHints: string[];            // AI ambient transcription triggers
}
```

**Guidance** — informational prompt for the provider, no chart action:

```typescript
interface GuidanceItemDef {
  type: 'guidance';
  prompt: string;
  detectionHints: string[];
}
```

**Advisory** — persistent warning/constraint, no completion state:

```typescript
interface AdvisoryItemDef {
  type: 'advisory';
  severity: 'info' | 'warning' | 'critical';
  persistent: true;
}
```

### 1.4 ProtocolCondition

Conditions evaluate against patient context and current chart state. When unmet, the item is either hidden or shown as inactive based on `conditionBehavior`.

```typescript
interface ProtocolCondition {
  source: 'patient-context' | 'chart-state';
  field: string;                       // JSONPath-like field reference
  operator: 'exists' | 'not-exists' | 'equals' | 'includes' | 'gt' | 'lt';
  value?: string | number | boolean;
}
```

Conditions re-evaluate on chart state changes (`ITEM_ADDED`, `ITEM_UPDATED`, `ITEM_CANCELLED`) and patient context updates. When a condition transitions unmet to met, previously hidden items appear (briefly highlighted if `conditionBehavior` was `'hide'`).

### 1.5 SeverityScoringModel

For protocols with severity-stratified treatment paths (e.g., STarT Back for LBP).

```typescript
interface SeverityScoringModel {
  name: string;                        // e.g., 'STarT Back Screening Tool'
  inputs: ScoringInput[];
  scoringLogic: ScoringFormula;
  paths: SeverityPath[];
}

interface ScoringInput {
  id: string;
  label: string;
  source: 'chart-item' | 'vitals' | 'manual-entry';
  fieldRef?: string;
  weight: number;
  currentValue?: number | null;        // Populated at runtime
}

interface ScoringFormula {
  type: 'weighted-sum' | 'lookup-table';
  lookupTable?: Record<string, number>;
}

interface SeverityPath {
  id: string;
  label: string;                       // e.g., 'Mild', 'Moderate', 'Severe'
  scoreRange: { min: number; max: number };
  cardOverrides: {
    cardId: string;
    itemOverrides: {
      itemId: string;
      pathState: 'active' | 'de-emphasized';
    }[];
  }[];
}
```

The severity score is **computed** (derived state via selector), not stored. `selectedPathId` and `isManualOverride` persist in `ActiveProtocolState.severity` so provider overrides survive score recalculation.

### 1.6 ActiveProtocolState

Runtime state stored in `EncounterState.entities.protocols`. One entry per active/available protocol per encounter.

```typescript
interface ActiveProtocolState {
  id: string;                          // Instance ID (unique per encounter)
  templateId: string;
  templateSnapshot: ProtocolTemplate;  // Frozen copy at activation time
  status: ProtocolLifecycleStatus;
  activationSource: 'cc-match' | 'ai-ambient' | 'ai-suggestion' | 'manual';
  activatedAt: Date | null;
  isPrimary: boolean;

  severity: {
    score: number | null;
    selectedPathId: string | null;
    isManualOverride: boolean;
  } | null;

  cardStates: Record<string, ProtocolCardState>;
  itemStates: Record<string, ProtocolItemState>;
}

type ProtocolLifecycleStatus = 'available' | 'active' | 'completed' | 'dismissed';

interface ProtocolCardState {
  expanded: boolean;
  manuallyToggled: boolean;
}

interface ProtocolItemState {
  status: 'pending' | 'addressed' | 'skipped' | 'not-applicable';
  addressedBy: {
    type: 'chart-item' | 'ai-draft' | 'suggestion' | 'manual';
    referenceId?: string;
  } | null;
  addressedAt: Date | null;
  skipReason?: string;
}
```

### 1.7 Encounter State Extension

```typescript
// In EncounterState.entities
entities: {
  // ... existing fields ...
  protocols: Record<string, ActiveProtocolState>;  // NEW
};

// In EncounterState.relationships
relationships: {
  // ... existing fields ...
  protocolToItems: Record<string, string[]>;       // NEW: Protocol ID -> Chart Item IDs
};
```

### 1.8 Action Types

```typescript
type ProtocolAction =
  | { type: 'PROTOCOL_LOADED'; payload: { protocol: ActiveProtocolState } }
  | { type: 'PROTOCOL_ACTIVATED'; payload: { protocolId: string; source: ActiveProtocolState['activationSource'] } }
  | { type: 'PROTOCOL_ITEM_ADDRESSED'; payload: { protocolId: string; itemId: string; addressedBy: ProtocolItemState['addressedBy'] } }
  | { type: 'PROTOCOL_ITEM_SKIPPED'; payload: { protocolId: string; itemId: string; reason?: string } }
  | { type: 'PROTOCOL_CARD_TOGGLED'; payload: { protocolId: string; cardId: string; expanded: boolean } }
  | { type: 'PROTOCOL_SEVERITY_UPDATED'; payload: { protocolId: string; score: number; pathId: string } }
  | { type: 'PROTOCOL_PATH_OVERRIDDEN'; payload: { protocolId: string; pathId: string } }
  | { type: 'PROTOCOL_DISMISSED'; payload: { protocolId: string } }
  | { type: 'PROTOCOL_COMPLETED'; payload: { protocolId: string } }
  | { type: 'PROTOCOL_CLEARED'; payload: { protocolId: string } };
```

### 1.9 Selectors

| Selector | Return Type | Purpose |
|----------|-------------|---------|
| `selectActiveProtocol` | `ActiveProtocolState \| null` | Primary active protocol |
| `selectAddendaProtocols` | `ActiveProtocolState[]` | Non-primary protocols (active or available) |
| `selectProtocolCompletion` | `{ addressed, total, ratio }` | Completion ratio for a protocol |
| `selectProtocolItemState` | `ProtocolItemState` | State of a specific protocol item |
| `selectSeverityScore` | `{ score, recommendedPathId, inputs }` | Computed severity from chart data + scoring model |
| `selectProtocolLinkedItems` | `ChartItem[]` | Chart items added via a protocol |
| `selectProtocolItemSuggestionMatch` | `Suggestion \| null` | Whether a protocol item matches a pending suggestion |

---

## 2. Components

### 2.1 ProtocolView

Top-level container for the Protocol tab within the reference pane. Renders inside `PatientOverviewPane` when the Protocol segment is active.

**Content structure:**
1. Protocol header (name, severity badge, overall completion, actions menu)
2. Card list (scrollable, per-card expand/collapse)
3. Addenda section (secondary protocols / care gap items)

**Empty state:** "No active protocol. Protocols appear here when clinical relevance is confirmed." + "Browse protocols" link for manual activation.

### 2.2 ProtocolCard

Collapsible card grouping protocol items by clinical stage.

**Collapsed anatomy:**

| Slot | Content |
|------|---------|
| Step number | Number badge (sequential) or checkbox icon (unordered) |
| Section label | Card label (e.g., "History & Assessment") |
| Key signal | Highest-priority signal from the card (see priority hierarchy below) |
| Primary action | `[+]` for highest-priority unaddressed orderable |
| Completion | `X/Y` muted text (advisory items excluded) |

**Key signal priority hierarchy:**

| Priority | Condition | Content |
|----------|-----------|---------|
| 1 (highest) | Critical advisory in card | Advisory label (truncated 40 chars) |
| 2 | Warning advisory in card | Advisory label |
| 3 | Newly applicable orderable (condition just met) | "Now applicable: [label]" |
| 4 | Any unaddressed orderable | First orderable label |
| 5 | Unaddressed guidance | First guidance prompt |
| 6 (lowest) | All items addressed | "Complete" |

**Expanded anatomy:** Header + item list + card action bar (`[Add All Orderables]` + `[Review & Add]` when >1 orderable exists).

**Card states:** Default (collapsed), expanded, all-addressed (muted green left border), partially addressed (normal with progress), not-on-active-path (dimmed, collapsed, "Not on current path" label).

**Auto-expand:** First card auto-expands on activation when `template.autoExpandFirstCard` is true. `manuallyToggled` tracks provider intent.

### 2.3 Item Type Components

**OrderableItem** — 6 visual states:

| State | Visual | Trigger |
|-------|--------|---------|
| Default | Label + `[+]` + `[Edit]` | Initial |
| Addressed | Label + checkmark + linked item ref | Chart item matches `matchFields` |
| Suggested | Label + "Suggested" badge + `[+]` | Pending AI suggestion matches |
| Contraindicated | Label + warning + reason | Allergy/interaction detected |
| Skipped | Strikethrough + "Skipped" + undo | Provider dismissed |
| Not applicable | Muted + "N/A" | Condition unmet, `show-inactive` |

**DocumentableItem** — checkbox-driven with AI auto-detection:

| State | Visual | Trigger |
|-------|--------|---------|
| Default | Label + checkbox | Initial |
| Addressed (auto) | Label + checkmark + "Detected" | AI matched `detectionHints` |
| Addressed (manual) | Label + checkmark | Provider checked |
| Skipped | Strikethrough + "Skipped" + undo | Provider dismissed |

**GuidanceItem** — informational prompt, visually distinct (info-icon prefix, secondary text treatment):

| State | Visual | Trigger |
|-------|--------|---------|
| Default | Prompt + checkbox | Initial |
| Acknowledged (auto) | Prompt + checkmark + "Detected" | AI detected relevant conversation |
| Acknowledged (manual) | Prompt + checkmark | Provider checked |

**AdvisoryItem** — persistent, no completion state, cannot be dismissed:

| Severity | Visual |
|----------|--------|
| `info` | Neutral bg, info icon |
| `warning` | Amber bg tint, warning icon, semi-bold |
| `critical` | Red bg tint, alert icon, bold |

### 2.4 SeverityScoringPanel

Expandable panel below the protocol header severity badge. Shows:
- Each `ScoringInput` with current value, weight, visual indicator
- Formula result mapped to severity path
- Path selector (segmented control, current path highlighted)
- Override control (provider selects different path; persists with "override" indicator)

**Path selection effects:** Items marked `'active'` on current path render normally. Items marked `'de-emphasized'` render dimmed (40% opacity) with "Not on current path" label.

---

## 3. Lifecycle

### 3.1 State Machine

```
              CC/visit-type match
  [unloaded] ─────────────────────> [available]
             <─────────────────────
              encounter exit /           |
              CC changed                 | AI confirms / provider activates
                                         v
                                     [active]
                                       |     |
                          all items    |     | provider dismisses
                          addressed    |     |
                                       v     v
                                 [completed]  [dismissed]
                                       |           |
                                       | dismiss   | re-activate
                                       v           v
                                 [dismissed]    [active]
```

### 3.2 Transition Table

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| unloaded | available | CC/visit reason matches `ProtocolTrigger` | `PROTOCOL_LOADED`, Protocol tab segment appears |
| available | active | AI confirms relevance OR provider manual activation | `PROTOCOL_ACTIVATED`, auto-expand first card, badge appears, auto-switch to Protocol tab |
| available | unloaded | Encounter exited or CC changed | `PROTOCOL_CLEARED`, tab segment removed |
| active | completed | All trackable items addressed or skipped | `PROTOCOL_COMPLETED`, badge changes to checkmark |
| active | dismissed | Provider explicitly dismisses | `PROTOCOL_DISMISSED`, activity log entry, tab segment removed |
| completed | dismissed | Provider dismisses completed protocol | Same as active to dismissed |
| dismissed | active | Provider re-activates | `PROTOCOL_ACTIVATED`, previous item states preserved |

### 3.3 Activity Log Entries

| Event | Log Entry |
|-------|-----------|
| Protocol loaded | `protocol.loaded` — "Low Back Pain protocol available (CC match)" |
| Protocol activated | `protocol.activated` — "Activated via [source]" |
| Item addressed | `protocol.item.addressed` — "[Item label] addressed via [chart-item\|suggestion\|manual]" |
| Item skipped | `protocol.item.skipped` — "[Item label] skipped: [reason]" |
| Protocol dismissed | `protocol.dismissed` — "Protocol dismissed at [X/Y] completion" |
| Protocol completed | `protocol.completed` — "All items addressed" |

---

## 4. Reference Pane Integration

### 4.1 Three-Tab Container

The reference pane (`PatientOverviewPane`) uses a `SegmentedControl` with `variant="inline"` and `size="sm"`. The Protocol segment is conditionally rendered:

| Segment | Key | Visibility |
|---------|-----|------------|
| Overview | `overview` | Always |
| Activity | `activity` | Always |
| Protocol | `protocol` | When `protocolTabState` is not `'hidden'` |

### 4.2 Badge System

| Protocol Tab State | Badge |
|-------------------|-------|
| `hidden` | Segment not rendered |
| `available` | No badge |
| `active` | Dot badge (accent color) |
| `completed` | Checkmark |
| `dismissed` | Segment removed |

Badge clears when provider switches to the Protocol tab.

### 4.3 Auto-Switch Behavior

| Context | Default Tab |
|---------|-------------|
| Encounter entered, no protocol | `overview` |
| Protocol becomes active | Auto-switch to `protocol` |
| Protocol dismissed | Revert to `overview` |
| Encounter switched | Reset to `overview` |

### 4.4 Coordination State Extension

```typescript
// Added to CoordinationState
referencePane: {
  expanded: boolean;
  activeTab: 'overview' | 'activity' | 'protocol';
  protocolTabState: ProtocolTabState;
};

type ProtocolTabState = 'hidden' | 'available' | 'active' | 'completed' | 'dismissed';
```

New coordination actions: `OVERVIEW_TAB_CHANGED`, `PROTOCOL_TAB_AVAILABLE`, `PROTOCOL_TAB_ACTIVATED`, `PROTOCOL_TAB_DISMISSED`, `PROTOCOL_TAB_COMPLETED`.

---

## 5. Assessment Category

Protocol severity scoring may introduce a new `ItemCategory` for scored clinical measures (e.g., STarT Back score, functional limitation assessment). These items:

- Have structured input fields (numeric scales, yes/no questions)
- Feed into `ScoringInput` references via `fieldRef`
- Are created via the protocol's scoring panel, not via OmniAdd
- Render in the chart like other items but with a scoring-specific detail view

This is a targeted extension to the existing `ItemCategory` enum, not a new entity type.

---

## 6. Cross-Surface Resolution

### 6.1 ITEM_ADDED Auto-Marking

When a chart item is added from any source (OmniAdd, AI suggestion, protocol `[+]`, scenario event), middleware checks all active protocols for matching orderable items:

```
On ITEM_ADDED:
  For each active protocol:
    For each orderable item:
      If item matches new chart item (category + matchFields):
        dispatch PROTOCOL_ITEM_ADDRESSED
```

This ensures protocol progress updates regardless of how items enter the chart.

### 6.2 Suggestion Dedup

When a protocol orderable has a matching pending suggestion:
- The orderable shows a "Suggested" badge instead of default state
- `[+]` on the orderable dispatches `SUGGESTION_ACCEPTED` (not `ITEM_ADDED`) to avoid creating duplicates
- The suggestion and protocol item resolve together

### 6.3 Multi-Protocol Handling

**Primary protocol:** Driven by CC or primary diagnosis. Full card view in the Protocol tab.

**Addenda:** Secondary protocols and care gap recommendations. Rendered as a compact flat list below the primary protocol, deduplicated against primary protocol items. Items ordered by clinical priority (overdue first).

---

## 7. Prototype Scope Boundaries

| In Scope | Out of Scope |
|----------|-------------|
| Static protocol templates (hardcoded mock data) | Dynamic protocol authoring/editing |
| Mock severity scoring (formula works, inputs simulated) | Real clinical decision support validation |
| Simulated AI auto-detection (demo scenario events) | Real ambient transcription pipeline |
| Single-encounter protocol lifecycle | Cross-encounter protocol continuity |
| Manual protocol search (simple text match) | AI-powered protocol recommendation engine |
| Two demo protocols (LBP, URI) | Full protocol library |
| Level 1-2 patient adaptation | Levels 3-4 (risk-adjusted, AI-generated) |
| Protocol exit state definition | Protocol exit state implementation |

---

## 8. File Inventory

### 8.1 New Components

| Component | File | Purpose |
|-----------|------|---------|
| ProtocolView | `src/components/protocol/ProtocolView.tsx` | Top-level Protocol tab container |
| ProtocolHeader | `src/components/protocol/ProtocolHeader.tsx` | Title, severity badge, completion, actions |
| ProtocolCard | `src/components/protocol/ProtocolCard.tsx` | Collapsed/expanded card with all visual states |
| OrderableItem | `src/components/protocol/items/OrderableItem.tsx` | Orderable item with all states |
| DocumentableItem | `src/components/protocol/items/DocumentableItem.tsx` | Documentable with checkbox + auto-detection |
| GuidanceItem | `src/components/protocol/items/GuidanceItem.tsx` | Guidance prompt with acknowledgment |
| AdvisoryItem | `src/components/protocol/items/AdvisoryItem.tsx` | Persistent warning/constraint |
| SeverityScoringPanel | `src/components/protocol/SeverityScoringPanel.tsx` | Scoring breakdown + path selector |
| ProtocolAddenda | `src/components/protocol/ProtocolAddenda.tsx` | Compact secondary protocol section |
| ProtocolSearch | `src/components/protocol/ProtocolSearch.tsx` | Manual protocol activation search |

### 8.2 State Layer

| Layer | File | Changes |
|-------|------|---------|
| Types | `src/types/protocol.ts` (new) | All protocol types from section 1 |
| Types | `src/types/index.ts` | Re-export protocol types |
| State shape | `src/state/types.ts` | Add `protocols` to entities, `protocolToItems` to relationships |
| Actions | `src/state/actions/protocol-actions.ts` (new) | Protocol action types + creators |
| Reducer | `src/state/reducers/protocol.ts` (new) | Protocol reducer |
| Reducer | `src/state/reducers/root.ts` | Integrate protocol reducer |
| Selectors | `src/state/selectors/protocol.ts` (new) | All selectors from section 1.9 |
| Middleware | `src/state/middleware/sideEffects.ts` | Cross-surface resolution |
| Coordination | `src/state/coordination/types.ts` | Add `referencePane` to CoordinationState |
| Coordination | `src/state/coordination/reducer.ts` | Handle new coordination actions |
| Coordination | `src/state/coordination/selectors.ts` | Protocol tab visibility + badge selectors |
| Utils | `src/utils/protocol-adaptation.ts` (new) | Annotation computation, condition evaluation, matching |
| Mocks | `src/mocks/protocols/` (new dir) | Protocol template registry + LBP + URI templates |

---

## 9. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Auto-expand first card on activation? | **Decided** — yes, `autoExpandFirstCard: true` on template |
| 2 | MA pre-visit protocol usage? | **Deferred** — role-aware access model needed |
| 3 | Protocol versioning during active encounter? | **Deferred** — frozen `templateSnapshot` in prototype |
| 4 | Cross-encounter continuity? | **Deferred** — each encounter starts fresh |
| 5 | Structured skip reasons (vs. free text)? | **Partial** — free text for prototype |
| 6 | Empty protocol state? | **Decided** — "No active protocol" + "Browse protocols" link |
| 7 | Protocol authoring? | **Deferred** — hardcoded mock data only |
| 8 | Conditional items: hide vs. show-inactive? | **Decided** — template decides per item |
| 9 | Care Gaps and protocol addenda overlap? | **Decided** — shared entities, actionable from either surface |
