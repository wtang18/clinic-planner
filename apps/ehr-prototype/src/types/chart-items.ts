/**
 * Chart item types - the primary data objects representing clinical documentation
 */

import type { SyncStatus, UserReference } from './common';
import type { FacilityReference, PharmacyReference, ProviderReference } from './references';

// ============================================================================
// Base Types
// ============================================================================

/** All chart item categories */
export type ItemCategory =
  | 'chief-complaint'
  | 'hpi'            // History of Present Illness
  | 'ros'            // Review of Systems
  | 'physical-exam'
  | 'vitals'
  | 'medication'
  | 'allergy'
  | 'lab'
  | 'imaging'
  | 'procedure'
  | 'diagnosis'
  | 'plan'
  | 'instruction'
  | 'note'
  | 'referral';

/**
 * How the item was created — tracks clinical provenance.
 * Answers "who/what initiated this chart item?" for audit trails,
 * AI transparency, and the activity log.
 */
export type ItemSource =
  | { type: 'manual' }
  | { type: 'aiSuggestion'; suggestionId?: string; confidence?: number }
  | { type: 'aiDraft'; draftId?: string }
  | { type: 'protocol'; protocolId?: string; recommendationId?: string }
  | { type: 'orderSet'; orderSetId?: string }
  | { type: 'maHandoff' };

/** Activity log entry — append-only audit trail per chart item */
export interface ActivityLogEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
}

/** Item status in workflow */
export type ItemStatus =
  | 'draft'           // In progress, not finalized
  | 'pending-review'  // AI-generated, needs clinician review
  | 'confirmed'       // Clinician confirmed
  | 'ordered'         // Sent to external system
  | 'completed'       // Results received, procedure done
  | 'cancelled';

/** Tag for visual indicators on items */
export interface Tag {
  label: string;
  type: TagType;
  color?: string;
  actionable?: boolean;
  action?: string;
}

/** Tag categories */
export type TagType =
  | 'status'     // "New", "Confirmed", "Pending"
  | 'source'     // "Quest", "In-House"
  | 'alert'      // "OOR" (out of range), "Critical"
  | 'category'   // "Lab", "Rx"
  | 'ai'         // "AI Suggested", "Needs Review"
  | 'workflow';  // "Requisition Sent", "E-Prescribed"

/** Base interface for all chart items */
export interface ChartItemBase {
  id: string;
  category: ItemCategory;
  createdAt: Date;
  createdBy: UserReference;
  modifiedAt: Date;
  modifiedBy: UserReference;
  source: ItemSource;
  status: ItemStatus;
  
  // For display
  displayText: string;
  displaySubtext?: string;
  tags: Tag[];
  
  // Linkages
  linkedDiagnoses: string[];   // IDs of associated Dx items
  linkedEncounters: string[];  // For longitudinal tracking
  
  // Activity log (append-only audit trail)
  activityLog: ActivityLogEntry[];

  // Metadata
  _meta: {
    syncStatus: SyncStatus;
    aiGenerated: boolean;
    aiConfidence?: number;     // 0-1 if AI-generated
    requiresReview: boolean;
    reviewed: boolean;         // Whether provider has reviewed (for MA handoff items)
  };
}

// ============================================================================
// Medication Item
// ============================================================================

export interface MedicationItem extends ChartItemBase {
  category: 'medication';
  data: {
    // Drug identification
    drugName: string;
    genericName?: string;
    ndc?: string;            // National Drug Code
    rxNorm?: string;         // RxNorm concept ID
    
    // Prescription details
    dosage: string;          // "100 mg"
    route: string;           // "PO", "IM", "IV", "topical", etc.
    frequency: string;       // "TID", "daily", "PRN", "BID"
    duration?: string;       // "7 days", "ongoing"
    quantity?: number;
    refills?: number;
    
    // Sig & dispensing
    sig?: string;            // Human-readable instructions (auto-generated or custom)
    daw?: boolean;           // Dispense as Written (brand-name only)

    // Classification
    isControlled: boolean;
    controlSchedule?: 'II' | 'III' | 'IV' | 'V';

    // Prescription routing
    prescriptionType: 'new' | 'refill' | 'change' | 'discontinue';
    pharmacy?: PharmacyReference;
    
    // For "reported" meds (patient says they take)
    reportedBy?: 'patient' | 'caregiver' | 'external-record';
    verificationStatus?: 'unverified' | 'verified' | 'discrepancy';
  };
  
  actions: ('e-prescribe' | 'print' | 'cancel' | 'modify')[];
}

// ============================================================================
// Lab Item
// ============================================================================

export interface LabResult {
  component: string;       // "Glucose", "WBC", "Hemoglobin"
  value: string | number;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}

export interface LabItem extends ChartItemBase {
  category: 'lab';
  data: {
    // Test identification
    testName: string;
    testCode?: string;       // LOINC code
    panelName?: string;      // If part of panel (e.g., "BMP", "CBC")
    
    // Order details
    priority: 'routine' | 'urgent' | 'stat';
    collectionType: 'in-house' | 'send-out';
    labVendor?: string;      // "Quest", "LabCorp"
    
    // Additional order details
    fastingRequired?: boolean;
    specialInstructions?: string;

    // Status tracking
    orderStatus: 'draft' | 'ordered' | 'collected' | 'processing' | 'resulted';
    requisitionId?: string;
    collectedAt?: Date;
    resultedAt?: Date;
    
    // Results (when available)
    results?: LabResult[];
  };
}

// ============================================================================
// Diagnosis Item
// ============================================================================

