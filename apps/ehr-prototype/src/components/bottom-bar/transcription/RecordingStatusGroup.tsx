/**
 * RecordingStatusGroup Component
 *
 * Unified timer + recording indicator that moves as one cohesive unit.
 * This component is used in both bar and palette modes with a shared layoutId
 * to ensure smooth horizontal-only transitions.
 *
 * Key principle: Timer Y position stays constant relative to controls bar bottom.
 * During transitions, only X position changes. The frame grows upward, but the
 * controls row (containing this component) maintains its screen Y position.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import {
  colors,
  borderRadius,
  typography,
  spaceBetween,
} from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface RecordingStatusGroupProps {
  /** Recording duration in seconds */
  duration: number;
  /** Whether actively recording */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Whether to show the timer display */
  showTimer: boolean;
  /** Visual variant affecting layout alignment */
  variant: 'bar' | 'palette';
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const INDICATOR_SIZE = 16;
const DOT_SIZE = 6;

// Brighter, more saturated red for visibility
const RECORDING_DOT_COLOR = '#EF4444';

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Recording Dot Component
// ============================================================================

/**
 * Pulsing recording dot for palette mode
 * Animation matches micro mode StatusBadge: scale, opacity, and glow
 * Note: Bar mode doesn't show indicator (waveform from ContentContainer handles it)
 */
const RecordingDot: React.FC = () => (
  <motion.span
    style={{
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: borderRadius.full,
      backgroundColor: RECORDING_DOT_COLOR,
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
    transition={{
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// ============================================================================
// Pause Indicator Component
// ============================================================================

const PauseIndicator: React.FC = () => (
  <Pause
    size={14}
    style={{
      color: colors.fg.neutral.inversePrimary,
      opacity: 0.5,
    }}
  />
);

// ============================================================================
// Timer Display Component
// ============================================================================

interface TimerDisplayProps {
  duration: number;
  variant: 'bar' | 'palette';
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ duration, variant }) => (
  <span
    style={{
      fontSize: 13,
      fontFamily: variant === 'bar' ? typography.fontFamily.mono : typography.fontFamily.sans,
      fontWeight: typography.fontWeight.medium,
      color: 'rgba(255, 255, 255, 0.6)',
    }}
  >
    {formatDuration(duration)}
  </span>
);

// ============================================================================
// Main Component
// ============================================================================

export const RecordingStatusGroup: React.FC<RecordingStatusGroupProps> = ({
  duration,
  isRecording,
  isPaused,
  showTimer,
  variant,
  testID,
}) => {
  const showIndicator = isRecording || isPaused;

  // Container uses shared layoutId for smooth bar ↔ palette transitions
  // Only X position changes during transitions; Y stays constant
  return (
    <motion.div
      layoutId="tm-status-group"
      layout="position"
      initial={false}
      transition={{
        layout: {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        height: INDICATOR_SIZE,
      }}
      data-testid={testID}
    >
      {/* Status indicator - ONLY in palette mode (bar mode uses waveform from ContentContainer) */}
      {showIndicator && variant === 'palette' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          style={{
            width: INDICATOR_SIZE,
            height: INDICATOR_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isRecording ? <RecordingDot /> : <PauseIndicator />}
        </motion.span>
      )}

      {/* Timer display */}
      {showTimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <TimerDisplay duration={duration} variant={variant} />
        </motion.div>
      )}
    </motion.div>
  );
};

RecordingStatusGroup.displayName = 'RecordingStatusGroup';

export default RecordingStatusGroup;
