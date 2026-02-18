/**
 * Dosage Range Checker
 *
 * Validates medication dosages against a static reference of common drugs
 * and their maximum daily doses. Returns a SafetyAlert when a dosage
 * exceeds the known range.
 */

import type { MedicationItem } from '../../types/chart-items';
import type { SafetyAlert } from './types';

// ============================================================================
// Dosage Ranges
// ============================================================================

interface DosageRange {
  /** Max single dose in mg */
  maxSingleDoseMg?: number;
  /** Max daily dose in mg */
  maxDailyDoseMg: number;
  /** Common unit for display */
  unit: string;
}

const DOSAGE_RANGES: Record<string, DosageRange> = {
  metformin:      { maxDailyDoseMg: 2550, unit: 'mg' },
  lisinopril:     { maxDailyDoseMg: 80,   unit: 'mg' },
  amoxicillin:    { maxDailyDoseMg: 3000, unit: 'mg' },
  atorvastatin:   { maxDailyDoseMg: 80,   unit: 'mg' },
  losartan:       { maxDailyDoseMg: 100,  unit: 'mg' },
  amlodipine:     { maxDailyDoseMg: 10,   unit: 'mg' },
  omeprazole:     { maxDailyDoseMg: 40,   unit: 'mg' },
  sertraline:     { maxDailyDoseMg: 200,  unit: 'mg' },
  gabapentin:     { maxDailyDoseMg: 3600, unit: 'mg' },
  acetaminophen:  { maxDailyDoseMg: 4000, unit: 'mg', maxSingleDoseMg: 1000 },
  ibuprofen:      { maxDailyDoseMg: 3200, unit: 'mg', maxSingleDoseMg: 800 },
};

// ============================================================================
// Checker
// ============================================================================

/**
 * Check if a medication's dosage exceeds known safe ranges.
 */
export function checkDosageRange(med: MedicationItem): SafetyAlert | null {
  const drugName = med.data.drugName.toLowerCase().trim();
  const range = DOSAGE_RANGES[drugName];

  if (!range) return null; // Unknown drug — no check

  const dosageMg = parseDosageMg(med.data.dosage);
  if (dosageMg === null) return null; // Couldn't parse

  // Estimate daily dose based on frequency
  const dailyMultiplier = getFrequencyMultiplier(med.data.frequency);
  const estimatedDailyDose = dosageMg * dailyMultiplier;

  // Check single dose
  if (range.maxSingleDoseMg && dosageMg > range.maxSingleDoseMg) {
    return {
      id: `dosage-range:${med.id}:single`,
      type: 'dosage-range',
      severity: 'warning',
      message: `Dosage exceeds max single dose for ${med.data.drugName}`,
      details: `${dosageMg}${range.unit} exceeds max single dose of ${range.maxSingleDoseMg}${range.unit}`,
      relatedItemId: med.id,
      dismissible: true,
      acknowledged: false,
    };
  }

  // Check daily dose
  if (estimatedDailyDose > range.maxDailyDoseMg) {
    return {
      id: `dosage-range:${med.id}:daily`,
      type: 'dosage-range',
      severity: 'warning',
      message: `Estimated daily dose exceeds max for ${med.data.drugName}`,
      details: `~${estimatedDailyDose}${range.unit}/day exceeds max of ${range.maxDailyDoseMg}${range.unit}/day`,
      relatedItemId: med.id,
      dismissible: true,
      acknowledged: false,
    };
  }

  return null;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse a dosage string like "500 mg" or "100mg" into a number.
 * Returns null if unparseable.
 */
export function parseDosageMg(dosage: string): number | null {
  const match = dosage.match(/(\d+(?:\.\d+)?)\s*(?:mg)?/i);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Convert a frequency string to a daily multiplier.
 */
export function getFrequencyMultiplier(frequency: string): number {
  const f = frequency.toLowerCase().trim();

  if (f === 'daily' || f === 'qd' || f === 'qday' || f === 'once daily') return 1;
  if (f === 'bid' || f === 'twice daily') return 2;
  if (f === 'tid' || f === 'three times daily') return 3;
  if (f === 'qid' || f === 'four times daily') return 4;
  if (f === 'prn' || f === 'as needed') return 1; // Conservative: assume once
  if (f === 'q4h') return 6;
  if (f === 'q6h') return 4;
  if (f === 'q8h') return 3;
  if (f === 'q12h') return 2;
  if (f === 'weekly' || f === 'qweek') return 1 / 7;

  return 1; // Default: once daily
}
