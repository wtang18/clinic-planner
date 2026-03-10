import { ChevronRight } from 'lucide-react'
import { Pill } from '@/design-system'
import type { ProblemItem } from './types'
import {
  DEACTIVATE_LABEL,
  ACTIVATE_FROM_INACTIVE_LABEL,
  ACTIVATE_FROM_CONFIRMED_LABEL,
  getSourcePillLabel,
} from './display-labels'

interface ProblemCardProps {
  item: ProblemItem
  onConfirm?: (id: string) => void
  onExclude?: (id: string) => void
  onUndoExclude?: (id: string) => void
  onMarkActive?: (id: string) => void
  onMarkInactive?: (id: string) => void
  onMarkResolved?: (id: string) => void
  onMarkAddressed?: (id: string) => void
  onReopen?: (id: string) => void
  onDetailClick?: (id: string) => void
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="px-3 py-1.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors"
    >
      {label}
    </button>
  )
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function ProblemCard({
  item,
  onConfirm,
  onExclude,
  onUndoExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onMarkAddressed,
  onReopen,
  onDetailClick,
}: ProblemCardProps) {
  const actions = getActions(item)
  const sourcePillLabel = getSourcePillLabel(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex items-start gap-2">
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Description — truncate long text */}
        <p className="text-sm font-medium text-fg-neutral-primary truncate" title={item.description}>
          {item.description}
        </p>
        {/* Pill row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Verification status pill (only if unconfirmed) */}
          {item.verificationStatus === 'unconfirmed' && (
            <Pill type="attention" size="x-small" label="Unconfirmed" />
          )}
          {/* Recurrence pill */}
          {item.clinicalStatus === 'recurrence' && (
            <Pill type="transparent" size="x-small" label="Recurrence" />
          )}
          {/* Clinical status pill (for non-active confirmed items) */}
          {item.verificationStatus === 'confirmed' && item.clinicalStatus !== 'active' && item.clinicalStatus !== 'recurrence' && (
            <Pill type="transparent" size="x-small" label={capitalizeFirst(item.clinicalStatus)} />
          )}
          {/* Excluded pill */}
          {item.verificationStatus === 'excluded' && (
            <Pill type="transparent" size="x-small" label="Excluded" />
          )}
          {/* ICD code pill */}
          {item.icdCode && (
            <Pill type="transparent" size="x-small" label={item.icdCode} />
          )}
          {/* Source + date pill */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-bg-transparent-low">
            <span className="text-xs text-fg-neutral-secondary">{sourcePillLabel}</span>
            <span className="text-xs font-medium text-fg-neutral-primary">{item.sourceDate}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {actions.map(action => (
          <ActionButton
            key={action.label}
            label={action.label}
            onClick={() => action.handler(item.id)}
          />
        ))}
        <button
          onClick={() => onDetailClick?.(item.id)}
          className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )

  function getActions(_item: ProblemItem): Array<{ label: string; handler: (id: string) => void }> {
    const result: Array<{ label: string; handler: (id: string) => void }> = []
    const cat = _item.category

    // --- Unconfirmed ---
    if (_item.verificationStatus === 'unconfirmed') {
      if (onExclude) result.push({ label: 'Exclude', handler: onExclude })
      if (onConfirm) result.push({ label: 'Confirm', handler: onConfirm })
      return result
    }

    // --- Excluded ---
    if (_item.verificationStatus === 'excluded') {
      if (onUndoExclude) result.push({ label: 'Undo Exclude', handler: onUndoExclude })
      return result
    }

    // --- Confirmed (transitional): confirmed + active, but was just confirmed ---
    // Detect transitional: confirmed + active, and the most recent non-confirmed event
    // isn't a marked-active (i.e. they haven't explicitly chosen active yet)
    const isTransitional = _item.verificationStatus === 'confirmed'
      && _item.clinicalStatus === 'active'
      && isConfirmedTransitional(_item)

    if (isTransitional) {
      // Show both deactivate and activate
      const deactivateLabel = DEACTIVATE_LABEL[cat]
      const activateLabel = ACTIVATE_FROM_CONFIRMED_LABEL[cat]
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: deactivateLabel, handler: deactivateHandler })
      if (onMarkActive) result.push({ label: activateLabel, handler: onMarkActive })
      return result
    }

    // --- Active (including Recurrence) ---
    if (_item.clinicalStatus === 'active' || _item.clinicalStatus === 'recurrence') {
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: DEACTIVATE_LABEL[cat], handler: deactivateHandler })
      return result
    }

    // --- Inactive / Resolved ---
    if (_item.clinicalStatus === 'inactive' || _item.clinicalStatus === 'resolved') {
      const activateLabel = ACTIVATE_FROM_INACTIVE_LABEL[cat]
      const activateHandler = (cat === 'sdoh' || cat === 'health-concern') ? onReopen : onMarkActive
      if (activateHandler) result.push({ label: activateLabel, handler: activateHandler })
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

/**
 * Determine if a confirmed+active item is in the "transitional" state.
 * Transitional = the item was just confirmed but hasn't had an explicit
 * clinical status action (marked-active, marked-inactive, etc.) yet.
 */
function isConfirmedTransitional(item: ProblemItem): boolean {
  // Look through history for the most recent non-confirm event
  // If there's a 'confirmed' event and no subsequent clinical status event,
  // it's transitional
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
