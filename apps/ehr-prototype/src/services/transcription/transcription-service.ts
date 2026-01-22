/**
 * Transcription Service Implementation
 *
 * Manages audio transcription state and segment processing.
 * This implementation provides the core structure - in production,
 * it would integrate with Web Audio API and a speech-to-text service.
 */

import { nanoid } from 'nanoid';
import type { TranscriptSegment, TranscriptionStatus } from '../../types';
import type {
  TranscriptionConfig,
  TranscriptionService,
  TranscriptionEventHandler,
  TranscriptionEvent,
} from './types';
import { DEFAULT_TRANSCRIPTION_CONFIG } from './types';

// ============================================================================
// Service Implementation
// ============================================================================

class TranscriptionServiceImpl implements TranscriptionService {
  private config: TranscriptionConfig;
  private status: TranscriptionStatus = 'idle';
  private segments: TranscriptSegment[] = [];
  private eventHandlers: Set<TranscriptionEventHandler> = new Set();
  private startTime: number | null = null;
  private pauseTime: number | null = null;
  private totalPausedDuration = 0;

  constructor(config?: Partial<TranscriptionConfig>) {
    this.config = { ...DEFAULT_TRANSCRIPTION_CONFIG, ...config };
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  async start(): Promise<void> {
    if (this.status === 'recording') {
      return;
    }

    this.segments = [];
    this.startTime = Date.now();
    this.pauseTime = null;
    this.totalPausedDuration = 0;

    this.setStatus('recording');

    // In production, this would:
    // 1. Request microphone permission
    // 2. Create AudioContext and connect to speech-to-text service
    // 3. Begin streaming audio
  }

  pause(): void {
    if (this.status !== 'recording') {
      return;
    }

    this.pauseTime = Date.now();
    this.setStatus('paused');
  }

  resume(): void {
    if (this.status !== 'paused' || this.pauseTime === null) {
      return;
    }

    this.totalPausedDuration += Date.now() - this.pauseTime;
    this.pauseTime = null;

    this.setStatus('recording');
  }

  async stop(): Promise<TranscriptSegment[]> {
    if (this.status === 'idle') {
      return this.segments;
    }

    this.setStatus('processing');

    // In production, this would:
    // 1. Stop audio capture
    // 2. Wait for final segments to be processed
    // 3. Clean up resources

    // Small delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.setStatus('idle');
    this.startTime = null;
    this.pauseTime = null;

    return this.segments;
  }

  // ============================================================================
  // State Methods
  // ============================================================================

  getStatus(): TranscriptionStatus {
    return this.status;
  }

  getSegments(): TranscriptSegment[] {
    return [...this.segments];
  }

  getDuration(): number {
    if (this.startTime === null) {
      return 0;
    }

    const now = this.pauseTime ?? Date.now();
    return (now - this.startTime - this.totalPausedDuration) / 1000;
  }

  // ============================================================================
  // Event Methods
  // ============================================================================

  onEvent(handler: TranscriptionEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  // ============================================================================
  // Configuration Methods
  // ============================================================================

  updateConfig(config: Partial<TranscriptionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): TranscriptionConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Internal Methods (Protected for subclass access)
  // ============================================================================

  /**
   * Add a segment (called by subclasses or audio processing)
   */
  protected addSegment(segment: TranscriptSegment): void {
    // Filter out low confidence segments
    if (segment.confidence < this.config.minConfidence) {
      return;
    }

    this.segments.push(segment);

    this.emitEvent({
      type: 'segment',
      timestamp: new Date(),
      data: segment,
    });
  }

  /**
   * Emit a partial transcript
   */
  protected emitPartial(text: string, confidence: number, isFinal: boolean): void {
    this.emitEvent({
      type: 'partial',
      timestamp: new Date(),
      data: { text, confidence, isFinal },
    });
  }

  /**
   * Emit an error
   */
  protected emitError(code: string, message: string, recoverable: boolean): void {
    if (!recoverable) {
      this.setStatus('error');
    }

    this.emitEvent({
      type: 'error',
      timestamp: new Date(),
      data: { code, message, recoverable },
    });
  }

  /**
   * Set status and emit status change event
   */
  protected setStatus(status: TranscriptionStatus): void {
    this.status = status;

    this.emitEvent({
      type: 'status-change',
      timestamp: new Date(),
      data: status,
    });
  }

  /**
   * Emit an event to all handlers
   */
  protected emitEvent(event: TranscriptionEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in transcription event handler:', error);
      }
    }
  }

  /**
   * Generate a unique segment ID
   */
  protected generateSegmentId(): string {
    return `seg-${nanoid(8)}`;
  }

  /**
   * Get elapsed time in seconds since start
   */
  protected getElapsedTime(): number {
    return this.getDuration();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new transcription service
 */
export function createTranscriptionService(
  config?: Partial<TranscriptionConfig>
): TranscriptionService {
  return new TranscriptionServiceImpl(config);
}

// Export the class for extension
export { TranscriptionServiceImpl };
