# Quick Charting — Category Map (All 15 Categories)

Spec-level mapping of each chart item category: interaction variant, OmniAdd flow, detail fields, processing states, AI behavior, details pane contents, and card display.

---

## Structured Search Categories

Primary input via OmniAdd. AI contributes suggestions (complete items), not drafts.

---

### 1. Medication (Rx)

**Shortcut:** M | **Variant:** Structured search | **Priority:** Primary

**OmniAdd Flow:**
1. Quick-pick chips for common meds based on CC/context (cough → Benzonatate, Dextromethorphan, Guaifenesin, Codeine) + "Other" (search)
2. Detail fields pre-populated with smart defaults
3. Add → card + processing entry

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Dosage | Chip select + custom | Common dosages as chips (100mg, 200mg), "Other" for custom |
| Route | Chip select | PO, IM, IV, Topical, etc. Default based on drug |
| Frequency | Chip select + custom | Daily, BID, TID, QID, PRN, etc. |
| Instructions (Sig) | Text + auto-generate | Auto from dosage+route+frequency |
| Quantity | Number | Auto-calculate from frequency × duration |
| Refills | Number (0-12) | Default: 0 for acute, 3 for chronic |
| Duration | Chip select + custom | 5, 7, 10, 14, 30, 90 days |
| Pharmacy | Search/select | Patient's preferred, recently used |
| DAW | Toggle | Default off |

**Processing States:**
1. ⚠ Needs Dx association
2. ⚠ Needs pharmacy (if not defaulted)
3. ○ Ready to send/dispense
4. ✓ E-prescribed / Dispensed
5. ⚠ Prior auth required (if flagged)

**Operational Batch:** In-House (dispense) or External (e-prescribe, grouped by pharmacy)

**Safety Checks:** Allergy cross-reference, drug-drug interaction, duplicate therapy, dosage range

**Details Pane:** All fields editable + actions (Associate Dx, Select Pharmacy, Send/Dispense, Remove) + activity log

**Card Display:** `Benzonatate 100mg PO TID PRN` | Last edited by Dr. Anderson · 10:15a
**Quick inline edit:** Tap dosage or frequency chip on card to change

---

### 2. Lab

**Shortcut:** L | **Variant:** Structured search | **Priority:** Primary

**OmniAdd Flow:**
1. Quick-picks based on CC (cough → COVID-19, Flu A/B, Strep, CBC) + "Other"
2. Detail fields
3. Add → card + processing entry

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Collection method | Chip select | In-House, Send Out |
| Reference lab | Search/select | Quest, LabCorp, etc. (shown if Send Out) |
| Priority | Chip select | Routine, Urgent, STAT |
| Fasting required | Toggle | Default based on lab type |
| Special instructions | Text | Optional |

**Processing States:**
1. ⚠ Needs Dx association
2. ○ Requisition ready
3. ✓ Requisition sent
4. ○ Sample collected (in-house)
5. ○ Results documented
6. ✓ Complete

**Operational Batch:** In-House or Send-Out grouped by vendor (Quest, LabCorp, etc.)

**Details Pane:** All fields + actions (Associate Dx, Send Requisition, Mark Sample Collected, Enter Results, Remove) + activity log

**Card Display:** `Rapid COVID-19 Antigen` | `Lab · In-House · Sample Collected` | Last edited by MA Sarah K. · 10:20a

---

### 3. Diagnosis (Dx)

**Shortcut:** D | **Variant:** Structured search | **Priority:** Primary

**OmniAdd Flow:**
1. Quick-picks (cough → Acute bronchitis, URI, Cough unspecified, Pneumonia) + "Other"
2. Detail fields
3. Add → card + processing entry

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| ICD-10 code | Auto-populated | Shown for reference, editable for specificity |
| Specificity | Chip select | Prompt if more specific children exist |
| Designation | Chip select | Primary, Secondary. First Dx defaults to Primary |
| Onset | Chip select + date | New, Existing, Date of onset |
| Clinical status | Chip select | Active, Resolved, Recurrence |
| Associated orders | Auto-linked | Orders associated with this Dx |

**Processing States:**
1. ⚠ Specificity available
2. ○ Needs order association (if orders without Dx exist)
3. ✓ Complete

