import { useState } from 'react'
import { X, Pencil, EllipsisVertical } from 'lucide-react'
import type { ProblemItem, ProblemEvent, RemovalReason } from './types'
import { DRAWER_TITLE, getSourcePillLabel, formatEventDescription, isConfirmedTransitional } from './display-labels'
import { Pill, Button, Input } from '@/design-system'
import { screeningInstruments } from './mock-data'
import { ScreeningDetailCard } from './ScreeningBanner'
import {
  SOFT_CLOSE_LABEL,
  RESOLVE_LABEL,
  ACTIVATE_FROM_INACTIVE_LABEL,
  ACTIVATE_FROM_CONFIRMED_LABEL,
} from './display-labels'

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
  onEditClick: () => void
  onEditEventDate: (itemId: string, eventId: string, newDate: string) => void
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Can this item be removed? Only if it has no clinical actions — just the originating event. */
function isRemovable(item: ProblemItem): boolean {
  return item.history.length <= 1
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
  onEditClick,
  onEditEventDate,
}: ProblemDetailDrawerProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [removeReason, setRemoveReason] = useState<RemovalReason>('entered-in-error')
  const [editingEvent, setEditingEvent] = useState<ProblemEvent | null>(null)

  const title = DRAWER_TITLE[item.category]
  const sourcePillLabel = getSourcePillLabel(item)
  const relatedScreening = item.relatedScreeningId
    ? screeningInstruments.find(s => s.id === item.relatedScreeningId)
    : undefined

  // Single-drawer: when editing an event, show ONLY the EventEditDrawer
  if (editingEvent) {
    return (
      <EventEditDrawer
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={(newDate) => {
          onEditEventDate(item.id, editingEvent.id, newDate)
          setEditingEvent(null)
        }}
      />
    )
  }

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
            sourcePillLabel={sourcePillLabel}
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
            onEditClick={onEditClick}
          />

          {/* Related Screening (SDOH only) */}
          {relatedScreening && (
            <ScreeningDetailCard screening={relatedScreening} />
          )}

          {/* Activity log */}
          <ActivityLog item={item} onEditEvent={setEditingEvent} />
        </div>

        {/* Footer — Remove with reason picker */}
        {isRemovable(item) && !showRemoveConfirm && (
          <div className="px-5 py-4 border-t border-border-neutral-low flex">
            <Button
              type="high-impact"
              size="medium"
              label="Remove"
              onClick={() => setShowRemoveConfirm(true)}
            />
          </div>
        )}

        {/* Remove confirmation with reason picker */}
        {showRemoveConfirm && (
          <div className="px-5 py-4 border-t border-border-neutral-low flex flex-col gap-3">
            <p className="text-sm font-medium text-fg-neutral-primary">
              Remove &ldquo;{item.description}&rdquo; from problem list?
            </p>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-fg-neutral-secondary uppercase tracking-wide">Reason</p>
              {([
                { value: 'entered-in-error' as const, label: 'Entered in Error' },
                { value: 'duplicate' as const, label: 'Duplicate' },
                { value: 'replaced' as const, label: 'Replaced' },
                { value: 'patient-disputed' as const, label: 'Patient Disputed' },
              ]).map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 py-1 cursor-pointer">
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
            <div className="flex items-center gap-2 justify-end">
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
        )}
      </div>
    </>
  )
}

/* --- Event Edit Drawer --- */

interface EventEditDrawerProps {
  event: ProblemEvent
  onClose: () => void
  onSave: (newDate: string) => void
}

