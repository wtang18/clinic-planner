/**
 * useTaskLifecycleSimulator Hook
 *
 * Watches the encounter store for newly-created tasks with status 'queued'
 * and feeds them to the task lifecycle simulator, which auto-progresses
 * them through queued → processing → terminal state on timers.
 *
 * Mount this hook once inside the encounter provider tree.
 */

import React from 'react';
import { useStore } from './useEncounterState';
import { createTaskLifecycleSimulator } from '../services/task-lifecycle-simulator';

export function useTaskLifecycleSimulator(): void {
  const store = useStore();

  React.useEffect(() => {
    const simulator = createTaskLifecycleSimulator(store.dispatch, store.getState);

    // Track which task IDs we've already scheduled
    const scheduled = new Set<string>();

    // Scan current tasks on mount (catch any already-queued tasks)
    const initial = store.getState().entities.tasks;
    for (const id of Object.keys(initial)) {
      if (initial[id].status === 'queued') {
        scheduled.add(id);
        simulator.onTaskCreated(id);
      }
    }

    // Subscribe to state changes to detect new tasks
    const unsubscribe = store.subscribe((state) => {
      const tasks = state.entities.tasks;
      for (const id of Object.keys(tasks)) {
        if (!scheduled.has(id) && tasks[id].status === 'queued') {
          scheduled.add(id);
          simulator.onTaskCreated(id);
        }
      }
    });

    return () => {
      unsubscribe();
      simulator.stop();
    };
  }, [store]);
}
