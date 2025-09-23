'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
}

interface EventData {
  id: number
  title: string
  description: string | null
  month: number
  year: number
  category_id: number
  created_by: string
  prep_months_needed: number | null
  prep_start_date: string | null
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const eventId = params.id as string
  const returnView = searchParams.get('return') || 'annual'
  const returnMonth = searchParams.get('month')
  const returnYear = searchParams.get('year')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category_id: '',
    created_by: 'clinic_admin',
    prep_months_needed: 0,
    prep_start_date: '',
    is_recurring: false
  })

  const [prepType, setPrepType] = useState<'months' | 'date' | 'none'>('none')

  useEffect(() => {
    loadEventData()
    loadCategories()
  }, [eventId])

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('Error loading event:', error)
        alert('Error loading event data')
        handleCancel()
        return
      }

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          month: data.month || new Date().getMonth() + 1,
          year: data.year || new Date().getFullYear(),
          category_id: data.category_id?.toString() || '',
          created_by: data.created_by || 'clinic_admin',
          prep_months_needed: data.prep_months_needed || 0,
          prep_start_date: data.prep_start_date || '',
          is_recurring: data.is_recurring || false
        })

        // Set prep type based on existing data
        if (data.prep_start_date) {
          setPrepType('date')
        } else if (data.prep_months_needed && data.prep_months_needed > 0) {
          setPrepType('months')
        } else {
          setPrepType('none')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error loading event data')
      handleCancel()
    } finally {
      setInitialLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error loading categories:', error)
      } else {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.category_id) {
      alert('Please fill in title and category')
      return
    }

    setLoading(true)
    try {
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        month: formData.month,
        year: formData.year,
        category_id: parseInt(formData.category_id),
        created_by: formData.created_by,
        is_recurring: formData.is_recurring,
        prep_months_needed: null,
        prep_start_date: null
      }

      // Add prep data based on selected type
      if (prepType === 'months' && formData.prep_months_needed > 0) {
        updateData.prep_months_needed = formData.prep_months_needed
      } else if (prepType === 'date' && formData.prep_start_date) {
        updateData.prep_start_date = formData.prep_start_date
      }

      const { error } = await supabase
        .from('events_ideas')
        .update(updateData)
        .eq('id', eventId)

      if (error) {
        console.error('Error updating event:', error)
        alert('Error updating event. Please try again.')
        setLoading(false)
      } else {
        handleReturnNavigation()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating event. Please try again.')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('events_ideas')
        .delete()
        .eq('id', eventId)

      if (error) {
        console.error('Error deleting event:', error)
        alert('Error deleting event. Please try again.')
        setLoading(false)
      } else {
        handleReturnNavigation()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting event. Please try again.')
      setLoading(false)
    }
  }

  const handleReturnNavigation = () => {
    if (returnView === 'timeline' && returnMonth && returnYear) {
      router.push(`/?view=timeline&month=${returnMonth}&year=${returnYear}`)
    } else {
      router.push(`/?view=${returnView}`)
    }
  }

  const handleCancel = () => {
    handleReturnNavigation()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'month' || name === 'year' || name === 'prep_months_needed' ? parseInt(value) || 0 : value)
    }))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg text-gray-600">Loading event data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Return to: {returnView === 'annual' ? 'Annual View' : 'Timeline View'}
              {returnView === 'timeline' && returnMonth && returnYear && ` - ${monthNames[parseInt(returnMonth) - 1]} ${returnYear}`}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring Event */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Annual recurring event (appears every year)
                </label>
              </div>

              {/* Preparation Planning */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preparation Planning
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="prep-none"
                      name="prepType"
                      value="none"
                      checked={prepType === 'none'}
                      onChange={(e) => setPrepType(e.target.value as 'months' | 'date' | 'none')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="prep-none" className="ml-2 text-sm text-gray-700">
                      No preparation needed
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="prep-months"
                      name="prepType"
                      value="months"
                      checked={prepType === 'months'}
                      onChange={(e) => setPrepType(e.target.value as 'months' | 'date' | 'none')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="prep-months" className="ml-2 text-sm text-gray-700">
                      Start preparation months before event
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="prep-date"
                      name="prepType"
                      value="date"
                      checked={prepType === 'date'}
                      onChange={(e) => setPrepType(e.target.value as 'months' | 'date' | 'none')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="prep-date" className="ml-2 text-sm text-gray-700">
                      Start preparation on specific date
                    </label>
                  </div>
                </div>

                {prepType === 'months' && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Months before event
                    </label>
                    <input
                      type="number"
                      name="prep_months_needed"
                      value={formData.prep_months_needed}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 3"
                    />
                  </div>
                )}

                {prepType === 'date' && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Preparation start date
                    </label>
                    <input
                      type="date"
                      name="prep_start_date"
                      value={formData.prep_start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t">
                {/* Delete Section */}
                <div>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                      Delete Event
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Save/Cancel Section */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Event'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}