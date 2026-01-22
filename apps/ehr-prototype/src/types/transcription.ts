/**
 * Transcription types
 */

// ============================================================================
// Transcription State
// ============================================================================

/** Transcription status */
export type TranscriptionStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'error';

/** Transcription state */
export interface TranscriptionState {
  status: TranscriptionStatus;
  startedAt?: Date;
  pausedAt?: Date;
  
  // Current segment being processed
  currentSegment?: TranscriptSegment;
  
  // Statistics
  totalDuration: number;         // seconds
  segmentCount: number;
}

// ============================================================================
// Transcript Segments
// ============================================================================

/** Entity types that can be extracted */
export type EntityType =
  | 'medication'
  | 'diagnosis'
  | 'symptom'
  | 'duration'
  | 'body-part'
  | 'vital-sign'
  | 'lab-test'
  | 'procedure'
  | 'allergy';

/** Extracted entity from transcript */
export interface ExtractedEntity {
  type: EntityType;
  text: string;
  normalizedValue?: unknown;
  span: [number, number];        // Position in segment text
  confidence: number;
}

/** Transcript segment */
export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;             // seconds from start
  endTime: number;
  confidence: number;            // 0-1
  speaker?: 'provider' | 'patient' | 'other' | 'unknown';
  
  // Extracted entities
  entities?: ExtractedEntity[];
}
