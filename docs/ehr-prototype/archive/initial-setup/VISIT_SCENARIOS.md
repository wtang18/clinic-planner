# Visit Scenarios

Detailed walkthroughs of representative clinical encounters used for testing and demonstration.

---

## Scenario A: Urgent Care — Cough

### Patient Profile

```typescript
const ucCoughPatient: PatientContext = {
  id: 'pt-uc-001',
  mrn: '12345678',
  demographics: {
    firstName: 'Lauren',
    lastName: 'Svendsen',
    dateOfBirth: new Date('1983-06-15'),
    age: 42,
    gender: 'female',
    pronouns: 'she/her',
  },
  insurance: {
    primary: {
      payerId: 'SELF',
      payerName: 'Self Pay',
      memberId: 'N/A',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active' },
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active' },
      { description: 'Hypothyroidism', icdCode: 'E03.9', status: 'active' },
      { description: 'Prediabetes', icdCode: 'R73.03', status: 'active' },
      { description: 'High cholesterol', icdCode: 'E78.00', status: 'active' },
      { description: 'Family history of breast cancer', icdCode: 'Z80.3', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
      { name: 'Tylenol Extra Strength', dosage: '500mg', frequency: 'PRN', status: 'active' },
    ],
    allergies: [
      { allergen: 'Penicillin', reaction: 'Rash', severity: 'mild' },
      { allergen: 'Sulfa', reaction: 'Anaphylaxis', severity: 'severe' },
    ],
    recentEncounters: [
      { 
        date: new Date('2024-02-27'), 
        type: 'Urgent Care', 
        chiefComplaint: 'Pinky finger injury',
        provider: 'Dr. Smith',
      },
    ],
  },
};
```

### Visit Context

```typescript
const ucCoughVisit: VisitMeta = {
  chiefComplaint: 'Cough x 5 days, worse at night',
  visitReason: 'Urgent care evaluation',
  scheduledDuration: 20,
  serviceType: 'Self Pay',
};
```

### Timeline

| Time | Actor | Action | State Changes |
|------|-------|--------|---------------|
| 0:00 | MA | Opens encounter | `ENCOUNTER_OPENED` |
| 0:01 | MA | Records vitals: BP 128/82, HR 78, Temp 98.6, SpO2 98% | `ITEM_ADDED` (vitals) |
| 0:02 | MA | Starts transcription | `TRANSCRIPTION_STARTED` |
| 0:02 | Transcription | "Patient reports cough for 5 days, worse at night" | `TRANSCRIPTION_SEGMENT_RECEIVED`, `SUGGESTION_RECEIVED` (chief complaint) |
| 0:03 | MA | Accepts chief complaint suggestion | `SUGGESTION_ACCEPTED`, `ITEM_ADDED` (chief-complaint) |
| 0:04 | Transcription | "She's currently taking Lisinopril 10mg daily" | `SUGGESTION_RECEIVED` (medication - reported) |
| 0:04 | MA | Confirms Lisinopril | `SUGGESTION_ACCEPTED`, `ITEM_ADDED` (medication) |
| 0:05 | MA | Records "No known drug allergies" → Confirms existing allergies | `ITEM_ADDED` (allergy - NKDA false, confirms Penicillin, Sulfa) |
| 0:06 | MA | Handoff to Provider | `HANDOFF_INITIATED`, `HANDOFF_ACCEPTED` |
| 0:08 | Provider | Physical exam - Lungs | `ITEM_ADDED` (physical-exam: "Mild wheezing, no rales") |
| 0:09 | AI | Suggests "Acute bronchitis J20.9" based on context | `SUGGESTION_RECEIVED` (diagnosis) |
| 0:10 | Provider | Adds Benzonatate 100mg via OmniAdd | `ITEM_ADDED` (medication) |
| 0:10 | AI | Background: Dx association task starts | `TASK_CREATED` (dx-association) |
| 0:12 | AI | Task complete: suggests Dx linkage | `TASK_COMPLETED` |
| 0:13 | Provider | Approves Dx linkage to Acute bronchitis | `TASK_APPROVED`, `ITEM_DX_LINKED` |
| 0:14 | Provider | Orders Rapid COVID-19 Antigen (Quest) | `ITEM_ADDED` (lab) |
| 0:14 | Provider | Orders Rapid Influenza A/B (In-House) | `ITEM_ADDED` (lab) |
| 0:15 | AI | Background: Labs ready to send | `TASK_CREATED` × 2 (lab-send), `TASK_COMPLETED` |
| 0:16 | Provider | Batch sends labs | `ITEMS_BATCH_SENT` |
| 0:20 | System | Flu rapid result: Negative | `ITEM_RESULT_RECEIVED` |
| 0:22 | System | COVID rapid result: Negative | `ITEM_RESULT_RECEIVED` |
| 0:24 | Provider | E-prescribes Benzonatate | `ITEM_SENT` (e-prescribe) |
| 0:25 | Provider | Adds follow-up instructions | `ITEM_ADDED` (instruction) |
| 0:26 | Provider | Switches to Review mode | `MODE_CHANGED` |
| 0:26 | AI | Generates visit note draft | `TASK_CREATED` (note-generation), `TASK_COMPLETED`, `ITEM_ADDED` (note) |
| 0:28 | Provider | Reviews and approves note | `ITEM_UPDATED` (note), requiresReview: false |
| 0:30 | Provider | Signs encounter | Encounter status → 'signed' |

