'use client'

import { useState, useEffect } from 'react'
import { supabase, OutreachAngle, NewEventIdea, OutreachAngleSelection } from '@/lib/supabase'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventAdded: () => void
  defaultMonth?: number
  defaultYear?: number
}

export default function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  defaultMonth,
  defaultYear
}: AddEventModalProps) {
  console.log('AddEventModal rendering, isOpen:', isOpen)
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_month: defaultMonth || new Date().getMonth() + 1,
    start_year: defaultYear || new Date().getFullYear(),
    end_month: defaultMonth || new Date().getMonth() + 1,
    end_year: defaultYear || new Date().getFullYear(),
    is_multi_month: false,
    selected_angles: {} as Record<string, boolean>,
    angle_notes: {} as Record<string, string>,
    prep_months_needed: 0,
    prep_start_date: '',
    prep_type: 'months', // 'months' or 'date'
    created_by: 'clinic_admin'
  })

  useEffect(() => {
    if (isOpen) {
      fetchOutreachAngles()
      const currentMonth = defaultMonth || new Date().getMonth() + 1
      const currentYear = defaultYear || new Date().getFullYear()
      setFormData(prev => ({
        ...prev,
        start_month: currentMonth,
        start_year: currentYear,
        end_month: currentMonth,
        end_year: currentYear
      }))
    }
  }, [isOpen, defaultMonth, defaultYear])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    let timer: NodeJS.Timeout | undefined

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      // Focus the title input after modal opens
      timer = setTimeout(() => {
        const titleInput = document.getElementById('title')
        if (titleInput) {
          titleInput.focus()
        }
      }, 100)
    }

    // Single return statement that handles both cases
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  const fetchOutreachAngles = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_angles')
        .select('*')
        .order('name')

      if (error) throw error
      setOutreachAngles(data || [])
    } catch (error) {
      console.error('Error fetching outreach angles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate at least one outreach angle is selected
      const selectedAngles = Object.entries(formData.selected_angles)
        .filter(([_, isSelected]) => isSelected)
        .map(([angle]) => angle)

      if (selectedAngles.length === 0) {
        alert('Please select at least one outreach angle.')
        setLoading(false)
        return
      }

      // Build outreach_angles array
      const outreach_angles: OutreachAngleSelection[] = selectedAngles.map(angle => ({
        angle,
        notes: formData.angle_notes[angle] || ''
      }))

      const eventData: NewEventIdea = {
        title: formData.title,
        description: formData.description || undefined,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : undefined,
        end_year: formData.is_multi_month ? formData.end_year : undefined,
        outreach_angles,
        prep_months_needed: formData.prep_type === 'months' ? formData.prep_months_needed : 0,
        prep_start_date: formData.prep_type === 'date' ? formData.prep_start_date || undefined : undefined,
        is_recurring: false,
        created_by: formData.created_by,
        // Legacy fields for backward compatibility
        month: formData.start_month,
        year: formData.start_year,
        category_id: 1 // Default to first angle for legacy compatibility
      }

      const { error } = await supabase
        .from('events_ideas')
        .insert([eventData])

      if (error) throw error

      // Reset form
      const currentMonth = defaultMonth || new Date().getMonth() + 1
      const currentYear = defaultYear || new Date().getFullYear()
      setFormData({
        title: '',
        description: '',
        start_month: currentMonth,
        start_year: currentYear,
        end_month: currentMonth,
        end_year: currentYear,
        is_multi_month: false,
        selected_angles: {},
        angle_notes: {},
        prep_months_needed: 0,
        prep_start_date: '',
        prep_type: 'months',
        created_by: 'clinic_admin'
      })

      onEventAdded()
      onClose()
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Error adding event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'start_month' || name === 'start_year' || name === 'end_month' || name === 'end_year' || name === 'prep_months_needed'
        ? parseInt(value) || 0
        : value
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

  const handlePrepTypeChange = (type: 'months' | 'date') => {
    setFormData(prev => ({
      ...prev,
      prep_type: type,
      prep_months_needed: type === 'months' ? prev.prep_months_needed : 0,
      prep_start_date: type === 'date' ? prev.prep_start_date : ''
    }))
  }

  if (!isOpen) return null

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)

  console.log('AddEventModal: About to render modal JSX, isOpen:', isOpen)

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark Backdrop/Scrim */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex justify-end">
        {/* Modal Content - Side drawer from right */}
        <div className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col animate-in slide-in-from-right duration-300 lg:max-w-lg xl:max-w-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <form id="add-event-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="start_month"
                        value={formData.start_month}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {monthNames.map((month, index) => (
                          <option key={month} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="start_year"
                        value={formData.start_year}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multi-month toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_multi_month"
                      checked={formData.is_multi_month}
                      onChange={handleMultiMonthToggle}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_multi_month" className="text-sm text-gray-700">
                      Multi-month event
                    </label>
                  </div>

                  {/* End Date (conditional) */}
                  {formData.is_multi_month && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        End Date
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="end_month"
                          value={formData.end_month}
                          onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          name="end_year"
                          value={formData.end_year}
                          onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
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

                <div className="space-y-3">
                  {outreachAngles.map(angle => (
                    <div key={angle.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`angle_${angle.name}`}
                          checked={formData.selected_angles[angle.name] || false}
                          onChange={() => handleAngleToggle(angle.name)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
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
                        <div className="ml-5">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Notes for {angle.name}
                          </label>
                          <textarea
                            value={formData.angle_notes[angle.name] || ''}
                            onChange={(e) => handleAngleNotesChange(angle.name, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Add specific notes for ${angle.name} angle...`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preparation Planning
                </label>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prep_type"
                      value="months"
                      checked={formData.prep_type === 'months'}
                      onChange={(e) => handlePrepTypeChange(e.target.value as 'months')}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Months ahead</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prep_type"
                      value="date"
                      checked={formData.prep_type === 'date'}
                      onChange={(e) => handlePrepTypeChange(e.target.value as 'date')}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Specific date</span>
                  </label>
                </div>

                {formData.prep_type === 'months' ? (
                  <div>
                    <input
                      type="number"
                      id="prep_months_needed"
                      name="prep_months_needed"
                      value={formData.prep_months_needed}
                      onChange={handleInputChange}
                      min="0"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How many months before the event should preparation begin? (0 = no advance preparation)
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="date"
                      id="prep_start_date"
                      name="prep_start_date"
                      value={formData.prep_start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the exact date when preparation should begin
                    </p>
                  </div>
                )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="add-event-form"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      'Add Event'
                    )}
                  </button>
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}