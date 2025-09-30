'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import MaterialCard from '@/components/MaterialCard'

function EventDetailsContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const eventId = params.id as string
  const returnView = searchParams.get('return') || 'annual'
  const returnMonth = searchParams.get('month')
  const returnYear = searchParams.get('year')
  const returnQuarter = searchParams.get('quarter')

  const [event, setEvent] = useState<EventIdea | null>(null)
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([])
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEventDetails()
    loadOutreachAngles()
    loadEventMaterials()
  }, [eventId])

  const loadEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOutreachAngles = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_angles')
        .select('*')
        .order('name')

      if (error) throw error
      setOutreachAngles(data || [])
    } catch (error) {
      console.error('Error loading outreach angles:', error)
    }
  }

  const loadEventMaterials = async () => {
    try {
      const materials = await MarketingMaterialsService.getEventMaterials(parseInt(eventId))
      setMaterials(materials)
    } catch (error) {
      console.error('Error loading materials:', error)
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return
    }

    try {
      const success = await MarketingMaterialsService.deleteMaterial(materialId)
      if (success) {
        setMaterials(prev => prev.filter(m => m.id !== materialId))
      } else {
        alert('Error deleting material. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error deleting material. Please try again.')
    }
  }

  const handleAddMaterial = () => {
    // Navigate to Add Material page with event pre-selected
    const params = new URLSearchParams()
    if (returnView === 'timeline' && returnMonth && returnYear) {
      params.set('return', `event/${eventId}?return=timeline&month=${returnMonth}&year=${returnYear}`)
    } else if (returnView === 'quarter' && returnQuarter && returnYear) {
      params.set('return', `event/${eventId}?return=quarter&quarter=${returnQuarter}&year=${returnYear}`)
    } else if (returnView === 'materials') {
      params.set('return', `event/${eventId}?return=materials`)
    } else {
      params.set('return', `event/${eventId}?return=${returnView}`)
    }
    params.set('eventId', eventId)
    router.push(`/add-material?${params.toString()}`)
  }

  const handleEdit = () => {
    const params = new URLSearchParams({
      return: returnView
    })
    if (returnMonth) params.set('month', returnMonth)
    if (returnYear) params.set('year', returnYear)
    if (returnQuarter) params.set('quarter', returnQuarter)
    router.push(`/edit-event/${eventId}?${params.toString()}`)
  }

  const handleBack = () => {
    if (returnView === 'materials') {
      router.push('/materials')
    } else if (returnView === 'timeline' && returnMonth && returnYear) {
      router.push(`/?view=timeline&month=${returnMonth}&year=${returnYear}`)
    } else if (returnView === 'quarter' && returnQuarter && returnYear) {
      router.push(`/?view=quarter&quarter=${returnQuarter}&year=${returnYear}`)
    } else {
      router.push(`/?view=${returnView}`)
    }
  }

  const formatDateRange = () => {
    if (!event) return ''
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Get the start month/year (using fallback for legacy data)
    const startMonth = event.start_month || event.month
    const startYear = event.start_year || event.year

    // For recurring events, use the current viewing year if available
    const displayYear = event.is_recurring && returnYear ? parseInt(returnYear) : startYear

    // Handle multi-month events
    if (event.end_month && event.end_year) {
      const startMonthName = months[startMonth - 1]
      const endMonthName = months[event.end_month - 1]

      // For recurring events, calculate the end year properly
      let displayEndYear
      if (event.is_recurring && returnYear) {
        const viewingYear = parseInt(returnYear)
        // If it's a year-wrapping event (e.g., Nov-Feb), end year should be next year
        displayEndYear = event.end_month < startMonth ? viewingYear + 1 : viewingYear
      } else {
        displayEndYear = event.end_year
      }

      // Same month (shouldn't happen but handle gracefully)
      if (startMonth === event.end_month && displayYear === displayEndYear) {
        return `${startMonthName} ${displayYear}`
      }

      // Different months, same year
      if (displayYear === displayEndYear) {
        return `${startMonthName} - ${endMonthName} ${displayYear}`
      }

      // Different years (e.g., Nov 2024 - Feb 2025)
      return `${startMonthName} ${displayYear} - ${endMonthName} ${displayEndYear}`
    }

    // Single month event
    const monthName = months[startMonth - 1]
    return `${monthName} ${displayYear}`
  }

  const formatPrepInfo = () => {
    if (!event) return null
    if (event.prep_start_date) {
      const date = new Date(event.prep_start_date)
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return `Start preparation: ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }
    if (event.prep_months_needed && event.prep_months_needed > 0) {
      return `Requires ${event.prep_months_needed} month${event.prep_months_needed > 1 ? 's' : ''} of preparation`
    }
    return null
  }

  const getAngleDetails = (angleName: string) => {
    const angle = outreachAngles.find(a => a.name === angleName)

    // Parse the angle details if it's a JSON string
    if (typeof angleName === 'string' && angleName.startsWith('{')) {
      try {
        const parsed = JSON.parse(angleName)
        return {
          angle: outreachAngles.find(a => a.name === parsed.angle),
          notes: parsed.notes
        }
      } catch {
        // If parsing fails, treat as regular string
      }
    }

    return { angle, notes: null }
  }

  // Build return URL for nested navigation
  const buildReturnUrl = () => {
    let url = `event/${eventId}?return=${returnView}`
    if (returnMonth) url += `&month=${returnMonth}`
    if (returnYear) url += `&year=${returnYear}`
    if (returnQuarter) url += `&quarter=${returnQuarter}`
    return url
  }

  if (loading || !event) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-100 rounded"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{formatDateRange()}</span>
                  {event.is_recurring && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🔄 Yearly Recurring
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Back
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </section>
            )}

            {/* Outreach Angles */}
            {event.outreach_angles && event.outreach_angles.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Outreach Angles</h2>
                <div className="space-y-3">
                  {event.outreach_angles.map((selection, index) => {
                    const { angle, notes } = getAngleDetails(selection.angle)
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          {angle && (
                            <span
                              className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                              style={{ backgroundColor: angle.color }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {selection.angle}
                              {angle?.description && (
                                <span className="text-gray-500 font-normal ml-2">
                                  - {angle.description}
                                </span>
                              )}
                            </div>
                            {notes && (
                              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Preparation Timeline */}
            {formatPrepInfo() && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">⏰ Preparation Schedule</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <span className="text-amber-900">{formatPrepInfo()}</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Marketing Materials Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">📄 Marketing Materials</h2>
              <button
                onClick={handleAddMaterial}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="mr-1">+</span>
                Add Material
              </button>
            </div>
          </div>

          {/* Materials Grid */}
          {materials.length > 0 ? (
            <div className="p-6">
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
                }}
              >
                {materials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    showEvent={false}  // Don't show event name since we're already in event context
                    onDelete={() => handleDeleteMaterial(material.id)}
                    returnPath={buildReturnUrl()}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">📁</div>
              <p className="text-gray-600">No materials added yet</p>
              <button
                onClick={handleAddMaterial}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Add your first material
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
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

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EventDetailsContent />
    </Suspense>
  )
}
