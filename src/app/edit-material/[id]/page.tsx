'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { MarketingMaterial, supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

type EventOption = {
  id: number
  title: string
}

function EditMaterialContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const materialId = Number(params.id)
  const returnTo = searchParams.get('return') || 'materials'

  const [material, setMaterial] = useState<MarketingMaterial | null>(null)
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    label: '',
    url: '',
    event_id: null as number | null,
    notes: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    loadData()
  }, [materialId])

  const loadData = async () => {
    try {
      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events_ideas')
        .select('id, title')
        .order('title')

      if (eventsError) throw eventsError
      setEvents(eventsData || [])

      // Load material
      const materials = await MarketingMaterialsService.getAllMaterials()
      const foundMaterial = materials.find(m => m.id === materialId)

      if (foundMaterial) {
        setMaterial(foundMaterial)
        setFormData({
          label: foundMaterial.label,
          url: foundMaterial.url,
          event_id: foundMaterial.event_id,
          notes: foundMaterial.notes || ''
        })
      } else {
        // Error state UI handles this
        handleCancel()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Error state UI handles this
      handleCancel()
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.label.trim()) {
      newErrors.label = 'Material name is required'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(formData.url.trim())
      } catch {
        newErrors.url = 'Please enter a valid URL (e.g., https://example.com)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const success = await MarketingMaterialsService.updateMaterial(materialId, {
        label: formData.label.trim(),
        url: formData.url.trim(),
        notes: formData.notes.trim() || null
      })

      if (success) {
        toast.positive('Material saved successfully')
        // Navigate back to originating view
        if (returnTo === 'materials') {
          router.push('/materials')
        } else if (returnTo.startsWith('event/')) {
          router.push(`/${returnTo}`)
        } else {
          router.push('/')
        }
      } else {
        toast.alert('Failed to update material', { showSubtext: true, subtext: 'Please try again' })
      }
    } catch (error) {
      console.error('Error updating material:', error)
      toast.alert('Failed to update material', { showSubtext: true, subtext: 'Please try again' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      const success = await MarketingMaterialsService.deleteMaterial(materialId)
      if (success) {
        toast.positive('Material deleted successfully')
        // Navigate back to originating view
        if (returnTo === 'materials') {
          router.push('/materials')
        } else if (returnTo.startsWith('event/')) {
          router.push(`/${returnTo}`)
        } else {
          router.push('/')
        }
      } else {
        toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' })
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'materials') {
      router.push('/materials')
    } else if (returnTo.startsWith('event/')) {
      router.push(`/${returnTo}`)
    } else {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!material) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Marketing Material
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">

            {/* Material Name */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                Material Name <span className="text-red-500">*</span>
              </label>
              <input
                id="label"
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.label ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Spring Newsletter, FAQ Sheet, Social Media Graphics"
              />
              {errors.label && (
                <p className="text-red-500 text-sm mt-1">{errors.label}</p>
              )}
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://..."
              />
              {errors.url && (
                <p className="text-red-500 text-sm mt-1">{errors.url}</p>
              )}
            </div>

            {/* Event Association */}
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Event
              </label>
              <select
                id="event"
                value={formData.event_id || ''}
                onChange={(e) => setFormData({...formData, event_id: e.target.value ? Number(e.target.value) : null})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Any Time (Not Event Specific)</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Leave as "Any Time" for materials that can be used year-round
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Optional notes about this material..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Material
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.label.trim() || !formData.url.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </main>
  )
}

export default function EditMaterialPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditMaterialContent />
    </Suspense>
  )
}