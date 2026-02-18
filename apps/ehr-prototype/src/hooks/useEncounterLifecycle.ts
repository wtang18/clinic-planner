/**
 * useEncounterLifecycle Hook
 *
 * Provides encounter lifecycle actions and computed phase:
 * - openWithHandoff(): loads mock MA data
 * - providerStart(): starts transcription
 * - signEncounter(): dispatches ENCOUNTER_SIGNED
 * - phase: computed from state (pre-handoff → ma-handoff → provider-active → wrap-up → signed)
 */

import { useCallback, useMemo } from 'react';
import { useEncounterState, useDispatch } from './useEncounterState';
import { loadMockEncounter } from '../data/mock-encounter';

// ============================================================================
// Types
// ============================================================================

export type EncounterPhase =
  | 'pre-handoff'     // No encounter loaded
  | 'ma-handoff'      // Encounter opened but provider hasn't started
  | 'provider-active' // Provider is actively documenting
  | 'wrap-up'         // In review mode
  | 'signed';         // Encounter signed

export interface UseEncounterLifecycleResult {
  /** Current lifecycle phase */
  phase: EncounterPhase;
  /** Load mock MA handoff data */
  openWithHandoff: () => void;
  /** Start provider session (begins transcription) */
  providerStart: () => void;
  /** Sign the encounter */
  signEncounter: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useEncounterLifecycle(): UseEncounterLifecycleResult {
  const state = useEncounterState();
  const dispatch = useDispatch();

  // Compute phase from state
  const phase = useMemo((): EncounterPhase => {
    const encounter = state.context.encounter;

    // No encounter loaded
    if (!encounter) return 'pre-handoff';

    // Encounter is signed
    if (encounter.status === 'signed') return 'signed';

    // Check if provider has started (transcription has been started at least once)
    const txStatus = state.session.transcription.status;
    const isActivelyRecording = txStatus === 'recording' || txStatus === 'paused';
    const hasRecorded = state.session.transcription.totalDuration > 0;

    // In review mode = wrap-up
    if (state.session.mode === 'review') return 'wrap-up';

    // Provider is actively documenting
    if (isActivelyRecording || hasRecorded) {
      return 'provider-active';
    }

    // Encounter open but provider hasn't started
    return 'ma-handoff';
  }, [state.context.encounter, state.session.transcription, state.session.mode]);

  const openWithHandoff = useCallback(() => {
    loadMockEncounter(dispatch);
  }, [dispatch]);

  const providerStart = useCallback(() => {
    dispatch({
      type: 'TRANSCRIPTION_STARTED',
      payload: {},
    });
  }, [dispatch]);

  const signEncounter = useCallback(() => {
    dispatch({
      type: 'ENCOUNTER_SIGNED',
      payload: {
        signedAt: new Date(),
      },
    });
  }, [dispatch]);

  return {
    phase,
    openWithHandoff,
    providerStart,
    signEncounter,
  };
}
