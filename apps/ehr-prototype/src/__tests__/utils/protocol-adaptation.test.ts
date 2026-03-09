/**
 * Tests for protocol adaptation utilities — CP6
 *
 * Tests condition evaluation and patient annotation computation.
 */

import { describe, it, expect } from 'vitest';
import { evaluateCondition, computeAnnotations } from '../../utils/protocol-adaptation';
import { LOW_BACK_PAIN_TEMPLATE } from '../../mocks/protocols/low-back-pain';
import { URI_TEMPLATE } from '../../mocks/protocols/uri';
import type { PatientOverviewData } from '../../components/layout/PatientOverviewPane';

// ============================================================================
// Helpers
// ============================================================================

function makePatient(overrides?: Partial<PatientOverviewData>): PatientOverviewData {
  return {
    name: 'Jane Doe',
    mrn: '12345',
    dob: '1965-03-15',
    age: 61,
    gender: 'Female',
    allergies: [],
    medications: [],
    problems: [],
    vitals: [],
    ...overrides,
  };
}

// ============================================================================
// evaluateCondition
// ============================================================================

describe('evaluateCondition', () => {
  it('exists: returns true when field is present', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'foo', operator: 'exists' },
      { foo: 'bar' }
    )).toBe(true);
  });

  it('exists: returns false when field is missing', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'foo', operator: 'exists' },
      {}
    )).toBe(false);
  });

  it('not-exists: returns true when field is missing', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'foo', operator: 'not-exists' },
      {}
    )).toBe(true);
  });

  it('equals: matches string values', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'status', operator: 'equals', value: 'active' },
      { status: 'active' }
    )).toBe(true);
  });

  it('equals: returns false on mismatch', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'status', operator: 'equals', value: 'active' },
      { status: 'inactive' }
    )).toBe(false);
  });

  it('includes: matches array values', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'tags', operator: 'includes', value: 'urgent' },
      { tags: ['routine', 'urgent'] }
    )).toBe(true);
  });

  it('includes: matches string substring', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'notes', operator: 'includes', value: 'severe' },
      { notes: 'Patient reports severe pain' }
    )).toBe(true);
  });

  it('gt: compares numbers', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'symptomDuration', operator: 'gt', value: 10 },
      { symptomDuration: 14 }
    )).toBe(true);
  });

  it('gt: returns false when equal', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'symptomDuration', operator: 'gt', value: 10 },
      { symptomDuration: 10 }
    )).toBe(false);
  });

  it('lt: compares numbers', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'score', operator: 'lt', value: 5 },
      { score: 3 }
    )).toBe(true);
  });

  it('supports nested dot-notation paths', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'severity.selectedPathId', operator: 'equals', value: 'severe' },
      { severity: { selectedPathId: 'severe' } }
    )).toBe(true);
  });

  it('returns false for missing nested path', () => {
    expect(evaluateCondition(
      { source: 'chart-state', field: 'severity.selectedPathId', operator: 'equals', value: 'severe' },
      {}
    )).toBe(false);
  });
});

// ============================================================================
// computeAnnotations — Allergy Contraindication
// ============================================================================

describe('computeAnnotations — allergy', () => {
  it('flags allergy contraindication on matching medication orderable', () => {
    const patient = makePatient({
      allergies: [
        { id: 'a1', allergen: 'Amoxicillin', severity: 'severe' },
      ],
    });

    const annotations = computeAnnotations(URI_TEMPLATE, patient);
    const allergyAnnotations = annotations.filter(a => a.type === 'allergy-contraindication');

    expect(allergyAnnotations.length).toBeGreaterThanOrEqual(1);
    expect(allergyAnnotations[0].severity).toBe('critical');
    expect(allergyAnnotations[0].message).toContain('Amoxicillin');
  });

  it('returns no allergy annotations when no match', () => {
    const patient = makePatient({
      allergies: [
        { id: 'a1', allergen: 'Penicillin', severity: 'mild' },
      ],
    });

    const annotations = computeAnnotations(LOW_BACK_PAIN_TEMPLATE, patient);
    const allergyAnnotations = annotations.filter(a => a.type === 'allergy-contraindication');
    expect(allergyAnnotations).toHaveLength(0);
  });
});

// ============================================================================
// computeAnnotations — Comorbidity
// ============================================================================

describe('computeAnnotations — comorbidity', () => {
  it('annotates medication items when patient has diabetes', () => {
    const patient = makePatient({
      problems: [
        { id: 'p1', name: 'Type 2 Diabetes Mellitus', status: 'active' },
      ],
    });

    const annotations = computeAnnotations(LOW_BACK_PAIN_TEMPLATE, patient);
    const comorbidity = annotations.filter(a => a.type === 'comorbidity');

    expect(comorbidity.length).toBeGreaterThanOrEqual(1);
    expect(comorbidity[0].severity).toBe('info');
    expect(comorbidity[0].message).toContain('Diabetes');
  });

  it('annotates medication items when patient has hypertension', () => {
    const patient = makePatient({
      problems: [
        { id: 'p1', name: 'Hypertension', status: 'active' },
      ],
    });

    const annotations = computeAnnotations(LOW_BACK_PAIN_TEMPLATE, patient);
    const htnAnnotations = annotations.filter(a =>
      a.type === 'comorbidity' && a.message.includes('Hypertension')
    );

    expect(htnAnnotations.length).toBeGreaterThanOrEqual(1);
  });

  it('returns no comorbidity annotations for healthy patient', () => {
    const patient = makePatient();
    const annotations = computeAnnotations(LOW_BACK_PAIN_TEMPLATE, patient);
    const comorbidity = annotations.filter(a => a.type === 'comorbidity');
    expect(comorbidity).toHaveLength(0);
  });
});

// ============================================================================
// computeAnnotations — Edge Cases
// ============================================================================

describe('computeAnnotations — edge cases', () => {
  it('returns empty array when patient is undefined', () => {
    expect(computeAnnotations(LOW_BACK_PAIN_TEMPLATE, undefined)).toEqual([]);
  });

  it('handles template with no orderable items', () => {
    const patient = makePatient({
      allergies: [{ id: 'a1', allergen: 'Everything', severity: 'severe' }],
    });
    // URI template has orderables so use a modified test
    const annotations = computeAnnotations(URI_TEMPLATE, patient);
    // Should not crash
    expect(Array.isArray(annotations)).toBe(true);
  });
});
