# Design Philosophy: Rethinking EHR Conventions

**Status:** Living document — captures foundational principles and identifies legacy EHR conventions worth rethinking
**Last updated:** 2026-03-10
**Origin:** CMO feedback during prototype review + design team analysis
**Purpose:** Ground product decisions in first-principles thinking about clinical work, and maintain a backlog of conventions to explore, challenge, or redesign

---

## 1. The Core Insight

> Charting is not the real work. Capture and Process are the real work — but most EHRs have oriented around the chart.

Traditional EHRs treat documentation as the primary activity of the clinical encounter. The provider's screen is organized around the note — SOAP sections, templates, checkboxes — and the provider's job is to fill it out while simultaneously caring for the patient.

This gets the hierarchy wrong. The provider's real work during an encounter is:

1. **Capture** — Gather information, make decisions, initiate actions (orders, referrals, prescriptions)
2. **Process** — Execute operational steps that result from those decisions (send Rx to pharmacy, route labs, generate referral)
3. **Document** — Produce a record of what happened that serves billing, legal, communication, and continuity purposes

Documentation is a **downstream output** of clinical work, not the work itself. When the EHR makes documentation the primary interface, it forces providers to think in documentation-structure terms ("which SOAP section does this go in?") instead of clinical-action terms ("what does this patient need?").

Our Capture → Process → Review model inverts this. The provider works in clinical-action space during the encounter, and the system produces structured documentation as an output — shaped for whatever downstream consumer needs it (billing, legal, the next provider).

---

## 2. The Architectural Principle

**Clinical input structure ≠ documentation output structure.**

The provider's cognitive model during an encounter doesn't map to SOAP notes, organ-system ROS checklists, or discrete med-rec steps. Providers think in flows: listen → assess → decide → act. The documentation structure (SOAP, ICD-10 linkages, E&M leveling) exists to serve billing, legal, and communication systems — not to mirror clinical reasoning.

The system should accept input in whatever structure matches clinical cognition, and transform it into whatever structure each downstream consumer requires. This is the fundamental job of the AI layer: not just transcription, but structural translation between how providers think and how the healthcare system records.

**Implication for every feature we build:** Ask "does this feature organize around how the provider thinks during the encounter, or around how the documentation needs to be structured after?" If the latter, it belongs in the output/review layer, not the capture layer.

---

## 3. Conventions Worth Rethinking

Each entry below identifies a traditional EHR convention, explains why it exists, assesses what's still needed, and proposes a direction. Entries are tagged with exploration status.

### 3.1 Review of Systems (ROS)

**Status:** `rethink-active` — Informing current design
**Raised by:** CMO during prototype review

**What it is:** A systematic inventory of symptoms across organ systems (constitutional, HEENT, cardiovascular, respiratory, GI, GU, MSK, neuro, psych, skin, etc.), typically presented as a checklist of "denies" and "reports" items. Traditionally a discrete section of the encounter note.

**Why it exists:** The 1995/1997 CMS E&M documentation guidelines counted the number of organ systems reviewed to determine visit complexity for billing. A "comprehensive" ROS (10+ systems) was required for high-level E&M codes. The section was literally a billing instrument.

**What changed:** The 2021 CMS E&M reforms moved to medical decision-making (MDM) as the primary code-leveling mechanism. ROS documentation is no longer required for E&M leveling under current CMS rules. Many commercial payers have followed CMS's lead, though adoption varies.

**What's still needed:**
- Clinically, a systematic check of organ systems is sometimes valuable — especially for new patients, complex presentations, or when the HPI raises multi-system differential diagnoses
- Some specialty workflows (rheumatology, psychiatry) rely on structured system review
- Certain payers may still reference ROS in audit criteria
- The clinical habit of "asking the screening questions" has genuine diagnostic value — it's the checkbox-form documentation of it that's the problem

**Our direction:** ROS findings should emerge from the encounter conversation and be captured by ambient AI as part of the HPI narrative or as discrete clinical findings — not as a standalone checkbox section the provider fills out. The Review layer can organize relevant system findings into an ROS section if a specific payer or documentation standard requires it, but the provider never interacts with an "ROS form" during capture.

**Prototype implications:**
- ROS remains a chart item category (for AI-drafted content and manual entry when providers want it)
- It does NOT get prominent placement in the OmniAdd category priority order
- The AI draft system can generate an ROS section from transcript analysis when clinically or billing-relevant
- Review mode can display ROS as a documentation section without requiring the provider to have explicitly "done" an ROS

