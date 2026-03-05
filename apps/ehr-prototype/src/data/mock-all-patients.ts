/**
 * Mock All-Patients Data
 *
 * Enriched patient panel for the all-patients Sankey view.
 * Builds on existing MOCK_POP_HEALTH_PATIENTS with 5-tier risk,
 * action status, and condition/preventive cohort assignments.
 */

import type {
  AllPatientsPatient,
  RiskTier,
  ActionStatus,
  SankeyCohortDef,
} from '../types/population-health';

// ============================================================================
// Condition & Preventive Cohort Definitions (for Sankey axes)
// ============================================================================

export const CONDITION_COHORTS: SankeyCohortDef[] = [
  { id: 'cond-diabetes', label: 'Diabetes', zone: 'conditions' },
  { id: 'cond-hypertension', label: 'Hypertension', zone: 'conditions' },
  { id: 'cond-copd', label: 'COPD', zone: 'conditions' },
  { id: 'cond-chf', label: 'CHF', zone: 'conditions' },
  { id: 'cond-ckd', label: 'CKD', zone: 'conditions' },
];

export const PREVENTIVE_COHORTS: SankeyCohortDef[] = [
  { id: 'prev-colon-screen', label: 'Colon Screen', zone: 'preventive' },
  { id: 'prev-breast-screen', label: 'Breast Screen', zone: 'preventive' },
  { id: 'prev-immunizations', label: 'Immunizations Due', zone: 'preventive' },
];

// ============================================================================
// Helper to create date relative to today
// ============================================================================

function d(daysAgo: number): Date {
  const dt = new Date('2026-03-05');
  dt.setDate(dt.getDate() - daysAgo);
  return dt;
}

// ============================================================================
// All Patients (~45 patients)
// ============================================================================