### Expected Final State

**Items (12):**
1. Vitals (confirmed)
2. Chief complaint: "Cough x 5 days, worse at night" (confirmed)
3. Reported medication: Lisinopril 10mg daily (confirmed)
4. Allergy: Penicillin - mild (confirmed)
5. Allergy: Sulfa - severe (confirmed)
6. Physical exam: Respiratory - mild wheezing (confirmed)
7. Diagnosis: Acute bronchitis J20.9 (confirmed)
8. Medication: Benzonatate 100mg TID PRN (ordered)
9. Lab: Rapid COVID-19 Antigen (completed - negative)
10. Lab: Rapid Influenza A/B (completed - negative)
11. Instruction: Follow-up as needed (confirmed)
12. Visit note (confirmed)

**Care Gaps Addressed:** None applicable for this acute visit

---

## Scenario B: Primary Care — Diabetes Follow-up

### Patient Profile

```typescript
const pcDiabetesPatient: PatientContext = {
  id: 'pt-pc-001',
  mrn: '87654321',
  demographics: {
    firstName: 'Robert',
    lastName: 'Martinez',
    dateOfBirth: new Date('1967-03-22'),
    age: 58,
    gender: 'male',
  },
  insurance: {
    primary: {
      payerId: 'BCBS',
      payerName: 'Blue Cross Blue Shield',
      memberId: 'XYZ123456',
      groupNumber: 'GRP001',
      planType: 'PPO',
    },
  },
  clinicalSummary: {
    problemList: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', status: 'active', onsetDate: new Date('2018-05-01') },
      { description: 'Essential hypertension', icdCode: 'I10', status: 'active', onsetDate: new Date('2015-01-15') },
      { description: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
      { description: 'Obesity', icdCode: 'E66.9', status: 'active' },
    ],
    medications: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'BID', status: 'active' },
      { name: 'Lisinopril', dosage: '20mg', frequency: 'daily', status: 'active' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'daily', status: 'active' },
    ],
    allergies: [],
    recentEncounters: [
      { 
        date: new Date('2024-07-15'), 
        type: 'Follow-up', 
        chiefComplaint: 'Diabetes follow-up',
        provider: 'Dr. Johnson',
      },
    ],
  },
};
```

### Visit Context

```typescript
const pcDiabetesVisit: VisitMeta = {
  chiefComplaint: 'Quarterly diabetes follow-up',
  visitReason: 'Chronic disease management',
  scheduledDuration: 30,
  serviceType: 'Insurance',
};
```

