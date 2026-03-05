/**
 * Tests for Sankey computation engine.
 * Validates band counts, flow sums, filtering logic, and selection stats.
 */

import { describe, it, expect } from 'vitest';
import {
  computeSankeyData,
  filterSankeyData,
  filterPatients,
  computeSelectionStats,
} from '../../utils/sankey-computation';
import type {
  AllPatientsPatient,
  SankeyCohortDef,
  DimensionSelection,
} from '../../types/population-health';

// ============================================================================
// Test fixtures
// ============================================================================

const COND_DEFS: SankeyCohortDef[] = [
  { id: 'cond-dm', label: 'Diabetes', zone: 'conditions' },
  { id: 'cond-htn', label: 'Hypertension', zone: 'conditions' },
];

const PREV_DEFS: SankeyCohortDef[] = [
  { id: 'prev-colon', label: 'Colon Screen', zone: 'preventive' },
];

function makePatient(overrides: Partial<AllPatientsPatient> & Pick<AllPatientsPatient, 'patientId' | 'riskTier' | 'actionStatus'>): AllPatientsPatient {
  return {
    name: 'Test',
    age: 50,
    gender: 'M',
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: {},
    ...overrides,
  };
}

const PATIENTS: AllPatientsPatient[] = [
  // p1: DM + HTN, critical, urgent
  makePatient({
    patientId: 'p1', riskTier: 'critical', actionStatus: 'urgent',
    conditionAssignments: [
      { patientId: 'p1', conditionCohortId: 'cond-dm' },
      { patientId: 'p1', conditionCohortId: 'cond-htn' },
    ],
    preventiveAssignments: [
      { patientId: 'p1', preventiveCohortId: 'prev-colon', eligibilityBasis: 'Age' },
    ],
  }),
  // p2: DM only, low, all-current
  makePatient({
    patientId: 'p2', riskTier: 'low', actionStatus: 'all-current',
    conditionAssignments: [
      { patientId: 'p2', conditionCohortId: 'cond-dm' },
    ],
  }),
  // p3: HTN only, moderate, monitoring
  makePatient({
    patientId: 'p3', riskTier: 'moderate', actionStatus: 'monitoring',
    conditionAssignments: [
      { patientId: 'p3', conditionCohortId: 'cond-htn' },
    ],
    preventiveAssignments: [
      { patientId: 'p3', preventiveCohortId: 'prev-colon', eligibilityBasis: 'Age' },
    ],
  }),
  // p4: no conditions, high, not-enrolled
  makePatient({
    patientId: 'p4', riskTier: 'high', actionStatus: 'not-enrolled',
  }),
  // p5: DM, high, action-needed
  makePatient({
    patientId: 'p5', riskTier: 'high', actionStatus: 'action-needed',
    conditionAssignments: [
      { patientId: 'p5', conditionCohortId: 'cond-dm' },
    ],
  }),
];

const EMPTY_SELECTION: DimensionSelection = {
  conditions: [],
  preventive: [],
  riskTiers: [],
  actionStatuses: [],
};

// ============================================================================
// computeSankeyData
// ============================================================================

describe('computeSankeyData', () => {
  const data = computeSankeyData(PATIENTS, COND_DEFS, PREV_DEFS);

  it('creates condition bands with correct counts (over-counting)', () => {
    const condGroup = data.leftAxis.find((g) => g.zone === 'conditions');
    expect(condGroup).toBeDefined();
    const dmBand = condGroup!.bands.find((b) => b.id === 'cond-dm');
    const htnBand = condGroup!.bands.find((b) => b.id === 'cond-htn');
    // p1 is in both DM and HTN, so DM=3 (p1,p2,p5) HTN=2 (p1,p3)
    expect(dmBand!.count).toBe(3);
    expect(htnBand!.count).toBe(2);
  });

  it('creates preventive bands with correct counts', () => {
    const prevGroup = data.leftAxis.find((g) => g.zone === 'preventive');
    const colonBand = prevGroup!.bands.find((b) => b.id === 'prev-colon');
    expect(colonBand!.count).toBe(2); // p1, p3
  });

  it('left axis over-counts panel (due to multi-membership)', () => {
    const totalLeft = data.leftAxis.reduce(
      (sum, group) => sum + group.bands.reduce((s, b) => s + b.count, 0),
      0,
    );
    // DM(3) + HTN(2) + Colon(2) = 7, but only 5 patients
    expect(totalLeft).toBeGreaterThan(PATIENTS.length);
    expect(totalLeft).toBe(7);
  });

  it('center axis sums to panel size', () => {
    const totalCenter = data.centerAxis.reduce((s, b) => s + b.count, 0);
    expect(totalCenter).toBe(PATIENTS.length);
  });

  it('center axis bands are ordered critical → unassessed', () => {
    const ids = data.centerAxis.map((b) => b.id);
    expect(ids).toEqual([
      'risk-critical', 'risk-high', 'risk-moderate', 'risk-low', 'risk-unassessed',
    ]);
  });

  it('right axis sums to panel size', () => {
    const totalRight = data.rightAxis.reduce((s, b) => s + b.count, 0);
    expect(totalRight).toBe(PATIENTS.length);
  });

  it('right axis bands are ordered urgent → not-enrolled', () => {
    const ids = data.rightAxis.map((b) => b.id);
    expect(ids).toEqual([
      'action-urgent', 'action-action-needed', 'action-monitoring',
      'action-all-current', 'action-not-enrolled',
    ]);
  });

  it('marks attention bands on urgent and action-needed', () => {
    const urgentBand = data.rightAxis.find((b) => b.id === 'action-urgent');
    const actionBand = data.rightAxis.find((b) => b.id === 'action-action-needed');
    const monitorBand = data.rightAxis.find((b) => b.id === 'action-monitoring');
    expect(urgentBand!.attention).toBe(true);
    expect(actionBand!.attention).toBe(true);
    expect(monitorBand!.attention).toBe(false);
  });

  it('left-to-center flows sum correctly per source band', () => {
    // DM band: 3 patients split across risk tiers
    const dmFlows = data.leftToCenterFlows.filter((f) => f.sourceId === 'cond-dm');
    const dmFlowTotal = dmFlows.reduce((s, f) => s + f.patientCount, 0);
    expect(dmFlowTotal).toBe(3); // matches DM band count
  });

  it('center-to-right flows sum to panel size across all center bands', () => {
    const flowTotal = data.centerToRightFlows.reduce((s, f) => s + f.patientCount, 0);
    expect(flowTotal).toBe(PATIENTS.length);
  });

  it('flags attention on high/critical → not-enrolled flows', () => {
    const gapFlow = data.centerToRightFlows.find(
      (f) => f.sourceId === 'risk-high' && f.targetId === 'action-not-enrolled',
    );
    expect(gapFlow).toBeDefined();
    expect(gapFlow!.attention).toBe(true);
  });

  it('tracks totalPatients and totalEnrollments', () => {
    expect(data.totalPatients).toBe(5);
    // p1 has 3 assignments, p2 has 1, p3 has 2, p4 has 0, p5 has 1 = 7
    expect(data.totalEnrollments).toBe(7);
  });
});