function EventEditDrawer({ event, onClose, onSave }: EventEditDrawerProps) {
  const [date, setDate] = useState(event.effectiveDate ?? '')

  const handleSave = () => {
    if (date && date !== event.effectiveDate) {
      onSave(date)
    } else {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-neutral-low">
          <h2 className="text-base font-semibold text-fg-neutral-primary">Edit Event Date</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
          <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-fg-neutral-primary">{formatEventDescription(event.type)}</p>
              <p className="text-xs text-fg-neutral-secondary">{event.performedBy}</p>
              <p className="text-xs text-fg-neutral-secondary">Recorded: {event.performedAt}</p>
            </div>
            <Input
              label="Effective Date"
              helperText="The date this status change clinically took effect, which may differ from when it was recorded."
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="MM/DD/YY"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-neutral-low flex items-center justify-end gap-2">
          <Button type="transparent" size="medium" label="Cancel" onClick={onClose} />
          <Button type="primary" size="medium" label="Save" onClick={handleSave} />
        </div>
      </div>
    </>
  )
}

/* --- Summary Card --- */

interface SummaryCardProps {
  item: ProblemItem
  sourcePillLabel: string
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
  onEditClick: () => void
}

function SummaryCard({
  item,
  sourcePillLabel,
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
  onEditClick,
}: SummaryCardProps) {
  const [kebabOpen, setKebabOpen] = useState(false)
  const actions = getCardActions(item)
  const kebabActions = getKebabActions(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col">
      {/* Row 1: description + icon buttons */}
      <div className="flex justify-between gap-2">
        <p className="text-sm font-medium text-fg-neutral-primary leading-7">{item.description}</p>
        <div className="flex items-start gap-1 shrink-0">
          <button
            onClick={onEditClick}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <Pencil size={14} />
          </button>
          {kebabActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setKebabOpen(!kebabOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
              >
                <EllipsisVertical size={14} />
              </button>
              {kebabOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setKebabOpen(false)} />
                  <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-md border border-border-transparent-soft py-1 min-w-[180px]">
                    {kebabActions.map(action => (
                      <button
                        key={action.label}
                        disabled={action.disabled}
                        onClick={() => { if (!action.disabled) { action.handler(item.id); setKebabOpen(false) } }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${action.disabled ? 'text-fg-neutral-disabled cursor-not-allowed' : action.destructive ? 'text-fg-alert-primary hover:bg-bg-transparent-low' : 'text-fg-neutral-primary hover:bg-bg-transparent-low'}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
          <Pill type="subtle-outlined" size="small" label={capitalizeFirst(item.clinicalStatus)} />
        )}
        {item.verificationStatus === 'excluded' && (
          <Pill type="subtle-outlined" size="small" label="Excluded" />
        )}
        {item.icdCode && (
          <Pill type="transparent" size="small" label={item.icdCode} />
        )}
        <Pill type="transparent" size="small" subtextL={sourcePillLabel} label={item.clinicalStatus === 'resolved' && item.abatementDate ? item.abatementDate : item.sourceDate} />
      </div>

      {/* Notes (if present) */}
      {item.notes && (
        <p className="text-sm text-fg-neutral-secondary mt-4">{item.notes}</p>
      )}

      {/* Action buttons — 24px gap from pill row */}
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
      result.push({ label: RESOLVE_LABEL, handler: onMarkResolved })
      return result
    }

    if (it.clinicalStatus === 'inactive' || it.clinicalStatus === 'resolved') {
      const activateHandler = (cat === 'sdoh' || cat === 'health-concern') ? onReopen : onMarkActive
      result.push({ label: ACTIVATE_FROM_INACTIVE_LABEL[cat], handler: activateHandler })
      // Conditions + Encounter Dx also get Note Recurrence
      if (supportsRecurrence(it)) {
        result.push({ label: 'Note Recurrence', handler: onNoteRecurrence })
      }
      return result
    }

    return result
  }

  /** Kebab menu: contextual undo actions for corrections */
  function getKebabActions(it: ProblemItem): Array<{ label: string; handler: (id: string) => void; destructive?: boolean; disabled?: boolean }> {
    const result: Array<{ label: string; handler: (id: string) => void; destructive?: boolean; disabled?: boolean }> = []

    // Undo confirm (verification level) — always available for confirmed items
    if (it.verificationStatus === 'confirmed') {
      result.push({ label: 'Undo Confirm', handler: onUndoConfirm })
    }

    // Undo clinical status actions — contextual based on current state
    if (it.verificationStatus === 'confirmed') {
      if (it.clinicalStatus === 'active' && !isConfirmedTransitional(it)) {
        result.push({ label: 'Undo Mark Active', handler: onUndoMarkActive })
      }
      if (it.clinicalStatus === 'inactive') {
        const cat = it.category
        if (cat === 'sdoh') {
          result.push({ label: 'Undo Mark Addressed', handler: onUndoMarkAddressed })
        } else {
          result.push({ label: 'Undo Mark Inactive', handler: onUndoMarkInactive })
        }
      }
      if (it.clinicalStatus === 'resolved') {
        result.push({ label: 'Undo Mark Resolved', handler: onUndoMarkResolved })
      }
      if (it.clinicalStatus === 'recurrence') {
        result.push({ label: 'Undo Recurrence', handler: onUndoRecurrence })
      }
    }

    // Undo reopen — for items that were reopened (active, came from inactive)
    // We check history to see if most recent clinical action was a reopen
    if ((it.clinicalStatus === 'active') && it.history[0]?.type === 'reopened') {
      result.push({ label: 'Undo Reopen', handler: onUndoReopen })
    }

    // Historical entry placeholder (future feature)
    result.push({ label: 'Add Historical Entry', handler: () => {}, disabled: true })

    // Split/Merge placeholders (future feature)
    result.push({ label: 'Merge with\u2026', handler: () => {}, disabled: true })
    result.push({ label: 'Split record', handler: () => {}, disabled: true })

    return result
  }

  function getSoftCloseHandler(cat: ProblemItem['category']): ((id: string) => void) | undefined {
    switch (cat) {
      case 'condition':
      case 'encounter-dx':
      case 'health-concern':
        return onMarkInactive
      case 'sdoh':
        return onMarkAddressed
    }
  }
}

/* --- Activity Log --- */

/** Events that have a clinically meaningful effectiveDate worth displaying */
const DATABLE_EVENTS = new Set([
  'marked-active', 'marked-inactive', 'marked-resolved', 'marked-addressed',
  'recurrence', 'reopened', 'confirmed', 'excluded',
])

function ActivityLog({ item, onEditEvent }: { item: ProblemItem; onEditEvent: (event: ProblemEvent) => void }) {
  return (
    <div className="flex flex-col gap-0">
      <h3 className="text-xs font-semibold text-fg-neutral-secondary uppercase tracking-wide mb-2">Activity</h3>
      {item.history.map((event, i) => (
        <div key={event.id}>
          {i > 0 && <div className="h-px bg-border-neutral-low" />}
          <div className="flex items-start justify-between gap-3 py-2.5 group">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-fg-neutral-primary">
                  {formatEventDescription(event.type)}
                </span>
                {event.effectiveDate && DATABLE_EVENTS.has(event.type) && (
                  <span className="text-xs text-fg-neutral-secondary">
                    · Effective {event.effectiveDate}
                  </span>
                )}
                {DATABLE_EVENTS.has(event.type) && (
                  <button
                    onClick={() => onEditEvent(event)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={11} />
                  </button>
                )}
              </div>
              {event.note && (
                <span className="text-xs text-fg-neutral-secondary">{event.note}</span>
              )}
              {event.type === 'event-edited' && event.changes?.[0] && (
                <span className="text-xs text-fg-neutral-secondary">
                  Date changed: {event.changes[0].from} &rarr; {event.changes[0].to}
                </span>
              )}
              <span className="text-xs text-fg-neutral-secondary truncate">
                {event.performedBy}
              </span>
            </div>
            <span className="text-xs text-fg-neutral-secondary whitespace-nowrap shrink-0">
              {event.performedAt}
            </span>
          </div>
        </div>
      ))}
      {item.history.length === 0 && (
        <p className="text-sm text-fg-neutral-secondary py-2">No activity recorded.</p>
      )}
    </div>
  )
}