**Open questions:**
- [ ] Which payers still require explicit ROS documentation? (Compliance team input needed)
- [ ] Should the AI proactively generate ROS from the transcript for all encounters, or only when MDM complexity suggests it's relevant?
- [ ] How do we handle specialty workflows where structured ROS has genuine clinical value (e.g., rheum review of 14 systems)?

---

### 3.2 SOAP Note Structure

**Status:** `rethink-active` — Informing current design

**What it is:** Subjective–Objective–Assessment–Plan. The dominant clinical documentation format since the 1960s. Almost every EHR organizes the encounter note around these four sections.

**Why it exists:** Developed by Dr. Lawrence Weed as part of the Problem-Oriented Medical Record (POMR). Originally a method for organizing clinical thinking in paper charts. Became the default because it was what medical schools taught and what paper charts used.

**What's still needed:**
- The conceptual discipline of separating "what the patient reports" from "what I observed" from "what I think" from "what I'm doing about it" has genuine clinical and legal value
- Other providers reading the note expect this structure — it's a communication convention
- Billing auditors use SOAP structure to verify documentation supports the billed level of service
- Medicolegal review relies on the logical progression from findings to assessment to plan

**Our direction:** SOAP is an output format, not an input format. The Review layer produces SOAP-structured notes. The provider never thinks in SOAP terms during capture — they think in clinical action terms. The AI layer handles the structural translation.

This is already how our system works: the provider captures items chronologically in whatever order the encounter naturally takes. The AI drafts narrative sections (HPI, PE, Plan). Review mode organizes everything into clinical documentation sections that happen to align with SOAP expectations.

**What's worth preserving in a new form:**
- Assessment-Plan coupling: Our current design already links diagnoses to their associated orders and plans. This is stronger than SOAP, where Assessment and Plan are separate sections that the reader has to mentally connect.
- Clinical reasoning documentation: The "Assessment" section's real value is explaining *why* — differential diagnosis, clinical reasoning, risk stratification. This should be captured (ambient AI can draft it from the provider's verbal reasoning during the encounter) but doesn't need to be a form the provider fills out.

**Prototype implications:**
- Review mode sections don't need to be labeled S/O/A/P — they can use more descriptive section names (History, Examination, Assessment & Plan, etc.)
- The AI draft system should be able to output notes in multiple formats (SOAP, problem-oriented, etc.) based on the receiving context
- Assessment and Plan should render as coupled units (by diagnosis), not as separate sections

**Open questions:**
- [ ] Do we offer configurable note output formats, or pick one structure and generate it consistently?
- [ ] How do we handle the legal expectation that "subjective" and "objective" are clearly delineated? (Important for malpractice defense)
- [ ] Provider preference: some providers genuinely think in SOAP terms. Do we offer a SOAP-oriented capture mode as an option?

---

### 3.3 Problem List as Static Registry

**Status:** `rethink-queued` — Not yet impacting prototype, but architecturally relevant

**What it is:** A manually maintained list of active diagnoses/conditions. Providers are expected to add new problems, resolve old ones, and keep the list current. In practice, problem lists are perpetually stale — conditions accumulate, duplicates proliferate, and nobody trusts the list.

**Why it exists:** Part of the Problem-Oriented Medical Record (POMR) from the 1960s. CMS Meaningful Use requirements mandated maintaining an up-to-date problem list. Quality reporting (HEDIS, MIPS) references active problems for measure calculation.

**What's still needed:**
- Order-diagnosis linkage: every billable order needs an associated ICD-10 code
- Care continuity: the next provider needs to know what conditions are active
- Quality reporting: population health measures reference active diagnoses
- Risk adjustment: HCC (Hierarchical Condition Categories) coding for Medicare Advantage relies on documented active conditions
- Care gap identification: "patient has diabetes but no A1c in 6 months" requires knowing diabetes is active

**Our direction:** The problem list should be a **computed view**, not a manually maintained registry. If a provider is prescribing metformin, ordering A1c, and documenting diabetes management in the plan — diabetes is active. The system should infer active problems from encounter activity, medication lists, lab orders, and billing history, and present a derived problem list that the provider confirms or corrects rather than builds from scratch.

