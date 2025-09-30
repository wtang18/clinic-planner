'use client'

import { EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase'
import { eventDataProcessor } from '@/lib/eventHelpers'

interface EventCardProps {
  event: EventIdea
  outreachAngles: OutreachAngle[]
  materials?: MarketingMaterial[]
  onClick: (eventId: number) => void
  variant?: 'quarter' | 'timeline' | 'annual'
  statusLabel?: string
  statusType?: 'event' | 'prep' | 'upcoming' | 'future'
  viewingYear?: number
}

export default function EventCard({
  event,
  outreachAngles,
  materials = [],
  onClick,
  variant = 'quarter',
  statusLabel,
  statusType,
  viewingYear
}: EventCardProps) {
  const processedEvent = eventDataProcessor.formatEventForDisplay(event, outreachAngles, viewingYear)

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const statusStyles = {
    event: 'bg-blue-100 text-blue-700',
    prep: 'bg-orange-100 text-orange-700',
    upcoming: 'bg-yellow-100 text-yellow-700',
    future: 'bg-green-100 text-green-700'
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 ${
        variant === 'quarter'
          ? 'p-4 shadow-sm hover:shadow-md hover:border-gray-300'
          : 'p-3 hover:bg-gray-50'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onClick(event.id)
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-gray-900 ${variant === 'quarter' ? 'mb-1' : 'text-sm mb-1'}`}>
            {event.title}
          </h4>

          {/* Description */}
          {event.description && variant !== 'annual' && (
            <p className={`text-gray-600 mb-2 ${variant === 'quarter' ? 'text-sm line-clamp-2' : 'text-xs'}`}>
              {variant === 'timeline' ? truncateText(event.description, 100) : event.description}
            </p>
          )}


          {/* Outreach Angles with Notes */}
          {variant !== 'annual' && (
            <div className={`space-y-2 mb-2`}>
              {/* Angle badges */}
              <div className="flex flex-wrap items-center gap-1">
                {processedEvent.processedOutreachAngles.map((angle, i) => {
                  const angleData = outreachAngles.find(oa => oa.name === angle.angle)

                  return (
                    <span
                      key={i}
                      className={variant === 'timeline'
                        ? "inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800"
                        : "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      }
                      style={variant === 'quarter' ? {
                        backgroundColor: `${angleData?.color || '#gray'}20`,
                        color: angleData?.color || '#gray'
                      } : undefined}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{
                          backgroundColor: angleData?.color || '#gray'
                        }}
                      ></span>
                      {angle.angle}
                    </span>
                  )
                })}
              </div>

              {/* Note snippets for all angles that have notes */}
              <div className="space-y-1">
                {processedEvent.processedOutreachAngles
                  .filter(angle => angle.notes && angle.notes.trim().length > 0)
                  .map((angle, i) => (
                    <div key={i} className="text-xs text-gray-600 italic">
                      <span className="font-medium text-gray-700">{angle.angle}:</span> {truncateText(angle.notes, variant === 'quarter' ? 100 : 80)}
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Materials */}
          {variant !== 'annual' && materials.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-1">
                {materials.slice(0, 3).map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                    title={material.url}
                  >
                    <span className="mr-1">📁</span>
                    {truncateText(material.label, variant === 'quarter' ? 15 : 12)}
                  </a>
                ))}
                {materials.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    +{materials.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Timeline-specific status label */}
          {variant === 'timeline' && statusLabel && statusType && (
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[statusType]}`}>
                {statusLabel}
              </span>
            </div>
          )}

          {/* Indicators */}
          <div className="flex items-center space-x-2">
            {/* Multi-month indicator */}
            {processedEvent.displayDate.isMultiMonth && processedEvent.displayDate.end && (
              <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                📅 {processedEvent.displayDate.start} - {processedEvent.displayDate.end}
              </div>
            )}

            {/* Recurring indicator */}
            {event.is_recurring && (
              <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                <span className="mr-1">🔄</span>
                {variant === 'quarter' ? 'Yearly Event' : 'Yearly'}
              </div>
            )}
          </div>
        </div>

        {/* Timeline and Annual arrow */}
        {(variant === 'timeline' || variant === 'annual') && (
          <div className="ml-2 text-gray-400 text-sm">
            →
          </div>
        )}
      </div>
    </div>
  )
}