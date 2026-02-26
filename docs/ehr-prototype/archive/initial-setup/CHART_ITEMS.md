# Chart Items Data Model

## Overview

Chart items are the primary data objects representing clinical documentation. All items share a common base structure with category-specific extensions.

---

## Base Structure

```typescript
interface ChartItemBase {
  id: string;
  category: ItemCategory;
  createdAt: Date;
  createdBy: UserReference;
  modifiedAt: Date;
  modifiedBy: UserReference;
  source: ItemSource;
  status: ItemStatus;
  
  // For display
  displayText: string;        // Primary text shown in card
  displaySubtext?: string;    // Secondary line
  tags: Tag[];                // Chips shown on card
  
  // Linkages
  linkedDiagnoses: string[];  // IDs of associated Dx items
  linkedEncounters: string[]; // For longitudinal tracking
  
  // Metadata
  _meta: {
    syncStatus: SyncStatus;
    aiGenerated: boolean;
    aiConfidence?: number;    // 0-1 if AI-generated
    requiresReview: boolean;
  };
}
```

### Item Categories

```typescript
type ItemCategory = 
  | 'chief-complaint'
  | 'hpi'              // History of Present Illness
  | 'ros'              // Review of Systems
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
```

### Item Source

```typescript
type ItemSource = 
  | { type: 'manual' }
  | { type: 'transcription'; segmentId: string; confidence: number }
  | { type: 'suggestion'; suggestionId: string }
  | { type: 'import'; sourceSystem: string; sourceId: string }
  | { type: 'device'; deviceId: string }
  | { type: 'ai-generated' };
```

### Item Status

```typescript
type ItemStatus = 
  | 'draft'           // In progress, not finalized
  | 'pending-review'  // AI-generated, needs clinician review
  | 'confirmed'       // Clinician confirmed
  | 'ordered'         // Sent to external system
  | 'completed'       // Results received, procedure done
  | 'cancelled';
```

---

## Medication Item

```typescript
interface MedicationItem extends ChartItemBase {
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
```

---

## Lab Item

```typescript
interface LabItem extends ChartItemBase {
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
    
    // Status tracking
    orderStatus: 'draft' | 'ordered' | 'collected' | 'processing' | 'resulted';
    requisitionId?: string;
    collectedAt?: Date;
    resultedAt?: Date;
    
    // Results (when available)
    results?: LabResult[];
  };
}

interface LabResult {
  component: string;         // "Glucose", "WBC", "Hemoglobin"
  value: string | number;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}
```

---

## Diagnosis Item

```typescript
interface DiagnosisItem extends ChartItemBase {
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
```

---

## Vitals Item

```typescript
interface VitalsItem extends ChartItemBase {
  category: 'vitals';
  data: {
    measurements: VitalMeasurement[];
    capturedAt: Date;
    position?: 'sitting' | 'standing' | 'supine';
  };
}

interface VitalMeasurement {
  type: VitalType;
  value: number;
  unit: string;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}

type VitalType = 
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
```

---

## Physical Exam Item

```typescript
interface PhysicalExamItem extends ChartItemBase {
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

type ExamSystem = 
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
```

---

## Imaging Item

```typescript
interface ImagingItem extends ChartItemBase {
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
```

---

## Narrative Items (Chief Complaint, HPI, ROS, Plan, Note)

```typescript
interface NarrativeItem extends ChartItemBase {
  category: 'chief-complaint' | 'hpi' | 'ros' | 'plan' | 'note';
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
```

---

## Allergy Item

```typescript
interface AllergyItem extends ChartItemBase {
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
```

---

## Patient Instructions Item

```typescript
interface InstructionItem extends ChartItemBase {
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
```

---

## Referral Item

```typescript
interface ReferralItem extends ChartItemBase {
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
```

---

## Procedure Item

```typescript
interface ProcedureItem extends ChartItemBase {
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
```

---

## Union Type

```typescript
type ChartItem = 
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
```

---

## Tag System

Tags provide consistent visual indicators across item types.

```typescript
interface Tag {
  label: string;
  type: TagType;
  color?: string;          // Override default color for type
  actionable?: boolean;    // If true, tapping tag does something
  action?: string;         // Action identifier
}

type TagType = 
  | 'status'       // "New", "Confirmed", "Pending"
  | 'source'       // "Quest", "In-House"
  | 'alert'        // "OOR" (out of range), "Critical"
  | 'category'     // "Lab", "Rx"
  | 'ai'           // "AI Suggested", "Needs Review"
  | 'workflow';    // "Requisition Sent", "E-Prescribed"
```

### Tag Color Defaults

| Type | Default Color | Example Labels |
|------|---------------|----------------|
| `status` | Blue | "New", "Confirmed" |
| `source` | Gray | "Quest", "In-House" |
| `alert` | Red/Orange | "OOR", "Critical", "3 OOR" |
| `category` | Teal | "Lab", "Rx" |
| `ai` | Purple | "AI", "Needs Review" |
| `workflow` | Green | "Sent", "E-Prescribed" |

---

## Related Documents

- [State Contract](../architecture/STATE_CONTRACT.md) — How items are stored and accessed
- [Suggestions & Tasks](./SUGGESTIONS_TASKS.md) — AI-generated data models
- [Supporting Types](./SUPPORTING_TYPES.md) — Shared references and enums
