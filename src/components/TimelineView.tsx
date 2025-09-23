'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, EventIdea, Category } from '@/lib/supabase'

interface TimelineViewProps {
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

export default function TimelineView({ currentYear, selectedMonth, selectedYear }: TimelineViewProps) {
  const router = useRouter()
  const [timelinePeriods, setTimelinePeriods] = useState<TimelinePeriod[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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
            category:categories(*)
          `)
          .gte('year', currentYear - 1)
          .lte('year', currentYear + 1)
          .order('year', { ascending: true })
          .order('month', { ascending: true }),
        supabase.from('categories').select('*')
      ])

      if (eventsResponse.error) throw eventsResponse.error
      if (categoriesResponse.error) throw categoriesResponse.error

      const events = eventsResponse.data || []
      setCategories(categoriesResponse.data || [])

      const periods = calculateTimelinePeriods(events, viewMonth, viewYear)
      setTimelinePeriods(periods)
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
      // Include events happening this month
      if (event.month === currentMonth && event.year === todayYear) {
        return true
      }

      // Include recurring events happening this month (any year)
      if (event.is_recurring && event.month === currentMonth) {
        return true
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

  const getPeriodStyles = (type: 'current' | 'prep3' | 'prep6') => {
    switch (type) {
      case 'current':
        return {
          container: 'bg-blue-50 border-blue-200',
          header: 'text-blue-900',
          icon: '🎯',
          iconBg: 'bg-blue-500'
        }
      case 'prep3':
        return {
          container: 'bg-orange-50 border-orange-200',
          header: 'text-orange-900',
          icon: '⚡',
          iconBg: 'bg-orange-500'
        }
      case 'prep6':
        return {
          container: 'bg-green-50 border-green-200',
          header: 'text-green-900',
          icon: '🔮',
          iconBg: 'bg-green-500'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          header: 'text-gray-900',
          icon: '📅',
          iconBg: 'bg-gray-500'
        }
    }
  }

  const getEventStatus = (event: EventIdea, periodType: 'current' | 'prep3' | 'prep6', currentMonth: number, currentYear: number) => {
    // Check if this is the actual event month
    const isEventMonth = event.month === currentMonth && event.year === currentYear
    const isRecurringEvent = event.is_recurring && event.month === currentMonth

    if (isEventMonth || isRecurringEvent) {
      return {
        label: isRecurringEvent ? 'Annual Event' : 'Happening Now',
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
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{monthNames[viewMonth - 1]} {viewYear}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Month Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={navigatePreviousMonth}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                type="button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={navigateNextMonth}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                type="button"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Go to Current Month Button */}
            {!isViewingCurrentMonth && (
              <button
                onClick={navigateToCurrentMonth}
                className="inline-flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl shadow-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200 font-medium"
                type="button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </button>
            )}

          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-8">
          {timelinePeriods.map((period, index) => {
            const styles = getPeriodStyles(period.type)
            return (
              <div key={index} className={`rounded-2xl border-2 p-8 ${styles.container} shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-2xl text-white text-2xl ${styles.iconBg} flex-shrink-0 shadow-lg`}>
                    {styles.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-2xl font-bold mb-3 ${styles.header}`}>
                      {period.title}
                    </div>
                    <div className="text-base text-gray-600 mb-6 font-medium">
                      {period.description}
                    </div>

                    {period.events.length === 0 ? (
                      <div className="text-sm text-gray-500 italic text-center py-4">
                        {period.type === 'current' && 'No events scheduled this month'}
                        {period.type === 'prep3' && 'No upcoming events need attention'}
                        {period.type === 'prep6' && 'No long-term planning items'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {period.events.map(event => (
                          <div
                            key={event.id}
                            className="group bg-white rounded-xl p-6 shadow-md border border-gray-200 cursor-pointer hover:shadow-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => router.push(`/edit-event/${event.id}?return=timeline&month=${viewMonth}&year=${viewYear}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                                  style={{ backgroundColor: event.category?.color || '#6B7280' }}
                                ></div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                {(() => {
                                  const status = getEventStatus(event, period.type, viewMonth, viewYear)
                                  const statusStyles = {
                                    event: 'bg-blue-100 text-blue-800',
                                    prep: 'bg-orange-100 text-orange-800',
                                    upcoming: 'bg-yellow-100 text-yellow-800',
                                    future: 'bg-green-100 text-green-800'
                                  }
                                  return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status.type]}`}>
                                      {status.label}
                                    </span>
                                  )
                                })()}
                                <div className="text-xs text-gray-500">
                                  {event.is_recurring ? (
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                      </svg>
                                      Annual
                                    </span>
                                  ) : (
                                    `${monthNames[event.month - 1]} ${event.year}`
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                              <div className="capitalize">
                                {event.category?.name.replace(/_/g, ' ')} • {event.created_by}
                              </div>
                              <div>
                                {event.prep_start_date
                                  ? `Prep starts: ${new Date(event.prep_start_date).toLocaleDateString()}`
                                  : event.prep_months_needed > 0
                                  ? `${event.prep_months_needed} month${event.prep_months_needed > 1 ? 's' : ''} prep needed`
                                  : 'No prep needed'
                                }
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}