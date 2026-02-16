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
import { AlertCircle, Pause } from 'lucide-react';
import {
  colors,
  typography,
  spaceBetween,
  spaceAround,
  borderRadius,
} from '../../../../styles/foundations';
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

  // Get last segment or partial for preview
  const lastSegment = segments[segments.length - 1];
  const previewText = hasContent
    ? (currentSegment?.text || lastSegment?.text || '')
    : '';

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        flex: 1,
        overflow: 'hidden',
        padding: `${spaceAround.default}px ${spaceAround.default}px`,
      }}
    >
      {/* Single-row: waveform + inline transcript preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {isRecording ? (
          <motion.span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              flexShrink: 0,
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [1, 0.75, 1],
              boxShadow: [
                '0 0 0 0 rgba(239, 68, 68, 0)',
                '0 0 6px 3px rgba(239, 68, 68, 0.4)',
                '0 0 0 0 rgba(239, 68, 68, 0)',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <Pause size={14} fill="currentColor" style={{ color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
        )}
        <span style={{
          flex: 1,
          fontSize: 13,
          fontFamily: typography.fontFamily.sans,
          color: 'rgba(255, 255, 255, 0.6)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'rtl',
          textAlign: 'left',
        }}>
          {previewText || (isRecording ? 'Listening...' : 'Paused')}
        </span>
      </div>
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
  const isMicro = tier === 'anchor';
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

  // Bar tier content - waveform moved to ControlsContainer, only status text here
  if (isBar) {
    return (
      <div
        style={containerStyle}
        data-testid={testID}
      >
        <AnimatePresence mode="wait">
          {isProcessing && (
            <BarStatusText text="Processing..." />
          )}
          {isError && (
            <BarStatusText text={session?.error || 'Mic error'} isError />
          )}
          {/* Recording/Idle: empty spacer — waveform is in ControlsContainer */}
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
