import React from 'react'
import { X } from 'lucide-react'
import { Pill, Button } from '@carbon-health/design-system'
import type { EncounterDx } from './types'

interface DxDetailDrawerProps {
  dx: EncounterDx
  onClose: () => void
  onRemove: (id: string) => void
  onAddToProblems: (id: string) => void
}

/**
 * Diagnosis Detail Drawer — right-side 600px panel.
 * Follows ProblemDetailDrawer patterns:
 * - Overview card (name + ICD pill, no status)
 * - Skeleton activity log
 * - Footer button row (Remove + Add to Problems List)
 */
export function DxDetailDrawer({ dx, onClose, onRemove, onAddToProblems }: DxDetailDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-neutral-low">
          <h2 className="text-base font-semibold text-fg-neutral-primary">Diagnosis Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
          {/* Overview card */}
          <div className="bg-white rounded-2xl px-4 py-4 flex flex-col">
            <p className="text-heading-md-bold text-fg-neutral-primary leading-7">
              {dx.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <Pill type="outlined" size="small" label={dx.icdCode} />
              {dx.addedToProblems && (
                <Pill type="transparent" size="small" label="Unconfirmed" subtextR="Problems List" />
              )}
            </div>
          </div>

          {/* Activity log — skeleton */}
          <div className="flex flex-col gap-0">
            <span className="text-label-sm-medium text-fg-neutral-primary mb-2">Activity</span>

            {/* Entry 1 */}
            <div className="py-2.5 border-t border-fg-transparent-soft">
              <div className="h-[11px] rounded bg-bg-neutral-low" style={{ width: '45%' }} />
              <div className="h-[9px] rounded bg-bg-neutral-low mt-1.5" style={{ width: '60%', opacity: 0.7 }} />
            </div>

            {/* Entry 2 */}
            <div className="py-2.5 border-t border-fg-transparent-soft">
              <div className="h-[11px] rounded bg-bg-neutral-low" style={{ width: '35%' }} />
              <div className="h-[9px] rounded bg-bg-neutral-low mt-1.5" style={{ width: '55%', opacity: 0.7 }} />
            </div>

            {/* Entry 3 */}
            <div className="py-2.5 border-t border-fg-transparent-soft">
              <div className="h-[11px] rounded bg-bg-neutral-low" style={{ width: '40%' }} />
              <div className="h-[9px] rounded bg-bg-neutral-low mt-1.5" style={{ width: '50%', opacity: 0.7 }} />
            </div>
          </div>
        </div>

        {/* Footer button row — no top divider */}
        <div className="px-5 py-3 flex items-center justify-between">
          <Button
            type="high-impact"
            size="medium"
            label="Remove"
            onClick={() => { onRemove(dx.id); onClose() }}
          />
          <Button
            type="primary"
            size="medium"
            label="Add to Problems List"
            onClick={() => onAddToProblems(dx.id)}
            disabled={dx.addedToProblems}
          />
        </div>
      </div>
    </>
  )
}
