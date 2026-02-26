# PC Diabetes — Demo Walkthrough

Primary care quarterly follow-up for a 58-year-old with T2DM and HTN. This scenario shows **care gap suggestions**, medication adjustments, and a denser task pipeline.

**Status**: Placeholder — walkthrough not yet written.

## Setup

**Encounter ID**: `pc-diabetes` (or `demo-pc`)
**Patient**: Robert Martinez, 58M, BCBS PPO
**Visit type**: Follow-up, 30 min

### What's Pre-Seeded

| Category | Items |
|---|---|
| Vitals | BP 142/88, HR 72, Temp 98.2, SpO2 97% |
| Chief Complaint | "DM/HTN follow-up" |
| HPI | Morning fasting glucose 140-160, occasional headaches, adherent to meds, sometimes forgets evening metformin |
| ROS | Positive: headaches, polyuria. Negative: CP, SOB, vision changes |
| PE | General, Cardiovascular, Respiratory |
| Medications | Metformin 500mg BID, Lisinopril 10mg daily |
| Allergies | Penicillin (rash, mild) |

### Key Differentiators from UC Cough

- **Care gap suggestions appear immediately** (A1C monitoring, diabetic eye exam) — no recording needed
- **9-segment transcript** covers diabetes-specific dialog (fasting glucose, A1C discussion, Metformin adjustment)
- **Triage is pre-completed** — ROS and PE already present
- **Multiple task types triggered** from lab orders and medication changes

### What To Write

- [ ] Phase-by-phase walkthrough following the same format as UC Cough
- [ ] Care gap interaction flow (accept A1C suggestion → lab task created)
- [ ] Metformin dose adjustment flow
- [ ] Multiple simultaneous task batches in processing rail

## What This Scenario Uniquely Demonstrates

- Care gap suggestions (immediate, not transcript-triggered)
- Lab order task pipeline (dx-association + care-gap-evaluation)
- Medication modification (vs. new Rx)
- Dense pre-seeded triage data (ROS, PE already present)
- Insurance-based formulary checks (BCBS PPO vs. self-pay)
