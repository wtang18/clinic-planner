'use client'

import { useState, useEffect } from 'react'
import { MarketingMaterial } from '@/lib/supabase'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import InlineMaterialCreator from './InlineMaterialCreator'

interface MaterialsSelectorProps {
  selectedMaterialIds: number[]
  onSelectionChange: (materialIds: number[]) => void
  showAnyTime?: boolean
  currentEventId?: number | null  // For inline creation context
}

export default function MaterialsSelector({
  selectedMaterialIds,
  onSelectionChange,
  showAnyTime = true,
  currentEventId = null
}: MaterialsSelectorProps) {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const allMaterials = await MarketingMaterialsService.getAllMaterials()
      setMaterials(allMaterials)
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialToggle = (materialId: number) => {
    const isSelected = selectedMaterialIds.includes(materialId)
    let newSelection: number[]

    if (isSelected) {
      newSelection = selectedMaterialIds.filter(id => id !== materialId)
    } else {
      newSelection = [...selectedMaterialIds, materialId]
    }

    onSelectionChange(newSelection)
  }

  const handleNewMaterialCreated = (newMaterial: MarketingMaterial) => {
    // Add the new material to the current materials list
    setMaterials(prev => [...prev, newMaterial])

    // Automatically select the new material
    const newSelection = [...selectedMaterialIds, newMaterial.id]
    onSelectionChange(newSelection)

    // Hide the add form
    setShowAddForm(false)
  }

  const displayMaterials = showAnyTime
    ? materials
    : materials.filter(m => m.event_id !== null)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Marketing Materials
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add New Material
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4">
          <InlineMaterialCreator
            onMaterialCreated={handleNewMaterialCreated}
            onCancel={() => setShowAddForm(false)}
            eventId={currentEventId}
          />
        </div>
      )}

      {displayMaterials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm">No materials available</p>
          <p className="text-xs">Create your first material above</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {displayMaterials.map((material) => (
            <div
              key={material.id}
              className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                id={`material-${material.id}`}
                checked={selectedMaterialIds.includes(material.id)}
                onChange={() => handleMaterialToggle(material.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label
                htmlFor={`material-${material.id}`}
                className="flex-1 cursor-pointer"
              >
                <div className="text-sm font-medium text-gray-900">
                  {material.label}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {material.url}
                  </a>
                  {material.event_id === null && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Any Time
                    </span>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {selectedMaterialIds.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900">
            {selectedMaterialIds.length} material{selectedMaterialIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="text-xs text-blue-700 mt-1">
            These materials will be associated with this event
          </div>
        </div>
      )}
    </div>
  )
}