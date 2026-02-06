/**
 * Mock Transcription Service
 *
 * A mock implementation for testing that plays back pre-defined
 * transcript segments with realistic timing.
 */

import { nanoid } from 'nanoid';
import type { TranscriptSegment } from '../../types';
import type {
  TranscriptionConfig,
  TranscriptionService,
  TranscriptionEventHandler,
  TranscriptionEvent,
} from './types';
import { DEFAULT_TRANSCRIPTION_CONFIG } from './types';

// ============================================================================
// Mock Configuration
// ============================================================================

/**
 * Configuration for mock segment playback
 */
export interface MockSegmentConfig {
  /** Text content of the segment */
  text: string;

  /** Delay in milliseconds before this segment appears */
  delayMs: number;

  /** Confidence score (0-1) */
  confidence?: number;

  /** Speaker identifier */
  speaker?: 'provider' | 'patient' | 'other' | 'unknown';
}

/**
 * Configuration for the mock transcription service
 */
export interface MockTranscriptionConfig {
  /** Segments to play back */
  segments: MockSegmentConfig[];

  /** Auto-start on creation */
  autoStart?: boolean;

  /** Loop segments continuously */
  loop?: boolean;
}

// ============================================================================
// Pre-built Mock Scenarios
// ============================================================================

/**
 * Mock segments for an Urgent Care cough visit
 */
export const UC_COUGH_SEGMENTS: MockSegmentConfig[] = [
  {
    text: "Hello, I see you're here for a cough. How long have you been coughing?",
    delayMs: 1000,
    confidence: 0.95,
    speaker: 'provider',
  },
  {
    text: "It's been about 5 days now. Started with a sore throat and then turned into this dry cough.",
    delayMs: 3000,
    confidence: 0.92,
    speaker: 'patient',
  },
  {
    text: 'Any fever, shortness of breath, or chest pain?',
    delayMs: 2500,
    confidence: 0.97,
    speaker: 'provider',
  },
  {
    text: "I had a low fever the first couple days, maybe 99 or 100. No chest pain, but I do feel a little short of breath when I'm coughing a lot.",
    delayMs: 4000,
    confidence: 0.89,
    speaker: 'patient',
  },
  {
    text: 'Are you bringing up any phlegm or mucus?',
    delayMs: 2000,
    confidence: 0.94,
    speaker: 'provider',
  },
  {
    text: "Yes, it started clear but now it's kind of yellowish green.",
    delayMs: 2500,
    confidence: 0.91,
    speaker: 'patient',
  },
  {
    text: "I'm going to listen to your lungs and check your vitals. Are you taking any medications currently?",
    delayMs: 3000,
    confidence: 0.96,
    speaker: 'provider',
  },
  {
    text: "Just Lisinopril for my blood pressure. I've been taking some Mucinex for the cough.",
    delayMs: 2500,
    confidence: 0.93,
    speaker: 'patient',
  },
  {
    text: 'I hear some mild wheezing in the lower lobes. No consolidation. I think we should do a chest X-ray and consider starting an antibiotic given the productive cough and duration.',
    delayMs: 4500,
    confidence: 0.88,
    speaker: 'provider',
  },
];

/**
 * Mock segments for a Primary Care diabetes follow-up
 */
export const PC_DIABETES_SEGMENTS: MockSegmentConfig[] = [
  {
    text: "Good morning! I see you're here for your diabetes follow-up. How have you been feeling?",
    delayMs: 1000,
    confidence: 0.96,
    speaker: 'provider',
  },
  {
    text: "Pretty good overall. I've been trying to watch what I eat more.",
    delayMs: 2500,
    confidence: 0.94,
    speaker: 'patient',
  },
  {
    text: "That's great to hear. Have you been checking your blood sugars at home?",
    delayMs: 2000,
    confidence: 0.95,
    speaker: 'provider',
  },
  {
    text: "Yes, they've been running between 120 and 180 fasting. Sometimes higher after meals.",
    delayMs: 3000,
    confidence: 0.91,
    speaker: 'patient',
  },
  {
    text: 'I see your A1C from last month was 7.8. Any episodes of low blood sugar or hypoglycemia?',
    delayMs: 2500,
    confidence: 0.93,
    speaker: 'provider',
  },
  {
    text: 'No, nothing like that. I did have some nausea the first week on the Metformin but that went away.',
    delayMs: 3000,
    confidence: 0.90,
    speaker: 'patient',
  },
  {
    text: "Good. We should check your microalbumin since it's been a year. Also time for your eye exam referral.",
    delayMs: 2500,
    confidence: 0.94,
    speaker: 'provider',
  },
  {
    text: "Oh I've been meaning to schedule that. My vision has been a little blurry sometimes.",
    delayMs: 2000,
    confidence: 0.92,
    speaker: 'patient',
  },
  {
    text: "Let's definitely get that scheduled soon then. I'm going to increase your Metformin to 1000mg twice daily and we'll recheck your A1C in 3 months.",
    delayMs: 4000,
    confidence: 0.89,
    speaker: 'provider',
  },
];

