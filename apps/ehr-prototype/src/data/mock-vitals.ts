/**
 * Mock Vitals Data
 *
 * Per-scenario vitals as first-class VitalsItem ChartItems.
 * Three scenarios with varying completeness and flag states:
 * - enc-uc-cough-001: single set of readings, temp slightly elevated (flagged high)
 * - enc-pc-dm-001: multiple reading sets at different times, elevated HR + low SpO₂
 * - enc-awv-001: empty (not yet triaged)
 */

import type { VitalsItem, VitalMeasurement, OxygenDelivery } from '../types/chart-items';
import { materializeChartItem } from '../utils/chart-item-factory';

// ============================================================================
// Helpers
// ============================================================================

/** Shorthand for a time today at hh:mm. */
function today(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function m(
  type: VitalMeasurement['type'],
  value: number,
  unit: string,
  flag?: VitalMeasurement['flag'],
): VitalMeasurement {
  return { type, value, unit, ...(flag ? { flag } : {}) };
}

/** Build a VitalsItem via materializeChartItem. */
function buildVitalsItem(
  measurements: VitalMeasurement[],
  capturedAt: Date,
  oxygenDelivery?: OxygenDelivery,
  displayParts?: string[],
): VitalsItem {
  const parts = displayParts || buildDisplayParts(measurements);
  return materializeChartItem(
    {
      category: 'vitals',
      displayText: parts.join(' \u00B7 ') || 'Vitals',
      data: {
        measurements,
        capturedAt,
        oxygenDelivery,
      },
    },
    { source: { type: 'maHandoff' }, status: 'confirmed', reviewed: true },
  ) as VitalsItem;
}

/** Build display text parts from measurements. */
function buildDisplayParts(measurements: VitalMeasurement[]): string[] {
  const parts: string[] = [];
  const sys = measurements.find(m => m.type === 'bp-systolic');
  const dia = measurements.find(m => m.type === 'bp-diastolic');
  if (sys && dia) parts.push(`BP ${sys.value}/${dia.value}`);
  const hr = measurements.find(m => m.type === 'pulse');
  if (hr) parts.push(`HR ${hr.value}`);
  const temp = measurements.find(m => m.type === 'temp');
  if (temp) parts.push(`Temp ${temp.value}${temp.unit}`);
  const spo2 = measurements.find(m => m.type === 'spo2');
  if (spo2) parts.push(`SpO\u2082 ${spo2.value}%`);
  const rr = measurements.find(m => m.type === 'resp');
  if (rr) parts.push(`RR ${rr.value}`);
  return parts;
}

// ============================================================================
// Scenarios
// ============================================================================

function buildUcCoughVitals(): VitalsItem[] {
  const t = today(8, 58);
  return [
    buildVitalsItem(
      [
        m('bp-systolic', 118, 'mmHg'),
        m('bp-diastolic', 76, 'mmHg'),
        m('pulse', 78, 'bpm'),
        m('resp', 18, '/min'),
        m('spo2', 97, '%'),
        m('temp', 100.2, '\u00B0F', 'high'),
        m('height', 66, 'in'),
        m('weight', 145, 'lbs'),
      ],
      t,
      'none',
    ),
  ];
}

function buildPcDiabetesVitals(): VitalsItem[] {
  const t1 = today(9, 15);
  const t2 = today(9, 32);
  const t3 = today(9, 45);

  return [
    // Initial reading
    buildVitalsItem(
      [
        m('bp-systolic', 142, 'mmHg', 'high'),
        m('bp-diastolic', 88, 'mmHg'),
        m('pulse', 92, 'bpm', 'high'),
        m('resp', 17, '/min'),
        m('spo2', 94, '%', 'low'),
        m('temp', 98.8, '\u00B0F'),
        m('height', 70, 'in'),
        m('weight', 215, 'lbs'),
      ],
      t1,
      'none',
    ),
    // Second reading (BP + HR recheck)
    buildVitalsItem(
      [
        m('bp-systolic', 138, 'mmHg'),
        m('bp-diastolic', 84, 'mmHg'),
        m('pulse', 88, 'bpm'),
        m('temp', 99.1, '\u00B0F'),
      ],
      t2,
    ),
    // Third reading (temp recheck)
    buildVitalsItem(
      [
        m('temp', 98.6, '\u00B0F'),
      ],
      t3,
    ),
  ];
}

// ============================================================================
// Lookup
// ============================================================================

const SCENARIO_VITALS: Record<string, () => VitalsItem[]> = {
  'enc-uc-cough-001': buildUcCoughVitals,
  'enc-pc-dm-001': buildPcDiabetesVitals,
  'enc-awv-001': () => [],
};

/** Get vitals ChartItems for a scenario. Returns empty array for unknown scenarios. */
export function getVitalsForScenario(scenarioId: string | undefined): VitalsItem[] {
  if (!scenarioId) return [];
  const builder = SCENARIO_VITALS[scenarioId];
  return builder ? builder() : [];
}
