import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { ProblemItem } from './types'
import { ProblemCard } from './ProblemCard'

interface ProblemSectionProps {
  title: string
  items: ProblemItem[]
  rightLabel?: string
  actions?: Array<{ label: string; onClick: () => void }>
  onConfirm: (id: string) => void
  onExclude: (id: string) => void
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onReopen: (id: string) => void
  onDetailClick: (id: string) => void
  children?: React.ReactNode
}

export function ProblemSection({
  title,
  items,
  rightLabel,
  actions = [],
  onConfirm,
  onExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onReopen,
  onDetailClick,
  children,
}: ProblemSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const Chevron = collapsed ? ChevronDown : ChevronUp

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-fg-neutral-secondary flex-1">{title}</h3>
        {rightLabel && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-fg-neutral-secondary text-right flex-1">{rightLabel}</span>
          </div>
        )}
        {actions.map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-3 py-0.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary cursor-pointer hover:bg-bg-transparent-medium transition-colors"
          >
            {label}
          </button>
        ))}
        <button onClick={() => setCollapsed(!collapsed)} className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary">
          <Chevron size={16} />
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex flex-col gap-2">
          {children}
          {items.map(item => (
            <ProblemCard
              key={item.id}
              item={item}
              onConfirm={onConfirm}
              onExclude={onExclude}
              onMarkActive={onMarkActive}
              onMarkInactive={onMarkInactive}
              onMarkResolved={onMarkResolved}
              onReopen={onReopen}
              onDetailClick={onDetailClick}
            />
          ))}
          {items.length === 0 && !children && (
            <p className="text-sm text-fg-neutral-secondary py-2">No items match current filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
