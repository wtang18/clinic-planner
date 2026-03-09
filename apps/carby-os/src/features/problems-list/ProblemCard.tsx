import { ChevronRight } from 'lucide-react'
import { Pill } from '@/design-system'
import type { ProblemItem } from './types'

interface ProblemCardProps {
  item: ProblemItem
  onConfirm?: (id: string) => void
  onExclude?: (id: string) => void
  onMarkActive?: (id: string) => void
  onMarkInactive?: (id: string) => void
  onMarkResolved?: (id: string) => void
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

function getSourceLabel(source: ProblemItem['source']): string {
  switch (source) {
    case 'reported': return 'Reported'
    case 'diagnosed': return 'Diagnosed'
    case 'screened': return 'Screened'
    case 'imported': return 'Imported'
  }
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function ProblemCard({
  item,
  onConfirm,
  onExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onReopen,
  onDetailClick,
}: ProblemCardProps) {
  const actions = getActions(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex items-start gap-2">
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Description */}
        <p className="text-sm font-medium text-fg-neutral-primary">
          {item.description}
        </p>
        {/* Pill row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Verification status pill (only if unconfirmed) */}
          {item.verificationStatus === 'unconfirmed' && (
            <Pill type="attention" size="x-small" label="Unconfirmed" />
          )}
          {/* Clinical status pill (for non-active confirmed items) */}
          {item.verificationStatus === 'confirmed' && item.clinicalStatus !== 'active' && (
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
            <span className="text-xs text-fg-neutral-secondary">{getSourceLabel(item.source)}</span>
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

    if (_item.verificationStatus === 'unconfirmed') {
      if (onExclude) result.push({ label: 'Exclude', handler: onExclude })
      if (onConfirm) result.push({ label: 'Confirm', handler: onConfirm })
    } else if (_item.verificationStatus === 'confirmed') {
      if (_item.clinicalStatus === 'resolved' && _item.category === 'health-concern') {
        if (onReopen) result.push({ label: 'Reopen', handler: onReopen })
      } else if (_item.category === 'sdoh' && _item.clinicalStatus === 'active') {
        // Update is placeholder
        result.push({ label: 'Update', handler: () => { /* placeholder */ } })
        if (onMarkResolved) result.push({ label: 'Mark Addressed', handler: onMarkResolved })
      } else {
        if (onMarkInactive && _item.clinicalStatus === 'active') {
          result.push({ label: 'Mark Inactive', handler: onMarkInactive })
        }
        if (onMarkActive && (_item.clinicalStatus === 'inactive' || _item.clinicalStatus === 'active')) {
          result.push({ label: 'Mark Active', handler: onMarkActive })
        }
      }
    }

    return result
  }
}
