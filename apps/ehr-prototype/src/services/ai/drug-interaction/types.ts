/**
 * Drug Interaction Types
 *
 * Types for the drug interaction checking AI service.
 */

import type { MedicationItem } from '../../../types/chart-items';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for drug interaction checking
 */
export interface DrugInteractionConfig {
  /** Check against active medications in patient history */
  checkAgainstActive: boolean;

  /** Check against other new/proposed medications in this encounter */
  checkAgainstProposed: boolean;

  /** Minimum severity level to report */
  severityThreshold: InteractionSeverity;
}

/**
 * Default drug interaction configuration
 */
export const DEFAULT_DRUG_INTERACTION_CONFIG: DrugInteractionConfig = {
  checkAgainstActive: true,
  checkAgainstProposed: true,
  severityThreshold: 'mild',
};

// ============================================================================
// Severity Types
// ============================================================================

/**
 * Severity levels for drug interactions
 */
export type InteractionSeverity =
  | 'mild'           // Monitor, usually okay
  | 'moderate'       // May need dose adjustment or monitoring
  | 'severe'         // Significant risk, consider alternatives
  | 'contraindicated'; // Should not be used together

// ============================================================================
// Interaction Types
// ============================================================================

/**
 * Reference to a drug
 */
export interface DrugReference {
  /** Drug name */
  name: string;

  /** RxNorm concept ID */
  rxNorm?: string;

  /** National Drug Code */
  ndc?: string;
}

/**
 * A drug-drug interaction
 */
export interface DrugInteraction {
  /** First drug in the interaction */
  drug1: DrugReference;

  /** Second drug in the interaction */
  drug2: DrugReference;

  /** Severity of the interaction */
  severity: InteractionSeverity;

  /** Description of the interaction */
  description: string;

  /** Clinical effects that may occur */
  clinicalEffects: string;

  /** Recommended action */
  recommendation: string;

  /** Source of the interaction data */
  source: string;
}

// ============================================================================
// Result Types
// ============================================================================

/**
 * Result of checking drug interactions
 */
export interface InteractionCheckResult {
  /** The medication that was checked */
  medication: MedicationItem;

  /** Found interactions */
  interactions: DrugInteraction[];

  /** Drugs that were checked against */
  checkedAgainst: DrugReference[];

  /** When the check was performed */
  checkTimestamp: Date;
}
