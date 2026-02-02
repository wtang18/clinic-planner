/**
 * TranscriptionPill Component
 *
 * Compact transcription status and controls in a pill format.
 * Shows recording status, duration, and patient being recorded.
 * Supports minimized state when AI palette is open.
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, User } from 'lucide-react';
import type { TranscriptionStatus } from '../../types/transcription';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

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
  /** Whether to show in minimized state */
  isMinimized?: boolean;
  /** Called when transcription toggle is clicked */
  onToggle: () => void;
  /** Called when stop button is clicked */
  onStop?: () => void;
  /** Called when pill is clicked (to expand from minimized) */
  onClick?: () => void;
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
// Component
// ============================================================================

export const TranscriptionPill: React.FC<TranscriptionPillProps> = ({
  status,
  patientName,
  patientInitials,
  duration = 0,
  isEnabled = true,
  isMinimized = false,
  onToggle,
  onStop,
  onClick,
  style,
  testID,
}) => {
  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';
  const hasError = status === 'error';
  const isIdle = status === 'idle';

  // Internal state for hover
  const [isHovered, setIsHovered] = useState(false);

  // Generate initials from patient name if not provided
  const displayInitials = patientInitials ||
    (patientName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PT');

  // Minimized state - just show recording indicator
  if (isMinimized) {
    const minimizedStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      backgroundColor: isRecording ? colors.fg.alert.secondary : colors.fg.neutral.primary,
      borderRadius: borderRadius.full,
      boxShadow: shadows.lg,
      cursor: 'pointer',
      transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
      border: 'none',
      position: 'relative',
      ...style,
    };

    return (
      <button
        type="button"
        style={minimizedStyle}
        onClick={onClick || onToggle}
        title={isRecording ? `Recording: ${patientName}` : 'Expand transcription'}
        data-testid={testID}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLElement).style.boxShadow = shadows.xl;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = shadows.lg;
        }}
      >
        <span
          style={{
            display: 'flex',
            color: colors.fg.neutral.inversePrimary,
            animation: isRecording ? 'transcriptionPulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
        </span>

        {/* Recording dot indicator */}
        {isRecording && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 10,
              height: 10,
              backgroundColor: colors.bg.neutral.base,
              borderRadius: borderRadius.full,
              animation: 'transcriptionDot 1s ease-in-out infinite',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        )}

        <style>{`
          @keyframes transcriptionPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.95); }
          }
          @keyframes transcriptionDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }
        `}</style>
      </button>
    );
  }

  // Full pill state
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: colors.fg.neutral.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
    ...style,
  };

  const micButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: isEnabled ? 'pointer' : 'not-allowed',
    opacity: isEnabled ? 1 : 0.5,
    transition: `all ${transitions.fast}`,
    backgroundColor: isRecording
      ? colors.fg.alert.secondary
      : hasError
      ? colors.bg.alert.subtle
      : 'transparent',
    color: isRecording || hasError
      ? colors.bg.neutral.base
      : colors.fg.neutral.inversePrimary,
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    backgroundColor: colors.fg.neutral.secondary,
    opacity: 0.3,
  };

  const patientSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    cursor: onClick ? 'pointer' : 'default',
    borderRadius: borderRadius.sm,
    backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: `background-color ${transitions.fast}`,
  };

  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: colors.fg.accent.primary,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.inversePrimary,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    flexShrink: 0,
    position: 'relative',
  };

  const pulseRingStyle: React.CSSProperties = {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.full,
    border: `2px solid ${colors.fg.alert.secondary}`,
    animation: isRecording ? 'patientPulse 1.5s ease-in-out infinite' : 'none',
    opacity: isRecording ? 1 : 0,
  };

  const stopButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    opacity: 0.7,
    transition: `all ${transitions.fast}`,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Mic toggle button */}
      <button
        type="button"
        style={micButtonStyle}
        onClick={onToggle}
        disabled={!isEnabled}
        title={
          !isEnabled
            ? 'Transcription not available'
            : isRecording
            ? 'Pause recording'
            : 'Start recording'
        }
      >
        {hasError ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} style={{ animation: isRecording ? 'transcriptionPulse 1.5s ease-in-out infinite' : 'none' }} />
        )}
      </button>

      {/* Duration display when recording */}
      {isRecording && (
        <span
          style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.mono,
            fontWeight: typography.fontWeight.medium,
            color: colors.fg.neutral.inversePrimary,
            minWidth: 36,
          }}
        >
          {formatDuration(duration)}
        </span>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <span
          style={{
            fontSize: 12,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.information.secondary,
          }}
        >
          Processing...
        </span>
      )}

      {/* Divider */}
      {patientName && <div style={dividerStyle} />}

      {/* Patient indicator */}
      {patientName && (
        <div
          style={patientSectionStyle}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          title={patientName}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <span style={pulseRingStyle} />
            <span style={avatarStyle}>
              <User size={12} />
            </span>
          </div>
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.medium,
              color: colors.fg.neutral.inversePrimary,
              maxWidth: 80,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {patientName}
          </span>
        </div>
      )}

      {/* Stop button when recording */}
      {isRecording && onStop && (
        <>
          <div style={dividerStyle} />
          <button
            type="button"
            style={stopButtonStyle}
            onClick={onStop}
            title="Stop recording"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.7';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <Square size={14} fill="currentColor" />
          </button>
        </>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes transcriptionPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes patientPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

TranscriptionPill.displayName = 'TranscriptionPill';
