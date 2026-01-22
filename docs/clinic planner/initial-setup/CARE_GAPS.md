# Care Gaps Data Model

## Overview

Care gaps represent outstanding clinical actions needed for a patient based on quality measures, preventive care guidelines, and chronic disease management protocols. Unlike suggestions (ephemeral, AI-generated), care gaps are:

- **Persistent** — Exist across encounters until closed
- **Rules-based** — Defined by clinical guidelines and quality measures
- **Measurable** — Tied to specific closure criteria
- **Auditable** — Track attempts to close and reasons for exclusion

---

## Care Gap Definition

Definitions are configured at the organization level and define eligibility, frequency, and closure criteria.

```typescript
interface CareGapDefinition {
  id: string;
  name: string;
  category: CareGapCategory;
  description: string;
  
  // Eligibility criteria
  eligibility: CareGapEligibility;
  
  // When to check
  frequency: CareGapFrequency;
  
  // How to close
  closureCriteria: CareGapClosureCriteria;
  
  // Quality measure linkage
  qualityMeasure?: QualityMeasureReference;
  
  // Display
  priority: 'routine' | 'important' | 'critical';
  patientFacingName?: string;    // Simplified name for instructions
  actionLabel?: string;          // "Order A1C", "Schedule mammogram"
}
```

### Categories

```typescript
type CareGapCategory =
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
```

### Eligibility

```typescript
interface CareGapEligibility {
  ageRange?: { min?: number; max?: number };
  gender?: ('male' | 'female' | 'other')[];
  diagnoses?: string[];        // ICD codes that make patient eligible
  medications?: string[];      // Being on certain meds triggers gap
  excludeDiagnoses?: string[]; // ICD codes that exclude patient
  customCriteria?: string;     // Expression or rule ID for complex logic
}
```

### Frequency

```typescript
interface CareGapFrequency {
  interval: 'once' | 'annual' | 'biannual' | 'quarterly' | 'custom';
  customDays?: number;
  anchorDate?: 'birth' | 'last-closure' | 'diagnosis-date';
}
```

### Closure Criteria

Closure criteria define how a gap can be satisfied. Multiple types support different clinical workflows.

```typescript
type CareGapClosureCriteria =
  | LabResultClosure
  | ImmunizationClosure
  | ProcedureClosure
  | ImagingClosure
  | AssessmentClosure
  | EncounterClosure
  | MedicationClosure
  | CompositeClosure;

interface LabResultClosure {
  type: 'lab-result';
  testCodes: string[];           // LOINC codes
  resultCriteria?: {
    operator: 'exists' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'equals';
    value?: number;
    minValue?: number;
    maxValue?: number;
  };
  withinDays: number;            // Result must be within this window
}

interface ImmunizationClosure {
  type: 'immunization';
  cvxCodes: string[];            // CVX vaccine codes
  doseNumber?: number;           // For multi-dose series
  withinDays: number;
}

interface ProcedureClosure {
  type: 'procedure';
  cptCodes: string[];
  withinDays: number;
}

interface ImagingClosure {
  type: 'imaging';
  studyTypes: string[];
  withinDays: number;
  requiresResult?: boolean;      // Just ordered vs. resulted
}

interface AssessmentClosure {
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

interface EncounterClosure {
  type: 'encounter';
  encounterTypes: string[];      // "annual-wellness", "follow-up"
  withinDays: number;
}

interface MedicationClosure {
  type: 'medication';
  medicationClasses: string[];   // "statin", "ace-inhibitor"
  adherenceThreshold?: number;   // % adherence required
}

interface CompositeClosure {
  type: 'composite';
  operator: 'and' | 'or';
  criteria: CareGapClosureCriteria[];
}
```

### Quality Measure Reference

```typescript
interface QualityMeasureReference {
  measureSet: 'HEDIS' | 'MIPS' | 'UDS' | 'custom';
  measureId: string;
  measureYear: number;
}
```

---

## Care Gap Instance

Instances are per-patient records tracking the status of a specific care gap.