// ============================================================================
// Mock Service Implementation
// ============================================================================

/**
 * Create a mock transcription service that plays back pre-defined segments
 */
export function createMockTranscriptionService(
  mockConfig: MockTranscriptionConfig,
  transcriptionConfig?: Partial<TranscriptionConfig>
): TranscriptionService {
  const config = { ...DEFAULT_TRANSCRIPTION_CONFIG, ...transcriptionConfig };
  let status: string = 'idle';
  const segments: TranscriptSegment[] = [];
  const eventHandlers = new Set<TranscriptionEventHandler>();
  let playbackTimeouts: ReturnType<typeof setTimeout>[] = [];
  let currentSegmentIndex = 0;
  let startTime: number | null = null;
  let pauseTime: number | null = null;
  let totalPausedDuration = 0;

  const setStatus = (newStatus: string): void => {
    status = newStatus;
    emitEvent({
      type: 'status-change',
      timestamp: new Date(),
      data: newStatus as import('../../types').TranscriptionStatus,
    });
  };

  const emitEvent = (event: TranscriptionEvent): void => {
    for (const handler of eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in transcription event handler:', error);
      }
    }
  };

  const scheduleSegments = (): void => {
    let cumulativeDelay = 0;

    for (let i = currentSegmentIndex; i < mockConfig.segments.length; i++) {
      const segConfig = mockConfig.segments[i];
      cumulativeDelay += segConfig.delayMs;

      const timeout = setTimeout(() => {
        if (status !== 'recording') {
          return;
        }

        const elapsed = getDuration();
        const segment: TranscriptSegment = {
          id: `seg-${nanoid(8)}`,
          text: segConfig.text,
          startTime: elapsed - segConfig.delayMs / 1000,
          endTime: elapsed,
          confidence: segConfig.confidence ?? 0.9,
          speaker: segConfig.speaker,
        };

        segments.push(segment);
        currentSegmentIndex = i + 1;

        emitEvent({
          type: 'segment',
          timestamp: new Date(),
          data: segment,
        });

        // Handle looping
        if (mockConfig.loop && currentSegmentIndex >= mockConfig.segments.length) {
          currentSegmentIndex = 0;
          scheduleSegments();
        }
      }, cumulativeDelay);

      playbackTimeouts.push(timeout);
    }
  };

  const clearTimeouts = (): void => {
    for (const timeout of playbackTimeouts) {
      clearTimeout(timeout);
    }
    playbackTimeouts = [];
  };

  const getDuration = (): number => {
    if (startTime === null) {
      return 0;
    }
    const now = pauseTime ?? Date.now();
    return (now - startTime - totalPausedDuration) / 1000;
  };

  const service: TranscriptionService = {
    async start(): Promise<void> {
      if (status === 'recording') {
        return;
      }

      segments.length = 0;
      currentSegmentIndex = 0;
      startTime = Date.now();
      pauseTime = null;
      totalPausedDuration = 0;

      setStatus('recording');
      scheduleSegments();
    },

    pause(): void {
      if (status !== 'recording') {
        return;
      }

      pauseTime = Date.now();
      clearTimeouts();
      setStatus('paused');
    },

    resume(): void {
      if (status !== 'paused' || pauseTime === null) {
        return;
      }

      totalPausedDuration += Date.now() - pauseTime;
      pauseTime = null;

      setStatus('recording');
      scheduleSegments();
    },

    async stop(): Promise<TranscriptSegment[]> {
      if (status === 'idle') {
        return [...segments];
      }

      clearTimeouts();
      setStatus('processing');

      await new Promise((resolve) => setTimeout(resolve, 100));

      setStatus('idle');
      startTime = null;
      pauseTime = null;

      return [...segments];
    },

    getStatus(): import('../../types').TranscriptionStatus {
      return status as import('../../types').TranscriptionStatus;
    },

    getSegments(): TranscriptSegment[] {
      return [...segments];
    },

    getDuration,

    onEvent(handler: TranscriptionEventHandler): () => void {
      eventHandlers.add(handler);
      return () => {
        eventHandlers.delete(handler);
      };
    },

    updateConfig(newConfig: Partial<TranscriptionConfig>): void {
      Object.assign(config, newConfig);
    },

    getConfig(): TranscriptionConfig {
      return { ...config };
    },
  };

  // Auto-start if configured
  if (mockConfig.autoStart) {
    // Use setTimeout to allow caller to attach event handlers first
    setTimeout(() => {
      service.start().catch(console.error);
    }, 0);
  }

  return service;
}
