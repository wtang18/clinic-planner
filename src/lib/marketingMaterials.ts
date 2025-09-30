import { supabase, MarketingMaterial, NewMarketingMaterial } from './supabase'

export class MarketingMaterialsService {
  // ========== CRUD Operations ==========

  /**
   * Create a new marketing material
   */
  static async createMaterial(material: NewMarketingMaterial): Promise<MarketingMaterial | null> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .insert([material])
        .select()
        .single()

      if (error) {
        console.error('Error creating marketing material:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating marketing material:', error)
      return null
    }
  }

  /**
   * Update an existing marketing material
   */
  static async updateMaterial(id: number, updates: Partial<NewMarketingMaterial>): Promise<MarketingMaterial | null> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating marketing material:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating marketing material:', error)
      return null
    }
  }

  /**
   * Delete a marketing material and all its associations
   */
  static async deleteMaterial(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketing_materials')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting marketing material:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting marketing material:', error)
      return false
    }
  }

  // ========== Association Operations ==========

  /**
   * Associate a material with an event by updating its event_id
   */
  static async associateMaterialWithEvent(eventId: number, materialId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketing_materials')
        .update({ event_id: eventId })
        .eq('id', materialId)

      if (error) {
        console.error('Error associating material with event:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error associating material with event:', error)
      return false
    }
  }

  /**
   * Remove association between material and event (set event_id to NULL)
   */
  static async disassociateMaterialFromEvent(materialId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketing_materials')
        .update({ event_id: null })
        .eq('id', materialId)

      if (error) {
        console.error('Error disassociating material from event:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error disassociating material from event:', error)
      return false
    }
  }

  /**
   * Set materials for an event (updates event_id for specified materials)
   */
  static async setEventMaterials(eventId: number, materialIds: number[]): Promise<boolean> {
    try {
      // First, unassociate all materials currently associated with this event
      const { error: resetError } = await supabase
        .from('marketing_materials')
        .update({ event_id: null })
        .eq('event_id', eventId)

      if (resetError) {
        console.error('Error resetting existing event materials:', resetError)
        return false
      }

      // Now associate the new materials if any
      if (materialIds.length > 0) {
        const { error: updateError } = await supabase
          .from('marketing_materials')
          .update({ event_id: eventId })
          .in('id', materialIds)

        if (updateError) {
          console.error('Error updating event materials:', updateError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error setting event materials:', error)
      return false
    }
  }

  // ========== Query Functions ==========

  /**
   * Get all marketing materials
   */
  static async getAllMaterials(): Promise<MarketingMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .order('label')

      if (error) {
        console.error('Error fetching all materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all materials:', error)
      return []
    }
  }

  /**
   * Get materials for a specific event
   */
  static async getEventMaterials(eventId: number): Promise<MarketingMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .eq('event_id', eventId)
        .order('label')

      if (error) {
        console.error('Error fetching event materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching event materials:', error)
      return []
    }
  }

  /**
   * Get "any time" materials (materials with event_id = NULL)
   */
  static async getAnyTimeMaterials(): Promise<MarketingMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .is('event_id', null)
        .order('label')

      if (error) {
        console.error('Error fetching any-time materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching any-time materials:', error)
      return []
    }
  }

  /**
   * Get materials for events in a specific time period
   */
  static async getMaterialsForPeriod(startMonth: number, startYear: number, endMonth: number, endYear: number): Promise<{
    eventMaterials: Array<{ event: any, materials: MarketingMaterial[] }>
    anyTimeMaterials: MarketingMaterial[]
  }> {
    try {
      // Get events in the time period
      const { data: events, error: eventsError } = await supabase
        .from('events_ideas')
        .select('*')
        .gte('start_year', startYear)
        .lte('start_year', endYear)
        .order('start_year')
        .order('start_month')

      if (eventsError) {
        console.error('Error fetching events for period:', eventsError)
        return { eventMaterials: [], anyTimeMaterials: [] }
      }

      // Filter events that fall within the specified months
      const filteredEvents = (events || []).filter(event => {
        const eventStart = event.start_year * 12 + (event.start_month || event.month)
        const eventEnd = event.end_year ? event.end_year * 12 + event.end_month : eventStart
        const periodStart = startYear * 12 + startMonth
        const periodEnd = endYear * 12 + endMonth

        return eventEnd >= periodStart && eventStart <= periodEnd
      })

      // Get materials for each event
      const eventMaterials = await Promise.all(
        filteredEvents.map(async (event) => {
          const materials = await this.getEventMaterials(event.id)
          return { event, materials }
        })
      )

      // Get any-time materials
      const anyTimeMaterials = await this.getAnyTimeMaterials()

      return {
        eventMaterials: eventMaterials.filter(item => item.materials.length > 0),
        anyTimeMaterials
      }
    } catch (error) {
      console.error('Error fetching materials for period:', error)
      return { eventMaterials: [], anyTimeMaterials: [] }
    }
  }

  /**
   * Get materials for a specific month
   */
  static async getMaterialsForMonth(month: number, year: number): Promise<{
    eventMaterials: Array<{ event: any, materials: MarketingMaterial[] }>
    anyTimeMaterials: MarketingMaterial[]
  }> {
    return this.getMaterialsForPeriod(month, year, month, year)
  }

  /**
   * Get materials for a specific quarter
   */
  static async getMaterialsForQuarter(quarter: number, year: number): Promise<{
    eventMaterials: Array<{ event: any, materials: MarketingMaterial[] }>
    anyTimeMaterials: MarketingMaterial[]
  }> {
    const startMonth = (quarter - 1) * 3 + 1
    const endMonth = startMonth + 2
    return this.getMaterialsForPeriod(startMonth, year, endMonth, year)
  }

  /**
   * Search materials by label
   */
  static async searchMaterials(query: string): Promise<MarketingMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .ilike('label', `%${query}%`)
        .order('label')

      if (error) {
        console.error('Error searching materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching materials:', error)
      return []
    }
  }
}