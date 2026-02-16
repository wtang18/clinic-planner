/**
 * TranscriptionModule Component
 *
 * 3-Container Architecture:
 * - AvatarContainer: Identity (avatar + patient name)
 * - ContentContainer: Display (waveform, transcript, status)
 * - ControlsContainer: Actions (timer + buttons)
 *
 * CSS Grid drives horizontal sizing (width: 100%), framer-motion drives vertical:
 * - EXPAND: height animates 48→auto (grid handles width)
 * - COLLAPSE: height animates auto→48, then dispatches tier change
 * - Anchor (48×48 pill) keeps explicit 48px width in its 48px grid cell.
 *
 * Bottom-anchored: Frame grows upward, Controls stays at baseline.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragHandle } from '../DragHandle';
import { TranscriptionDrawer } from './TranscriptionDrawer';
import { AvatarContainer, ContentContainer, ControlsContainer } from './containers';
import { AvatarWithBadge, PATIENT_COLORS } from './AvatarWithBadge';
import type { BadgeStatus } from './StatusBadge';
import {
  glass,
  colors,
  borderRadius,
  shadows,
  transitions,
} from '../../../styles/foundations';
import type { TierState, TranscriptionSession } from '../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionModuleProps {
  /** Current tier state */
  tier: TierState;
  /** Session data (or null if no session) */
  session: TranscriptionSession | null;
  /** Called to switch to a different tier */
  onTierChange: (tier: TierState) => void;
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
  /** Whether transcription is available */
  isEnabled?: boolean;
  /** Whether TM bar is full-width (AI in pane, not in bottom bar) */
  isFullWidth?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID prefix */
  testID?: string;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Animation Phases — CSS Grid handles width, framer-motion handles height only.
 *
 * EXPAND: expanding-height (48→auto)
 * COLLAPSE: collapsing-height (auto→48), then dispatch tier change
 */
type AnimationPhase =
  | 'idle-mini'             // Resting at anchor size (48×48)
  | 'idle-bar'              // Resting at bar size (width:100% × 48)
  | 'expanding-height'      // Height 48→auto (grid already allocated width)
  | 'idle-palette'          // Resting at palette size (width:100% × auto)
  | 'collapsing-height';    // Height auto→48

// ============================================================================
// Constants
// ============================================================================

const MICRO_SIZE = 48;
const BAR_HEIGHT = 48;
const PALETTE_MAX_HEIGHT = 400;
const CONTAINER_GAP = 2;  // Tightened to bring waveform closer to timer
const STAGE_DURATION = 0.2; // 200ms per stage

// ============================================================================
// Animation Transitions
// ============================================================================

const stageTransition = {
  duration: STAGE_DURATION,
  ease: [0.4, 0, 0.2, 1] as const,
};

// ============================================================================
// Mini Content Component (rendered inside motion.div)
// ============================================================================

interface MiniContentProps {
  session: TranscriptionSession | null;
  isRecording: boolean;
  isPaused: boolean;
  isVisible: boolean;
}

/** Map recording state to BadgeStatus for micro mode */
function toMicroBadgeStatus(isRecording: boolean, isPaused: boolean): BadgeStatus {
  if (isRecording) return 'recording';
  if (isPaused) return 'paused';
  return 'idle';
}

