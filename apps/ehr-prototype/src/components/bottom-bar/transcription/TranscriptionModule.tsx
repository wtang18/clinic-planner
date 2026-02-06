/**
 * TranscriptionModule Component
 *
 * 3-Container Architecture:
 * - AvatarContainer: Identity (avatar + patient name)
 * - ContentContainer: Display (waveform, transcript, status)
 * - ControlsContainer: Actions (timer + buttons)
 *
 * 2-Stage Animation Pattern (mirrors AIM - X-first, then Y):
 * - EXPAND (bar → palette): width first (160→432), then height (48→auto)
 * - EXPAND (mini → palette): width first (48→432), then height (48→auto)
 * - COLLAPSE (palette → bar): height first (auto→48), then width (432→160)
 * - COLLAPSE (palette → mini): height first (auto→48), then width (432→48)
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
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID prefix */
  testID?: string;
}

// ============================================================================
// Types
// ============================================================================

/**
 * 2-Stage Animation Phases
 * Supports bar ↔ palette and mini ↔ palette transitions
 *
 * EXPAND (bar → palette): width 160→432, then height 48→auto
 * EXPAND (mini → palette): width 48→432, then height 48→auto
 * COLLAPSE (palette → bar): height auto→48, then width 432→160
 * COLLAPSE (palette → mini): height auto→48, then width 432→48
 */
type AnimationPhase =
  | 'idle-mini'             // Resting at mini size (48×48)
  | 'idle-bar'              // Resting at bar size (160×48)
  | 'expanding-width'       // Stage 1: width 160→432 (bar→palette)
  | 'expanding-height'      // Stage 2: height 48→auto
  | 'idle-palette'          // Resting at palette size (432×auto)
  | 'collapsing-height'     // Stage 1: height auto→48
  | 'collapsing-width'      // Stage 2: width 432→160 (palette→bar)
  | 'mini-expanding-width'  // Stage 1: width 48→432 (mini→palette)
  | 'mini-collapsing-width'; // Stage 2: width 432→48 (palette→mini)

// ============================================================================
// Constants
// ============================================================================

