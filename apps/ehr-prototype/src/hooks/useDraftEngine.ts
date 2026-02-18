/**
 * useDraftEngine Hook
 *
 * Manages the draft engine lifecycle — starts when transcription is active
 * in capture mode, stops on mode change or transcription stop.
 */

import React from 'react';
import type { DraftEngineConfig } from '../services/draft-engine/types';
import { createDraftEngine } from '../services/draft-engine';
import type { DraftEngine } from '../services/draft-engine';
import { useDispatch, useStore, useMode } from './useEncounterState';

export interface UseDraftEngineOptions {
  /** Override the default draft engine config */
  config?: DraftEngineConfig;
  /** Whether the engine should be active (e.g., transcription is recording) */
  enabled?: boolean;
}

export interface UseDraftEngineReturn {
  /** Whether the engine is currently running */
  isRunning: boolean;
  /** Manually start the engine */
  start: () => void;
  /** Manually stop the engine */
  stop: () => void;
}

/**
 * Hook to manage draft engine lifecycle.
 *
 * When `enabled` is true and mode is 'capture', the engine starts.
 * When `enabled` is false or mode changes away from 'capture', the engine stops.
 */
export function useDraftEngine(options: UseDraftEngineOptions = {}): UseDraftEngineReturn {
  const { config, enabled = false } = options;
  const dispatch = useDispatch();
  const store = useStore();
  const mode = useMode();

  const engineRef = React.useRef<DraftEngine | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  // Create engine instance once
  React.useEffect(() => {
    const engine = createDraftEngine(
      dispatch,
      () => store.getState(),
      config
    );
    engineRef.current = engine;

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [dispatch, store, config]);

  // Start/stop based on enabled + mode
  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (enabled && mode === 'capture') {
      engine.start();
      setIsRunning(true);
    } else {
      engine.stop();
      setIsRunning(false);
    }
  }, [enabled, mode]);

  const start = React.useCallback(() => {
    engineRef.current?.start();
    setIsRunning(true);
  }, []);

  const stop = React.useCallback(() => {
    engineRef.current?.stop();
    setIsRunning(false);
  }, []);

  return { isRunning, start, stop };
}
