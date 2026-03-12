# Product Position: Rethinking the EHR from the Work Out

**Status:** Working draft for alignment conversations
**Last updated:** 2026-03-11
**Context:** Informed by prototype development, CMO feedback, and first-principles analysis of clinical workflows

---

## The Problem We're Solving

The company's mandate is to leverage technology to 10–20x primary care capacity. That's not an incremental improvement target — it requires rethinking how care is delivered, not just how it's documented.

The dominant constraint in primary care today is provider time. There aren't enough providers, and existing providers spend a disproportionate share of their time on documentation, administrative work, and system navigation — not on clinical reasoning and patient care. Published time studies consistently show providers spending roughly equal time on documentation as on direct patient interaction, with significant additional hours on between-visit work (inbox, refills, lab review, referrals).

Current EHR systems are a major contributor to this problem. They were built to satisfy documentation and billing requirements, and the clinical workflow was forced to conform to the documentation structure. The result: providers think in forms, not in clinical reasoning. The system's organizing principle is "fill out the chart" rather than "take care of the patient."

This document outlines a different organizing principle and maps it across the product suite.

---

## The Core Thesis

**The work is not the record of the work.**

Across every part of the clinical operation — encounters, between-visit tasks, population health, billing, even clinic management — there is a distinction between *doing the work* and *producing the documentation/compliance artifact that the work generates*. Current systems collapse these two things into a single interface, forcing the person doing the work to simultaneously think about the record.

Our position: **systems should be organized around the work, and produce the record as a downstream output.** AI makes this possible in ways that weren't feasible when current EHR architectures were designed.

This isn't just about the encounter. It's a product-wide principle.

---

## How This Plays Out: Convention vs. Our Position

### The Patient Encounter

This is where the prototype work is most developed. The CMO's framing captures it: "Capture and Process are the real work — charting is not."

| Convention (most EHRs) | Our position |
|---|---|
| The encounter UI is organized around the note (SOAP sections, templates, checkboxes). The provider's job is to fill out the chart. | The encounter UI is organized around clinical actions — capturing decisions, initiating orders, processing operational steps. The note is an output generated from what happened. |
| ROS is a standalone documentation section with organ-system checkboxes, driven by legacy billing rules. | Relevant system findings emerge from conversation and examination. AI captures them from the transcript. If a payer requires a formal ROS section, the Review layer generates it. The provider never interacts with an ROS form. |
| Physical exam documentation is a template of normal/abnormal checkboxes organized by organ system. | The provider narrates their exam. AI drafts the PE section from narration. Structured findings are extracted for decision support. The template disappears. |
| Visit type (annual wellness, follow-up, etc.) is selected at scheduling and gates which templates and workflows load. | Visit type is an emergent classification. The encounter starts, the provider does the clinical work, and the system identifies the appropriate billing classification based on what was actually done. |
| Placing an order is a documentation event — navigate to the order module, search, configure, sign. | Placing an order is a clinical decision captured in-flow ("this patient needs an A1c"). Operational fulfillment (routing to lab, associating diagnosis) happens in a separate processing phase. |
| Med reconciliation is a discrete workflow step — someone asks "still taking all these?" and checks a box. | Med reconciliation is continuous and ambient. When the patient says "I stopped the lisinopril," that's a reconciliation event captured from the transcript, not a checkbox. |
| The problem list is a manually maintained registry that's perpetually stale. | The problem list is a computed view — inferred from active medications, recent orders, billing history, and encounter activity. The provider confirms or corrects, not builds from scratch. |

**What the prototype demonstrates:** Three encounter view facets (Capture, Process, Review) operating on a single data model. OmniAdd as a unified input surface optimized for speed. AI drafts generating narrative documentation from ambient recording. Processing Rail for operational batch work. All of it organized around clinical actions, not documentation sections.

---

### Between-Visit / Interstitial Work

The "invisible clinic" — tasking, inbox management, fax processing, refill requests, lab review, care gap follow-up, referral tracking. This work consumes hours per provider per day and is largely unstructured in current systems.

