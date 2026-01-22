/**
 * Minibar Component
 *
 * Persistent status indicator for AI and transcription status.
 */

import React from 'react';
import type { TranscriptionStatus } from '../../types/transcription';
import type { SyncStatus } from '../../types/common';
import { colors, spacing, typography, radii, shadows, transitions, zIndex } from '../../styles/tokens';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface MinibarProps {
  /** Current transcription status */
  transcriptionStatus: TranscriptionStatus;
  /** Number of items pending review */
  pendingReviewCount: number;
  /** Number of active alerts */
  alertCount: number;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Called when transcription toggle is clicked */
  onTranscriptionToggle: () => void;
  /** Called when palette should open */
  onOpenPalette: () => void;
  /** Called when task pane should open */
  onOpenTaskPane: () => void;
  /** Whether transcription is available */
  transcriptionEnabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const MicIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const AlertIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloudIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const CloudOffIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15" />
  </svg>
);

const ListIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const Minibar: React.FC<MinibarProps> = ({
  transcriptionStatus,
  pendingReviewCount,
  alertCount,
  syncStatus,
  onTranscriptionToggle,
  onOpenPalette,
  onOpenTaskPane,
  transcriptionEnabled = true,
  style,
}) => {
  const isRecording = transcriptionStatus === 'recording';
  const isProcessing = transcriptionStatus === 'processing';
  const hasError = transcriptionStatus === 'error';
  const isSyncing = syncStatus === 'syncing';
  const isSyncError = syncStatus === 'error';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.neutral[900],
    borderRadius: radii.lg,
    boxShadow: shadows.lg,
    ...style,
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const statusGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: colors.neutral[800],
    borderRadius: radii.md,
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '24px',
    backgroundColor: colors.neutral[700],
  };

  // Transcription button styles
  const micButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: radii.full,
    border: 'none',
    cursor: transcriptionEnabled ? 'pointer' : 'not-allowed',
    opacity: transcriptionEnabled ? 1 : 0.5,
    transition: `all ${transitions.fast}`,
    backgroundColor: isRecording
      ? colors.status.error
      : hasError
      ? colors.status.errorLight
      : colors.neutral[700],
    color: isRecording || hasError ? colors.neutral[0] : colors.neutral[300],
  };

  const pulseStyle: React.CSSProperties = isRecording
    ? {
        animation: 'pulse 1.5s ease-in-out infinite',
      }
    : {};

  // Sync status
  const getSyncIcon = () => {
    if (isSyncing) return <RefreshIcon />;
    if (isSyncError) return <CloudOffIcon />;
    return <CloudIcon />;
  };

  const getSyncColor = () => {
    if (isSyncing) return colors.status.info;
    if (isSyncError) return colors.status.error;
    return colors.status.success;
  };

  return (
    <div style={containerStyle}>
      {/* Left section: Transcription + Status */}
      <div style={leftSectionStyle}>
        {/* Transcription toggle */}
        <button
          type="button"
          style={{ ...micButtonStyle, ...pulseStyle }}
          onClick={onTranscriptionToggle}
          disabled={!transcriptionEnabled}
          title={
            !transcriptionEnabled
              ? 'Transcription not available'
              : isRecording
              ? 'Stop recording'
              : 'Start recording'
          }
        >
          <span style={{ width: '20px', height: '20px', display: 'flex' }}>
            {hasError ? <MicOffIcon /> : <MicIcon />}
          </span>
        </button>

        {/* Recording status */}
        {isRecording && (
          <span
            style={{
              fontSize: typography.fontSize.xs[0],
              color: colors.status.error,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Recording...
          </span>
        )}
        {isProcessing && (
          <span
            style={{
              fontSize: typography.fontSize.xs[0],
              color: colors.status.info,
            }}
          >
            Processing...
          </span>
        )}

        <div style={dividerStyle} />

        {/* Pending review */}
        <div
          style={{ ...statusGroupStyle, cursor: 'pointer' }}
          onClick={onOpenTaskPane}
          role="button"
          tabIndex={0}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              color: pendingReviewCount > 0 ? colors.status.warning : colors.neutral[500],
            }}
          >
            <ListIcon />
          </span>
          {pendingReviewCount > 0 && (
            <Badge variant="warning" size="sm" count={pendingReviewCount} />
          )}
          {pendingReviewCount === 0 && (
            <span
              style={{
                fontSize: typography.fontSize.xs[0],
                color: colors.neutral[500],
              }}
            >
              No tasks
            </span>
          )}
        </div>

        {/* Alerts */}
        {alertCount > 0 && (
          <div style={statusGroupStyle}>
            <span
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                color: colors.status.error,
              }}
            >
              <AlertIcon />
            </span>
            <Badge variant="error" size="sm" count={alertCount} />
          </div>
        )}
      </div>

      {/* Right section: Sync + Expand */}
      <div style={rightSectionStyle}>
        {/* Sync status */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: colors.neutral[800],
            borderRadius: radii.md,
          }}
          title={
            isSyncing
              ? 'Syncing...'
              : isSyncError
              ? 'Sync error'
              : 'Synced'
          }
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              display: 'flex',
              color: getSyncColor(),
              animation: isSyncing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            {getSyncIcon()}
          </span>
        </span>

        {/* Expand to palette */}
        <IconButton
          icon={<ChevronUpIcon />}
          label="Open AI palette"
          variant="ghost"
          size="md"
          onClick={onOpenPalette}
          style={{ color: colors.neutral[400] }}
        />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

Minibar.displayName = 'Minibar';
