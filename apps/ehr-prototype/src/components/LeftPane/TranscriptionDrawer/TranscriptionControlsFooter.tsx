/**
 * TranscriptionControlsFooter Component
 *
 * Light-themed controls footer for the transcription drawer.
 * Same layout as palette controls but with light theme styling.
 *
 * @see TRANSCRIPTION_DRAWER.md §6 for full specification
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Play, Trash2, Square, Settings, RotateCcw, Loader2 } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';
import type { RecordingStatus } from '../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionControlsFooterProps {
  /** Current recording status */
  status: RecordingStatus;
  /** Recording duration in seconds */
  duration?: number;
  /** Whether there are segments (for Done button) */
  hasSegments?: boolean;
  /** Called to start recording */
  onStart?: () => void;
  /** Called to pause recording */
  onPause?: () => void;
  /** Called to resume recording */
  onResume?: () => void;
  /** Called to stop/finalize recording */
  onStop?: () => void;
  /** Called to discard recording */
  onDiscard?: () => void;
  /** Called to retry after error */
  onRetry?: () => void;
  /** Called to open settings */
  onSettings?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// Button Components
// ============================================================================

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  showLabel?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  showLabel = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundColor = () => {
    if (disabled) return colors.bg.neutral.subtle;
    if (variant === 'primary') {
      return isHovered ? colors.fg.accent.secondary : colors.fg.accent.primary;
    }
    if (variant === 'danger') {
      return isHovered ? colors.bg.alert.subtle : 'transparent';
    }
    if (variant === 'ghost') {
      return isHovered ? colors.bg.neutral.subtle : 'transparent';
    }
    // secondary
    return isHovered ? colors.bg.neutral.elevated : colors.bg.neutral.subtle;
  };

  const getTextColor = () => {
    if (disabled) return colors.fg.neutral.disabled;
    if (variant === 'primary') return colors.fg.neutral.inversePrimary;
    if (variant === 'danger') return colors.fg.alert.secondary;
    return colors.fg.neutral.primary;
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: showLabel ? spaceBetween.coupled : 0,
    height: 32,
    padding: showLabel ? `0 ${spaceAround.compact}px` : '0',
    width: showLabel ? 'auto' : 32,
    minWidth: 32,
    borderRadius: showLabel ? borderRadius.md : borderRadius.full,
    border: variant === 'secondary' ? `1px solid ${colors.border.neutral.default}` : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 150ms ease',
  };

  return (
    <motion.button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      title={!showLabel ? label : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <span style={{ display: 'flex' }}>{icon}</span>
      {showLabel && <span>{label}</span>}
    </motion.button>
  );
};

// ============================================================================
// Timer Component
// ============================================================================

interface TimerDisplayProps {
  duration: number;
  isRecording: boolean;
  isPaused: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ duration, isRecording, isPaused }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: isRecording ? colors.fg.alert.secondary : colors.fg.neutral.spotReadable,
    animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
  };

  const timeStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  };

  return (
    <div style={containerStyle}>
      <span style={dotStyle} />
      <span style={timeStyle}>{formatDuration(duration)}</span>
      {isRecording && (
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      )}
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptionControlsFooter: React.FC<TranscriptionControlsFooterProps> = ({
  status,
  duration = 0,
  hasSegments = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  onRetry,
  onSettings,
  style,
  testID,
}) => {
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isProcessing = status === 'processing';
  const isError = status === 'error';
  const isIdle = status === 'idle' || status === 'complete';

  const showTimer = isRecording || isPaused;

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: 48,
    padding: `0 ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.base,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  // Processing state - centered spinner
  if (isProcessing) {
    return (
      <footer style={{ ...containerStyle, display: 'flex', justifyContent: 'center' }} data-testid={testID}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', color: colors.fg.neutral.secondary }}
          >
            <Loader2 size={16} />
          </motion.span>
          <span style={{
            fontSize: 14,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.secondary,
          }}>
            Processing...
          </span>
        </div>
      </footer>
    );
  }

  // Error state
  if (isError) {
    return (
      <footer style={containerStyle} data-testid={testID}>
        <div />
        <span style={{
          fontSize: 14,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.alert.secondary,
        }}>
          Error occurred
        </span>
        <div style={{ justifySelf: 'end', display: 'flex', gap: spaceBetween.relatedCompact }}>
          <ControlButton
            icon={<RotateCcw size={14} />}
            label="Retry"
            onClick={onRetry}
            variant="primary"
          />
          {onSettings && (
            <ControlButton
              icon={<Settings size={14} />}
              label="Settings"
              onClick={onSettings}
              showLabel={false}
              variant="ghost"
            />
          )}
        </div>
      </footer>
    );
  }

  // Idle state
  if (isIdle) {
    return (
      <footer style={containerStyle} data-testid={testID}>
        <div />
        <div />
        <div style={{ justifySelf: 'end', display: 'flex', gap: spaceBetween.relatedCompact }}>
          <ControlButton
            icon={<Mic size={14} />}
            label="Start"
            onClick={onStart}
            variant="primary"
          />
          {onSettings && (
            <ControlButton
              icon={<Settings size={14} />}
              label="Settings"
              onClick={onSettings}
              showLabel={false}
              variant="ghost"
            />
          )}
        </div>
      </footer>
    );
  }

  // Recording/Paused state
  return (
    <footer style={containerStyle} data-testid={testID}>
      {/* Left: Discard button (when paused) */}
      <div style={{ justifySelf: 'start' }}>
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <ControlButton
                icon={<Trash2 size={14} />}
                label="Discard"
                onClick={onDiscard}
                variant="danger"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center: Timer */}
      {showTimer && (
        <TimerDisplay
          duration={duration}
          isRecording={isRecording}
          isPaused={isPaused}
        />
      )}

      {/* Right: Action buttons */}
      <div style={{ justifySelf: 'end', display: 'flex', gap: spaceBetween.relatedCompact }}>
        {/* Done button (when paused with segments) */}
        <AnimatePresence>
          {isPaused && hasSegments && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <ControlButton
                icon={<Square size={14} />}
                label="Done"
                onClick={onStop}
                variant="secondary"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary action */}
        {isRecording && (
          <ControlButton
            icon={<Pause size={14} />}
            label="Pause"
            onClick={onPause}
            variant="secondary"
          />
        )}
        {isPaused && (
          <ControlButton
            icon={<Play size={14} />}
            label="Resume"
            onClick={onResume}
            variant="primary"
          />
        )}

        {/* Settings */}
        {onSettings && (
          <ControlButton
            icon={<Settings size={14} />}
            label="Settings"
            onClick={onSettings}
            showLabel={false}
            variant="ghost"
          />
        )}
      </div>
    </footer>
  );
};

TranscriptionControlsFooter.displayName = 'TranscriptionControlsFooter';
