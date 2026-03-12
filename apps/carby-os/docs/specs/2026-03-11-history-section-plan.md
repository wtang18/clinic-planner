# History Section Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ActivityLog in ProblemDetailDrawer with a redesigned "History" section featuring improved layout, encounter-dx deep links, and entry deletion with audit trail.

**Architecture:** Extend `ProblemEvent` with deletion and encounter metadata fields. Replace the inline `ActivityLog` component with a new `HistoryLog` component in the same file. Add a `deleteEvent` action to `useProblemsState`. All changes are within `apps/carby-os/src/features/problems-list/`.

**Tech Stack:** React, TypeScript, Tailwind CSS (carby-os uses Tailwind, not inline styles)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `types.ts` | Modify | Add `DeletionReason`, new fields on `ProblemEvent` |
| `mock-data.ts` | Modify | Add encounter metadata to enc-dx events, seed one pre-deleted event |
| `hooks/useProblemsState.ts` | Modify | Add `deleteEvent` action |
| `ProblemDetailDrawer.tsx` | Modify | Replace `ActivityLog` with `HistoryLog`, new layout/delete/toggle |
| `ProblemsListView.tsx` | Modify | Thread `onDeleteEvent` prop |

---

## Chunk 1: Data Model + State

### Task 1: Extend ProblemEvent type

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/types.ts`

- [ ] **Step 1: Add DeletionReason type and new ProblemEvent fields**

```typescript
// After RemovalReason type (line 36)
export type DeletionReason = 'entered-in-error' | 'incorrect-import' | 'duplicate' | 'other'
```

Add to `ProblemEvent` interface:

```typescript
// New optional fields
deletedAt?: string
deletedBy?: string
deletionReason?: DeletionReason
encounterVisitName?: string
encounterDate?: string
```

- [ ] **Step 2: Verify types compile**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/carby-os/src/features/problems-list/types.ts
git commit -m "feat(problems): add DeletionReason type and encounter/deletion fields to ProblemEvent"
```

### Task 2: Add encounter metadata to mock data

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/mock-data.ts`

- [ ] **Step 1: Add `encounterVisitName` to encounter-dx events**

For `enc-1` (Acute Sinusitis): Add `encounterVisitName: 'Sore Throat'` to its `reported`/`confirmed`/`marked-active` events.

For `enc-2` (UTI): Add `encounterVisitName: 'Urinary Tract Infection'` to its events.

For `enc-3` (Vitamin D Deficiency): Add `encounterVisitName: 'Annual Wellness Visit'` to its events.

- [ ] **Step 2: Seed one pre-deleted event for demo**

Add a deleted event to `cond-4` (Asthma) history — an erroneous "marked-resolved" that was deleted:

```typescript
{
  id: 'evt-4f',
  type: 'marked-resolved',
  performedBy: 'Dr. Priya Sharma, MD',
  performedAt: '09/15/23, 2:55p PT',
  effectiveDate: '09/15/23',
  deletedAt: '09/16/23, 9:00a PT',
  deletedBy: 'Dr. Priya Sharma, MD',
  deletionReason: 'entered-in-error' as const,
},
```

Insert after `evt-4b` (the correct marked-inactive event).

- [ ] **Step 3: Verify types compile**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/mock-data.ts
git commit -m "feat(problems): add encounter visit names and seeded deleted event to mock data"
```

### Task 3: Add deleteEvent action to state hook

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts`

- [ ] **Step 1: Import DeletionReason type**

Add `DeletionReason` to the import from `../types`.

- [ ] **Step 2: Add deleteEvent callback**

After `editItem` (line ~222):

```typescript
const deleteEvent = useCallback((itemId: string, eventId: string, reason: DeletionReason) => {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const ampm = h >= 12 ? 'p' : 'a'
  const h12 = h % 12 || 12
  const mm = String(m).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const yr = String(now.getFullYear()).slice(2)
  const timestamp = `${month}/${day}/${yr}, ${h12}:${mm}${ampm} PT`

  setItems(prev => prev.map(item => {
    if (item.id !== itemId) return item
    return {
      ...item,
      history: item.history.map(evt =>
        evt.id === eventId
          ? { ...evt, deletedAt: timestamp, deletedBy: MOCK_PERFORMER, deletionReason: reason }
          : evt
      ),
    }
  }))
}, [])
```

- [ ] **Step 3: Add deleteEvent to return object**

Add `deleteEvent` to the returned object.

- [ ] **Step 4: Verify types compile**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts
git commit -m "feat(problems): add deleteEvent action for soft-deleting history entries"
```

---

## Chunk 2: HistoryLog Component

### Task 4: Replace ActivityLog with HistoryLog in ProblemDetailDrawer

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx`

This is the main UI task. Replace the `ActivityLog` component (lines 445–509) with a new `HistoryLog` component.

- [ ] **Step 1: Add `onDeleteEvent` prop to ProblemDetailDrawerProps**

```typescript
onDeleteEvent: (itemId: string, eventId: string, reason: DeletionReason) => void
```

Import `DeletionReason` from `./types`.

- [ ] **Step 2: Thread `onDeleteEvent` through to HistoryLog**

Pass `onDeleteEvent` from the drawer component down. The drawer already has `item` available.

- [ ] **Step 3: Replace ActivityLog with HistoryLog**

Delete the `ActivityLog` component and `DATABLE_EVENTS`/`parseDateForSort` helpers. Replace with `HistoryLog`:

```tsx
/* ─── History Log ─── */

