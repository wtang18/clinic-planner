/**
 * ControlsContainer Component
 *
 * Actions container for the Transcription Module.
 * Shows timer + action buttons based on tier and status.
 *
 * Content by Tier:
 * - Micro: Hidden (0×0)
 * - Bar: Timer (when recording/paused) + Action button
 * - Palette: Timer + Discard (when paused) + Primary Action + Settings
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Pause, Play, RotateCcw, Trash2, Square, Settings } from 'lucide-react';
import {
  colors,
  borderRadius,
  spaceBetween,
  spaceAround,
  transitions,
} from '../../../../styles/foundations';
import { ControlsBar, ControlsBarButton, ControlsBarStatus } from '../../ControlsBar';
import { RecordingStatusGroup } from '../RecordingStatusGroup';
import type { TierState, TranscriptionSession, RecordingStatus } from '../../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface ControlsContainerProps {
  /** Current display tier */
  tier: TierState;
  /** Session data (or null if no session) */
  session: TranscriptionSession | null;
  /** Animation phase from parent - used for crossfade timing during transitions */
  animationPhase?: string;
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
  /** Called to open settings */
  onSettings?: () => void;
  /** Whether transcription is available */
  isEnabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const BAR_HEIGHT = 48;
const ICON_BUTTON_SIZE = 32;

// ============================================================================
// Unified Action Button
// ============================================================================

type ActionVariant = 'primary' | 'secondary' | 'ghost';

interface UnifiedActionButtonProps {
  /** Unique key for layoutId to maintain identity across modes */
  actionKey: string;
  /** Icon to display */
  icon: React.ReactNode;
  /** Label text (shown in palette mode) */
  label: string;
  /** Whether to show the label (true in palette mode, false in bar mode) */
  showLabel: boolean;
  /** Visual variant */
  variant: ActionVariant;
  /** Click handler */
  onClick: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
}

