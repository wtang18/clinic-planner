'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { supabase, OutreachAngle, NewEventIdea, OutreachAngleSelection } from '@/lib/supabase'

interface HeadlessAddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventAdded: () => void
  defaultMonth?: number
  defaultYear?: number
}


export default function HeadlessAddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  defaultMonth,
  defaultYear
}: HeadlessAddEventModalProps) {
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
    created_by: 'clinic_admin'
  })

  useEffect(() => {
    if (isOpen) {
      loadOutreachAngles()
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

      const eventData: NewEventIdea = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : undefined,
        end_year: formData.is_multi_month ? formData.end_year : undefined,
        outreach_angles,
        is_recurring: false,
        created_by: formData.created_by,
        // Legacy fields for backward compatibility
        month: formData.start_month,
        year: formData.start_year,
        category_id: 1 // Default for legacy compatibility
      }

      const { error } = await supabase
        .from('events_ideas')
        .insert([eventData])

      if (error) {
        console.error('Error adding event:', error)
        alert('Error adding event. Please try again.')
      } else {
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
          created_by: 'clinic_admin'
        })
        onEventAdded()
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error adding event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'start_month' || name === 'start_year' || name === 'end_month' || name === 'end_year'
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      {/* Modal container */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 bg-white p-6 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Event
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Date Range Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Event Date Range *
              </label>

              <div className="space-y-3">
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
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
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
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <p className="text-xs text-gray-500 mb-3">
                Select one or more outreach angles and add notes for each.
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                      />
                      <label
                        htmlFor={`angle_${angle.name}`}
                        className="flex items-center text-sm text-gray-700 cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: angle.color }}
                        ></span>
                        <span className="font-medium">{angle.name}</span>
                        <span className="text-gray-500 ml-1">- {angle.description}</span>
                      </label>
                    </div>

                    {formData.selected_angles[angle.name] && (
                      <div className="ml-6">
                        <textarea
                          value={formData.angle_notes[angle.name] || ''}
                          onChange={(e) => handleAngleNotesChange(angle.name, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Notes for ${angle.name}...`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Event'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}