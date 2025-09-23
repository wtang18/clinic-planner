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
  created_by: string
  created_at: string
}