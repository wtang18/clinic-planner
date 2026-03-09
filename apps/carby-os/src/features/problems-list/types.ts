export type ProblemCategory = 'condition' | 'encounter-dx' | 'sdoh' | 'health-concern'

export type VerificationStatus = 'unconfirmed' | 'confirmed' | 'excluded' | 'entered-in-error'

export type ClinicalStatus = 'active' | 'inactive' | 'recurrence' | 'resolved'

export type ProblemSource = 'reported' | 'diagnosed' | 'screened' | 'imported'

export type Severity = 'mild' | 'moderate' | 'severe'

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
}

export interface ScreeningInstrument {
  id: string
  name: string
  abbreviation: string
}

export type FilterKey = 'all' | 'unconfirmed' | 'active' | 'inactive' | 'confirmed' | 'excluded'
