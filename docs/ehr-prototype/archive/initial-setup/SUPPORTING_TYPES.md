# Supporting Types

Shared types, references, and enums used across the data model.

---

## User & Role Types

```typescript
interface User {
  id: string;
  name: string;
  role: Role;
  credentials?: string[];      // "MD", "PA-C", "RN", "MA"
  npi?: string;                // National Provider Identifier
}

interface UserReference {
  id: string;
  name: string;
  role?: Role;
}

type Role =
  | 'provider'         // MD, DO, PA, NP
  | 'nurse'            // RN, LPN
  | 'ma'               // Medical Assistant
  | 'scribe'
  | 'tech'             // Lab tech, X-ray tech
  | 'admin'
  | 'billing';
```

---

## Patient Context

```typescript
interface PatientContext {
  id: string;
  mrn: string;                 // Medical Record Number
  
  // Demographics
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    age: number;
    gender: 'male' | 'female' | 'other';
    preferredName?: string;
    pronouns?: string;
  };
  
  // Contact
  contact?: {
    phone?: string;
    email?: string;
    address?: Address;
  };
  
  // Insurance
  insurance?: {
    primary?: InsuranceInfo;
    secondary?: InsuranceInfo;
  };
  
  // Clinical summary (for context)
  clinicalSummary?: {
    problemList: ProblemListItem[];
    medications: MedicationSummary[];
    allergies: AllergySummary[];
    recentEncounters: EncounterSummary[];
  };
}

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

interface InsuranceInfo {
  payerId: string;
  payerName: string;
  memberId: string;
  groupNumber?: string;
  planType?: string;
}

interface ProblemListItem {
  description: string;
  icdCode: string;
  status: 'active' | 'resolved' | 'inactive';
  onsetDate?: Date;
}

interface MedicationSummary {
  name: string;
  dosage: string;
  frequency: string;
  status: 'active' | 'discontinued';
}

interface AllergySummary {
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface EncounterSummary {
  date: Date;
  type: string;
  chiefComplaint?: string;
  provider: string;
}
```

---

## Encounter & Visit Types

```typescript
interface EncounterMeta {
  id: string;
  status: EncounterStatus;
  type: EncounterType;
  
  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  signedAt?: Date;
  signedBy?: UserReference;
  
  // Location
  facility?: FacilityReference;
  room?: string;
  
  // Billing
  appointmentId?: string;
  billingStatus?: 'pending' | 'coded' | 'submitted' | 'paid';
}

type EncounterStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-progress'
  | 'complete'
  | 'signed'
  | 'amended'
  | 'cancelled';

type EncounterType =
  | 'office-visit'
  | 'urgent-care'
  | 'telehealth'
  | 'annual-wellness'
  | 'follow-up'
  | 'procedure'
  | 'consult';

interface VisitMeta {
  chiefComplaint?: string;
  visitReason?: string;
  scheduledDuration?: number;    // minutes
  actualDuration?: number;
  serviceType?: string;          // "Self Pay", "Insurance", etc.
}
```

---

## Reference Types

```typescript
interface FacilityReference {
  id: string;
  name: string;
  type?: 'clinic' | 'hospital' | 'lab' | 'imaging-center';
  address?: Address;
  phone?: string;
  fax?: string;
}

interface ProviderReference {
  id: string;
  name: string;
  specialty?: string;
  npi?: string;
  facility?: FacilityReference;
}

interface PharmacyReference {
  id: string;
  name: string;
  ncpdpId?: string;             // National pharmacy ID
  address?: Address;
  phone?: string;
  fax?: string;
}

interface LabVendorReference {
  id: string;
  name: string;                  // "Quest", "LabCorp"
  accountNumber?: string;
}
```

---

## Transcription Types