export const ALL_PATIENTS: AllPatientsPatient[] = [
  // --- Existing patients enriched with 5-tier risk + action status ---
  // p1: Robert Martinez — high A1c, endocrine referral pending
  { patientId: 'p1', name: 'Robert Martinez', age: 58, gender: 'M',
    riskTier: 'critical', actionStatus: 'urgent', daysWaiting: 21,
    conditionAssignments: [
      { patientId: 'p1', conditionCohortId: 'cond-diabetes', diagnosisDate: d(1800), currentNodeLabel: 'Endo Referral' },
      { patientId: 'p1', conditionCohortId: 'cond-hypertension', diagnosisDate: d(2200), currentNodeLabel: 'Adjust Med' },
    ],
    preventiveAssignments: [
      { patientId: 'p1', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 50+', nextDueDate: d(-30), currentNodeLabel: 'Schedule Visit' },
    ],
    clinicalData: { lastA1c: 9.4, bp: '158/94', eGFR: 52 },
  },
  // p2: Susan Chen — stable, at goal
  { patientId: 'p2', name: 'Susan Chen', age: 62, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 3,
    conditionAssignments: [
      { patientId: 'p2', conditionCohortId: 'cond-diabetes', diagnosisDate: d(2500), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p2', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(180), nextDueDate: d(-3000), currentNodeLabel: 'Up to Date' },
      { patientId: 'p2', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(200), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 6.5, bp: '128/78', eGFR: 78 },
  },
  // p3: James Wilson — rising risk, needs med adjustment
  { patientId: 'p3', name: 'James Wilson', age: 55, gender: 'M',
    riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 14,
    conditionAssignments: [
      { patientId: 'p3', conditionCohortId: 'cond-diabetes', diagnosisDate: d(900), currentNodeLabel: 'Adjust Med' },
      { patientId: 'p3', conditionCohortId: 'cond-hypertension', diagnosisDate: d(1200), currentNodeLabel: 'BP Check' },
    ],
    preventiveAssignments: [
      { patientId: 'p3', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(400), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { lastA1c: 7.8, bp: '142/88', eGFR: 65 },
  },
  // p4: Maria Garcia — stable, awaiting lab results
  { patientId: 'p4', name: 'Maria Garcia', age: 49, gender: 'F',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 5,
    conditionAssignments: [
      { patientId: 'p4', conditionCohortId: 'cond-diabetes', diagnosisDate: d(600), currentNodeLabel: 'Await Results' },
    ],
    preventiveAssignments: [
      { patientId: 'p4', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(90), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 7.2, bp: '130/80', eGFR: 82 },
  },
  // p5: Thomas Brown — rising, overdue labs
  { patientId: 'p5', name: 'Thomas Brown', age: 67, gender: 'M',
    riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 18,
    conditionAssignments: [
      { patientId: 'p5', conditionCohortId: 'cond-diabetes', diagnosisDate: d(3000), currentNodeLabel: 'A1c Due' },
      { patientId: 'p5', conditionCohortId: 'cond-hypertension', diagnosisDate: d(3500), currentNodeLabel: 'Adjust Med' },
      { patientId: 'p5', conditionCohortId: 'cond-ckd', diagnosisDate: d(800), currentNodeLabel: 'eGFR Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p5', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(1200), currentNodeLabel: 'Schedule Screening' },
      { patientId: 'p5', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 65+', nextDueDate: d(-10), currentNodeLabel: 'Outreach Call' },
    ],
    clinicalData: { lastA1c: 8.1, bp: '150/92', eGFR: 42 },
  },
  // p6: Patricia Lee — stable, at goal
  { patientId: 'p6', name: 'Patricia Lee', age: 52, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 2,
    conditionAssignments: [
      { patientId: 'p6', conditionCohortId: 'cond-diabetes', diagnosisDate: d(400), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p6', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(300), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 6.8, bp: '122/76', eGFR: 88 },
  },
  // p7: David Kim — high risk, on insulin
  { patientId: 'p7', name: 'David Kim', age: 71, gender: 'M',
    riskTier: 'high', actionStatus: 'action-needed', daysWaiting: 28,
    conditionAssignments: [
      { patientId: 'p7', conditionCohortId: 'cond-diabetes', diagnosisDate: d(5000), currentNodeLabel: 'Endo Referral' },
      { patientId: 'p7', conditionCohortId: 'cond-chf', diagnosisDate: d(1000), currentNodeLabel: 'Cardiology Referral' },
      { patientId: 'p7', conditionCohortId: 'cond-ckd', diagnosisDate: d(700), currentNodeLabel: 'Nephrology Referral' },
    ],
    preventiveAssignments: [
      { patientId: 'p7', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(500), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { lastA1c: 8.5, bp: '146/88', eGFR: 38 },
  },
  // p8: Linda Johnson — stable
  { patientId: 'p8', name: 'Linda Johnson', age: 60, gender: 'F',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 7,
    conditionAssignments: [
      { patientId: 'p8', conditionCohortId: 'cond-diabetes', diagnosisDate: d(1500), currentNodeLabel: 'Await Results' },
      { patientId: 'p8', conditionCohortId: 'cond-hypertension', diagnosisDate: d(2000), currentNodeLabel: 'Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p8', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(180), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 6.9, bp: '134/82', eGFR: 72 },
  },
  // p9: William Taylor — high risk
  { patientId: 'p9', name: 'William Taylor', age: 45, gender: 'M',
    riskTier: 'high', actionStatus: 'action-needed', daysWaiting: 32,
    conditionAssignments: [
      { patientId: 'p9', conditionCohortId: 'cond-diabetes', diagnosisDate: d(300), currentNodeLabel: 'Order Lab' },
    ],
    preventiveAssignments: [
      { patientId: 'p9', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { lastA1c: 9.1, bp: '138/86', eGFR: 75 },
  },
  // p10: Jennifer White — stable, on Ozempic
  { patientId: 'p10', name: 'Jennifer White', age: 54, gender: 'F',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 4,
    conditionAssignments: [
      { patientId: 'p10', conditionCohortId: 'cond-diabetes', diagnosisDate: d(800), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p10', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 50+', nextDueDate: d(-60), currentNodeLabel: 'Outreach Call' },
    ],
    clinicalData: { lastA1c: 7.0, bp: '126/78', eGFR: 80 },
  },
  // p11: Michael Davis — rising risk
  { patientId: 'p11', name: 'Michael Davis', age: 63, gender: 'M',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 10,
    conditionAssignments: [
      { patientId: 'p11', conditionCohortId: 'cond-diabetes', diagnosisDate: d(1200), currentNodeLabel: 'A1c Due' },
    ],
    preventiveAssignments: [],
    clinicalData: { lastA1c: 7.5, bp: '140/86', eGFR: 62 },
  },
  // p12: Elizabeth Moore — stable
  { patientId: 'p12', name: 'Elizabeth Moore', age: 56, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 1,
    conditionAssignments: [
      { patientId: 'p12', conditionCohortId: 'cond-diabetes', diagnosisDate: d(700), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p12', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(120), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 6.4, bp: '120/74', eGFR: 85 },
  },
  // p13: Nancy Adams — stable DM, not enrolled in pathways
  { patientId: 'p13', name: 'Nancy Adams', age: 48, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 0,
    conditionAssignments: [
      { patientId: 'p13', conditionCohortId: 'cond-diabetes', diagnosisDate: d(500), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [],
    clinicalData: { lastA1c: 6.6, bp: '124/76', eGFR: 90 },
  },
  // p14: Kevin Scott — rising DM
  { patientId: 'p14', name: 'Kevin Scott', age: 61, gender: 'M',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 9,
    conditionAssignments: [
      { patientId: 'p14', conditionCohortId: 'cond-diabetes', diagnosisDate: d(1000), currentNodeLabel: 'Adjust Med' },
      { patientId: 'p14', conditionCohortId: 'cond-hypertension', diagnosisDate: d(1500), currentNodeLabel: 'Lifestyle Counseling' },
    ],
    preventiveAssignments: [
      { patientId: 'p14', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(800), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { lastA1c: 7.4, bp: '144/90', eGFR: 58 },
  },
  // p15: Sarah Taylor — stable DM
  { patientId: 'p15', name: 'Sarah Taylor', age: 50, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 2,
    conditionAssignments: [
      { patientId: 'p15', conditionCohortId: 'cond-diabetes', diagnosisDate: d(400), currentNodeLabel: 'Quarterly Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p15', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(90), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { lastA1c: 6.7, bp: '118/72', eGFR: 92 },
  },

  // --- HTN-only patients ---
  { patientId: 'p16', name: 'Andrew Mitchell', age: 64, gender: 'M',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 6,
    conditionAssignments: [
      { patientId: 'p16', conditionCohortId: 'cond-hypertension', diagnosisDate: d(2000), currentNodeLabel: 'BP Check' },
    ],
    preventiveAssignments: [
      { patientId: 'p16', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(60), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { bp: '148/94', eGFR: 68 },
  },
  { patientId: 'p17', name: 'Jessica Roberts', age: 57, gender: 'F',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 11,
    conditionAssignments: [
      { patientId: 'p17', conditionCohortId: 'cond-hypertension', diagnosisDate: d(1800), currentNodeLabel: 'Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p17', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(200), currentNodeLabel: 'Await Results' },
      { patientId: 'p17', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(150), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { bp: '152/96', eGFR: 72 },
  },
  { patientId: 'p18', name: 'Daniel Evans', age: 70, gender: 'M',
    riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 22,
    conditionAssignments: [
      { patientId: 'p18', conditionCohortId: 'cond-hypertension', diagnosisDate: d(4000), currentNodeLabel: 'Specialist Referral' },
    ],
    preventiveAssignments: [
      { patientId: 'p18', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 65+', nextDueDate: d(30), currentNodeLabel: 'Schedule Visit' },
    ],
    clinicalData: { bp: '160/98', eGFR: 55 },
  },
  { patientId: 'p19', name: 'Laura Perez', age: 53, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 1,
    conditionAssignments: [
      { patientId: 'p19', conditionCohortId: 'cond-hypertension', diagnosisDate: d(600), currentNodeLabel: 'Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p19', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(100), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { bp: '128/80', eGFR: 88 },
  },
  { patientId: 'p20', name: 'Mark Thompson', age: 66, gender: 'M',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 15,
    conditionAssignments: [
      { patientId: 'p20', conditionCohortId: 'cond-hypertension', diagnosisDate: d(3000), currentNodeLabel: 'Lifestyle Counseling' },
    ],
    preventiveAssignments: [
      { patientId: 'p20', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(400), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { bp: '146/90', eGFR: 60 },
  },

  // --- COPD patients ---
  { patientId: 'p21', name: 'Frank Nelson', age: 68, gender: 'M',
    riskTier: 'high', actionStatus: 'action-needed', daysWaiting: 25,
    conditionAssignments: [
      { patientId: 'p21', conditionCohortId: 'cond-copd', diagnosisDate: d(2500), currentNodeLabel: 'Exacerbation Follow-up' },
    ],
    preventiveAssignments: [
      { patientId: 'p21', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'COPD + Age 65+', nextDueDate: d(-15), currentNodeLabel: 'Outreach Call' },
    ],
    clinicalData: { fev1Percent: 45, exacerbationsLastYear: 3 },
  },
  { patientId: 'p22', name: 'Karen Hill', age: 72, gender: 'F',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 8,
    conditionAssignments: [
      { patientId: 'p22', conditionCohortId: 'cond-copd', diagnosisDate: d(3000), currentNodeLabel: 'Inhaler Review' },
      { patientId: 'p22', conditionCohortId: 'cond-hypertension', diagnosisDate: d(4000), currentNodeLabel: 'BP Check' },
    ],
    preventiveAssignments: [
      { patientId: 'p22', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(365), currentNodeLabel: 'Await Results' },
    ],
    clinicalData: { fev1Percent: 55, bp: '140/86', exacerbationsLastYear: 1 },
  },
  { patientId: 'p23', name: 'Gary Cooper', age: 59, gender: 'M',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 12,
    conditionAssignments: [
      { patientId: 'p23', conditionCohortId: 'cond-copd', diagnosisDate: d(1500), currentNodeLabel: 'Annual Review' },
    ],
    preventiveAssignments: [
      { patientId: 'p23', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(90), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { fev1Percent: 62, exacerbationsLastYear: 0 },
  },

  // --- Cancer screening patients ---
  { patientId: 'p24', name: 'Barbara Anderson', age: 52, gender: 'F',
    riskTier: 'low', actionStatus: 'action-needed', daysWaiting: 30,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p24', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', currentNodeLabel: 'Schedule Screening' },
      { patientId: 'p24', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 50+', nextDueDate: d(-20), currentNodeLabel: 'Outreach Call' },
      { patientId: 'p24', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(400), currentNodeLabel: 'Schedule Mammogram' },
    ],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: null },
  },
  { patientId: 'p25', name: 'Richard Thompson', age: 58, gender: 'M',
    riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 45,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p25', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(3650), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: d(3650) },
  },
  { patientId: 'p26', name: 'Margaret Clark', age: 65, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p26', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(365), currentNodeLabel: 'Up to Date' },
      { patientId: 'p26', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(180), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: d(365) },
  },
  { patientId: 'p27', name: 'Charles Wright', age: 50, gender: 'M',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 3,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p27', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(380), currentNodeLabel: 'FIT Kit Sent' },
    ],
    clinicalData: { screeningType: 'FIT', lastScreeningDate: d(380) },
  },
  { patientId: 'p28', name: 'Sandra Lopez', age: 55, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p28', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(120), currentNodeLabel: 'Up to Date' },
      { patientId: 'p28', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(90), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: d(120) },
  },

  // --- Post-discharge / care transitions patients ---
  { patientId: 'p31', name: 'George Harris', age: 74, gender: 'M',
    riskTier: 'critical', actionStatus: 'urgent', daysWaiting: 3,
    conditionAssignments: [
      { patientId: 'p31', conditionCohortId: 'cond-chf', diagnosisDate: d(2000), currentNodeLabel: 'Weight Check' },
      { patientId: 'p31', conditionCohortId: 'cond-hypertension', diagnosisDate: d(5000), currentNodeLabel: 'Adjust Med' },
    ],
    preventiveAssignments: [
      { patientId: 'p31', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 65+ + CHF', nextDueDate: d(-5), currentNodeLabel: 'Schedule Visit' },
    ],
    clinicalData: { dischargeDate: d(3), readmissionRisk: 'high', ejectionFraction: 30, bp: '162/96' },
  },
  { patientId: 'p32', name: 'Dorothy Martin', age: 68, gender: 'F',
    riskTier: 'high', actionStatus: 'monitoring', daysWaiting: 6,
    conditionAssignments: [
      { patientId: 'p32', conditionCohortId: 'cond-copd', diagnosisDate: d(1800), currentNodeLabel: 'Pulmonary Rehab' },
    ],
    preventiveAssignments: [
      { patientId: 'p32', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(600), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { dischargeDate: d(6), readmissionRisk: 'high', fev1Percent: 48 },
  },
  { patientId: 'p33', name: 'Paul Robinson', age: 55, gender: 'M',
    riskTier: 'high', actionStatus: 'not-enrolled', daysWaiting: 9,
    conditionAssignments: [
      { patientId: 'p33', conditionCohortId: 'cond-chf', diagnosisDate: d(500), currentNodeLabel: 'Echo Due' },
    ],
    preventiveAssignments: [],
    clinicalData: { dischargeDate: d(9), readmissionRisk: 'medium', ejectionFraction: 35 },
  },
  { patientId: 'p34', name: 'Helen Walker', age: 78, gender: 'F',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 2,
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: { dischargeDate: d(2), readmissionRisk: 'low' },
  },
  { patientId: 'p35', name: 'Frank Young', age: 61, gender: 'M',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p35', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(200), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { dischargeDate: d(10), readmissionRisk: 'low' },
  },

  // --- NEW patients to expand panel to ~45 ---
  // CHF patients
  { patientId: 'p36', name: 'Catherine Reed', age: 76, gender: 'F',
    riskTier: 'high', actionStatus: 'action-needed', daysWaiting: 19,
    conditionAssignments: [
      { patientId: 'p36', conditionCohortId: 'cond-chf', diagnosisDate: d(1500), currentNodeLabel: 'Diuretic Adjustment' },
      { patientId: 'p36', conditionCohortId: 'cond-hypertension', diagnosisDate: d(4000), currentNodeLabel: 'Adjust Med' },
      { patientId: 'p36', conditionCohortId: 'cond-ckd', diagnosisDate: d(800), currentNodeLabel: 'Quarterly Lab' },
    ],
    preventiveAssignments: [
      { patientId: 'p36', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'Age 65+ + CHF', nextDueDate: d(-10), currentNodeLabel: 'Schedule Visit' },
    ],
    clinicalData: { ejectionFraction: 28, bp: '156/92', eGFR: 35 },
  },
  { patientId: 'p37', name: 'Raymond Brooks', age: 70, gender: 'M',
    riskTier: 'high', actionStatus: 'monitoring', daysWaiting: 5,
    conditionAssignments: [
      { patientId: 'p37', conditionCohortId: 'cond-chf', diagnosisDate: d(900), currentNodeLabel: 'Stable Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p37', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(400), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { ejectionFraction: 40, bp: '138/84' },
  },

  // CKD patients
  { patientId: 'p38', name: 'Diane Turner', age: 65, gender: 'F',
    riskTier: 'moderate', actionStatus: 'monitoring', daysWaiting: 13,
    conditionAssignments: [
      { patientId: 'p38', conditionCohortId: 'cond-ckd', diagnosisDate: d(1200), currentNodeLabel: 'Diet Counseling' },
      { patientId: 'p38', conditionCohortId: 'cond-hypertension', diagnosisDate: d(2500), currentNodeLabel: 'Monitoring' },
    ],
    preventiveAssignments: [
      { patientId: 'p38', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(180), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: { eGFR: 42, bp: '148/90' },
  },
  { patientId: 'p39', name: 'Victor Sanchez', age: 62, gender: 'M',
    riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 20,
    conditionAssignments: [
      { patientId: 'p39', conditionCohortId: 'cond-ckd', diagnosisDate: d(600), currentNodeLabel: 'Nephrology Referral' },
      { patientId: 'p39', conditionCohortId: 'cond-diabetes', diagnosisDate: d(2000), currentNodeLabel: 'A1c Due' },
    ],
    preventiveAssignments: [
      { patientId: 'p39', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(500), currentNodeLabel: 'Schedule Screening' },
    ],
    clinicalData: { eGFR: 38, lastA1c: 7.9, bp: '152/94' },
  },

  // Additional preventive-only
  { patientId: 'p40', name: 'Angela Price', age: 51, gender: 'F',
    riskTier: 'low', actionStatus: 'all-current', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p40', preventiveCohortId: 'prev-breast-screen', eligibilityBasis: 'Age 50-74', lastScreeningDate: d(90), currentNodeLabel: 'Up to Date' },
      { patientId: 'p40', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', lastScreeningDate: d(120), currentNodeLabel: 'Up to Date' },
    ],
    clinicalData: {},
  },
  { patientId: 'p41', name: 'Steven Ward', age: 47, gender: 'M',
    riskTier: 'low', actionStatus: 'monitoring', daysWaiting: 7,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p41', preventiveCohortId: 'prev-colon-screen', eligibilityBasis: 'Age 45-75', currentNodeLabel: 'FIT Kit Sent' },
    ],
    clinicalData: {},
  },

  // Unassessed patients — new to panel, no risk tier assigned yet
  { patientId: 'p42', name: 'Olivia Torres', age: 34, gender: 'F',
    riskTier: 'unassessed', actionStatus: 'not-enrolled', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: { newToPanel: true },
  },
  { patientId: 'p43', name: 'Marcus Rivera', age: 29, gender: 'M',
    riskTier: 'unassessed', actionStatus: 'not-enrolled', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: { newToPanel: true },
  },
  { patientId: 'p44', name: 'Lisa Bennett', age: 41, gender: 'F',
    riskTier: 'unassessed', actionStatus: 'monitoring', daysWaiting: 14,
    conditionAssignments: [],
    preventiveAssignments: [
      { patientId: 'p44', preventiveCohortId: 'prev-immunizations', eligibilityBasis: 'New patient', nextDueDate: d(-30), currentNodeLabel: 'Outreach Call' },
    ],
    clinicalData: { newToPanel: true },
  },
  { patientId: 'p45', name: 'Brian Coleman', age: 38, gender: 'M',
    riskTier: 'unassessed', actionStatus: 'not-enrolled', daysWaiting: 0,
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: { newToPanel: true },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getAllPatients(): AllPatientsPatient[] {
  return ALL_PATIENTS;
}

export function getConditionLabel(conditionId: string): string {
  return CONDITION_COHORTS.find((c) => c.id === conditionId)?.label ?? conditionId;
}

export function getPreventiveLabel(preventiveId: string): string {
  return PREVENTIVE_COHORTS.find((c) => c.id === preventiveId)?.label ?? preventiveId;
}

export function getPatientById(patientId: string): AllPatientsPatient | undefined {
  return ALL_PATIENTS.find((p) => p.patientId === patientId);
}
