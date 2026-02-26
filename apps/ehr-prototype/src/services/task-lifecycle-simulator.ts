/**
 * Task Lifecycle Simulator
 *
 * Timer-based service that auto-progresses background tasks through their
 * lifecycle for demo purposes. Each task type has a predefined flow with
 * realistic delays — some complete, some fail, some pause at pending-review.
 *
 * Pure logic module (no React). Accepts dispatch/getState from the store.
 */

import type { EncounterAction } from '../state/actions/types';
import type { EncounterState } from '../state/types';
import type { TaskType, BackgroundTask } from '../types/suggestions';
import { SAMPLE_TASK_RESULTS } from '../mocks/generators/tasks';

// ============================================================================
// Lifecycle Definitions
// ============================================================================

interface TaskLifecycle {
  /** Delay (ms) from queued → processing */
  startDelayMs: number;
  /** Delay (ms) from processing → terminal state */
  resolveDelayMs: number;
  /** Terminal state for this task type */
  outcome: 'completed' | 'failed' | 'pending-review';
  /** Result payload (for completed tasks) */
  result?: unknown;
  /** Error message (for failed tasks) */
  error?: string;
  /** Progress message while processing */
  progressMessage?: string;
  /** Display status for pending-review */
  pendingReviewStatus?: string;
}

const LIFECYCLE_MAP: Record<TaskType, TaskLifecycle> = {
  'drug-interaction': {
    startDelayMs: 1000,
    resolveDelayMs: 2000,
    outcome: 'completed',
    result: SAMPLE_TASK_RESULTS.drugInteraction,
    progressMessage: 'Checking drug database...',
  },
  'care-gap-evaluation': {
    startDelayMs: 1000,
    resolveDelayMs: 2000,
    outcome: 'completed',
    result: { evaluated: true, gapsClosed: 1 },
    progressMessage: 'Evaluating care gaps...',
  },
  'formulary-check': {
    startDelayMs: 1000,
    resolveDelayMs: 3000,
    outcome: 'failed',
    error: 'Not covered — alternatives available',
    progressMessage: 'Checking insurance coverage...',
  },
  'prior-auth-check': {
    startDelayMs: 1000,
    resolveDelayMs: 2500,
    outcome: 'completed',
    result: { required: false },
    progressMessage: 'Checking authorization requirements...',
  },
  'dx-association': {
    startDelayMs: 1000,
    resolveDelayMs: 1500,
    outcome: 'pending-review',
    result: SAMPLE_TASK_RESULTS.dxAssociation,
    progressMessage: 'Finding matching diagnoses...',
    pendingReviewStatus: 'Select diagnosis',
  },
  // Types that don't auto-run from the simulator (but need entries to avoid crashes)
  'note-generation': {
    startDelayMs: 1000,
    resolveDelayMs: 4000,
    outcome: 'completed',
    result: SAMPLE_TASK_RESULTS.noteGeneration,
    progressMessage: 'Generating note...',
  },
  'lab-send': {
    startDelayMs: 500,
    resolveDelayMs: 2000,
    outcome: 'completed',
    result: { sent: true },
    progressMessage: 'Sending lab order...',
  },
  'rx-send': {
    startDelayMs: 500,
    resolveDelayMs: 2000,
    outcome: 'completed',
    result: { sent: true },
    progressMessage: 'E-prescribing...',
  },
  'validation': {
    startDelayMs: 500,
    resolveDelayMs: 1000,
    outcome: 'completed',
    result: { valid: true },
    progressMessage: 'Validating...',
  },
};

// ============================================================================
// Simulator
// ============================================================================

export interface TaskLifecycleSimulator {
  /** Schedule progression for a single task */
  onTaskCreated: (taskId: string) => void;
  /** Clear all pending timers */
  stop: () => void;
}

export function createTaskLifecycleSimulator(
  dispatch: (action: EncounterAction) => void,
  getState: () => EncounterState,
): TaskLifecycleSimulator {
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  function scheduleTimer(fn: () => void, delayMs: number) {
    const id = setTimeout(() => {
      pendingTimers.delete(id);
      fn();
    }, delayMs);
    pendingTimers.add(id);
  }

  function onTaskCreated(taskId: string) {
    const task = getState().entities.tasks[taskId];
    if (!task || task.status !== 'queued') return;

    const lifecycle = LIFECYCLE_MAP[task.type];
    if (!lifecycle) return;

    // Phase 1: queued → processing
    scheduleTimer(() => {
      // Guard: task may have been removed or cancelled
      const current = getState().entities.tasks[taskId];
      if (!current || current.status !== 'queued') return;

      dispatch({
        type: 'TASK_PROGRESS',
        payload: {
          id: taskId,
          progress: 30,
          status: lifecycle.progressMessage,
        },
      });

      // Phase 2: processing → terminal state
      scheduleTimer(() => {
        const latest = getState().entities.tasks[taskId];
        if (!latest || latest.status !== 'processing') return;

        switch (lifecycle.outcome) {
          case 'completed':
            dispatch({
              type: 'TASK_COMPLETED',
              payload: { id: taskId, result: lifecycle.result },
            });
            break;

          case 'failed':
            dispatch({
              type: 'TASK_FAILED',
              payload: { id: taskId, error: lifecycle.error ?? 'Unknown error' },
            });
            break;

          case 'pending-review':
            // Overwrite the task in state with pending-review status.
            // TASK_CREATED with the same ID overwrites cleanly in the reducer.
            dispatch({
              type: 'TASK_CREATED',
              payload: {
                task: {
                  ...latest,
                  status: 'pending-review',
                  result: lifecycle.result,
                  displayStatus: lifecycle.pendingReviewStatus ?? 'Needs review',
                } as BackgroundTask,
              },
            });
            break;
        }
      }, lifecycle.resolveDelayMs);
    }, lifecycle.startDelayMs);
  }

  function stop() {
    for (const id of pendingTimers) {
      clearTimeout(id);
    }
    pendingTimers.clear();
  }

  return { onTaskCreated, stop };
}
