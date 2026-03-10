import { ChevronRight } from 'lucide-react'
import { Pill } from '@/design-system'
import type { ProblemItem } from './types'
import {
  DEACTIVATE_LABEL,
  ACTIVATE_FROM_INACTIVE_LABEL,
  ACTIVATE_FROM_CONFIRMED_LABEL,
  getSourcePillLabel,
  isConfirmedTransitional,
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
  onNoteRecurrence?: (id: string) => void
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

/** Is this item in a muted/deemphasized state? (inactive, resolved, or excluded) */
function isMuted(item: ProblemItem): boolean {
  return (
    item.verificationStatus === 'excluded' ||
    item.clinicalStatus === 'inactive' ||
    item.clinicalStatus === 'resolved'
  )
}

/** Can recurrence apply? Only conditions and encounter-dx */
function supportsRecurrence(item: ProblemItem): boolean {
  return item.category === 'condition' || item.category === 'encounter-dx'
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
  onNoteRecurrence,
  onReopen,
  onDetailClick,
}: ProblemCardProps) {
  const actions = getActions(item)
  const sourcePillLabel = getSourcePillLabel(item)
  const muted = isMuted(item)
  const isExcluded = item.verificationStatus === 'excluded'

  const baseCardClasses = 'rounded-2xl px-4 py-3 flex items-start gap-2 cursor-pointer transition-colors border'
  const cardClasses = isExcluded
    ? `border-border-transparent-soft ${baseCardClasses} hover:bg-bg-transparent-inverse-medium`
    : muted
      ? `border-transparent bg-bg-transparent-inverse-high ${baseCardClasses} hover:bg-bg-transparent-inverse-medium`
      : `border-transparent bg-white ${baseCardClasses} hover:bg-bg-transparent-inverse-medium`

  const descriptionClasses = isExcluded
    ? 'text-sm font-medium text-fg-neutral-secondary truncate line-through'
    : muted
      ? 'text-sm font-medium text-fg-neutral-secondary truncate'
      : 'text-sm font-medium text-fg-neutral-primary truncate'

  return (
    <div onClick={() => onDetailClick?.(item.id)} className={cardClasses}>
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className={descriptionClasses} title={item.description}>
          {item.description}
        </p>
        {/* Pill row */}
        <div className="flex items-center gap-1.5 flex-wrap">
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
            <Pill type={muted ? 'subtle-outlined' : 'transparent'} size="small" label={capitalizeFirst(item.clinicalStatus)} />
          )}
          {item.verificationStatus === 'excluded' && (
            <Pill type="subtle-outlined" size="small" label="Excluded" />
          )}
          {item.icdCode && (
            <Pill type={muted ? 'subtle-outlined' : 'transparent'} size="small" label={item.icdCode} />
          )}
          <Pill type={muted ? 'subtle-outlined' : 'transparent'} size="small" subtextL={sourcePillLabel} label={item.sourceDate} />
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
        <div className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  )

  function getActions(_item: ProblemItem): Array<{ label: string; handler: (id: string) => void }> {
    const result: Array<{ label: string; handler: (id: string) => void }> = []
    const cat = _item.category

    if (_item.verificationStatus === 'unconfirmed') {
      if (onExclude) result.push({ label: 'Exclude', handler: onExclude })
      if (onConfirm) result.push({ label: 'Confirm', handler: onConfirm })
      return result
    }

    if (_item.verificationStatus === 'excluded') {
      if (onUndoExclude) result.push({ label: 'Undo Exclude', handler: onUndoExclude })
      return result
    }

    const isTransitional = _item.verificationStatus === 'confirmed'
      && _item.clinicalStatus === 'active'
      && isConfirmedTransitional(_item)

    if (isTransitional) {
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: DEACTIVATE_LABEL[cat], handler: deactivateHandler })
      if (onMarkActive) result.push({ label: ACTIVATE_FROM_CONFIRMED_LABEL[cat], handler: onMarkActive })
      return result
    }

    if (_item.clinicalStatus === 'active' || _item.clinicalStatus === 'recurrence') {
      const deactivateHandler = getDeactivateHandler(cat)
      if (deactivateHandler) result.push({ label: DEACTIVATE_LABEL[cat], handler: deactivateHandler })
      return result
    }

    if (_item.clinicalStatus === 'inactive' || _item.clinicalStatus === 'resolved') {
      const activateLabel = ACTIVATE_FROM_INACTIVE_LABEL[cat]
      const activateHandler = (cat === 'sdoh' || cat === 'health-concern') ? onReopen : onMarkActive
      if (activateHandler) result.push({ label: activateLabel, handler: activateHandler })
      // Conditions + Encounter Dx also get Note Recurrence
      if (supportsRecurrence(_item) && onNoteRecurrence) {
        result.push({ label: 'Note Recurrence', handler: onNoteRecurrence })
      }
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
