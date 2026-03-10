import { useState } from 'react'
import { X, ClipboardCheck, Pencil, EllipsisVertical } from 'lucide-react'
import type { ProblemItem, ScreeningInstrument } from './types'
import { DRAWER_TITLE, getSourcePillLabel, formatEventDescription, isConfirmedTransitional } from './display-labels'
import { Pill } from '@/design-system'
import { Button } from '@/design-system'
import { screeningInstruments } from './mock-data'
import {
  DEACTIVATE_LABEL,
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
  onReopen: (id: string) => void
  onRemove: (id: string) => void
  onEditClick: () => void
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Can this item be removed? Only if it has no clinical actions — just the originating event. */
function isRemovable(item: ProblemItem): boolean {
  return item.history.length <= 1
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
  onReopen,
  onRemove,
  onEditClick,
}: ProblemDetailDrawerProps) {
  const title = DRAWER_TITLE[item.category]
  const sourcePillLabel = getSourcePillLabel(item)
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
            sourcePillLabel={sourcePillLabel}
            onConfirm={onConfirm}
            onExclude={onExclude}
            onUndoExclude={onUndoExclude}
            onUndoConfirm={onUndoConfirm}
            onMarkActive={onMarkActive}
            onMarkInactive={onMarkInactive}
            onMarkResolved={onMarkResolved}
            onMarkAddressed={onMarkAddressed}
            onReopen={onReopen}
            onEditClick={onEditClick}
          />

          {/* Related Screening (SDOH only) */}
          {relatedScreening && (
            <RelatedScreeningCard screening={relatedScreening} />
          )}

          {/* Activity log */}
          <ActivityLog item={item} />
        </div>

        {/* Footer — Remove (only for items with no clinical history) */}
        {isRemovable(item) && (
          <div className="px-5 py-4 border-t border-border-neutral-low flex">
            <Button
              type="high-impact"
              size="medium"
              label="Remove"
              onClick={() => {
                if (confirm(`Remove "${item.description}" from problem list?`)) {
                  onRemove(item.id)
                  onClose()
                }
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Summary Card ─── */

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
  onReopen,
  onEditClick,
}: {
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
  onReopen: (id: string) => void
  onEditClick: () => void
}) {
  const [kebabOpen, setKebabOpen] = useState(false)
  const actions = getCardActions(item)
  const kebabActions = getKebabActions(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col">
      {/* Row 1: description + icon buttons — icons vertically centered to first line of text */}
      <div className="flex justify-between gap-2">
        <p className="text-sm font-medium text-fg-neutral-primary leading-7">{item.description}</p>
        <div className="flex items-start gap-1 shrink-0">
          {/* Edit (pencil) icon button */}
          <button
            onClick={onEditClick}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <Pencil size={14} />
          </button>
          {/* Kebab menu */}
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
                        onClick={() => { action.handler(item.id); setKebabOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-transparent-low transition-colors ${action.destructive ? 'text-fg-alert-primary' : 'text-fg-neutral-primary'}`}
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
        <Pill type="transparent" size="small" subtextL={sourcePillLabel} label={item.sourceDate} />
      </div>

      {/* Action buttons — 24px gap from pill row */}
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
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: DEACTIVATE_LABEL[cat], handler: deactivateHandler })
      result.push({ label: ACTIVATE_FROM_CONFIRMED_LABEL[cat], handler: onMarkActive })
      return result
    }

    if (it.clinicalStatus === 'active' || it.clinicalStatus === 'recurrence') {
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: DEACTIVATE_LABEL[cat], handler: deactivateHandler })
      return result
    }

    if (it.clinicalStatus === 'inactive' || it.clinicalStatus === 'resolved') {
      const activateHandler = (cat === 'sdoh' || cat === 'health-concern') ? onReopen : onMarkActive
      result.push({ label: ACTIVATE_FROM_INACTIVE_LABEL[cat], handler: activateHandler })
      return result
    }

    return result
  }

  /** Kebab menu: secondary/overflow actions not shown as primary buttons */
  function getKebabActions(it: ProblemItem): Array<{ label: string; handler: (id: string) => void; destructive?: boolean }> {
    const result: Array<{ label: string; handler: (id: string) => void; destructive?: boolean }> = []

    // Confirmed items can be unconfirmed (undo confirm → back to unconfirmed)
    if (it.verificationStatus === 'confirmed') {
      result.push({ label: 'Undo Confirm', handler: onUndoConfirm })
    }

    return result
  }

  function getDeactivateHandler(cat: ProblemItem['category']): ((id: string) => void) | undefined {
    switch (cat) {
      case 'condition':
      case 'encounter-dx':
        return onMarkInactive
      case 'sdoh':
        return onMarkAddressed
      case 'health-concern':
        return onMarkResolved
    }
  }
}

/* ─── Related Screening ─── */

function RelatedScreeningCard({ screening }: { screening: ScreeningInstrument }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ClipboardCheck size={16} className="text-fg-neutral-secondary shrink-0" />
        <span className="text-sm font-medium text-fg-neutral-primary">{screening.name}</span>
      </div>
      {(screening.score || screening.interpretation) && (
        <p className="text-xs text-fg-neutral-secondary">
          {screening.score && <>Score: {screening.score}</>}
          {screening.score && screening.interpretation && ' · '}
          {screening.interpretation}
        </p>
      )}
      <button
        onClick={() => { /* placeholder */ }}
        className="text-xs font-semibold text-fg-neutral-secondary hover:text-fg-neutral-primary self-end"
      >
        View Full Results
      </button>
    </div>
  )
}

/* ─── Activity Log ─── */

function ActivityLog({ item }: { item: ProblemItem }) {
  return (
    <div className="flex flex-col gap-0">
      <h3 className="text-xs font-semibold text-fg-neutral-secondary uppercase tracking-wide mb-2">Activity</h3>
      {item.history.map((event, i) => (
        <div key={event.id}>
          {i > 0 && <div className="h-px bg-border-neutral-low" />}
          <div className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm text-fg-neutral-primary">
                {formatEventDescription(event.type)}
              </span>
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
