# UC Cough — Demo Walkthrough

Urgent care visit for a 42-year-old with a 5-day cough. This is the **primary demo scenario** — it exercises ambient recording, transcript-synced suggestions, the processing rail, and task lifecycle.

## Setup

**Encounter ID**: `uc-cough` (or `demo-uc`)
**Patient**: Lauren Svendsen, 42F, self-pay
**Visit type**: Urgent Care, 20 min

### What's Pre-Seeded on Load

The encounter loader simulates an MA handoff. Before you do anything, these are already in state:

| Category | Items |
|---|---|
| Vitals | BP 128/82, HR 78, Temp 99.1 (flagged high), SpO2 98% |
| Chief Complaint | "Cough x 5 days" |
| HPI | Onset 5 days, productive yellow sputum, tried OTC Robitussin, worse at night, low-grade fever, no SOB |
| Allergies | Penicillin (rash, mild), Sulfa (anaphylaxis, severe) |
| Medications | Metformin 500mg BID, Lisinopril 10mg daily, Tylenol Extra Strength 500mg PRN |

**Clinical history** (sidebar): HTN, T2DM, hypothyroidism, prediabetes, high cholesterol, family hx breast cancer.

### What's Not Pre-Seeded

- No ROS, PE, Plan, or Instructions — these arrive via AI drafts during recording
- No suggestions yet — these trigger from recording
- No tasks — these trigger when orderable items are added
- Processing rail is empty

---

## Phase 1: Review Pre-Seeded Data

**Do**: Look at the chart. The Overview pane shows the patient sidebar with demographics, problem list, meds, and allergies. The main area shows the MA handoff items.

**Expect**: CC, HPI, vitals, allergies, and meds are visible as confirmed chart items. The processing rail on the right is empty.

**Demonstrates**: MA handoff seeding, chart item rendering, overview layout.

---

## Phase 2: Start Recording

**Do**: Click the Record button in the bottom bar.

**Expect**: Recording indicator appears. Transcript segments begin arriving at staggered intervals. The transcript panel (left pane or bottom bar, depending on layout) populates with provider-patient dialog.

**Demonstrates**: `TranscriptionProvider`, ambient recording UX, mock transcript playback.

> [!NOTE] Transcript playback runs 11 segments over ~31 seconds total. Segments are provider-patient dialog covering the clinical encounter: symptom history, med review, lung exam, treatment plan.

### Transcript Timeline (Reference)

| ~Time | Speaker | Content Summary |
|---|---|---|
| 1s | Provider | "Here for a cough — how long?" |
| 4s | Patient | "5 days, started with sore throat, now dry cough" |
| 6.5s | Provider | "Any fever, SOB, chest pain?" |
| 10.5s | Patient | "Low fever first couple days, slight SOB when coughing" |
| 12.5s | Provider | "Bringing up phlegm?" |
| 15s | Patient | "Yes, yellowish green now" |
| 18s | Provider | "Going to listen to lungs — any medications?" |
| 20.5s | Patient | "Just Lisinopril and some Mucinex for the cough" |
| 25s | Provider | "Mild wheezing, no consolidation — consider antibiotic" |
| 28s | Provider | "Prescribing benzonatate 100mg TID for a week" |
| 31s | Provider | "This looks like acute bronchitis — should resolve in 1-2 weeks" |

---

## Phase 3: AI Drafts Arrive (Processing Rail)

**What happens** (no action needed — this is automatic):

After the first transcript segment arrives (~1s after Record), the draft engine starts. AI Drafts appear in the processing rail at staggered intervals:

| ~Delay After 1st Segment | Draft | Category |
|---|---|---|
| 3s | CC Draft | `chief-complaint` |
| 15s | HPI Draft | `hpi` |
| 30s | ROS Draft | `ros` |
| 45s | PE Draft | `physical-exam` |
| 60s | Plan Draft | `plan` |
| 75s | Instructions Draft | `instruction` |

**Expect**: The "AI Drafts" batch in the processing rail shows a climbing count badge. Each draft enriches or replaces the corresponding section.

**Demonstrates**: `DraftEngineRunner`, `useDraftEngine`, draft engine timer stages, processing rail batch display.

> [!NOTE] Because CC and HPI already exist from MA handoff, those drafts show as "Updated CC" / "Updated HPI" — the engine detects existing MA content and labels accordingly.

> [!NOTE] The draft engine and suggestion schedule are **independent systems**. Drafts come from the draft engine (processing rail "AI Drafts" batch). Suggestions come from the suggestion schedule (AI suggestion cards). They run in parallel.

---

## Phase 4: Suggestions Arrive

As the transcript plays, suggestions appear synced to relevant dialog:

