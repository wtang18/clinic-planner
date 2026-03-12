# History Section Redesign — Problem Detail Drawer

## Overview

Redesign the Activity Log in `ProblemDetailDrawer` into a "History" section with improved layout, encounter-dx deep links, and entry deletion with audit trail.

## Scope

- **Component**: `ProblemDetailDrawer.tsx` → `ActivityLog` (renamed to `HistoryLog`)
- **Types**: `ProblemEvent` in `types.ts`
- **Labels**: `display-labels.ts` (formatEventDescription)
- **State**: `useProblemsState.ts` (new deletion actions)
- **Mock data**: `mock-data.ts` (add encounter/visit metadata to events)

## Entry Layout

Two-line structure for all entries:

```
[Event label]                              [Effective date MM/DD/YYYY]
[Source] — [Activity timestamp MM/DD/YYYY, HH:MMa TZ]
```

- **Line 1 left**: Event label (e.g., "Marked inactive", "Reported", "Imported")
- **Line 1 right**: Effective date in MM/DD/YYYY, right-aligned
- **Line 2**: Source + activity timestamp, secondary color

### Source Patterns (Line 2)

| Origin | Format |
|--------|--------|
| Clinician action | `Dr. Priya Sharma, MD — 09/15/2023, 3:00p PT` |
| Encounter Dx | `Dr. Tanaka, MD, Encounter — 06/02/2018, 11:15a PT` |
| CCDA Import | `System — CCDA Import — 06/02/2018, 8:00a PT` |
| Patient-reported | `Patient — 01/08/2020, 10:00a PT` |
| Screening | `System — PHQ-9 Screening — 02/10/2026, 11:00a PT` |

### Encounter Dx — Visit Name in Label

For encounter-dx entries, line 1 includes the originating visit name as a link:

```
Reported from [Visit Name]                 [Effective date]
[Provider], Encounter — [full timestamp]
```

- Visit name renders in accent color with underline affordance (stub link in prototype)
- "Encounter" acts as a qualifier on the provider in line 2
- Intent: in production, the link navigates to the originating encounter chart

## Sort Order

Sorted by **effective date** (not activity timestamp) in reverse chronological order. Falls back to activity timestamp when no effective date is present.

## Section Header

Renamed from "Activity" to **"History"**. Reflects the clinical timeline nature of the content (sorted by effective date, condition lifecycle events).

## Entry Deletion

### Scope

Any entry is deletable. This is necessary because undo only works for the most recent action — older errors (including incorrect imports or erroneous clinical milestones) have no other correction mechanism.

### Interaction Flow

1. **Hover**: Small `×` icon appears right-aligned next to the effective date
2. **Click `×`**: Row content immediately shows strikethrough + 45% opacity. A reason picker card appears below the struck content, within the same row (above the bottom divider)
3. **Cancel**: Card dismisses, row returns to normal state
4. **Confirm**: Card dismisses, red deletion metadata line appears below struck content. Row briefly shows the deleted state, then collapses out (since "Show deleted" is off by default). Toggle count increments.

### Reason Picker Card

- Clean white card with rounded corners (border-radius: 12px) and subtle shadow
- No side border or accent line
- Title: "Delete this entry?"
- Radio options: Entered in error, Incorrect import, Duplicate, Other
- Buttons: Cancel (ghost), Delete (red fill), right-aligned

### Deleted Entry Display

- Original content: strikethrough + 45% opacity
- Red metadata line below: `Deleted: [reason] — [who] — [timestamp]`
- Default: collapsed (hidden from view)
- Toggle: "Show N deleted" link right-aligned next to "History" header
- When expanded, deleted entries appear in their chronological position in the timeline

### Visual Consistency

The struck/muted styling is identical during the confirmation state (State 2) and the final deleted state (State 3). No visual jump on confirm.

## Data Model Changes

### ProblemEvent additions

```typescript
// New fields on ProblemEvent
deletedAt?: string          // Timestamp of deletion
deletedBy?: string          // Who deleted
deletionReason?: DeletionReason

// New type
type DeletionReason = 'entered-in-error' | 'incorrect-import' | 'duplicate' | 'other'
```

### Encounter metadata

Events originating from encounters need:

```typescript
// New optional fields on ProblemEvent
encounterVisitName?: string   // e.g., "Sore Throat"
encounterDate?: string        // Encounter date (may differ from effectiveDate)
```

### New state actions

- `DELETE_EVENT`: `{ itemId: string, eventId: string, reason: DeletionReason }` — soft-deletes an event (sets deletedAt/deletedBy/deletionReason)

## Key Files

| File | Changes |
|------|---------|
| `ProblemDetailDrawer.tsx` | Replace ActivityLog with HistoryLog; new layout, hover delete, reason picker, show/hide deleted toggle |
| `types.ts` | Add `DeletionReason`, new fields on `ProblemEvent` (`deletedAt`, `deletedBy`, `deletionReason`, `encounterVisitName`, `encounterDate`) |
| `display-labels.ts` | Update `formatEventDescription` if needed |
| `hooks/useProblemsState.ts` | Add `DELETE_EVENT` action handler |
| `mock-data.ts` | Add encounter metadata to relevant events, seed a pre-deleted event for demo |
