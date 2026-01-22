import { EventIdea, OutreachAngleSelection, OutreachAngle } from './supabase'

export interface EventDataProcessor {
  getDisplayDate: (event: EventIdea, viewingYear?: number) => { start: string; end?: string; isMultiMonth: boolean }
  getOutreachAngles: (event: EventIdea) => OutreachAngleSelection[]
  getPrimaryAngleColor: (event: EventIdea, outreachAngles: OutreachAngle[]) => string
  formatEventForDisplay: (event: EventIdea, outreachAngles: OutreachAngle[], viewingYear?: number) => ProcessedEvent
}

export interface ProcessedEvent extends EventIdea {
  displayDate: { start: string; end?: string; isMultiMonth: boolean }
  processedOutreachAngles: OutreachAngleSelection[]
  primaryAngleColor: string
}

export const eventDataProcessor: EventDataProcessor = {
  getDisplayDate: (event: EventIdea, viewingYear?: number) => {
    // Use new fields if available, fall back to legacy fields
    const startMonth = event.start_month || event.month
    const startYear = event.start_year || event.year
    const endMonth = event.end_month
    const endYear = event.end_year

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    // For recurring events, use the viewing year if provided
    const displayStartYear = event.is_recurring && viewingYear ? viewingYear : startYear
    const start = `${monthNames[startMonth - 1]} ${displayStartYear}`

    if (endMonth && endYear && (endMonth !== startMonth || endYear !== startYear)) {
      // For recurring events, calculate the end year properly
      let displayEndYear
      if (event.is_recurring && viewingYear) {
        // If it's a year-wrapping event (e.g., Nov-Feb), end year should be next year
        displayEndYear = endMonth < startMonth ? viewingYear + 1 : viewingYear
      } else {
        displayEndYear = endYear
      }

      const end = `${monthNames[endMonth - 1]} ${displayEndYear}`
      return { start, end, isMultiMonth: true }
    }

    return { start, isMultiMonth: false }
  },

  getOutreachAngles: (event: EventIdea): OutreachAngleSelection[] => {
    // If we have the new outreach_angles field, use it
    if (event.outreach_angles && Array.isArray(event.outreach_angles) && event.outreach_angles.length > 0) {
      return event.outreach_angles
    }

    // Fall back to legacy category_id and convert it
    if (event.category_id && event.category) {
      const legacyMapping: Record<string, string> = {
        'urgent_care': 'UC',
        'primary_care': 'PC',
        'workplace': 'WPH',
        'clinical_research': 'Research'
      }

      const angle = legacyMapping[event.category.name] || event.category.name
      return [{
        angle,
        notes: event.category.description || ''
      }]
    }

    // Default fallback
    return [{ angle: 'PC', notes: 'Migrated from legacy data' }]
  },

  getPrimaryAngleColor: (event: EventIdea, outreachAngles: OutreachAngle[]): string => {
    const processedAngles = eventDataProcessor.getOutreachAngles(event)
    if (processedAngles.length === 0) return '#4ECDC4' // Default PC color

    const primaryAngle = processedAngles[0].angle
    const angleData = outreachAngles.find(angle => angle.name === primaryAngle)

    if (angleData) {
      return angleData.color
    }

    // Legacy color mapping
    const legacyColors: Record<string, string> = {
      'UC': '#FF6B6B',
      'PC': '#4ECDC4',
      'WPH': '#45B7D1',
      'Research': '#96CEB4'
    }

    return legacyColors[primaryAngle] || '#4ECDC4'
  },

  formatEventForDisplay: (event: EventIdea, outreachAngles: OutreachAngle[], viewingYear?: number): ProcessedEvent => {
    return {
      ...event,
      displayDate: eventDataProcessor.getDisplayDate(event, viewingYear),
      processedOutreachAngles: eventDataProcessor.getOutreachAngles(event),
      primaryAngleColor: eventDataProcessor.getPrimaryAngleColor(event, outreachAngles)
    }
  }
}

// Helper function for form initialization with backward compatibility
export const initializeFormFromEvent = (event: EventIdea | null) => {
  if (!event) return null

  const processedAngles = eventDataProcessor.getOutreachAngles(event)

  // Build selected_angles and angle_notes from processed data
  const selected_angles: Record<string, boolean> = {}
  const angle_notes: Record<string, string> = {}

  processedAngles.forEach(({ angle, notes }) => {
    selected_angles[angle] = true
    angle_notes[angle] = notes
  })

  const displayDate = eventDataProcessor.getDisplayDate(event)

  return {
    title: event.title,
    description: event.description || '',
    start_month: event.start_month || event.month,
    start_year: event.start_year || event.year,
    end_month: event.end_month || event.start_month || event.month,
    end_year: event.end_year || event.start_year || event.year,
    is_multi_month: displayDate.isMultiMonth,
    selected_angles,
    angle_notes,
    prep_months_needed: event.prep_months_needed || 0,
    prep_start_date: event.prep_start_date || '',
    is_recurring: event.is_recurring || false,
    created_by: event.created_by
  }
}