```typescript
interface TranscriptionState {
  status: TranscriptionStatus;
  startedAt?: Date;
  pausedAt?: Date;
  
  // Current segment being processed
  currentSegment?: TranscriptSegment;
  
  // Statistics
  totalDuration: number;         // seconds
  segmentCount: number;
}

type TranscriptionStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'error';

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;             // seconds from start
  endTime: number;
  confidence: number;            // 0-1
  speaker?: 'provider' | 'patient' | 'other' | 'unknown';
  
  // Extracted entities
  entities?: ExtractedEntity[];
}

interface ExtractedEntity {
  type: EntityType;
  text: string;
  normalizedValue?: any;
  span: [number, number];        // Position in segment text
  confidence: number;
}

type EntityType =
  | 'medication'
  | 'diagnosis'
  | 'symptom'
  | 'duration'
  | 'body-part'
  | 'vital-sign'
  | 'lab-test'
  | 'procedure'
  | 'allergy';
```

---

## Collaboration Types

```typescript
interface Handoff {
  from: UserReference;
  to: UserReference;
  at: Date;
  note?: string;
}

interface ItemLock {
  itemId: string;
  userId: string;
  acquiredAt: Date;
  expiresAt: Date;
}

interface UserPresence {
  userId: string;
  activeSection?: string;
  cursorPosition?: { x: number; y: number };
  lastActiveAt: Date;
}
```

---

## Sync Types

```typescript
type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

interface QueuedAction {
  id: string;
  action: EncounterAction;
  queuedAt: Date;
  retryCount: number;
  lastError?: string;
}

interface SyncConflict {
  itemId: string;
  localVersion: any;
  serverVersion: any;
  detectedAt: Date;
  resolution?: 'local' | 'server' | 'merge';
  resolvedAt?: Date;
}
```

---

## Notification Types

```typescript
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  
  // Optional action
  actionLabel?: string;
  actionTarget?: string;
  
  // Behavior
  persistent?: boolean;          // Don't auto-dismiss
  dismissable?: boolean;
  
  // Lifecycle
  createdAt: Date;
  expiresAt?: Date;
  dismissedAt?: Date;
}
```

---

## Common Enums

```typescript
// Priority levels
type Priority = 'low' | 'normal' | 'high' | 'urgent';

// Verification status
type VerificationStatus = 'unverified' | 'verified' | 'discrepancy';

// Clinical status
type ClinicalStatus = 'active' | 'resolved' | 'inactive';

// Flag types for results
type ResultFlag = 'normal' | 'low' | 'high' | 'critical';
```

---

## Utility Types

```typescript
// For partial updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// For timestamped records
interface Timestamped {
  createdAt: Date;
  modifiedAt: Date;
}

// For auditable records
interface Auditable extends Timestamped {
  createdBy: UserReference;
  modifiedBy: UserReference;
}

// For items with sync tracking
interface Syncable {
  _meta: {
    syncStatus: SyncStatus;
    localVersion: number;
    serverVersion?: number;
  };
}
```

---

## Code Standards

### ICD-10 Codes
- Format: `[A-Z][0-9]{2}.[0-9A-Z]*`
- Example: `E11.9` (Type 2 diabetes without complications)
- Wildcards: Use `%` for matching (e.g., `E11.%` matches all E11 codes)

### LOINC Codes
- Format: `[0-9]+-[0-9]`
- Example: `4548-4` (Hemoglobin A1c)

### CPT Codes
- Format: `[0-9]{5}`
- Example: `99213` (Office visit, established patient)

### CVX Codes (Vaccines)
- Format: `[0-9]+`
- Example: `141` (Influenza, seasonal)

### RxNorm Codes
- Format: `[0-9]+`
- Example: `860975` (Metformin 500mg)

### NDC Codes
- Format: `[0-9]{5}-[0-9]{4}-[0-9]{2}` or `[0-9]{11}`
- Example: `00093-7180-01`

---

## Related Documents

- [Chart Items](./CHART_ITEMS.md) — Uses these types
- [Care Gaps](./CARE_GAPS.md) — Uses these types
- [State Contract](../architecture/STATE_CONTRACT.md) — State shape using these types
