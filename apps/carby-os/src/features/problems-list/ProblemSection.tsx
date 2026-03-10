import { useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
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
  onUndoExclude: (id: string) => void
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onMarkAddressed: (id: string) => void
  onNoteRecurrence: (id: string) => void
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
  onUndoExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onMarkAddressed,
  onNoteRecurrence,
  onReopen,
  onDetailClick,
  children,
}: ProblemSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [sectionRef] = useAutoAnimate({ duration: 200 })
  const [cardListRef] = useAutoAnimate({ duration: 200 })
  const Chevron = collapsed ? ChevronDown : ChevronUp

  return (
    <div ref={sectionRef} className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-baseline gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-baseline gap-2 flex-1 min-w-0 cursor-pointer"
        >
          <h3 className="text-base font-semibold text-fg-neutral-secondary">{title}</h3>
          {collapsed && items.length > 0 && (
            <span className="text-sm text-fg-neutral-secondary">
              {items.filter(i => i.clinicalStatus === 'active' && i.verificationStatus === 'confirmed').length} active
            </span>
          )}
          <div className="flex-1" />
          {rightLabel && (
            <span className="self-center text-sm text-fg-neutral-secondary">{rightLabel}</span>
          )}
        </button>
        {actions.map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="self-center px-3 py-0.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary cursor-pointer hover:bg-bg-transparent-medium transition-colors"
          >
            {label}
          </button>
        ))}
        <button onClick={() => setCollapsed(!collapsed)} className="self-center w-5 h-5 flex items-center justify-center text-fg-neutral-secondary shrink-0 cursor-pointer">
          <Chevron size={16} />
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div ref={cardListRef} className="flex flex-col gap-2">
          {children}
          {items.map(item => (
            <ProblemCard
              key={item.id}
              item={item}
              onConfirm={onConfirm}
              onExclude={onExclude}
              onUndoExclude={onUndoExclude}
              onMarkActive={onMarkActive}
              onMarkInactive={onMarkInactive}
              onMarkResolved={onMarkResolved}
              onMarkAddressed={onMarkAddressed}
              onNoteRecurrence={onNoteRecurrence}
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
