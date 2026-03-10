import { useState, useMemo, useCallback } from 'react'
import type { ProblemItem, ProblemEvent, ProblemEventType, FilterKey, ProblemCategory, RemovalReason } from '../types'
import { mockProblems } from '../mock-data'
import { isConfirmedTransitional } from '../display-labels'

interface FilterCounts {
  unconfirmed: number
  active: number
  inactive: number
  resolved: number
  confirmed: number
  excluded: number
}

const MOCK_PERFORMER = 'Marco Rivera, PA-C'

function createEvent(type: ProblemEventType, note?: string): ProblemEvent {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const ampm = h >= 12 ? 'p' : 'a'
  const h12 = h % 12 || 12
  const mm = String(m).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const yr = String(now.getFullYear()).slice(2)
  return {
    id: `evt-${Date.now()}`,
    type,
    performedBy: MOCK_PERFORMER,
    performedAt: `${month}/${day}/${yr}, ${h12}:${mm}${ampm} PT`,
    ...(note ? { note } : {}),
  }
}

export function useProblemsState() {
  const [items, setItems] = useState<ProblemItem[]>(mockProblems)
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['all']))
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Derived: the currently selected item (for detail drawer)
  const selectedItem = useMemo(() =>
    selectedItemId ? items.find(i => i.id === selectedItemId) ?? null : null
  , [items, selectedItemId])

  // Compute filter counts across all items
  const filterCounts = useMemo<FilterCounts>(() => ({
    unconfirmed: items.filter(i => i.verificationStatus === 'unconfirmed').length,
    active: items.filter(i => i.verificationStatus === 'confirmed' && (i.clinicalStatus === 'active' || i.clinicalStatus === 'recurrence')).length,
    inactive: items.filter(i => i.verificationStatus === 'confirmed' && i.clinicalStatus === 'inactive').length,
    resolved: items.filter(i => i.verificationStatus === 'confirmed' && i.clinicalStatus === 'resolved').length,
    confirmed: items.filter(i => i.verificationStatus === 'confirmed').length,
    excluded: items.filter(i => i.verificationStatus === 'excluded').length,
  }), [items])

  // Select a single filter (toggle back to 'all' if re-clicking the active one)
  const toggleFilter = useCallback((filter: FilterKey) => {
    setActiveFilters(prev => {
      if (filter === 'all') return new Set<FilterKey>(['all'])
      if (prev.has(filter)) return new Set<FilterKey>(['all'])
      return new Set<FilterKey>([filter])
    })
  }, [])

  // Filter items by active filters
  const matchesFilter = useCallback((item: ProblemItem): boolean => {
    if (activeFilters.has('all')) return true
    for (const filter of activeFilters) {
      switch (filter) {
        case 'unconfirmed': if (item.verificationStatus === 'unconfirmed') return true; break
        case 'active': if (item.verificationStatus === 'confirmed' && (item.clinicalStatus === 'active' || item.clinicalStatus === 'recurrence')) return true; break
        case 'inactive': if (item.verificationStatus === 'confirmed' && item.clinicalStatus === 'inactive') return true; break
        case 'resolved': if (item.verificationStatus === 'confirmed' && item.clinicalStatus === 'resolved') return true; break
        case 'confirmed': if (item.verificationStatus === 'confirmed') return true; break
        case 'excluded': if (item.verificationStatus === 'excluded') return true; break
      }
    }
    return false
  }, [activeFilters])

  // Sort priority: unconfirmed → confirmed (transitional) → active → inactive/resolved → excluded
  const getSortKey = useCallback((item: ProblemItem): number => {
    if (item.verificationStatus === 'unconfirmed') return 0
    if (item.verificationStatus === 'excluded') return 4
    if (isConfirmedTransitional(item)) return 1
    if (item.clinicalStatus === 'active' || item.clinicalStatus === 'recurrence') return 2
    if (item.clinicalStatus === 'inactive' || item.clinicalStatus === 'resolved') return 3
    return 2
  }, [])

  // Get items for a specific category, filtered and sorted
  const getFilteredItems = useCallback((category: ProblemCategory): ProblemItem[] => {
    return items
      .filter(i => i.category === category && matchesFilter(i))
      .sort((a, b) => getSortKey(a) - getSortKey(b))
  }, [items, matchesFilter, getSortKey])

  function todayString(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const yr = String(now.getFullYear()).slice(2)
    return `${month}/${day}/${yr}`
  }

  // Core updater — applies field changes and appends an event
  const updateItemWithEvent = useCallback((
    id: string,
    updates: Partial<Pick<ProblemItem, 'verificationStatus' | 'clinicalStatus' | 'abatementDate'>>,
    eventType: ProblemEventType,
  ) => {
    const event = createEvent(eventType)
    // Status-changing actions capture an effectiveDate
    const statusActions: ProblemEventType[] = [
      'marked-active', 'marked-inactive', 'marked-resolved', 'marked-addressed',
      'recurrence', 'reopened', 'confirmed', 'excluded',
    ]
    if (statusActions.includes(eventType)) {
      event.effectiveDate = todayString()
    }
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, history: [event, ...item.history] }
        : item
    ))
  }, [])

  // Actions — each appends activity history
  const confirmItem = useCallback((id: string) => {
    updateItemWithEvent(id, { verificationStatus: 'confirmed' }, 'confirmed')
  }, [updateItemWithEvent])

  const excludeItem = useCallback((id: string) => {
    updateItemWithEvent(id, { verificationStatus: 'excluded' }, 'excluded')
  }, [updateItemWithEvent])

  const undoExclude = useCallback((id: string) => {
    updateItemWithEvent(id, { verificationStatus: 'unconfirmed' }, 'undo-excluded')
  }, [updateItemWithEvent])

  const undoConfirm = useCallback((id: string) => {
    updateItemWithEvent(id, { verificationStatus: 'unconfirmed' }, 'undo-confirmed')
  }, [updateItemWithEvent])

  const markActive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active', abatementDate: undefined }, 'marked-active')
  }, [updateItemWithEvent])

  const markInactive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive', abatementDate: todayString() }, 'marked-inactive')
  }, [updateItemWithEvent])

  const markResolved = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'resolved', abatementDate: todayString() }, 'marked-resolved')
  }, [updateItemWithEvent])

  const markAddressed = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive', abatementDate: todayString() }, 'marked-addressed')
  }, [updateItemWithEvent])

  const noteRecurrence = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'recurrence', abatementDate: undefined }, 'recurrence')
  }, [updateItemWithEvent])

  const reopenItem = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active', abatementDate: undefined }, 'reopened')
  }, [updateItemWithEvent])

  // Undo clinical status actions — revert to previous state
  const undoMarkActive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'undo-marked-active')
  }, [updateItemWithEvent])

  const undoMarkInactive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active' }, 'undo-marked-inactive')
  }, [updateItemWithEvent])

  const undoMarkResolved = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active' }, 'undo-marked-resolved')
  }, [updateItemWithEvent])

  const undoMarkAddressed = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active' }, 'undo-marked-addressed')
  }, [updateItemWithEvent])

  const undoReopen = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'undo-reopened')
  }, [updateItemWithEvent])

  const undoRecurrence = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'undo-recurrence')
  }, [updateItemWithEvent])

  const addItem = useCallback((category: ProblemCategory, description: string, icdCode: string | null) => {
    const id = `added-${Date.now()}`
    const newItem: ProblemItem = {
      id,
      category,
      description,
      icdCode,
      snomedCode: null,
      verificationStatus: 'unconfirmed',
      clinicalStatus: 'active',
      source: 'reported',
      sourceDate: todayString(),
      history: [createEvent('reported')],
    }
    setItems(prev => [newItem, ...prev])
  }, [])

  const editEventDate = useCallback((itemId: string, eventId: string, newDate: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const targetEvent = item.history.find(e => e.id === eventId)
      if (!targetEvent) return item
      const oldDate = targetEvent.effectiveDate ?? targetEvent.performedAt
      // Update the target event's effectiveDate
      const updatedHistory = item.history.map(e =>
        e.id === eventId ? { ...e, effectiveDate: newDate } : e
      )
      // Create an audit trail event
      const auditEvent = createEvent('event-edited')
      auditEvent.relatedEventId = eventId
      auditEvent.changes = [{ field: 'effectiveDate', from: oldDate, to: newDate }]
      return { ...item, history: [auditEvent, ...updatedHistory] }
    }))
  }, [])

  const removeItem = useCallback((id: string, reason: RemovalReason = 'entered-in-error') => {
    const event = createEvent('removed')
    event.removalReason = reason
    // Keep item in state but mark it — for now, just filter it out
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const editItem = useCallback((id: string, fieldUpdates: Partial<ProblemItem>, changes: { field: string; from: string; to: string }[]) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const event = createEvent('edited')
      event.changes = changes
      return { ...item, ...fieldUpdates, history: [event, ...item.history] }
    }))
  }, [])

  const selectItem = useCallback((id: string) => setSelectedItemId(id), [])
  const clearSelection = useCallback(() => setSelectedItemId(null), [])

  return {
    items,
    activeFilters,
    filterCounts,
    selectedItem,
    selectItem,
    clearSelection,
    toggleFilter,
    getFilteredItems,
    confirmItem,
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
    editItem,
    editEventDate,
  }
}