// ============================================================================
// filterSankeyData / filterPatients
// ============================================================================

describe('filterPatients', () => {
  it('returns all patients when selection is empty', () => {
    const result = filterPatients(PATIENTS, EMPTY_SELECTION);
    expect(result.length).toBe(PATIENTS.length);
  });

  it('OR within axis: Diabetes OR Hypertension = union', () => {
    const result = filterPatients(PATIENTS, {
      ...EMPTY_SELECTION,
      conditions: ['cond-dm', 'cond-htn'],
    });
    // p1 (both), p2 (dm), p3 (htn), p5 (dm) = 4
    expect(result.length).toBe(4);
    expect(result.map((p) => p.patientId).sort()).toEqual(['p1', 'p2', 'p3', 'p5']);
  });

  it('AND across axes: condition + risk = intersection', () => {
    const result = filterPatients(PATIENTS, {
      ...EMPTY_SELECTION,
      conditions: ['cond-dm'],
      riskTiers: ['high'],
    });
    // DM patients (p1,p2,p5) intersected with high risk (p4,p5) = p5
    expect(result.length).toBe(1);
    expect(result[0].patientId).toBe('p5');
  });

  it('single axis filter works correctly', () => {
    const result = filterPatients(PATIENTS, {
      ...EMPTY_SELECTION,
      riskTiers: ['critical'],
    });
    expect(result.length).toBe(1);
    expect(result[0].patientId).toBe('p1');
  });

  it('preventive filter finds matching patients', () => {
    const result = filterPatients(PATIENTS, {
      ...EMPTY_SELECTION,
      preventive: ['prev-colon'],
    });
    expect(result.length).toBe(2); // p1, p3
  });

  it('action status filter works', () => {
    const result = filterPatients(PATIENTS, {
      ...EMPTY_SELECTION,
      actionStatuses: ['not-enrolled'],
    });
    expect(result.length).toBe(1);
    expect(result[0].patientId).toBe('p4');
  });

  it('multi-axis AND narrows correctly', () => {
    const result = filterPatients(PATIENTS, {
      conditions: ['cond-dm'],
      preventive: ['prev-colon'],
      riskTiers: ['critical'],
      actionStatuses: ['urgent'],
    });
    // Only p1 matches all four
    expect(result.length).toBe(1);
    expect(result[0].patientId).toBe('p1');
  });
});

describe('filterSankeyData', () => {
  it('filtered data center axis sums to filtered patient count', () => {
    const selection: DimensionSelection = {
      ...EMPTY_SELECTION,
      conditions: ['cond-dm'],
    };
    const data = filterSankeyData(PATIENTS, selection, COND_DEFS, PREV_DEFS);
    const totalCenter = data.centerAxis.reduce((s, b) => s + b.count, 0);
    expect(totalCenter).toBe(3); // p1, p2, p5
  });
});

// ============================================================================
// computeSelectionStats
// ============================================================================

describe('computeSelectionStats', () => {
  it('returns full panel stats when no selection', () => {
    const stats = computeSelectionStats(PATIENTS, EMPTY_SELECTION);
    expect(stats.totalPatients).toBe(5);
    expect(stats.needsAttention).toBe(2); // p1 urgent + p5 action-needed
    expect(stats.notEnrolled).toBe(1); // p4
    expect(stats.enrollmentRate).toBe('80%'); // 4/5
    expect(stats.contextLabel).toBe('Panel Overview');
  });

  it('returns filtered stats for a selection', () => {
    const stats = computeSelectionStats(PATIENTS, {
      ...EMPTY_SELECTION,
      riskTiers: ['high'],
    });
    expect(stats.totalPatients).toBe(2); // p4, p5
    expect(stats.needsAttention).toBe(1); // p5
    expect(stats.notEnrolled).toBe(1); // p4
    expect(stats.contextLabel).toContain('1 risk tier');
  });
});
