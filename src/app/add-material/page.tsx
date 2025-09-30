'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { supabase } from '@/lib/supabase'

type EventOption = {
  id: number
  title: string
}

function AddMaterialContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('return') || 'materials'
  const preselectedEventId = searchParams.get('eventId')

  const [events, setEvents] = useState<EventOption[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    label: '',
    url: '',
    event_id: preselectedEventId ? Number(preselectedEventId) : null as number | null,
    notes: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('id, title')
        .order('title')

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setEventsLoading(false)
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
      const created = await MarketingMaterialsService.createMaterial({
        label: formData.label.trim(),
        url: formData.url.trim(),
        event_id: formData.event_id,
        notes: formData.notes.trim() || null
      })

      if (created) {
        // Navigate back to originating view
        if (returnTo === 'materials') {
          router.push('/materials')
        } else if (returnTo.startsWith('event/')) {
          router.push(`/${returnTo}`)
        } else {
          router.push('/')
        }
      } else {
        alert('Error creating material. Please try again.')
      }
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Error creating material. Please try again.')
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Marketing Material
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
                disabled={eventsLoading}
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
            <div className="flex justify-end space-x-4 pt-6 border-t">
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
                {saving ? 'Saving...' : 'Add Material'}
              </button>
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

export default function AddMaterialPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddMaterialContent />
    </Suspense>
  )
}