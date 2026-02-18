/**
 * Safety Checks Tests — Phase 7
 *
 * Tests for:
 * 1. Allergy checker (exact match, class match, cross-reactivity, no match, severity)
 * 2. Duplicate detector (exact, case-insensitive, different category)
 * 3. Dosage checker (in range, above range, below range, unknown drug)
 * 4. Safety selectors (allergy alert, drug interaction, per-item, combined)
 * 5. Sign-off blocker integration (critical blocks, acknowledged doesn't block)
 * 6. Acknowledge alert logs in activity log
 * 7. Drug interaction integration via findInteractions
 */

import { describe, it, expect } from 'vitest';
import type { ChartItem, MedicationItem, LabItem } from '../../types';
import type { AllergySummary } from '../../types/patient';
import type { EncounterState } from '../../state/types';
import { createInitialState } from '../../state/initialState';
import { checkAllergyConflicts } from '../../services/safety/allergy-checker';
import { checkDuplicates } from '../../services/safety/duplicate-detector';
import { checkDosageRange, parseDosageMg, getFrequencyMultiplier } from '../../services/safety/dosage-checker';
import { selectSafetyAlerts, selectSafetyAlertsForItem, selectCriticalUnacknowledgedAlerts } from '../../state/selectors/safety';
import { findInteractions } from '../../services/ai/drug-interaction/interaction-checker';

// ============================================================================
// Test Helpers
// ============================================================================

function makeMedication(overrides?: Partial<MedicationItem>): MedicationItem {
  return {
    id: 'med-1',
    category: 'medication',
    displayText: 'Test Medication',
    createdAt: new Date(),
    createdBy: { id: 'dr-1', name: 'Dr. Test' },
    modifiedAt: new Date(),
    modifiedBy: { id: 'dr-1', name: 'Dr. Test' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      drugName: 'TestDrug',
      dosage: '500 mg',
      route: 'PO',
      frequency: 'daily',
      isControlled: false,
      prescriptionType: 'new' as const,
    },
    actions: ['e-prescribe'],
    ...overrides,
  } as MedicationItem;
}

