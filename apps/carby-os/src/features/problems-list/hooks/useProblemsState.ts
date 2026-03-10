import { useState, useMemo, useCallback } from 'react'
import type { ProblemItem, ProblemEvent, ProblemEventType, FilterKey, ProblemCategory } from '../types'
import { mockProblems } from '../mock-data'

interface FilterCounts {
  unconfirmed: number
  active: number
  inactive: number
  confirmed: number
  excluded: number
}

const MOCK_PERFORMER = 'Albert Chong, PA-C'

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
    active: items.filter(i => i.clinicalStatus === 'active').length,
    inactive: items.filter(i => i.clinicalStatus === 'inactive' || i.clinicalStatus === 'resolved').length,
    confirmed: items.filter(i => i.verificationStatus === 'confirmed').length,
    excluded: items.filter(i => i.verificationStatus === 'excluded').length,
  }), [items])

  // Toggle a filter
  const toggleFilter = useCallback((filter: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (filter === 'all') {
        return new Set<FilterKey>(['all'])
      }
      next.delete('all')
      if (next.has(filter)) {
        next.delete(filter)
        if (next.size === 0) return new Set<FilterKey>(['all'])
      } else {
        next.add(filter)
      }
      return next
    })
  }, [])

  // Filter items by active filters
  const matchesFilter = useCallback((item: ProblemItem): boolean => {
    if (activeFilters.has('all')) return true
    for (const filter of activeFilters) {
      switch (filter) {
        case 'unconfirmed': if (item.verificationStatus === 'unconfirmed') return true; break
        case 'active': if (item.clinicalStatus === 'active') return true; break
        case 'inactive': if (item.clinicalStatus === 'inactive' || item.clinicalStatus === 'resolved') return true; break
        case 'confirmed': if (item.verificationStatus === 'confirmed') return true; break
        case 'excluded': if (item.verificationStatus === 'excluded') return true; break
      }
    }
    return false
  }, [activeFilters])

  // Get items for a specific category, filtered
  const getFilteredItems = useCallback((category: ProblemCategory): ProblemItem[] => {
    return items.filter(i => i.category === category && matchesFilter(i))
  }, [items, matchesFilter])

  // Core updater — applies field changes and appends an event
  const updateItemWithEvent = useCallback((
    id: string,
    updates: Partial<Pick<ProblemItem, 'verificationStatus' | 'clinicalStatus'>>,
    eventType: ProblemEventType,
  ) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, history: [createEvent(eventType), ...item.history] }
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

  const markActive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active' }, 'marked-active')
  }, [updateItemWithEvent])

  const markInactive = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'marked-inactive')
  }, [updateItemWithEvent])

  const markResolved = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'marked-resolved')
  }, [updateItemWithEvent])

  const markAddressed = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'inactive' }, 'marked-addressed')
  }, [updateItemWithEvent])

  const reopenItem = useCallback((id: string) => {
    updateItemWithEvent(id, { clinicalStatus: 'active' }, 'reopened')
  }, [updateItemWithEvent])

  const removeItem = useCallback((id: string) => {
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
    markActive,
    markInactive,
    markResolved,
    markAddressed,
    reopenItem,
    removeItem,
    editItem,
  }
}
