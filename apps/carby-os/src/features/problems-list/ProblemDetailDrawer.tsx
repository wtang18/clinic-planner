import { X, ClipboardCheck, Ban, MoreHorizontal } from 'lucide-react'
import type { ProblemItem, ScreeningInstrument } from './types'
import { DRAWER_TITLE, getSourcePillLabel, formatEventDescription } from './display-labels'
import { Pill } from '@/design-system'
import { screeningInstruments } from './mock-data'

interface ProblemDetailDrawerProps {
  item: ProblemItem
  onClose: () => void
  onConfirm: (id: string) => void
  onExclude: (id: string) => void
  onUndoExclude: (id: string) => void
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

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors"
    >
      {label}
    </button>
  )
}

export function ProblemDetailDrawer({
  item,
  onClose,
  onConfirm,
  onExclude,
  onUndoExclude,
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
      <div className="fixed right-0 top-0 h-full w-[420px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
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

          {/* Kebab menu placeholder */}
          <KebabMenu />
        </div>

        {/* Footer — Remove */}
        <div className="px-5 py-4 border-t border-border-neutral-low">
          <button
            onClick={() => {
              if (confirm(`Remove "${item.description}" from problem list?`)) {
                onRemove(item.id)
                onClose()
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-semibold w-full justify-center"
          >
            <Ban size={14} />
            Remove
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── Summary Card ─── */

import {
  DEACTIVATE_LABEL,
  ACTIVATE_FROM_INACTIVE_LABEL,
  ACTIVATE_FROM_CONFIRMED_LABEL,
} from './display-labels'

function isConfirmedTransitional(item: ProblemItem): boolean {
  for (const evt of item.history) {
    if (evt.type === 'confirmed') return true
    if (
      evt.type === 'marked-active' ||
      evt.type === 'marked-inactive' ||
      evt.type === 'marked-resolved' ||
      evt.type === 'marked-addressed' ||
      evt.type === 'reopened' ||
      evt.type === 'recurrence'
    ) {
      return false
    }
  }
  return false
}

function SummaryCard({
  item,
  sourcePillLabel,
  onConfirm,
  onExclude,
  onUndoExclude,
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
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onMarkAddressed: (id: string) => void
  onReopen: (id: string) => void
  onEditClick: () => void
}) {
  const actions = getCardActions(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-3">
      {/* Row 1: description + edit */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-fg-neutral-primary">{item.description}</p>
        <button
          onClick={onEditClick}
          className="text-xs font-semibold text-fg-neutral-secondary hover:text-fg-neutral-primary shrink-0"
        >
          Edit
        </button>
      </div>

      {/* Pill row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {item.verificationStatus === 'unconfirmed' && (
          <Pill type="attention" size="x-small" label="Unconfirmed" />
        )}
        {item.clinicalStatus === 'recurrence' && (
          <Pill type="transparent" size="x-small" label="Recurrence" />
        )}
        {item.verificationStatus === 'confirmed' && item.clinicalStatus !== 'active' && item.clinicalStatus !== 'recurrence' && (
          <Pill type="transparent" size="x-small" label={capitalizeFirst(item.clinicalStatus)} />
        )}
        {item.verificationStatus === 'excluded' && (
          <Pill type="transparent" size="x-small" label="Excluded" />
        )}
        {item.icdCode && (
          <Pill type="transparent" size="x-small" label={item.icdCode} />
        )}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-bg-transparent-low">
          <span className="text-xs text-fg-neutral-secondary">{sourcePillLabel}</span>
          <span className="text-xs font-medium text-fg-neutral-primary">{item.sourceDate}</span>
        </div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map(action => (
            <ActionButton
              key={action.label}
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

/* ─── Kebab Menu ─── */

function KebabMenu() {
  return (
    <div className="flex justify-start">
      <button
        onClick={() => { /* placeholder — toast "Coming in a future release" */ }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-secondary hover:bg-bg-transparent-medium transition-colors"
      >
        <MoreHorizontal size={14} />
        More Options
      </button>
    </div>
  )
}
