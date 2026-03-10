export type ProblemCategory = 'condition' | 'encounter-dx' | 'sdoh' | 'health-concern'

export type VerificationStatus = 'unconfirmed' | 'confirmed' | 'excluded'

export type ClinicalStatus = 'active' | 'inactive' | 'recurrence' | 'resolved'

export type ProblemSource = 'reported' | 'diagnosed' | 'screened' | 'imported'

export type Severity = 'mild' | 'moderate' | 'severe'

export type ProblemEventType =
  | 'reported'
  | 'imported'
  | 'screening-detected'
  | 'confirmed'
  | 'excluded'
  | 'undo-excluded'
  | 'marked-active'
  | 'marked-inactive'
  | 'marked-resolved'
  | 'marked-addressed'
  | 'recurrence'
  | 'reopened'
  | 'edited'
  | 'note-added'

export interface ProblemEvent {
  id: string
  type: ProblemEventType
  performedBy: string
  performedAt: string
  effectiveDate?: string
  note?: string
  changes?: { field: string; from: string; to: string }[]
}

export interface ProblemItem {
  id: string
  category: ProblemCategory
  description: string
  icdCode: string | null
  snomedCode: string | null
  verificationStatus: VerificationStatus
  clinicalStatus: ClinicalStatus
  source: ProblemSource
  sourceDate: string
  severity?: Severity
  onsetDate?: string
  resolvedDate?: string
  history: ProblemEvent[]
  notes?: string
  relatedScreeningId?: string
}

export interface ScreeningInstrument {
  id: string
  name: string
  abbreviation: string
  administeredDate?: string
  score?: string
  interpretation?: string
}

export type FilterKey = 'all' | 'unconfirmed' | 'active' | 'inactive' | 'confirmed' | 'excluded'
