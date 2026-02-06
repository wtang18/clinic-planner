/**
 * ContentContainer Component
 *
 * Display container for the Transcription Module.
 * Shows waveform, status text, transcript preview based on tier and status.
 *
 * Content by Tier:
 * - Micro: Hidden (0×0)
 * - Bar: Waveform (recording/paused) / Status text (processing/error) / Empty (idle)
 * - Palette: Waveform + Transcript preview / Consent text (idle) / Error message
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import {
  colors,
  typography,
  spaceBetween,
  spaceAround,
  borderRadius,
} from '../../../../styles/foundations';
import { WaveformIndicator } from '../WaveformIndicator';
import type { TierState, TranscriptionSession, RecordingStatus } from '../../../../state/bottomBar/types';
import type { TranscriptSegment } from '../../../../types/transcription';

// ============================================================================
// Types
// ============================================================================

export interface ContentContainerProps {
  /** Current display tier */
  tier: TierState;
  /** Session data (or null if no session) */
  session: TranscriptionSession | null;
  /** Animation phase from parent - used for crossfade timing during transitions */
  animationPhase?: string;
  /** Called when drawer expand button is clicked */
  onExpandToDrawer?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const BAR_HEIGHT = 48;

// ============================================================================
// Helpers
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Bar Content Components
// ============================================================================

interface BarWaveformProps {
  isAnimating: boolean;
}

const BarWaveform: React.FC<BarWaveformProps> = ({ isAnimating }) => (
  <motion.div
    key="waveform"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <WaveformIndicator
      isAnimating={isAnimating}
      size="sm"
      barCount={3}
    />
  </motion.div>
);

interface BarStatusTextProps {
  text: string;
  isError?: boolean;
}

const BarStatusText: React.FC<BarStatusTextProps> = ({ text, isError }) => (
  <motion.span
    key="status-text"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      fontSize: 13,
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.medium,
      color: isError ? colors.fg.alert.primary : colors.fg.neutral.inversePrimary,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </motion.span>
);

// ============================================================================
// Palette Content Components
// ============================================================================

interface PaletteConsentProps {
  text?: string;
}

const PaletteConsent: React.FC<PaletteConsentProps> = ({
  text = 'Confirm patient consent before recording.',
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: `${spaceAround.compact}px ${spaceAround.default}px`,  // Reduced vertical padding (12px top/bottom)
      textAlign: 'center',
      color: colors.fg.neutral.inversePrimary,
    }}
  >
    <p style={{
      fontSize: 14,
      fontFamily: typography.fontFamily.sans,
      opacity: 0.6,
      margin: 0,
    }}>
      {text}
    </p>
  </motion.div>
);

interface PaletteTranscriptProps {
  segments: TranscriptSegment[];
  currentSegment: Partial<TranscriptSegment> | null;
  isRecording: boolean;
}

const PaletteTranscript: React.FC<PaletteTranscriptProps> = ({
  segments,
  currentSegment,
  isRecording,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (scrollRef.current && isRecording) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments.length, isRecording]);

  const hasContent = segments.length > 0 || currentSegment?.text;

  if (!hasContent) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: spaceAround.default,
        color: colors.fg.neutral.inversePrimary,
        opacity: 0.4,
        fontSize: 13,
        fontFamily: typography.fontFamily.sans,
      }}>
        {isRecording ? 'Listening...' : 'No transcript yet'}
      </div>
    );
  }

  // Get last segment or partial for preview
  const lastSegment = segments[segments.length - 1];
  const previewText = currentSegment?.text || lastSegment?.text || '';

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        flex: 1,
        overflow: 'auto',
        padding: `${spaceAround.compact}px ${spaceAround.default}px`,
      }}
    >
      {/* Waveform indicator at top */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.related,
        marginBottom: spaceBetween.related,
      }}>
        <WaveformIndicator
          isAnimating={isRecording}
          size="sm"
          barCount={3}
        />
        <span style={{
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.inversePrimary,
          opacity: 0.6,
        }}>
          {isRecording ? 'Recording...' : 'Paused'}
        </span>
      </div>

      {/* Transcript preview - single line with ellipsis */}
      <p style={{
        fontSize: 14,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.regular,
        color: colors.fg.neutral.inversePrimary,
        opacity: currentSegment ? 0.7 : 1,
        fontStyle: currentSegment ? 'italic' : 'normal',
        margin: 0,
        lineHeight: 1.5,
      }}>
        "{previewText}"
      </p>
    </motion.div>
  );
};

