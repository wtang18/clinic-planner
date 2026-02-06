/**
 * TranscriptionPalette Component
 *
 * Palette-tier view for transcription (expanded overlay).
 * Shows live transcript with progressive reveal and recording controls.
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Play, Square, Trash2, Settings } from 'lucide-react';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  transitions,
  glass,
} from '../../../styles/foundations';
import { DragHandle } from '../DragHandle';
import { ControlsBar, ControlsBarButton, ControlsBarStatus } from '../ControlsBar';
import { WaveformIndicator } from './WaveformIndicator';
import type { TranscriptionSession } from '../../../state/bottomBar/types';
import type { TranscriptSegment } from '../../../types/transcription';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionPaletteProps {
  /** Session data */
  session: TranscriptionSession;
  /** Called to collapse to bar */
  onCollapse: () => void;
  /** Called to expand to drawer */
  onExpandToDrawer: () => void;
  /** Called to start recording */
  onStart: () => void;
  /** Called to pause recording */
  onPause: () => void;
  /** Called to resume recording */
  onResume: () => void;
  /** Called to stop recording (finalize) */
  onStop: () => void;
  /** Called to discard recording */
  onDiscard: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Segment Component
// ============================================================================

interface SegmentDisplayProps {
  segment: TranscriptSegment;
  isPartial?: boolean;
}

const SegmentDisplay: React.FC<SegmentDisplayProps> = ({ segment, isPartial = false }) => {
  const getSpeakerLabel = () => {
    switch (segment.speaker) {
      case 'provider':
        return 'Provider';
      case 'patient':
        return 'Patient';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const getSpeakerColor = () => {
    switch (segment.speaker) {
      case 'provider':
        return colors.fg.accent.primary;
      case 'patient':
        return colors.fg.positive.secondary;
      default:
        return colors.fg.neutral.secondary;
    }
  };

  // Confidence-based text styling
  const getTextStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontSize: 14,
      fontFamily: typography.fontFamily.sans,
      lineHeight: 1.5,
      color: colors.fg.neutral.inversePrimary,
    };

    if (isPartial) {
      return {
        ...base,
        opacity: 0.6,
        fontStyle: 'italic',
      };
    }

    if (segment.confidence < 0.6) {
      return {
        ...base,
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationColor: 'rgba(255, 255, 255, 0.3)',
      };
    }

    if (segment.confidence < 0.85) {
      return {
        ...base,
        opacity: 0.8,
      };
    }

    return base;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: `${spaceAround.tight}px 0`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceBetween.coupled,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.semibold,
            color: getSpeakerColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {getSpeakerLabel()}
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: typography.fontFamily.mono,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {formatTime(segment.startTime)}
        </span>
      </div>
      <p style={getTextStyle()}>{segment.text}</p>
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptionPalette: React.FC<TranscriptionPaletteProps> = ({
  session,
  onCollapse,
  onExpandToDrawer,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  style,
  testID,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isRecording = session.status === 'recording';
  const isPaused = session.status === 'paused';
  const hasSegments = session.segments.length > 0;

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (scrollRef.current && isRecording) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.segments.length, isRecording]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: 400,
    ...glass.glassDark,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const transcriptContainerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  };

  // Render primary action based on state
  const renderPrimaryAction = () => {
    if (isRecording) {
      return (
        <ControlsBarButton
          label="Pause"
          icon={<Pause size={16} />}
          variant="secondary"
          colorScheme="dark"
          onClick={onPause}
        />
      );
    }

    if (isPaused) {
      return (
        <ControlsBarButton
          label="Resume"
          icon={<Play size={16} />}
          variant="primary"
          onClick={onResume}
        />
      );
    }

    return (
      <ControlsBarButton
        label="Start"
        icon={<Mic size={16} />}
        variant="primary"
        onClick={onStart}
      />
    );
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header with drag handle */}
      <div style={headerStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.related,
          }}
        >
          {/* Patient identity */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              backgroundColor: isRecording || isPaused
                ? colors.fg.alert.secondary
                : colors.fg.accent.primary,
              borderRadius: borderRadius.full,
              color: colors.fg.neutral.inversePrimary,
              fontSize: 10,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {session.patient.initials}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: typography.fontWeight.semibold,
              color: colors.fg.neutral.inversePrimary,
            }}
          >
            {session.patient.name}
          </span>
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.related,
          }}
        >
          {(isRecording || isPaused) && (
            <>
              <WaveformIndicator
                isAnimating={isRecording}
                size="sm"
                barCount={3}
              />
              <span
                style={{
                  fontSize: 14,
                  fontFamily: typography.fontFamily.mono,
                  color: colors.fg.neutral.inversePrimary,
                }}
              >
                {formatDuration(session.duration)}
              </span>
            </>
          )}

          {/* Expand to drawer button */}
          <button
            type="button"
            onClick={onExpandToDrawer}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: borderRadius.sm,
              border: 'none',
              cursor: 'pointer',
              color: colors.fg.neutral.inversePrimary,
            }}
            title="Expand to full view"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Drag handle to collapse */}
      <DragHandle onCollapse={onCollapse} variant="dark" />

      {/* Transcript content */}
      <div ref={scrollRef} style={transcriptContainerStyle}>
        {hasSegments ? (
          <AnimatePresence>
            {session.segments.map((segment) => (
              <SegmentDisplay key={segment.id} segment={segment} />
            ))}
            {session.currentSegment && (
              <SegmentDisplay
                key="partial"
                segment={session.currentSegment as TranscriptSegment}
                isPartial
              />
            )}
          </AnimatePresence>
        ) : (
          <div style={emptyStateStyle}>
            <Mic size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              {isPaused ? 'Recording paused' : 'Ready to record'}
            </p>
            <p style={{ fontSize: 12, opacity: 0.6 }}>
              {isPaused
                ? 'Resume to continue transcription'
                : 'Start recording to see live transcription'}
            </p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <ControlsBar
        variant="dark"
        left={
          (isRecording || isPaused) && (
            <ControlsBarButton
              label="Discard"
              icon={<Trash2 size={14} />}
              variant="ghost"
              colorScheme="dark"
              onClick={onDiscard}
            />
          )
        }
        center={
          <ControlsBarStatus
            text={
              hasSegments
                ? `${session.segments.length} segment${session.segments.length === 1 ? '' : 's'}`
                : ''
            }
            colorScheme="dark"
          />
        }
        right={
          <div style={{ display: 'flex', gap: spaceBetween.coupled }}>
            {(isRecording || isPaused) && hasSegments && (
              <ControlsBarButton
                label="Done"
                icon={<Square size={14} />}
                variant="secondary"
                colorScheme="dark"
                onClick={onStop}
              />
            )}
            {renderPrimaryAction()}
          </div>
        }
      />
    </div>
  );
};

TranscriptionPalette.displayName = 'TranscriptionPalette';

export default TranscriptionPalette;
