import { Icon } from '@carbon-health/design-icons'
import type { ScreeningInstrument } from './types'

interface ScreeningBannerProps {
  screenings: ScreeningInstrument[]
  onAdminister: () => void
}

export function ScreeningBanner({ screenings, onAdminister }: ScreeningBannerProps) {
  const hasScreenings = screenings.length > 0
  const latest = hasScreenings ? screenings[0]! : null

  return (
    <div className="flex items-center gap-3 bg-bg-information-low rounded-2xl px-4 py-3">
      {/* Icon */}
      <div className="shrink-0 text-fg-neutral-secondary">
        <Icon name="clipboard-pen-small" size="small" />
      </div>

      {/* 2-line header */}
      <div className="flex flex-col gap-0 flex-1 min-w-0">
        <span className="text-sm font-medium text-fg-neutral-primary">
          {hasScreenings ? `${screenings.length} Screening${screenings.length > 1 ? 's' : ''} Administered` : 'Screenings'}
        </span>
        <span className="text-xs text-fg-neutral-secondary truncate">
          {hasScreenings && latest
            ? `Last: ${latest.name}, ${latest.administeredDate}`
            : 'None administered'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAdminister}
          className="px-3 py-1 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors"
        >
          Administer
        </button>
        {hasScreenings ? (
          <button
            onClick={() => { /* placeholder — show all screenings */ }}
            className="px-3 py-1 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors"
          >
            Show All
          </button>
        ) : (
          <button
            disabled
            className="px-3 py-1 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-disabled whitespace-nowrap cursor-not-allowed"
          >
            Show All
          </button>
        )}
      </div>
    </div>
  )
}

/* --- Screening Card for Detail Drawer --- */

interface ScreeningDetailCardProps {
  screening: ScreeningInstrument
}

export function ScreeningDetailCard({ screening }: ScreeningDetailCardProps) {
  const details = [screening.score, screening.interpretation].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
      {/* Icon */}
      <div className="shrink-0 text-fg-neutral-secondary">
        <Icon name="clipboard-pen-small" size="small" />
      </div>

      {/* 2-line header */}
      <div className="flex flex-col gap-0 flex-1 min-w-0">
        <span className="text-sm font-medium text-fg-neutral-primary">{screening.name}</span>
        <span className="text-xs text-fg-neutral-secondary truncate">
          {screening.administeredDate}{details ? ` · ${details}` : ''}
        </span>
      </div>

      {/* Action button */}
      <button
        onClick={() => { /* placeholder — show screening results */ }}
        className="px-3 py-1 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors shrink-0"
      >
        Show Results
      </button>
    </div>
  )
}
