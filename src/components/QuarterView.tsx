'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { eventDataProcessor } from '@/lib/eventHelpers'
import EventCard from '@/components/EventCard'

interface QuarterViewProps {
  currentYear: number
  selectedQuarter?: number
  selectedYear?: number
  onAddEvent?: (month: number) => void
}

interface QuarterMonth {
  month: number
  year: number
  name: string
  events: EventIdea[]
  prepEvents: EventIdea[]
}

interface EventWithMaterials extends EventIdea {
  materials?: MarketingMaterial[]
}

interface Quarter {
  number: number
  year: number
  title: string
  months: QuarterMonth[]
}

interface QuarterMonthWithMaterials extends QuarterMonth {
  events: EventWithMaterials[]
  prepEvents: EventWithMaterials[]
}

export default function QuarterView({ currentYear, selectedQuarter, selectedYear, onAddEvent }: QuarterViewProps) {
  const router = useRouter()
  const [quarter, setQuarter] = useState<Quarter | null>(null)
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [eventMaterials, setEventMaterials] = useState<{[eventId: number]: MarketingMaterial[]}>({})
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const currentActualQuarter = Math.ceil((today.getMonth() + 1) / 3)
  const currentActualYear = today.getFullYear()

  const viewQuarter = selectedQuarter || currentActualQuarter
  const viewYear = selectedYear || currentYear

  const isViewingCurrentQuarter = viewQuarter === currentActualQuarter && viewYear === currentActualYear

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']

  const getMonthsForQuarter = (quarterNum: number, year: number): QuarterMonth[] => {
    const startMonth = (quarterNum - 1) * 3 + 1
    return [
      { month: startMonth, year, name: monthNames[startMonth - 1], events: [], prepEvents: [] },
      { month: startMonth + 1, year, name: monthNames[startMonth], events: [], prepEvents: [] },
      { month: startMonth + 2, year, name: monthNames[startMonth + 1], events: [], prepEvents: [] }
    ]
  }

  const navigateToQuarter = (quarterNum: number, year: number) => {
    router.push(`/?view=quarter&quarter=${quarterNum}&year=${year}`)
  }

  const navigatePreviousQuarter = () => {
    if (viewQuarter === 1) {
      navigateToQuarter(4, viewYear - 1)
    } else {
      navigateToQuarter(viewQuarter - 1, viewYear)
    }
  }

  const navigateNextQuarter = () => {
    if (viewQuarter === 4) {
      navigateToQuarter(1, viewYear + 1)
    } else {
      navigateToQuarter(viewQuarter + 1, viewYear)
    }
  }

  const navigateToCurrentQuarter = () => {
    navigateToQuarter(currentActualQuarter, currentActualYear)
  }

  useEffect(() => {
    fetchQuarterData()
  }, [viewQuarter, viewYear])

  const fetchQuarterData = async () => {
    setLoading(true)
    try {
      const [eventsResponse, anglesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select('*')
          .or(`start_year.lte.${viewYear + 1},year.lte.${viewYear + 1},is_recurring.eq.true`)
          .order('start_year', { ascending: true })
          .order('start_month', { ascending: true }),
        supabase.from('outreach_angles').select('*')
      ])

      if (eventsResponse.error) throw eventsResponse.error
      if (anglesResponse.error) throw anglesResponse.error

      setOutreachAngles(anglesResponse.data || [])

      const months = getMonthsForQuarter(viewQuarter, viewYear)
      const allEvents = eventsResponse.data || []

      // Process events for each month in the quarter
      months.forEach(monthData => {
        // Direct events for this month
        monthData.events = allEvents.filter(event => {
          const eventMonth = event.start_month || event.month
          const eventYear = event.start_year || event.year

          // Check for recurring events FIRST
          if (event.is_recurring) {
            // Only show recurring events in years >= their start year
            if (monthData.year < eventYear) {
              return false
            }

            // For multi-month recurring events
            if (event.end_month && event.end_year) {
              const startMonth = eventMonth
              const endMonth = event.end_month

              // Handle year-wrapping events (e.g., Nov-Feb)
              if (endMonth < startMonth) {
                // Event wraps across year boundary
                return monthData.month >= startMonth || monthData.month <= endMonth
              } else {
                // Event within same year
                return monthData.month >= startMonth && monthData.month <= endMonth
              }
            } else {
              // Single month recurring event
              return eventMonth === monthData.month
            }
          }

          // For non-recurring events, check if event falls within this month
          if (eventYear === monthData.year && eventMonth === monthData.month) {
            return true
          }

          // Check if it's a non-recurring multi-month event spanning this month
          if (event.end_month && event.end_year) {
            const startDate = new Date(eventYear, eventMonth - 1)
            const endDate = new Date(event.end_year, event.end_month - 1)
            const checkDate = new Date(monthData.year, monthData.month - 1)
            return checkDate >= startDate && checkDate <= endDate
          }

          return false
        })

        // Prep events - events from future quarters that need prep during this month
        monthData.prepEvents = allEvents.filter(event => {
          if (!event.prep_months_needed || event.prep_months_needed === 0) return false

          const eventMonth = event.start_month || event.month
          const eventYear = event.start_year || event.year

          // Skip if this is the actual event month (already included above)
          if (eventYear === monthData.year && eventMonth === monthData.month) {
            return false
          }

          const eventDate = new Date(eventYear, eventMonth - 1, 1)

          // Calculate when prep should start
          const prepStartDate = new Date(eventDate)
          prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed)

          // Check if prep should happen during this month
          const monthStart = new Date(monthData.year, monthData.month - 1, 1)
          const monthEnd = new Date(monthData.year, monthData.month, 0) // Last day of month

          return prepStartDate >= monthStart && prepStartDate <= monthEnd
        })
      })

      const quarterData: Quarter = {
        number: viewQuarter,
        year: viewYear,
        title: `Q${viewQuarter} ${viewYear}`,
        months
      }

      setQuarter(quarterData)

      // Fetch materials for all events
      const allEventIds = allEvents.map(event => event.id)
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
      console.error('Error fetching quarter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = (month: number) => {
    if (onAddEvent) {
      onAddEvent(month)
    } else {
      router.push(`/add-event?month=${month}&year=${viewYear}&return=quarter&quarter=${viewQuarter}`)
    }
  }

  const handleViewEvent = (eventId: number, month: number) => {
    router.push(`/event/${eventId}?return=quarter&quarter=${viewQuarter}&year=${viewYear}&month=${month}`)
  }

  if (loading || !quarter) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{quarter.title}</h2>

          <div className="flex space-x-3">
            <button
              onClick={navigatePreviousQuarter}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              type="button"
            >
              ← Previous
            </button>
            <button
              onClick={navigateToCurrentQuarter}
              disabled={isViewingCurrentQuarter}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isViewingCurrentQuarter
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              type="button"
            >
              This Quarter
            </button>
            <button
              onClick={navigateNextQuarter}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Quarter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem' }}>
          {quarter.months.map((monthData, index) => (
            <div key={`${monthData.month}-${monthData.year}`} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 min-h-[400px] hover:shadow-lg transition-shadow">
              {/* Month Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-transparent -m-6 p-6 rounded-t-lg">
                <h3 className="text-xl font-bold text-blue-900">
                  {monthData.name} {monthData.year}
                </h3>
                <button
                  onClick={() => handleAddEvent(monthData.month)}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                >
                  + Add Event
                </button>
              </div>

              {/* Events */}
              <div className="space-y-3 min-h-[200px] mt-6">
                {monthData.events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm font-medium">No events scheduled</p>
                    <p className="text-xs mt-1">Click "Add Event" to schedule</p>
                  </div>
                ) : (
                  monthData.events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      outreachAngles={outreachAngles}
                      materials={eventMaterials[event.id] || []}
                      onClick={(eventId) => handleViewEvent(eventId, monthData.month)}
                      variant="quarter"
                      viewingYear={monthData.year}
                    />
                  ))
                )}

                {/* Prep Events */}
                {monthData.prepEvents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Preparation Needed</h5>
                    <div className="space-y-2">
                      {monthData.prepEvents.map((event) => {
                        const processedEvent = eventDataProcessor.formatEventForDisplay(event, outreachAngles, monthData.year)
                        return (
                          <div
                            key={`prep-${event.id}`}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
                            onClick={() => handleViewEvent(event.id, monthData.month)}
                          >
                            <p className="text-sm font-medium text-yellow-800">
                              Prep for: {event.title}
                            </p>
                            <p className="text-xs text-yellow-700 mb-2">
                              Event in {monthNames[(event.start_month || event.month) - 1]} {event.start_year || event.year} • {event.prep_months_needed} months prep needed
                            </p>

                            {/* Show outreach angles for prep events */}
                            {processedEvent.processedOutreachAngles.length > 0 && (
                              <div className="flex items-center space-x-2">
                                {processedEvent.processedOutreachAngles.slice(0, 3).map((angle, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-200 text-yellow-800"
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{
                                        backgroundColor: outreachAngles.find(oa => oa.name === angle.angle)?.color || '#gray'
                                      }}
                                    ></span>
                                    {angle.angle}
                                  </span>
                                ))}
                                {processedEvent.processedOutreachAngles.length > 3 && (
                                  <span className="text-xs text-yellow-600">
                                    +{processedEvent.processedOutreachAngles.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}