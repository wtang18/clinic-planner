/**
 * Tests for sankey-priority-bridge.ts
 *
 * Covers:
 * - matchesBand: condition/preventive/risk/action matching
 * - patientMatchesSelection: empty, single axis, cross-axis AND, within-axis OR
 * - deriveSankeyPriorityItems: correct items for band, dimension filtering
 * - getBandLabel: all band ID prefixes
 */

import {
  matchesBand,
  patientMatchesSelection,
  deriveSankeyPriorityItems,
  getBandLabel,
  getBandPatientCount,
} from '../../utils/sankey-priority-bridge';
import { ALL_PATIENTS } from '../../data/mock-all-patients';
import type { AllPatientsPatient, DimensionSelection } from '../../types/population-health';

const EMPTY_SELECTION: DimensionSelection = {
  conditions: [],
  preventive: [],
  riskTiers: [],
  actionStatuses: [],
};

// ============================================================================
// matchesBand
// ============================================================================

describe('matchesBand', () => {
  // p1: has cond-diabetes and cond-hypertension, prev-immunizations, risk critical, action urgent
  const p1 = ALL_PATIENTS.find((p) => p.patientId === 'p1')!;

  test('matches condition band', () => {
    expect(matchesBand(p1, 'cond-diabetes')).toBe(true);
    expect(matchesBand(p1, 'cond-hypertension')).toBe(true);
  });

  test('does not match unassigned condition', () => {
    expect(matchesBand(p1, 'cond-copd')).toBe(false);
  });

  test('matches preventive band', () => {
    expect(matchesBand(p1, 'prev-immunizations')).toBe(true);
  });

  test('does not match unassigned preventive', () => {
    expect(matchesBand(p1, 'prev-colon-screen')).toBe(false);
  });

  test('matches risk tier band', () => {
    expect(matchesBand(p1, 'risk-critical')).toBe(true);
    expect(matchesBand(p1, 'risk-low')).toBe(false);
  });

  test('matches action status band', () => {
    expect(matchesBand(p1, 'action-urgent')).toBe(true);
    expect(matchesBand(p1, 'action-all-current')).toBe(false);
  });

  test('returns false for unknown band ID prefix', () => {
    expect(matchesBand(p1, 'unknown-xyz')).toBe(false);
  });
});

// ============================================================================
// patientMatchesSelection
// ============================================================================

describe('patientMatchesSelection', () => {
  const p1 = ALL_PATIENTS.find((p) => p.patientId === 'p1')!;
  const p2 = ALL_PATIENTS.find((p) => p.patientId === 'p2')!;

  test('empty selection matches all patients', () => {
    expect(patientMatchesSelection(p1, EMPTY_SELECTION)).toBe(true);
    expect(patientMatchesSelection(p2, EMPTY_SELECTION)).toBe(true);
  });

  test('single axis: condition filter', () => {
    const sel: DimensionSelection = { ...EMPTY_SELECTION, conditions: ['cond-diabetes'] };
    expect(patientMatchesSelection(p1, sel)).toBe(true); // p1 has diabetes
    // p42 has no conditions
    const p42 = ALL_PATIENTS.find((p) => p.patientId === 'p42')!;
    expect(patientMatchesSelection(p42, sel)).toBe(false);
  });

  test('within-axis OR: multiple conditions', () => {
    const sel: DimensionSelection = { ...EMPTY_SELECTION, conditions: ['cond-copd', 'cond-diabetes'] };
    // p1 has diabetes but not COPD → matches (OR)
    expect(patientMatchesSelection(p1, sel)).toBe(true);
  });

  test('cross-axis AND: condition + risk', () => {
    // p1: diabetes + critical → matches both
    const sel1: DimensionSelection = {
      ...EMPTY_SELECTION,
      conditions: ['cond-diabetes'],
      riskTiers: ['critical'],
    };
    expect(patientMatchesSelection(p1, sel1)).toBe(true);

    // p1: diabetes + low → does NOT match (p1 is critical, not low)
    const sel2: DimensionSelection = {
      ...EMPTY_SELECTION,
      conditions: ['cond-diabetes'],
      riskTiers: ['low'],
    };
    expect(patientMatchesSelection(p1, sel2)).toBe(false);
  });

  test('action status filter', () => {
    const sel: DimensionSelection = { ...EMPTY_SELECTION, actionStatuses: ['all-current'] };
    expect(patientMatchesSelection(p2, sel)).toBe(true); // p2 is all-current
    expect(patientMatchesSelection(p1, sel)).toBe(false); // p1 is urgent
  });
});