**Exploration areas:**
- [ ] Define the inference logic: what signals constitute an "active problem"? (Active meds, recent orders, recent billing codes, mentioned in notes)
- [ ] Reconciliation UX: how does the provider review and correct the derived list? (Different from building it manually)
- [ ] Historical problem resolution: how does the system know a problem is no longer active? (Absence of treatment signals over time? Explicit resolution?)
- [ ] HCC/risk adjustment implications: derived lists need to produce valid ICD-10 codes for billing, not just conceptual problem descriptions
- [ ] Interaction with MA handoff: MA often reviews problem list during rooming. How does this change if the list is computed?

---

### 3.4 Medication Reconciliation as Discrete Step

**Status:** `rethink-queued`

**What it is:** A formal workflow step (usually during rooming or intake) where a staff member reviews the patient's medication list and asks "are you still taking all of these?" The patient's responses are recorded, and the list is marked "reconciled."

**Why it exists:** Joint Commission National Patient Safety Goal. CMS Transitions of Care measures require medication reconciliation. Genuine patient safety concern — medication errors are a leading cause of adverse events, and discrepancies between what's prescribed and what's taken are common.

**What's still needed:**
- The clinical need is real: medication discrepancies cause harm
- Regulatory requirements aren't going away
- The audit trail ("medication list was reviewed on this date") is required for compliance
- Transitions of care (hospital discharge, specialist referral) especially need formal reconciliation

**Our direction:** Medication reconciliation should be **continuous and ambient**, not a discrete checkbox step. When a patient says "I stopped the lisinopril because it made me cough," that's a reconciliation event. When a provider prescribes a new medication and reviews what the patient is already taking, that's reconciliation. The AI layer should detect these events from the transcript and surface them as structured reconciliation actions (discontinue, confirm, modify) rather than forcing a separate "review your med list" workflow.

The MA rooming step still has value as an initial pass, but it should produce structured findings (confirmed, discontinued, changed dose, new OTC) rather than a binary "reconciled: yes" checkbox.

