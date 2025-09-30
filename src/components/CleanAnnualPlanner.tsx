'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, EventIdea, OutreachAngle } from '@/lib/supabase'
import EventCard from '@/components/EventCard'

interface CleanAnnualPlannerProps {
  currentYear: number
  onYearChange: (year: number) => void
  onMonthClick?: (month: number, year: number) => void
}

export default function CleanAnnualPlanner({ currentYear, onYearChange, onMonthClick }: CleanAnnualPlannerProps) {
  const router = useRouter()
  const [events, setEvents] = useState<EventIdea[]>([])
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
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
      const [eventsResponse, anglesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select('*')
          .or(`start_year.eq.${currentYear},year.eq.${currentYear},is_recurring.eq.true`)
          .order('start_year', { ascending: true })
          .order('start_month', { ascending: true }),
        supabase.from('outreach_angles').select('*')
      ])

      if (eventsResponse.error) throw eventsResponse.error
      if (anglesResponse.error) throw anglesResponse.error

      setEvents(eventsResponse.data || [])
      setOutreachAngles(anglesResponse.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
      setOutreachAngles([])
    } finally {
      setLoading(false)
    }
  }

  const getEventsForMonth = (month: number) => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month
      const eventStartYear = event.start_year || event.year

      // Handle recurring events
      if (event.is_recurring) {
        // Only show recurring events in years >= their start year
        if (currentYear < eventStartYear) {
          return false
        }

        // For recurring events, check if this month falls within the event span
        if (event.end_month && event.end_year) {
          // Multi-month recurring event
          let startMonth = eventStartMonth
          let endMonth = event.end_month

          // Handle year wrapping (e.g. Nov-Feb)
          if (endMonth < startMonth) {
            // Event wraps across year boundary
            return month >= startMonth || month <= endMonth
          } else {
            // Event within same year
            return month >= startMonth && month <= endMonth
          }
        } else {
          // Single month recurring event
          return eventStartMonth === month
        }
      }

      // Handle non-recurring events
      // Multi-month event spanning this month
      if (event.end_month && event.end_year) {
        const startDate = new Date(eventStartYear, eventStartMonth - 1)
        const endDate = new Date(event.end_year, event.end_month - 1)
        const checkDate = new Date(currentYear, month - 1)
        return checkDate >= startDate && checkDate <= endDate
      }

      // Direct match for single month events
      if (eventStartYear === currentYear && eventStartMonth === month) {
        return true
      }

      return false
    })
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
          {currentYear}
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

      {/* Month Cards - Flexbox Layout */}
      <div className="p-6">
        <div
          className="flex flex-wrap"
          style={{
            gap: '1rem'
          }}
        >
          {monthNames.map((monthName, index) => {
            const monthNumber = index + 1
            const monthEvents = getEventsForMonth(monthNumber)
            const isCurrentMonth = new Date().getMonth() + 1 === monthNumber &&
                                 new Date().getFullYear() === currentYear

            return (
              <div
                key={monthName}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg p-4 ${
                  isCurrentMonth
                    ? 'bg-blue-50 border-2 border-blue-300 shadow-md'
                    : 'bg-white border border-gray-200 shadow-sm hover:border-gray-300'
                }`}
                style={{
                  // Responsive flex-basis for breakpoints
                  flexBasis: 'calc(100% - 0px)',        // Mobile: 1 column
                  flexGrow: 1,                           // Fill available space
                  minWidth: '280px',
                  minHeight: '200px'
                }}
                onClick={() => onMonthClick ? onMonthClick(monthNumber, currentYear) : router.push(`/?view=timeline&month=${monthNumber}&year=${currentYear}`)}
              >
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isCurrentMonth ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <h3 className={`text-lg font-bold ${
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
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    type="button"
                  >
                    + Add
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-2">
                  {monthEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <div className="text-3xl mb-2">📅</div>
                      <span className="text-sm font-medium">No events planned</span>
                    </div>
                  ) : (
                    monthEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        outreachAngles={outreachAngles}
                        onClick={(eventId) => {
                          router.push(`/event/${eventId}?return=annual&month=${monthNumber}&year=${currentYear}`)
                        }}
                        variant="annual"
                        viewingYear={currentYear}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Responsive CSS in style tag */}
      <style jsx>{`
        @media (min-width: 640px) {
          .flex-wrap > div {
            flex-basis: calc(50% - 0.5rem) !important;
          }
        }
        @media (min-width: 900px) {
          .flex-wrap > div {
            flex-basis: calc(33.333% - 0.67rem) !important;
          }
        }
        @media (min-width: 1400px) {
          .flex-wrap > div {
            flex-basis: calc(25% - 0.75rem) !important;
          }
        }
      `}</style>
    </div>
  )
}