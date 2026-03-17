import React from 'react'

interface SkeletonSectionProps {
  title: string
  subtitle?: string
  /** Number of skeleton lines to show */
  lines?: number
  /** Show a trailing action button placeholder */
  showAction?: boolean
  actionLabel?: string
}

/**
 * Placeholder chart section with skeleton bars.
 * Used for Vitals, Allergies, Meds, Patient Instructions, Documentation, Sign Off.
 */
export function SkeletonSection({ title, subtitle, lines = 2, showAction, actionLabel }: SkeletonSectionProps) {
  return (
    <div className="flex flex-col gap-3 py-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon placeholder */}
          <div className="w-8 h-8 rounded-xl bg-bg-neutral-low" />
          <div>
            <div className="text-label-sm-medium text-fg-neutral-primary">{title}</div>
            {subtitle && (
              <div className="text-body-xs-regular text-fg-neutral-secondary">{subtitle}</div>
            )}
          </div>
        </div>
        {showAction && (
          <div className="h-8 px-4 rounded-full bg-bg-neutral-low flex items-center">
            <span className="text-label-xs-medium text-fg-neutral-secondary">{actionLabel ?? 'Action'}</span>
          </div>
        )}
      </div>

      {/* Skeleton content lines */}
      <div className="ml-11 flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-bg-neutral-low"
            style={{ width: `${55 + Math.sin(i * 2.1) * 25}%` }}
          />
        ))}
      </div>
    </div>
  )
}