```typescript
interface CareGapInstance {
  id: string;
  definitionId: string;          // Links to CareGapDefinition
  patientId: string;
  
  // Status
  status: CareGapStatus;
  statusReason?: string;
  
  // Timing
  openedAt: Date;                // When gap was identified
  dueBy?: Date;                  // When it should be closed
  closedAt?: Date;
  expiresAt?: Date;              // When gap resets (for recurring)
  
  // Closure tracking
  closureAttempts: CareGapClosureAttempt[];
  closedBy?: {
    itemId: string;              // ChartItem that closed it
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
```

### Status

```typescript
type CareGapStatus =
  | 'open'              // Gap exists, not addressed
  | 'pending'           // Action taken, awaiting result/confirmation
  | 'closed'            // Successfully closed
  | 'excluded'          // Patient excluded from measure
  | 'expired';          // Measure period ended without closure
```

### Closure Attempt

```typescript
interface CareGapClosureAttempt {
  attemptedAt: Date;
  itemId: string;               // ChartItem that attempted closure
  itemType: string;             // 'lab', 'immunization', etc.
  result: 'success' | 'pending' | 'failed';
  failureReason?: string;       // "Result out of range", "Wrong test"
}
```

### Exclusion Reasons

```typescript
type CareGapExclusionReason =
  | { type: 'patient-declined'; documentedAt: Date }
  | { type: 'medical-contraindication'; diagnosis: string }
  | { type: 'hospice' }
  | { type: 'life-expectancy'; months: number }
  | { type: 'completed-elsewhere'; documentation?: string }
  | { type: 'other'; reason: string };
```

---

## Example Definitions

### Diabetes: A1C Monitoring

```typescript
const dmA1c: CareGapDefinition = {
  id: 'dm-a1c',
  name: 'Diabetes: A1C Monitoring',
  category: 'diabetes',
  description: 'A1C test within measurement year for diabetic patients',
  
  eligibility: {
    diagnoses: ['E11.%', 'E10.%'],  // Type 1 & 2 diabetes (ICD-10 wildcards)
    ageRange: { min: 18, max: 75 },
  },
  
  frequency: {
    interval: 'biannual',
    anchorDate: 'last-closure',
  },
  
  closureCriteria: {
    type: 'lab-result',
    testCodes: ['4548-4'],          // LOINC for Hemoglobin A1c
    withinDays: 180,
  },
  
  qualityMeasure: {
    measureSet: 'HEDIS',
    measureId: 'CDC',
    measureYear: 2024,
  },
  
  priority: 'important',
  actionLabel: 'Order A1C',
};
```

### Breast Cancer Screening

```typescript
const breastCancerScreening: CareGapDefinition = {
  id: 'ccs-mammogram',
  name: 'Breast Cancer Screening',
  category: 'cancer-screening',
  description: 'Mammogram within 2 years for eligible women',
  
  eligibility: {
    gender: ['female'],
    ageRange: { min: 50, max: 74 },
    excludeDiagnoses: ['Z90.1%'],   // Bilateral mastectomy
  },
  
  frequency: {
    interval: 'custom',
    customDays: 730,                // 2 years
    anchorDate: 'last-closure',
  },
  
  closureCriteria: {
    type: 'imaging',
    studyTypes: ['mammogram', 'breast-mri'],
    withinDays: 730,
    requiresResult: true,
  },
  
  qualityMeasure: {
    measureSet: 'HEDIS',
    measureId: 'BCS',
    measureYear: 2024,
  },
  
  priority: 'important',
  patientFacingName: 'Mammogram',
  actionLabel: 'Schedule mammogram',
};
```

### Depression Screening

```typescript
const depressionScreening: CareGapDefinition = {
  id: 'mh-phq9',
  name: 'Depression Screening & Follow-up',
  category: 'mental-health',
  description: 'PHQ-9 screening with follow-up plan if positive',
  
  eligibility: {
    ageRange: { min: 12 },
  },
  
  frequency: {
    interval: 'annual',
    anchorDate: 'last-closure',
  },
  
  closureCriteria: {
    type: 'composite',
    operator: 'or',
    criteria: [
      // Negative screen closes gap
      {
        type: 'assessment',
        assessmentType: 'PHQ-9',
        scoreCriteria: { operator: 'lt', value: 5 },
        withinDays: 365,
      },
      // Positive screen + follow-up closes gap
      {
        type: 'composite',
        operator: 'and',
        criteria: [
          {
            type: 'assessment',
            assessmentType: 'PHQ-9',
            scoreCriteria: { operator: 'gte', value: 5 },
            withinDays: 365,
          },
          {
            type: 'encounter',
            encounterTypes: ['mental-health-followup', 'psychiatry'],
            withinDays: 365,
          },
        ],
      },
    ],
  },
  
  priority: 'routine',
  actionLabel: 'Administer PHQ-9',
};
```

