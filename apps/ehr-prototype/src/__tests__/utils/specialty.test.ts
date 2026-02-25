/**
 * Tests for specialty utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  getSpecialtyAbbrev,
  getSpecialtyLabel,
  SPECIALTY_ABBREV,
} from '../../utils/specialty';
import type { Specialty } from '../../types/encounter';

// ============================================================================
// getSpecialtyAbbrev
// ============================================================================

describe('getSpecialtyAbbrev', () => {
  it('returns UC for urgent-care', () => {
    expect(getSpecialtyAbbrev('urgent-care')).toBe('UC');
  });

  it('returns PC for primary-care', () => {
    expect(getSpecialtyAbbrev('primary-care')).toBe('PC');
  });

  it('returns W for workplace-health', () => {
    expect(getSpecialtyAbbrev('workplace-health')).toBe('W');
  });

  it('returns BH for behavioral-health', () => {
    expect(getSpecialtyAbbrev('behavioral-health')).toBe('BH');
  });

  it('returns CR for clinical-research', () => {
    expect(getSpecialtyAbbrev('clinical-research')).toBe('CR');
  });

  it('covers all Specialty values in the SPECIALTY_ABBREV map', () => {
    const allSpecialties: Specialty[] = [
      'urgent-care',
      'primary-care',
      'workplace-health',
      'behavioral-health',
      'clinical-research',
    ];
    for (const specialty of allSpecialties) {
      expect(SPECIALTY_ABBREV[specialty]).toBeDefined();
      expect(typeof SPECIALTY_ABBREV[specialty]).toBe('string');
      expect(SPECIALTY_ABBREV[specialty].length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// getSpecialtyLabel
// ============================================================================

describe('getSpecialtyLabel', () => {
  it('returns full label for urgent-care', () => {
    expect(getSpecialtyLabel('urgent-care')).toBe('Urgent Care');
  });

  it('returns full label for primary-care', () => {
    expect(getSpecialtyLabel('primary-care')).toBe('Primary Care');
  });

  it('returns full label for workplace-health', () => {
    expect(getSpecialtyLabel('workplace-health')).toBe('Workplace Health');
  });

  it('returns full label for behavioral-health', () => {
    expect(getSpecialtyLabel('behavioral-health')).toBe('Behavioral Health');
  });

  it('returns full label for clinical-research', () => {
    expect(getSpecialtyLabel('clinical-research')).toBe('Clinical Research');
  });
});
