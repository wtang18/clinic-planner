/**
 * Transcription Service
 *
 * Exports all transcription service components.
 */

// Types
export type {
  TranscriptionConfig,
  PartialTranscript,
  TranscriptionError,
  TranscriptionEventType,
  TranscriptionEventData,
  TranscriptionEvent,
  TranscriptionEventHandler,
  TranscriptionService,
} from './types';

export { DEFAULT_TRANSCRIPTION_CONFIG } from './types';

// Service implementation
export { createTranscriptionService, TranscriptionServiceImpl } from './transcription-service';

// Mock implementation
export type { MockSegmentConfig, MockTranscriptionConfig } from './mock-transcription';
export {
  createMockTranscriptionService,
  UC_COUGH_SEGMENTS,
  PC_DIABETES_SEGMENTS,
} from './mock-transcription';
