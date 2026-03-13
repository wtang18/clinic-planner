import { useState } from 'react'
import { useProblemsState } from './hooks/useProblemsState'
import { FilterBar } from './FilterBar'
import { ProblemSection } from './ProblemSection'
import { ScreeningBanner } from './ScreeningBanner'
import { ProblemDetailDrawer } from './ProblemDetailDrawer'
import { AddProblemDrawer } from './AddProblemDrawer'
import { AdministerScreeningDrawer } from './AdministerScreeningDrawer'
import { screeningInstruments } from './mock-data'
import type { ProblemCategory } from './types'

interface ProblemsListViewProps {
  mode?: 'tab' | 'drawer'
}

export function ProblemsListView({ mode: _mode = 'tab' }: ProblemsListViewProps) {
  const {
    activeFilters,
    filterCounts,
    selectedItem,
    selectItem,
    clearSelection,
    toggleFilter,
    getFilteredItems,
    confirmActive,
    confirmInactive,
    confirmResolved,
    excludeItem,
    undoExclude,
    undoConfirm,
    markActive,
    markInactive,
    markResolved,
    markAddressed,
    noteRecurrence,
    reopenItem,
    undoMarkActive,
    undoMarkInactive,
    undoMarkResolved,
    undoMarkAddressed,
    undoReopen,
    undoRecurrence,
    addItem,
    removeItem,
    updateDates,
    deleteEvent,
    undoDeleteEvent,
  } = useProblemsState()

  const [addingCategory, setAddingCategory] = useState<ProblemCategory | null>(null)
  const [showScreeningDrawer, setShowScreeningDrawer] = useState(false)

  const conditions = getFilteredItems('condition')
  const encounterDx = getFilteredItems('encounter-dx')
  const sdoh = getFilteredItems('sdoh')
  const healthConcerns = getFilteredItems('health-concern')

  const sharedHandlers = {
    onConfirmActive: confirmActive,
    onExclude: excludeItem,
    onUndoExclude: undoExclude,
    onMarkActive: markActive,
    onMarkInactive: markInactive,
    onMarkResolved: markResolved,
    onMarkAddressed: markAddressed,
    onNoteRecurrence: noteRecurrence,
    onReopen: reopenItem,
    onDetailClick: selectItem,
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-5 h-full overflow-auto pb-12">
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
            actions={[{ label: 'Add', onClick: () => setAddingCategory('condition') }]}
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
            actions={[]}
            {...sharedHandlers}
          >
            <ScreeningBanner screenings={screeningInstruments} onAdminister={() => setShowScreeningDrawer(true)} />
          </ProblemSection>

          {/* Health Concerns */}
          <ProblemSection
            title="Health Concerns"
            items={healthConcerns}
            actions={[{ label: 'Add', onClick: () => setAddingCategory('health-concern') }]}
            {...sharedHandlers}
          />
        </div>
      </div>

      {/* Detail drawer */}
      {selectedItem && (
        <ProblemDetailDrawer
          item={selectedItem}
          onClose={clearSelection}
          onConfirmActive={confirmActive}
          onConfirmInactive={confirmInactive}
          onConfirmResolved={confirmResolved}
          onExclude={excludeItem}
          onUndoExclude={undoExclude}
          onUndoConfirm={undoConfirm}
          onMarkActive={markActive}
          onMarkInactive={markInactive}
          onMarkResolved={markResolved}
          onMarkAddressed={markAddressed}
          onNoteRecurrence={noteRecurrence}
          onReopen={reopenItem}
          onUndoMarkActive={undoMarkActive}
          onUndoMarkInactive={undoMarkInactive}
          onUndoMarkResolved={undoMarkResolved}
          onUndoMarkAddressed={undoMarkAddressed}
          onUndoReopen={undoReopen}
          onUndoRecurrence={undoRecurrence}
          onRemove={removeItem}
          onUpdateDates={updateDates}
          onDeleteEvent={deleteEvent}
          onUndoDeleteEvent={undoDeleteEvent}
        />
      )}

      {/* Add problem drawer */}
      {addingCategory && (
        <AddProblemDrawer
          category={addingCategory}
          onClose={() => setAddingCategory(null)}
          onAdd={addItem}
        />
      )}

      {/* Administer screening drawer */}
      {showScreeningDrawer && (
        <AdministerScreeningDrawer
          onClose={() => setShowScreeningDrawer(false)}
        />
      )}
    </>
  )
}