const MiniContent: React.FC<MiniContentProps> = ({
  session,
  isRecording,
  isPaused,
  isVisible,
}) => {
  const badgeStatus = toMicroBadgeStatus(isRecording, isPaused);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Avatar with patient initials (32px centered in 48px when idle) */}
      <AvatarWithBadge
        initials={session?.patient.initials ?? 'PT'}
        color={PATIENT_COLORS.blue}
        status={badgeStatus}
        size={32}
        showBadge={badgeStatus !== 'idle'}
        badgeAnimate={true}  // Micro mode badge DOES animate
        badgeSize={10}  // Smaller badge for micro
        badgeIntensity="glow"  // Use glow effect for micro mode visibility
      />
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TranscriptionModule: React.FC<TranscriptionModuleProps> = ({
  tier,
  session,
  onTierChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  isEnabled = true,
  isFullWidth = false,
  style,
  testID = 'transcription-module',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(200);

  // Initialize phase based on tier
  const getInitialPhase = (): AnimationPhase => {
    if (tier === 'anchor') return 'idle-mini';
    if (tier === 'palette') return 'idle-palette';
    return 'idle-bar';
  };
  const [phase, setPhase] = useState<AnimationPhase>(getInitialPhase);

  // Track where we're collapsing TO (bar or mini) - set when collapse starts
  const collapseTargetRef = useRef<'bar' | 'anchor'>('bar');

  const isDrawer = tier === 'drawer';

  const isRecording = session?.status === 'recording';
  const isPaused = session?.status === 'paused';

  // Sync phase with external tier changes
  const prevTierRef = useRef(tier);
  useEffect(() => {
    const prevTier = prevTierRef.current;
    prevTierRef.current = tier;

    if (tier === 'drawer') return; // Drawer handled separately

    // Skip if phase is already animating
    const isAnimating = phase.includes('expanding') || phase.includes('collapsing');
    if (isAnimating) return;

    // Handle external tier changes
    if (tier === 'anchor' && phase !== 'idle-mini') {
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'anchor';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-mini');
      }
    } else if (tier === 'palette' && phase !== 'idle-palette') {
      if (prevTier === 'anchor' || prevTier === 'bar') {
        setPhase('expanding-height');
      } else {
        setPhase('idle-palette');
      }
    } else if (tier === 'bar' && phase !== 'idle-bar') {
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'bar';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-bar');
      }
    }
  }, [tier, phase]);

  // Measure content height for palette
  useEffect(() => {
    if (contentRef.current && (phase === 'idle-palette' || phase === 'expanding-height')) {
      const height = contentRef.current.scrollHeight;
      if (height > 0) {
        setContentHeight(Math.min(height, PALETTE_MAX_HEIGHT));
      }
    }
  }, [phase, session]);


  // Handle mini click - expand to palette
  const handleMiniClick = useCallback(() => {
    if (phase === 'idle-mini') {
      onTierChange('palette');
      setPhase('expanding-height');
    }
  }, [phase, onTierChange]);

  // Handle bar click - expand to palette
  const handleBarClick = useCallback(() => {
    if (phase === 'idle-bar') {
      onTierChange('palette');
      setPhase('expanding-height');
    }
  }, [phase, onTierChange]);

  // Handle collapse from palette
  const handleCollapse = useCallback(() => {
    if (phase === 'idle-palette') {
      collapseTargetRef.current = 'bar';
      setPhase('collapsing-height');
    }
  }, [phase]);

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    switch (phase) {
      case 'expanding-height':
        setPhase('idle-palette');
        break;

      case 'collapsing-height':
        if (collapseTargetRef.current === 'anchor') {
          onTierChange('anchor');
          setPhase('idle-mini');
        } else {
          onTierChange('bar');
          setPhase('idle-bar');
        }
        break;
    }
  }, [phase, onTierChange]);

  // Calculate dimensions based on animation phase
  // CSS Grid drives width; modules use 100% to fill their cell.
  // Only anchor (48×48 pill) uses explicit width.
  const getDimensions = useCallback(() => {
    switch (phase) {
      case 'idle-mini':
        return { width: MICRO_SIZE, height: MICRO_SIZE };
      case 'idle-bar':
        return { width: '100%' as const, height: BAR_HEIGHT };
      case 'expanding-height':
        return { width: '100%' as const, height: contentHeight };
      case 'idle-palette':
        return { width: '100%' as const, height: 'auto' as const };
      case 'collapsing-height':
        return { width: '100%' as const, height: BAR_HEIGHT };
    }
  }, [phase, contentHeight]);

  // Handle expand to drawer
  const handleExpandToDrawer = useCallback(() => {
    onTierChange('drawer');
  }, [onTierChange]);

  // ========================================
  // Drawer tier - Full drawer view
  // ========================================
  if (isDrawer) {
    if (!session) {
      // No session, show idle bar instead
      return (
        <TranscriptionModule
          tier="bar"
          session={null}
          onTierChange={onTierChange}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onDiscard={onDiscard}
          isEnabled={isEnabled}
          style={style}
          testID={testID}
        />
      );
    }
    return (
      <TranscriptionDrawer
        session={session}
        onCollapse={handleCollapse}
        onCollapseToPalette={() => onTierChange('palette')}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
        onDiscard={onDiscard}
        testID={`${testID}-drawer`}
      />
    );
  }

  // ========================================
  // Unified rendering: Mini, Bar, and Palette
  // ========================================

  // Determine visual state based on animation phase
  const isVisuallyMini = phase === 'idle-mini';
  const isVisuallyBar = phase === 'idle-bar';
  const isVisuallyPalette = phase === 'idle-palette' || phase === 'expanding-height' || phase === 'collapsing-height';

  const dimensions = getDimensions();

  // Border radius: full (999) for mini, 24px for bar and palette (consistent)
  const getBorderRadius = () => {
    if (isVisuallyMini) return borderRadius.full;
    return 24;  // Consistent 24px for bar and palette
  };

  // Frame styles
  const frameStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: isVisuallyPalette ? 'column' : 'row',
    alignItems: isVisuallyBar ? 'center' : isVisuallyMini ? 'center' : 'stretch',
    justifyContent: isVisuallyMini ? 'center' : 'flex-start',
    gap: isVisuallyBar ? CONTAINER_GAP : 0,
    // Allow badge to extend outside in mini state, clip content in other states
    overflow: isVisuallyMini ? 'visible' : 'hidden',
    ...glass.glassDark,
    boxShadow: isVisuallyMini ? shadows.lg : undefined,
    cursor: isVisuallyMini || phase === 'idle-bar'
      ? 'pointer'
      : 'default',
    ...style,
  };

  // Click handler
  const handleClick = () => {
    if (isVisuallyMini) {
      handleMiniClick();
    } else if (phase === 'idle-bar') {
      handleBarClick();
    }
  };

  return (
    <motion.div
      ref={contentRef}
      layout={false}
      initial={false}
      style={frameStyle}
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        maxHeight: isVisuallyPalette ? PALETTE_MAX_HEIGHT : isVisuallyMini ? MICRO_SIZE : BAR_HEIGHT,
        borderRadius: getBorderRadius(),
      }}
      transition={{
        height: stageTransition,
        maxHeight: stageTransition,
        borderRadius: stageTransition,
        width: { duration: 0 },
      }}
      onAnimationComplete={handleAnimationComplete}
      onClick={handleClick}
      whileHover={isVisuallyMini ? { scale: 1.05 } : undefined}
      whileTap={isVisuallyMini ? { scale: 0.95 } : undefined}
      data-testid={testID}
    >
      {/* Mini Content - shown when visually mini */}
      {isVisuallyMini && (
        <MiniContent
          session={session}
          isRecording={isRecording}
          isPaused={isPaused}
          isVisible={isVisuallyMini}
        />
      )}

      {/* Bar/Palette Content - hidden when visually mini */}
      {!isVisuallyMini && (
        <>
          {/* Palette: Drag handle at top */}
          {isVisuallyPalette && (
            <DragHandle
              onCollapse={handleCollapse}
              variant="dark"
            />
          )}

          {/* Avatar Container - Identity */}
          <AvatarContainer
            tier={isVisuallyPalette ? 'palette' : 'bar'}
            session={session}
            animationPhase={phase}
            isFullWidth={isFullWidth}
            onExpandToDrawer={handleExpandToDrawer}
            testID={`${testID}-avatar`}
          />

          {/* Content Container - Display */}
          <ContentContainer
            tier={isVisuallyPalette ? 'palette' : 'bar'}
            session={session}
            animationPhase={phase}
            onExpandToDrawer={handleExpandToDrawer}
            testID={`${testID}-content`}
          />

          {/* Controls Container - Actions (stays at bottom in palette) */}
          <ControlsContainer
            tier={isVisuallyPalette ? 'palette' : 'bar'}
            session={session}
            animationPhase={phase}
            isFullWidth={isFullWidth}
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            onDiscard={onDiscard}
            isEnabled={isEnabled}
            testID={`${testID}-controls`}
          />
        </>
      )}
    </motion.div>
  );
};

TranscriptionModule.displayName = 'TranscriptionModule';

export default TranscriptionModule;