### Care Gaps (Pre-populated)

```typescript
const pcDiabetesCareGaps: CareGapInstance[] = [
  {
    id: 'gap-001',
    definitionId: 'dm-a1c',
    patientId: 'pt-pc-001',
    status: 'open',
    openedAt: new Date('2024-10-01'),
    dueBy: new Date('2024-12-31'),
    _display: {
      name: 'A1C Monitoring',
      category: 'diabetes',
      priority: 'important',
      actionLabel: 'Order A1C',
      dueLabel: 'Due in 45 days',
    },
  },
  {
    id: 'gap-002',
    definitionId: 'dm-eye-exam',
    patientId: 'pt-pc-001',
    status: 'open',
    openedAt: new Date('2024-01-01'),
    dueBy: new Date('2024-12-31'),
    _display: {
      name: 'Diabetic Eye Exam',
      category: 'diabetes',
      priority: 'important',
      actionLabel: 'Order referral',
      dueLabel: 'Due this year',
    },
  },
  {
    id: 'gap-003',
    definitionId: 'ccs-colorectal',
    patientId: 'pt-pc-001',
    status: 'open',
    openedAt: new Date('2024-01-01'),
    dueBy: new Date('2024-12-31'),
    _display: {
      name: 'Colorectal Cancer Screening',
      category: 'cancer-screening',
      priority: 'important',
      actionLabel: 'Order screening',
      dueLabel: 'Due this year',
    },
  },
];
```

### Timeline

| Time | Actor | Action | State Changes |
|------|-------|--------|---------------|
| 0:00 | System | Opens encounter, loads care gaps | `ENCOUNTER_OPENED`, `CARE_GAPS_REFRESHED` |
| 0:01 | MA | Records vitals: BP 132/84, HR 72, Weight 205 lbs | `ITEM_ADDED` (vitals) |
| 0:02 | MA | Reviews medication list | `ITEM_ADDED` × 3 (reported medications) |
| 0:03 | Transcription | "Patient mentions tingling in feet" | `TRANSCRIPTION_SEGMENT_RECEIVED` |
| 0:04 | MA | Adds to HPI: "New complaint of tingling in bilateral feet x 2 weeks" | `ITEM_ADDED` (hpi) |
| 0:05 | AI | Suggests peripheral neuropathy screening | `SUGGESTION_RECEIVED` (care-gap-action) |
| 0:06 | MA | Handoff to Provider | `HANDOFF_INITIATED`, `HANDOFF_ACCEPTED` |
| 0:08 | Provider | Reviews recent A1C: 7.8% (from 3 months ago) | Displayed from patient context |
| 0:10 | Provider | Performs foot exam | `ITEM_ADDED` (physical-exam: "Decreased sensation bilateral feet, monofilament test abnormal") |
| 0:12 | Provider | Adds diagnosis: Diabetic peripheral neuropathy | `ITEM_ADDED` (diagnosis: E11.42) |
| 0:14 | Provider | Increases Metformin to 1000mg BID | `ITEM_ADDED` (medication - change) |
| 0:15 | Provider | Orders A1C | `ITEM_ADDED` (lab) |
| 0:15 | AI | Care gap monitor: A1C ordered | `CARE_GAP_ADDRESSED` (gap-001, pending) |
| 0:16 | Provider | Orders lipid panel | `ITEM_ADDED` (lab) |
| 0:17 | Provider | Orders diabetic eye exam referral | `ITEM_ADDED` (referral) |
| 0:17 | AI | Care gap monitor: Eye exam referral | `CARE_GAP_ADDRESSED` (gap-002, pending) |
| 0:18 | AI | Suggests gabapentin for neuropathy | `SUGGESTION_RECEIVED` (medication) |
| 0:19 | Provider | Accepts gabapentin suggestion, modifies dose | `SUGGESTION_ACCEPTED_WITH_CHANGES`, `ITEM_ADDED` (medication) |
| 0:20 | Provider | Discusses colonoscopy, patient declines | `CARE_GAP_EXCLUDED` (gap-003, patient-declined) |
| 0:22 | AI | Background: Dx linkages complete | `TASK_COMPLETED` × multiple |
| 0:23 | Provider | Reviews Task Pane, approves all | `TASKS_BATCH_APPROVED` |
| 0:24 | Provider | Sends lab orders | `ITEMS_BATCH_SENT` |
| 0:25 | Provider | E-prescribes medications | `ITEM_SENT` × 2 |
| 0:26 | Provider | Adds follow-up: "Return in 3 months" | `ITEM_ADDED` (instruction) |
| 0:28 | Provider | Switches to Review mode | `MODE_CHANGED` |
| 0:28 | AI | Generates visit note | `ITEM_ADDED` (note, AI-generated) |
| 0:32 | Provider | Reviews, edits note | `ITEM_UPDATED` (note) |
| 0:35 | Provider | Signs encounter | Encounter status → 'signed' |

