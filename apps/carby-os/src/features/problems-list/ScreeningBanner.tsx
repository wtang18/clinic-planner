import { ClipboardCheck } from 'lucide-react'
import type { ScreeningInstrument } from './types'

interface ScreeningBannerProps {
  screenings: ScreeningInstrument[]
}

export function ScreeningBanner({ screenings }: ScreeningBannerProps) {
  if (screenings.length === 0) {
    return (
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} className="text-fg-neutral-secondary" />
          <span className="text-sm text-fg-neutral-secondary">No screenings administered</span>
        </div>
        <button
          onClick={() => { /* placeholder */ }}
          className="text-xs font-semibold text-fg-neutral-primary hover:underline"
        >
          Administer Screening
        </button>
      </div>
    )
  }

  const latest = screenings[0]
  const summary = `${screenings.length} screening${screenings.length > 1 ? 's' : ''} administered`
  const lastInfo = latest.abbreviation && latest.administeredDate
    ? ` · Last: ${latest.abbreviation} ${latest.administeredDate}`
    : ''

  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <ClipboardCheck size={16} className="text-fg-neutral-secondary shrink-0" />
        <span className="text-sm text-fg-neutral-primary truncate">
          {summary}{lastInfo}
        </span>
      </div>
      <button
        onClick={() => { /* placeholder — toast "Screening History — coming soon" */ }}
        className="text-xs font-semibold text-fg-neutral-primary hover:underline shrink-0 ml-3"
      >
        View All
      </button>
    </div>
  )
}
