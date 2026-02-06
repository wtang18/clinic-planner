/**
 * TranscriptionDrawer Component
 *
 * Drawer-tier view for transcription (full-height side panel).
 * Two tabs: Live Transcript and Settings.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Play, Square, Trash2, X, FileText, Settings as SettingsIcon, ChevronDown, Check } from 'lucide-react';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  transitions,
  glass,
} from '../../../styles/foundations';
import { DragHandle } from '../DragHandle';
import { ControlsBar, ControlsBarButton, ControlsBarStatus } from '../ControlsBar';
import { WaveformIndicator } from './WaveformIndicator';
import type { TranscriptionSession } from '../../../state/bottomBar/types';
import type { TranscriptSegment } from '../../../types/transcription';

// ============================================================================
// Types
// ============================================================================

type DrawerTab = 'transcript' | 'settings';

export interface TranscriptionDrawerProps {
  /** Session data */
  session: TranscriptionSession;
  /** Called to collapse to bar */
  onCollapse: () => void;
  /** Called to collapse to palette */
  onCollapseToPalette: () => void;
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Segment Component (Full Version)
// ============================================================================

interface SegmentDisplayFullProps {
  segment: TranscriptSegment;
  isPartial?: boolean;
}

const SegmentDisplayFull: React.FC<SegmentDisplayFullProps> = ({ segment, isPartial = false }) => {
  const getSpeakerLabel = () => {
    switch (segment.speaker) {
      case 'provider':
        return 'Provider';
      case 'patient':
        return 'Patient';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const getSpeakerColor = () => {
    switch (segment.speaker) {
      case 'provider':
        return colors.fg.accent.primary;
      case 'patient':
        return colors.fg.positive.secondary;
      default:
        return colors.fg.neutral.secondary;
    }
  };

  const getConfidenceLabel = () => {
    if (isPartial) return 'Processing...';
    if (segment.confidence >= 0.85) return 'High';
    if (segment.confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getTextStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontSize: 15,
      fontFamily: typography.fontFamily.sans,
      lineHeight: 1.6,
      color: colors.fg.neutral.inversePrimary,
    };

    if (isPartial) {
      return { ...base, opacity: 0.6, fontStyle: 'italic' };
    }

    if (segment.confidence < 0.6) {
      return {
        ...base,
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationColor: 'rgba(255, 255, 255, 0.3)',
      };
    }

    if (segment.confidence < 0.85) {
      return { ...base, opacity: 0.8 };
    }

    return base;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: `${spaceAround.compact}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: borderRadius.md,
        marginBottom: spaceBetween.related,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spaceBetween.coupled,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.coupled }}>
          <span
            style={{
              fontSize: 12,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.semibold,
              color: getSpeakerColor(),
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {getSpeakerLabel()}
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: typography.fontFamily.mono,
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            backgroundColor: segment.confidence >= 0.85
              ? 'rgba(76, 175, 80, 0.2)'
              : segment.confidence >= 0.6
                ? 'rgba(255, 193, 7, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
            borderRadius: borderRadius.sm,
            color: segment.confidence >= 0.85
              ? colors.fg.positive.secondary
              : segment.confidence >= 0.6
                ? colors.fg.attention.primary
                : colors.fg.alert.secondary,
          }}
        >
          {getConfidenceLabel()}
        </span>
      </div>
      <p style={getTextStyle()}>{segment.text}</p>

      {/* Show extracted entities */}
      {segment.entities && segment.entities.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginTop: spaceBetween.coupled,
          }}
        >
          {segment.entities.map((entity, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 10,
                padding: '2px 6px',
                backgroundColor: 'rgba(66, 165, 245, 0.15)',
                borderRadius: borderRadius.xs,
                color: colors.fg.information.primary,
              }}
            >
              {entity.type}: {entity.text}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// Settings Panel
// ============================================================================

interface SettingsPanelProps {
  session: TranscriptionSession;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ session }) => {
  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px 0`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    color: colors.fg.neutral.inversePrimary,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  };

  return (
    <div style={{ padding: spaceAround.default }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.inversePrimary,
          marginBottom: spaceAround.default,
        }}
      >
        Recording Settings
      </h3>

      <div style={settingRowStyle}>
        <span style={labelStyle}>Audio Input</span>
        <span style={valueStyle}>
          {session.isDemo ? 'Demo Mode (Simulated)' : 'Default Microphone'}
        </span>
      </div>

      <div style={settingRowStyle}>
        <span style={labelStyle}>Speaker Detection</span>
        <span style={valueStyle}>Auto-detect</span>
      </div>

      <div style={settingRowStyle}>
        <span style={labelStyle}>Language</span>
        <span style={valueStyle}>English (US)</span>
      </div>

      <div style={settingRowStyle}>
        <span style={labelStyle}>Save Transcripts</span>
        <span style={valueStyle}>Automatically</span>
      </div>

      <div
        style={{
          marginTop: spaceAround.spacious,
          padding: spaceAround.compact,
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          borderRadius: borderRadius.md,
        }}
      >
        <p style={{ fontSize: 13, color: colors.fg.information.primary }}>
          Demo Mode Active
        </p>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: 4,
          }}
        >
          Using pre-authored transcript. No actual audio is being recorded.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Tab Button
// ============================================================================

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.coupled,
      padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      borderRadius: borderRadius.md,
      border: 'none',
      cursor: 'pointer',
      color: isActive ? colors.fg.neutral.inversePrimary : 'rgba(255, 255, 255, 0.5)',
      fontSize: 13,
      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
      transition: `all ${transitions.fast}`,
    }}
  >
    {icon}
    {label}
  </button>
);

