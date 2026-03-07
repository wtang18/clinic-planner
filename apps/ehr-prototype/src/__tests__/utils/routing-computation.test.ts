/**
 * Routing Computation Tests
 *
 * Tests for computeRoutingData, hasActiveSelection, and computeNodeConcentration.
 */

import { describe, it, expect } from 'vitest';
import {
  computeRoutingData,
  hasActiveSelection,
  computeNodeConcentration,
} from '../../utils/routing-computation';
import type {
  AllPatientsPatient,
  SankeyCohortDef,
  DimensionSelection,
} from '../../types/population-health';

// ============================================================================
// Test data factories
// ============================================================================

const EMPTY_SELECTION: DimensionSelection = {
  conditions: [],
  preventive: [],
  riskTiers: [],
  actionStatuses: [],
};

const CONDITION_DEFS: SankeyCohortDef[] = [
  { id: 'cond-diabetes', label: 'Diabetes', zone: 'conditions' },
  { id: 'cond-hypertension', label: 'Hypertension', zone: 'conditions' },
];

const PREVENTIVE_DEFS: SankeyCohortDef[] = [
  { id: 'prev-colon', label: 'Colon Screen', zone: 'preventive' },
];

function makePatient(overrides: Partial<AllPatientsPatient> & { patientId: string }): AllPatientsPatient {
  return {
    name: overrides.patientId,
    age: 50,
    gender: 'M',
    riskTier: 'low',
    actionStatus: 'all-current',
    conditionAssignments: [],
    preventiveAssignments: [],
    clinicalData: {},
    ...overrides,
  };
}

// ============================================================================
// hasActiveSelection
// ============================================================================

describe('hasActiveSelection', () => {
  it('returns false for empty selection', () => {
    expect(hasActiveSelection(EMPTY_SELECTION)).toBe(false);
  });

  it('returns true when conditions selected', () => {
    expect(hasActiveSelection({ ...EMPTY_SELECTION, conditions: ['cond-diabetes'] })).toBe(true);
  });

  it('returns true when risk tiers selected', () => {
    expect(hasActiveSelection({ ...EMPTY_SELECTION, riskTiers: ['high'] })).toBe(true);
  });

  it('returns true when multiple axes selected', () => {
    expect(hasActiveSelection({
      conditions: ['cond-diabetes'],
      preventive: [],
      riskTiers: ['high'],
      actionStatuses: [],
    })).toBe(true);
  });
});

// ============================================================================
// computeNodeConcentration
// ============================================================================

describe('computeNodeConcentration', () => {
  it('groups patients by node label and sorts descending', () => {
    const patients: AllPatientsPatient[] = [
      makePatient({
        patientId: 'p1',
        conditionAssignments: [
          { patientId: 'p1', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'A1c Due' },
        ],
      }),
      makePatient({
        patientId: 'p2',
        conditionAssignments: [
          { patientId: 'p2', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'Adjust Med' },
        ],
      }),
      makePatient({
        patientId: 'p3',
        conditionAssignments: [
          { patientId: 'p3', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'A1c Due' },
        ],
      }),
    ];

    const result = computeNodeConcentration(patients, 'cond-diabetes', true);

    expect(result).toEqual([
      { nodeLabel: 'A1c Due', patientCount: 2 },
      { nodeLabel: 'Adjust Med', patientCount: 1 },
    ]);
  });

  it('excludes patients from other cohorts', () => {
    const patients: AllPatientsPatient[] = [
      makePatient({
        patientId: 'p1',
        conditionAssignments: [
          { patientId: 'p1', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'A1c Due' },
          { patientId: 'p1', conditionCohortId: 'cond-hypertension', currentNodeLabel: 'BP Check' },
        ],
      }),
    ];

    const result = computeNodeConcentration(patients, 'cond-diabetes', true);
    expect(result).toEqual([{ nodeLabel: 'A1c Due', patientCount: 1 }]);
  });

  it('skips patients without node labels', () => {
    const patients: AllPatientsPatient[] = [
      makePatient({
        patientId: 'p1',
        conditionAssignments: [
          { patientId: 'p1', conditionCohortId: 'cond-diabetes' },
        ],
      }),
    ];

    const result = computeNodeConcentration(patients, 'cond-diabetes', true);
    expect(result).toEqual([]);
  });

  it('works for preventive cohorts', () => {
    const patients: AllPatientsPatient[] = [
      makePatient({
        patientId: 'p1',
        preventiveAssignments: [
          { patientId: 'p1', preventiveCohortId: 'prev-colon', eligibilityBasis: 'Age', currentNodeLabel: 'Schedule Screening' },
        ],
      }),
      makePatient({
        patientId: 'p2',
        preventiveAssignments: [
          { patientId: 'p2', preventiveCohortId: 'prev-colon', eligibilityBasis: 'Age', currentNodeLabel: 'Schedule Screening' },
        ],
      }),
    ];

    const result = computeNodeConcentration(patients, 'prev-colon', false);
    expect(result).toEqual([{ nodeLabel: 'Schedule Screening', patientCount: 2 }]);
  });
});

