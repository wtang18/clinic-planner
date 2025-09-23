'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface MVPAnnualPlannerProps {
  currentYear: number
  onYearChange: (year: number) => void
  onMonthClick?: (month: number, year: number) => void
}

interface Event {
  id: number
  title: string
  month: number
  year: number
  is_recurring?: boolean
}

export default function MVPAnnualPlanner({ currentYear, onYearChange, onMonthClick }: MVPAnnualPlannerProps) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    loadEvents()
  }, [currentYear])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events_ideas')
        .select('id, title, month, year, is_recurring')
        .or(`year.eq.${currentYear},is_recurring.eq.true`)
        .order('month')

      if (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } else {
        setEvents(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getEventsForMonth = (month: number) => {
    return events.filter(event => event.month === month)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentYear} Annual Planner
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => onYearChange(currentYear - 1)}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            type="button"
          >
            ← {currentYear - 1}
          </button>
          <button
            onClick={() => onYearChange(currentYear + 1)}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            type="button"
          >
            {currentYear + 1} →
          </button>
        </div>
      </div>

      {/* Month Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthNames.map((monthName, index) => {
            const monthNumber = index + 1
            const monthEvents = getEventsForMonth(monthNumber)
            const isCurrentMonth = new Date().getMonth() + 1 === monthNumber &&
                                 new Date().getFullYear() === currentYear

            return (
              <div
                key={monthName}
                className={`relative rounded-xl p-6 min-h-[240px] cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  isCurrentMonth
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 shadow-lg'
                    : 'bg-white border border-gray-200 shadow-md hover:border-gray-300'
                }`}
                onClick={() => onMonthClick ? onMonthClick(monthNumber, currentYear) : router.push(`/?view=timeline&month=${monthNumber}&year=${currentYear}`)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isCurrentMonth ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <h3 className={`text-xl font-bold ${
                      isCurrentMonth ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {monthName}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/add-event?return=annual&month=${monthNumber}`)
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    type="button"
                  >
                    + Add
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-3">
                  {monthEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <div className="text-4xl mb-3">📅</div>
                      <span className="text-sm font-medium">No events planned</span>
                    </div>
                  ) : (
                    monthEvents.map(event => (
                      <div
                        key={event.id}
                        className="group relative p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/edit-event/${event.id}?return=annual&month=${monthNumber}&year=${currentYear}`)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {event.title}
                            </div>
                            {event.is_recurring && (
                              <div className="inline-flex items-center mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                <span className="mr-1">🔄</span>
                                Annual Event
                              </div>
                            )}
                          </div>
                          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                            →
                          </div>
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}