### Expected Final State

**Items (15+):**
1. Vitals (confirmed)
2. Reported medications: Metformin, Lisinopril, Atorvastatin (confirmed)
3. HPI: Tingling in feet (confirmed)
4. Physical exam: Foot exam findings (confirmed)
5. Diagnosis: Diabetic peripheral neuropathy E11.42 (confirmed)
6. Medication change: Metformin 1000mg BID (ordered)
7. New medication: Gabapentin 300mg TID (ordered)
8. Lab: A1C (ordered)
9. Lab: Lipid panel (ordered)
10. Referral: Diabetic eye exam (sent)
11. Instruction: Follow-up 3 months (confirmed)
12. Visit note (confirmed)

**Care Gaps:**
- gap-001 (A1C): `pending` — lab ordered, awaiting result
- gap-002 (Eye exam): `pending` — referral sent
- gap-003 (Colorectal): `excluded` — patient declined

---

## Mock Data Generation

### Generating Test Patients

```typescript
function generateMockPatient(template: 'uc-cough' | 'pc-diabetes'): PatientContext {
  switch (template) {
    case 'uc-cough':
      return { ...ucCoughPatient, id: `pt-${uuid()}` };
    case 'pc-diabetes':
      return { ...pcDiabetesPatient, id: `pt-${uuid()}` };
  }
}
```

### Generating Timed Events

```typescript
interface ScenarioEvent {
  delay: number;           // ms from start
  action: EncounterAction;
  description: string;
}

function getScenarioEvents(scenario: 'uc-cough' | 'pc-diabetes'): ScenarioEvent[] {
  // Returns array of timed events for scenario runner
}
```

---

## Testing Checklist

### Scenario A: UC Cough

- [ ] Vitals entry works
- [ ] Transcription generates suggestions
- [ ] Suggestion acceptance creates items
- [ ] Handoff changes current owner
- [ ] OmniAdd creates medications
- [ ] Dx association task runs
- [ ] Lab ordering works
- [ ] Lab results populate
- [ ] E-prescribe sends
- [ ] Note generation runs
- [ ] Sign-off completes

### Scenario B: PC Diabetes

- [ ] Care gaps load on encounter open
- [ ] Medication reconciliation works
- [ ] HPI from transcription
- [ ] Physical exam structured entry
- [ ] New diagnosis with linkage
- [ ] Medication changes tracked
- [ ] Care gap status updates
- [ ] Care gap exclusion works
- [ ] Batch operations work
- [ ] Referral creation works
- [ ] Note generation includes all content

---

## Related Documents

- [State Contract](../architecture/STATE_CONTRACT.md) — Actions used in scenarios
- [Chart Items](../models/CHART_ITEMS.md) — Item types created
- [Care Gaps](../models/CARE_GAPS.md) — Gap lifecycle
- [Mock Data](./MOCK_DATA.md) — Data generation utilities
