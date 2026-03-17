import React from 'react'
import { Icon } from '@carbon-health/design-icons'
import { Button, Pill } from '@carbon-health/design-system'
import type { EncounterDx } from './types'

interface DiagnosesSectionProps {
  diagnoses: EncounterDx[]
  onAddDx: () => void
  onSelectDx: (dx: EncounterDx) => void
}

export function DiagnosesSection({ diagnoses, onAddDx, onSelectDx }: DiagnosesSectionProps) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-accent-low flex items-center justify-center">
            <Icon name="stethoscope" size="small" className="text-fg-accent-primary" />
          </div>
          <div>
            <span className="text-label-sm-medium text-fg-neutral-primary">Diagnoses</span>
            <span className="text-body-xs-regular text-fg-neutral-secondary ml-2">{diagnoses.length} Total</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="transparent" size="small" label="Add Previous" disabled />
          <Button type="transparent" size="small" iconL="magnifying-glass" label="Add Dx" onClick={onAddDx} />
        </div>
      </div>

      {/* Dx rows */}
      <div className="flex flex-col gap-2">
        {diagnoses.map(dx => (
          <button
            key={dx.id}
            onClick={() => onSelectDx(dx)}
            className="flex items-center justify-between py-2.5 px-3 bg-bg-neutral-subtle rounded-xl hover:bg-bg-transparent-low transition-colors text-left w-full"
          >
            <span className="text-body-sm-regular text-fg-neutral-primary flex-1 pr-4">
              {dx.description}
            </span>
            <Pill type="outlined" size="small" label={dx.icdCode} />
          </button>
        ))}
        {diagnoses.length === 0 && (
          <p className="text-body-sm-regular text-fg-neutral-secondary py-3">No diagnoses added.</p>
        )}
      </div>
    </div>
  )
}
