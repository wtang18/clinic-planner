/**
 * Mock Transcripts for Demo Mode
 *
 * Pre-authored transcript segments that simulate real transcription output.
 * Used for demo purposes to show progressive transcript reveal without
 * requiring actual microphone input.
 */

import type { TranscriptSegment, ExtractedEntity } from '../../types/transcription';

// ============================================================================
// "Cough x 5 days" Scenario
// ============================================================================

/**
 * Demo transcript: Patient presenting with cough for 5 days
 * Demonstrates typical HPI conversation with entity extraction
 */
export const COUGH_5_DAYS_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: 'seg-001',
    text: "Hi, what brings you in today?",
    startTime: 0,
    endTime: 2.5,
    confidence: 0.95,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-002',
    text: "I've had this cough for about five days now and it's getting worse.",
    startTime: 3.0,
    endTime: 7.2,
    confidence: 0.92,
    speaker: 'patient',
    entities: [
      {
        type: 'symptom',
        text: 'cough',
        span: [14, 19],
        confidence: 0.96,
      },
      {
        type: 'duration',
        text: 'five days',
        span: [30, 39],
        confidence: 0.94,
        normalizedValue: { value: 5, unit: 'days' },
      },
    ],
  },
  {
    id: 'seg-003',
    text: "Is it a dry cough or are you bringing anything up?",
    startTime: 8.0,
    endTime: 11.5,
    confidence: 0.94,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-004',
    text: "It's mostly dry, but sometimes I have some yellow phlegm in the morning.",
    startTime: 12.0,
    endTime: 17.0,
    confidence: 0.88,
    speaker: 'patient',
    entities: [
      {
        type: 'symptom',
        text: 'dry cough',
        span: [5, 14],
        confidence: 0.90,
      },
      {
        type: 'symptom',
        text: 'yellow phlegm',
        span: [47, 60],
        confidence: 0.85,
      },
    ],
  },
  {
    id: 'seg-005',
    text: "Any fever, chills, or body aches?",
    startTime: 18.0,
    endTime: 20.5,
    confidence: 0.97,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-006',
    text: "No fever that I've noticed. Maybe some mild fatigue.",
    startTime: 21.0,
    endTime: 24.5,
    confidence: 0.91,
    speaker: 'patient',
    entities: [
      {
        type: 'symptom',
        text: 'no fever',
        span: [0, 8],
        confidence: 0.93,
        normalizedValue: { negated: true },
      },
      {
        type: 'symptom',
        text: 'mild fatigue',
        span: [39, 51],
        confidence: 0.87,
      },
    ],
  },
  {
    id: 'seg-007',
    text: "And any shortness of breath or chest pain?",
    startTime: 25.0,
    endTime: 28.0,
    confidence: 0.96,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-008',
    text: "Not really, maybe a little tightness when I cough hard.",
    startTime: 28.5,
    endTime: 32.0,
    confidence: 0.89,
    speaker: 'patient',
    entities: [
      {
        type: 'symptom',
        text: 'tightness',
        span: [27, 36],
        confidence: 0.82,
      },
      {
        type: 'body-part',
        text: 'chest',
        span: [27, 36],
        confidence: 0.78,
        normalizedValue: { implied: true },
      },
    ],
  },
  {
    id: 'seg-009',
    text: "Are you taking anything for it? Any over-the-counter medications?",
    startTime: 33.0,
    endTime: 37.5,
    confidence: 0.93,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-010',
    text: "Just some Mucinex and honey tea. Doesn't seem to help much.",
    startTime: 38.0,
    endTime: 42.5,
    confidence: 0.90,
    speaker: 'patient',
    entities: [
      {
        type: 'medication',
        text: 'Mucinex',
        span: [10, 17],
        confidence: 0.98,
        normalizedValue: { rxcui: '859967', name: 'guaifenesin' },
      },
    ],
  },
  {
    id: 'seg-011',
    text: "Okay, let me take a listen to your lungs.",
    startTime: 43.5,
    endTime: 46.0,
    confidence: 0.95,
    speaker: 'provider',
    entities: [
      {
        type: 'procedure',
        text: 'listen to your lungs',
        span: [18, 38],
        confidence: 0.88,
        normalizedValue: { cptHint: 'auscultation' },
      },
    ],
  },
  {
    id: 'seg-012',
    text: "Deep breath in... and out. One more time.",
    startTime: 48.0,
    endTime: 52.0,
    confidence: 0.94,
    speaker: 'provider',
    entities: [],
  },
  {
    id: 'seg-013',
    text: "Your lungs sound clear. I think this is likely a viral upper respiratory infection.",
    startTime: 54.0,
    endTime: 60.0,
    confidence: 0.91,
    speaker: 'provider',
    entities: [
      {
        type: 'body-part',
        text: 'lungs',
        span: [5, 10],
        confidence: 0.97,
      },
      {
        type: 'diagnosis',
        text: 'viral upper respiratory infection',
        span: [48, 81],
        confidence: 0.86,
        normalizedValue: { icd10: 'J06.9', snomedCt: '54150009' },
      },
    ],
  },
];