**Exploration areas:**
- [ ] Define reconciliation event types from transcript: what utterances constitute medication reconciliation? ("still taking," "stopped," "changed dose," "added," "ran out")
- [ ] How does continuous reconciliation satisfy the compliance requirement for a documented reconciliation event?
- [ ] MA rooming flow: what structured output should the MA produce during pre-visit med review?
- [ ] Interaction with pharmacy data feeds: if we have fill data, reconciliation becomes partly automated (patient hasn't filled lisinopril in 3 months → flag for discussion)
- [ ] Transitions of care: does the continuous model work for discharge reconciliation, or does that inherently need a formal step?

---

### 3.5 Allergy Documentation as Static List

**Status:** `rethink-queued`

**What it is:** A standalone section listing patient allergies and adverse reactions, maintained across encounters. Typically displayed prominently in the chart header. Feeds drug interaction checking.

**Why it exists:** Patient safety — preventing allergic reactions from prescribed medications. Drug interaction engines require structured allergy data to fire alerts. Legal liability — documented allergies create a duty to avoid known allergens.

**What's still needed:**
- Drug interaction checking is genuinely life-saving and requires structured allergy data (allergen, reaction type, severity)
- The legal record of known allergies is important
- Cross-reactivity logic (penicillin allergy → cephalosporin caution) requires structured data
- Allergy verification during prescribing is a critical safety check

**Our direction:** The allergy *data model* should remain structured and robust — it feeds safety-critical systems. But the allergy *UX* should shift from static list maintenance to contextual, action-oriented interactions:

- When prescribing: surface relevant allergies with cross-reactivity context and clinical guidance ("reported penicillin allergy — 90% of reported penicillin allergies are not true IgE-mediated reactions. Consider allergy testing referral if clinically relevant.")
- During capture: detect allergy-related statements from transcript and surface as structured allergy items for confirmation
- In review: show the allergy list as part of the patient context, not as a section the provider is expected to maintain during the encounter

**Exploration areas:**
- [ ] Allergy verification UX: how does the system prompt re-evaluation of questionable allergies without alert fatigue?
- [ ] Structured reaction data from ambient capture: can AI reliably extract reaction type and severity from patient descriptions?
- [ ] Integration with allergy testing protocols: when an allergy is questionable, should the system suggest a penicillin allergy testing protocol?
- [ ] Alert fatigue mitigation: drug-allergy alerts are the most overridden alert type in EHRs. How do we make alerts contextually relevant rather than blanket warnings?

---

### 3.6 Vital Signs as Passive Data Entry

**Status:** `rethink-queued`

**What it is:** Vitals (BP, HR, temp, RR, SpO2, height, weight, BMI) captured during intake/rooming and displayed as static data in the encounter note. Occasionally flagged if out of range.

**Why it exists:** Fundamental clinical assessment. Required for billing documentation (supports medical complexity). Quality measures track specific vitals (BP control for HTN, BMI for obesity screening).

**What's still needed:**
- Clinical assessment: vitals are real clinical data
- Quality measures: specific vital values feed quality reporting
- Trending: serial measurements over time are clinically important
- Billing: vitals documentation supports encounter complexity

**Our direction:** Vitals should be **event triggers**, not passive data. An elevated BP reading should activate a hypertension protocol (or prompt the care protocol engine). An abnormal BMI should surface relevant care gaps. A fever should influence the differential diagnosis suggestions. The Triage Module (already implemented) begins this direction by showing vitals with out-of-range flagging in the capture view — the next step is connecting abnormal vitals to the protocol and suggestion engines.

**Exploration areas:**
- [ ] Vital-to-protocol activation mapping: which vital thresholds trigger which protocols?
- [ ] Serial vitals during encounter: some workflows need repeat measurements (recheck BP after 5 minutes). How does this fit the capture flow?
- [ ] Vitals trending visualization: where and how do we show longitudinal vital trends? (Reference pane? Inline in capture?)
- [ ] Device integration: vitals from connected devices (BP cuffs, pulse ox) as auto-populated chart items
- [ ] Smart re-measurement prompts: if initial BP is elevated, system suggests recheck with specific timing

---

### 3.7 Physical Exam Documentation

**Status:** `rethink-active` — Informing current AI draft design

**What it is:** Structured documentation of the physical examination, traditionally organized by organ system with checkboxes or templates for normal/abnormal findings. Most providers use pre-populated "normal exam" templates and modify only the relevant systems.

**Why it exists:** 1995/1997 E&M guidelines counted exam elements for billing. Legal record of what was examined. Communication to other providers about physical findings.

**What changed:** 2021 E&M reforms removed body-area/organ-system counting for office visits. PE documentation now only needs to support the MDM — document what you examined and found that's relevant to your decision-making.

**Our direction:** Already embedded in our AI draft approach. The provider narrates their exam findings verbally ("lungs clear bilaterally, no wheezing, good air movement"). The AI drafts a PE section from the narration. The provider reviews and confirms in the Review layer. No organ-system checkbox form.

**What's worth preserving:**
- Structured PE data has value for trending (serial exams for chronic conditions)
- Some findings need to be structured for clinical decision support (e.g., heart murmur grading feeds cardiology referral logic)
- Specialty exams (dermatology body maps, orthopedic range-of-motion) have genuinely useful structured formats

**Exploration areas:**
- [ ] Specialty exam modules: when do structured PE tools add genuine clinical value vs. documentation overhead?
- [ ] PE findings as structured data: can the AI extract structured findings from narrative (e.g., "2/6 systolic murmur" → structured murmur grading) for downstream decision support?
- [ ] Negative exam documentation: how much "normal" documentation is needed? AI should generate appropriate normals without the provider explicitly clicking through them

---

### 3.8 Visit Type as Workflow Gate

**Status:** `rethink-queued`

**What it is:** Encounters are categorized by visit type at scheduling (new patient, follow-up, annual wellness, urgent care, etc.). The visit type determines which templates load, what documentation is expected, and often which billing codes are available.

**Why it exists:** Scheduling needs (different visit types get different time slots). Template loading (annual wellness visit has screening checklists). Billing guidance (AWV has specific required elements).

**What's still needed:**
- Scheduling: time allocation genuinely varies by visit type
- Billing: certain codes are visit-type-specific (AWV, preventive vs. problem-oriented)
- Compliance: AWV and other program-specific visits have required documentation elements
- Quality reporting: some measures are visit-type-dependent

**Our direction:** Visit type should be **emergent classification**, not a predetermined workflow gate. The encounter starts, the provider captures what actually happens, and the system identifies the appropriate billing classification based on what was done — not the other way around. A "diabetes follow-up" that surfaces a new complaint and includes a depression screening becomes a split-bill visit, and the system should recognize and support that rather than forcing everything through the "follow-up" template.

This aligns with the Process view's sign-off flow, where charge capture and E&M leveling happen based on documented activity, not a priori visit type selection.

**Exploration areas:**
- [ ] AWV and program-specific visits: these genuinely have required elements. How does the protocol system handle "you're in an AWV, these elements are required" without it being a rigid template?
- [ ] Split billing: encounters that span visit types (problem-oriented + preventive). How does the system surface the split-bill opportunity?
- [ ] Scheduling integration: visit type still matters for scheduling. How does "emergent classification" reconcile with "this appointment was booked as a 15-minute follow-up but the patient has 3 new concerns"?
- [ ] Time management: if visit type doesn't gate the workflow, how does the system help providers manage encounter length relative to scheduled time?

---

### 3.9 Orders as Documentation Events

**Status:** `rethink-queued`

**What it is:** In most EHRs, placing an order (lab, imaging, referral, prescription) is a documentation event — the provider navigates to the order module, searches, configures, and "signs" the order. The act of ordering is separate from the clinical reasoning that prompted it.

**Why it exists:** CPOE (Computerized Provider Order Entry) requirements from Meaningful Use. Legal requirement that orders be attributable to a specific provider. Safety checks (drug interactions, duplicate orders) need a discrete order event to fire against.

**What's still needed:**
- Provider attribution: orders must be traceable to a responsible provider
- Safety checks: drug interactions, allergy checks, duplicate order detection
- Audit trail: when was the order placed, by whom, was it modified
- Transmission: orders need to be routed to the right fulfillment system (pharmacy, lab, imaging center)

**Our direction:** Our OmniAdd + Process model already moves in this direction. The provider's mental model during capture is "this patient needs an A1c and a lipid panel" — the act of adding these via OmniAdd captures the clinical intent. The Process view handles the operational fulfillment (batch send to lab, associate with diagnosis). The clinical decision and the operational execution are separated into their natural phases rather than being collapsed into a single "order entry" workflow.

**What's worth deepening:**
- [ ] How does "add via OmniAdd" vs. "formal order" map to CPOE compliance? Is the OmniAdd addition the "order," or is the Process view "send" the order?
- [ ] Safety checks: at which point do they fire — when the item is added to the chart, or when it's sent from Process view? (Probably both, at different levels)
- [ ] Standing orders and protocols: orders that are pre-authorized (e.g., MA can order flu test per standing order). How do these interact with the provider capture flow?

---

## 4. Principles for Evaluation

When assessing whether a traditional EHR convention should be rethought, apply these lenses:

**Origin test:** Does this convention exist because of a billing rule, a regulatory requirement, a clinical need, or habit? If billing/regulatory, can the requirement be satisfied differently than the traditional UX?

**Cognitive load test:** Does this convention add cognitive overhead during the encounter? If yes, can the overhead be shifted to the AI layer or to a non-encounter phase (review, sign-off)?

**Provider-time test:** Does the provider need to personally do this, or can the system (AI + staff + protocols) handle it with provider confirmation? Every second of provider attention during an encounter is the scarcest resource in the system.

**Output vs. input test:** Is this convention organizing information for the provider's benefit during the encounter, or for a downstream consumer's benefit? If the latter, it belongs in the output/review layer.

**Safety test:** Does rethinking this convention create patient safety risk? If yes, the safety mechanism must be preserved or improved, even if the UX changes dramatically.

---

## 5. How This Document Evolves

This is a living document. Each convention entry follows a lifecycle:

1. **`identified`** — Convention recognized as worth examining
2. **`rethink-queued`** — Documented with initial analysis, not yet influencing design
3. **`rethink-active`** — Actively informing prototype design decisions
4. **`explored`** — Open questions investigated, direction validated (or convention validated as-is)
5. **`designed`** — Specific design solution specified (links to feature spec)
6. **`implemented`** — Solution built in prototype
7. **`validated`** — Tested with users, direction confirmed

New conventions can be added at any time. CMO feedback, provider user testing, regulatory changes, and competitive analysis are all valid inputs.

### Adding a New Entry

Use this template:

```markdown
### X.X [Convention Name]

**Status:** `identified`
**Raised by:** [Source]

**What it is:** [Description of the traditional convention]
**Why it exists:** [Historical/regulatory/clinical origin]
**What's still needed:** [Requirements that must still be met]
**Our direction:** [Initial thinking on how to rethink]
**Exploration areas:**
- [ ] [Open questions]
```

---

## Document History

| Date | Change | Source |
|------|--------|--------|
| 2026-03-10 | Initial document — 9 conventions documented from CMO feedback session + design analysis | CMO prototype review feedback, design team analysis |
