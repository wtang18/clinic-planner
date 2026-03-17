import React, { useState, useMemo, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Icon } from '@carbon-health/design-icons'
import { SplitButton } from '../encounter-chart/SplitButton'
import { searchDiagnoses, getFacetsForSearch } from '../encounter-chart/mock-data'
import type { DxSearchResult, FacetGroup } from '../encounter-chart/types'

interface SearchDiagnosesModalProps {
  onClose: () => void
  onSelect: (description: string, icdCode: string) => void
  onSelectAndProblems: (description: string, icdCode: string) => void
}

export function SearchDiagnosesModal({ onClose, onSelect, onSelectAndProblems }: SearchDiagnosesModalProps) {
  const [query, setQuery] = useState('')
  const [selectedFacet, setSelectedFacet] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search results
  const results = useMemo(() => searchDiagnoses(query, selectedFacet ?? undefined), [query, selectedFacet])
  const facets = useMemo(() => getFacetsForSearch(query), [query])

  // Auto-expand first facet group when results appear
  useEffect(() => {
    if (facets.length > 0 && !expandedGroup) {
      setExpandedGroup(facets[0]!.label)
    }
  }, [facets, expandedGroup])

  const handleSelect = (r: DxSearchResult) => {
    onSelect(r.description, r.icdCode)
    onClose()
  }

  const handleSelectAndProblems = (r: DxSearchResult) => {
    onSelectAndProblems(r.description, r.icdCode)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg-neutral-subtle flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-fg-transparent-soft">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-primary"
        >
          <X size={18} />
        </button>
        <h1 className="text-label-sm-medium text-fg-neutral-primary">Search Diagnoses</h1>
        <button
          onClick={onClose}
          className="text-body-sm-regular text-fg-accent-primary hover:opacity-70 transition-opacity"
        >
          Cancel
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 py-3 border-b border-fg-transparent-soft">
        <div className="flex items-center gap-2 bg-[var(--color-bg-transparent-low)] rounded-lg px-3 py-2">
          <Icon name="magnifying-glass" size="small" className="text-fg-neutral-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedFacet(null); setExpandedGroup(null) }}
            placeholder="Search for a diagnosis..."
            className="flex-1 bg-transparent border-0 outline-none text-body-sm-regular text-fg-neutral-primary placeholder:text-fg-neutral-secondary"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedFacet(null); setExpandedGroup(null) }}
              className="text-fg-neutral-primary hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body: facets + results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — facets */}
        {facets.length > 0 && (
          <div className="w-[200px] shrink-0 border-r border-fg-transparent-soft overflow-auto py-3 px-4">
            {facets.map(group => (
              <FacetGroupSection
                key={group.label}
                group={group}
                expanded={expandedGroup === group.label}
                selectedFacet={selectedFacet}
                onToggle={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                onSelectFacet={(facet) => setSelectedFacet(selectedFacet === facet ? null : facet)}
              />
            ))}
          </div>
        )}

        {/* Results table */}
        <div className="flex-1 overflow-auto">
          {results.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-fg-transparent-soft">
                  <th className="text-left px-5 py-2 text-label-xs-medium text-fg-neutral-secondary font-medium">Description</th>
                  <th className="text-right px-3 py-2 text-label-xs-medium text-fg-neutral-secondary font-medium w-[100px]">ICD-10-CM</th>
                  <th className="w-[140px] px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-fg-transparent-soft last:border-b-0 hover:bg-bg-transparent-low transition-colors">
                    <td className="px-5 py-3 text-body-sm-regular text-fg-neutral-primary">{r.description}</td>
                    <td className="px-3 py-3 text-body-sm-regular text-fg-neutral-secondary text-right">{r.icdCode}</td>
                    <td className="px-3 py-3 text-right">
                      <SplitButton
                        onSelect={() => handleSelect(r)}
                        onSelectAndProblems={() => handleSelectAndProblems(r)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : query.length >= 2 ? (
            <div className="flex items-center justify-center h-full text-body-sm-regular text-fg-neutral-secondary">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-body-sm-regular text-fg-neutral-secondary">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Facet Group ─── */

function FacetGroupSection({
  group,
  expanded,
  selectedFacet,
  onToggle,
  onSelectFacet,
}: {
  group: FacetGroup
  expanded: boolean
  selectedFacet: string | null
  onToggle: () => void
  onSelectFacet: (facet: string) => void
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 w-full text-left py-1.5 text-label-xs-medium text-fg-neutral-primary hover:opacity-70 transition-opacity"
      >
        <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size="small" className="text-fg-neutral-secondary" />
        {group.label}
      </button>
      {expanded && group.items.length > 0 && (
        <div className="ml-5 flex flex-col gap-0.5">
          {group.items.map(item => (
            <button
              key={item}
              onClick={() => onSelectFacet(item)}
              className={`text-left py-1 px-2 rounded text-body-xs-regular transition-colors ${
                selectedFacet === item
                  ? 'bg-bg-accent-medium text-white'
                  : 'text-fg-accent-primary hover:bg-bg-transparent-low'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {expanded && group.items.length === 0 && (
        <div className="ml-5 py-1 text-body-xs-regular text-fg-neutral-secondary italic">
          No filters
        </div>
      )}
    </div>
  )
}
