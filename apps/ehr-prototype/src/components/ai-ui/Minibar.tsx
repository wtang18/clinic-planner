/**
 * Minibar Component
 *
 * Persistent status indicator for AI and transcription status.
 */

import React from 'react';
import { Mic, MicOff, AlertTriangle, Cloud, CloudOff, RefreshCw, ChevronUp, List, Sparkles } from 'lucide-react';
import type { TranscriptionStatus } from '../../types/transcription';
import type { SyncStatus } from '../../types/common';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions, zIndex } from '../../styles/foundations';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';
import { PatientIndicator } from './PatientIndicator';

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
  /** Called when AI drawer should toggle */
  onOpenAIDrawer?: () => void;
  /** Whether transcription is available */
  transcriptionEnabled?: boolean;
  /** Patient name for the indicator */
  patientName?: string;
  /** Patient initials for the indicator */
  patientInitials?: string;
  /** Called when patient indicator is clicked */
  onPatientClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

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
  onOpenAIDrawer,
  transcriptionEnabled = true,
  patientName,
  patientInitials,
  onPatientClick,
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
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    backgroundColor: colors.fg.neutral.primary,
    borderRadius: borderRadius.sm,
    boxShadow: shadows.lg,
    ...style,
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const statusGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    backgroundColor: colors.fg.neutral.primary,
    borderRadius: borderRadius.sm,
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '24px',
    backgroundColor: colors.fg.neutral.secondary,
  };

  // Transcription button styles
  const micButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: transcriptionEnabled ? 'pointer' : 'not-allowed',
    opacity: transcriptionEnabled ? 1 : 0.5,
    transition: `all ${transitions.fast}`,
    backgroundColor: isRecording
      ? colors.fg.alert.secondary
      : hasError
      ? colors.bg.alert.subtle
      : colors.fg.neutral.secondary,
    color: isRecording || hasError ? colors.bg.neutral.base : colors.border.neutral.medium,
  };

  const pulseStyle: React.CSSProperties = isRecording
    ? {
        animation: 'pulse 1.5s ease-in-out infinite',
      }
    : {};

  // Sync status
  const getSyncIcon = () => {
    if (isSyncing) return <RefreshCw size={14} />;
    if (isSyncError) return <CloudOff size={14} />;
    return <Cloud size={14} />;
  };

  const getSyncColor = () => {
    if (isSyncing) return colors.fg.information.secondary;
    if (isSyncError) return colors.fg.alert.secondary;
    return colors.fg.positive.secondary;
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
          {hasError ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Recording status */}
        {isRecording && (
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.alert.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Recording...
          </span>
        )}
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
              display: 'flex',
              color: pendingReviewCount > 0 ? colors.fg.attention.secondary : colors.fg.neutral.spotReadable,
            }}
          >
            <List size={16} />
          </span>
          {pendingReviewCount > 0 && (
            <Badge variant="warning" size="sm" count={pendingReviewCount} />
          )}
          {pendingReviewCount === 0 && (
            <span
              style={{
                fontSize: 12,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.neutral.spotReadable,
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
                display: 'flex',
                color: colors.fg.alert.secondary,
              }}
            >
              <AlertTriangle size={16} />
            </span>
            <Badge variant="error" size="sm" count={alertCount} />
          </div>
        )}
      </div>

      {/* Center section: Patient indicator */}
      {patientName && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={dividerStyle} />
          <PatientIndicator
            name={patientName}
            initials={patientInitials}
            isRecording={isRecording}
            onClick={onPatientClick}
          />
        </div>
      )}

      {/* Right section: Sync + AI + Expand */}
      <div style={rightSectionStyle}>
        {/* Sync status */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.coupled,
            padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
            backgroundColor: colors.fg.neutral.primary,
            borderRadius: borderRadius.sm,
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
              display: 'flex',
              color: getSyncColor(),
              animation: isSyncing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            {getSyncIcon()}
          </span>
        </span>

        {/* AI drawer toggle */}
        {onOpenAIDrawer && (
          <IconButton
            icon={<Sparkles size={18} />}
            label="Open AI assistant"
            variant="ghost"
            size="md"
            onClick={onOpenAIDrawer}
            style={{ color: colors.fg.neutral.disabled }}
          />
        )}

        {/* Expand to palette */}
        <IconButton
          icon={<ChevronUp size={18} />}
          label="Open AI palette"
          variant="ghost"
          size="md"
          onClick={onOpenPalette}
          style={{ color: colors.fg.neutral.disabled }}
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
