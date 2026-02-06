/**
 * TranscriptionPill Component
 *
 * Compact transcription status and controls in a pill format.
 * Implements spatial consistency - elements stay fixed across states:
 * - Identity (initials): Fixed LEFT - always visible anchor
 * - Content: Middle - transforms based on state (name → waveform + time)
 * - Actions: Fixed RIGHT (record → pause/stop → resume/stop)
 *
 * Recording mechanics only. Post-recording intelligence delegated to AI minibar.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Check, Play, Trash2 } from 'lucide-react';
import type { TranscriptionStatus } from '../../types/transcription';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions, glass } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type TranscriptionPillState = 'idle' | 'recording' | 'paused' | 'complete';

export interface TranscriptionPillProps {
  /** Current transcription status */
  status: TranscriptionStatus;
  /** Patient name being recorded */
  patientName?: string;
  /** Patient initials */
  patientInitials?: string;
  /** Recording duration in seconds */
  duration?: number;
  /** Whether transcription is available */
  isEnabled?: boolean;
  /** Whether to show in minimized state (48px, when palette open) */
  isMinimized?: boolean;
  /** Whether to show in expanded state (~260px, user-controlled) */
  isExpanded?: boolean;
  /** Called when transcription toggle is clicked */
  onToggle: () => void;
  /** Called when stop button is clicked */
  onStop?: () => void;
  /** Called when pause button is clicked */
  onPause?: () => void;
  /** Called when resume button is clicked */
  onResume?: () => void;
  /** Called when pill is clicked (to expand from minimized) */
  onClick?: () => void;
  /** Called when user taps to expand/collapse */
  onExpandToggle?: () => void;
  /** Called when discard button is clicked (delete recording) */
  onDiscard?: () => void;
  /** Called when recording is complete (for AI minibar to pick up) */
  onRecordingComplete?: (duration: number) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Waveform Bars Component
// ============================================================================

interface WaveformBarsProps {
  isAnimating: boolean;
  /** Use compact variant for default recording state */
  variant?: 'default' | 'compact';
}