type DeletionReasonOption = { value: DeletionReason; label: string }

const DELETION_REASONS: DeletionReasonOption[] = [
  { value: 'entered-in-error', label: 'Entered in error' },
  { value: 'incorrect-import', label: 'Incorrect import' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'other', label: 'Other' },
]

/** Parse MM/DD/YY (with optional time suffix) to a sortable timestamp */
function parseDateForSort(dateStr: string): number {
  const [datePart] = dateStr.split(',')
  const [month, day, year] = datePart.trim().split('/')
  return new Date(parseInt(year) + 2000, parseInt(month) - 1, parseInt(day)).getTime()
}

interface HistoryLogProps {
  item: ProblemItem
  onDeleteEvent: (itemId: string, eventId: string, reason: DeletionReason) => void
}

function HistoryLog({ item, onDeleteEvent }: HistoryLogProps) {
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<DeletionReason>('entered-in-error')

  // Sort by effective date descending, fallback to performedAt
  const sortedHistory = useMemo(() => {
    return [...item.history].sort((a, b) => {
      const dateA = a.effectiveDate ?? a.performedAt
      const dateB = b.effectiveDate ?? b.performedAt
      return parseDateForSort(dateB) - parseDateForSort(dateA)
    })
  }, [item.history])

  const deletedCount = useMemo(() =>
    item.history.filter(e => e.deletedAt).length
  , [item.history])

  const visibleHistory = useMemo(() =>
    showDeleted ? sortedHistory : sortedHistory.filter(e => !e.deletedAt || e.id === deletingEventId)
  , [sortedHistory, showDeleted, deletingEventId])

  const handleDeleteConfirm = (eventId: string) => {
    onDeleteEvent(item.id, eventId, selectedReason)
    setDeletingEventId(null)
    setSelectedReason('entered-in-error')
  }

  const handleDeleteCancel = () => {
    setDeletingEventId(null)
    setSelectedReason('entered-in-error')
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-label-sm-medium text-fg-neutral-secondary">History</h3>
        {deletedCount > 0 && (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="text-label-xs-medium text-fg-accent-primary hover:opacity-70 transition-opacity"
          >
            {showDeleted ? 'Hide deleted' : `Show ${deletedCount} deleted`}
          </button>
        )}
      </div>

      {/* Entries */}
      {visibleHistory.map((event, i) => {
        const isDeleted = !!event.deletedAt
        const isBeingDeleted = deletingEventId === event.id

        return (
          <div key={event.id}>
            {i > 0 && <div className="border-t border-fg-transparent-soft" />}
            <div
              className={`group py-2.5 flex flex-col gap-0.5 ${isDeleted || isBeingDeleted ? 'opacity-45' : ''}`}
            >
              {/* Line 1: Event label + effective date */}
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-body-sm-medium text-fg-neutral-primary ${isDeleted || isBeingDeleted ? 'line-through' : ''}`}>
                  {formatEventLabel(event)}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-body-xs-regular text-fg-neutral-secondary whitespace-nowrap ${isDeleted || isBeingDeleted ? 'line-through' : ''}`}>
                    {formatEffectiveDate(event)}
                  </span>
                  {/* Delete icon — hover only, not on deleted entries */}
                  {!isDeleted && !isBeingDeleted && (
                    <button
                      onClick={() => setDeletingEventId(event.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-fg-neutral-secondary opacity-0 group-hover:opacity-100 hover:bg-bg-transparent-low transition-all"
                    >
                      <Icon name="trash" size="small" />
                    </button>
                  )}
                </div>
              </div>

              {/* Line 2: Source + timestamp */}
              <span className={`text-body-xs-regular text-fg-neutral-secondary ${isDeleted || isBeingDeleted ? 'line-through' : ''}`}>
                {formatSourceLine(event)}
              </span>

              {/* Notes */}
              {event.note && !isDeleted && !isBeingDeleted && (
                <span className="text-body-xs-regular text-fg-neutral-secondary">{event.note}</span>
              )}

              {/* Event-edited changes */}
              {event.type === 'event-edited' && event.changes?.[0] && !isDeleted && !isBeingDeleted && (
                <span className="text-body-xs-regular text-fg-neutral-secondary">
                  Date changed: {event.changes[0].from} &rarr; {event.changes[0].to}
                </span>
              )}

              {/* Deletion metadata (for already-deleted entries) */}
              {isDeleted && !isBeingDeleted && (
                <span className="text-label-2xs-medium text-fg-alert-secondary mt-0.5" style={{ opacity: 1 }}>
                  Deleted: {formatDeletionReason(event.deletionReason)} — {event.deletedBy} — {event.deletedAt}
                </span>
              )}

              {/* Deletion reason picker card (for entry being deleted) */}
              {isBeingDeleted && (
                <div className="bg-white rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5 mt-2.5">
                  <span className="text-label-sm-medium text-fg-neutral-primary">Delete this entry?</span>
                  <div className="flex flex-col gap-1">
                    {DELETION_REASONS.map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input
                          type="radio"
                          name="deletion-reason"
                          checked={selectedReason === value}
                          onChange={() => setSelectedReason(value)}
                          className="accent-[var(--color-fg-neutral-primary)]"
                        />
                        <span className="text-body-sm-regular text-fg-neutral-primary">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end mt-0.5">
                    <Button type="transparent" size="small" label="Cancel" onClick={handleDeleteCancel} />
                    <Button type="high-impact" size="small" label="Delete" onClick={() => handleDeleteConfirm(event.id)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {item.history.length === 0 && (
        <p className="text-body-sm-regular text-fg-neutral-secondary py-2">No history recorded.</p>
      )}
    </div>
  )
}

/* ─── History Formatters ─── */

/** Line 1 label: includes "from [Visit Name]" for encounter-dx origin events */
function formatEventLabel(event: ProblemEvent): React.ReactNode {
  const baseLabel = formatEventDescription(event.type)
  if (event.encounterVisitName && (event.type === 'reported' || event.type === 'confirmed' || event.type === 'marked-active')) {
    return (
      <>
        {baseLabel} from{' '}
        <span className="text-fg-accent-primary underline decoration-fg-accent-primary/30 underline-offset-2 cursor-pointer">
          {event.encounterVisitName}
        </span>
      </>
    )
  }
  return baseLabel
}

/** Right-aligned effective date — falls back to performedAt date portion */
function formatEffectiveDate(event: ProblemEvent): string {
  if (event.effectiveDate) {
    return expandDate(event.effectiveDate)
  }
  const [datePart] = event.performedAt.split(',')
  return expandDate(datePart.trim())
}

/** Expand MM/DD/YY to MM/DD/YYYY */
function expandDate(short: string): string {
  const parts = short.split('/')
  if (parts.length === 3 && parts[2].length === 2) {
    return `${parts[0]}/${parts[1]}/20${parts[2]}`
  }
  return short
}

/** Line 2: Source + timestamp. Encounter-dx entries show "[Provider], Encounter — [timestamp]" */
function formatSourceLine(event: ProblemEvent): string {
  if (event.encounterVisitName) {
    return `${event.performedBy}, Encounter — ${event.performedAt}`
  }
  return `${event.performedBy} — ${event.performedAt}`
}

/** Human-readable deletion reason */
function formatDeletionReason(reason?: DeletionReason): string {
  switch (reason) {
    case 'entered-in-error': return 'entered in error'
    case 'incorrect-import': return 'incorrect import'
    case 'duplicate': return 'duplicate'
    case 'other': return 'other'
    default: return 'unknown'
  }
}
```

- [ ] **Step 4: Update the drawer body to use HistoryLog**

Replace `<ActivityLog item={item} />` (around line 131) with:

```tsx
<HistoryLog item={item} onDeleteEvent={onDeleteEvent} />
```

Remove the "Activity" `<h4>` section title wrapper — `HistoryLog` renders its own "History" header.

- [ ] **Step 5: Verify types compile**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx
git commit -m "feat(problems): replace ActivityLog with HistoryLog — new layout, deletion, encounter links"
```

---

## Chunk 3: Wire Up + Verify

### Task 5: Thread deleteEvent through ProblemsListView

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemsListView.tsx`

- [ ] **Step 1: Destructure deleteEvent from useProblemsState**

Add `deleteEvent` to the destructured return of `useProblemsState()`.

- [ ] **Step 2: Pass onDeleteEvent to ProblemDetailDrawer**

Add `onDeleteEvent={deleteEvent}` to the `<ProblemDetailDrawer>` JSX (around line 136).

- [ ] **Step 3: Verify types compile**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemsListView.tsx
git commit -m "feat(problems): wire deleteEvent to ProblemDetailDrawer"
```

### Task 6: Visual verification

- [ ] **Step 1: Start dev server**

Run: `cd apps/carby-os && npm run dev`

- [ ] **Step 2: Manual checks**

1. Open any problem detail drawer → verify "History" header (not "Activity")
2. Verify entries sorted by effective date descending
3. Verify line 1: event label left, effective date (MM/DD/YYYY) right
4. Verify line 2: source — timestamp format
5. Open an encounter-dx item → verify "Reported from [Visit Name]" with accent link
6. Verify encounter-dx line 2 shows "[Provider], Encounter — [timestamp]"
7. Hover a history entry → verify trash icon appears
8. Click × → verify row goes strikethrough/muted, reason card appears within row
9. Cancel → verify row returns to normal
10. Confirm deletion → verify card dismisses, entry hides (since toggle is off)
11. Verify "Show N deleted" toggle appears and expands/collapses deleted entries
12. Open cond-4 (Asthma) → verify pre-seeded deleted entry shows via toggle
13. Verify deleted entries show red metadata line: reason, who, when

- [ ] **Step 3: Final commit if any fixes needed**