| ~Time | Suggestion | Trigger |
|---|---|---|
| 21.5s | Mucinex 600mg (reported) | Patient mentions Mucinex at ~20.5s |
| 28.8s | Benzonatate 100mg TID (prescribe) | Provider prescribes at ~28s |
| 32.2s | Acute bronchitis J20.9 (diagnosis) | Provider names diagnosis at ~31s |
| 34s | HPI Draft (narrative) | Post-transcript AI analysis |
| 36s | A&P Draft (narrative) | Post-transcript AI analysis |
| 38s | Instructions Draft (narrative) | Post-transcript AI analysis |

**Expect**: Suggestion cards appear in the AI surface. Each shows the extracted text, confidence score, and source attribution.

**Demonstrates**: `SuggestionScheduleRunner`, transcript-synced suggestion timing, confidence display, source tagging (`transcription` vs `ai-analysis`).

> [!NOTE] The first 3 suggestions are structured items (medication, diagnosis). The last 3 are narrative drafts. Both use the same suggestion card UX but map to different chart item types.

---

## Phase 5: Accept a Medication Suggestion

**Do**: Accept the **Benzonatate 100mg TID** suggestion (or add a medication via OmniAdd).

**Expect**:
1. A new medication chart item appears in the chart
2. The processing rail's Prescriptions batch immediately shows **3 new tasks**:
   - Dx Association — "Link diagnosis to Benzonatate"
   - Drug Interaction Check — "Check interactions for Benzonatate"
   - Formulary Check — "Check formulary for Benzonatate"

All three start at `queued` status.

**Demonstrates**: Suggestion acceptance → `ITEM_ADDED` → side-effect handler → `TASK_CREATED` pipeline.

---

## Phase 6: Watch Tasks Auto-Progress

**What happens** (no action needed — this is automatic):

The task lifecycle simulator picks up each queued task and progresses it:

| Task | Flow | Timing |
|---|---|---|
| Drug Interaction | queued → processing (1s) → **completed** (2s) | Clean result, no interactions |
| Formulary Check | queued → processing (1s) → **failed** (3s) | "Not covered — alternatives available" |
| Dx Association | queued → processing (1s) → **pending-review** (1.5s) | Suggests J20.9 Acute bronchitis |

**Expect**: Tasks animate through statuses in the processing rail. Completed tasks resolve. The formulary check shows a failure state with error message. The dx-association task pauses at pending-review, waiting for user action.

**Demonstrates**: `TaskLifecycleRunner`, `useTaskLifecycleSimulator`, per-type lifecycle outcomes, failure UX, pending-review UX.

> [!NOTE] The formulary check *always* fails in this demo — it's designed to show the failure/alternatives UX path. Drug interaction *always* passes clean.

---

## Phase 7: Accept Diagnosis Suggestion

**Do**: Accept the **Acute bronchitis J20.9** suggestion.

**Expect**: A diagnosis chart item appears. Additional tasks may be created depending on the item type (dx-association for the diagnosis item itself).

**Demonstrates**: Diagnosis item creation, task generation for non-medication items.

---

## Phase 8: Interact with OmniAdd

**Do**: Open OmniAdd (click the input bar or use keyboard shortcut). Try typing a medication name, a diagnosis, or a lab order.

**Expect**: The input recognizer parses text and suggests matching categories. Selecting a category opens the field form. Submitting creates a chart item (and triggers tasks for orderable items).

**Demonstrates**: OmniAdd V2 text recognition, category field definitions, chart item creation.

> [!PARTIAL] OmniAdd recognizes text and creates chart items, but not all category field forms are fully built out. Medications and diagnoses have the most complete forms. Some categories (e.g., referrals, procedures) have minimal field coverage.

---

## Phase 9: Keyboard Shortcuts

**Do**: Press `?` to open the keyboard shortcut legend. Try navigation shortcuts (arrow keys for tab cycling in the legend panel, chord shortcuts for pane navigation).

**Demonstrates**: Chord engine, legend panel, pane shortcuts.

> [!PARTIAL] The chord engine and legend panel are fully wired. Many shortcuts trigger real navigation actions. Some shortcuts listed in the legend may target features that are visual-only or not yet connected.

---

## What This Scenario Does NOT Cover

| Feature | Status | Notes |
|---|---|---|
| Care gap suggestions | Not triggered | UC Cough has no pre-populated care gaps (acute visit). Use **PC Diabetes** for this. |
| Triage module | Pre-seeded only | Triage items are loaded at encounter start but the triage *workflow* (check-in → triage → checkout phases) isn't the focus. |
| E-prescribe / lab send | Not implemented | No actual send action — tasks complete/fail but the "send" button is visual only. |
| Handoff (MA → Provider) | Not implemented | The MA handoff is simulated by pre-seeding items on load. No explicit handoff action. |
| Encounter signing | Not implemented | No sign-off or lock flow. |
| Lab results arriving | Not implemented | No inbound result simulation. |
| Process mode (full task pane) | Available but not guided | Switch to Process mode to see the full batch sections. Not part of this scripted flow. |
| Telehealth | N/A | This is an in-person UC visit. |

---

## Quick Reference: Encounter IDs

Both `uc-cough` and `demo-uc` route to the same scenario.
