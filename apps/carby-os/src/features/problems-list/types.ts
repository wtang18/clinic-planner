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
  | 'undo-confirmed'
  | 'marked-active'
  | 'marked-inactive'
  | 'marked-resolved'
  | 'marked-addressed'
  | 'recurrence'
  | 'reopened'
  | 'undo-marked-active'
  | 'undo-marked-inactive'
  | 'undo-marked-resolved'
  | 'undo-marked-addressed'
  | 'undo-reopened'
  | 'undo-recurrence'
  | 'edited'
  | 'event-edited'
  | 'note-added'
  | 'removed'
  | 'provider-added'

export type RemovalReason = 'entered-in-error' | 'duplicate' | 'replaced' | 'patient-disputed'

export type DeletionReason = 'entered-in-error' | 'incorrect-import' | 'duplicate' | 'other'

export interface ProblemEvent {
  id: string
  type: ProblemEventType
  performedBy: string
  performedAt: string
  effectiveDate?: string
  note?: string
  changes?: { field: string; from: string; to: string }[]
  relatedEventId?: string
  removalReason?: RemovalReason
  deletedAt?: string
  deletedBy?: string
  deletionReason?: DeletionReason
  encounterVisitName?: string
  encounterDate?: string
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
  abatementDate?: string
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

export type FilterKey = 'all' | 'unconfirmed' | 'active' | 'inactive-resolved' | 'confirmed' | 'excluded'