// ============================================================================
// Reveal Schedule
// ============================================================================

/**
 * Timing for progressive segment reveal during demo recording.
 * Each entry specifies when (in seconds) a segment should appear.
 */
export const COUGH_5_DAYS_TIMING: Array<{ segmentId: string; revealAt: number }> = [
  { segmentId: 'seg-001', revealAt: 3 },
  { segmentId: 'seg-002', revealAt: 8 },
  { segmentId: 'seg-003', revealAt: 12 },
  { segmentId: 'seg-004', revealAt: 18 },
  { segmentId: 'seg-005', revealAt: 21 },
  { segmentId: 'seg-006', revealAt: 25 },
  { segmentId: 'seg-007', revealAt: 28 },
  { segmentId: 'seg-008', revealAt: 32 },
  { segmentId: 'seg-009', revealAt: 38 },
  { segmentId: 'seg-010', revealAt: 43 },
  { segmentId: 'seg-011', revealAt: 47 },
  { segmentId: 'seg-012', revealAt: 53 },
  { segmentId: 'seg-013', revealAt: 60 },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get segments that should be revealed at a given time
 */
export function getRevealedSegments(
  elapsedSeconds: number,
  transcript: TranscriptSegment[] = COUGH_5_DAYS_TRANSCRIPT,
  timing: Array<{ segmentId: string; revealAt: number }> = COUGH_5_DAYS_TIMING
): TranscriptSegment[] {
  const revealedIds = timing
    .filter((t) => t.revealAt <= elapsedSeconds)
    .map((t) => t.segmentId);

  return transcript.filter((seg) => revealedIds.includes(seg.id));
}

/**
 * Get the next segment to be revealed (for partial display)
 */
export function getNextSegment(
  elapsedSeconds: number,
  timing: Array<{ segmentId: string; revealAt: number }> = COUGH_5_DAYS_TIMING
): { segmentId: string; revealAt: number } | null {
  return timing.find((t) => t.revealAt > elapsedSeconds) || null;
}

/**
 * Get partial text for the next segment (typing effect)
 */
export function getPartialSegmentText(
  elapsedSeconds: number,
  transcript: TranscriptSegment[] = COUGH_5_DAYS_TRANSCRIPT,
  timing: Array<{ segmentId: string; revealAt: number }> = COUGH_5_DAYS_TIMING
): Partial<TranscriptSegment> | null {
  const next = getNextSegment(elapsedSeconds, timing);
  if (!next) return null;

  const segment = transcript.find((s) => s.id === next.segmentId);
  if (!segment) return null;

  // Calculate how far into typing we are (0-1)
  const prevReveal = timing
    .filter((t) => t.revealAt < next.revealAt)
    .sort((a, b) => b.revealAt - a.revealAt)[0];

  const typingStart = prevReveal ? prevReveal.revealAt + 1 : 0;
  const typingDuration = next.revealAt - typingStart;
  const elapsed = Math.max(0, elapsedSeconds - typingStart);
  const progress = Math.min(1, elapsed / typingDuration);

  // Only show partial if we're at least 20% into typing
  if (progress < 0.2) return null;

  const charsToShow = Math.floor(segment.text.length * progress * 0.8); // 80% max before full reveal
  const partialText = segment.text.slice(0, charsToShow);

  return {
    id: `partial-${segment.id}`,
    text: partialText + '...',
    speaker: segment.speaker,
    confidence: 0.5, // Lower confidence for partial
  };
}

// ============================================================================
// Additional Scenarios (Stubs for Future)
// ============================================================================

export const DEMO_SCENARIOS = {
  'cough-5-days': {
    name: 'Cough × 5 days',
    description: 'Patient presenting with persistent cough, HPI conversation',
    transcript: COUGH_5_DAYS_TRANSCRIPT,
    timing: COUGH_5_DAYS_TIMING,
    totalDuration: 65,
  },
  // Future scenarios can be added here
} as const;

export type DemoScenarioKey = keyof typeof DEMO_SCENARIOS;
