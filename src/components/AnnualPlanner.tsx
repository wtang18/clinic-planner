'use client'

import { useState, useEffect } from 'react'
import { supabase, EventIdea, Category } from '@/lib/supabase'

interface AnnualPlannerProps {
  currentYear: number
  onYearChange: (year: number) => void
  onAddEvent: (month: number) => void
}

export default function AnnualPlanner({ currentYear, onYearChange, onAddEvent }: AnnualPlannerProps) {
  const [events, setEvents] = useState<EventIdea[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchData()
  }, [currentYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [eventsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('year', currentYear)
          .order('month', { ascending: true }),
        supabase.from('categories').select('*')
      ])

      if (eventsResponse.error) throw eventsResponse.error
      if (categoriesResponse.error) throw categoriesResponse.error

      setEvents(eventsResponse.data || [])
      setCategories(categoriesResponse.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventsForMonth = (month: number) => {
    return events.filter(event => event.month === month)
  }

  const getPrepEventsForMonth = (month: number) => {
    return events.filter(event => {
      if (event.prep_start_date) {
        const prepDate = new Date(event.prep_start_date)
        return prepDate.getMonth() + 1 === month && prepDate.getFullYear() === currentYear
      } else if (event.prep_months_needed > 0) {
        const eventDate = new Date(event.year, event.month - 1, 1)
        const prepStartDate = new Date(eventDate)
        prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed)
        return prepStartDate.getMonth() + 1 === month && prepStartDate.getFullYear() === currentYear
      }
      return false
    })
  }

  const getEventPriorityColor = (event: EventIdea, isPrep: boolean = false) => {
    if (isPrep) {
      return event.category?.color ? `${event.category.color}40` : '#6B728040'
    }
    return event.category?.color || '#6B7280'
  }

  const previousYear = () => {
    onYearChange(currentYear - 1)
  }

  const nextYear = () => {
    onYearChange(currentYear + 1)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {currentYear} Annual Planner
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={previousYear}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← {currentYear - 1}
          </button>
          <button
            onClick={nextYear}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {currentYear + 1} →
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthNames.map((month, index) => {
            const monthNumber = index + 1
            const monthEvents = getEventsForMonth(monthNumber)
            const prepEvents = getPrepEventsForMonth(monthNumber)
            const currentDate = new Date()
            const isCurrentMonth = currentDate.getMonth() + 1 === monthNumber &&
                                 currentDate.getFullYear() === currentYear

            return (
              <div
                key={month}
                className={`bg-gray-50 rounded-lg p-4 min-h-[280px] border-2 transition-all hover:shadow-md ${
                  isCurrentMonth ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    isCurrentMonth ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {month}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onAddEvent(monthNumber)
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                    title={`Add event for ${month}`}
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {prepEvents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Prep Start
                      </h4>
                      <div className="space-y-2">
                        {prepEvents.map(event => (
                          <div
                            key={`prep-${event.id}`}
                            className="p-3 rounded-md border-l-4 bg-white"
                            style={{
                              borderLeftColor: event.category?.color || '#6B7280',
                              backgroundColor: getEventPriorityColor(event, true)
                            }}
                          >
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              🚀 {event.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              For {monthNames[event.month - 1]} event
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {monthEvents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Events
                      </h4>
                      <div className="space-y-2">
                        {monthEvents.map(event => (
                          <div
                            key={event.id}
                            className="p-3 rounded-md bg-white shadow-sm border"
                            style={{ borderColor: event.category?.color || '#E5E7EB' }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div
                                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                style={{ backgroundColor: event.category?.color || '#6B7280' }}
                              ></div>
                              {(event.prep_months_needed > 0 || event.prep_start_date) && (
                                <div className="text-xs text-blue-600 font-medium">
                                  📋 PREP
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="text-xs text-gray-600 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {event.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {monthEvents.length === 0 && prepEvents.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-sm">
                        No events planned
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onAddEvent(monthNumber)
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                        type="button"
                      >
                        + Add event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="p-6 border-t bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-700 capitalize">
                  {category.name.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