// ============================================================================
// computeRoutingData
// ============================================================================

describe('computeRoutingData', () => {
  const patients: AllPatientsPatient[] = [
    makePatient({
      patientId: 'p1', riskTier: 'critical', actionStatus: 'urgent', daysWaiting: 20,
      conditionAssignments: [
        { patientId: 'p1', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'Endo Referral' },
      ],
    }),
    makePatient({
      patientId: 'p2', riskTier: 'low', actionStatus: 'all-current', daysWaiting: 3,
      conditionAssignments: [
        { patientId: 'p2', conditionCohortId: 'cond-diabetes', currentNodeLabel: 'Quarterly Review' },
      ],
      preventiveAssignments: [
        { patientId: 'p2', preventiveCohortId: 'prev-colon', eligibilityBasis: 'Age', currentNodeLabel: 'Up to Date' },
      ],
    }),
    makePatient({
      patientId: 'p3', riskTier: 'moderate', actionStatus: 'action-needed', daysWaiting: 15,
      conditionAssignments: [
        { patientId: 'p3', conditionCohortId: 'cond-hypertension', currentNodeLabel: 'BP Check' },
      ],
    }),
    // Unenrolled patient
    makePatient({
      patientId: 'p4', riskTier: 'unassessed', actionStatus: 'not-enrolled',
    }),
  ];

  it('groups cohorts into categories (no selection)', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    expect(result.categories).toHaveLength(2);
    expect(result.categories[0].key).toBe('chronic-disease');
    expect(result.categories[1].key).toBe('preventive-care');
  });

  it('computes correct totals for condition cards', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const diabetesCard = result.categories[0].cards.find((c) => c.cohortId === 'cond-diabetes');
    expect(diabetesCard).toBeDefined();
    expect(diabetesCard!.totalPatients).toBe(2);
    expect(diabetesCard!.filteredPatients).toBe(2);
    expect(diabetesCard!.urgentCount).toBe(1);
    expect(diabetesCard!.actionNeededCount).toBe(0);
  });

  it('sorts cards by attention priority', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const cards = result.categories[0].cards;
    // Diabetes has 1 urgent, HTN has 1 action-needed — equal attention, but diabetes has more patients
    expect(cards[0].cohortId).toBe('cond-diabetes');
    expect(cards[1].cohortId).toBe('cond-hypertension');
  });

  it('computes avg days waiting', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const diabetesCard = result.categories[0].cards.find((c) => c.cohortId === 'cond-diabetes');
    // p1=20, p2=3 → avg = 12 (rounded)
    expect(diabetesCard!.avgDaysWaiting).toBe(12);
  });

  it('computes risk breakdown', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const diabetesCard = result.categories[0].cards.find((c) => c.cohortId === 'cond-diabetes');
    expect(diabetesCard!.riskBreakdown.critical).toBe(1);
    expect(diabetesCard!.riskBreakdown.low).toBe(1);
    expect(diabetesCard!.riskBreakdown.moderate).toBe(0);
  });

  it('computes action status breakdown', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const diabetesCard = result.categories[0].cards.find((c) => c.cohortId === 'cond-diabetes');
    expect(diabetesCard!.actionStatusBreakdown.urgent).toBe(1);
    expect(diabetesCard!.actionStatusBreakdown['all-current']).toBe(1);
    expect(diabetesCard!.actionStatusBreakdown.monitoring).toBe(0);
    expect(diabetesCard!.actionStatusBreakdown['action-needed']).toBe(0);
    expect(diabetesCard!.actionStatusBreakdown['not-enrolled']).toBe(0);
  });

  it('includes node concentration', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    const diabetesCard = result.categories[0].cards.find((c) => c.cohortId === 'cond-diabetes');
    expect(diabetesCard!.nodeConcentration).toHaveLength(2);
    expect(diabetesCard!.nodeConcentration[0].nodeLabel).toBeDefined();
  });

  it('identifies unenrolled patients', () => {
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, EMPTY_SELECTION);

    expect(result.unenrolled.totalCount).toBe(1);
    expect(result.unenrolled.filteredCount).toBe(1);
    expect(result.unenrolled.riskBreakdown.unassessed).toBe(1);
  });

  it('filters patients by dimension selection', () => {
    const selection: DimensionSelection = {
      conditions: ['cond-diabetes'],
      preventive: [],
      riskTiers: [],
      actionStatuses: [],
    };

    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, selection);

    // Only diabetes patients (p1, p2) match — HTN card should be hidden
    const chronicCategory = result.categories.find((c) => c.key === 'chronic-disease');
    expect(chronicCategory).toBeDefined();
    expect(chronicCategory!.cards).toHaveLength(1);
    expect(chronicCategory!.cards[0].cohortId).toBe('cond-diabetes');
    expect(chronicCategory!.cards[0].filteredPatients).toBe(2);
  });

  it('hides categories with no visible cards when filtered', () => {
    const selection: DimensionSelection = {
      conditions: [],
      preventive: [],
      riskTiers: ['critical'],
      actionStatuses: [],
    };

    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, selection);

    // Only p1 is critical — in diabetes. HTN has no critical patients → hidden.
    // Preventive: p1 has no preventive assignments → hidden.
    const preventiveCategory = result.categories.find((c) => c.key === 'preventive-care');
    expect(preventiveCategory).toBeUndefined();
  });

  it('unenrolled filtered count reflects dimension selection', () => {
    const selection: DimensionSelection = {
      conditions: [],
      preventive: [],
      riskTiers: ['unassessed'],
      actionStatuses: [],
    };

    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, selection);

    expect(result.unenrolled.filteredCount).toBe(1);
    expect(result.unenrolled.totalCount).toBe(1);
  });

  it('returns empty categories when all patients filtered out', () => {
    const selection: DimensionSelection = {
      conditions: [],
      preventive: [],
      riskTiers: [],
      actionStatuses: ['urgent'],
    };

    // Only p1 is urgent → in diabetes only
    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, selection);

    const chronicCards = result.categories.find((c) => c.key === 'chronic-disease')?.cards ?? [];
    // Only diabetes card should survive (p1 is urgent + in diabetes)
    expect(chronicCards).toHaveLength(1);
    expect(chronicCards[0].cohortId).toBe('cond-diabetes');
    expect(chronicCards[0].filteredPatients).toBe(1);
  });

  it('preserves totalPatients regardless of filter', () => {
    const selection: DimensionSelection = {
      conditions: ['cond-diabetes'],
      preventive: [],
      riskTiers: [],
      actionStatuses: [],
    };

    const result = computeRoutingData(patients, CONDITION_DEFS, PREVENTIVE_DEFS, selection);
    const diabetesCard = result.categories[0].cards[0];

    expect(diabetesCard.totalPatients).toBe(2);
    expect(diabetesCard.filteredPatients).toBe(2);
  });
});
