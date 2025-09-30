'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import EventCard from '@/components/EventCard'

interface CleanTimelineViewProps {
  currentYear: number
  selectedMonth?: number
  selectedYear?: number
}

interface TimelinePeriod {
  title: string
  description: string
  month: number
  year: number
  events: EventIdea[]
  type: 'current' | 'prep3' | 'prep6'
}

export default function CleanTimelineView({ currentYear, selectedMonth, selectedYear }: CleanTimelineViewProps) {
  const router = useRouter()
  const [timelinePeriods, setTimelinePeriods] = useState<TimelinePeriod[]>([])
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [eventMaterials, setEventMaterials] = useState<{[eventId: number]: MarketingMaterial[]}>({})
  const [loading, setLoading] = useState(true)

  const viewMonth = selectedMonth || new Date().getMonth() + 1
  const viewYear = selectedYear || currentYear

  // Check if we're viewing the current month/year
  const today = new Date()
  const currentActualMonth = today.getMonth() + 1
  const currentActualYear = today.getFullYear()
  const isViewingCurrentMonth = viewMonth === currentActualMonth && viewYear === currentActualYear

  const navigateToMonth = (month: number, year: number) => {
    router.push(`/?view=timeline&month=${month}&year=${year}`)
  }

  const navigatePreviousMonth = () => {
    if (viewMonth === 1) {
      navigateToMonth(12, viewYear - 1)
    } else {
      navigateToMonth(viewMonth - 1, viewYear)
    }
  }

  const navigateNextMonth = () => {
    if (viewMonth === 12) {
      navigateToMonth(1, viewYear + 1)
    } else {
      navigateToMonth(viewMonth + 1, viewYear)
    }
  }

  const navigateToCurrentMonth = () => {
    navigateToMonth(currentActualMonth, currentActualYear)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchTimelineData()
  }, [currentYear, viewMonth, viewYear])

  const fetchTimelineData = async () => {
    setLoading(true)
    try {
      const [eventsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select(`
            *,
            category:outreach_angles(*)
          `)
          .or(`year.lte.${viewYear + 1},start_year.lte.${viewYear + 1},is_recurring.eq.true`)
          .order('year', { ascending: true })
          .order('month', { ascending: true }),
        supabase.from('outreach_angles').select('*')
      ])

      if (eventsResponse.error) throw eventsResponse.error
      if (categoriesResponse.error) throw categoriesResponse.error

      const events = eventsResponse.data || []
      setOutreachAngles(categoriesResponse.data || [])

      const periods = calculateTimelinePeriods(events, viewMonth, viewYear)
      setTimelinePeriods(periods)

      // Fetch materials for all events
      const allEventIds = events.map(event => event.id)
      if (allEventIds.length > 0) {
        try {
          const materialsData: {[eventId: number]: MarketingMaterial[]} = {}
          await Promise.all(allEventIds.map(async (eventId) => {
            const materials = await MarketingMaterialsService.getEventMaterials(eventId)
            if (materials.length > 0) {
              materialsData[eventId] = materials
            }
          }))
          setEventMaterials(materialsData)
        } catch (error) {
          console.error('Error fetching event materials:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimelinePeriods = (events: EventIdea[], currentMonth: number, todayYear: number): TimelinePeriod[] => {
    const currentDate = new Date(todayYear, currentMonth - 1, 1)

    // Current month events (actual events happening this month)
    const currentMonthEvents = events.filter(event => {
      const eventStartMonth = event.start_month || event.month
      const eventStartYear = event.start_year || event.year

      // Include events happening this month
      if (eventStartMonth === currentMonth && eventStartYear === todayYear) {
        return true
      }

      // Check if it's a multi-month event spanning this month
      if (event.end_month && event.end_year) {
        const startDate = new Date(eventStartYear, eventStartMonth - 1)
        const endDate = new Date(event.end_year, event.end_month - 1)
        const checkDate = new Date(todayYear, currentMonth - 1)
        if (checkDate >= startDate && checkDate <= endDate) {
          return true
        }
      }

      // Include recurring events happening this month
      if (event.is_recurring) {
        // Only show recurring events in years >= their start year
        if (todayYear < eventStartYear) {
          return false
        }

        // For multi-month recurring events
        if (event.end_month && event.end_year) {
          const startMonth = eventStartMonth
          const endMonth = event.end_month

          // Handle year-wrapping events (e.g., Nov-Feb)
          if (endMonth < startMonth) {
            // Event wraps across year boundary
            return currentMonth >= startMonth || currentMonth <= endMonth
          } else {
            // Event within same year
            return currentMonth >= startMonth && currentMonth <= endMonth
          }
        } else {
          // Single month recurring event
          return eventStartMonth === currentMonth
        }
      }

      return false
    })

    // Events that need prep work this month (for future events)
    const prepEventsThisMonth = events.filter(event => {
      const eventDate = new Date(event.year, event.month - 1, 1)

      // Skip if this is the actual event month (already included above)
      if (event.month === currentMonth && event.year === todayYear) {
        return false
      }

      // Check if we should start prep this month based on prep_start_date
      if (event.prep_start_date) {
        const prepDate = new Date(event.prep_start_date)
        return prepDate.getMonth() + 1 === currentMonth && prepDate.getFullYear() === todayYear
      }

      // Check if we should start prep this month based on prep_months_needed
      if (event.prep_months_needed && event.prep_months_needed > 0) {
        const prepStartDate = new Date(eventDate)
        prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed)

        return prepStartDate.getMonth() + 1 === currentMonth && prepStartDate.getFullYear() === todayYear
      }

      return false
    })

    // Combine current month events
    const allCurrentEvents = [...currentMonthEvents, ...prepEventsThisMonth]

    // Look ahead for upcoming events needing prep (2-3 month horizon)
    const futureEvents = events.filter(event => {
      const eventDate = new Date(event.year, event.month - 1, 1)
      const threeMonthsOut = new Date(todayYear, currentMonth - 1 + 3, 1)

      // Events 1-3 months ahead that need prep
      return eventDate > currentDate && eventDate <= threeMonthsOut &&
             (event.prep_months_needed > 0 || event.prep_start_date)
    })

    // Look ahead for events 4+ months out
    const longTermEvents = events.filter(event => {
      const eventDate = new Date(event.year, event.month - 1, 1)
      const threeMonthsOut = new Date(todayYear, currentMonth - 1 + 3, 1)
      const twelveMonthsOut = new Date(todayYear, currentMonth - 1 + 12, 1)

      // Events 4+ months ahead that need prep
      return eventDate > threeMonthsOut && eventDate <= twelveMonthsOut &&
             (event.prep_months_needed > 0 || event.prep_start_date)
    })

    // Always return all three sections for consistent structure
    return [
      {
        title: 'This Month',
        description: `${monthNames[currentMonth - 1]} ${todayYear} Activities`,
        month: currentMonth,
        year: todayYear,
        events: allCurrentEvents,
        type: 'current' as const
      },
      {
        title: 'Upcoming Events',
        description: `Events in next 2-3 months`,
        month: currentMonth,
        year: todayYear,
        events: futureEvents,
        type: 'prep3' as const
      },
      {
        title: 'Long-term Planning',
        description: `Prep work needed for events 4+ months out`,
        month: currentMonth,
        year: todayYear,
        events: longTermEvents,
        type: 'prep6' as const
      }
    ]
  }

  const getEventStatus = (event: EventIdea, periodType: 'current' | 'prep3' | 'prep6', currentMonth: number, currentYear: number) => {
    // Check if this is the actual event month
    const isEventMonth = event.month === currentMonth && event.year === currentYear
    const isRecurringEvent = event.is_recurring && event.month === currentMonth

    if (isEventMonth || isRecurringEvent) {
      return {
        label: isRecurringEvent ? 'Yearly Event' : 'Happening Now',
        type: 'event' as const
      }
    }

    // This is a prep activity for a future event
    const eventDate = `${monthNames[event.month - 1]} ${event.year}`

    if (periodType === 'current') {
      return {
        label: `Prep for ${eventDate}`,
        type: 'prep' as const
      }
    }

    if (periodType === 'prep3') {
      return {
        label: `Upcoming - ${eventDate}`,
        type: 'upcoming' as const
      }
    }

    return {
      label: `Plan Ahead - ${eventDate}`,
      type: 'future' as const
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">Loading timeline...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[viewMonth - 1]} {viewYear}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={navigatePreviousMonth}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            type="button"
          >
            ← Previous
          </button>
          <button
            onClick={navigateToCurrentMonth}
            disabled={isViewingCurrentMonth}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isViewingCurrentMonth
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            type="button"
          >
            This Month
          </button>
          <button
            onClick={navigateNextMonth}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            type="button"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Timeline Periods - Flexbox Layout */}
      <div className="p-6">
        <div
          className="flex flex-wrap"
          style={{
            gap: '1rem'
          }}
        >
          {timelinePeriods.map((period, index) => (
            <div
              key={index}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg p-4 border border-gray-200 shadow-sm hover:border-gray-300 ${
                period.type === 'current' ? 'bg-blue-50 border-blue-300' :
                period.type === 'prep3' ? 'bg-orange-50 border-orange-300' :
                'bg-green-50 border-green-300'
              }`}
              style={{
                // Responsive flex-basis for timeline periods
                flexBasis: 'calc(100% - 0px)',        // Mobile: 1 column (stacked)
                flexGrow: 1,                           // Fill available space
                minWidth: '300px',
                minHeight: '400px'
              }}
            >
              {/* Period Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  period.type === 'current' ? 'bg-blue-500' :
                  period.type === 'prep3' ? 'bg-orange-500' :
                  'bg-green-500'
                }`}></div>
                <h3 className={`text-lg font-bold ${
                  period.type === 'current' ? 'text-blue-900' :
                  period.type === 'prep3' ? 'text-orange-900' :
                  'text-green-900'
                }`}>
                  {period.title}
                </h3>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {period.description}
              </div>

              {/* Events List */}
              <div className="space-y-2">
                {period.events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                    <div className="text-3xl mb-2">📅</div>
                    <span className="text-sm font-medium">
                      {period.type === 'current' && 'No events scheduled this month'}
                      {period.type === 'prep3' && 'No upcoming events need attention'}
                      {period.type === 'prep6' && 'No long-term planning items'}
                    </span>
                  </div>
                ) : (
                  period.events.map(event => {
                    const status = getEventStatus(event, period.type, viewMonth, viewYear)
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        outreachAngles={outreachAngles}
                        materials={eventMaterials[event.id] || []}
                        onClick={(eventId) => {
                          router.push(`/event/${eventId}?return=timeline&month=${viewMonth}&year=${viewYear}`)
                        }}
                        variant="timeline"
                        statusLabel={status.label}
                        statusType={status.type}
                        viewingYear={viewYear}
                      />
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (min-width: 768px) {
          .flex-wrap > div:first-child {
            flex-basis: calc(100% - 0px) !important;
          }
          .flex-wrap > div:not(:first-child) {
            flex-basis: calc(50% - 0.5rem) !important;
          }
        }
        @media (min-width: 1200px) {
          .flex-wrap > div {
            flex-basis: calc(33.333% - 0.67rem) !important;
          }
        }
      `}</style>
    </div>
  )
}