/**
 * Vitals Unit Conversion Functions
 *
 * Pure functions for converting between imperial and metric vital signs.
 * Units that don't convert: mmHg (BP), bpm (pulse), /min (resp rate), % (SpO₂).
 */

// ============================================================================
// Temperature
// ============================================================================

/** Fahrenheit → Celsius, rounded to 1 decimal. */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 10) / 10;
}

/** Celsius → Fahrenheit, rounded to 1 decimal. */
export function cToF(c: number): number {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

// ============================================================================
// Weight
// ============================================================================

/** Pounds → Kilograms, rounded to 1 decimal. */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

/** Kilograms → Pounds, rounded to 1 decimal. */
export function kgToLbs(kg: number): number {
  return Math.round(kg / 0.453592 * 10) / 10;
}

// ============================================================================
// Height
// ============================================================================

/** Feet + inches → centimeters, rounded to 1 decimal. */
export function ftInToCm(ft: number, inches: number): number {
  const totalInches = ft * 12 + inches;
  return Math.round(totalInches * 2.54 * 10) / 10;
}

/** Centimeters → { ft, in }, inches rounded to nearest whole. */
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  // Handle case where rounding pushes inches to 12
  if (inches === 12) {
    return { ft: ft + 1, in: 0 };
  }
  return { ft, in: inches };
}

// ============================================================================
// BMI
// ============================================================================

/** Compute BMI from metric values (kg, cm). Returns 1 decimal or null if inputs invalid. */
export function computeBMI(kg: number, cm: number): number | null {
  if (kg <= 0 || cm <= 0) return null;
  const meters = cm / 100;
  return Math.round((kg / (meters * meters)) * 10) / 10;
}

/** Compute BMI from imperial values (lbs, ft, in). Returns 1 decimal or null if inputs invalid. */
export function computeBMIImperial(lbs: number, ft: number, inches: number): number | null {
  if (lbs <= 0) return null;
  const totalInches = ft * 12 + inches;
  if (totalInches <= 0) return null;
  return Math.round((703 * lbs / (totalInches * totalInches)) * 10) / 10;
}
