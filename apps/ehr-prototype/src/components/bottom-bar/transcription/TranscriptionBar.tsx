/**
 * TranscriptionBar Component
 *
 * Bar-tier view for transcription (default collapsed state).
 * Shows patient identity, recording status, and primary actions.
 *
 * 3-Zone Layout:
 * ┌────────────────────────────────────────────────────────┐
 * │  [Avatar]  │  Center Content  │  [Action Button(s)]  │
 * │   32px     │      flex        │       32px+          │
 * └────────────────────────────────────────────────────────┘
 *
 * State-Based Content:
 * - idle: Avatar (no badge), Patient name, Mic button
 * - recording: Avatar + pulsing badge, Waveform + Timer, Pause button
 * - paused: Avatar + pause badge, Waveform + Timer, Resume button
 * - processing: Avatar + spinner badge, "Processing...", (empty)
 * - error: Avatar + alert badge, Error text, Retry button
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Play, RotateCcw } from 'lucide-react';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  shadows,
  transitions,
  glass,
} from '../../../styles/foundations';
import { WaveformIndicator } from './WaveformIndicator';
import { AvatarWithBadge, PATIENT_COLORS } from './AvatarWithBadge';
import type { BadgeStatus } from './StatusBadge';
import type { RecordingStatus, TranscriptionSession } from '../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionBarProps {
  /** Session data (or null if no session) */
  session: TranscriptionSession | null;
  /** Patient's assigned color (constant across states) */
  patientColor?: string;
  /** Called when bar is clicked to expand to palette */
  onExpand: () => void;
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
  /** Called to retry after error */
  onRetry?: () => void;
  /** Whether transcription is available */
  isEnabled?: boolean;
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

/** Map RecordingStatus to BadgeStatus */
function toBadgeStatus(status: RecordingStatus): BadgeStatus {
  // 'complete' maps to 'idle' for badge purposes (no badge)
  if (status === 'complete') return 'idle';
  return status as BadgeStatus;
}

// ============================================================================
// Constants
// ============================================================================

const BAR_HEIGHT = 48;
const BAR_WIDTH = 160;
const ICON_CIRCLE_SIZE = 32;

// Animation variants
const contentVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// ============================================================================
// Zone Components
// ============================================================================

/** LEFT ZONE: Avatar with status badge */
interface LeftZoneProps {
  initials: string;
  color: string;
  status: BadgeStatus;
}

const LeftZone: React.FC<LeftZoneProps> = ({ initials, color, status }) => (
  <AvatarWithBadge
    initials={initials}
    color={color}
    status={status}
    size={ICON_CIRCLE_SIZE}
  />
);

/** CENTER ZONE: Dynamic content based on status */
interface CenterZoneProps {
  status: RecordingStatus;
  patientName: string;
  duration: number;
  errorMessage?: string | null;
}

const CenterZone: React.FC<CenterZoneProps> = ({
  status,
  patientName,
  duration,
  errorMessage,
}) => {
  const containerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',  // Left-align content
    gap: spaceBetween.repeatingSm, // 6px internal gap
    marginLeft: spaceBetween.repeatingSm,  // 6px
    marginRight: spaceBetween.repeatingSm, // 6px
    minWidth: 0,
    overflow: 'hidden',
  };

  const textStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const timerStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    minWidth: 36,
  };

  const renderContent = () => {
    switch (status) {
      case 'recording':
      case 'paused':
        return (
          <motion.div
            key="waveform-timer"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spaceBetween.repeatingSm, // 6px gap between waveform and timer
            }}
          >
            <WaveformIndicator
              isAnimating={status === 'recording'}
              size="sm"
              barCount={3}
            />
            <span style={timerStyle}>{formatDuration(duration)}</span>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.span
            key="processing"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={textStyle}
          >
            Processing...
          </motion.span>
        );

      case 'error':
        return (
          <motion.span
            key="error"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              ...textStyle,
              color: colors.fg.alert.primary,
            }}
          >
            {errorMessage || 'Mic error'}
          </motion.span>
        );

      case 'idle':
      case 'complete':
      default:
        return (
          <motion.span
            key="patient-name"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={textStyle}
          >
            {patientName}
          </motion.span>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
};

