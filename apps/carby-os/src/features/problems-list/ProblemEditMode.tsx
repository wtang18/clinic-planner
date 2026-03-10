import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProblemItem } from './types'
import { EDIT_TITLE } from './display-labels'
import { Button, Input, Textarea } from '@/design-system'

interface ProblemEditModeProps {
  item: ProblemItem
  onSave: (id: string, fieldUpdates: Partial<ProblemItem>, changes: { field: string; from: string; to: string }[]) => void
  onCancel: () => void
}

export function ProblemEditMode({ item, onSave, onCancel }: ProblemEditModeProps) {
  const title = EDIT_TITLE[item.category]
  const isHealthConcern = item.category === 'health-concern'

  const showAbatementDate = item.clinicalStatus === 'inactive' || item.clinicalStatus === 'resolved'

  const [description, setDescription] = useState(item.description)
  const [onsetDate, setOnsetDate] = useState(item.onsetDate ?? item.sourceDate)
  const [abatementDate, setAbatementDate] = useState(item.abatementDate ?? '')
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

    if (showAbatementDate) {
      const originalAbatement = item.abatementDate ?? ''
      if (abatementDate !== originalAbatement) {
        updates.abatementDate = abatementDate || undefined
        changes.push({ field: 'Abatement Date', from: originalAbatement, to: abatementDate })
      }
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
              <Input
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-fg-neutral-primary">{item.description}</p>
                {item.icdCode && (
                  <p className="text-xs text-fg-neutral-secondary">{item.icdCode}</p>
                )}
              </div>
            )}

            {/* Onset / Source Date */}
            <Input
              label={isHealthConcern ? 'Reported Date' : 'Onset Date'}
              value={onsetDate}
              onChange={e => setOnsetDate(e.target.value)}
              placeholder="MM/DD/YY"
            />

            {/* Abatement Date — only for inactive/resolved items */}
            {showAbatementDate && (
              <Input
                label={item.clinicalStatus === 'resolved' ? 'Resolved Date' : 'Inactive Since'}
                value={abatementDate}
                onChange={e => setAbatementDate(e.target.value)}
                placeholder="MM/DD/YY"
              />
            )}

            {/* Notes */}
            <Textarea
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional annotation"
              rows={3}
              resize="none"
            />
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
