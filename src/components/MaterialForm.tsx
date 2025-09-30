'use client'

import { useState, useEffect } from 'react'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { MarketingMaterial, NewMarketingMaterial } from '@/lib/supabase'

interface MaterialFormProps {
  material?: MarketingMaterial | null
  onSave: () => void
  onCancel: () => void
}

export default function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const [formData, setFormData] = useState<NewMarketingMaterial>({
    label: '',
    url: '',
    event_id: null,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (material) {
      setFormData({
        label: material.label,
        url: material.url,
        event_id: material.event_id,
        notes: material.notes
      })
    } else {
      setFormData({
        label: '',
        url: '',
        event_id: null,
        notes: ''
      })
    }
  }, [material])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      let success = false

      if (material) {
        // Update existing material
        const updated = await MarketingMaterialsService.updateMaterial(material.id, formData)
        success = updated !== null
      } else {
        // Create new material
        const created = await MarketingMaterialsService.createMaterial(formData)
        success = created !== null
      }

      if (success) {
        onSave()
      } else {
        alert('Error saving material. Please try again.')
      }
    } catch (error) {
      console.error('Error saving material:', error)
      alert('Error saving material. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {material ? 'Edit Material' : 'Add New Material'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label *
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
            URL *
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
          <p className="text-gray-500 text-sm mt-1">
            Link to where the material is stored (Google Drive, Dropbox, etc.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Contact info, working file location, special instructions..."
            rows={3}
          />
          <p className="text-gray-500 text-sm mt-1">
            Add any additional information about this material
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Materials are now either "Any Time" (no event association) or tied to a specific event.
            {formData.event_id === null ? ' This material will be available for any event.' : ` This material is associated with event ID ${formData.event_id}.`}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
          </button>
        </div>
      </form>
    </div>
  )
}