| Convention (most EHRs) | Our position |
|---|---|
| Inbox is a chronological message queue. Provider processes items one by one in whatever order they arrived. | Inbound work should be triaged by clinical urgency and type, pre-processed by AI + support staff, and presented to the provider as decision points — not raw messages to read and act on. |
| Tasks are created and assigned manually. Completion is tracked by checking a box. | Tasks should be generated from clinical events (lab result → review task, referral sent → follow-up task) with context pre-attached. The system should know what a "completed" task looks like for each type. |
| Faxes arrive as images. Someone reads them, figures out what they are, and routes them manually. | Faxes should be classified, data-extracted, and matched to patients automatically. The human step is verification and clinical action, not document processing. |
| Refill requests require the provider to open the chart, review the medication, check last visit, and approve/deny. | Refill decisions should be pre-staged: AI reviews the request against prescribing history, last visit, and protocol adherence. Routine renewals are auto-approved per standing policy. The provider handles exceptions. |
| Lab results arrive in an inbox. Provider opens each one, reviews, decides on action, documents the action, communicates to patient. | Lab results should be pre-interpreted against the ordering context, flagged if abnormal with suggested actions, and batched for efficient provider review. Normal results with no action needed should flow to patient communication automatically. |
| Care gap lists are generated from quality reporting tools and exist in a separate module from the clinical workflow. | Care gaps should surface contextually — during encounters (protocol activation), in the task queue (outreach tasks), and in population health views — not in an isolated reporting tool. |

**What's needed from the prototype / next phases:** The current prototype's information architecture (appshell scope system, workspace model, to-do categorization) already structures between-visit work into meaningful categories. The next layer is AI pre-processing and triage — reducing the cognitive load per item so providers handle decisions, not data processing.

---

### Population Health

Moving from reactive (treat who shows up) to proactive (identify and reach patients who need care before they escalate).

| Convention (most EHRs) | Our position |
|---|---|
| Population health is a reporting module — dashboards showing care gap percentages, quality measure performance, risk stratification scores. Actionable only by dedicated care management staff. | Population health should feed directly into clinical workflows. A care gap isn't a report line item — it's a task, a protocol activation trigger, a patient outreach, or an encounter agenda item. The data should drive action, not just measurement. |
| Risk stratification is retrospective — based on claims data and diagnosis history. Updated quarterly or annually. | Risk should be assessed continuously — incorporating recent encounters, medication adherence, lab trends, social determinants, and engagement signals. The system should identify patients trending toward risk before they arrive at the threshold. |
| Patient panels are lists. Providers "own" a panel but have limited tools to proactively manage it. | Panel management should be an active workspace — showing who needs attention, why, and what action to take. The care team (not just the provider) should have role-appropriate views and actions on the panel. |
| Outreach is manual — staff call patients from a list, leave voicemails, document attempts. | Outreach should be automated where appropriate (appointment reminders, care gap notifications, medication adherence check-ins) with human follow-up for non-responders or complex situations. Outreach results should feed back into the patient record. |

**Connection to encounter work:** Care protocols in the encounter (already designed in the prototype) are the bridge. A population health care gap triggers a protocol activation when the patient is seen, which surfaces evidence-based recommendations in the encounter flow. The loop closes: population data → encounter action → documented outcome → updated population data.

---

### Billing & Revenue Cycle

Billing is downstream of clinical work, but current systems force billing concerns upstream into the encounter. This is a major source of cognitive overhead.

