import { useState, useMemo, useCallback } from 'react'
import type { ProblemItem, FilterKey, ProblemCategory } from '../types'
import { mockProblems } from '../mock-data'

interface FilterCounts {
  unconfirmed: number
  active: number
  inactive: number
  confirmed: number
  excluded: number
}

export function useProblemsState() {
  const [items, setItems] = useState<ProblemItem[]>(mockProblems)
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['all']))

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

  // Actions
  const updateItem = useCallback((id: string, updates: Partial<Pick<ProblemItem, 'verificationStatus' | 'clinicalStatus'>>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const confirmItem = useCallback((id: string) => {
    updateItem(id, { verificationStatus: 'confirmed', clinicalStatus: 'active' })
  }, [updateItem])

  const excludeItem = useCallback((id: string) => {
    updateItem(id, { verificationStatus: 'excluded' })
  }, [updateItem])

  const markActive = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'active' })
  }, [updateItem])

  const markInactive = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'inactive' })
  }, [updateItem])

  const markResolved = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'resolved' })
  }, [updateItem])

  const reopenItem = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'active' })
  }, [updateItem])

  return {
    items,
    activeFilters,
    filterCounts,
    toggleFilter,
    getFilteredItems,
    confirmItem,
    excludeItem,
    markActive,
    markInactive,
    markResolved,
    reopenItem,
  }
}
