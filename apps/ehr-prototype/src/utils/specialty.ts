/**
 * Specialty Utilities
 *
 * Abbreviation and label helpers for clinical specialties.
 */

import type { Specialty } from '../types/encounter';

/** Map of specialty → short abbreviation (for badges, menu items) */
export const SPECIALTY_ABBREV: Record<Specialty, string> = {
  'urgent-care': 'UC',
  'primary-care': 'PC',
  'workplace-health': 'W',
  'behavioral-health': 'BH',
  'clinical-research': 'CR',
};

/** Map of specialty → full human-readable label */
const SPECIALTY_LABELS: Record<Specialty, string> = {
  'urgent-care': 'Urgent Care',
  'primary-care': 'Primary Care',
  'workplace-health': 'Workplace Health',
  'behavioral-health': 'Behavioral Health',
  'clinical-research': 'Clinical Research',
};

/** Returns short abbreviation (e.g., "UC", "PC") */
export function getSpecialtyAbbrev(specialty: Specialty): string {
  return SPECIALTY_ABBREV[specialty];
}

/** Returns full label (e.g., "Urgent Care", "Primary Care") */
export function getSpecialtyLabel(specialty: Specialty): string {
  return SPECIALTY_LABELS[specialty];
}
