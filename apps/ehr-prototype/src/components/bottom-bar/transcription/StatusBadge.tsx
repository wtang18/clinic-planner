/**
 * StatusBadge Component
 *
 * Small status indicator badge anchored to upper-right of avatar circle.
 * Displays different indicators based on recording status:
 * - idle: no badge (returns null)
 * - recording: pulsing red dot
 * - paused: pause icon (amber/gray)
 * - processing: animated spinner
 * - error: alert icon (red)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Pause, AlertCircle, Loader2 } from 'lucide-react';
import {
  colors,
  borderRadius,
  transitions,
} from '../../../styles/foundations';
import type { RecordingStatus } from '../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export type BadgeStatus = Extract<RecordingStatus, 'idle' | 'recording' | 'paused' | 'processing' | 'error'>;

export interface StatusBadgeProps {
  /** Current recording status */
  status: BadgeStatus;
  /** Badge size in pixels (default: 12) */
  size?: number;
  /** Whether the recording badge should animate (default: true) */
  animate?: boolean;
  /** Intensity of the recording pulse (default: 'normal') */
  intensity?: 'normal' | 'glow';
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_BADGE_SIZE = 12;

// Badge colors
const BADGE_COLORS = {
  recording: colors.fg.alert.secondary,       // Red for active recording
  recordingGlow: '#EF4444',                   // Brighter, more saturated red for glow
  paused: colors.fg.neutral.inversePrimary,   // White for contrast on dark bg
  processing: colors.fg.neutral.inversePrimary, // White for spinner
  error: colors.fg.alert.primary,             // Red for error
} as const;

// ============================================================================
// Pulsing Dot Component (for recording state)
// ============================================================================

interface PulsingDotProps {
  size: number;
  color: string;
  intensity?: 'normal' | 'glow';
}

const PulsingDot: React.FC<PulsingDotProps> = ({ size, color, intensity = 'normal' }) => {
  const isGlow = intensity === 'glow';
  const glowColor = BADGE_COLORS.recordingGlow;

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius.full,
        backgroundColor: isGlow ? glowColor : color,
      }}
      animate={isGlow ? {
        scale: [1, 1.25, 1],
        opacity: [1, 0.75, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0)',
          '0 0 6px 3px rgba(239, 68, 68, 0.4)',
          '0 0 0 0 rgba(239, 68, 68, 0)',
        ],
      } : {
        scale: [1, 1.3, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

const StaticDot: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: borderRadius.full,
      backgroundColor: color,
    }}
  />
);

// ============================================================================
// Spinning Loader Component (for processing state)
// ============================================================================

const SpinningLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <Loader2 size={size} color={color} strokeWidth={2.5} />
  </motion.div>
);

// ============================================================================
// Component
// ============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = DEFAULT_BADGE_SIZE,
  animate = true,
  intensity = 'normal',
  testID,
}) => {
  // No badge for idle state
  if (status === 'idle') {
    return null;
  }

  // Container styles - positions badge at upper-right
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: -2,
    right: -4,
    width: size + 4,
    height: size + 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: borderRadius.full,
    transition: `all ${transitions.fast}`,
  };

  // Render appropriate badge based on status
  const renderBadge = () => {
    const iconSize = size - 2;

    switch (status) {
      case 'recording':
        // Use static or pulsing dot based on animate prop
        return animate
          ? <PulsingDot size={size - 4} color={BADGE_COLORS.recording} intensity={intensity} />
          : <StaticDot size={size - 4} color={intensity === 'glow' ? BADGE_COLORS.recordingGlow : BADGE_COLORS.recording} />;

      case 'paused':
        return (
          <Pause
            size={iconSize}
            color={BADGE_COLORS.paused}
            strokeWidth={2.5}
            fill={BADGE_COLORS.paused}
          />
        );

      case 'processing':
        return <SpinningLoader size={iconSize} color={BADGE_COLORS.processing} />;

      case 'error':
        return (
          <AlertCircle
            size={iconSize}
            color={BADGE_COLORS.error}
            strokeWidth={2.5}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {renderBadge()}
    </div>
  );
};

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