export interface DiagnosisItem extends ChartItemBase {
  category: 'diagnosis';
  data: {
    // Diagnosis identification
    description: string;
    icdCode: string;         // ICD-10 code
    snomedCode?: string;     // SNOMED CT code
    
    // Classification
    type: 'encounter' | 'chronic' | 'historical';
    ranking?: 'primary' | 'secondary' | number;
    
    // Clinical status
    clinicalStatus: 'active' | 'resolved' | 'inactive';
    onsetDate?: Date;
    resolvedDate?: Date;
    
    // For billing/coding
    isPOA?: boolean;         // Present on Admission (hospital)
  };
}

// ============================================================================
// Vitals Item
// ============================================================================

export type VitalType =
  | 'bp-systolic'
  | 'bp-diastolic'
  | 'pulse'
  | 'temp'
  | 'resp'
  | 'spo2'
  | 'weight'
  | 'height'
  | 'bmi'
  | 'pain-scale';

export interface VitalMeasurement {
  type: VitalType;
  value: number;
  unit: string;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}

export interface VitalsItem extends ChartItemBase {
  category: 'vitals';
  data: {
    measurements: VitalMeasurement[];
    capturedAt: Date;
    position?: 'sitting' | 'standing' | 'supine';
  };
}

// ============================================================================
// Physical Exam Item
// ============================================================================

export type ExamSystem =
  | 'general'
  | 'heent'
  | 'neck'
  | 'cardiovascular'
  | 'respiratory'
  | 'gi'
  | 'gu'
  | 'musculoskeletal'
  | 'skin'
  | 'neurological'
  | 'psychiatric';

export interface PhysicalExamItem extends ChartItemBase {
  category: 'physical-exam';
  data: {
    system: ExamSystem;
    finding: string;         // "Mild wheezing, no rales or consolidation"
    isNormal: boolean;
    
    // Structured findings (optional)
    structuredFindings?: {
      code: string;          // SNOMED or internal code
      present: boolean;
      qualifier?: string;
    }[];
  };
}

// ============================================================================
// Imaging Item
// ============================================================================

export interface ImagingItem extends ChartItemBase {
  category: 'imaging';
  data: {
    studyType: string;       // "X-ray", "CT", "MRI", "Ultrasound"
    bodyPart: string;        // "Chest", "Abdomen", "Left knee"
    indication: string;
    priority: 'routine' | 'urgent' | 'stat';
    
    // Order routing
    facility?: FacilityReference;
    requiresAuth: boolean;
    authStatus?: 'pending' | 'approved' | 'denied';
    
    // Status
    orderStatus: 'draft' | 'ordered' | 'scheduled' | 'completed' | 'read';
    scheduledAt?: Date;
    completedAt?: Date;
    
    // Results
    radiologistReport?: string;
    impression?: string;
  };
}

// ============================================================================
// Narrative Items (Chief Complaint, HPI, ROS, Plan, Note)
// ============================================================================

export type NarrativeCategory = 'chief-complaint' | 'hpi' | 'ros' | 'plan' | 'note';

export interface NarrativeItem extends ChartItemBase {
  category: NarrativeCategory;
  data: {
    text: string;
    format: 'plain' | 'structured';
    
    // If structured (parsed from narrative)
    structuredElements?: {
      type: string;          // "duration", "severity", "location", "quality"
      value: string;
      span?: [number, number]; // Position in original text
    }[];
  };
}

// ============================================================================
// Allergy Item
// ============================================================================

export interface AllergyItem extends ChartItemBase {
  category: 'allergy';
  data: {
    allergen: string;
    allergenType: 'drug' | 'food' | 'environmental' | 'other';
    reaction?: string;
    severity: 'mild' | 'moderate' | 'severe' | 'unknown';
    
    // Verification
    reportedBy: 'patient' | 'caregiver' | 'external-record';
    verificationStatus: 'unverified' | 'confirmed' | 'refuted';
    onsetDate?: Date;
  };
}

// ============================================================================
// Instruction Item
// ============================================================================

export interface InstructionItem extends ChartItemBase {
  category: 'instruction';
  data: {
    text: string;
    instructionType: 'discharge' | 'follow-up' | 'medication' | 'activity' | 'diet' | 'warning';
    
    // For follow-up
    followUpInterval?: string;  // "2 weeks", "as needed"
    followUpProvider?: string;
    
    // Delivery
    printable: boolean;
    requiresAcknowledgment: boolean;
  };
}

// ============================================================================
// Referral Item
// ============================================================================

export interface ReferralItem extends ChartItemBase {
  category: 'referral';
  data: {
    specialty: string;
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergent';
    
    // Routing
    referToProvider?: ProviderReference;
    referToFacility?: FacilityReference;
    
    // Status
    referralStatus: 'draft' | 'sent' | 'scheduled' | 'completed';
    scheduledDate?: Date;
    
    // Authorization
    requiresAuth: boolean;
    authStatus?: 'pending' | 'approved' | 'denied';
  };
}

// ============================================================================
// Procedure Item
// ============================================================================

export interface ProcedureItem extends ChartItemBase {
  category: 'procedure';
  data: {
    procedureName: string;
    cptCode?: string;
    
    // Timing
    performedAt?: Date;
    performedBy?: UserReference;
    
    // Documentation
    indication: string;
    technique?: string;
    findings?: string;
    complications?: string;
    
    // Status
    procedureStatus: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  };
}

// ============================================================================
// Union Type
// ============================================================================

export type ChartItem =
  | MedicationItem
  | LabItem
  | DiagnosisItem
  | VitalsItem
  | PhysicalExamItem
  | ImagingItem
  | NarrativeItem
  | AllergyItem
  | InstructionItem
  | ReferralItem
  | ProcedureItem;
