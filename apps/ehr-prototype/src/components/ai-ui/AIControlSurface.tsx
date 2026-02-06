/**
 * AIControlSurface Component
 *
 * Unified container that orchestrates TranscriptionPill + AIMinibar/Palette
 * with coordinated Framer Motion animations.
 *
 * Animation choreography:
 * STATE 1 (Both collapsed - 25/75 split):
 *   TranscriptionPill (25%) + AIMinibar (75%)
 *
 * STATE 2 (Horizontal rebalance - transcription minimizes):
 *   TranscriptionPill minimizes to icon (~10%)
 *   AIMinibar expands horizontally (~90%)
 *
 * STATE 3 (Vertical expansion into palette):
 *   AIMinibar morphs vertically into full palette
 *
 * Timing:
 * - Horizontal transition: 200ms (both elements simultaneously)
 * - Delay: 50ms
 * - Vertical expansion: 250ms (spring physics)
 * - Content cross-fade: During vertical expansion
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TranscriptionPill } from './TranscriptionPill';
import { AIMinibar, type AIMinibarContent, type ActionPill, type RecordingCompleteContent } from './AIMinibar';
import { AIPalette } from './AIPalette';
import type { TranscriptionStatus } from '../../types/transcription';
import type { AIContext, QuickAction } from '../../hooks/useAIAssistant';
import type { Suggestion, Alert } from '../../types/suggestions';
import { shadows, zIndex as zIndexTokens } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type AIControlMode = 'minibar' | 'palette' | 'drawer';

export interface AIControlSurfaceProps {
  /** Current AI control mode */
  mode: AIControlMode;
  /** Called when mode changes */
  onModeChange: (mode: AIControlMode) => void;

  // Transcription props
  /** Current transcription status */
  transcriptionStatus: TranscriptionStatus;
  /** Patient name being recorded */
  patientName?: string;
  /** Patient initials */
  patientInitials?: string;
  /** Recording duration in seconds */
  recordingDuration?: number;
  /** Whether transcription is enabled */
  transcriptionEnabled?: boolean;
  /** Called when transcription toggle is clicked */
  onTranscriptionToggle: () => void;
  /** Called when stop button is clicked */
  onTranscriptionStop?: () => void;
  /** Called when pause button is clicked */
  onTranscriptionPause?: () => void;
  /** Called when resume button is clicked */
  onTranscriptionResume?: () => void;

  // AI Minibar props
  /** Content to display in minibar */
  minibarContent: AIMinibarContent;
  /** Action pill (optional, appears on right edge) */
  actionPill?: ActionPill;
  /** Called when a suggestion is clicked */
  onSuggestionClick?: (id: string) => void;
  /** Called when a care gap is clicked */
  onCareGapClick?: (id: string) => void;

  // AI Palette props
  /** Current AI context */
  aiContext?: AIContext;
  /** Quick actions for current context */
  quickActions?: QuickAction[];
  /** Active suggestions */
  suggestions?: Suggestion[];
  /** Active alerts */
  alerts?: Alert[];
  /** Visit type */
  visitType?: string;
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Called when a quick action is clicked */
  onQuickActionClick?: (actionId: string) => void;
  /** Called when user submits a question */
  onAskQuestion?: (question: string) => void;
  /** Whether AI is processing */
  isAILoading?: boolean;
  /** Called when expand to drawer is clicked */
  onExpandToDrawer?: () => void;
  /** Called when context is dismissed */
  onContextDismiss?: () => void;
  /** Whether context is dismissed */
  isContextDismissed?: boolean;

  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Animation Configuration
// ============================================================================

// iOS-like easing for smooth transitions
const EASE_OUT: [number, number, number, number] = [0.32, 0.72, 0, 1];

// Animation durations
const HORIZONTAL_DURATION = 0.2;
const VERTICAL_DURATION = 0.3;
const CONTENT_FADE_DURATION = 0.15;

// Dimension constants for coordinated animation
const TRANSCRIPTION_MINIMIZED_WIDTH = 48;   // When palette open
const TRANSCRIPTION_DEFAULT_WIDTH = 160;    // Normal state
const TRANSCRIPTION_EXPANDED_WIDTH = 260;   // Expanded (idle or recording)
const GAP_WIDTH = 12;                       // Gap between elements
const AI_SURFACE_COLLAPSED_WIDTH = 400;

// Fixed total width ensures animations stay perfectly in sync
// Total = transcription + gap + AI surface = constant
const TOTAL_CONTROL_WIDTH = TRANSCRIPTION_DEFAULT_WIDTH + GAP_WIDTH + AI_SURFACE_COLLAPSED_WIDTH; // 572px

// ============================================================================
// Component
// ============================================================================

