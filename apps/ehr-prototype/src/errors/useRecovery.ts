/**
 * useRecovery Hook
 *
 * React hook for managing state recovery and snapshots.
 */

import { useRef, useEffect, useCallback } from 'react';
import { RecoveryManager, RecoverySnapshot } from './RecoveryManager';
import { useEncounterState, useDispatch } from '../hooks/useEncounterState';

// ============================================================================
// Types
// ============================================================================

interface UseRecoveryResult {
  /** Save a manual snapshot with optional trigger name */
  saveSnapshot: (trigger?: string) => void;
  /** Restore the most recent snapshot */
  restoreLatest: () => boolean;
  /** Get all available snapshots */
  getSnapshots: () => RecoverySnapshot[];
  /** Get the most recent snapshot */
  getLatestSnapshot: () => RecoverySnapshot | null;
  /** Clear all saved snapshots */
  clearSnapshots: () => void;
  /** Check if recovery data exists */
  hasRecoveryData: () => boolean;
  /** Pause auto-saving */
  pauseAutoSave: () => void;
  /** Resume auto-saving */
  resumeAutoSave: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing encounter state recovery.
 * Automatically saves snapshots and provides recovery methods.
 */
export function useRecovery(): UseRecoveryResult {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const managerRef = useRef<RecoveryManager | null>(null);
  const stateRef = useRef(state);

  // Keep state ref up to date
  stateRef.current = state;

  // Initialize manager
  if (!managerRef.current) {
    managerRef.current = new RecoveryManager({
      getState: () => stateRef.current,
      restoreState: (restoredState) => {
        dispatch({
          type: 'STATE_RESTORED',
          payload: { state: restoredState },
        } as never); // Type assertion for custom action
      },
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  const saveSnapshot = useCallback((trigger?: string) => {
    managerRef.current?.saveSnapshot(trigger);
  }, []);

  const restoreLatest = useCallback(() => {
    return managerRef.current?.restoreLatest() ?? false;
  }, []);

  const getSnapshots = useCallback(() => {
    return managerRef.current?.getSnapshots() ?? [];
  }, []);

  const getLatestSnapshot = useCallback(() => {
    return managerRef.current?.getLatestSnapshot() ?? null;
  }, []);

  const clearSnapshots = useCallback(() => {
    managerRef.current?.clearSnapshots();
  }, []);

  const hasRecoveryData = useCallback(() => {
    return managerRef.current?.hasRecoveryData() ?? false;
  }, []);

  const pauseAutoSave = useCallback(() => {
    managerRef.current?.pauseAutoSave();
  }, []);

  const resumeAutoSave = useCallback(() => {
    managerRef.current?.resumeAutoSave();
  }, []);

  return {
    saveSnapshot,
    restoreLatest,
    getSnapshots,
    getLatestSnapshot,
    clearSnapshots,
    hasRecoveryData,
    pauseAutoSave,
    resumeAutoSave,
  };
}

/**
 * Hook that saves a snapshot when the component unmounts.
 * Useful for critical sections where data loss is unacceptable.
 */
export function useSaveOnUnmount(trigger: string = 'unmount'): void {
  const { saveSnapshot } = useRecovery();

  useEffect(() => {
    return () => {
      saveSnapshot(trigger);
    };
  }, [saveSnapshot, trigger]);
}

/**
 * Hook that saves a snapshot before page unload (web only).
 */
export function useSaveOnPageUnload(): void {
  const { saveSnapshot } = useRecovery();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      saveSnapshot('page-unload');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveSnapshot]);
}