// ============================================================================
// deriveSankeyPriorityItems
// ============================================================================

describe('deriveSankeyPriorityItems', () => {
  test('returns items for patients in a condition band', () => {
    const items = deriveSankeyPriorityItems('cond-diabetes', EMPTY_SELECTION);
    // All diabetes patients with PathwayPatient entries should produce items
    expect(items.length).toBeGreaterThan(0);
    // All items should be for patients in diabetes
    const diabetesPatientIds = ALL_PATIENTS
      .filter((p) => p.conditionAssignments.some((a) => a.conditionCohortId === 'cond-diabetes'))
      .map((p) => p.patientId);
    for (const item of items) {
      expect(diabetesPatientIds).toContain(item.patientId);
    }
  });

  test('returns items across pathways', () => {
    // p5 has diabetes + CKD → should produce items from diabetes pathway (p5 is in PathwayPatient for diabetes)
    const items = deriveSankeyPriorityItems('cond-diabetes', EMPTY_SELECTION);
    const p5Items = items.filter((i) => i.patientId === 'p5');
    expect(p5Items.length).toBeGreaterThan(0);
  });

  test('returns no items for patients without PathwayPatient entry', () => {
    // p42-p45 are unassessed, not-enrolled, no PathwayPatient entries → no priority items
    const items = deriveSankeyPriorityItems('risk-unassessed', EMPTY_SELECTION);
    expect(items.length).toBe(0);
  });

  test('dimension selection filters items', () => {
    const allItems = deriveSankeyPriorityItems('cond-diabetes', EMPTY_SELECTION);
    const filteredItems = deriveSankeyPriorityItems('cond-diabetes', {
      ...EMPTY_SELECTION,
      riskTiers: ['critical'],
    });
    // Should have fewer items when filtering by critical risk
    expect(filteredItems.length).toBeLessThanOrEqual(allItems.length);
    // All filtered items should be for critical-risk patients
    const criticalPatientIds = new Set(
      ALL_PATIENTS.filter((p) => p.riskTier === 'critical').map((p) => p.patientId),
    );
    for (const item of filteredItems) {
      expect(criticalPatientIds.has(item.patientId)).toBe(true);
    }
  });

  test('returns empty for empty band', () => {
    // No patients have an unknown band
    const items = deriveSankeyPriorityItems('cond-nonexistent', EMPTY_SELECTION);
    expect(items.length).toBe(0);
  });

  test('risk tier band aggregates across pathways', () => {
    // High-risk patients may span multiple pathways
    const items = deriveSankeyPriorityItems('risk-high', EMPTY_SELECTION);
    expect(items.length).toBeGreaterThan(0);
    const highRiskPatientIds = new Set(
      ALL_PATIENTS.filter((p) => p.riskTier === 'high').map((p) => p.patientId),
    );
    for (const item of items) {
      expect(highRiskPatientIds.has(item.patientId)).toBe(true);
    }
  });
});

// ============================================================================
// getBandLabel
// ============================================================================

describe('getBandLabel', () => {
  test('condition band', () => {
    expect(getBandLabel('cond-diabetes')).toBe('Diabetes');
  });

  test('preventive band', () => {
    expect(getBandLabel('prev-colon-screen')).toBe('Colon Screen');
  });

  test('risk tier band', () => {
    expect(getBandLabel('risk-critical')).toBe('Critical');
    expect(getBandLabel('risk-moderate')).toBe('Moderate');
  });

  test('action status band', () => {
    expect(getBandLabel('action-urgent')).toBe('Urgent');
    expect(getBandLabel('action-all-current')).toBe('All Current');
  });

  test('unknown band returns bandId', () => {
    expect(getBandLabel('foo-bar')).toBe('foo-bar');
  });
});

// ============================================================================
// getBandPatientCount
// ============================================================================

describe('getBandPatientCount', () => {
  test('returns count for known band', () => {
    const count = getBandPatientCount('cond-diabetes');
    const expected = ALL_PATIENTS.filter(
      (p) => p.conditionAssignments.some((a) => a.conditionCohortId === 'cond-diabetes'),
    ).length;
    expect(count).toBe(expected);
    expect(count).toBeGreaterThan(0);
  });

  test('returns 0 for unknown band', () => {
    expect(getBandPatientCount('cond-nonexistent')).toBe(0);
  });
});
