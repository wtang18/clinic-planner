/**
 * Care Gap Monitor Service
 *
 * Exports all care gap monitor components.
 */

// Types
export type {
  CareGapMonitorConfig,
  GapEvaluationResult,
  PatientGapEvaluation,
  ClosureAction,
  GapEvaluationContext,
} from './types';

export { DEFAULT_CARE_GAP_MONITOR_CONFIG } from './types';

// Evaluator
export {
  evaluatePatientGaps,
  evaluateGapClosure,
  matchesClosureCriteria,
  getClosureActions,
} from './gap-evaluator';

// AI Service
export { careGapMonitorService } from './care-gap-monitor-service';
