import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccbdyigxtwfpsemlvbnl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYmR5aWd4dHdmcHNlbWx2Ym5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzU2NTMsImV4cCI6MjA3MzgxMTY1M30.OEi15Jqn6vY1ygh7RMMnM52gZhTbNGliaNP91a1nFm0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Category {
  id: number
  name: string
  color: string
  description?: string
}

export interface EventIdea {
  id: number
  title: string
  description?: string
  month: number
  year: number
  category_id: number
  prep_months_needed: number
  prep_start_date?: string
  is_recurring?: boolean
  created_by: string
  created_at: string
  category?: Category
}

export interface NewEventIdea {
  title: string
  description?: string
  month: number
  year: number
  category_id: number
  prep_months_needed?: number
  prep_start_date?: string
  is_recurring?: boolean
  created_by: string
}