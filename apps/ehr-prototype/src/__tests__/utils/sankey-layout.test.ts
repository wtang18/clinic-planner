/**
 * Tests for Sankey layout engine.
 * Validates proportional heights, min height enforcement, SVG path validity,
 * and axis positioning.
 */

import { describe, it, expect } from 'vitest';
import {
  computeSankeyLayout,
  SANKEY_PADDING,
  AXIS_WIDTH,
  MIN_BAND_HEIGHT,
} from '../../utils/sankey-layout';
import { computeSankeyData } from '../../utils/sankey-computation';
import type {
  AllPatientsPatient,
  SankeyCohortDef,
  AxisVisibility,
  SankeyData,
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

function makePatient(id: string, risk: AllPatientsPatient['riskTier'], action: AllPatientsPatient['actionStatus'], conditions: string[] = []): AllPatientsPatient {
  return {
    patientId: id, name: 'Test', age: 50, gender: 'M',
    riskTier: risk, actionStatus: action,
    conditionAssignments: conditions.map((c) => ({ patientId: id, conditionCohortId: c })),
    preventiveAssignments: [],
    clinicalData: {},
  };
}

const PATIENTS: AllPatientsPatient[] = [
  makePatient('p1', 'critical', 'urgent', ['cond-dm']),
  makePatient('p2', 'high', 'action-needed', ['cond-dm', 'cond-htn']),
  makePatient('p3', 'moderate', 'monitoring', ['cond-htn']),
  makePatient('p4', 'low', 'all-current', ['cond-dm']),
  makePatient('p5', 'low', 'all-current'),
];

const ALL_VISIBLE: AxisVisibility = {
  conditions: true,
  preventive: true,
  riskLevel: true,
  actionStatus: true,
};

const CONTAINER_W = 800;
const CONTAINER_H = 600;

function getData(): SankeyData {
  return computeSankeyData(PATIENTS, COND_DEFS, PREV_DEFS);
}

// ============================================================================
// Tests
// ============================================================================

describe('computeSankeyLayout', () => {
  it('produces bands for all visible axes', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    const leftBands = layout.bands.filter((b) => b.axis === 'left');
    const centerBands = layout.bands.filter((b) => b.axis === 'center');
    const rightBands = layout.bands.filter((b) => b.axis === 'right');

    // Left: 2 conditions + 1 preventive
    expect(leftBands.length).toBe(3);
    // Center: 5 risk tiers
    expect(centerBands.length).toBe(5);
    // Right: 5 action statuses
    expect(rightBands.length).toBe(5);
  });

  it('enforces minimum band height', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    for (const band of layout.bands) {
      expect(band.height).toBeGreaterThanOrEqual(MIN_BAND_HEIGHT);
    }
  });

  it('uses correct axis width', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    for (const band of layout.bands) {
      expect(band.width).toBe(AXIS_WIDTH);
    }
  });

  it('bands stay within container bounds', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    for (const band of layout.bands) {
      expect(band.y).toBeGreaterThanOrEqual(SANKEY_PADDING.top);
      expect(band.x).toBeGreaterThanOrEqual(0);
      expect(band.x + band.width).toBeLessThanOrEqual(CONTAINER_W);
    }
  });

  it('produces valid SVG path strings for flows', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    expect(layout.flows.length).toBeGreaterThan(0);

    for (const flow of layout.flows) {
      // SVG path should start with M, use L segments (perpendicular-offset polygon), and close with Z
      expect(flow.path).toMatch(/^M\s/);
      expect(flow.path).toContain('L');
      expect(flow.path).toContain('Z');
      // Should not contain NaN or undefined
      expect(flow.path).not.toContain('NaN');
      expect(flow.path).not.toContain('undefined');
    }
  });

  it('produces a divider when both condition and preventive zones are visible', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    expect(layout.dividers.length).toBeGreaterThanOrEqual(1);
    const div = layout.dividers[0];
    expect(div.y1).toBe(div.y2); // horizontal line
  });

  it('returns empty layout when all axes hidden', () => {
    const hidden: AxisVisibility = {
      conditions: false, preventive: false, riskLevel: false, actionStatus: false,
    };
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, hidden);
    expect(layout.bands.length).toBe(0);
    expect(layout.flows.length).toBe(0);
  });

  it('handles partial axis visibility (only center)', () => {
    const centerOnly: AxisVisibility = {
      conditions: false, preventive: false, riskLevel: true, actionStatus: false,
    };
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, centerOnly);
    expect(layout.bands.length).toBe(5); // 5 risk tiers
    expect(layout.flows.length).toBe(0); // no flows without paired axes
  });

  it('label anchors are correct per axis', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    for (const band of layout.bands) {
      if (band.axis === 'left') expect(band.labelAnchor).toBe('end');
      if (band.axis === 'right') expect(band.labelAnchor).toBe('start');
      if (band.axis === 'center') expect(band.labelAnchor).toBe('middle');
    }
  });

  it('flow counts match total patients for center-to-right', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    // Center-to-right flows connect risk→action, should sum to panel size
    const crFlows = layout.flows.filter((f) =>
      f.sourceId.startsWith('risk-') && f.targetId.startsWith('action-'),
    );
    const totalCR = crFlows.reduce((s, f) => s + f.patientCount, 0);
    expect(totalCR).toBe(PATIENTS.length);
  });

  it('reports correct dimensions', () => {
    const layout = computeSankeyLayout(getData(), CONTAINER_W, CONTAINER_H, ALL_VISIBLE);
    expect(layout.width).toBe(CONTAINER_W);
    expect(layout.height).toBe(CONTAINER_H);
  });
});
