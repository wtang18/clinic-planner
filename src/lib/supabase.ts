import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface OutreachAngle {
  id: number
  name: string
  color: string
  description?: string
}

export interface OutreachAngleSelection {
  angle: string
  notes: string
  color?: string
  description?: string
}

export interface MarketingMaterial {
  id: number
  label: string
  url: string
  event_id: number | null  // NULL = "any time" material, value = specific event
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NewMarketingMaterial {
  label: string
  url: string
  event_id?: number | null  // NULL for "any time" materials
  notes?: string | null
}

export interface EventIdea {
  id: number
  title: string
  description?: string
  // Legacy fields (kept for backward compatibility)
  month: number
  year: number
  category_id: number
  // New primary date fields
  start_month: number
  start_year: number
  end_month?: number
  end_year?: number
  // New outreach angles field
  outreach_angles: OutreachAngleSelection[]
  prep_months_needed: number
  prep_start_date?: string
  is_recurring?: boolean
  created_by: string
  created_at: string
  category?: OutreachAngle
}

export interface NewEventIdea {
  title: string
  description?: string
  // New primary fields
  start_month: number
  start_year: number
  end_month?: number
  end_year?: number
  outreach_angles: OutreachAngleSelection[]
  prep_months_needed?: number
  prep_start_date?: string
  is_recurring?: boolean
  created_by: string
  // Legacy fields (for backward compatibility during transition)
  month?: number
  year?: number
  category_id?: number
}

// Legacy interface for backward compatibility
export interface Category {
  id: number
  name: string
  color: string
  description?: string
}

// Month note interface
export interface MonthNote {
  id: number
  month: number // 1-12
  note_text: string | null
  created_at: string
  updated_at: string
}

export interface NewMonthNote {
  month: number
  note_text: string | null
}