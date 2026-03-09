/**
 * Mock Population Health Data
 *
 * Realistic mock data for the population health workspace:
 * cohort groups, pathways with node graphs, patients, metrics, and alerts.
 */

import type {
  CohortGroup,
  Cohort,
  Pathway,
  PathwayPatient,
  DashboardMetric,
  DashboardAlert,
  PopHealthFilter,
  RecentPatient,
  EscalationFlag,
  PriorityItem,
} from '../types/population-health';
import { derivePriorityItems } from '../utils/priority-computation';

// ============================================================================
// Cohort Groups & Cohorts
// ============================================================================

export const COHORT_GROUPS: CohortGroup[] = [
  {
    id: 'grp-chronic',
    label: 'Chronic Disease',
    category: 'chronic-disease',
    cohortIds: ['coh-diabetes', 'coh-hypertension', 'coh-copd'],
  },
  {
    id: 'grp-preventive',
    label: 'Preventive Care',
    category: 'preventive-care',
    cohortIds: ['coh-cancer-screening', 'coh-immunization'],
  },
  {
    id: 'grp-risk',
    label: 'Risk Tiers',
    category: 'risk-tiers',
    cohortIds: ['coh-high-risk', 'coh-rising-risk', 'coh-stable'],
  },
  {
    id: 'grp-transitions',
    label: 'Care Transitions',
    category: 'care-transitions',
    cohortIds: ['coh-recent-discharge'],
  },
];

export const COHORTS: Cohort[] = [
  // Chronic Disease
  {
    id: 'coh-diabetes',
    name: 'Diabetes',
    category: 'chronic-disease',
    parentGroupId: 'grp-chronic',
    criteria: [{ field: 'diagnosis', operator: 'in', value: ['E11', 'E11.9'], label: 'Type 2 DM' }],
    patientIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15'],
    patientCount: 15,
  },
  {
    id: 'coh-hypertension',
    name: 'Hypertension',
    category: 'chronic-disease',
    parentGroupId: 'grp-chronic',
    criteria: [{ field: 'diagnosis', operator: 'in', value: ['I10'], label: 'Essential HTN' }],
    patientIds: ['p1', 'p3', 'p5', 'p8', 'p16', 'p17', 'p18', 'p19', 'p20'],
    patientCount: 9,
  },
  {
    id: 'coh-copd',
    name: 'COPD',
    category: 'chronic-disease',
    parentGroupId: 'grp-chronic',
    criteria: [{ field: 'diagnosis', operator: 'in', value: ['J44'], label: 'COPD' }],
    patientIds: ['p21', 'p22', 'p23'],
    patientCount: 3,
  },
  // Preventive Care
  {
    id: 'coh-cancer-screening',
    name: 'Cancer Screening',
    category: 'preventive-care',
    parentGroupId: 'grp-preventive',
    criteria: [{ field: 'screening_eligible', operator: 'eq', value: true, label: 'Screening eligible' }],
    patientIds: ['p2', 'p4', 'p6', 'p16', 'p17', 'p24', 'p25', 'p26', 'p27', 'p28', 'p29', 'p30'],
    patientCount: 12,
  },
  {
    id: 'coh-immunization',
    name: 'Immunization',
    category: 'preventive-care',
    parentGroupId: 'grp-preventive',
    criteria: [{ field: 'immunization_due', operator: 'eq', value: true, label: 'Immunization due' }],
    patientIds: ['p1', 'p10', 'p18', 'p24'],
    patientCount: 4,
  },
  // Risk Tiers
  {
    id: 'coh-high-risk',
    name: 'High Risk',
    category: 'risk-tiers',
    parentGroupId: 'grp-risk',
    criteria: [{ field: 'risk_tier', operator: 'eq', value: 'high', label: 'High risk' }],
    patientIds: ['p1', 'p7', 'p9', 'p31', 'p32'],
    patientCount: 5,
  },
  {
    id: 'coh-rising-risk',
    name: 'Rising Risk',
    category: 'risk-tiers',
    parentGroupId: 'grp-risk',
    criteria: [{ field: 'risk_tier', operator: 'eq', value: 'rising', label: 'Rising risk' }],
    patientIds: ['p3', 'p5', 'p11', 'p14', 'p22', 'p25', 'p33'],
    patientCount: 7,
  },
  {
    id: 'coh-stable',
    name: 'Stable',
    category: 'risk-tiers',
    parentGroupId: 'grp-risk',
    criteria: [{ field: 'risk_tier', operator: 'eq', value: 'stable', label: 'Stable' }],
    patientIds: ['p2', 'p4', 'p6', 'p8', 'p10', 'p12', 'p13', 'p15', 'p16'],
    patientCount: 9,
  },
  // Care Transitions
  {
    id: 'coh-recent-discharge',
    name: 'Recent Discharges',
    category: 'care-transitions',
    parentGroupId: 'grp-transitions',
    criteria: [{ field: 'discharge_date', operator: 'gt', value: '2026-02-01', label: 'Discharged after Feb 1' }],
    patientIds: ['p31', 'p32', 'p33', 'p34', 'p35', 'p36', 'p37', 'p38'],
    patientCount: 8,
  },
  // Category Overviews
  {
    id: 'coh-chronic-overview',
    name: 'Chronic Disease Overview',
    category: 'overview',
    criteria: [],
    patientIds: [],
    patientCount: 27,
  },
  {
    id: 'coh-preventive-overview',
    name: 'Preventive Care Overview',
    category: 'overview',
    criteria: [],
    patientIds: [],
    patientCount: 16,
  },
  {
    id: 'coh-risk-overview',
    name: 'Risk Tiers Overview',
    category: 'overview',
    criteria: [],
    patientIds: [],
    patientCount: 21,
  },
  {
    id: 'coh-transitions-overview',
    name: 'Care Transitions Overview',
    category: 'overview',
    criteria: [],
    patientIds: [],
    patientCount: 8,
  },
];