/** RIGHT ZONE: Action buttons based on status */
interface RightZoneProps {
  status: RecordingStatus;
  isEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRetry?: () => void;
}

const RightZone: React.FC<RightZoneProps> = ({
  status,
  isEnabled,
  onStart,
  onPause,
  onResume,
  onRetry,
}) => {
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: isEnabled ? 'pointer' : 'not-allowed',
    opacity: isEnabled ? 1 : 0.5,
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    transition: `all ${transitions.fast}`,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEnabled) {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleClick = (
    e: React.MouseEvent,
    action: () => void
  ) => {
    e.stopPropagation();
    if (isEnabled) {
      action();
    }
  };

  const renderButton = () => {
    switch (status) {
      case 'recording':
        return (
          <motion.button
            key="pause"
            type="button"
            style={buttonStyle}
            onClick={(e) => handleClick(e, onPause)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Pause recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Pause size={16} />
          </motion.button>
        );

      case 'paused':
        // Only Resume button - Discard is palette-only per spec
        return (
          <motion.button
            key="resume"
            type="button"
            style={buttonStyle}
            onClick={(e) => handleClick(e, onResume)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Resume recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Play size={16} />
          </motion.button>
        );

      case 'processing':
        // Empty - no action available during processing
        return null;

      case 'error':
        return (
          <motion.button
            key="retry"
            type="button"
            style={buttonStyle}
            onClick={(e) => handleClick(e, onRetry ?? onStart)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title="Retry"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <RotateCcw size={16} />
          </motion.button>
        );

      case 'idle':
      case 'complete':
      default:
        // Mic button to start recording
        return (
          <motion.button
            key="start"
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: isEnabled ? colors.fg.accent.primary : 'transparent',
            }}
            onClick={(e) => handleClick(e, onStart)}
            disabled={!isEnabled}
            title={isEnabled ? 'Start recording' : 'Transcription not available'}
            onMouseEnter={(e) => {
              if (isEnabled) {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Mic size={16} />
          </motion.button>
        );
    }
  };

  return <AnimatePresence mode="wait">{renderButton()}</AnimatePresence>;
};

// ============================================================================
// Main Component
// ============================================================================

export const TranscriptionBar: React.FC<TranscriptionBarProps> = ({
  session,
  patientColor = PATIENT_COLORS.blue,
  onExpand,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  onRetry,
  isEnabled = true,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const status = session?.status ?? 'idle';
  const isIdle = status === 'idle' || status === 'complete' || !session;

  // Get display values
  const patientInitials = session?.patient.initials ?? 'PT';
  const patientName = session?.patient.name ?? 'Ready';
  const duration = session?.duration ?? 0;
  const errorMessage = session?.error ?? null;

  // Handle bar click - expand to palette (unless idle)
  const handleBarClick = useCallback(() => {
    if (!isIdle) {
      onExpand();
    }
  }, [isIdle, onExpand]);

  // Container styles - no flex gap, use explicit margins on children
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    // No gap - using explicit margins for precise control
    height: BAR_HEIGHT,
    width: BAR_WIDTH,
    paddingLeft: spaceAround.tight,   // 8px - avatar concentricity
    paddingRight: spaceAround.tight,  // 8px - button concentricity
    ...glass.glassDark,
    borderRadius: borderRadius.full,
    boxShadow: shadows.lg,
    cursor: isIdle ? 'default' : 'pointer',
    transition: `all ${transitions.fast}`,
    ...style,
  };

  return (
    <motion.div
      layout
      initial={false}
      style={containerStyle}
      onClick={handleBarClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testID}
    >
      {/* LEFT ZONE: Avatar with status badge */}
      <LeftZone
        initials={patientInitials}
        color={patientColor}
        status={toBadgeStatus(status)}
      />

      {/* CENTER ZONE: Dynamic content */}
      <CenterZone
        status={status}
        patientName={patientName}
        duration={duration}
        errorMessage={errorMessage}
      />

      {/* RIGHT ZONE: Action buttons */}
      <RightZone
        status={status}
        isEnabled={isEnabled}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onRetry={onRetry}
      />
    </motion.div>
  );
};

TranscriptionBar.displayName = 'TranscriptionBar';

export default TranscriptionBar;
