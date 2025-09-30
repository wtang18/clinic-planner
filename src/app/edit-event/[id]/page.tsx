'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { supabase, OutreachAngle, EventIdea, OutreachAngleSelection } from '@/lib/supabase'
import { initializeFormFromEvent, eventDataProcessor } from '@/lib/eventHelpers'


function EditEventContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const eventId = params.id as string
  const returnView = searchParams.get('return') || 'annual'
  const returnMonth = searchParams.get('month')
  const returnYear = searchParams.get('year')

  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [currentEvent, setCurrentEvent] = useState<EventIdea | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_month: new Date().getMonth() + 1,
    start_year: new Date().getFullYear(),
    end_month: new Date().getMonth() + 1,
    end_year: new Date().getFullYear(),
    is_multi_month: false,
    selected_angles: {} as Record<string, boolean>,
    angle_notes: {} as Record<string, string>,
    prep_months_needed: 0,
    prep_start_date: '',
    is_recurring: false,
    created_by: 'clinic_admin'
  })

  const [prepType, setPrepType] = useState<'months' | 'date' | 'none'>('none')

  useEffect(() => {
    loadEventData()
    loadOutreachAngles()
  }, [eventId])

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select(`
          *,
          category:outreach_angles(id, name, color, description)
        `)
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('Error loading event:', error)
        alert('Error loading event data')
        handleCancel()
        return
      }

      if (data) {
        setCurrentEvent(data as EventIdea)

        // Use the helper function to initialize form data with backward compatibility
        const initialFormData = initializeFormFromEvent(data as EventIdea)
        if (initialFormData) {
          setFormData(initialFormData)
        }

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

  const loadOutreachAngles = async () => {
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

      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : null,
        end_year: formData.is_multi_month ? calculatedEndYear : null,
        outreach_angles,
        created_by: formData.created_by,
        is_recurring: formData.is_recurring,
        prep_months_needed: null,
        prep_start_date: null,
        // Update legacy fields for backward compatibility
        month: formData.start_month,
        year: formData.start_year,
        category_id: 1 // Default for legacy compatibility
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
                      id="is_recurring_edit"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="is_recurring_edit" className="text-sm font-medium text-gray-700">
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
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </main>
  )
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditEventContent />
    </Suspense>
  )
}