// ============================================================================
// Pathways
// ============================================================================

export const PATHWAYS: Pathway[] = [
  // --- Diabetes A1c Pathway (7 columns, ~15 patients) ---
  {
    id: 'pw-diabetes-a1c',
    name: 'Diabetes A1c Management',
    cohortId: 'coh-diabetes',
    status: 'active',
    description: 'Quarterly A1c monitoring with escalation for uncontrolled patients',
    nodes: [
      { id: 'da-1', type: 'cohort-source', label: 'Diabetes Cohort', columnIndex: 0, verticalPosition: 0, pills: [{ label: '15 pts' }], config: {}, patientCount: 15, lifecycleState: 'active',
        flowState: { inbound: { natural: 15, error: 0 }, atStage: { inProgress: 15, waiting: 0, error: 0 }, outbound: { completed: 15 } } },
      { id: 'da-2', type: 'filter', label: 'A1c Due', description: 'Last A1c > 90 days ago', columnIndex: 1, verticalPosition: 0, pills: [{ label: '9 pts' }], config: { field: 'last_a1c_date', threshold: 90 }, patientCount: 9, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 15, error: 0 }, atStage: { inProgress: 2, waiting: 0, error: 0 }, outbound: { completed: 9, byPath: { due: 9, current: 6 } }, throughput: { avgDaysInStage: 1, patientsPerDay: 0.5 } } },
      { id: 'da-3', type: 'action', label: 'Order A1c Lab', columnIndex: 2, verticalPosition: 0, pills: [{ label: '5 pending' }], config: { orderType: 'lab', code: '83036' }, patientCount: 5, lifecycleState: 'active', assignedProviderId: 'prov-ma-chen',
        flowState: { inbound: { natural: 9, error: 0 }, atStage: { inProgress: 5, waiting: 0, error: 0 }, outbound: { completed: 4 }, throughput: { avgDaysInStage: 3, patientsPerDay: 0.3 } } },
      { id: 'da-4', type: 'wait-monitor', label: 'Await Results', description: 'Monitor for lab completion', columnIndex: 3, verticalPosition: 0, pills: [{ label: '3 waiting', variant: 'info' }], config: { waitDays: 14 }, patientCount: 3, lifecycleState: 'active',
        flowState: { inbound: { natural: 5, error: 0 }, atStage: { inProgress: 0, waiting: 3, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 7, patientsPerDay: 0.2 } } },
      { id: 'da-5', type: 'branch', label: 'A1c Result', description: 'Route based on A1c value', columnIndex: 4, verticalPosition: 0, pills: [], config: { field: 'a1c_value', thresholds: [7, 9] }, patientCount: 6, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 6, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 6, byPath: { 'lt-7': 2, '7-9': 3, 'gt-9': 1 } } } },
      { id: 'da-6a', type: 'action', label: 'Continue Current Tx', description: 'A1c < 7%', columnIndex: 5, verticalPosition: 0, pills: [{ label: '< 7%' }], config: {}, patientCount: 2, lifecycleState: 'active',
        flowState: { inbound: { natural: 2, error: 0 }, atStage: { inProgress: 2, waiting: 0, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 1 } } },
      { id: 'da-6b', type: 'action', label: 'Adjust Medication', description: 'A1c 7-9%', columnIndex: 5, verticalPosition: 1, pills: [{ label: '7-9%', variant: 'warning' }], config: {}, patientCount: 3, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 3, error: 0 }, atStage: { inProgress: 3, waiting: 0, error: 0 }, outbound: { completed: 1 }, throughput: { avgDaysInStage: 5, patientsPerDay: 0.1 } } },
      { id: 'da-6c', type: 'escalation', label: 'Endocrine Referral', description: 'A1c > 9%', columnIndex: 5, verticalPosition: 2, pills: [{ label: '> 9%', variant: 'warning' }, { label: '1 urgent' }], config: {}, patientCount: 1, gapCount: 1, lifecycleState: 'paused',
        flowState: { inbound: { natural: 1, error: 0 }, atStage: { inProgress: 0, waiting: 1, error: 0 }, outbound: { completed: 0 }, throughput: { avgDaysInStage: 18 } } },
      { id: 'da-7', type: 'metric', label: 'Quarterly Review', columnIndex: 6, verticalPosition: 0, pills: [{ label: '87% in range' }], config: {}, patientCount: 15, lifecycleState: 'active',
        flowState: { inbound: { natural: 5, error: 0 }, atStage: { inProgress: 15, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
      { id: 'da-8', type: 'loop-reference', label: 'Repeat in 90 days', columnIndex: 6, verticalPosition: 1, pills: [], config: { targetNodeId: 'da-2' }, lifecycleState: 'active' },
      // Draft node — testing CGM pathway
      { id: 'da-cgm', type: 'action', label: 'CGM Trial', description: 'Testing continuous glucose monitoring pathway', columnIndex: 5, verticalPosition: 3, pills: [{ label: 'draft' }], config: { deviceType: 'CGM' }, patientCount: 0, lifecycleState: 'draft',
        flowState: { inbound: { natural: 0, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
    ],
    connections: [
      { id: 'dc-1', sourceNodeId: 'da-1', targetNodeId: 'da-2', patientCount: 15 },
      { id: 'dc-2', sourceNodeId: 'da-2', targetNodeId: 'da-3', patientCount: 9 },
      { id: 'dc-3', sourceNodeId: 'da-3', targetNodeId: 'da-4', patientCount: 5 },
      { id: 'dc-4', sourceNodeId: 'da-4', targetNodeId: 'da-5', patientCount: 6 },
      { id: 'dc-5a', sourceNodeId: 'da-5', targetNodeId: 'da-6a', label: '< 7%', patientCount: 2 },
      { id: 'dc-5b', sourceNodeId: 'da-5', targetNodeId: 'da-6b', label: '7-9%', patientCount: 3 },
      { id: 'dc-5c', sourceNodeId: 'da-5', targetNodeId: 'da-6c', label: '> 9%', patientCount: 1 },
      { id: 'dc-6', sourceNodeId: 'da-6a', targetNodeId: 'da-7' },
      { id: 'dc-7', sourceNodeId: 'da-6b', targetNodeId: 'da-7' },
      { id: 'dc-8', sourceNodeId: 'da-7', targetNodeId: 'da-8' },
    ],
  },

  // --- Colon Cancer Screening Pathway (6 columns, ~12 patients) ---
  {
    id: 'pw-colon-screening',
    name: 'Colon Cancer Screening',
    cohortId: 'coh-cancer-screening',
    status: 'active',
    description: 'Age-based colorectal cancer screening with follow-up tracking',
    nodes: [
      { id: 'cs-1', type: 'cohort-source', label: 'Screening Cohort', columnIndex: 0, verticalPosition: 0, pills: [{ label: '12 pts' }], config: {}, patientCount: 12, lifecycleState: 'active',
        flowState: { inbound: { natural: 12, error: 0 }, atStage: { inProgress: 12, waiting: 0, error: 0 }, outbound: { completed: 12 } } },
      { id: 'cs-2', type: 'filter', label: 'Age Eligible', description: '45-75 years', columnIndex: 1, verticalPosition: 0, pills: [{ label: '10 eligible' }], config: { ageMin: 45, ageMax: 75 }, patientCount: 10, lifecycleState: 'active',
        flowState: { inbound: { natural: 12, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 10, byPath: { eligible: 10, ineligible: 2 } }, throughput: { avgDaysInStage: 1 } } },
      { id: 'cs-3', type: 'branch', label: 'Screening Status', columnIndex: 2, verticalPosition: 0, pills: [], config: {}, patientCount: 10, lifecycleState: 'active',
        flowState: { inbound: { natural: 10, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 10, byPath: { overdue: 4, fit_due: 3, current: 3 } } } },
      { id: 'cs-4a', type: 'action', label: 'Schedule Colonoscopy', description: 'Never screened or overdue', columnIndex: 3, verticalPosition: 0, pills: [{ label: '4 overdue', variant: 'warning' }], config: {}, patientCount: 4, gapCount: 4, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 4, error: 0 }, atStage: { inProgress: 2, waiting: 2, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 14, patientsPerDay: 0.1 } } },
      { id: 'cs-4b', type: 'action', label: 'FIT Test Reminder', description: 'Annual FIT alternative', columnIndex: 3, verticalPosition: 1, pills: [{ label: '3 due' }], config: {}, patientCount: 3, lifecycleState: 'active', assignedProviderId: 'prov-ma-chen',
        flowState: { inbound: { natural: 3, error: 0 }, atStage: { inProgress: 3, waiting: 0, error: 0 }, outbound: { completed: 1 }, throughput: { avgDaysInStage: 7 } } },
      { id: 'cs-4c', type: 'wait-monitor', label: 'Up to Date', description: 'No action needed', columnIndex: 3, verticalPosition: 2, pills: [{ label: '3 current' }], config: {}, patientCount: 3, lifecycleState: 'active',
        flowState: { inbound: { natural: 3, error: 0 }, atStage: { inProgress: 0, waiting: 3, error: 0 }, outbound: { completed: 0 } } },
      { id: 'cs-5', type: 'action', label: 'Patient Contact', description: 'Outreach for scheduling', columnIndex: 4, verticalPosition: 0, pills: [{ label: '2 contacted' }], config: {}, patientCount: 2, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 2, error: 0 }, atStage: { inProgress: 2, waiting: 0, error: 0 }, outbound: { completed: 1 }, throughput: { avgDaysInStage: 10 } } },
      { id: 'cs-6', type: 'metric', label: 'Screening Rate', columnIndex: 5, verticalPosition: 0, pills: [{ label: '72%' }], config: {}, patientCount: 12, lifecycleState: 'active',
        flowState: { inbound: { natural: 6, error: 0 }, atStage: { inProgress: 12, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
      // GI Referral — paused (capacity constraints)
      { id: 'cs-gi-ref', type: 'escalation', label: 'GI Referral', description: 'Abnormal FIT results', columnIndex: 4, verticalPosition: 1, pills: [{ label: 'paused' }], config: {}, patientCount: 0, lifecycleState: 'paused',
        flowState: { inbound: { natural: 0, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
    ],
    connections: [
      { id: 'cc-1', sourceNodeId: 'cs-1', targetNodeId: 'cs-2', patientCount: 12 },
      { id: 'cc-2', sourceNodeId: 'cs-2', targetNodeId: 'cs-3', patientCount: 10 },
      { id: 'cc-3a', sourceNodeId: 'cs-3', targetNodeId: 'cs-4a', label: 'Overdue', patientCount: 4 },
      { id: 'cc-3b', sourceNodeId: 'cs-3', targetNodeId: 'cs-4b', label: 'FIT due', patientCount: 3 },
      { id: 'cc-3c', sourceNodeId: 'cs-3', targetNodeId: 'cs-4c', label: 'Current', patientCount: 3 },
      { id: 'cc-4', sourceNodeId: 'cs-4a', targetNodeId: 'cs-5', patientCount: 2 },
      { id: 'cc-5', sourceNodeId: 'cs-5', targetNodeId: 'cs-6' },
      { id: 'cc-6', sourceNodeId: 'cs-4b', targetNodeId: 'cs-6' },
      { id: 'cc-7', sourceNodeId: 'cs-4c', targetNodeId: 'cs-6' },
    ],
  },

  // --- Post-Discharge Follow-up Pathway (7 columns, ~8 patients) ---
  {
    id: 'pw-post-discharge',
    name: 'Post-Discharge Follow-up',
    cohortId: 'coh-recent-discharge',
    status: 'active',
    description: 'Structured follow-up within 7 days of hospital discharge',
    nodes: [
      { id: 'pd-1', type: 'cohort-source', label: 'Recent Discharges', columnIndex: 0, verticalPosition: 0, pills: [{ label: '8 pts' }], config: {}, patientCount: 8, lifecycleState: 'active',
        flowState: { inbound: { natural: 8, error: 0 }, atStage: { inProgress: 8, waiting: 0, error: 0 }, outbound: { completed: 8 } } },
      { id: 'pd-2', type: 'filter', label: 'High Readmit Risk', description: 'LACE score ≥ 10', columnIndex: 1, verticalPosition: 0, pills: [{ label: '3 high risk', variant: 'warning' }], config: { laceThreshold: 10 }, patientCount: 3, lifecycleState: 'active',
        flowState: { inbound: { natural: 8, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 8, byPath: { high: 3, standard: 5 } }, throughput: { avgDaysInStage: 0.5 } } },
      { id: 'pd-3a', type: 'action', label: '48h Phone Call', description: 'Prioritized outreach', columnIndex: 2, verticalPosition: 0, pills: [{ label: '2 pending' }], config: { timeframe: '48h' }, patientCount: 2, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 3, error: 0 }, atStage: { inProgress: 2, waiting: 0, error: 0 }, outbound: { completed: 1 }, throughput: { avgDaysInStage: 2, patientsPerDay: 0.5 } } },
      { id: 'pd-3b', type: 'action', label: '72h Phone Call', description: 'Standard outreach', columnIndex: 2, verticalPosition: 1, pills: [{ label: '3 pending' }], config: { timeframe: '72h' }, patientCount: 3, lifecycleState: 'active', assignedProviderId: 'prov-ma-chen',
        flowState: { inbound: { natural: 5, error: 0 }, atStage: { inProgress: 3, waiting: 0, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 3, patientsPerDay: 0.3 } } },
      { id: 'pd-4', type: 'action', label: '7-day Visit', description: 'In-person follow-up', columnIndex: 3, verticalPosition: 0, pills: [{ label: '4 scheduled' }], config: {}, patientCount: 4, lifecycleState: 'active', assignedProviderId: 'prov-current',
        flowState: { inbound: { natural: 3, error: 0 }, atStage: { inProgress: 2, waiting: 2, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 4, patientsPerDay: 0.3 } } },
      { id: 'pd-5', type: 'branch', label: 'Med Reconciliation', columnIndex: 4, verticalPosition: 0, pills: [], config: {}, patientCount: 4, lifecycleState: 'active',
        flowState: { inbound: { natural: 4, error: 0 }, atStage: { inProgress: 1, waiting: 0, error: 0 }, outbound: { completed: 3, byPath: { reconciled: 2, discrepancy: 1 } } } },
      { id: 'pd-6a', type: 'action', label: 'Meds Reconciled', description: 'No discrepancies', columnIndex: 5, verticalPosition: 0, pills: [{ label: '2 done' }], config: {}, patientCount: 2, lifecycleState: 'active',
        flowState: { inbound: { natural: 2, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 2 }, throughput: { avgDaysInStage: 1 } } },
      { id: 'pd-6b', type: 'escalation', label: 'Med Discrepancy', description: 'Needs provider review', columnIndex: 5, verticalPosition: 1, pills: [{ label: '1 alert', variant: 'warning' }], config: {}, patientCount: 1, gapCount: 1, lifecycleState: 'active',
        flowState: { inbound: { natural: 1, error: 0 }, atStage: { inProgress: 1, waiting: 0, error: 0 }, outbound: { completed: 0 }, throughput: { avgDaysInStage: 3 } } },
      { id: 'pd-7', type: 'metric', label: '30-day Readmission', columnIndex: 6, verticalPosition: 0, pills: [{ label: '12.5%' }], config: {}, patientCount: 8, lifecycleState: 'active',
        flowState: { inbound: { natural: 2, error: 0 }, atStage: { inProgress: 8, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
      // Draft node — remote monitoring pilot
      { id: 'pd-remote', type: 'action', label: 'Remote Monitoring', description: 'Testing RPM pathway for high-risk discharges', columnIndex: 3, verticalPosition: 1, pills: [{ label: 'draft' }], config: { monitorType: 'RPM' }, patientCount: 0, lifecycleState: 'draft',
        flowState: { inbound: { natural: 0, error: 0 }, atStage: { inProgress: 0, waiting: 0, error: 0 }, outbound: { completed: 0 } } },
    ],
    connections: [
      { id: 'pc-1', sourceNodeId: 'pd-1', targetNodeId: 'pd-2', patientCount: 8 },
      { id: 'pc-2a', sourceNodeId: 'pd-2', targetNodeId: 'pd-3a', label: 'High risk', patientCount: 3 },
      { id: 'pc-2b', sourceNodeId: 'pd-1', targetNodeId: 'pd-3b', label: 'Standard', patientCount: 5 },
      { id: 'pc-3a', sourceNodeId: 'pd-3a', targetNodeId: 'pd-4', patientCount: 2 },
      { id: 'pc-3b', sourceNodeId: 'pd-3b', targetNodeId: 'pd-4', patientCount: 3 },
      { id: 'pc-4', sourceNodeId: 'pd-4', targetNodeId: 'pd-5', patientCount: 4 },
      { id: 'pc-5a', sourceNodeId: 'pd-5', targetNodeId: 'pd-6a', label: 'OK', patientCount: 2 },
      { id: 'pc-5b', sourceNodeId: 'pd-5', targetNodeId: 'pd-6b', label: 'Issue', patientCount: 1 },
      { id: 'pc-6', sourceNodeId: 'pd-6a', targetNodeId: 'pd-7' },
    ],
  },
];

// ============================================================================
// Mock Patients
// ============================================================================

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000);

export const MOCK_POP_HEALTH_PATIENTS: PathwayPatient[] = [
  // Diabetes patients
  { patientId: 'p1', name: 'Robert Martinez', age: 58, gender: 'M', riskTier: 'high',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-6c', stageEntryDate: d(12), status: 'escalated', history: [
      { nodeId: 'da-1', action: 'Enrolled', date: d(180), result: 'Auto-enrolled' },
      { nodeId: 'da-3', action: 'Lab ordered', date: d(45), result: 'Order sent' },
      { nodeId: 'da-5', action: 'Result: 9.4%', date: d(30), result: 'Above threshold' },
      { nodeId: 'da-6c', action: 'Referral initiated', date: d(12), result: 'Pending scheduling' },
    ]}],
    clinicalData: { lastA1c: 9.4, a1cDate: d(30), currentMeds: ['Metformin 1000mg', 'Glipizide 10mg'], insulinStatus: 'Not on insulin', lastVisit: d(30) },
  },
  { patientId: 'p2', name: 'Susan Chen', age: 62, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-6a', stageEntryDate: d(20), status: 'active', history: [
      { nodeId: 'da-1', action: 'Enrolled', date: d(365), result: 'Auto-enrolled' },
      { nodeId: 'da-5', action: 'Result: 6.5%', date: d(20), result: 'At goal' },
    ]}],
    clinicalData: { lastA1c: 6.5, a1cDate: d(20), currentMeds: ['Metformin 500mg'], insulinStatus: 'Not on insulin', lastVisit: d(20) },
  },
  { patientId: 'p3', name: 'James Wilson', age: 55, gender: 'M', riskTier: 'rising',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-6b', stageEntryDate: d(15), status: 'active', history: [
      { nodeId: 'da-5', action: 'Result: 7.8%', date: d(15), result: 'Needs adjustment' },
    ]}],
    clinicalData: { lastA1c: 7.8, a1cDate: d(15), currentMeds: ['Metformin 1000mg'], insulinStatus: 'Not on insulin', lastVisit: d(45) },
  },
  { patientId: 'p4', name: 'Maria Garcia', age: 49, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-4', stageEntryDate: d(5), status: 'active', history: [
      { nodeId: 'da-3', action: 'Lab ordered', date: d(8), result: 'Order sent' },
    ]}],
    clinicalData: { lastA1c: 7.2, a1cDate: d(95), currentMeds: ['Metformin 850mg', 'Jardiance 10mg'], insulinStatus: 'Not on insulin', lastVisit: d(60) },
  },
  { patientId: 'p5', name: 'Thomas Brown', age: 67, gender: 'M', riskTier: 'rising',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-3', stageEntryDate: d(3), status: 'active', history: [
      { nodeId: 'da-2', action: 'Flagged due', date: d(5) },
    ]}],
    clinicalData: { lastA1c: 8.1, a1cDate: d(100), currentMeds: ['Metformin 1000mg', 'Glimepiride 4mg'], insulinStatus: 'Not on insulin', lastVisit: d(90) },
  },
  { patientId: 'p6', name: 'Patricia Lee', age: 52, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-6a', stageEntryDate: d(30), status: 'active', history: [
      { nodeId: 'da-5', action: 'Result: 6.8%', date: d(30), result: 'At goal' },
    ]}],
    clinicalData: { lastA1c: 6.8, a1cDate: d(30), currentMeds: ['Metformin 500mg'], insulinStatus: 'Not on insulin', lastVisit: d(30) },
  },
  { patientId: 'p7', name: 'David Kim', age: 71, gender: 'M', riskTier: 'high',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-6b', stageEntryDate: d(10), status: 'active', history: [
      { nodeId: 'da-5', action: 'Result: 8.5%', date: d(10), result: 'Needs adjustment' },
    ]}],
    clinicalData: { lastA1c: 8.5, a1cDate: d(10), currentMeds: ['Metformin 1000mg', 'Insulin Glargine 20u'], insulinStatus: 'On insulin', lastVisit: d(14) },
  },
  { patientId: 'p8', name: 'Linda Johnson', age: 60, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-2', stageEntryDate: d(2), status: 'active', history: [] }],
    clinicalData: { lastA1c: 6.9, a1cDate: d(92), currentMeds: ['Metformin 750mg'], insulinStatus: 'Not on insulin', lastVisit: d(85) },
  },
  { patientId: 'p9', name: 'William Taylor', age: 45, gender: 'M', riskTier: 'high',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-3', stageEntryDate: d(7), status: 'active', history: [] }],
    clinicalData: { lastA1c: 9.1, a1cDate: d(105), currentMeds: ['Metformin 1000mg'], insulinStatus: 'Not on insulin', lastVisit: d(100) },
  },
  { patientId: 'p10', name: 'Jennifer White', age: 54, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-4', stageEntryDate: d(4), status: 'active', history: [] }],
    clinicalData: { lastA1c: 7.0, a1cDate: d(98), currentMeds: ['Metformin 500mg', 'Ozempic 0.5mg'], insulinStatus: 'Not on insulin', lastVisit: d(60) },
  },
  { patientId: 'p11', name: 'Michael Davis', age: 63, gender: 'M', riskTier: 'rising',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-3', stageEntryDate: d(1), status: 'active', history: [] }],
    clinicalData: { lastA1c: 7.5, a1cDate: d(110), currentMeds: ['Metformin 1000mg'], insulinStatus: 'Not on insulin', lastVisit: d(90) },
  },
  { patientId: 'p12', name: 'Elizabeth Moore', age: 56, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-diabetes-a1c', currentNodeId: 'da-7', stageEntryDate: d(60), status: 'active', history: [] }],
    clinicalData: { lastA1c: 6.4, a1cDate: d(60), currentMeds: ['Metformin 500mg'], insulinStatus: 'Not on insulin', lastVisit: d(55) },
  },

  // Cancer screening patients
  { patientId: 'p24', name: 'Barbara Anderson', age: 52, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-colon-screening', currentNodeId: 'cs-4a', stageEntryDate: d(30), status: 'active', history: [
      { nodeId: 'cs-3', action: 'Identified overdue', date: d(30) },
    ]}],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: null, eligibility: 'Age 45-75', declineCount: 0 },
  },
  { patientId: 'p25', name: 'Richard Thompson', age: 58, gender: 'M', riskTier: 'rising',
    pathways: [{ pathwayId: 'pw-colon-screening', currentNodeId: 'cs-5', stageEntryDate: d(14), status: 'active', history: [
      { nodeId: 'cs-4a', action: 'Outreach attempt #1', date: d(21) },
      { nodeId: 'cs-5', action: 'Contacted — scheduling', date: d(14) },
    ]}],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: d(3650), eligibility: 'Age 45-75', declineCount: 1 },
  },
  { patientId: 'p26', name: 'Margaret Clark', age: 65, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-colon-screening', currentNodeId: 'cs-4c', stageEntryDate: d(180), status: 'active', history: [] }],
    clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: d(365), eligibility: 'Age 45-75', declineCount: 0 },
  },
  { patientId: 'p27', name: 'Charles Wright', age: 50, gender: 'M', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-colon-screening', currentNodeId: 'cs-4b', stageEntryDate: d(10), status: 'active', history: [] }],
    clinicalData: { screeningType: 'FIT', lastScreeningDate: d(380), eligibility: 'Age 45-75', declineCount: 0 },
  },

  // Post-discharge patients
  { patientId: 'p31', name: 'George Harris', age: 74, gender: 'M', riskTier: 'high',
    pathways: [{ pathwayId: 'pw-post-discharge', currentNodeId: 'pd-3a', stageEntryDate: d(2), status: 'active', history: [
      { nodeId: 'pd-1', action: 'Discharged', date: d(3), result: 'CHF exacerbation' },
      { nodeId: 'pd-2', action: 'LACE score: 14', date: d(3), result: 'High risk' },
    ]}],
    clinicalData: { dischargeDate: d(3), daysSinceDischarge: 3, readmissionRisk: 'high', followUpStatus: 'Phone call pending' },
  },
  { patientId: 'p32', name: 'Dorothy Martin', age: 68, gender: 'F', riskTier: 'high',
    pathways: [{ pathwayId: 'pw-post-discharge', currentNodeId: 'pd-4', stageEntryDate: d(5), status: 'active', history: [
      { nodeId: 'pd-1', action: 'Discharged', date: d(6), result: 'Pneumonia' },
      { nodeId: 'pd-3a', action: 'Phone call completed', date: d(4), result: 'Stable, visit scheduled' },
    ]}],
    clinicalData: { dischargeDate: d(6), daysSinceDischarge: 6, readmissionRisk: 'high', followUpStatus: 'Visit scheduled' },
  },
  { patientId: 'p33', name: 'Paul Robinson', age: 55, gender: 'M', riskTier: 'rising',
    pathways: [{ pathwayId: 'pw-post-discharge', currentNodeId: 'pd-6b', stageEntryDate: d(1), status: 'escalated', history: [
      { nodeId: 'pd-4', action: '7-day visit completed', date: d(2), result: 'Med discrepancy found' },
      { nodeId: 'pd-6b', action: 'Escalated for review', date: d(1), result: 'Missing beta-blocker' },
    ]}],
    clinicalData: { dischargeDate: d(9), daysSinceDischarge: 9, readmissionRisk: 'medium', followUpStatus: 'Med reconciliation issue' },
  },
  { patientId: 'p34', name: 'Helen Walker', age: 78, gender: 'F', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-post-discharge', currentNodeId: 'pd-3b', stageEntryDate: d(1), status: 'active', history: [
      { nodeId: 'pd-1', action: 'Discharged', date: d(2), result: 'Hip replacement' },
    ]}],
    clinicalData: { dischargeDate: d(2), daysSinceDischarge: 2, readmissionRisk: 'low', followUpStatus: 'Phone call pending' },
  },
  { patientId: 'p35', name: 'Frank Young', age: 61, gender: 'M', riskTier: 'stable',
    pathways: [{ pathwayId: 'pw-post-discharge', currentNodeId: 'pd-6a', stageEntryDate: d(3), status: 'active', history: [
      { nodeId: 'pd-4', action: '7-day visit completed', date: d(4), result: 'All meds reconciled' },
    ]}],
    clinicalData: { dischargeDate: d(10), daysSinceDischarge: 10, readmissionRisk: 'low', followUpStatus: 'Follow-up complete' },
  },
];

