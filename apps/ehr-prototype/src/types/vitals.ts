/**
 * Vitals Types
 *
 * Shared data types for vitals display and input (VitalsSection, VitalsInput, TriageModule).
 * Core vitals data is now on VitalsItem in chart-items.ts.
 */

export type UnitSystem = 'imperial' | 'metric';

export interface VitalReading {
  value: number;
  unit: string;
  timestamp: Date;
  flag?: 'normal' | 'low' | 'high' | 'critical';
}
