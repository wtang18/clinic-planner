import { TogglePill } from '@/design-system'
import type { FilterKey } from './types'

interface FilterBarProps {
  activeFilters: Set<FilterKey>
  counts: {
    unconfirmed: number
    active: number
    inactive: number
    resolved: number
    confirmed: number
    excluded: number
  }
  onToggle: (filter: FilterKey) => void
}

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unconfirmed', label: 'Unconfirmed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'excluded', label: 'Excluded' },
]

export function FilterBar({ activeFilters, counts, onToggle }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap sticky top-0 z-10 bg-bg-neutral-subtle py-1">
      {filters.map(({ key, label }) => {
        const count = key !== 'all' ? counts[key] : undefined
        const selected = activeFilters.has(key)
        return (
          <TogglePill
            key={key}
            label={label}
            selected={selected}
            rightSubtext={count !== undefined && count > 0 ? String(count) : undefined}
            onChange={() => onToggle(key)}
            size="small"
          />
        )
      })}
    </div>
  )
}
