/**
 * TranscriptionContext
 *
 * React context for transcription service management.
 * Handles real-time speech-to-text and segment dispatching.
 */

import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import type { TranscriptionStatus, TranscriptSegment } from '../types/transcription';
import type { TranscriptionService } from '../services/transcription/types';
import {
  createMockTranscriptionService,
  UC_COUGH_SEGMENTS,
  PC_DIABETES_SEGMENTS,
} from '../services/transcription/mock-transcription';
import { useDispatch } from '../hooks';

// ============================================================================
// Types
// ============================================================================

interface TranscriptionContextValue {
  status: TranscriptionStatus;
  duration: number;
  isRecording: boolean;
  isPaused: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  segments: TranscriptSegment[];
}

export interface TranscriptionProviderProps {
  children: React.ReactNode;
  useMock?: boolean;
  mockScenario?: 'uc-cough' | 'pc-diabetes';
}

// ============================================================================
// Context
// ============================================================================

const TranscriptionContext = createContext<TranscriptionContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({
  children,
  useMock = true,
  mockScenario = 'uc-cough',
}) => {
  const dispatch = useDispatch();
  const serviceRef = useRef<TranscriptionService | null>(null);

  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);

  // Duration timer
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize transcription service
  useEffect(() => {
    const segments = mockScenario === 'pc-diabetes'
      ? PC_DIABETES_SEGMENTS
      : UC_COUGH_SEGMENTS;

    if (useMock) {
      serviceRef.current = createMockTranscriptionService({
        segments,
        autoStart: false,
      });
    } else {
      // TODO: Create real transcription service
      // For now, fall back to mock
      serviceRef.current = createMockTranscriptionService({
        segments,
        autoStart: false,
      });
    }

    const service = serviceRef.current;

    // Subscribe to transcription events
    const unsubscribeEvents = service.onEvent((event) => {
      if (event.type === 'segment') {
        const segment = event.data as import('../types/transcription').TranscriptSegment;
        // Add to local segments
        setSegments(prev => [...prev, segment]);

        // Dispatch to store
        dispatch({
          type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
          payload: { segment },
        });
      } else if (event.type === 'status-change') {
        const newStatus = event.data as TranscriptionStatus;
        setStatus(newStatus);

        // Dispatch status actions
        switch (newStatus) {
          case 'recording':
            dispatch({ type: 'TRANSCRIPTION_STARTED', payload: {} });
            break;
          case 'paused':
            dispatch({ type: 'TRANSCRIPTION_PAUSED', payload: {} });
            break;
          case 'idle':
            dispatch({ type: 'TRANSCRIPTION_STOPPED', payload: {} });
            break;
        }
      }
    });

    // Cleanup
    return () => {
      unsubscribeEvents();
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, [useMock, mockScenario, dispatch]);

  // Duration tracking
  useEffect(() => {
    if (status === 'recording') {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (status === 'paused') {
      // Keep duration but stop incrementing
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    } else {
      // Stop timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [status]);

  // Control functions
  const start = useCallback(async () => {
    if (serviceRef.current) {
      setDuration(0);
      setSegments([]);
      await serviceRef.current.start();
    }
  }, []);

  const pause = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.resume();
    }
  }, []);

  const stop = useCallback(async () => {
    if (serviceRef.current) {
      await serviceRef.current.stop();
    }
  }, []);

  const value: TranscriptionContextValue = {
    status,
    duration,
    isRecording: status === 'recording',
    isPaused: status === 'paused',
    start,
    pause,
    resume,
    stop,
    segments,
  };

  return (
    <TranscriptionContext.Provider value={value}>
      {children}
    </TranscriptionContext.Provider>
  );
};

TranscriptionProvider.displayName = 'TranscriptionProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access transcription context
 */
export const useTranscription = (): TranscriptionContextValue => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error('useTranscription must be used within TranscriptionProvider');
  }
  return context;
};

/**
 * Get transcription status
 */
export const useTranscriptionStatus = (): TranscriptionStatus => {
  return useTranscription().status;
};

/**
 * Check if recording
 */
export const useIsRecording = (): boolean => {
  return useTranscription().isRecording;
};

/**
 * Get recording duration in seconds
 */
export const useRecordingDuration = (): number => {
  return useTranscription().duration;
};

/**
 * Get all transcript segments
 */
export const useTranscriptSegments = (): TranscriptSegment[] => {
  return useTranscription().segments;
};
