'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, OutreachAngle, NewEventIdea, OutreachAngleSelection } from '@/lib/supabase'


function AddEventForm() {
  const router = useRouter()
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  // Safely get search params
  let returnView = 'annual'
  let defaultMonth: string | null = null
  let defaultYear: string | null = null
  let defaultQuarter: string | null = null

  try {
    const params = useSearchParams()
    if (params) {
      returnView = params.get('return') || 'annual'
      defaultMonth = params.get('month')
      defaultYear = params.get('year')
      defaultQuarter = params.get('quarter')
    }
  } catch (error) {
    // Fallback for server-side rendering
    console.log('Search params not available during SSR')
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_month: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    start_year: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
    end_month: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    end_year: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
    is_multi_month: false,
    selected_angles: {} as Record<string, boolean>,
    angle_notes: {} as Record<string, string>,
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
        .from('outreach_angles')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading outreach angles:', error)
      } else {
        setOutreachAngles(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const selectedAngles = Object.entries(formData.selected_angles)
      .filter(([_, isSelected]) => isSelected)
      .map(([angle]) => angle)

    if (!formData.title.trim()) {
      alert('Please fill in the event title')
      return
    }

    if (selectedAngles.length === 0) {
      alert('Please select at least one outreach angle')
      return
    }

    setLoading(true)
    try {
      // Build outreach_angles array
      const outreach_angles: OutreachAngleSelection[] = selectedAngles.map(angle => ({
        angle,
        notes: formData.angle_notes[angle] || ''
      }))

      // Calculate end_year with proper year-wrapping logic
      let calculatedEndYear = formData.is_recurring ? formData.start_year : formData.end_year;

      // Handle year wrapping (e.g., Dec to Feb)
      if (formData.is_multi_month && formData.end_month < formData.start_month) {
        calculatedEndYear = formData.start_year + 1;
      }

      const eventData: NewEventIdea = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : undefined,
        end_year: formData.is_multi_month ? calculatedEndYear : undefined,
        outreach_angles,
        is_recurring: formData.is_recurring,
        created_by: formData.created_by,
        // Legacy fields for backward compatibility
        month: formData.start_month,
        year: formData.start_year,
        category_id: 1 // Default for legacy compatibility
      }

      // Add prep data based on selected type
      if (prepType === 'months' && formData.prep_months_needed > 0) {
        eventData.prep_months_needed = formData.prep_months_needed
      } else if (prepType === 'date' && formData.prep_start_date) {
        eventData.prep_start_date = formData.prep_start_date
      }

      const { data: createdEvent, error } = await supabase
        .from('events_ideas')
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error('Error adding event:', error)
        alert('Error adding event. Please try again.')
        setLoading(false)
      } else {

        // Success - redirect back to previous view with parameters
        if (returnView === 'timeline' && defaultMonth && defaultYear) {
          router.push(`/?view=timeline&month=${defaultMonth}&year=${defaultYear}`)
        } else if (returnView === 'quarter' && defaultQuarter && defaultYear) {
          router.push(`/?view=quarter&quarter=${defaultQuarter}&year=${defaultYear}`)
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
      [name]: type === 'checkbox' ? checked : (name === 'start_month' || name === 'start_year' || name === 'end_month' || name === 'end_year' || name === 'prep_months_needed' ? parseInt(value) || 0 : value)
    }))
  }

  const handleAngleToggle = (angle: string) => {
    setFormData(prev => ({
      ...prev,
      selected_angles: {
        ...prev.selected_angles,
        [angle]: !prev.selected_angles[angle]
      }
    }))
  }

  const handleAngleNotesChange = (angle: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      angle_notes: {
        ...prev.angle_notes,
        [angle]: notes
      }
    }))
  }

  const handleMultiMonthToggle = () => {
    setFormData(prev => ({
      ...prev,
      is_multi_month: !prev.is_multi_month,
      end_month: !prev.is_multi_month ? prev.start_month : prev.end_month,
      end_year: !prev.is_multi_month ? prev.start_year : prev.end_year
    }))
  }

  const handleCancel = () => {
    if (returnView === 'timeline' && defaultMonth && defaultYear) {
      router.push(`/?view=timeline&month=${defaultMonth}&year=${defaultYear}`)
    } else if (returnView === 'quarter' && defaultQuarter && defaultYear) {
      router.push(`/?view=quarter&quarter=${defaultQuarter}&year=${defaultYear}`)
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

              {/* Date Range Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Date Range *
                </label>

                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Start Date
                    </label>
                    <div className={`grid gap-3 ${formData.is_recurring ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <select
                        name="start_month"
                        value={formData.start_month}
                        onChange={handleInputChange}
                        required
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {monthNames.map((month, index) => (
                          <option key={month} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                      {!formData.is_recurring && (
                        <select
                          name="start_year"
                          value={formData.start_year}
                          onChange={handleInputChange}
                          required
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Multi-month toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_multi_month"
                      checked={formData.is_multi_month}
                      onChange={handleMultiMonthToggle}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="is_multi_month" className="text-sm font-medium text-gray-700">
                      Multi-month event
                    </label>
                  </div>

                  {/* Annual recurring toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
                      Annual recurring event (appears every year)
                    </label>
                  </div>

                  {/* End Date (conditional) */}
                  {formData.is_multi_month && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        End Date
                      </label>
                      <div className={`grid gap-3 ${formData.is_recurring ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        <select
                          name="end_month"
                          value={formData.end_month}
                          onChange={handleInputChange}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>
                              {month}
                            </option>
                          ))}
                        </select>
                        {!formData.is_recurring && (
                          <select
                            name="end_year"
                            value={formData.end_year}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {years.map(year => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Outreach Angles Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Outreach Angles *
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Select one or more outreach angles and add notes for each selected angle.
                </p>

                <div className="space-y-4">
                  {outreachAngles.map(angle => (
                    <div key={angle.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id={`angle_${angle.name}`}
                          checked={formData.selected_angles[angle.name] || false}
                          onChange={() => handleAngleToggle(angle.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <label
                          htmlFor={`angle_${angle.name}`}
                          className="flex items-center font-medium text-sm text-gray-700 cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: angle.color }}
                          ></span>
                          {angle.name} - {angle.description}
                        </label>
                      </div>

                      {formData.selected_angles[angle.name] && (
                        <div className="ml-7">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Notes for {angle.name}
                          </label>
                          <textarea
                            value={formData.angle_notes[angle.name] || ''}
                            onChange={(e) => handleAngleNotesChange(angle.name, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Add specific notes for ${angle.name} angle...`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </div>
  )
}

// Main component wrapped in Suspense
export default function AddEventPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddEventForm />
    </Suspense>
  )
}