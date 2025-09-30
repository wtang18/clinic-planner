'use client'

import { useState } from 'react'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { NewMarketingMaterial, MarketingMaterial } from '@/lib/supabase'

interface InlineMaterialCreatorProps {
  onMaterialCreated: (material: MarketingMaterial) => void
  onCancel: () => void
  eventId?: number | null  // If provided, associate with this event
}

export default function InlineMaterialCreator({
  onMaterialCreated,
  onCancel,
  eventId = null
}: InlineMaterialCreatorProps) {
  const [formData, setFormData] = useState<NewMarketingMaterial>({
    label: '',
    url: '',
    event_id: eventId,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      // Basic URL validation
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const created = await MarketingMaterialsService.createMaterial(formData)

      if (created) {
        onMaterialCreated(created)
        // Reset form
        setFormData({
          label: '',
          url: '',
          event_id: eventId,
          notes: ''
        })
      } else {
        alert('Error creating material. Please try again.')
      }
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Error creating material. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-lg font-medium text-blue-900">Create New Material</h3>
        <p className="text-sm text-blue-700">Add a new material and associate it with this event</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Name *
          </label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.label ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="e.g., UC Health Fair Flyer"
          />
          {errors.label && (
            <p className="text-red-600 text-sm mt-1">{errors.label}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material URL *
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="https://drive.google.com/file/d/..."
          />
          {errors.url && (
            <p className="text-red-600 text-sm mt-1">{errors.url}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Contact info, working file location, special instructions..."
            rows={3}
          />
        </div>

        {!eventId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-sm text-yellow-800">
              This material will be created as an "any time" material since no event is selected.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create & Associate'}
          </button>
        </div>
      </div>
    </div>
  )
}