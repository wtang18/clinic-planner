/**
 * Mock Vitals Data
 *
 * Per-scenario vitals snapshots for the VitalsRail display during charting.
 * Three scenarios with varying completeness and flag states:
 * - enc-uc-cough-001: single readings, temp slightly elevated (flagged high)
 * - enc-pc-dm-001: multiple readings with timestamps, elevated HR + low SpO₂
 * - enc-awv-001: empty (not yet triaged)
 */

import type { VitalReading, VitalsSnapshot } from '../types/vitals';
import { EMPTY_VITALS_SNAPSHOT } from '../types/vitals';

// ============================================================================
// Helpers
// ============================================================================

function reading(
  value: number,
  unit: string,
  timestamp: Date,
  flag?: VitalReading['flag'],
): VitalReading {
  return { value, unit, timestamp, flag };
}

/** Shorthand for a time today at hh:mm. */
function today(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ============================================================================
// Scenarios
// ============================================================================

const ucCoughVitals: VitalsSnapshot = {
  systolic:  [reading(118, 'mmHg', today(8, 58))],
  diastolic: [reading(76, 'mmHg', today(8, 58))],
  pulse:     [reading(78, 'bpm', today(8, 58))],
  respRate:  [reading(18, '/min', today(8, 58))],
  spo2:      [reading(97, '%', today(8, 58))],
  oxyOn:     [reading(0, '', today(8, 58))],   // 0 = None
  temp:      [reading(100.2, '°F', today(8, 58), 'high')],
  height:    [reading(66, 'in', today(8, 58))],  // 5'6"
  weight:    [reading(145, 'lbs', today(8, 58))],
  bmi:       [reading(23.4, '', today(8, 58))],
};

const pcDiabetesVitals: VitalsSnapshot = {
  systolic:  [
    reading(142, 'mmHg', today(9, 15), 'high'),
    reading(138, 'mmHg', today(9, 32)),
  ],
  diastolic: [
    reading(88, 'mmHg', today(9, 15)),
    reading(84, 'mmHg', today(9, 32)),
  ],
  pulse:     [
    reading(92, 'bpm', today(9, 15), 'high'),
    reading(88, 'bpm', today(9, 32)),
  ],
  respRate:  [reading(17, '/min', today(9, 15))],
  spo2:      [reading(94, '%', today(9, 15), 'low')],
  oxyOn:     [reading(0, '', today(9, 15))],
  temp: [
    reading(98.8, '°F', today(9, 15)),
    reading(99.1, '°F', today(9, 32)),
    reading(98.6, '°F', today(9, 45)),
  ],
  height:    [reading(70, 'in', today(9, 15))],  // 5'10"
  weight:    [reading(215, 'lbs', today(9, 15))],
  bmi:       [reading(30.8, '', today(9, 15), 'high')],
};

// ============================================================================
// Lookup
// ============================================================================

const SCENARIO_VITALS: Record<string, VitalsSnapshot> = {
  'enc-uc-cough-001': ucCoughVitals,
  'enc-pc-dm-001': pcDiabetesVitals,
  'enc-awv-001': EMPTY_VITALS_SNAPSHOT,
};

/** Get vitals snapshot for a scenario. Returns empty snapshot for unknown scenarios. */
export function getVitalsForScenario(scenarioId: string | undefined): VitalsSnapshot {
  if (!scenarioId) return EMPTY_VITALS_SNAPSHOT;
  return SCENARIO_VITALS[scenarioId] ?? EMPTY_VITALS_SNAPSHOT;
}
