/**
 * Transcription Service Types
 *
 * Types for the transcription service that handles audio capture
 * and speech-to-text conversion during clinical encounters.
 */

import type { TranscriptSegment, TranscriptionStatus } from '../../types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for the transcription service
 */
export interface TranscriptionConfig {
  /** Audio sample rate in Hz (default: 16000) */
  sampleRate: number;

  /** Language code (default: 'en-US') */
  language: string;

  /** Enable speaker diarization to distinguish speakers */
  enableSpeakerDiarization: boolean;

  /** Maximum duration of a single segment in seconds */
  maxSegmentDuration: number;

  /** Silence threshold in dB for segment boundaries */
  silenceThreshold: number;

  /** Minimum confidence score (0-1) to accept a segment */
  minConfidence: number;
}

/**
 * Default transcription configuration
 */
export const DEFAULT_TRANSCRIPTION_CONFIG: TranscriptionConfig = {
  sampleRate: 16000,
  language: 'en-US',
  enableSpeakerDiarization: true,
  maxSegmentDuration: 30,
  silenceThreshold: -40,
  minConfidence: 0.6,
};

// ============================================================================
// Events
// ============================================================================

/**
 * Partial transcript (interim result before finalization)
 */
export interface PartialTranscript {
  /** Interim text */
  text: string;

  /** Current confidence level */
  confidence: number;

  /** Whether this is the final version */
  isFinal: boolean;
}

/**
 * Transcription error details
 */
export interface TranscriptionError {
  /** Error code */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Whether the error is recoverable (can retry) */
  recoverable: boolean;
}

/**
 * Transcription event types
 */
export type TranscriptionEventType = 'segment' | 'partial' | 'error' | 'status-change';

/**
 * Event data union based on event type
 */
export type TranscriptionEventData =
  | { type: 'segment'; data: TranscriptSegment }
  | { type: 'partial'; data: PartialTranscript }
  | { type: 'error'; data: TranscriptionError }
  | { type: 'status-change'; data: TranscriptionStatus };

/**
 * Transcription event emitted by the service
 */
export interface TranscriptionEvent {
  /** Event type */
  type: TranscriptionEventType;

  /** When the event occurred */
  timestamp: Date;

  /** Event data (type depends on event type) */
  data: TranscriptSegment | PartialTranscript | TranscriptionError | TranscriptionStatus;
}

/**
 * Event handler callback
 */
export type TranscriptionEventHandler = (event: TranscriptionEvent) => void;

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Transcription service interface
 */
export interface TranscriptionService {
  // Lifecycle
  /**
   * Start transcription
   */
  start(): Promise<void>;

  /**
   * Pause transcription (preserves state)
   */
  pause(): void;

  /**
   * Resume paused transcription
   */
  resume(): void;

  /**
   * Stop transcription and return all segments
   */
  stop(): Promise<TranscriptSegment[]>;

  // State
  /**
   * Get current transcription status
   */
  getStatus(): TranscriptionStatus;

  /**
   * Get all captured segments
   */
  getSegments(): TranscriptSegment[];

  /**
   * Get total duration in seconds
   */
  getDuration(): number;

  // Events
  /**
   * Subscribe to transcription events
   * @returns Unsubscribe function
   */
  onEvent(handler: TranscriptionEventHandler): () => void;

  // Configuration
  /**
   * Update configuration (some changes may require restart)
   */
  updateConfig(config: Partial<TranscriptionConfig>): void;

  /**
   * Get current configuration
   */
  getConfig(): TranscriptionConfig;
}