| Convention (most EHRs) | Our position |
|---|---|
| Providers think about billing during the encounter — choosing visit type, documenting to a code level, associating diagnoses with orders in real-time. | Billing classification should be derived from the clinical work. The system observes what was done, suggests the appropriate E&M level, identifies billable services, and presents charge capture as a review step — not a cognitive burden during patient care. |
| Coding is a post-encounter manual process — coders review notes, assign codes, fix documentation gaps. | Coding should be AI-assisted — suggested codes derived from encounter documentation, flagged when documentation doesn't support the suggested level, with coder review as quality assurance rather than primary production. |
| Prior authorization is a separate workflow — provider orders something, someone discovers it needs a PA, clinical documentation is gathered retrospectively to support the request. | PA requirements should be surfaced at the point of ordering ("this imaging requires prior auth for this payer — clinical criteria: X, Y, Z"). Supporting documentation should be auto-compiled from the chart. The approval workflow should be tracked alongside the order. |
| Denial management is reactive — denials arrive weeks later, someone investigates, appeals are manual. | Denial patterns should be identified proactively — "claims for this code with this payer are denied 40% of the time, common reason: missing modifier." Prevention is upstream (documentation quality, correct coding), not downstream (appeal after denial). |

**Stretch opportunity:** The Capture → Process → Review model from the encounter has a direct analog in billing. Capture clinical work → Process into billable events → Review and submit claims. If the clinical system produces clean, structured data, the billing system's job gets dramatically simpler.

---

### Clinic Operations & Management

Tools for running the business — scheduling, staffing, supply chain, performance management.

