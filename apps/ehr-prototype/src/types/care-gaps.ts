/**
 * Care gap types - rules-based quality measure tracking
 */

import type { UserReference } from './common';

// ============================================================================
// Care Gap Definition (Organization-level configuration)
// ============================================================================

/** Care gap categories */
export type CareGapCategory =
  | 'immunization'
  | 'cancer-screening'
  | 'sti-screening'
  | 'womens-health'
  | 'diabetes'
  | 'hypertension'
  | 'mental-health'
  | 'preventive'
  | 'chronic-disease'
  | 'pediatric'
  | 'other';

/** Care gap definition - configured at organization level */
export interface CareGapDefinition {
  id: string;
  name: string;
  category: CareGapCategory;
  description: string;
  
  eligibility: CareGapEligibility;
  frequency: CareGapFrequency;
  closureCriteria: CareGapClosureCriteria;
  
  qualityMeasure?: QualityMeasureReference;
  
  priority: 'routine' | 'important' | 'critical';
  patientFacingName?: string;
  actionLabel?: string;
}

/** Eligibility criteria for care gaps */
export interface CareGapEligibility {
  ageRange?: { min?: number; max?: number };
  gender?: ('male' | 'female' | 'other')[];
  diagnoses?: string[];        // ICD codes that make patient eligible
  medications?: string[];      // Being on certain meds triggers gap
  excludeDiagnoses?: string[]; // ICD codes that exclude patient
  customCriteria?: string;     // Expression or rule ID for complex logic
}

/** Frequency configuration for care gaps */
export interface CareGapFrequency {
  interval: 'once' | 'annual' | 'biannual' | 'quarterly' | 'custom';
  customDays?: number;
  anchorDate?: 'birth' | 'last-closure' | 'diagnosis-date';
}

/** Quality measure reference */
export interface QualityMeasureReference {
  measureSet: 'HEDIS' | 'MIPS' | 'UDS' | 'custom';
  measureId: string;
  measureYear: number;
}

// ============================================================================
// Care Gap Closure Criteria
// ============================================================================

export type CareGapClosureCriteria =
  | LabResultClosure
  | ImmunizationClosure
  | ProcedureClosure
  | ImagingClosure
  | AssessmentClosure
  | EncounterClosure
  | MedicationClosure
  | CompositeClosure;

export interface LabResultClosure {
  type: 'lab-result';
  testCodes: string[];           // LOINC codes
  resultCriteria?: {
    operator: 'exists' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'equals';
    value?: number;
    minValue?: number;
    maxValue?: number;
  };
  withinDays: number;
}

export interface ImmunizationClosure {
  type: 'immunization';
  cvxCodes: string[];            // CVX vaccine codes
  doseNumber?: number;           // For multi-dose series
  withinDays: number;
}

export interface ProcedureClosure {
  type: 'procedure';
  cptCodes: string[];
  withinDays: number;
}

export interface ImagingClosure {
  type: 'imaging';
  studyTypes: string[];
  withinDays: number;
  requiresResult?: boolean;
}

export interface AssessmentClosure {
  type: 'assessment';
  assessmentType: string;        // "PHQ-9", "GAD-7", "AUDIT-C"
  scoreCriteria?: {
    operator: 'lt' | 'lte' | 'gt' | 'gte' | 'between';
    value?: number;
    minValue?: number;
    maxValue?: number;
  };
  withinDays: number;
}

export interface EncounterClosure {
  type: 'encounter';
  encounterTypes: string[];      // "annual-wellness", "follow-up"
  withinDays: number;
}

export interface MedicationClosure {
  type: 'medication';
  medicationClasses: string[];   // "statin", "ace-inhibitor"
  adherenceThreshold?: number;   // % adherence required
}

export interface CompositeClosure {
  type: 'composite';
  operator: 'and' | 'or';
  criteria: CareGapClosureCriteria[];
}

// ============================================================================
// Care Gap Instance (Patient-level tracking)
// ============================================================================

/** Care gap status */
export type CareGapStatus =
  | 'open'       // Gap exists, not addressed
  | 'pending'    // Action taken, awaiting result/confirmation
  | 'closed'     // Successfully closed
  | 'excluded'   // Patient excluded from measure
  | 'expired';   // Measure period ended without closure

/** Closure attempt record */
export interface CareGapClosureAttempt {
  attemptedAt: Date;
  itemId: string;               // ChartItem that attempted closure
  itemType: string;             // 'lab', 'immunization', etc.
  result: 'success' | 'pending' | 'failed';
  failureReason?: string;       // "Result out of range", "Wrong test"
}

/** Exclusion reasons */
export type CareGapExclusionReason =
  | { type: 'patient-declined'; documentedAt: Date }
  | { type: 'medical-contraindication'; diagnosis: string }
  | { type: 'hospice' }
  | { type: 'life-expectancy'; months: number }
  | { type: 'completed-elsewhere'; documentation?: string }
  | { type: 'other'; reason: string };

/** Care gap instance - per-patient tracking */
export interface CareGapInstance {
  id: string;
  definitionId: string;          // Links to CareGapDefinition
  patientId: string;
  
  status: CareGapStatus;
  statusReason?: string;
  
  // Timing
  openedAt: Date;
  dueBy?: Date;
  closedAt?: Date;
  expiresAt?: Date;
  
  // Closure tracking
  closureAttempts: CareGapClosureAttempt[];
  closedBy?: {
    itemId: string;
    itemType: string;
    method: 'automatic' | 'manual';
  };
  
  // Exclusions
  excluded: boolean;
  exclusionReason?: CareGapExclusionReason;
  excludedBy?: UserReference;
  excludedAt?: Date;
  
  // For this encounter
  addressedThisEncounter: boolean;
  encounterActions: string[];    // Item IDs of actions taken
  
  // Display cache (denormalized for UI)
  _display: {
    name: string;
    category: CareGapCategory;
    priority: 'routine' | 'important' | 'critical';
    actionLabel: string;
    dueLabel?: string;           // "Due in 30 days", "Overdue"
  };
}
