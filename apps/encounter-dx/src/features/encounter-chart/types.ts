export interface EncounterDx {
  id: string
  description: string
  icdCode: string
  addedToProblems: boolean
}

export interface DxSearchResult {
  id: string
  description: string
  icdCode: string
  category: string
}

export interface FacetGroup {
  label: string
  items: string[]
}
