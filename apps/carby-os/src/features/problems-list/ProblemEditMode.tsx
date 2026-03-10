import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProblemItem } from './types'
import { EDIT_TITLE } from './display-labels'
import { Button } from '@/design-system'

interface ProblemEditModeProps {
  item: ProblemItem
  onSave: (id: string, fieldUpdates: Partial<ProblemItem>, changes: { field: string; from: string; to: string }[]) => void
  onCancel: () => void
}

export function ProblemEditMode({ item, onSave, onCancel }: ProblemEditModeProps) {
  const title = EDIT_TITLE[item.category]
  const isHealthConcern = item.category === 'health-concern'

  const [description, setDescription] = useState(item.description)
  const [onsetDate, setOnsetDate] = useState(item.onsetDate ?? item.sourceDate)
  const [notes, setNotes] = useState(item.notes ?? '')

  const handleSave = () => {
    const updates: Partial<ProblemItem> = {}
    const changes: { field: string; from: string; to: string }[] = []

    if (isHealthConcern && description !== item.description) {
      updates.description = description
      changes.push({ field: 'Description', from: item.description, to: description })
    }

    const originalDate = item.onsetDate ?? item.sourceDate
    if (onsetDate !== originalDate) {
      updates.onsetDate = onsetDate
      changes.push({ field: 'Onset Date', from: originalDate, to: onsetDate })
    }

    const originalNotes = item.notes ?? ''
    if (notes !== originalNotes) {
      updates.notes = notes || undefined
      changes.push({ field: 'Notes', from: originalNotes, to: notes })
    }

    if (changes.length > 0) {
      onSave(item.id, updates, changes)
    }
    onCancel()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onCancel} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-neutral-low">
          <h2 className="text-base font-semibold text-fg-neutral-primary">{title}</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
          <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-4">
            {/* Description — editable only for Health Concerns, display-only otherwise */}
            {isHealthConcern ? (
              <Field label="Description">
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-neutral-low bg-white text-sm text-fg-neutral-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-information-high)] focus:border-transparent"
                />
              </Field>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-fg-neutral-primary">{item.description}</p>
                {item.icdCode && (
                  <p className="text-xs text-fg-neutral-secondary">{item.icdCode}</p>
                )}
              </div>
            )}

            {/* Onset / Source Date */}
            <Field label={isHealthConcern ? 'Reported Date' : 'Onset Date'}>
              <input
                type="text"
                value={onsetDate}
                onChange={e => setOnsetDate(e.target.value)}
                placeholder="MM/DD/YY"
                className="w-full px-3 py-2 rounded-lg border border-border-neutral-low bg-white text-sm text-fg-neutral-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-information-high)] focus:border-transparent"
              />
            </Field>

            {/* Notes */}
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional annotation"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-neutral-low bg-white text-sm text-fg-neutral-primary resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-information-high)] focus:border-transparent"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-neutral-low flex items-center justify-end gap-2">
          <Button type="transparent" size="medium" label="Cancel" onClick={onCancel} />
          <Button type="primary" size="medium" label="Save" onClick={handleSave} />
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-fg-neutral-secondary uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
