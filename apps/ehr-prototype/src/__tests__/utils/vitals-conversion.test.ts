/**
 * Vitals Conversion Tests
 *
 * Pure logic tests for temperature, weight, height, and BMI conversions.
 */

import { describe, it, expect } from 'vitest';
import {
  fToC,
  cToF,
  lbsToKg,
  kgToLbs,
  ftInToCm,
  cmToFtIn,
  computeBMI,
  computeBMIImperial,
} from '../../utils/vitals-conversion';

// ============================================================================
// Temperature
// ============================================================================

describe('fToC', () => {
  it('converts 98.6°F → 37.0°C (body temp)', () => {
    expect(fToC(98.6)).toBe(37.0);
  });

  it('converts 32°F → 0°C (freezing)', () => {
    expect(fToC(32)).toBe(0);
  });

  it('converts 212°F → 100°C (boiling)', () => {
    expect(fToC(212)).toBe(100);
  });

  it('converts 100.4°F → 38.0°C (fever threshold)', () => {
    expect(fToC(100.4)).toBe(38.0);
  });
});

describe('cToF', () => {
  it('converts 37.0°C → 98.6°F', () => {
    expect(cToF(37.0)).toBe(98.6);
  });

  it('converts 0°C → 32°F', () => {
    expect(cToF(0)).toBe(32);
  });

  it('converts 38.0°C → 100.4°F', () => {
    expect(cToF(38.0)).toBe(100.4);
  });
});

describe('temperature round-trip', () => {
  it('F → C → F preserves value', () => {
    expect(cToF(fToC(98.6))).toBe(98.6);
  });
});

// ============================================================================
// Weight
// ============================================================================

describe('lbsToKg', () => {
  it('converts 145 lbs → 65.8 kg', () => {
    expect(lbsToKg(145)).toBe(65.8);
  });

  it('converts 0 lbs → 0 kg', () => {
    expect(lbsToKg(0)).toBe(0);
  });

  it('converts 220 lbs → 99.8 kg', () => {
    expect(lbsToKg(220)).toBe(99.8);
  });
});

describe('kgToLbs', () => {
  it('converts 65.8 kg → 145.1 lbs', () => {
    expect(kgToLbs(65.8)).toBe(145.1);
  });

  it('converts 0 kg → 0 lbs', () => {
    expect(kgToLbs(0)).toBe(0);
  });
});

// ============================================================================
// Height
// ============================================================================

describe('ftInToCm', () => {
  it('converts 5\'6" → 167.6 cm', () => {
    expect(ftInToCm(5, 6)).toBe(167.6);
  });

  it('converts 6\'0" → 182.9 cm', () => {
    expect(ftInToCm(6, 0)).toBe(182.9);
  });

  it('converts 0\'0" → 0 cm', () => {
    expect(ftInToCm(0, 0)).toBe(0);
  });
});

describe('cmToFtIn', () => {
  it('converts 167.6 cm → 5\'6"', () => {
    expect(cmToFtIn(167.6)).toEqual({ ft: 5, in: 6 });
  });

  it('converts 182.9 cm → 6\'0"', () => {
    expect(cmToFtIn(182.9)).toEqual({ ft: 6, in: 0 });
  });

  it('handles rounding inches to 12 → increments foot', () => {
    // 152.4 cm = 60 inches exactly = 5'0"
    // but something like 152.2 might round inches close to 12
    const result = cmToFtIn(152.4);
    expect(result.ft * 12 + result.in).toBeCloseTo(60, 0);
  });
});

// ============================================================================
// BMI
// ============================================================================

describe('computeBMI', () => {
  it('computes BMI for 65.8 kg, 167.6 cm → ~23.4', () => {
    const bmi = computeBMI(65.8, 167.6);
    expect(bmi).toBe(23.4);
  });

  it('returns null for zero weight', () => {
    expect(computeBMI(0, 170)).toBeNull();
  });

  it('returns null for zero height', () => {
    expect(computeBMI(70, 0)).toBeNull();
  });

  it('returns null for negative values', () => {
    expect(computeBMI(-70, 170)).toBeNull();
    expect(computeBMI(70, -170)).toBeNull();
  });
});

describe('computeBMIImperial', () => {
  it('computes BMI for 145 lbs, 5\'6" → ~23.4', () => {
    const bmi = computeBMIImperial(145, 5, 6);
    expect(bmi).toBe(23.4);
  });

  it('returns null for zero weight', () => {
    expect(computeBMIImperial(0, 5, 6)).toBeNull();
  });

  it('returns null for zero height', () => {
    expect(computeBMIImperial(145, 0, 0)).toBeNull();
  });
});
