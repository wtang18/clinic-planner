**Structured Patient Problem List**

Product Requirements Document — Final

| Author | Haritha Atluri |
| :---- | :---- |
| **Last Updated** | March 2026 (Final Revision) |
| **Status** | FINAL — Ready to Review |
| **Engineering** |  |
| **Design** | Will Tang |

Product Mock Up: [Here](https://drive.google.com/file/d/1B2fihrwo6gYc4uM93LuOvEyb1vEnm_7d/view?usp=drive_link) 

# **1  Executive Summary**

This PRD defines a structured, standards-aligned patient-level problem list and three related clinical record types that replace the current free-text approach to medical history conditions. It incorporates all gap remediation recommendations for FHIR R4, CCDA, QRDA, USCDI, and ONC certification compliance.

**The document covers four distinct clinical record types, each with its own data source, search mechanism, and workflow:**

* Problem List — The patient's known, ongoing medical conditions, searched via CMS ICD-10-CM with SNOMED cross-mapping.

* Encounter Diagnosis — Conditions documented at a specific visit, searched via CMS ICD-10-CM.

* Health Concerns — Patient goals, risk factors, and care priorities, searched via SNOMED CT clinical findings.

* SDOH — Non-clinical factors affecting health, populated from Gravity Project screening instruments with LOINC-coded assessments and SNOMED/ICD-10 Z-code conditions.

# **2  The Problem**

The current conditions list has four uncoordinated data sources: patient self-selection or free-text, staff entry during visit workflow, CCDA imports from external systems, and provider-added diagnoses via treatment plans. These produce:

* Conditions without standard codes

* Duplicate entries from spelling variants

* No distinction between chronic problems and one-time diagnoses

* No structured way for providers to confirm or reject reported conditions

* Records that cannot be shared in a standards-compliant way

# **3  Four Clinical Record Types**

Each record type serves a distinct clinical purpose and must be managed independently. The table below summarizes key attributes.

| Category | Type | Verification Status | Clinical Status | Search / Data Source |
| :---- | :---- | :---- | :---- | :---- |
| Problem List | Chronic / Ongoing | Unconfirmed → Confirmed / Excluded | Active / Inactive / Recurrence | CMS ICD-10-CM \+ NLM SNOMED map |
| Encounter Dx | Visit-level | N/A (auto-confirmed) | Active at encounter | CMS ICD-10-CM |
| Health Concern | Patient goal / risk | Unconfirmed → Confirmed / Excluded | Active / Resolved | SNOMED CT browser |
| SDOH | Social determinants | Unconfirmed → Confirmed / Excluded | Active / Resolved | Gravity Project screening tools |

## **3.1  Problem List**

The patient's master record of known, persistent medical conditions — actively managed, monitored, or relevant to ongoing care. It is provider-curated and reflects confirmed clinical judgment.

*Examples: Type 2 Diabetes, Hypertension, Asthma, Chronic Low Back Pain, Major Depressive Disorder.*

**Key Characteristics:**

* Patient-level — not tied to a single visit

* Provider-curated — conditions enter as Unconfirmed and must be explicitly confirmed or excluded by a credentialed provider

* Requires a standard code — all confirmed entries must have an ICD-10-CM code with SNOMED CT stored alongside via NLM map

* Has a clinical status — Active, Inactive, or Recurrence

* Has a verification status — Unconfirmed, Confirmed, Excluded, or Entered-in-Error

* Tracks onset date/year, resolved date, severity, body site, and the user/role who entered or modified it

**Search: CMS ICD-10-CM \+ NLM SNOMED Cross-Map**

* Provider types a condition name — system searches current CMS ICD-10-CM code descriptions

* On code selection, system auto-maps to SNOMED CT concept via NLM SNOMED-to-ICD-10-CM reference set

* Both codes stored; coding\_system field tracks which was the original selection

* CCDA imports: if source sends SNOMED, forward-map to ICD-10. If source sends ICD-10, reverse-map to SNOMED.

| Diabetes Example — Duplicate Detection & Code Versioning ICD-10 codes are hierarchical. E11.9 (Type 2 Diabetes, uncomplicated) and E11.65 (Type 2 Diabetes with hyperglycemia) are children of the same parent E11. When a CCDA import arrives with E11.65 and the patient already has E11.9 on record, the system flags this as a potential duplicate and surfaces a side-by-side reconciliation view.Code refinement (same condition, more specific code): Provider updates E11.9 → E11.65. Same record ID, new code captured in audit log. Common when refining a general entry.Disease progression (new clinical finding): Patient with E11.65 develops E11.40 (diabetic neuropathy). These are two distinct problems — new record ID. Provider is prompted: 'Are you updating this condition's code, or adding a new related condition?' |
| :---- |

## **3.2  Encounter Diagnosis**

A condition documented at a specific visit as the reason for that encounter. Linked to an appointment, drives billing, and is automatically confirmed at time of documentation.

*Examples: Acute Sinusitis, Sprained Ankle, URI.*

* Visit-level — tied to a specific appointment

* Auto-confirmed — no secondary verification step

* Billable — directly linked to charges and E\&M coding

* May optionally be promoted to the Problem List — provider is prompted at end of visit: 'Add to Problem List?'

* NOT the same as the Problem List — a UTI encounter Dx does not automatically become a chronic problem

## **3.3  Health Concerns**

A patient goal, risk factor, or care priority that does not yet rise to the level of a confirmed diagnosis. Informs care planning rather than billing.

*Examples: Patient wants to lose weight, pre-diabetes risk, smoking cessation goal.*

* Patient-level — persists across visits

* Can be patient- or provider-entered — less clinical gatekeeping than the problem list

* May or may not have a standard code — free text allowed

* Has verification status (Unconfirmed / Confirmed / Excluded) and clinical status (Active / Resolved)

* Does NOT drive billing

* May graduate to the Problem List if later confirmed as a clinical condition

* Family history entries (Z80–Z84) are routed to FamilyMemberHistory store, not here

*Search: SNOMED CT US Edition subset (Clinical Finding, Situation with Explicit Context, Observable Entity hierarchies). Free-text fallback when no SNOMED match found.*

## **3.4  Social Determinants of Health (SDOH)**

Non-clinical factors that significantly affect patient health — housing, food security, transportation, financial strain, social isolation.

* Patient-level — persists across encounters

* Populated from standardized Gravity Project screening instruments — not ad hoc entry

* Primary code: Gravity Project SNOMED CT. Secondary code: ICD-10-CM Z55–Z65

* SDOH Z-codes cannot be used as primary billing codes

* Displayed in a dedicated section — never mixed with clinical diagnoses or health concerns

| Billing Reminder (display prominently in UI) SDOH Z-codes are ancillary — they must be appended to an appointment alongside a primary diagnosis to affect E\&M billing. They cannot be used as standalone primary codes. |
| :---- |

# **4  What Success Looks Like**

| Measure | Current State | Target State |
| :---- | :---- | :---- |
| Problem list completeness | Incomplete, duplicated, unstructured | Every confirmed condition has ICD-10-CM \+ SNOMED codes |
| Provider trust | Low — providers don't rely on it | Providers confirm or curate at each relevant visit |
| Enc Dx vs. Problem List | No distinction | Clear separation; Enc Dx can promote to problem list |
| Health Concerns | Not captured | Active/Resolved concerns tracked per patient |
| SDOH | Not captured systematically | Flagged from screening, coded, linked to care navigation |
| Interoperability | CCDA/FHIR exports unreliable | FHIR-compliant Condition resources with SNOMED primary |
| Clinical decision support | Limited — unreliable data | Reliable problem list powers DxCode suggestions and CDS |
| QRDA quality reporting | Cannot query by date range | onset\_date \+ resolved\_date enable measure eligibility queries |

# **5  Explicit Non-Goals**

* Not a billing or HCC risk-coding tool — non-billable codes cannot be used directly for value-based contract risk categorization without additional filtering

* SDOH entries alone cannot increase E\&M coding levels

* PGHD automatically populating the problem list (e.g., blood pressure triggering hypertension) is out of scope

* Automatic HCC risk scoring is out of scope, though structured data will support future HCC work

* Family history conditions (Z80–Z84) are routed to FamilyMemberHistory store — defining that module is out of scope

# **6  Feature Requirements**

## **6.1  Problem List**

* Add a condition using CMS ICD-10-CM search; system auto-maps to SNOMED via NLM reference set

* Set Verification Status: Unconfirmed (default) | Confirmed | Excluded | Entered-in-Error

* Set Clinical Status for confirmed conditions: Active | Inactive | Recurrence (can be auto-calculated from audit trail)

* Record onset date (full date) or onset year (patient-reported approximate)

* Record resolved date when a condition moves from Active to Inactive

* Optionally record severity: Mild | Moderate | Severe (SNOMED severity valueset)

* Optionally record body site / laterality using SNOMED body structure codes

* Audit trail: who entered or modified, when, and in what role

* Source tracking: Manual | CCDA Import | Diagnosed (from Enc Dx promotion) | Screening (from SDOH)

* View conditions grouped by ICD-10-CM parent category with specific codes nested

* Cross-setting reconciliation: side-by-side comparison view for conflicting CCDA imports

* Code refinement vs. disease progression: provider prompted when updating a code

## **6.2  Encounter Diagnosis**

* Added during charting/treatment plan step using CMS ICD-10-CM search

* At end of visit, provider is prompted: 'Add to Problem List?' with one-click promotion

* If promoted: enters Problem List as Confirmed/Active with ICD-10-CM and SNOMED pre-populated

* If not promoted: remains visit-level only; does not appear in the ongoing problem list

* All encounter diagnoses remain linked to their appointment for billing regardless of promotion

## **6.3  Health Concerns**

* Patients and staff add during intake or visit via SNOMED CT subset search or free text

* Start as Unconfirmed; provider can confirm, dismiss, or promote to Problem List

* Promotion to Problem List triggers CMS ICD-10-CM code selection

* Clinical status: Active or Resolved

* Who entered it and when is recorded

* Displayed separately from Problem List in all surface areas

## **6.4  SDOH**

* Supports validated screening instruments (AHC-HRSN, PRAPARE) administered during intake or visit

* Screening responses stored as FHIR Observations with LOINC codes (satisfies USCDI v3 SDOH Assessment)

* Positive screening responses auto-generate SDOH Conditions using Gravity Project lookup table

* Auto-generated SDOH Conditions include evidence reference back to triggering Observation

* SDOH Conditions start as Unconfirmed; providers confirm/exclude during reconciliation

* Manual SDOH entry supported as fallback — always starts Unconfirmed, requires justification note

* Screening history visible with date, instrument, administering user, and positive count

# **7  SDOH Assessment-to-Condition Pipeline**

This pipeline satisfies two USCDI v3 elements simultaneously: SDOH Assessment (Element 1\) and SDOH Problems/Health Concerns (Element 2). Every auto-generated Condition links back to the screening Observation that triggered it — the documentation trail is never broken.

## **7.1  Four-Stage Pipeline**

| Stage | Action | FHIR Resource | USCDI v3 Element Satisfied |
| :---- | :---- | :---- | :---- |
| 1\. Screen | Administer AHC-HRSN or PRAPARE | Observation (one per question-answer pair) | SDOH Assessment |
| 2\. Lookup | Map positive answers to SDOH domain \+ codes | Static mapping table (Gravity Project) | (internal mapping step) |
| 3\. Generate | Auto-create SDOH Condition entries | Condition (category \= sdoh) | SDOH Problems / Health Concerns |
| 4\. Reconcile | Provider confirms or excludes each condition | Condition update (verification \+ clinical status) | (provider clinical judgment) |

| FHIR Linkage Each auto-generated Condition includes a Condition.evidence.detail reference to the triggering Observation. Chain: Screening Instrument → FHIR Observation (LOINC codes) → FHIR Condition (SNOMED \+ ICD-10 codes) → Provider Confirmation. This satisfies ONC certification for both SDOH Assessment and SDOH Problems. |
| :---- |

## **7.2  Screening Instruments**

| Instrument | Questions | LOINC Panel | Domains |
| :---- | :---- | :---- | :---- |
| **AHC-HRSN (launch)** | 8 core \+ 2 supplemental | 96777-8 | Food, Housing, Transportation, Utilities, Safety, Social Contact, Stress, Financial Strain |
| PRAPARE | 21 questions | 93025-5 | Personal Characteristics, Family & Home, Money & Resources, Social & Emotional Health |

## **7.3  AHC-HRSN Screening-to-Condition Lookup Table**

Static table built from Gravity Project published spreadsheets. Loaded at deployment, refreshed biannually.

| LOINC Question | Positive Answer(s) | SDOH Domain | SNOMED Code | ICD-10 Z-Code |
| :---- | :---- | :---- | :---- | :---- |
| 88122-7 (Food worry) | LA28397-0 Often true; LA6729-3 Sometimes true | Food Insecurity | 733423003 | Z59.48 |
| 88123-5 (Food lasted) | LA28397-0 Often true; LA6729-3 Sometimes true | Food Insecurity | 733423003 | Z59.48 |
| 71802-3 (Housing) | LA31993-1 No housing | Homelessness | 32911000 | Z59.02 |
| 71802-3 (Housing) | LA31994-9 Worried about housing | Housing Instability | 611000124109 | Z59.811 |
| 96779-4 (Transportation) | LA33-6 Yes | Transportation Insecurity | 551411000124101 | Z59.82 |
| 97027-7 (Utilities) | LA33-6 Yes or LA31996-4 Already off | Utility Insecurity | 1258881006 | Z59.9 |
| 93159-2 (Social contact) | LA27722-0 Less than weekly | Social Isolation | 422587007 | Z60.2 |
| 93038-8 (Stress) | LA13909-9/LA13914-9/LA13915-6 Somewhat+ | Stress | 73595000 | Z73.3 |
| 69858-9 (Financial) | LA31980-8 Very hard; LA31981-6 Somewhat hard | Financial Insecurity | 454061000124102 | Z59.86 |

*Deduplication rule: if multiple questions map to the same domain in one session, only one Condition is generated. All triggering Observations are linked via evidence.detail.*

## **7.4  Three-Tier Documentation Standard**

| Tier | Source Path | Evidence Trail | CMS Quality Measure Credit |
| :---- | :---- | :---- | :---- |
| Tier 1 (Gold) | Screening-derived (AHC-HRSN/PRAPARE) | Observation → Condition with evidence.detail linkage. Full LOINC audit trail. | YES — counts toward screening rate denominators |
| Tier 2 (Acceptable) | Provider-documented during encounter | Encounter note \+ provider clinical judgment. No screening Observation. | NO — does not count as completed screening |
| Tier 3 (Cautious) | Staff-entered (MA/care coordinator) | Free-text justification note. Non-credentialed source. Must start Unconfirmed. | NO — weakest documentation tier |

*The screening path (Tier 1\) should be the primary workflow and default UX path. Manual entry (Tiers 2–3) should be visually secondary.*

## **7.5  SDOH Tab UX**

* Green overview banner: last screening date, instrument used, active SDOH condition count

* Primary action: 'Administer AHC-HRSN Screening' button — styled prominently

* Screening history bar (clickable) showing past sessions with LOINC Observation detail

* Secondary action: '+ Add SDOH Manually' — fallback, not default

* Amber billing reminder banner prominently displayed

* Pipeline diagram at bottom of tab: Screening → Lookup → Condition → Reconcile

# **8  Permissions Model**

Role-based access control is required before launch.

| Role | Add Unconfirmed | Confirm / Exclude | Change Clinical Status | Delete (Error) | Promote Enc Dx |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Patient | Yes (intake) | No | No | No | No |
| MA / Staff | Yes | No | No | Own entries only | No |
| Provider | Yes | Yes | Yes | Yes | Yes |
| System (CCDA) | Yes (auto) | No | No | No | No |
| System (Screening) | Yes (SDOH auto) | No | No | No | No |

*The verifyPatientProblem, excludePatientProblem, and any clinical status change mutations must validate that the requesting user has the Provider role. The audit log must record the user's role at the time of the action.*

# **9  Data Model**

Single patient\_problems table supports all four record types via the category field.

| Field | Type | Null? | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | No (PK) | Stable, durable identifier — does not change on updates |
| patient\_id | UUID | No |  |
| category | enum | No | problem-list-item | encounter-diagnosis | health-concern | sdoh |
| description | string | No | Human-readable condition name |
| verification\_status | enum | No | Confirmed | Unconfirmed | Excluded | Entered-in-Error |
| clinical\_status | enum | Yes | Active | Inactive | Recurrence | Resolved |
| icd\_10 | string | Yes | ICD-10-CM code |
| snomed\_code | string | Yes | SNOMED CT concept ID (primary for FHIR Condition export) |
| coding\_system | enum | No | ICD10 | SNOMED | BOTH — tracks which was the original selection |
| onset\_year | smallint | Yes | Approximate onset (patient-reported) |
| onset\_date | date | Yes | Full onset date when available (CCDA import, diagnosis) |
| resolved\_date | date | Yes | Date condition became Inactive/Resolved. Required for CCDA/QRDA. |
| severity | enum | Yes | mild | moderate | severe (maps to SNOMED valueset) |
| body\_site | string | Yes | SNOMED body structure code |
| body\_site\_display | string | Yes | Human-readable body site name |
| added\_from\_source | enum | No | Manual | Imported | Diagnosed | Screening |
| last\_updated\_by\_user\_id | UUID | No | User who last modified |
| last\_updated\_by\_role | enum | No | patient | staff | provider | system |
| updated\_at | datetime | No |  |

## **9.1  Audit Log Table (patient\_problems\_log)**

Every update results in an insert into patient\_problems\_log with the full state of the record at that point in time, plus the user ID, user role, and timestamp. This provides complete history of every change for each condition.

*The log table has the same fields as patient\_problems plus: created\_by\_user\_id, created\_by\_role, and created\_at. Primary key is (id, created\_at).*

# **10  Standards Compliance**

## **10.1  FHIR R4 Condition Resource Mapping**

| FHIR Field | Source | Notes |
| :---- | :---- | :---- |
| Condition.category | category column | Maps to: problem-list-item | encounter-diagnosis | health-concern |
| Condition.code.coding\[0\] | snomed\_code | System: http://snomed.info/sct (primary) |
| Condition.code.coding\[1\] | icd\_10 | System: http://hl7.org/fhir/sid/icd-10-cm (secondary) |
| Condition.code.text | description | Human-readable display |
| Condition.clinicalStatus | clinical\_status | active | inactive | recurrence | resolved |
| Condition.verificationStatus | verification\_status | confirmed | unconfirmed | refuted | entered-in-error |
| Condition.severity | severity | SNOMED: 255604002 (Mild), 6736007 (Moderate), 24484000 (Severe) |
| Condition.bodySite | body\_site | SNOMED body structure code |
| Condition.onsetDateTime | onset\_date or onset\_year | Full date preferred; else Jan 1 of onset\_year |
| Condition.abatementDateTime | resolved\_date | Populated when status \= Inactive or Resolved |
| Condition.recorder | last\_updated\_by\_user\_id | Reference to Practitioner or Patient resource |

## **10.2  CCDA Export**

Problem List entries map to CCDA Problem Section using Problem Concern Act / Problem Observation templates. SNOMED is the primary code (Observation.value), effectiveTime/low from onset\_date, effectiveTime/high from resolved\_date. Health Concerns map to the Health Concerns Section. SDOH entries map to the Social History Section with Gravity Project value set codes.

## **10.3  QRDA / Quality Reporting**

Quality measures query the problem list by SNOMED or ICD-10 valueset membership and date range. onset\_date and resolved\_date define the active window for each condition. A condition with no resolved\_date is currently active. This enables QRDA Category I exports that correctly populate measure denominators and numerators.

## **10.4  USCDI / ONC Certification**

USCDI v3+ requires Problem, Health Concern, and SDOH data elements. This PRD satisfies all three through the four record types with their respective code systems. The patient-facing FHIR API (21st Century Cures Act) must expose only Confirmed conditions as read-only Condition resources scoped to the authenticated patient. Unconfirmed and Excluded entries are hidden.

# **11  User Experience Overview**

## **11.1  Surface Areas**

| Surface Area | Detail | For V1 | For V2 |
| :---- | :---- | :---- | :---- |
| Problem List Tab | Read \+ write | Yes |  |
| Visit Workflow — Triage | Review \-\> write | No | Yes |
| Patient Sidebar | Active only | Yes |  |
| PDF / Shared History | Active \+ Inactive | No | Yes |
| CCDA Export (FHIR) | Confirmed | Yes |  |
| Patient App | Active |  | Yes |

| Surface Area | Problem List | Health Concerns | SDOH | Encounter Dx |
| :---- | :---- | :---- | :---- | :---- |
| Problem List Tab | ✓  | ✓ | ✓  | ✓ |
| Visit Workflow — Triage | ✓ Review | ✓ Shown | ✓ Shown | — |
| Patient Sidebar | ✓ Active only | — | — | — |
| PDF / Shared History | ✓ Active \+ Inactive | ✓ | ✓ | — |
| CCDA Export (FHIR) | ✓ Confirmed | ✓ Coded | ✓ Z-codes | ✓ Per encounter |

## **11.2  Patient & Staff (Intake / Triage)**

* Patients select from pre-populated list of common chronic conditions — no free-text for Problem List entries

* Patients report Health Concerns via free text or structured options

* Patients complete SDOH screening questionnaire (PRAPARE or AHC-HRSN) during intake

* Staff entries default to Unconfirmed with name and timestamp recorded

## **11.3  Provider (Evaluation / Reconciliation)**

* Provider sees reconciliation view during Evaluation step — all Unconfirmed conditions, Health Concerns, and SDOH surfaced

* For each unconfirmed condition: Confirm (set Active/Inactive), Exclude, or update ICD-10-CM code to be more specific

* For Encounter Diagnoses: after charting, prompted to optionally promote to Problem List

* For CCDA imports with conflicts: side-by-side comparison view

* Problem List grouped by parent ICD-10-CM category. Health Concerns in a separate tab. SDOH in a dedicated section.

# **12  Special Clinical Cases**

## **12.1  Family History**

When a patient reports 'family history of heart disease,' this is NOT a patient-level condition. The system routes it to a FamilyMemberHistory store (ICD-10 Z80–Z84). If intent is ambiguous, prompt: 'Is this a condition you have, or one that runs in your family?' Family history entries may appear as Health Concerns for care planning but are never exported as patient-level Conditions in CCDA.

## **12.2  Pregnancy and Temporary Clinical States**

* Pregnancy: Add as Problem List item (SNOMED 77386006 or ICD-10 Z33.1), Active. When resolved, set Inactive with resolved\_date.

* Post-surgical status (Z96.x, Z98.x): Problem List item, Active. Affects drug interactions and imaging decisions.

* History-of codes (Z85–Z87): Problem List item, Active — represents ongoing clinical relevance.

## **12.3  Cross-Setting Reconciliation (CCDA Conflicts)**

**Three-step model for handling conflicting CCDA imports:**

* Step 1 — Duplicate detection: Match on SNOMED code (preferred) or ICD-10 code (fallback). Flag if codes are in the same ICD-10 family (e.g., E11.9 and E11.65 are both Type 2 Diabetes).

* Step 2 — Conflict surfacing: Side-by-side view. 'External record says: Type 2 Diabetes, controlled (E11.65). Your current list says: Type 2 Diabetes, uncontrolled (E11.9).' Provider chooses which to keep or updates the entry.

* Step 3 — New entries: Imported problems with no match are added as Unconfirmed and surfaced in the reconciliation queue at the next visit.

# **13  Migration & Rollout Plan**

**Policy for existing patient data:** No automated migration will be performed for patients already in the system. The two legacy data sources are handled as follows:

* **Encounter diagnoses (historical):** All past encounter diagnoses from a patient’s chart history will be surfaced in the new problem list UI as Unconfirmed. No conditions will be auto-confirmed. The provider reviews them at their discretion during any future visit and confirms or excludes what they consider relevant to the ongoing problem list.

* **Medical history schema conditions (legacy free-text):** Conditions stored in the existing medical history schema (unstructured, free-text, no ICD codes) will be left as-is. They will not be migrated into the new structured problem list service. Providers will organically build the structured problem list forward from the point of go-live.

*Rationale: Automating migration of legacy free-text conditions would risk introducing unverified, poorly coded data into a system built on structured standards. Surfacing historical encounter diagnoses as Unconfirmed gives providers visibility without bypassing the verification workflow that is central to this design.*

