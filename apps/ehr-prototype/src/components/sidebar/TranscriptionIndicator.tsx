/**
 * TranscriptionIndicator Component
 *
 * Small status indicator (12-16px) for displaying transcription status
 * next to encounter labels in sidebar navigation.
 *
 * States:
 * - recording: Pulsing red dot
 * - paused: Amber dot
 * - processing: Spinner
 * - complete: Green checkmark (briefly shown)
 * - none: Hidden
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Pause } from 'lucide-react';
import { colors, borderRadius } from '../../styles/foundations';
import type { RecordingStatus } from '../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export type IndicatorStatus = 'recording' | 'paused' | 'processing' | 'complete' | 'none';

export interface TranscriptionIndicatorProps {
  /** Current status */
  status: IndicatorStatus;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SIZES = {
  sm: 10,
  md: 14,
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptionIndicator: React.FC<TranscriptionIndicatorProps> = ({
  status,
  size = 'sm',
  style,
  testID,
}) => {
  const pixelSize = SIZES[size];

  if (status === 'none') {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: pixelSize,
    height: pixelSize,
    flexShrink: 0,
    ...style,
  };

  // Recording: Pulsing red dot (10px dot in 14px container; 1.2× pulse peaks at 12px)
  if (status === 'recording') {
    const dotSize = SIZES.sm;
    return (
      <motion.span
        style={containerStyle}
        data-testid={testID}
        aria-label="Recording in progress"
      >
        <motion.span
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: colors.fg.alert.secondary,
            borderRadius: borderRadius.full,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.span>
    );
  }

  // Paused: Amber pause icon
  if (status === 'paused') {
    return (
      <span style={containerStyle} data-testid={testID} aria-label="Recording paused">
        <Pause
          size={pixelSize}
          color={colors.fg.attention.primary}
          fill={colors.fg.attention.primary}
        />
      </span>
    );
  }

  // Processing: Spinner
  if (status === 'processing') {
    return (
      <span style={containerStyle} data-testid={testID} aria-label="Processing recording">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ display: 'flex' }}
        >
          <Loader2 size={pixelSize} color={colors.fg.information.secondary} />
        </motion.span>
      </span>
    );
  }

  // Complete: Green checkmark
  if (status === 'complete') {
    return (
      <motion.span
        style={containerStyle}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        data-testid={testID}
        aria-label="Recording complete"
      >
        <Check size={pixelSize} color={colors.fg.positive.secondary} strokeWidth={3} />
      </motion.span>
    );
  }

  return null;
};

TranscriptionIndicator.displayName = 'TranscriptionIndicator';

// ============================================================================
// Helper to convert RecordingStatus to IndicatorStatus
// ============================================================================

export function recordingStatusToIndicator(status: RecordingStatus | undefined | null): IndicatorStatus {
  switch (status) {
    case 'recording':
      return 'recording';
    case 'paused':
      return 'paused';
    case 'processing':
      return 'processing';
    case 'complete':
      return 'complete';
    case 'idle':
    case 'error':
    default:
      return 'none';
  }
}

export default TranscriptionIndicator;