### Colorectal Cancer Screening

```typescript
const colorectalScreening: CareGapDefinition = {
  id: 'ccs-colorectal',
  name: 'Colorectal Cancer Screening',
  category: 'cancer-screening',
  description: 'Colonoscopy, FIT, or other approved screening',
  
  eligibility: {
    ageRange: { min: 45, max: 75 },
    excludeDiagnoses: ['Z90.49'],  // Total colectomy
  },
  
  frequency: {
    interval: 'custom',
    customDays: 365,               // Annual check (test intervals vary)
    anchorDate: 'last-closure',
  },
  
  closureCriteria: {
    type: 'composite',
    operator: 'or',
    criteria: [
      {
        type: 'procedure',
        cptCodes: ['45378', '45380', '45381', '45384', '45385'],  // Colonoscopy
        withinDays: 3650,  // 10 years
      },
      {
        type: 'lab-result',
        testCodes: ['57905-2'],  // FIT test LOINC
        resultCriteria: { operator: 'exists' },
        withinDays: 365,  // Annual
      },
      {
        type: 'imaging',
        studyTypes: ['ct-colonography'],
        withinDays: 1825,  // 5 years
      },
    ],
  },
  
  qualityMeasure: {
    measureSet: 'HEDIS',
    measureId: 'COL',
    measureYear: 2024,
  },
  
  priority: 'important',
  actionLabel: 'Order screening',
};
```

---

## Care Gap Engine

The care gap engine evaluates patient eligibility and closure status.

```typescript
interface CareGapEngine {
  // Evaluate all gaps for a patient
  evaluatePatient(patient: PatientContext): Promise<CareGapInstance[]>;
  
  // Check if a single gap applies to patient
  checkEligibility(definition: CareGapDefinition, patient: PatientContext): boolean;
  
  // Evaluate if an item closes a gap
  evaluateClosure(
    gap: CareGapInstance, 
    item: ChartItem
  ): Promise<{ matches: boolean; pending: boolean; reason?: string }>;
  
  // Get closure suggestions for a gap
  getClosureActions(gap: CareGapInstance): ClosureAction[];
}

interface ClosureAction {
  type: 'order-lab' | 'order-imaging' | 'schedule-procedure' | 'administer' | 'document';
  label: string;
  itemTemplate?: Partial<ChartItem>;  // Pre-filled item for quick add
}
```

---

## UI Integration

### Care Gap Card

```
┌─────────────────────────────────────────┐
│ 🔴 A1C Monitoring                       │
│ Diabetes Care                           │
│ Due: Overdue by 45 days                 │
│                                         │
│ [Order A1C]              [Exclude ▾]    │
└─────────────────────────────────────────┘
```

### Care Gaps in Patient Overview

```
┌─────────────────────────────────────────┐
│ Care Gaps (3 open)                      │
├─────────────────────────────────────────┤
│ 🔴 A1C Monitoring — Overdue             │
│ 🟡 Mammogram — Due in 30 days           │
│ 🟢 Flu Vaccine — Due Oct 2024           │
└─────────────────────────────────────────┘
```

### Care Gap Closure in Task Pane

```
┌─────────────────────────────────────────┐
│ Care Gap Updates                        │
├─────────────────────────────────────────┤
│ ✓ A1C ordered — gap pending closure     │
│ ✓ PHQ-9 score 3 — gap closed            │
└─────────────────────────────────────────┘
```

---

## Related Documents

- [Chart Items](./CHART_ITEMS.md) — Items that close care gaps
- [AI Integration](../architecture/AI_INTEGRATION.md) — Care gap monitor service
- [State Contract](../architecture/STATE_CONTRACT.md) — Care gap actions