const WaveformBars: React.FC<WaveformBarsProps> = ({ isAnimating, variant = 'default' }) => {
  const barCount = 3;
  const isCompact = variant === 'compact';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isCompact ? 1.5 : 2,
    height: isCompact ? 16 : 20,
  };

  const barStyle = (index: number): React.CSSProperties => ({
    width: isCompact ? 2 : 3,
    height: isCompact ? 16 : 20,
    backgroundColor: colors.fg.neutral.inversePrimary,
    borderRadius: isCompact ? 1 : 1.5,
    transform: 'scaleY(0.3)',
    opacity: 0.8,
    animation: isAnimating
      ? `waveformBar 0.8s ease-in-out infinite`
      : 'none',
    animationDelay: `${getBarDelay(index)}ms`,
  });

  // Symmetric delay pattern for 3 bars: 0ms, 100ms, 0ms
  const getBarDelay = (index: number): number => {
    const delays = [0, 100, 0];
    return delays[index] || 0;
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div key={i} style={barStyle(i)} />
      ))}
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptionPill: React.FC<TranscriptionPillProps> = ({
  status,
  patientName,
  patientInitials,
  duration = 0,
  isEnabled = true,
  isMinimized = false,
  isExpanded = false,
  onToggle,
  onStop,
  onPause,
  onResume,
  onClick,
  onExpandToggle,
  onDiscard,
  onRecordingComplete,
  style,
  testID,
}) => {
  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';
  const hasError = status === 'error';
  const isIdle = status === 'idle';
  const isPaused = status === 'paused';

  // Internal state for complete animation
  const [showComplete, setShowComplete] = useState(false);
  const [completeDuration, setCompleteDuration] = useState(0);

  // Generate initials from patient name if not provided
  const displayInitials = patientInitials ||
    (patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PT');

  // Handle recording complete
  const handleStop = useCallback(() => {
    if (onStop) {
      setCompleteDuration(duration);
      setShowComplete(true);
      onStop();

      // After showing complete state, trigger AI minibar
      setTimeout(() => {
        setShowComplete(false);
        onRecordingComplete?.(duration);
      }, 2000);
    }
  }, [onStop, duration, onRecordingComplete]);

  // Handle pill click for expand/collapse toggle
  // IMPORTANT: Must be before any early returns to satisfy React hooks rules
  const handlePillClick = useCallback(() => {
    if (onExpandToggle) {
      onExpandToggle();
    }
  }, [onExpandToggle]);

  // Minimized state - just show initials circle with recording indicator
  if (isMinimized) {
    return (
      <motion.button
        type="button"
        initial={false}
        animate={{
          scale: 1,
          width: 48,
        }}
        whileHover={{ scale: 1.08 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          ...glass.glassDark,
          borderRadius: borderRadius.full,
          boxShadow: shadows.lg,
          cursor: 'pointer',
          border: 'none',
          position: 'relative',
          ...style,
        }}
        onClick={onClick || onToggle}
        title={isRecording ? `Recording: ${patientName}` : 'Expand transcription'}
        data-testid={testID}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: isRecording ? colors.fg.alert.secondary : colors.fg.accent.primary,
            borderRadius: borderRadius.full,
            color: colors.fg.neutral.inversePrimary,
            fontSize: 11,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {displayInitials}
        </span>

        {/* Recording pulse indicator */}
        {isRecording && (
          <motion.span
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              backgroundColor: colors.fg.alert.secondary,
              borderRadius: borderRadius.full,
              border: `2px solid ${colors.bg.neutral.base}`,
            }}
          />
        )}
      </motion.button>
    );
  }

  // Tri-state width: 160px (default) or 260px (expanded)
  const pillWidth = isExpanded ? 260 : 160;

  // Full pill state - dynamic width based on expanded state
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    paddingLeft: spaceAround.tight, // 8px left for concentric fit
    paddingRight: spaceAround.compact, // 12px right for button spacing
    ...glass.glassDark,
    borderRadius: borderRadius.full, // Pill shape
    boxShadow: shadows.lg,
    width: pillWidth,
    height: 48, // Explicit height to match minibar
    cursor: 'pointer', // Make entire pill clickable for expand/collapse
    ...style,
  };

  // Concentric: 32px circle inside 48px pill
  const initialsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: isRecording || isPaused ? colors.fg.alert.secondary : colors.fg.accent.primary,
    borderRadius: borderRadius.full, // Circular, concentric
    color: colors.fg.neutral.inversePrimary,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    flexShrink: 0,
    transition: `background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.coupled,
    minWidth: 60,
    overflow: 'hidden',
  };

  // Concentric action buttons (32px circles)
  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.full, // Circular, concentric
    border: 'none',
    cursor: isEnabled ? 'pointer' : 'not-allowed',
    opacity: isEnabled ? 1 : 0.5,
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // Render content based on state and expanded mode
  const renderContent = () => {
    // Complete state
    if (showComplete) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.coupled,
          }}
        >
          <Check size={14} style={{ color: colors.fg.positive.secondary }} />
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.medium,
              color: colors.fg.neutral.inversePrimary,
            }}
          >
            Complete
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.mono,
              color: colors.fg.neutral.inversePrimary,
              opacity: 0.7,
            }}
          >
            {formatDuration(completeDuration)}
          </span>
        </motion.div>
      );
    }

    // Recording or paused state - show waveform + time
    if (isRecording || isPaused) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.relatedCompact,
          }}
        >
          {/* Compact visualizer for default, full for expanded */}
          <WaveformBars isAnimating={isRecording} variant={isExpanded ? 'default' : 'compact'} />
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.mono,
              fontWeight: typography.fontWeight.medium,
              color: colors.fg.neutral.inversePrimary,
              minWidth: 42, // Fits longer times like "12:34"
            }}
          >
            {formatDuration(duration)}
          </span>
        </motion.div>
      );
    }

    // Idle state - show patient name (full if expanded, truncated if default)
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.medium,
          color: colors.fg.neutral.inversePrimary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: isExpanded ? 'clip' : 'ellipsis',
        }}
      >
        {patientName || 'Ready'}
      </motion.span>
    );
  };

  // Render action buttons based on state and expanded mode
  // Button positioning: Primary action (start/pause/resume) always rightmost for muscle memory
  // Discard button inboard (left of primary) to minimize accidental deletions
  const renderActions = () => {
    // Complete state - no actions
    if (showComplete) {
      return null;
    }

    // Recording state
    if (isRecording) {
      // Default recording: pause only (rightmost) - tap pause = pause AND expand
      if (!isExpanded) {
        return (
          <button
            type="button"
            style={actionButtonStyle}
            onClick={(e) => {
              e.stopPropagation(); // Don't trigger pill click
              onPause?.();
            }}
            title="Pause recording"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Pause size={16} />
          </button>
        );
      }

      // Expanded recording: [Discard] [Pause] - discard left, pause rightmost
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {/* Discard button (inboard/left) */}
          {onDiscard && (
            <button
              type="button"
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDiscard();
              }}
              title="Discard recording"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
          {/* Pause button (rightmost/primary) */}
          <button
            type="button"
            style={actionButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onPause?.();
            }}
            title="Pause recording"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Pause size={16} />
          </button>
        </motion.div>
      );
    }

    // Paused state: [Discard] [Resume] - discard left, resume rightmost
    if (isPaused) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {/* Discard button (inboard/left) */}
          {onDiscard && (
            <button
              type="button"
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDiscard();
              }}
              title="Discard recording"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
          {/* Resume button (rightmost/primary) */}
          <button
            type="button"
            style={actionButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onResume?.();
            }}
            title="Resume recording"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Play size={16} />
          </button>
        </motion.div>
      );
    }

    // Idle state - record button (rightmost)
    return (
      <button
        type="button"
        style={{
          ...actionButtonStyle,
          backgroundColor: isEnabled ? colors.fg.accent.primary : 'transparent',
          color: isEnabled ? colors.fg.neutral.inversePrimary : colors.fg.neutral.disabled,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        disabled={!isEnabled}
        title={isEnabled ? 'Start recording' : 'Transcription not available'}
        onMouseEnter={(e) => {
          if (isEnabled) {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
        }}
      >
        <Mic size={16} />
      </button>
    );
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        opacity: showComplete ? 0.8 : 1,
      }}
      transition={{ duration: 0.2 }}
      style={containerStyle}
      onClick={handlePillClick}
      data-testid={testID}
    >
      {/* Identity - Fixed LEFT */}
      <span style={initialsStyle}>
        {displayInitials}
      </span>

      {/* Content - Middle (transforms) */}
      <div style={contentStyle}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      {/* Actions - Fixed RIGHT */}
      <AnimatePresence mode="wait">
        {renderActions()}
      </AnimatePresence>

      {/* CSS for waveform animation */}
      <style>{`
        @keyframes waveformBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </motion.div>
  );
};

TranscriptionPill.displayName = 'TranscriptionPill';
