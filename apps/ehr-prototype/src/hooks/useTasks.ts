/**
 * useTasks Hooks
 *
 * Hooks for accessing and managing background tasks.
 */

import React from 'react';
import type { BackgroundTask, TaskStatus } from '../types';
import {
  selectAllTasks,
  selectTask,
} from '../state/selectors/entities';
import {
  selectTasksByStatus,
  selectPendingTasks,
  selectProcessingTasks,
  selectReadyTasks,
  selectCompletedTasks,
  selectFailedTasks,
} from '../state/selectors/derived';
import {
  taskApproved,
  taskRejected,
  tasksBatchApproved,
} from '../state/actions/creators';
import { useSelector, useDispatch } from './useEncounterState';

// ============================================================================
// Basic Task Hooks
// ============================================================================

/**
 * Get all tasks
 */
export function useTasks(): BackgroundTask[] {
  return useSelector(selectAllTasks);
}

/**
 * Get a single task by ID
 */
export function useTask(id: string): BackgroundTask | undefined {
  return useSelector((state) => selectTask(state, id));
}

/**
 * Get tasks filtered by status
 */
export function useTasksByStatus(status: TaskStatus): BackgroundTask[] {
  return useSelector((state) => selectTasksByStatus(state, status));
}

// ============================================================================
// Status-Specific Hooks
// ============================================================================

/**
 * Get pending tasks (needs action)
 */
export function usePendingTasks(): BackgroundTask[] {
  return useSelector(selectPendingTasks);
}

/**
 * Get processing tasks
 */
export function useProcessingTasks(): BackgroundTask[] {
  return useSelector(selectProcessingTasks);
}

/**
 * Get ready tasks
 */
export function useReadyTasks(): BackgroundTask[] {
  return useSelector(selectReadyTasks);
}

/**
 * Get completed tasks
 */
export function useCompletedTasks(): BackgroundTask[] {
  return useSelector(selectCompletedTasks);
}

/**
 * Get failed tasks
 */
export function useFailedTasks(): BackgroundTask[] {
  return useSelector(selectFailedTasks);
}

// ============================================================================
// Task Actions
// ============================================================================

export interface TaskActions {
  /** Approve a task */
  approveTask: (id: string) => void;
  /** Reject a task */
  rejectTask: (id: string, reason?: string) => void;
  /** Batch approve multiple tasks */
  batchApprove: (ids: string[]) => void;
}

/**
 * Get actions for managing tasks
 */
export function useTaskActions(): TaskActions {
  const dispatch = useDispatch();

  return React.useMemo(
    () => ({
      approveTask: (id: string) => {
        dispatch(taskApproved(id));
      },

      rejectTask: (id: string, reason?: string) => {
        dispatch(taskRejected(id, reason));
      },

      batchApprove: (ids: string[]) => {
        dispatch(tasksBatchApproved(ids));
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for tasks and actions
 */
export function useTasksWithActions(): {
  tasks: BackgroundTask[];
  pendingTasks: BackgroundTask[];
  actions: TaskActions;
} {
  const tasks = useTasks();
  const pendingTasks = usePendingTasks();
  const actions = useTaskActions();

  return { tasks, pendingTasks, actions };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get count of tasks needing review
 */
export function usePendingReviewCount(): number {
  return useSelector((state) => selectPendingTasks(state).length);
}

/**
 * Get tasks related to a specific item
 */
export function useTasksForItem(itemId: string): BackgroundTask[] {
  return useSelector((state) => {
    const tasks = selectAllTasks(state);
    return tasks.filter((t) => t.trigger.itemId === itemId);
  });
}

/**
 * Get tasks grouped by status
 */
export function useTasksGroupedByStatus(): Record<TaskStatus, BackgroundTask[]> {
  return useSelector((state) => {
    const tasks = selectAllTasks(state);
    const grouped: Partial<Record<TaskStatus, BackgroundTask[]>> = {};

    for (const task of tasks) {
      if (!grouped[task.status]) {
        grouped[task.status] = [];
      }
      grouped[task.status]!.push(task);
    }

    return grouped as Record<TaskStatus, BackgroundTask[]>;
  });
}

/**
 * Check if there are any active tasks (processing or pending)
 */
export function useHasActiveTasks(): boolean {
  return useSelector((state) => {
    const processing = selectProcessingTasks(state);
    const pending = selectPendingTasks(state);
    return processing.length > 0 || pending.length > 0;
  });
}

/**
 * Check if there are any failed tasks
 */
export function useHasFailedTasks(): boolean {
  return useSelector((state) => selectFailedTasks(state).length > 0);
}

/**
 * Get overall task progress (for multiple running tasks)
 */
export function useOverallTaskProgress(): { total: number; completed: number; progress: number } {
  return useSelector((state) => {
    const tasks = selectAllTasks(state);
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'cancelled'
    ).length;

    return {
      total,
      completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  });
}

/**
 * Get tasks grouped for task pane display
 */
export function useTaskPaneGroups(): {
  readyToSend: BackgroundTask[];
  needsReview: BackgroundTask[];
  processing: BackgroundTask[];
  completed: BackgroundTask[];
} {
  const readyToSend = useReadyTasks();
  const needsReview = useSelector((state) =>
    selectTasksByStatus(state, 'pending-review')
  );
  const processing = useProcessingTasks();
  const completed = useCompletedTasks();

  return { readyToSend, needsReview, processing, completed };
}