// Encounter overlap: p1 (Robert Martinez) overlaps with demo-pc encounter
export const ENCOUNTER_PATIENT_MAP: Record<string, string> = {
  'p1': 'demo-pc',
  'p2': 'demo-healthy',  // Susan Chen → Dante Patterson's slot (demo)
};

// ============================================================================
// Escalation Flags (targeting the current provider for attention on non-owned nodes)
// ============================================================================

const ef = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000);

export const MOCK_ESCALATION_FLAGS: EscalationFlag[] = [
  {
    nodeId: 'da-6c',
    careFlowId: 'pw-diabetes-a1c',
    targetProviderId: 'prov-current',
    sourceItemIds: ['p1'],
    reason: 'A1c > 9% — endocrine referral needs provider sign-off',
    createdAt: ef(12),
  },
  {
    nodeId: 'pd-6b',
    careFlowId: 'pw-post-discharge',
    targetProviderId: 'prov-current',
    sourceItemIds: ['p33'],
    reason: 'Medication discrepancy found — missing beta-blocker',
    createdAt: ef(1),
  },
  {
    nodeId: 'cs-4a',
    careFlowId: 'pw-colon-screening',
    targetProviderId: 'prov-current',
    sourceItemIds: ['p24', 'p25'],
    reason: '2 patients overdue for colonoscopy scheduling',
    createdAt: ef(5),
  },
];

