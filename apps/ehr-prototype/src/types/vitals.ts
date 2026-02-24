/**
 * Vitals Types
 *
 * Shared data types for vitals across triage input (VitalsSection)
 * and charting display (VitalsRail).
 */

export type UnitSystem = 'imperial' | 'metric';

export interface VitalReading {
  value: number;
  unit: string;
  timestamp: Date;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}

export interface VitalsSnapshot {
  systolic: VitalReading[];
  diastolic: VitalReading[];
  pulse: VitalReading[];
  respRate: VitalReading[];
  spo2: VitalReading[];
  oxyOn: VitalReading[];
  temp: VitalReading[];
  height: VitalReading[];
  weight: VitalReading[];
  bmi: VitalReading[];
}

/** Empty snapshot for scenarios where triage hasn't occurred yet. */
export const EMPTY_VITALS_SNAPSHOT: VitalsSnapshot = {
  systolic: [],
  diastolic: [],
  pulse: [],
  respRate: [],
  spo2: [],
  oxyOn: [],
  temp: [],
  height: [],
  weight: [],
  bmi: [],
};
