'use client'

import { useState, useEffect } from 'react'
import { MarketingMaterial, EventIdea, supabase } from '@/lib/supabase'
import MaterialCard from '@/components/MaterialCard'

interface MaterialsListProps {
  materials: MarketingMaterial[]
  loading: boolean
  onEdit: (material: MarketingMaterial) => void
  onDelete: (id: number) => void
  onUpdated?: () => void
}

export default function MaterialsList({ materials, loading, onEdit, onDelete, onUpdated }: MaterialsListProps) {
  const [events, setEvents] = useState<EventIdea[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('id, title')
        .order('title')

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  const getEventName = (eventId: number) => {
    const event = events.find(e => e.id === eventId)
    return event?.title || `Event #${eventId}`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
        <p className="text-gray-600">
          Get started by creating your first marketing material
        </p>
      </div>
    )
  }

  return (
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
            eventName={!eventsLoading && material.event_id ? getEventName(material.event_id) : undefined}
            showEvent={true}
            onDelete={() => onDelete(material.id)}
            returnPath="materials"
          />
        ))}
      </div>
    </div>
  )
}