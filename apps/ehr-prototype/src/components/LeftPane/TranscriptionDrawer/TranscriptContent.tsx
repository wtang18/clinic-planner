/**
 * TranscriptContent Component
 *
 * Scrollable transcript with speaker diarization.
 * Supports auto-scroll to latest segment and scroll position detection.
 *
 * @see TRANSCRIPTION_DRAWER.md §5 for full specification
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type SpeakerRole = 'provider' | 'patient' | 'unknown';

export interface TranscriptSegment {
  /** Unique segment ID */
  id: string;
  /** Speaker role */
  speaker: SpeakerRole;
  /** Speaker display name */
  speakerName: string;
  /** Timestamp in seconds from start */
  timestamp: number;
  /** Segment text */
  text: string;
  /** Whether this is the active (currently being transcribed) segment */
  isActive?: boolean;
  /** Confidence level (0-1), for low-confidence flagging */
  confidence?: number;
}

export interface TranscriptContentProps {
  /** Transcript segments to display */
  segments: TranscriptSegment[];
  /** Whether recording is active (for auto-scroll) */
  isRecording?: boolean;
  /** Called when scroll position changes */
  onScrollChange?: (isAtBottom: boolean) => void;
  /** Whether to show low-confidence indicators */
  showLowConfidence?: boolean;
  /** Top padding to account for floating elements */
  topPadding?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getSpeakerColor = (role: SpeakerRole): string => {
  switch (role) {
    case 'provider':
      return colors.fg.accent.primary; // Blue
    case 'patient':
      return colors.fg.positive.secondary; // Green
    default:
      return colors.fg.neutral.secondary; // Gray
  }
};

// ============================================================================
// Segment Component
// ============================================================================

interface SegmentRowProps {
  segment: TranscriptSegment;
  showLowConfidence?: boolean;
}

const SegmentRow: React.FC<SegmentRowProps> = ({ segment, showLowConfidence }) => {
  const speakerColor = getSpeakerColor(segment.speaker);
  const isLowConfidence = showLowConfidence && segment.confidence !== undefined && segment.confidence < 0.7;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceAround.nudge4,
    paddingBottom: spaceAround.default,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.relatedCompact,
  };

  const speakerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: speakerColor,
  };

  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: speakerColor,
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    color: colors.fg.neutral.spotReadable,
  };

  const textStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 1.6,
    color: colors.fg.neutral.primary,
    opacity: isLowConfidence ? 0.6 : 1,
    fontStyle: isLowConfidence ? 'italic' : 'normal',
  };

  const cursorStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 2,
    height: '1em',
    backgroundColor: colors.fg.neutral.primary,
    marginLeft: 2,
    animation: 'blink 1s step-end infinite',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={containerStyle}
    >
      {/* Header: Speaker + Timestamp */}
      <div style={headerStyle}>
        <span style={speakerStyle}>
          <span style={dotStyle} />
          {segment.speakerName}
        </span>
        <span style={timestampStyle}>{formatTimestamp(segment.timestamp)}</span>
      </div>

      {/* Text content */}
      <div style={textStyle}>
        {segment.text}
        {segment.isActive && <span style={cursorStyle} />}
      </div>

      {/* Blink animation for cursor */}
      {segment.isActive && (
        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      )}
    </motion.div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: spaceAround.spacious,
    textAlign: 'center',
  };

  const textStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      <p style={textStyle}>
        Transcript will appear here as the conversation is recorded.
      </p>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptContent: React.FC<TranscriptContentProps> = ({
  segments,
  isRecording = false,
  onScrollChange,
  showLowConfidence = false,
  topPadding = 0,
  style,
  testID,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current && isRecording) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments, shouldAutoScroll, isRecording]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShouldAutoScroll(isAtBottom);
    onScrollChange?.(isAtBottom);
  }, [onScrollChange]);

  // Method to scroll to bottom (exposed via ref or callback)
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setShouldAutoScroll(true);
      onScrollChange?.(true);
    }
  }, [onScrollChange]);

  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: `${topPadding + spaceAround.default}px ${spaceAround.default}px ${spaceAround.default}px`,
    ...style,
  };

  if (segments.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onScroll={handleScroll}
      data-testid={testID}
    >
      <AnimatePresence mode="popLayout">
        {segments.map((segment) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            showLowConfidence={showLowConfidence}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

TranscriptContent.displayName = 'TranscriptContent';