function makeLab(overrides?: Partial<LabItem>): LabItem {
  return {
    id: 'lab-1',
    category: 'lab',
    displayText: 'CBC',
    createdAt: new Date(),
    createdBy: { id: 'dr-1', name: 'Dr. Test' },
    modifiedAt: new Date(),
    modifiedBy: { id: 'dr-1', name: 'Dr. Test' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      testName: 'CBC',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
    ...overrides,
  } as LabItem;
}

const PENICILLIN_ALLERGY: AllergySummary = { allergen: 'Penicillin', reaction: 'rash', severity: 'mild' };
const SULFA_ALLERGY: AllergySummary = { allergen: 'Sulfa', reaction: 'anaphylaxis', severity: 'severe' };
const ASPIRIN_ALLERGY: AllergySummary = { allergen: 'Aspirin', reaction: 'GI upset', severity: 'moderate' };

function stateWithItems(items: ChartItem[], allergies?: AllergySummary[]): EncounterState {
  const state = createInitialState();
  for (const item of items) {
    state.entities.items[item.id] = item;
    state.relationships.itemOrder.push(item.id);
  }
  if (allergies) {
    state.context.patient = {
      id: 'p-1',
      mrn: 'MRN-001',
      demographics: { firstName: 'Test', lastName: 'Patient', dateOfBirth: new Date(), age: 50, gender: 'male' },
      clinicalSummary: {
        problemList: [],
        medications: [],
        allergies,
        recentEncounters: [],
      },
    };
  }
  return state;
}

// ============================================================================
// 1. Allergy Checker
// ============================================================================

describe('Allergy Checker', () => {
  it('detects exact allergen match', () => {
    const alerts = checkAllergyConflicts('Penicillin', [PENICILLIN_ALLERGY], 'item-1');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('allergy');
    expect(alerts[0].severity).toBe('warning'); // mild allergy → warning
  });

  it('detects same-class drug match', () => {
    const alerts = checkAllergyConflicts('Amoxicillin', [PENICILLIN_ALLERGY], 'item-1');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('allergy');
    expect(alerts[0].message).toContain('Penicillin');
  });

  it('detects cross-reactive match with info severity', () => {
    const alerts = checkAllergyConflicts('Cephalexin', [PENICILLIN_ALLERGY], 'item-1');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('info');
  });

  it('returns empty for unrelated drug', () => {
    const alerts = checkAllergyConflicts('Metformin', [PENICILLIN_ALLERGY], 'item-1');
    expect(alerts).toHaveLength(0);
  });

  it('maps severe allergy + same-class to critical', () => {
    const alerts = checkAllergyConflicts('Bactrim', [SULFA_ALLERGY], 'item-1');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });
});

// ============================================================================
// 2. Duplicate Detector
// ============================================================================

describe('Duplicate Detector', () => {
  it('detects exact text match within same category', () => {
    const item1 = makeMedication({ id: 'med-1', displayText: 'Amoxicillin 500mg TID' });
    const item2 = makeMedication({ id: 'med-2', displayText: 'Amoxicillin 500mg TID' });
    const alert = checkDuplicates(item2, [item1]);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('duplicate');
  });

  it('detects case-insensitive match', () => {
    const item1 = makeMedication({ id: 'med-1', displayText: 'amoxicillin 500mg TID' });
    const item2 = makeMedication({ id: 'med-2', displayText: 'Amoxicillin 500mg TID' });
    const alert = checkDuplicates(item2, [item1]);
    expect(alert).not.toBeNull();
  });

  it('does not flag items in different categories', () => {
    const med = makeMedication({ id: 'med-1', displayText: 'CBC' });
    const lab = makeLab({ id: 'lab-1', displayText: 'CBC' });
    const alert = checkDuplicates(lab, [med as unknown as ChartItem]);
    expect(alert).toBeNull();
  });

  it('does not flag self', () => {
    const item = makeMedication({ id: 'med-1', displayText: 'Amoxicillin' });
    const alert = checkDuplicates(item, [item]);
    expect(alert).toBeNull();
  });
});

// ============================================================================
// 3. Dosage Checker
// ============================================================================

describe('Dosage Checker', () => {
  it('returns null for dosage within range', () => {
    const med = makeMedication({
      data: { drugName: 'Metformin', dosage: '500 mg', route: 'PO', frequency: 'BID', isControlled: false, prescriptionType: 'new' as const },
    });
    expect(checkDosageRange(med)).toBeNull();
  });

  it('flags dosage above max daily', () => {
    const med = makeMedication({
      data: { drugName: 'Metformin', dosage: '1000 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const alert = checkDosageRange(med);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('dosage-range');
    expect(alert!.message).toContain('Metformin');
  });

  it('returns null for unknown drug', () => {
    const med = makeMedication({
      data: { drugName: 'UnknownDrug', dosage: '5000 mg', route: 'PO', frequency: 'daily', isControlled: false, prescriptionType: 'new' as const },
    });
    expect(checkDosageRange(med)).toBeNull();
  });

  it('flags single dose exceeding max', () => {
    const med = makeMedication({
      data: { drugName: 'Acetaminophen', dosage: '1500 mg', route: 'PO', frequency: 'PRN', isControlled: false, prescriptionType: 'new' as const },
    });
    const alert = checkDosageRange(med);
    expect(alert).not.toBeNull();
    expect(alert!.details).toContain('single dose');
  });
});

describe('Dosage Helpers', () => {
  it('parseDosageMg parses "500 mg"', () => {
    expect(parseDosageMg('500 mg')).toBe(500);
  });

  it('parseDosageMg parses "10mg"', () => {
    expect(parseDosageMg('10mg')).toBe(10);
  });

  it('getFrequencyMultiplier for BID = 2', () => {
    expect(getFrequencyMultiplier('BID')).toBe(2);
  });

  it('getFrequencyMultiplier for TID = 3', () => {
    expect(getFrequencyMultiplier('TID')).toBe(3);
  });
});

// ============================================================================
// 4. Safety Selectors
// ============================================================================

describe('Safety Selectors', () => {
  it('computes allergy alert for medication with known allergy', () => {
    const med = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([med], [PENICILLIN_ALLERGY]);
    const alerts = selectSafetyAlerts(state);
    expect(alerts.some(a => a.type === 'allergy')).toBe(true);
  });

  it('computes drug interaction alerts', () => {
    const warfarin = makeMedication({
      id: 'med-warfarin',
      data: { drugName: 'Warfarin', dosage: '5 mg', route: 'PO', frequency: 'daily', isControlled: false, prescriptionType: 'new' as const },
    });
    const ibuprofen = makeMedication({
      id: 'med-ibuprofen',
      data: { drugName: 'Ibuprofen', dosage: '400 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([warfarin, ibuprofen]);
    const alerts = selectSafetyAlerts(state);
    expect(alerts.some(a => a.type === 'drug-interaction')).toBe(true);
  });

  it('filters alerts by item ID', () => {
    const med = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([med], [PENICILLIN_ALLERGY]);
    const itemAlerts = selectSafetyAlertsForItem(state, 'med-amox');
    expect(itemAlerts.length).toBeGreaterThan(0);
    expect(itemAlerts.every(a => a.relatedItemId === 'med-amox')).toBe(true);
  });

  it('returns empty array when no medications exist', () => {
    const state = createInitialState();
    const alerts = selectSafetyAlerts(state);
    expect(alerts).toEqual([]);
  });

  it('combines allergy + interaction + dosage alerts', () => {
    const med1 = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const med2 = makeMedication({
      id: 'med-warfarin',
      data: { drugName: 'Warfarin', dosage: '5 mg', route: 'PO', frequency: 'daily', isControlled: false, prescriptionType: 'new' as const },
    });
    const med3 = makeMedication({
      id: 'med-ibuprofen',
      data: { drugName: 'Ibuprofen', dosage: '400 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([med1, med2, med3], [PENICILLIN_ALLERGY]);
    const alerts = selectSafetyAlerts(state);
    const types = new Set(alerts.map(a => a.type));
    expect(types.has('allergy')).toBe(true);
    expect(types.has('drug-interaction')).toBe(true);
  });
});

// ============================================================================
// 5. Sign-Off Blocker Integration
// ============================================================================

describe('Safety + Sign-Off Integration', () => {
  it('critical unacknowledged alerts block sign-off', () => {
    const med = makeMedication({
      id: 'med-bactrim',
      data: { drugName: 'Bactrim', dosage: '800 mg', route: 'PO', frequency: 'BID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([med], [SULFA_ALLERGY]);
    const critical = selectCriticalUnacknowledgedAlerts(state);
    expect(critical.length).toBeGreaterThan(0);
    expect(critical[0].severity).toBe('critical');
  });

  it('acknowledged critical alert does not appear in critical unacknowledged list', () => {
    const med = makeMedication({
      id: 'med-bactrim',
      data: { drugName: 'Bactrim', dosage: '800 mg', route: 'PO', frequency: 'BID', isControlled: false, prescriptionType: 'new' as const },
      activityLog: [{
        timestamp: new Date(),
        action: 'safety-acknowledged',
        actor: 'Safety Override',
        details: 'Acknowledged alert: allergy:med-bactrim:sulfa',
      }],
    });
    const state = stateWithItems([med], [SULFA_ALLERGY]);
    const critical = selectCriticalUnacknowledgedAlerts(state);
    expect(critical).toHaveLength(0);
  });

  it('warning-level alerts do not appear in critical unacknowledged', () => {
    const med = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    // Penicillin allergy is mild → warning severity
    const state = stateWithItems([med], [PENICILLIN_ALLERGY]);
    const critical = selectCriticalUnacknowledgedAlerts(state);
    expect(critical).toHaveLength(0);
  });
});

// ============================================================================
// 6. Acknowledge Alert + Activity Log
// ============================================================================

describe('Alert Acknowledgment', () => {
  it('acknowledged flag is true when activity log contains acknowledgment', () => {
    const alertId = 'allergy:med-amox:penicillin';
    const med = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
      activityLog: [{
        timestamp: new Date(),
        action: 'safety-acknowledged',
        actor: 'Safety Override',
        details: `Acknowledged alert: ${alertId}`,
      }],
    });
    const state = stateWithItems([med], [PENICILLIN_ALLERGY]);
    const alerts = selectSafetyAlertsForItem(state, 'med-amox');
    const allergyAlert = alerts.find(a => a.type === 'allergy');
    expect(allergyAlert?.acknowledged).toBe(true);
  });

  it('acknowledged flag is false when no acknowledgment in log', () => {
    const med = makeMedication({
      id: 'med-amox',
      data: { drugName: 'Amoxicillin', dosage: '500 mg', route: 'PO', frequency: 'TID', isControlled: false, prescriptionType: 'new' as const },
    });
    const state = stateWithItems([med], [PENICILLIN_ALLERGY]);
    const alerts = selectSafetyAlertsForItem(state, 'med-amox');
    const allergyAlert = alerts.find(a => a.type === 'allergy');
    expect(allergyAlert?.acknowledged).toBe(false);
  });
});

// ============================================================================
// 7. Drug Interaction Integration
// ============================================================================

describe('Drug Interaction via findInteractions', () => {
  it('finds warfarin + ibuprofen interaction', () => {
    const result = findInteractions('warfarin', 'ibuprofen');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('moderate');
  });

  it('finds SSRI + MAOI contraindication via class', () => {
    const result = findInteractions('sertraline', 'phenelzine');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
  });

  it('returns null for non-interacting pair', () => {
    const result = findInteractions('metformin', 'lisinopril');
    expect(result).toBeNull();
  });
});
