/**
 * Tests for pop health reducer — All-Patients snapshot save/restore.
 *
 * Covers COHORT_SELECTED snapshot capture, ALL_PATIENTS_SCOPE_RESTORED
 * restoration, and edge cases (cohort→cohort, no snapshot fallback).
 */

import { describe, it, expect } from 'vitest';
import {
  popHealthReducer,
  INITIAL_STATE,
  INITIAL_DIMENSION_SELECTION_VALUE,
  INITIAL_AXIS_VISIBILITY_VALUE,
} from '../../context/PopHealthContext';
import type { PopHealthAction } from '../../context/PopHealthContext';
import type { PopHealthState, DimensionSelection, AxisVisibility } from '../../types/population-health';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** State with custom dimension/axis selections (simulating user filter choices). */
function stateWithSelections(
  dimOverrides?: Partial<DimensionSelection>,
  axisOverrides?: Partial<AxisVisibility>,
): PopHealthState {
  return {
    ...INITIAL_STATE,
    dimensionSelection: {
      ...INITIAL_DIMENSION_SELECTION_VALUE,
      ...dimOverrides,
    },
    axisVisibility: {
      ...INITIAL_AXIS_VISIBILITY_VALUE,
      ...axisOverrides,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PopHealth Reducer — All-Patients Snapshot', () => {
  it('COHORT_SELECTED saves snapshot when transitioning from All Patients', () => {
    const before = stateWithSelections(
      { conditions: ['coh-diabetes'], riskTiers: ['high'] },
      { preventive: false },
    );
    // Precondition: no cohort selected (All Patients scope)
    expect(before.selectedCohortId).toBeNull();

    const after = popHealthReducer(before, {
      type: 'COHORT_SELECTED',
      cohortId: 'coh-diabetes',
    });

    // Snapshot should be captured
    expect(after.allPatientsSnapshot).not.toBeNull();
    expect(after.allPatientsSnapshot!.dimensionSelection.conditions).toEqual(['coh-diabetes']);
    expect(after.allPatientsSnapshot!.dimensionSelection.riskTiers).toEqual(['high']);
    expect(after.allPatientsSnapshot!.axisVisibility.preventive).toBe(false);

    // dimensionSelection/axisVisibility should be reset
    expect(after.dimensionSelection).toEqual(INITIAL_DIMENSION_SELECTION_VALUE);
    expect(after.axisVisibility).toEqual(INITIAL_AXIS_VISIBILITY_VALUE);
  });

  it('COHORT_SELECTED does not overwrite snapshot on cohort → cohort transition', () => {
    // Start with an existing snapshot (as if we already left All Patients)
    const originalSnapshot = {
      dimensionSelection: {
        ...INITIAL_DIMENSION_SELECTION_VALUE,
        conditions: ['coh-original'],
      },
      axisVisibility: {
        ...INITIAL_AXIS_VISIBILITY_VALUE,
        riskLevel: false,
      },
    };

    const before: PopHealthState = {
      ...INITIAL_STATE,
      selectedCohortId: 'coh-first',
      allPatientsSnapshot: originalSnapshot,
    };

    const after = popHealthReducer(before, {
      type: 'COHORT_SELECTED',
      cohortId: 'coh-second',
    });

    // Snapshot should remain the original — NOT overwritten with reset values
    expect(after.allPatientsSnapshot).toBe(originalSnapshot);
    expect(after.allPatientsSnapshot!.dimensionSelection.conditions).toEqual(['coh-original']);
  });

  it('ALL_PATIENTS_SCOPE_RESTORED restores dimensionSelection + axisVisibility from snapshot', () => {
    const snapshot = {
      dimensionSelection: {
        ...INITIAL_DIMENSION_SELECTION_VALUE,
        conditions: ['coh-diabetes'],
        preventive: ['prev-colonoscopy'],
      },
      axisVisibility: {
        ...INITIAL_AXIS_VISIBILITY_VALUE,
        actionStatus: false,
      },
    };

    const before: PopHealthState = {
      ...INITIAL_STATE,
      selectedCohortId: 'coh-diabetes',
      allPatientsSnapshot: snapshot,
      // Simulate some cohort-specific state
      selectedPathwayIds: ['pw-1'],
      selectedNodeIds: ['node-1'],
      searchQuery: 'test',
    };

    const after = popHealthReducer(before, { type: 'ALL_PATIENTS_SCOPE_RESTORED' });

    // Dimension/axis state restored from snapshot
    expect(after.dimensionSelection.conditions).toEqual(['coh-diabetes']);
    expect(after.dimensionSelection.preventive).toEqual(['prev-colonoscopy']);
    expect(after.axisVisibility.actionStatus).toBe(false);

    // Cohort-specific state reset
    expect(after.selectedCohortId).toBeNull();
    expect(after.selectedPathwayIds).toEqual([]);
    expect(after.selectedNodeIds).toEqual([]);
    expect(after.searchQuery).toBe('');
    expect(after.showMineActive).toBe(true);
  });

  it('ALL_PATIENTS_SCOPE_RESTORED clears the snapshot', () => {
    const snapshot = {
      dimensionSelection: INITIAL_DIMENSION_SELECTION_VALUE,
      axisVisibility: INITIAL_AXIS_VISIBILITY_VALUE,
    };

    const before: PopHealthState = {
      ...INITIAL_STATE,
      selectedCohortId: 'coh-diabetes',
      allPatientsSnapshot: snapshot,
    };

    const after = popHealthReducer(before, { type: 'ALL_PATIENTS_SCOPE_RESTORED' });

    expect(after.allPatientsSnapshot).toBeNull();
  });

  it('ALL_PATIENTS_SCOPE_RESTORED falls back to INITIAL when no snapshot exists', () => {
    const before: PopHealthState = {
      ...INITIAL_STATE,
      selectedCohortId: 'coh-diabetes',
      allPatientsSnapshot: null,
    };

    const after = popHealthReducer(before, { type: 'ALL_PATIENTS_SCOPE_RESTORED' });

    // Should fall back to initial values, not crash
    expect(after.dimensionSelection).toEqual(INITIAL_DIMENSION_SELECTION_VALUE);
    expect(after.axisVisibility).toEqual(INITIAL_AXIS_VISIBILITY_VALUE);
    expect(after.selectedCohortId).toBeNull();
    expect(after.allPatientsSnapshot).toBeNull();
  });

  it('CATEGORY_OVERVIEW_SELECTED also saves snapshot', () => {
    const before = stateWithSelections(
      { riskTiers: ['critical'] },
    );

    const after = popHealthReducer(before, {
      type: 'CATEGORY_OVERVIEW_SELECTED',
      category: 'chronic-disease',
    });

    expect(after.allPatientsSnapshot).not.toBeNull();
    expect(after.allPatientsSnapshot!.dimensionSelection.riskTiers).toEqual(['critical']);
    expect(after.selectedCohortId).toBe('coh-chronic-overview');
  });
});
