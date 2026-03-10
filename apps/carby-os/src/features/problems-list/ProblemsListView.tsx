import { useProblemsState } from './hooks/useProblemsState'
import { FilterBar } from './FilterBar'
import { ProblemSection } from './ProblemSection'
import { ScreeningInstruments } from './ScreeningInstruments'
import { screeningInstruments } from './mock-data'

interface ProblemsListViewProps {
  mode?: 'tab' | 'drawer'
}

export function ProblemsListView({ mode: _mode = 'tab' }: ProblemsListViewProps) {
  const {
    activeFilters,
    filterCounts,
    toggleFilter,
    getFilteredItems,
    confirmItem,
    excludeItem,
    undoExclude,
    markActive,
    markInactive,
    markResolved,
    markAddressed,
    reopenItem,
  } = useProblemsState()

  const conditions = getFilteredItems('condition')
  const encounterDx = getFilteredItems('encounter-dx')
  const sdoh = getFilteredItems('sdoh')
  const healthConcerns = getFilteredItems('health-concern')

  const sharedHandlers = {
    onConfirm: confirmItem,
    onExclude: excludeItem,
    onUndoExclude: undoExclude,
    onMarkActive: markActive,
    onMarkInactive: markInactive,
    onMarkResolved: markResolved,
    onMarkAddressed: markAddressed,
    onReopen: reopenItem,
    onDetailClick: (_id: string) => {
      // Phase 2: open detail drawer
    },
  }

  const handleAddPlaceholder = () => {
    // Placeholder — search powered by CMS ICD-10-CM in production
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-3 h-full overflow-auto pb-12">
      <FilterBar
        activeFilters={activeFilters}
        counts={filterCounts}
        onToggle={toggleFilter}
      />

      <div className="flex flex-col gap-6">
        {/* Conditions */}
        <ProblemSection
          title="Conditions"
          items={conditions}
          actions={[{ label: 'Add', onClick: handleAddPlaceholder }]}
          {...sharedHandlers}
        />

        {/* Encounter Dx */}
        <ProblemSection
          title="Encounter Dx"
          items={encounterDx}
          rightLabel="Automatically imported"
          {...sharedHandlers}
        />

        {/* Social Determinants */}
        <ProblemSection
          title="Social Determinants"
          items={sdoh}
          actions={[
            { label: 'Administer Screening', onClick: handleAddPlaceholder },
            { label: 'Add', onClick: handleAddPlaceholder },
          ]}
          {...sharedHandlers}
        >
          <ScreeningInstruments instruments={screeningInstruments} />
        </ProblemSection>

        {/* Health Concerns */}
        <ProblemSection
          title="Health Concerns"
          items={healthConcerns}
          actions={[{ label: 'Add', onClick: handleAddPlaceholder }]}
          {...sharedHandlers}
        />
      </div>
    </div>
  )
}