**Details Pane:** All fields + actions (Change Specificity, Associate Orders, Set Primary/Secondary, Remove) + activity log

**Card Display:** `Acute bronchitis (J20.9)` | `Dx · Primary` | Last edited by Dr. Anderson · 10:12a

---

### 4. Imaging

**Shortcut:** I | **Variant:** Structured search | **Priority:** Primary

**OmniAdd Flow:**
1. Quick-picks (cough → Chest X-ray PA/Lateral, Chest CT) + "Other"
2. Detail fields
3. Add → card + processing entry

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Modality | Auto | X-ray, CT, MRI, Ultrasound, etc. |
| Body part/region | Auto or select | Based on selection |
| Views | Chip select | PA, Lateral, AP, etc. |
| Contrast | Toggle + type | With/without |
| Priority | Chip select | Routine, Urgent, STAT |
| Clinical indication | Text + auto | Pre-fill from CC/Dx |
| Facility | Search/select | In-house, external |
| Special instructions | Text | Pregnancy status, claustrophobia, etc. |

**Processing States:**
1. ⚠ Needs Dx association
2. ⚠ Needs clinical indication
3. ○ Order ready → ✓ Order sent
4. ○ Scheduled → ○ Results documented → ✓ Complete

**Operational Batch:** Imaging (in-house vs. external by facility)

**Card Display:** `Chest X-ray PA/Lateral` | `Imaging · In-House · Order Sent`

---

### 5. Procedure (Proc)

**Shortcut:** P | **Variant:** Structured search | **Priority:** Primary

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| CPT code | Auto | Shown for reference |
| Laterality | Chip select | Left, Right, Bilateral, N/A |
| Site/location | Text + chips | Body site |
| Anesthesia | Chip select | None, Local, Topical |
| Consent obtained | Toggle | Required before procedure |
| Supplies used | Multi-select | From supply catalog |
| Complications | Text | Document any |
| Findings | Text | Procedure findings |

**Processing States:**
1. ⚠ Needs Dx → 2. ⚠ Consent required → 3. ○ Ready → 4. ○ Document findings → 5. ✓ Complete

**Card Display:** `Rapid Strep Test (87880)` | `Procedure · In-House · Completed`

---

### 6. Allergy

**Shortcut:** — | **Variant:** Structured search | **Priority:** Secondary

**OmniAdd Flow:**
1. "NKDA" one-tap shortcut + search for specific allergens
2. Detail fields
3. Add

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Allergen type | Chip select | Drug, Food, Environmental, Other |
| Reaction | Multi-select chips | Rash, Hives, Anaphylaxis, GI upset, Swelling, etc. |
| Severity | Chip select | Mild, Moderate, Severe |
| Status | Chip select | Active, Inactive, Resolved |
| Onset date | Date picker | Approximate or exact |
| Notes | Text | Additional context |

**Processing States:**
1. ⚠ Severity confirmation needed → 2. ✓ Confirmed

**Card Display:** `NKDA (no known drug allergies)` | `Allergy · Confirmed`

---

### 7. Referral

**Shortcut:** — | **Variant:** Structured search | **Priority:** Secondary

**Detail Fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Specialty | Auto | From selection |
| Provider/facility | Search/select | Optional |
| Priority | Chip select | Routine, Urgent, Emergent |
| Reason | Text + auto | Pre-fill from CC/Dx |
| Clinical info to include | Multi-select | Labs, imaging, notes to attach |
| Prior auth required | Toggle + auto | Based on payer rules |
| Patient preference | Text | Location, scheduling constraints |

**Processing States:**
1. ⚠ Needs Dx → 2. ⚠ Prior auth → 3. ○ Ready → 4. ✓ Sent → 5. ○ Scheduled → 6. ○ Report received → 7. ✓ Loop closed

**Operational Batch:** Referrals

**Card Display:** `Referral: Pulmonology` | `Referral · Urgent · Sent`

---

## Narrative Categories (AI-Primary)

Primary input via AI draft from ambient recording. OmniAdd is the secondary/manual path.

---

### 8. Chief Complaint (CC)

