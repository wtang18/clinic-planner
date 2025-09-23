'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
}

export default function AddEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnView = searchParams.get('return') || 'annual'
  const defaultMonth = searchParams.get('month')
  const defaultYear = searchParams.get('year')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    year: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
    category_id: '',
    created_by: 'clinic_admin',
    prep_months_needed: 0,
    prep_start_date: '',
    is_recurring: false
  })

  const [prepType, setPrepType] = useState<'months' | 'date' | 'none'>('none')

  useEffect(() => {
    loadCategories()
  }, [])

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
      const insertData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        month: formData.month,
        year: formData.year,
        category_id: parseInt(formData.category_id),
        created_by: formData.created_by,
        is_recurring: formData.is_recurring
      }

      // Add prep data based on selected type
      if (prepType === 'months' && formData.prep_months_needed > 0) {
        insertData.prep_months_needed = formData.prep_months_needed
      } else if (prepType === 'date' && formData.prep_start_date) {
        insertData.prep_start_date = formData.prep_start_date
      }

      const { error } = await supabase
        .from('events_ideas')
        .insert([insertData])

      if (error) {
        console.error('Error adding event:', error)
        alert('Error adding event. Please try again.')
        setLoading(false)
      } else {
        // Success - redirect back to previous view with parameters
        if (returnView === 'timeline' && defaultMonth && defaultYear) {
          router.push(`/?view=timeline&month=${defaultMonth}&year=${defaultYear}`)
        } else {
          router.push(`/?view=${returnView}`)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error adding event. Please try again.')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'month' || name === 'year' || name === 'prep_months_needed' ? parseInt(value) || 0 : value)
    }))
  }

  const handleCancel = () => {
    if (returnView === 'timeline' && defaultMonth && defaultYear) {
      router.push(`/?view=timeline&month=${defaultMonth}&year=${defaultYear}`)
    } else {
      router.push(`/?view=${returnView}`)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Event</h1>
            <p className="text-sm text-gray-600 mt-1">
              Return to: {returnView === 'annual' ? 'Annual View' : 'Timeline View'}
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

              <div className="flex justify-end space-x-4 pt-6">
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
                  {loading ? 'Adding Event...' : 'Add Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}