import { X, Search } from 'lucide-react'
import { Button } from '@/design-system'
import type { ProblemCategory } from './types'

const DRAWER_TITLE: Record<ProblemCategory, string> = {
  'condition': 'Add Condition',
  'encounter-dx': 'Add Encounter Diagnosis',
  'sdoh': 'Add Social Determinant',
  'health-concern': 'Add Health Concern',
}

const SEARCH_PLACEHOLDER: Record<ProblemCategory, string> = {
  'condition': 'Search ICD-10-CM codes and conditions...',
  'encounter-dx': 'Search encounter diagnoses...',
  'sdoh': 'Search social determinant codes...',
  'health-concern': 'Search SNOMED CT health concern types...',
}

const CANNED_ITEM: Record<ProblemCategory, { description: string; icdCode: string | null }> = {
  'condition': { description: 'Chronic Low Back Pain', icdCode: 'M54.51' },
  'encounter-dx': { description: 'Annual Wellness Visit', icdCode: 'Z00.00' },
  'sdoh': { description: 'Housing Instability', icdCode: 'Z59.10' },
  'health-concern': { description: 'Difficulty Managing Medications', icdCode: null },
}

interface AddProblemDrawerProps {
  category: ProblemCategory
  onClose: () => void
  onAdd: (category: ProblemCategory, description: string, icdCode: string | null) => void
}

export function AddProblemDrawer({ category, onClose, onAdd }: AddProblemDrawerProps) {
  const title = DRAWER_TITLE[category]
  const placeholder = SEARCH_PLACEHOLDER[category]
  const canned = CANNED_ITEM[category]

  const handleAdd = () => {
    onAdd(category, canned.description, canned.icdCode)
    onClose()
  }

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
          <h2 className="text-base font-semibold text-fg-neutral-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
          {/* Placeholder search field */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-border-neutral-low">
            <Search size={16} className="text-fg-neutral-secondary shrink-0" />
            <span className="text-sm text-fg-neutral-disabled">{placeholder}</span>
          </div>

          {/* Placeholder message */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <p className="text-sm text-fg-neutral-secondary">
              {category === 'health-concern'
                ? 'In production, providers select from 10–12 standardized health concern types sourced from the SNOMED CT browser.'
                : 'In production, this search is powered by CMS ICD-10-CM codes and clinical terminology services.'}
            </p>
            <p className="text-sm text-fg-neutral-secondary">
              For this prototype, tap below to add a sample item.
            </p>
          </div>

          {/* Canned item preview */}
          <div className="rounded-2xl border border-border-neutral-low bg-white px-4 py-3 flex flex-col gap-1">
            <p className="text-sm font-medium text-fg-neutral-primary">{canned.description}</p>
            {canned.icdCode && (
              <p className="text-xs text-fg-neutral-secondary">{canned.icdCode}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-neutral-low flex justify-end">
          <Button type="primary" size="medium" onClick={handleAdd}>
            Add to {category === 'health-concern' ? 'Concerns' : category === 'sdoh' ? 'Social Determinants' : category === 'encounter-dx' ? 'Encounter Dx' : 'Conditions'}
          </Button>
        </div>
      </div>
    </>
  )
}