// ============================================================================
// Recent Patients
// ============================================================================

export const RECENT_PATIENTS: RecentPatient[] = [
  { patientId: 'p1', name: 'Robert Martinez', lastSeen: new Date('2026-03-03'), reason: 'A1c follow-up — endocrine referral pending', riskTier: 'high' },
  { patientId: 'p33', name: 'Paul Robinson', lastSeen: new Date('2026-03-02'), reason: 'Post-discharge med reconciliation — discrepancy found', riskTier: 'rising' },
  { patientId: 'p32', name: 'Dorothy Martin', lastSeen: new Date('2026-03-01'), reason: 'Post-discharge 7-day visit — stable', riskTier: 'high' },
  { patientId: 'p25', name: 'Richard Thompson', lastSeen: new Date('2026-02-28'), reason: 'Colon cancer screening outreach — scheduling', riskTier: 'rising' },
  { patientId: 'p7', name: 'David Kim', lastSeen: new Date('2026-02-27'), reason: 'A1c 8.5% — medication adjustment', riskTier: 'high' },
];

// ============================================================================
// Dashboard Metrics (pre-computed per pathway)
// ============================================================================

export const DASHBOARD_METRICS: Record<string, DashboardMetric[]> = {
  'pw-diabetes-a1c': [
    { id: 'dm-1', label: 'Total Patients', value: 15, trend: 'stable' },
    { id: 'dm-2', label: 'A1c at Goal (<7%)', value: '4 (27%)', trend: 'up', trendValue: '+1' },
    { id: 'dm-3', label: 'A1c > 9%', value: '2 (13%)', trend: 'down', trendValue: '-1' },
    { id: 'dm-4', label: 'Avg A1c', value: '7.6%', trend: 'down', trendValue: '-0.2' },
    { id: 'dm-5', label: 'Labs Pending', value: 3, trend: 'stable' },
    { id: 'dm-6', label: 'Overdue Labs', value: 5, trend: 'up', trendValue: '+2' },
  ],
  'pw-colon-screening': [
    { id: 'cs-m1', label: 'Total Eligible', value: 12, trend: 'stable' },
    { id: 'cs-m2', label: 'Screening Rate', value: '72%', trend: 'up', trendValue: '+5%' },
    { id: 'cs-m3', label: 'Overdue', value: 4, trend: 'down', trendValue: '-1' },
    { id: 'cs-m4', label: 'Pending Outreach', value: 2, trend: 'stable' },
  ],
  'pw-post-discharge': [
    { id: 'pd-m1', label: 'Recent Discharges', value: 8, trend: 'stable' },
    { id: 'pd-m2', label: '30-day Readmission', value: '12.5%', trend: 'down', trendValue: '-2.5%' },
    { id: 'pd-m3', label: 'High Risk', value: 3, trend: 'stable' },
    { id: 'pd-m4', label: 'Pending Follow-up', value: 5, trend: 'up', trendValue: '+2' },
    { id: 'pd-m5', label: 'Med Discrepancies', value: 1, trend: 'stable' },
  ],
};