export const AIControlSurface: React.FC<AIControlSurfaceProps> = ({
  mode,
  onModeChange,

  // Transcription
  transcriptionStatus,
  patientName,
  patientInitials,
  recordingDuration = 0,
  transcriptionEnabled = true,
  onTranscriptionToggle,
  onTranscriptionStop,
  onTranscriptionPause,
  onTranscriptionResume,

  // Minibar
  minibarContent,
  actionPill,
  onSuggestionClick,
  onCareGapClick,

  // Palette
  aiContext = 'none',
  quickActions = [],
  suggestions = [],
  alerts = [],
  visitType,
  onSuggestionAccept,
  onSuggestionDismiss,
  onQuickActionClick,
  onAskQuestion,
  isAILoading = false,
  onExpandToDrawer,
  onContextDismiss,
  isContextDismissed = false,

  style,
  testID,
}) => {
  // Track recording completion for AI minibar handoff
  const [recordingCompleteData, setRecordingCompleteData] = useState<{
    duration: number;
    showAction: boolean;
  } | null>(null);

  // Handle recording complete
  const handleRecordingComplete = useCallback((duration: number) => {
    setRecordingCompleteData({ duration, showAction: true });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setRecordingCompleteData(null);
    }, 10000);
  }, []);

  // Clear recording complete when summarize is clicked
  const handleSummarize = useCallback(() => {
    setRecordingCompleteData(null);
    // Could trigger AI summarization here
    onModeChange('palette');
  }, [onModeChange]);

  // Toggle palette
  const handleTogglePalette = useCallback(() => {
    onModeChange(mode === 'palette' ? 'minibar' : 'palette');
  }, [mode, onModeChange]);

  // Close to minibar
  const handleClosePalette = useCallback(() => {
    onModeChange('minibar');
  }, [onModeChange]);

  const isPaletteOpen = mode === 'palette';

  // Track visual minimized state separately for coordinated animations
  // This delays the transcription pill's visual state change during close
  const [visuallyMinimized, setVisuallyMinimized] = useState(false);

  useEffect(() => {
    if (isPaletteOpen) {
      // Opening: minimize immediately
      setVisuallyMinimized(true);
    } else {
      // Closing: wait for height animation to complete, then restore
      const timer = setTimeout(() => {
        setVisuallyMinimized(false);
      }, VERTICAL_DURATION * 1000); // Convert to ms
      return () => clearTimeout(timer);
    }
  }, [isPaletteOpen]);

  // Track transcription pill expanded state (user-controlled, not minimized)
  const [isTranscriptionExpanded, setIsTranscriptionExpanded] = useState(false);

  // Auto-expand when recording starts
  useEffect(() => {
    if (transcriptionStatus === 'recording' && !isTranscriptionExpanded && !isPaletteOpen) {
      setIsTranscriptionExpanded(true);
    }
  }, [transcriptionStatus, isTranscriptionExpanded, isPaletteOpen]);

  // Reset expanded state when palette closes
  useEffect(() => {
    if (!isPaletteOpen) {
      // After palette closes, reset to default (not expanded)
      const timer = setTimeout(() => {
        setIsTranscriptionExpanded(false);
      }, VERTICAL_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [isPaletteOpen]);

  // Handle transcription expand/collapse toggle
  const handleTranscriptionExpandToggle = useCallback(() => {
    setIsTranscriptionExpanded(prev => !prev);
  }, []);

  // Handle transcription pause - pause AND expand
  const handleTranscriptionPauseAndExpand = useCallback(() => {
    onTranscriptionPause?.();
    setIsTranscriptionExpanded(true);
  }, [onTranscriptionPause]);

  // Derive content - prioritize paused prompt, then recording complete notification
  const effectiveContent: AIMinibarContent =
    // When paused, show summarize prompt in minibar
    transcriptionStatus === 'paused' && !recordingCompleteData?.showAction
      ? {
          type: 'paused-prompt',
          message: 'Recording paused',
          actionLabel: 'Summarize now',
          onAction: handleSummarize,
        } as AIMinibarContent
      // Recording complete notification
      : recordingCompleteData?.showAction
        ? {
            type: 'recording-complete',
            duration: recordingCompleteData.duration,
            actionLabel: 'Summarize',
            onAction: handleSummarize,
          } as RecordingCompleteContent
        : minibarContent;

  // Container styles - fixed at bottom center with constant total width
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndexTokens.docked,
    display: 'flex',
    alignItems: 'flex-end', // Align to bottom for height expansion
    gap: GAP_WIDTH,
    width: TOTAL_CONTROL_WIDTH, // Fixed total width ensures no jitter during animation
    ...style,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Transcription Pill - tri-state width: 48px (minimized) → 160px (default) → 260px (expanded) */}
      <motion.div
        layout
        animate={{
          width: isPaletteOpen
            ? TRANSCRIPTION_MINIMIZED_WIDTH
            : isTranscriptionExpanded
              ? TRANSCRIPTION_EXPANDED_WIDTH
              : TRANSCRIPTION_DEFAULT_WIDTH,
        }}
        transition={{
          duration: HORIZONTAL_DURATION,
          ease: EASE_OUT,
          // Opening: width first (no delay), Closing: width after height (delayed)
          delay: isPaletteOpen ? 0 : VERTICAL_DURATION,
        }}
        style={{
          flexShrink: 0,
        }}
      >
        <TranscriptionPill
          status={transcriptionStatus}
          patientName={patientName}
          patientInitials={patientInitials}
          duration={recordingDuration}
          isEnabled={transcriptionEnabled}
          isMinimized={visuallyMinimized}
          isExpanded={isTranscriptionExpanded}
          onToggle={onTranscriptionToggle}
          onStop={onTranscriptionStop}
          onPause={handleTranscriptionPauseAndExpand}
          onResume={onTranscriptionResume}
          onRecordingComplete={handleRecordingComplete}
          onExpandToggle={handleTranscriptionExpandToggle}
          onClick={isPaletteOpen ? handleClosePalette : undefined}
        />
      </motion.div>

      {/* AI Surface - fills remaining space (flex: 1), expands height to fit content */}
      <motion.div
        layout
        transition={{
          layout: {
            duration: VERTICAL_DURATION,
            ease: EASE_OUT,
            // Opening: height after width (delayed), Closing: height first (no delay)
            delay: isPaletteOpen ? HORIZONTAL_DURATION : 0,
          },
        }}
        style={{
          flex: 1,           // Fill remaining space - as transcription shrinks, this grows
          minWidth: 0,       // Allow shrinking below content size
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isPaletteOpen ? 16 : 24, // Slightly less round when expanded
          boxShadow: shadows.lg,
          // Glassmorphic dark background on container
          backgroundColor: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          // minHeight ensures minibar is always visible, height grows with palette content
          minHeight: 48,
          maxHeight: isPaletteOpen ? 480 : 48,
        }}
      >
        {/* Minibar content - fades out when palette opens, always absolute */}
        <motion.div
          animate={{
            opacity: isPaletteOpen ? 0 : 1,
            pointerEvents: isPaletteOpen ? 'none' : 'auto',
          }}
          transition={{ duration: CONTENT_FADE_DURATION }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <AIMinibar
            content={effectiveContent}
            isPaletteOpen={isPaletteOpen}
            actionPill={actionPill}
            onExpandPalette={handleTogglePalette}
            onExpandDrawer={onExpandToDrawer}
            onSuggestionClick={onSuggestionClick}
            onCareGapClick={onCareGapClick}
            style={{
              backgroundColor: 'transparent',
              backdropFilter: 'none',
              border: 'none',
              boxShadow: 'none',
              width: '100%',
              height: '100%',
              borderRadius: 0,
            }}
          />
        </motion.div>

        {/* Palette content - in normal flow when visible to contribute to auto height */}
        <motion.div
          animate={{
            opacity: isPaletteOpen ? 1 : 0,
            pointerEvents: isPaletteOpen ? 'auto' : 'none',
          }}
          transition={{ duration: CONTENT_FADE_DURATION, delay: isPaletteOpen ? 0.1 : 0 }}
          style={{
            // When palette is open: normal flow (contributes to parent height)
            // When closed: absolute + hidden (doesn't affect layout)
            position: isPaletteOpen ? 'relative' : 'absolute',
            top: isPaletteOpen ? undefined : 0,
            left: isPaletteOpen ? undefined : 0,
            right: isPaletteOpen ? undefined : 0,
            display: 'flex',
            flexDirection: 'column',
            visibility: isPaletteOpen ? 'visible' : 'hidden',
            height: isPaletteOpen ? 'auto' : 0,
            overflow: 'hidden',
          }}
        >
          <AIPalette
            isOpen={true}
            onClose={handleClosePalette}
            onExpandToDrawer={onExpandToDrawer}
            patientName={patientName}
            visitType={visitType}
            context={aiContext}
            quickActions={quickActions}
            suggestions={suggestions}
            alerts={alerts}
            onSuggestionAccept={onSuggestionAccept}
            onSuggestionDismiss={onSuggestionDismiss}
            onQuickActionClick={onQuickActionClick}
            onAskQuestion={onAskQuestion}
            isLoading={isAILoading}
            isContextDismissed={isContextDismissed}
            onContextDismiss={onContextDismiss}
            onAlertAcknowledge={() => {}}
            onAlertAction={() => {}}
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: 'transparent',
              backdropFilter: 'none',
              border: 'none',
              borderRadius: 0,
            }}
          />
        </motion.div>

        {/* Spacer for minibar height when palette is closed */}
        {!isPaletteOpen && <div style={{ height: 48 }} />}
      </motion.div>
    </div>
  );
};

AIControlSurface.displayName = 'AIControlSurface';
