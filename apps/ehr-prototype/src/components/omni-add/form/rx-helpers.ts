/**
 * Rx auto-calculation helpers
 *
 * Pure functions for generating prescription sig (instructions) and
 * calculating quantity from frequency and duration. Used by RxDetailForm
 * for live auto-fill as the provider adjusts fields.
 */

// ============================================================================
// Route display map
// ============================================================================

const ROUTE_DISPLAY: Record<string, string> = {
  PO: 'by mouth',
  IM: 'intramuscularly',
  IV: 'intravenously',
  SC: 'subcutaneously',
  topical: 'topically',
  Inhalation: 'by inhalation',
  inhaled: 'by inhalation',
  intranasal: 'intranasally',
  rectal: 'rectally',
  ophthalmic: 'in the affected eye(s)',
};

// ============================================================================
// Frequency parsing
// ============================================================================

/** Map frequency abbreviations to { timesPerDay, label } */
const FREQUENCY_MAP: Record<string, { timesPerDay: number; label: string; prn: boolean }> = {
  daily: { timesPerDay: 1, label: 'once daily', prn: false },
  BID: { timesPerDay: 2, label: 'twice daily', prn: false },
  TID: { timesPerDay: 3, label: 'three times daily', prn: false },
  QID: { timesPerDay: 4, label: 'four times daily', prn: false },
  QHS: { timesPerDay: 1, label: 'at bedtime', prn: false },
  PRN: { timesPerDay: 3, label: 'as needed', prn: true },
  'TID PRN': { timesPerDay: 3, label: 'three times daily as needed', prn: true },
  'BID PRN': { timesPerDay: 2, label: 'twice daily as needed', prn: true },
  'QID PRN': { timesPerDay: 4, label: 'four times daily as needed', prn: true },
  'Q4H': { timesPerDay: 6, label: 'every 4 hours', prn: false },
  'Q6H': { timesPerDay: 4, label: 'every 6 hours', prn: false },
  'Q8H': { timesPerDay: 3, label: 'every 8 hours', prn: false },
  'Q8H PRN': { timesPerDay: 3, label: 'every 8 hours as needed', prn: true },
  'Q4H PRN': { timesPerDay: 6, label: 'every 4 hours as needed', prn: true },
  'Q6H PRN': { timesPerDay: 4, label: 'every 6 hours as needed', prn: true },
  'Q4-6H PRN': { timesPerDay: 5, label: 'every 4-6 hours as needed', prn: true },
  'Q6-8H PRN': { timesPerDay: 4, label: 'every 6-8 hours as needed', prn: true },
  weekly: { timesPerDay: 1 / 7, label: 'once weekly', prn: false },
  'See Sig': { timesPerDay: 1, label: 'as directed', prn: false },
};

/**
 * Look up frequency info. Falls back to a reasonable default for unknown values.
 */
function getFrequencyInfo(frequency: string): { timesPerDay: number; label: string; prn: boolean } {
  return FREQUENCY_MAP[frequency] ?? { timesPerDay: 1, label: frequency.toLowerCase(), prn: false };
}

// ============================================================================
// Dosage form heuristic
// ============================================================================

/** Infer dosage form from route for sig text (e.g. "Take 1 tablet", "Apply 1 application") */
function getDosageForm(route: string): string {
  switch (route) {
    case 'PO':
      return 'tablet';
    case 'Inhalation':
    case 'inhaled':
      return 'puff';
    case 'topical':
      return 'application';
    case 'ophthalmic':
      return 'drop';
    case 'rectal':
      return 'suppository';
    default:
      return 'dose';
  }
}

/** Verb for the dosage form */
function getDosageVerb(route: string): string {
  switch (route) {
    case 'topical':
      return 'Apply';
    case 'Inhalation':
    case 'inhaled':
      return 'Inhale';
    case 'ophthalmic':
      return 'Instill';
    default:
      return 'Take';
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a human-readable sig (prescription instructions) from field values.
 *
 * Examples:
 *   generateSig('100mg', 'PO', 'TID PRN')
 *   → "Take 1 tablet (100mg) by mouth three times daily as needed"
 *
 *   generateSig('90mcg/actuation', 'Inhalation', 'Q4-6H PRN')
 *   → "Inhale 1 puff (90mcg/actuation) by inhalation every 4-6 hours as needed"
 */
export function generateSig(dosage: string, route: string, frequency: string): string {
  if (!dosage || !route || !frequency) return '';

  const verb = getDosageVerb(route);
  const form = getDosageForm(route);
  const routeText = ROUTE_DISPLAY[route] || route.toLowerCase();
  const freqInfo = getFrequencyInfo(frequency);

  return `${verb} 1 ${form} (${dosage}) ${routeText} ${freqInfo.label}`;
}

/**
 * Calculate quantity from frequency and duration.
 *
 * Examples:
 *   calculateQuantity('TID PRN', '7 days')  → 21
 *   calculateQuantity('daily', '30 days')    → 30
 *   calculateQuantity('BID', '14 days')      → 28
 *
 * Returns null if duration can't be parsed.
 */
export function calculateQuantity(frequency: string, duration: string): number | null {
  if (!frequency || !duration) return null;

  const freqInfo = getFrequencyInfo(frequency);

  // Parse duration: "7 days", "30 days", "5 days", etc.
  const match = duration.match(/^(\d+)\s*days?$/i);
  if (!match) return null;

  const days = parseInt(match[1], 10);
  return Math.ceil(freqInfo.timesPerDay * days);
}