const MICRO_SIZE = 48;
const BAR_WIDTH = 160;
const BAR_HEIGHT = 48;
const PALETTE_WIDTH = 432;  // Matches AIM palette width for consistent 488px total
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
  /** Whether expanding from mini to bar/palette */
  isExpanding?: boolean;
  /** Whether collapsing from bar/palette to mini */
  isCollapsing?: boolean;
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
  isExpanding = false,
  isCollapsing = false,
}) => {
  const badgeStatus = toMicroBadgeStatus(isRecording, isPaused);

  // Crossfade timing:
  // - Expanding: fade out quickly (100ms) at start
  // - Collapsing: fade in with delay (starts at 100ms, completes at 200ms)
  // - Normal: standard visibility toggle
  const getOpacity = () => {
    if (isExpanding) return 0;  // Fade out when expanding
    if (isCollapsing) return 1; // Fade in when collapsing
    return isVisible ? 1 : 0;
  };

  const getTransition = () => {
    if (isExpanding) {
      return { duration: 0.1, ease: 'easeOut' as const };
    }
    if (isCollapsing) {
      return { duration: 0.1, delay: 0.1, ease: 'easeIn' as const };
    }
    return { duration: 0.1 };
  };

  // During collapse, pin avatar to left edge (matching bar/palette position)
  // Only center when at idle-mini state
  const shouldCenter = !isCollapsing;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: getOpacity() }}
      transition={getTransition()}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: shouldCenter ? 'center' : 'flex-start',
        paddingLeft: shouldCenter ? 0 : 8, // Match bar mode's left padding
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
  style,
  testID = 'transcription-module',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(200);

  // Initialize phase based on tier
  const getInitialPhase = (): AnimationPhase => {
    if (tier === 'mini') return 'idle-mini';
    if (tier === 'palette') return 'idle-palette';
    return 'idle-bar';
  };
  const [phase, setPhase] = useState<AnimationPhase>(getInitialPhase);

  // Track where we're collapsing TO (bar or mini) - set when collapse starts
  const collapseTargetRef = useRef<'bar' | 'mini'>('bar');

  const isMicro = tier === 'mini';
  const isBar = tier === 'bar';
  const isPalette = tier === 'palette';
  const isDrawer = tier === 'drawer';

  const isRecording = session?.status === 'recording';
  const isPaused = session?.status === 'paused';
  const hasActiveRecording = isRecording || isPaused;

  // Sync phase with external tier changes
  const prevTierRef = useRef(tier);
  useEffect(() => {
    const prevTier = prevTierRef.current;
    prevTierRef.current = tier;

    if (tier === 'drawer') return; // Drawer handled separately

    // Skip if phase is already animating
    const isAnimating = phase.includes('expanding') || phase.includes('collapsing');
    if (isAnimating) return;

    // Handle external tier changes (snap to correct phase)
    if (tier === 'mini' && phase !== 'idle-mini') {
      // External change to mini - if from palette, start animation; otherwise snap
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'mini';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-mini');
      }
    } else if (tier === 'palette' && phase !== 'idle-palette') {
      // External change to palette - if from mini, start animation; otherwise snap
      if (prevTier === 'mini' && phase === 'idle-mini') {
        setPhase('mini-expanding-width');
      } else {
        setPhase('idle-palette');
      }
    } else if (tier === 'bar' && phase !== 'idle-bar') {
      setPhase('idle-bar');
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
      onTierChange('palette'); // Grid allocates space immediately
      setPhase('mini-expanding-width'); // Start visual animation
    }
  }, [phase, onTierChange]);

  // Handle bar click - expand to palette when active
  const handleBarClick = useCallback(() => {
    if (phase === 'idle-bar' && hasActiveRecording) {
      onTierChange('palette'); // Grid allocates space immediately
      setPhase('expanding-width'); // Start visual animation
    }
  }, [phase, hasActiveRecording, onTierChange]);

  // Handle collapse from palette
  const handleCollapse = useCallback(() => {
    if (phase === 'idle-palette') {
      // Determine collapse target based on whether there's active recording
      // If recording, collapse to bar; if not, collapse to mini (or bar based on context)
      collapseTargetRef.current = 'bar'; // Default to bar
      setPhase('collapsing-height');
    }
  }, [phase]);

  // Handle animation complete - progress through stages
  const handleAnimationComplete = useCallback(() => {
    switch (phase) {
      // Bar → Palette expansion
      case 'expanding-width':
        setPhase('expanding-height');
        break;

      // Mini → Palette expansion
      case 'mini-expanding-width':
        setPhase('expanding-height');
        break;

      case 'expanding-height':
        setPhase('idle-palette');
        break;

      // Palette → Bar/Mini collapse (height first)
      case 'collapsing-height':
        if (collapseTargetRef.current === 'mini') {
          setPhase('mini-collapsing-width');
          onTierChange('mini');
        } else {
          setPhase('collapsing-width');
          onTierChange('bar');
        }
        break;

      // Width collapse completion
      case 'collapsing-width':
        setPhase('idle-bar');
        break;

      case 'mini-collapsing-width':
        setPhase('idle-mini');
        break;
    }
  }, [phase, onTierChange]);

  // Calculate dimensions based on animation phase
  const getDimensions = useCallback(() => {
    switch (phase) {
      case 'idle-mini':
      case 'mini-collapsing-width':
        return { width: MICRO_SIZE, height: MICRO_SIZE };
      case 'idle-bar':
      case 'collapsing-width':
        return { width: BAR_WIDTH, height: BAR_HEIGHT };
      case 'expanding-width':
      case 'collapsing-height':
        return { width: PALETTE_WIDTH, height: BAR_HEIGHT };
      case 'mini-expanding-width':
        return { width: PALETTE_WIDTH, height: MICRO_SIZE };
      case 'expanding-height':
        return { width: PALETTE_WIDTH, height: contentHeight };
      case 'idle-palette':
        return { width: PALETTE_WIDTH, height: 'auto' as const };
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
  const isVisuallyMini = phase === 'idle-mini' || phase === 'mini-collapsing-width';
  const isVisuallyBar = phase === 'idle-bar' || phase === 'collapsing-width' || phase === 'expanding-width';
  const isVisuallyPalette = phase === 'idle-palette' || phase === 'expanding-height' || phase === 'collapsing-height';
  const isTransitioningFromMini = phase === 'mini-expanding-width';

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
    alignItems: (isVisuallyBar || isTransitioningFromMini) ? 'center' : isVisuallyMini ? 'center' : 'stretch',
    justifyContent: isVisuallyMini ? 'center' : 'flex-start',
    gap: (isVisuallyBar || isTransitioningFromMini) ? CONTAINER_GAP : 0,
    // Allow badge to extend outside in mini state, clip content in other states
    overflow: isVisuallyMini ? 'visible' : 'hidden',
    ...glass.glassDark,
    boxShadow: isVisuallyMini ? shadows.lg : undefined,
    cursor: isVisuallyMini
      ? 'pointer'
      : (phase === 'idle-bar' && hasActiveRecording)
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
      initial={false}
      style={frameStyle}
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        maxHeight: isVisuallyPalette ? PALETTE_MAX_HEIGHT : isVisuallyMini ? MICRO_SIZE : BAR_HEIGHT,
        borderRadius: getBorderRadius(),
      }}
      transition={stageTransition}
      onAnimationComplete={handleAnimationComplete}
      onClick={handleClick}
      whileHover={isVisuallyMini ? { scale: 1.05 } : undefined}
      whileTap={isVisuallyMini ? { scale: 0.95 } : undefined}
      data-testid={testID}
    >
      {/* Mini Content - shown when visually mini or during mini transitions */}
      {(isVisuallyMini || isTransitioningFromMini) && (
        <MiniContent
          session={session}
          isRecording={isRecording}
          isPaused={isPaused}
          isVisible={isVisuallyMini}
          isExpanding={isTransitioningFromMini}
          isCollapsing={phase === 'mini-collapsing-width'}
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
