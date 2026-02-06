/**
 * ViewIndicatorPill Component
 *
 * Floating pill showing current transcript state (Live/Paused/Processing).
 * Includes waveform animation when recording and [↓ Latest] button when scrolled up.
 *
 * @see TRANSCRIPTION_DRAWER.md §4 for full specification
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Loader2, ArrowDown } from 'lucide-react';
import { WaveformIndicator } from '../../bottom-bar/transcription/WaveformIndicator';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';
import type { RecordingStatus } from '../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface ViewIndicatorPillProps {
  /** Current recording status */
  status: RecordingStatus;
  /** Whether the user has scrolled up from the bottom */
  isScrolledUp?: boolean;
  /** Called when [↓ Latest] is clicked */
  onScrollToLatest?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ViewIndicatorPill: React.FC<ViewIndicatorPillProps> = ({
  status,
  isScrolledUp = false,
  onScrollToLatest,
  style,
  testID,
}) => {
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isProcessing = status === 'processing';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px 0`,
    ...style,
  };

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isRecording
      ? colors.bg.alert.subtle
      : colors.bg.neutral.subtle,
    borderRadius: borderRadius.full,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: isRecording
      ? colors.fg.alert.secondary
      : colors.fg.neutral.secondary,
  };

  const latestButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.accent.subtle,
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  const renderPillContent = () => {
    if (isRecording) {
      return (
        <>
          <WaveformIndicator
            isAnimating={true}
            barCount={3}
            size="sm"
            color={colors.fg.alert.secondary}
          />
          <span>Live</span>
        </>
      );
    }

    if (isPaused) {
      return (
        <>
          <Pause size={12} />
          <span>Paused</span>
        </>
      );
    }

    if (isProcessing) {
      return (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex' }}
          >
            <Loader2 size={12} />
          </motion.span>
          <span>Processing</span>
        </>
      );
    }

    return null;
  };

  const pillContent = renderPillContent();

  // Don't render if idle/complete
  if (!pillContent) {
    return null;
  }

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Status pill */}
      <div style={pillStyle}>{pillContent}</div>

      {/* [↓ Latest] button - appears when scrolled up during recording */}
      <AnimatePresence>
        {isRecording && isScrolledUp && onScrollToLatest && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            style={latestButtonStyle}
            onClick={onScrollToLatest}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.fg.accent.primary;
              (e.currentTarget as HTMLElement).style.color = colors.fg.neutral.inversePrimary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.accent.subtle;
              (e.currentTarget as HTMLElement).style.color = colors.fg.accent.primary;
            }}
          >
            <ArrowDown size={12} />
            <span>Latest</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

ViewIndicatorPill.displayName = 'ViewIndicatorPill';