**Variant:** Narrative (AI-primary) | **Priority:** Secondary in OmniAdd (but often first item in chart)

**Typical lifecycle:**
1. MA documents from intake: "Cough x 5 days"
2. AI refines from first 30-60s of provider-patient conversation
3. "Updated CC" appears in rail → provider accepts or edits in pane

**OmniAdd flow (manual):** Text input + common CC chips (Cough, Sore throat, Back pain, Follow-up) + optional duration/severity fields

**Details Pane:** Full text editor + optional structured fields (duration, onset, severity) + activity log

**Card Display:** `Cough x 5 days, worse at night` | `Chief Complaint` | Last edited by Dr. Anderson · 10:08a

---

### 9. HPI (History of Present Illness)

**Variant:** Narrative (AI-primary) | **Priority:** Secondary in OmniAdd

**Typical lifecycle:**
1. MA documents basic history during intake
2. AI generates enriched HPI from provider's conversation (2-5 min into encounter)
3. "Updated HPI" in rail → accept or edit in pane

**Typical AI draft (~60-80 words):**
```
42-year-old female presents with cough x 5 days. Cough is non-productive,
worse at night and when lying down. Denies fever, chills, shortness of breath.
Reports mild nasal congestion and post-nasal drip. No sick contacts. Tried
OTC cough suppressant without relief. No history of asthma or COPD. Non-smoker.
```

**OmniAdd flow (manual):** Text area with HPI element prompts (Location, Quality, Severity, Duration, Timing, Context, Modifying factors, Associated symptoms)

**Details Pane:** Full text editor + HPI element structure + activity log

**Card Display:** `Patient reports cough x 5 days, non-productive...` | `HPI` | Last edited by AI · Accepted by Dr. Anderson · 10:12a

---

### 10. ROS (Review of Systems)

**Variant:** Narrative (AI-primary) with structured aides | **Priority:** Secondary in OmniAdd

**Typical lifecycle:**
1. AI populates from patient conversation (systems discussed)
2. "ROS Draft" in rail → edit in pane shows structured system-toggle view

**Edit pane (structured view):** System-by-system toggle grid — 13 systems (Constitutional, HEENT, Respiratory, CV, GI, GU, MSK, Neuro, Psych, Skin, Endocrine, Heme/Lymph, Allergic/Immunologic). Each system: Positive / Negative / Not Reviewed. Positive systems expand for symptom detail. "All negative except..." template.

**OmniAdd flow (manual):** Same structured toggle view

**Processing:** Optional completeness check (fewer than 10 systems reviewed)

**Card Display:** `ROS: 14 systems reviewed, positive for respiratory (cough, congestion)` | `ROS`

---

### 11. Physical Exam (PE)

**Variant:** Narrative (AI-primary) with structured aides | **Priority:** Secondary in OmniAdd

**Typical lifecycle:**
1. AI drafts from provider's verbal exam narration ("Lungs: mild wheezing bilaterally")
2. "PE Draft" in rail → edit in pane shows structured system-section view

**Edit pane (structured view):** System-by-system sections. Each system: Normal / Abnormal toggle. Normal auto-inserts standard text (editable). Abnormal shows common finding snippets + free text.

**Typical AI draft (~80-120 words):**
```
General: Alert, well-appearing, no acute distress
HEENT: Normocephalic, atraumatic. Oropharynx clear. Mild nasal mucosal edema.
Lungs: Mild wheezing bilaterally, no rales or consolidation. Good air movement.
CV: RRR, no murmurs, gallops, or rubs
Abdomen: Soft, non-tender, non-distended
```

**Card Display:** `Lungs: Mild wheezing, no rales or consolidation` | `Physical Exam`

---

### 12. Plan

**Variant:** Narrative (AI-primary) | **Priority:** Secondary in OmniAdd

**Typical lifecycle:**
1. AI generates after orders are placed, summarizing treatment decisions
2. "Plan Draft" in rail → accept or edit in pane

**Typical AI draft (~100-200 words):** Problem-based plan with numbered sections per active diagnosis, referencing ordered Rx/Labs/Imaging.

**OmniAdd flow (manual):** Text area with problem-based template

