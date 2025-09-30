'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MarketingMaterialsService } from '@/lib/marketingMaterials'
import { MarketingMaterial, EventIdea, supabase } from '@/lib/supabase'
import MaterialsList from '@/components/MaterialsList'

export default function MaterialsPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])
  const [events, setEvents] = useState<EventIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAnyTime, setFilterAnyTime] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'event' | 'created' | 'updated'>('created')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load both materials and events in parallel
      const [materialsData, eventsData] = await Promise.all([
        MarketingMaterialsService.getAllMaterials(),
        supabase.from('events_ideas').select('id, title').order('title')
      ])

      setMaterials(materialsData)
      if (eventsData.error) throw eventsData.error
      setEvents(eventsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMaterials = async () => {
    try {
      const allMaterials = await MarketingMaterialsService.getAllMaterials()
      setMaterials(allMaterials)
    } catch (error) {
      console.error('Error loading materials:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMaterials()
      return
    }

    setLoading(true)
    try {
      const searchResults = await MarketingMaterialsService.searchMaterials(searchQuery)
      setMaterials(searchResults)
    } catch (error) {
      console.error('Error searching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventName = (eventId: number | null) => {
    if (eventId === null) return 'Any Time'
    const event = events.find(e => e.id === eventId)
    return event?.title || `Event #${eventId}`
  }

  const sortMaterials = (materials: MarketingMaterial[]): MarketingMaterial[] => {
    return [...materials].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.label.toLowerCase().localeCompare(b.label.toLowerCase())

        case 'event':
          const eventA = getEventName(a.event_id)
          const eventB = getEventName(b.event_id)
          return eventA.toLowerCase().localeCompare(eventB.toLowerCase())

        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // Newest first

        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() // Newest first

        default:
          return 0
      }
    })
  }

  const filteredMaterials = materials.filter(material => {
    if (filterAnyTime === null) return true
    return filterAnyTime ? material.event_id === null : material.event_id !== null
  })

  const sortedMaterials = sortMaterials(filteredMaterials)


  const handleDeleteMaterial = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this material? This will remove all associations with events.')) {
      const success = await MarketingMaterialsService.deleteMaterial(id)
      if (success) {
        loadMaterials()
      } else {
        alert('Error deleting material. Please try again.')
      }
    }
  }

  const handleEditMaterial = (material: MarketingMaterial) => {
    router.push(`/edit-material/${material.id}?return=materials`)
  }

  if (loading && materials.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Marketing Materials ({sortedMaterials.length})
              </h2>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Back to Planner
                </button>
                <button
                  onClick={() => router.push('/add-material?return=materials')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  type="button"
                >
                  <span className="mr-2">+</span>
                  Add Material
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'event' | 'created' | 'updated')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created">Sort by Created (Newest)</option>
                  <option value="updated">Sort by Updated (Newest)</option>
                  <option value="name">Sort by Material Name</option>
                  <option value="event">Sort by Event Name</option>
                </select>

                <select
                  value={filterAnyTime === null ? 'all' : filterAnyTime.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilterAnyTime(value === 'all' ? null : value === 'true')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Materials</option>
                  <option value="true">Any Time Materials</option>
                  <option value="false">Event Specific</option>
                </select>

                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      loadMaterials()
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-lg shadow">
          <MaterialsList
            materials={sortedMaterials}
            loading={loading}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            onUpdated={loadMaterials}
          />
        </div>
      </div>
    </main>
  )
}