| Convention (most tools) | Our position |
|---|---|
| Scheduling is a grid of time slots. Someone fills them. Optimization is manual. | Scheduling should be demand-aware — predicting volume by type, matching appointment supply to patient need, suggesting template adjustments, identifying underutilized capacity. |
| Staffing decisions are based on fixed ratios and gut feel. | Staffing should be informed by actual workflow data — if ambient AI reduces documentation time by 30%, that changes optimal provider-to-MA ratios, panel capacity, and scheduling templates. Operational tools should reflect the capacity changes that clinical tools create. |
| Performance management is monthly reports — visits per day, RVUs, collection rates. | Performance should be real-time and actionable — not "you had low RVUs last month" but "today's schedule has 3 slots that could be filled, and 12 patients on your panel need follow-up this week." |
| Multi-site management is aggregated versions of single-site tools — roll up the dashboards. | Multi-site management needs different abstractions — variance analysis (why is site A's no-show rate 2x site B?), best-practice identification, resource sharing, standardization of what matters with local flexibility for what doesn't. |

**Connection to clinical tools:** The clinical encounter data (documented by the EHR) is the foundation for operational analytics. If the clinical system captures structured, high-quality data as a byproduct of the work (not as a documentation burden), the operations tools have dramatically better inputs.

---

### Patient Experience

The patient-facing side of the ecosystem — portal, app, communication.

| Convention (most patient tools) | Our position |
|---|---|
| Patient portals are read-only views of clinical data — lab results, visit summaries, medication lists. | Patient tools should be bidirectional and action-oriented — not just "view your results" but "here's what your results mean, here's what to do next, here's how to schedule the follow-up your provider recommended." |
| Patient messaging is unstructured — a free-text inbox that generates work for the clinical team. | Patient communication should be structured by intent — symptom reporting, medication questions, appointment requests, administrative inquiries — with AI-assisted routing and response. Reduce the volume that requires provider attention. |
| Health education is generic — pamphlets and links. | Education should be contextual and personalized — tied to the patient's conditions, medications, and care plan. Delivered at the right moment (post-visit instructions, medication start, care gap notification). |
| Appointment scheduling is a phone call or a limited online booking tool. | Scheduling should be intelligent — matching patient need to appropriate visit type, provider, and timing. Supporting self-triage for common conditions. Offering alternatives when in-person isn't needed (async visit, nurse call, etc.). |

**The ecosystem connection:** Patient tools shouldn't exist in isolation from clinical tools. When a provider adds a care plan item during an encounter, the patient should see a corresponding action item in their app. When a patient reports a symptom through the app, it should surface in the clinical workflow as a pre-processed, triaged item — not a raw message.

---

## The Unifying Pattern

Across every domain, the same structural move applies:

1. **Separate the work from the record.** Let people do the work in whatever structure matches their cognitive model. Produce the record (documentation, billing artifact, compliance output) as a downstream transformation.

2. **AI as structural translator.** The AI layer's most important job isn't generating text — it's translating between the structure of the work (clinical reasoning, operational decisions, patient communication) and the structure of the record (SOAP notes, ICD-10 codes, quality measures, billing claims).

3. **Capture → Process → Review as a universal pattern.** This isn't just an encounter model. It's an operational model:
   - **Capture** the work in whatever form is fastest and most natural
   - **Process** the operational outputs (route orders, generate claims, send communications, update registries)
   - **Review** the produced artifacts for quality, completeness, and accuracy before finalizing

4. **Computed state over manual maintenance.** Problem lists, care gaps, risk scores, billing classifications, task queues — these should be derived from activity, not manually maintained. The human role shifts from data entry to data verification.

5. **Contextual surfacing over standalone modules.** Information and actions should appear where and when they're relevant — allergies when prescribing, care gaps during encounters, PA requirements when ordering — not in isolated sections the user navigates to.

---

## What We've Built and What It Proves

The working prototype covers the patient encounter in depth — Capture/Process/Review views, OmniAdd unified input, AI draft generation, processing rail, care protocols, multi-surface coordination. It demonstrates that the core thesis works: you can organize around clinical work and produce structured documentation as output.

The information architecture extends beyond the encounter — the appshell scope system, workspace model, and to-do categorization provide the framework for between-visit work, population health, and operational views. These are designed but less deeply prototyped.

**What's proven:**
- Capture/Process/Review as an encounter model — functional, navigable, coherent
- OmniAdd as a single input surface replacing module-specific entry — works across 15 chart item categories
- AI drafts generating narrative from ambient input — architecture and UX flow designed
- Care protocols activating contextually — data model and coordination architecture defined
- Three views on a single data model — no data duplication, consistent editing, clean audit trail

**What's designed but not deeply prototyped:**
- Between-visit work (to-do system, inbox triage, task generation)
- Population health views and panel management
- Billing/charge capture integration
- Cross-product coordination patterns

---

## What This Means for the Organization

This isn't a redesign of the EHR UI. It's a rethinking of what the product *does* — shifting from a documentation system that providers use during care to a care delivery system that produces documentation. The distinction matters because it changes:

**What engineering builds:** Not forms and templates, but capture surfaces, AI pipelines, and output generators. The architecture is fundamentally different.

**What clinical teams validate:** Not "does this template have the right fields" but "does this capture flow match how providers actually think during an encounter?" The validation criteria shift from documentation completeness to workflow fidelity.

**What operations measures:** Not "chart completion rate" but "time from patient arrival to care actions initiated." The success metrics shift from documentation to care delivery.

**What the business model enables:** If providers spend less time on documentation and more time on care, panel sizes increase, throughput increases, and the capacity mandate becomes achievable — not through working harder, but through working on the right things.

---

## Open Questions for Discussion

These are genuine open questions, not rhetorical. Each represents a decision point where organizational alignment matters.

**1. How aggressive do we go on convention-breaking?**
Some of these positions (computed problem lists, emergent visit types, continuous med rec) challenge deeply held assumptions in clinical practice and regulatory compliance. Do we lead with the full vision and demonstrate compliance, or phase in gradually while building trust?

**2. Where does the AI boundary sit?**
The thesis depends heavily on AI as a structural translator. Where are we comfortable with AI acting autonomously (generating narrative, suggesting codes) vs. requiring human verification? This affects the capacity math directly — more autonomy = more throughput, but more risk.

**3. How do we handle the multi-product coordination?**
The encounter model is most developed. Extending the philosophy to billing, operations, and patient tools requires cross-team alignment on shared data models and integration patterns. Who owns the coordination? What's the sequencing?

**4. What's the go-to-market positioning?**
"We organized around the work, not the chart" is compelling internally. How does this translate for buyers (clinic operators, CMOs, CIOs) who evaluate against feature checklists and regulatory requirements?

**5. How does this interact with existing products?**
The current product suite exists and serves customers. Where does this vision augment vs. replace? What's the migration path for existing customers?

---

## Document History

| Date | Change |
|------|--------|
| 2026-03-11 | Initial draft — six domains mapped, core thesis articulated, open questions identified |
