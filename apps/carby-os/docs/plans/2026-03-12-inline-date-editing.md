# Inline Date Editing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate edit drawer with inline date fields in the problems list detail drawer, enabling providers to correct onset/abatement dates with fewer clicks.

**Architecture:** Add inline `Input` fields (design system component with `rightIcon="calendar-small"`) to the `SummaryCard` in `ProblemDetailDrawer.tsx`. Build a `DatePickerPopover` component for the hybrid calendar+text interaction. Remove `ProblemEditMode.tsx` entirely, along with the pencil icon, edit mode state, and source date pill from the drawer. The existing `editItem` callback in `useProblemsState` handles persistence and history tracking.

**Tech Stack:** React, TypeScript, Tailwind CSS, `@carbon-health/design-icons`, carby-os design system (`Input` component)

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/features/problems-list/DatePickerPopover.tsx` | Create | Hybrid calendar+text date picker popover |
| `src/features/problems-list/ProblemDetailDrawer.tsx` | Modify | Add inline date fields to SummaryCard, remove source pill + pencil icon |
| `src/features/problems-list/ProblemsListView.tsx` | Modify | Remove edit mode state, `ProblemEditMode` import, pass `onEditDate` instead of `onEditClick` |
| `src/features/problems-list/ProblemEditMode.tsx` | Delete | No longer needed |

---

## Chunk 1: Core Implementation

### Task 1: Create DatePickerPopover Component

**Files:**
- Create: `apps/carby-os/src/features/problems-list/DatePickerPopover.tsx`

This is a self-contained popover that anchors below a date input field. It shows a text input at top (pre-filled with current date) and a mini calendar grid below. Auto-applies on Enter or calendar day click. Dismisses on click-outside or Escape.

- [ ] **Step 1: Create the DatePickerPopover component**

```tsx
// apps/carby-os/src/features/problems-list/DatePickerPopover.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerPopoverProps {
  value: string              // Current date in MM/DD/YY format
  onChange: (date: string) => void  // Called with new MM/DD/YY string
  onClose: () => void
}

// Parse MM/DD/YY to Date object
function parseDate(s: string): Date | null {
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const m = parseInt(parts[0], 10)
  const d = parseInt(parts[1], 10)
  let y = parseInt(parts[2], 10)
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null
  if (y < 100) y += 2000
  return new Date(y, m - 1, d)
}

// Format Date to MM/DD/YY
function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = String(date.getFullYear()).slice(2)
  return `${m}/${d}/${y}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePickerPopover({ value, onChange, onClose }: DatePickerPopoverProps) {
  const [inputValue, setInputValue] = useState(value)
  const parsed = parseDate(value)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth())
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the text input on mount
  useEffect(() => {
    inputRef.current?.select()
  }, [])

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const p = parseDate(inputValue)
      if (p) {
        onChange(formatDate(p))
      }
      onClose()
    }
  }

  const handleDayClick = (day: number) => {
    const date = new Date(viewYear, viewMonth, day)
    onChange(formatDate(date))
    onClose()
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const selectedDate = parseDate(value)
  const isSelectedDay = (day: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day

  const todayDate = new Date()
  const isToday = (day: number) =>
    todayDate.getFullYear() === viewYear &&
    todayDate.getMonth() === viewMonth &&
    todayDate.getDate() === day

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-border-neutral-low p-3 w-[260px]"
    >
      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="MM/DD/YY"
        className="w-full border border-border-neutral-low rounded-lg px-3 py-2 text-body-sm-regular text-fg-neutral-primary outline-none focus:shadow-[0_0_0_2px_var(--color-bg-input-high)] mb-3"
      />

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-bg-transparent-low text-fg-neutral-secondary"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-label-sm-medium text-fg-neutral-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-bg-transparent-low text-fg-neutral-secondary"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-body-xs-regular text-fg-neutral-disabled py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const selected = isSelectedDay(day)
          const today = isToday(day)
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-body-sm-regular transition-colors
                ${selected
                  ? 'bg-fg-neutral-primary text-white font-medium'
                  : today
                    ? 'bg-bg-transparent-low text-fg-neutral-primary font-medium hover:bg-bg-transparent-medium'
                    : 'text-fg-neutral-secondary hover:bg-bg-transparent-low'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/carby-os/src/features/problems-list/DatePickerPopover.tsx
git commit -m "feat: add DatePickerPopover component for inline date editing"
```

---