// Cohort-level metrics
export const COHORT_METRICS: Record<string, DashboardMetric[]> = {
  'coh-diabetes': [
    { id: 'cm-d1', label: 'Total Patients', value: 15 },
    { id: 'cm-d2', label: 'Active Pathways', value: 1 },
    { id: 'cm-d3', label: 'Quality Measure', value: '87% compliance', trend: 'up', trendValue: '+3%' },
  ],
  'coh-cancer-screening': [
    { id: 'cm-c1', label: 'Total Patients', value: 12 },
    { id: 'cm-c2', label: 'Screening Rate', value: '72%', trend: 'up' },
  ],
  'coh-recent-discharge': [
    { id: 'cm-r1', label: 'Active Patients', value: 8 },
    { id: 'cm-r2', label: 'Readmission Rate', value: '12.5%', trend: 'down' },
  ],
};

// ============================================================================
// Dashboard Alerts
// ============================================================================

export const DASHBOARD_ALERTS: DashboardAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    message: 'Robert Martinez: A1c 9.4% — endocrine referral pending',
    pathwayId: 'pw-diabetes-a1c',
    nodeId: 'da-6c',
  },
  {
    id: 'alert-2',
    severity: 'warning',
    message: 'Paul Robinson: Medication discrepancy found during post-discharge reconciliation',
    pathwayId: 'pw-post-discharge',
    nodeId: 'pd-6b',
  },
  {
    id: 'alert-3',
    severity: 'warning',
    message: '5 patients overdue for A1c lab orders (>90 days)',
    pathwayId: 'pw-diabetes-a1c',
    nodeId: 'da-2',
  },
  {
    id: 'alert-4',
    severity: 'info',
    message: 'Colon cancer screening rate improved to 72% (+5% this quarter)',
    pathwayId: 'pw-colon-screening',
  },
];

