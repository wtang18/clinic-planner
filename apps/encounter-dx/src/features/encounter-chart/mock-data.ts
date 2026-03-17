import type { EncounterDx, DxSearchResult, FacetGroup } from './types'

/** Initial encounter diagnoses (pre-loaded in chart) */
export const INITIAL_DIAGNOSES: EncounterDx[] = [
  {
    id: 'dx-1',
    description: 'Influenza due to other identified influenza virus with other respiratory manifestations',
    icdCode: 'J10.1',
    addedToProblems: false,
  },
]

/** Mock search results grouped by search term */
export const SEARCH_RESULTS: Record<string, DxSearchResult[]> = {
  cough: [
    { id: 'sr-1', description: 'Acute cough', icdCode: 'R05.1', category: 'Cough type' },
    { id: 'sr-2', description: 'Chronic cough', icdCode: 'R05.3', category: 'Cough type' },
    { id: 'sr-3', description: 'Cough, unspecified', icdCode: 'R05.9', category: 'Cough type' },
    { id: 'sr-4', description: 'Other specified cough', icdCode: 'R05.8', category: 'Cough type' },
    { id: 'sr-5', description: 'Primary cough headache', icdCode: 'G44.83', category: 'Associated symptoms' },
    { id: 'sr-6', description: 'Cough due to unspecified conditions', icdCode: 'R05.4', category: 'Cough type' },
    { id: 'sr-7', description: 'Cough syncope', icdCode: 'R05.5', category: 'Associated symptoms' },
  ],
  diabetes: [
    { id: 'sr-10', description: 'Type 2 diabetes mellitus without complications', icdCode: 'E11.9', category: 'Type' },
    { id: 'sr-11', description: 'Type 2 diabetes mellitus with diabetic chronic kidney disease', icdCode: 'E11.22', category: 'Complications' },
    { id: 'sr-12', description: 'Type 2 diabetes mellitus with diabetic neuropathy', icdCode: 'E11.40', category: 'Complications' },
    { id: 'sr-13', description: 'Type 1 diabetes mellitus without complications', icdCode: 'E10.9', category: 'Type' },
    { id: 'sr-14', description: 'Type 2 diabetes mellitus with hyperglycemia', icdCode: 'E11.65', category: 'Complications' },
    { id: 'sr-15', description: 'Pre-diabetes', icdCode: 'R73.03', category: 'Type' },
  ],
  headache: [
    { id: 'sr-20', description: 'Tension-type headache, unspecified', icdCode: 'G44.209', category: 'Headache type' },
    { id: 'sr-21', description: 'Migraine, unspecified, not intractable', icdCode: 'G43.909', category: 'Headache type' },
    { id: 'sr-22', description: 'Post-traumatic headache, unspecified', icdCode: 'G44.309', category: 'Headache type' },
    { id: 'sr-23', description: 'Cluster headache syndrome, unspecified', icdCode: 'G44.009', category: 'Headache type' },
    { id: 'sr-24', description: 'New daily persistent headache', icdCode: 'G44.52', category: 'Headache type' },
  ],
  back: [
    { id: 'sr-30', description: 'Low back pain', icdCode: 'M54.5', category: 'Location' },
    { id: 'sr-31', description: 'Lumbago with sciatica, unspecified side', icdCode: 'M54.40', category: 'Location' },
    { id: 'sr-32', description: 'Cervicalgia', icdCode: 'M54.2', category: 'Location' },
    { id: 'sr-33', description: 'Thoracic spine pain', icdCode: 'M54.6', category: 'Location' },
    { id: 'sr-34', description: 'Dorsalgia, unspecified', icdCode: 'M54.9', category: 'Location' },
  ],
  anxiety: [
    { id: 'sr-40', description: 'Generalized anxiety disorder', icdCode: 'F41.1', category: 'Anxiety disorders' },
    { id: 'sr-41', description: 'Anxiety disorder, unspecified', icdCode: 'F41.9', category: 'Anxiety disorders' },
    { id: 'sr-42', description: 'Social anxiety disorder', icdCode: 'F40.10', category: 'Anxiety disorders' },
    { id: 'sr-43', description: 'Panic disorder', icdCode: 'F41.0', category: 'Anxiety disorders' },
  ],
}

/** Get facet groups for a given search term */
export function getFacetsForSearch(term: string): FacetGroup[] {
  const lowerTerm = term.toLowerCase()

  if (lowerTerm.includes('cough')) {
    return [
      { label: 'Cough type', items: ['chronic cough', 'cough due to unspecified conditions', 'subacute cough', 'acute cough', 'cough due to other specified conditions'] },
      { label: 'Cough characteristics', items: [] },
      { label: 'Cough duration', items: [] },
      { label: 'Associated symptoms', items: [] },
    ]
  }

  if (lowerTerm.includes('diabetes')) {
    return [
      { label: 'Type', items: ['type 1', 'type 2', 'gestational', 'pre-diabetes'] },
      { label: 'Complications', items: ['neuropathy', 'nephropathy', 'retinopathy'] },
      { label: 'Control status', items: [] },
    ]
  }

  if (lowerTerm.includes('headache')) {
    return [
      { label: 'Headache type', items: ['tension', 'migraine', 'cluster', 'post-traumatic'] },
      { label: 'Chronicity', items: [] },
      { label: 'Triggers', items: [] },
    ]
  }

  if (lowerTerm.includes('back')) {
    return [
      { label: 'Location', items: ['lumbar', 'cervical', 'thoracic'] },
      { label: 'Characteristics', items: [] },
    ]
  }

  if (lowerTerm.includes('anxiety')) {
    return [
      { label: 'Anxiety disorders', items: ['generalized', 'social', 'panic'] },
      { label: 'Severity', items: [] },
    ]
  }

  return []
}

/** Search mock data — fuzzy match across all result sets */
export function searchDiagnoses(term: string, selectedFacet?: string): DxSearchResult[] {
  if (!term || term.length < 2) return []

  const lowerTerm = term.toLowerCase()

  // Collect matching results from all categories
  const allResults = Object.values(SEARCH_RESULTS).flat()
  const matches = allResults.filter(r =>
    r.description.toLowerCase().includes(lowerTerm) ||
    r.icdCode.toLowerCase().includes(lowerTerm)
  )

  // Also try matching against the key
  for (const [key, results] of Object.entries(SEARCH_RESULTS)) {
    if (key.includes(lowerTerm)) {
      for (const r of results) {
        if (!matches.find(m => m.id === r.id)) {
          matches.push(r)
        }
      }
    }
  }

  // Filter by selected facet if provided
  if (selectedFacet) {
    return matches.filter(r =>
      r.description.toLowerCase().includes(selectedFacet.toLowerCase())
    )
  }

  return matches
}
