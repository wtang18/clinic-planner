/**
 * Care Gap Monitor Types
 *
 * Types for the care gap monitoring AI service.
 */

import type { ItemCategory, ChartItem } from '../../../types/chart-items';
import type { CareGapInstance, CareGapCategory, CareGapClosureCriteria } from '../../../types/care-gaps';
import type { PatientContext } from '../../../types/patient';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for care gap monitoring
 */
export interface CareGapMonitorConfig {
  /** Evaluate gaps when encounter is opened */
  evaluateOnEncounterOpen: boolean;

  /** Evaluate gaps when items are added */
  evaluateOnItemAdd: boolean;

  /** Item categories relevant to gap closure */
  relevantItemCategories: ItemCategory[];
}

/**
 * Default care gap monitor configuration
 */
export const DEFAULT_CARE_GAP_MONITOR_CONFIG: CareGapMonitorConfig = {
  evaluateOnEncounterOpen: true,
  evaluateOnItemAdd: true,
  relevantItemCategories: [
    'lab',
    'imaging',
    'procedure',
    'medication',
    'vitals',
  ],
};

// ============================================================================
// Evaluation Results
// ============================================================================

/**
 * Result of evaluating a single gap
 */
export interface GapEvaluationResult {
  /** Gap ID that was evaluated */
  gapId: string;

  /** Result status */
  status: 'no-change' | 'addressed' | 'closed' | 'pending';

  /** What addressed the gap (if applicable) */
  addressedBy?: {
    itemId: string;
    itemType: string;
  };

  /** Reason for the status */
  reason?: string;
}

/**
 * Result of evaluating all gaps for a patient
 */
export interface PatientGapEvaluation {
  /** Patient ID */
  patientId: string;

  /** When evaluation occurred */
  evaluatedAt: Date;

  /** All gaps for the patient */
  gaps: CareGapInstance[];

  /** Newly identified gaps */
  newGaps: CareGapInstance[];

  /** Gap IDs that were closed */
  closedGaps: string[];
}

// ============================================================================
// Closure Actions
// ============================================================================

/**
 * Suggested action to close a care gap
 */
export interface ClosureAction {
  /** Type of action */
  type: 'order-lab' | 'order-imaging' | 'schedule-procedure' | 'administer' | 'document';

  /** Display label for the action */
  label: string;

  /** Template for creating the chart item */
  itemTemplate?: Partial<ChartItem>;

  /** Priority of this action */
  priority?: 'routine' | 'important' | 'urgent';
}

// ============================================================================
// Evaluation Context
// ============================================================================

/**
 * Context for gap evaluation
 */
export interface GapEvaluationContext {
  /** Patient context */
  patient: PatientContext;

  /** Open care gaps for the patient */
  gaps: CareGapInstance[];

  /** Items in the current encounter */
  encounterItems: ChartItem[];

  /** Configuration */
  config: CareGapMonitorConfig;
}