### Task 2: Add Inline Date Fields to SummaryCard

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx`

Add date input fields below the pill row in SummaryCard. The fields use the design system `Input` component with `rightIcon="calendar-small"` and `size="small"`. Clicking the calendar icon or the field opens the `DatePickerPopover`. Remove the source date pill and pencil icon.

**Key changes to SummaryCard:**

1. Add `onEditDate` prop: `(id: string, field: 'onsetDate' | 'abatementDate', value: string) => void`
2. Remove `sourcePillLabel` prop
3. Remove `onEditClick` prop and pencil icon button
4. Remove source date `<Pill>` from pill row (line ~307)
5. Add date row after pill row with:
   - "Onset" `Input` — always shown, value from `item.onsetDate ?? item.sourceDate`
   - End date `Input` — shown only when `clinicalStatus` is `'inactive'` or `'resolved'`
   - Label adapts by category: conditions/encounter-dx → "Inactive since", sdoh/health-concern → "Resolved"

- [ ] **Step 1: Add imports and update SummaryCardProps**

In `ProblemDetailDrawer.tsx`:

Remove these imports that are no longer needed:
- `getSourcePillLabel` from display-labels import

Add new import:
```tsx
import { DatePickerPopover } from './DatePickerPopover'
```

Update `SummaryCardProps`:
- Remove: `sourcePillLabel: string`
- Remove: `onEditClick: () => void`
- Add: `onEditDate: (id: string, field: 'onsetDate' | 'abatementDate', value: string) => void`

Update `ProblemDetailDrawerProps`:
- Remove: `onEditClick: () => void`
- Add: `onEditDate: (id: string, field: 'onsetDate' | 'abatementDate', value: string) => void`

- [ ] **Step 2: Update SummaryCard rendering**

Remove the pencil icon button from Row 1 (the `<button onClick={onEditClick}>` with the pencil Icon).

Remove the source date pill from the pill row:
```tsx
// DELETE this line:
<Pill type="transparent" size="small" subtextL={sourcePillLabel} label={...} />
```

Add date row after the pill row `</div>` and before the notes section:

```tsx
{/* Date fields */}
<DateFields item={item} onEditDate={onEditDate} />
```

- [ ] **Step 3: Create the DateFields subcomponent**

Add this component inside `ProblemDetailDrawer.tsx` (below SummaryCard):

```tsx
/* ─── Inline Date Fields ─── */

