'use client'

import { useRouter } from 'next/navigation'
import { MarketingMaterial } from '@/lib/supabase'
import { formatTimestamp } from '@/lib/timeUtils'

interface MaterialCardProps {
  material: MarketingMaterial
  eventName?: string
  showEvent?: boolean
  onDelete: () => void
  returnPath?: string
}

export default function MaterialCard({
  material,
  eventName,
  showEvent = true,
  onDelete,
  returnPath = 'materials'
}: MaterialCardProps) {
  const router = useRouter()


  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleEdit = () => {
    router.push(`/edit-material/${material.id}?return=${returnPath}`)
  }

  const handleEventClick = () => {
    if (material.event_id) {
      router.push(`/event/${material.event_id}?return=${returnPath}`)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Material Name */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{material.label}</h3>
      </div>

      {/* URL */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-500 mb-1">URL</div>
        <div className="flex items-center">
          {isValidUrl(material.url) ? (
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm flex-1 truncate"
              title={material.url}
            >
              {material.url}
            </a>
          ) : (
            <span className="text-red-600 text-sm flex-1 truncate" title={material.url}>
              {material.url}
            </span>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(material.url)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
            title="Copy URL"
          >
            📋
          </button>
        </div>
      </div>

      {/* Event - only show if showEvent is true */}
      {showEvent && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Event</div>
          {material.event_id === null ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Any Time
            </span>
          ) : eventName ? (
            <button
              onClick={handleEventClick}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              {eventName}
            </button>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Event #{material.event_id}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {material.notes && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
          <p className="text-sm text-gray-700">{material.notes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
            <div className="text-sm text-gray-700">{formatTimestamp(material.created_at)}</div>
          </div>
          {material.updated_at !== material.created_at && (
            <div className="flex-1 ml-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Updated</div>
              <div className="text-sm text-gray-700">{formatTimestamp(material.updated_at)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          ID: {material.id}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}