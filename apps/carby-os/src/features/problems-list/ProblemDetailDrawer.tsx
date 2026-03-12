import React, { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { Icon } from '@carbon-health/design-icons'
import type { ProblemItem, RemovalReason, DeletionReason, ProblemEvent } from './types'
import {
  DRAWER_TITLE,
  SOFT_CLOSE_LABEL,
  ACTIVATE_FROM_INACTIVE_LABEL,
  ACTIVATE_FROM_CONFIRMED_LABEL,
  getDisplayStatus,
  formatEventDescription,
  isConfirmedTransitional,
} from './display-labels'
import { Pill, Button, Input } from '@/design-system'
import { screeningInstruments } from './mock-data'
import { ScreeningDetailCard } from './ScreeningBanner'
import { DatePickerPopover } from './DatePickerPopover'

interface ProblemDetailDrawerProps {
  item: ProblemItem
  onClose: () => void
  onConfirm: (id: string) => void
  onExclude: (id: string) => void
  onUndoExclude: (id: string) => void
  onUndoConfirm: (id: string) => void
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onMarkAddressed: (id: string) => void
  onNoteRecurrence: (id: string) => void
  onReopen: (id: string) => void
  onUndoMarkActive: (id: string) => void
  onUndoMarkInactive: (id: string) => void
  onUndoMarkResolved: (id: string) => void
  onUndoMarkAddressed: (id: string) => void
  onUndoReopen: (id: string) => void
  onUndoRecurrence: (id: string) => void
  onRemove: (id: string, reason: RemovalReason) => void
  onEditDate: (id: string, field: 'onsetDate' | 'abatementDate', value: string) => void
  onDeleteEvent: (itemId: string, eventId: string, reason: DeletionReason) => void
  onUndoDeleteEvent: (itemId: string, eventId: string) => void
}

/** Can recurrence apply? Only conditions and encounter-dx */
function supportsRecurrence(item: ProblemItem): boolean {
  return item.category === 'condition' || item.category === 'encounter-dx'
}

export function ProblemDetailDrawer({
  item,
  onClose,
  onConfirm,
  onExclude,
  onUndoExclude,
  onUndoConfirm,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onMarkAddressed,
  onNoteRecurrence,
  onReopen,
  onUndoMarkActive,
  onUndoMarkInactive,
  onUndoMarkResolved,
  onUndoMarkAddressed,
  onUndoReopen,
  onUndoRecurrence,
  onRemove,
  onEditDate,
  onDeleteEvent,
  onUndoDeleteEvent,
}: ProblemDetailDrawerProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [removeReason, setRemoveReason] = useState<RemovalReason>('entered-in-error')

  const title = DRAWER_TITLE[item.category]
  const relatedScreening = item.relatedScreeningId
    ? screeningInstruments.find(s => s.id === item.relatedScreeningId)
    : undefined

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-neutral-low">
          <h2 className="text-base font-semibold text-fg-neutral-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
          {/* Summary card */}
          <SummaryCard
            item={item}
            onConfirm={onConfirm}
            onExclude={onExclude}
            onUndoExclude={onUndoExclude}
            onUndoConfirm={onUndoConfirm}
            onMarkActive={onMarkActive}
            onMarkInactive={onMarkInactive}
            onMarkResolved={onMarkResolved}
            onMarkAddressed={onMarkAddressed}
            onNoteRecurrence={onNoteRecurrence}
            onReopen={onReopen}
            onUndoMarkActive={onUndoMarkActive}
            onUndoMarkInactive={onUndoMarkInactive}
            onUndoMarkResolved={onUndoMarkResolved}
            onUndoMarkAddressed={onUndoMarkAddressed}
            onUndoReopen={onUndoReopen}
            onUndoRecurrence={onUndoRecurrence}
            onEditDate={onEditDate}
            onRemoveClick={() => setShowRemoveConfirm(true)}
          />

          {/* Related Screening (SDOH only) */}
          {relatedScreening && (
            <ScreeningDetailCard screening={relatedScreening} />
          )}

          {/* History log */}
          <HistoryLog item={item} onDeleteEvent={onDeleteEvent} onUndoDeleteEvent={onUndoDeleteEvent} />
        </div>

      </div>

      {/* Remove confirmation alert dialog */}
      {showRemoveConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowRemoveConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl shadow-xl w-[400px] flex flex-col">
            <div className="px-6 pt-6 pb-4 flex flex-col gap-3">
              <h3 className="text-base font-semibold text-fg-neutral-primary">Remove from Problem List</h3>
              <p className="text-sm text-fg-neutral-secondary">
                Remove &ldquo;{item.description}&rdquo; from this patient&rsquo;s problem list. Select a reason for removal.
              </p>
              <div className="flex flex-col gap-1.5 mt-1">
                {([
                  { value: 'entered-in-error' as const, label: 'Entered in Error' },
                  { value: 'duplicate' as const, label: 'Duplicate' },
                  { value: 'replaced' as const, label: 'Replaced' },
                  { value: 'patient-disputed' as const, label: 'Patient Disputed' },
                ] as const).map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="remove-reason"
                      checked={removeReason === value}
                      onChange={() => setRemoveReason(value)}
                      className="accent-[var(--color-fg-neutral-primary)]"
                    />
                    <span className="text-sm text-fg-neutral-primary">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border-neutral-low flex items-center justify-end gap-2">
              <Button type="transparent" size="medium" label="Cancel" onClick={() => setShowRemoveConfirm(false)} />
              <Button
                type="high-impact"
                size="medium"
                label="Remove"
                onClick={() => {
                  onRemove(item.id, removeReason)
                  onClose()
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* ─── Summary Card ─── */

interface SummaryCardProps {
  item: ProblemItem
  onConfirm: (id: string) => void
  onExclude: (id: string) => void
  onUndoExclude: (id: string) => void
  onUndoConfirm: (id: string) => void
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onMarkAddressed: (id: string) => void
  onNoteRecurrence: (id: string) => void
  onReopen: (id: string) => void
  onUndoMarkActive: (id: string) => void
  onUndoMarkInactive: (id: string) => void
  onUndoMarkResolved: (id: string) => void
  onUndoMarkAddressed: (id: string) => void
  onUndoReopen: (id: string) => void
  onUndoRecurrence: (id: string) => void
  onEditDate: (id: string, field: 'onsetDate' | 'abatementDate', value: string) => void
  onRemoveClick: () => void
}

type KebabAction = { label: string; handler: (id: string) => void; destructive?: boolean; disabled?: boolean }

function SummaryCard({
  item,
  onConfirm,
  onExclude,
  onUndoExclude,
  onUndoConfirm,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onMarkAddressed,
  onNoteRecurrence,
  onReopen,
  onUndoMarkActive,
  onUndoMarkInactive,
  onUndoMarkResolved,
  onUndoMarkAddressed,
  onUndoReopen,
  onUndoRecurrence,
  onEditDate,
  onRemoveClick,
}: SummaryCardProps) {
  const [kebabOpen, setKebabOpen] = useState(false)
  const actions = getCardActions(item)
  const kebabGroups = getKebabGroups(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col">
      {/* Row 1: description + icon buttons */}
      <div className="flex justify-between gap-2">
        <p className="text-heading-md-bold text-fg-neutral-primary leading-7">{item.description}</p>
        <div className="flex items-start shrink-0">
          <div className="relative">
            <button
              onClick={() => setKebabOpen(!kebabOpen)}
              className="w-6 h-6 flex items-center justify-center text-fg-neutral-primary hover:opacity-70 transition-opacity"
            >
              <Icon name="more-vertical" size="medium" />
            </button>
            {kebabOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setKebabOpen(false)} />
                <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-md border border-border-transparent-soft py-1 min-w-[180px]">
                  {kebabGroups.map((group, gi) => (
                    <div key={gi}>
                      {gi > 0 && <div className="my-1 border-t border-fg-transparent-soft" />}
                      {group.map(action => (
                        <button
                          key={action.label}
                          disabled={action.disabled}
                          onClick={() => { if (!action.disabled) { action.handler(item.id); setKebabOpen(false) } }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${action.disabled ? 'text-fg-neutral-disabled cursor-not-allowed' : action.destructive ? 'text-fg-alert-secondary hover:bg-bg-transparent-low' : 'text-fg-neutral-primary hover:bg-bg-transparent-low'}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pill row — 8px below header */}
      <div className="flex items-center gap-1.5 flex-wrap mt-2">
        {item.verificationStatus === 'unconfirmed' && (
          <Pill type="attention" size="small" label="Unconfirmed" />
        )}
        {isConfirmedTransitional(item) && (
          <Pill type="transparent" size="small" label="Confirmed" />
        )}
        {item.verificationStatus === 'confirmed' && (item.clinicalStatus === 'active' || item.clinicalStatus === 'recurrence') && !isConfirmedTransitional(item) && (
          <Pill type="info-emphasis" size="small" label={item.clinicalStatus === 'recurrence' ? 'Recurrence' : 'Active'} />
        )}
        {item.verificationStatus === 'confirmed' && item.clinicalStatus !== 'active' && item.clinicalStatus !== 'recurrence' && (
          <Pill type="subtle-outlined" size="small" label={getDisplayStatus(item)} />
        )}
        {item.verificationStatus === 'excluded' && (
          <Pill type="subtle-outlined" size="small" label="Excluded" />
        )}
        {item.icdCode && (
          <Pill type="transparent" size="small" label={item.icdCode} />
        )}
      </div>

      {/* Inline date fields */}
      <DateFields item={item} onEditDate={onEditDate} />

      {/* Notes (if present) */}
      {item.notes && (
        <p className="text-sm text-fg-neutral-secondary mt-4">{item.notes}</p>
      )}

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 pt-6">
          {actions.map(action => (
            <Button
              key={action.label}
              type="transparent"
              size="medium"
              label={action.label}
              onClick={() => action.handler(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  function getCardActions(it: ProblemItem): Array<{ label: string; handler: (id: string) => void }> {
    const result: Array<{ label: string; handler: (id: string) => void }> = []
    const cat = it.category

    if (it.verificationStatus === 'unconfirmed') {
      result.push({ label: 'Exclude', handler: onExclude })
      result.push({ label: 'Confirm', handler: onConfirm })
      return result
    }

    if (it.verificationStatus === 'excluded') {
      result.push({ label: 'Undo Exclude', handler: onUndoExclude })
      return result
    }

    const isTransitional = it.verificationStatus === 'confirmed'
      && it.clinicalStatus === 'active'
      && isConfirmedTransitional(it)

    if (isTransitional) {
      const softCloseHandler = getSoftCloseHandler(cat)
      if (softCloseHandler) result.push({ label: SOFT_CLOSE_LABEL[cat], handler: softCloseHandler })
      result.push({ label: ACTIVATE_FROM_CONFIRMED_LABEL[cat], handler: onMarkActive })
      return result
    }

    if (it.clinicalStatus === 'active' || it.clinicalStatus === 'recurrence') {
      const softCloseHandler = getSoftCloseHandler(cat)
      if (softCloseHandler) result.push({ label: SOFT_CLOSE_LABEL[cat], handler: softCloseHandler })
      return result
    }

    if (it.clinicalStatus === 'inactive' || it.clinicalStatus === 'resolved') {
      const activateHandler = (cat === 'sdoh' || cat === 'health-concern') ? onReopen : onMarkActive
      result.push({ label: ACTIVATE_FROM_INACTIVE_LABEL[cat], handler: activateHandler })
      return result
    }

    return result
  }

  /** Kebab menu: grouped actions — undo, record management, destructive */
  function getKebabGroups(it: ProblemItem): KebabAction[][] {
    const groups: KebabAction[][] = []
    const cat = it.category
    const isCondLike = cat === 'condition' || cat === 'encounter-dx'

    // Group 1: Undo actions + Note Recurrence
    const undoGroup: KebabAction[] = []

    if (it.verificationStatus === 'confirmed') {
      undoGroup.push({ label: 'Undo Confirm', handler: onUndoConfirm })
    }

    if (it.verificationStatus === 'confirmed') {
      if (it.clinicalStatus === 'active' && !isConfirmedTransitional(it)) {
        undoGroup.push({ label: 'Undo Mark Active', handler: onUndoMarkActive })
      }
      if (it.clinicalStatus === 'inactive') {
        // Conditions/Enc-Dx: "Undo Mark Inactive"; SDOH/HC: "Undo Mark Resolved" (inactive displays as resolved)
        if (isCondLike) {
          undoGroup.push({ label: 'Undo Mark Inactive', handler: onUndoMarkInactive })
        } else {
          undoGroup.push({ label: 'Undo Mark Resolved', handler: onUndoMarkResolved })
        }
      }
      if (it.clinicalStatus === 'resolved') {
        // Conditions/Enc-Dx: "Undo Mark Inactive" (resolved displays as inactive); SDOH/HC: "Undo Mark Resolved"
        if (isCondLike) {
          undoGroup.push({ label: 'Undo Mark Inactive', handler: onUndoMarkInactive })
        } else {
          undoGroup.push({ label: 'Undo Mark Resolved', handler: onUndoMarkResolved })
        }
      }
      if (it.clinicalStatus === 'recurrence') {
        undoGroup.push({ label: 'Undo Recurrence', handler: onUndoRecurrence })
      }

      // Mark Recurrence — only for conditions/encounter-dx in inactive/resolved state
      if (supportsRecurrence(it) && (it.clinicalStatus === 'inactive' || it.clinicalStatus === 'resolved')) {
        undoGroup.push({ label: 'Mark Recurrence', handler: onNoteRecurrence })
      }
    }

    if ((it.clinicalStatus === 'active') && it.history[0]?.type === 'reopened') {
      undoGroup.push({ label: 'Undo Reopen', handler: onUndoReopen })
    }

    if (undoGroup.length > 0) groups.push(undoGroup)

    // Group 2: Record management (future features)
    groups.push([
      { label: 'Add Historical Entry', handler: () => {}, disabled: true },
      { label: 'Merge with\u2026', handler: () => {}, disabled: true },
      { label: 'Split record', handler: () => {}, disabled: true },
    ])

    // Group 3: Destructive — always available, triggers reason-picker alert dialog
    groups.push([
      { label: 'Remove', handler: () => { onRemoveClick() }, destructive: true },
    ])

    return groups
  }

  function getSoftCloseHandler(cat: ProblemItem['category']): ((id: string) => void) | undefined {
    switch (cat) {
      case 'condition':
      case 'encounter-dx':
        return onMarkInactive
      case 'sdoh':
      case 'health-concern':
        return onMarkResolved
    }
  }
}

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
      <div className="relative flex-1 max-w-[200px]">
        <Input
          label="Onset"
          size="small"
          value={onsetValue}
          readOnly
          rightIcon="calendar"
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

      {showAbatement && (
        <div className="relative flex-1 max-w-[200px]">
          <Input
            label={abatementLabel}
            size="small"
            value={item.abatementDate ?? ''}
            readOnly
            rightIcon="calendar"
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
  onUndoDeleteEvent: (itemId: string, eventId: string) => void
}

function HistoryLog({ item, onDeleteEvent, onUndoDeleteEvent }: HistoryLogProps) {
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<DeletionReason>('entered-in-error')
  const [kebabOpenId, setKebabOpenId] = useState<string | null>(null)

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

  const handleKebabAction = (event: ProblemEvent) => {
    setKebabOpenId(null)
    if (event.deletedAt) {
      onUndoDeleteEvent(item.id, event.id)
    } else {
      setDeletingEventId(event.id)
    }
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
        const dimmed = isDeleted || isBeingDeleted

        return (
          <div key={event.id}>
            {i > 0 && <div className="border-t border-fg-transparent-soft" />}
            <div className="py-2.5 flex flex-col gap-0.5">
              {/* Line 1: Event label + effective date + kebab */}
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-label-sm-medium ${dimmed ? 'text-fg-neutral-disabled line-through' : 'text-fg-neutral-primary'}`}>
                  {formatEventLabel(event, dimmed)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-body-sm-regular whitespace-nowrap ${dimmed ? 'text-fg-neutral-disabled line-through' : 'text-fg-neutral-secondary'}`}>
                    {formatEffectiveDate(event)}
                  </span>
                  {/* Kebab menu — always visible */}
                  {!isBeingDeleted && (
                    <div className="relative">
                      <button
                        onClick={() => setKebabOpenId(kebabOpenId === event.id ? null : event.id)}
                        className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary hover:opacity-70 transition-opacity"
                      >
                        <Icon name="more-vertical" size="small" />
                      </button>
                      {kebabOpenId === event.id && (
                        <>
                          <div className="fixed inset-0 z-50" onClick={() => setKebabOpenId(null)} />
                          <div className="absolute right-0 top-6 z-50 bg-white rounded-xl shadow-md border border-border-transparent-soft py-1 min-w-[140px]">
                            <button
                              onClick={() => handleKebabAction(event)}
                              className={`w-full text-left px-4 py-2 text-body-sm-regular transition-colors hover:bg-bg-transparent-low ${isDeleted ? 'text-fg-neutral-primary' : 'text-fg-alert-secondary'}`}
                            >
                              {isDeleted ? 'Undo Delete' : 'Delete'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Line 2: Source + timestamp */}
              <span className={`text-body-xs-regular ${dimmed ? 'text-fg-neutral-disabled line-through' : 'text-fg-neutral-secondary'}`}>
                {formatSourceLine(event)}
              </span>

              {/* Notes */}
              {event.note && !dimmed && (
                <span className="text-body-xs-regular text-fg-neutral-secondary">{event.note}</span>
              )}

              {/* Event-edited changes */}
              {event.type === 'event-edited' && event.changes?.[0] && !dimmed && (
                <span className="text-body-xs-regular text-fg-neutral-secondary">
                  Date changed: {event.changes[0].from} &rarr; {event.changes[0].to}
                </span>
              )}

              {/* Deletion metadata (for already-deleted entries) */}
              {isDeleted && !isBeingDeleted && (
                <span className="text-body-xs-regular text-fg-alert-secondary mt-0.5">
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
function formatEventLabel(event: ProblemEvent, dimmed?: boolean): React.ReactNode {
  const baseLabel = formatEventDescription(event.type)
  if (event.encounterVisitName && event.type === 'reported') {
    return (
      <>
        {baseLabel} from{' '}
        <span className={dimmed ? 'text-fg-neutral-disabled' : 'text-fg-accent-primary underline decoration-fg-accent-primary/30 underline-offset-2 cursor-pointer'}>
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
  if (event.encounterVisitName && event.type === 'reported') {
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
