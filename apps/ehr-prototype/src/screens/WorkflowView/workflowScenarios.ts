/**
 * Workflow Scenario Defaults
 *
 * Per-encounter scenario defaults for completed workflow phases,
 * initial view context, and active phase/mode.
 *
 * Used by CaptureView to initialize state on encounter load.
 */

import type { ScenarioWorkflowState, ViewContext, WorkflowPhase } from '../IntakeView/intakeChecklist';

// ============================================================================
// Scenario Defaults
// ============================================================================

export const SCENARIO_WORKFLOW_DEFAULTS: Record<string, ScenarioWorkflowState> = {
  // UC Cough: check-in already done, drop into charting/capture at triage
  'enc-uc-cough-001': {
    completedPhases: ['check-in'],
    activeView: 'charting',
    activePhase: 'triage',
    activeMode: 'capture',
  },

  // PC Diabetes follow-up: check-in + triage done, charting in progress
  'enc-pc-dm-001': {
    completedPhases: ['check-in', 'triage'],
    activeView: 'charting',
    activePhase: undefined,
    activeMode: 'capture',
  },

  // Annual Wellness Visit: nothing complete yet, start in workflow
  'enc-awv-001': {
    completedPhases: [],
    activeView: 'workflow',
    activePhase: 'check-in',
    activeMode: 'capture',
  },
};

// ============================================================================
// Lookup Helper
// ============================================================================

/**
 * Get workflow defaults for a scenario identifier.
 * Falls back to a sensible default (charting, no completed phases).
 */
export function getScenarioWorkflowDefaults(scenarioId: string | undefined): ScenarioWorkflowState {
  if (scenarioId && SCENARIO_WORKFLOW_DEFAULTS[scenarioId]) {
    return SCENARIO_WORKFLOW_DEFAULTS[scenarioId];
  }
  // Default: start in charting with no workflow phases completed
  return {
    completedPhases: [],
    activeView: 'charting',
    activePhase: 'check-in',
    activeMode: 'capture',
  };
}