**Card Display:** `Prescribe Benzonatate for cough suppression. Order COVID/Flu...` | `Plan`

---

### 13. Patient Instruction

**Variant:** Narrative (AI-primary) | **Priority:** Secondary in OmniAdd

**Typical lifecycle:**
1. AI generates condition-specific instructions from Dx + orders
2. "Instructions Draft" in rail → accept or edit in pane

**Additional detail fields:**

| Field | Type | Behavior |
|-------|------|----------|
| Delivery method | Chip select | Print, Patient portal, Both |
| Language | Select | English, Spanish, etc. |

**Processing States:** ○ Ready to send/print → ✓ Sent to portal / Printed

**Card Display:** `Bronchitis home care instructions` | `Instruction · Sent to Portal`

---

## Narrative Category (Manual Only)

---

### 14. Note

**Variant:** Narrative (manual) | **Priority:** Secondary in OmniAdd

The only purely manual narrative category. Used for ad hoc content: clinical reasoning, coordination notes, addenda, caveats. Not AI-generated because AI wouldn't know to create this content.

**OmniAdd flow:** Text area + optional note type selector (Clinical, Coordination, Addendum, Other)

**Card Display:** `Patient declines flu vaccine. Will discuss at follow-up.` | `Note · Clinical`

---

## Structured Data Entry Category

---

### 15. Vitals

**Variant:** Structured data entry | **Priority:** Secondary in OmniAdd (typically MA-entered)

**Fields:**

| Field | Type | Unit | Normal Range |
|-------|------|------|-------------|
| Systolic BP | Number | mmHg | 90-140 |
| Diastolic BP | Number | mmHg | 60-90 |
| Heart Rate | Number | bpm | 60-100 |
| Temperature | Number | °F/°C | 97.0-99.5°F |
| Respiratory Rate | Number | breaths/min | 12-20 |
| SpO2 | Number | % | 95-100 |
| Weight | Number | lbs/kg | — |
| Height | Number | ft-in/cm | — |
| BMI | Calculated | kg/m² | 18.5-24.9 |
| Pain Scale | Number (0-10) | — | — |

**Features:** Out-of-range highlighting, BMI auto-calc, trend indicators vs. last recorded, device integration (mock), recheck option.

**Processing:** Optional out-of-range acknowledgment

**Card Display:** `BP 128/82 · HR 78 · Temp 98.6°F · SpO2 97% · RR 16` | `Vitals`

---

## Summary Table

| # | Category | Variant | Priority | Shortcut | Primary Input | Has Processing | Operational Batch |
|---|----------|---------|----------|----------|--------------|----------------|-------------------|
| 1 | Medication | Structured search | Primary | M | OmniAdd | ✓ (5 states) | Rx: In-House / External by pharmacy |
| 2 | Lab | Structured search | Primary | L | OmniAdd | ✓ (6 states) | Labs: In-House / Send-out by vendor |
| 3 | Diagnosis | Structured search | Primary | D | OmniAdd | ✓ (3 states) | — |
| 4 | Imaging | Structured search | Primary | I | OmniAdd | ✓ (7 states) | Imaging: In-House / External |
| 5 | Procedure | Structured search | Primary | P | OmniAdd | ✓ (5 states) | — |
| 6 | Allergy | Structured search | Secondary | — | OmniAdd | ✓ (2 states) | — |
| 7 | Referral | Structured search | Secondary | — | OmniAdd | ✓ (7 states) | Referrals |
| 8 | Chief Complaint | Narrative (AI) | Secondary | — | AI draft | — | — |
| 9 | HPI | Narrative (AI) | Secondary | — | AI draft | — | — |
| 10 | ROS | Narrative (AI) | Secondary | — | AI draft | Optional | — |
| 11 | Physical Exam | Narrative (AI) | Secondary | — | AI draft | Optional | — |
| 12 | Plan | Narrative (AI) | Secondary | — | AI draft | — | — |
| 13 | Instruction | Narrative (AI) | Secondary | — | AI draft | ✓ (2 states) | — |
| 14 | Note | Narrative (manual) | Secondary | — | OmniAdd | — | — |
| 15 | Vitals | Data entry | Secondary | — | MA entry / OmniAdd | Optional | — |