// ============================================================================
// Default Filters (per pathway)
// ============================================================================

export const DEFAULT_PATHWAY_FILTERS: Record<string, PopHealthFilter[]> = {
  'pw-diabetes-a1c': [
    { id: 'f-da-esc', category: 'status', field: 'status', operator: 'eq', value: 'escalated', label: 'Escalated' },
  ],
  'pw-post-discharge': [
    { id: 'f-pd-high', category: 'patient-attribute', field: 'readmissionRisk', operator: 'eq', value: 'high', label: 'High Readmit Risk' },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getCohortById(cohortId: string): Cohort | undefined {
  return COHORTS.find((c) => c.id === cohortId);
}

export function getPathwayById(pathwayId: string): Pathway | undefined {
  return PATHWAYS.find((p) => p.id === pathwayId);
}

export function getPathwaysByCohort(cohortId: string): Pathway[] {
  return PATHWAYS.filter((p) => p.cohortId === cohortId);
}

export function getPatientsByPathway(pathwayId: string): PathwayPatient[] {
  return MOCK_POP_HEALTH_PATIENTS.filter((p) =>
    p.pathways.some((a) => a.pathwayId === pathwayId)
  );
}

export function getPatientsByNode(pathwayId: string, nodeId: string): PathwayPatient[] {
  return MOCK_POP_HEALTH_PATIENTS.filter((p) =>
    p.pathways.some((a) => a.pathwayId === pathwayId && a.currentNodeId === nodeId)
  );
}

export function getMetricsForPathway(pathwayId: string): DashboardMetric[] {
  return DASHBOARD_METRICS[pathwayId] ?? [];
}

export function getMetricsForCohort(cohortId: string): DashboardMetric[] {
  return COHORT_METRICS[cohortId] ?? [];
}

export function getAlertsForPathway(pathwayId: string): DashboardAlert[] {
  return DASHBOARD_ALERTS.filter((a) => a.pathwayId === pathwayId);
}

// ============================================================================
// Derived Priority Items
// ============================================================================

/** Pre-computed priority items from existing pathway/patient/escalation data */
export const MOCK_PRIORITY_ITEMS: PriorityItem[] = derivePriorityItems(
  PATHWAYS,
  MOCK_POP_HEALTH_PATIENTS,
  MOCK_ESCALATION_FLAGS,
);