// ============================================================================
// Component
// ============================================================================

export const TranscriptionDrawer: React.FC<TranscriptionDrawerProps> = ({
  session,
  onCollapse,
  onCollapseToPalette,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  style,
  testID,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('transcript');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isRecording = session.status === 'recording';
  const isPaused = session.status === 'paused';
  const hasSegments = session.segments.length > 0;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && isRecording && activeTab === 'transcript') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.segments.length, isRecording, activeTab]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 500,
    ...glass.glassDark,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  const transcriptContentStyle: React.CSSProperties = {
    padding: spaceAround.default,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  };

  // Render primary action
  const renderPrimaryAction = () => {
    if (isRecording) {
      return (
        <ControlsBarButton
          label="Pause"
          icon={<Pause size={16} />}
          variant="secondary"
          colorScheme="dark"
          onClick={onPause}
        />
      );
    }

    if (isPaused) {
      return (
        <ControlsBarButton
          label="Resume"
          icon={<Play size={16} />}
          variant="primary"
          onClick={onResume}
        />
      );
    }

    return (
      <ControlsBarButton
        label="Start Recording"
        icon={<Mic size={16} />}
        variant="primary"
        onClick={onStart}
      />
    );
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.related }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              backgroundColor: isRecording || isPaused
                ? colors.fg.alert.secondary
                : colors.fg.accent.primary,
              borderRadius: borderRadius.full,
              color: colors.fg.neutral.inversePrimary,
              fontSize: 11,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {session.patient.initials}
          </span>
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: typography.fontWeight.semibold,
                color: colors.fg.neutral.inversePrimary,
              }}
            >
              {session.patient.name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Transcription
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.related }}>
          {(isRecording || isPaused) && (
            <>
              <WaveformIndicator isAnimating={isRecording} size="md" barCount={5} />
              <span
                style={{
                  fontSize: 18,
                  fontFamily: typography.fontFamily.mono,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.fg.neutral.inversePrimary,
                }}
              >
                {formatDuration(session.duration)}
              </span>
            </>
          )}

          <button
            type="button"
            onClick={onCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: borderRadius.sm,
              border: 'none',
              cursor: 'pointer',
              color: colors.fg.neutral.inversePrimary,
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        <TabButton
          label="Live Transcript"
          icon={<FileText size={14} />}
          isActive={activeTab === 'transcript'}
          onClick={() => setActiveTab('transcript')}
        />
        <TabButton
          label="Settings"
          icon={<SettingsIcon size={14} />}
          isActive={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      {/* Content */}
      <div ref={scrollRef} style={contentStyle}>
        {activeTab === 'transcript' ? (
          hasSegments ? (
            <div style={transcriptContentStyle}>
              <AnimatePresence>
                {session.segments.map((segment) => (
                  <SegmentDisplayFull key={segment.id} segment={segment} />
                ))}
                {session.currentSegment && (
                  <SegmentDisplayFull
                    key="partial"
                    segment={session.currentSegment as TranscriptSegment}
                    isPartial
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <Mic size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: 16, marginBottom: 8 }}>
                {isPaused ? 'Recording paused' : 'No transcript yet'}
              </p>
              <p style={{ fontSize: 13, opacity: 0.6, maxWidth: 280 }}>
                {isPaused
                  ? 'Resume recording to continue capturing conversation'
                  : 'Start recording to see live transcription appear here'}
              </p>
            </div>
          )
        ) : (
          <SettingsPanel session={session} />
        )}
      </div>

      {/* Controls bar */}
      <ControlsBar
        variant="dark"
        height={64}
        left={
          (isRecording || isPaused) && (
            <ControlsBarButton
              label="Discard"
              icon={<Trash2 size={14} />}
              variant="danger"
              colorScheme="dark"
              onClick={onDiscard}
            />
          )
        }
        center={
          <ControlsBarStatus
            text={
              hasSegments
                ? `${session.segments.length} segment${session.segments.length === 1 ? '' : 's'} • ${formatDuration(session.duration)}`
                : 'Ready to record'
            }
            colorScheme="dark"
          />
        }
        right={
          <div style={{ display: 'flex', gap: spaceBetween.coupled }}>
            {(isRecording || isPaused) && hasSegments && (
              <ControlsBarButton
                label="Finish"
                icon={<Check size={14} />}
                variant="secondary"
                colorScheme="dark"
                onClick={onStop}
              />
            )}
            {renderPrimaryAction()}
          </div>
        }
      />
    </div>
  );
};

TranscriptionDrawer.displayName = 'TranscriptionDrawer';

export default TranscriptionDrawer;
