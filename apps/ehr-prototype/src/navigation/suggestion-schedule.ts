/**
 * Suggestion Schedule
 *
 * Pre-computed timing tables that sync suggestion dispatch to transcript playback.
 * Immediate suggestions (care gaps, screenings) fire on encounter load.
 * Transcript-derived suggestions fire at pre-computed delays after Record starts,
 * matching the moment their corresponding transcript segment plays.
 *
 * Pure logic module — no React, safe for tests.
 */

import type { SUGGESTION_TEMPLATES } from '../mocks/generators/suggestions';

// ============================================================================
// Types
// ============================================================================

export type SuggestionScenario = keyof typeof SUGGESTION_TEMPLATES;

export type SuggestionTiming =
  | { type: 'immediate' }
  | { type: 'onRecord'; delayMs: number };

export interface ScheduledSuggestion {
  /** Unique key for dedup tracking (scenario + itemIndex) */
  key: string;
  /** Which scenario template to pull the suggestion from */
  scenario: SuggestionScenario;
  /** Index into the scenario's suggestion array */
  itemIndex: number;
  /** When to dispatch this suggestion */
  timing: SuggestionTiming;
}

// ============================================================================
// UC Cough Schedule
//
// Transcript cumulative segment arrival times (ms from Record start):
//   0: 1000   Provider: cough intro
//   1: 4000   Patient: 5 days, sore throat
//   2: 6500   Provider: fever/SOB?
//   3: 10500  Patient: low fever
//   4: 12500  Provider: phlegm?
//   5: 15000  Patient: yellow-green
//   6: 18000  Provider: listen to lungs, medications?
//   7: 20500  Patient: Lisinopril, Mucinex
//   8: 25000  Provider: wheezing, chest X-ray
//   9: 28000  Provider: prescribes benzonatate
//  10: 31000  Provider: acute bronchitis dx
// ============================================================================

const UC_COUGH_SCHEDULE: ScheduledSuggestion[] = [
  // Mucinex (reported) — patient mentions at seg 7 (20500) + 1000 AI delay
  {
    key: 'uc-mucinex',
    scenario: 'ucCoughTranscription',
    itemIndex: 1, // Mucinex is index 1 in ucCoughTranscription
    timing: { type: 'onRecord', delayMs: 21500 },
  },
  // Benzonatate Rx — provider prescribes at seg 9 (28000) + 800 AI delay
  {
    key: 'uc-benzonatate',
    scenario: 'ucCoughTranscription',
    itemIndex: 0, // Benzonatate is index 0 in ucCoughTranscription
    timing: { type: 'onRecord', delayMs: 28800 },
  },
  // Acute bronchitis Dx — provider mentions at seg 10 (31000) + 1200 AI delay
  {
    key: 'uc-bronchitis-dx',
    scenario: 'ucCoughTranscription',
    itemIndex: 2, // Dx is index 2 in ucCoughTranscription
    timing: { type: 'onRecord', delayMs: 32200 },
  },
  // HPI Draft — after last segment (31000) + 3000
  {
    key: 'uc-hpi-draft',
    scenario: 'ucCoughNarrativeDrafts',
    itemIndex: 0,
    timing: { type: 'onRecord', delayMs: 34000 },
  },
  // A&P Draft — last seg + 5000
  {
    key: 'uc-plan-draft',
    scenario: 'ucCoughNarrativeDrafts',
    itemIndex: 1,
    timing: { type: 'onRecord', delayMs: 36000 },
  },
  // Instructions Draft — last seg + 7000
  {
    key: 'uc-instruction-draft',
    scenario: 'ucCoughNarrativeDrafts',
    itemIndex: 2,
    timing: { type: 'onRecord', delayMs: 38000 },
  },
];

// ============================================================================
// PC Diabetes Schedule
//
// Transcript cumulative segment arrival times (ms from Record start):
//   0: 1000   Provider: diabetes follow-up
//   1: 3500   Patient: diet
//   2: 5500   Provider: blood sugars?
//   3: 8500   Patient: 120-180 fasting
//   4: 11000  Provider: A1C 7.8, hypoglycemia?
//   5: 14000  Patient: nausea on Metformin
//   6: 16500  Provider: microalbumin, eye exam
//   7: 18500  Patient: blurry vision
//   8: 22500  Provider: increase Metformin 1000mg BID
// ============================================================================

const PC_DIABETES_SCHEDULE: ScheduledSuggestion[] = [
  // A1C care gap — immediate (visit-type derived)
  {
    key: 'pc-a1c-gap',
    scenario: 'pcDiabetesCareGaps',
    itemIndex: 0,
    timing: { type: 'immediate' },
  },
  // Eye exam care gap — immediate (visit-type derived)
  {
    key: 'pc-eye-gap',
    scenario: 'pcDiabetesCareGaps',
    itemIndex: 1,
    timing: { type: 'immediate' },
  },
  // Metformin refill — provider mentions at seg 8 (22500) + 1000 AI delay
  {
    key: 'pc-metformin',
    scenario: 'pcDiabetesTranscription',
    itemIndex: 0,
    timing: { type: 'onRecord', delayMs: 23500 },
  },
  // Lipid Panel — seg 8 (22500) + 2500 AI delay
  {
    key: 'pc-lipid',
    scenario: 'pcDiabetesTranscription',
    itemIndex: 1,
    timing: { type: 'onRecord', delayMs: 25000 },
  },
];

// ============================================================================
// AWV Schedule — all immediate (screenings + chart-derived narratives)
// ============================================================================

const AWV_SCHEDULE: ScheduledSuggestion[] = [
  // Lipid Panel — age screening
  {
    key: 'awv-lipid',
    scenario: 'awvWellnessScreening',
    itemIndex: 0,
    timing: { type: 'immediate' },
  },
  // CMP — age screening
  {
    key: 'awv-cmp',
    scenario: 'awvWellnessScreening',
    itemIndex: 1,
    timing: { type: 'immediate' },
  },
  // AWV Dx (Z00.00) — standard code
  {
    key: 'awv-dx',
    scenario: 'awvWellnessScreening',
    itemIndex: 2,
    timing: { type: 'immediate' },
  },
  // HPI Draft — chart-derived
  {
    key: 'awv-hpi-draft',
    scenario: 'awvNarrativeDrafts',
    itemIndex: 0,
    timing: { type: 'immediate' },
  },
  // A&P Draft — chart-derived
  {
    key: 'awv-plan-draft',
    scenario: 'awvNarrativeDrafts',
    itemIndex: 1,
    timing: { type: 'immediate' },
  },
];

// ============================================================================
// Public API
// ============================================================================

/**
 * Returns the suggestion schedule for a given encounter ID.
 * Each entry specifies which suggestion template to dispatch and when.
 */
export function getScheduleForEncounter(encounterId: string): ScheduledSuggestion[] {
  if (encounterId === 'uc-cough' || encounterId === 'demo-uc') {
    return UC_COUGH_SCHEDULE;
  }
  if (encounterId === 'pc-diabetes' || encounterId === 'demo-pc') {
    return PC_DIABETES_SCHEDULE;
  }
  if (encounterId === 'demo-healthy' || encounterId === 'healthy') {
    return AWV_SCHEDULE;
  }
  return [];
}