const UnifiedActionButton: React.FC<UnifiedActionButtonProps> = ({
  actionKey,
  icon,
  label,
  showLabel,
  variant,
  onClick,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get background color based on variant and hover state
  const getBackgroundColor = () => {
    if (variant === 'primary') {
      return isHovered && !disabled
        ? colors.fg.accent.secondary
        : colors.fg.accent.primary;
    }
    if (variant === 'secondary') {
      return isHovered && !disabled
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.1)';
    }
    // ghost
    return isHovered && !disabled
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.06)';
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: showLabel ? spaceBetween.coupled : 0,
    height: ICON_BUTTON_SIZE,
    padding: showLabel ? '0 12px' : '0',
    width: showLabel ? 'auto' : ICON_BUTTON_SIZE,
    minWidth: ICON_BUTTON_SIZE,
    borderRadius: showLabel ? borderRadius.md : borderRadius.full,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: getBackgroundColor(),
    color: colors.fg.neutral.inversePrimary,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  };

  return (
    <motion.button
      type="button"
      style={buttonStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      title={!showLabel ? label : undefined}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon - no layout animation to prevent position jumping */}
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>

      {/* Label with fade animation */}
      <AnimatePresence mode="wait">
        {showLabel && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};


// ============================================================================
// Main Component
// ============================================================================

export const ControlsContainer: React.FC<ControlsContainerProps> = ({
  tier,
  session,
  animationPhase,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  onRetry,
  onSettings,
  isEnabled = true,
  style,
  testID,
}) => {
  const status = session?.status ?? 'idle';
  const duration = session?.duration ?? 0;
  const hasSegments = (session?.segments.length ?? 0) > 0;

  const isMicro = tier === 'mini';
  const isBar = tier === 'bar';
  const isPalette = tier === 'palette';

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isProcessing = status === 'processing';
  const isError = status === 'error';
  const isIdle = status === 'idle' || status === 'complete';

  const showTimer = isRecording || isPaused;

  // Timer crossfade: hide during transitions to avoid collision with other elements
  // Timer is visible only in idle states (idle-bar, idle-palette)
  const isTransitioning = animationPhase && (
    animationPhase.includes('expanding') ||
    animationPhase.includes('collapsing')
  );
  const showTimerWithCrossfade = showTimer && !isTransitioning;

  // Check if in height transition phase - use bar layout during these to prevent button flash
  // The flash occurs because switching from flexbox (bar) to grid (palette) causes
  // the button to briefly appear centered before grid recalculates
  const isInHeightTransition = animationPhase && (
    animationPhase === 'expanding-height' ||
    animationPhase === 'collapsing-height'
  );

  // Use bar layout during height transitions to keep button pinned to right
  const useBarLayout = isBar || isInHeightTransition;

  // Don't render in micro tier
  if (isMicro) {
    return null;
  }

  // Bar tier (or height transition): Simple layout with timer (left) + button (right, pinned)
  // No layout animation to prevent button position jumping
  if (useBarLayout) {
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',  // Push content to right
      height: BAR_HEIGHT,
      padding: `0 ${spaceAround.tight}px 0 0`,
      flexShrink: 0,
      ...style,
    };

    return (
      <div
        style={containerStyle}
        data-testid={testID}
      >
        {/* Timer - crossfades during transitions */}
        <AnimatePresence mode="wait">
          {showTimerWithCrossfade && (
            <motion.div
              key="bar-timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              style={{ marginRight: 8 }}  // Gap between timer and button
            >
              <RecordingStatusGroup
                duration={duration}
                isRecording={isRecording}
                isPaused={isPaused}
                showTimer={showTimer}
                variant="bar"
                testID={testID ? `${testID}-status-group` : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button - ALWAYS pinned to right via marginLeft: auto */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: 'auto' }}>
          {isIdle && (
            <UnifiedActionButton
              actionKey="primary"
              icon={<Mic size={16} />}
              label="Start"
              showLabel={false}
              variant="primary"
              onClick={onStart}
              disabled={!isEnabled}
            />
          )}
          {isRecording && (
            <UnifiedActionButton
              actionKey="primary"
              icon={<Pause size={16} />}
              label="Pause"
              showLabel={false}
              variant="secondary"
              onClick={onPause}
            />
          )}
          {isPaused && (
            <UnifiedActionButton
              actionKey="primary"
              icon={<Play size={16} />}
              label="Resume"
              showLabel={false}
              variant="primary"
              onClick={onResume}
            />
          )}
          {isError && (
            <UnifiedActionButton
              actionKey="primary"
              icon={<RotateCcw size={16} />}
              label="Retry"
              showLabel={false}
              variant="primary"
              onClick={onRetry ?? onStart}
            />
          )}
          {isProcessing && (
            <div style={{ width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE, opacity: 0.5 }} />
          )}
        </div>
      </div>
    );
  }

  // Palette tier: Flexbox with space-between to pin controls to right edge
  // Left: Discard (when paused), Center: Timer (flex-1), Right: Action buttons (always pinned)
  const paletteContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: BAR_HEIGHT,
    padding: `0 ${spaceAround.default}px`,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    ...style,
  };

  return (
    <div
      style={paletteContainerStyle}
      data-testid={testID}
    >
      {/* Left: Discard button (when paused) */}
      <div style={{ display: 'flex', gap: spaceBetween.coupled, justifyContent: 'flex-start' }}>
        {isPaused && (
          <ControlsBarButton
            label="Discard"
            icon={<Trash2 size={14} />}
            variant="ghost"
            colorScheme="dark"
            size="sm"
            onClick={onDiscard}
          />
        )}
      </div>

      {/* Center: Timer - grid auto column centers it */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {showTimerWithCrossfade && (
            <motion.div
              key="palette-timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <RecordingStatusGroup
                duration={duration}
                isRecording={isRecording}
                isPaused={isPaused}
                showTimer={showTimer}
                variant="palette"
                testID={testID ? `${testID}-status-group` : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!showTimer && hasSegments && (
          <ControlsBarStatus
            text={`${session?.segments.length} segment${session?.segments.length === 1 ? '' : 's'}`}
            colorScheme="dark"
          />
        )}
      </div>

      {/* Right: Action buttons - always pinned to right edge */}
      <div
        style={{
          display: 'flex',
          gap: spaceBetween.coupled,
          justifyContent: 'flex-end',
        }}
      >
        {/* Done button - only when paused with segments */}
        <AnimatePresence mode="popLayout">
          {isPaused && hasSegments && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ControlsBarButton
                label="Done"
                icon={<Square size={14} />}
                variant="secondary"
                colorScheme="dark"
                size="sm"
                onClick={onStop}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary action button - uses UnifiedActionButton for smooth bar↔palette transitions */}
        {isIdle && (
          <UnifiedActionButton
            actionKey="primary"
            icon={<Mic size={14} />}
            label="Start"
            showLabel={true}
            variant="primary"
            onClick={onStart}
            disabled={!isEnabled}
          />
        )}
        {isRecording && (
          <UnifiedActionButton
            actionKey="primary"
            icon={<Pause size={14} />}
            label="Pause"
            showLabel={true}
            variant="secondary"
            onClick={onPause}
          />
        )}
        {isPaused && (
          <UnifiedActionButton
            actionKey="primary"
            icon={<Play size={14} />}
            label="Resume"
            showLabel={true}
            variant="primary"
            onClick={onResume}
          />
        )}
        {isError && (
          <UnifiedActionButton
            actionKey="primary"
            icon={<RotateCcw size={14} />}
            label="Retry"
            showLabel={true}
            variant="primary"
            onClick={onRetry ?? onStart}
          />
        )}

        {/* Settings button */}
        {onSettings && (
          <ControlsBarButton
            label=""
            icon={<Settings size={14} />}
            variant="ghost"
            colorScheme="dark"
            size="sm"
            onClick={onSettings}
            style={{ padding: '0 8px', minWidth: 32 }}
          />
        )}
      </div>
    </div>
  );
};

ControlsContainer.displayName = 'ControlsContainer';

export default ControlsContainer;
