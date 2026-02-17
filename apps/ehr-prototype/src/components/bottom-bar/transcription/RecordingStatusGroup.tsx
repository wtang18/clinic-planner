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
import {
  typography,
  spaceBetween,
} from '../../../styles/foundations';
import { WaveformIndicator } from './WaveformIndicator';

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

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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
      {/* Waveform indicator - shown in both bar and palette modes */}
      {showIndicator && (
        <WaveformIndicator
          isAnimating={isRecording}
          size="sm"
          barCount={3}
        />
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