function DateFields({ item, onEditDate }: {
  item: ProblemItem
  onEditDate: (id: string, field: 'onsetDate' | 'abatementDate', value: string) => void
}) {
  const [openPicker, setOpenPicker] = useState<'onset' | 'abatement' | null>(null)

  const onsetValue = item.onsetDate ?? item.sourceDate
  const showAbatement = item.clinicalStatus === 'inactive' || item.clinicalStatus === 'resolved'
  const abatementLabel = (item.category === 'sdoh' || item.category === 'health-concern')
    ? 'Resolved'
    : 'Inactive since'

  return (
    <div className="flex gap-3 mt-4">
      {/* Onset */}
      <div className="relative flex-1 max-w-[200px]">
        <Input
          label="Onset"
          size="small"
          value={onsetValue}
          readOnly
          rightIcon="calendar-small"
          onClick={() => setOpenPicker(openPicker === 'onset' ? null : 'onset')}
          containerClassName="cursor-pointer"
        />
        {openPicker === 'onset' && (
          <DatePickerPopover
            value={onsetValue}
            onChange={(v) => onEditDate(item.id, 'onsetDate', v)}
            onClose={() => setOpenPicker(null)}
          />
        )}
      </div>

      {/* Abatement — only when inactive/resolved */}
      {showAbatement && (
        <div className="relative flex-1 max-w-[200px]">
          <Input
            label={abatementLabel}
            size="small"
            value={item.abatementDate ?? ''}
            readOnly
            rightIcon="calendar-small"
            onClick={() => setOpenPicker(openPicker === 'abatement' ? null : 'abatement')}
            containerClassName="cursor-pointer"
          />
          {openPicker === 'abatement' && (
            <DatePickerPopover
              value={item.abatementDate ?? ''}
              onChange={(v) => onEditDate(item.id, 'abatementDate', v)}
              onClose={() => setOpenPicker(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update ProblemDetailDrawer to wire onEditDate and remove sourcePillLabel**

In the `ProblemDetailDrawer` function body:
- Remove: `const sourcePillLabel = getSourcePillLabel(item)`
- Remove `sourcePillLabel` from `<SummaryCard>` props
- Remove `onEditClick` from `<SummaryCard>` props
- Add `onEditDate` to `<SummaryCard>` props

- [ ] **Step 5: Verify it compiles**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors (will have errors until Task 3 updates ProblemsListView — fix those next)

- [ ] **Step 6: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx
git commit -m "feat: add inline date fields to summary card, remove source pill and pencil icon"
```

---

### Task 3: Update ProblemsListView and Remove ProblemEditMode

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemsListView.tsx`
- Delete: `apps/carby-os/src/features/problems-list/ProblemEditMode.tsx`

Wire the new `onEditDate` callback from `ProblemDetailDrawer` to `editItem` in `useProblemsState`. Remove all edit mode state and the `ProblemEditMode` component.

- [ ] **Step 1: Create editDate helper using existing editItem**

The existing `editItem(id, fieldUpdates, changes)` already handles field updates + history events. We need a thin wrapper that converts a single date change into the right format.

In `ProblemsListView.tsx`:

```tsx
// Helper: convert inline date change to editItem format
const editDate = useCallback((id: string, field: 'onsetDate' | 'abatementDate', value: string) => {
  const item = items.find(i => i.id === id)
  if (!item) return
  const fieldLabel = field === 'onsetDate' ? 'Onset Date' : 'Abatement Date'
  const oldValue = field === 'onsetDate' ? (item.onsetDate ?? item.sourceDate) : (item.abatementDate ?? '')
  if (value === oldValue) return
  editItem(id, { [field]: value }, [{ field: fieldLabel, from: oldValue, to: value }])
}, [items, editItem])
```

Note: `items` must be added to the destructured values from `useProblemsState()`.

- [ ] **Step 2: Update ProblemsListView**

Remove:
- `import { ProblemEditMode } from './ProblemEditMode'`
- `const [isEditing, setIsEditing] = useState(false)`
- The entire `{selectedItem && isEditing && <ProblemEditMode ... />}` block
- `onEditClick={() => setIsEditing(true)}` from ProblemDetailDrawer props

Add:
- `items` to the destructured values from `useProblemsState()`
- `onEditDate={editDate}` to ProblemDetailDrawer props

Change the detail drawer condition from `{selectedItem && !isEditing && (` to just `{selectedItem && (`.

- [ ] **Step 3: Delete ProblemEditMode.tsx**

```bash
rm apps/carby-os/src/features/problems-list/ProblemEditMode.tsx
```

- [ ] **Step 4: Verify it compiles**

Run: `cd apps/carby-os && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemsListView.tsx
git rm apps/carby-os/src/features/problems-list/ProblemEditMode.tsx
git commit -m "feat: wire inline date editing, remove ProblemEditMode"
```

---

### Task 4: Clean Up Unused References

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx` (if any unused imports remain)
- Modify: `apps/carby-os/src/features/problems-list/display-labels.ts` (remove `EDIT_TITLE` if unused)

- [ ] **Step 1: Check for orphaned references**

Search for `EDIT_TITLE`, `ProblemEditMode`, `onEditClick`, `isEditing` across the codebase:

```bash
cd apps/carby-os && grep -r "EDIT_TITLE\|ProblemEditMode\|onEditClick\|isEditing" src/features/problems-list/
```

- [ ] **Step 2: Remove any orphaned exports/imports**

Remove `EDIT_TITLE` from `display-labels.ts` if it's no longer imported anywhere.

Remove `getSourcePillLabel` from the import in `ProblemDetailDrawer.tsx` if no longer used there (it's still used in `ProblemCard.tsx` so the export stays).

- [ ] **Step 3: Verify it compiles and run tests**

```bash
cd apps/carby-os && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add -A apps/carby-os/src/features/problems-list/
git commit -m "chore: remove unused EDIT_TITLE, clean up orphaned imports"
```

---

### Task 5: Visual Verification

- [ ] **Step 1: Start the dev server and test all date field states**

```bash
cd apps/carby-os && npm run dev
```

Verify:
1. **Active condition** (e.g., Essential Hypertension): Shows "Onset" input with date, no end date field
2. **Unconfirmed condition** (e.g., Chronic Low Back Pain): Shows "Onset" input
3. **Inactive/resolved item**: Shows both "Onset" and "Inactive since" / "Resolved" inputs
4. **Excluded item**: Shows "Onset" input only
5. **Click calendar icon**: DatePickerPopover opens below the field
6. **Click a day**: Date updates immediately, popover closes, history shows "Edited" entry
7. **Type in popover text input + Enter**: Same behavior
8. **Click outside / Escape**: Popover closes without change
9. **No pencil icon** visible in summary card
10. **No source date pill** in detail drawer (but still present on list cards)
11. **Recurrence item** (Asthma): Shows "Onset" input only

- [ ] **Step 2: Commit any visual fixes**

If any adjustments needed, fix and commit.