interface PaletteErrorProps {
  message: string;
}

const PaletteError: React.FC<PaletteErrorProps> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: spaceAround.default,
      textAlign: 'center',
      color: colors.fg.alert.primary,
    }}
  >
    <AlertCircle size={32} style={{ marginBottom: 12 }} />
    <p style={{
      fontSize: 14,
      fontFamily: typography.fontFamily.sans,
      margin: 0,
    }}>
      {message}
    </p>
  </motion.div>
);

// ============================================================================
// Main Component
// ============================================================================

export const ContentContainer: React.FC<ContentContainerProps> = ({
  tier,
  session,
  animationPhase,
  onExpandToDrawer,
  style,
  testID,
}) => {
  const status = session?.status ?? 'idle';
  const isMicro = tier === 'mini';
  const isBar = tier === 'bar';
  const isPalette = tier === 'palette';

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isProcessing = status === 'processing';
  const isError = status === 'error';
  const isIdle = status === 'idle' || status === 'complete';

  // Waveform crossfade: hide during transitions to avoid visual collision
  // Waveform visible only in idle-bar state (bar mode, not transitioning)
  const isTransitioning = animationPhase && (
    animationPhase.includes('expanding') ||
    animationPhase.includes('collapsing')
  );
  const showWaveformWithCrossfade = (isRecording || isPaused) && !isTransitioning;

  // Don't render in micro tier
  if (isMicro) {
    return null;
  }

  // Container styles - flex: 1 to fill available space
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isBar ? 'center' : 'flex-start',
    flex: 1,
    minWidth: 0,
    height: isBar ? BAR_HEIGHT : 'auto',
    minHeight: isPalette ? 48 : undefined,  // Reduced from 80 for more compact palette
    overflow: 'hidden',
    // Add breathing room above controls bar in palette mode
    marginBottom: isPalette ? spaceBetween.repeating : undefined,  // 8px gap above controls
    ...style,
  };

  // Bar tier content - no layout animation to prevent position jumping
  if (isBar) {
    return (
      <div
        style={containerStyle}
        data-testid={testID}
      >
        <AnimatePresence mode="wait">
          {/* Waveform crossfades - only visible when not transitioning */}
          {showWaveformWithCrossfade && (
            <BarWaveform isAnimating={isRecording} />
          )}
          {isProcessing && (
            <BarStatusText text="Processing..." />
          )}
          {isError && (
            <BarStatusText text={session?.error || 'Mic error'} isError />
          )}
          {/* Idle: empty, container collapses */}
        </AnimatePresence>
      </div>
    );
  }

  // Palette tier content
  return (
    <motion.div
      layout
      style={{
        ...containerStyle,
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      data-testid={testID}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence mode="wait">
        {isIdle && <PaletteConsent key="consent" />}
        {(isRecording || isPaused) && session && (
          <PaletteTranscript
            key="transcript"
            segments={session.segments}
            currentSegment={session.currentSegment}
            isRecording={isRecording}
          />
        )}
        {isProcessing && (
          <div
            key="processing"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: spaceAround.default,
              color: colors.fg.neutral.inversePrimary,
              opacity: 0.6,
            }}
          >
            Processing transcript...
          </div>
        )}
        {isError && (
          <PaletteError
            key="error"
            message={session?.error || 'An error occurred'}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

ContentContainer.displayName = 'ContentContainer';

export default ContentContainer;
